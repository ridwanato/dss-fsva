import { useState } from 'react';
import { PRIORITY_LABELS } from '@/lib/fsva/constants';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function LegendPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const priorities = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div className="absolute bottom-12 md:bottom-6 right-4 md:right-6 z-20 w-48 md:w-64 flex flex-col pointer-events-auto transition-all duration-300 shadow-xl rounded-t-lg bg-white overflow-hidden">
      
      {/* Expanded Content (Expands UPWARDS) */}
      <div className={`transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 py-4 pb-2 bg-white">
          <div className="flex flex-col gap-2.5">
            {priorities.map(p => (
              <div key={p} className="flex items-center gap-3">
                <div 
                  className="w-5 h-5 rounded flex-shrink-0"
                  style={{ backgroundColor: PRIORITY_LABELS[p].fill }}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800 leading-none">Prioritas {p}</span>
                  <span className="text-[9px] text-gray-500 leading-tight mt-0.5">{PRIORITY_LABELS[p].label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header (Always visible, Purple background, at bottom) */}
      <div 
        className="px-4 py-2 flex justify-between items-center cursor-pointer transition-colors"
        style={{ backgroundColor: '#6b4c9a' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Legenda</h3>
        {isOpen ? (
          <ChevronDown className="w-6 h-6 text-white font-black" strokeWidth={3} />
        ) : (
          <ChevronUp className="w-6 h-6 text-white font-black" strokeWidth={3} />
        )}
      </div>
      
    </div>
  );
}
