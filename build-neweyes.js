const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const dir = path.join(process.cwd(), '.neweyes-staging');
const parts = fs.readdirSync(dir)
  .filter(name => /^part.*\.b64$/i.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

if (!parts.length) throw new Error('Nessun blocco NEWeyes trovato');
console.log('Blocchi trovati:', parts.join(', '));

const b64 = parts.map(name => fs.readFileSync(path.join(dir, name), 'utf8').replace(/\s+/g, '')).join('');
const compressed = Buffer.from(b64, 'base64');
const html = zlib.brotliDecompressSync(compressed);
const sha = crypto.createHash('sha256').update(html).digest('hex');

if (html.length < 100000) throw new Error(`HTML ricostruito troppo piccolo: ${html.length} bytes`);
const text = html.toString('utf8');
if (!/NEWeyes/i.test(text) || !/<html/i.test(text)) throw new Error('Il file ricostruito non sembra la demo NEWeyes');

fs.writeFileSync('index.html', html);
console.log(`NEWeyes ricostruito: ${html.length} bytes; sha256=${sha}`);
