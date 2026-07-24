'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, UserPlus, MapPin, FileSpreadsheet, Play, 
  CheckCircle2, Printer, ShieldAlert, ChevronRight, Info
} from 'lucide-react';

function PetunjukPenggunaanContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'kab_kota';

  return (
    <div className="flex-1 bg-transparent py-12 pt-24 h-full overflow-y-auto relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6D5EF5 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="glass-card p-8 rounded-3xl border border-green-100/50 shadow-xl bg-white/80 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 w-14 h-14 rounded-2xl flex items-center justify-center border border-green-400/25 shadow-lg">
              <BookOpen className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 leading-tight">
                Petunjuk Penggunaan {type === 'provinsi' ? 'FSVA Provinsi' : 'FSVA Kab/Kota'}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Panduan langkah-langkah operasional analisis peta tingkat {type === 'provinsi' ? 'Kecamatan (Provinsi)' : 'Desa/Kelurahan (Kabupaten/Kota)'}
              </p>
            </div>
          </div>

          {/* Main Steps */}
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-black text-sm">A</span>
                Alur Input Data & Analisis Peta
              </h2>
              
              <div className="relative border-l-2 border-emerald-100 pl-6 ml-3.5 space-y-8">
                
                {/* Step 1 */}
                <div className="relative">
                  <span className="absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm">
                    1
                  </span>
                  <div className="bg-white/60 rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-emerald-600" /> Registrasi & Login Akun
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Langkah pertama adalah mendaftarkan akun Anda. Masuk ke menu <strong className="text-slate-800">Masuk / Login</strong> pada sidebar, lalu daftarkan email aktif Anda. Setelah verifikasi email, masuk kembali untuk membuka hak akses unggah data.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className="absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm">
                    2
                  </span>
                  <div className="bg-white/60 rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" /> Menyiapkan Berkas Peta (Geometri)
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      Siapkan file peta batas wilayah administrasi {type === 'provinsi' ? 'kecamatan se-provinsi' : 'desa/kelurahan se-kabupaten'} dalam format <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">.kml</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">.kmz</code>, atau <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">.zip</code>.
                    </p>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-2 text-xs text-slate-750">
                      <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0" /> Ketentuan Kompatibilitas Peta:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                          <strong>Format ZIP Shapefile:</strong> Wajib menyertakan berkas utama lengkap di dalam satu arsip (.shp, .dbf, .shx, dan .prj).
                        </li>
                        <li>
                          <strong>ID Wilayah & Kode BPS:</strong> Peta harus memiliki kolom atribut yang berisi kode BPS ({type === 'provinsi' ? '7 digit untuk Kecamatan' : '10 digit untuk Desa'}).
                        </li>
                        <li>
                          <strong>Sensitivitas Karakter & Ejaan:</strong> Sistem melakukan pencocokan nama secara cerdas (<em className="text-emerald-800">Case & Space Insensitive</em>) disertai <strong>Fuzzy Matching</strong> berbasis Levenshtein distance dengan toleransi salah ketik hingga 2 karakter.
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
                  <div className="bg-white/60 rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Menyiapkan Berkas Indikator (Excel)
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-3">
                      Sebelum melakukan pengunggahan data indikator, pastikan Anda menggunakan template Excel resmi agar format kolom sesuai dengan sistem.
                    </p>
                    {type === 'provinsi' ? (
                      <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-4 text-xs text-indigo-900 mb-3 space-y-2">
                        <p className="font-extrabold flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0" /> Ketentuan Form Validasi Provinsi:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Form Excel harus berupa file multi-sheet yang memiliki lembar kerja <strong>0.1 s.d. 0.6</strong>.</li>
                          <li>Tingkat analisis adalah <strong>Kecamatan</strong> se-Provinsi.</li>
                          <li>Menghitung <strong>12 indikator</strong> yang meliputi aspek Ketersediaan, Keterjangkauan, dan Pemanfaatan Pangan (termasuk Keamanan Pangan Segar & Siap Saji).</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 text-xs text-emerald-900 mb-3 space-y-2">
                        <p className="font-extrabold flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0" /> Ketentuan Form Template Kabupaten/Kota:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Form Excel berupa file single-sheet berisi data indikator per desa/kelurahan.</li>
                          <li>Tingkat analisis adalah <strong>Desa/Kelurahan</strong> se-Kabupaten/Kota.</li>
                          <li>Menghitung <strong>11 indikator</strong> ketahanan pangan.</li>
                        </ul>
                      </div>
                    )}
                    <ul className="list-decimal pl-5 space-y-1.5 text-xs text-slate-650">
                      <li>Buka menu <strong className="text-slate-800">Data Entry</strong> pada sidebar.</li>
                      <li>Pilih level <strong className="text-slate-800">{type === 'provinsi' ? 'PROVINSI' : 'KABUPATEN / KOTA'}</strong>.</li>
                      <li>Klik tautan <strong className="text-emerald-700">Download Template XLSX</strong> untuk mendapatkan berkas yang tepat.</li>
                      <li>Isi data lengkap sesuai format, lalu upload file untuk memproses hasil akhir.</li>
                    </ul>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <span className="absolute -left-[35px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm">
                    4
                  </span>
                  <div className="bg-white/60 rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" /> Mengunggah Berkas & Menjalankan Analisis
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      Masuk ke menu <strong className="text-slate-800">Data Entry</strong> dan lakukan langkah-langkah pengisian secara berurutan:
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-650">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">a</div>
                        <div>
                          <p className="font-bold text-slate-850 mb-0.5">Pilih Wilayah</p>
                          <p className="leading-relaxed">Pilih Provinsi dan Kabupaten/Kota (jika level Kab/Kota) menggunakan pencarian fuzzy autocomplete agar nama terekam dengan akurat di database.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-650">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">b</div>
                        <div>
                          <p className="font-bold text-slate-850 mb-0.5">Upload Geometri & Excel</p>
                          <p className="leading-relaxed">Unggah file batas wilayah administrasi di kolom <strong>01</strong> dan template Excel indikator di kolom <strong>02</strong>.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-650">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">c</div>
                        <div>
                          <p className="font-bold text-slate-850 mb-0.5">Jalankan Kalkulasi</p>
                          <p className="leading-relaxed">Pada kolom <strong>03</strong>, klik tombol <strong className="text-pink-700">"Hitung FSVA Sekarang"</strong> untuk memproses rumusan juknis Bapanas secara real-time.</p>
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
                  <div className="bg-white/60 rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold text-slate-800 text-base mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Visualisasi & Penyimpanan
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Setelah kalkulasi selesai, seluruh data dan hasil peta secara otomatis tersimpan secara permanen di server. Anda dapat mengeksplorasi peta choropleth berwarna di menu <strong className="text-slate-800">Peta Interaktif</strong> atau grafik komparatif di menu <strong className="text-slate-800">Faktor yang Berpengaruh</strong>.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Printing Guide */}
            <div className="border-t border-slate-100 pt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-black text-sm">B</span>
                Tata Cara Mencetak Peta (PDF/Kertas)
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                Sistem menyediakan modul cetak peta berkualitas tinggi yang siap dicetak ke kertas atau diekspor menjadi dokumen PDF. Ikuti langkah-langkah berikut:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-105 text-xs text-slate-650 leading-relaxed">
                  <strong className="text-slate-800 block mb-1">1. Atur Posisi Peta (Fit to Box)</strong>
                  Buka menu <strong className="text-slate-800">Peta Interaktif</strong> dan pilih daerah yang ingin dicetak. Sistem akan menampilkan kotak pembatas merah muda melayang (<em>guidance box</em>). Geser peta (drag) serta sesuaikan perbesaran (zoom) agar wilayah tercakup penuh di dalam kotak panduan.
                </div>
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-105 text-xs text-slate-650 leading-relaxed">
                  <strong className="text-slate-800 block mb-1">2. Klik Tombol Cetak</strong>
                  Klik tombol <strong className="text-slate-800">Cetak Peta FSVA</strong> di sidebar menu atau di panel layer peta.
                </div>
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-105 text-xs text-slate-650 leading-relaxed">
                  <strong className="text-slate-800 block mb-1">3. Sesuaikan Opsi KOP & Tanda Tangan</strong>
                  Modal pengaturan cetak akan muncul. Di sini, Anda dapat mengunggah file logo Pemda daerah Anda, logo Bapanas, menyesuaikan judul peta, daftar sumber data, serta instansi penanggung jawab.
                </div>
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-105 text-xs text-slate-650 leading-relaxed">
                  <strong className="text-slate-800 block mb-1">4. Ekspor atau Cetak</strong>
                  Klik <strong className="text-blue-700">"Lanjut Cetak PDF"</strong>. Jendela cetak bawaan browser akan terbuka. Pilih opsi tujuan pencetakan ke mesin printer fisik atau simpan sebagai file PDF.
                </div>
              </div>
            </div>

            {/* Governance Deletion */}
            <div className="border-t border-slate-100 pt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#DB2777]" />
                Ketentuan Hak Penghapusan Peta (Governance)
              </h2>
              <div className="bg-rose-50 border border-rose-200/60 rounded-2xl p-5 text-sm text-rose-850 leading-relaxed shadow-sm">
                <p className="font-extrabold flex items-center gap-2 mb-2 text-rose-900">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-700" /> PENTING UNTUK DIKETAHUI:
                </p>
                <p className="mb-2">
                  Untuk menjaga integritas data serta keamanan informasi antar-pengguna, platform FSVA menerapkan aturan tata kelola penghapusan data secara ketat:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 font-medium">
                  <li>
                    <strong className="text-rose-950">Hak Penghapusan Mandiri:</strong> Pengguna hanya memiliki izin untuk menghapus peta yang diunggah oleh dirinya sendiri (pemilik peta asli).
                  </li>
                  <li>
                    <strong className="text-rose-950">Proteksi Peta Lain:</strong> Peta yang diunggah oleh pengguna lain tidak dapat dihapus.
                  </li>
                  <li>
                    <strong className="text-rose-950">Proteksi Peta Publik/Sistem:</strong> Peta dasar bawaan sistem yang bersifat publik tidak dapat dihapus oleh pengguna umum.
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
            <Link href="/map" className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] transition-all shadow-md flex items-center justify-center gap-1.5">
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
