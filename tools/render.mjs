import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import vm from "node:vm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const hier = dirname(fileURLToPath(import.meta.url));
const kontext = { window: {}, Math, console };
vm.createContext(kontext);
for (const f of ["pixel.js", "props.js", "zubehoer.js", "animationen.js", "namen.js"]) vm.runInContext(readFileSync(join(hier, "..", "engine", f), "utf8"), kontext);
const K = kontext.window.K;

const farbe = (s) => {
  if (s.startsWith("#")) {
    const n = parseInt(s.length === 4 ? s.slice(1).split("").map((c) => c + c).join("") : s.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = s.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/);
  if (m) {
    const h = +m[1] / 360, sa = +m[2] / 100, l = +m[3] / 100;
    const q = l < 0.5 ? l * (1 + sa) : l + sa - l * sa, p = 2 * l - q;
    const k = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [k(h + 1 / 3), k(h), k(h - 1 / 3)].map((v) => Math.round(v * 255));
  }
  return [0, 0, 0];
};

export class Leinwand {
  constructor(w, h) { this.w = w; this.h = h; this.px = new Uint8ClampedArray(w * h * 4); this.fillStyle = "#000"; this.strokeStyle = "#000"; this.lineWidth = 1; this.globalAlpha = 1; }
  clearRect() { this.px.fill(0); }
  fuellen(r, g, b, a) { for (let i = 0; i < this.px.length; i += 4) { this.px[i] = r; this.px[i + 1] = g; this.px[i + 2] = b; this.px[i + 3] = a; } }
  setzen(x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4, a = Math.max(0, Math.min(1, this.globalAlpha)), rest = 1 - a;
    const altA = this.px[i + 3] / 255, neuA = a + altA * rest;
    for (let k = 0; k < 3; k++) this.px[i + k] = neuA ? (c[k] * a + this.px[i + k] * altA * rest) / neuA : 0;
    this.px[i + 3] = neuA * 255;
  }
  fillRect(x, y, w, h) { const c = farbe(this.fillStyle); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.setzen(x + i, y + j, c); }
  strokeRect(x, y, w, h) {
    const c = farbe(this.strokeStyle);
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for (let i = 0; i <= w; i++) { this.setzen(x + i, y, c); this.setzen(x + i, y + h, c); }
    for (let j = 0; j <= h; j++) { this.setzen(x, y + j, c); this.setzen(x + w, y + j, c); }
  }
  hochskalieren(s) {
    const n = new Leinwand(this.w * s, this.h * s);
    for (let y = 0; y < n.h; y++) for (let x = 0; x < n.w; x++) {
      const q = ((Math.floor(y / s) * this.w) + Math.floor(x / s)) * 4, z = (y * n.w + x) * 4;
      for (let k = 0; k < 4; k++) n.px[z + k] = this.px[q + k];
    }
    return n;
  }
  einfuegen(quelle, dx, dy) {
    for (let y = 0; y < quelle.h; y++) for (let x = 0; x < quelle.w; x++) {
      const q = (y * quelle.w + x) * 4;
      if (!quelle.px[q + 3]) continue;
      const tx = dx + x, ty = dy + y;
      if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
      const z = (ty * this.w + tx) * 4, a = quelle.px[q + 3] / 255;
      for (let k = 0; k < 3; k++) this.px[z + k] = quelle.px[q + k] * a + this.px[z + k] * (1 - a);
      this.px[z + 3] = Math.max(this.px[z + 3], quelle.px[q + 3]);
    }
  }
}

const crcTabelle = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTabelle[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const block = (typ, daten) => {
  const laenge = Buffer.alloc(4); laenge.writeUInt32BE(daten.length);
  const td = Buffer.concat([Buffer.from(typ), daten]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([laenge, td, c]);
};
export const png = (l) => {
  const kopf = Buffer.alloc(13);
  kopf.writeUInt32BE(l.w, 0); kopf.writeUInt32BE(l.h, 4); kopf[8] = 8; kopf[9] = 6;
  const roh = Buffer.alloc((l.w * 4 + 1) * l.h);
  for (let y = 0; y < l.h; y++) { roh[y * (l.w * 4 + 1)] = 0; Buffer.from(l.px.buffer, y * l.w * 4, l.w * 4).copy(roh, y * (l.w * 4 + 1) + 1); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), block("IHDR", kopf), block("IDAT", deflateSync(roh, { level: 9 })), block("IEND", Buffer.alloc(0))]);
};

export const finden = (name) => K.BEWEGUNGEN.concat(K.AUSSEHEN).find((x) => x.n.toLowerCase() === name.toLowerCase() || K.en(x).toLowerCase() === name.toLowerCase());

export const bild = (move, t, outfit = {}, opt = {}) => {
  const l = new Leinwand(K.W, K.H);
  K.male(l, K.posieren(move, t, opt), t, outfit, Object.assign({ boden: false, tinte: "#000000" }, opt));
  return l;
};

export { K };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const wert = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const name = args.find((a, i) => !a.startsWith("--") && (i === 0 || !args[i - 1].startsWith("--")));
  if (!name) {
    console.log('usage: node tools/render.mjs "Moonwalk" [--wear "Top hat,Galaxy"] [--scale 8] [--frames 24] [--fps 12] [--out render]');
    console.log(`moves: ${K.BEWEGUNGEN.map(K.en).join(", ")}`);
    process.exit(0);
  }
  const move = finden(name);
  if (!move || !K.BEWEGUNGEN.includes(move)) { console.error(`unknown move: ${name}`); process.exit(1); }
  const outfit = {};
  for (const teil of (wert("--wear", "") || "").split(",").map((s) => s.trim()).filter(Boolean)) {
    const x = finden(teil);
    if (x && x.slot) outfit[x.slot] = x; else console.error(`unknown look: ${teil}`);
  }
  const skala = +wert("--scale", 8), bilder = +wert("--frames", 24), fps = +wert("--fps", 12), ziel = wert("--out", "render");
  mkdirSync(ziel, { recursive: true });
  const datei = K.en(move).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const bogen = new Leinwand(K.W * skala * bilder, K.H * skala);
  for (let i = 0; i < bilder; i++) {
    const gross = bild(move, i / fps, outfit).hochskalieren(skala);
    writeFileSync(join(ziel, `${datei}-${String(i).padStart(3, "0")}.png`), png(gross));
    bogen.einfuegen(gross, i * K.W * skala, 0);
  }
  writeFileSync(join(ziel, `${datei}-sheet.png`), png(bogen));
  console.log(`${bilder} frames and a sprite sheet for "${K.en(move)}" in ${ziel}/`);
}
