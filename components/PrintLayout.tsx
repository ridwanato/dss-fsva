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

  const containerClass = isLandscape 
    ? 'print-only bg-white w-[297mm] h-[210mm] overflow-hidden p-[8mm] mx-auto text-black relative'
    : 'print-only bg-white w-[210mm] h-[297mm] overflow-hidden p-[10mm] mx-auto text-black relative';

  return (
    <div className={containerClass} style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="border-[2px] border-black w-full h-full flex flex-col relative">
        
        {/* Main Map Area (Left side) */}
        <div className="absolute top-0 left-0 bottom-0 w-[70%] border-r-[2px] border-black bg-[#99d9ea] overflow-hidden">
          {/* Base Map Image */}
          <img 
            src={mapImage} 
            alt="Map Print View" 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)', zIndex: 0, display: 'block' }}
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
          <div className={`${isLandscape ? 'p-2' : 'p-3'} border-b-[2px] border-black flex flex-col gap-2 justify-center`}>
            <div className="flex items-center gap-2 px-2">
              <div className={`${isLandscape ? 'w-9 h-9' : 'w-12 h-12'} flex items-center justify-center shrink-0`}>
                <img src={config.logoPemda} alt="Logo Pemda" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col w-full" style={getTextStyle(fontStyles?.govName)}>
                {config.govName.split('\n').map((line, i) => (
                   <span key={i} className="leading-tight uppercase">{line}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 px-2">
              <div className={`${isLandscape ? 'w-9 h-9' : 'w-12 h-12'} flex items-center justify-center shrink-0`}>
                <img src={config.logoBapanas} alt="Logo Bapanas" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col ml-1">
                <span className="text-[10px] font-black leading-tight text-green-800">BADAN PANGAN</span>
                <span className="text-[10px] font-black leading-tight text-green-800">NASIONAL</span>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className={`${isLandscape ? 'p-2' : 'p-3'} border-b-[2px] border-black text-center flex flex-col justify-center items-center`}>
            {config.title.split('\n').map((line, i) => (
              <h1 key={i} style={getTextStyle(fontStyles?.title)} className="tracking-wide leading-tight uppercase">{line}</h1>
            ))}
          </div>

          {/* Subtitle Section */}
          <div className={`${isLandscape ? 'p-1.5 py-2' : 'p-3 py-4'} border-b-[2px] border-black text-center`}>
            <h2 className="font-bold text-[12px] leading-snug uppercase break-words px-1">
              {activeLayerName.toUpperCase() === 'KOMPOSIT' ? 'INDIKATOR KOMPOSIT' : `INDIKATOR ${activeLayerName.toUpperCase()}`}
            </h2>
          </div>

          {/* Legend Section */}
          <div className={`${isLandscape ? 'p-1.5 pb-2' : 'p-3 pb-4'} border-b-[2px] border-black shrink-0 flex flex-col items-center`}>
            <h3 className="font-black text-[10px] text-center mb-1.5 w-full">LEGENDA</h3>
            <div className="flex flex-col gap-1 w-fit">
              {priorities.map(p => (
                <div key={p} className="flex gap-2 items-center text-left">
                  <div 
                    className="w-4 h-2.5 border border-black flex-shrink-0"
                    style={{ backgroundColor: labels[p as keyof typeof labels].fill }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[8.5px] font-bold leading-none">
                      {isProvinsi ? `Kecamatan Prioritas ${p}` : `Kelurahan Prioritas ${p}`}
                    </span>
                    <span className="text-[7.5px] leading-tight">{labels[p as keyof typeof labels].label}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-2 flex flex-col gap-1 w-fit">
              <div className="flex items-center gap-2 text-left">
                <div className="w-4 border-t-2 border-black flex-shrink-0"></div>
                <span className="text-[8px]">{isProvinsi ? 'Batas Kabupaten/Kota' : 'Batas Kecamatan'}</span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <div className="w-4 border-t border-black flex-shrink-0"></div>
                <span className="text-[8px]">{isProvinsi ? 'Batas Kecamatan' : 'Batas Kelurahan'}</span>
              </div>
            </div>
          </div>

          {/* Scale Bar */}
          <div className="px-3 py-1.5 border-b-[2px] border-black shrink-0 flex flex-col items-center justify-center">
            <div className="w-24">
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

          {/* Sources Section */}
          <div className={`${isLandscape ? 'p-1.5' : 'p-3'} leading-tight flex-1 flex flex-col text-[12px]`}>
            <h3 className="font-bold text-center mb-1 text-[9px]">SUMBER DATA</h3>
            <div className="flex flex-col gap-0.5 whitespace-pre-wrap flex-1 overflow-hidden" style={getTextStyle(fontStyles?.sources)}>
              {config.sources}
            </div>
          </div>

        </div>

        {/* Footer Section */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t-[2px] border-black p-2 z-10 flex text-[8.5px]">
          <div className="w-[70%] pr-3 border-r-[2px] border-black whitespace-pre-wrap leading-tight" style={getTextStyle(fontStyles?.footer)}>
            {config.footer}
          </div>
          <div className="w-[30%] pl-2 flex items-center justify-center">
            {/* Signature or QR placeholder */}
          </div>
        </div>

      </div>
    </div>
  );
}
