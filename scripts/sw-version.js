// Keeps the service-worker cache version honest. The worker is cache-first, so if a shipped file changes
// but CACHE_NAME does not, returning players keep running the OLD file.
//
//   node scripts/sw-version.js --check   exit 1 if shipped files changed since the recorded hash
//   node scripts/sw-version.js --write   bump CACHE_NAME (vN -> vN+1) and record the new hash
//
// The hash covers every file the worker precaches (css, dist bundle, index.html, artwork, fonts...).
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = process.env.SW_ROOT || path.join(__dirname, '..');
const SW = path.join(ROOT, 'sw.js');

function shippedFiles(sw) {
  return [...new Set([...sw.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]))].filter((p) => p && !p.endsWith('/')).sort();
}
// Text files are hashed with LF line endings, so a Windows checkout (git core.autocrlf turns
// LF into CRLF) records the same hash as CI on Linux.
const TEXT_EXT = /\.(css|html|js|json|webmanifest|txt|svg)$/i;
function fileBytes(rel, f) {
  const buf = fs.readFileSync(f);
  return TEXT_EXT.test(rel) ? Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8') : buf;
}
function hashFiles(sw) {
  const h = crypto.createHash('sha256');
  for (const rel of shippedFiles(sw)) {
    const f = path.join(ROOT, rel);
    h.update(rel + '\0' + (fs.existsSync(f) ? crypto.createHash('sha256').update(fileBytes(rel, f)).digest('hex') : 'MISSING') + '\n');
  }
  return h.digest('hex').slice(0, 20);
}
function recorded(sw) { const m = sw.match(/^\/\/ shipped-files-hash: ([0-9a-f]+)/m); return m ? m[1] : null; }

function main() {
  const mode = process.argv.includes('--write') ? 'write' : 'check';
  const sw = fs.readFileSync(SW, 'utf8');
  const now = hashFiles(sw), was = recorded(sw);
  if (mode === 'check') {
    if (was === now) { console.log('sw.js cache version matches the shipped files (' + (sw.match(/darkness-tower-v\d+/) || ['?'])[0] + ')'); return 0; }
    console.error('Shipped files changed (hash ' + was + ' -> ' + now + ') but sw.js still has the old cache version.\nRun: node scripts/sw-version.js --write');
    return 1;
  }
  if (was === now) { console.log('Nothing changed; cache version left as is.'); return 0; }
  let next = sw.replace(/darkness-tower-v(\d+)/, (_, n) => 'darkness-tower-v' + (Number(n) + 1));
  next = was ? next.replace(/^\/\/ shipped-files-hash: .*$/m, '// shipped-files-hash: ' + now) : '// shipped-files-hash: ' + now + '\n' + next;
  fs.writeFileSync(SW, next);
  console.log('Bumped to ' + next.match(/darkness-tower-v\d+/)[0] + ' (hash ' + now + ')');
  return 0;
}
if (require.main === module) process.exit(main());
module.exports = { hashFiles, recorded, shippedFiles };
