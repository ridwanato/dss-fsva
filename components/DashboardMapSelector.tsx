'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, MapPin, AlertCircle, BarChart3 } from 'lucide-react';

interface DashboardMapSelectorProps {
  maps: string[];
  currentKabupaten?: string;
  variant?: 'full' | 'inline';
}

export default function DashboardMapSelector({ maps, currentKabupaten, variant = 'full' }: DashboardMapSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMaps = maps.filter(map =>
    map.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (mapName: string) => {
    setIsOpen(false);
    setSearch('');
    router.push(`/dashboard?kabupaten=${encodeURIComponent(mapName)}`);
  };

  if (variant === 'inline') {
    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm shadow-sm transition-all cursor-pointer select-none"
        >
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>{currentKabupaten || 'Pilih Peta...'}</span>
          <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Search Box */}
            <div className="px-3 pb-2 pt-1 border-b border-slate-100">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari peta..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 transition-colors text-slate-800"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar pt-1">
              {filteredMaps.length > 0 ? (
                filteredMaps.map((mapName, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(mapName)}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer ${
                      mapName === currentKabupaten ? 'bg-emerald-50/50 text-emerald-700 font-bold' : 'text-slate-700 font-medium'
                    }`}
                  >
                    {mapName}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-slate-400 italic text-center">Peta tidak ditemukan</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Page Variant (Notification card when "semua peta" / no map is selected)
  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <BarChart3 className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 mb-3">Pilih Peta Terlebih Dahulu</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed max-w-sm">
          Grafik analisis komposit dan indikator hanya dapat ditampilkan per kabupaten/kota. Silakan pilih salah satu peta tersimpan di bawah ini.
        </p>

        {/* Custom Searchable Dropdown */}
        <div className="relative w-full max-w-xs" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-2xl shadow-sm transition-all cursor-pointer select-none text-sm"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4.5 h-4.5 text-emerald-600" />
              <span>{currentKabupaten || 'Pilih Kabupaten / Kota...'}</span>
            </div>
            <ChevronDown className="w-4.5 h-4.5 text-slate-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {isOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl py-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Search Box */}
              <div className="px-4 pb-2.5 pt-1 border-b border-slate-100">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama kabupaten/kota..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors text-slate-800"
                  />
                </div>
              </div>

              {/* List */}
              <div className="max-h-60 overflow-y-auto custom-scrollbar pt-2">
                {filteredMaps.length > 0 ? (
                  filteredMaps.map((mapName, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(mapName)}
                      className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      {mapName}
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-4 text-sm text-slate-400 italic text-center">Peta tidak ditemukan</div>
                )}
              </div>
            </div>
          )}
        </div>

        {maps.length === 0 && (
          <div className="mt-6 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200/50 text-xs font-medium text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Belum ada data peta di sistem. Silakan ke menu <a href="/entry" className="underline font-bold hover:text-amber-800">Data Entry</a> untuk mengunggah berkas.</span>
          </div>
        )}
      </div>
    </div>
  );
}
