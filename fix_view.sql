-- Perbarui view fsva_map_view agar menyertakan semua indikator p_*
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
LEFT JOIN fsva_results r ON g.kode_bps = r.kode_bps;
