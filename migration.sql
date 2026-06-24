-- =========================================================================
-- SQL MIGRATION: MENDUKUNG MULTI-PETA & ISOLASI REVISI DATA
-- Jalankan skrip ini di SQL Editor Supabase Anda untuk memperbarui skema database.
-- =========================================================================

-- 1. Hapus secara dinamis semua foreign key yang mengarah ke tabel geometries
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT 
            tc.table_schema,
            tc.table_name, 
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE 
            tc.constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name = 'geometries'
            AND tc.table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_schema) || '.' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 2. Hapus Primary Key lama pada tabel geometries
ALTER TABLE geometries DROP CONSTRAINT IF EXISTS geometries_pkey;

-- 3. Pastikan kolom nama_kabupaten di geometries tidak NULL
UPDATE geometries SET nama_kabupaten = 'DAERAH' WHERE nama_kabupaten IS NULL;
ALTER TABLE geometries ALTER COLUMN nama_kabupaten SET NOT NULL;

-- 4. Pasang Primary Key baru (komposit nama_kabupaten dan kode_bps)
ALTER TABLE geometries ADD PRIMARY KEY (nama_kabupaten, kode_bps);

-- 5. Perbarui tabel raw_indicators
ALTER TABLE raw_indicators ADD COLUMN IF NOT EXISTS nama_kabupaten TEXT;

-- Sinkronisasi nama_kabupaten yang ada ke raw_indicators
UPDATE raw_indicators r
SET nama_kabupaten = g.nama_kabupaten
FROM geometries g
WHERE r.kode_bps = g.kode_bps AND r.nama_kabupaten IS NULL;

UPDATE raw_indicators SET nama_kabupaten = 'DAERAH' WHERE nama_kabupaten IS NULL;
ALTER TABLE raw_indicators ALTER COLUMN nama_kabupaten SET NOT NULL;

-- Hapus unique constraint lama
ALTER TABLE raw_indicators DROP CONSTRAINT IF EXISTS raw_indicators_kode_bps_tahun_key;

-- Tambah unique constraint baru (komposit)
ALTER TABLE raw_indicators DROP CONSTRAINT IF EXISTS raw_indicators_kab_bps_tahun_key;
ALTER TABLE raw_indicators ADD CONSTRAINT raw_indicators_kab_bps_tahun_key UNIQUE (nama_kabupaten, kode_bps, tahun);

-- Pasang kembali Foreign Key yang mengarah ke geometries (komposit)
ALTER TABLE raw_indicators DROP CONSTRAINT IF EXISTS raw_indicators_geom_fkey;
ALTER TABLE raw_indicators ADD CONSTRAINT raw_indicators_geom_fkey 
FOREIGN KEY (nama_kabupaten, kode_bps) REFERENCES geometries(nama_kabupaten, kode_bps) 
ON UPDATE CASCADE ON DELETE CASCADE;


-- 6. Perbarui tabel fsva_results
ALTER TABLE fsva_results ADD COLUMN IF NOT EXISTS nama_kabupaten TEXT;

-- Sinkronisasi nama_kabupaten yang ada ke fsva_results
UPDATE fsva_results r
SET nama_kabupaten = g.nama_kabupaten
FROM geometries g
WHERE r.kode_bps = g.kode_bps AND r.nama_kabupaten IS NULL;

UPDATE fsva_results SET nama_kabupaten = 'DAERAH' WHERE nama_kabupaten IS NULL;
ALTER TABLE fsva_results ALTER COLUMN nama_kabupaten SET NOT NULL;

-- Hapus unique constraint lama
ALTER TABLE fsva_results DROP CONSTRAINT IF EXISTS fsva_results_kode_bps_tahun_key;

-- Tambah unique constraint baru (komposit)
ALTER TABLE fsva_results DROP CONSTRAINT IF EXISTS fsva_results_kab_bps_tahun_key;
ALTER TABLE fsva_results ADD CONSTRAINT fsva_results_kab_bps_tahun_key UNIQUE (nama_kabupaten, kode_bps, tahun);

-- Pasang kembali Foreign Key yang mengarah ke geometries (komposit)
ALTER TABLE fsva_results DROP CONSTRAINT IF EXISTS fsva_results_geom_fkey;
ALTER TABLE fsva_results ADD CONSTRAINT fsva_results_geom_fkey 
FOREIGN KEY (nama_kabupaten, kode_bps) REFERENCES geometries(nama_kabupaten, kode_bps) 
ON UPDATE CASCADE ON DELETE CASCADE;


-- 7. Perbarui View fsva_map_view
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
  r.p_ncpr, r.p_energy, r.p_protein, r.p_cadangan, 
  r.p_poverty, r.p_cv_harga, r.p_pou, 
  r.p_sekolah, r.p_air, r.p_pph, r.p_stunting,
  ST_AsGeoJSON(g.geom)::json AS geometry
FROM geometries g
LEFT JOIN fsva_results r ON g.kode_bps = r.kode_bps AND g.nama_kabupaten = r.nama_kabupaten;


-- 8. Perbarui fungsi upsert_geometry
CREATE OR REPLACE FUNCTION upsert_geometry(p_kode_bps TEXT, p_nama_desa TEXT, p_wkt TEXT, p_user_id UUID, p_nama_kabupaten TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO geometries (kode_bps, nama_desa, geom, user_id, nama_kabupaten)
  VALUES (p_kode_bps, p_nama_desa, ST_Multi(ST_GeomFromText(p_wkt, 4326)), p_user_id, p_nama_kabupaten)
  ON CONFLICT (nama_kabupaten, kode_bps) DO UPDATE
  SET nama_desa = EXCLUDED.nama_desa, 
      geom = EXCLUDED.geom, 
      user_id = EXCLUDED.user_id;
END;
$$;
