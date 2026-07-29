import { PRIORITY_LABELS, STUNTING_PRIORITY_LABELS } from '@/lib/fsva/constants';

interface PrintConfig {
  logoPemda: string;
  logoBapanas: string;
  govName: string;
  title: string;
  sources: string;
  footer: string;
}

interface FontStyle {
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
}

interface PrintLayoutProps {
  mapImage: string | null;
  activeLayerName: string;
  activeLayer?: string;
  config: PrintConfig;
  fontStyles?: Record<string, FontStyle>;
  level?: string;
  orientation?: 'portrait' | 'landscape';
}

export default function PrintLayout({ 
  mapImage, 
  activeLayerName, 
  activeLayer = 'prioritas', 
  config,
  fontStyles,
  level = 'kab_kota',
  orientation = 'portrait'
}: PrintLayoutProps) {
  if (!mapImage) return null;

  const isStunting = activeLayer === 'p_stunting';
  const priorities = isStunting ? ([1, 2, 3, 4] as const) : ([1, 2, 3, 4, 5, 6] as const);
  const labels = isStunting ? STUNTING_PRIORITY_LABELS : PRIORITY_LABELS;

  const isProvinsi = level === 'provinsi';
  const isLandscape = orientation === 'landscape';

  // Helper to convert FontStyle to inline CSS style object
  const getTextStyle = (style?: FontStyle) => {
    if (!style) return { fontFamily: 'Arial, sans-serif' };
    return {
      fontFamily: style.fontFamily || 'Arial, sans-serif',
      fontSize: `${style.fontSize}pt`,
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.underline ? 'underline' : 'none',
      textAlign: style.align,
      whiteSpace: 'pre-wrap' as const
    };
  };

  // ================================================================
  // LANDSCAPE LAYOUT (Matching Capture 2 - Official Bapanas Standard)
  // ================================================================
  if (isLandscape) {
    return (
      <div className="print-only bg-white w-[297mm] h-[210mm] overflow-hidden p-[6mm] mx-auto text-black relative" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="border-[2px] border-black w-full h-full flex flex-col relative overflow-hidden">
          
          {/* 1. TOP HEADER BANNER (Full Width across the top - Matching Capture 2) */}
          <div className="h-[36mm] w-full border-b-[2px] border-black flex items-center justify-between px-5 bg-white shrink-0 relative">
            {/* Left: Logo Bapanas */}
            <div className="w-[65px] h-[34px] flex items-center justify-center shrink-0">
              <img src={config.logoBapanas} alt="Logo Bapanas" className="max-w-full max-h-full object-contain" />
            </div>

            {/* Center: Main Title Header */}
            <div className="flex flex-col items-center justify-center text-center flex-1 px-4">
              <h1 style={getTextStyle(fontStyles?.title)} className="text-[13pt] font-black tracking-wide leading-tight uppercase">
                {config.title ? config.title : `PETA KETAHANAN DAN KERENTANAN PANGAN\n${config.govName.replace('PEMERINTAH', '').trim()}\nTAHUN 2025`}
              </h1>
            </div>

            {/* Right: Logo Pemda */}
            <div className="w-[65px] h-[34px] flex items-center justify-center shrink-0">
              <img src={config.logoPemda} alt="Logo Pemda" className="max-w-full max-h-full object-contain" />
            </div>
          </div>

          {/* 2. MAIN CONTENT AREA (Below Top Banner) */}
          <div className="flex-1 flex w-full relative overflow-hidden">
            
            {/* Left Box: Main Map Frame (~73% width - Matching Capture 2) */}
            <div className="w-[73%] h-full border-r-[2px] border-black bg-[#99d9ea] relative overflow-hidden">
              {/* Map Image */}
              <img 
                src={mapImage} 
                alt="Map Print View" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)', zIndex: 0, display: 'block' }}
              />

              {/* Coordinate Grids (Top) */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-white/0 flex justify-between px-8 text-[8px] z-10 font-mono">
                <span>105.920</span>
                <span>105.960</span>
                <span>106.000</span>
                <span>106.040</span>
                <span>106.080</span>
              </div>

              {/* Coordinate Grids (Left) */}
              <div className="absolute top-0 bottom-0 left-0 w-6 bg-white/0 flex flex-col justify-between py-10 text-[8px] font-mono transform -rotate-90 origin-left translate-y-[-100%] ml-2 z-10">
                <span className="transform rotate-90">-5.840</span>
                <span className="transform rotate-90">-5.880</span>
                <span className="transform rotate-90">-5.920</span>
                <span className="transform rotate-90">-5.960</span>
                <span className="transform rotate-90">-6.000</span>
              </div>

              {/* Scale Bar (Bottom Left inside Map Box - Matching Capture 2) */}
              <div className="absolute bottom-3 left-4 z-10 bg-white/90 backdrop-blur-xs p-1.5 rounded border border-black/40 shadow-xs flex flex-col items-center">
                <div className="w-28">
                  <div className="flex justify-between w-full mb-0.5 text-[8px] font-bold">
                    <span>0</span>
                    <span>1</span>
                    <span>2 km</span>
                  </div>
                  <div className="w-full h-1.5 border-x-[2px] border-b-[2px] border-black flex">
                    <div className="w-1/2 h-full bg-black"></div>
                    <div className="w-1/2 h-full bg-white border-l-[2px] border-black"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Sidebar (~27% width - Matching Capture 2) */}
            <div className="w-[27%] h-full flex flex-col bg-white p-2.5 justify-between overflow-hidden text-black">
              
              {/* Top of Sidebar: North Arrow */}
              <div className="flex flex-col items-center justify-center py-1 border-b border-black/30 mb-1 shrink-0">
                <svg width="26" height="38" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6.5 h-9.5">
                  <path d="M16 2 L26 24 L16 18 L6 24 Z" fill="black" stroke="black" strokeWidth="1.5" strokeLinejoin="miter" />
                  <path d="M16 2 L16 18 L6 24 Z" fill="white" />
                  <text x="16" y="42" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="black" textAnchor="middle">U</text>
                </svg>
              </div>

              {/* Middle: Legenda (Matching Capture 2) */}
              <div className="flex flex-col gap-1 border-b border-black/30 pb-2">
                <h3 className="font-bold text-[10px] text-left">Legenda</h3>
                
                <div className="flex items-center gap-2 text-left my-0.5">
                  <div className="w-4 border-t-2 border-black flex-shrink-0"></div>
                  <span className="text-[8px] font-medium">{isProvinsi ? 'BATAS KABUPATEN/KOTA' : 'BATAS KECAMATAN'}</span>
                </div>

                <h4 className="font-bold text-[8.5px] uppercase mt-0.5">
                  {activeLayerName.toUpperCase() === 'KOMPOSIT' ? 'INDIKATOR KOMPOSIT' : `INDIKATOR ${activeLayerName.toUpperCase()}`}
                </h4>

                <div className="flex flex-col gap-0.5 mt-0.5">
                  {priorities.map(p => (
                    <div key={p} className="flex gap-2 items-center text-left">
                      <div 
                        className="w-3.5 h-2 border border-black flex-shrink-0"
                        style={{ backgroundColor: labels[p as keyof typeof labels].fill }}
                      />
                      <span className="text-[8px] leading-tight">
                        {`Prioritas ${p}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sumber Data */}
              <div className="flex flex-col gap-0.5 py-1 border-b border-black/30 text-[7.5px]">
                <h3 className="font-bold text-[8.5px]">Sumber Data :</h3>
                <div className="whitespace-pre-wrap leading-tight text-[7px]" style={getTextStyle(fontStyles?.sources)}>
                  {config.sources}
                </div>
              </div>

              {/* Peta Disusun oleh */}
              <div className="flex flex-col gap-0.5 pt-1 text-[7.5px]">
                <h3 className="font-bold text-[8px]">Peta Disusun oleh :</h3>
                <div className="whitespace-pre-wrap leading-tight text-[7px]" style={getTextStyle(fontStyles?.footer)}>
                  {config.footer}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // ================================================================
  // PORTRAIT LAYOUT (Standard Portrait A4)
  // ================================================================
  return (
    <div className="print-only bg-white w-[210mm] h-[297mm] overflow-hidden p-[10mm] mx-auto text-black relative" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="border-[2px] border-black w-full h-full flex flex-col relative">
        
        {/* Main Map Area (Left side) */}
        <div className="absolute top-0 left-0 bottom-0 w-[70%] border-r-[2px] border-black bg-[#99d9ea] overflow-hidden">
          {/* Base Map Image */}
          <img 
            src={mapImage} 
            alt="Map Print View" 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1)', zIndex: 0, display: 'block' }}
          />

          {/* North Arrow (Pojok Kanan Atas, Tanpa Kotak Putih) */}
          <div className="absolute top-4 right-4 z-10 flex flex-col items-center select-none filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
            <svg width="26" height="38" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6.5 h-9.5">
              <path d="M16 2 L26 24 L16 18 L6 24 Z" fill="black" stroke="white" strokeWidth="1.5" strokeLinejoin="miter" />
              <path d="M16 2 L16 18 L6 24 Z" fill="white" />
              <text x="16" y="42" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="black" textAnchor="middle" stroke="white" strokeWidth="0.8">U</text>
            </svg>
          </div>

          {/* Coordinate Grids (Top) */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-white/0 flex justify-between px-8 text-[8px] z-10">
            <span>105.920</span>
            <span>105.960</span>
            <span>106.000</span>
            <span>106.040</span>
            <span>106.080</span>
          </div>

          {/* Coordinate Grids (Left) */}
          <div className="absolute top-0 bottom-0 left-0 w-6 bg-white/0 flex flex-col justify-between py-12 text-[8px] transform -rotate-90 origin-left translate-y-[-100%] ml-2 z-10">
            <span className="transform rotate-90">-5.840</span>
            <span className="transform rotate-90">-5.880</span>
            <span className="transform rotate-90">-5.920</span>
            <span className="transform rotate-90">-5.960</span>
            <span className="transform rotate-90">-6.000</span>
            <span className="transform rotate-90">-6.040</span>
            <span className="transform rotate-90">-6.080</span>
            <span className="transform rotate-90">-6.120</span>
          </div>

          <div className="absolute top-1/3 left-10 text-gray-500/50 font-bold text-xs italic tracking-widest z-10">
            SELAT SUNDA
          </div>
        </div>

        {/* Sidebar (Right side) */}
        <div className="absolute top-0 right-0 bottom-0 w-[30%] flex flex-col bg-white">
          
          {/* Logos Section */}
          <div className="p-3 border-b-[2px] border-black flex flex-col gap-3 justify-center">
            <div className="flex items-center gap-2 px-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <img src={config.logoPemda} alt="Logo Pemda" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col w-full" style={getTextStyle(fontStyles?.govName)}>
                {config.govName.split('\n').map((line, i) => (
                   <span key={i} className="leading-tight uppercase">{line}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 px-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <img src={config.logoBapanas} alt="Logo Bapanas" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col ml-1">
                <span className="text-[10px] font-black leading-tight text-green-800">BADAN PANGAN</span>
                <span className="text-[10px] font-black leading-tight text-green-800">NASIONAL</span>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="p-3 border-b-[2px] border-black text-center flex flex-col justify-center items-center">
            {config.title.split('\n').map((line, i) => (
              <h1 key={i} style={getTextStyle(fontStyles?.title)} className="tracking-wide leading-tight uppercase">{line}</h1>
            ))}
          </div>

          {/* Subtitle Section */}
          <div className="p-3 border-b-[2px] border-black text-center py-6">
            <h2 className="font-bold text-[14px] leading-snug uppercase break-words px-2">
              {activeLayerName.toUpperCase() === 'KOMPOSIT' ? 'INDIKATOR KOMPOSIT' : `INDIKATOR ${activeLayerName.toUpperCase()}`}
            </h2>
          </div>

          {/* Legend Section */}
          <div className="p-3 border-b-[2px] border-black shrink-0 pb-4 flex flex-col items-center">
            <h3 className="font-black text-[11px] text-center mb-3 w-full">LEGENDA</h3>
            <div className="flex flex-col gap-2 w-fit">
              {priorities.map(p => (
                <div key={p} className="flex gap-2 items-center text-left">
                  <div 
                    className="w-5 h-3 border border-black flex-shrink-0"
                    style={{ backgroundColor: labels[p as keyof typeof labels].fill }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold leading-none">
                      {isProvinsi ? `Kecamatan Prioritas ${p}` : `Kelurahan Prioritas ${p}`}
                    </span>
                    <span className="text-[8px] leading-tight">{labels[p as keyof typeof labels].label}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex flex-col gap-2 w-fit">
              <div className="flex items-center gap-2 text-left">
                <div className="w-5 border-t-2 border-black flex-shrink-0"></div>
                <span className="text-[9px]">{isProvinsi ? 'Batas Kabupaten/Kota' : 'Batas Kecamatan'}</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <div className="w-5 border-t border-black flex-shrink-0"></div>
                <span className="text-[9px]">{isProvinsi ? 'Batas Kecamatan' : 'Batas Kelurahan'}</span>
              </div>
            </div>
          </div>

          {/* Scale Bar — between Legend and Sources per mockup */}
          <div className="px-4 py-2 border-b-[2px] border-black shrink-0 flex flex-col items-center justify-center">
            <div className="w-28">
              <div className="flex justify-between w-full mb-1 text-[9px] font-bold">
                <span>0</span>
                <span>1</span>
                <span>2 km</span>
              </div>
              <div className="w-full h-2 border-x-[2px] border-b-[2px] border-black flex">
                <div className="w-1/2 h-full bg-black"></div>
                <div className="w-1/2 h-full bg-white border-l-[2px] border-black"></div>
              </div>
            </div>
          </div>

          {/* Sources Section */}
          <div className="p-3 leading-tight flex-1 flex flex-col text-[14px]">
            <h3 className="font-bold text-center mb-2 text-[10px]">SUMBER DATA</h3>
            <div className="flex flex-col gap-1 whitespace-pre-wrap flex-1" style={getTextStyle(fontStyles?.sources)}>
              {config.sources}
            </div>
          </div>

        </div>

        {/* Footer Section */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t-[2px] border-black p-3 z-10 flex text-[9px]">
          <div className="w-[70%] pr-4 border-r-[2px] border-black whitespace-pre-wrap leading-snug" style={getTextStyle(fontStyles?.footer)}>
            {config.footer}
          </div>
          <div className="w-[30%] pl-2 flex items-center justify-center">
            {/* Empty space for signature or QR if needed */}
          </div>
        </div>

      </div>
    </div>
  );
}
