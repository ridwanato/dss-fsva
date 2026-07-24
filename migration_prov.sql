-- =========================================================================
-- SQL MIGRATION: MENDUKUNG FSVA PROVINSI (12 INDIKATOR)
-- Jalankan skrip ini di SQL Editor Supabase Anda untuk memperbarui skema database.
-- =========================================================================

-- 1. Hapus Foreign Key lama pada raw_indicators dan fsva_results
ALTER TABLE raw_indicators DROP CONSTRAINT IF EXISTS raw_indicators_geom_fkey;
ALTER TABLE fsva_results DROP CONSTRAINT IF EXISTS fsva_results_geom_fkey;

-- 2. Hapus Primary Key lama pada geometries
ALTER TABLE geometries DROP CONSTRAINT IF EXISTS geometries_pkey;

-- 3. Tambahkan kolom level pada geometries, raw_indicators, dan fsva_results
ALTER TABLE geometries ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'kab_kota';
ALTER TABLE raw_indicators ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'kab_kota';
ALTER TABLE fsva_results ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'kab_kota';

-- 4. Pasang Primary Key komposit baru pada geometries (level, nama_kabupaten, kode_bps)
ALTER TABLE geometries ADD PRIMARY KEY (level, nama_kabupaten, kode_bps);

-- 5. Tambahkan kolom-kolom input baru untuk Prov pada raw_indicators
ALTER TABLE raw_indicators ADD COLUMN IF NOT EXISTS cbpp NUMERIC DEFAULT 0;
ALTER TABLE raw_indicators ADD COLUMN IF NOT EXISTS jumlah_penduduk_prov INT DEFAULT 1;
ALTER TABLE raw_indicators ADD COLUMN IF NOT EXISTS cbpk NUMERIC DEFAULT 0;
ALTER TABLE raw_indicators ADD COLUMN IF NOT EXISTS jumlah_penduduk_kab INT DEFAULT 1;
ALTER TABLE raw_indicators ADD COLUMN IF NOT EXISTS cbp_kec NUMERIC DEFAULT 0;
ALTER TABLE raw_indicators ADD COLUMN IF NOT EXISTS segar NUMERIC DEFAULT 0;
ALTER TABLE raw_indicators ADD COLUMN IF NOT EXISTS siap_saji NUMERIC DEFAULT 0;

-- Hapus unique constraint lama pada raw_indicators
ALTER TABLE raw_indicators DROP CONSTRAINT IF EXISTS raw_indicators_kab_bps_tahun_key;

-- Tambah unique constraint komposit baru pada raw_indicators
ALTER TABLE raw_indicators ADD CONSTRAINT raw_indicators_level_kab_bps_tahun_key UNIQUE (level, nama_kabupaten, kode_bps, tahun);

-- Pasang kembali Foreign Key pada raw_indicators dengan level
ALTER TABLE raw_indicators ADD CONSTRAINT raw_indicators_geom_fkey 
FOREIGN KEY (level, nama_kabupaten, kode_bps) REFERENCES geometries(level, nama_kabupaten, kode_bps) 
ON UPDATE CASCADE ON DELETE CASCADE;


-- 6. Tambahkan kolom-kolom kalkulasi baru untuk Prov pada fsva_results
ALTER TABLE fsva_results ADD COLUMN IF NOT EXISTS food_safety NUMERIC;
ALTER TABLE fsva_results ADD COLUMN IF NOT EXISTS p_food_safety INT CHECK (p_food_safety BETWEEN 1 AND 6);
ALTER TABLE fsva_results ADD COLUMN IF NOT EXISTS x_food_safety NUMERIC;

-- Hapus unique constraint lama pada fsva_results
ALTER TABLE fsva_results DROP CONSTRAINT IF EXISTS fsva_results_kab_bps_tahun_key;

-- Tambah unique constraint komposit baru pada fsva_results
ALTER TABLE fsva_results ADD CONSTRAINT fsva_results_level_kab_bps_tahun_key UNIQUE (level, nama_kabupaten, kode_bps, tahun);

-- Pasang kembali Foreign Key pada fsva_results dengan level
ALTER TABLE fsva_results ADD CONSTRAINT fsva_results_geom_fkey 
FOREIGN KEY (level, nama_kabupaten, kode_bps) REFERENCES geometries(level, nama_kabupaten, kode_bps) 
ON UPDATE CASCADE ON DELETE CASCADE;


-- 7. Perbarui fungsi upsert_geometry untuk mendukung parameter level
DROP FUNCTION IF EXISTS upsert_geometry(TEXT, TEXT, TEXT, UUID, TEXT);
CREATE OR REPLACE FUNCTION upsert_geometry(
  p_kode_bps TEXT, 
  p_nama_desa TEXT, 
  p_wkt TEXT, 
  p_user_id UUID, 
  p_nama_kabupaten TEXT,
  p_level TEXT DEFAULT 'kab_kota'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO geometries (kode_bps, nama_desa, geom, user_id, nama_kabupaten, level)
  VALUES (p_kode_bps, p_nama_desa, ST_Multi(ST_Force2D(ST_GeomFromText(p_wkt, 4326))), p_user_id, p_nama_kabupaten, p_level)
  ON CONFLICT (level, nama_kabupaten, kode_bps) DO UPDATE
  SET nama_desa = EXCLUDED.nama_desa, 
      geom = EXCLUDED.geom, 
      user_id = EXCLUDED.user_id;
END;
$$;


-- 8. Perbarui View fsva_map_view agar mendukung level
DROP VIEW IF EXISTS fsva_map_view;
CREATE OR REPLACE VIEW fsva_map_view AS
SELECT
  g.kode_bps,
  g.nama_desa,
  g.nama_kecamatan,
  g.nama_kabupaten,
  g.user_id,
  g.level,
  r.tahun,
  r.prioritas,
  r.indeks_komposit,
  r.ncpr, r.pct_ake, r.pct_prohe, r.rasio_cadangan,
  r.cv_harga, r.pou, r.pct_miskin AS pct_miskin_ref,
  r.food_safety,
  r.indeks_ketersediaan, r.indeks_keterjangkauan, r.indeks_pemanfaatan,
  r.p_ncpr, r.p_energy, r.p_protein, r.p_cadangan, 
  r.p_poverty, r.p_cv_harga, r.p_pou, 
  r.p_sekolah, r.p_air, r.p_food_safety, r.p_pph, r.p_stunting,
  -- Nilai mentah
  raw.lama_sekolah_perempuan AS lama_sekolah,
  raw.pct_no_water,
  raw.skor_pph,
  raw.pct_stunting,
  ST_AsGeoJSON(g.geom)::json AS geometry
FROM geometries g
LEFT JOIN fsva_results r ON g.kode_bps = r.kode_bps AND g.nama_kabupaten = r.nama_kabupaten AND g.level = r.level
LEFT JOIN raw_indicators raw ON g.kode_bps = raw.kode_bps AND r.tahun = raw.tahun AND g.level = raw.level;
