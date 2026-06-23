import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function MetodologiFsvaPage() {
  return (
    <div className="flex-1 bg-transparent py-12 pt-24 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6">
        <div className="glass-card p-8 rounded-3xl border border-green-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-100">
              <Compass className="text-emerald-600 w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 leading-tight">Metodologi Perhitungan FSVA</h1>
          </div>
          
          <div className="space-y-6 text-sm md:text-base text-slate-650 leading-relaxed">
            <p>
              Sistem perhitungan FSVA menggunakan metode pembobotan dan penyusunan indeks komposit multi-kriteria untuk merangkum 11 indikator pangan dari 3 aspek ketahanan pangan.
            </p>
            
            <h3 className="text-lg font-bold text-slate-850 mt-4">Tahapan Perhitungan:</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <strong>Normalisasi Indikator (Nilai 0–1):</strong>
                <p className="text-slate-500 text-sm mt-1">
                  Masing-masing data mentah ditransformasikan ke dalam skor normalisasi berskala 0 hingga 1. Indikator negatif (misal: kemiskinan, stunting) dinormalisasi agar skor 1 menunjukkan kondisi terbaik (paling tidak miskin/tidak stunting) dan skor 0 menunjukkan kondisi terburuk.
                </p>
              </li>
              <li>
                <strong>Pembagian Kelas Prioritas (Skala 1–6):</strong>
                <p className="text-slate-500 text-sm mt-1">
                  Berdasarkan skor normalisasi, tiap indikator desa dipetakan ke dalam kelas prioritas individu 1 hingga 6 menggunakan batas ambang klasifikasi (threshold) nasional yang telah ditetapkan oleh juknis Bapanas.
                </p>
              </li>
              <li>
                <strong>Pemberian Bobot Aspek & Indeks Komposit:</strong>
                <p className="text-slate-500 text-sm mt-1">
                  Skor komposit dihitung dengan menjumlahkan hasil kali skor normalisasi tiap indikator dengan bobot masing-masing indikator. Total bobot dari seluruh aspek adalah 100%.
                </p>
              </li>
              <li>
                <strong>Penentuan Prioritas Komposit (FSVA Akhir):</strong>
                <p className="text-slate-500 text-sm mt-1">
                  Skor akhir dikelompokkan ke dalam 6 kelas prioritas komposit. Wilayah Prioritas 1, 2, dan 3 dikategorikan sebagai wilayah Rentan Pangan, sedangkan wilayah Prioritas 4, 5, dan 6 dikategorikan sebagai wilayah Tahan Pangan.
                </p>
              </li>
            </ol>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/tentang-fsva" className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
              Kembali Ke Tentang
            </Link>
            <Link href="/indikator-fsva" className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm">
              Lihat 11 Indikator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
