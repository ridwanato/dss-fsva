-- ================================================================
-- TABEL: konversi_gkg (Angka Konversi GKG ke Beras per Provinsi)
-- Sumber: Badan Pangan Nasional (Bapanas) / BPS (Juknis No. 21 Tahun 2026)
-- Digunakan untuk kalkulasi NCPR (Ketersediaan Padi Netto -> Beras Konsumsi)
-- Jalankan skrip ini di SQL Editor Supabase
-- ================================================================

CREATE TABLE IF NOT EXISTS public.konversi_gkg (
  id SERIAL PRIMARY KEY,
  kode_provinsi VARCHAR(2) NOT NULL UNIQUE,
  nama_provinsi VARCHAR(100) NOT NULL UNIQUE,
  nilai_persen NUMERIC(5,2) NOT NULL,
  nilai_desimal NUMERIC(6,4) NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matikan RLS agar tabel dapat dibaca oleh anon / server tanpa pembatasan
ALTER TABLE public.konversi_gkg DISABLE ROW LEVEL SECURITY;

-- Insert / Upsert 34 Provinsi + Nasional Indonesia
INSERT INTO public.konversi_gkg (kode_provinsi, nama_provinsi, nilai_persen, nilai_desimal, keterangan)
VALUES
  ('91', 'Papua Barat', 66.70, 0.6670, 'BPS / Juknis Bapanas'),
  ('62', 'Kalimantan Tengah', 65.94, 0.6594, 'BPS / Juknis Bapanas'),
  ('65', 'Kalimantan Utara', 65.81, 0.6581, 'BPS / Juknis Bapanas'),
  ('19', 'Kep. Bangka Belitung', 65.80, 0.6580, 'BPS / Juknis Bapanas'),
  ('63', 'Kalimantan Selatan', 65.69, 0.6569, 'BPS / Juknis Bapanas'),
  ('61', 'Kalimantan Barat', 65.68, 0.6568, 'BPS / Juknis Bapanas'),
  ('72', 'Sulawesi Tengah', 65.53, 0.6553, 'BPS / Juknis Bapanas'),
  ('31', 'DKI Jakarta', 65.44, 0.6544, 'BPS / Juknis Bapanas'),
  ('53', 'Nusa Tenggara Timur', 65.03, 0.6503, 'BPS / Juknis Bapanas'),
  ('64', 'Kalimantan Timur', 64.57, 0.6457, 'BPS / Juknis Bapanas'),
  ('13', 'Sumatera Barat', 64.28, 0.6428, 'BPS / Juknis Bapanas'),
  ('15', 'Jambi', 64.22, 0.6422, 'BPS / Juknis Bapanas'),
  ('32', 'Jawa Barat', 64.11, 0.6411, 'BPS / Juknis Bapanas'),
  ('35', 'Jawa Timur', 64.10, 0.6410, 'BPS / Juknis Bapanas'),
  ('00', 'Indonesia', 64.02, 0.6402, 'Rata-rata Nasional (Default)'),
  ('11', 'Aceh', 63.95, 0.6395, 'BPS / Juknis Bapanas'),
  ('17', 'Bengkulu', 63.94, 0.6394, 'BPS / Juknis Bapanas'),
  ('33', 'Jawa Tengah', 63.84, 0.6384, 'BPS / Juknis Bapanas'),
  ('18', 'Lampung', 63.82, 0.6382, 'BPS / Juknis Bapanas'),
  ('76', 'Sulawesi Barat', 63.76, 0.6376, 'BPS / Juknis Bapanas'),
  ('16', 'Sumatera Selatan', 63.75, 0.6375, 'BPS / Juknis Bapanas'),
  ('74', 'Sulawesi Tenggara', 63.75, 0.6375, 'BPS / Juknis Bapanas'),
  ('73', 'Sulawesi Selatan', 63.71, 0.6371, 'BPS / Juknis Bapanas'),
  ('14', 'Riau', 63.71, 0.6371, 'BPS / Juknis Bapanas'),
  ('12', 'Sumatera Utara', 63.68, 0.6368, 'BPS / Juknis Bapanas'),
  ('21', 'Kep. Riau', 63.53, 0.6353, 'BPS / Juknis Bapanas'),
  ('94', 'Papua', 63.39, 0.6339, 'BPS / Juknis Bapanas'),
  ('36', 'Banten', 63.23, 0.6323, 'BPS / Juknis Bapanas'),
  ('52', 'Nusa Tenggara Barat', 63.23, 0.6323, 'BPS / Juknis Bapanas'),
  ('34', 'DI Yogyakarta', 63.06, 0.6306, 'BPS / Juknis Bapanas'),
  ('51', 'Bali', 62.61, 0.6261, 'BPS / Juknis Bapanas'),
  ('71', 'Sulawesi Utara', 62.38, 0.6238, 'BPS / Juknis Bapanas'),
  ('81', 'Maluku', 62.17, 0.6217, 'BPS / Juknis Bapanas'),
  ('82', 'Maluku Utara', 62.13, 0.6213, 'BPS / Juknis Bapanas'),
  ('75', 'Gorontalo', 61.99, 0.6199, 'BPS / Juknis Bapanas')
ON CONFLICT (kode_provinsi) DO UPDATE SET
  nama_provinsi = EXCLUDED.nama_provinsi,
  nilai_persen = EXCLUDED.nilai_persen,
  nilai_desimal = EXCLUDED.nilai_desimal,
  keterangan = EXCLUDED.keterangan,
  updated_at = NOW();

-- Index pencarian
CREATE INDEX IF NOT EXISTS idx_konversi_gkg_nama ON public.konversi_gkg (nama_provinsi);
CREATE INDEX IF NOT EXISTS idx_konversi_gkg_kode ON public.konversi_gkg (kode_provinsi);
