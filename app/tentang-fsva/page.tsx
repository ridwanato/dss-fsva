import Link from 'next/link';
import { Info } from 'lucide-react';

export default function TentangFsvaPage() {
  return (
    <div className="flex-1 bg-transparent py-12 pt-24 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6">
        <div className="glass-card p-8 rounded-3xl border border-green-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-100">
              <Info className="text-emerald-600 w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 leading-tight">Tentang FSVA</h1>
          </div>
          
          <div className="space-y-6 text-sm md:text-base text-slate-650 leading-relaxed">
            <p>
              <strong>Food Security and Vulnerability Atlas (FSVA)</strong> atau Peta Ketahanan dan Kerentanan Pangan merupakan instrumen penting untuk memetakan kondisi ketahanan dan kerentanan pangan suatu wilayah secara spasial hingga tingkat desa/kelurahan.
            </p>
            <p>
              Platform ini dibangun sebagai sistem otomasi untuk memproses kalkulasi dan menyajikan visualisasi peta choropleth secara akurat. Metode perhitungan dan klasifikasi prioritas didasarkan secara penuh pada <strong>Petunjuk Teknis Penyusunan Peta Ketahanan dan Kerentanan Pangan (FSVA) Badan Pangan Nasional Tahun 2025 (Juknis No. 301.2/2025)</strong>.
            </p>
            <p>
              FSVA membagi wilayah ke dalam 6 tingkat Prioritas Ketahanan Pangan:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-red-650">Prioritas 1 (Sangat Rentan):</strong> Wilayah dengan tingkat kerawanan pangan sangat tinggi.</li>
              <li><strong className="text-red-500">Prioritas 2 (Rentan):</strong> Wilayah dengan kondisi pangan rawan sedang-tinggi.</li>
              <li><strong className="text-orange-500">Prioritas 3 (Agak Rentan):</strong> Wilayah dengan kerentanan pangan tingkat sedang.</li>
              <li><strong className="text-yellow-600">Prioritas 4 (Agak Tahan):</strong> Wilayah yang cukup aman dengan kerawanan pangan rendah.</li>
              <li><strong className="text-green-500">Prioritas 5 (Tahan):</strong> Wilayah dengan kondisi ketahanan pangan yang baik.</li>
              <li><strong className="text-emerald-700">Prioritas 6 (Sangat Tahan):</strong> Wilayah dengan ketahanan pangan sangat tinggi dan mandiri.</li>
            </ul>
            <p>
              Dengan adanya pemetaan spasial ini, pemerintah daerah dan pemangku kebijakan dapat mengidentifikasi lokasi intervensi program ketahanan pangan secara lebih presisi dan efisien (target intervensi difokuskan pada desa Prioritas 1-3).
            </p>

            {/* Inisiatif Pengembangan Mandiri & Informasi Afiliasi */}
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2.5 text-slate-800 shadow-xs">
              <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
                <span>Inisiatif Pengembangan & Informasi Afiliasi</span>
              </h3>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                Platform web <strong>FSVA.my.id</strong> ini dikembangkan secara mandiri oleh seorang Analis Ketahanan Pangan sebagai inisiatif independen. Sistem ini <strong>tidak terafiliasi dengan instansi pemerintah maupun lembaga resmi manapun</strong>.
              </p>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                Pengembangan aplikasi ini ditujukan semata-mata sebagai sarana bantu teknis untuk mendukung sesama Analis Ketahanan Pangan dan praktisi di daerah dalam menyusun, mengkalkulasi, serta memvisualisasikan Peta Ketahanan dan Kerentanan Pangan (FSVA) secara lebih efisien, akurat, serta mempersingkat waktu kerja dalam pembuatan peta FSVA.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/" className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
              Kembali ke Beranda
            </Link>
            <Link href="/map" className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm">
              Lihat Peta Interaktif
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
