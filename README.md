# DSS FSVA

Decision Support System Food Security and Vulnerability Atlas (DSS FSVA) adalah aplikasi web berbasis GIS untuk analisis ketahanan dan kerentanan pangan tingkat desa/kelurahan di Indonesia.
Aplikasi ini dikembangkan sesuai dengan Petunjuk Teknis FSVA Badan Pangan Nasional 2025 (Juknis No.301.2/2025).

## Fitur Utama
1. **Peta Interaktif**: Visualisasi kerentanan pangan di setiap desa dengan peta choropleth interaktif (Prioritas 1-6).
2. **Dashboard Statistik**: Ringkasan jumlah desa per prioritas, distribusi indikator, dan faktor berpengaruh.
3. **Data Entry**: Upload batas desa (KML/KMZ) dan data indikator (XLSX) dengan kalkulasi otomatis.

## Persyaratan Sistem
- Node.js 18+
- Supabase Project dengan PostGIS aktif

## Cara Setup

1. **Clone & Install**
   ```bash
   git clone <repo-url> dss-fsva
   cd dss-fsva
   npm install
   ```

2. **Supabase Database**
   Jalankan file `init.sql` (bisa dicari di root project atau via SQL editor Supabase) untuk membuat tabel `geometries`, `raw_indicators`, `fsva_results`, dan view peta.

3. **Environment Variables**
   Copy file `.env.example` ke `.env.local` dan isi nilainya:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
   ```

4. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Akses `http://localhost:3000`.

## Cara Penggunaan
1. Buka halaman **Data Entry** (`/entry`).
2. Upload file KML/KMZ untuk memasukkan batas geometri tiap desa. Pastikan terdapat properti `kode_bps`.
3. Download template XLSX dari halaman tersebut, isi dengan 11 indikator FSVA sesuai pedoman.
4. Upload file XLSX yang sudah diisi ke aplikasi.
5. Klik **Hitung FSVA** untuk menjalankan algoritma kalkulasi komposit dan normalisasi (NCPR, AKE, dll).
6. Buka halaman **Peta Interaktif** (`/map`) untuk melihat hasilnya secara spasial.

## Algoritma Kalkulasi
DSS FSVA menggunakan pembobotan dan normalisasi sesuai Tabel 2, Tabel 3, dan Tabel 4 di Juknis 2025. Terdiri dari 11 indikator meliputi aspek Ketersediaan, Keterjangkauan, dan Pemanfaatan.

## Deployment Vercel
Aplikasi ini siap di-deploy ke Vercel. Pastikan environment variables (`NEXT_PUBLIC_SUPABASE_URL`, dll) sudah diatur pada menu Settings > Environment Variables di project Vercel Anda.
