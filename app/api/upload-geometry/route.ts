import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import AdmZip from 'adm-zip';
import { DOMParser } from '@xmldom/xmldom';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const kabupaten = formData.get('kabupaten') as string;
    
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
      const shp = require('shpjs');
      const wkx = require('wellknown');
      
      let geojson: any;
      try {
        geojson = await shp(buffer);
      } catch (e: any) {
        return NextResponse.json({ success: false, error: 'Gagal membaca Shapefile di dalam ZIP: ' + e.message }, { status: 400 });
      }
      
      const collections = Array.isArray(geojson) ? geojson : [geojson];
      const featuresToInsert = [];
      
      for (const coll of collections) {
        if (!coll || !coll.features) continue;
        for (const feature of coll.features) {
          if (!feature.geometry || !feature.properties) continue;
          
          let name = '';
          let kode_bps = '';
          
          // Cari property yang berhubungan dengan KODE_BPS atau KODEBPS
          for (const key of Object.keys(feature.properties)) {
            const lowerKey = key.toLowerCase().replace(/_/g, '');
            if (lowerKey.includes('kodebps')) kode_bps = String(feature.properties[key]).trim();
            if ((lowerKey.includes('namobj') || lowerKey.includes('desa') || lowerKey.includes('name')) && !name) {
              name = String(feature.properties[key]).trim();
            }
          }
          
          if (!kode_bps && name) {
            kode_bps = name.toLowerCase().replace(/[^a-z0-9]/g, '');
          }
          
          if (!kode_bps) continue;
          
          // Konversi GeoJSON geometry ke WKT menggunakan wellknown
          const wkt = wkx.stringify(feature.geometry);
          
          if (wkt) {
            featuresToInsert.push({
              kode_bps,
              nama_desa: name,
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
          p_nama_kabupaten: kabupaten
        });
        
        if (!error) inserted++;
        else {
          console.error('Insert geom error:', error);
          errors.push(`${feature.nama_desa}: ${error.message}`);
        }
      }
      
      return NextResponse.json({ success: true, features: inserted, errors });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid file format. Please upload KML, KMZ, or ZIP (Shapefile)' }, { status: 400 });
    }

    // Parse KML (if the flow reaches here, it's KML/KMZ)
    const parser = new DOMParser();
    const doc = parser.parseFromString(kmlString, 'text/xml');
    const placemarks = doc.getElementsByTagName('Placemark');
    
    const featuresToInsert = [];

    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      let name = '';
      let kode_bps = '';
      
      // Extract name
      const nameNode = placemark.getElementsByTagName('name')[0];
      if (nameNode && nameNode.textContent) name = nameNode.textContent.trim();
      
      // Extract ExtendedData for kode_bps
      const extendedData = placemark.getElementsByTagName('ExtendedData')[0];
      if (extendedData) {
        // Format 1: <Data name="KODE_BPS"><value>123</value></Data>
        const dataNodes = extendedData.getElementsByTagName('Data');
        for (let j = 0; j < dataNodes.length; j++) {
          const nameAttr = dataNodes[j].getAttribute('name');
          if (nameAttr && nameAttr.toLowerCase().replace(/_/g, '').includes('kodebps')) {
            const valueNode = dataNodes[j].getElementsByTagName('value')[0];
            if (valueNode && valueNode.textContent) kode_bps = valueNode.textContent.trim();
          }
          if (nameAttr && nameAttr.toLowerCase().includes('namobj') && !name) {
            const valueNode = dataNodes[j].getElementsByTagName('value')[0];
            if (valueNode && valueNode.textContent) name = valueNode.textContent.trim();
          }
        }
        
        // Format 2: <SimpleData name="KODE_BPS">123</SimpleData>
        const simpleDataNodes = extendedData.getElementsByTagName('SimpleData');
        for (let j = 0; j < simpleDataNodes.length; j++) {
          const nameAttr = simpleDataNodes[j].getAttribute('name');
          if (nameAttr && nameAttr.toLowerCase().replace(/_/g, '').includes('kodebps')) {
            const textContent = simpleDataNodes[j].textContent;
            if (textContent) kode_bps = textContent.trim();
          }
          if (nameAttr && nameAttr.toLowerCase().includes('namobj') && !name) {
            const textContent = simpleDataNodes[j].textContent;
            if (textContent) name = textContent.trim();
          }
        }
      }
      
      // FALLBACK SANGAT PENTING: Jika KML sama sekali tidak punya kode BPS, 
      // gunakan nama desa sebagai kode BPS sementara agar tidak dibuang!
      if (!kode_bps && name) {
        kode_bps = name.toLowerCase().replace(/[^a-z0-9]/g, ''); 
      }
      
      if (!kode_bps) {
        // Fallback or skip if kode_bps not found
        continue;
      }

      // Extract Coordinates (simplistic approach for Polygon)
      // WKT MultiPolygon format: MULTIPOLYGON (((10 10, 10 20, 20 20, 20 10, 10 10)))
      const polygonNodes = placemark.getElementsByTagName('Polygon');
      const multiPolygonNodes = placemark.getElementsByTagName('MultiGeometry'); // Simplification
      
      let wkt = '';
      
      if (polygonNodes.length > 0) {
        const polys: string[] = [];
        for (let k = 0; k < polygonNodes.length; k++) {
          const coordsNode = polygonNodes[k].getElementsByTagName('coordinates')[0];
          if (coordsNode && coordsNode.textContent) {
            const coords = coordsNode.textContent.trim().split(/\s+/).filter(Boolean).map(pair => {
              const parts = pair.split(',');
              return `${parts[0]} ${parts[1]}`;
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
          wkt
        });
      }
    }

    // Upsert into Supabase using PostGIS
    let inserted = 0;
    const errors: string[] = [];
    
    for (const feature of featuresToInsert) {
      const { error } = await authClient.rpc('upsert_geometry', {
        p_kode_bps: feature.kode_bps,
        p_nama_desa: feature.nama_desa,
        p_wkt: feature.wkt,
        p_user_id: userId,
        p_nama_kabupaten: kabupaten
      });
      
      if (!error) inserted++;
      else {
        console.error('Insert geom error:', error);
        errors.push(`${feature.nama_desa}: ${error.message}`);
      }
    }

    return NextResponse.json({ success: true, features: inserted, errors });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
