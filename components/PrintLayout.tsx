import { PRIORITY_LABELS } from '@/lib/fsva/constants';

interface PrintLayoutProps {
  mapImage: string | null;
  activeLayerName: string;
}

export default function PrintLayout({ mapImage, activeLayerName }: PrintLayoutProps) {
  if (!mapImage) return null;

  const priorities = [1, 2, 3, 4, 5, 6] as const;

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

          {/* Inset Map Box Removed by Request */}

          {/* North Arrow */}
          <div className="absolute top-4 right-4 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[20px] border-b-blue-800"></div>
            <div className="w-6 h-6 bg-white/80 rounded-full border border-blue-800 flex items-center justify-center -mt-2">
              <span className="text-blue-800 font-bold text-[10px]">U</span>
            </div>
          </div>

          {/* Scale Bar */}
          <div className="absolute bottom-6 left-6 bg-white/90 px-2 py-1 border border-black text-[10px] font-bold">
            <div className="flex justify-between w-24 mb-1">
              <span>0</span>
              <span>1</span>
              <span>2 km</span>
            </div>
            <div className="w-24 h-2 border-x-2 border-b-2 border-black flex">
              <div className="w-1/2 h-full bg-black"></div>
              <div className="w-1/2 h-full bg-white"></div>
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
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo-cilegon.png" alt="Logo Cilegon" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black leading-tight">PEMERINTAH</span>
                <span className="text-[10px] font-black leading-tight">KOTA CILEGON</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo-bapanas.png" alt="Logo Bapanas" className="w-full h-full object-contain scale-125" />
              </div>
              <div className="flex flex-col ml-1">
                <span className="text-[10px] font-black leading-tight text-green-800">BADAN PANGAN</span>
                <span className="text-[10px] font-black leading-tight text-green-800">NASIONAL</span>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="p-3 border-b-[2px] border-black text-center">
            <h1 className="font-black text-[12px] tracking-wide leading-tight">FSVA KOTA CILEGON</h1>
            <h1 className="font-black text-[12px] tracking-wide leading-tight">TAHUN 2025</h1>
          </div>

          {/* Subtitle Section */}
          <div className="p-3 border-b-[2px] border-black text-center py-6">
            <h2 className="font-bold text-[11px] mb-2 uppercase">{activeLayerName}</h2>
          </div>

          {/* Legend Section */}
          <div className="p-3 border-b-[2px] border-black flex-1">
            <h3 className="font-black text-[11px] text-center mb-3">LEGENDA</h3>
            <div className="flex flex-col gap-2">
              {priorities.map(p => (
                <div key={p} className="flex gap-2 items-start">
                  <div 
                    className="w-5 h-3 border border-black mt-0.5 flex-shrink-0"
                    style={{ backgroundColor: PRIORITY_LABELS[p].fill }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold leading-none">Kelurahan Prioritas {p}</span>
                    <span className="text-[8px] leading-tight">{PRIORITY_LABELS[p].label}</span>
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
          <div className="p-3 border-b-[2px] border-black text-[7px] leading-tight flex-1">
            <h3 className="font-bold text-center mb-2 text-[9px]">SUMBER DATA</h3>
            <ol className="list-decimal pl-3 flex flex-col gap-1">
              <li>Data Penduduk Kota Cilegon (DKB), DISDUKCAPIL, 2024.</li>
              <li>Data PPH Konsumsi, BAPANAS, 2024.</li>
              <li>Data CPPD, DKPP Kota Cilegon, 2024.</li>
              <li>Data DTSEN, Dinas Sosial Kota Cilegon, 2024.</li>
              <li>Data PoU, BAPANAS, 2024.</li>
              <li>Data Susenas BPS, Podes, SKI (diolah BAPANAS), 2024.</li>
              <li>Data Harga Komoditas, Disperindag, 2024.</li>
              <li>Peta Batas Administrasi BPS & BIG.</li>
            </ol>
          </div>

        </div>

        {/* Footer Section */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t-[2px] border-black p-3 z-10 flex text-[9px]">
          <div className="w-[70%] pr-4 border-r-[2px] border-black">
            <p className="mb-1">Disusun oleh:</p>
            <p className="font-bold">TIM PENYUSUN PETA KETAHANAN DAN KERENTANAN PANGAN TAHUN 2025</p>
            <p className="font-bold">BIDANG KETAHANAN PANGAN</p>
            <p className="font-bold">DINAS KETAHANAN PANGAN DAN PERTANIAN KOTA CILEGON</p>
            <p>Jl. Kubang Laban No. 56 Kel. Sukmajaya, Kec. Jombang, Kota Cilegon</p>
            <p>Telp: (0254) 390582</p>
          </div>
          <div className="w-[30%] pl-2 flex items-center justify-center">
            {/* Empty space for signature or QR if needed */}
          </div>
        </div>

      </div>
    </div>
  );
}
