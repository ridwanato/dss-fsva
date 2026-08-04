'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronUp, ChevronDown, Layers, BarChart2, Zap, Beef, 
  Warehouse, TrendingDown, DollarSign, Activity, GraduationCap, 
  Droplet, Utensils, Baby, ChevronRight, ShieldCheck 
} from 'lucide-react';

export const getLayersForLevel = (level: 'kab_kota' | 'provinsi') => {
  const base = [
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
  ];

  if (level === 'provinsi') {
    return [
      ...base,
      { id: 'p_food_safety', label: 'Keamanan Pangan', icon: ShieldCheck },
      { id: 'p_pph', label: 'Skor Pola Pangan Harapan (PPH)', icon: Utensils },
      { id: 'p_stunting', label: 'Prevalensi Stunting', icon: Baby },
    ];
  } else {
    return [
      ...base,
      { id: 'p_pph', label: 'Skor Pola Pangan Harapan (PPH)', icon: Utensils },
      { id: 'p_stunting', label: 'Prevalensi Stunting', icon: Baby },
    ];
  }
};

interface LayerPanelProps {
  activeLayer: string;
  setActiveLayer: (id: string) => void;
  opacity: number;
  setOpacity: (val: number) => void;
  showLabels: boolean;
  setShowLabels: (val: boolean) => void;
  showDistrictLabels?: boolean;
  setShowDistrictLabels?: (val: boolean) => void;
  children?: React.ReactNode;
  level: 'kab_kota' | 'provinsi';
  onLevelChange: (lvl: 'kab_kota' | 'provinsi') => void;
}

export default function LayerPanel({
  activeLayer, setActiveLayer, opacity, setOpacity, 
  showLabels, setShowLabels, showDistrictLabels = true, setShowDistrictLabels, children, level, onLevelChange
}: LayerPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleNavbarExpand = () => {
      setExpanded(false);
    };
    window.addEventListener('navbar-expand', handleNavbarExpand);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('navbar-expand', handleNavbarExpand);
    };
  }, []);

  const toggleExpand = (val: boolean) => {
    setExpanded(val);
    if (val) {
      window.dispatchEvent(new CustomEvent('layerpanel-expand'));
    }
  };

  const layersList = getLayersForLevel(level);

  if (isMobile) {
    if (!expanded) {
      return (
        <div 
          onClick={() => toggleExpand(true)}
          className="fixed top-3 left-3 z-40 px-3 py-2 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#0e4434] to-[#10b981] text-white shadow-xl border border-emerald-500/40 rounded-xl cursor-pointer pointer-events-auto text-xs font-black select-none no-print hover:opacity-95 transition-all"
        >
          <Layers className="w-4 h-4 text-emerald-200" />
          <span>LAYER</span>
        </div>
      );
    }

    return (
      <div className="fixed top-3 left-3 z-40 w-[280px] max-h-[85vh] flex flex-col bg-[#08291f] border border-emerald-500/30 shadow-2xl rounded-2xl overflow-hidden pointer-events-auto no-print animate-in slide-in-from-left-2 fade-in duration-200 text-white">
        
        {/* Dark Emerald Header */}
        <div 
          className="bg-gradient-to-r from-[#08291f] to-[#0e4434] border-b border-emerald-500/20 px-4 py-3 flex justify-between items-center cursor-pointer gap-2"
          onClick={() => toggleExpand(false)}
        >
          <span className="text-[11px] font-bold text-white uppercase tracking-widest whitespace-normal break-words flex-1">Pilih Layer Peta dan Cetak PDF</span>
          <ChevronUp className="w-5 h-5 text-emerald-300 font-black" strokeWidth={3} />
        </div>

        {/* Dark Emerald Controls Container */}
        <div className="bg-[#08291f]/95 backdrop-blur px-4 py-3 shrink-0 border-b border-emerald-500/20">
          {/* Level Toggle Buttons */}
          <div className="flex bg-[#051f17] p-1 rounded-xl mb-3 border border-emerald-500/30 pointer-events-auto">
            <button
              onClick={() => onLevelChange('kab_kota')}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                level === 'kab_kota'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-300/60 hover:text-white'
              }`}
            >
              KAB KOTA
            </button>
            <button
              onClick={() => onLevelChange('provinsi')}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                level === 'provinsi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-300/60 hover:text-white'
              }`}
            >
              PROVINSI
            </button>
          </div>

          {/* Title & Buttons Row */}
          <div className="flex justify-between items-start gap-2 mb-3">
            <div>
              <h1 className="text-sm font-black text-white tracking-tight leading-tight">
                Peta FSVA 2026 <br/><span className="text-[10px] font-semibold text-emerald-300/70">(basis data 2025)</span>
              </h1>
              <p className="text-[8px] font-extrabold text-[#34d399] mt-0.5 uppercase tracking-wider">
                {level === 'provinsi' ? '12 Indikator Provinsi' : '11 Indikator Kab/Kota'}
              </p>
            </div>
            
            {/* Buttons Slot */}
            <div className="flex flex-col gap-1 shrink-0">
              {children}
            </div>
          </div>
          
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex-1">
              <label className="text-[8px] font-bold text-emerald-200/80 uppercase tracking-wider mb-1 flex justify-between">
                <span>Transparansi Peta</span>
                <span className="text-emerald-400">{opacity}%</span>
              </label>
              <div className="relative flex items-center h-1.5 bg-[#051f17] rounded-full border border-emerald-500/20">
                <div className="absolute h-full bg-[#10b981] rounded-full" style={{ width: `${opacity}%` }}></div>
                <input 
                  type="range" min="0" max="100" 
                  value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute h-3 w-3 bg-white border-2 border-[#10b981] rounded-full pointer-events-none shadow-sm"
                  style={{ left: `calc(${opacity}% - 6px)` }}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1 border-l pl-2 border-emerald-500/20 shrink-0">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[7.5px] font-bold text-emerald-200/90 uppercase leading-none whitespace-nowrap">Nama Desa</span>
                <button 
                  onClick={() => setShowLabels(!showLabels)}
                  className={`relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors ${showLabels ? 'bg-[#10b981]' : 'bg-emerald-950 border border-emerald-500/30'}`}
                >
                  <span className={`absolute left-0.5 text-[5px] font-black text-white ${showLabels ? 'opacity-100' : 'opacity-0'}`}>ON</span>
                  <span className={`absolute z-10 inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow transition-transform ${showLabels ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[7.5px] font-bold text-emerald-200/90 uppercase leading-none whitespace-nowrap">Nama Kecamatan</span>
                <button 
                  onClick={() => setShowDistrictLabels && setShowDistrictLabels(!showDistrictLabels)}
                  className={`relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors ${showDistrictLabels ? 'bg-[#10b981]' : 'bg-emerald-950 border border-emerald-500/30'}`}
                >
                  <span className={`absolute left-0.5 text-[5px] font-black text-white ${showDistrictLabels ? 'opacity-100' : 'opacity-0'}`}>ON</span>
                  <span className={`absolute z-10 inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow transition-transform ${showDistrictLabels ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Layers List */}
        <div className="bg-[#05241a]/95 backdrop-blur flex-1 overflow-y-auto max-h-[50vh]">
          <ul className="flex flex-col py-1">
            {layersList.map(layer => {
              const Icon = layer.icon;
              const isActive = activeLayer === layer.id;
              return (
                <li key={layer.id}>
                  <button
                    onClick={() => {
                      setActiveLayer(layer.id);
                      toggleExpand(false); // Collapse on selection in mobile
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${
                      isActive 
                        ? 'bg-[#10b981] text-white font-bold shadow-md' 
                        : 'hover:bg-[#0e4434]/60 text-emerald-100/90 hover:text-white'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      isActive ? 'border-white/40 bg-white/20' : 'border-emerald-500/30 bg-emerald-950/40'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                    </div>
                    <span className={`flex-1 text-[11px] tracking-wide ${isActive ? 'font-black' : 'font-medium'}`}>
                      {layer.label}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white/80' : 'text-emerald-500/40'}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  // Desktop Rendering
  return (
    <div className="absolute top-4 left-4 z-20 w-[280px] md:w-80 rounded-2xl overflow-hidden flex flex-col pointer-events-auto transition-all duration-300 border border-emerald-500/30 shadow-2xl bg-[#08291f] text-white">
      
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-[#08291f] to-[#0e4434] border-b border-emerald-500/20 px-4 py-3 flex justify-between items-center cursor-pointer gap-2"
        onClick={() => toggleExpand(!expanded)}
      >
        <span className="text-[11px] font-bold text-white uppercase tracking-widest whitespace-normal break-words flex-1">Pilih Layer Peta dan Cetak PDF</span>
        {expanded ? <ChevronUp className="w-5 h-5 text-emerald-300 font-black" strokeWidth={3} /> : <ChevronDown className="w-5 h-5 text-emerald-300 font-black" strokeWidth={3} />}
      </div>

      <div className={`transition-all duration-300 ${expanded ? 'max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-140px)] opacity-100 flex flex-col' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        
        {/* Controls Container */}
        <div className="bg-[#08291f]/95 backdrop-blur px-4 md:px-5 py-4 shrink-0 border-b border-emerald-500/20">
          {/* Level Toggle Buttons */}
          <div className="flex bg-[#051f17] p-1 rounded-xl mb-3 border border-emerald-500/30 pointer-events-auto">
            <button
              onClick={() => onLevelChange('kab_kota')}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                level === 'kab_kota'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-300/60 hover:text-white'
              }`}
            >
              KAB KOTA
            </button>
            <button
              onClick={() => onLevelChange('provinsi')}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                level === 'provinsi'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-300/60 hover:text-white'
              }`}
            >
              PROVINSI
            </button>
          </div>

          {/* Title & Buttons Row */}
          <div className="flex justify-between items-start gap-2 mb-4">
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-tight">
                Peta FSVA 2026 <br/><span className="text-xs font-semibold text-emerald-300/70">(basis data 2025)</span>
              </h1>
              <p className="text-[9px] font-extrabold text-[#34d399] mt-1 uppercase tracking-wider">
                {level === 'provinsi' ? '12 Indikator Provinsi' : '11 Indikator Kab/Kota'}
              </p>
            </div>
            
            {/* Buttons Slot */}
            <div className="flex flex-col gap-1.5 shrink-0">
              {children}
            </div>
          </div>
          
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-[9px] font-bold text-emerald-200/80 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Transparansi Peta</span>
                <span className="text-emerald-400">{opacity}%</span>
              </label>
              <div className="relative flex items-center h-1.5 bg-[#051f17] rounded-full border border-emerald-500/20">
                <div className="absolute h-full bg-[#10b981] rounded-full" style={{ width: `${opacity}%` }}></div>
                <input 
                  type="range" min="0" max="100" 
                  value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute h-3 w-3 bg-white border-2 border-[#10b981] rounded-full pointer-events-none shadow-sm"
                  style={{ left: `calc(${opacity}% - 6px)` }}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 border-l pl-3 border-emerald-500/20 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[8px] font-bold text-emerald-200/90 uppercase leading-none whitespace-nowrap">Nama Desa</span>
                <button 
                  onClick={() => setShowLabels(!showLabels)}
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${showLabels ? 'bg-[#10b981]' : 'bg-emerald-950 border border-emerald-500/30'}`}
                >
                  <span className={`absolute left-0.5 text-[6px] font-black text-white ${showLabels ? 'opacity-100' : 'opacity-0'}`}>ON</span>
                  <span className={`absolute z-10 inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${showLabels ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[8px] font-bold text-emerald-200/90 uppercase leading-none whitespace-nowrap">Nama Kecamatan</span>
                <button 
                  onClick={() => setShowDistrictLabels && setShowDistrictLabels(!showDistrictLabels)}
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${showDistrictLabels ? 'bg-[#10b981]' : 'bg-emerald-950 border border-emerald-500/30'}`}
                >
                  <span className={`absolute left-0.5 text-[6px] font-black text-white ${showDistrictLabels ? 'opacity-100' : 'opacity-0'}`}>ON</span>
                  <span className={`absolute z-10 inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${showDistrictLabels ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Layers List */}
        <div className="bg-[#05241a]/95 backdrop-blur flex-1 overflow-y-auto">
          <ul className="flex flex-col py-1">
            {layersList.map(layer => {
              const Icon = layer.icon;
              const isActive = activeLayer === layer.id;
              return (
                <li key={layer.id}>
                  <button
                    onClick={() => setActiveLayer(layer.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      isActive 
                        ? 'bg-[#10b981] text-white font-bold shadow-md' 
                        : 'hover:bg-[#0e4434]/60 text-emerald-100/90 hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                      isActive ? 'border-white/40 bg-white/20' : 'border-emerald-500/30 bg-emerald-950/40'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                    </div>
                    <span className={`flex-1 text-xs tracking-wide ${isActive ? 'font-black' : 'font-medium'}`}>
                      {layer.label}
                    </span>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-white/80' : 'text-emerald-500/40'}`} />
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
