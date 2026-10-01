(() => {
  const K = window.K;
  const S = 4;
  const HALB = 9 * S;
  const MITTE = 8 * S;
  const KOPFRAUM = 76;
  const HUEPF = 90;
  const GEHEN = 55;
  const KLETTERN = 65;
  const SCHWERKRAFT = 2200;
  const LUFT = 0.00035;
  const ABPRALL_RAND = 0.45;
  const ABPRALL_BODEN = 0.3;
  const ABPRALL_MIN = 320;
  const REIBUNG = 1800;
  const RUTSCH_MIN = 60;
  const LIEGEN_AB = 35;
  const KIPPZEIT = 0.2;
  const LIEGEZEIT = 2;
  const AUFSTEHZEIT = 0.35;
  const WURF_MAX = 3200;
  const STABIL = 3;
  const KLETTERPLATZ = 52;
  const EILIG = 220;
  const FLUGTEMPO = 170;
  const FLUG = new Set(["Propellerflug", "Ballonfahrt", "Schirmflug", "Schweben"]);
  const TELEPORT = new Set(["Teleportieren", "Durchs Portal"]);
  const ORTSGEBUNDEN = new Set(["Schwimmen"]);
  const WASSER = new Set(["Schwimmen", "Tauchen", "Surfen"]);
  const FUELLZEIT = 4;
  const STRAHL_TEMPO = 2400;
  const LEERZEIT = 3;

  const W = (K.WELT = { S, HALB, MITTE, WASSER });

  K.INTERN = {};
  const intern = (n, f, x) => { K.INTERN[n] = Object.assign({ n, c: "Intern", f, id: "i-" + n }, x || {}); };
  const takt = (t, fps, n) => Math.floor(t * fps) % n;
  intern("Wand klettern", (p, t) => {
    const k = takt(t, 5, 4);
    p.lift = k === 1 ? [2, 0, 0, 2] : k === 3 ? [0, 2, 2, 0] : [0, 0, 0, 0];
    p.armL = k < 2 ? "oben" : "halb";
    p.armR = k < 2 ? "halb" : "oben";
    p.dy -= k % 2;
    p.ey = -1;
  });
  intern("An der Wand", (p, t) => {
    p.armL = p.armR = "halb";
    if (Math.sin(t * 0.3 * Math.PI * 2) > 0.55) p.bh += 1;
    if ((t % 3.3) / 3.3 > 0.95) p.augen = "zu";
  });
  intern("Fallen", (p, t) => {
    const k = takt(t, 10, 2);
    p.armL = k ? "oben" : "hoch";
    p.armR = k ? "hoch" : "oben";
    p.augen = "gross";
    p.mund = "o";
    p.lift = k ? [1, 2, 1, 2] : [2, 1, 2, 1];
    p.bh += 1;
    p.bw -= 1;
  });
  intern("Aufsteigen", (p, t) => { p.armL = p.armR = "oben"; p.lift = [1, 1, 1, 1]; p.bh -= 1; p.bw += 1; p.mund = "laecheln"; });
  const neutral = (p, t) => { if ((t % 3.3) / 3.3 > 0.94) p.augen = "zu"; };
  intern("Gehalten", (p, t) => {
    const k = takt(t, 2, 2);
    p.armL = p.armR = "oben";
    p.lift = k ? [1, 0, 1, 0] : [0, 1, 0, 1];
    p.bh += 1;
    neutral(p, t);
  });
  intern("Wurf", (p, t) => {
    p.armL = p.armR = "oben";
    p.lift = [1, 1, 1, 1];
    neutral(p, t);
  });
  intern("Rutschen", (p, t) => {
    p.armL = p.armR = "raus";
    p.bh -= 1;
    p.bw += 1;
    neutral(p, t);
  });
  intern("Liegen", (p, t) => {
    p.armL = p.armR = "halb";
    neutral(p, t);
  });

  const KONTEXT = {
    terminal: ["Tippen", "Code-Review", "Hacken", "Auf den Build warten", "Kaffeepause", "Bug gefunden", "Notizen machen", "Deployen", "Nachdenken", "Warten und tippen", "Idee", "Alles brennt", "Kabelsalat", "Server streicheln"],
    browser: ["Handy scrollen", "Zeitung lesen", "Kaffee schlürfen", "Nachdenken", "Tee trinken", "Notizen machen", "Idee", "Kristallkugel", "Hinsetzen", "Selfie"],
    video: ["Popcorn", "Lachen", "Hinsetzen", "Kichern", "Pizza essen", "Donut", "Eis schlecken", "Überrascht", "Vollgefuttert"],
    dateien: ["Dateien jonglieren", "Fegen", "Notizen machen", "Wischen", "Schrauben", "Hämmern", "Am Kopf kratzen"],
    musik: ["Musik hören", "Headbangen", "Wackeltanz", "Gitarre spielen", "Disco", "Auflegen", "Robotertanz", "Singen", "Floss", "Klavier", "Dirigieren", "Trompete", "Breakdance", "Geige", "Cello", "Kontrabass", "E-Bass", "E-Gitarre", "Ukulele", "Banjo", "Harfe", "Querflöte", "Blockflöte", "Saxofon", "Posaune", "Tuba", "Waldhorn", "Klarinette", "Mundharmonika", "Akkordeon", "Dudelsack", "Xylofon", "Triangel", "Tamburin", "Maracas", "Bongos", "Pauke", "Becken", "Keytar", "Synthesizer", "Theremin", "Gong", "Alphorn", "Drumset"],
    chat: ["Kichern", "Handy scrollen", "Lachen", "Selfie", "Hinsetzen", "Winken", "Verlegen"],
    spiel: ["Anfeuern", "Zocken", "Gewonnen", "Loot gefunden", "Level Up", "Rhythmusspiel", "Schwertkampf", "Respawn"],
    "boden:morgen": ["Strecken", "Kaffee schlürfen", "Gähnen", "Zeitung lesen", "Yoga-Baum", "Tee trinken", "Blumen giessen", "Seitlich dehnen", "Meditieren", "Handy scrollen"],
    "boden:mittag": ["Kochen", "Pizza essen", "Apfel knabbern", "Burger mampfen", "Nudeln schlürfen", "Grillen", "Eis schlecken", "Vollgefuttert", "Hinsetzen"],
    "boden:nachmittag": ["Jonglieren", "Hanteln stemmen", "Fussball kicken", "Malen", "Seilspringen", "An Blume riechen", "Basketball werfen", "Hämmern", "Kniebeugen", "Schmetterling jagen", "Dribbeln", "Chemie", "Boxen", "Katze streicheln", "Rad schlagen", "Laub rechen", "Handstand", "Karate", "Schrauben", "Hampelmann"],
    "boden:abend": ["Musik hören", "Popcorn", "Gitarre spielen", "Zocken", "Sterne gucken", "Tee trinken", "Wackeltanz", "Zaubern", "Hängematte", "Kristallkugel", "Kuscheltier drücken", "Gähnen", "Ukulele", "Mundharmonika", "Banjo", "Geige", "Akkordeon", "Alphorn"],
    ruhe: ["Rumstehen", "Umschauen", "Hinsetzen", "Hände in die Hüften", "Rumstehen", "Am Kopf kratzen", "Hinsetzen", "Umschauen"],
    boden: ["Hinsetzen", "Umschauen", "Strecken", "Kaffeepause", "Sterne gucken", "Rumstehen"],
    nacht: ["Schlafen", "Schnarchen", "Träumen"]
  };
  const tageszeit = (stunde) => (stunde < 11 ? "morgen" : stunde < 14 ? "mittag" : stunde < 18 ? "nachmittag" : "abend");
  const AKTIV_DAUER = 40;
  const RUHE_DAUER = 12;
  const AKTIV_ABSTAND = 540;

  W.kontextVon = (f) => {
    if (!f) return "boden";
    const c = (f.cls || "").toLowerCase(), ti = (f.titel || "").toLowerCase();
    if (/kitty|foot|alacritty|wezterm|ghostty|terminal|code|zed|nvim/.test(c)) return "terminal";
    if (/vivaldi|firefox|chrom|zen|brave/.test(c)) return /youtube|twitch|jellyfin|netflix|crunchyroll/.test(ti) ? "video" : "browser";
    if (/nautilus|thunar|dolphin|nemo/.test(c)) return "dateien";
    if (/spotify|music/.test(c)) return "musik";
    if (/discord|vesktop|telegram|signal/.test(c)) return "chat";
    if (/steam|game|\.exe/.test(c)) return "spiel";
    return "browser";
  };

  W.neu = (x, y) => ({
    x, y, modus: "fallen", vy: 0, flaeche: null, wand: null, richtung: 1, plan: [], anim: "Fallen", aktivBis: 0,
    besucht: {}, zyklus: {}, geometrie: {}, fokus: null, fokusSeit: 0, fokusBesucht: null, fallStart: y, zeit: 0, erlaubt: null, aktivAb: 120
  });

  const monitorVon = (umg, x, y) => umg.monitore.find((m) => x >= m.x && x < m.x + m.w && (y === undefined || (y >= m.y - 400 && y <= m.y + m.h + 400))) || null;

  W.flaechen = (z, umg) => {
    const jetzt = z.zeit;
    const aktiveWs = new Set(umg.monitore.map((m) => m.ws));
    const stabil = [];
    const neuGeo = {};
    for (const f of umg.fenster) {
      if (!aktiveWs.has(f.ws)) continue;
      const key = [f.x, f.y, f.w, f.h].join(",");
      const alt = z.geometrie[f.addr];
      const seit = alt && alt.key === key ? alt.seit : jetzt;
      neuGeo[f.addr] = { key, seit };
      if (jetzt - seit >= STABIL) stabil.push(f);
    }
    z.geometrie = neuGeo;
    const plattformen = [], waende = [];
    for (const m of umg.monitore) {
      const r = m.reserved || [0, 0, 0, 0];
      plattformen.push({ id: "boden:" + m.name, x1: m.x, x2: m.x + m.w, y: m.y + m.h - r[3], art: "boden", mon: m });
    }
    for (const f of stabil) {
      const m = monitorVon(umg, f.x + f.w / 2, f.y + f.h / 2);
      const oben = m ? m.y + ((m.reserved || [])[1] || 0) : f.y - KOPFRAUM;
      if (f.y - oben >= KOPFRAUM) plattformen.push({ id: "dach:" + f.addr, x1: f.x, x2: f.x + f.w, y: f.y, art: "dach", fenster: f });
      if (!m || f.x - m.x >= KLETTERPLATZ) waende.push({ id: "wl:" + f.addr, x: f.x, y1: f.y, y2: f.y + f.h, seite: "links", fenster: f, dach: "dach:" + f.addr });
      if (!m || m.x + m.w - (f.x + f.w) >= KLETTERPLATZ) waende.push({ id: "wr:" + f.addr, x: f.x + f.w, y1: f.y, y2: f.y + f.h, seite: "rechts", fenster: f, dach: "dach:" + f.addr });
    }
    for (const a of umg.monitore) for (const b of umg.monitore) {
      if (a === b || a.x + a.w !== b.x) continue;
      const fa = a.y + a.h, fb = b.y + b.h;
      if (fa === fb) continue;
      const tiefLinks = fa > fb;
      waende.push({ id: "stufe:" + a.name + ":" + b.name, x: b.x, y1: Math.min(fa, fb), y2: Math.max(fa, fb), seite: tiefLinks ? "links" : "rechts", dach: "boden:" + (tiefLinks ? b.name : a.name), stufe: true });
    }
    const bid = z.buehne || (z.flaeche && z.flaeche.startsWith("innen:") ? z.flaeche.slice(6) : null);
    const bf = bid && umg.fenster.find((f) => f.addr === bid && aktiveWs.has(f.ws));
    if (bf && bf.w >= 4 * HALB) {
      const m = monitorVon(umg, bf.x + bf.w / 2, bf.y + bf.h - 4);
      const boden = m ? m.y + m.h - ((m.reserved || [])[3] || 0) : bf.y + bf.h;
      plattformen.push({ id: "innen:" + bf.addr, x1: bf.x + 4, x2: bf.x + bf.w - 4, y: Math.min(bf.y + bf.h, boden) - 3, art: "innen", fenster: bf, mon: m });
    }
    const nachId = {};
    for (const p of plattformen) nachId[p.id] = p;
    for (const w of waende) nachId[w.id] = w;
    return { plattformen, waende, nachId };
  };

  const unterhalb = (fl, x, y) => {
    let best = null;
    for (const p of fl.plattformen) if (p.art !== "innen" && x >= p.x1 && x <= p.x2 && p.y >= y && (!best || p.y < best.y)) best = p;
    return best;
  };
  W.unterhalb = unterhalb;

  const standX = (w) => (w.seite === "links" ? w.x - HALB : w.x + HALB);

  const kanten = (fl, knoten, x) => {
    const aus = [];
    if (knoten.startsWith("p:")) {
      const P = fl.nachId[knoten.slice(2)];
      if (!P) return aus;
      for (const w of fl.waende) {
        const sx = standX(w);
        if (sx < P.x1 || sx > P.x2) continue;
        if (!(w.y1 < P.y - 40 && w.y2 >= P.y - HUEPF && w.y2 <= P.y + 400)) continue;
        aus.push({ nach: "w:" + w.id, kosten: Math.abs(x - sx) + 60, schritte: [{ typ: "gehen", x: sx }, { typ: "anwand", wand: w.id }] });
      }
      for (const w of fl.waende) {
        if (Math.abs(w.y1 - P.y) > 12) continue;
        const ende = w.seite === "links" ? P.x1 : P.x2;
        if (Math.abs(w.x - ende) > 12) continue;
        aus.push({ nach: "w:" + w.id, kosten: Math.abs(x - ende) + 50, schritte: [{ typ: "gehen", x: w.seite === "links" ? P.x1 + 4 : P.x2 - 4 }, { typ: "anwandOben", wand: w.id }], landeX: standX(w) });
      }
      for (const seite of [-1, 1]) {
        const ex = seite < 0 ? P.x1 - HALB : P.x2 + HALB;
        const Q = unterhalb(fl, ex, P.y + 2);
        const tiefe = Q ? Q.y - P.y : 0;
        if (Q && Q.id !== P.id) aus.push({ nach: "p:" + Q.id, kosten: Math.abs(x - (seite < 0 ? P.x1 : P.x2)) + 40 + tiefe * (tiefe > 320 ? 1.4 : 0.3), schritte: [{ typ: "gehen", x: seite < 0 ? P.x1 + 4 : P.x2 - 4 }, { typ: "fallen", richtung: seite }], landeX: ex });
      }
    } else {
      const w = fl.nachId[knoten.slice(2)];
      if (!w) return aus;
      const I = fl.nachId["innen:" + w.id.slice(3)];
      if (I && (w.id.startsWith("wl:") || w.id.startsWith("wr:"))) aus.push({ nach: "p:" + I.id, kosten: 10, schritte: [{ typ: "klettern", y: w.y2 - MITTE }, { typ: "aufsteigen", zu: I.id }], landeX: w.seite === "links" ? w.x + HALB : w.x - HALB });
      const T = fl.nachId[w.dach];
      if (T && T.x1 <= w.x + HALB && T.x2 >= w.x - HALB) aus.push({ nach: "p:" + T.id, kosten: (w.y2 - w.y1) * 0.8 + 20, schritte: [{ typ: "klettern", y: w.y1 + 6 }, { typ: "aufsteigen", zu: T.id }], landeX: w.seite === "links" ? w.x + HALB : w.x - HALB });
      const B = unterhalb(fl, standX(w), w.y2 - HUEPF);
      if (B && B.y - w.y2 <= HUEPF) aus.push({ nach: "p:" + B.id, kosten: (w.y2 - w.y1) * 0.4 + 20, schritte: [{ typ: "klettern", y: w.y2 - MITTE }, { typ: "absteigen", zu: B.id }], landeX: standX(w) });
      const Q = unterhalb(fl, standX(w), (w.y1 + w.y2) / 2);
      if (Q && (!B || Q.id !== B.id)) aus.push({ nach: "p:" + Q.id, kosten: 80 + (Q.y - w.y1) * 1.4, schritte: [{ typ: "loslassen" }], landeX: standX(w) });
    }
    return aus;
  };

  W.weg = (fl, start, x, ziel) => {
    const dist = { [start]: 0 }, vorher = {}, xs = { [start]: x };
    const offen = [start];
    const fertig = new Set();
    while (offen.length) {
      offen.sort((a, b) => dist[a] - dist[b]);
      const k = offen.shift();
      if (fertig.has(k)) continue;
      fertig.add(k);
      if (k === ziel) break;
      for (const e of kanten(fl, k, xs[k])) {
        const d = dist[k] + e.kosten;
        if (dist[e.nach] === undefined || d < dist[e.nach]) {
          dist[e.nach] = d;
          vorher[e.nach] = { von: k, e };
          xs[e.nach] = e.landeX !== undefined ? e.landeX : xs[k];
          offen.push(e.nach);
        }
      }
    }
    if (dist[ziel] === undefined) return null;
    const schritte = [];
    let k = ziel;
    while (k !== start) {
      const v = vorher[k];
      schritte.unshift(...v.e.schritte);
      k = v.von;
    }
    return schritte;
  };

  const erlaubt = (z, name) => !z.erlaubt || z.erlaubt.has(name);

  const naechsteTaetigkeit = (z, kontext) => {
    const liste = (KONTEXT[kontext] || KONTEXT.boden).filter((n) => erlaubt(z, n) && K.BEWEGUNGEN.some((b) => b.n === n && !b.laeuft));
    if (!liste.length) return "Rumstehen";
    const i = (z.zyklus[kontext] || 0) % liste.length;
    z.zyklus[kontext] = i + 1;
    return liste[i];
  };

  const aktivitaeten = (z, kontext, n, dauer) => {
    const aus = [];
    for (let i = 0; i < n; i++) {
      const name = naechsteTaetigkeit(z, kontext);
      if (aus.length && aus[aus.length - 1].name === name) break;
      aus.push({ typ: "taetigkeit", name, dauer });
    }
    return aus;
  };

  const halt = (z, kontext) => {
    if (z.zeit < z.aktivAb) return aktivitaeten(z, "ruhe", 2, RUHE_DAUER);
    z.aktivAb = z.zeit + AKTIV_ABSTAND + ((z.zyklus.aktiv = (z.zyklus.aktiv || 0) + 1) % 3) * 60;
    return aktivitaeten(z, kontext, 1, AKTIV_DAUER);
  };

  const runterVonWand = (z, fl) => {
    const wege = kanten(fl, "w:" + z.wand, z.x).map((e) => ({ e, P: fl.nachId[e.nach.slice(2)] })).filter((x) => x.P);
    if (!wege.length) return [{ typ: "loslassen" }];
    wege.sort((a, b) => Math.abs(a.P.y - z.y) - Math.abs(b.P.y - z.y));
    return wege[0].e.schritte.map((x) => Object.assign({}, x));
  };

  const knotenJetzt = (z) => (z.modus === "klettern" || z.modus === "haengen" ? "w:" + z.wand : "p:" + z.flaeche);

  const klemmen = (x, P) => Math.max(P.x1 + HALB, Math.min(P.x2 - HALB, x));

  W.zielVon = (z, fl, umg, ort) => {
    const o = ort.toLowerCase().trim();
    const mons = umg.monitore;
    if (!o || !mons.length) return null;
    const inn = o.match(/^innen:(\S+)@(-?[\d.]+)$/);
    if (inn) {
      const P = fl.nachId["innen:" + inn[1]];
      return P ? { knoten: "p:" + P.id, x: klemmen(+inn[2], P) } : null;
    }
    const koord = o.match(/^(-?\d+),(-?\d+)$/);
    if (koord) {
      const P = unterhalb(fl, +koord[1], +koord[2] - 1);
      return P ? { knoten: "p:" + P.id, x: klemmen(+koord[1], P) } : null;
    }
    const alle = umg.alleMonitore || mons;
    const haupt = alle.reduce((a, b) => (b.w > a.w ? b : a));
    const verfuegbar = (x) => (x && mons.find((y) => y.name === x.name)) || null;
    let m = null;
    if (/^(haupt|gross|breit|main)/.test(o)) m = verfuegbar(haupt) || mons[0];
    else if (/^(zweit|neben|hoch|second|klein)/.test(o)) m = verfuegbar(alle.find((x) => x.name !== haupt.name)) || mons[0];
    else if (o === "links") m = mons.reduce((a, b) => (b.x < a.x ? b : a));
    else if (o === "rechts") m = mons.reduce((a, b) => (b.x + b.w > a.x + a.w ? b : a));
    else m = mons.find((x) => x.name.toLowerCase() === o) || null;
    if (m) {
      const P = fl.nachId["boden:" + m.name];
      return P ? { knoten: "p:" + P.id, x: (P.x1 + P.x2) / 2 } : null;
    }
    const aktiv = new Set(mons.map((x) => x.ws));
    const sichtbar = umg.fenster.filter((f) => aktiv.has(f.ws));
    const f = o === "fokus" ? sichtbar.find((x) => x.addr === umg.fokus) : sichtbar.find((x) => (x.cls || "").toLowerCase().includes(o)) || sichtbar.find((x) => (x.titel || "").toLowerCase().includes(o));
    if (!f) return null;
    const dach = fl.nachId["dach:" + f.addr];
    if (dach) return { knoten: "p:" + dach.id, x: klemmen(dach.x1 + (dach.x2 - dach.x1) * 0.5, dach) };
    const P = unterhalb(fl, f.x + f.w / 2, f.y + f.h - 2);
    return P ? { knoten: "p:" + P.id, x: klemmen(f.x + f.w / 2, P) } : null;
  };

  const standardGang = (z) => (erlaubt(z, "Rennen") ? "Rennen" : "Spazieren");

  const befehlDauer = (a, dauer) => dauer || (!a ? 4 : WASSER.has(a.n) ? 30 : /Gefühle|Gespräch/.test(a.c) ? 5 : /Schlaf/.test(a.c) ? 90 : a.laeuft !== undefined ? 20 : 25);

  const hinweg = (z, fl, ziel, g, tempo, rueck) => {
    const start = knotenJetzt(z);
    const weg = ziel.knoten === start ? [] : W.weg(fl, start, z.x, ziel.knoten);
    if (!weg) return erlaubt(z, "Schweben") ? [{ typ: "fliegen", zu: ziel.knoten, x: ziel.x, anim: "Schweben" }] : null;
    for (const s of weg) {
      if (s.typ === "gehen") Object.assign(s, { anim: g, tempo, rueck });
      if (s.typ === "klettern") s.tempo = KLETTERN * 2;
    }
    return weg.concat([{ typ: "gehen", x: ziel.x, anim: g, tempo, rueck }]);
  };

  W.zweitMonitor = (umg) => {
    const alle = umg.alleMonitore || umg.monitore;
    if (alle.length < 2) return null;
    const haupt = alle.reduce((a, b) => (b.w > a.w ? b : a));
    const zweit = alle.find((x) => x.name !== haupt.name);
    return (zweit && umg.monitore.find((x) => x.name === zweit.name)) || null;
  };

  W.wasserRand = (umg, m) => {
    const boden = m.y + m.h - ((m.reserved || [])[3] || 0);
    let rand = null;
    for (const n of umg.alleMonitore || umg.monitore) {
      if (n.name === m.name) continue;
      if (n.x + n.w !== m.x && m.x + m.w !== n.x) continue;
      if (n.y >= m.y + m.h || n.y + n.h <= m.y) continue;
      const nb = n.y + n.h - ((n.reserved || [])[3] || 0);
      if (nb < boden - 40 && nb > m.y + 100) rand = rand === null ? nb : Math.max(rand, nb);
    }
    return rand !== null ? rand : boden - Math.min(360, m.h * 0.25);
  };

  const oberflaecheVon = (w) => w.boden - w.pegel * (w.boden - w.rand);
  W.oberflaecheVon = oberflaecheVon;

  const wasserPlan = (z, fl, umg, a, dauer) => {
    const m = W.zweitMonitor(umg);
    const P = m && fl.nachId["boden:" + m.name];
    if (!P) return erlaubt(z, "Schulterzucken") ? [{ typ: "taetigkeit", name: "Schulterzucken", dauer: 3 }] : [];
    const weg = hinweg(z, fl, { knoten: "p:" + P.id, x: klemmen(P.x1 + (P.x2 - P.x1) * 0.35, P) }, standardGang(z), EILIG, false) || [];
    return weg.concat([{ typ: "fluten", mon: m.name }, { typ: "baden", name: a.n, dauer, mon: m.name }, { typ: "ablassen" }]);
  };

  W.befehlPlan = (z, fl, umg, b) => {
    const a = b.anim;
    if (a && WASSER.has(a.n)) {
      const plan = wasserPlan(z, fl, umg, a, befehlDauer(a, b.dauer));
      for (const s of plan) s.befehl = true;
      return plan;
    }
    const bewegt = !!a && a.laeuft !== undefined;
    const gang = bewegt && !FLUG.has(a.n) && !ORTSGEBUNDEN.has(a.n);
    const pendeln = bewegt ? Math.max(30, Math.abs(a.laeuft) * 8) : 0;
    const dauer = befehlDauer(a, b.dauer);
    const plan = [];
    const ziel = b.ort ? W.zielVon(z, fl, umg, b.ort) : null;
    if (ziel) {
      const start = knotenJetzt(z);
      if (a && TELEPORT.has(a.n)) {
        plan.push({ typ: "taetigkeit", name: a.n, dauer: 1.2 }, { typ: "teleport", zu: ziel.knoten, x: ziel.x }, { typ: "taetigkeit", name: a.n, dauer: 1.2 });
      } else if (a && FLUG.has(a.n)) {
        plan.push({ typ: "fliegen", zu: ziel.knoten, x: ziel.x, anim: a.n });
      } else {
        const weg = gang ? hinweg(z, fl, ziel, a.n, Math.max(30, Math.abs(a.laeuft) * 8), a.laeuft < 0) : hinweg(z, fl, ziel, standardGang(z), EILIG, false);
        if (weg) plan.push(...weg);
      }
      if (!a) plan.push({ typ: "taetigkeit", name: "Rumstehen", dauer });
      else if (!gang && !TELEPORT.has(a.n) && !FLUG.has(a.n)) plan.push({ typ: "taetigkeit", name: a.n, dauer, pendeln, rueck: bewegt && a.laeuft < 0 });
      else if (b.dauer) plan.push({ typ: "taetigkeit", name: a.n, dauer, pendeln, rueck: bewegt && a.laeuft < 0 });
    } else if (a) {
      plan.push({ typ: "taetigkeit", name: a.n, dauer, pendeln, rueck: bewegt && a.laeuft < 0 });
    }
    for (const s of plan) s.befehl = true;
    return plan;
  };

  W.befehl = (z, name, ort, dauer, neu) => {
    const a = name ? K.BEWEGUNGEN.find((b) => b.n.toLowerCase() === name.toLowerCase()) : null;
    if (name && !a) return "unbekannt: " + name;
    if (!a && !ort) return "leer";
    if (neu && a && !ort && /Gefühle|Gespräch/.test(a.c) && W.befehlAktiv(z)) {
      z.einschub = { name: a.n, dauer: befehlDauer(a, dauer), bis: null };
      return "ok";
    }
    if (neu || !z.befehle) {
      z.befehle = [];
      z.plan = z.plan.filter((s) => !s.befehl);
      if (neu && z.modus !== "fallen" && z.modus !== "gehalten") z.plan = [];
    }
    z.befehle.push({ anim: a, ort: ort || "", dauer: dauer || 0 });
    return "ok";
  };

  W.befehlAktiv = (z) => !!(z && (z.einschub || z.wasser || (z.befehle && z.befehle.length) || z.plan.some((s) => s.befehl)));

  W.planen = (z, fl, umg) => {
    const nacht = umg.stunde >= 23 || umg.stunde < 7;
    const start = knotenJetzt(z);
    const versuche = [];
    if (nacht) {
      const m = monitorVon(umg, z.x) || umg.monitore[0];
      versuche.push({ knoten: "p:boden:" + m.name, x: m.x + m.w - 220, danach: [{ typ: "taetigkeit", name: naechsteTaetigkeit(z, "nacht"), dauer: 900 }] });
    }
    const fok = umg.fenster.find((f) => f.addr === umg.fokus);
    if (!nacht && fok && z.fokusBesucht !== fok.addr && z.zeit - z.fokusSeit > 4) {
      const kontext = W.kontextVon(fok);
      const dach = fl.nachId["dach:" + fok.addr];
      if (dach) versuche.push({ knoten: "p:" + dach.id, x: dach.x1 + Math.min(dach.x2 - dach.x1 - HALB, Math.max(HALB, (dach.x2 - dach.x1) * 0.8)), danach: halt(z, kontext), fokus: fok.addr });
      for (const id of ["wl:" + fok.addr, "wr:" + fok.addr]) {
        const w = fl.nachId[id];
        if (w) versuche.push({ knoten: "w:" + w.id, y: w.y1 + (w.y2 - w.y1) * 0.35, danach: [{ typ: "haengen", dauer: 12 }], fokus: fok.addr });
      }
    }
    if (!nacht) {
      const orte = [];
      for (const p of fl.plattformen) if (p.art !== "innen") orte.push({ key: "p:" + p.id, knoten: "p:" + p.id, x: p.art === "boden" ? p.x1 + (p.x2 - p.x1) * (0.2 + 0.6 * ((z.zyklus.boden || 0) % 4) / 3) : (p.x1 + p.x2) / 2, kontext: p.art === "boden" ? "boden:" + tageszeit(umg.stunde) : W.kontextVon(p.fenster) });
      const wandZeit = ((z.zyklus.wand = (z.zyklus.wand || 0) + 1) % 4) === 0;
      if (wandZeit) for (const w of fl.waende) if (!w.stufe && w.y2 - w.y1 > 200) orte.push({ key: "w:" + w.id, knoten: "w:" + w.id, x: w.x, y: w.y1 + (w.y2 - w.y1) * 0.4, wand: true });
      for (const o of orte) {
        const P = o.wand ? null : fl.nachId[o.knoten.slice(2)];
        o.weit = Math.abs(o.x - z.x) + Math.abs((P ? P.y : o.y) - z.y) * 2;
        o.frisch = z.besucht[o.key] !== undefined && z.zeit - z.besucht[o.key] < 600;
      }
      orte.sort((a, b) => a.frisch - b.frisch || (a.frisch ? (z.besucht[a.key] || 0) - (z.besucht[b.key] || 0) : a.weit - b.weit) || (a.key < b.key ? -1 : 1));
      for (const o of orte) versuche.push({ knoten: o.knoten, x: o.x, y: o.y, danach: o.wand ? [{ typ: "haengen", dauer: 12 }] : null, kontext: o.kontext, key: o.key });
    }
    for (const v of versuche) {
      if (v.knoten === start && !v.danach && !v.kontext) continue;
      const schritte = v.knoten === start ? [] : W.weg(fl, start, z.x, v.knoten);
      if (!schritte) continue;
      if (v.knoten.startsWith("p:") && v.x !== undefined) schritte.push({ typ: "gehen", x: v.x });
      if (v.knoten.startsWith("w:") && v.y !== undefined) schritte.push({ typ: "klettern", y: v.y });
      z.plan = schritte.concat(v.danach || halt(z, v.kontext));
      z.besucht[v.key || v.knoten] = z.zeit;
      if (v.fokus) z.fokusBesucht = v.fokus;
      return true;
    }
    z.plan = nacht ? [{ typ: "taetigkeit", name: "Rumstehen", dauer: 5 }] : aktivitaeten(z, "ruhe", 1, 10);
    return false;
  };

  const winkel = (a) => ((a % 360) + 540) % 360 - 180;
  const ruhelage = (a) => {
    const w = winkel(a || 0);
    if (Math.abs(w) < LIEGEN_AB) return null;
    return Math.abs(w) > 135 ? (w > 0 ? 180 : -180) : Math.sign(w) * 90;
  };
  const aufschlag = (z) => {
    const ziel = ruhelage(z.dreh);
    z.liegen = ziel === null ? null : { von: winkel(z.dreh), ziel, seit: z.zeit, bis: null };
  };
  const bodenAbstand = (w) => {
    const r = (w * Math.PI) / 180, c = Math.cos(r);
    return S * (8 * Math.abs(Math.sin(r)) + (c >= 0 ? 8 * c : -4 * c));
  };

  const landen = (z, P, fallhoehe) => {
    const geworfen = z.geworfen;
    const lage = geworfen ? z.liegen : null;
    z.liegen = lage;
    z.vx = 0;
    z.dreh = 0;
    z.omega = 0;
    z.rutscht = null;
    z.geworfen = false;
    z.modus = "stehen";
    z.flaeche = P.id;
    z.y = P.y;
    z.vy = 0;
    if (lage) {
      lage.bis = Math.max(z.zeit, lage.seit + KIPPZEIT) + LIEGEZEIT + AUFSTEHZEIT;
      z.plan.unshift({ typ: "liegen" });
    } else if (!geworfen && !z.geplant && fallhoehe > 400 && erlaubt(z, "Erschrecken")) z.plan.unshift({ typ: "taetigkeit", name: "Erschrecken", dauer: 1.6 }, { typ: "taetigkeit", name: erlaubt(z, "Umschauen") ? "Umschauen" : "Rumstehen", dauer: 2.5 });
    z.geplant = false;
  };

  W.greifen = (z) => {
    z.modus = "gehalten";
    z.plan = [];
    z.liegen = null;
    z.wand = null;
    z.vx = 0;
    z.vy = 0;
    z.anim = "Gehalten";
  };

  W.halten = (z, x, y) => {
    z.x = x;
    z.y = y + 6 * S + MITTE;
  };

  W.werfen = (z, vx, vy) => {
    z.modus = "fallen";
    z.vx = Math.max(-WURF_MAX, Math.min(WURF_MAX, vx || 0));
    z.vy = Math.max(-WURF_MAX, Math.min(WURF_MAX, vy || 0));
    z.fallStart = z.y;
    z.geplant = false;
    z.rutscht = null;
    z.dreh = 0;
    z.omega = Math.hypot(z.vx, z.vy) > 500 ? z.vx * 0.3 : 0;
    z.geworfen = true;
    z.liegen = null;
  };

  const punktDrin = (umg, px, py) => umg.monitore.some((m) => px >= m.x && px <= m.x + m.w && py >= m.y && py <= m.y + m.h - ((m.reserved || [])[3] || 0) + 1);
  const drinnen = (umg, x, y) => [x - HALB / 2, x + HALB / 2].every((px) => punktDrin(umg, px, y) && punktDrin(umg, px, y - 2 * MITTE));

  const rutschen = (z, fl, umg, dt) => {
    const P = fl.nachId[z.rutscht];
    if (!P) { z.rutscht = null; z.fallStart = z.y; return; }
    if (z.liegen) z.anim = "Liegen";
    else {
      z.anim = "Rutschen";
      z.richtung = z.vx < 0 ? -1 : 1;
    }
    z.vx -= Math.sign(z.vx) * Math.min(Math.abs(z.vx), REIBUNG * dt);
    const ax = z.x;
    z.x += z.vx * dt;
    if (!drinnen(umg, z.x, z.y)) { z.x = ax; z.vx = -z.vx * ABPRALL_RAND; }
    if (z.x < P.x1 - HALB / 2 || z.x > P.x2 + HALB / 2) {
      if (z.liegen) { z.dreh = z.liegen.ziel; z.liegen = null; }
      z.rutscht = null; z.vy = 0; z.fallStart = z.y; return;
    }
    if (Math.abs(z.vx) < RUTSCH_MIN) landen(z, P, 0);
  };

  const fliegen = (z, fl, umg, dt) => {
    const schritte = Math.max(1, Math.ceil(Math.max(Math.abs(z.vx || 0), Math.abs(z.vy || 0)) * dt / 10));
    const h = dt / schritte;
    z.vx = z.vx || 0;
    for (let i = 0; i < schritte; i++) {
      const v = Math.hypot(z.vx, z.vy);
      z.vx -= LUFT * v * z.vx * h;
      z.vy += (SCHWERKRAFT - LUFT * v * z.vy) * h;
      const ax = z.x, ay = z.y, warDrin = drinnen(umg, ax, ay);
      z.x += z.vx * h;
      z.y += z.vy * h;
      z.dreh = (z.dreh || 0) + (z.omega || 0) * h;
      z.fallStart = Math.min(z.fallStart, z.y);
      const P = z.vy > 0 ? unterhalb(fl, z.x, ay - 1) : null;
      if (!(P && P.y <= z.y) && warDrin && !drinnen(umg, z.x, z.y)) {
        if (drinnen(umg, z.x, ay)) { z.y = ay; z.vy = -z.vy * ABPRALL_RAND; }
        else if (drinnen(umg, ax, z.y)) { z.x = ax; z.vx = -z.vx * ABPRALL_RAND; }
        else { z.x = ax; z.y = ay; z.vx = -z.vx * ABPRALL_RAND; z.vy = -z.vy * ABPRALL_RAND; }
        z.omega = (z.omega || 0) * 0.6;
        continue;
      }
      if (z.vy <= 0) continue;
      if (P && P.y <= z.y) {
        z.y = P.y;
        if (z.geworfen && z.vy > ABPRALL_MIN) {
          z.vy = -z.vy * ABPRALL_BODEN;
          z.vx *= 0.8;
          z.omega = (z.omega || 0) * 0.5;
          continue;
        }
        z.vy = 0;
        if (z.geworfen) aufschlag(z);
        z.dreh = 0;
        z.omega = 0;
        if (z.geworfen && Math.abs(z.vx) > RUTSCH_MIN) { z.rutscht = P.id; return; }
        landen(z, P, P.y - z.fallStart);
        return;
      }
      if (!P) {
        const m = monitorVon(umg, z.x) || umg.monitore[0];
        z.x = Math.max(m.x + HALB, Math.min(m.x + m.w - HALB, z.x));
        const B = fl.nachId["boden:" + m.name];
        if (z.y > B.y) { landen(z, B, 0); return; }
      }
    }
  };

  const wasserPflegen = (z, umg, dt) => {
    const w = z.wasser;
    if (!w) return;
    const m = umg.monitore.find((x) => x.name === w.mon);
    if (!m) { z.wasser = null; return; }
    const giesst = z.modus !== "gehalten" && z.plan[0] && z.plan[0].typ === "fluten";
    if (giesst) {
      w.pegel = Math.min(1, w.pegel + dt / FUELLZEIT);
      if (w.art === "fall" && w.strahlOben === null) w.strahlOben = m.y;
      if (w.art === "regen") { w.regnet = true; w.regenRest = 0.8; }
    } else {
      if (w.strahlOben !== null) {
        w.strahlOben += STRAHL_TEMPO * dt;
        if (w.strahlOben >= oberflaecheVon(w)) w.strahlOben = null;
      }
      if (w.regnet) {
        w.regenRest -= dt;
        if (w.regenRest <= 0) w.regnet = false;
      }
    }
    if (z.modus !== "gehalten" && z.plan.some((x) => x.typ === "fluten" || x.typ === "baden" || x.typ === "ablassen")) return;
    w.pegel -= dt / LEERZEIT;
    if (w.pegel <= 0) z.wasser = null;
  };

  W.schritt = (z, umg, dt) => {
    z.zeit += dt;
    if (!umg.monitore.length) return null;
    wasserPflegen(z, umg, dt);
    if (z.modus === "gehalten") {
      z.anim = "Gehalten";
      return W.flaechen(z, umg);
    }
    if (!umg.monitore.some((m) => z.x >= m.x && z.x <= m.x + m.w)) {
      const m = umg.monitore[0];
      z.x = m.x + m.w * 0.7;
      z.y = m.y + m.h - ((m.reserved || [])[3] || 0);
      z.modus = "stehen";
      z.flaeche = "boden:" + m.name;
      z.wand = null;
      z.plan = [];
    }
    if (umg.fokus !== z.fokus) { z.fokus = umg.fokus; z.fokusSeit = z.zeit; }
    const fl = W.flaechen(z, umg);
    if ((z.modus === "fliegen" && (!z.plan[0] || z.plan[0].typ !== "fliegen")) || (z.modus === "schwimmen" && (!z.plan[0] || !["fluten", "baden", "ablassen"].includes(z.plan[0].typ)) && !z.einschub)) {
      z.modus = "fallen";
      z.vy = 0;
      z.fallStart = z.y;
      z.geplant = true;
    }
    const halt = z.modus === "klettern" || z.modus === "haengen" ? fl.nachId[z.wand] : z.modus === "fallen" ? null : fl.nachId[z.flaeche];
    if (z.modus !== "fallen" && z.modus !== "fliegen" && z.modus !== "schwimmen" && (!halt || ((z.modus === "stehen" || z.modus === "gehen") && (z.x < halt.x1 - HALB || z.x > halt.x2 + HALB || Math.abs(halt.y - z.y) > 2)))) {
      if (z.modus === "klettern" || z.modus === "haengen") z.y += MITTE;
      z.modus = "fallen";
      z.vy = 0;
      z.fallStart = z.y;
      z.geplant = false;
      z.plan = [];
    }
    if (z.modus === "fallen") {
      if (z.rutscht) rutschen(z, fl, umg, dt);
      else {
        z.anim = z.geworfen ? "Wurf" : "Fallen";
        fliegen(z, fl, umg, dt);
      }
      return fl;
    }
    if (z.befehle && z.befehle.length && !z.plan.some((x) => x.befehl)) {
      const b = z.befehle.shift();
      z.plan = W.befehlPlan(z, fl, umg, b);
      z.geplant = true;
    }
    if (z.einschub && z.modus !== "klettern" && z.modus !== "haengen") {
      if (z.einschub.bis === null) z.einschub.bis = z.zeit + z.einschub.dauer;
      if (z.zeit < z.einschub.bis) {
        z.anim = z.einschub.name;
        if (z.modus === "gehen") z.modus = "stehen";
        return fl;
      }
      z.einschub = null;
    }
    if (!z.plan.length) W.planen(z, fl, umg);
    const s = z.plan[0];
    if (!s) return fl;
    if (s.typ === "gehen") {
      const d = s.x - z.x;
      if (Math.abs(d) < 3) { z.x = s.x; z.plan.shift(); z.modus = "stehen"; }
      else {
        z.modus = "gehen";
        z.richtung = s.rueck ? -Math.sign(d) : Math.sign(d);
        z.x += Math.sign(d) * Math.min(Math.abs(d), (s.tempo || GEHEN) * dt);
        if (s.stock === undefined) s.stock = !s.anim && Math.abs(d) > 900 && ((z.zyklus.stock = (z.zyklus.stock || 0) + 1) % 6 === 0) && erlaubt(z, "Wandern mit Stock");
        z.anim = s.anim || (s.stock ? "Wandern mit Stock" : "Spazieren");
      }
    } else if (s.typ === "anwand") {
      const w = fl.nachId[s.wand];
      z.plan.shift();
      if (w) { z.modus = "klettern"; z.anim = "Wand klettern"; z.wand = w.id; z.wandSeite = w.seite; z.wandX = w.x; z.x = standX(w); z.y = Math.min(z.y, w.y2) - MITTE; }
    } else if (s.typ === "klettern") {
      const w = fl.nachId[z.wand];
      if (!w || (z.modus !== "klettern" && z.modus !== "haengen")) { z.plan = []; return fl; }
      const ziel = Math.max(w.y1 + 6, Math.min(w.y2 - MITTE, s.y));
      const d = ziel - z.y;
      z.modus = "klettern";
      z.anim = "Wand klettern";
      z.richtung = Math.sign(d) || -1;
      if (Math.abs(d) < 3) { z.y = ziel; z.plan.shift(); }
      else z.y += Math.sign(d) * Math.min(Math.abs(d), (s.tempo || KLETTERN) * dt);
    } else if (s.typ === "aufsteigen") {
      const w = fl.nachId[z.wand], T = fl.nachId[s.zu];
      z.plan.shift();
      if (!w || !T) { z.plan = []; return fl; }
      if (w && T) {
        z.x = w.seite === "links" ? w.x + HALB : w.x - HALB;
        z.x = Math.max(T.x1 + 2, Math.min(T.x2 - 2, z.x));
        z.y = T.y;
        z.flaeche = T.id;
        z.wand = null;
        z.modus = "stehen";
        z.plan.unshift({ typ: "taetigkeit", name: "Aufsteigen", dauer: 0.4, intern: true });
      }
    } else if (s.typ === "anwandOben") {
      const w = fl.nachId[s.wand];
      z.plan.shift();
      if (w) { z.modus = "klettern"; z.anim = "Wand klettern"; z.wand = w.id; z.wandSeite = w.seite; z.wandX = w.x; z.x = standX(w); z.y = w.y1 + MITTE; z.plan.unshift({ typ: "klettern", y: w.y1 + MITTE }); }
    } else if (s.typ === "absteigen") {
      const B = fl.nachId[s.zu];
      z.plan.shift();
      if (B && z.wand) { z.modus = "stehen"; z.flaeche = B.id; z.y = B.y; z.x = Math.max(B.x1, Math.min(B.x2, z.x)); z.wand = null; } else z.plan = [];
    } else if (s.typ === "loslassen") {
      z.plan.shift();
      if (z.modus !== "klettern" && z.modus !== "haengen") return fl;
      z.y += MITTE;
      z.modus = "fallen";
      z.vy = 0;
      z.fallStart = z.y;
      z.geplant = true;
    } else if (s.typ === "fallen") {
      z.plan.shift();
      z.x += s.richtung * (HALB + 6);
      z.modus = "fallen";
      z.vy = 0;
      z.fallStart = z.y;
      z.geplant = true;
    } else if (s.typ === "teleport") {
      z.plan.shift();
      const P = fl.nachId[s.zu.slice(2)];
      if (P && s.zu.startsWith("p:")) { z.x = klemmen(s.x, P); z.y = P.y; z.flaeche = P.id; z.wand = null; z.modus = "stehen"; }
    } else if (s.typ === "fliegen") {
      const P = fl.nachId[s.zu.slice(2)];
      if (!P) { z.plan.shift(); return fl; }
      const zx = klemmen(s.x, P), dx = zx - z.x, dy = P.y - z.y, d = Math.hypot(dx, dy);
      z.anim = s.anim;
      z.wand = null;
      if (Math.abs(dx) > 1) z.richtung = Math.sign(dx);
      if (d < 4) { z.x = zx; z.y = P.y; z.flaeche = P.id; z.modus = "stehen"; z.plan.shift(); }
      else {
        const v = Math.min(d, FLUGTEMPO * dt);
        z.modus = "fliegen";
        z.x += (dx / d) * v;
        z.y += (dy / d) * v;
      }
    } else if (s.typ === "fluten") {
      const m = umg.monitore.find((x) => x.name === s.mon);
      if (!m) { z.plan = []; return fl; }
      const r = m.reserved || [0, 0, 0, 0];
      if (!z.wasser || z.wasser.mon !== s.mon) {
        z.flutZaehler = (z.flutZaehler || 0) + 1;
        const art = z.flutZaehler % 2 ? "fall" : "regen";
        const x1 = m.x + r[0], x2 = m.x + m.w - r[2];
        z.wasser = { mon: s.mon, pegel: 0, rand: W.wasserRand(umg, m), boden: m.y + m.h - r[3], art, strahlX: Math.round(x1 + (x2 - x1) * 0.72), strahlOben: art === "fall" ? m.y : null, regnet: art === "regen", regenRest: 0.8 };
      }
      const w = z.wasser;
      const oben = oberflaecheVon(w);
      if (z.modus === "gehen") z.modus = "stehen";
      if (z.modus === "schwimmen" || oben <= z.y - 12) {
        z.modus = "schwimmen";
        z.wand = null;
        z.y = Math.min(z.y, oben + 12);
        z.anim = w.pegel < 0.45 && erlaubt(z, "Überrascht") ? "Überrascht" : "Schwimmen";
      } else z.anim = erlaubt(z, "Überrascht") ? "Überrascht" : "Umschauen";
      if (w.pegel >= 1) z.plan.shift();
    } else if (s.typ === "baden") {
      const m = umg.monitore.find((x) => x.name === s.mon);
      if (!m || !z.wasser) { z.plan = []; return fl; }
      const w = z.wasser;
      const r = m.reserved || [0, 0, 0, 0];
      const x1 = m.x + r[0] + HALB + 8, x2 = m.x + m.w - r[2] - HALB - 8;
      const oben = oberflaecheVon(w);
      const zu = (ziel, v) => { const d = ziel - z.y; z.y += Math.sign(d) * Math.min(Math.abs(d), v * dt); return Math.abs(d) < 3; };
      if (!s.bis) { s.bis = z.zeit + s.dauer; s.dir = z.richtung || 1; s.weg = 0; z.wand = null; }
      z.modus = "schwimmen";
      z.anim = s.name;
      if (z.zeit >= s.bis) { z.plan.shift(); return fl; }
      const surfen = s.name === "Surfen", tauchen = s.name === "Tauchen";
      let zielY = oben + 12;
      if (surfen) zielY = oben + 4;
      if (tauchen) {
        const flach = oben + 130, tief = w.boden - 8;
        zielY = tief <= flach ? tief : flach + (tief - flach) * (0.5 - 0.5 * Math.cos(s.weg / 260));
      }
      z.richtung = s.dir;
      if (!zu(zielY, surfen ? 320 : 160) && surfen) return fl;
      const alt = z.x;
      z.x = Math.max(x1, Math.min(x2, z.x + s.dir * (surfen ? 240 : tauchen ? 110 : 150) * dt));
      s.weg += Math.abs(z.x - alt);
      if ((s.dir > 0 && z.x >= x2) || (s.dir < 0 && z.x <= x1)) s.dir = -s.dir;
    } else if (s.typ === "ablassen") {
      if (z.modus === "gehen") z.modus = "stehen";
      const w = z.wasser;
      const m = w && umg.monitore.find((x) => x.name === w.mon);
      if (m) {
        w.pegel = Math.max(0, w.pegel - dt / LEERZEIT);
        const oben = oberflaecheVon(w);
        if (z.modus === "schwimmen") {
          z.y = Math.min(w.boden, Math.max(z.y, oben + 12));
          if (w.pegel > 0 && z.y < w.boden) { z.anim = "Schwimmen"; return fl; }
          z.y = w.boden;
          z.modus = "stehen";
          z.flaeche = "boden:" + m.name;
        }
        z.anim = "Umschauen";
        if (w.pegel > 0) return fl;
      }
      if (z.modus === "schwimmen") { z.modus = "fallen"; z.vy = 0; z.fallStart = z.y; z.geplant = true; }
      z.wasser = null;
      z.plan.shift();
    } else if (s.typ === "liegen") {
      if (z.modus === "gehen") z.modus = "stehen";
      z.anim = "Liegen";
      if (!z.liegen || z.zeit >= z.liegen.bis) { z.liegen = null; z.plan.shift(); }
    } else if (s.typ === "taetigkeit" && !s.intern && (z.modus === "klettern" || z.modus === "haengen") && z.wand) {
      z.plan.unshift(...runterVonWand(z, fl));
    } else if (s.typ === "taetigkeit" || s.typ === "haengen") {
      if (!s.bis) s.bis = z.zeit + s.dauer;
      z.anim = s.typ === "haengen" ? "An der Wand" : s.name;
      if (s.typ === "haengen") z.modus = "haengen";
      else if (z.modus === "gehen") z.modus = "stehen";
      if (s.pendeln && z.modus === "stehen") {
        const P = fl.nachId[z.flaeche];
        if (P) {
          if (s.mitte === undefined) { s.mitte = z.x; s.dir = z.richtung || 1; }
          const links = Math.max(P.x1 + HALB, s.mitte - 160), rechts = Math.min(P.x2 - HALB, s.mitte + 160);
          if (z.x >= rechts) s.dir = -1;
          if (z.x <= links) s.dir = 1;
          z.x = Math.max(links, Math.min(rechts, z.x + s.dir * s.pendeln * dt));
          z.richtung = s.rueck ? -s.dir : s.dir;
        }
      }
      if (z.zeit >= s.bis) z.plan.shift();
    }
    return fl;
  };

  W.darstellung = (z) => {
    const anim = K.INTERN[z.anim] || K.BEWEGUNGEN.find((b) => b.n === z.anim) || K.INTERN["An der Wand"];
    if (z.modus === "gehalten") return { anim: K.INTERN.Gehalten, mitte: { x: z.x, y: z.y - MITTE }, dreh: Math.max(-30, Math.min(30, (z.vx || 0) * 0.03)), pivot: "kopf", spiegel: false };
    if ((z.modus === "klettern" || z.modus === "haengen") && z.wand) {
      const links = z.wandSeite === "links";
      return { anim, mitte: { x: z.wandX + (links ? -MITTE : MITTE), y: z.y }, dreh: links ? -90 : 90, spiegel: links ? z.richtung > 0 : z.richtung < 0 };
    }
    if (z.liegen && (z.rutscht || (z.plan[0] && z.plan[0].typ === "liegen"))) {
      const L = z.liegen, e = z.zeit - L.seit;
      let w = L.ziel;
      if (e < KIPPZEIT) w = L.von + (L.ziel - L.von) * (e / KIPPZEIT) ** 2;
      else if (L.bis !== null && L.bis - z.zeit < AUFSTEHZEIT) w = L.ziel * Math.max(0, (L.bis - z.zeit) / AUFSTEHZEIT) ** 2;
      return { anim, mitte: { x: z.x, y: z.y - bodenAbstand(w) }, dreh: w, pivot: "mitte", spiegel: z.richtung < 0 };
    }
    if (z.modus === "fallen" && z.dreh) return { anim, mitte: { x: z.x, y: z.y - MITTE }, dreh: ((z.dreh % 360) + 540) % 360 - 180, pivot: "mitte", spiegel: z.richtung < 0 };
    return { anim, mitte: { x: z.x, y: z.y - MITTE }, dreh: null, spiegel: z.richtung < 0 };
  };

})();
