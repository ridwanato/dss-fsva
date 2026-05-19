-- 1. Tambah kolom user_id di tabel-tabel utama
ALTER TABLE geometries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE raw_indicators ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE fsva_results ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Update view fsva_map_view untuk menyertakan user_id
DROP VIEW IF EXISTS fsva_map_view;
CREATE VIEW fsva_map_view AS
SELECT
  g.kode_bps,
  g.nama_desa,
  g.nama_kecamatan,
  g.nama_kabupaten,
  g.user_id,
  r.tahun,
  r.prioritas,
  r.indeks_komposit,
  r.ncpr, r.pct_ake, r.pct_prohe, r.rasio_cadangan,
  r.cv_harga, r.pou, r.pct_miskin AS pct_miskin_ref,
  r.indeks_ketersediaan, r.indeks_keterjangkauan, r.indeks_pemanfaatan,
  ST_AsGeoJSON(g.geom)::json AS geometry
FROM geometries g
LEFT JOIN fsva_results r ON g.kode_bps = r.kode_bps;

-- 3. Hapus RLS lama (bila ada) dan buat RLS baru untuk Multi-Tenant
ALTER TABLE geometries ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE fsva_results ENABLE ROW LEVEL SECURITY;

-- Semua orang (publik) boleh MEMBACA (SELECT) data dari tabel geometries dan fsva_results
DROP POLICY IF EXISTS "Public read geometries" ON geometries;
CREATE POLICY "Public read geometries" ON geometries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read results" ON fsva_results;
CREATE POLICY "Public read results" ON fsva_results FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read raw_indicators" ON raw_indicators;
CREATE POLICY "Public read raw_indicators" ON raw_indicators FOR SELECT USING (true);

-- Hanya pemilik data (user_id) atau service_role yang boleh INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "User can modify own geometries" ON geometries;
CREATE POLICY "User can modify own geometries" ON geometries 
FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "User can modify own raw_indicators" ON raw_indicators;
CREATE POLICY "User can modify own raw_indicators" ON raw_indicators 
FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "User can modify own fsva_results" ON fsva_results;
CREATE POLICY "User can modify own fsva_results" ON fsva_results 
FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Perbaiki fungsi upsert_geometry agar menerima user_id
DROP FUNCTION IF EXISTS upsert_geometry(TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION upsert_geometry(p_kode_bps TEXT, p_nama_desa TEXT, p_wkt TEXT, p_user_id UUID, p_nama_kabupaten TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO geometries (kode_bps, nama_desa, geom, user_id, nama_kabupaten)
  VALUES (p_kode_bps, p_nama_desa, ST_Multi(ST_GeomFromText(p_wkt, 4326)), p_user_id, p_nama_kabupaten)
  ON CONFLICT (kode_bps) DO UPDATE
  SET nama_desa = EXCLUDED.nama_desa, 
      geom = EXCLUDED.geom, 
      user_id = EXCLUDED.user_id,
      nama_kabupaten = EXCLUDED.nama_kabupaten;
END;
$$;
