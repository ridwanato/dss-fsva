-- ================================================================
-- SQL MIGRATION: FIX RLS PERMISSION FOR TABEL AI_INSIGHTS
-- Jalankan skrip ini di Supabase SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kabupaten TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'kab_kota',
  tahun INT NOT NULL DEFAULT 2025,
  insight TEXT NOT NULL,
  data_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(nama_kabupaten, level, tahun)
);

-- Nonaktifkan RLS agar backend dapat menyimpan & membaca data cache tanpa terhalang RLS
ALTER TABLE ai_insights DISABLE ROW LEVEL SECURITY;

-- Index pencarian cepat berdasarkan wilayah dan tahun
CREATE INDEX IF NOT EXISTS idx_ai_insights_lookup 
  ON ai_insights(nama_kabupaten, level, tahun);
