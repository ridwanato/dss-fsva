import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import AdmZip from 'adm-zip';
import { DOMParser } from '@xmldom/xmldom';

// Helper to strip Z/M dimensions from GeoJSON coordinates recursively
function convertTo2D(coordinates: any): any {
  if (!Array.isArray(coordinates)) return coordinates;
  
  // Check if it is a single coordinate pair/triplet (array of numbers)
  if (coordinates.length >= 2 && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    return [coordinates[0], coordinates[1]]; // Keep only X and Y (longitude and latitude)
  }
  
  // Recursively process nested arrays
  return coordinates.map(convertTo2D);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const kabupaten = formData.get('kabupaten') as string;
    const level = (formData.get('level') as string) || 'kab_kota';
    
    if (!file || !kabupaten) {
      return NextResponse.json({ success: false, error: 'No file uploaded or missing map name' }, { status: 400 });
    }

    const { createClient } = await import('@/lib/supabase-server');
    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }
    const userId = session.user.id;

    const buffer = Buffer.from(await file.arrayBuffer());
    let kmlString = '';

    if (file.name.toLowerCase().endsWith('.kmz')) {
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();
      const kmlEntry = zipEntries.find(entry => entry.entryName.toLowerCase().endsWith('.kml'));
      
      if (!kmlEntry) {
        return NextResponse.json({ success: false, error: 'No KML file found inside KMZ' }, { status: 400 });
      }
      kmlString = zip.readAsText(kmlEntry);
    } else if (file.name.toLowerCase().endsWith('.kml')) {
      kmlString = buffer.toString('utf-8');
    } else if (file.name.toLowerCase().endsWith('.zip')) {
      // Shapefile processing using shpjs
      const shpModule = await import('shpjs');
      const shp = shpModule.default;
      const wkxModule = require('wellknown');
      const wkx = wkxModule.default || wkxModule;
      
      let geojson: any;
      try {
        geojson = await shp(buffer);
      } catch (e: any) {
        return NextResponse.json({ success: false, error: 'Gagal membaca Shapefile di dalam ZIP: ' + e.message }, { status: 400 });
      }
      
      const collections = Array.isArray(geojson) ? geojson : [geojson];
      const featuresToInsert = [];
      
      let skippedKecFeatures = 0;
      let skippedDesaFeatures = 0;
      
      for (const coll of collections) {
        if (!coll || !coll.features) continue;
        
        const fileNameLower = (coll.fileName || '').toLowerCase();
        
        // Check if layer name indicates level
        let isKecLayer = fileNameLower.includes('kec') || fileNameLower.includes('kecamatan') || fileNameLower.includes('dist');
        let isDesaLayer = fileNameLower.includes('desa') || fileNameLower.includes('kelurahan') || fileNameLower.includes('kel_') || fileNameLower.includes('des_');
        
        // Fallback checks properties of first feature if layer name is empty
        if (!coll.fileName && coll.features.length > 0) {
          const keys = Object.keys(coll.features[0].properties || {}).map(k => k.toLowerCase());
          const hasDesaKey = keys.some(k => k.includes('desa') || k.includes('kelurahan') || k.includes('des'));
          const hasKecKey = keys.some(k => k.includes('kec') || k.includes('subdist'));
          
          if (hasKecKey && !hasDesaKey) isKecLayer = true;
          if (hasDesaKey && !hasKecKey) isDesaLayer = true;
        }

        // Apply level specific skipping
        if (level === 'kab_kota') {
          // If mapping villages, skip kecamatan layers
          if (isKecLayer && !isDesaLayer) {
            skippedKecFeatures += coll.features.length;
            continue;
          }
        } else if (level === 'provinsi') {
          // If mapping kecamatans, skip desa layers
          if (isDesaLayer && !isKecLayer) {
            skippedDesaFeatures += coll.features.length;
            continue;
          }
        }

        for (const feature of coll.features) {
          if (!feature.geometry || !feature.properties) continue;
          
          let name = '';
          let kode_bps = '';
          let kecamatan = '';
          
          const bpsKeys = Object.keys(feature.properties);
          
          // 1. Cari kode BPS
          let foundBpsKey = bpsKeys.find(k => {
            const nk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            return nk === 'kodebps' || nk === 'kodbps' || nk === 'kdebps' || nk === 'bpscode';
          });
          if (!foundBpsKey) {
            foundBpsKey = bpsKeys.find(k => {
              const nk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              return nk === 'iddesa' || nk === 'kodedesa' || nk === 'kodedes' || nk === 'kdppum';
            });
          }
          if (!foundBpsKey) {
            foundBpsKey = bpsKeys.find(k => {
              const nk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              return nk.includes('kodebps') || nk.includes('iddesa') || nk.includes('kodedesa') || nk.includes('kdppum') || nk === 'id';
            });
          }
          if (foundBpsKey) {
            kode_bps = String(feature.properties[foundBpsKey]).trim();
          }

          // 2. Cari nama desa
          let foundNameKey = bpsKeys.find(k => {
            const nk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            return nk === 'namobj' || nk === 'namadesa' || nk === 'namadesakelurahan' || nk === 'nmdesa';
          });
          if (!foundNameKey) {
            foundNameKey = bpsKeys.find(k => {
              const nk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              return nk === 'desa' || nk === 'kelurahan';
            });
          }
          if (!foundNameKey) {
            foundNameKey = bpsKeys.find(k => {
              const nk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              return nk === 'nama' || nk === 'name';
            });
          }
          if (!foundNameKey) {
            foundNameKey = bpsKeys.find(k => {
              const nk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              const isNameLike = nk.includes('desa') || nk.includes('kelurahan') || nk.includes('nama') || nk.includes('name');
              const isCodeLike = nk.includes('code') || nk.includes('kode') || nk.includes('id') || nk.includes('no') || nk.includes('num');
              return isNameLike && !isCodeLike;
            });
          }
          if (foundNameKey) {
            name = String(feature.properties[foundNameKey]).trim();
          }

          // 3. Cari nama kecamatan (Subdistrict)
          let foundKecKey = bpsKeys.find(k => {
            const nk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            return nk === 'wadmkc' || nk === 'kecamatan' || nk === 'namakecamatan' || nk === 'nmkec' || nk === 'namakec';
          });
          if (foundKecKey) {
            kecamatan = String(feature.properties[foundKecKey]).trim();
          }
          
          // Fallback jika tidak ada kode BPS tapi ada nama desa
          if (!kode_bps && name) {
            kode_bps = name.toLowerCase().replace(/[^a-z0-9]/g, '');
          }
          
          if (!kode_bps) continue;
          
          // CRITICAL FIX: Force geometry coordinates to be 2D (remove Z dimension if exists)
          if (feature.geometry && feature.geometry.coordinates) {
            feature.geometry.coordinates = convertTo2D(feature.geometry.coordinates);
          }
          
          // Konversi GeoJSON geometry ke WKT menggunakan wellknown (sekarang dijamin 2D WKT)
          const wkt = wkx.stringify(feature.geometry);
          
          if (wkt) {
            featuresToInsert.push({
              kode_bps,
              nama_desa: name,
              nama_kecamatan: kecamatan,
              wkt
            });
          }
        }
      }
      
      // Upsert into Supabase (Zip shapefile logic)
      let inserted = 0;
      const errors: string[] = [];
      
      for (const feature of featuresToInsert) {
        const { error } = await authClient.rpc('upsert_geometry', {
          p_kode_bps: feature.kode_bps,
          p_nama_desa: feature.nama_desa,
          p_wkt: feature.wkt,
          p_user_id: userId,
          p_nama_kabupaten: kabupaten,
          p_level: level
        });
        
        if (!error) {
          inserted++;
          // Update nama_kecamatan in geometries table if it was extracted
          if (feature.nama_kecamatan) {
            await authClient
              .from('geometries')
              .update({ nama_kecamatan: feature.nama_kecamatan })
              .eq('kode_bps', feature.kode_bps)
              .eq('nama_kabupaten', kabupaten)
              .eq('level', level);
          }
        } else {
          console.error('Insert geom error:', error);
          errors.push(`${feature.nama_desa}: ${error.message}`);
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        features: inserted, 
        desaCount: level === 'kab_kota' ? inserted : 0,
        kecCount: level === 'provinsi' ? inserted : 0,
        skippedDesaCount: skippedDesaFeatures,
        skippedKecCount: skippedKecFeatures,
        errors 
      });
    } else {
      // Flow KML/KMZ
      const parser = new DOMParser();
      const doc = parser.parseFromString(kmlString, 'text/xml');
      const placemarks = doc.getElementsByTagName('Placemark');
      
      const featuresToInsert = [];

      for (let i = 0; i < placemarks.length; i++) {
        const placemark = placemarks[i];
        let name = '';
        let kode_bps = '';
        let kecamatan = '';
        
        // Extract name
        const nameNode = placemark.getElementsByTagName('name')[0];
        if (nameNode && nameNode.textContent) name = nameNode.textContent.trim();
        
        // Extract ExtendedData/SimpleData
        const extendedData = placemark.getElementsByTagName('ExtendedData')[0];
        if (extendedData) {
          // Format 1: <Data name="KODE_BPS"><value>123</value></Data>
          const dataNodes = extendedData.getElementsByTagName('Data');
          for (let j = 0; j < dataNodes.length; j++) {
            const nameAttr = dataNodes[j].getAttribute('name');
            if (nameAttr) {
              const nameAttrLower = nameAttr.toLowerCase().replace(/_/g, '');
              if (nameAttrLower.includes('kodebps') || nameAttrLower === 'iddesa' || nameAttrLower === 'kodedesa') {
                const valueNode = dataNodes[j].getElementsByTagName('value')[0];
                if (valueNode && valueNode.textContent) kode_bps = valueNode.textContent.trim();
              }
              if (nameAttrLower.includes('namobj') && !name) {
                const valueNode = dataNodes[j].getElementsByTagName('value')[0];
                if (valueNode && valueNode.textContent) name = valueNode.textContent.trim();
              }
              // Extract kecamatan
              if (nameAttrLower === 'wadmkc' || nameAttrLower === 'kecamatan' || nameAttrLower === 'namakec' || nameAttrLower === 'nmkec') {
                const valueNode = dataNodes[j].getElementsByTagName('value')[0];
                if (valueNode && valueNode.textContent) kecamatan = valueNode.textContent.trim();
              }
            }
          }
          
          // Format 2: <SimpleData name="KODE_BPS">123</SimpleData>
          const simpleDataNodes = extendedData.getElementsByTagName('SimpleData');
          for (let j = 0; j < simpleDataNodes.length; j++) {
            const nameAttr = simpleDataNodes[j].getAttribute('name');
            if (nameAttr) {
              const nameAttrLower = nameAttr.toLowerCase().replace(/_/g, '');
              if (nameAttrLower.includes('kodebps') || nameAttrLower === 'iddesa' || nameAttrLower === 'kodedesa') {
                const textContent = simpleDataNodes[j].textContent;
                if (textContent) kode_bps = textContent.trim();
              }
              if (nameAttrLower.includes('namobj') && !name) {
                const textContent = simpleDataNodes[j].textContent;
                if (textContent) name = textContent.trim();
              }
              // Extract kecamatan
              if (nameAttrLower === 'wadmkc' || nameAttrLower === 'kecamatan' || nameAttrLower === 'namakec' || nameAttrLower === 'nmkec') {
                const textContent = simpleDataNodes[j].textContent;
                if (textContent) kecamatan = textContent.trim();
              }
            }
          }
        }
        
        // Fallback jika tidak ada kode BPS tapi ada nama desa
        if (!kode_bps && name) {
          kode_bps = name.toLowerCase().replace(/[^a-z0-9]/g, ''); 
        }
        
        if (!kode_bps) continue;

        // Extract Coordinates (simplistic approach for Polygon)
        const polygonNodes = placemark.getElementsByTagName('Polygon');
        let wkt = '';
        
        if (polygonNodes.length > 0) {
          const polys: string[] = [];
          for (let k = 0; k < polygonNodes.length; k++) {
            const coordsNode = polygonNodes[k].getElementsByTagName('coordinates')[0];
            if (coordsNode && coordsNode.textContent) {
              // KML Coordinates are X,Y,Z separated by spaces
              const coords = coordsNode.textContent.trim().split(/\s+/).filter(Boolean).map(pair => {
                const parts = pair.split(',');
                return `${parts[0]} ${parts[1]}`; // Forces 2D coordinate text
              }).join(', ');
              if (coords) {
                polys.push(`((${coords}))`);
              }
            }
          }
          if (polys.length > 0) {
            wkt = `MULTIPOLYGON(${polys.join(', ')})`;
          }
        }
        
        if (wkt && kode_bps) {
          featuresToInsert.push({
            kode_bps,
            nama_desa: name,
            nama_kecamatan: kecamatan,
            wkt
          });
        }
      }

      // Upsert into Supabase
      let inserted = 0;
      const errors: string[] = [];
      
      for (const feature of featuresToInsert) {
        const { error } = await authClient.rpc('upsert_geometry', {
          p_kode_bps: feature.kode_bps,
          p_nama_desa: feature.nama_desa,
          p_wkt: feature.wkt,
          p_user_id: userId,
          p_nama_kabupaten: kabupaten,
          p_level: level
        });
        
        if (!error) {
          inserted++;
          // Update nama_kecamatan in geometries table if it was extracted
          if (feature.nama_kecamatan) {
            await authClient
              .from('geometries')
              .update({ nama_kecamatan: feature.nama_kecamatan })
              .eq('kode_bps', feature.kode_bps)
              .eq('nama_kabupaten', kabupaten)
              .eq('level', level);
          }
        } else {
          console.error('Insert geom error:', error);
          errors.push(`${feature.nama_desa}: ${error.message}`);
        }
      }

      return NextResponse.json({ 
        success: true, 
        features: inserted, 
        desaCount: level === 'kab_kota' ? inserted : 0,
        kecCount: level === 'provinsi' ? inserted : 0,
        skippedDesaCount: 0,
        skippedKecCount: 0,
        errors 
      });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
