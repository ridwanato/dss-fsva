'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="absolute top-0 left-0 z-[60] pointer-events-none no-print">
      <nav className="inline-flex bg-white shadow-md border-b border-r border-gray-200 rounded-br-2xl h-12 md:h-16 items-center pointer-events-auto transition-all duration-300 overflow-hidden">
        
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
        <div className={`flex items-center space-x-2 md:space-x-6 whitespace-nowrap transition-all duration-300 ${expanded ? 'max-w-[500px] px-4 opacity-100' : 'max-w-0 px-0 opacity-0'} md:max-w-[500px] md:px-8 md:opacity-100`}>
          <Link href="/map" className={`border-b-2 text-xs md:text-sm font-semibold transition-colors px-1 py-3 md:py-5 ${isActive('/map') ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-300'}`}>
            Peta Interaktif
          </Link>
          <Link href="/dashboard" className={`border-b-2 text-xs md:text-sm font-semibold transition-colors px-1 py-3 md:py-5 ${isActive('/dashboard') ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-300'}`}>
            Dashboard
          </Link>
          <Link href="/entry" className={`border-b-2 text-xs md:text-sm font-semibold transition-colors px-1 py-3 md:py-5 ${isActive('/entry') ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-300'}`}>
            Data Entry
          </Link>
        </div>

      </nav>
    </div>
  );
}
