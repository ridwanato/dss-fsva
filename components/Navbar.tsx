'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [maps, setMaps] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

  const handleDeleteMap = async (e: React.MouseEvent, kabupaten: string) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus peta "${kabupaten}" beserta semua data indikator dan kalkulasinya? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/maps?kabupaten=${encodeURIComponent(kabupaten)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert(`Peta "${kabupaten}" berhasil dihapus.`);
        setMaps(prev => prev.filter(m => m !== kabupaten));
        const params = new URLSearchParams(window.location.search);
        if (params.get('kabupaten') === kabupaten) {
          router.push('/map');
        }
      } else {
        alert(`Gagal menghapus peta: ${data.error}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Terjadi kesalahan saat menghapus peta: ${err.message}`);
    }
  };

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
          className="fixed top-3 right-3 z-50 w-20 h-10 flex items-center justify-center bg-gradient-to-r from-green-700 to-green-500 text-white shadow-md border border-green-500/30 rounded-xl cursor-pointer pointer-events-auto text-xs font-bold uppercase tracking-wider select-none no-print"
        >
          MENU
        </div>
      );
    }

    return (
      <div className="fixed top-3 right-3 left-3 z-50 flex flex-col bg-white/95 backdrop-blur-md border border-green-100 shadow-lg rounded-2xl p-4 pointer-events-auto max-h-[85vh] overflow-y-auto no-print animate-in slide-in-from-top-2 fade-in duration-200">
        <div className="flex items-center justify-between border-b pb-3 border-green-50/50 mb-3 bg-gradient-to-r from-green-800 via-green-700 to-green-500 -mx-4 -mt-4 p-4 rounded-t-2xl text-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white text-green-800 rounded-lg flex items-center justify-center font-black text-xs">
              F
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="font-bold text-xs text-white">FSVA</span>
              <span className="text-[7px] text-emerald-200/90 font-medium mt-0.5">FSVA.my.id</span>
            </div>
          </div>
          <button 
            onClick={() => toggleExpand(false)} 
            className="text-xs font-bold text-emerald-100 hover:text-white px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <Link 
            href="/map" 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${isActive('/map') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            Peta Interaktif
          </Link>
          <Link 
            href="/dashboard" 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/entry" 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${isActive('/entry') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            Data Entry
          </Link>
          
          <div className="flex flex-col border-t pt-2 border-slate-100 mt-1">
            <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider px-3 mb-1.5">Peta Tersimpan</span>
            <div className="max-h-[280px] overflow-y-auto flex flex-col gap-1 pl-2 custom-scrollbar">
              <div className="flex items-center justify-between w-full hover:bg-emerald-50 rounded-lg group">
                <button
                  onClick={() => {
                    toggleExpand(false);
                    router.push('/map');
                  }}
                  className="flex-1 text-left px-3 py-1.5 text-xs text-[#1E1B4B] hover:text-emerald-600 transition-colors font-bold truncate rounded cursor-pointer"
                >
                  Semua Peta
                </button>
              </div>
              {maps.length > 0 ? maps.map((kab, i) => (
                <div key={i} className="flex items-center justify-between w-full hover:bg-emerald-50 rounded-lg group">
                  <button
                    onClick={() => {
                      toggleExpand(false);
                      router.push(`/map?kabupaten=${encodeURIComponent(kab)}`);
                    }}
                    className="flex-1 text-left px-3 py-1.5 text-xs text-[#1E1B4B] hover:text-emerald-600 transition-colors font-medium truncate rounded cursor-pointer"
                  >
                    {kab}
                  </button>
                  {session && (
                    <button
                      onClick={(e) => handleDeleteMap(e, kab)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer pr-3 shrink-0"
                      title="Hapus Peta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )) : (
                <div className="px-3 py-1 text-xs text-gray-400 italic">Belum ada peta</div>
              )}
            </div>
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
      <nav className="inline-flex bg-gradient-to-r from-green-800 via-green-700 to-green-500 shadow-[0_4px_20px_rgba(22,163,74,0.15)] border-b border-r border-green-600/30 rounded-br-2xl h-12 md:h-16 items-center pointer-events-auto transition-all duration-300 overflow-visible text-white">
        
        {/* Brand Button */}
        <div 
          onClick={() => toggleExpand(!expanded)}
          className="flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 md:px-6 cursor-pointer hover:bg-white/10 transition-colors h-full rounded-tl-2xl"
        >
          <div className="w-6 h-6 md:w-8 md:h-8 bg-white text-green-800 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] flex items-center justify-center font-black text-sm md:text-xl">
            F
          </div>
          <div className="flex flex-col justify-center select-none leading-none">
            <span className="font-black text-sm md:text-lg text-white tracking-tight whitespace-nowrap">FSVA</span>
            <span className="text-[8px] md:text-[10px] text-emerald-200/90 font-medium tracking-wide mt-0.5">FSVA.my.id</span>
          </div>
        </div>

        {/* Minimize/Maximize Button */}
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="hidden md:flex flex-shrink-0 items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 text-emerald-100 hover:text-white transition-all border border-emerald-600/50 mr-2 ml-1 cursor-pointer pointer-events-auto shadow-sm"
          title={isMinimized ? "Tampilkan Menu" : "Sembunyikan Menu"}
        >
          {isMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Links (Expandable) */}
        <div className={`flex items-center space-x-1.5 md:space-x-6 md:whitespace-nowrap transition-all duration-300 ${isMinimized ? 'max-w-0 px-0 opacity-0 overflow-hidden pointer-events-none' : 'max-w-[350px] sm:max-w-[450px] md:max-w-[650px] px-2 md:px-8 opacity-100'}`}>
          <Link href="/map" className={`border-b-2 text-[10px] md:text-sm leading-tight text-center font-semibold transition-all px-1 py-2 md:py-5 ${isActive('/map') ? 'border-white text-white' : 'border-transparent text-emerald-100 hover:text-white hover:border-emerald-300/50'}`}>
            Peta <br className="md:hidden" />Interaktif
          </Link>
          <Link href="/dashboard" className={`border-b-2 text-[10px] md:text-sm leading-tight text-center font-semibold transition-all px-1 py-2 md:py-5 ${isActive('/dashboard') ? 'border-white text-white' : 'border-transparent text-emerald-100 hover:text-white hover:border-emerald-300/50'}`}>
            Dashboard
          </Link>
          <Link href="/entry" className={`border-b-2 text-[10px] md:text-sm leading-tight text-center font-semibold transition-all px-1 py-2 md:py-5 ${isActive('/entry') ? 'border-white text-white' : 'border-transparent text-emerald-100 hover:text-white hover:border-emerald-300/50'}`}>
            Data <br className="md:hidden" />Entry
          </Link>
          
          {/* Dropdown Peta Tersimpan */}
          <div className="relative h-full flex items-center" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 text-[10px] md:text-sm leading-tight font-semibold text-emerald-100 hover:text-white px-1 py-2 md:py-5 border-b-2 border-transparent transition-colors"
            >
              Peta <br className="md:hidden" />Tersimpan <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-emerald-200" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-lg border border-slate-200 py-2 z-50 overflow-hidden text-slate-800">
                <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-gray-50 mb-1">Daftar Peta</div>
                <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between w-full hover:bg-emerald-50 group">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push('/map');
                      }}
                      className="flex-1 text-left px-4 py-2 text-sm text-[#1E1B4B] hover:text-emerald-700 transition-colors font-bold truncate cursor-pointer"
                    >
                      Semua Peta
                    </button>
                  </div>
                  {maps.length > 0 ? maps.map((kab, i) => (
                    <div key={i} className="flex items-center justify-between w-full hover:bg-emerald-50 group">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push(`/map?kabupaten=${encodeURIComponent(kab)}`);
                        }}
                        className="flex-1 text-left px-4 py-2 text-sm text-[#1E1B4B] hover:text-emerald-700 transition-colors font-medium truncate cursor-pointer"
                      >
                        {kab}
                      </button>
                      {session && (
                        <button
                          onClick={(e) => handleDeleteMap(e, kab)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer pr-4 shrink-0"
                          title="Hapus Peta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )) : (
                    <div className="px-4 py-2 text-xs text-gray-500 italic">Belum ada peta</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auth Button */}
        <div className={`ml-auto pr-3 md:pr-6 pointer-events-auto h-full flex items-center transition-all duration-300 ${isMinimized ? 'max-w-0 px-0 opacity-0 overflow-hidden pointer-events-none' : 'max-w-[200px] opacity-100'}`}>
           {session ? (
             <button 
               onClick={async () => {
                 const { createClient } = await import('@/lib/supabase-client');
                 const sb = createClient();
                 await sb.auth.signOut();
                 setSession(null);
                 router.push('/login');
               }}
               className="text-[10px] md:text-xs font-bold text-rose-200 border border-rose-700/50 bg-rose-950/40 hover:bg-rose-900/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
             >
               Keluar
             </button>
           ) : (
             <Link 
               href="/login"
               className="text-[10px] md:text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
             >
               Masuk / Login
             </Link>
           )}
        </div>

      </nav>
    </div>
  );
}
