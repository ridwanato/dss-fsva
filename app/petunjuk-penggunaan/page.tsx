'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, UserPlus, MapPin, FileSpreadsheet, Play, 
  CheckCircle2, Printer, ShieldAlert, ChevronRight, Info,
  Sparkles, Download, Layers
} from 'lucide-react';

function PetunjukPenggunaanContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'kab_kota';

  return (
    <div className="flex-1 bg-transparent py-12 pt-24 h-full overflow-y-auto relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="glass-card p-8 rounded-3xl border border-green-100/50 shadow-xl bg-white/90 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 w-14 h-14 rounded-2xl flex items-center justify-center border border-green-400/25 shadow-lg shrink-0">
              <BookOpen className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                Petunjuk Penggunaan {type === 'provinsi' ? 'FSVA Provinsi' : 'FSVA Kab/Kota'}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
                Panduan operasional lengkap analisis peta ketahanan pangan tingkat {type === 'provinsi' ? 'Kecamatan (Provinsi)' : 'Desa/Kelurahan (Kabupaten/Kota)'}
              </p>
            </div>
          </div>

          {/* Type Selector Tabs */}
          <div className="flex gap-3 mb-8 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
            <Link 
              href="/petunjuk-penggunaan?type=kab_kota" 
              className={`flex-1 text-center py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
                type === 'kab_kota'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Petunjuk FSVA Kab/Kota (Desa)
            </Link>
            <Link 
              href="/petunjuk-penggunaan?type=provinsi" 
              className={`flex-1 text-center py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
                type === 'provinsi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Petunjuk FSVA Provinsi (Kecamatan)
            </Link>
          </div>

          {/* Main Steps */}
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm">A</span>
                Alur Input Data &amp; Analisis Peta
              </h2>
              
              <div className="relative border-l-2 border-emerald-100 pl-6 ml-3.5 space-y-8">
                
                {/* Step 1 */}
                <div className="relative">
                  <span className="absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm">
                    1
                  </span>
                  <div className="bg-white/80 rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-emerald-600" /> Registrasi &amp; Login Akun
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Langkah pertama adalah masuk atau mendaftar di menu <strong className="text-slate-800">Login / Masuk</strong> pada sidebar. Pengguna yang terautentikasi mendapatkan akses penuh untuk mengunggah peta baru, menyimpan hasil analisis, dan mengelola peta milik pribadi.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className="absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm">
                    2
                  </span>
                  <div className="bg-white/80 rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" /> Menyiapkan Berkas Peta (Geometri Spasial)
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      Siapkan berkas batas wilayah administrasi {type === 'provinsi' ? 'kecamatan se-provinsi' : 'desa/kelurahan se-kabupaten/kota'} dalam format <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-800">.zip</code> (Shapefile 2D), <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-800">.kml</code>, atau <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-800">.kmz</code>.
                    </p>
                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-2 text-xs text-slate-750">
                      <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0 text-emerald-700" /> Ketentuan Spesifikasi Peta:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                          <strong>Format ZIP Shapefile:</strong> Berkas ZIP wajib berisi 4 file utama (`.shp`, `.dbf`, `.shx`, dan `.prj`).
                        </li>
                        <li>
                          <strong>Atribut Kode BPS:</strong> Berkas peta harus memiliki atribut kode BPS ({type === 'provinsi' ? '7 digit Kode Kecamatan BPS' : '10 digit Kode Desa BPS'}).
                        </li>
                        <li>
                          <strong>Auto 2D &amp; Fuzzy Matching:</strong> Sistem secara otomatis mengonversi koordinat 3D/Z menjadi 2D WKT dan mencocokkan ejaan nama wilayah dengan toleransi kesalahan ketik hingga 2 karakter.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <span className="absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm">
                    3
                  </span>
                  <div className="bg-white/80 rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Menyiapkan Berkas Indikator (Form Excel)
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      Unduh template Form FSVA V2 resmi yang telah disesuaikan dengan Petunjuk Teknis Badan Pangan Nasional.
                    </p>
                    {type === 'provinsi' ? (
                      <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-950 mb-3 space-y-2">
                        <p className="font-extrabold flex items-center gap-1.5 text-indigo-900">
                          <Info className="w-3.5 h-3.5 shrink-0 text-indigo-700" /> Ketentuan Form FSVA Provinsi (12 Indikator):
                        </p>
                        <ul className="list-disc pl-5 space-y-1 font-medium">
                          <li>File Excel multi-sheet resmi dengan sheet <strong>0.1 s.d. 0.6</strong>.</li>
                          <li>Analisis tingkat <strong>Kecamatan</strong> se-Provinsi.</li>
                          <li>Mencakup 12 Indikator (termasuk Keamanan Pangan Segar &amp; Siap Saji).</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 mb-3 space-y-2">
                        <p className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                          <Info className="w-3.5 h-3.5 shrink-0 text-emerald-700" /> Ketentuan Form FSVA Kab/Kota (11 Indikator):
                        </p>
                        <ul className="list-disc pl-5 space-y-1 font-medium">
                          <li>File Excel single-sheet / Form V2 berisi data indikator per desa/kelurahan.</li>
                          <li>Analisis tingkat <strong>Desa/Kelurahan</strong> se-Kabupaten/Kota.</li>
                          <li>Mencakup 11 Indikator Utama Ketahanan Pangan.</li>
                        </ul>
                      </div>
                    )}
                    <ul className="list-decimal pl-5 space-y-1.5 text-xs text-slate-700 font-medium">
                      <li>Buka menu <strong className="text-slate-800">Download Form FSVA V2</strong> di sidebar.</li>
                      <li>Pilih level <strong className="text-slate-800">{type === 'provinsi' ? 'Form FSVA Prov V2' : 'Form FSVA Kab/Kota V2'}</strong>.</li>
                      <li>Unduh file, isi data indikator secara lengkap, lalu simpan.</li>
                    </ul>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <span className="absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm">
                    4
                  </span>
                  <div className="bg-white/80 rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" /> Mengunggah Berkas &amp; Menjalankan Kalkulasi
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      Masuk ke menu <strong className="text-slate-800">Data Entry</strong> dan jalankan 3 langkah sistematis:
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">a</div>
                        <div>
                          <p className="font-bold text-slate-900 mb-0.5">Pilih Nama Wilayah</p>
                          <p className="leading-relaxed">Pilih Nama Provinsi / Kabupaten/Kota menggunakan fitur autokomplit agar terekam presisi di database.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">b</div>
                        <div>
                          <p className="font-bold text-slate-900 mb-0.5">Unggah Geometri &amp; Excel</p>
                          <p className="leading-relaxed">Unggah file peta pada kolom <strong>01</strong> dan file Excel indikator pada kolom <strong>02</strong>.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">c</div>
                        <div>
                          <p className="font-bold text-slate-900 mb-0.5">Proses Kalkulasi</p>
                          <p className="leading-relaxed">Pada kolom <strong>03</strong>, klik tombol <strong className="text-pink-700">"Hitung FSVA Sekarang"</strong> untuk mengotomasi kalkulasi normalisasi, bobot, dan prioritas akhir secara real-time.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="relative">
                  <span className="absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm">
                    5
                  </span>
                  <div className="bg-white/80 rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Visualisasi &amp; AI Insight
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Setelah kalkulasi berhasil, data langsung tersimpan secara permanen. Anda dapat berpindah ke menu <strong className="text-slate-800">Peta Interaktif</strong> untuk mengeksplorasi layer choropleth, menu <strong className="text-slate-800">Faktor yang Berpengaruh</strong> untuk grafik analisis, serta menu <strong className="text-slate-800">AI Insight FSVA</strong> untuk generasi narasi rekomendasi kebijakan berbasis AI.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Printing & Export Guide */}
            <div className="border-t border-slate-100 pt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm">B</span>
                Cetak Peta (PDF) &amp; Ekspor Data (Excel)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1 text-sm font-bold flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-emerald-600" /> 1. Cetak Peta PDF KOP Resmi
                  </strong>
                  Buka menu <strong className="text-slate-800">Peta Interaktif</strong>, klik <strong className="text-slate-800">Cetak Peta FSVA</strong>. Unggah logo Pemda &amp; Bapanas, atur judul peta, sumber data, dan instansi penanggung jawab, lalu ekspor ke file PDF.
                </div>
                <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1 text-sm font-bold flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-600" /> 2. Ekspor Hasil Analisis (Excel V2)
                  </strong>
                  Klik <strong className="text-slate-800">Download Hasil Analisis FSVA</strong> di sidebar untuk mengunduh seluruh data indikator mentah dan nilai prioritas komposit dalam format spreadsheet yang rapi.
                </div>
              </div>
            </div>

            {/* Governance Deletion */}
            <div className="border-t border-slate-100 pt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Tata Kelola Hak Penghapusan Peta (Governance)
              </h2>
              <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-5 text-sm text-rose-900 leading-relaxed shadow-xs">
                <p className="font-extrabold flex items-center gap-2 mb-2 text-rose-950">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-700" /> Ketentuan Hak Akses Hapus Peta:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 font-medium text-xs md:text-sm">
                  <li>
                    <strong>Pengunggah Asli:</strong> Anda hanya dapat menghapus peta yang diunggah dari akun milik Anda sendiri.
                  </li>
                  <li>
                    <strong>Proteksi Peta Lain:</strong> Peta yang diunggah oleh pengguna/daerah lain tidak dapat dihapus.
                  </li>
                  <li>
                    <strong>Proteksi Peta Sistem:</strong> Peta bawaan/publik sistem diproteksi penuh dan tidak dapat dihapus pengguna umum.
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Footer Navigation Buttons */}
          <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
            <Link href="/" className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-center">
              Kembali ke Beranda
            </Link>
            <Link href="/map" className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] transition-all shadow-md flex items-center justify-center gap-1.5">
              Lihat Peta Interaktif <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PetunjukPenggunaanPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 bg-transparent py-12 pt-24 h-full flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-xl shadow border text-slate-650">
          Memuat Petunjuk...
        </div>
      </div>
    }>
      <PetunjukPenggunaanContent />
    </Suspense>
  );
}
