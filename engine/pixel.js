(() => {
  const K = (window.K = window.K || {});
  K.W = 48;
  K.H = 40;
  K.BODEN = 36;
  K.tinte = "#000000";
  K.papier = "#e8e6df";

  K.FARBEN = {
    k: "#1b1a18", K: "#000000", w: "#f4f1e8", W: "#ffffff", L: "#c8c4b8", G: "#8b877d", g: "#55524b",
    r: "#d9443a", R: "#8e241f", o: "#f28c28", O: "#b85f10", y: "#f5d03b", Y: "#b8921c",
    l: "#86c95c", e: "#3e8f3b", E: "#245a24", c: "#62c9e8", b: "#3a6fd6", B: "#1d3b8c",
    p: "#9b61d3", P: "#5b3290", m: "#f282b4", M: "#b54a7f", n: "#9b6b3d", N: "#5c3c1f",
    t: "#dcb57e", z: "#f3c24c", Z: "#a8781a", s: "#dfe4ea", S: "#98a2ad", f: "#ffd9b3",
    h: "#ff5c38", v: "#34e8a8", x: "#e23c90", q: "#7a4dff", u: "#2bd4ff", i: "#c9ff3d", d: "#2e2b27"
  };

  K.rnd = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  K.farbe = (ch, f) => {
    switch (ch) {
      case ".": case " ": return null;
      case "@": return f.body;
      case "#": return f.dark;
      case "+": return f.light;
      case "a": return f.eye;
      case "1": return f.c1;
      case "2": return f.c2;
      case "3": return f.c3;
      case "*": return f.tinte;
      default: return K.FARBEN[ch] || null;
    }
  };

  K.breite = (rows) => {
    let w = 0;
    for (const r of rows) if (r.length > w) w = r.length;
    return w;
  };

  K.zeichne = (ctx, rows, x, y, f, spiegel) => {
    const w = K.breite(rows);
    x = Math.round(x);
    y = Math.round(y);
    for (let j = 0; j < rows.length; j++) {
      const row = rows[j];
      for (let i = 0; i < row.length; i++) {
        const c = K.farbe(row[i], f);
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(x + (spiegel ? w - 1 - i : i), y + j, 1, 1);
      }
    }
  };

  K.px = (ctx, x, y, c, w = 1, h = 1) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };

  K.linie = (ctx, x0, y0, x1, y1, c) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    ctx.fillStyle = c;
    for (let n = 0; n < 200; n++) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };

  K.ellipse = (ctx, cx, cy, rx, ry, c, von = 0, bis = 1) => {
    const n = Math.max(12, Math.round((rx + ry) * 4));
    ctx.fillStyle = c;
    for (let i = 0; i <= n; i++) {
      const a = (von + (bis - von) * (i / n)) * Math.PI * 2;
      ctx.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), 1, 1);
    }
  };

  const FONT = {
    A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111",
    F: "111100110100100", G: "011100101101011", H: "101101111101101", I: "111010010010111", J: "001001001101010",
    K: "101101110101101", L: "100100100100111", M: "101111111101101", N: "110101101101101", O: "010101101101010",
    P: "110101110100100", Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
    U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101", Y: "101101010010010",
    Z: "111001010100111", Ä: "101010101111101", Ö: "101010101101010", Ü: "101000101101111",
    0: "111101101101111", 1: "010110010010111", 2: "110001010100111", 3: "110001010001110", 4: "101101111001001",
    5: "111100110001110", 6: "011100111101111", 7: "111001010010010", 8: "111101111101111", 9: "111101111001110",
    "?": "110001010000010", "!": "010010010000010", ".": "000000000000010", ":": "000010000010000", "+": "000010111010000",
    "-": "000000111000000", "/": "001001010100100", "<": "001010100010001", ">": "100010001010100", "{": "011010110010011",
    "}": "110010011010110", $: "011110010011110", "#": "101111101111101", "=": "000111000111000", "%": "101001010100101",
    "*": "000101010101000", "♥": "000101111111010", " ": "000000000000000", "'": "010010000000000", ",": "000000000010100"
  };

  K.text = (ctx, s, x, y, c) => {
    let px = Math.round(x);
    y = Math.round(y);
    ctx.fillStyle = c;
    for (const ch of String(s).toUpperCase()) {
      const g = FONT[ch];
      if (g) for (let i = 0; i < 15; i++) if (g[i] === "1") ctx.fillRect(px + (i % 3), y + Math.floor(i / 3), 1, 1);
      px += 4;
    }
  };
  K.textBreite = (s) => String(s).length * 4 - 1;
  K.FONT = FONT;

  K.pose = () => ({
    dx: 0, dy: 0, bw: 0, bh: 0, beine: "stehen", lift: [0, 0, 0, 0],
    augen: "offen", ex: 0, ey: 0, mund: null, mundY: 0, rot: false,
    armL: "unten", armR: "unten", aL: [0, 0], aR: [0, 0],
    dreh: 0, pivot: "fuesse", spiegel: false, alpha: 1, skala: 1,
    props: [], fx: [], klon: 0, glitch: 0, tint: null, weg: false, ohneFigur: false
  });

  const ARM = {
    unten: [1, 2, 3], hoch: [-3, 2, 3], raus: [-1, 3, 2], halb: [-2, 2, 2], tief: [3, 2, 2],
    vorne: [0, 2, 2], kopf: [0, 2, 2], mund: [0, 2, 2]
  };

  const armRect = (s, z, off, r) => {
    const a = ARM[z];
    if (!a) return null;
    const w = a[1], h = a[2];
    let x, y;
    if (z === "vorne") { x = s === "L" ? r.links + 2 : r.rechts - 4; y = r.oben + 6; }
    else if (z === "kopf") { x = s === "L" ? r.links - 1 : r.rechts - 1; y = r.oben - 2; }
    else if (z === "mund") { x = s === "L" ? r.cx - 3 : r.cx + 1; y = r.oben + 5; }
    else { x = s === "L" ? r.links - w : r.rechts; y = r.oben + 3 + a[0]; }
    return { x: x + off[0], y: y + off[1], w, h };
  };

  K.rig = (p) => {
    const bw = 14 + p.bw, bh = Math.max(4, 9 + p.bh);
    const cx = 24 + p.dx;
    const boden = K.BODEN + p.dy;
    const beinH = p.beine === "sitzen" ? 0 : 3;
    const unten = boden - beinH;
    const oben = unten - bh;
    const links = cx - (bw >> 1);
    const r = { bw, bh, cx, boden, unten, oben, links, rechts: links + bw, beinH };
    r.augeY = oben + 2 + p.ey;
    r.mitte = { x: cx, y: oben + (bh >> 1) };
    r.armL = armRect("L", p.armL, p.aL, r);
    r.armR = armRect("R", p.armR, p.aR, r);
    r.handR = r.armR ? { x: r.armR.x + r.armR.w, y: r.armR.y } : { x: r.rechts + 1, y: oben + 4 };
    r.handL = r.armL ? { x: r.armL.x - 1, y: r.armL.y } : { x: r.links - 2, y: oben + 4 };
    return r;
  };

  const AUGE = {
    offen: [["a", "a"], 0, 0], zu: [["aa"], 0, 1], froh: [[".a.", "a.a"], 1, 0], gross: [["aa", "aa"], 0, 0],
    wuetend: [["a.", "aa"], 0, 0], traurig: [[".a", "aa"], 0, 0], x: [["a.a", ".a.", "a.a"], 1, -1],
    herz: [["m.m", "mmm", ".m."], 1, -1], stern: [[".y.", "yyy", ".y."], 1, -1], punkt: [["a"], 0, 0],
    halb: [["a"], 0, 1], ring: [["aaa", "a.a", "aaa"], 1, -1], geld: [["z", "Z"], 0, 0], leuchten: [["v", "v"], 0, 0],
    leer: [["w", "w"], 0, 0], rot: [["r", "R"], 0, 0], schlitz: [["a", "a", "a"], 0, -1], seitlich: [["aa", ".a"], 0, 0],
    spirale: [["aaa", "..a", "a.a", "aaa"], 1, -1], weinen: [["a", "a", "c", "c"], 0, 0]
  };

  const MUND = {
    laecheln: ["a..a", ".aa."], breit: ["a....a", ".aaaa."], offen: [".aa.", "arra", ".aa."], o: [".aa.", "a..a", ".aa."],
    klein: ["aa"], flach: ["aaaa"], traurig: [".aa.", "a..a"], zunge: ["aaaa", ".mm."], zaehne: ["awwa"],
    pfeifen: [".a.", "a.a", ".a."], gross: ["aaaaaa", "arrrra", ".aaaa."], schief: ["aaa.", "...a"]
  };

  K.AUGEN = Object.keys(AUGE);
  K.MUENDER = Object.keys(MUND);

  const zeichneAugen = (c, p, r, f) => {
    const lx = r.cx - 4 + p.ex, rx = r.cx + 3 + p.ex, y = r.augeY;
    const auge = (typ, x, rechts) => {
      const d = AUGE[typ] || AUGE.offen;
      const w = K.breite(d[0]);
      K.zeichne(c, d[0], rechts ? x - (w - 1 - d[1]) : x - d[1], y + d[2], f, rechts);
    };
    const l = p.augen === "zwinker" ? "offen" : p.augen;
    const rr = p.augen === "zwinker" ? "zu" : p.augen;
    auge(l, lx, false);
    auge(rr, rx, true);
  };

  const zeichneMund = (c, p, r, f) => {
    if (p.rot) {
      K.px(c, r.links + 1, r.oben + 4, "#f282b4", 2, 1);
      K.px(c, r.rechts - 3, r.oben + 4, "#f282b4", 2, 1);
    }
    if (!p.mund) return;
    const m = MUND[p.mund];
    if (!m) return;
    K.zeichne(c, m, r.cx - (K.breite(m) >> 1), r.oben + 5 + p.mundY, f);
  };

  const zeichneBeine = (c, p, r, f) => {
    if (!r.beinH) return;
    const xs = [r.links + 1, r.links + 4, r.rechts - 6, r.rechts - 3];
    for (let i = 0; i < 4; i++) {
      const h = r.beinH - (p.lift[i] || 0);
      if (h > 0) K.px(c, xs[i], r.unten, f.body, 2, h);
    }
  };

  const zeichneKoerper = (c, p, t, r, f, skin) => {
    const muster = skin && skin.muster;
    for (let y = 0; y < r.bh; y++) {
      for (let x = 0; x < r.bw; x++) {
        let col = y === r.bh - 1 ? f.dark : f.body;
        if (skin && skin.umriss && x > 0 && y > 0 && x < r.bw - 1 && y < r.bh - 1) continue;
        if (muster) {
          const m = muster(x, y, t, r, f);
          if (m === false) continue;
          if (m) col = m;
        }
        c.fillStyle = col;
        c.fillRect(r.links + x, r.oben + y, 1, 1);
      }
    }
  };

  const rahmen = (m, t, fps) => (Array.isArray(m[0]) ? m[Math.floor(t * (fps || 4)) % m.length] : m);

  const zubehoerPos = (z, rows, r) => {
    const w = K.breite(rows), h = rows.length, ox = z.ox || 0, oy = z.oy || 0;
    switch (z.slot) {
      case "kopf": return [r.cx - (w >> 1) + ox, r.oben - h + 1 + oy];
      case "augen": return [r.cx - (w >> 1) + ox, r.augeY - 1 + oy];
      case "gesicht": return [r.cx - (w >> 1) + ox, r.oben + 4 + oy];
      case "hals": return [r.cx - (w >> 1) + ox, r.oben + 6 + oy];
      case "koerper": return [r.links + ox, r.oben + oy];
      case "ruecken": return [r.cx - (w >> 1) + ox, r.oben + oy];
      case "hand": return [r.handR.x + ox, r.handR.y - h + 2 + oy];
      default: return [ox, oy];
    }
  };

  const zeichneZubehoer = (c, z, r, f, t, schicht) => {
    const quelle = schicht === "vorne" ? z.vorne : z.m;
    if (!quelle) return;
    const rows = rahmen(quelle, t, z.fps);
    const pos = zubehoerPos(schicht === "vorne" ? Object.assign({}, z, { slot: "koerper", ox: z.vox || 0, oy: z.voy || 0 }) : z, rows, r);
    const ff = z.c1 || z.c2 || z.c3 ? Object.assign({}, f, { c1: z.c1, c2: z.c2, c3: z.c3 }) : f;
    K.zeichne(c, rows, pos[0], pos[1], ff);
  };

  const propPos = (pr, rows, r) => {
    const w = K.breite(rows), h = rows.length, dx = pr.dx || 0, dy = pr.dy || 0;
    switch (pr.an) {
      case "handR": return [r.handR.x + dx, r.handR.y - h + 2 + dy];
      case "handL": return [r.handL.x - w + 1 + dx, r.handL.y - h + 2 + dy];
      case "griffR": return [r.handR.x + dx, r.handR.y - 1 + dy];
      case "griffL": return [r.handL.x - w + 1 + dx, r.handL.y - 1 + dy];
      case "vorne": return [r.cx - (w >> 1) + dx, r.oben + 4 + dy];
      case "kopf": return [r.cx - (w >> 1) + dx, r.oben - h + 1 + dy];
      case "augen": return [r.cx - (w >> 1) + dx, r.augeY - 1 + dy];
      case "boden": return [r.cx + dx, K.BODEN - h + dy];
      case "fuesse": return [r.cx - (w >> 1) + dx, r.boden + dy];
      case "ueber": return [r.cx - (w >> 1) + dx, r.oben - h - 2 + dy];
      case "ruecken": return [r.cx - (w >> 1) + dx, r.oben + dy];
      default: return [dx, dy];
    }
  };

  const zeichneProp = (c, pr, r, f, t) => {
    const quelle = K.PROPS[pr.id];
    if (!quelle) return;
    const rows = rahmen(quelle, t, pr.fps);
    const pos = propPos(pr, rows, r);
    K.zeichne(c, rows, pos[0], pos[1], pr.c1 ? Object.assign({}, f, { c1: pr.c1, c2: pr.c2 }) : f, pr.spiegel);
  };

  const vorderArm = (s) => s === "vorne" || s === "kopf" || s === "mund";

  const zeichneFigur = (c, p, t, r, f, skin, outfit) => {
    const hinten = [], vorne = [];
    for (const pr of p.props) (pr.ebene === "hinten" ? hinten : vorne).push(pr);
    if (outfit.ruecken) zeichneZubehoer(c, outfit.ruecken, r, f, t);
    for (const pr of hinten) zeichneProp(c, pr, r, f, t);
    if (r.armL && !vorderArm(p.armL)) K.px(c, r.armL.x, r.armL.y, f.body, r.armL.w, r.armL.h);
    if (r.armR && !vorderArm(p.armR)) K.px(c, r.armR.x, r.armR.y, f.body, r.armR.w, r.armR.h);
    zeichneBeine(c, p, r, f);
    zeichneKoerper(c, p, t, r, f, skin);
    if (outfit.koerper) zeichneZubehoer(c, outfit.koerper, r, f, t);
    if (outfit.ruecken && outfit.ruecken.vorne) zeichneZubehoer(c, outfit.ruecken, r, f, t, "vorne");
    zeichneAugen(c, p, r, f);
    zeichneMund(c, p, r, f);
    for (const s of ["hals", "gesicht", "augen", "kopf"]) if (outfit[s]) zeichneZubehoer(c, outfit[s], r, f, t);
    for (const pr of vorne) zeichneProp(c, pr, r, f, t);
    if (r.armL && vorderArm(p.armL)) K.px(c, r.armL.x, r.armL.y, f.body, r.armL.w, r.armL.h);
    if (r.armR && vorderArm(p.armR)) K.px(c, r.armR.x, r.armR.y, f.body, r.armR.w, r.armR.h);
    if (outfit.hand && !p.props.some((q) => q.an === "handR" || q.an === "griffR")) zeichneZubehoer(c, outfit.hand, r, f, t);
  };

  class Puffer {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.farben = new Array(w * h).fill(null);
      this.alphas = new Float32Array(w * h);
      this.fillStyle = "#000";
      this.globalAlpha = 1;
    }
    clearRect() {
      this.farben.fill(null);
      this.alphas.fill(0);
    }
    fillRect(x, y, w, h) {
      x = Math.round(x);
      y = Math.round(y);
      for (let j = 0; j < h; j++) {
        const yy = y + j;
        if (yy < 0 || yy >= this.h) continue;
        for (let i = 0; i < w; i++) {
          const xx = x + i;
          if (xx < 0 || xx >= this.w) continue;
          const k = yy * this.w + xx;
          this.farben[k] = this.fillStyle;
          this.alphas[k] = this.globalAlpha;
        }
      }
    }
  }
  K.Puffer = Puffer;
  const puffer = new Puffer(K.W, K.H);

  const composite = (ctx, p, r, t) => {
    const pv = p.pivot === "mitte" ? r.mitte : p.pivot === "oben" ? { x: r.cx, y: 0 } : { x: r.cx, y: r.boden };
    const w = ((p.dreh || 0) * Math.PI) / 180, co = Math.cos(w), si = Math.sin(w);
    const sx = (p.spiegel ? -1 : 1) * p.skala, sy = p.skala;
    const takt = Math.floor(t * 12);
    const lage = (alpha, versatz) => {
      const a0 = Math.max(0, Math.min(1, alpha));
      if (a0 <= 0) return;
      for (let y = 0; y < K.H; y++) {
        const band = y & ~1;
        const gv = p.glitch > 0 && K.rnd(takt * 97 + band) < p.glitch ? Math.round((K.rnd(band * 13 + takt) - 0.5) * 10) : 0;
        for (let x = 0; x < K.W; x++) {
          const dx = x + 0.5 - pv.x - versatz - gv, dy = y + 0.5 - pv.y;
          const qx = Math.floor((dx * co + dy * si) / sx + pv.x), qy = Math.floor((-dx * si + dy * co) / sy + pv.y);
          if (qx < 0 || qy < 0 || qx >= K.W || qy >= K.H) continue;
          const k = qy * K.W + qx, c = puffer.farben[k];
          if (!c) continue;
          ctx.globalAlpha = a0 * (puffer.alphas[k] || 1);
          ctx.fillStyle = c;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.globalAlpha = 1;
    };
    if (p.klon) lage(p.alpha * 0.35, p.klon);
    lage(p.alpha, 0);
  };

  K.STANDARD_SKIN = { body: "#d97757", dark: "#b0573a", light: "#eb9b80", eye: "#1b1a18" };

  K.male = (ctx, p, t, outfit = {}, opt = {}) => {
    const tinte = opt.tinte || K.tinte;
    if (typeof HTMLCanvasElement !== "undefined") ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, K.W, K.H);
    if (opt.boden !== false) {
      ctx.globalAlpha = 0.28;
      for (let x = 3; x < K.W - 3; x += 3) K.px(ctx, x, K.BODEN, tinte);
      ctx.globalAlpha = 1;
    }
    const skin = outfit.skin || K.STANDARD_SKIN;
    const f = { body: skin.body, dark: skin.dark, light: skin.light, eye: skin.eye || "#1b1a18", tinte, c1: "#d9443a", c2: "#f4f1e8", c3: "#1b1a18" };
    if (p.tint) Object.assign(f, p.tint);
    const r = K.rig(p);
    const info = { f, tinte, p, opt };
    const alle = outfit.aura && outfit.aura.fx ? p.fx.concat(outfit.aura.fx) : p.fx;
    for (const e of alle) if (e.hinten && K.FX[e.typ]) K.FX[e.typ](ctx, t, r, e, info);
    if (!p.weg && !p.ohneFigur) {
      puffer.clearRect();
      puffer.globalAlpha = 1;
      zeichneFigur(puffer, p, t, r, f, skin, outfit);
      if (skin.alpha) p.alpha *= skin.alpha;
      composite(ctx, p, r, t);
    }
    for (const e of alle) if (!e.hinten && K.FX[e.typ]) K.FX[e.typ](ctx, t, r, e, info);
    return r;
  };

  const M = {
    herz: [".m.m.", "mmmmm", ".mmm.", "..m.."],
    herzK: ["m.m", "mmm", ".m."],
    note: ["..**", "..*.", "..*.", "***.", "**.."],
    funke: [".y.", "yWy", ".y."],
    tropfen: [".c.", "ccc", ".c."],
    schweiss: [".c", "cc", "cc"],
    blase: [".c.", "c.c", ".c."],
    muenze: [".z.", "zZz", ".z."],
    blattG: [".e", "ee", "e."],
    blattO: [".o", "oO", "o."],
    blattR: [".r", "rR", "r."],
    wolke: ["..LLL...", ".LLLLLL.", "LLLLLLLL"],
    wolkeD: ["..ggg...", ".gggggg.", "gggggggg"],
    blitz: ["..y", ".y.", "yyy", ".y.", "y.."],
    birne: [".yyy.", "yyyyy", "yyyyy", ".yyy.", ".GGG.", ".GGG."],
    sonne: ["y.y.y", ".yyy.", "yyyyy", ".yyy.", "y.y.y"],
    schmetterling: [["m.m", ".k.", "m.m"], ["...", "mkm", "..."]],
    vogel: [["*.*", ".*."], [".*.", "*.*"]],
    schaf: [".www.", "wwwwk", "wwww.", ".k.k."],
    fisch: [".b..", "bbbb", "bwbb", ".b.."],
    kaefer: [["k.k", "lel", "lel", "k.k"], [".k.", "lel", "lel", ".k."]],
    datei: ["ww.", "www", "wLw", "www"],
    fledermaus: [["k...k", "kk.kk", ".kkk."], [".....", "kkkkk", ".k.k."]],
    ball: [".r.", "rrr", ".r."],
    flamme: [[".y.", "yoy", "oro"], ["..y", ".yo", "oro"], ["y..", "oy.", "oro"]],
    rakete: [".w.", "www", "wbw", "www", "r.r"],
    fliege: [["w.w", ".k."], [".w.", "wkw"]],
    ruebe: ["....."]
  };
  K.FXMAPS = M;

  const schwarm = (n, t, tempo, cb) => {
    for (let k = 0; k < n; k++) cb(k, (((t * tempo + k / n) % 1) + 1) % 1);
  };

  const alpha = (ctx, a, fn) => {
    const alt = ctx.globalAlpha;
    ctx.globalAlpha = alt * Math.max(0, Math.min(1, a));
    fn();
    ctx.globalAlpha = alt;
  };

  K.FX = {
    zzz: (c, t, r, o, i) => schwarm(3, t, 0.45, (k, q) => alpha(c, 1 - q, () => K.text(c, "Z", r.cx + 6 + k * 2 + Math.round(Math.sin(q * 6) * 1.5), r.oben - 3 - q * 16, i.tinte))),
    herzen: (c, t, r, o, i) => schwarm(o.n || 3, t, 0.55, (k, q) => alpha(c, 1 - q * 0.7, () => K.zeichne(c, M.herz, r.cx - 12 + k * 9 + Math.sin((q + k) * 7) * 2, r.oben - 2 - q * 18, i.f))),
    noten: (c, t, r, o, i) => schwarm(3, t, 0.5, (k, q) => alpha(c, 1 - q, () => K.zeichne(c, M.note, r.cx + (k % 2 ? 8 : -12) + Math.sin((q + k) * 5) * 3, r.oben - q * 18, i.f))),
    funkeln: (c, t, r, o, i) => {
      for (let k = 0; k < (o.n || 5); k++) {
        const takt = Math.floor(t * 3 + k * 0.37);
        const x = r.cx - 16 + K.rnd(takt * 7 + k) * 32, y = r.oben - 10 + K.rnd(takt * 11 + k) * 22;
        if (((t * 3 + k * 0.37) % 1) < 0.6) K.zeichne(c, M.funke, x, y, i.f);
      }
    },
    schweiss: (c, t, r, o, i) => { const q = (t * 0.9) % 1; alpha(c, 1 - q, () => K.zeichne(c, M.schweiss, r.rechts + 1, r.oben + 1 + q * 7, i.f)); },
    dampf: (c, t, r, o, i) => {
      const bx = o.x !== undefined ? o.x : r.handR.x + 1, by = o.y !== undefined ? o.y : r.handR.y - 4;
      schwarm(4, t, 0.8, (k, q) => alpha(c, 0.8 - q * 0.8, () => K.px(c, bx + Math.sin(q * 9 + k) * 2, by - q * 10, "#c8c4b8")));
    },
    regen: (c, t, r, o, i) => {
      for (let k = 0; k < (o.n || 16); k++) {
        const q = (t * 1.6 + K.rnd(k)) % 1;
        const x = Math.floor(K.rnd(k * 3.1) * K.W) - q * 4, y = q * K.H - 4;
        K.px(c, x, y, "#3a6fd6", 1, 2);
      }
    },
    schnee: (c, t, r, o, i) => {
      for (let k = 0; k < (o.n || 14); k++) {
        const q = (t * 0.35 + K.rnd(k)) % 1;
        K.px(c, K.rnd(k * 5.3) * K.W + Math.sin(q * 8 + k) * 2, q * K.H - 2, k % 3 ? "#98a2ad" : "#dfe4ea");
      }
    },
    konfetti: (c, t, r, o, i) => {
      const farben = ["#d9443a", "#f5d03b", "#3a6fd6", "#86c95c", "#f282b4", "#9b61d3"];
      for (let k = 0; k < 22; k++) {
        const q = (t * 0.7 + K.rnd(k)) % 1;
        K.px(c, K.rnd(k * 2.7) * K.W + Math.sin(q * 10 + k) * 2, q * K.H - 3, farben[k % farben.length], 1 + (k % 2), 1);
      }
    },
    feuer: (c, t, r, o, i) => {
      for (let k = 0; k < 6; k++) {
        const x = r.links - 4 + k * 4;
        K.zeichne(c, M.flamme[(Math.floor(t * 8) + k) % 3], x, (o.y || K.BODEN - 3) - (k % 2), i.f);
      }
    },
    blitz: (c, t, r, o, i) => {
      const q = t % 2.2;
      if (q < 0.25) {
        alpha(c, 0.25, () => K.px(c, 0, 0, "#f5d03b", K.W, K.H));
        K.zeichne(c, M.blitz, 8 + Math.floor(K.rnd(Math.floor(t / 2.2)) * 30), 2, i.f);
        K.zeichne(c, M.blitz, 9 + Math.floor(K.rnd(Math.floor(t / 2.2)) * 30), 7, i.f);
      }
    },
    sterne: (c, t, r, o, i) => {
      for (let k = 0; k < 9; k++) if (Math.sin(t * 2 + k * 1.7) > -0.2) K.px(c, K.rnd(k * 9.1) * K.W, K.rnd(k * 4.7) * 16, k % 3 ? i.tinte : "#f5d03b");
    },
    frage: (c, t, r, o, i) => K.text(c, "?", r.cx + 5, r.oben - 8 + Math.round(Math.sin(t * 4)), i.tinte),
    ausruf: (c, t, r, o, i) => K.text(c, "!", r.cx - 1, r.oben - 8 - (Math.floor(t * 6) % 2), "#d9443a"),
    idee: (c, t, r, o, i) => {
      K.zeichne(c, M.birne, r.cx - 2, r.oben - 10, i.f);
      if (Math.floor(t * 4) % 2) {
        K.px(c, r.cx - 5, r.oben - 9, "#f5d03b"); K.px(c, r.cx + 5, r.oben - 9, "#f5d03b");
        K.px(c, r.cx, r.oben - 13, "#f5d03b"); K.px(c, r.cx - 4, r.oben - 12, "#f5d03b"); K.px(c, r.cx + 4, r.oben - 12, "#f5d03b");
      }
    },
    matrix: (c, t, r, o, i) => {
      for (let k = 0; k < 12; k++) {
        const x = k * 4 + 1, q = (t * (0.5 + K.rnd(k) * 0.6) + K.rnd(k * 3)) % 1;
        for (let j = 0; j < 6; j++) alpha(c, 1 - j / 6, () => K.px(c, x, q * 50 - 6 - j * 2, j === 0 ? "#c9ff3d" : "#34e8a8"));
      }
    },
    glitchlinien: (c, t, r, o, i) => {
      const takt = Math.floor(t * 10);
      for (let k = 0; k < 4; k++) if (K.rnd(takt + k * 7) > 0.5) K.px(c, K.rnd(takt * 3 + k) * 30, K.rnd(takt * 5 + k) * K.H, ["#2bd4ff", "#e23c90", "#c9ff3d"][k % 3], 6 + K.rnd(k + takt) * 14, 1);
    },
    rauch: (c, t, r, o, i) => schwarm(5, t, 0.5, (k, q) => alpha(c, 0.7 - q * 0.7, () => K.px(c, (o.x !== undefined ? o.x : r.cx) + Math.sin(q * 6 + k) * 3, (o.y !== undefined ? o.y : r.oben) - q * 14, k % 2 ? "#8b877d" : "#c8c4b8", 2, 2))),
    blasen: (c, t, r, o, i) => schwarm(5, t, 0.4, (k, q) => K.zeichne(c, M.blase, r.cx - 12 + k * 6 + Math.sin(q * 8 + k) * 2, r.oben + 8 - q * 30, i.f)),
    staub: (c, t, r, o, i) => schwarm(3, t, 1.5, (k, q) => alpha(c, 0.6 - q * 0.6, () => K.px(c, r.cx + (o.rechts ? 8 : -9) + (o.rechts ? 1 : -1) * q * 6, K.BODEN - 1 - q * 3 - k, "#c8c4b8", 2, 1))),
    blaetter: (c, t, r, o, i) => {
      const art = [M.blattG, M.blattO, M.blattR];
      for (let k = 0; k < 6; k++) {
        const q = (t * 0.3 + K.rnd(k)) % 1;
        K.zeichne(c, art[k % 3], ((K.rnd(k * 3) * K.W + q * 20) % (K.W + 4)) - 2, q * K.H - 2 + Math.sin(q * 9 + k) * 2, i.f);
      }
    },
    muenzen: (c, t, r, o, i) => schwarm(3, t, 0.9, (k, q) => K.zeichne(c, M.muenze, (o.x !== undefined ? o.x : r.cx) - 6 + k * 5, (o.y !== undefined ? o.y : r.oben) - Math.sin(q * Math.PI) * 12, i.f)),
    code: (c, t, r, o, i) => { const z = ["{", "}", "<", ">", "/", "=", ";"]; schwarm(4, t, 0.35, (k, q) => alpha(c, 1 - q, () => K.text(c, z[k % z.length] === ";" ? ":" : z[k % z.length], r.cx - 14 + k * 8, r.oben - q * 14, i.tinte))); },
    laden: (c, t, r, o, i) => {
      const cx = r.cx, cy = r.oben - 7, akt = Math.floor(t * 8) % 8;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        alpha(c, k === akt ? 1 : 0.3, () => K.px(c, cx + Math.round(Math.cos(a) * 3), cy + Math.round(Math.sin(a) * 3), i.tinte));
      }
    },
    punkte: (c, t, r, o, i) => { const n = Math.floor(t * 2.5) % 4; for (let k = 0; k < n; k++) K.px(c, r.cx + 4 + k * 3, r.oben - 4 - k, i.tinte, 2, 2); },
    wut: (c, t, r, o, i) => {
      if (Math.floor(t * 5) % 2) K.zeichne(c, ["r.r", ".r.", "r.r"], r.rechts - 2, r.oben - 4, i.f);
      K.FX.rauch(c, t, r, { x: r.cx, y: r.oben - 2 }, i);
    },
    traenen: (c, t, r, o, i) => schwarm(2, t, 1.1, (k, q) => {
      K.px(c, r.cx - 5 - q * 3, r.augeY + 2 + q * 10, "#62c9e8");
      K.px(c, r.cx + 4 + q * 3, r.augeY + 2 + q * 10, "#62c9e8");
    }),
    text: (c, t, r, o, i) => {
      if (o.blink && Math.floor(t * 3) % 2) return;
      const s = typeof o.txt === "function" ? o.txt(t) : o.txt;
      K.text(c, s, (o.x !== undefined ? o.x : r.cx - (K.textBreite(s) >> 1)), (o.y !== undefined ? o.y : r.oben - 8) + (o.huepf ? Math.round(Math.sin(t * 5)) : 0), o.farbe || i.tinte);
    },
    wellen: (c, t, r, o, i) => {
      const y = o.y || K.BODEN - 1;
      for (let x = 0; x < K.W; x++) {
        const h = Math.round(Math.sin(x * 0.5 + t * 5) * 1.2);
        K.px(c, x, y + h, "#3a6fd6", 1, 1);
        K.px(c, x, y + h + 1, "#62c9e8", 1, K.H - y);
      }
    },
    schall: (c, t, r, o, i) => {
      for (let k = 0; k < 3; k++) {
        const q = (t * 0.9 + k / 3) % 1;
        const x = o.aus ? r.rechts + 2 + q * 10 : r.rechts + 14 - q * 12;
        alpha(c, 1 - Math.abs(q - 0.5) * 1.6, () => K.ellipse(c, x, r.oben + 4, 1.5, 3 + (o.aus ? q * 2 : 2 - q * 2), i.tinte, -0.2, 0.2));
      }
    },
    aura: (c, t, r, o, i) => alpha(c, 0.45 + Math.sin(t * 4) * 0.3, () => {
      c.strokeStyle = o.farbe || "#34e8a8";
      c.lineWidth = 1;
      c.strokeRect(r.links - 2.5, r.oben - 2.5, r.bw + 5, r.bh + r.beinH + 4);
    }),
    regenbogen: (c, t, r, o, i) => {
      const farben = ["#d9443a", "#f28c28", "#f5d03b", "#86c95c", "#3a6fd6", "#9b61d3"];
      const u = 2 * (r.bw + 4) + 2 * (r.bh + r.beinH + 3);
      for (let k = 0; k < u; k++) {
        let x, y, s = k;
        const w = r.bw + 4, h = r.bh + r.beinH + 3;
        if (s < w) { x = s; y = 0; } else if ((s -= w) < h) { x = w; y = s; } else if ((s -= h) < w) { x = w - s; y = h; } else { s -= w; x = 0; y = h - s; }
        K.px(c, r.links - 2 + x, r.oben - 2 + y, farben[Math.floor(k / 3 + t * 10) % farben.length]);
      }
    },
    portal: (c, t, r, o, i) => {
      const x = o.x !== undefined ? o.x : r.cx, farben = ["#9b61d3", "#e23c90", "#2bd4ff"];
      for (let k = 0; k < 3; k++) K.ellipse(c, x, (o.y || 26), 4 + k, 9 + k, farben[(k + Math.floor(t * 8)) % 3]);
    },
    feuerball: (c, t, r, o, i) => { const q = (t * 1.2) % 1; K.zeichne(c, M.flamme[Math.floor(t * 10) % 3], r.handR.x + q * 20, r.handR.y - 2, i.f); },
    schmetterling: (c, t, r, o, i) => K.zeichne(c, M.schmetterling[Math.floor(t * 6) % 2], 24 + Math.sin(t * 0.9) * 18, 10 + Math.sin(t * 2.3) * 6, i.f),
    vogel: (c, t, r, o, i) => {
      if (o.landen) {
        const q = (t * 0.25) % 1;
        const x = q < 0.5 ? K.W - q * 2 * (K.W - r.cx) : r.cx, y = q < 0.5 ? 4 + q * 2 * (r.oben - 6) : r.oben - 2;
        K.zeichne(c, M.vogel[q < 0.5 ? Math.floor(t * 8) % 2 : 1], x, y, i.f);
      } else K.zeichne(c, M.vogel[Math.floor(t * 6) % 2], ((t * 12) % (K.W + 10)) - 5, 6 + Math.sin(t * 3) * 2, i.f);
    },
    blitzlicht: (c, t, r, o, i) => { if (t % 2 < 0.12) alpha(c, 0.8, () => K.px(c, 0, 0, "#ffffff", K.W, K.H)); },
    sonne: (c, t, r, o, i) => { K.zeichne(c, M.sonne, 38, 2, i.f); if (Math.floor(t * 2) % 2) { K.px(c, 36, 4, "#f5d03b"); K.px(c, 44, 4, "#f5d03b"); } },
    wind: (c, t, r, o, i) => { for (let k = 0; k < 6; k++) { const q = (t * 1.5 + K.rnd(k)) % 1; alpha(c, 0.5, () => K.px(c, K.W - q * (K.W + 12), 6 + K.rnd(k * 3) * 28, i.tinte, 5, 1)); } },
    pfeile: (c, t, r, o, i) => {
      const P = [["..*..", ".***.", "*****"], ["*****", ".***.", "..*.."], ["..*", ".**", "***", ".**", "..*"], ["*..", "**.", "***", "**.", "*.."]];
      for (let k = 0; k < 4; k++) { const q = (t * 0.6 + k / 4) % 1; K.zeichne(c, P[k], 4 + k * 11, K.H - q * K.H, i.f); }
    },
    traum: (c, t, r, o, i) => {
      K.px(c, r.cx + 6, r.oben - 2, i.tinte); K.px(c, r.cx + 8, r.oben - 5, i.tinte, 2, 2);
      K.ellipse(c, r.cx + 12, r.oben - 12, 9, 5, i.tinte);
      const q = (t * 0.7) % 1;
      K.zeichne(c, M.schaf, r.cx + 6 + q * 8, r.oben - 15 - Math.sin(q * Math.PI) * 3, i.f);
    },
    schnarchblase: (c, t, r, o, i) => { const q = (t * 0.4) % 1; if (q < 0.85) alpha(c, 0.8, () => K.ellipse(c, r.cx + 5, r.oben + 5, 1 + q * 4, 1 + q * 4, "#62c9e8")); },
    kaefer: (c, t, r, o, i) => K.zeichne(c, M.kaefer[Math.floor(t * 6) % 2], ((t * 6) % (K.W + 6)) - 3, K.BODEN - 4, i.f),
    dateien: (c, t, r, o, i) => schwarm(3, t, 0.6, (k, q) => K.zeichne(c, M.datei, r.cx - 10 + q * 20, r.oben - 2 - Math.sin(q * Math.PI) * 12, i.f)),
    baelle: (c, t, r, o, i) => {
      const f = ["#d9443a", "#3a6fd6", "#f5d03b"];
      schwarm(3, t, 0.7, (k, q) => K.px(c, r.cx - 9 + q * 18, r.oben - 1 - Math.sin(q * Math.PI) * 13, f[k], 2, 2));
    },
    strahlen: (c, t, r, o, i) => {
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2 + t;
        const d0 = 10 + ((t * 8) % 4);
        K.px(c, r.cx + Math.cos(a) * d0, r.mitte.y + Math.sin(a) * d0, "#f5d03b");
        K.px(c, r.cx + Math.cos(a) * (d0 + 3), r.mitte.y + Math.sin(a) * (d0 + 3), "#f5d03b");
      }
    },
    tempo: (c, t, r, o, i) => { for (let k = 0; k < 4; k++) alpha(c, 0.6, () => K.px(c, (o.rechts ? r.rechts + 2 : r.links - 9) + ((t * 30 + k * 3) % 4), r.oben + 1 + k * 3, i.tinte, 6, 1)); },
    seil: (c, t, r, o, i) => K.linie(c, r.cx, 0, r.cx, r.oben - 1, "#9b6b3d"),
    springseil: (c, t, r, o, i) => {
      const q = (t * 1.6) % 1;
      const y = q < 0.5 ? r.oben - 3 - Math.sin(q * 2 * Math.PI) * 4 : K.BODEN + Math.sin((q - 0.5) * 2 * Math.PI) * 1;
      K.linie(c, r.handL.x, r.handL.y + 1, r.cx - 4, y, "#d9443a");
      K.linie(c, r.cx - 4, y, r.cx + 4, y, "#d9443a");
      K.linie(c, r.cx + 4, y, r.handR.x, r.handR.y + 1, "#d9443a");
    },
    bett: (c, t, r, o, i) => {
      K.px(c, 8, 27, "#5c3c1f", 2, 10); K.px(c, 38, 30, "#5c3c1f", 2, 7);
      K.px(c, 8, 33, "#9b6b3d", 32, 3); K.px(c, 10, 31, "#f4f1e8", 5, 2);
    },
    haengematte: (c, t, r, o, i) => {
      K.px(c, 4, 18, "#5c3c1f", 2, 19); K.px(c, 42, 18, "#5c3c1f", 2, 19);
      for (let x = 6; x < 42; x++) K.px(c, x, 20 + Math.round(Math.sin(((x - 6) / 36) * Math.PI) * 10), "#86c95c");
    },
    knall: (c, t, r, o, i) => {
      const q = (t * 0.8) % 1;
      if (q < 0.4) for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; K.px(c, (o.x || r.cx) + Math.cos(a) * q * 30, (o.y || r.oben) + Math.sin(a) * q * 30, k % 2 ? "#f28c28" : "#f5d03b", 2, 2); }
    },
    rakete: (c, t, r, o, i) => { const q = (t * 0.5) % 1; K.zeichne(c, M.rakete, 36, K.BODEN - 5 - q * 44, i.f); if (Math.floor(t * 10) % 2) K.px(c, 37, K.BODEN - q * 44, "#f28c28", 1, 2); },
    fisch: (c, t, r, o, i) => { const q = (t * 0.5) % 1; if (q < 0.6) K.zeichne(c, M.fisch, 30 + q * 20, K.BODEN - Math.sin((q / 0.6) * Math.PI) * 14, i.f); },
    wurf: (c, t, r, o, i) => { const q = (t * 0.8) % 1; K.zeichne(c, o.map ? o.map : M.ball, r.handR.x + q * 24, r.handR.y - 3 - Math.sin(q * Math.PI) * 10, i.f); },
    laser: (c, t, r, o, i) => { if (Math.floor(t * 2) % 2) { K.px(c, r.cx + 3, r.augeY, "#d9443a", K.W, 1); K.px(c, r.cx - 4, r.augeY + 1, "#d9443a", 4, 1); } },
    fliegen: (c, t, r, o, i) => { for (let k = 0; k < 3; k++) { const a = t * 3 + k * 2.1; K.zeichne(c, M.fliege[Math.floor(t * 10 + k) % 2], r.cx + Math.cos(a) * 11, r.oben + Math.sin(a * 1.3) * 5, i.f); } },
    gluehwuermchen: (c, t, r, o, i) => { for (let k = 0; k < 6; k++) alpha(c, 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + k)), () => K.px(c, 24 + Math.sin(t * 0.7 + k * 1.9) * 20, 16 + Math.cos(t * 0.9 + k * 1.3) * 12, k % 2 ? "#c9ff3d" : "#f5d03b")); },
    regenwolke: (c, t, r, o, i) => {
      K.zeichne(c, o.dunkel ? M.wolkeD : M.wolke, r.cx - 4, r.oben - 12, i.f);
      for (let k = 0; k < 4; k++) { const q = (t * 1.8 + k / 4) % 1; K.px(c, r.cx - 3 + k * 2, r.oben - 9 + q * 8, "#3a6fd6", 1, 2); }
      if (o.dunkel && t % 1.7 < 0.15) K.zeichne(c, M.blitz, r.cx, r.oben - 9, i.f);
    },
    pixelstaub: (c, t, r, o, i) => {
      const q = o.q !== undefined ? o.q : 0;
      for (let y = 0; y < r.bh; y += 1) for (let x = 0; x < r.bw; x += 2) {
        const n = K.rnd(x * 31 + y * 7);
        K.px(c, r.links + x + (n - 0.5) * q * 30, r.oben + y - q * 20 * n, i.f.body);
      }
    },
    herzpuls: (c, t, r, o, i) => { const s = Math.floor(t * 3) % 2; K.zeichne(c, s ? M.herz : M.herzK, r.cx - (s ? 2 : 1), r.oben - 9, i.f); },
    geist: (c, t, r, o, i) => { K.zeichne(c, ["..www..", ".wwwwww", ".wkwkww", "wwwwwww", "w.w.w.w"], 38 + Math.sin(t * 2) * 2, 8 + Math.sin(t * 3) * 2, i.f); },
    blumenwiese: (c, t, r, o, i) => { for (let k = 0; k < 8; k++) { K.px(c, 3 + k * 6, K.BODEN - 2, "#3e8f3b", 1, 2); K.px(c, 3 + k * 6, K.BODEN - 3, ["#f282b4", "#f5d03b", "#f4f1e8"][k % 3]); } },
    sternschnuppe: (c, t, r, o, i) => { const q = (t * 0.4) % 1; if (q < 0.4) { const x = 44 - q * 90, y = 2 + q * 30; K.px(c, x, y, "#f5d03b"); alpha(c, 0.5, () => K.px(c, x + 1, y - 1, "#f5d03b", 3, 1)); } },
    kreise: (c, t, r, o, i) => { for (let k = 0; k < 3; k++) { const q = (t * 0.8 + k / 3) % 1; alpha(c, 1 - q, () => K.ellipse(c, r.cx, r.mitte.y, 6 + q * 14, 4 + q * 10, o.farbe || i.tinte)); } },
    uhr: (c, t, r, o, i) => { const s = Math.floor(t * 10) % 100; K.text(c, (s < 10 ? "0" : "") + s, 36, 3, "#d9443a"); },
    lvup: (c, t, r, o, i) => { K.text(c, "LV UP", r.cx - 9, r.oben - 9 - (Math.floor(t * 4) % 2), "#34e8a8"); },
    notizen: (c, t, r, o, i) => { for (let k = 0; k < 3; k++) K.px(c, r.handL.x - 6, r.handL.y - 4 + k * 2, i.tinte, 2 + ((Math.floor(t * 3) + k) % 3), 1); },
    kabel: (c, t, r, o, i) => { for (let k = 0; k < 3; k++) K.ellipse(c, r.cx + Math.sin(t + k) * 3, r.mitte.y + 2, 8 - k, 3 + k, ["#d9443a", "#3a6fd6", "#86c95c"][k]); },
    bogen: (c, t, r, o, i) => K.ellipse(c, r.cx, r.mitte.y, 12, 12, o.farbe || "#9b61d3", t % 1, (t % 1) + 0.25)
  };
})();
