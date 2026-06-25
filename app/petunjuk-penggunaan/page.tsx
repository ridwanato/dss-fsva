import Link from 'next/link';
import { 
  BookOpen, UserPlus, MapPin, FileSpreadsheet, Play, 
  CheckCircle2, Printer, ShieldAlert, ChevronRight, Info
} from 'lucide-react';

export const metadata = {
  title: 'Petunjuk Penggunaan - FSVA Indonesia',
  description: 'Panduan tata cara penggunaan sistem otomasi pemetaan ketahanan dan kerawanan pangan (FSVA) tingkat desa/kelurahan.',
};

export default function PetunjukPenggunaanPage() {
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
              <h1 className="text-3xl font-black text-slate-800 leading-tight">Petunjuk Penggunaan</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Panduan lengkap langkah-langkah operasional sistem FSVA</p>
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
                      Langkah pertama adalah mendaftarkan akun Anda. Masuk ke menu <strong className="text-slate-800">Masuk / Login</strong> pada sidebar, lalu daftarkan email aktif Anda. Setelah berhasil melakukan verifikasi email, masuk kembali menggunakan akun tersebut untuk membuka hak akses unggah data.
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
                      Siapkan file peta batas wilayah administrasi desa/kelurahan dalam format <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">.kml</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">.kmz</code>, atau <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">.zip</code>.
                    </p>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-2 text-xs text-slate-750">
                      <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0" /> Ketentuan Kompatibilitas Peta:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                          <strong>Format ZIP Shapefile:</strong> Wajib menyertakan berkas utama lengkap di dalam satu arsip zip (yaitu <code className="bg-white px-1 py-0.5 rounded text-slate-700">.shp</code>, <code className="bg-white px-1 py-0.5 rounded text-slate-700">.dbf</code>, <code className="bg-white px-1 py-0.5 rounded text-slate-700">.shx</code>, dan <code className="bg-white px-1 py-0.5 rounded text-slate-700">.prj</code>).
                        </li>
                        <li>
                          <strong>ID Desa & Kode BPS:</strong> Peta harus memiliki kolom atribut yang berisi kode BPS (10 digit numerik) atau kode Kemendagri. Peta resmi yang telah disediakan oleh <strong className="text-slate-800">Badan Pangan Nasional (Bapanas)</strong> sangat direkomendasikan karena sudah kompatibel dan mengandung ID desa standar nasional.
                        </li>
                        <li>
                          <strong>Sensitivitas Karakter & Ejaan:</strong> Sistem secara otomatis melakukan pembersihan nama desa/kelurahan dengan mengubah ke huruf kecil, menghapus spasi, tanda baca, serta awalan kata "Desa" atau "Kelurahan" (<em className="text-emerald-800">Case & Space Insensitive</em>). Terdapat pula fitur <strong>Fuzzy Matching</strong> berbasis Levenshtein distance dengan toleransi salah ketik hingga 2 karakter. Namun, untuk akurasi terbaik, sangat disarankan ejaan tetap dibuat konsisten antara peta dan berkas Excel.
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
                    <ul className="list-decimal pl-5 space-y-1.5 text-xs text-slate-650">
                      <li>Buka menu <strong className="text-slate-800">Data Entry</strong> pada sidebar.</li>
                      <li>Klik tautan <strong className="text-emerald-700">Download Template XLSX</strong> untuk mendapatkan formulir kosong.</li>
                      <li>Isi nama-nama desa, kode desa BPS, serta data lengkap untuk 11 indikator FSVA pada baris yang sesuai.</li>
                      <li><strong className="text-slate-800">Sangat Penting:</strong> Pastikan seluruh kode desa BPS atau ejaan nama desa di kolom template Excel sama persis dengan yang ada pada berkas peta yang diunggah agar proses pencocokan berjalan 100% sukses.</li>
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
                          <p className="font-bold text-slate-850 mb-0.5">Input Nama Peta & Upload Geometri</p>
                          <p className="leading-relaxed">Tuliskan nama peta kabupaten/kota yang diolah pada kolom teratas (contoh: <em>Kabupaten Serang</em>). Setelah itu, pilih berkas batas desa (.zip/.kml/.kmz) di kolom <strong>01</strong>. Pastikan muncul notifikasi sukses yang menampilkan jumlah desa yang berhasil diunggah (misal: <span className="text-teal-600 font-bold">"Berhasil upload 29 desa"</span>).</p>
                        </div>
                      </div>
                      <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-650">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">b</div>
                        <div>
                          <p className="font-bold text-slate-850 mb-0.5">Upload Template Excel</p>
                          <p className="leading-relaxed">Pilih berkas Excel (.xlsx) yang telah diisi data indikator pada kolom <strong>02</strong> untuk diunggah. Sistem akan secara otomatis mencocokkan baris data dengan peta. Pastikan muncul notifikasi sukses yang menyatakan seluruh data desa berhasil disimpan.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-650">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">c</div>
                        <div>
                          <p className="font-bold text-slate-850 mb-0.5">Jalankan Kalkulasi Otomatis</p>
                          <p className="leading-relaxed">Pada kolom <strong>03</strong>, klik tombol merah muda <strong className="text-pink-700">"Hitung FSVA Sekarang"</strong>. Tunggu beberapa saat (sistem memproses rumusan juknis Bapanas 2025 secara real-time) hingga muncul ringkasan distribusi jumlah desa prioritas 1 sampai prioritas 6.</p>
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
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Visualisasi & Penyimpanan Otomatis
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Setelah kalkulasi selesai, seluruh data dan hasil peta secara otomatis tersimpan secara permanen di server. Anda dapat langsung membuka menu <strong className="text-slate-800">Peta Interaktif</strong> untuk mengeksplorasi peta choropleth berwarna, atau menu <strong className="text-slate-800">Dashboard</strong> untuk melihat grafik komparatif serta faktor dominan kerawanan pangan.
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
                  Buka menu <strong className="text-slate-800">Peta Interaktif</strong> dan pilih kabupaten yang ingin dicetak. Sistem akan menampilkan kotak pembatas merah muda melayang (<em>guidance box</em>). Geser peta (drag) serta sesuaikan perbesaran (zoom in/out) agar seluruh wilayah kabupaten tercakup penuh di dalam kotak panduan tersebut.
                </div>
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-105 text-xs text-slate-650 leading-relaxed">
                  <strong className="text-slate-800 block mb-1">2. Klik Tombol Cetak</strong>
                  Klik tombol <strong className="text-slate-800">Layer</strong> di sebelah kiri atas peta, lalu klik tombol ungu bertuliskan <strong className="text-[#6b4c9a]">Cetak PDF</strong>.
                </div>
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-105 text-xs text-slate-650 leading-relaxed">
                  <strong className="text-slate-800 block mb-1">3. Sesuaikan Opsi KOP & Sumber (Opsional)</strong>
                  Modal pengaturan cetak akan muncul. Di sini, Anda dapat mengunggah file logo Pemda daerah Anda, logo Bapanas, menyesuaikan judul peta, daftar sumber data, serta instansi penanggung jawab di kolom tanda tangan bawah.
                </div>
                <div className="bg-slate-50/70 p-4.5 rounded-2xl border border-slate-105 text-xs text-slate-650 leading-relaxed">
                  <strong className="text-slate-800 block mb-1">4. Ekspor atau Cetak</strong>
                  Klik <strong className="text-blue-700">"Lanjut Cetak PDF"</strong>. Jendela cetak bawaan browser akan terbuka. Pilih opsi tujuan pencetakan ke mesin printer fisik atau simpan sebagai file PDF (<em className="text-slate-550">Save as PDF</em>) dengan orientasi Potret (Portrait).
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
                    <strong className="text-rose-950">Proteksi Peta Lain:</strong> Peta yang diunggah oleh pengguna lain tidak dapat dihapus. Sistem secara otomatis menyembunyikan tombol hapus (ikon tempat sampah) di daftar peta tersimpan untuk peta milik pengguna lain.
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
            <Link href="/" className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-105 hover:bg-slate-200 transition text-center">
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
