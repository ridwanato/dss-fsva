import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import AdmZip from 'adm-zip';
import { DOMParser } from '@xmldom/xmldom';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

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
    } else {
      return NextResponse.json({ success: false, error: 'Invalid file format. Please upload KML or KMZ' }, { status: 400 });
    }

    // Parse KML
    const parser = new DOMParser();
    const doc = parser.parseFromString(kmlString, 'text/xml');
    const placemarks = doc.getElementsByTagName('Placemark');
    
    const featuresToInsert = [];
    const supabase = getServiceSupabase();

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
        }
        
        // Format 2: <SimpleData name="KODE_BPS">123</SimpleData>
        const simpleDataNodes = extendedData.getElementsByTagName('SimpleData');
        for (let j = 0; j < simpleDataNodes.length; j++) {
          const nameAttr = simpleDataNodes[j].getAttribute('name');
          if (nameAttr && nameAttr.toLowerCase().replace(/_/g, '').includes('kodebps')) {
            if (simpleDataNodes[j].textContent) kode_bps = simpleDataNodes[j].textContent.trim();
          }
        }
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
        const coordsNode = polygonNodes[0].getElementsByTagName('coordinates')[0];
        if (coordsNode && coordsNode.textContent) {
          const coords = coordsNode.textContent.trim().split(/\s+/).map(pair => {
            const [lon, lat] = pair.split(',');
            return `${lon} ${lat}`;
          }).join(', ');
          wkt = `MULTIPOLYGON(((${coords})))`;
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
    for (const feature of featuresToInsert) {
      // Assuming a stored procedure or direct SQL insert because ST_GeomFromText needs SQL function,
      // but via Supabase JS we might need an RPC call.
      // Wait, we can't do direct ST_GeomFromText via regular insert unless we have a trigger or RPC.
      // Alternatively, we use raw SQL via RPC. We need to create an RPC in Supabase first.
      
      // However, the instructions say: Upsert ke tabel geometries via Supabase dengan ST_GeomFromText
      // Let's call an RPC for this, or use the postgrest extension. PostgREST doesn't support ST_GeomFromText directly on insert.
      // Let's assume we have an RPC `upsert_geometry(p_kode_bps, p_nama_desa, p_wkt)` or we just insert GeoJSON.
      // Wait, postgREST supports GeoJSON insertion directly into geometry columns!
      // But the prompt specifically said "dengan ST_GeomFromText".
      // I will write an RPC call and later create the RPC, or insert GeoJSON directly. 
      // Actually, if I just insert the WKT as string, postgis might auto-cast it? No, postgis casts WKB. 
      // Supabase supports GeoJSON natively. Let's convert WKT to GeoJSON or just use the RPC.
      
      const { error } = await supabase.rpc('upsert_geometry', {
        p_kode_bps: feature.kode_bps,
        p_nama_desa: feature.nama_desa,
        p_wkt: feature.wkt
      });
      
      if (!error) inserted++;
      else console.error(error);
    }

    return NextResponse.json({ success: true, features: inserted });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
