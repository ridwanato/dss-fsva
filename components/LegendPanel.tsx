import { PRIORITY_LABELS } from '@/lib/fsva/constants';

export default function LegendPanel() {
  const priorities = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur p-4 rounded-lg shadow-xl border border-gray-200 z-10 w-64">
      <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase border-b pb-2">Legenda FSVA</h3>
      <div className="flex flex-col gap-2">
        {priorities.map(p => (
          <div key={p} className="flex items-center gap-3">
            <div 
              className="w-6 h-6 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: PRIORITY_LABELS[p].fill }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-700">Prioritas {p}</span>
              <span className="text-[10px] text-gray-500 leading-tight">{PRIORITY_LABELS[p].label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t text-[10px] text-gray-400">
        Berdasarkan Juknis Badan Pangan Nasional 2025
      </div>
    </div>
  );
}
