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
    <div className="absolute top-20 right-4 md:bottom-auto md:top-6 md:right-6 w-[70vw] md:w-80 glass-card rounded-xl z-30 flex flex-col max-h-[70vh] md:max-h-[90vh] overflow-hidden transition-all">
      {/* Header */}
      <div className="p-2.5 md:p-4 border-b border-[rgba(109,94,245,0.15)] flex justify-between items-start" style={{ borderBottomColor: color }}>
        <div className="overflow-hidden">
          <h2 className="text-sm md:text-lg font-bold text-[#1E1B4B] truncate">{data.nama_desa}</h2>
          <p className="text-[9px] md:text-xs text-[#6D5EF5] uppercase truncate">{data.nama_kecamatan}</p>
        </div>
        <button onClick={onClose} className="p-1 -mr-1 hover:bg-[#F5F3FF] rounded-full transition-colors shrink-0">
          <X className="w-4 h-4 md:w-5 md:h-5 text-slate-400 hover:text-[#6D5EF5]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-2.5 md:p-4 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Composite Score */}
        <div className="mb-3 md:mb-6 bg-gradient-to-br from-white to-[#F5F3FF] rounded p-2 md:p-3 text-center border border-[rgba(109,94,245,0.15)] shadow-sm">
          <div className="text-[9px] md:text-xs text-slate-500 mb-0.5 font-semibold uppercase tracking-wider">PRIORITAS</div>
          <div className="text-lg md:text-3xl font-black" style={{ color }}>P{data.prioritas}</div>
          <div className="text-[10px] md:text-sm font-medium leading-tight" style={{ color }}>{label}</div>
          <div className="mt-1 md:mt-2 text-[9px] md:text-xs bg-white py-0.5 md:py-1 rounded shadow-sm border border-[rgba(109,94,245,0.1)] inline-block px-2">
            IKP: <span className="font-bold">{data.indeks_komposit?.toFixed(2)}</span>
          </div>
        </div>

        {/* Aspects */}
        <div className="grid grid-cols-3 gap-1 md:gap-2 mb-3 md:mb-6">
          <div className="bg-blue-50 p-1 md:p-2 rounded text-center border border-blue-100 flex flex-col justify-center">
            <div className="text-[7px] md:text-[9px] text-blue-600 font-bold mb-0.5 md:mb-1 leading-tight whitespace-normal min-h-[20px] flex items-center justify-center">Ketersediaan Pangan</div>
            <div className="text-[10px] md:text-sm font-bold text-blue-800">{data.indeks_ketersediaan?.toFixed(1)}</div>
          </div>
          <div className="bg-amber-50 p-1 md:p-2 rounded text-center border border-amber-100 flex flex-col justify-center">
            <div className="text-[7px] md:text-[9px] text-amber-600 font-bold mb-0.5 md:mb-1 leading-tight whitespace-normal min-h-[20px] flex items-center justify-center">Akses Pangan</div>
            <div className="text-[10px] md:text-sm font-bold text-amber-800">{data.indeks_keterjangkauan?.toFixed(1)}</div>
          </div>
          <div className="bg-emerald-50 p-1 md:p-2 rounded text-center border border-emerald-100 flex flex-col justify-center">
            <div className="text-[7px] md:text-[9px] text-emerald-600 font-bold mb-0.5 md:mb-1 leading-tight whitespace-normal min-h-[20px] flex items-center justify-center">Pemanfaatan Pangan</div>
            <div className="text-[10px] md:text-sm font-bold text-emerald-800">{data.indeks_pemanfaatan?.toFixed(1)}</div>
          </div>
        </div>

        {/* Indicators List */}
        <div>
          <h3 className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 md:mb-3">11 Indikator</h3>
          <div className="space-y-1 md:space-y-2">
            {indicators.map((ind, i) => (
              <div key={i} className="flex items-center justify-between py-0.5 md:py-1 border-b border-[rgba(109,94,245,0.1)] last:border-0 hover:bg-[#F5F3FF]/50 transition-colors px-1 rounded-sm">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-[8px] md:text-xs text-slate-600 truncate" title={ind.name}>{ind.name}</div>
                  <div className="text-[9px] md:text-xs font-semibold text-[#1E1B4B]">{ind.val ?? '-'}</div>
                </div>
                <div 
                  className="w-4 h-4 md:w-6 md:h-6 rounded flex items-center justify-center text-white font-bold text-[9px] md:text-xs shadow-sm shrink-0"
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
