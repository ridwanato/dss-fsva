'use client';
import { useState } from 'react';
import { ChevronUp, ChevronDown, Layers, BarChart2, Zap, Beef, Warehouse, TrendingDown, DollarSign, Activity, GraduationCap, Droplet, Utensils, Baby, ChevronRight } from 'lucide-react';

export const LAYERS = [
  { id: 'prioritas', label: 'Komposit', icon: Layers },
  { id: 'p_ncpr', label: 'Rasio Ketersediaan (NCPR)', icon: BarChart2 },
  { id: 'p_energy', label: '% Ketersediaan Energi', icon: Zap },
  { id: 'p_protein', label: '% Ketersediaan Protein Hewani', icon: Beef },
  { id: 'p_cadangan', label: 'Rasio Cadangan Pangan', icon: Warehouse },
  { id: 'p_poverty', label: '% Penduduk Miskin', icon: TrendingDown },
  { id: 'p_cv_harga', label: 'CV Harga Bapok', icon: DollarSign },
  { id: 'p_pou', label: 'Proporsi Penduduk < Energi (PoU)', icon: Activity },
  { id: 'p_sekolah', label: 'Lama Sekolah Perempuan', icon: GraduationCap },
  { id: 'p_air', label: '% Rumah Tangga Tanpa Air Bersih', icon: Droplet },
  { id: 'p_pph', label: 'Skor Pola Pangan Harapan (PPH)', icon: Utensils },
  { id: 'p_stunting', label: 'Prevalensi Stunting', icon: Baby },
];

interface LayerPanelProps {
  activeLayer: string;
  setActiveLayer: (id: string) => void;
  opacity: number;
  setOpacity: (val: number) => void;
  showLabels: boolean;
  setShowLabels: (val: boolean) => void;
  children?: React.ReactNode;
}

export default function LayerPanel({
  activeLayer, setActiveLayer, opacity, setOpacity, showLabels, setShowLabels, children
}: LayerPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute top-16 left-4 z-20 w-[280px] md:w-80 glass-card rounded-xl overflow-hidden flex flex-col pointer-events-auto transition-all duration-300 border-none">
      
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">Pilih Layer Peta:</span>
        {expanded ? <ChevronUp className="w-6 h-6 text-white font-black" strokeWidth={3} /> : <ChevronDown className="w-6 h-6 text-white font-black" strokeWidth={3} />}
      </div>

      <div className={`transition-all duration-300 ${expanded ? 'max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-140px)] opacity-100 flex flex-col' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        
        {/* White Section: Title & Controls */}
        <div className="bg-white/80 backdrop-blur px-4 md:px-5 py-4 shrink-0 border-b border-[rgba(109,94,245,0.15)]">
          
          {/* Title & Buttons Row */}
          <div className="flex justify-between items-start gap-2 mb-4">
            <div>
              <h1 className="text-lg font-black text-[#1E1B4B] tracking-tight leading-tight">
                Peta FSVA 2026 <br/><span className="text-xs font-semibold text-slate-500">(basis data 2025)</span>
              </h1>
              <p className="text-[9px] font-extrabold text-[#6D5EF5] mt-1 uppercase tracking-wider">11 Indikator Kab/Kota</p>
            </div>
            
            {/* Buttons Slot */}
            <div className="flex flex-col gap-1.5 shrink-0">
              {children}
            </div>
          </div>
          
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Transparansi Peta</span>
                <span className="text-gray-400">{opacity}%</span>
              </label>
              <div className="relative flex items-center h-1.5 bg-gray-200 rounded-full">
                <div className="absolute h-full bg-[#6D5EF5] rounded-full" style={{ width: `${opacity}%` }}></div>
                <input 
                  type="range" min="0" max="100" 
                  value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute h-3 w-3 bg-white border-2 border-[#6D5EF5] rounded-full pointer-events-none shadow-sm"
                  style={{ left: `calc(${opacity}% - 6px)` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 border-l pl-3 border-[rgba(109,94,245,0.15)]">
              <label className="text-[8px] font-bold text-gray-500 uppercase text-right leading-tight">Nama<br/>Desa</label>
              <button 
                onClick={() => setShowLabels(!showLabels)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${showLabels ? 'bg-[#6D5EF5]' : 'bg-gray-300'}`}
              >
                <span className={`absolute left-1 text-[7px] font-black text-white ${showLabels ? 'opacity-100' : 'opacity-0'}`}>ON</span>
                <span className={`absolute z-10 inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showLabels ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Purple Section: Layers List (Scrollable) */}
        <div className="bg-white/60 backdrop-blur flex-1 overflow-y-auto">
          <ul className="flex flex-col py-1">
            {LAYERS.map(layer => {
              const Icon = layer.icon;
              const isActive = activeLayer === layer.id;
              return (
                <li key={layer.id}>
                  <button
                    onClick={() => setActiveLayer(layer.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${isActive ? 'bg-[#6D5EF5] text-white' : 'hover:bg-[#F5F3FF] text-[#1E1B4B]'}`}
                  >
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${isActive ? 'border-white/30 bg-white/10' : 'border-[#6D5EF5]/20 bg-white'}`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6D5EF5]'}`} />
                    </div>
                    <span className={`flex-1 text-xs font-semibold tracking-wide`}>
                      {layer.label}
                    </span>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-white/50' : 'text-slate-300'}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

      </div>
    </div>
  );
}
