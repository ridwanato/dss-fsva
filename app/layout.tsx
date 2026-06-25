import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FSVA Indonesia - Food Security and Vulnerability Atlas | Pemetaan Ketahanan dan Kerawanan Pangan',
  description: 'Platform FSVA Indonesia untuk analisis ketahanan dan kerentanan pangan tingkat desa dan kelurahan. Mendukung peta interaktif, dashboard analisis, kalkulasi otomatis sesuai Petunjuk Teknis Badan Pangan Nasional, ekspor Excel dan cetak PDF.',
  keywords: [
    'FSVA', 'Food Security and Vulnerability Atlas', 'Ketahanan Pangan', 'Kerawanan Pangan',
    'Peta Ketahanan Pangan', 'Peta Kerawanan Pangan', 'WebGIS Ketahanan Pangan',
    'Analisis Ketahanan Pangan', 'Badan Pangan Nasional', 'Bapanas', 'Pemetaan Desa',
    'Pemetaan Kelurahan', 'Atlas Ketahanan Pangan', 'Indeks Ketahanan Pangan',
    'Dashboard Ketahanan Pangan', 'GIS Ketahanan Pangan', 'Geoportal Ketahanan Pangan',
    'FSVA Indonesia', 'FSVA Kabupaten', 'FSVA Kota', 'FSVA Desa', 'FSVA Kelurahan',
    'Food Security Mapping', 'Food Vulnerability Mapping', 'Peta Prioritas FSVA',
    'Ketersediaan Pangan', 'Keterjangkauan Pangan', 'Pemanfaatan Pangan',
    'Pangan Nasional', 'Pangan Daerah', 'Peta Pangan Indonesia'
  ],
  metadataBase: new URL('https://fsva.my.id'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: 'https://fsva.my.id',
    title: 'FSVA Indonesia - Food Security and Vulnerability Atlas | Pemetaan Ketahanan dan Kerawanan Pangan',
    description: 'Platform FSVA Indonesia untuk analisis ketahanan dan kerentanan pangan tingkat desa dan kelurahan. Mendukung peta interaktif, dashboard analisis, kalkulasi otomatis sesuai Petunjuk Teknis Badan Pangan Nasional, ekspor Excel dan cetak PDF.',
    siteName: 'FSVA Indonesia',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'FSVA Indonesia Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'FSVA Indonesia - Food Security and Vulnerability Atlas | Pemetaan Ketahanan dan Kerawanan Pangan',
    description: 'Platform FSVA Indonesia untuk analisis ketahanan dan kerentanan pangan tingkat desa dan kelurahan. Mendukung peta interaktif, dashboard analisis, kalkulasi otomatis sesuai Petunjuk Teknis Badan Pangan Nasional, ekspor Excel dan cetak PDF.',
    images: ['/icon.svg'],
  },
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "FSVA Indonesia",
    "applicationCategory": "GovernmentApplication",
    "operatingSystem": "Web",
    "url": "https://fsva.my.id",
    "description": "Food Security and Vulnerability Atlas untuk pemetaan ketahanan dan kerawanan pangan tingkat desa dan kelurahan.",
    "keywords": "FSVA, ketahanan pangan, kerawanan pangan, food security, food vulnerability, webgis"
  };

  return (
    <html lang="id">
      <head>
        <meta name="google-site-verification" content="google3a48f5f895510c57" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-app-gradient h-screen w-screen overflow-hidden flex flex-col md:flex-row text-slate-900`}>
        <Navbar />
        <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}
