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
  const blinzeln = (p, t, o = 0) => { if (ph(t + o, 3.3) > 0.95) p.augen = "zu"; };
  const atmen = (p, t) => { if (sin(t, 0.35) > 0.6) p.bh += 1; };
  const gehen = (p, t, v = 2) => {
    const k = takt(t, v * 4, 4);
    p.lift = k === 1 ? [1, 0, 0, 1] : k === 3 ? [0, 1, 1, 0] : [0, 0, 0, 0];
    if (k % 2) p.dy -= 1;
    p.aL[1] = k === 1 ? -1 : k === 3 ? 1 : 0;
    p.aR[1] = -p.aL[1];
  };
  const huepfen = (p, t, f = 1, h = 6) => {
    const q = ph(t, 1 / f);
    p.dy -= r(Math.sin(q * Math.PI) * h);
    if (q < 0.1 || q > 0.92) { p.bh -= 1; p.bw += 1; } else p.lift = [1, 1, 1, 1];
  };
  const wippen = (p, t, f = 1, a = 1) => { p.dy -= r(Math.abs(sin(t, f / 2)) * a); };
  const zittern = (p, t, a = 1) => { p.dx += r((K.rnd(Math.floor(t * 30)) - 0.5) * 2 * a); };
  const pr = (id, an, dx = 0, dy = 0, x) => Object.assign({ id, an, dx, dy }, x || {});
  const fx = (typ, x) => Object.assign({ typ }, x || {});
  const v = (p) => (p.spiegel ? -1 : 1);
  const liegen = (p, w = 90) => { p.dreh = w; p.pivot = "mitte"; };
  const tropfen = (x0, y0, x1, y1, farbe, n = 3) => fx("fn", { fn: (c, t) => { for (let k = 0; k < n; k++) { const q = (t * 1.5 + k / n) % 1; K.px(c, x0 + (x1 - x0) * q, y0 + (y1 - y0) * q, farbe); } } });

  const A = [];
  const neu = (n, c, f, x) => A.push(Object.assign({ n, c, f }, x || {}));

  let K1 = "Unterwegs";
  neu("Spazieren", K1, (p, t) => { gehen(p, t, 1.5); blinzeln(p, t); }, { laeuft: 7 });
  neu("Wandern mit Stock", K1, (p, t) => { gehen(p, t, 1.2); p.props.push(pr("stock", "griffR", 0, takt(t, 4.8, 4) === 1 ? -1 : 0)); blinzeln(p, t); }, { laeuft: 5 });
  neu("Rennen", K1, (p, t) => { gehen(p, t, 4); p.dreh = 8 * v(p); p.fx.push(fx("staub", { rechts: p.spiegel }), fx("tempo", { rechts: p.spiegel })); p.augen = "gross"; }, { laeuft: 18 });
  neu("Schleichen", K1, (p, t) => { gehen(p, t, 0.8); p.bh -= 2; p.bw += 1; p.armL = p.armR = "halb"; p.ex = takt(t, 0.8, 2) ? 1 : -1; }, { laeuft: 3 });
  neu("Hüpfen", K1, (p, t) => { huepfen(p, t, 1.4, 5); p.augen = "froh"; }, { laeuft: 8 });
  neu("Moonwalk", K1, (p, t) => { gehen(p, t, 1.5); p.augen = "zu"; p.fx.push(fx("noten")); }, { laeuft: -6 });
  neu("Stolpern", K1, (p, t) => {
    const q = ph(t, 3);
    if (q < 0.5) { gehen(p, t, 2); p.dx = r(-10 + q * 40); }
    else if (q < 0.62) { p.dx = 10; p.dreh = ((q - 0.5) / 0.12) * 80; p.pivot = "mitte"; p.augen = "gross"; p.mund = "o"; }
    else { p.dx = 10; liegen(p, 80); p.augen = "spirale"; p.fx.push(fx("funkeln", { n: 3 })); }
  });
  neu("Seitwärts trippeln", K1, (p, t) => { gehen(p, t, 3); p.armL = p.armR = "hoch"; p.aL[0] = -takt(t, 6, 2); p.aR[0] = takt(t, 6, 2); p.augen = "gross"; }, { laeuft: 4 });
  neu("Joggen", K1, (p, t) => { gehen(p, t, 2.5); p.props.push(pr("stirnband", "kopf", 0, 3)); p.fx.push(fx("schweiss")); }, { laeuft: 10 });
  neu("Marschieren", K1, (p, t) => { const k = takt(t, 4, 2); p.lift = k ? [2, 0, 0, 2] : [0, 2, 2, 0]; p.armL = k ? "raus" : "unten"; p.armR = k ? "unten" : "raus"; p.mund = "flach"; }, { laeuft: 5 });
  neu("Watscheln", K1, (p, t) => { gehen(p, t, 1.5); p.dreh = sin(t, 1.5) * 10; }, { laeuft: 4 });
  neu("Kriechen", K1, (p, t) => { p.beine = "sitzen"; p.bh -= 3; p.bw += 2; p.armL = takt(t, 3, 2) ? "raus" : "tief"; p.armR = takt(t, 3, 2) ? "tief" : "raus"; p.augen = "halb"; }, { laeuft: 2 });
  neu("Klettern", K1, (p, t) => {
    const q = ph(t, 5), h = q < 0.5 ? q * 2 : 2 - q * 2;
    p.props.push(pr("leiter", "frei", 22, 0, { ebene: "hinten" }));
    p.dy -= r(h * 14);
    const k = takt(t, 3, 2);
    p.armL = k ? "hoch" : "halb"; p.armR = k ? "halb" : "hoch"; p.lift = k ? [1, 1, 0, 0] : [0, 0, 1, 1];
  });
  neu("Abseilen", K1, (p, t) => { p.fx.push(fx("seil")); p.dy -= 10 + r(sin(t, 0.4) * 6); p.armL = p.armR = "hoch"; p.aL[0] = 3; p.aR[0] = -3; p.lift = [1, 0, 1, 0]; });
  neu("Schwimmen", K1, (p, t) => { p.dy += 3 + r(sin(t, 1)); const k = takt(t, 3, 2); p.armL = k ? "raus" : "hoch"; p.armR = k ? "hoch" : "raus"; p.fx.push(fx("wellen", { y: 33 })); }, { laeuft: 4 });
  neu("Tauchen", K1, (p, t) => { p.fx.push(fx("wellen", { y: 5, hinten: true }), fx("blasen")); p.dy -= 8 + r(sin(t, 0.3) * 4); p.dreh = sin(t, 0.3) * 12; p.augen = "gross"; p.lift = [1, 0, 1, 0]; });
  neu("Propellerflug", K1, (p, t) => { p.props.push(Object.assign(pr("propeller", "kopf"), { fps: 12 })); p.dy -= 10 + r(sin(t, 0.5) * 2); p.lift = [1, 1, 1, 1]; p.augen = "froh"; }, { laeuft: 6 });
  neu("Ballonfahrt", K1, (p, t) => { p.armR = "hoch"; p.props.push(pr("ballon", "handR", -1, 0)); p.dy -= 8 + r(sin(t, 0.4) * 2); p.lift = [1, 1, 1, 1]; blinzeln(p, t); }, { laeuft: 3 });
  neu("Schirmflug", K1, (p, t) => { p.armR = "hoch"; p.props.push(pr("schirm", "handR", -6, 5)); p.dy -= 6 + r(sin(t, 0.4) * 3); p.dreh = sin(t, 0.4) * 6; p.lift = [0, 1, 0, 1]; p.fx.push(fx("wind")); }, { laeuft: 3 });
  neu("Skateboard", K1, (p, t) => { p.dy -= 2; p.props.push(pr("skateboard", "fuesse")); p.armL = p.armR = "raus"; p.dreh = sin(t, 0.5) * 4; p.fx.push(fx("tempo", { rechts: p.spiegel })); }, { laeuft: 16 });
  neu("Surfen", K1, (p, t) => { p.dy -= 4; p.props.push(pr("surfbrett", "fuesse")); p.armL = p.armR = "raus"; p.dreh = sin(t, 0.6) * 9; p.fx.push(fx("wellen", { y: 35 })); p.augen = "froh"; });
  neu("Teleportieren", K1, (p, t) => {
    const q = ph(t, 2.4);
    if (q < 0.3) p.dx = -10;
    else if (q < 0.5) { p.dx = -10; p.alpha = 1 - (q - 0.3) / 0.2; p.fx.push(fx("funkeln", { n: 3 })); }
    else if (q < 0.7) { p.dx = 10; p.alpha = (q - 0.5) / 0.2; p.fx.push(fx("funkeln", { n: 3 })); }
    else p.dx = 10;
  });
  neu("Reinsprinten", K1, (p, t) => {
    const q = ph(t, 3.5);
    if (q < 0.25) { p.dx = r(-34 + (q / 0.25) * 34); gehen(p, t, 4); p.fx.push(fx("tempo")); }
    else { p.ex = r(sin(t, 0.8)); blinzeln(p, t); if (q < 0.35) { p.bw += 1; p.bh -= 1; } }
  });

  K1 = "Alltag";
  neu("Rumstehen", K1, (p, t) => { atmen(p, t); blinzeln(p, t); });
  neu("Umschauen", K1, (p, t) => { p.ex = r(sin(t, 0.3) * 1.4); p.ey = sin(t, 0.13) > 0.7 ? -1 : 0; blinzeln(p, t); });
  neu("Winken", K1, (p, t) => { p.armR = "hoch"; p.aR[0] = takt(t, 4, 2); p.mund = "laecheln"; blinzeln(p, t); });
  neu("Beidhändig winken", K1, (p, t) => { p.armL = p.armR = "hoch"; p.aL[0] = -takt(t, 4, 2); p.aR[0] = takt(t, 4, 2); p.mund = "breit"; p.augen = "froh"; });
  neu("Strecken", K1, (p, t) => { const q = ph(t, 3); if (q < 0.5) { p.armL = p.armR = "hoch"; p.bh += 2; p.augen = "zu"; p.mund = "o"; p.lift = [0, 0, 0, 0]; } else { atmen(p, t); blinzeln(p, t); } });
  neu("Gähnen", K1, (p, t) => { const q = ph(t, 3.5); if (q > 0.3 && q < 0.7) { p.mund = "gross"; p.augen = "zu"; p.armL = p.armR = "halb"; p.bh += 1; } else blinzeln(p, t); });
  neu("Am Kopf kratzen", K1, (p, t) => { p.armR = "kopf"; p.aR[0] = takt(t, 6, 2); p.fx.push(fx("frage")); p.augen = "seitlich"; });
  neu("Niesen", K1, (p, t) => {
    const q = ph(t, 2.6);
    if (q < 0.55) { p.bh += r(q * 4); p.augen = "halb"; p.mund = "o"; }
    else if (q < 0.75) { p.bh -= 2; p.augen = "zu"; p.mund = "offen"; p.dx = -1; p.fx.push(fx("text", { txt: "HATSCHI", y: 6 }), fx("fn", { fn: (c, tt, rr) => { for (let k = 0; k < 6; k++) K.px(c, rr.cx + 5 + k * 2, rr.oben + 6 + (k % 3) - 1, "#62c9e8"); } })); }
    else blinzeln(p, t);
  });
  neu("Hinsetzen", K1, (p, t) => { p.beine = "sitzen"; atmen(p, t); blinzeln(p, t); });
  neu("Auf dem Rücken liegen", K1, (p, t) => { liegen(p); p.lift = [takt(t, 3, 2), 0, takt(t, 3, 2) ? 0 : 1, 0]; blinzeln(p, t); });
  neu("Hände in die Hüften", K1, (p, t) => { p.armL = p.armR = "tief"; p.aL[0] = 1; p.aR[0] = -1; p.mund = "schief"; blinzeln(p, t); });
  neu("Warten und tippen", K1, (p, t) => { p.lift[3] = takt(t, 4, 2); p.augen = "halb"; p.fx.push(fx("punkte")); });
  neu("Fegen", K1, (p, t) => { p.props.push(pr("besen", "griffR", r(sin(t, 1.2) * 2), 0)); p.aR[0] = r(sin(t, 1.2) * 2); p.fx.push(fx("staub", { rechts: true })); p.mund = "pfeifen"; });
  neu("Wischen", K1, (p, t) => { p.props.push(pr("mopp", "griffR", r(sin(t, 1) * 3), 0)); p.aR[0] = r(sin(t, 1) * 2); p.fx.push(fx("funkeln", { n: 2 })); });
  neu("Blumen giessen", K1, (p, t) => { p.props.push(pr("giesskanne", "handR", 0, 1), pr("pflanze", "boden", 12, 0)); p.fx.push(tropfen(40, 27, 38, 32, "#3a6fd6")); p.augen = "froh"; });
  neu("Paket tragen", K1, (p, t) => { gehen(p, t, 1.2); p.armL = p.armR = "hoch"; p.props.push(pr("paket", "ueber", 0, 4)); p.fx.push(fx("schweiss")); }, { laeuft: 4 });
  neu("Handy scrollen", K1, (p, t) => { p.armL = p.armR = "vorne"; p.props.push(pr("handy", "vorne", 0, -1)); p.ey = 1; blinzeln(p, t); p.aR[1] = -takt(t, 2, 2); });
  neu("Selfie", K1, (p, t) => { p.armR = "hoch"; p.props.push(pr("handy", "handR", 0, -3)); p.mund = "breit"; p.augen = ph(t, 2) < 0.2 ? "zwinker" : "froh"; p.fx.push(fx("blitzlicht")); });
  neu("Zeitung lesen", K1, (p, t) => { p.armL = p.armR = "vorne"; p.props.push(pr("zeitung", "vorne", 0, 0)); p.ex = r(sin(t, 0.4)); blinzeln(p, t); });
  neu("Einkaufen", K1, (p, t) => { gehen(p, t, 1.3); p.props.push(pr("tuete", "handR", 0, 4)); p.mund = "pfeifen"; }, { laeuft: 5 });

  K1 = "Gefühle";
  neu("Freuen", K1, (p, t) => { huepfen(p, t, 1.5, 4); p.augen = "froh"; p.mund = "breit"; p.armL = p.armR = "hoch"; p.fx.push(fx("funkeln")); });
  neu("Lachen", K1, (p, t) => { p.dy -= takt(t, 8, 2); p.augen = "froh"; p.mund = "offen"; p.fx.push(fx("text", { txt: "HAHA", huepf: true })); });
  neu("Kichern", K1, (p, t) => { p.armR = "mund"; p.augen = "froh"; p.dy -= takt(t, 6, 2); p.rot = true; });
  neu("Verliebt", K1, (p, t) => { p.augen = "herz"; p.rot = true; p.dreh = sin(t, 0.4) * 5; p.fx.push(fx("herzen")); });
  neu("Traurig", K1, (p, t) => { p.augen = "traurig"; p.mund = "traurig"; p.bh -= 1; p.armL = p.armR = "tief"; blinzeln(p, t); });
  neu("Weinen", K1, (p, t) => { p.augen = "traurig"; p.mund = "offen"; p.fx.push(fx("traenen")); zittern(p, t, 0.5); });
  neu("Wütend", K1, (p, t) => { p.augen = "wuetend"; p.mund = "zaehne"; p.tint = { body: "#e0533d", dark: "#a8331f" }; zittern(p, t, 1); p.fx.push(fx("wut")); p.armL = p.armR = "tief"; });
  neu("Ausrasten", K1, (p, t) => { huepfen(p, t, 3, 3); p.augen = "wuetend"; p.mund = "gross"; p.armL = takt(t, 6, 2) ? "hoch" : "raus"; p.armR = takt(t, 6, 2) ? "raus" : "hoch"; p.fx.push(fx("feuer", { hinten: true })); p.tint = { body: "#e0533d", dark: "#a8331f" }; });
  neu("Genervt", K1, (p, t) => { p.augen = "halb"; p.mund = "flach"; if (ph(t, 3) < 0.3) { p.ey = -1; p.augen = "offen"; } p.fx.push(fx("text", { txt: "-.-", y: 14 })); });
  neu("Verlegen", K1, (p, t) => { p.rot = true; p.ey = 1; p.ex = -1; p.dreh = sin(t, 0.6) * 4; p.armL = p.armR = "vorne"; p.augen = "froh"; });
  neu("Stolz", K1, (p, t) => { p.bw += 1; p.bh += 1; p.augen = "zu"; p.mund = "laecheln"; p.armL = p.armR = "tief"; p.fx.push(fx("funkeln", { n: 3 })); });
  neu("Erschrecken", K1, (p, t) => { const q = ph(t, 2.5); if (q < 0.25) { p.dy -= r(Math.sin((q / 0.25) * Math.PI) * 7); p.augen = "gross"; p.mund = "o"; p.armL = p.armR = "hoch"; p.fx.push(fx("ausruf")); } else { zittern(p, t, 0.5); p.augen = "gross"; } });
  neu("Verwirrt", K1, (p, t) => { p.dreh = sin(t, 0.5) * 10; p.ex = takt(t, 1, 2) ? 1 : -1; p.fx.push(fx("frage")); p.mund = "schief"; });
  neu("Nachdenken", K1, (p, t) => { p.armR = "mund"; p.aR[1] = 1; p.ey = -1; p.ex = 1; p.fx.push(fx("punkte")); });
  neu("Idee", K1, (p, t) => { const q = ph(t, 3); if (q < 0.4) { p.ey = -1; p.fx.push(fx("punkte")); } else { p.fx.push(fx("idee")); p.augen = "gross"; p.mund = "o"; if (q < 0.55) p.dy -= 3; p.armR = "hoch"; } });
  neu("Müde", K1, (p, t) => { p.augen = "halb"; p.bh -= 1; p.dreh = sin(t, 0.2) * 5; if (ph(t, 5) > 0.8) { p.mund = "gross"; p.augen = "zu"; } });
  neu("Gelangweilt", K1, (p, t) => { p.augen = "halb"; p.mund = "flach"; p.lift[0] = takt(t, 2, 2); p.fx.push(fx("punkte")); p.ex = r(sin(t, 0.2)); });
  neu("Schmollen", K1, (p, t) => { p.armL = p.armR = "vorne"; p.augen = "zu"; p.mund = "traurig"; p.dreh = -8; p.bw += 1; });
  neu("Überrascht", K1, (p, t) => { p.augen = "gross"; p.mund = "o"; p.dy -= ph(t, 1.5) < 0.15 ? 2 : 0; p.armL = p.armR = "halb"; });
  neu("Schulterzucken", K1, (p, t) => { const k = ph(t, 1.6) < 0.5; p.armL = p.armR = k ? "halb" : "unten"; p.dy -= k ? 1 : 0; p.mund = "schief"; if (k) p.fx.push(fx("frage")); });

  K1 = "Tanz & Musik";
  neu("Headbangen", K1, (p, t) => { const k = takt(t, 6, 2); p.dy -= k * 2; p.bh -= k; p.augen = "zu"; p.mund = "offen"; p.fx.push(fx("noten")); });
  neu("Disco", K1, (p, t) => { const k = takt(t, 2, 2); p.armR = k ? "hoch" : "tief"; p.armL = k ? "tief" : "hoch"; p.dreh = k ? 6 : -6; p.fx.push(fx("konfetti")); p.augen = "froh"; });
  neu("Robotertanz", K1, (p, t) => { const k = takt(t, 3, 4); p.dx = [-2, 0, 2, 0][k]; p.armL = ["raus", "hoch", "tief", "raus"][k]; p.armR = ["tief", "raus", "hoch", "raus"][k]; p.augen = "punkt"; p.mund = "flach"; });
  neu("Wackeltanz", K1, (p, t) => { p.dreh = sin(t, 2) * 12; wippen(p, t, 2); p.augen = "froh"; });
  neu("Floss", K1, (p, t) => { const k = takt(t, 4, 4); const s = [-3, 0, 3, 0][k]; p.aL[0] = s; p.aR[0] = s; p.armL = p.armR = "tief"; p.dx = -Math.sign(s); p.mund = "breit"; });
  neu("Dab", K1, (p, t) => { if (ph(t, 2) > 0.4) { p.armL = "raus"; p.aL[1] = -2; p.armR = "kopf"; p.aR[0] = -3; p.dreh = -10; p.ey = 1; p.ex = -1; } else wippen(p, t, 2); });
  neu("Breakdance", K1, (p, t) => { liegen(p, 180 + sin(t, 1) * 20); p.dy += 3; p.spiegel = takt(t, 6, 2) === 1; p.lift = [takt(t, 6, 2), 1, 0, takt(t, 6, 2)]; p.armL = p.armR = "hoch"; });
  neu("Pirouette", K1, (p, t) => { p.spiegel = takt(t, 6, 2) === 1; p.armL = p.armR = "hoch"; p.aL[0] = 2; p.aR[0] = -2; p.lift = [0, 0, 2, 2]; p.augen = "zu"; p.fx.push(fx("funkeln", { n: 3 })); });
  neu("Gitarre spielen", K1, (p, t) => { p.armR = "vorne"; p.aR[1] = takt(t, 6, 2); p.props.push(pr("gitarre", "vorne", 1, -2)); p.fx.push(fx("noten")); wippen(p, t, 1); p.augen = "zu"; });
  neu("Auflegen", K1, (p, t) => { p.props.push(pr("turntable", "vorne", 0, 3), pr("kopfhoerer", "kopf", 0, 3)); p.armR = "vorne"; p.aR[0] = takt(t, 4, 2); wippen(p, t, 2); p.fx.push(fx("noten")); });
  neu("Trompete", K1, (p, t) => { p.armR = "vorne"; p.props.push(pr("trompete", "vorne", 5, 0)); p.bw += takt(t, 2, 2); p.mund = "klein"; p.fx.push(fx("noten")); p.augen = "zu"; });
  neu("Klavier", K1, (p, t) => { p.props.push(pr("klavier", "vorne", 0, 4)); p.armL = p.armR = "vorne"; p.aL[0] = -takt(t, 5, 3); p.aR[0] = takt(t, 4, 3); p.fx.push(fx("noten")); p.augen = "zu"; });
  neu("Singen", K1, (p, t) => { p.armR = "halb"; p.props.push(pr("mikro", "handR", -1, 0)); p.mund = takt(t, 3, 2) ? "offen" : "o"; p.augen = "zu"; p.fx.push(fx("noten")); });
  neu("Dirigieren", K1, (p, t) => { p.armR = takt(t, 2, 2) ? "hoch" : "raus"; p.armL = "raus"; p.props.push(pr("taktstock", "handR")); p.fx.push(fx("noten")); p.augen = "zu"; });
  neu("Musik hören", K1, (p, t) => { p.props.push(pr("kopfhoerer", "kopf", 0, 3)); wippen(p, t, 1.5); p.augen = "zu"; p.dreh = sin(t, 0.75) * 4; p.fx.push(fx("noten")); });
  neu("Gruppentanz", K1, (p, t) => { const k = takt(t, 2, 4); p.armL = ["raus", "vorne", "kopf", "tief"][k]; p.armR = ["raus", "vorne", "kopf", "tief"][k]; p.dreh = k === 3 ? sin(t, 2) * 8 : 0; p.mund = "breit"; });
  neu("Konfettiparty", K1, (p, t) => { huepfen(p, t, 1.6, 4); p.augen = "froh"; p.mund = "breit"; p.armL = p.armR = "hoch"; p.fx.push(fx("konfetti")); });

  K1 = "Sport & Akrobatik";
  neu("Hanteln stemmen", K1, (p, t) => { const k = ph(t, 1.4) < 0.5; p.armR = k ? "halb" : "unten"; p.props.push(pr("hantel", "handR", -2, 1)); p.fx.push(fx("schweiss")); p.augen = k ? "zu" : "offen"; p.mund = k ? "zaehne" : null; });
  neu("Kniebeugen", K1, (p, t) => { const k = ph(t, 1.4) < 0.5; p.bh -= k ? 3 : 0; p.bw += k ? 1 : 0; p.dy += k ? 1 : 0; p.armL = p.armR = "raus"; p.augen = k ? "zu" : "offen"; });
  neu("Hampelmann", K1, (p, t) => { const k = takt(t, 3, 2); p.armL = p.armR = k ? "hoch" : "unten"; p.dy -= k * 2; p.lift = k ? [1, 1, 1, 1] : [0, 0, 0, 0]; });
  neu("Salto", K1, (p, t) => { const q = ph(t, 1.6); p.dy -= r(Math.sin(q * Math.PI) * 12); p.dreh = q * 360; p.pivot = "mitte"; p.lift = [1, 1, 1, 1]; p.augen = "zu"; });
  neu("Rückwärtssalto", K1, (p, t) => { const q = ph(t, 1.6); p.dy -= r(Math.sin(q * Math.PI) * 12); p.dreh = -q * 360; p.pivot = "mitte"; p.lift = [1, 1, 1, 1]; p.augen = "gross"; });
  neu("Rad schlagen", K1, (p, t) => { p.dreh = ph(t, 1.2) * 360; p.pivot = "mitte"; p.dx = r(-14 + ph(t, 2.4) * 28); p.dy -= 3; p.armL = p.armR = "hoch"; });
  neu("Handstand", K1, (p, t) => { liegen(p, 180 + sin(t, 0.7) * 5); p.dy += 3; p.armL = p.armR = "hoch"; p.lift = [0, takt(t, 2, 2), 0, 0]; p.augen = "gross"; });
  neu("Seilspringen", K1, (p, t) => { huepfen(p, t, 1.6, 3); p.armL = p.armR = "raus"; p.fx.push(fx("springseil")); });
  neu("Jonglieren", K1, (p, t) => { p.armL = takt(t, 4, 2) ? "halb" : "raus"; p.armR = takt(t, 4, 2) ? "raus" : "halb"; p.augen = "gross"; p.ey = -1; p.fx.push(fx("baelle")); });
  neu("Dribbeln", K1, (p, t) => { p.props.push(pr("basketball", "boden", 9, -r(Math.abs(sin(t, 1)) * 8))); p.armR = "unten"; p.aR[1] = Math.abs(sin(t, 1)) > 0.7 ? -1 : 0; p.ex = 1; p.ey = 1; });
  neu("Fussball kicken", K1, (p, t) => { const q = ph(t, 1.25); p.lift = q < 0.2 ? [0, 0, 2, 2] : [0, 0, 0, 0]; p.fx.push(fx("wurf", { map: K.PROPS.ball })); p.augen = "froh"; });
  neu("Basketball werfen", K1, (p, t) => { p.armR = "hoch"; huepfen(p, t, 0.8, 3); p.fx.push(fx("wurf", { map: K.PROPS.basketball })); });
  neu("Boxen", K1, (p, t) => { const k = takt(t, 4, 2); p.armL = p.armR = "vorne"; p.aR[0] = k ? 4 : 0; p.aL[0] = k ? 0 : -4; p.props.push(pr("boxR", "handR", -1, 0), pr("boxL", "handL", 1, 0)); p.augen = "wuetend"; p.dx = k ? 1 : -1; });
  neu("Karate", K1, (p, t) => { const k = takt(t, 2, 2); p.armR = k ? "raus" : "halb"; p.armL = k ? "halb" : "raus"; p.props.push(pr("stirnband", "kopf", 0, 3)); p.augen = "wuetend"; if (k) p.fx.push(fx("text", { txt: "HAI", x: 32, y: 14 })); });
  neu("Yoga-Baum", K1, (p, t) => { p.armL = p.armR = "hoch"; p.aL[0] = 1; p.aR[0] = -1; p.lift = [0, 0, 2, 2]; p.augen = "zu"; p.dreh = sin(t, 0.3) * 2; });
  neu("Meditieren", K1, (p, t) => { p.beine = "sitzen"; p.dy -= 4 + r(sin(t, 0.3) * 1.5); p.augen = "zu"; p.armL = p.armR = "raus"; p.fx.push(fx("aura", { farbe: "#f5d03b" })); });
  neu("Gewichtheben", K1, (p, t) => { p.armL = p.armR = "hoch"; p.props.push(pr("langhantel", "ueber", 0, 4)); zittern(p, t, 0.5); p.bh -= 1; p.fx.push(fx("schweiss")); p.mund = "zaehne"; });
  neu("Seitlich dehnen", K1, (p, t) => { const s = sin(t, 0.4); p.dreh = s * 18; p.armL = s > 0 ? "hoch" : "tief"; p.armR = s > 0 ? "tief" : "hoch"; p.augen = "zu"; });

  K1 = "Arbeit & Nerd";
  neu("Tippen", K1, (p, t) => { p.props.push(pr("laptop", "vorne", 0, 2)); p.armL = p.armR = "vorne"; p.aL[1] = -takt(t, 8, 2); p.aR[1] = -(1 - takt(t, 8, 2)); p.ey = 1; p.fx.push(fx("code")); });
  neu("Hacken", K1, (p, t) => { p.props.push(pr("laptop", "vorne", 0, 2), pr("sonnenbrille", "augen")); p.armL = p.armR = "vorne"; p.aL[1] = -takt(t, 10, 2); p.aR[1] = -(1 - takt(t, 10, 2)); p.fx.push(fx("matrix", { hinten: true })); });
  neu("Auf den Build warten", K1, (p, t) => { p.props.push(pr("laptop", "vorne", 0, 2)); p.armL = p.armR = "vorne"; p.lift[3] = takt(t, 3, 2); p.augen = "halb"; p.fx.push(fx("laden")); });
  neu("Bug gefunden", K1, (p, t) => { p.props.push(pr("lupe", "handR", 0, 2)); p.ey = 1; p.ex = 1; p.augen = "gross"; p.fx.push(fx("kaefer")); });
  neu("Code-Review", K1, (p, t) => { p.props.push(pr("block", "handL", 0, 1), pr("stift", "handR")); p.augen = "seitlich"; p.fx.push(fx(ph(t, 3) < 0.5 ? "frage" : "ausruf")); });
  neu("Deployen", K1, (p, t) => { const q = ph(t, 2); p.props.push(pr("knopf", "boden", 10, 0)); p.armR = "raus"; p.aR[1] = q < 0.2 ? 2 : 0; p.fx.push(fx("rakete")); p.augen = q > 0.3 ? "froh" : "gross"; });
  neu("Alles brennt", K1, (p, t) => { p.fx.push(fx("feuer", { hinten: true })); p.props.push(pr("kaffee", "handR")); p.armR = "halb"; p.augen = "froh"; p.mund = "laecheln"; p.fx.push(fx("text", { txt: "OK", y: 6 })); });
  neu("Kaffeepause", K1, (p, t) => { p.armR = "halb"; p.props.push(pr("kaffee", "handR", 0, 0)); p.fx.push(fx("dampf")); if (ph(t, 3) > 0.7) p.augen = "zu"; else blinzeln(p, t); });
  neu("Im Meeting", K1, (p, t) => { p.augen = ph(t, 4) > 0.6 ? "zu" : "halb"; p.dy -= takt(t, 1.5, 2); p.fx.push(fx(ph(t, 4) > 0.6 ? "zzz" : "punkte")); });
  neu("Präsentieren", K1, (p, t) => { p.props.push(pr("tafel", "boden", -22, 0, { ebene: "hinten" }), pr("zeiger", "handL", 0, -1)); p.dx = 7; p.armL = "raus"; p.aL[1] = -2; p.mund = takt(t, 3, 2) ? "offen" : "klein"; });
  neu("Notizen machen", K1, (p, t) => { p.props.push(pr("block", "handL", 0, 1), pr("stift", "handR", 0, r(sin(t, 3)))); p.ey = 1; p.fx.push(fx("notizen")); });
  neu("Dateien jonglieren", K1, (p, t) => { p.armL = takt(t, 4, 2) ? "halb" : "raus"; p.armR = takt(t, 4, 2) ? "raus" : "halb"; p.fx.push(fx("dateien")); p.augen = "gross"; });
  neu("Server streicheln", K1, (p, t) => { p.props.push(pr("server", "boden", 10, 0)); p.armR = "raus"; p.aR[1] = r(sin(t, 1)); p.fx.push(fx("herzen", { n: 1 })); p.augen = "froh"; });
  neu("Kabelsalat", K1, (p, t) => { p.fx.push(fx("kabel"), fx("frage")); p.augen = "spirale"; p.armL = p.armR = "vorne"; });
  neu("Hämmern", K1, (p, t) => { const k = takt(t, 3, 2); p.armR = k ? "halb" : "unten"; p.props.push(pr("hammer", "handR", 0, k ? -1 : 2)); if (!k) p.fx.push(fx("text", { txt: "TOK", x: 34, y: 20 })); p.augen = "wuetend"; });
  neu("Schrauben", K1, (p, t) => { p.props.push(pr("schluessel", "handR", 0, r(sin(t, 2)))); p.dreh = sin(t, 2) * 3; p.fx.push(fx("funkeln", { n: 2 })); p.mund = "zunge"; });
  neu("Malen", K1, (p, t) => { p.props.push(pr("staffelei", "boden", 8, 0, { ebene: "hinten" }), pr("pinsel", "handR", 0, r(sin(t, 1) * 2))); p.armR = "raus"; p.aR[1] = r(sin(t, 1) * 2); p.augen = "froh"; });
  neu("Forschen", K1, (p, t) => { gehen(p, t, 0.8); p.props.push(pr("lupe", "handR", 0, 2)); p.ey = 1; p.ex = 1; }, { laeuft: 3 });
  neu("Chemie", K1, (p, t) => { const q = ph(t, 3); p.props.push(Object.assign(pr("kolben", "handR"), { fps: 3 })); p.fx.push(fx("blasen")); if (q > 0.8) { p.fx.push(fx("knall", { x: 36, y: 22 })); p.augen = "x"; p.tint = { body: "#6b5a50", dark: "#4a3d36" }; } else p.augen = "gross"; });

  K1 = "Essen & Trinken";
  neu("Kaffee schlürfen", K1, (p, t) => { p.armR = "mund"; p.props.push(pr("kaffee", "handR", -2, 0)); p.augen = "zu"; p.fx.push(fx("dampf", { x: 26, y: 26 })); });
  neu("Tee trinken", K1, (p, t) => { p.armR = "halb"; p.props.push(pr("tee", "handR")); p.augen = "froh"; p.fx.push(fx("dampf")); });
  neu("Pizza essen", K1, (p, t) => { p.armR = "halb"; p.props.push(pr("pizza", "handR", -1, 0)); p.mund = takt(t, 4, 2) ? "klein" : "flach"; p.augen = "froh"; });
  neu("Burger mampfen", K1, (p, t) => { p.armL = p.armR = "vorne"; p.props.push(pr("burger", "vorne", 0, -1)); p.augen = "zu"; p.dy -= takt(t, 4, 2); });
  neu("Eis schlecken", K1, (p, t) => { p.armR = "halb"; p.props.push(pr("eis", "handR")); p.mund = takt(t, 3, 2) ? "zunge" : "klein"; p.augen = "froh"; });
  neu("Donut", K1, (p, t) => { p.armR = "halb"; p.props.push(pr("donut", "handR")); p.mund = "o"; p.augen = "herz"; });
  neu("Nudeln schlürfen", K1, (p, t) => { p.armL = p.armR = "vorne"; p.props.push(pr("schuessel", "vorne", 0, 4)); p.mund = "klein"; p.fx.push(fx("fn", { fn: (c, tt, rr) => { const h = r(4 + Math.sin(tt * 6) * 2); for (let k = 0; k < h; k++) K.px(c, rr.cx + (k % 2), rr.oben + 6 + k, "#f5d03b"); } })); p.augen = "zu"; });
  neu("Apfel knabbern", K1, (p, t) => { p.armR = "halb"; p.props.push(pr("apfel", "handR")); p.mund = takt(t, 5, 2) ? "zaehne" : "klein"; });
  neu("Popcorn", K1, (p, t) => { p.armL = "vorne"; p.props.push(pr("popcorn", "vorne", -3, 3)); p.armR = takt(t, 1.5, 2) ? "mund" : "unten"; p.fx.push(fx("fn", { fn: (c, tt, rr) => { if (Math.floor(tt * 4) % 3 === 0) K.px(c, rr.cx - 4 + Math.floor(K.rnd(Math.floor(tt * 4)) * 6), rr.oben + 4, "#f4f1e8"); } })); p.ey = -1; });
  neu("Kerzen auspusten", K1, (p, t) => { p.armL = p.armR = "vorne"; p.props.push(pr("kuchen", "vorne", 0, 5)); p.mund = "pfeifen"; p.bw += takt(t, 1, 2); p.fx.push(fx("rauch", { x: 24, y: 28 })); });
  neu("Grillen", K1, (p, t) => { p.props.push(pr("grill", "boden", 9, 0), pr("kelle", "handR", 0, r(sin(t, 1)))); p.fx.push(fx("rauch", { x: 38, y: 28 })); p.augen = "froh"; });
  neu("Kochen", K1, (p, t) => { p.props.push(pr("topf", "vorne", 0, 5), pr("kelle", "handR", -3 + r(sin(t, 1) * 2), 3)); p.armR = "vorne"; p.fx.push(fx("dampf", { x: 24, y: 28 })); p.mund = "pfeifen"; });
  neu("Vollgefuttert", K1, (p, t) => { p.bw += 3; p.bh += 1; p.augen = "zu"; p.mund = "laecheln"; p.dreh = sin(t, 0.4) * 4; p.armL = p.armR = "vorne"; });
  neu("Anstossen", K1, (p, t) => { p.armR = "hoch"; p.props.push(pr("glas", "handR", 0, -1)); p.augen = "froh"; p.mund = "breit"; p.fx.push(fx("funkeln", { n: 3 })); });

  K1 = "Gaming";
  neu("Zocken", K1, (p, t) => { p.armL = p.armR = "vorne"; p.props.push(pr("controller", "vorne", 0, 1)); p.augen = "gross"; zittern(p, t, 0.4); p.aL[1] = -takt(t, 6, 2); p.mund = "zunge"; });
  neu("Gewonnen", K1, (p, t) => { p.armL = p.armR = "hoch"; p.props.push(pr("pokal", "ueber", 0, 4)); huepfen(p, t, 1.5, 3); p.augen = "froh"; p.mund = "breit"; p.fx.push(fx("konfetti")); });
  neu("Rage Quit", K1, (p, t) => { const q = ph(t, 2.5); p.augen = "wuetend"; if (q < 0.5) { p.armL = p.armR = "vorne"; p.props.push(pr("controller", "vorne", 0, 1)); zittern(p, t, 1); } else { p.armR = "raus"; p.fx.push(fx("wurf", { map: K.PROPS.controller }), fx("wut")); p.mund = "gross"; } });
  neu("Rhythmusspiel", K1, (p, t) => { p.fx.push(fx("pfeile", { hinten: true })); const k = takt(t, 3, 4); p.armL = ["hoch", "raus", "tief", "raus"][k]; p.armR = ["tief", "raus", "hoch", "raus"][k]; wippen(p, t, 3); });
  neu("VR-Welt", K1, (p, t) => { p.props.push(pr("vrbrille", "augen")); p.armL = takt(t, 3, 2) ? "hoch" : "raus"; p.armR = takt(t, 3, 2) ? "raus" : "hoch"; p.dreh = sin(t, 0.8) * 8; p.mund = "o"; });
  neu("Speedrun", K1, (p, t) => { gehen(p, t, 4); p.dreh = 10 * v(p); p.fx.push(fx("uhr"), fx("tempo", { rechts: p.spiegel })); p.augen = "wuetend"; }, { laeuft: 18 });
  neu("Loot gefunden", K1, (p, t) => { const offen = ph(t, 3) > 0.35; p.props.push(pr(offen ? "truheOffen" : "truhe", "boden", 9, 0)); if (offen) { p.augen = "geld"; p.fx.push(fx("muenzen", { x: 38, y: 28 })); p.armL = p.armR = "hoch"; } else p.augen = "gross"; });
  neu("Level Up", K1, (p, t) => { p.fx.push(fx("strahlen", { hinten: true }), fx("lvup")); huepfen(p, t, 1, 2); p.augen = "stern"; p.armL = p.armR = "hoch"; });
  neu("Game Over", K1, (p, t) => { const q = ph(t, 3); p.augen = "x"; p.tint = { body: "#8b877d", dark: "#55524b" }; if (q > 0.2) liegen(p, 90); else p.dreh = (q / 0.2) * 90, p.pivot = "mitte"; p.fx.push(fx("text", { txt: "GAME OVER", y: 6, blink: true, farbe: "#d9443a" })); });
  neu("Respawn", K1, (p, t) => { const q = ph(t, 2.5); if (q < 0.3) { p.dy -= r(40 - (q / 0.3) * 40); p.lift = [1, 1, 1, 1]; } else if (q < 0.6) p.alpha = takt(t, 10, 2) ? 1 : 0.2; p.fx.push(fx("funkeln", { n: 2 })); });
  neu("Schwertkampf", K1, (p, t) => { const k = takt(t, 2.5, 2); p.armR = k ? "hoch" : "raus"; p.props.push(pr("schwert", "handR", -1, k ? 0 : 3)); p.fx.push(fx("bogen", { farbe: "#dfe4ea" })); p.augen = "wuetend"; });
  neu("Anfeuern", K1, (p, t) => { p.beine = "sitzen"; const k = takt(t, 3, 2); p.armL = k ? "hoch" : "halb"; p.armR = k ? "halb" : "hoch"; p.mund = "offen"; p.fx.push(fx("text", { txt: "GO GO", y: 8, blink: true })); });

  K1 = "Schlaf & Ruhe";
  neu("Einschlafen", K1, (p, t) => { const q = ph(t, 4); p.augen = q < 0.3 ? "offen" : q < 0.6 ? "halb" : "zu"; p.dreh = q > 0.6 ? (q - 0.6) * 25 : 0; p.dy += q > 0.6 && takt(t, 1, 2) ? 1 : 0; if (q > 0.7) p.fx.push(fx("zzz")); });
  neu("Schlafen", K1, (p, t) => { liegen(p); p.augen = "zu"; atmen(p, t); p.fx.push(fx("zzz")); });
  neu("Schnarchen", K1, (p, t) => { p.beine = "sitzen"; p.augen = "zu"; p.mund = "klein"; p.fx.push(fx("schnarchblase")); p.bh += sin(t, 0.4) > 0 ? 1 : 0; });
  neu("Träumen", K1, (p, t) => { liegen(p); p.augen = "zu"; p.mund = "laecheln"; p.fx.push(fx("traum")); });
  neu("Nickerchen im Sitzen", K1, (p, t) => { p.beine = "sitzen"; p.augen = "zu"; p.dreh = sin(t, 0.25) * 8; p.fx.push(fx("zzz")); });
  neu("Schlafwandeln", K1, (p, t) => { gehen(p, t, 0.7); p.augen = "zu"; p.armL = p.armR = "raus"; p.fx.push(fx("zzz")); }, { laeuft: 3 });
  neu("Aufwachen", K1, (p, t) => { const q = ph(t, 4); if (q < 0.4) { liegen(p); p.augen = "zu"; p.fx.push(fx("zzz")); } else if (q < 0.6) { p.augen = "gross"; p.fx.push(fx("ausruf")); p.dy -= 2; } else { p.armL = p.armR = "hoch"; p.mund = "gross"; p.augen = "zu"; } });
  neu("Im Bett", K1, (p, t) => { p.fx.push(fx("bett", { hinten: true }), fx("zzz")); liegen(p); p.dy -= 3; p.props.push(pr("decke", "vorne", 0, 1)); p.augen = "zu"; });
  neu("Hängematte", K1, (p, t) => { p.fx.push(fx("haengematte", { hinten: true })); liegen(p, 90 + sin(t, 0.4) * 6); p.dy -= 4; p.dx += r(sin(t, 0.4) * 2); p.augen = "zu"; p.mund = "laecheln"; });
  neu("Sonnenbaden", K1, (p, t) => { liegen(p); p.props.push(pr("sonnenbrille", "augen")); p.fx.push(fx("sonne")); p.mund = "laecheln"; });
  neu("Sterne gucken", K1, (p, t) => { p.beine = "sitzen"; p.ey = -1; p.fx.push(fx("sterne", { hinten: true }), fx("sternschnuppe")); blinzeln(p, t); });
  neu("Kuscheltier drücken", K1, (p, t) => { p.armL = p.armR = "vorne"; p.props.push(pr("teddy", "vorne", 0, 0)); p.rot = true; p.augen = "froh"; p.dreh = sin(t, 0.5) * 5; p.fx.push(fx("herzen", { n: 1 })); });

  K1 = "Wetter & Natur";
  neu("Im Regen stehen", K1, (p, t) => { p.fx.push(fx("regen")); p.augen = "traurig"; p.bh -= 1; p.armL = p.armR = "tief"; });
  neu("Regenschirm", K1, (p, t) => { p.fx.push(fx("regen")); p.armR = "halb"; p.props.push(pr("schirm", "handR", -6, 5)); p.augen = "froh"; p.mund = "pfeifen"; });
  neu("Schneeflocken fangen", K1, (p, t) => { p.fx.push(fx("schnee")); p.mund = "zunge"; p.ey = -1; huepfen(p, t, 0.8, 2); p.augen = "froh"; });
  neu("Schneeballschlacht", K1, (p, t) => { const q = ph(t, 1.6); p.fx.push(fx("schnee", { n: 6 })); if (q < 0.4) { p.armR = "hoch"; p.props.push(pr("schneeball", "handR")); } else { p.armR = "raus"; p.fx.push(fx("wurf", { map: K.PROPS.schneeball })); } p.augen = "froh"; });
  neu("Frieren", K1, (p, t) => { zittern(p, t, 1); p.tint = { body: "#9fb8d9", dark: "#7891b3" }; p.fx.push(fx("schnee")); p.augen = "zu"; p.mund = "zaehne"; p.armL = p.armR = "vorne"; });
  neu("Hitze", K1, (p, t) => { p.fx.push(fx("sonne"), fx("schweiss")); p.bh -= r(ph(t, 4) * 3); p.bw += r(ph(t, 4) * 2); p.augen = "halb"; p.mund = "zunge"; });
  neu("Gewitter", K1, (p, t) => { p.fx.push(fx("regen"), fx("blitz")); zittern(p, t, t % 2.2 < 0.4 ? 2 : 0.3); p.augen = "gross"; p.mund = "o"; });
  neu("Gegen den Wind", K1, (p, t) => { p.fx.push(fx("wind"), fx("blaetter")); gehen(p, t, 0.8); p.dreh = -12; p.armL = p.armR = "raus"; p.augen = "zu"; });
  neu("Laub rechen", K1, (p, t) => { p.props.push(pr("rechen", "griffR", r(sin(t, 0.8) * 3), 0)); p.aR[0] = r(sin(t, 0.8) * 2); p.fx.push(fx("blaetter")); p.mund = "pfeifen"; });
  neu("Schmetterling jagen", K1, (p, t) => { gehen(p, t, 1.5); p.dx = r(Math.sin(t * 0.9 * TAU / (TAU)) * 10); p.spiegel = Math.cos(t * 0.9) < 0; p.ey = -1; p.augen = "froh"; p.armR = "hoch"; p.fx.push(fx("schmetterling")); });
  neu("An Blume riechen", K1, (p, t) => { p.armR = "mund"; p.props.push(pr("blume", "handR", -1, -1)); p.augen = "zu"; p.fx.push(fx("herzen", { n: 1 })); p.bh += sin(t, 0.4) > 0.3 ? 1 : 0; });
  neu("Vogel auf dem Kopf", K1, (p, t) => { p.fx.push(fx("vogel", { landen: true })); p.ey = -1; p.augen = ph(t, 4) > 0.5 ? "gross" : "offen"; });
  neu("Katze streicheln", K1, (p, t) => { p.props.push(pr("katze", "boden", 8, 0)); p.armR = "raus"; p.aR[1] = 2 + r(sin(t, 1)); p.fx.push(fx("herzen", { n: 1 })); p.augen = "froh"; });

  K1 = "Magie & Glitch";
  neu("Zaubern", K1, (p, t) => { p.armR = takt(t, 2, 2) ? "hoch" : "raus"; p.props.push(pr("zauberstab", "handR")); p.fx.push(fx("funkeln"), fx("bogen")); p.augen = "stern"; });
  neu("Schweben", K1, (p, t) => { p.dy -= 8 + r(sin(t, 0.5) * 2); p.augen = "zu"; p.lift = [1, 1, 1, 1]; p.fx.push(fx("aura", { farbe: "#9b61d3" })); });
  neu("Unsichtbar werden", K1, (p, t) => { p.alpha = 0.1 + 0.9 * Math.abs(sin(t, 0.25)); p.augen = "froh"; });
  neu("Glitch", K1, (p, t) => { p.glitch = 0.4; p.fx.push(fx("glitchlinien")); p.augen = K.AUGEN[Math.floor(K.rnd(Math.floor(t * 4)) * 8)]; });
  neu("Pixel zerfallen", K1, (p, t) => { const q = ph(t, 3.5); const a = q < 0.3 ? 0 : q < 0.5 ? (q - 0.3) / 0.2 : q < 0.7 ? 1 - (q - 0.5) / 0.2 : 0; if (a > 0) { p.ohneFigur = true; p.fx.push(fx("pixelstaub", { q: a })); } });
  neu("Wachsen und Schrumpfen", K1, (p, t) => { p.skala = 1 + sin(t, 0.35) * 0.4; p.augen = p.skala > 1.2 ? "gross" : p.skala < 0.8 ? "punkt" : "offen"; });
  neu("Klonen", K1, (p, t) => { p.klon = r(sin(t, 0.4) * 12); p.augen = "froh"; p.fx.push(fx("funkeln", { n: 2 })); });
  neu("Kristallkugel", K1, (p, t) => { p.armL = p.armR = "vorne"; p.props.push(pr("kugel", "vorne", 0, 2)); p.augen = "spirale"; p.fx.push(fx("funkeln", { n: 3 })); });
  neu("Feuerball", K1, (p, t) => { p.armR = "raus"; p.fx.push(fx("feuerball")); p.augen = "wuetend"; p.mund = "zaehne"; });
  neu("Durchs Portal", K1, (p, t) => { const q = ph(t, 3); p.fx.push(fx("portal", { x: 38, y: 27, hinten: true })); gehen(p, t, 1.5); p.dx = r(-14 + q * 40); p.alpha = p.dx > 8 ? Math.max(0, 1 - (p.dx - 8) / 8) : 1; });
  neu("Matrix", K1, (p, t) => { p.fx.push(fx("matrix", { hinten: true })); p.props.push(pr("sonnenbrille", "augen")); p.dreh = ph(t, 3) > 0.6 ? -40 : 0; p.pivot = "fuesse"; });
  neu("Regenbogen-Aura", K1, (p, t) => { p.fx.push(fx("regenbogen")); p.augen = "froh"; wippen(p, t, 1); });

  K1 = "Im Gespräch";
  neu("Zuhören", K1, (p, t) => { p.fx.push(fx("schall")); p.dreh = 6; p.augen = "gross"; p.ex = 1; blinzeln(p, t); });
  neu("Antwort überlegen", K1, (p, t) => { p.ey = -1; p.ex = 1; p.fx.push(fx("laden")); p.mund = "schief"; });
  neu("Reden", K1, (p, t) => { p.mund = ["offen", "klein", "o", "flach"][takt(t, 6, 4)]; p.fx.push(fx("schall", { aus: true })); p.armR = takt(t, 1.5, 2) ? "halb" : "unten"; blinzeln(p, t); });
  neu("Mit Händen erklären", K1, (p, t) => { const k = takt(t, 2.5, 4); p.armL = ["raus", "halb", "unten", "halb"][k]; p.armR = ["halb", "raus", "halb", "unten"][k]; p.mund = takt(t, 5, 2) ? "offen" : "klein"; });
  neu("Nicken", K1, (p, t) => { const k = takt(t, 3, 2); p.dy -= k; p.ey = k; p.augen = "froh"; p.mund = "laecheln"; });
  neu("Kopfschütteln", K1, (p, t) => { const k = takt(t, 5, 2); p.ex = k ? 1 : -1; p.dreh = k ? 5 : -5; p.mund = "flach"; });
  neu("Daumen hoch", K1, (p, t) => { p.armR = "hoch"; p.props.push(pr("daumen", "handR", -2, -2)); p.augen = "zwinker"; p.mund = "breit"; });
  neu("Flüstern", K1, (p, t) => { p.armR = "mund"; p.aR[0] = 2; p.dreh = 5; p.fx.push(fx("text", { txt: "PSST", x: 32, y: 16 })); p.augen = "seitlich"; });
  neu("Laden", K1, (p, t) => { p.fx.push(fx("laden")); p.augen = "punkt"; atmen(p, t); });
  neu("Fehler 404", K1, (p, t) => { p.augen = "x"; p.glitch = 0.15; p.fx.push(fx("text", { txt: "404", farbe: "#d9443a", blink: true })); p.mund = "flach"; });

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
