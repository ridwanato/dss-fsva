import { PRIORITY_LABELS } from '@/lib/fsva/constants';
import { X } from 'lucide-react';

interface InfoPanelProps {
  data: any;
  onClose: () => void;
}

export default function InfoPanel({ data, onClose }: InfoPanelProps) {
  if (!data) return null;

  const prio = data.prioritas as keyof typeof PRIORITY_LABELS;
  const label = PRIORITY_LABELS[prio]?.label || 'N/A';
  const color = PRIORITY_LABELS[prio]?.fill || '#999';

  const indicators = [
    { key: 'ncpr', name: 'NCPR (Rasio Konsumsi)', val: data.ncpr?.toFixed(2), p: data.p_ncpr },
    { key: 'ake', name: '% Ketersediaan Energi', val: data.pct_ake?.toFixed(1) + '%', p: data.p_energy },
    { key: 'prohe', name: '% Protein Hewani', val: data.pct_prohe?.toFixed(1) + '%', p: data.p_protein },
    { key: 'cadangan', name: 'Rasio Cadangan (kg/kap)', val: data.rasio_cadangan?.toFixed(2), p: data.p_cadangan },
    { key: 'miskin', name: '% Penduduk Miskin', val: data.pct_miskin_ref?.toFixed(1) + '%', p: data.p_poverty },
    { key: 'cv_harga', name: 'CV Harga Pangan', val: data.cv_harga?.toFixed(2) + '%', p: data.p_cv_harga },
    { key: 'pou', name: 'Prevalence of Undernourishment', val: data.pou?.toFixed(1) + '%', p: data.p_pou },
    { key: 'sekolah', name: 'Lama Sekolah Perempuan', val: data.lama_sekolah?.toFixed(1) + ' thn', p: data.p_sekolah },
    { key: 'air', name: '% RT Tanpa Air Bersih', val: data.pct_no_water?.toFixed(1) + '%', p: data.p_air },
    { key: 'pph', name: 'Skor PPH', val: data.skor_pph?.toFixed(1), p: data.p_pph },
    { key: 'stunting', name: 'Prevalensi Stunting', val: data.pct_stunting?.toFixed(1) + '%', p: data.p_stunting },
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full md:w-80 md:bottom-auto md:top-6 md:left-6 bg-white/95 backdrop-blur-md rounded-t-2xl md:rounded-xl shadow-2xl border border-gray-200 z-30 flex flex-col max-h-[60vh] md:max-h-[90vh] overflow-hidden transition-all pb-safe">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-start" style={{ borderBottomColor: color }}>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{data.nama_desa}</h2>
          <p className="text-xs text-gray-500 uppercase">{data.nama_kecamatan}, {data.nama_kabupaten}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Composite Score */}
        <div className="mb-6 bg-gray-50 rounded-lg p-3 text-center border">
          <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Hasil Akhir</div>
          <div className="text-3xl font-black" style={{ color }}>Prioritas {data.prioritas}</div>
          <div className="text-sm font-medium mt-1" style={{ color }}>{label}</div>
          <div className="mt-2 text-xs bg-white py-1 rounded shadow-sm border inline-block px-3">
            Indeks Komposit: <span className="font-bold">{data.indeks_komposit?.toFixed(2)}</span>
          </div>
        </div>

        {/* Aspects */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-blue-50 p-2 rounded text-center border border-blue-100">
            <div className="text-[10px] text-blue-600 font-semibold mb-1">Ketersediaan</div>
            <div className="text-sm font-bold text-blue-800">{data.indeks_ketersediaan?.toFixed(1)}</div>
          </div>
          <div className="bg-amber-50 p-2 rounded text-center border border-amber-100">
            <div className="text-[10px] text-amber-600 font-semibold mb-1">Keterjangkauan</div>
            <div className="text-sm font-bold text-amber-800">{data.indeks_keterjangkauan?.toFixed(1)}</div>
          </div>
          <div className="bg-emerald-50 p-2 rounded text-center border border-emerald-100">
            <div className="text-[10px] text-emerald-600 font-semibold mb-1">Pemanfaatan</div>
            <div className="text-sm font-bold text-emerald-800">{data.indeks_pemanfaatan?.toFixed(1)}</div>
          </div>
        </div>

        {/* Indicators List */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">11 Indikator FSVA</h3>
          <div className="space-y-2">
            {indicators.map((ind, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="text-xs text-gray-700">{ind.name}</div>
                  <div className="text-xs font-semibold text-gray-900">{ind.val ?? '-'}</div>
                </div>
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs shadow-sm"
                  style={{ backgroundColor: PRIORITY_LABELS[ind.p as keyof typeof PRIORITY_LABELS]?.fill || '#ccc' }}
                  title={`Prioritas ${ind.p}`}
                >
                  {ind.p || '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
