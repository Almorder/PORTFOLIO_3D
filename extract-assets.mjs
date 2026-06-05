import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const HTML_PATH = 'index.html';
const OUTPUT_DIR = join('public', 'assets');

const html = readFileSync(HTML_PATH, 'utf-8');
const originalSize = Buffer.byteLength(html, 'utf-8');

if (!DRY_RUN) mkdirSync(OUTPUT_DIR, { recursive: true });

let index = 0;
let totalSaved = 0;

const modified = html.replace(
  /src="(data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,([^"]+))"/g,
  (_fullMatch, _dataUrl, mimeSubtype, b64Data) => {
    index++;
    const extMap = { png: 'png', jpeg: 'jpg', jpg: 'jpg', webp: 'webp', gif: 'gif', 'svg+xml': 'svg' };
    const ext = extMap[mimeSubtype] ?? 'bin';
    const filename = `asset-${index}.${ext}`;
    const buffer = Buffer.from(b64Data, 'base64');
    totalSaved += buffer.length;
    if (!DRY_RUN) writeFileSync(join(OUTPUT_DIR, filename), buffer);
    const flag = DRY_RUN ? '[dry-run] ' : '';
    console.log(`  ${flag}✓ ${filename}  (${Math.round(buffer.length / 1024)} Ko)`);
    return `src="/assets/${filename}" loading="lazy"`;
  }
);

const newSize = Buffer.byteLength(modified, 'utf-8');
console.log(`\n  index.html : ${Math.round(originalSize / 1024)} Ko → ${Math.round(newSize / 1024)} Ko  (-${Math.round((originalSize - newSize) / 1024)} Ko)`);
console.log(`  Images extraites : ${index}`);

if (!DRY_RUN) {
  writeFileSync(HTML_PATH, modified, 'utf-8');
  console.log('  ✅  index.html mis à jour.\n');
}
