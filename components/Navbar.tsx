'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronDown, ChevronLeft, ChevronRight, Trash2, 
  Map, BarChart3, Database, BookOpen, User, LogOut, Layers,
  Home, Printer, Download, Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export default function Navbar() {
  const [expanded, setExpanded] = useState(false); // Mobile drawer expand state
  const [maps, setMaps] = useState<any[]>([]); // Array of { nama_kabupaten, tahun, user_id, level }
  const [session, setSession] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // Desktop sidebar collapse state
  const [petunjukDropdownOpen, setPetunjukDropdownOpen] = useState(true);
  const [savedKabDropdownOpen, setSavedKabDropdownOpen] = useState(true);
  const [savedProvDropdownOpen, setSavedProvDropdownOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentKabupaten = searchParams.get('kabupaten') || '';
  const activeLevel = searchParams.get('level') || 'kab_kota';

  const isActive = (path: string) => pathname === path;

  const latestMap = maps[0];
  const interactiveMapUrl = latestMap 
    ? `/map?kabupaten=${encodeURIComponent(latestMap.nama_kabupaten)}&level=${latestMap.level}`
    : '/map';

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
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus peta "${kabupaten}" (${activeLevel}) beserta semua data indikator dan kalkulasinya? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/maps?kabupaten=${encodeURIComponent(kabupaten)}&level=${activeLevel}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert(`Peta "${kabupaten}" berhasil dihapus.`);
        setMaps(prev => prev.filter(m => !(m.nama_kabupaten === kabupaten && m.level === activeLevel)));
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

  const handleCetakPeta = () => {
    if (pathname !== '/map') {
      const url = currentKabupaten 
        ? `/map?kabupaten=${encodeURIComponent(currentKabupaten)}&level=${activeLevel}&triggerPrint=true` 
        : `/map?triggerPrint=true`;
      router.push(url);
    } else {
      window.dispatchEvent(new CustomEvent('trigger-print-pdf'));
    }
  };

  const handleDownloadHasil = () => {
    if (pathname !== '/map') {
      const url = currentKabupaten 
        ? `/map?kabupaten=${encodeURIComponent(currentKabupaten)}&level=${activeLevel}&triggerDownload=true` 
        : `/map?triggerDownload=true`;
      router.push(url);
    } else {
      window.dispatchEvent(new CustomEvent('trigger-download-xlsx'));
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
              ? 'bg-[#14B8A6]/20 text-[#2DD4BF] shadow-md scale-105 border border-[#14B8A6]/30' 
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
            ? 'bg-[#14B8A6]/20 text-[#2DD4BF] shadow-md translate-x-1 border border-[#14B8A6]/30' 
            : 'text-emerald-100 hover:bg-white/10 hover:text-white'
        }`}
      >
        <span className="shrink-0">{icon}</span>
        <span className="whitespace-normal leading-snug">{label}</span>
      </Link>
    );
  };

  const SidebarAction = ({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) => {
    if (isMinimized) {
      return (
        <button 
          onClick={onClick} 
          className="flex items-center justify-center p-3 rounded-xl transition-all duration-200 group relative text-emerald-100 hover:bg-white/10 hover:text-white cursor-pointer w-full"
        >
          {icon}
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 backdrop-blur-sm text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-[100] border border-slate-700/50">
            {label}
          </div>
        </button>
      );
    }

    return (
      <button 
        onClick={onClick} 
        className="flex items-center gap-3.5 py-2.5 px-4 rounded-xl font-extrabold text-sm transition-all duration-200 text-emerald-100 hover:bg-white/10 hover:text-white cursor-pointer w-full text-left"
      >
        <span className="shrink-0">{icon}</span>
        <span className="whitespace-normal leading-snug">{label}</span>
      </button>
    );
  };

  const renderPetunjukDropdown = () => {
    if (isMinimized) {
      return (
        <Link 
          href="/petunjuk-penggunaan" 
          className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 group relative ${
            isActive('/petunjuk-penggunaan') 
              ? 'bg-[#14B8A6]/20 text-[#2DD4BF] shadow-md scale-105 border border-[#14B8A6]/30' 
              : 'text-emerald-100 hover:bg-white/10 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 backdrop-blur-sm text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-[100] border border-slate-700/50">
            Petunjuk penggunaan
          </div>
        </Link>
      );
    }

    const isPetunjukActive = pathname === '/petunjuk-penggunaan';

    return (
      <div className="flex flex-col">
        <button
          onClick={() => setPetunjukDropdownOpen(!petunjukDropdownOpen)}
          className={`flex items-center justify-between px-4 py-2.5 text-sm font-extrabold transition-all duration-200 cursor-pointer w-full text-left rounded-xl ${
            isPetunjukActive 
              ? 'text-[#2DD4BF] bg-[#14B8A6]/5' 
              : 'text-emerald-100 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-3.5"><BookOpen className="w-5 h-5 shrink-0" /> Petunjuk penggunaan</span>
          <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: petunjukDropdownOpen ? 'rotate(180deg)' : 'none' }} />
        </button>

        {petunjukDropdownOpen && (
          <div className="pl-9 space-y-1.5 mt-1">
            <Link 
              href="/petunjuk-penggunaan?type=kab_kota"
              className={`block py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all ${
                pathname === '/petunjuk-penggunaan' && searchParams.get('type') === 'kab_kota'
                  ? 'bg-[#14B8A6]/20 text-[#2DD4BF]'
                  : 'text-emerald-200 hover:text-white hover:bg-white/5'
              }`}
            >
              Peta Kab/Kota
            </Link>
            <Link 
              href="/petunjuk-penggunaan?type=provinsi"
              className={`block py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all ${
                pathname === '/petunjuk-penggunaan' && searchParams.get('type') === 'provinsi'
                  ? 'bg-[#14B8A6]/20 text-[#2DD4BF]'
                  : 'text-emerald-200 hover:text-white hover:bg-white/5'
              }`}
            >
              Peta Provinsi
            </Link>
          </div>
        )}
      </div>
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
              ? 'bg-[#14B8A6]/20 text-[#2DD4BF] shadow-md border border-[#14B8A6]/30' 
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

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS 
      ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
      : ['admin@email.com', 'admin@fsva.go.id', 'ketapangcilegon@gmail.com'];
    const isAdmin = !!(session?.user?.email && adminEmails.includes(session.user.email.toLowerCase()) || session?.user?.user_metadata?.role === 'admin');

    const isSemuaPetaActive = pathname === '/map' && !currentKabupaten;
    const kabKotaMaps = maps.filter(m => m.level === 'kab_kota' || !m.level);
    const provinsiMaps = maps.filter(m => m.level === 'provinsi');



    return (
      <div className="flex flex-col border-t border-green-750/30 pt-3 mt-2 space-y-3">
        {/* Dropdown 1: Kab/Kota */}
        <div className="flex flex-col">
          <button
            onClick={() => setSavedKabDropdownOpen(!savedKabDropdownOpen)}
            className="flex items-center justify-between px-3 mb-2 text-xs font-black text-emerald-200 hover:text-white uppercase tracking-wider transition-colors cursor-pointer w-full text-left"
          >
            <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> Peta Kab/Kota</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: savedKabDropdownOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {savedKabDropdownOpen && (
            <div className="pl-2 pr-1 space-y-1 max-h-[130px] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => router.push('/map?level=kab_kota')}
                className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer truncate ${
                  isSemuaPetaActive && activeLevel === 'kab_kota'
                    ? 'bg-[#14B8A6]/20 text-[#2DD4BF] font-extrabold shadow-sm' 
                    : 'text-emerald-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                Semua Peta Kab/Kota
              </button>
              
              {kabKotaMaps.length > 0 ? kabKotaMaps.map((kab, i) => {
                const isMapActive = pathname === '/map' && currentKabupaten === kab.nama_kabupaten && activeLevel === 'kab_kota';
                return (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between w-full rounded-lg group px-1 transition-colors ${
                      isMapActive ? 'bg-[#14B8A6]/20 border border-[#14B8A6]/25' : 'hover:bg-white/5'
                    }`}
                  >
                    <button
                      onClick={() => router.push(`/map?kabupaten=${encodeURIComponent(kab.nama_kabupaten)}&level=kab_kota`)}
                      className={`flex-1 text-left py-1.5 px-2 rounded text-xs transition-colors cursor-pointer truncate ${
                        isMapActive ? 'text-[#2DD4BF] font-extrabold' : 'text-emerald-100 hover:text-white'
                      }`}
                      title={kab.nama_kabupaten}
                    >
                      {kab.nama_kabupaten.includes(' v.2') ? kab.nama_kabupaten : `${kab.nama_kabupaten} ${kab.tahun}`}
                    </button>
                    {session && session.user && (kab.user_id === session.user.id || isAdmin) && (
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
                <div className="px-3 py-1.5 text-xs text-emerald-300/60 italic font-medium">Belum ada peta</div>
              )}
            </div>
          )}
        </div>

        {/* Dropdown 2: Provinsi */}
        <div className="flex flex-col">
          <button
            onClick={() => setSavedProvDropdownOpen(!savedProvDropdownOpen)}
            className="flex items-center justify-between px-3 mb-2 text-xs font-black text-emerald-250 hover:text-white uppercase tracking-wider transition-colors cursor-pointer w-full text-left"
          >
            <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> Peta Provinsi</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: savedProvDropdownOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {savedProvDropdownOpen && (
            <div className="pl-2 pr-1 space-y-1 max-h-[130px] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => router.push('/map?level=provinsi')}
                className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer truncate ${
                  isSemuaPetaActive && activeLevel === 'provinsi'
                    ? 'bg-[#14B8A6]/20 text-[#2DD4BF] font-extrabold shadow-sm' 
                    : 'text-emerald-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                Semua Peta Provinsi
              </button>
              
              {provinsiMaps.length > 0 ? provinsiMaps.map((kab, i) => {
                const isMapActive = pathname === '/map' && currentKabupaten === kab.nama_kabupaten && activeLevel === 'provinsi';
                return (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between w-full rounded-lg group px-1 transition-colors ${
                      isMapActive ? 'bg-[#14B8A6]/20 border border-[#14B8A6]/25' : 'hover:bg-white/5'
                    }`}
                  >
                    <button
                      onClick={() => router.push(`/map?kabupaten=${encodeURIComponent(kab.nama_kabupaten)}&level=provinsi`)}
                      className={`flex-1 text-left py-1.5 px-2 rounded text-xs transition-colors cursor-pointer truncate ${
                        isMapActive ? 'text-[#2DD4BF] font-extrabold' : 'text-emerald-100 hover:text-white'
                      }`}
                      title={kab.nama_kabupaten}
                    >
                      {kab.nama_kabupaten.includes(' v.2') ? kab.nama_kabupaten : `${kab.nama_kabupaten} ${kab.tahun}`}
                    </button>
                    {session && session.user && (kab.user_id === session.user.id || isAdmin) && (
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
                <div className="px-3 py-1.5 text-xs text-emerald-300/60 italic font-medium">Belum ada peta</div>
              )}
            </div>
          )}
        </div>
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

    const kabKotaMaps = maps.filter(m => m.level === 'kab_kota' || !m.level);
    const provinsiMaps = maps.filter(m => m.level === 'provinsi');

    return (
      <div className="fixed top-3 right-3 left-3 z-50 flex flex-col bg-white/95 backdrop-blur-md border border-green-100 shadow-lg rounded-2xl p-4 pointer-events-auto max-h-[85vh] overflow-y-auto no-print animate-in slide-in-from-top-2 fade-in duration-200">
        {/* Mobile Header */}
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
            href="/" 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${isActive('/') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            Beranda
          </Link>
          <Link 
            href={interactiveMapUrl} 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${pathname === '/map' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            Peta FSVA Interaktif
          </Link>
          <Link 
            href="/entry" 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${isActive('/entry') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            Data Entry
          </Link>
          <Link 
            href="/dashboard" 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            Faktor yang Berpengaruh
          </Link>
          <Link 
            href="/ai-insight" 
            onClick={() => toggleExpand(false)} 
            className={`text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-2 ${isActive('/ai-insight') ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-550 fill-amber-500/10 shrink-0" /> AI Insight FSVA
          </Link>
          <button 
            onClick={() => { toggleExpand(false); handleCetakPeta(); }} 
            className="text-left text-xs font-semibold py-2 px-3 rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
          >
            Cetak Peta FSVA
          </button>
          <button 
            onClick={() => { toggleExpand(false); handleDownloadHasil(); }} 
            className="text-left text-xs font-semibold py-2 px-3 rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
          >
            Download Hasil Analisis FSVA
          </button>
          
          <div className="flex flex-col border-t pt-2 border-slate-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">Petunjuk penggunaan</span>
            <div className="flex flex-col gap-1 pl-4">
              <Link 
                href="/petunjuk-penggunaan?type=kab_kota" 
                onClick={() => toggleExpand(false)} 
                className={`text-xs py-1.5 px-2 rounded transition-colors ${pathname === '/petunjuk-penggunaan' && searchParams.get('type') === 'kab_kota' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-500 hover:text-emerald-600'}`}
              >
                Peta Kab/Kota
              </Link>
              <Link 
                href="/petunjuk-penggunaan?type=provinsi" 
                onClick={() => toggleExpand(false)} 
                className={`text-xs py-1.5 px-2 rounded transition-colors ${pathname === '/petunjuk-penggunaan' && searchParams.get('type') === 'provinsi' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-500 hover:text-emerald-600'}`}
              >
                Peta Provinsi
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col border-t pt-2 border-slate-100 mt-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">Peta Tersimpan Kab/Kota</span>
            <div className="max-h-[120px] overflow-y-auto flex flex-col gap-1 pl-4 custom-scrollbar">
              {kabKotaMaps.length > 0 ? kabKotaMaps.map((kab, i) => (
                <div key={i} className="flex items-center justify-between w-full hover:bg-emerald-50 rounded-lg group">
                  <button
                    onClick={() => {
                      toggleExpand(false);
                      router.push(`/map?kabupaten=${encodeURIComponent(kab.nama_kabupaten)}&level=kab_kota`);
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

          <div className="flex flex-col border-t pt-2 border-slate-100 mt-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">Peta Tersimpan Provinsi</span>
            <div className="max-h-[120px] overflow-y-auto flex flex-col gap-1 pl-4 custom-scrollbar">
              {provinsiMaps.length > 0 ? provinsiMaps.map((kab, i) => (
                <div key={i} className="flex items-center justify-between w-full hover:bg-emerald-50 rounded-lg group">
                  <button
                    onClick={() => {
                      toggleExpand(false);
                      router.push(`/map?kabupaten=${encodeURIComponent(kab.nama_kabupaten)}&level=provinsi`);
                    }}
                    className="flex-1 text-left px-3 py-1.5 text-xs text-[#1E1B4B] hover:text-emerald-600 transition-colors font-medium truncate rounded cursor-pointer"
                  >
                    {kab.nama_kabupaten}
                  </button>
                  {session && session.user && kab.user_id === session.user.id && (
                    <button
                      onClick={(e) => handleDeleteMap(e, kab.nama_kabupaten)}
                      className="p-1 text-slate-400 hover:text-rose-650 transition-colors cursor-pointer pr-3 shrink-0"
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
      className={`hidden md:flex flex-col h-screen bg-gradient-to-b from-[#0F2E23] via-[#0A261D] to-[#041A14] border-r border-[#14B8A6]/10 shadow-2xl text-white transition-all duration-300 shrink-0 select-none no-print ${
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
                <span className="text-[9px] text-emerald-350 font-semibold tracking-wide mt-0.5">FSVA.my.id</span>
              </div>
            </Link>
            <button 
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-250 hover:text-white transition-all duration-200 cursor-pointer border border-[#14B8A6]/10"
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
              className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-250 hover:text-white transition-all duration-200 cursor-pointer border border-[#14B8A6]/10 mt-1"
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
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2.5 custom-scrollbar">
        {/* Beranda */}
        <SidebarLink href="/" icon={<Home className="w-5 h-5" />} label="Beranda" active={isActive('/')} />

        {/* Peta FSVA Interaktif */}
        <SidebarLink href={interactiveMapUrl} icon={<Map className="w-5 h-5" />} label="Peta FSVA Interaktif" active={pathname === '/map'} />

        {/* Data Entry */}
        <SidebarLink href="/entry" icon={<Database className="w-5 h-5" />} label="Data Entry" active={isActive('/entry')} />

        {/* Faktor yang Berpengaruh */}
        <SidebarLink href="/dashboard" icon={<BarChart3 className="w-5 h-5" />} label="Faktor yang Berpengaruh" active={isActive('/dashboard')} />

        {/* AI Insight FSVA */}
        <SidebarLink href="/ai-insight" icon={<Sparkles className="w-5 h-5 text-amber-400 fill-amber-400/20" />} label="AI Insight FSVA" active={isActive('/ai-insight')} />

        {/* Cetak Peta FSVA */}
        <SidebarAction onClick={handleCetakPeta} icon={<Printer className="w-5 h-5" />} label="Cetak Peta FSVA" />

        {/* Download Hasil Analisis FSVA */}
        <SidebarAction onClick={handleDownloadHasil} icon={<Download className="w-5 h-5" />} label="Download Hasil Analisis" />

        {/* Petunjuk Penggunaan Dropdown */}
        {renderPetunjukDropdown()}

        {/* Peta Tersimpan Dropdown */}
        {renderSavedMapsDropdown()}
      </div>
    </aside>
  );
}
