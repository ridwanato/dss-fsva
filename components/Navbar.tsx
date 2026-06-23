'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [maps, setMaps] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetch('/api/maps')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.maps) {
          setMaps(data.maps);
        }
      })
      .catch(console.error);
      
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleLayerExpand = () => {
      setExpanded(false);
    };
    window.addEventListener('layerpanel-expand', handleLayerExpand);

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('layerpanel-expand', handleLayerExpand);
      document.removeEventListener("mousedown", handleClickOutside);
      subscription.unsubscribe();
    };
  }, []);

  const toggleExpand = (val: boolean) => {
    setExpanded(val);
    if (val) {
      window.dispatchEvent(new CustomEvent('navbar-expand'));
    }
  };

  if (isMobile) {
    if (!expanded) {
      return (
        <div 
          onClick={() => toggleExpand(true)}
          className="fixed top-3 right-3 z-50 w-20 h-10 flex items-center justify-center bg-white/95 border border-[rgba(109,94,245,0.15)] shadow-md rounded-xl cursor-pointer pointer-events-auto text-xs font-bold text-[#1E1B4B] uppercase tracking-wider select-none no-print"
        >
          MENU
        </div>
      );
    }

    return (
      <div className="fixed top-3 right-3 left-3 z-50 flex flex-col bg-white/95 backdrop-blur-md border border-[rgba(109,94,245,0.15)] shadow-lg rounded-2xl p-4 pointer-events-auto max-h-[85vh] overflow-y-auto no-print animate-in slide-in-from-top-2 fade-in duration-200">
        <div className="flex items-center justify-between border-b pb-2 border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] rounded-lg flex items-center justify-center text-white font-black text-xs">
              F
            </div>
            <span className="font-bold text-sm text-[#1E1B4B]">DSS FSVA</span>
          </div>
          <button 
            onClick={() => toggleExpand(false)} 
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <Link 
            href="/map" 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${isActive('/map') ? 'bg-[#F5F3FF] text-[#5b4ddb]' : 'text-gray-500 hover:bg-[#F5F3FF] hover:text-[#6D5EF5]'}`}
          >
            Peta Interaktif
          </Link>
          <Link 
            href="/dashboard" 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-[#F5F3FF] text-[#5b4ddb]' : 'text-gray-500 hover:bg-[#F5F3FF] hover:text-[#6D5EF5]'}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/entry" 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${isActive('/entry') ? 'bg-[#F5F3FF] text-[#5b4ddb]' : 'text-gray-500 hover:bg-[#F5F3FF] hover:text-[#6D5EF5]'}`}
          >
            Data Entry
          </Link>
          
          <div className="flex flex-col border-t pt-2 border-slate-100 mt-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">Peta Tersimpan</span>
            {maps.length > 0 ? (
              <div className="max-h-32 overflow-y-auto flex flex-col gap-1 pl-2">
                {maps.map((kab, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      toggleExpand(false);
                      router.push(`/map?kabupaten=${encodeURIComponent(kab)}`);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#1E1B4B] hover:bg-[#F5F3FF] hover:text-[#6D5EF5] transition-colors font-medium truncate rounded cursor-pointer"
                  >
                    {kab}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-1 text-xs text-gray-400 italic">Belum ada peta</div>
            )}
          </div>
        </div>

        <div className="border-t pt-3 border-slate-100 flex justify-end mt-3">
          {session ? (
            <button 
              onClick={async () => {
                const { createClient } = await import('@/lib/supabase-client');
                const sb = createClient();
                await sb.auth.signOut();
                setSession(null);
                toggleExpand(false);
                router.push('/login');
              }}
              className="w-full text-center text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Keluar
            </button>
          ) : (
            <Link 
              href="/login"
              onClick={() => toggleExpand(false)}
              className="w-full text-center text-xs font-bold btn-primary py-2 rounded-xl shadow-sm block"
            >
              Masuk / Login
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 z-[60] pointer-events-none no-print">
      <nav className="inline-flex bg-white/85 backdrop-blur-md shadow-[0_4px_20px_rgba(109,94,245,0.08)] border-b border-r border-[rgba(109,94,245,0.15)] rounded-br-2xl h-12 md:h-16 items-center pointer-events-auto transition-all duration-300 overflow-visible">
        
        {/* Brand Button */}
        <div 
          onClick={() => toggleExpand(!expanded)}
          className="flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 md:px-6 cursor-pointer hover:bg-[#F5F3FF] transition-colors h-full rounded-tl-2xl"
        >
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] rounded-lg shadow-[0_2px_10px_rgba(109,94,245,0.25)] flex items-center justify-center text-white font-black text-sm md:text-xl">
            F
          </div>
          <span className="font-bold text-sm md:text-xl text-[#1E1B4B] tracking-tight whitespace-nowrap">DSS FSVA</span>
        </div>

        {/* Links (Expandable) */}
        <div className={`flex items-center space-x-1.5 md:space-x-6 md:whitespace-nowrap transition-all duration-300 ${expanded ? 'max-w-[350px] sm:max-w-[450px] px-2 md:px-4 opacity-100' : 'max-w-0 px-0 opacity-0'} md:max-w-[600px] md:px-8 md:opacity-100`}>
          <Link href="/map" className={`border-b-2 text-[10px] md:text-sm leading-tight text-center font-semibold transition-all px-1 py-2 md:py-5 ${isActive('/map') ? 'border-[#6D5EF5] text-[#5b4ddb]' : 'border-transparent text-gray-500 hover:text-[#6D5EF5] hover:border-[#8B5CF6]'}`}>
            Peta<br className="md:hidden" />Interaktif
          </Link>
          <Link href="/dashboard" className={`border-b-2 text-[10px] md:text-sm leading-tight text-center font-semibold transition-all px-1 py-2 md:py-5 ${isActive('/dashboard') ? 'border-[#6D5EF5] text-[#5b4ddb]' : 'border-transparent text-gray-500 hover:text-[#6D5EF5] hover:border-[#8B5CF6]'}`}>
            Dashboard
          </Link>
          <Link href="/entry" className={`border-b-2 text-[10px] md:text-sm leading-tight text-center font-semibold transition-all px-1 py-2 md:py-5 ${isActive('/entry') ? 'border-[#6D5EF5] text-[#5b4ddb]' : 'border-transparent text-gray-500 hover:text-[#6D5EF5] hover:border-[#8B5CF6]'}`}>
            Data<br className="md:hidden" />Entry
          </Link>
          
          {/* Dropdown Peta Tersimpan */}
          <div className="relative h-full flex items-center" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 text-[10px] md:text-sm leading-tight font-semibold text-gray-500 hover:text-[#6D5EF5] px-1 py-2 md:py-5 border-b-2 border-transparent transition-colors"
            >
              Peta<br className="md:hidden" />Tersimpan <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white/95 backdrop-blur-md shadow-[0_10px_30px_rgba(109,94,245,0.12)] rounded-lg border border-[rgba(109,94,245,0.15)] py-2 z-50 overflow-hidden">
                <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">Daftar Peta</div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {maps.length > 0 ? maps.map((kab, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push(`/map?kabupaten=${encodeURIComponent(kab)}`);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#1E1B4B] hover:bg-[#F5F3FF] hover:text-[#6D5EF5] transition-colors font-medium truncate cursor-pointer"
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

        {/* Auth Button */}
        <div className="ml-auto pr-3 md:pr-6 pointer-events-auto h-full flex items-center">
           {session ? (
             <button 
               onClick={async () => {
                 const { createClient } = await import('@/lib/supabase-client');
                 const sb = createClient();
                 await sb.auth.signOut();
                 setSession(null);
                 router.push('/login');
               }}
               className="text-[10px] md:text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
             >
               Keluar
             </button>
           ) : (
             <Link 
               href="/login"
               className="text-[10px] md:text-xs font-bold btn-primary px-3 py-1.5 rounded-lg shadow-sm"
             >
               Masuk / Login
             </Link>
           )}
        </div>

      </nav>
    </div>
  );
}
