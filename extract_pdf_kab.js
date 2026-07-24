const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('public/Keputusan Sekretaris Utama Badan Pangan Nasional Nomor 21 Tahun 2026 kabupaten kota.pdf');
const str = buf.toString('binary');

// Decode TJ/Tj stream operators into readable text
function decodeTJText(stream) {
  let result = [];
  const tjRegex = /\[([^\]]*)\]\s*TJ/g;
  const tjSimpleRegex = /\(([^)]*)\)\s*Tj/g;
  
  let m;
  while ((m = tjRegex.exec(stream)) !== null) {
    const content = m[1];
    const parts = [];
    const partRegex = /\(([^)]*)\)/g;
    let pm;
    while ((pm = partRegex.exec(content)) !== null) {
      let text = pm[1];
      text = text.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
      parts.push(text);
    }
    if (parts.length > 0) result.push(parts.join(''));
  }
  
  while ((m = tjSimpleRegex.exec(stream)) !== null) {
    let text = m[1];
    text = text.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    result.push(text);
  }
  
  return result.join(' ');
}

let allText = [];
let pos = 0;
let pageNum = 0;

while (true) {
  const streamStart = str.indexOf('stream\n', pos);
  if (streamStart === -1) break;
  
  const headerStart = Math.max(0, streamStart - 800);
  const header = str.substring(headerStart, streamStart);
  
  if (header.includes('FlateDecode') && !header.includes('DCTDecode')) {
    const lenMatch = header.match(/\/Length\s+(\d+)/);
    if (lenMatch) {
      const len = parseInt(lenMatch[1]);
      if (len > 100 && len < 200000) {
        const dataStart = streamStart + 7;
        const rawBytes = Buffer.from(str.substring(dataStart, dataStart + len), 'binary');
        try {
          const decompressed = zlib.inflateSync(rawBytes).toString('latin1');
          
          if (decompressed.includes('BT') && decompressed.includes('ET')) {
            const text = decodeTJText(decompressed);
            if (text.trim().length > 5) {
              pageNum++;
              const cleaned = text
                .replace(/[^\x20-\x7E\n\r\t]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              if (cleaned.length > 10) {
                allText.push(`--- Page segment ${pageNum} ---\n${cleaned}`);
              }
            }
          }
        } catch(e) {}
      }
    }
  }
  
  pos = streamStart + 7;
  if (pos > str.length) break;
}

const output = allText.join('\n\n');
fs.writeFileSync('pdf_kab_extracted.txt', output, 'utf8');
console.log('Total segments extracted:', pageNum);
console.log('Output saved to pdf_kab_extracted.txt');
