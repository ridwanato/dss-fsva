-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabel wilayah/geometri
CREATE TABLE geometries (
  kode_bps TEXT PRIMARY KEY,
  kode_kemendagri TEXT,
  nama_desa TEXT NOT NULL,
  nama_kecamatan TEXT,
  nama_kabupaten TEXT,
  nama_provinsi TEXT,
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_geometries_geom ON geometries USING GIST(geom);

-- Tabel data mentah 11 indikator
CREATE TABLE raw_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_bps TEXT NOT NULL REFERENCES geometries(kode_bps),
  tahun INT NOT NULL DEFAULT 2024,
  -- KETERSEDIAAN: produksi pangan pokok (ton)
  produksi_padi NUMERIC DEFAULT 0,
  produksi_jagung NUMERIC DEFAULT 0,
  produksi_ubi_kayu NUMERIC DEFAULT 0,
  produksi_ubi_jalar NUMERIC DEFAULT 0,
  produksi_sagu NUMERIC DEFAULT 0,
  produksi_pisang NUMERIC DEFAULT 0,
  jumlah_penduduk INT NOT NULL,
  -- KETERSEDIAAN: energi dan protein (dari SAE-BPS)
  konsumsi_energi NUMERIC, -- kkal/kap/hr
  konsumsi_protein NUMERIC, -- gr/kap/hr
  -- KETERSEDIAAN: cadangan pangan (ton)
  cadangan_cbpd NUMERIC DEFAULT 0,
  cadangan_lpm NUMERIC DEFAULT 0,
  -- KETERJANGKAUAN
  pct_miskin NUMERIC, -- % desil 1+2
  cv_harga_beras NUMERIC,
  cv_harga_ayam NUMERIC,
  cv_harga_telur NUMERIC,
  cv_harga_minyak NUMERIC,
  pou NUMERIC, -- Prevalence of Undernourishment %
  -- PEMANFAATAN
  lama_sekolah_perempuan NUMERIC, -- tahun
  pct_no_water NUMERIC, -- % RT tanpa air bersih
  skor_pph NUMERIC, -- Pola Pangan Harapan 0-100
  pct_stunting NUMERIC, -- % balita stunting
  -- Metadata
  provinsi_kode TEXT, -- untuk lookup konversi GKG
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kode_bps, tahun)
);

-- Tabel hasil kalkulasi FSVA
CREATE TABLE fsva_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_bps TEXT NOT NULL REFERENCES geometries(kode_bps),
  tahun INT NOT NULL,
  -- Hasil kalkulasi indikator (Form 0-1)
  ncpr NUMERIC, -- Rasio konsumsi normatif, IAV = 300/F
  pct_ake NUMERIC, -- % ketersediaan energi thd 2100 kkal
  pct_prohe NUMERIC, -- % ketersediaan protein thd 25 gr
  rasio_cadangan NUMERIC, -- cadangan per kapita (kg)
  cv_harga NUMERIC, -- CV harga gabungan weighted
  -- Prioritas individu tiap indikator (1=terburuk, 6=terbaik)
  p_ncpr INT CHECK (p_ncpr BETWEEN 1 AND 6),
  p_energy INT CHECK (p_energy BETWEEN 1 AND 6),
  p_protein INT CHECK (p_protein BETWEEN 1 AND 6),
  p_cadangan INT CHECK (p_cadangan BETWEEN 1 AND 6),
  p_poverty INT CHECK (p_poverty BETWEEN 1 AND 6),
  p_cv_harga INT CHECK (p_cv_harga BETWEEN 1 AND 6),
  p_pou INT CHECK (p_pou BETWEEN 1 AND 6),
  p_sekolah INT CHECK (p_sekolah BETWEEN 1 AND 6),
  p_air INT CHECK (p_air BETWEEN 1 AND 6),
  p_pph INT CHECK (p_pph BETWEEN 1 AND 6),
  p_stunting INT CHECK (p_stunting BETWEEN 1 AND 6),
  -- Skor normalisasi per indikator (0-1)
  x_ncpr NUMERIC, x_energy NUMERIC, x_protein NUMERIC,
  x_cadangan NUMERIC, x_poverty NUMERIC, x_cv_harga NUMERIC,
  x_pou NUMERIC, x_sekolah NUMERIC, x_air NUMERIC,
  x_pph NUMERIC, x_stunting NUMERIC,
  -- Hasil akhir
  skor_komposit NUMERIC, -- Y(j) = Σ ai × xij
  indeks_komposit NUMERIC, -- skala 0-100
  prioritas INT CHECK (prioritas BETWEEN 1 AND 6),
  -- Indeks per aspek
  indeks_ketersediaan NUMERIC,
  indeks_keterjangkauan NUMERIC,
  indeks_pemanfaatan NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kode_bps, tahun)
);

-- View untuk GeoJSON export (join geometri + hasil)
CREATE OR REPLACE VIEW fsva_map_view AS
SELECT
  g.kode_bps,
  g.nama_desa,
  g.nama_kecamatan,
  g.nama_kabupaten,
  r.tahun,
  r.prioritas,
  r.indeks_komposit,
  r.ncpr, r.pct_ake, r.pct_prohe, r.rasio_cadangan,
  r.cv_harga, r.pou, r.pct_miskin AS pct_miskin_ref,
  r.indeks_ketersediaan, r.indeks_keterjangkauan, r.indeks_pemanfaatan,
  ST_AsGeoJSON(g.geom)::json AS geometry
FROM geometries g
LEFT JOIN fsva_results r ON g.kode_bps = r.kode_bps;

-- RLS policies
ALTER TABLE raw_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE fsva_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE geometries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read geometries" ON geometries FOR SELECT USING (true);
CREATE POLICY "Public read results" ON fsva_results FOR SELECT USING (true);
CREATE POLICY "Service role all" ON raw_indicators USING (auth.role() = 'service_role');
CREATE POLICY "Service role all fsva" ON fsva_results USING (auth.role() = 'service_role');

-- Create RPC for upserting geometries
CREATE OR REPLACE FUNCTION upsert_geometry(p_kode_bps TEXT, p_nama_desa TEXT, p_wkt TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO geometries (kode_bps, nama_desa, geom)
  VALUES (p_kode_bps, p_nama_desa, ST_Multi(ST_GeomFromText(p_wkt, 4326)))
  ON CONFLICT (kode_bps) DO UPDATE
  SET nama_desa = EXCLUDED.nama_desa, geom = EXCLUDED.geom;
END;
$$;
