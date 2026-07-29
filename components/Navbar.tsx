'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronDown, ChevronLeft, ChevronRight, Trash2, 
  Map, BarChart3, Database, BookOpen, User, LogOut, Layers,
  Home, Printer, Download, Sparkles, Leaf, X, Info, FileText, HelpCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export default function Navbar() {
  const [expanded, setExpanded] = useState(false); // Mobile drawer expand state
  const [maps, setMaps] = useState<any[]>([]); // Array of { nama_kabupaten, tahun, user_id, level }
  const [session, setSession] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // Desktop sidebar collapse state

  // Category dropdown collapse states
  const [fiturUtamaOpen, setFiturUtamaOpen] = useState(true);
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

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS 
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
    : ['admin@email.com', 'admin@fsva.go.id', 'ketapangcilegon@gmail.com'];
  const isAdmin = !!(session?.user?.email && adminEmails.includes(session.user.email.toLowerCase()) || session?.user?.user_metadata?.role === 'admin');

  const kabKotaMaps = maps.filter(m => m.level === 'kab_kota' || !m.level);
  const provinsiMaps = maps.filter(m => m.level === 'provinsi');
  const isSemuaPetaActive = pathname === '/map' && !currentKabupaten;

  // Reusable Tree Submenu Wrapper Component with visual connector lines
  const TreeContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="relative pl-5 ml-4 border-l border-emerald-500/30 my-1 space-y-1.5">
      {children}
    </div>
  );

  const TreeItem = ({ children }: { children: React.ReactNode }) => (
    <div className="relative flex items-center group">
      {/* Horizontal connector line */}
      <span className="absolute -left-[20px] top-1/2 -translate-y-1/2 w-3.5 h-[1px] bg-emerald-500/35 group-hover:bg-emerald-400 transition-colors" />
      {children}
    </div>
  );

  // Render authentic DSS FSVA navigation content
  const renderNavItems = (onItemClick?: () => void) => (
    <div className="flex flex-col gap-3 py-2">
      {/* BERANDA */}
      <Link 
        href="/" 
        onClick={() => onItemClick && onItemClick()} 
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
          isActive('/') 
            ? 'bg-[#0f4d38] text-white border-emerald-500/40 shadow-inner' 
            : 'text-emerald-100 hover:bg-[#0f4d38]/60 hover:text-white border-transparent'
        }`}
      >
        <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-300 shrink-0">
          <Home className="w-4 h-4" />
        </div>
        <span>BERANDA</span>
      </Link>

      {/* CATEGORY 1: FITUR UTAMA FSVA */}
      <div className="flex flex-col">
        <button
          onClick={() => setFiturUtamaOpen(!fiturUtamaOpen)}
          className="flex items-center justify-between px-2 py-1.5 text-xs font-black text-white hover:text-emerald-200 uppercase tracking-wider transition-colors cursor-pointer w-full text-left"
        >
          <span className="flex items-center gap-2.5">
            <Map className="w-4 h-4 text-emerald-400 shrink-0" />
            FITUR UTAMA FSVA
          </span>
          <ChevronDown 
            className="w-3.5 h-3.5 text-emerald-400 transition-transform duration-200" 
            style={{ transform: fiturUtamaOpen ? 'rotate(180deg)' : 'none' }} 
          />
        </button>

        {fiturUtamaOpen && (
          <TreeContainer>
            <TreeItem>
              <Link 
                href={interactiveMapUrl} 
                onClick={() => onItemClick && onItemClick()} 
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors truncate ${
                  pathname === '/map' ? 'text-white font-bold bg-emerald-800/40 border border-emerald-500/30' : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/30'
                }`}
              >
                Peta FSVA Interaktif
              </Link>
            </TreeItem>

            <TreeItem>
              <Link 
                href="/entry" 
                onClick={() => onItemClick && onItemClick()} 
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors truncate ${
                  isActive('/entry') ? 'text-white font-bold bg-emerald-800/40 border border-emerald-500/30' : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/30'
                }`}
              >
                Data Entry
              </Link>
            </TreeItem>

            <TreeItem>
              <Link 
                href="/dashboard" 
                onClick={() => onItemClick && onItemClick()} 
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors truncate ${
                  isActive('/dashboard') ? 'text-white font-bold bg-emerald-800/40 border border-emerald-500/30' : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/30'
                }`}
              >
                Faktor yang Berpengaruh
              </Link>
            </TreeItem>

            <TreeItem>
              <Link 
                href="/ai-insight" 
                onClick={() => onItemClick && onItemClick()} 
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 truncate ${
                  isActive('/ai-insight') ? 'text-white font-bold bg-emerald-800/40 border border-emerald-500/30' : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/30'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                <span>AI Insight FSVA</span>
              </Link>
            </TreeItem>

            <TreeItem>
              <button 
                onClick={() => { onItemClick && onItemClick(); handleCetakPeta(); }} 
                className="w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold text-emerald-100/90 hover:text-white hover:bg-emerald-800/30 cursor-pointer truncate flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Cetak Peta FSVA</span>
              </button>
            </TreeItem>

            <TreeItem>
              <button 
                onClick={() => { onItemClick && onItemClick(); handleDownloadHasil(); }} 
                className="w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold text-emerald-100/90 hover:text-white hover:bg-emerald-800/30 cursor-pointer truncate flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Download Hasil Analisis FSVA</span>
              </button>
            </TreeItem>
          </TreeContainer>
        )}
      </div>

      {/* CATEGORY 2: PETUNJUK PENGGUNAAN & INFORMASI */}
      <div className="flex flex-col">
        <button
          onClick={() => setPetunjukDropdownOpen(!petunjukDropdownOpen)}
          className="flex items-center justify-between px-2 py-1.5 text-xs font-black text-white hover:text-emerald-200 uppercase tracking-wider transition-colors cursor-pointer w-full text-left"
        >
          <span className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            PETUNJUK PENGGUNAAN
          </span>
          <ChevronDown 
            className="w-3.5 h-3.5 text-emerald-400 transition-transform duration-200" 
            style={{ transform: petunjukDropdownOpen ? 'rotate(180deg)' : 'none' }} 
          />
        </button>

        {petunjukDropdownOpen && (
          <TreeContainer>
            <TreeItem>
              <Link 
                href="/petunjuk-penggunaan?type=kab_kota" 
                onClick={() => onItemClick && onItemClick()} 
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors truncate ${
                  pathname === '/petunjuk-penggunaan' && searchParams.get('type') === 'kab_kota' ? 'text-white font-bold bg-emerald-800/40 border border-emerald-500/30' : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/30'
                }`}
              >
                Peta Kab/Kota
              </Link>
            </TreeItem>
            <TreeItem>
              <Link 
                href="/petunjuk-penggunaan?type=provinsi" 
                onClick={() => onItemClick && onItemClick()} 
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors truncate ${
                  pathname === '/petunjuk-penggunaan' && searchParams.get('type') === 'provinsi' ? 'text-white font-bold bg-emerald-800/40 border border-emerald-500/30' : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/30'
                }`}
              >
                Peta Provinsi
              </Link>
            </TreeItem>
            <TreeItem>
              <Link 
                href="/indikator-fsva" 
                onClick={() => onItemClick && onItemClick()} 
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors truncate ${
                  isActive('/indikator-fsva') ? 'text-white font-bold bg-emerald-800/40 border border-emerald-500/30' : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/30'
                }`}
              >
                Indikator FSVA
              </Link>
            </TreeItem>
            <TreeItem>
              <Link 
                href="/metodologi-fsva" 
                onClick={() => onItemClick && onItemClick()} 
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors truncate ${
                  isActive('/metodologi-fsva') ? 'text-white font-bold bg-emerald-800/40 border border-emerald-500/30' : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/30'
                }`}
              >
                Metodologi FSVA
              </Link>
            </TreeItem>
            <TreeItem>
              <Link 
                href="/tentang-fsva" 
                onClick={() => onItemClick && onItemClick()} 
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors truncate ${
                  isActive('/tentang-fsva') ? 'text-white font-bold bg-emerald-800/40 border border-emerald-500/30' : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/30'
                }`}
              >
                Tentang Aplikasi
              </Link>
            </TreeItem>
          </TreeContainer>
        )}
      </div>

      {/* CATEGORY 3: PETA TERSIMPAN KAB/KOTA */}
      <div className="flex flex-col">
        <button
          onClick={() => setSavedKabDropdownOpen(!savedKabDropdownOpen)}
          className="flex items-center justify-between px-2 py-1.5 text-xs font-black text-white hover:text-emerald-200 uppercase tracking-wider transition-colors cursor-pointer w-full text-left"
        >
          <span className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            PETA TERSIMPAN KAB/KOTA
          </span>
          <ChevronDown 
            className="w-3.5 h-3.5 text-emerald-400 transition-transform duration-200" 
            style={{ transform: savedKabDropdownOpen ? 'rotate(180deg)' : 'none' }} 
          />
        </button>

        {savedKabDropdownOpen && (
          <TreeContainer>
            <TreeItem>
              <button
                onClick={() => {
                  onItemClick && onItemClick();
                  router.push('/map?level=kab_kota');
                }}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer truncate ${
                  isSemuaPetaActive && activeLevel === 'kab_kota'
                    ? 'text-white bg-emerald-800/40 border border-emerald-500/30'
                    : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/30'
                }`}
              >
                Semua Peta Kab/Kota
              </button>
            </TreeItem>

            {kabKotaMaps.length > 0 ? (
              kabKotaMaps.map((kab, i) => {
                const isMapActive = pathname === '/map' && currentKabupaten === kab.nama_kabupaten && activeLevel === 'kab_kota';
                return (
                  <TreeItem key={i}>
                    <div className="flex items-center justify-between w-full rounded-lg group hover:bg-emerald-800/30 pr-1">
                      <button
                        onClick={() => {
                          onItemClick && onItemClick();
                          router.push(`/map?kabupaten=${encodeURIComponent(kab.nama_kabupaten)}&level=kab_kota`);
                        }}
                        className={`flex-1 text-left py-1.5 px-2.5 text-xs transition-colors cursor-pointer truncate rounded-lg ${
                          isMapActive ? 'text-emerald-300 font-bold bg-emerald-800/50' : 'text-emerald-100/90 hover:text-white'
                        }`}
                        title={kab.nama_kabupaten}
                      >
                        {kab.nama_kabupaten.includes(' v.2') ? kab.nama_kabupaten : `${kab.nama_kabupaten} ${kab.tahun}`}
                      </button>
                      {session && session.user && (kab.user_id === session.user.id || isAdmin) && (
                        <button
                          onClick={(e) => handleDeleteMap(e, kab.nama_kabupaten)}
                          className="p-1 text-emerald-400/60 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                          title="Hapus Peta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </TreeItem>
                );
              })
            ) : (
              <TreeItem>
                <span className="px-2.5 py-1 text-xs text-emerald-300/60 italic font-medium">Belum ada peta</span>
              </TreeItem>
            )}
          </TreeContainer>
        )}
      </div>

      {/* CATEGORY 4: PETA TERSIMPAN PROVINSI */}
      <div className="flex flex-col">
        <button
          onClick={() => setSavedProvDropdownOpen(!savedProvDropdownOpen)}
          className="flex items-center justify-between px-2 py-1.5 text-xs font-black text-white hover:text-emerald-200 uppercase tracking-wider transition-colors cursor-pointer w-full text-left"
        >
          <span className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            PETA TERSIMPAN PROVINSI
          </span>
          <ChevronDown 
            className="w-3.5 h-3.5 text-emerald-400 transition-transform duration-200" 
            style={{ transform: savedProvDropdownOpen ? 'rotate(180deg)' : 'none' }} 
          />
        </button>

        {savedProvDropdownOpen && (
          <TreeContainer>
            <TreeItem>
              <button
                onClick={() => {
                  onItemClick && onItemClick();
                  router.push('/map?level=provinsi');
                }}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer truncate ${
                  isSemuaPetaActive && activeLevel === 'provinsi'
                    ? 'text-white bg-emerald-800/40 border border-emerald-500/30'
                    : 'text-emerald-100/90 hover:text-white hover:bg-emerald-800/30'
                }`}
              >
                Semua Peta Provinsi
              </button>
            </TreeItem>

            {provinsiMaps.length > 0 ? (
              provinsiMaps.map((kab, i) => {
                const isMapActive = pathname === '/map' && currentKabupaten === kab.nama_kabupaten && activeLevel === 'provinsi';
                return (
                  <TreeItem key={i}>
                    <div className="flex items-center justify-between w-full rounded-lg group hover:bg-emerald-800/30 pr-1">
                      <button
                        onClick={() => {
                          onItemClick && onItemClick();
                          router.push(`/map?kabupaten=${encodeURIComponent(kab.nama_kabupaten)}&level=provinsi`);
                        }}
                        className={`flex-1 text-left py-1.5 px-2.5 text-xs transition-colors cursor-pointer truncate rounded-lg ${
                          isMapActive ? 'text-emerald-300 font-bold bg-emerald-800/50' : 'text-emerald-100/90 hover:text-white'
                        }`}
                        title={kab.nama_kabupaten}
                      >
                        {kab.nama_kabupaten.includes(' v.2') ? kab.nama_kabupaten : `${kab.nama_kabupaten} ${kab.tahun}`}
                      </button>
                      {session && session.user && (kab.user_id === session.user.id || isAdmin) && (
                        <button
                          onClick={(e) => handleDeleteMap(e, kab.nama_kabupaten)}
                          className="p-1 text-emerald-400/60 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                          title="Hapus Peta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </TreeItem>
                );
              })
            ) : (
              <TreeItem>
                <span className="px-2.5 py-1 text-xs text-emerald-300/60 italic font-medium">Belum ada peta</span>
              </TreeItem>
            )}
          </TreeContainer>
        )}
      </div>
    </div>
  );

  // MOBILE VIEW RENDER
  if (isMobile) {
    if (!expanded) {
      return (
        <div 
          onClick={() => toggleExpand(true)}
          className="fixed top-3 right-3 z-50 px-3.5 py-2 flex items-center gap-2 bg-[#0b2e24]/95 backdrop-blur-md text-white shadow-xl border border-emerald-500/40 rounded-xl cursor-pointer pointer-events-auto text-xs font-bold uppercase tracking-wider select-none no-print hover:bg-[#104234] transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Leaf className="w-3 h-3 fill-white" />
          </div>
          <span>MENU</span>
        </div>
      );
    }

    return (
      <>
        {/* Backdrop overlay */}
        <div 
          onClick={() => toggleExpand(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 no-print animate-in fade-in duration-200"
        />

        {/* Mobile Slide-over Drawer (Narrow width ~280px / w-72) */}
        <div className="fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-gradient-to-b from-[#0e4434] via-[#093527] to-[#05241a] border-l border-emerald-500/20 text-white shadow-2xl flex flex-col no-print animate-in slide-in-from-right duration-200 overflow-hidden">
          {/* Mobile Header (Capture 2 Style) */}
          <div className="p-4 border-b border-emerald-500/20 flex items-center justify-between bg-[#08291f] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-md border border-emerald-400/30 shrink-0">
                <Leaf className="w-5 h-5 fill-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-black text-xs text-white tracking-wider uppercase">FSVA - KETAHANAN PANGAN</span>
                <span className="text-[10px] font-extrabold text-[#34d399] tracking-wider uppercase truncate max-w-[130px]">
                  {currentKabupaten ? currentKabupaten : 'FSVA.MY.ID'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => toggleExpand(false)} 
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Scroll Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {renderNavItems(() => toggleExpand(false))}
          </div>

          {/* Mobile Auth Footer */}
          <div className="p-3 border-t border-emerald-500/20 bg-[#061f17] shrink-0">
            {session ? (
              <button 
                onClick={handleSignOut}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-rose-300 border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            ) : (
              <Link 
                href="/login"
                onClick={() => toggleExpand(false)}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-400 shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" /> Masuk / Login
              </Link>
            )}
          </div>
        </div>
      </>
    );
  }

  // DESKTOP VERTICAL SIDEBAR VIEW RENDER
  return (
    <aside 
      className={`hidden md:flex flex-col h-screen bg-gradient-to-b from-[#0e4434] via-[#093527] to-[#05241a] border-r border-emerald-500/20 shadow-2xl text-white transition-all duration-300 shrink-0 select-none no-print ${
        isMinimized ? 'w-20' : 'w-72'
      }`}
    >
      {/* Desktop Header (Capture 2 Style) */}
      <div className={`p-4 flex items-center border-b border-emerald-500/20 bg-[#08291f] h-20 shrink-0 ${
        isMinimized ? 'justify-center flex-col gap-2' : 'justify-between'
      }`}>
        {!isMinimized ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-md border border-emerald-400/30 shrink-0">
                <Leaf className="w-5 h-5 fill-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-black text-xs text-white tracking-wider uppercase">FSVA - KETAHANAN PANGAN</span>
                <span className="text-[10px] font-extrabold text-[#34d399] tracking-wider uppercase truncate max-w-[130px]">
                  {currentKabupaten ? currentKabupaten : 'FSVA.MY.ID'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 hover:text-white transition-all duration-200 cursor-pointer border border-emerald-500/20"
              title="Sembunyikan Menu"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-md border border-emerald-400/30">
              <Leaf className="w-5 h-5 fill-white" />
            </div>
            <button 
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 hover:text-white transition-all duration-200 cursor-pointer border border-emerald-500/20 mt-1"
              title="Tampilkan Menu"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Auth Section */}
      <div className="p-3 border-b border-emerald-500/15 shrink-0 bg-[#07241b]">
        {!isMinimized ? (
          session ? (
            <button 
              onClick={handleSignOut}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-rose-300 border border-rose-500/30 bg-rose-950/30 hover:bg-rose-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          ) : (
            <Link 
              href="/login"
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-400 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" /> Masuk / Login
            </Link>
          )
        ) : (
          <div className="flex justify-center">
            {session ? (
              <button 
                onClick={handleSignOut}
                className="p-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-900/30 transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link 
                href="/login"
                className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Masuk / Login"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Menu List */}
      {!isMinimized ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {renderNavItems()}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-3 flex flex-col items-center custom-scrollbar">
          <Link href="/" className="p-2.5 rounded-xl text-emerald-100 hover:bg-white/10 hover:text-white transition-all" title="Beranda">
            <Home className="w-5 h-5" />
          </Link>
          <Link href={interactiveMapUrl} className="p-2.5 rounded-xl text-emerald-100 hover:bg-white/10 hover:text-white transition-all" title="Peta FSVA">
            <Map className="w-5 h-5" />
          </Link>
          <Link href="/entry" className="p-2.5 rounded-xl text-emerald-100 hover:bg-white/10 hover:text-white transition-all" title="Data Entry">
            <Database className="w-5 h-5" />
          </Link>
          <Link href="/dashboard" className="p-2.5 rounded-xl text-emerald-100 hover:bg-white/10 hover:text-white transition-all" title="Faktor yang Berpengaruh">
            <BarChart3 className="w-5 h-5" />
          </Link>
          <Link href="/ai-insight" className="p-2.5 rounded-xl text-emerald-100 hover:bg-white/10 hover:text-white transition-all" title="AI Insight FSVA">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </Link>
          <button onClick={handleCetakPeta} className="p-2.5 rounded-xl text-emerald-100 hover:bg-white/10 hover:text-white transition-all cursor-pointer" title="Cetak Peta FSVA">
            <Printer className="w-5 h-5" />
          </button>
          <button onClick={handleDownloadHasil} className="p-2.5 rounded-xl text-emerald-100 hover:bg-white/10 hover:text-white transition-all cursor-pointer" title="Download Hasil">
            <Download className="w-5 h-5" />
          </button>
          <Link href="/petunjuk-penggunaan" className="p-2.5 rounded-xl text-emerald-100 hover:bg-white/10 hover:text-white transition-all" title="Petunjuk Penggunaan">
            <BookOpen className="w-5 h-5" />
          </Link>
        </div>
      )}
    </aside>
  );
}
