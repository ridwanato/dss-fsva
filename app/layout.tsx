import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DSS FSVA - Decision Support System Food Security and Vulnerability Atlas',
  description: 'Aplikasi Analisis Ketahanan dan Kerentanan Pangan Tingkat Desa/Kelurahan',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 h-screen overflow-hidden flex flex-col`}>
        <div className="absolute top-0 left-0 z-50 pointer-events-none">
          <nav className="inline-flex bg-white shadow-md border-b border-r border-gray-200 rounded-br-2xl pr-8 pl-4 sm:pl-6 h-16 items-center pointer-events-auto">
            <Link href="/" className="flex-shrink-0 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-xl">
                F
              </div>
              <span className="font-bold text-xl text-gray-800 tracking-tight">DSS FSVA</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <Link href="/map" className="border-transparent text-gray-500 hover:text-green-700 hover:border-green-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors">
                Peta Interaktif
              </Link>
              <Link href="/dashboard" className="border-transparent text-gray-500 hover:text-green-700 hover:border-green-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors">
                Dashboard
              </Link>
              <Link href="/entry" className="border-transparent text-gray-500 hover:text-green-700 hover:border-green-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-colors">
                Data Entry
              </Link>
            </div>
          </nav>
        </div>
        <main className="flex-1 flex flex-col relative w-full h-full">
          {children}
        </main>
      </body>
    </html>
  )
}
