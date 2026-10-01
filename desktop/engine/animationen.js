(() => {
  const K = window.K;
  K.FX.fn = (c, t, r, o, i) => o.fn(c, t, r, i);
  K.PROPS.daumen = ["@.", "@@"];
  K.PROPS.hand = ["@@", "@@"];

  const TAU = Math.PI * 2;
  const sin = (t, f = 1, ph = 0) => Math.sin((t * f + ph) * TAU);
  const ph = (t, per) => (((t % per) + per) % per) / per;
  const r = Math.round;
  const takt = (t, fps, n) => Math.floor(t * fps) % n;
  const glatt = (u) => u * u * (3 - 2 * u);
  const blinzeln = (p, t, o = 0) => {
    const q = ph(t + o, 3.7);
    if (q > 0.955 || (q > 0.9 && q < 0.915 && ph(t + o, 11.1) > 0.55)) p.augen = "zu";
  };
  const atmen = (p, t, f = 0.3) => { if (sin(t, f) > 0.55) p.bh += 1; };
  const leben = (p, t, o = 0) => { atmen(p, t); blinzeln(p, t, o); };
  const gehen = (p, t, v = 1.5, o = {}) => {
    const k = takt(t, v * 8, 8);
    const a = [0, 1, 2, 1, 0, 0, 0, 0][k], b = [0, 0, 0, 0, 0, 1, 2, 1][k];
    p.lift = [a, b, a, b];
    if (k === 2 || k === 6) p.dy -= o.hub === undefined ? 1 : o.hub;
    if (!o.arme) {
      const s = [0, -1, -1, 0, 0, 1, 1, 0][k];
      p.aL[1] += s;
      p.aR[1] -= s;
    }
    if (!o.blick) p.ex += 1;
    return k;
  };
  const huepfen = (p, t, f = 1, h = 6) => {
    const q = ph(t, 1 / f);
    if (q < 0.12) { p.bh -= 1; p.bw += 1; return q; }
    const u = (q - 0.12) / 0.88;
    p.dy -= r(Math.sin(u * Math.PI) * h);
    p.lift = [1, 1, 1, 1];
    if (u < 0.35) { p.bh += 1; p.bw -= 1; }
    return q;
  };
  const wippen = (p, t, f = 1, a = 1) => { p.dy -= r(Math.abs(sin(t, f / 2)) * a); };
  const zittern = (p, t, a = 1) => { p.dx += r((K.rnd(Math.floor(t * 30)) - 0.5) * 2 * a); };
  const pr = (id, an, dx = 0, dy = 0, x) => Object.assign({ id, an, dx, dy }, x || {});
  const fx = (typ, x) => Object.assign({ typ }, x || {});
  const v = (p) => (p.spiegel ? -1 : 1);
  const liegen = (p, w = 90) => { p.dreh = w; p.pivot = "mitte"; };
  const tropfen = (x0, y0, x1, y1, farbe, n = 3) => fx("fn", { fn: (c, t) => { for (let k = 0; k < n; k++) { const q = (t * 1.5 + k / n) % 1; K.px(c, x0 + (x1 - x0) * q, y0 + (y1 - y0) * q, farbe); } } });

  const ZAHL = ["dx", "dy", "bw", "bh", "ex", "ey", "mundY", "dreh", "alpha"];
  const WAHL = ["armL", "armR", "augen", "mund", "beine", "pivot", "rot"];
  const kp = (p, t, per, keys) => {
    const q = ph(t, per);
    let i = 0;
    while (i + 1 < keys.length && keys[i + 1].q <= q) i++;
    const a = keys[i], b = keys[i + 1] || Object.assign({}, keys[0], { q: 1 });
    const u = b.q > a.q ? (q - a.q) / (b.q - a.q) : 0;
    const e = a.h ? 0 : glatt(u);
    for (const f of ZAHL) {
      const va = a[f] || 0, vb = b[f] || 0;
      if (va || vb) p[f] += f === "dreh" || f === "alpha" ? va + (vb - va) * e : r(va + (vb - va) * e);
    }
    for (const f of ["lift", "aL", "aR"]) {
      if (!a[f] && !b[f]) continue;
      const A = a[f] || [], B = b[f] || [];
      for (let k = 0; k < p[f].length; k++) p[f][k] += r((A[k] || 0) + ((B[k] || 0) - (A[k] || 0)) * e);
    }
    for (const f of WAHL) if (a[f] !== undefined) p[f] = a[f];
    return { q, i, u };
  };

  const A = [];
  const neu = (n, c, f, x) => A.push(Object.assign({ n, c, f }, x || {}));

  let K1 = "Unterwegs";
  neu("Spazieren", K1, (p, t) => {
    gehen(p, t, 1.5);
    blinzeln(p, t);
    const q = ph(t, 9);
    if (q > 0.55 && q < 0.7) { p.ey = -1; p.mund = "pfeifen"; }
    else if (q > 0.82 && q < 0.88) p.ex -= 3;
  }, { laeuft: 7, per: 2 });
  neu("Wandern mit Stock", K1, (p, t) => {
    const k = gehen(p, t, 1.2, { arme: true });
    const s = k < 4 ? 0 : 1;
    p.aR[1] -= s;
    p.aL[1] += [0, -1, -1, 0, 0, 1, 1, 0][k];
    p.props.push(pr("stock", "griffR", s, s ? -1 : 0));
    blinzeln(p, t);
    if (ph(t, 8) > 0.7) p.mund = "laecheln";
  }, { laeuft: 5, per: 1.7 });
  neu("Rennen", K1, (p, t) => {
    const k = gehen(p, t, 3.2, { hub: 2, arme: true });
    p.dreh = 9 * v(p);
    p.armL = p.armR = "halb";
    const s = k < 4 ? 1 : -1;
    p.aL[0] += s;
    p.aR[0] -= s;
    if (k === 0 || k === 4) { p.bh -= 1; p.bw += 1; }
    p.mund = "o";
    p.fx.push(fx("staub", { rechts: p.spiegel }), fx("tempo", { rechts: p.spiegel }));
  }, { laeuft: 18, per: 0.63 });
  neu("Schleichen", K1, (p, t) => {
    gehen(p, t, 0.7, { hub: 0, arme: true, blick: true });
    p.bh -= 2;
    p.bw += 1;
    p.armL = p.armR = "halb";
    p.aL[0] += 1;
    const q = ph(t, 3);
    p.ex = q < 0.4 ? 2 : q < 0.5 ? 0 : q < 0.9 ? -2 : 0;
    p.mund = "flach";
    if (q > 0.4 && q < 0.5) p.augen = "halb";
  }, { laeuft: 3, per: 3 });
  neu("Hüpfen", K1, (p, t) => {
    const q = huepfen(p, t, 1.6, 6);
    p.augen = "froh";
    p.mund = q < 0.12 ? "laecheln" : "breit";
    p.armL = p.armR = q < 0.12 ? "unten" : "halb";
    p.ex = 1;
  }, { laeuft: 8, per: 0.63 });
  neu("Moonwalk", K1, (p, t) => {
    const k = takt(t, 5, 4);
    p.lift = k < 2 ? [0, 1, 0, 1] : [1, 0, 1, 0];
    p.dreh = -4 * v(p);
    p.armL = p.armR = "halb";
    p.aL[1] = k < 2 ? 0 : 1;
    p.aR[1] = k < 2 ? 1 : 0;
    p.augen = "zu";
    const q = ph(t, 4);
    if (q > 0.8) { p.mund = "o"; p.armR = "oben"; p.aR[0] = -1; p.dy -= 1; }
    else p.mund = "laecheln";
    p.fx.push(fx("noten"));
  }, { laeuft: -6, per: 4 });
  neu("Stolpern", K1, (p, t) => {
    const q = ph(t, 2.4);
    if (q < 0.35) { gehen(p, t, 1.8); blinzeln(p, t); return; }
    if (q < 0.45) {
      p.dreh = 18 * v(p) * glatt((q - 0.35) / 0.1);
      p.armL = p.armR = "oben";
      p.augen = "gross";
      p.mund = "o";
      p.lift = [2, 0, 0, 2];
      p.fx.push(fx("ausruf"));
      return;
    }
    if (q < 0.7) {
      const k = takt(t, 9, 2);
      p.armL = k ? "oben" : "raus";
      p.armR = k ? "raus" : "oben";
      p.dreh = (16 - ((q - 0.45) / 0.25) * 16) * v(p) * (k ? 1 : 0.6);
      p.augen = "gross";
      p.mund = "o";
      p.lift = k ? [0, 2, 0, 0] : [0, 0, 2, 0];
      return;
    }
    if (q < 0.8) { p.bh -= 1; p.bw += 1; p.augen = "zu"; p.mund = "flach"; return; }
    p.mund = "schief";
    p.augen = "halb";
    p.fx.push(fx("schweiss"));
  }, { per: 2.4 });
  neu("Seitwärts trippeln", K1, (p, t) => {
    const k = takt(t, 8, 2);
    p.lift = k ? [1, 0, 1, 0] : [0, 1, 0, 1];
    p.dy -= k;
    p.armL = p.armR = "oben";
    p.aL[0] = k ? -1 : 0;
    p.aR[0] = k ? 0 : 1;
    p.augen = "gross";
    p.mund = "o";
    p.ex = 2;
  }, { laeuft: 4, per: 0.5 });
  neu("Joggen", K1, (p, t) => {
    const k = gehen(p, t, 2.5, { arme: true });
    p.armL = p.armR = "halb";
    p.aL[1] = k < 4 ? -1 : 0;
    p.aR[1] = k < 4 ? 0 : -1;
    if (k === 0 || k === 4) p.bh -= 1;
    p.props.push(pr("stirnband", "kopf", 0, 3));
    p.mund = k % 4 < 2 ? "o" : "klein";
    p.fx.push(fx("schweiss"));
    blinzeln(p, t);
  }, { laeuft: 10, per: 0.8 });
  neu("Marschieren", K1, (p, t) => {
    const k = takt(t, 4, 4);
    p.lift = k === 1 ? [2, 0, 2, 0] : k === 3 ? [0, 2, 0, 2] : [0, 0, 0, 0];
    p.dy -= k % 2;
    p.armL = k === 3 ? "raus" : "unten";
    p.armR = k === 1 ? "raus" : "unten";
    p.bh += 1;
    p.mund = "flach";
    p.ex = 1;
  }, { laeuft: 5, per: 1 });
  neu("Watscheln", K1, (p, t) => {
    gehen(p, t, 1, { hub: 0, arme: true });
    p.dreh = sin(t, 1) * 9;
    p.bw += 1;
    p.bh -= 1;
    p.armL = p.armR = "raus";
    p.aL[1] = takt(t, 4, 2);
    p.aR[1] = 1 - takt(t, 4, 2);
    p.augen = "froh";
    p.mund = "o";
  }, { laeuft: 4, per: 1 });
  neu("Kriechen", K1, (p, t) => {
    const k = takt(t, 3, 4);
    p.beine = "sitzen";
    p.bh -= 3;
    p.bw += 2;
    p.armL = k < 2 ? "raus" : "tief";
    p.armR = k < 2 ? "tief" : "raus";
    p.aL[0] = k === 0 ? -1 : 0;
    p.aR[0] = k === 2 ? 1 : 0;
    p.dx += k % 2;
    p.augen = "halb";
    p.mund = "flach";
    p.ex = 1;
    if (k === 1) p.fx.push(fx("staub", { rechts: p.spiegel }));
  }, { laeuft: 2, per: 1.33 });
  neu("Klettern", K1, (p, t) => {
    const q = ph(t, 5), h = q < 0.5 ? q * 2 : 2 - q * 2;
    p.props.push(pr("leiter", "frei", 22, 0, { ebene: "hinten" }));
    p.dy -= r(glatt(h) * 14);
    const k = takt(t, 3, 2);
    p.armL = k ? "oben" : "halb";
    p.armR = k ? "halb" : "oben";
    p.lift = k ? [1, 1, 0, 0] : [0, 0, 1, 1];
    p.ey = q < 0.5 ? -1 : 1;
    blinzeln(p, t);
  }, { per: 5 });
  neu("Abseilen", K1, (p, t) => {
    const q = ph(t, 4);
    p.fx.push(fx("seil"));
    p.armL = p.armR = "oben";
    p.aL[0] = 3;
    p.aR[0] = -3;
    if (q < 0.85) {
      const s = (q / 0.85) * 3, n = Math.floor(s), u = s - n;
      p.dy += r(-18 + (n + glatt(Math.min(1, u / 0.35))) * 4);
      if (u < 0.35) { p.lift = [0, 0, 0, 0]; p.augen = "gross"; p.mund = "o"; }
      else { p.lift = [2, 2, 0, 0]; p.dreh = -6 * v(p); p.pivot = "kopf"; p.mund = "laecheln"; }
    } else {
      p.dy += r(-6 - ((q - 0.85) / 0.15) * 12);
      p.lift = [1, 0, 1, 0];
      p.ey = -1;
    }
  }, { per: 4 });
  neu("Schwimmen", K1, (p, t) => {
    const k = takt(t, 4, 4);
    p.dy += 3 + r(sin(t, 1));
    p.armL = ["oben", "raus", "unten", "raus"][k];
    p.armR = ["unten", "raus", "oben", "raus"][k];
    p.augen = k === 1 ? "zu" : "offen";
    if (k === 3) p.mund = "o";
    p.ex = 1;
    p.fx.push(fx("wellen", { y: 33 }));
  }, { laeuft: 4, per: 1 });
  neu("Tauchen", K1, (p, t) => {
    const q = ph(t, 1.5);
    p.fx.push(fx("wellen", { y: 5, hinten: true }), fx("blasen"));
    p.dy -= 8 + r(sin(t, 0.33) * 4);
    p.dreh = sin(t, 0.33) * 12;
    p.armL = p.armR = q < 0.3 ? "oben" : q < 0.6 ? "raus" : "unten";
    p.lift = takt(t, 5, 2) ? [1, 0, 1, 0] : [0, 1, 0, 1];
    p.augen = "gross";
    p.mund = "klein";
    p.bw += q < 0.6 ? 0 : 1;
  }, { per: 3 });
  neu("Propellerflug", K1, (p, t) => {
    p.props.push(Object.assign(pr("propeller", "kopf"), { fps: 12 }));
    p.dy -= 10 + r(sin(t, 0.5) * 2);
    p.lift = takt(t, 3, 2) ? [1, 2, 1, 2] : [2, 1, 2, 1];
    p.armL = p.armR = "raus";
    p.aL[1] = p.aR[1] = takt(t, 6, 2) ? -1 : 0;
    p.dreh = 4 * v(p);
    p.augen = "froh";
    p.mund = "laecheln";
  }, { laeuft: 6, per: 2 });
  neu("Jetpack", K1, (p, t) => { p.dy -= 9 + r(sin(t, 1) * 2); p.props.push(pr("jetpack", "ruecken", 0, 2, { ebene: "hinten" })); p.fx.push(fx("feuer", { y: 30 + p.dy }), fx("rauch", { x: 24, y: 36 + p.dy })); p.lift = [1, 1, 1, 1]; p.augen = "gross"; });
  neu("Ballonfahrt", K1, (p, t) => {
    p.armR = "oben";
    p.props.push(pr("ballon", "handR", -3, 1));
    p.dy -= 8 + r(sin(t, 0.33) * 2);
    p.dreh = sin(t, 0.33, 0.25) * 5;
    p.pivot = "kopf";
    p.lift = takt(t, 1.5, 2) ? [1, 2, 1, 2] : [2, 1, 2, 1];
    p.mund = "laecheln";
    if (ph(t, 6) > 0.7) { p.ey = -1; p.ex = 1; } else blinzeln(p, t);
  }, { laeuft: 3, per: 3 });
  neu("Schirmflug", K1, (p, t) => {
    p.armR = "hoch";
    p.props.push(pr("schirm", "handR", -6, 5));
    p.dy -= 6 + r(sin(t, 0.4) * 3);
    p.dreh = sin(t, 0.4) * 7;
    p.pivot = "kopf";
    p.lift = takt(t, 1.6, 2) ? [0, 2, 0, 2] : [2, 0, 2, 0];
    p.armL = "raus";
    p.aL[1] = r(sin(t, 0.4));
    p.augen = "froh";
    p.fx.push(fx("wind"));
  }, { laeuft: 3, per: 2.5 });
  neu("Skateboard", K1, (p, t) => {
    const q = ph(t, 3);
    p.props.push(pr("skateboard", "fuesse"));
    p.fx.push(fx("tempo", { rechts: p.spiegel }));
    if (q < 0.3) {
      const k = takt(t, 3, 2);
      p.lift = k ? [0, 0, 2, 2] : [0, 0, 0, 0];
      p.dreh = 4 * v(p);
      p.armL = "halb";
      p.mund = "laecheln";
    } else if (q < 0.7) {
      p.bh -= 1;
      p.bw += 1;
      p.armL = p.armR = "raus";
      p.aL[1] = r(sin(t, 0.8));
      p.aR[1] = -r(sin(t, 0.8));
      p.augen = "froh";
    } else if (q < 0.9) {
      const u = (q - 0.7) / 0.2;
      p.dy -= r(Math.sin(u * Math.PI) * 7);
      p.dreh = (u < 0.5 ? -8 : 6) * v(p);
      p.lift = [1, 1, 1, 1];
      p.armL = p.armR = "oben";
      p.augen = u < 0.5 ? "gross" : "froh";
      p.mund = "breit";
    } else { p.bh -= 1; p.bw += 1; p.augen = "froh"; p.armL = p.armR = "raus"; }
  }, { laeuft: 16, per: 3 });
  neu("Surfen", K1, (p, t) => {
    const s = sin(t, 0.4);
    p.dy -= 4;
    p.props.push(pr("surfbrett", "fuesse"));
    p.dreh = s * 10;
    p.bh -= 1;
    p.armL = p.armR = "raus";
    p.aL[1] = r(s * 2);
    p.aR[1] = -r(s * 2);
    p.augen = "froh";
    p.mund = Math.abs(s) > 0.8 ? "breit" : "laecheln";
    p.fx.push(fx("wellen", { y: 35 }));
  }, { per: 2.5 });
  neu("Teleportieren", K1, (p, t) => {
    const { q } = kp(p, t, 2.4, [
      { q: 0, dx: -10 },
      { q: 0.18, dx: -10, bw: 1, bh: -1, augen: "zu" },
      { q: 0.3, dx: -10, bw: -2, bh: 2, alpha: -1, augen: "zu" },
      { q: 0.5, dx: 10, bw: -2, bh: 2, alpha: -1, h: 1 },
      { q: 0.58, dx: 10, bw: 1, bh: -1, augen: "gross" },
      { q: 0.68, dx: 10 },
      { q: 0.94, dx: 10, h: 1 }
    ]);
    if (q > 0.12 && q < 0.66) p.fx.push(fx("funkeln", { n: 4 }));
    if (q > 0.24 && q < 0.56) p.glitch = 0.25;
    if (q > 0.68) blinzeln(p, t);
  }, { per: 2.4 });
  neu("Reinsprinten", K1, (p, t) => {
    const q = ph(t, 3.5);
    if (q < 0.25) {
      p.dx = r(-34 + (q / 0.25) * 34);
      gehen(p, t, 3.5, { hub: 2 });
      p.dreh = 8 * v(p);
      p.mund = "o";
      p.fx.push(fx("tempo", { rechts: p.spiegel }));
    } else if (q < 0.36) {
      const u = (q - 0.25) / 0.11;
      p.dreh = -12 * v(p) * (1 - u);
      p.bw += 1;
      p.bh -= 1;
      p.augen = "gross";
      p.mund = "o";
      p.fx.push(fx("staub", { rechts: !p.spiegel }));
    } else {
      p.ex = r(sin(t, 0.8) * 2);
      leben(p, t);
      p.mund = "laecheln";
    }
  }, { per: 3.5 });

  K1 = "Alltag";
  neu("Rumstehen", K1, (p, t) => {
    kp(p, t, 7, [
      { q: 0 }, { q: 0.3 }, { q: 0.35, ex: -2 }, { q: 0.46, ex: -2 }, { q: 0.52 },
      { q: 0.7 }, { q: 0.74, ex: 2, ey: -1 }, { q: 0.82, ex: 2, ey: -1 }, { q: 0.87 }
    ]);
    leben(p, t);
  }, { per: 7 });
  neu("Umschauen", K1, (p, t) => {
    kp(p, t, 4, [
      { q: 0 }, { q: 0.08, ex: -2, dreh: -5 }, { q: 0.3, ex: -2, dreh: -5 }, { q: 0.4, ex: 2, dreh: 5 },
      { q: 0.62, ex: 2, dreh: 5 }, { q: 0.7, ey: -1 }, { q: 0.85, ey: -1, mund: "flach" }, { q: 0.92 }
    ]);
    blinzeln(p, t);
  }, { per: 4 });
  neu("Winken", K1, (p, t) => {
    const k = takt(t, 5, 2);
    p.armR = k ? "oben" : "hoch";
    if (!k) p.aR[1] = -2;
    p.dy -= takt(t, 2.5, 2);
    p.augen = "froh";
    p.mund = ph(t, 1.6) < 0.5 ? "breit" : "laecheln";
  }, { per: 1.6 });
  neu("Beidhändig winken", K1, (p, t) => {
    const k = takt(t, 5, 2);
    p.armL = k ? "oben" : "hoch";
    p.armR = k ? "hoch" : "oben";
    if (k) p.aR[1] = -2; else p.aL[1] = -2;
    wippen(p, t, 2.5, 2);
    p.augen = "froh";
    p.mund = "breit";
  }, { per: 0.8 });
  neu("Strecken", K1, (p, t) => {
    const stretch = { armL: "oben", armR: "oben", aR: [0, -1], aL: [0, -1], bh: 2, bw: -1, dy: -1, augen: "zu", mund: "gross" };
    const { q } = kp(p, t, 4.5, [
      { q: 0 },
      { q: 0.08, armL: "hoch", armR: "hoch", augen: "halb", mund: "o" },
      Object.assign({ q: 0.18, h: 1 }, stretch),
      Object.assign({ q: 0.45 }, stretch),
      { q: 0.55, armL: "halb", armR: "halb", bh: -1, bw: 1, augen: "zu", mund: "laecheln" },
      { q: 0.62, dx: 1, augen: "zu", mund: "laecheln" },
      { q: 0.66, dx: -1, augen: "froh", mund: "laecheln" },
      { q: 0.72, augen: "froh", mund: "laecheln" },
      { q: 0.85 }
    ]);
    if (q > 0.85) leben(p, t);
  }, { per: 4.5 });
  neu("Gähnen", K1, (p, t) => {
    const { q } = kp(p, t, 5, [
      { q: 0 },
      { q: 0.12, bh: 1, augen: "halb", mund: "klein" },
      { q: 0.25, bh: 2, dy: -1, armL: "halb", armR: "halb", augen: "zu", mund: "offen" },
      { q: 0.35, bh: 2, dy: -1, armL: "oben", armR: "oben", augen: "zu", mund: "gross", h: 1 },
      { q: 0.52, bh: 2, dy: -1, armL: "oben", armR: "oben", augen: "zu", mund: "gross" },
      { q: 0.62, armL: "halb", armR: "halb", augen: "zu", mund: "klein" },
      { q: 0.72, augen: "halb" },
      { q: 0.86 }
    ]);
    if (q > 0.86) leben(p, t);
    if (q > 0.62 && q < 0.72) p.fx.push(tropfen(20, 26, 18, 30, "#62c9e8", 1));
  }, { per: 5 });
  neu("Am Kopf kratzen", K1, (p, t) => {
    const { q } = kp(p, t, 3, [{ q: 0 }, { q: 0.12, dreh: -6 }, { q: 0.8, dreh: -6 }, { q: 0.9 }]);
    p.armR = "kopf";
    p.aR[0] = takt(t, 8, 2);
    p.augen = "halb";
    p.ex = -1;
    p.ey = -1;
    p.mund = "schief";
    p.lift[3] = takt(t, 1.5, 2);
    if (q > 0.35) p.fx.push(fx("frage"));
  }, { per: 3 });
  neu("Niesen", K1, (p, t) => {
    const { q } = kp(p, t, 3.2, [
      { q: 0 },
      { q: 0.1, bh: 1, dreh: -4, augen: "halb", mund: "o" },
      { q: 0.3, bh: 2, dreh: -8, dy: -1, augen: "halb", mund: "o" },
      { q: 0.44, bh: 2, dreh: -11, dy: -1, augen: "zu", mund: "gross", h: 1 },
      { q: 0.5, bh: -2, bw: 1, dreh: 12, dx: 1, augen: "zu", mund: "offen" },
      { q: 0.62, augen: "halb", mund: "flach" },
      { q: 0.72, armR: "mund", augen: "halb", mund: "flach" },
      { q: 0.88 }
    ]);
    if (q >= 0.5 && q < 0.64) p.fx.push(fx("text", { txt: "HATSCHI", y: 6 }), fx("fn", { fn: (c, tt, rr) => { for (let k = 0; k < 7; k++) K.px(c, rr.cx + (p.spiegel ? -6 - k * 2 : 5 + k * 2), rr.oben + 6 + (k % 3) - 1, "#62c9e8"); } }));
    if (q >= 0.72 && q < 0.88) p.aR[0] = takt(t, 8, 2);
    if (q >= 0.88) leben(p, t);
  }, { per: 3.2 });
  neu("Hinsetzen", K1, (p, t) => {
    p.beine = "sitzen";
    kp(p, t, 9, [
      { q: 0 }, { q: 0.35 }, { q: 0.4, ex: -2 }, { q: 0.52, ex: -2 }, { q: 0.56 },
      { q: 0.72, ey: -1, ex: 1, mund: "laecheln" }, { q: 0.86, ey: -1, ex: 1, mund: "laecheln" }, { q: 0.9 }
    ]);
    leben(p, t);
  }, { per: 9 });
  neu("Auf dem Rücken liegen", K1, (p, t) => {
    liegen(p);
    const k = takt(t, 1.5, 4);
    p.lift = [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 0]][k];
    p.armL = p.armR = "hoch";
    p.mund = "laecheln";
    const q = ph(t, 7);
    p.augen = q < 0.45 ? "zu" : "offen";
    if (q >= 0.45) blinzeln(p, t);
    atmen(p, t, 0.2);
  }, { per: 7 });
  neu("Hände in die Hüften", K1, (p, t) => {
    p.armL = p.armR = "tief";
    p.aL[0] = 1;
    p.aR[0] = -1;
    p.bw += 1;
    const { q } = kp(p, t, 3.5, [
      { q: 0, mund: "schief" },
      { q: 0.3, dreh: -4, ex: -1, augen: "halb", mund: "schief" },
      { q: 0.62, dreh: -4, ex: -1, augen: "halb", mund: "schief" },
      { q: 0.72, mund: "schief" }
    ]);
    if (q > 0.35) p.lift[3] = takt(t, 4, 2);
    if (q < 0.3 || q > 0.72) blinzeln(p, t);
  }, { per: 3.5 });
  neu("Warten und tippen", K1, (p, t) => {
    const { q } = kp(p, t, 4, [
      { q: 0, augen: "halb" },
      { q: 0.45, armL: "raus", aL: [0, -1], ex: -2, ey: 1, augen: "offen" },
      { q: 0.62, augen: "halb" },
      { q: 0.78, bh: -1, augen: "zu", mund: "flach" },
      { q: 0.88, augen: "halb" }
    ]);
    p.lift[3] = takt(t, 4, 2);
    if (q < 0.45) p.fx.push(fx("punkte"));
  }, { per: 4 });
  neu("Auf die Uhr schauen", K1, (p, t) => { p.armL = "raus"; p.aL[1] = -1; p.ex = -1; p.ey = 1; blinzeln(p, t); if (ph(t, 3) > 0.7) p.fx.push(fx("ausruf")); });
  neu("Fegen", K1, (p, t) => {
    const s = sin(t, 0.7);
    p.props.push(pr("besen", "griffR", r(s * 2), 0));
    p.aR[0] = r(s * 2);
    p.dx += r(s);
    p.ey = 1;
    p.mund = "pfeifen";
    if (s > 0.5) p.fx.push(fx("staub", { rechts: !p.spiegel }));
    blinzeln(p, t);
  }, { per: 1.43 });
  neu("Wischen", K1, (p, t) => {
    const s = sin(t, 0.5);
    p.props.push(pr("mopp", "griffR", r(s * 3), 0));
    p.aR[0] = r(s * 2);
    p.dx += r(s);
    p.dreh = s * 4 * v(p);
    p.ey = 1;
    p.augen = "froh";
    p.mund = "laecheln";
    if (Math.abs(s) < 0.3) p.fx.push(fx("funkeln", { n: 2 }));
  }, { per: 2 });
  neu("Blumen giessen", K1, (p, t) => {
    const { q } = kp(p, t, 3.5, [
      { q: 0, armR: "halb", mund: "pfeifen" },
      { q: 0.2, armR: "raus", aR: [0, 1], dreh: 4, mund: "laecheln" },
      { q: 0.65, armR: "raus", aR: [0, 1], dreh: 4, mund: "laecheln" },
      { q: 0.72, armR: "halb", augen: "froh", mund: "breit" },
      { q: 0.9, armR: "halb", mund: "pfeifen" }
    ]);
    p.props.push(pr("giesskanne", "handR", 0, 1), pr("pflanze", "boden", 12, q > 0.7 && q < 0.8 ? -1 : 0));
    if (q > 0.24 && q < 0.66) p.fx.push(tropfen(40, 27, 38, 32, "#3a6fd6"));
    if (q > 0.72 && q < 0.95) p.fx.push(fx("herzen", { n: 1 }));
    p.ey = 1;
    p.ex = 1;
  }, { per: 3.5 });
  neu("Paket tragen", K1, (p, t) => {
    gehen(p, t, 1.2, { arme: true, hub: 0 });
    p.armL = p.armR = "oben";
    p.aL[0] = 1;
    p.aR[0] = -1;
    p.bh -= 1;
    p.dreh = sin(t, 0.75) * 5;
    p.props.push(pr("paket", "ueber", r(sin(t, 0.75)), 4));
    p.fx.push(fx("schweiss"));
    p.mund = ph(t, 1.3) < 0.5 ? "zaehne" : "o";
    p.augen = "halb";
  }, { laeuft: 4, per: 1.33 });
  neu("Handy scrollen", K1, (p, t) => {
    p.armR = "halb";
    p.props.push(pr("handy", "handR", -1, 0));
    const { q } = kp(p, t, 5, [
      { q: 0 }, { q: 0.55, augen: "froh", mund: "laecheln" }, { q: 0.7 },
      { q: 0.84, augen: "gross", mund: "o" }, { q: 0.92 }
    ]);
    p.ex = 2;
    p.ey = 1;
    if (ph(t, 1.1) < 0.12) p.aR[1] -= 1;
    if (q < 0.55 || (q > 0.7 && q < 0.84) || q > 0.92) blinzeln(p, t);
  }, { per: 5 });
  neu("Selfie", K1, (p, t) => {
    p.armR = "oben";
    p.props.push(pr("handy", "handR", -1, -1));
    p.armL = "halb";
    const { q } = kp(p, t, 4, [
      { q: 0, augen: "froh", mund: "breit" },
      { q: 0.33, augen: "zwinker", mund: "zunge", dreh: -6 },
      { q: 0.66, augen: "zu", mund: "pfeifen", dreh: 5 }
    ]);
    if ((q * 3) % 1 < 0.06) p.fx.push(fx("fn", { fn: (c) => { c.globalAlpha = 0.7; K.px(c, 0, 0, "#ffffff", K.W, K.H); c.globalAlpha = 1; } }));
  }, { per: 4 });
  neu("Zeitung lesen", K1, (p, t) => {
    p.armL = p.armR = "vorne";
    const q = ph(t, 5);
    const blaettern = q > 0.86 && q < 0.96;
    p.props.push(pr(blaettern ? "zeitungR" : "zeitung", "vorne", blaettern ? (takt(t, 8, 2) ? 2 : -2) : 0, 2));
    p.ex = [-1, 0, 1][takt(t, 1.4, 3)];
    p.ey = 1;
    if (q > 0.45 && q < 0.55) { p.augen = "gross"; p.ey = 0; }
    else blinzeln(p, t);
  }, { per: 5 });
  neu("Buch lesen", K1, (p, t) => { p.armL = p.armR = "vorne"; p.props.push(pr("buch", "vorne", 0, 1)); p.ey = 1; p.ex = r(sin(t, 0.5)); blinzeln(p, t); });
  neu("Einkaufen", K1, (p, t) => {
    const k = gehen(p, t, 1.3, { arme: true });
    p.aL[1] += [0, -1, -1, 0, 0, 1, 1, 0][k];
    p.props.push(pr("tuete", "handR", 0, 4 + (k < 4 ? 0 : 1)));
    p.mund = "pfeifen";
    if (ph(t, 6) > 0.6) p.fx.push(fx("noten"));
    blinzeln(p, t);
  }, { laeuft: 5, per: 1.54 });

  K1 = "Gefühle";
  neu("Freuen", K1, (p, t) => {
    const q = huepfen(p, t, 1.4, 6);
    p.augen = "froh";
    p.mund = "breit";
    p.armL = p.armR = q < 0.12 ? "halb" : "oben";
    p.fx.push(fx("funkeln"));
  }, { per: 0.71 });
  neu("Lachen", K1, (p, t) => {
    const k = takt(t, 8, 2);
    p.dy -= k;
    p.bh -= k;
    p.dreh = -5 * v(p);
    p.armL = p.armR = "vorne";
    p.aL[1] = p.aR[1] = k;
    p.augen = "froh";
    p.mund = "offen";
    p.fx.push(fx("text", { txt: "HAHA", huepf: true }));
  }, { per: 1 });
  neu("Kichern", K1, (p, t) => {
    const q = ph(t, 2.2);
    p.armR = "mund";
    p.augen = "froh";
    p.rot = true;
    if (q < 0.6) { p.dy -= takt(t, 7, 2); p.bh -= takt(t, 7, 2); }
    else { p.ex = -1; p.augen = "seitlich"; }
  }, { per: 2.2 });
  neu("Verliebt", K1, (p, t) => {
    p.augen = "herz";
    p.rot = true;
    p.armL = p.armR = "vorne";
    p.dreh = sin(t, 0.4) * 7;
    p.dy -= r(Math.abs(sin(t, 0.4)) * 2);
    p.mund = "laecheln";
    p.fx.push(fx("herzen"));
  }, { per: 2.5 });
  neu("Traurig", K1, (p, t) => {
    const { q } = kp(p, t, 5, [
      { q: 0, bh: -1, dy: 1, ey: 1 },
      { q: 0.45, bh: -1, dy: 1, ey: 1 },
      { q: 0.55, bh: 0, dy: 0, ey: 0, augen: "zu" },
      { q: 0.65, bh: -2, dy: 1, ey: 1 },
      { q: 0.8, bh: -1, dy: 1, ey: 1 }
    ]);
    p.armL = p.armR = "tief";
    if (q < 0.55 || q > 0.65) p.augen = "traurig";
    p.mund = "traurig";
    p.fx.push(fx("regenwolke"));
  }, { per: 5 });
  neu("Weinen", K1, (p, t) => {
    const q = ph(t, 2);
    p.augen = q < 0.5 ? "weinen" : "zu";
    p.mund = q < 0.5 ? "offen" : "traurig";
    if (q < 0.5) { p.dy -= takt(t, 6, 2); p.bh -= takt(t, 6, 2); }
    else { p.armR = "kopf"; p.aR[0] = -2 + takt(t, 5, 2); p.aR[1] = 3; }
    p.fx.push(fx("traenen"));
  }, { per: 2 });
  neu("Wütend", K1, (p, t) => {
    const k = takt(t, 4, 4);
    p.augen = "wuetend";
    p.mund = "zaehne";
    p.tint = { body: "#e0533d", dark: "#a8331f" };
    p.armL = p.armR = "tief";
    p.bw += 1;
    p.lift = k === 1 ? [2, 0, 2, 0] : k === 3 ? [0, 2, 0, 2] : [0, 0, 0, 0];
    if (k === 0 || k === 2) { p.bh -= 1; p.fx.push(fx("staub", { rechts: k === 2 })); }
    zittern(p, t, 0.6);
    p.fx.push(fx("wut"));
  }, { per: 1 });
  neu("Ausrasten", K1, (p, t) => {
    const q = huepfen(p, t, 2.6, 5);
    const k = takt(t, 8, 2);
    p.augen = "wuetend";
    p.mund = "gross";
    p.armL = k ? "oben" : "raus";
    p.armR = k ? "raus" : "oben";
    p.dreh = (k ? 6 : -6) * (q < 0.12 ? 0 : 1);
    p.fx.push(fx("feuer", { hinten: true }));
    p.tint = { body: "#e0533d", dark: "#a8331f" };
  }, { per: 0.77 });
  neu("Genervt", K1, (p, t) => {
    const { q } = kp(p, t, 3.5, [
      { q: 0, augen: "halb", mund: "flach" },
      { q: 0.15, ey: -1, ex: -2, augen: "offen", mund: "flach" },
      { q: 0.25, ey: -1, ex: 2, augen: "offen", mund: "flach" },
      { q: 0.35, augen: "halb", mund: "flach" },
      { q: 0.55, bh: -1, dy: 1, augen: "zu", mund: "o" },
      { q: 0.68, augen: "halb", mund: "flach" }
    ]);
    p.armL = p.armR = "vorne";
    if (q < 0.55 || q > 0.68) p.fx.push(fx("text", { txt: "-.-", y: 14 }));
  }, { per: 3.5 });
  neu("Verlegen", K1, (p, t) => {
    p.rot = true;
    p.armL = p.armR = "vorne";
    p.ey = 1;
    p.ex = -2;
    p.dreh = sin(t, 0.5) * 5;
    p.lift[2] = takt(t, 2, 2);
    p.augen = "froh";
    p.mund = "klein";
    if (ph(t, 4) > 0.7) { p.ex = 1; p.ey = 0; p.augen = "offen"; p.mund = "laecheln"; }
  }, { per: 4 });
  neu("Stolz", K1, (p, t) => {
    const { q } = kp(p, t, 3, [
      { q: 0, bw: 1, bh: 1, dreh: -4 },
      { q: 0.4, bw: 1, bh: 1, dreh: -4 },
      { q: 0.5, bw: 1, bh: 1, dy: 1, dreh: -2 },
      { q: 0.6, bw: 1, bh: 1, dreh: -4 }
    ]);
    p.augen = "zu";
    p.mund = "laecheln";
    p.armL = p.armR = "tief";
    p.aL[0] = 1;
    p.aR[0] = -1;
    if (q < 0.45) p.fx.push(fx("funkeln", { n: 3 }));
  }, { per: 3 });
  neu("Erschrecken", K1, (p, t) => {
    const { q } = kp(p, t, 2.5, [
      { q: 0, bh: -1, bw: 1, augen: "gross", mund: "o" },
      { q: 0.06, dy: -8, bh: 2, bw: -1, armL: "oben", armR: "oben", augen: "gross", mund: "o" },
      { q: 0.2, dy: 0, bh: -2, bw: 2, armL: "halb", armR: "halb", augen: "gross", mund: "o" },
      { q: 0.3, armL: "vorne", armR: "vorne", augen: "gross", mund: "o" },
      { q: 0.5, bh: -1, dy: 1, armL: "tief", armR: "tief", augen: "zu", mund: "klein" },
      { q: 0.62, augen: "froh", mund: "laecheln" },
      { q: 0.9, augen: "froh", mund: "laecheln" }
    ]);
    if (q < 0.25) p.fx.push(fx("ausruf"));
    if (q > 0.5 && q < 0.8) p.fx.push(fx("schweiss"));
  }, { per: 2.5 });
  neu("Zittern vor Angst", K1, (p, t) => { zittern(p, t, 1); p.augen = "gross"; p.mund = "traurig"; p.fx.push(fx("schweiss")); p.armL = p.armR = "vorne"; });
  neu("Verwirrt", K1, (p, t) => {
    const { q } = kp(p, t, 3, [
      { q: 0, dreh: -8, ex: -1 },
      { q: 0.35, dreh: -8, ex: -1 },
      { q: 0.5, dreh: 8, ex: 1 },
      { q: 0.85, dreh: 8, ex: 1 }
    ]);
    p.augen = q < 0.45 ? "offen" : "seitlich";
    p.mund = "schief";
    p.fx.push(fx("frage"));
    if (q > 0.5) { p.armR = "kopf"; p.aR[0] = takt(t, 6, 2); }
  }, { per: 3 });
  neu("Nachdenken", K1, (p, t) => {
    p.armR = "mund";
    p.aR[1] = 1;
    p.aR[0] = ph(t, 1.2) < 0.15 ? 1 : 0;
    p.ey = -1;
    p.ex = 1;
    p.dreh = 4;
    p.mund = "schief";
    p.fx.push(fx("punkte"));
    blinzeln(p, t);
  }, { per: 2.4 });
  neu("Idee", K1, (p, t) => {
    const { q } = kp(p, t, 3.2, [
      { q: 0, armR: "mund", aR: [0, 1], ey: -1, ex: 1, dreh: 4, mund: "schief" },
      { q: 0.38, armR: "mund", aR: [0, 1], ey: -1, ex: 1, dreh: 4, mund: "schief" },
      { q: 0.42, bh: -1, bw: 1, augen: "gross", mund: "o" },
      { q: 0.47, dy: -5, bh: 2, bw: -1, armR: "oben", augen: "gross", mund: "o" },
      { q: 0.6, armR: "oben", augen: "froh", mund: "breit" },
      { q: 0.92, armR: "oben", augen: "froh", mund: "breit" }
    ]);
    if (q < 0.4) p.fx.push(fx("punkte"));
    else p.fx.push(fx("idee"));
  }, { per: 3.2 });
  neu("Müde", K1, (p, t) => {
    const { q } = kp(p, t, 5, [
      { q: 0, augen: "halb" },
      { q: 0.3, dy: 1, dreh: 4, bh: -1, augen: "halb" },
      { q: 0.55, dy: 2, dreh: 8, bh: -1, augen: "zu" },
      { q: 0.62, dy: -1, augen: "gross" },
      { q: 0.7, augen: "halb" },
      { q: 0.85, bh: 1, augen: "zu", mund: "gross" },
      { q: 0.95, augen: "halb" }
    ]);
    p.armL = p.armR = "tief";
    if (q > 0.55 && q < 0.62) p.fx.push(fx("zzz"));
  }, { per: 5 });
  neu("Gelangweilt", K1, (p, t) => {
    const { q } = kp(p, t, 4, [
      { q: 0, augen: "halb", mund: "flach" },
      { q: 0.3, ex: -2, augen: "halb", mund: "flach" },
      { q: 0.6, ex: 2, augen: "halb", mund: "flach" },
      { q: 0.7, bw: 1, augen: "halb", mund: "klein" },
      { q: 0.82, bh: -1, dy: 1, augen: "zu", mund: "o" },
      { q: 0.92, augen: "halb", mund: "flach" }
    ]);
    p.armL = p.armR = "tief";
    p.lift[0] = takt(t, 2, 2);
    if (q < 0.7) p.fx.push(fx("punkte"));
  }, { per: 4 });
  neu("Schmollen", K1, (p, t) => {
    const q = ph(t, 3.5);
    p.armL = p.armR = "vorne";
    p.dreh = -8 * v(p);
    p.bw += 1;
    p.mund = "traurig";
    if (q > 0.6 && q < 0.72) { p.augen = "offen"; p.ex = 2; }
    else { p.augen = "zu"; if (q < 0.3) p.fx.push(fx("text", { txt: "HMPF", x: 30, y: 14 })); }
  }, { per: 3.5 });
  neu("Überrascht", K1, (p, t) => {
    const { q } = kp(p, t, 2.2, [
      { q: 0 },
      { q: 0.05, dy: -3, bh: 1, armL: "halb", armR: "halb", augen: "gross", mund: "o" },
      { q: 0.15, armL: "halb", armR: "halb", augen: "gross", mund: "o" },
      { q: 0.55, armL: "halb", armR: "halb", augen: "zu", mund: "o" },
      { q: 0.58, armL: "halb", armR: "halb", augen: "gross", mund: "o" },
      { q: 0.63, armL: "halb", armR: "halb", augen: "zu", mund: "o" },
      { q: 0.66, armL: "halb", armR: "halb", augen: "gross", mund: "o" },
      { q: 0.9 }
    ]);
    if (q < 0.3) p.fx.push(fx("ausruf"));
  }, { per: 2.2 });
  neu("Facepalm", K1, (p, t) => { p.armR = "kopf"; p.aR[0] = -5; p.aR[1] = 4; p.augen = "zu"; p.bh -= 1; p.mund = "flach"; });
  neu("Schulterzucken", K1, (p, t) => {
    const { q } = kp(p, t, 2, [
      { q: 0 },
      { q: 0.15, armL: "halb", armR: "halb", aL: [0, -1], aR: [0, -1], bh: -1, dy: -1, ey: -1, augen: "halb", mund: "schief", dreh: 4 },
      { q: 0.55, armL: "halb", armR: "halb", aL: [0, -1], aR: [0, -1], bh: -1, dy: -1, ey: -1, augen: "halb", mund: "schief", dreh: 4 },
      { q: 0.7, mund: "schief" },
      { q: 0.9 }
    ]);
    if (q > 0.15 && q < 0.6) p.fx.push(fx("frage"));
  }, { per: 2 });

  K1 = "Tanz & Musik";
  neu("Headbangen", K1, (p, t) => {
    const k = takt(t, 6, 3);
    p.dy += [0, 1, -1][k];
    p.bh -= k === 1 ? 1 : 0;
    p.dreh = [0, 8, -2][k] * v(p);
    p.armL = p.armR = "oben";
    p.aL[1] = p.aR[1] = k === 1 ? 1 : 0;
    p.augen = "zu";
    p.mund = "offen";
    p.fx.push(fx("noten"));
  }, { per: 0.5 });
  neu("Disco", K1, (p, t) => {
    const k = takt(t, 2, 2);
    p.armR = k ? "oben" : "tief";
    p.armL = k ? "tief" : "oben";
    p.dreh = k ? 7 : -7;
    p.dx += k ? 1 : -1;
    p.lift = k ? [0, 0, 1, 0] : [0, 1, 0, 0];
    p.augen = "froh";
    p.mund = "breit";
    p.fx.push(fx("konfetti"));
  }, { per: 1 });
  neu("Robotertanz", K1, (p, t) => {
    const k = takt(t, 3, 6);
    p.dx = [-2, -2, 0, 2, 2, 0][k];
    p.armL = ["raus", "oben", "tief", "raus", "vorne", "raus"][k];
    p.armR = ["tief", "raus", "oben", "vorne", "raus", "raus"][k];
    p.dreh = [0, 0, 0, 0, 0, 6][k];
    p.lift = k === 2 ? [0, 0, 1, 1] : k === 4 ? [1, 1, 0, 0] : [0, 0, 0, 0];
    p.augen = "punkt";
    p.mund = "flach";
    if (k === 5) p.fx.push(fx("text", { txt: "BZZT", x: 31, y: 15 }));
  }, { per: 2 });
  neu("Wackeltanz", K1, (p, t) => {
    p.dreh = sin(t, 1.5) * 12;
    wippen(p, t, 3, 1);
    const k = takt(t, 3, 2);
    p.armL = k ? "halb" : "raus";
    p.armR = k ? "raus" : "halb";
    p.augen = "froh";
    p.mund = "breit";
  }, { per: 1.33 });
  neu("Floss", K1, (p, t) => {
    const k = takt(t, 5, 4);
    if (k === 0) { p.armL = "raus"; p.aL[1] = 3; p.armR = "vorne"; p.aR[0] = -7; p.aR[1] = 1; p.dx = 1; }
    else if (k === 2) { p.armR = "raus"; p.aR[1] = 3; p.armL = "vorne"; p.aL[0] = 7; p.aL[1] = 1; p.dx = -1; }
    else { p.armL = p.armR = "tief"; }
    p.augen = "froh";
    p.mund = "breit";
  }, { per: 0.8 });
  neu("Dab", K1, (p, t) => {
    const q = ph(t, 2.2);
    if (q < 0.4) { wippen(p, t, 2.5, 1); p.augen = "froh"; p.mund = "laecheln"; p.armL = p.armR = "halb"; return; }
    if (q < 0.45) { p.bh -= 1; p.bw += 1; p.augen = "zu"; return; }
    p.armL = "oben";
    p.aL[0] = -1;
    p.armR = "kopf";
    p.aR[0] = -4;
    p.aR[1] = 1;
    p.dreh = -10;
    p.ey = 1;
    p.ex = -2;
    p.mund = "flach";
  }, { per: 2.2 });
  neu("Breakdance", K1, (p, t) => {
    const q = ph(t, 4);
    if (q < 0.3) {
      const k = takt(t, 4, 2);
      p.dx = k ? 2 : -2;
      p.lift = k ? [2, 0, 0, 0] : [0, 0, 0, 2];
      p.armL = k ? "raus" : "halb";
      p.armR = k ? "halb" : "raus";
      p.augen = "froh";
      p.mund = "laecheln";
    } else if (q < 0.4) {
      p.beine = "sitzen";
      p.bh -= 2;
      p.armL = p.armR = "tief";
      p.augen = "gross";
    } else if (q < 0.8) {
      liegen(p, ((q - 0.4) / 0.4) * 720);
      p.dy += 2;
      p.lift = [0, 2, 2, 0];
      p.armL = p.armR = "oben";
      p.augen = "zu";
    } else {
      liegen(p, 180 + sin(t, 1) * 4);
      p.dy += 3;
      p.lift = [0, 0, 2, 2];
      p.armL = p.armR = "oben";
      p.augen = "froh";
      p.mund = "breit";
    }
  }, { per: 4 });
  neu("Pirouette", K1, (p, t) => {
    const q = ph(t, 2.4);
    p.armL = p.armR = "oben";
    p.aL[0] = 1;
    p.aR[0] = -1;
    p.lift = [0, 0, 2, 2];
    p.augen = "zu";
    p.mund = "laecheln";
    if (q < 0.65) { p.spiegel = takt(t, 8, 2) === 1; p.dy -= 1; p.fx.push(fx("funkeln", { n: 3 })); }
    else { p.bh += 1; p.dy -= 1; p.augen = "froh"; }
  }, { per: 2.4 });
  neu("Luftgitarre", K1, (p, t) => { p.armL = "raus"; p.armR = "vorne"; p.aR[1] = takt(t, 8, 2) * 2 - 1; p.augen = "zu"; p.mund = "offen"; wippen(p, t, 2); });
  neu("Gitarre spielen", K1, (p, t) => {
    const q = ph(t, 4);
    p.armR = "vorne";
    p.props.push(pr("gitarre", "vorne", 1, -2));
    wippen(p, t, 2, 1);
    p.fx.push(fx("noten"));
    if (q > 0.75) { p.armR = "oben"; p.dreh = -5 * v(p); p.augen = "zu"; p.mund = "offen"; }
    else { p.aR[1] = takt(t, 6, 2); p.augen = "zu"; p.mund = ph(t, 1) < 0.5 ? "laecheln" : "o"; }
  }, { per: 4 });
  neu("Auflegen", K1, (p, t) => {
    p.props.push(pr("turntable", "vorne", 0, 3), pr("kopfhoerer", "kopf", 0, 3));
    p.armL = "kopf";
    p.aL[0] = 1;
    p.armR = "vorne";
    p.aR[0] = takt(t, 6, 2) * 2;
    wippen(p, t, 2, 1);
    p.augen = "zu";
    p.mund = ph(t, 2) < 0.5 ? "laecheln" : "pfeifen";
    p.fx.push(fx("noten"));
  }, { per: 2 });
  neu("Schlagzeug", K1, (p, t) => { p.props.push(pr("trommel", "vorne", 0, 3)); p.armL = p.armR = "vorne"; p.aL[1] = -takt(t, 8, 2) * 2; p.aR[1] = -(1 - takt(t, 8, 2)) * 2; p.fx.push(fx("noten")); p.augen = "wuetend"; });
  neu("Trompete", K1, (p, t) => {
    const q = ph(t, 3);
    p.armR = "vorne";
    p.props.push(pr("trompete", "vorne", 5, 0));
    p.augen = "zu";
    p.mund = "klein";
    p.fx.push(fx("noten"));
    if (q < 0.6) p.bw += takt(t, 4, 2);
    else { p.bw += 2; p.dreh = -6 * v(p); p.bh += 1; }
  }, { per: 3 });
  neu("Klavier", K1, (p, t) => {
    p.props.push(pr("klavier", "vorne", 0, 4));
    p.armL = p.armR = "vorne";
    p.aL[0] = -takt(t, 5, 3);
    p.aR[0] = takt(t, 4, 3);
    p.aL[1] = takt(t, 5, 2) ? 0 : 1;
    p.aR[1] = takt(t, 4, 2) ? 1 : 0;
    p.dreh = sin(t, 0.5) * 5;
    p.augen = "zu";
    p.mund = "laecheln";
    p.fx.push(fx("noten"));
  }, { per: 2 });
  neu("Singen", K1, (p, t) => {
    const q = ph(t, 4);
    p.armR = "halb";
    p.props.push(pr("mikro", "handR", -1, 0));
    p.fx.push(fx("noten"));
    p.dreh = sin(t, 0.5) * 4;
    if (q > 0.7) { p.armL = "oben"; p.bh += 1; p.mund = "gross"; p.augen = "zu"; }
    else { p.mund = ["offen", "o", "klein", "offen"][takt(t, 3, 4)]; p.augen = "zu"; }
  }, { per: 4 });
  neu("Dirigieren", K1, (p, t) => {
    const k = takt(t, 3, 4);
    p.armR = ["oben", "raus", "raus", "hoch"][k];
    p.aR[1] = [0, 1, -1, -2][k];
    p.aR[0] = [0, -2, 1, 0][k];
    p.props.push(pr("taktstock", "handR"));
    p.armL = ph(t, 4) > 0.5 ? "raus" : "halb";
    p.augen = "zu";
    p.mund = "laecheln";
    p.dreh = [0, -3, 3, 0][k];
    p.fx.push(fx("noten"));
  }, { per: 4 });
  neu("Musik hören", K1, (p, t) => {
    p.props.push(pr("kopfhoerer", "kopf", 0, 3));
    wippen(p, t, 2, 1);
    p.lift[3] = takt(t, 2, 2);
    p.augen = "zu";
    p.mund = ph(t, 5) > 0.6 ? "pfeifen" : "laecheln";
    p.dreh = sin(t, 0.5) * 5;
    p.fx.push(fx("noten"));
  }, { per: 2 });
  neu("Geige", K1, (p, t) => {
    const q = ph(t, 4), k = sin(t, 0.8);
    p.props.push(pr("geige", "vorne", -4, -5), pr("bogen", "handR", -9, 0));
    p.armL = "vorne";
    p.aL[1] = -2;
    p.armR = "raus";
    p.aR[0] = r(k * 2);
    p.dreh = -4 + r(k);
    p.pivot = "kopf";
    p.augen = q > 0.8 ? "froh" : "zu";
    p.mund = "laecheln";
    p.fx.push(fx("noten"));
  }, { per: 4 });
  neu("Cello", K1, (p, t) => {
    const k = sin(t, 0.6);
    p.beine = "sitzen";
    p.props.push(pr("cello", "boden", 4, 0), pr("bogen", "handR", -6, 1));
    p.armL = "raus";
    p.aL[1] = -1;
    p.armR = "raus";
    p.aR[1] = 2;
    p.aR[0] = r(k * 3);
    p.dreh = r(k * 3);
    p.augen = "zu";
    p.mund = "flach";
    p.fx.push(fx("noten"));
  }, { per: 3.3 });
  neu("Kontrabass", K1, (p, t) => {
    const s = takt(t, 4, 2);
    p.props.push(pr("kontrabass", "boden", 5, 0));
    p.armL = "raus";
    p.aL[1] = -3;
    p.armR = "raus";
    p.aR[1] = s ? 1 : -1;
    wippen(p, t, 1, 1);
    p.augen = ph(t, 4) > 0.5 ? "halb" : "zu";
    p.mund = ph(t, 4) > 0.75 ? "pfeifen" : "laecheln";
    p.fx.push(fx("noten"));
  }, { per: 4 });
  neu("E-Bass", K1, (p, t) => {
    p.armR = "vorne";
    p.aR[1] = takt(t, 4, 2);
    p.props.push(pr("ebass", "vorne", 1, -2));
    p.dy += takt(t, 2, 2);
    p.augen = "halb";
    p.mund = "flach";
    p.fx.push(fx("noten"));
  }, { per: 2 });
  neu("E-Gitarre", K1, (p, t) => {
    const q = ph(t, 4);
    p.armR = "vorne";
    p.props.push(pr("egitarre", "vorne", 1, -2));
    p.fx.push(fx("noten"));
    if (q < 0.7) {
      p.aR[1] = takt(t, 10, 2);
      p.dreh = takt(t, 4, 2) ? 8 : -2;
      p.pivot = "fuesse";
      p.augen = "zu";
      p.mund = "gross";
    } else {
      p.armR = "oben";
      p.dy -= 2;
      p.augen = "wuetend";
      p.mund = "zunge";
      p.fx.push(fx("blitz"));
    }
  }, { per: 4 });
  neu("Ukulele", K1, (p, t) => {
    p.armR = "vorne";
    p.aR[1] = takt(t, 5, 2);
    p.props.push(pr("ukulele", "vorne", 1, -1));
    wippen(p, t, 2, 1);
    p.dreh = sin(t, 0.5) * 6;
    p.augen = "froh";
    p.mund = "laecheln";
    p.fx.push(fx("noten"));
  }, { per: 2 });
  neu("Banjo", K1, (p, t) => {
    p.armR = "vorne";
    p.aR[1] = takt(t, 10, 2);
    p.props.push(pr("banjo", "vorne", 1, -2));
    p.lift = takt(t, 4, 2) ? [0, 0, 2, 0] : [0, 0, 0, 0];
    p.augen = "froh";
    p.mund = "breit";
    p.fx.push(fx("noten"));
  }, { per: 1 });
  neu("Harfe", K1, (p, t) => {
    p.props.push(pr("harfe", "boden", 3, 0));
    p.armR = "raus";
    p.aR[1] = -2 - takt(t, 6, 3);
    p.armL = "vorne";
    p.aL[0] = takt(t, 3, 2);
    p.dreh = sin(t, 0.25) * 3;
    p.augen = "zu";
    p.mund = "laecheln";
    p.fx.push(fx("noten"), fx("funkeln", { n: 2 }));
  }, { per: 4 });
  neu("Querflöte", K1, (p, t) => {
    p.props.push(pr("querfloete", "vorne", 5, 0));
    p.armL = p.armR = "vorne";
    p.aL[0] = takt(t, 4, 2);
    p.aR[0] = 3 + takt(t, 6, 2);
    p.dreh = sin(t, 0.5) * 4;
    p.pivot = "kopf";
    p.augen = "zu";
    p.fx.push(fx("noten"));
  }, { per: 2 });
  neu("Blockflöte", K1, (p, t) => {
    const q = ph(t, 5);
    p.props.push(pr("blockfloete", "vorne", 0, 1));
    p.armL = p.armR = "vorne";
    p.aL[1] = takt(t, 3, 2);
    p.aR[1] = 2 + takt(t, 4, 2);
    if (q > 0.7 && q < 0.85) { p.augen = "gross"; p.fx.push(fx("ausruf")); p.dx += takt(t, 12, 2); }
    else { p.augen = "zu"; p.fx.push(fx("noten")); }
  }, { per: 5 });
  neu("Saxofon", K1, (p, t) => {
    const q = ph(t, 5);
    p.props.push(pr("saxofon", "vorne", 2, -1));
    p.armL = p.armR = "vorne";
    p.aR[1] = 3;
    p.pivot = "fuesse";
    p.augen = "zu";
    p.fx.push(fx("noten"));
    if (q < 0.7) { p.dreh = sin(t, 0.4) * 7; p.bw += takt(t, 3, 2); }
    else { p.dreh = -12; p.bh += 1; p.bw += 1; }
  }, { per: 5 });
  neu("Posaune", K1, (p, t) => {
    const zug = r((sin(t, 0.7) + 1) * 3);
    p.props.push(pr("posaune", "vorne", 6, -1), pr("posaunenzug", "vorne", 9 + zug, 2));
    p.armL = "vorne";
    p.armR = "vorne";
    p.aR[0] = 2 + zug;
    p.aR[1] = 2;
    p.augen = "zu";
    p.bw += zug > 3 ? 1 : 0;
    p.fx.push(fx("noten"));
  }, { per: 1.43 });
  neu("Tuba", K1, (p, t) => {
    const s = takt(t, 2, 2);
    p.props.push(pr("tuba", "vorne", 0, -4));
    p.armL = p.armR = "vorne";
    p.dy += s;
    p.bw += s ? 2 : 0;
    p.augen = s ? "zu" : "gross";
    p.fx.push(fx("noten"));
  }, { per: 2 });
  neu("Waldhorn", K1, (p, t) => {
    p.props.push(pr("waldhorn", "vorne", 3, -2));
    p.armL = "vorne";
    p.armR = "vorne";
    p.aR[0] = 4;
    p.dreh = sin(t, 0.25) * 4;
    p.pivot = "kopf";
    p.augen = ph(t, 4) > 0.85 ? "offen" : "zu";
    p.fx.push(fx("noten"));
  }, { per: 4 });
  neu("Klarinette", K1, (p, t) => {
    p.props.push(pr("klarinette", "vorne", 0, 1));
    p.armL = p.armR = "vorne";
    p.aL[1] = takt(t, 4, 2);
    p.aR[1] = 3 + takt(t, 5, 2);
    p.dreh = sin(t, 0.5) * 5;
    p.pivot = "fuesse";
    p.augen = "halb";
    p.fx.push(fx("noten"));
  }, { per: 2 });
  neu("Mundharmonika", K1, (p, t) => {
    const x = r(sin(t, 0.5) * 2);
    p.props.push(pr("mundharmonika", "vorne", x, 1));
    p.armL = p.armR = "vorne";
    p.aL[0] = x;
    p.aR[0] = x;
    p.augen = "zu";
    p.lift = takt(t, 2, 2) ? [0, 0, 1, 0] : [0, 0, 0, 0];
    p.fx.push(fx("noten"));
  }, { per: 2 });
  neu("Akkordeon", K1, (p, t) => {
    const auf = takt(t, 1.5, 2);
    p.props.push(pr(auf ? "akkordeonAuf" : "akkordeonZu", "vorne", 0, -1));
    p.armL = p.armR = "raus";
    p.aL[0] = auf ? -2 : 0;
    p.aR[0] = auf ? 2 : 0;
    p.aL[1] = p.aR[1] = 2;
    p.dreh = auf ? 4 : -4;
    p.augen = "froh";
    p.mund = "breit";
    p.fx.push(fx("noten"));
  }, { per: 1.33 });
  neu("Dudelsack", K1, (p, t) => {
    const s = takt(t, 2, 2);
    p.props.push(pr("dudelsack", "vorne", -1, -4));
    p.armL = "vorne";
    p.armR = "vorne";
    p.aR[1] = 2;
    p.lift = s ? [2, 0, 0, 2] : [0, 2, 2, 0];
    p.bw += ph(t, 1) < 0.3 ? 1 : 0;
    p.augen = "zu";
    p.mund = "klein";
    p.fx.push(fx("noten"));
  }, { per: 1 });
  neu("Xylofon", K1, (p, t) => {
    const i = takt(t, 6, 6);
    p.props.push(pr("xylofon", "vorne", 0, 2), pr("schlaegel", "handL", 0, -1), pr("schlaegel", "handR", 0, -1));
    p.armL = p.armR = "vorne";
    p.aL[0] = -4 + i;
    p.aR[0] = i;
    p.aL[1] = i % 2 ? -1 : 0;
    p.aR[1] = i % 2 ? 0 : -1;
    p.augen = "froh";
    p.mund = "laecheln";
    p.fx.push(fx("noten"));
  }, { per: 2 });
  neu("Triangel", K1, (p, t) => {
    const q = ph(t, 5);
    p.props.push(pr("triangel", "handL", 0, -2));
    p.armL = "hoch";
    if (q < 0.8) {
      p.armR = "halb";
      p.augen = q < 0.4 ? "seitlich" : "offen";
      p.ex = q < 0.4 ? 1 : 0;
      p.mund = "flach";
    } else {
      p.armR = "hoch";
      p.aR[0] = -3;
      p.augen = "froh";
      p.mund = "breit";
      p.fx.push(fx("funkeln", { n: 3 }));
    }
  }, { per: 5 });
  neu("Tamburin", K1, (p, t) => {
    const s = takt(t, 6, 2);
    p.props.push(pr("tamburin", "handR", 0, s ? -1 : 0));
    p.armR = s ? "oben" : "hoch";
    p.armL = "halb";
    huepfen(p, t, 2, 2);
    p.augen = "froh";
    p.mund = "breit";
    p.fx.push(fx("noten"));
  }, { per: 1 });
  neu("Maracas", K1, (p, t) => {
    const s = takt(t, 6, 2);
    p.props.push(pr("rassel", "handL", 0, 0), pr("rassel", "handR", 0, 0));
    p.armL = s ? "oben" : "halb";
    p.armR = s ? "halb" : "oben";
    wippen(p, t, 2, 1);
    p.dreh = s ? 5 : -5;
    p.augen = "froh";
    p.mund = "breit";
    p.fx.push(fx("noten"));
  }, { per: 1 });
  neu("Bongos", K1, (p, t) => {
    const s = takt(t, 8, 2);
    p.props.push(pr("bongos", "vorne", 0, 3));
    p.armL = p.armR = "vorne";
    p.aL[1] = s ? -2 : 0;
    p.aR[1] = s ? 0 : -2;
    p.aL[0] = -2;
    p.aR[0] = 2;
    wippen(p, t, 2, 1);
    p.augen = "zu";
    p.mund = "laecheln";
    p.fx.push(fx("noten"));
  }, { per: 1 });
  neu("Pauke", K1, (p, t) => {
    const q = ph(t, 4);
    p.props.push(pr("pauke", "vorne", 0, 3), pr("schlaegel", "handL", 0, -1), pr("schlaegel", "handR", 0, -1));
    p.armL = p.armR = "vorne";
    p.aL[0] = -3;
    p.aR[0] = 3;
    if (q < 0.6) {
      const s = takt(t, 12, 2);
      p.aL[1] = s ? -1 : 0;
      p.aR[1] = s ? 0 : -1;
      p.augen = "wuetend";
      p.mund = "flach";
      p.dx += s;
    } else if (q < 0.7) {
      p.armL = p.armR = "oben";
      p.augen = "gross";
      p.mund = "o";
      p.dy -= 1;
    } else {
      p.aL[1] = p.aR[1] = 1;
      p.augen = "zu";
      p.mund = "breit";
      p.fx.push(fx("schall"));
    }
  }, { per: 4 });
  neu("Becken", K1, (p, t) => {
    const q = ph(t, 3);
    if (q < 0.45) {
      p.armL = p.armR = "raus";
      p.aL[1] = p.aR[1] = -1;
      p.props.push(pr("becken", "handL", 0, 1), pr("becken", "handR", 0, 1));
      p.augen = "gross";
      p.mund = "o";
    } else if (q < 0.6) {
      p.armL = p.armR = "vorne";
      p.props.push(pr("becken", "vorne", -1, -4), pr("becken", "vorne", 1, -4));
      p.augen = "zu";
      p.mund = "zaehne";
      p.fx.push(fx("schall"), fx("funkeln", { n: 4 }));
      p.dx += takt(t, 16, 2) ? 1 : -1;
    } else {
      p.armL = p.armR = "raus";
      p.props.push(pr("becken", "handL", 0, 1), pr("becken", "handR", 0, 1));
      p.augen = "spirale";
      p.mund = "schief";
      p.dreh = sin(t, 1.5) * 6;
    }
  }, { per: 3 });
  neu("Keytar", K1, (p, t) => {
    const q = ph(t, 4);
    p.props.push(pr("keytar", "vorne", 0, -1));
    p.armL = "vorne";
    p.aL[0] = -4 + takt(t, 6, 6);
    p.armR = "vorne";
    p.aR[0] = 3;
    p.fx.push(fx("noten"));
    if (q < 0.75) { p.dreh = -6; p.pivot = "fuesse"; p.augen = "halb"; p.mund = "laecheln"; wippen(p, t, 2, 1); }
    else { p.dreh = -12; p.pivot = "fuesse"; p.augen = "zu"; p.mund = "gross"; p.lift = [0, 0, 2, 2]; }
  }, { per: 4 });
  neu("Synthesizer", K1, (p, t) => {
    const q = ph(t, 4);
    p.props.push(pr("synth", "vorne", 0, 3));
    p.armL = p.armR = "vorne";
    p.aL[0] = -4 + takt(t, 2, 3) * 2;
    p.aR[0] = 2 + takt(t, 3, 3);
    p.aL[1] = -1;
    p.aR[1] = takt(t, 4, 2) ? 0 : -1;
    p.dy += takt(t, 2, 2);
    p.augen = q < 0.6 ? "leuchten" : "zu";
    p.mund = "flach";
    p.fx.push(fx("noten"));
  }, { per: 4 });
  neu("Theremin", K1, (p, t) => {
    const k = sin(t, 0.5);
    p.props.push(pr("theremin", "vorne", 5, 2));
    p.armR = "raus";
    p.aR[1] = r(k * 2) - 1;
    p.aR[0] = r(Math.abs(k) * 2);
    p.armL = "halb";
    p.aL[1] = r(sin(t, 0.35) * 2);
    p.dreh = r(k * 3);
    p.augen = "spirale";
    p.mund = "o";
    p.fx.push(fx("schall"));
  }, { per: 2 });
  neu("Gong", K1, (p, t) => {
    const q = ph(t, 5);
    p.props.push(pr("gong", "boden", 3, 0));
    if (q < 0.35) {
      p.armR = "oben";
      p.props.push(pr("schlaegel", "handR", 0, -1));
      p.dreh = -6;
      p.pivot = "fuesse";
      p.augen = "wuetend";
      p.mund = "flach";
    } else if (q < 0.45) {
      p.armR = "raus";
      p.props.push(pr("schlaegel", "handR", 0, -1));
      p.dreh = 5;
      p.pivot = "fuesse";
      p.augen = "zu";
      p.mund = "zaehne";
    } else {
      p.armR = "halb";
      p.props.push(pr("schlaegel", "handR", 0, -1));
      p.dx += q < 0.75 ? (takt(t, 16, 2) ? 1 : -1) : 0;
      p.augen = q < 0.75 ? "x" : "halb";
      p.mund = "o";
      p.fx.push(fx("schall"));
    }
  }, { per: 5 });
  neu("Drumset", K1, (p, t) => {
    const q = ph(t, 4), s = takt(t, 8, 2);
    p.beine = "sitzen";
    p.props.push(Object.assign(pr("drumset", "boden", -9, 0), { ebene: "vorne" }), pr("stick", "handL", 0, -1), pr("stick", "handR", 0, -1));
    p.armL = p.armR = "vorne";
    p.aL[0] = -4;
    p.aR[0] = 2;
    if (q < 0.75) {
      p.aL[1] = s ? -2 : 0;
      p.aR[1] = s ? 0 : -2;
      p.dy += s;
      p.augen = "zu";
      p.mund = "flach";
    } else {
      p.armL = "raus";
      p.aL[1] = -4;
      p.armR = takt(t, 12, 2) ? "oben" : "vorne";
      p.augen = "wuetend";
      p.mund = "zaehne";
      p.fx.push(fx("schall"));
    }
    p.fx.push(fx("noten"));
  }, { per: 4 });
  neu("Alphorn", K1, (p, t) => {
    const q = ph(t, 5);
    p.props.push(pr("alphorn", "vorne", 10, 1));
    p.armL = p.armR = "vorne";
    p.aR[0] = 2;
    if (q < 0.3) { p.bw += r((q / 0.3) * 3); p.bh += 1; p.augen = "gross"; p.mund = "o"; }
    else { p.bw += 3 - takt(t, 3, 2); p.augen = "zu"; p.fx.push(fx("noten")); p.dreh = sin(t, 0.3) * 2; }
  }, { per: 5 });
  neu("Gruppentanz", K1, (p, t) => {
    const k = takt(t, 2.5, 8);
    p.armL = ["raus", "raus", "vorne", "vorne", "kopf", "kopf", "tief", "tief"][k];
    p.armR = ["halb", "raus", "halb", "vorne", "halb", "kopf", "halb", "tief"][k];
    if (k >= 6) { p.dreh = sin(t, 2) * 8; p.dx += takt(t, 5, 2) ? 1 : -1; }
    if (k === 7 && ph(t, 3.2) > 0.94) { p.spiegel = !p.spiegel; p.dy -= 3; }
    p.mund = "breit";
    p.augen = k >= 6 ? "froh" : "offen";
  }, { per: 3.2 });
  neu("Limbo", K1, (p, t) => { p.props.push(pr("stange", "frei", 8, 25)); p.dx = r(-14 + ph(t, 4) * 28); p.dreh = -35; p.bh -= 1; p.armL = p.armR = "raus"; p.augen = "gross"; });
  neu("Konfettiparty", K1, (p, t) => {
    const q = huepfen(p, t, 1.5, 5);
    p.augen = "froh";
    p.mund = "breit";
    p.armL = p.armR = q < 0.12 ? "halb" : "oben";
    p.dreh = q > 0.3 && q < 0.8 ? 5 * (takt(t, 0.75, 2) ? 1 : -1) : 0;
    p.fx.push(fx("konfetti"));
  }, { per: 1.33 });

  K1 = "Sport & Akrobatik";
  neu("Hanteln stemmen", K1, (p, t) => {
    const { q } = kp(p, t, 1.8, [
      { q: 0, armR: "unten", augen: "offen", mund: "flach" },
      { q: 0.15, armR: "halb", bh: -1, augen: "zu", mund: "zaehne" },
      { q: 0.35, armR: "hoch", aR: [0, -1], bh: -1, augen: "zu", mund: "zaehne" },
      { q: 0.55, armR: "hoch", aR: [0, -1], augen: "froh", mund: "laecheln", h: 1 },
      { q: 0.65, armR: "halb", augen: "offen", mund: "o" },
      { q: 0.8, armR: "unten", augen: "offen", mund: "flach" }
    ]);
    p.props.push(pr("hantel", "handR", -2, 1));
    p.armL = "tief";
    p.aL[0] = 1;
    if (q > 0.1 && q < 0.5) p.fx.push(fx("schweiss"));
  }, { per: 1.8 });
  neu("Kniebeugen", K1, (p, t) => {
    const { q } = kp(p, t, 1.8, [
      { q: 0, armL: "unten", armR: "unten" },
      { q: 0.12, armL: "raus", armR: "raus", mund: "flach" },
      { q: 0.4, armL: "raus", armR: "raus", bh: -3, bw: 2, dy: 1, augen: "zu", mund: "zaehne" },
      { q: 0.55, armL: "raus", armR: "raus", bh: -3, bw: 2, dy: 1, augen: "zu", mund: "zaehne" },
      { q: 0.75, armL: "raus", armR: "raus", bh: 1, augen: "offen", mund: "o" },
      { q: 0.88, armL: "unten", armR: "unten" }
    ]);
    if (q > 0.4 && q < 0.6) p.fx.push(fx("schweiss"));
  }, { per: 1.8 });
  neu("Hampelmann", K1, (p, t) => {
    const k = takt(t, 3, 2);
    p.armL = p.armR = k ? "oben" : "unten";
    p.dy -= k * 3;
    p.lift = k ? [1, 1, 1, 1] : [0, 0, 0, 0];
    if (!k) { p.bh -= 1; p.bw += 1; }
    p.dx += k ? 0 : 0;
    p.augen = k ? "froh" : "offen";
    p.mund = k ? "o" : "flach";
  }, { per: 0.67 });
  neu("Salto", K1, (p, t) => {
    const q = ph(t, 2);
    if (q < 0.2) { p.bh -= r((q / 0.2) * 3); p.bw += 1; p.armL = p.armR = "tief"; p.augen = "zu"; return; }
    if (q < 0.65) {
      const u = (q - 0.2) / 0.45;
      p.dy -= r(Math.sin(u * Math.PI) * 16);
      liegen(p, glatt(u) * 360 * v(p));
      p.lift = [2, 2, 2, 2];
      p.armL = p.armR = "halb";
      p.augen = "zu";
      return;
    }
    if (q < 0.75) { p.bh -= 2; p.bw += 2; p.augen = "gross"; return; }
    p.armL = p.armR = "oben";
    p.augen = "froh";
    p.mund = "breit";
    p.fx.push(fx("funkeln", { n: 3 }));
  }, { per: 2 });
  neu("Rückwärtssalto", K1, (p, t) => {
    const q = ph(t, 2);
    if (q < 0.2) { p.bh -= r((q / 0.2) * 3); p.bw += 1; p.armL = p.armR = "tief"; p.augen = "zu"; return; }
    if (q < 0.65) {
      const u = (q - 0.2) / 0.45;
      p.dy -= r(Math.sin(u * Math.PI) * 16);
      liegen(p, -glatt(u) * 360 * v(p));
      p.lift = [2, 2, 2, 2];
      p.armL = p.armR = "oben";
      p.augen = "gross";
      return;
    }
    if (q < 0.75) { p.bh -= 2; p.bw += 2; p.augen = "gross"; return; }
    p.armL = p.armR = "oben";
    p.augen = "froh";
    p.mund = "breit";
    p.fx.push(fx("funkeln", { n: 3 }));
  }, { per: 2 });
  neu("Rad schlagen", K1, (p, t) => {
    const q = ph(t, 3);
    if (q < 0.7) {
      const u = q / 0.7;
      liegen(p, u * 720 * v(p));
      p.dx = r(-16 + u * 32);
      p.dy -= 3;
      p.armL = p.armR = "oben";
      p.augen = "zu";
    } else {
      p.dx = r(16 - ((q - 0.7) / 0.3) * 32);
      gehen(p, t, 1.8);
      p.spiegel = !p.spiegel;
      p.augen = "froh";
      p.mund = "laecheln";
    }
  }, { per: 3 });
  neu("Handstand", K1, (p, t) => {
    const q = ph(t, 4);
    if (q < 0.15) { p.bh -= 2; p.bw += 1; p.armL = p.armR = "oben"; p.augen = "gross"; return; }
    if (q < 0.25) { liegen(p, ((q - 0.15) / 0.1) * 180); p.dy += 2; p.armL = p.armR = "oben"; p.lift = [2, 2, 2, 2]; return; }
    if (q < 0.85) {
      liegen(p, 180 + sin(t, 0.8) * 6);
      p.dy += 3;
      p.armL = p.armR = "oben";
      p.lift = [0, takt(t, 2, 2), 0, 1 - takt(t, 2, 2)];
      p.augen = "gross";
      p.mund = "zunge";
      return;
    }
    liegen(p, 180 + ((q - 0.85) / 0.15) * 180);
    p.armL = p.armR = "oben";
    p.lift = [2, 2, 2, 2];
  }, { per: 4 });
  neu("Seilspringen", K1, (p, t) => {
    huepfen(p, t, 1.6, 3);
    p.armL = p.armR = "raus";
    p.aL[1] = p.aR[1] = 1;
    p.augen = "froh";
    p.mund = "laecheln";
    p.fx.push(fx("springseil"));
  }, { per: 0.63 });
  neu("Jonglieren", K1, (p, t) => {
    const k = takt(t, 4.3, 2);
    p.armL = k ? "halb" : "raus";
    p.armR = k ? "raus" : "halb";
    p.ey = -1;
    p.ex = r(sin(t, 1.4));
    p.augen = "gross";
    p.mund = ph(t, 5) > 0.8 ? "breit" : "zunge";
    p.dy -= takt(t, 4.3, 2);
    p.fx.push(fx("baelle"));
  }, { per: 1.43 });
  neu("Dribbeln", K1, (p, t) => {
    const s = Math.abs(sin(t, 0.8));
    p.props.push(pr("basketball", "boden", 9, -r(s * 9)));
    p.armR = "unten";
    p.aR[1] = s > 0.7 ? -2 : s > 0.3 ? -1 : 1;
    p.bh -= s < 0.3 ? 1 : 0;
    p.dy += s < 0.3 ? 1 : 0;
    p.ex = 2;
    p.ey = 1;
    p.mund = "zunge";
    blinzeln(p, t);
  }, { per: 1.25 });
  neu("Fussball kicken", K1, (p, t) => {
    const { q } = kp(p, t, 2.2, [
      { q: 0, mund: "flach" },
      { q: 0.2, dreh: -8, lift: [0, 0, 2, 2], armL: "raus", armR: "halb", augen: "zu", mund: "flach" },
      { q: 0.3, dreh: 10, lift: [0, 0, 3, 3], armL: "halb", armR: "raus", augen: "gross", mund: "o" },
      { q: 0.42, augen: "froh", mund: "breit" },
      { q: 0.7, armL: "oben", armR: "oben", augen: "froh", mund: "breit" },
      { q: 0.85 }
    ]);
    p.dreh *= v(p);
    if (q < 0.28) p.props.push(pr("ball", "boden", 7, 0));
    else if (q < 0.7) p.fx.push(fx("fn", { fn: (c, tt, rr) => { const u = (q - 0.28) / 0.42, x = p.spiegel ? 14 - u * 20 : 31 + u * 20; K.zeichne(c, K.PROPS.ball, x, K.BODEN - 4 - Math.sin(u * Math.PI) * 14, K.FARBEN); } }));
  }, { per: 2.2 });
  neu("Basketball werfen", K1, (p, t) => {
    const { q } = kp(p, t, 2.4, [
      { q: 0, armR: "halb", bh: -2, bw: 1, augen: "offen" },
      { q: 0.2, armR: "halb", bh: -2, bw: 1, ey: -1, augen: "offen" },
      { q: 0.3, armR: "oben", dy: -6, bh: 1, lift: [1, 1, 1, 1], ey: -1, augen: "gross" },
      { q: 0.45, armR: "oben", bh: -1, bw: 1, ey: -1, augen: "gross" },
      { q: 0.7, armR: "oben", augen: "froh", mund: "breit" },
      { q: 0.9 }
    ]);
    if (q < 0.3) p.props.push(pr("basketball", "handR", -2, 0));
    else if (q < 0.72) p.fx.push(fx("fn", { fn: (c) => { const u = (q - 0.3) / 0.42, x = p.spiegel ? 14 - u * 12 : 30 + u * 12; K.zeichne(c, K.PROPS.basketball, x, 18 - Math.sin(u * Math.PI) * 14, K.FARBEN); } }));
    if (q > 0.7) p.fx.push(fx("text", { txt: "SWISH", y: 8 }));
  }, { per: 2.4 });
  neu("Boxen", K1, (p, t) => {
    const k = takt(t, 5, 6);
    p.armL = p.armR = "vorne";
    p.props.push(pr("boxR", "handR", -1, 0), pr("boxL", "handL", 1, 0));
    p.aR[0] = k === 1 || k === 4 ? 5 : 0;
    p.aL[0] = k === 2 ? -5 : 0;
    p.dx += [0, 1, -1, 0, 1, 0][k];
    p.dy += k === 5 ? 1 : 0;
    p.bh -= k === 5 ? 1 : 0;
    p.lift = k % 2 ? [0, 0, 1, 0] : [0, 1, 0, 0];
    p.augen = "wuetend";
    p.mund = k === 1 || k === 4 ? "zaehne" : "flach";
  }, { per: 1.2 });
  neu("Karate", K1, (p, t) => {
    const { q } = kp(p, t, 2.4, [
      { q: 0, armL: "halb", armR: "tief", bh: -1, bw: 1 },
      { q: 0.2, armL: "halb", armR: "tief", bh: -1, bw: 1 },
      { q: 0.25, armR: "raus", aR: [2, 0], armL: "tief", dx: 1, augen: "wuetend", mund: "offen" },
      { q: 0.45, armL: "halb", armR: "tief", bh: -1, bw: 1 },
      { q: 0.6, dreh: -10, lift: [0, 0, 3, 3], armL: "raus", armR: "halb", augen: "wuetend", mund: "offen" },
      { q: 0.78, armL: "halb", armR: "tief", bh: -1, bw: 1 }
    ]);
    p.dreh *= v(p);
    p.props.push(pr("stirnband", "kopf", 0, 3));
    if (p.augen !== "wuetend") p.augen = "halb";
    if ((q > 0.25 && q < 0.4) || (q > 0.6 && q < 0.75)) p.fx.push(fx("text", { txt: "HAI", x: p.spiegel ? 4 : 32, y: 14 }));
  }, { per: 2.4 });
  neu("Yoga-Baum", K1, (p, t) => {
    p.armL = p.armR = "oben";
    p.aL[0] = 2;
    p.aR[0] = -2;
    p.lift = [0, 0, 2, 3];
    p.dreh = sin(t, 0.3) * 3 + (ph(t, 6) > 0.8 ? sin(t, 3) * 5 : 0);
    p.augen = ph(t, 6) > 0.8 ? "offen" : "zu";
    p.mund = "laecheln";
    atmen(p, t, 0.2);
  }, { per: 6 });
  neu("Meditieren", K1, (p, t) => {
    p.beine = "sitzen";
    p.dy -= 4 + r(sin(t, 0.25) * 2);
    p.augen = "zu";
    p.mund = "laecheln";
    p.armL = p.armR = "raus";
    p.aL[1] = p.aR[1] = 1;
    atmen(p, t, 0.15);
    p.fx.push(fx("aura", { farbe: "#f5d03b" }));
    if (ph(t, 8) > 0.75) p.fx.push(fx("text", { txt: "OM", y: 10 }));
  }, { per: 8 });
  neu("Gewichtheben", K1, (p, t) => {
    const q = ph(t, 4);
    p.mund = "zaehne";
    if (q < 0.25) { p.bh -= 3; p.bw += 2; p.armL = p.armR = "tief"; p.props.push(pr("langhantel", "fuesse", 0, -4)); p.augen = "zu"; return; }
    if (q < 0.4) { p.bh -= 1; p.armL = p.armR = "halb"; p.props.push(pr("langhantel", "kopf", 0, 6)); p.augen = "zu"; zittern(p, t, 0.5); return; }
    if (q < 0.85) {
      p.armL = p.armR = "oben";
      p.props.push(pr("langhantel", "ueber", 0, 1));
      zittern(p, t, q < 0.6 ? 0.8 : 0.3);
      p.bh -= 1;
      p.augen = q < 0.6 ? "zu" : "froh";
      p.mund = q < 0.6 ? "zaehne" : "breit";
      p.fx.push(fx("schweiss"));
      return;
    }
    p.armL = p.armR = "tief";
    p.props.push(pr("langhantel", "fuesse", 0, -2));
    p.augen = "froh";
    p.mund = "o";
    p.fx.push(fx("staub", { rechts: true }), fx("staub", { rechts: false }));
  }, { per: 4 });
  neu("Seitlich dehnen", K1, (p, t) => {
    const s = sin(t, 0.3);
    p.dreh = s * 20;
    p.armL = s > 0 ? "oben" : "tief";
    p.armR = s > 0 ? "tief" : "oben";
    p.augen = "zu";
    p.mund = Math.abs(s) > 0.8 ? "o" : "laecheln";
  }, { per: 3.33 });

  K1 = "Arbeit & Nerd";
  neu("Tippen", K1, (p, t) => {
    const q = ph(t, 6);
    p.props.push(pr("laptop", "vorne", 0, 2));
    p.armL = p.armR = "vorne";
    if (q < 0.7) {
      p.aL[1] = -takt(t, 8, 2);
      p.aR[1] = -(1 - takt(t, 8, 2));
      p.ey = 1;
      p.mund = q > 0.4 ? "zunge" : "flach";
      p.fx.push(fx("code"));
      blinzeln(p, t);
    } else if (q < 0.85) {
      p.armR = "mund";
      p.ey = -1;
      p.ex = 1;
      p.mund = "schief";
      p.fx.push(fx("punkte"));
    } else {
      p.aL[1] = -takt(t, 12, 2);
      p.aR[1] = -(1 - takt(t, 12, 2));
      p.augen = "froh";
      p.mund = "laecheln";
      p.fx.push(fx("code"));
    }
  }, { per: 6 });
  neu("Hacken", K1, (p, t) => {
    p.props.push(pr("laptop", "vorne", 0, 2), pr("sonnenbrille", "augen"));
    p.armL = p.armR = "vorne";
    p.aL[1] = -takt(t, 12, 2);
    p.aR[1] = -(1 - takt(t, 12, 2));
    p.dy -= takt(t, 3, 2);
    p.mund = ph(t, 4) > 0.75 ? "breit" : "schief";
    p.fx.push(fx("matrix", { hinten: true }));
    if (ph(t, 4) > 0.75) p.fx.push(fx("text", { txt: "IM IN", y: 8, farbe: "#34e8a8" }));
  }, { per: 4 });
  neu("Auf den Build warten", K1, (p, t) => {
    const q = ph(t, 6);
    p.props.push(pr("laptop", "vorne", 0, 2));
    p.armL = p.armR = "vorne";
    p.fx.push(fx("laden"));
    if (q < 0.45) { p.aL[1] = -takt(t, 6, 2); p.aR[1] = -(1 - takt(t, 6, 2)); p.augen = "halb"; p.ey = 1; p.mund = "flach"; }
    else if (q < 0.6) { p.ex = -2; p.ey = -1; p.augen = "halb"; p.mund = "flach"; }
    else if (q < 0.72) { p.bh -= 1; p.dy += 1; p.augen = "zu"; p.mund = "o"; }
    else { p.armR = "mund"; p.augen = "halb"; p.ey = 1; p.lift[3] = takt(t, 4, 2); }
  }, { per: 6 });
  neu("Bug gefunden", K1, (p, t) => {
    const q = ph(t, 3);
    p.props.push(pr("lupe", "handR", 0, 2));
    p.fx.push(fx("kaefer"));
    p.ey = 1;
    p.ex = r(sin(t, 1 / 3) * 2);
    if (q < 0.6) { p.augen = "offen"; p.mund = "zunge"; p.dreh = 5 * v(p); }
    else { p.augen = "gross"; p.mund = "o"; p.dy -= q < 0.66 ? 2 : 0; p.fx.push(fx("ausruf")); }
  }, { per: 3 });
  neu("Code-Review", K1, (p, t) => {
    const q = ph(t, 4);
    p.props.push(pr("block", "handL", 0, 1), pr("stift", "handR", 0, q > 0.55 && q < 0.8 ? r(sin(t, 3)) : 0));
    p.ey = 1;
    if (q < 0.4) { p.ex = [-1, 0, 1][takt(t, 2, 3)]; p.augen = "offen"; p.mund = "flach"; }
    else if (q < 0.55) { p.augen = "seitlich"; p.mund = "schief"; p.dreh = 5; p.fx.push(fx("frage")); }
    else if (q < 0.8) { p.augen = "halb"; p.mund = "zunge"; }
    else { p.augen = "froh"; p.mund = "laecheln"; p.ey = 0; p.fx.push(fx("text", { txt: "LGTM", y: 8, farbe: "#3e8f3b" })); }
  }, { per: 4 });
  neu("Deployen", K1, (p, t) => {
    const q = ph(t, 3.5);
    p.props.push(pr("knopf", "boden", 10, q > 0.3 && q < 0.4 ? 1 : 0));
    if (q < 0.3) { p.armR = "raus"; p.aR[1] = -1 - takt(t, 3, 2); p.augen = "gross"; p.mund = "flach"; p.fx.push(fx("schweiss")); }
    else if (q < 0.4) { p.armR = "raus"; p.aR[1] = 2; p.augen = "zu"; p.mund = "zaehne"; p.bh -= 1; }
    else {
      p.fx.push(fx("fn", { fn: (c, tt) => { const u = Math.min(1, (q - 0.4) / 0.5); K.zeichne(c, K.FXMAPS.rakete, 36, K.BODEN - 5 - u * 44, K.FARBEN); if (Math.floor(tt * 10) % 2) K.px(c, 37, K.BODEN - u * 44, "#f28c28", 1, 2); } }));
      p.armL = p.armR = q > 0.55 ? "oben" : "halb";
      p.augen = "froh";
      p.mund = "breit";
      p.ey = -1;
      if (q > 0.55) huepfen(p, t, 1.6, 3);
    }
  }, { per: 3.5 });
  neu("Alles brennt", K1, (p, t) => {
    const q = ph(t, 4);
    p.fx.push(fx("feuer", { hinten: true }));
    p.props.push(pr("kaffee", "handR", q > 0.5 && q < 0.75 ? -3 : 0, 0));
    p.armR = q > 0.5 && q < 0.75 ? "mund" : "halb";
    p.beine = "sitzen";
    p.augen = q > 0.5 && q < 0.75 ? "zu" : "froh";
    p.mund = q > 0.5 && q < 0.75 ? "klein" : "laecheln";
    if (q < 0.45) p.fx.push(fx("text", { txt: "ALLES OK", y: 6 }));
    if (q > 0.85) { p.ex = -2; p.augen = "offen"; p.mund = "flach"; }
  }, { per: 4 });
  neu("Kaffeepause", K1, (p, t) => {
    const { q } = kp(p, t, 5, [
      { q: 0, armR: "halb" },
      { q: 0.25, armR: "mund", aR: [-1, 0], augen: "zu", mund: "klein" },
      { q: 0.45, armR: "halb", augen: "zu", mund: "laecheln" },
      { q: 0.6, armR: "halb", augen: "froh", mund: "laecheln" },
      { q: 0.75, armR: "halb" }
    ]);
    p.props.push(pr("kaffee", "handR", 0, 0));
    p.fx.push(fx("dampf"));
    if (q > 0.45 && q < 0.6) p.fx.push(fx("text", { txt: "AHH", x: 30, y: 16 }));
    if (q > 0.75 || q < 0.25) blinzeln(p, t);
  }, { per: 5 });
  neu("Im Meeting", K1, (p, t) => {
    const { q } = kp(p, t, 6, [
      { q: 0, augen: "halb", mund: "flach" },
      { q: 0.3, augen: "halb", dy: 1, mund: "flach" },
      { q: 0.5, augen: "zu", dy: 2, dreh: 6, mund: "klein" },
      { q: 0.7, augen: "gross", dy: -2, mund: "o" },
      { q: 0.76, augen: "offen", mund: "flach" },
      { q: 0.82, augen: "offen", dy: 1, mund: "laecheln" },
      { q: 0.88, augen: "offen", mund: "laecheln" },
      { q: 0.94, augen: "offen", dy: 1, mund: "laecheln" }
    ]);
    p.fx.push(fx(q > 0.5 && q < 0.7 ? "zzz" : "punkte"));
    if (q >= 0.7 && q < 0.76) p.fx.push(fx("ausruf"));
  }, { per: 6 });
  neu("Präsentieren", K1, (p, t) => {
    const q = ph(t, 4);
    p.props.push(pr("tafel", "boden", -22, 0, { ebene: "hinten" }), pr("zeiger", "handL", 0, -1));
    p.dx = 7;
    if (q < 0.5) { p.armL = "raus"; p.aL[1] = -2 + takt(t, 2, 2); p.ex = -2; p.mund = takt(t, 3, 2) ? "offen" : "klein"; }
    else { p.armL = "tief"; p.armR = "raus"; p.aR[1] = -takt(t, 2, 2); p.ex = 1; p.mund = takt(t, 4, 2) ? "offen" : "laecheln"; }
    blinzeln(p, t);
  }, { per: 4 });
  neu("Notizen machen", K1, (p, t) => {
    const q = ph(t, 4);
    p.props.push(pr("block", "handL", 0, 1), pr("stift", "handR", 0, q < 0.65 ? r(sin(t, 3)) : 0));
    if (q < 0.65) { p.ey = 1; p.aR[0] = takt(t, 4, 2); p.mund = "zunge"; p.fx.push(fx("notizen")); }
    else { p.ey = -1; p.ex = 1; p.mund = "schief"; if (q > 0.85) { p.dy -= 1; p.augen = "froh"; p.mund = "laecheln"; } }
    blinzeln(p, t);
  }, { per: 4 });
  neu("Dateien jonglieren", K1, (p, t) => {
    const k = takt(t, 5, 2);
    p.armL = k ? "halb" : "raus";
    p.armR = k ? "raus" : "halb";
    p.ey = -1;
    p.ex = r(sin(t, 0.8) * 2);
    p.augen = "gross";
    p.mund = ph(t, 4) > 0.7 ? "o" : "zunge";
    p.dy -= k;
    p.fx.push(fx("dateien"));
    if (ph(t, 4) > 0.7) p.fx.push(fx("schweiss"));
  }, { per: 1.25 });
  neu("Server streicheln", K1, (p, t) => {
    const s = sin(t, 0.6);
    p.props.push(pr("server", "boden", 10, 0));
    p.armR = "raus";
    p.aR[1] = r(s * 1.5) - 1;
    p.dreh = 4 * v(p);
    p.augen = "froh";
    p.mund = "laecheln";
    p.rot = s > 0.5;
    p.fx.push(fx("herzen", { n: 1 }));
    p.fx.push(fx("fn", { fn: (c, tt) => { if (Math.floor(tt * 4) % 2) K.px(c, p.spiegel ? 12 : 36, 30, "#34e8a8"); if (Math.floor(tt * 3) % 2) K.px(c, p.spiegel ? 12 : 36, 32, "#f5d03b"); } }));
  }, { per: 1.67 });
  neu("Kabelsalat", K1, (p, t) => {
    const k = takt(t, 3, 4);
    p.fx.push(fx("kabel"), fx("frage"));
    p.augen = ph(t, 4) > 0.6 ? "spirale" : "gross";
    p.armL = ["vorne", "raus", "vorne", "tief"][k];
    p.armR = ["raus", "vorne", "tief", "vorne"][k];
    p.dreh = [4, -4, 3, -3][k];
    p.mund = "schief";
    zittern(p, t, 0.4);
  }, { per: 1.33 });
  neu("Hämmern", K1, (p, t) => {
    const { q } = kp(p, t, 1.2, [
      { q: 0, armR: "oben", dreh: -4 },
      { q: 0.35, armR: "oben", dreh: -6, augen: "zu" },
      { q: 0.45, armR: "unten", dreh: 6, bh: -1, augen: "wuetend", mund: "zaehne" },
      { q: 0.6, armR: "unten", dreh: 2 },
      { q: 0.8, armR: "halb" }
    ]);
    p.dreh *= v(p);
    p.props.push(pr("hammer", "handR", 0, p.armR === "unten" ? 2 : -1));
    if (q > 0.45 && q < 0.62) p.fx.push(fx("text", { txt: "TOK", x: p.spiegel ? 4 : 34, y: 22 }), fx("staub", { rechts: !p.spiegel }));
  }, { per: 1.2 });
  neu("Schrauben", K1, (p, t) => {
    const k = takt(t, 4, 4);
    p.props.push(pr("schluessel", "handR", [0, 1, 0, -1][k], [-1, 0, 1, 0][k]));
    p.aR[0] = [0, 1, 0, -1][k];
    p.aR[1] = [-1, 0, 1, 0][k];
    p.dreh = [3, 0, -3, 0][k] * v(p);
    p.ey = 1;
    p.ex = 1;
    p.mund = "zunge";
    if (ph(t, 3) > 0.8) p.fx.push(fx("funkeln", { n: 2 }));
  }, { per: 1 });
  neu("Malen", K1, (p, t) => {
    const q = ph(t, 5);
    p.props.push(pr("staffelei", "boden", 8, 0, { ebene: "hinten" }));
    if (q < 0.65) {
      p.props.push(pr("pinsel", "handR", 0, r(sin(t, 1) * 2)));
      p.armR = "raus";
      p.aR[1] = r(sin(t, 1) * 2);
      p.aR[0] = r(sin(t, 0.5));
      p.ex = 2;
      p.mund = "zunge";
    } else {
      p.props.push(pr("pinsel", "handR", 0, 0));
      p.armR = "mund";
      p.dx -= 2;
      p.dreh = -4 * v(p);
      p.ex = 2;
      p.augen = q > 0.85 ? "froh" : "offen";
      p.mund = q > 0.85 ? "breit" : "schief";
    }
    blinzeln(p, t);
  }, { per: 5 });
  neu("Forschen", K1, (p, t) => {
    gehen(p, t, 0.8);
    p.props.push(pr("lupe", "handR", 0, 2));
    p.ey = 1;
    p.ex = 2;
    p.dreh = 4 * v(p);
    p.augen = ph(t, 5) > 0.8 ? "gross" : "offen";
    p.mund = ph(t, 5) > 0.8 ? "o" : "zunge";
  }, { laeuft: 3, per: 5 });
  neu("Chemie", K1, (p, t) => {
    const q = ph(t, 4);
    p.props.push(Object.assign(pr("kolben", "handR", q < 0.7 ? r(sin(t, 3)) : 0, 0), { fps: 3 }));
    p.fx.push(fx("blasen"));
    if (q < 0.55) { p.augen = "gross"; p.mund = "zunge"; p.ey = 1; p.ex = 2; }
    else if (q < 0.7) { p.augen = "gross"; p.mund = "o"; zittern(p, t, 0.8); }
    else if (q < 0.9) { p.fx.push(fx("knall", { x: 36, y: 22 })); p.augen = "x"; p.mund = "o"; p.tint = { body: "#6b5a50", dark: "#4a3d36" }; p.bh -= 1; }
    else { p.tint = { body: "#6b5a50", dark: "#4a3d36" }; p.augen = "halb"; p.mund = "schief"; p.dx += takt(t, 8, 2) ? 1 : -1; p.fx.push(fx("rauch", { x: 24, y: 22 })); }
  }, { per: 4 });
  neu("Telefonieren", K1, (p, t) => { p.armR = "kopf"; p.props.push(pr("telefon", "handR", -1, 2)); p.mund = takt(t, 3, 3) === 0 ? "offen" : "klein"; p.ex = r(sin(t, 0.3)); });

  K1 = "Essen & Trinken";
  const essen = (p, t, per, id, o = {}) => {
    const { q } = kp(p, t, per, [
      { q: 0, armR: "halb", augen: "froh", mund: "laecheln" },
      { q: 0.2, armR: "mund", aR: [-1, 0], augen: "zu", mund: o.biss || "offen" },
      { q: 0.3, armR: "halb", augen: "zu", mund: "klein", bw: o.backen ? 1 : 0 },
      { q: 0.65, armR: "halb", augen: "froh", mund: "laecheln" }
    ]);
    if (q > 0.3 && q < 0.65) { p.mund = takt(t, 5, 2) ? "klein" : "flach"; p.bh += takt(t, 5, 2); }
    p.props.push(pr(id, "handR", q > 0.2 && q < 0.3 ? -2 : 0, 0));
    if (q > 0.65) blinzeln(p, t);
    return q;
  };
  neu("Kaffee schlürfen", K1, (p, t) => {
    const { q } = kp(p, t, 4, [
      { q: 0, armR: "halb" },
      { q: 0.15, armR: "mund", aR: [-1, 0], augen: "zu", mund: "klein" },
      { q: 0.5, armR: "halb", augen: "zu", mund: "laecheln" },
      { q: 0.7, armR: "halb", augen: "froh", mund: "laecheln" },
      { q: 0.85, armR: "halb" }
    ]);
    p.props.push(pr("kaffee", "handR", q > 0.15 && q < 0.5 ? -2 : 0, 0));
    p.fx.push(fx("dampf"));
    if (q > 0.5 && q < 0.7) p.bh -= 1;
    if (q > 0.85) blinzeln(p, t);
  }, { per: 4 });
  neu("Tee trinken", K1, (p, t) => {
    const { q } = kp(p, t, 4.5, [
      { q: 0, armR: "halb", augen: "froh" },
      { q: 0.2, armR: "mund", aR: [-1, 0], armL: "raus", aL: [0, -2], augen: "zu", mund: "klein", dreh: -3 },
      { q: 0.5, armR: "halb", augen: "froh", mund: "laecheln" }
    ]);
    p.props.push(pr("tee", "handR", q > 0.2 && q < 0.5 ? -2 : 0, 0));
    p.fx.push(fx("dampf"));
  }, { per: 4.5 });
  neu("Pizza essen", K1, (p, t) => {
    const q = essen(p, t, 3, "pizza", { biss: "zaehne" });
    if (q > 0.22 && q < 0.35) p.fx.push(fx("fn", { fn: (c, tt, rr) => K.linie(c, rr.cx + 1, rr.oben + 6, rr.handR.x - 2, rr.handR.y + 1, "#f5d03b") }));
  }, { per: 3 });
  neu("Burger mampfen", K1, (p, t) => {
    const q = ph(t, 3);
    p.armL = p.armR = "vorne";
    p.props.push(pr("burger", "vorne", 0, q < 0.25 ? -1 : 2));
    if (q < 0.25) { p.mund = "gross"; p.augen = "gross"; p.dy -= 1; }
    else if (q < 0.7) { p.augen = "zu"; p.bw += 1; p.mund = takt(t, 5, 2) ? "klein" : "flach"; p.bh += takt(t, 5, 2); }
    else { p.augen = "froh"; p.mund = "laecheln"; }
  }, { per: 3 });
  neu("Eis schlecken", K1, (p, t) => {
    const q = ph(t, 2.5);
    p.armR = "halb";
    p.props.push(pr("eis", "handR", q < 0.5 ? -1 : 0, 0));
    p.augen = "froh";
    p.mund = q < 0.5 && takt(t, 4, 2) ? "zunge" : "klein";
    p.ex = 1;
    p.dreh = q < 0.5 ? 3 * v(p) : 0;
    if (q > 0.6 && q < 0.9) p.fx.push(tropfen(34, 28, 34, 36, "#f282b4", 1));
  }, { per: 2.5 });
  neu("Donut", K1, (p, t) => {
    const q = essen(p, t, 3.2, "donut");
    if (q < 0.2 || q > 0.65) p.augen = "herz";
  }, { per: 3.2 });
  neu("Nudeln schlürfen", K1, (p, t) => {
    const q = ph(t, 2.4);
    p.armL = p.armR = "vorne";
    p.props.push(pr("schuessel", "vorne", 0, 4));
    p.augen = "zu";
    if (q < 0.6) {
      p.mund = "klein";
      p.bw += takt(t, 3, 2);
      p.fx.push(fx("fn", { fn: (c, tt, rr) => { const h = r(2 + (1 - q / 0.6) * 5); for (let k = 0; k < h; k++) K.px(c, rr.cx + (k % 2), rr.oben + 6 + k, "#f5d03b"); } }));
    } else { p.mund = "laecheln"; p.augen = "froh"; p.dy -= q < 0.66 ? 1 : 0; }
  }, { per: 2.4 });
  neu("Apfel knabbern", K1, (p, t) => {
    const q = essen(p, t, 2.2, "apfel", { biss: "zaehne" });
    if (q > 0.2 && q < 0.3) p.mund = takt(t, 10, 2) ? "zaehne" : "klein";
  }, { per: 2.2 });
  neu("Popcorn", K1, (p, t) => {
    const q = ph(t, 3);
    p.armL = "vorne";
    p.props.push(pr("popcorn", "vorne", -3, 3));
    p.ey = -1;
    if (q < 0.25) { p.armR = "vorne"; p.aR[0] = -2; }
    else if (q < 0.4) { p.armR = "mund"; p.mund = "offen"; }
    else if (q < 0.75) { p.armR = "unten"; p.mund = takt(t, 5, 2) ? "klein" : "flach"; }
    else { p.armR = "unten"; p.augen = "gross"; p.mund = "o"; }
    p.fx.push(fx("fn", { fn: (c, tt, rr) => { if (q > 0.25 && q < 0.4) K.px(c, rr.cx + 1, rr.oben + 5, "#f4f1e8"); } }));
  }, { per: 3 });
  neu("Kerzen auspusten", K1, (p, t) => {
    const q = ph(t, 3.5);
    p.armL = p.armR = "vorne";
    p.props.push(pr("kuchen", "vorne", 0, 5));
    if (q < 0.3) { p.bh += 1 + (q > 0.15 ? 1 : 0); p.bw -= 1; p.mund = "o"; p.augen = "offen"; }
    else if (q < 0.5) { p.bw += 2; p.mund = "pfeifen"; p.augen = "zu"; p.fx.push(fx("wind")); }
    else { p.fx.push(fx("rauch", { x: 24, y: 28 })); p.armL = p.armR = "oben"; p.augen = "froh"; p.mund = "breit"; p.fx.push(fx("konfetti")); }
  }, { per: 3.5 });
  neu("Grillen", K1, (p, t) => {
    const q = ph(t, 3);
    p.props.push(pr("grill", "boden", 9, 0));
    p.fx.push(fx("rauch", { x: 38, y: 28 }));
    if (q < 0.7) { p.props.push(pr("kelle", "handR", 0, r(sin(t, 1)))); p.augen = "froh"; p.mund = "pfeifen"; }
    else { p.armR = "oben"; p.props.push(pr("kelle", "handR", 0, 0)); p.augen = "gross"; p.mund = "o"; p.fx.push(fx("fn", { fn: (c) => { const u = (q - 0.7) / 0.3; K.px(c, 38, 26 - Math.sin(u * Math.PI) * 8, "#8e241f", 3, 1); } })); }
  }, { per: 3 });
  neu("Kochen", K1, (p, t) => {
    const q = ph(t, 4);
    p.props.push(pr("topf", "vorne", 0, 5));
    p.fx.push(fx("dampf", { x: 24, y: 28 }));
    if (q < 0.65) { p.armR = "vorne"; p.props.push(pr("kelle", "handR", -3 + r(sin(t, 1) * 2), 3)); p.aR[0] = r(sin(t, 1) * 2); p.mund = "pfeifen"; blinzeln(p, t); }
    else if (q < 0.8) { p.armR = "mund"; p.props.push(pr("kelle", "handR", -2, 0)); p.augen = "zu"; p.mund = "klein"; }
    else { p.armR = "vorne"; p.augen = "froh"; p.mund = "breit"; p.dy -= q < 0.85 ? 1 : 0; }
  }, { per: 4 });
  neu("Vollgefuttert", K1, (p, t) => {
    const q = ph(t, 4);
    p.bw += 3;
    p.bh += 1;
    p.armL = p.armR = "vorne";
    p.aL[1] = p.aR[1] = takt(t, 1.5, 2);
    p.dreh = sin(t, 0.25) * 4;
    p.augen = "zu";
    p.mund = "laecheln";
    if (q > 0.8) { p.mund = "o"; p.bw += 1; p.fx.push(fx("text", { txt: "BURP", x: 31, y: 14 })); }
  }, { per: 4 });
  neu("Anstossen", K1, (p, t) => {
    const q = ph(t, 3);
    p.props.push(pr("glas", "handR", q > 0.55 && q < 0.8 ? -2 : 0, -1));
    if (q < 0.35) { p.armR = "oben"; p.augen = "froh"; p.mund = "breit"; if (q > 0.25) p.fx.push(fx("funkeln", { n: 3 })); }
    else if (q < 0.55) { p.armR = "oben"; p.aR[0] = -1; p.augen = "froh"; p.mund = "offen"; p.fx.push(fx("text", { txt: "PROST", y: 6 })); }
    else if (q < 0.8) { p.armR = "mund"; p.augen = "zu"; p.mund = "klein"; p.dreh = -4 * v(p); }
    else { p.armR = "halb"; p.augen = "froh"; p.mund = "laecheln"; }
  }, { per: 3 });

  K1 = "Gaming";
  neu("Zocken", K1, (p, t) => {
    const q = ph(t, 5);
    p.armL = p.armR = "vorne";
    p.props.push(pr("controller", "vorne", 0, 1));
    p.aL[1] = -takt(t, 7, 2);
    p.aR[1] = -takt(t, 5, 2);
    p.dreh = sin(t, 0.4) * 7;
    p.augen = "gross";
    p.mund = q > 0.85 ? "breit" : "zunge";
    if (q > 0.85) { p.dy -= 1; p.augen = "froh"; }
  }, { per: 5 });
  neu("Gewonnen", K1, (p, t) => {
    const q = huepfen(p, t, 1.3, 5);
    p.armL = p.armR = "oben";
    p.aL[0] = 1;
    p.aR[0] = -1;
    p.props.push(pr("pokal", "ueber", 0, 3));
    p.augen = "froh";
    p.mund = q < 0.12 ? "laecheln" : "breit";
    p.fx.push(fx("konfetti"));
  }, { per: 0.77 });
  neu("Rage Quit", K1, (p, t) => {
    const q = ph(t, 3);
    p.augen = "wuetend";
    if (q < 0.45) { p.armL = p.armR = "vorne"; p.props.push(pr("controller", "vorne", 0, 1)); zittern(p, t, 0.4 + q * 2); p.mund = "zaehne"; p.aL[1] = -takt(t, 10, 2); p.aR[1] = -takt(t, 9, 2); }
    else if (q < 0.55) { p.armR = "oben"; p.armL = "halb"; p.props.push(pr("controller", "handR", -4, -2)); p.dreh = -6 * v(p); p.mund = "gross"; p.bh += 1; }
    else { p.armR = "raus"; p.fx.push(fx("wurf", { map: K.PROPS.controller }), fx("wut")); p.mund = "gross"; p.tint = { body: "#e0533d", dark: "#a8331f" }; huepfen(p, t, 3, 2); }
  }, { per: 3 });
  neu("Rhythmusspiel", K1, (p, t) => {
    p.fx.push(fx("pfeile", { hinten: true }));
    const k = takt(t, 3, 4);
    p.armL = ["oben", "raus", "tief", "raus"][k];
    p.armR = ["tief", "raus", "oben", "raus"][k];
    p.lift = [[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 2], [0, 0, 0, 0]][k];
    p.dy -= k % 2 ? 0 : 1;
    p.augen = "gross";
    p.mund = ph(t, 4) > 0.7 ? "breit" : "zunge";
  }, { per: 1.33 });
  neu("VR-Welt", K1, (p, t) => {
    const k = takt(t, 2, 4);
    p.props.push(pr("vrbrille", "augen"));
    p.armL = ["oben", "raus", "halb", "vorne"][k];
    p.armR = ["raus", "oben", "vorne", "halb"][k];
    p.dreh = sin(t, 0.5) * 9;
    p.mund = ["o", "breit", "o", "laecheln"][k];
    p.dx += [0, 1, 0, -1][k];
  }, { per: 2 });
  neu("Speedrun", K1, (p, t) => {
    const k = gehen(p, t, 4, { hub: 2, arme: true });
    p.dreh = 11 * v(p);
    p.armL = p.armR = "halb";
    p.aL[0] += k < 4 ? 1 : -1;
    p.aR[0] -= k < 4 ? 1 : -1;
    p.fx.push(fx("uhr"), fx("tempo", { rechts: p.spiegel }));
    p.augen = "wuetend";
    p.mund = "zaehne";
  }, { laeuft: 18, per: 0.5 });
  neu("Loot gefunden", K1, (p, t) => {
    const q = ph(t, 3.5);
    const offen = q > 0.35;
    p.props.push(pr(offen ? "truheOffen" : "truhe", "boden", 9, 0));
    if (!offen) { p.armR = "raus"; p.aR[1] = 2; p.augen = "gross"; p.ey = 1; p.ex = 2; p.mund = "o"; p.dreh = 4 * v(p); }
    else if (q < 0.45) { p.augen = "gross"; p.mund = "o"; p.bh += 1; p.dy -= 2; p.fx.push(fx("strahlen", { hinten: true })); }
    else { p.augen = "geld"; p.fx.push(fx("muenzen", { x: 38, y: 28 })); p.armL = p.armR = "oben"; p.mund = "breit"; huepfen(p, t, 1.4, 3); }
  }, { per: 3.5 });
  neu("Level Up", K1, (p, t) => {
    const q = ph(t, 2.5);
    p.fx.push(fx("strahlen", { hinten: true }), fx("lvup"));
    if (q < 0.2) { p.bh -= 2; p.bw += 1; p.augen = "zu"; p.armL = p.armR = "tief"; }
    else { const u = (q - 0.2) / 0.8; p.dy -= r(Math.sin(Math.min(1, u * 1.6) * Math.PI) * 6); p.bh += u < 0.4 ? 1 : 0; p.augen = "stern"; p.mund = "breit"; p.armL = p.armR = "oben"; }
  }, { per: 2.5 });
  neu("Game Over", K1, (p, t) => {
    const q = ph(t, 3.5);
    p.augen = "x";
    p.tint = { body: "#8b877d", dark: "#55524b" };
    if (q < 0.15) { zittern(p, t, 1); p.mund = "o"; }
    else if (q < 0.3) { liegen(p, ((q - 0.15) / 0.15) * 90); p.mund = "o"; }
    else { liegen(p, 90); p.dy += takt(t, 0.5, 2) ? 0 : 1; p.mund = "flach"; }
    p.fx.push(fx("text", { txt: "GAME OVER", y: 6, blink: true, farbe: "#d9443a" }));
  }, { per: 3.5 });
  neu("Respawn", K1, (p, t) => {
    const q = ph(t, 2.5);
    if (q < 0.25) { p.dy -= r(40 - (q / 0.25) * 40); p.lift = [1, 1, 1, 1]; p.bh += 1; p.bw -= 1; p.augen = "zu"; }
    else if (q < 0.33) { p.bh -= 2; p.bw += 2; p.augen = "zu"; p.fx.push(fx("staub", { rechts: true }), fx("staub", { rechts: false })); }
    else if (q < 0.6) { p.alpha = takt(t, 10, 2) ? 1 : 0.3; p.augen = "gross"; }
    else { p.augen = "froh"; p.mund = "laecheln"; p.armR = "oben"; p.aR[0] = takt(t, 5, 2); }
    p.fx.push(fx("funkeln", { n: 2 }));
  }, { per: 2.5 });
  neu("Schwertkampf", K1, (p, t) => {
    const { q } = kp(p, t, 2, [
      { q: 0, armR: "halb", bh: -1, bw: 1 },
      { q: 0.2, armR: "oben", dreh: -6, augen: "wuetend" },
      { q: 0.3, armR: "raus", dreh: 10, dx: 2, augen: "wuetend", mund: "offen" },
      { q: 0.45, armR: "halb", bh: -1, bw: 1 },
      { q: 0.65, armR: "raus", aR: [2, 1], dx: 3, lift: [0, 0, 2, 2], augen: "wuetend", mund: "zaehne" },
      { q: 0.8, armR: "halb", bh: -1, bw: 1 }
    ]);
    p.dreh *= v(p);
    if (!p.augen || p.augen === "offen") p.augen = "halb";
    p.props.push(pr("schwert", "handR", -1, p.armR === "oben" ? 0 : 3));
    if ((q > 0.28 && q < 0.42) || (q > 0.64 && q < 0.75)) p.fx.push(fx("bogen", { farbe: "#dfe4ea" }));
  }, { per: 2 });
  neu("Anfeuern", K1, (p, t) => {
    const k = takt(t, 3, 2);
    p.beine = "sitzen";
    p.armL = k ? "oben" : "halb";
    p.armR = k ? "halb" : "oben";
    p.dy -= k;
    p.mund = "offen";
    p.augen = ph(t, 3) > 0.7 ? "froh" : "gross";
    p.fx.push(fx("text", { txt: "GO GO", y: 8, blink: true }));
  }, { per: 3 });

  K1 = "Schlaf & Ruhe";
  neu("Einschlafen", K1, (p, t) => {
    const q = ph(t, 6);
    p.beine = "sitzen";
    if (q < 0.25) { p.augen = "halb"; atmen(p, t); }
    else if (q < 0.45) { p.augen = "zu"; p.dreh = ((q - 0.25) / 0.2) * 10; p.dy += 1; }
    else if (q < 0.5) { p.augen = "gross"; p.dy -= 1; }
    else if (q < 0.7) { p.augen = q < 0.6 ? "halb" : "zu"; p.dreh = ((q - 0.5) / 0.2) * 14; p.dy += 1; }
    else { p.augen = "zu"; p.dreh = 14; p.dy += 1; p.mund = "klein"; p.fx.push(fx("zzz")); atmen(p, t, 0.2); }
  }, { per: 6 });
  neu("Schlafen", K1, (p, t) => {
    liegen(p);
    p.augen = "zu";
    p.mund = ph(t, 5) > 0.6 ? "klein" : null;
    atmen(p, t, 0.2);
    p.lift = ph(t, 11) > 0.9 ? [1, 0, 0, 0] : [0, 0, 0, 0];
    p.fx.push(fx("zzz"));
  }, { per: 5 });
  neu("Schnarchen", K1, (p, t) => {
    const q = ph(t, 2.5);
    p.beine = "sitzen";
    p.augen = "zu";
    p.dreh = 6;
    p.mund = q < 0.6 ? "offen" : "klein";
    p.bh += q < 0.6 ? 1 : 0;
    p.fx.push(fx("schnarchblase"));
    if (q < 0.4) p.fx.push(fx("text", { txt: "RRR", x: 31, y: 14 }));
  }, { per: 2.5 });
  neu("Träumen", K1, (p, t) => {
    liegen(p);
    p.augen = "zu";
    p.mund = "laecheln";
    p.rot = ph(t, 6) > 0.6;
    atmen(p, t, 0.2);
    p.fx.push(fx("traum"));
  }, { per: 6 });
  neu("Nickerchen im Sitzen", K1, (p, t) => {
    const q = ph(t, 5);
    p.beine = "sitzen";
    p.augen = "zu";
    if (q < 0.8) { p.dreh = sin(t, 0.4) * 5 + ((q / 0.8) * 8); p.dy += r((q / 0.8) * 1); p.fx.push(fx("zzz")); }
    else if (q < 0.86) { p.augen = "gross"; p.dy -= 1; }
    else { p.augen = "halb"; }
  }, { per: 5 });
  neu("Schlafwandeln", K1, (p, t) => {
    gehen(p, t, 0.7, { arme: true });
    p.augen = "zu";
    p.armL = p.armR = "raus";
    p.aL[1] = p.aR[1] = r(sin(t, 0.35));
    p.dreh = sin(t, 0.35) * 4;
    p.mund = "klein";
    p.fx.push(fx("zzz"));
  }, { laeuft: 3, per: 2.86 });
  neu("Aufwachen", K1, (p, t) => {
    const q = ph(t, 5);
    if (q < 0.35) { liegen(p); p.augen = "zu"; atmen(p, t, 0.2); p.fx.push(fx("zzz")); }
    else if (q < 0.45) { liegen(p); p.augen = takt(t, 6, 2) ? "halb" : "zu"; }
    else if (q < 0.55) { liegen(p, 90 - ((q - 0.45) / 0.1) * 90); p.augen = "gross"; p.fx.push(fx("ausruf")); }
    else if (q < 0.8) { p.armL = p.armR = "oben"; p.mund = "gross"; p.augen = "zu"; p.bh += 2; p.dy -= 1; }
    else { p.augen = "froh"; p.mund = "laecheln"; p.armR = "kopf"; p.aR[0] = takt(t, 6, 2); }
  }, { per: 5 });
  neu("Im Bett", K1, (p, t) => {
    p.fx.push(fx("bett", { hinten: true }), fx("zzz"));
    liegen(p);
    p.dy -= 3;
    const hub = sin(t, 0.2) > 0.5 ? 1 : 0;
    p.fx.push(fx("fn", { fn: (c, tt, rr, ii) => K.zeichne(c, K.PROPS.decke, p.spiegel ? 14 : 18, 28 - hub, ii.f) }));
    p.augen = "zu";
    p.mund = ph(t, 7) > 0.7 ? "laecheln" : null;
  }, { per: 5 });
  neu("Hängematte", K1, (p, t) => {
    p.fx.push(fx("haengematte", { hinten: true }));
    liegen(p, 90 + sin(t, 0.35) * 8);
    p.dy -= 4;
    p.dx += r(sin(t, 0.35) * 3);
    p.augen = ph(t, 8) > 0.8 ? "halb" : "zu";
    p.mund = "laecheln";
    p.armL = p.armR = "hoch";
  }, { per: 5.7 });
  neu("Sonnenbaden", K1, (p, t) => {
    liegen(p);
    p.props.push(pr("sonnenbrille", "augen"));
    p.fx.push(fx("sonne"));
    p.armL = p.armR = "hoch";
    p.mund = "laecheln";
    p.lift = ph(t, 4) > 0.5 ? [0, 0, 1, 0] : [0, 0, 0, 0];
    atmen(p, t, 0.2);
  }, { per: 4 });
  neu("Sterne gucken", K1, (p, t) => {
    const q = ph(t, 6);
    p.beine = "sitzen";
    p.ey = -1;
    p.fx.push(fx("sterne", { hinten: true }));
    if (q > 0.6 && q < 0.85) { p.fx.push(fx("sternschnuppe")); p.armR = "oben"; p.augen = "gross"; p.mund = "o"; p.ex = -1; }
    else { p.mund = "laecheln"; p.ex = r(sin(t, 1 / 6) * 2); blinzeln(p, t); }
  }, { per: 6 });
  neu("Kuscheltier drücken", K1, (p, t) => {
    p.armL = p.armR = "vorne";
    p.props.push(pr("teddy", "vorne", 0, 0));
    p.rot = true;
    p.augen = "froh";
    p.mund = "laecheln";
    p.dreh = sin(t, 0.5) * 6;
    p.bw += ph(t, 2) < 0.3 ? 1 : 0;
    p.fx.push(fx("herzen", { n: 1 }));
  }, { per: 2 });

  K1 = "Wetter & Natur";
  neu("Im Regen stehen", K1, (p, t) => {
    p.fx.push(fx("regen"));
    p.augen = "traurig";
    p.mund = "traurig";
    p.bh -= 1;
    p.armL = p.armR = "tief";
    if (ph(t, 3) > 0.8) { zittern(p, t, 0.5); p.augen = "zu"; }
    p.fx.push(tropfen(18, 24, 18, 36, "#62c9e8", 1));
  }, { per: 3 });
  neu("Regenschirm", K1, (p, t) => {
    p.fx.push(fx("regen"));
    p.armR = "halb";
    p.props.push(pr("schirm", "handR", -6, 5));
    gehen(p, t, 0.8, { hub: 0 });
    p.augen = "froh";
    p.mund = "pfeifen";
    p.dreh = sin(t, 0.4) * 3;
    if (ph(t, 4) > 0.6) p.fx.push(fx("noten"));
  }, { per: 4 });
  neu("Schneeflocken fangen", K1, (p, t) => {
    const q = ph(t, 3);
    p.fx.push(fx("schnee"));
    p.ey = -1;
    p.mund = "zunge";
    p.augen = "froh";
    p.dx += r(sin(t, 1 / 3) * 6);
    if (q > 0.7) { huepfen(p, t, 2, 4); p.armL = p.armR = "oben"; p.mund = "breit"; }
  }, { per: 3 });
  neu("Schneeballschlacht", K1, (p, t) => {
    const q = ph(t, 2.5);
    p.fx.push(fx("schnee", { n: 6 }));
    if (q < 0.3) { p.bh -= 2; p.bw += 1; p.armL = p.armR = "tief"; p.ey = 1; p.mund = "zunge"; }
    else if (q < 0.45) { p.armR = "oben"; p.props.push(pr("schneeball", "handR")); p.dreh = -6 * v(p); p.augen = "froh"; }
    else if (q < 0.75) { p.armR = "raus"; p.dreh = 6 * v(p); p.fx.push(fx("wurf", { map: K.PROPS.schneeball })); p.augen = "froh"; p.mund = "breit"; }
    else { p.bh -= 2; p.armL = p.armR = "oben"; p.augen = "zu"; p.mund = "o"; }
  }, { per: 2.5 });
  neu("Frieren", K1, (p, t) => {
    zittern(p, t, 1);
    p.tint = { body: "#9fb8d9", dark: "#7891b3" };
    p.fx.push(fx("schnee"));
    p.augen = "zu";
    p.mund = takt(t, 10, 2) ? "zaehne" : "flach";
    p.armL = p.armR = "vorne";
    p.bh -= 1;
    if (ph(t, 2) < 0.3) p.fx.push(fx("rauch", { x: 26, y: 28 }));
  }, { per: 2 });
  neu("Hitze", K1, (p, t) => {
    const q = ph(t, 4);
    p.fx.push(fx("sonne"), fx("schweiss"));
    p.bh -= r(q * 3);
    p.bw += r(q * 2);
    p.augen = "halb";
    p.mund = "zunge";
    p.armR = "oben";
    p.aR[0] = takt(t, 6, 2);
    p.armL = "tief";
  }, { per: 4 });
  neu("Gewitter", K1, (p, t) => {
    const blitz = t % 2.2 < 0.35;
    p.fx.push(fx("regen"), fx("blitz"));
    if (blitz) { p.dy -= 3; p.armL = p.armR = "oben"; p.augen = "gross"; p.mund = "o"; zittern(p, t, 1.5); }
    else { p.armL = p.armR = "vorne"; p.augen = "gross"; p.mund = "traurig"; zittern(p, t, 0.3); p.ex = r(sin(t, 0.5)); }
  }, { per: 2.2 });
  neu("Gegen den Wind", K1, (p, t) => {
    p.fx.push(fx("wind"), fx("blaetter"));
    gehen(p, t, 0.6, { hub: 0 });
    p.dreh = (14 + sin(t, 0.8) * 4) * v(p);
    p.armL = p.armR = "raus";
    p.aL[1] = p.aR[1] = takt(t, 3, 2) ? -1 : 0;
    p.augen = "zu";
    p.mund = "zaehne";
    zittern(p, t, 0.3);
  }, { per: 3 });
  neu("Laub rechen", K1, (p, t) => {
    const s = sin(t, 0.6);
    p.props.push(pr("rechen", "griffR", r(s * 3), 0));
    p.aR[0] = r(s * 2);
    p.dx += r(s);
    p.dreh = s * 3;
    p.fx.push(fx("blaetter"));
    p.ey = 1;
    p.mund = ph(t, 5) > 0.6 ? "pfeifen" : "laecheln";
    blinzeln(p, t);
  }, { per: 1.67 });
  neu("Angeln", K1, (p, t) => { p.beine = "sitzen"; p.armR = "halb"; p.props.push(pr("angel", "handR", 0, -3)); p.fx.push(fx("fn", { fn: (c, tt) => K.linie(c, 43, 20, 43, 33 + Math.round(Math.sin(tt * 2)), "#8b877d") }), fx("fisch")); blinzeln(p, t); });
  neu("Schmetterling jagen", K1, (p, t) => {
    const x = Math.sin(t * 0.9) * 10;
    gehen(p, t, 1.8, { blick: true });
    p.dx = r(x);
    p.spiegel = Math.cos(t * 0.9) < 0;
    p.ey = -1;
    p.ex = 1;
    p.augen = "froh";
    p.mund = "breit";
    p.armR = takt(t, 3, 2) ? "oben" : "hoch";
    if (ph(t, 3.5) > 0.8) { p.dy -= 3; p.armL = "oben"; }
    p.fx.push(fx("schmetterling"));
  }, { per: 3.5 });
  neu("An Blume riechen", K1, (p, t) => {
    const q = ph(t, 4);
    p.armR = "mund";
    p.props.push(pr("blume", "handR", -1, -1));
    p.augen = "zu";
    if (q < 0.4) { p.bh += q > 0.2 ? 2 : 1; p.mund = "klein"; }
    else if (q < 0.7) { p.mund = "laecheln"; p.rot = true; p.fx.push(fx("herzen", { n: 2 })); p.dreh = 4; }
    else { p.mund = "laecheln"; p.augen = "froh"; }
  }, { per: 4 });
  neu("Vogel auf dem Kopf", K1, (p, t) => {
    const q = ph(t, 4);
    p.fx.push(fx("vogel", { landen: true }));
    p.ey = -1;
    if (q < 0.5) { p.ex = r(2 - q * 8); p.augen = "offen"; blinzeln(p, t); }
    else { p.augen = q < 0.6 ? "gross" : "froh"; p.mund = q < 0.6 ? "o" : "laecheln"; p.ex = 0; p.bh -= q < 0.6 ? 1 : 0; }
  }, { per: 4 });
  neu("Katze streicheln", K1, (p, t) => {
    const s = sin(t, 0.6);
    p.props.push(pr("katze", "boden", 8, s > 0.6 ? -1 : 0));
    p.armR = "raus";
    p.aR[1] = 2 + r(s);
    p.aR[0] = r(s);
    p.dreh = 4 * v(p);
    p.augen = "froh";
    p.mund = "laecheln";
    p.fx.push(fx("herzen", { n: 1 }));
    if (ph(t, 5) > 0.75) p.fx.push(fx("text", { txt: "PRR", x: p.spiegel ? 2 : 36, y: 20 }));
  }, { per: 1.67 });

  K1 = "Magie & Glitch";
  neu("Zaubern", K1, (p, t) => {
    const q = ph(t, 3);
    p.props.push(pr("zauberstab", "handR"));
    if (q < 0.4) { p.armR = ["oben", "raus", "hoch", "raus"][takt(t, 5, 4)]; p.augen = "stern"; p.mund = "pfeifen"; p.fx.push(fx("funkeln", { n: 3 })); }
    else if (q < 0.5) { p.armR = "oben"; p.bh += 1; p.dy -= 1; p.augen = "gross"; p.mund = "o"; }
    else { p.armR = "raus"; p.augen = "froh"; p.mund = "breit"; p.fx.push(fx("knall", { x: 40, y: 22 }), fx("funkeln")); }
  }, { per: 3 });
  neu("Schweben", K1, (p, t) => {
    p.beine = "sitzen";
    p.dy -= 9 + r(sin(t, 0.4) * 2);
    p.augen = "zu";
    p.mund = "laecheln";
    p.armL = p.armR = "raus";
    p.aL[1] = p.aR[1] = r(sin(t, 0.4));
    p.fx.push(fx("aura", { farbe: "#9b61d3" }));
  }, { per: 2.5 });
  neu("Unsichtbar werden", K1, (p, t) => {
    const q = ph(t, 4);
    p.alpha = q < 0.3 ? 1 - (q / 0.3) * 0.92 : q < 0.7 ? 0.08 : 0.08 + ((q - 0.7) / 0.3) * 0.92;
    p.augen = q < 0.3 ? "froh" : "offen";
    p.mund = "schief";
    if (q > 0.25 && q < 0.35) p.fx.push(fx("funkeln", { n: 3 }));
    if (q > 0.35 && q < 0.7) p.dx += r(sin(t, 0.5) * 6);
  }, { per: 4 });
  neu("Glitch", K1, (p, t) => {
    const q = ph(t, 2.5);
    if (q < 0.55) { leben(p, t); p.mund = "flach"; return; }
    p.glitch = 0.45;
    p.fx.push(fx("glitchlinien"));
    p.augen = K.AUGEN[Math.floor(K.rnd(Math.floor(t * 8)) * 8)];
    p.dx += r((K.rnd(Math.floor(t * 12)) - 0.5) * 4);
    p.tint = takt(t, 8, 2) ? { body: "#2bd4ff", dark: "#1d3b8c" } : null;
  }, { per: 2.5 });
  neu("Pixel zerfallen", K1, (p, t) => {
    const q = ph(t, 3.5);
    const a = q < 0.3 ? 0 : q < 0.5 ? (q - 0.3) / 0.2 : q < 0.7 ? 1 - (q - 0.5) / 0.2 : 0;
    if (a > 0) { p.ohneFigur = true; p.fx.push(fx("pixelstaub", { q: a })); }
    else if (q < 0.3) { p.augen = "gross"; p.mund = "o"; zittern(p, t, q * 3); }
    else { p.augen = "froh"; p.mund = "laecheln"; }
  }, { per: 3.5 });
  neu("Wachsen und Schrumpfen", K1, (p, t) => {
    p.skala = 1 + sin(t, 0.35) * 0.4;
    p.augen = p.skala > 1.2 ? "gross" : p.skala < 0.8 ? "punkt" : "offen";
    p.mund = p.skala > 1.2 ? "o" : p.skala < 0.8 ? "klein" : "laecheln";
    p.armL = p.armR = p.skala > 1.2 ? "oben" : "halb";
  }, { per: 2.86 });
  neu("Klonen", K1, (p, t) => {
    const q = ph(t, 4);
    const weich = (x) => x * x * (3 - 2 * x);
    if (q < 0.15) {
      p.dx = takt(t, 16, 2) ? 1 : -1;
      p.augen = "zu";
      p.mund = "flach";
      p.armL = p.armR = "tief";
      p.fx.push(fx("funkeln", { n: 3 }));
    } else if (q < 0.3) {
      const k = weich((q - 0.15) / 0.15);
      p.bw = r(k * 10);
      p.bh = -r(k * 2);
      p.dy += takt(t, 12, 2);
      p.augen = "gross";
      p.mund = "o";
      p.armL = p.armR = "raus";
    } else if (q < 0.4) {
      const k = weich((q - 0.3) / 0.1);
      p.bw = r((1 - k) * 10);
      p.klon = r(k * 18);
      p.klonAlpha = 1;
      p.dx = -r(k * 9);
      p.augen = "gross";
      p.mund = "breit";
      p.armL = p.armR = "halb";
      if (k < 0.6) p.fx.push(fx("funkeln", { n: 4 }));
    } else if (q < 0.78) {
      p.klon = 18;
      p.klonAlpha = 1;
      p.dx = -9;
      const w = (q - 0.4) / 0.38;
      p.augen = w > 0.45 && w < 0.5 ? "zu" : "froh";
      p.ex = w < 0.3 ? 1 : w < 0.6 ? -1 : 0;
      p.mund = "breit";
      p.armL = p.armR = w > 0.62 && w < 0.85 ? "oben" : "unten";
      if (w > 0.62 && w < 0.85) p.dy -= takt(t, 8, 2) ? 1 : 0;
    } else if (q < 0.92) {
      const k = weich((q - 0.78) / 0.14);
      p.klon = r((1 - k) * 18);
      p.klonAlpha = 1 - k * 0.4;
      p.dx = -r((1 - k) * 9);
      p.augen = "zu";
      p.mund = "laecheln";
      p.armL = p.armR = "halb";
    } else {
      p.dx = takt(t, 16, 2) && q < 0.96 ? 1 : 0;
      p.augen = "froh";
      p.mund = "laecheln";
      if (q < 0.96) p.fx.push(fx("funkeln", { n: 2 }));
    }
  }, { per: 4 });
  neu("Kristallkugel", K1, (p, t) => {
    const q = ph(t, 4);
    p.armL = p.armR = "vorne";
    p.aL[1] = p.aR[1] = r(sin(t, 0.5));
    p.props.push(pr("kugel", "vorne", 0, 2));
    p.augen = q > 0.6 ? "spirale" : "halb";
    p.mund = q > 0.6 ? "o" : "flach";
    p.fx.push(fx("funkeln", { n: 3 }));
    if (q > 0.6) p.fx.push(fx("fn", { fn: (c, tt, rr) => { c.globalAlpha = 0.5 + Math.sin(tt * 8) * 0.3; K.px(c, rr.cx - 3, rr.oben + 5, "#c9ff3d", 6, 5); c.globalAlpha = 1; } }));
  }, { per: 4 });
  neu("Feuerball", K1, (p, t) => {
    const q = ph(t, 2);
    if (q < 0.45) {
      p.armL = p.armR = "vorne";
      p.bh -= 1;
      p.augen = "wuetend";
      p.mund = "zaehne";
      zittern(p, t, q);
      p.fx.push(fx("fn", { fn: (c, tt, rr) => K.zeichne(c, K.FXMAPS.flamme[Math.floor(tt * 10) % 3], rr.cx - 1, rr.oben + 5, K.FARBEN) }));
    } else {
      p.armR = "raus";
      p.dreh = 6 * v(p);
      p.augen = "wuetend";
      p.mund = "offen";
      p.fx.push(fx("fn", { fn: (c, tt, rr) => { const u = (q - 0.45) / 0.55; K.zeichne(c, K.FXMAPS.flamme[Math.floor(tt * 10) % 3], p.spiegel ? rr.handL.x - u * 22 : rr.handR.x + u * 22, rr.handR.y - 2, K.FARBEN); } }));
    }
  }, { per: 2 });
  neu("Durchs Portal", K1, (p, t) => {
    const q = ph(t, 3);
    p.fx.push(fx("portal", { x: 38, y: 27, hinten: true }));
    gehen(p, t, 1.5);
    p.dx = r(-14 + q * 40);
    p.alpha = p.dx > 8 ? Math.max(0, 1 - (p.dx - 8) / 8) : 1;
    p.augen = p.dx > 4 ? "gross" : "offen";
    p.mund = p.dx > 4 ? "breit" : "laecheln";
  }, { per: 3 });
  neu("Matrix", K1, (p, t) => {
    const q = ph(t, 3.5);
    p.fx.push(fx("matrix", { hinten: true }));
    p.props.push(pr("sonnenbrille", "augen"));
    p.pivot = "fuesse";
    if (q < 0.35) { p.armL = p.armR = "tief"; p.mund = "flach"; }
    else if (q < 0.5) p.dreh = -((q - 0.35) / 0.15) * 45;
    else if (q < 0.85) { p.dreh = -45 + sin(t, 1) * 2; p.armL = p.armR = "raus"; p.mund = "o"; p.fx.push(fx("fn", { fn: (c, tt) => { const x = ((tt * 40) % 60) - 6; K.px(c, x, 20, "#c8c4b8", 3, 1); } })); }
    else p.dreh = -45 + ((q - 0.85) / 0.15) * 45;
  }, { per: 3.5 });
  neu("Regenbogen-Aura", K1, (p, t) => {
    p.fx.push(fx("regenbogen"));
    p.augen = "froh";
    p.mund = "breit";
    wippen(p, t, 1.5, 2);
    p.armL = p.armR = takt(t, 1.5, 2) ? "oben" : "halb";
  }, { per: 2 });

  K1 = "Im Gespräch";
  neu("Zuhören", K1, (p, t) => { p.fx.push(fx("schall")); p.dreh = 6; p.augen = "gross"; p.ex = 1; p.dy -= ph(t, 2) < 0.1 ? 1 : 0; blinzeln(p, t); }, { per: 2 });
  neu("Antwort überlegen", K1, (p, t) => { p.ey = -1; p.ex = r(sin(t, 0.5)); p.fx.push(fx("laden")); p.mund = "schief"; p.armR = "mund"; p.aR[1] = 1; }, { per: 2 });
  neu("Reden", K1, (p, t) => { p.mund = ["offen", "klein", "o", "flach"][takt(t, 6, 4)]; p.fx.push(fx("schall", { aus: true })); p.armR = takt(t, 1.5, 2) ? "halb" : "unten"; p.dy -= takt(t, 3, 2) ? 0 : 0; blinzeln(p, t); }, { per: 2 });
  neu("Mit Händen erklären", K1, (p, t) => { const k = takt(t, 2.5, 4); p.armL = ["raus", "halb", "unten", "oben"][k]; p.armR = ["halb", "raus", "oben", "unten"][k]; p.mund = takt(t, 5, 2) ? "offen" : "klein"; p.dreh = [3, -3, 2, -2][k]; blinzeln(p, t); }, { per: 1.6 });
  neu("Nicken", K1, (p, t) => { const k = takt(t, 3, 2); p.dy += k; p.ey = k; p.bh -= k; p.augen = "froh"; p.mund = "laecheln"; }, { per: 0.67 });
  neu("Kopfschütteln", K1, (p, t) => { const k = takt(t, 5, 2); p.ex = k ? 2 : -2; p.dreh = k ? 5 : -5; p.mund = "flach"; p.augen = "halb"; }, { per: 0.4 });
  neu("Daumen hoch", K1, (p, t) => { const q = ph(t, 2); p.armR = "oben"; p.props.push(pr("daumen", "handR", -2, -2)); p.augen = q < 0.2 ? "zwinker" : "froh"; p.mund = "breit"; p.dy -= q < 0.1 ? 1 : 0; if (q < 0.25) p.fx.push(fx("funkeln", { n: 2 })); }, { per: 2 });
  neu("Flüstern", K1, (p, t) => { p.armR = "mund"; p.aR[0] = 2; p.dreh = 6; p.bh -= 1; p.fx.push(fx("text", { txt: "PSST", x: 32, y: 16 })); p.augen = "seitlich"; p.ex = takt(t, 1, 2) ? 1 : -1; }, { per: 2 });
  neu("Laden", K1, (p, t) => { p.fx.push(fx("laden")); p.augen = "punkt"; p.mund = "flach"; atmen(p, t); }, { per: 2 });
  neu("Fehler 404", K1, (p, t) => { p.augen = "x"; p.glitch = ph(t, 2) < 0.3 ? 0.4 : 0.1; p.fx.push(fx("text", { txt: "404", farbe: "#d9443a", blink: true })); p.mund = "flach"; p.dreh = ph(t, 2) < 0.3 ? 5 : 0; }, { per: 2 });
  const zaehler = {};
  A.forEach((a) => {
    const basis = a.n.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    zaehler[basis] = (zaehler[basis] || 0) + 1;
    a.id = "b-" + basis + (zaehler[basis] > 1 ? "-" + zaehler[basis] : "");
  });
  K.BEWEGUNGEN = A;

  K.posieren = (anim, t, opt = {}) => {
    const p = K.pose();
    if (anim.laeuft && !opt.buehne) {
      const range = 11, halb = (2 * range) / Math.abs(anim.laeuft), q = ph(t, 2 * halb);
      const nachRechts = q < 0.5;
      p.dx = r(nachRechts ? -range + q * 2 * 2 * range : range - (q - 0.5) * 2 * 2 * range);
      p.spiegel = anim.laeuft > 0 ? !nachRechts : nachRechts;
    } else if (opt.spiegel) p.spiegel = true;
    anim.f(p, t);
    return p;
  };
})();
