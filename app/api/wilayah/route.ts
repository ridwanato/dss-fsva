import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import * as XLSX from 'xlsx';
import fs from 'fs';

let cachedWilayah: { provinsi: string; kabupaten: string[] }[] | null = null;

export async function GET() {
  if (cachedWilayah) {
    return NextResponse.json({ success: true, data: cachedWilayah });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'KODE-WILAYAH-KEPMENDAGRI-2025-FIX (1).xlsx');
    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    const mapping: Record<string, Set<string>> = {};

    // First row is header: Row 0
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 8) continue;
      const provName = String(row[7] || '').trim().toUpperCase();
      const kabName = String(row[5] || '').trim().toUpperCase();
      if (!provName || !kabName) continue;

      if (!mapping[provName]) {
        mapping[provName] = new Set();
      }
      mapping[provName].add(kabName);
    }

    const data = Object.keys(mapping).sort().map(prov => ({
      provinsi: prov,
      kabupaten: Array.from(mapping[prov]).sort()
    }));

    cachedWilayah = data;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Failed to parse wilayah data:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
