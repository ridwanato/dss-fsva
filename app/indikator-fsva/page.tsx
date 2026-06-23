import Link from 'next/link';
import { Layers } from 'lucide-react';

export default function IndikatorFsvaPage() {
  const aspekList = [
    {
      title: '1. Aspek Ketersediaan Pangan (Availability)',
      items: [
        'Rasio ketersediaan pangan pokok (NCPR)',
        'Persentase ketersediaan energi terhadap kebutuhan minimal (AKE)',
        'Persentase ketersediaan protein hewani terhadap kebutuhan minimal',
        'Rasio cadangan pangan pemerintah daerah / lumbung pangan masyarakat'
      ]
    },
    {
      title: '2. Aspek Keterjangkauan Pangan (Accessibility)',
      items: [
        'Persentase penduduk miskin (Desil 1 + Desil 2)',
        'Prevalence of Undernourishment (PoU / Proporsi Penduduk Kurang Energi)',
        'Koefisien Variasi (CV) harga bahan pangan pokok gabungan'
      ]
    },
    {
      title: '3. Aspek Pemanfaatan Pangan (Utilization)',
      items: [
        'Persentase rumah tangga tanpa akses air bersih',
        'Rata-rata lama sekolah perempuan (tingkat pendidikan ibu)',
        'Skor Pola Pangan Harapan (PPH) konsumsi masyarakat',
        'Prevalensi balita stunting (pendek/sangat pendek)'
      ]
    }
  ];

  return (
    <div className="flex-1 bg-transparent py-12 pt-24 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6">
        <div className="glass-card p-8 rounded-3xl border border-green-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-100">
              <Layers className="text-emerald-600 w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 leading-tight">11 Indikator FSVA</h1>
          </div>
          
          <div className="space-y-6 text-sm md:text-base text-slate-650 leading-relaxed">
            <p>
              Penentuan kerentanan dan ketahanan pangan wilayah desa dianalisis menggunakan <strong>11 Indikator Utama</strong> yang terbagi ke dalam 3 aspek pilar ketahanan pangan:
            </p>
            
            <div className="space-y-6 mt-6">
              {aspekList.map((aspek, i) => (
                <div key={i} className="bg-green-50/30 p-5 rounded-2xl border border-green-100/30">
                  <h3 className="font-bold text-slate-800 text-base mb-3">{aspek.title}</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                    {aspek.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/metodologi-fsva" className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
              Kembali Ke Metodologi
            </Link>
            <Link href="/" className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm">
              Ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
