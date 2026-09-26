(() => {
  const K = window.K;
  const WOLKEN = [
    ["      _  _       ", "    ( `   )_     ", "   (    )    `)  ", "    `--'--`--'   "],
    ["    .-~~-.       ", "   (      )-.    ", "  (__________)   "],
    ["  _/\\_  ,  ", " (  _ `/ \\ ", "  `' `--' "],
    ["   .   _    ", "  / \\_( )_  ", " (_______)  "],
    [" ~~ ~ ~~ "],
    ["  ,-.,  ", " (   _) ", "  `-'   "]
  ];
  const VOEGEL = [["\\/"], ["v"], ["~v~"], ["\\_/"]];
  const MOND = ["  _  ", " / ) ", "( (  ", " \\_) "];
  const BAND = "#=<>X/\\|*+%&:;";

  const FIGLET = {
    C: ["  ____ ", " / ___|", "| |    ", "| |___ ", " \\____|"],
    L: [" _     ", "| |    ", "| |    ", "| |___ ", "|_____|"],
    A: ["    _    ", "   / \\   ", "  / _ \\  ", " / ___ \\ ", "/_/   \\_\\"],
    U: [" _   _ ", "| | | |", "| | | |", "| |_| |", " \\___/ "],
    D: [" ____  ", "|  _ \\ ", "| | | |", "| |_| |", "|____/ "],
    E: [" _____ ", "| ____|", "|  _|  ", "| |___ ", "|_____|"]
  };
  const titel = (g, set, text, r0, c0) => {
    let c = c0;
    for (const ch of text) {
      const glyph = FIGLET[ch];
      if (!glyph) { c += 4; continue; }
      glyph.forEach((zeile, j) => [...zeile].forEach((z, i) => set(r0 + j, c + i, z)));
      c += glyph[0].length;
    }
    return c;
  };
  K.titelBreite = (text) => [...text].reduce((n, ch) => n + (FIGLET[ch] ? FIGLET[ch][0].length : 4), 0);

  K.landschaft = (cols, rows, t, nacht, titelText, untertitel = "körper-katalog") => {
    const g = Array.from({ length: rows }, () => Array(cols).fill(" "));
    const set = (r, c, ch) => { if (r >= 0 && r < rows && c >= 0 && c < cols && ch !== " ") g[r][c] = ch; };
    const boden = Math.round(rows * 0.64);
    const bandStart = boden - 3, riedStart = boden + 2;

    if (nacht) {
      const n = Math.floor(cols * bandStart * 0.025);
      for (let i = 0; i < n; i++) {
        const r = Math.floor(K.rnd(i * 3.7) * (bandStart - 4)), c = Math.floor(K.rnd(i * 9.1) * cols);
        set(r, c, Math.sin(t * 1.5 + i) > 0.6 ? "*" : K.rnd(i) > 0.5 ? "." : "+");
      }
      MOND.forEach((z, j) => [...z].forEach((ch, i) => set(1 + j, cols - 12 + i, ch)));
    }

    const anzahl = Math.max(4, Math.floor(cols / 22));
    for (let i = 0; i < anzahl; i++) {
      const w = WOLKEN[i % WOLKEN.length], breite = w[0].length;
      const tempo = 0.6 + K.rnd(i * 5) * 1.4;
      const x = Math.floor((((K.rnd(i * 2.3) * (cols + breite) + t * tempo) % (cols + breite)) + cols + breite) % (cols + breite)) - breite;
      const r0 = 1 + Math.floor(K.rnd(i * 7.7) * Math.max(1, bandStart - 10));
      w.forEach((z, j) => [...z].forEach((ch, k) => set(r0 + j, x + k, ch)));
    }
    if (!nacht) for (let i = 0; i < 3; i++) {
      const v = VOEGEL[(i + Math.floor(t * 2)) % VOEGEL.length][0];
      const x = Math.floor(((K.rnd(i * 4.1) * cols + t * (2.5 + i)) % (cols + 6))) - 3;
      [...v].forEach((ch, k) => set(3 + i * 2 + Math.round(Math.sin(t * 0.8 + i) * 0.6), x + k, ch));
    }

    if (titelText) {
      const breite = K.titelBreite(titelText);
      for (let r = 0; r < 9 && r < rows; r++) for (let c = 0; c < breite + 6 && c < cols; c++) g[r][c] = " ";
      titel(g, set, titelText, 1, 3);
      [...untertitel].forEach((ch, k) => set(7, 4 + k, ch));
    }

    const kamm = (c) => Math.round(bandStart - 4 + Math.sin(c * 0.09) * 1.6 + Math.sin(c * 0.023 + 1.3) * 2.2 + Math.sin(c * 0.31) * 0.4);
    for (let c = 0; c < cols; c++) {
      const h = kamm(c), vor = kamm(c - 1), nach = kamm(c + 1);
      set(h, c, h < vor && h < nach ? "^" : h < vor ? "/" : h > vor ? "\\" : h > nach ? "/" : "_");
      for (let r = h + 1; r < bandStart; r++) {
        const n = K.rnd(c * 31 + r * 7);
        const dichte = 0.08 + ((r - h) / (bandStart - h)) * 0.25;
        if (n < dichte) set(r, c, n < dichte * 0.4 ? ":" : ".");
      }
    }

    for (let r = bandStart; r < riedStart; r++) {
      const tief = (r - bandStart) / (riedStart - bandStart);
      for (let c = 0; c < cols; c++) {
        const n = K.rnd(c * 13.3 + r * 71.1);
        if (n < 0.28 + tief * 0.55) set(r, c, BAND[Math.floor(K.rnd(c * 3 + r * 17) * BAND.length)]);
        if (K.rnd(Math.floor(c / 5) * 19 + r * 3) > 0.9 - tief * 0.12) set(r, c, tief > 0.6 ? "█" : "▀");
      }
    }

    for (let c = 0; c < cols; c++) {
      const h = 1 + Math.floor(K.rnd(Math.floor(c / 2) * 7.3) * (rows - riedStart)) + (K.rnd(c * 1.7) > 0.8 ? 1 : 0);
      for (let r = riedStart; r < rows; r++) {
        const vonUnten = rows - r;
        if (vonUnten <= h) set(r, c, "█");
        else if (vonUnten === h + 1 && K.rnd(c * 5.1) > 0.5) set(r, c, "▄");
        else if (K.rnd(c * 17 + r * 3) > 0.7) set(r, c, BAND[Math.floor(K.rnd(c + r * 11) * BAND.length)]);
      }
    }

    return { text: g.map((z) => z.join("")).join("\n"), boden };
  };
})();
