import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DSS FSVA - Decision Support System Food Security and Vulnerability Atlas',
  description: 'Aplikasi Analisis Ketahanan dan Kerentanan Pangan Tingkat Desa/Kelurahan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        <nav className="bg-white shadow-sm border-b relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/" className="flex-shrink-0 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-xl">
                    F
                  </div>
                  <span className="font-bold text-xl text-gray-800 tracking-tight">DSS FSVA</span>
                </Link>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  <Link href="/map" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Peta Interaktif
                  </Link>
                  <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link href="/entry" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Data Entry
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 flex flex-col relative">
          {children}
        </main>
      </body>
    </html>
  )
}
