import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kabupaten = searchParams.get('kabupaten');
    const level = searchParams.get('level') || 'kab_kota';

    if (!kabupaten) {
      return NextResponse.json({ exists: false });
    }

    const { createClient } = await import('@/lib/supabase-server');
    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();

    const supabase = getServiceSupabase();

    // Check if map exists in geometries table
    const { data: geoData, error: geoError } = await supabase
      .from('geometries')
      .select('user_id')
      .eq('nama_kabupaten', kabupaten)
      .eq('level', level)
      .limit(1);

    if (geoError) {
      return NextResponse.json({ success: false, error: geoError.message }, { status: 500 });
    }

    if (!geoData || geoData.length === 0) {
      return NextResponse.json({ exists: false });
    }

    const mapOwnerId = geoData[0].user_id;
    const currentUserId = session?.user?.id || null;
    const isOwner = currentUserId && mapOwnerId === currentUserId;

    return NextResponse.json({
      exists: true,
      isOwner,
      ownerId: mapOwnerId,
      hasOwner: !!mapOwnerId
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
