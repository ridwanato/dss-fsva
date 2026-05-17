import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

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
        <Navbar />
        <main className="flex-1 flex flex-col relative w-full h-full">
          {children}
        </main>
      </body>
    </html>
  )
}
