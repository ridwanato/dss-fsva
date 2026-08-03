import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import AdmZip from 'adm-zip';
import { DOMParser } from '@xmldom/xmldom';

if (typeof (globalThis as any).self === 'undefined') {
  (globalThis as any).self = globalThis;
}


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

// Helper to detect administrative area type ('Desa' | 'Kelurahan' | 'Kecamatan')
function detectTipeWilayah(kodeKemendagri: string, kodeBps: string, name: string, level: string, tipadm?: any): 'Desa' | 'Kelurahan' | 'Kecamatan' {
  if (level === 'provinsi') return 'Kecamatan';
  if (name.toLowerCase().startsWith('kel.') || name.toLowerCase().startsWith('kelurahan')) return 'Kelurahan';
  if (name.toLowerCase().startsWith('desa')) return 'Desa';

  if (tipadm === 2 || String(tipadm) === '2') return 'Kelurahan';
  if (tipadm === 1 || String(tipadm) === '1') return 'Desa';

  const code = kodeKemendagri || kodeBps || '';
  const clean = code.replace(/\./g, '').trim();
  const parts = code.split('.');

  if (parts.length >= 4) {
    if (parts[3].startsWith('1')) return 'Kelurahan';
    if (parts[3].startsWith('2')) return 'Desa';
  } else if (clean.length === 10) {
    const villageDigit = clean.substring(6, 7);
    if (villageDigit === '1') return 'Kelurahan';
    if (villageDigit === '2') return 'Desa';
  }

  return 'Desa';
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
          let kode_kemendagri = '';
          let kode_kecamatan = '';
          
          const bpsKeys = Object.keys(feature.properties);
          
          // Helper to get first non-empty property value matching predicate
          const getValue = (predicate: (nk: string, rawKey: string) => boolean) => {
            for (const key of bpsKeys) {
              const rawVal = feature.properties[key];
              if (rawVal === undefined || rawVal === null) continue;
              const strVal = String(rawVal).trim();
              if (!strVal) continue; // Skip empty strings
              const nk = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (predicate(nk, key)) return strVal;
            }
            return '';
          };

          // 1. Cari kode BPS / Kemendagri / Kode Desa (non-empty)
          kode_bps = getValue(nk => nk === 'kodebps' || nk === 'kodbps' || nk === 'bpscode');
          if (!kode_bps) {
            kode_bps = getValue(nk => nk === 'iddesa' || nk === 'kodedesa' || nk === 'kodedes' || nk === 'kdepum' || nk === 'kdppum' || nk === 'dkodedes');
          }
          if (!kode_bps && level === 'provinsi') {
            kode_bps = getValue(nk => nk === 'kdcpum' || nk === 'dkodekec' || nk === 'kodekec' || nk === 'kdkec');
          }
          if (!kode_bps) {
            kode_bps = getValue(nk => nk.includes('kodebps') || nk.includes('iddesa') || nk.includes('kodedesa') || nk.includes('kdepum') || nk === 'id');
          }

          // 2. Cari nama desa / kecamatan (non-empty)
          name = getValue(nk => nk === 'namobj' || nk === 'namadesa' || nk === 'namadesakelurahan' || nk === 'nmdesa' || nk === 'wadmkd' || nk === 'dnamades');
          if (!name) {
            name = getValue(nk => nk === 'wadmkc' || nk === 'namakec' || nk === 'kecamatan' || nk === 'dnamakec');
          }
          if (!name) {
            name = getValue(nk => nk === 'nama' || nk === 'name' || (nk.includes('desa') && !nk.includes('kode')));
          }

          // 3. Cari nama kecamatan
          kecamatan = getValue(nk => nk === 'wadmkc' || nk === 'namakec' || nk === 'kecamatan' || nk === 'dnamakec');

          // 4. Cari kode Kemendagri
          kode_kemendagri = getValue(nk => nk === 'kdpkab' || nk === 'kdcpum' || nk === 'kdekmd' || nk === 'kemendagri' || nk === 'kodekemendagri' || nk === 'kdkemendagri' || nk === 'iddesakmd');

          // 5. Cari kode kecamatan BPS (7 digit)
          kode_kecamatan = getValue(nk => nk === 'kodekec' || nk === 'kdkec' || nk === 'kdpkec' || nk === 'keccode' || nk === 'kodekecamatan' || nk === 'iddist' || nk === 'dkodekec');
          if (!kode_kecamatan && kode_bps && kode_bps.length >= 7) {
            kode_kecamatan = kode_bps.substring(0, 7);
          }
          
          // Fallback jika tidak ada kode BPS tapi ada nama desa
          if (!kode_bps && name) {
            kode_bps = name.toLowerCase().replace(/[^a-z0-9]/g, '');
          }
          
          if (!kode_bps || (level === 'kab_kota' && (!name || kode_bps.length <= 2))) continue;
          
          // CRITICAL FIX: Force geometry coordinates to be 2D (remove Z dimension if exists)
          if (feature.geometry && feature.geometry.coordinates) {
            feature.geometry.coordinates = convertTo2D(feature.geometry.coordinates);
          }
          
          // Konversi GeoJSON geometry ke WKT menggunakan wellknown (sekarang dijamin 2D WKT)
          const wkt = wkx.stringify(feature.geometry);
          
          // 6. Deteksi tipe wilayah ('Desa' | 'Kelurahan' | 'Kecamatan')
          const tipe_wilayah = detectTipeWilayah(kode_kemendagri, kode_bps, name, level, feature.properties.TIPADM);

          if (wkt) {
            featuresToInsert.push({
              kode_bps,
              nama_desa: name,
              nama_kecamatan: kecamatan,
              kode_kemendagri,
              kode_kecamatan,
              tipe_wilayah,
              wkt
            });
          }
        }
      }
      
      // Deduplicate features by kode_bps / nama_desa to prevent duplicate processing if ZIP contains multiple layers
      const uniqueMap = new Map<string, any>();
      for (const feat of featuresToInsert) {
        const key = (feat.kode_bps || feat.nama_desa).toLowerCase().trim();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, feat);
        } else {
          const existing = uniqueMap.get(key);
          if (!existing.nama_kecamatan && feat.nama_kecamatan) existing.nama_kecamatan = feat.nama_kecamatan;
          if (!existing.kode_kemendagri && feat.kode_kemendagri) existing.kode_kemendagri = feat.kode_kemendagri;
          if (!existing.kode_kecamatan && feat.kode_kecamatan) existing.kode_kecamatan = feat.kode_kecamatan;
          if (!existing.tipe_wilayah && feat.tipe_wilayah) existing.tipe_wilayah = feat.tipe_wilayah;
        }
      }
      const uniqueFeatures = Array.from(uniqueMap.values());

      // Concurrent batch upsert (Chunk size 25) for 50x performance boost
      let inserted = 0;
      const errors: string[] = [];
      const BATCH_SIZE = 25;

      for (let i = 0; i < uniqueFeatures.length; i += BATCH_SIZE) {
        const batch = uniqueFeatures.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (feature) => {
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
              const updatePayload: any = {};
              if (feature.nama_kecamatan) updatePayload.nama_kecamatan = feature.nama_kecamatan;
              if (feature.kode_kemendagri) updatePayload.kode_kemendagri = feature.kode_kemendagri;
              if (feature.kode_kecamatan) updatePayload.kode_kecamatan = feature.kode_kecamatan;
              if (feature.tipe_wilayah) updatePayload.tipe_wilayah = feature.tipe_wilayah;

              if (Object.keys(updatePayload).length > 0) {
                await authClient
                  .from('geometries')
                  .update(updatePayload)
                  .eq('kode_bps', feature.kode_bps)
                  .eq('nama_kabupaten', kabupaten)
                  .eq('level', level);
              }
            } else {
              console.error('Insert geom error:', error);
              errors.push(`${feature.nama_desa || feature.kode_bps}: ${error.message}`);
            }
          })
        );
      }
      
      let realDesaCount = 0;
      let realKelurahanCount = 0;
      for (const feat of uniqueFeatures) {
        if (feat.tipe_wilayah === 'Kelurahan') realKelurahanCount++;
        else realDesaCount++;
      }

      return NextResponse.json({ 
        success: true, 
        features: inserted, 
        desaCount: realDesaCount,
        kelurahanCount: realKelurahanCount,
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
        let kode_kecamatan = '';
        
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
              // Extract kode kecamatan BPS
              if (nameAttrLower === 'kodekec' || nameAttrLower === 'kdkec' || nameAttrLower === 'kdpkec' || nameAttrLower === 'keccode' || nameAttrLower === 'kodekecamatan') {
                const valueNode = dataNodes[j].getElementsByTagName('value')[0];
                if (valueNode && valueNode.textContent) kode_kecamatan = valueNode.textContent.trim();
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
              // Extract kode kecamatan BPS
              if (nameAttrLower === 'kodekec' || nameAttrLower === 'kdkec' || nameAttrLower === 'kdpkec' || nameAttrLower === 'keccode' || nameAttrLower === 'kodekecamatan') {
                const textContent = simpleDataNodes[j].textContent;
                if (textContent) kode_kecamatan = textContent.trim();
              }
            }
          }
        }
        
        // Fallback jika tidak ada kode BPS tapi ada nama desa
        if (!kode_bps && name) {
          kode_bps = name.toLowerCase().replace(/[^a-z0-9]/g, ''); 
        }
        
        // Fallback kode_kecamatan dari kode_bps jika tidak ditemukan di KML
        if (!kode_kecamatan && kode_bps && kode_bps.length >= 7) {
          kode_kecamatan = kode_bps.substring(0, 7);
        }
        
        if (!kode_bps || (level === 'kab_kota' && (!name || kode_bps.length <= 2))) continue;

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
            kode_kecamatan,
            wkt
          });
        }
      }

      // Deduplicate features by kode_bps / nama_desa
      const uniqueKmlMap = new Map<string, any>();
      for (const feat of featuresToInsert) {
        const key = (feat.kode_bps || feat.nama_desa).toLowerCase().trim();
        if (!uniqueKmlMap.has(key)) {
          uniqueKmlMap.set(key, feat);
        }
      }
      const uniqueKmlFeatures = Array.from(uniqueKmlMap.values());

      // Concurrent batch upsert (Chunk size 25)
      let inserted = 0;
      const errors: string[] = [];
      const BATCH_SIZE = 25;

      for (let i = 0; i < uniqueKmlFeatures.length; i += BATCH_SIZE) {
        const batch = uniqueKmlFeatures.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (feature) => {
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
              const kmlUpdatePayload: any = {};
              if (feature.nama_kecamatan) kmlUpdatePayload.nama_kecamatan = feature.nama_kecamatan;
              if (feature.kode_kecamatan) kmlUpdatePayload.kode_kecamatan = feature.kode_kecamatan;

              if (Object.keys(kmlUpdatePayload).length > 0) {
                await authClient
                  .from('geometries')
                  .update(kmlUpdatePayload)
                  .eq('kode_bps', feature.kode_bps)
                  .eq('nama_kabupaten', kabupaten)
                  .eq('level', level);
              }
            } else {
              console.error('Insert geom error:', error);
              errors.push(`${feature.nama_desa || feature.kode_bps}: ${error.message}`);
            }
          })
        );
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
