import Link from 'next/link';
import { Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function IndikatorFsvaPage() {
  const aspekListKabKota = [
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

  const aspekListProvinsi = [
    {
      title: '1. Aspek Ketersediaan Pangan (Availability)',
      items: [
        'Rasio ketersediaan pangan pokok per kapita (NCPR)',
        'Persentase ketersediaan energi terhadap Angka Kecukupan Energi (AKE)',
        'Persentase ketersediaan protein hewani terhadap Angka Kecukupan Protein (AKP)',
        'Stok cadangan pangan pemerintah daerah (Provinsi, Kab/Kota, Kecamatan)'
      ]
    },
    {
      title: '2. Aspek Keterjangkauan Pangan (Accessibility)',
      items: [
        'Persentase penduduk di bawah garis kemiskinan',
        'Prevalence of Undernourishment (PoU / Proporsi Penduduk Kurang Gizi)',
        'Koefisien Variasi (CV) harga bahan pangan pokok utama'
      ]
    },
    {
      title: '3. Aspek Pemanfaatan Pangan (Utilization)',
      items: [
        'Persentase rumah tangga tanpa akses air minum layak',
        'Rata-rata lama sekolah perempuan (usia >= 15 tahun)',
        'Persentase keamanan pangan segar (%) & keamanan pangan siap saji (%)',
        'Skor Pola Pangan Harapan (PPH) konsumsi pangan',
        'Prevalensi balita stunting (pendek & sangat pendek)'
      ]
    }
  ];

  return (
    <div className="flex-1 bg-transparent py-12 pt-24 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        
        {/* Header Main Card */}
        <div className="glass-card p-8 rounded-3xl border border-green-100/50 shadow-xl bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
              <Layers className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 leading-tight">Indikator FSVA</h1>
              <p className="text-sm text-slate-500 font-medium">Petunjuk Indikator Ketahanan Pangan Tingkat Kabupaten/Kota &amp; Provinsi</p>
            </div>
          </div>
          
          <p className="text-sm md:text-base text-slate-650 leading-relaxed mb-6">
            Penentuan kerentanan dan ketahanan pangan wilayah dianalisis menggunakan indikator spesifik yang terbagi ke dalam 3 aspek pilar ketahanan pangan (Ketersediaan, Keterjangkauan, dan Pemanfaatan Pangan) sesuai Petunjuk Teknis Badan Pangan Nasional.
          </p>

          {/* Section 1: 11 Indikator FSVA Kab/Kota */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black">11</span>
                <span>11 Indikator FSVA Kab/Kota</span>
              </h2>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                Tingkat Desa/Kelurahan
              </span>
            </div>

            <div className="space-y-4">
              {aspekListKabKota.map((aspek, i) => (
                <div key={i} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70">
                  <h3 className="font-bold text-emerald-950 text-sm md:text-base mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{aspek.title}</span>
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-slate-700 font-medium">
                    {aspek.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: 12 Indikator FSVA Provinsi */}
          <div className="space-y-4 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black">12</span>
                <span>12 Indikator FSVA Provinsi</span>
              </h2>
              <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full border border-indigo-200">
                Tingkat Kecamatan
              </span>
            </div>

            <div className="space-y-4">
              {aspekListProvinsi.map((aspek, i) => (
                <div key={i} className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100">
                  <h3 className="font-bold text-indigo-950 text-sm md:text-base mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{aspek.title}</span>
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-slate-700 font-medium">
                    {aspek.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
            <Link href="/metodologi-fsva" className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-center">
              Pernyataan Independensi &amp; Metodologi
            </Link>
            <Link href="/" className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm text-center">
              Kembali ke Beranda
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
