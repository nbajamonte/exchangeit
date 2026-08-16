const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), '.neweyes-parts');
const parts = fs.readdirSync(dir)
  .filter(name => /^part.*\.txt$/i.test(name))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

if (!parts.length) throw new Error('Nessun frammento NEWeyes trovato');

const buffers = parts.map(name => fs.readFileSync(path.join(dir, name)));
const html = Buffer.concat(buffers);
const text = html.toString('utf8');

if (html.length !== 57207) throw new Error(`Dimensione NEWeyes inattesa: ${html.length} bytes`);
if (!text.startsWith('<!DOCTYPE html>')) throw new Error('DOCTYPE NEWeyes mancante');
if (!/<title>Neweyes/i.test(text)) throw new Error('Titolo NEWeyes mancante');
if (!/<\/script>/i.test(text) || !/<\/html>/i.test(text)) throw new Error('HTML NEWeyes incompleto');

fs.mkdirSync(path.join(process.cwd(), 'dist'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'dist', 'index.html'), html);
console.log(`NEWeyes ricostruito correttamente: ${html.length} bytes da ${parts.length} frammenti`);
