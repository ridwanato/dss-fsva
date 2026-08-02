-- =============================================================
-- Migration: Tambah kolom kode_kecamatan ke tabel geometries
-- Jalankan di: Supabase SQL Editor
-- https://supabase.com/dashboard → project → SQL Editor
-- =============================================================

-- 1. Tambah kolom kode_kecamatan (TEXT, nullable)
ALTER TABLE geometries
ADD COLUMN IF NOT EXISTS kode_kecamatan TEXT;

-- 2. Backfill data yang sudah ada:
--    Ambil 7 digit pertama kode_bps sebagai kode_kecamatan
--    (konvensi BPS: kode desa = kode_kecamatan + 3 digit terakhir)
UPDATE geometries
SET kode_kecamatan = SUBSTRING(kode_bps, 1, 7)
WHERE kode_kecamatan IS NULL
  AND kode_bps IS NOT NULL
  AND LENGTH(kode_bps) >= 7;

-- 3. Index untuk performa query filter per kecamatan
CREATE INDEX IF NOT EXISTS idx_geometries_kode_kecamatan
ON geometries (kode_kecamatan);

-- 4. Verifikasi hasil
SELECT
  COUNT(*)                                         AS total_rows,
  COUNT(kode_kecamatan)                            AS rows_with_kode_kecamatan,
  COUNT(*) - COUNT(kode_kecamatan)                 AS rows_without_kode_kecamatan
FROM geometries;
