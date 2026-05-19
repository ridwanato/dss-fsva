import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET() {
  const supabase = getServiceSupabase();
  // Fetch distinct kabupaten names from geometries
  // Supabase doesn't have a distinct function directly accessible easily without RPC for simple queries,
  // but we can fetch and deduplicate in JS since there shouldn't be too many distinct cities.
  const { data, error } = await supabase
    .from('geometries')
    .select('nama_kabupaten')
    .not('nama_kabupaten', 'is', null);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Deduplicate and sort
  const mapNames = Array.from(new Set(data.map(d => d.nama_kabupaten))).filter(Boolean).sort();

  return NextResponse.json({ success: true, maps: mapNames });
}
