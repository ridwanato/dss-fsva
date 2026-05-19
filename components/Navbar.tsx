'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [maps, setMaps] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    fetch('/api/maps')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.maps) {
          setMaps(data.maps);
        }
      })
      .catch(console.error);
      
    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="absolute top-0 left-0 z-[60] pointer-events-none no-print">
      <nav className="inline-flex bg-white shadow-md border-b border-r border-gray-200 rounded-br-2xl h-12 md:h-16 items-center pointer-events-auto transition-all duration-300 overflow-visible">
        
        {/* Brand Button */}
        <div 
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 md:px-6 cursor-pointer hover:bg-gray-50 transition-colors h-full"
        >
          <div className="w-6 h-6 md:w-8 md:h-8 bg-green-600 rounded flex items-center justify-center text-white font-black text-sm md:text-xl">
            F
          </div>
          <span className="font-bold text-sm md:text-xl text-gray-800 tracking-tight whitespace-nowrap">DSS FSVA</span>
        </div>

        {/* Links (Expandable) */}
        <div className={`flex items-center space-x-1.5 md:space-x-6 md:whitespace-nowrap transition-all duration-300 ${expanded ? 'max-w-[350px] sm:max-w-[450px] px-2 md:px-4 opacity-100' : 'max-w-0 px-0 opacity-0'} md:max-w-[600px] md:px-8 md:opacity-100`}>
          <Link href="/map" className={`border-b-2 text-[10px] md:text-sm leading-tight text-center font-semibold transition-colors px-1 py-2 md:py-5 ${isActive('/map') ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-300'}`}>
            Peta<br className="md:hidden" />Interaktif
          </Link>
          <Link href="/dashboard" className={`border-b-2 text-[10px] md:text-sm leading-tight text-center font-semibold transition-colors px-1 py-2 md:py-5 ${isActive('/dashboard') ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-300'}`}>
            Dashboard
          </Link>
          <Link href="/entry" className={`border-b-2 text-[10px] md:text-sm leading-tight text-center font-semibold transition-colors px-1 py-2 md:py-5 ${isActive('/entry') ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-300'}`}>
            Data<br className="md:hidden" />Entry
          </Link>
          
          {/* Dropdown Peta Tersimpan */}
          <div className="relative h-full flex items-center" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 text-[10px] md:text-sm leading-tight font-semibold text-gray-500 hover:text-green-700 px-1 py-2 md:py-5 border-b-2 border-transparent"
            >
              Peta<br className="md:hidden" />Tersimpan <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-xl rounded-lg border border-gray-100 py-2 z-50 overflow-hidden">
                <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">Daftar Peta</div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {maps.length > 0 ? maps.map((kab, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push(`/map?kabupaten=${encodeURIComponent(kab)}`);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors font-medium truncate"
                    >
                      {kab}
                    </button>
                  )) : (
                    <div className="px-4 py-2 text-xs text-gray-500 italic">Belum ada peta</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </nav>
    </div>
  );
}
