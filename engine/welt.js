(() => {
  const K = window.K;
  const h = (a, b) => K.rnd(a * 12.9898 + b * 78.233);
  const FUNDE = ["><((('>", "=o=", "[$]", "(@)", "404", "<3", "{ }", "</>", "0110", "\\o/", "[:]", "^_^", "[qwerty]", "$ sudo", "o", "O", "()", ":)", "~ ~", "<*>"];
  const KRISTALLE = ["/\\", "<>", "/^\\", "\\/", "|"];
  const PLANETEN = [
    ["   .-\"\"-.   ", "  /      \\  ", " |  ()    | ", "  \\      /  ", "   '-..-'   "],
    ["       _____       ", "  ___ /     \\ ___  ", " (___(       )___) ", "      \\_____/      "],
    [" .-. ", "(   )", " `-' "]
  ];
  const KOMET = ["   *", " .-'", "'   "];

  K.welt = (cols, rows, start, t, nacht, heldZeilen, heldText, gesamt) => {
    const zeilen = [];
    const tief = Math.max(1, gesamt - heldZeilen);
    const planeten = [];
    for (let i = 0; i < 4; i++) planeten.push({ zeile: heldZeilen + Math.floor(tief * (0.76 + i * 0.055)), spalte: Math.floor(h(i, 3) * Math.max(1, cols - 22)), form: PLANETEN[i % PLANETEN.length] });
    for (let r = start; r < start + rows; r++) {
      if (r < 0) { zeilen.push(""); continue; }
      if (r < heldZeilen) { zeilen.push(heldText[r] || ""); continue; }
      const z = Array(cols).fill(" ");
      const d = r - heldZeilen, f = d / tief;
      if (f < 0.3) {
        const dichte = 0.03 + 0.16 * Math.max(0, 1 - f / 0.3) * Math.max(0, 1 - d / 60) + 0.035;
        for (let c = 0; c < cols; c++) {
          const n = h(c, r);
          if (n < dichte) z[c] = ".:'`,"[Math.floor(h(r, c) * 5)];
          if (d < 14 && h(Math.floor(c / 3), 7) > 0.8 && h(c, 3) > 0.55) z[c] = d < 3 ? "|" : (h(c, r) > 0.5 ? "/" : "\\");
        }
        for (let c = 0; c < cols; c++) {
          if (h(c * 3.1, r * 1.7) > 0.9965) {
            const fund = FUNDE[Math.floor(h(r, c * 2) * FUNDE.length)];
            for (let k = 0; k < fund.length && c + k < cols; k++) z[c + k] = fund[k];
            c += fund.length;
          }
        }
        if (d > 6 && h(r, 11) > 0.93) {
          const x = Math.floor(((h(r, 5) * cols + t * (1.5 + h(r, 9) * 2)) % (cols + 6))) - 3;
          const wurm = Math.floor(t * 4) % 2 ? "~~o" : "~~O";
          for (let k = 0; k < wurm.length; k++) if (x + k >= 0 && x + k < cols) z[x + k] = wurm[k];
        }
      } else if (f < 0.72) {
        const g = (f - 0.3) / 0.42;
        const wandL = 2 + Math.floor(h(Math.floor(r / 2), 1) * 6 + Math.sin(r * 0.21) * 3 + g * 4);
        const wandR = 2 + Math.floor(h(Math.floor(r / 2), 2) * 6 + Math.cos(r * 0.17) * 3 + g * 4);
        for (let c = 0; c < cols; c++) {
          if (c < wandL || c >= cols - wandR) { z[c] = h(c, r) > 0.35 ? "#" : "%"; continue; }
          const n = h(c, r);
          if (n > 0.992) z[c] = KRISTALLE[Math.floor(h(r, c) * KRISTALLE.length)][0];
          else if (n > 0.975) z[c] = h(r * 3, c) > 0.5 ? "v" : "V";
          else if (n < 0.02) z[c] = ".";
        }
        for (let k = 0; k < 6; k++) {
          const c = Math.floor(h(k, 17) * cols), q = ((t * 0.6 + h(k, 19)) % 1);
          const y = heldZeilen + Math.floor(tief * (0.32 + h(k, 23) * 0.38) + q * 12);
          if (y === r && c > wandL && c < cols - wandR) z[c] = "'";
        }
      } else {
        for (let c = 0; c < cols; c++) {
          const n = h(c, r);
          if (n > 0.985) z[c] = Math.sin(t * 2 + c * 0.7 + r) > 0.4 ? "*" : "+";
          else if (n > 0.96) z[c] = ".";
        }
        for (const p of planeten) {
          const j = r - p.zeile;
          if (j >= 0 && j < p.form.length) for (let k = 0; k < p.form[j].length; k++) if (p.form[j][k] !== " " && p.spalte + k < cols) z[p.spalte + k] = p.form[j][k];
        }
        const kz = heldZeilen + Math.floor(tief * 0.86) + Math.floor((t * 3) % 30), ks = Math.floor(cols - ((t * 9) % (cols + 20)));
        const kj = r - kz;
        if (kj >= 0 && kj < KOMET.length) for (let k = 0; k < KOMET[kj].length; k++) if (KOMET[kj][k] !== " " && ks + k >= 0 && ks + k < cols) z[ks + k] = KOMET[kj][k];
      }
      zeilen.push(z.join(""));
    }
    return zeilen.join("\n");
  };
})();
