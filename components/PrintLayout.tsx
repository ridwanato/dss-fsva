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
}

export default function PrintLayout({ 
  mapImage, 
  activeLayerName, 
  activeLayer = 'prioritas', 
  config,
  fontStyles
}: PrintLayoutProps) {
  if (!mapImage) return null;

  const isStunting = activeLayer === 'p_stunting';
  const priorities = isStunting ? ([1, 2, 3, 4] as const) : ([1, 2, 3, 4, 5, 6] as const);
  const labels = isStunting ? STUNTING_PRIORITY_LABELS : PRIORITY_LABELS;

  // Helper to convert FontStyle to inline CSS style object
  const getTextStyle = (style?: FontStyle) => {
    if (!style) return {};
    return {
      fontFamily: style.fontFamily,
      fontSize: `${style.fontSize}pt`,
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.underline ? 'underline' : 'none',
      textAlign: style.align,
      whiteSpace: 'pre-wrap' as const
    };
  };

  return (
    <div className="print-only bg-white w-[210mm] h-[297mm] overflow-hidden p-[10mm] mx-auto text-black font-sans relative">
      <div className="border-[2px] border-black w-full h-full flex flex-col relative">
        
        {/* Main Map Area (Left side) */}
        <div className="absolute top-0 left-0 bottom-0 w-[70%] border-r-[2px] border-black bg-[#99d9ea] overflow-hidden">
          {/* Base Map Image */}
          <img 
            src={mapImage} 
            alt="Map Print View" 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1)', zIndex: 0, display: 'block' }}
          />

          {/* Coordinate Grids (Top) */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-white/0 flex justify-between px-8 text-[8px]">
            <span>105.920</span>
            <span>105.960</span>
            <span>106.000</span>
            <span>106.040</span>
            <span>106.080</span>
          </div>

          {/* Coordinate Grids (Left) */}
          <div className="absolute top-0 bottom-0 left-0 w-6 bg-white/0 flex flex-col justify-between py-12 text-[8px] transform -rotate-90 origin-left translate-y-[-100%] ml-2">
            <span className="transform rotate-90">-5.840</span>
            <span className="transform rotate-90">-5.880</span>
            <span className="transform rotate-90">-5.920</span>
            <span className="transform rotate-90">-5.960</span>
            <span className="transform rotate-90">-6.000</span>
            <span className="transform rotate-90">-6.040</span>
            <span className="transform rotate-90">-6.080</span>
            <span className="transform rotate-90">-6.120</span>
          </div>

          {/* Scale Bar */}
          <div className="absolute bottom-[40px] left-6 bg-white/90 px-3 py-2 border-[2px] border-black text-[10px] font-bold shadow-md z-20">
            <div className="flex justify-between w-24 mb-1">
              <span>0</span>
              <span>1</span>
              <span>2 km</span>
            </div>
            <div className="w-24 h-2 border-x-[2px] border-b-[2px] border-black flex">
              <div className="w-1/2 h-full bg-black"></div>
              <div className="w-1/2 h-full bg-white border-l-[2px] border-black"></div>
            </div>
          </div>

          <div className="absolute top-1/3 left-10 text-gray-500/50 font-bold text-xs italic tracking-widest">
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
          <div className="p-3 border-b-[2px] border-black shrink-0 pb-4">
            <h3 className="font-black text-[11px] text-center mb-3">LEGENDA</h3>
            <div className="flex flex-col gap-2">
              {priorities.map(p => (
                <div key={p} className="flex gap-2 items-start">
                  <div 
                    className="w-5 h-3 border border-black mt-0.5 flex-shrink-0"
                    style={{ backgroundColor: labels[p as keyof typeof labels].fill }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold leading-none">Kelurahan Prioritas {p}</span>
                    <span className="text-[8px] leading-tight">{labels[p as keyof typeof labels].label}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-5 border-t-2 border-black"></div>
                <span className="text-[9px]">Batas Kecamatan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 border-t border-black"></div>
                <span className="text-[9px]">Batas Kelurahan</span>
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
