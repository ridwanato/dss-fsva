'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronDown, ChevronLeft, ChevronRight, Trash2, 
  Map, BarChart3, Database, BookOpen, User, LogOut, Layers 
} from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export default function Navbar() {
  const [expanded, setExpanded] = useState(false); // Mobile drawer expand state
  const [maps, setMaps] = useState<any[]>([]); // Array of { nama_kabupaten, tahun, user_id }
  const [session, setSession] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // Desktop sidebar collapse state
  const [sidebarDropdownOpen, setSidebarDropdownOpen] = useState(true); // Desktop sidebar submenu state
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentKabupaten = searchParams.get('kabupaten') || '';

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
        if (data.success && data.mapDetails) {
          setMaps(data.mapDetails);
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
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('layerpanel-expand', handleLayerExpand);
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
        setMaps(prev => prev.filter(m => m.nama_kabupaten !== kabupaten));
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

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase-client');
    const sb = createClient();
    await sb.auth.signOut();
    setSession(null);
    if (isMobile) setExpanded(false);
    router.push('/login');
  };

  const toggleExpand = (val: boolean) => {
    setExpanded(val);
    if (val) {
      window.dispatchEvent(new CustomEvent('navbar-expand'));
    }
  };

  // Helper component for desktop sidebar links
  const SidebarLink = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) => {
    if (isMinimized) {
      return (
        <Link 
          href={href} 
          className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 group relative ${
            active 
              ? 'bg-emerald-100 text-slate-900 shadow-md scale-105' 
              : 'text-emerald-100 hover:bg-white/10 hover:text-white'
          }`}
        >
          {icon}
          {/* Tooltip */}
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 backdrop-blur-sm text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-[100] border border-slate-700/50">
            {label}
          </div>
        </Link>
      );
    }

    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3.5 py-2.5 px-4 rounded-xl font-extrabold text-sm transition-all duration-200 ${
          active 
            ? 'bg-emerald-100 text-slate-900 shadow-md translate-x-1' 
            : 'text-emerald-100 hover:bg-white/10 hover:text-white'
        }`}
      >
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  const renderSavedMapsDropdown = () => {
    if (isMinimized) {
      const isAnyMapActive = pathname === '/map' && currentKabupaten !== '';
      return (
        <Link 
          href="/map"
          className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 group relative ${
            isAnyMapActive
              ? 'bg-emerald-100 text-slate-900 shadow-md' 
              : 'text-emerald-100 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 backdrop-blur-sm text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-[100] border border-slate-700/50">
            Peta Tersimpan
          </div>
        </Link>
      );
    }

    const isSemuaPetaActive = pathname === '/map' && !currentKabupaten;

    return (
      <div className="flex flex-col border-t border-green-700/30 pt-3 mt-2">
        <button
          onClick={() => setSidebarDropdownOpen(!sidebarDropdownOpen)}
          className="flex items-center justify-between px-3 mb-2 text-xs font-black text-emerald-200 hover:text-white uppercase tracking-wider transition-colors cursor-pointer w-full text-left"
        >
          <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> Peta Tersimpan</span>
          <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: sidebarDropdownOpen ? 'rotate(180deg)' : 'none' }} />
        </button>

        {sidebarDropdownOpen && (
          <div className="pl-2 pr-1 space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => router.push('/map')}
              className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer truncate ${
                isSemuaPetaActive 
                  ? 'bg-emerald-100 text-slate-900 font-extrabold shadow-sm' 
                  : 'text-emerald-100 hover:bg-white/5 hover:text-white'
              }`}
            >
              Semua Peta
            </button>
            
            {maps.length > 0 ? maps.map((kab, i) => {
              const isMapActive = pathname === '/map' && currentKabupaten === kab.nama_kabupaten;
              return (
                <div 
                  key={i} 
                  className={`flex items-center justify-between w-full rounded-lg group px-1 transition-colors ${
                    isMapActive ? 'bg-emerald-100' : 'hover:bg-white/5'
                  }`}
                >
                  <button
                    onClick={() => router.push(`/map?kabupaten=${encodeURIComponent(kab.nama_kabupaten)}`)}
                    className={`flex-1 text-left py-1.5 px-2 rounded text-xs transition-colors cursor-pointer truncate ${
                      isMapActive ? 'text-slate-900 font-extrabold' : 'text-emerald-100 hover:text-white'
                    }`}
                    title={kab.nama_kabupaten}
                  >
                    {kab.nama_kabupaten}
                  </button>
                  {session && session.user && kab.user_id === session.user.id && (
                    <button
                      onClick={(e) => handleDeleteMap(e, kab.nama_kabupaten)}
                      className={`p-1 transition-colors cursor-pointer shrink-0 ${
                        isMapActive ? 'text-slate-500 hover:text-rose-650' : 'text-emerald-300/40 hover:text-rose-400'
                      }`}
                      title="Hapus Peta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            }) : (
              <div className="px-3 py-2 text-xs text-emerald-300/60 italic font-medium">Belum ada peta</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // MOBILE VIEW RENDER
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
        {/* Mobile Header with link to / */}
        <div className="flex items-center justify-between border-b pb-3 border-green-50/50 mb-3 bg-gradient-to-r from-green-800 via-green-700 to-green-500 -mx-4 -mt-4 p-4 rounded-t-2xl text-white">
          <Link 
            href="/" 
            onClick={() => toggleExpand(false)} 
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-6 h-6 bg-white text-green-800 rounded-lg flex items-center justify-center font-black text-xs">
              F
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="font-bold text-xs text-white">FSVA</span>
              <span className="text-[7px] text-emerald-200/90 font-medium mt-0.5">FSVA.my.id</span>
            </div>
          </Link>
          <button 
            onClick={() => toggleExpand(false)} 
            className="text-xs font-bold text-emerald-100 hover:text-white px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* Mobile Menu Links */}
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
          
          {/* Menu Baru: Petunjuk Penggunaan */}
          <Link 
            href="/petunjuk-penggunaan" 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${isActive('/petunjuk-penggunaan') ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            Petunjuk penggunaan
          </Link>
          
          <div className="flex flex-col border-t pt-2 border-slate-100 mt-1">
            <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider px-3 mb-1.5">Peta Tersimpan</span>
            <div className="max-h-[220px] overflow-y-auto flex flex-col gap-1 pl-2 custom-scrollbar">
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
                      router.push(`/map?kabupaten=${encodeURIComponent(kab.nama_kabupaten)}`);
                    }}
                    className="flex-1 text-left px-3 py-1.5 text-xs text-[#1E1B4B] hover:text-emerald-600 transition-colors font-medium truncate rounded cursor-pointer"
                  >
                    {kab.nama_kabupaten}
                  </button>
                  {session && session.user && kab.user_id === session.user.id && (
                    <button
                      onClick={(e) => handleDeleteMap(e, kab.nama_kabupaten)}
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

        {/* Mobile Auth Button */}
        <div className="border-t pt-3 border-slate-100 flex justify-end mt-3">
          {session ? (
            <button 
              onClick={handleSignOut}
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

  // DESKTOP VERTICAL SIDEBAR VIEW RENDER
  return (
    <aside 
      className={`hidden md:flex flex-col h-screen bg-gradient-to-b from-green-900 via-emerald-955 to-green-955 border-r border-green-800/30 shadow-2xl text-white transition-all duration-300 shrink-0 select-none no-print ${
        isMinimized ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className={`p-4 flex items-center border-b border-green-800/30 h-20 shrink-0 ${
        isMinimized ? 'justify-center flex-col gap-2' : 'justify-between'
      }`}>
        {!isMinimized ? (
          <>
            <Link 
              href="/" 
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 bg-white text-green-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center font-black text-xl">
                F
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-lg tracking-tight text-white">FSVA</span>
                <span className="text-[9px] text-emerald-300/80 font-semibold tracking-wide mt-0.5">FSVA.my.id</span>
              </div>
            </Link>
            <button 
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 hover:text-white transition-all duration-200 cursor-pointer border border-emerald-800/30"
              title="Sembunyikan Menu"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <Link 
              href="/" 
              className="w-9 h-9 bg-white text-green-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center font-black text-xl hover:opacity-90 transition-opacity"
            >
              F
            </Link>
            <button 
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 hover:text-white transition-all duration-200 cursor-pointer border border-emerald-800/30 mt-1"
              title="Tampilkan Menu"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Auth Button */}
      <div className="p-4 border-b border-green-800/20 shrink-0">
        {!isMinimized ? (
          session ? (
            <button 
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-200 border border-rose-850/40 bg-rose-950/20 hover:bg-rose-900/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          ) : (
            <Link 
              href="/login"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-green-800 hover:bg-green-50 hover:scale-[1.02] shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" /> Masuk / Login
            </Link>
          )
        ) : (
          <div className="flex justify-center">
            {session ? (
              <button 
                onClick={handleSignOut}
                className="p-2.5 rounded-xl text-rose-200 hover:text-white hover:bg-rose-900/20 transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link 
                href="/login"
                className="p-2.5 rounded-xl text-emerald-250 hover:text-white hover:bg-white/10 transition-colors"
                title="Masuk / Login"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
        {/* Peta Interaktif */}
        <SidebarLink href="/map" icon={<Map className="w-5 h-5" />} label="Peta Interaktif" active={isActive('/map')} />
        
        {/* Dashboard */}
        <SidebarLink href="/dashboard" icon={<BarChart3 className="w-5 h-5" />} label="Dashboard" active={isActive('/dashboard')} />
        
        {/* Data Entry */}
        <SidebarLink href="/entry" icon={<Database className="w-5 h-5" />} label="Data Entry" active={isActive('/entry')} />
        
        {/* Petunjuk Penggunaan */}
        <SidebarLink href="/petunjuk-penggunaan" icon={<BookOpen className="w-5 h-5" />} label="Petunjuk penggunaan" active={isActive('/petunjuk-penggunaan')} />

        {/* Peta Tersimpan Dropdown */}
        {renderSavedMapsDropdown()}
      </div>
    </aside>
  );
}
