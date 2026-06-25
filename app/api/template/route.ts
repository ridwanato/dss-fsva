import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const headers = [
      'No',
      'Nama Kecamatan',
      'Kode Desa BPS',
      'Nama Desa/Kelurahan',
      'Produksi Padi (ton)',
      'Produksi Jagung (ton)',
      'Produksi Ubi Kayu (ton)',
      'Produksi Ubi Jalar (ton)',
      'Produksi Sagu (ton)',
      'Produksi Pisang (ton)',
      'Jumlah Penduduk',
      'Konsumsi Energi (kkal/kap/hr)',
      'Konsumsi Protein Hewani (gr/kap/hr)',
      'Cadangan CBPD (ton)',
      'Cadangan LPM (ton)',
      '% Penduduk Miskin (desil 1+2)',
      'CV Harga Beras (%)',
      'CV Harga Ayam (%)',
      'CV Harga Telur (%)',
      'CV Harga Minyak (%)',
      'PoU (%)',
      'Rata-rata Lama Sekolah Perempuan (tahun)',
      '% RT Tanpa Air Bersih',
      'Skor PPH Konsumsi',
      '% Balita Stunting'
    ];

    // Buat data array dengan baris pertama berisi Tahun Kalkulasi,
    // baris kedua kosong sebagai pemisah, dan baris ketiga sebagai header.
    const wsData = [
      ['TAHUN KALKULASI (Silakan Ubah):', 2025],
      [], // Baris kosong pemisah
      headers,
      // Contoh format baris (kosongkan nilainya kecuali No)
      [1, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    
    // Auto-width columns slightly
    const colWidths = headers.map(h => ({ wch: Math.max(15, h.length) }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Indikator FSVA');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="Template_Data_Indikator_FSVA.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
