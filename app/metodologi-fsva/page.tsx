import Link from 'next/link';
import { ShieldCheck, Compass } from 'lucide-react';

export default function MetodologiFsvaPage() {
  return (
    <div className="flex-1 bg-transparent py-12 pt-24 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 space-y-6">

        {/* Pernyataan Independensi & Metodologi Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-8 py-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
                Pernyataan Independensi dan Metodologi
              </h1>
              <p className="text-emerald-200/90 text-xs font-medium mt-0.5">
                Statement of Independence and Methodology
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-7 space-y-5 text-sm text-slate-700 leading-relaxed">

            {/* Blok 1 — Deskripsi Umum */}
            <p className="text-base text-slate-800 font-medium">
              Aplikasi ini dikembangkan secara mandiri dan bersifat nonkomersial sebagai sarana bantu analisis Peta Ketahanan dan Kerentanan Pangan (FSVA), dengan tujuan mendukung pembelajaran, analisis, dan pertukaran pengetahuan di antara praktisi ketahanan pangan.
            </p>

            {/* Blok 2 — Non-Afiliasi */}
            <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 shadow-xs">
              <span className="text-amber-600 font-black text-lg leading-none mt-0.5 shrink-0">⚠️</span>
              <p className="text-slate-850 font-medium text-xs md:text-sm leading-relaxed">
                Aplikasi ini <strong>tidak dibuat, dikelola, disponsori, didukung, disahkan, atau secara resmi terafiliasi</strong> dengan Badan Pangan Nasional (Bapanas) maupun instansi pemerintah lainnya.
              </p>
            </div>

            {/* Blok 3 — Metodologi */}
            <p>
              Metodologi, indikator, formula, pembobotan, klasifikasi, dan ketentuan analisis yang digunakan dalam aplikasi mengacu pada <strong>Petunjuk Teknis Penyusunan Peta Ketahanan dan Kerentanan Pangan (FSVA)</strong> yang diterbitkan oleh Badan Pangan Nasional, termasuk pemutakhiran metodologi yang berlaku pada tahun terkait (Juknis Bapanas 2025/2026).
            </p>

            <p>
              Aplikasi ini merupakan implementasi perangkat lunak secara independen terhadap metodologi tersebut dan bukan merupakan aplikasi resmi Bapanas.
            </p>

            {/* Tahapan Kalkulasi Teknis Summary */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                Tahapan Perhitungan Teknis FSVA:
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm text-slate-700">
                <li>
                  <strong>Normalisasi Indikator (Skor 0–1):</strong> Mengubah data mentah tiap indikator menjadi skor 0 s.d 1. Indikator bernilai negatif (kemiskinan, stunting) dibalik skalanya agar skor 1 selalu merepresentasikan kondisi terbaik.
                </li>
                <li>
                  <strong>Klasifikasi Prioritas Individu (Skala 1–6):</strong> Memetakan skor indikator ke dalam 6 kelas prioritas individu berdasarkan batas ambang (threshold) nasional Juknis Bapanas.
                </li>
                <li>
                  <strong>Pembobotan Aspek & Indeks Komposit:</strong> Menghitung skor komposit dari penjumlahan hasil kali skor indikator dengan bobot masing-masing aspek (Ketersediaan, Keterjangkauan, Pemanfaatan).
                </li>
                <li>
                  <strong>Penentuan Prioritas Akhir (Prioritas 1–6):</strong> Pengelompokan akhir ke dalam 6 kelas prioritas (Prioritas 1–3: Wilayah Rentan Pangan; Prioritas 4–6: Wilayah Tahan Pangan).
                </li>
              </ol>
            </div>

            {/* Blok 4 — Rekomendasi Pengguna */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/90 space-y-2">
              <p className="text-slate-850 font-semibold text-xs md:text-sm leading-relaxed">
                Pengguna tetap disarankan merujuk kepada Juknis, peraturan, keputusan, dan/atau dokumen resmi Bapanas yang berlaku sebagai rujukan utama, khususnya apabila hasil analisis digunakan untuk:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-slate-700 font-medium">
                <li>Penyusunan dokumen resmi pemerintah</li>
                <li>Perencanaan kebijakan</li>
                <li>Pengambilan keputusan formal</li>
              </ul>
            </div>

            {/* Blok 5 — Tanggung Jawab Versi Metodologi */}
            <p>
              Perubahan metodologi FSVA oleh Bapanas pada tahun-tahun berikutnya dapat menyebabkan hasil aplikasi berbeda apabila pengguna menggunakan versi metodologi yang berbeda. Oleh karena itu, <strong>pengguna bertanggung jawab memastikan versi metodologi dan sumber data yang digunakan sesuai dengan kebutuhan analisis</strong>.
            </p>

            {/* Blok 6 — Hak Kekayaan Intelektual */}
            <div className="pt-4 border-t border-slate-150">
              <p className="text-xs text-slate-500 leading-relaxed">
                Seluruh nama, lambang, logo, dan identitas resmi Badan Pangan Nasional tetap merupakan identitas masing-masing pemiliknya dan tidak digunakan oleh aplikasi ini untuk menyatakan hubungan, <em>endorsement</em>, atau pengesahan resmi.
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/tentang-fsva" className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-200/80 hover:bg-slate-200 transition">
              Kembali ke Tentang Aplikasi
            </Link>
            <Link href="/indikator-fsva" className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm">
              Lihat Indikator FSVA
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
