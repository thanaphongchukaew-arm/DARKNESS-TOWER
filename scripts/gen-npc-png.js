// Rasterise code-drawn NPC pixel grids (js/pixel-stories.js) into 80x96 palette PNGs under
// assets/pixel16/npcs. Used for NPCs that have no imagegen source art (e.g. Veyra).
// Run: node scripts/gen-npc-png.js npcVeyra npcVeyraVigil npcVeyraDawn
const fs = require('fs'), path = require('path'), zlib = require('zlib'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const defs = {};
const ctx = vm.createContext({ window: { Game: { PixelArt: { define: (id, grid, palette) => { defs[id] = { grid, palette }; } } } } });
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/pixel-stories.js'), 'utf8'), ctx);
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const body = Buffer.concat([Buffer.from(type), data]); const sum = Buffer.alloc(4); sum.writeUInt32BE(crc(body)); return Buffer.concat([len, body, sum]); };
function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) { raw[y * (width * 4 + 1)] = 0; rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const W = 80, H = 96, out = path.join(ROOT, 'assets/pixel16/npcs');
fs.mkdirSync(out, { recursive: true });
for (const id of process.argv.slice(2)) {
  const d = defs[id]; if (!d) throw new Error('No pixel definition: ' + id);
  const rows = d.grid.length, cols = d.grid[0].length;
  let x0 = cols, x1 = -1, y0 = rows, y1 = -1;
  d.grid.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }));
  const scale = Math.floor(Math.min((W - 4) / (x1 - x0 + 1), (H - 4) / (y1 - y0 + 1)));
  const w = (x1 - x0 + 1) * scale, h = (y1 - y0 + 1) * scale, ox = Math.floor((W - w) / 2), oy = H - 2 - h;
  const buf = Buffer.alloc(W * H * 4);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const c = d.grid[y][x]; if (c === '.') continue;
    const hex = d.palette[c].slice(1), rgb = [0, 2, 4].map((i) => parseInt(hex.substr(i, 2), 16));
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) { const p = ((oy + (y - y0) * scale + dy) * W + ox + (x - x0) * scale + dx) * 4; buf[p] = rgb[0]; buf[p + 1] = rgb[1]; buf[p + 2] = rgb[2]; buf[p + 3] = 255; }
  }
  fs.writeFileSync(path.join(out, id + '.png'), png(W, H, buf));
  console.log(id, 'scale', scale, 'bbox', w + 'x' + h);
}
