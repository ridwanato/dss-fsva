import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  AlignmentType,
  ShadingType
} from 'docx';
import { PRIORITY_LABELS, WEIGHTS } from '@/lib/fsva/constants';

/**
 * Trigger file download in browser from a Blob
 */
function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download DOCX for AI Insight report
 */
export async function downloadAiInsightDocx(
  kabupaten: string,
  tahun: number | string,
  rawMarkdown: string
) {
  const lines = rawMarkdown.split('\n');
  const children: any[] = [];

  // Title Header
  children.push(
    new Paragraph({
      text: `LAPORAN ANALISIS AI INSIGHT FSVA`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Wilayah: `, bold: true }),
        new TextRun({ text: `${kabupaten.toUpperCase()} | ` }),
        new TextRun({ text: `Tahun: `, bold: true }),
        new TextRun({ text: `${tahun}` })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 }
    })
  );

  // Parse lines into Document paragraphs
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      return;
    }

    if (trimmed.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^#\s+/, '').replace(/\*\*/g, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        })
      );
    } else if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^##\s+/, '').replace(/\*\*/g, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );
    } else if (trimmed.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^###\s+/, '').replace(/\*\*/g, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 }
        })
      );
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.match(/^\d+\.\s/)) {
      const cleanText = trimmed.replace(/^[\*\-\d\.]+\s+/, '');
      const textRuns = parseInlineFormatting(cleanText);
      children.push(
        new Paragraph({
          children: textRuns,
          bullet: { level: 0 },
          spacing: { after: 80 }
        })
      );
    } else {
      const textRuns = parseInlineFormatting(trimmed);
      children.push(
        new Paragraph({
          children: textRuns,
          spacing: { after: 140 }
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = kabupaten.replace(/[^a-zA-Z0-9]/g, '_');
  saveBlob(blob, `Laporan_AI_Insight_FSVA_${cleanName}_${tahun}.docx`);
}

/**
 * Generate and download DOCX for Faktor Berpengaruh (Dashboard)
 */
export async function downloadFaktorBerpengaruhDocx(
  kabupaten: string,
  tahun: number | string,
  data: any[]
) {
  // 1. Calculate Priority Distribution
  const priorityCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  data.forEach(row => {
    if (row.prioritas) priorityCounts[row.prioritas]++;
  });
  const totalDesa = data.length;

  // 2. Calculate P1-P3 Factors
  const faktorMapP1P3 = {
    'NCPR (Ketersediaan Pangan)': { sum: 0, weight: WEIGHTS.ncpr, id: 'p_ncpr' },
    'Energi / AKE (Konsumsi)': { sum: 0, weight: WEIGHTS.energy, id: 'p_energy' },
    'Protein (Konsumsi)': { sum: 0, weight: WEIGHTS.protein, id: 'p_protein' },
    'Cadangan Pangan': { sum: 0, weight: WEIGHTS.cadangan, id: 'p_cadangan' },
    'Kemiskinan (Akses Pangan)': { sum: 0, weight: WEIGHTS.poverty, id: 'p_poverty' },
    'Harga / CV (Stabilitas)': { sum: 0, weight: WEIGHTS.cv_harga, id: 'p_cv_harga' },
    'PoU (Prevalence of Undernourishment)': { sum: 0, weight: WEIGHTS.pou, id: 'p_pou' },
    'Lama Sekolah (Pemanfaatan)': { sum: 0, weight: WEIGHTS.sekolah, id: 'p_sekolah' },
    'Akses Air Bersih': { sum: 0, weight: WEIGHTS.air, id: 'p_air' },
    'Skor PPH (Kualitas Pangan)': { sum: 0, weight: WEIGHTS.pph, id: 'p_pph' },
    'Stunting (Kesehatan)': { sum: 0, weight: WEIGHTS.stunting, id: 'p_stunting' },
  };

  data.forEach(row => {
    if (row.prioritas <= 3) {
      Object.keys(faktorMapP1P3).forEach(key => {
        const k = key as keyof typeof faktorMapP1P3;
        const p_val = row[faktorMapP1P3[k].id];
        if (p_val <= 3) {
          faktorMapP1P3[k].sum += faktorMapP1P3[k].weight;
        }
      });
    }
  });

  const barDataP1P3 = Object.keys(faktorMapP1P3)
    .map(key => ({
      name: key,
      weight: Math.round(faktorMapP1P3[key as keyof typeof faktorMapP1P3].sum * 10) / 10
    }))
    .filter(item => item.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  // 3. Calculate P4-P6 Factors
  const faktorMapP4P6 = {
    'NCPR (Ketersediaan Pangan)': { sum: 0, weight: WEIGHTS.ncpr, id: 'p_ncpr' },
    'Energi / AKE (Konsumsi)': { sum: 0, weight: WEIGHTS.energy, id: 'p_energy' },
    'Protein (Konsumsi)': { sum: 0, weight: WEIGHTS.protein, id: 'p_protein' },
    'Cadangan Pangan': { sum: 0, weight: WEIGHTS.cadangan, id: 'p_cadangan' },
    'Kemiskinan (Akses Pangan)': { sum: 0, weight: WEIGHTS.poverty, id: 'p_poverty' },
    'Harga / CV (Stabilitas)': { sum: 0, weight: WEIGHTS.cv_harga, id: 'p_cv_harga' },
    'PoU (Prevalence of Undernourishment)': { sum: 0, weight: WEIGHTS.pou, id: 'p_pou' },
    'Lama Sekolah (Pemanfaatan)': { sum: 0, weight: WEIGHTS.sekolah, id: 'p_sekolah' },
    'Akses Air Bersih': { sum: 0, weight: WEIGHTS.air, id: 'p_air' },
    'Skor PPH (Kualitas Pangan)': { sum: 0, weight: WEIGHTS.pph, id: 'p_pph' },
    'Stunting (Kesehatan)': { sum: 0, weight: WEIGHTS.stunting, id: 'p_stunting' },
  };

  data.forEach(row => {
    if (row.prioritas >= 4) {
      Object.keys(faktorMapP4P6).forEach(key => {
        const k = key as keyof typeof faktorMapP4P6;
        const p_val = row[faktorMapP4P6[k].id];
        if (p_val <= 3) {
          faktorMapP4P6[k].sum += faktorMapP4P6[k].weight;
        }
      });
    }
  });

  const barDataP4P6 = Object.keys(faktorMapP4P6)
    .map(key => ({
      name: key,
      weight: Math.round(faktorMapP4P6[key as keyof typeof faktorMapP4P6].sum * 10) / 10
    }))
    .filter(item => item.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  const docChildren: any[] = [];

  // Header Title
  docChildren.push(
    new Paragraph({
      text: `LAPORAN ANALISIS FAKTOR BERPENGARUH FSVA`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Wilayah: `, bold: true }),
        new TextRun({ text: `${kabupaten.toUpperCase()} | ` }),
        new TextRun({ text: `Tahun: `, bold: true }),
        new TextRun({ text: `${tahun} | ` }),
        new TextRun({ text: `Total Wilayah: `, bold: true }),
        new TextRun({ text: `${totalDesa} Desa/Kelurahan` })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 }
    })
  );

  // SEGMEN 1: Distribusi Prioritas FSVA
  docChildren.push(
    new Paragraph({
      text: `SEGMEN 1: DISTRIBUSI PRIORITAS FSVA`,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 160 }
    }),
    new Paragraph({
      text: `Berikut adalah ringkasan sebaran tingkat ketahanan dan kerentanan pangan di ${kabupaten.toUpperCase()}:`,
      spacing: { after: 200 }
    })
  );

  // Priority Table
  const tableRowsPrio = [
    new TableRow({
      children: [
        createHeaderCell('Tingkat Prioritas', 30),
        createHeaderCell('Kategori Status', 35),
        createHeaderCell('Jumlah Wilayah', 20),
        createHeaderCell('Persentase', 15)
      ]
    })
  ];

  [1, 2, 3, 4, 5, 6].forEach(prioKey => {
    const count = priorityCounts[prioKey] || 0;
    const pct = totalDesa > 0 ? ((count / totalDesa) * 100).toFixed(1) : '0';
    const info = PRIORITY_LABELS[prioKey as keyof typeof PRIORITY_LABELS];
    tableRowsPrio.push(
      new TableRow({
        children: [
          createDataCell(`Prioritas ${prioKey}`, false),
          createDataCell(info.label, false),
          createDataCell(`${count} Desa`, true),
          createDataCell(`${pct}%`, true)
        ]
      })
    );
  });

  docChildren.push(
    new Table({
      rows: tableRowsPrio,
      width: { size: 100, type: WidthType.PERCENTAGE }
    }),
    new Paragraph({ text: '', spacing: { after: 360 } })
  );

  // SEGMEN 2: Faktor Berpengaruh P1-P3
  docChildren.push(
    new Paragraph({
      text: `SEGMEN 2: FAKTOR BERPENGARUH P1 - P3 (TOTAL BOBOT)`,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 160 }
    }),
    new Paragraph({
      text: `Indikator utama yang paling mempengaruhi kerentanan di wilayah Prioritas 1 s.d. 3 (Sangat Rentan s.d. Agak Rentan):`,
      spacing: { after: 200 }
    })
  );

  if (barDataP1P3.length === 0) {
    docChildren.push(
      new Paragraph({
        text: `(Tidak ada wilayah yang tergolong rentan P1-P3 di daerah ini)`,
        spacing: { after: 240 }
      })
    );
  } else {
    const tableRowsP1P3 = [
      new TableRow({
        children: [
          createHeaderCell('Peringkat', 15),
          createHeaderCell('Indikator Berpengaruh', 60),
          createHeaderCell('Total Bobot Dampak', 25)
        ]
      })
    ];

    barDataP1P3.forEach((item, idx) => {
      tableRowsP1P3.push(
        new TableRow({
          children: [
            createDataCell(`#${idx + 1}`, true),
            createDataCell(item.name, false),
            createDataCell(`${item.weight.toFixed(1)}`, true)
          ]
        })
      );
    });

    docChildren.push(
      new Table({
        rows: tableRowsP1P3,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }),
      new Paragraph({ text: '', spacing: { after: 360 } })
    );
  }

  // SEGMEN 3: Faktor Berpengaruh P4-P6
  docChildren.push(
    new Paragraph({
      text: `SEGMEN 3: FAKTOR BERPENGARUH P4 - P6 (TOTAL BOBOT)`,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 160 }
    }),
    new Paragraph({
      text: `Indikator yang perlu diwaspadai di wilayah Prioritas 4 s.d. 6 (Agak Tahan s.d. Sangat Tahan) agar ketahanan pangan tetap terjaga:`,
      spacing: { after: 200 }
    })
  );

  if (barDataP4P6.length === 0) {
    docChildren.push(
      new Paragraph({
        text: `(Tidak ada indikator indikatif kerentanan di daerah tahan P4-P6)`,
        spacing: { after: 240 }
      })
    );
  } else {
    const tableRowsP4P6 = [
      new TableRow({
        children: [
          createHeaderCell('Peringkat', 15),
          createHeaderCell('Indikator Perhatian', 60),
          createHeaderCell('Total Bobot Dampak', 25)
        ]
      })
    ];

    barDataP4P6.forEach((item, idx) => {
      tableRowsP4P6.push(
        new TableRow({
          children: [
            createDataCell(`#${idx + 1}`, true),
            createDataCell(item.name, false),
            createDataCell(`${item.weight.toFixed(1)}`, true)
          ]
        })
      );
    });

    docChildren.push(
      new Table({
        rows: tableRowsP4P6,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }),
      new Paragraph({ text: '', spacing: { after: 360 } })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = kabupaten.replace(/[^a-zA-Z0-9]/g, '_');
  saveBlob(blob, `Laporan_Faktor_Berpengaruh_FSVA_${cleanName}_${tahun}.docx`);
}

/**
 * Helper to parse bold markdown formatting (**bold**) into docx TextRuns
 */
function parseInlineFormatting(text: string): TextRun[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return new TextRun({
        text: part.slice(2, -2),
        bold: true
      });
    }
    return new TextRun({ text: part });
  });
}

function createHeaderCell(text: string, widthPct: number): TableCell {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { fill: '1E1B4B', type: ShadingType.CLEAR },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: 'FFFFFF' })],
        alignment: AlignmentType.CENTER
      })
    ]
  });
}

function createDataCell(text: string, isCenter: boolean = false): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text })],
        alignment: isCenter ? AlignmentType.CENTER : AlignmentType.LEFT
      })
    ]
  });
}
