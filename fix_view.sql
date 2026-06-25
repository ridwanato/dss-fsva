-- Perbarui view fsva_map_view agar menyertakan semua indikator p_* dan nilai mentah 4 indikator dari raw_indicators
DROP VIEW IF EXISTS fsva_map_view;
CREATE OR REPLACE VIEW fsva_map_view AS
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
  -- Nilai mentah dari tabel raw_indicators untuk 4 indikator yang sebelumnya kosong
  raw.lama_sekolah_perempuan AS lama_sekolah,
  raw.pct_no_water,
  raw.skor_pph,
  raw.pct_stunting,
  ST_AsGeoJSON(g.geom)::json AS geometry
FROM geometries g
LEFT JOIN fsva_results r ON g.kode_bps = r.kode_bps AND g.nama_kabupaten = r.nama_kabupaten
LEFT JOIN raw_indicators raw ON g.kode_bps = raw.kode_bps AND r.tahun = raw.tahun;
