(() => {
  const K = window.K;
  const $ = (s) => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const speicher = {
    lesen(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    schreiben(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return; } }
  };
  const reduziert = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dunkelMq = matchMedia("(prefers-color-scheme: dark)");
  const wurzel = document.documentElement;

  const DE = {
    navMoves: "Bewegungen", navWardrobe: "Garderobe", navRoom: "Umkleide", navGithub: "GitHub",
    tagline: "Ein kleiner Pixel-Mitbewohner. 190 Bewegungen, 134 Looks, live aus Code gezeichnet.",
    ctaMoves: "Bewegungen ansehen", ctaRoom: "Einkleiden", scroll: "scrollen, um tiefer zu graben",
    movesTitle: "Bewegungen", movesIntro: "Jede Kachel lebt. Klick eine an, und dein Begleiter unten rechts probiert sie sofort aus.",
    search: "Suchen", searchMoves: "Bewegungen suchen", searchLooks: "Looks suchen", empty: "Nichts gefunden. Probier ein anderes Wort.",
    looksTitle: "Looks", looksIntro: "Farben, Hüte, Brillen und ein paar fragwürdige Outfits. Anklicken zum Anziehen, nochmal klicken zum Ausziehen.",
    roomTitle: "Umkleide", roomIntro: "Stell ein Outfit zusammen, wähl eine Bewegung, dann teil den Link oder nimm die Pixel mit.",
    slotMove: "Bewegung", slotSkin: "Farbe", slotKopf: "Kopf", slotAugen: "Augen", slotGesicht: "Gesicht", slotHals: "Hals", slotKoerper: "Outfit",
    randomize: "Würfeln", daily: "Outfit des Tages", share: "Link kopieren", png: "PNG speichern", sheet: "Spritesheet speichern",
    howTitle: "So funktioniert's",
    how1: "Es gibt keine Spritesheets. Der Begleiter ist ein kleines Gerüst aus Rechtecken: ein Körper, zwei Arme, vier Beine und zwei Augen, zwölfmal pro Sekunde neu gezeichnet.",
    how2: "Jede Bewegung ist eine kleine Funktion, die dieses Gerüst über die Zeit verbiegt. Hüte, Brillen und Schals sind winzige Pixelkarten, an die richtige Stelle gepinnt.",
    how3: "Die ASCII-Welt hinter dieser Seite ist auch generiert. Scroll weiter, es wird tief.",
    footer1: "Inoffizielles Fan-Projekt. Nicht mit Anthropic verbunden oder von Anthropic unterstützt. Claude ist eine Marke von Anthropic.",
    footer2: "Der Look ist inspiriert von Claude FM, dem Lo-Fi-Stream hinter /radio in Claude Code.",
    license: "Code unter MIT"
  };
  const EN = {};
  document.querySelectorAll("[data-t]").forEach((el) => { EN[el.dataset.t] = el.textContent; });
  document.querySelectorAll("[data-tp]").forEach((el) => { EN[el.dataset.tp] = el.placeholder; });
  const TEXTE = {
    en: { alle: "All", keins: "none", kopiert: "Link copied.", gespeichert: (d) => `Saved ${d}.`, tag: "Today's outfit, the same for everyone.", zufall: "Randomized.", party: "Party mode." },
    de: { alle: "Alle", keins: "keins", kopiert: "Link kopiert.", gespeichert: (d) => `${d} gespeichert.`, tag: "Das Outfit von heute, für alle gleich.", zufall: "Gewürfelt.", party: "Partymodus." }
  };
  const SPRUECHE = {
    en: ["190 moves. Most of them are me showing off.", "I'm 48 by 40 pixels. Mostly legs.", "No image files were harmed in the making of me.", "Try the top hat. Trust me.", "Psst: ↑ ↑ ↓ ↓ ← → ← → B A", "You found me. I was here the whole time.", "Every pixel of me is a line of code. Be gentle."],
    de: ["190 Bewegungen. Die meisten davon sind Angeberei.", "Ich bin 48 mal 40 Pixel. Hauptsächlich Beine.", "Für mich wurde kein einziges Bild gemalt.", "Probier den Zylinder. Vertrau mir.", "Psst: ↑ ↑ ↓ ↓ ← → ← → B A", "Du hast mich gefunden. Ich war die ganze Zeit hier.", "Jeder Pixel an mir ist eine Zeile Code. Sei nett."]
  };

  let sprache = speicher.lesen("companion.sprache", navigator.language && navigator.language.startsWith("de") ? "de" : "en");
  if (params.get("lang") === "de" || params.get("lang") === "en") sprache = params.get("lang");
  const t_ = () => TEXTE[sprache];
  const nameVon = (x) => (sprache === "en" ? K.en(x) : x.n);
  const gruppeVon = (x) => (x.art === "b" ? x.c : x.gruppe);
  const gruppenName = (g) => (sprache === "en" ? K.enGruppe(g) : g);

  let thema = speicher.lesen("companion.thema", null);
  if (params.get("theme") === "dark" || params.get("theme") === "light") thema = params.get("theme");
  const nacht = () => (thema ? thema === "dark" : dunkelMq.matches);
  const farbenLesen = () => {
    const s = getComputedStyle(wurzel);
    K.tinte = s.getPropertyValue("--tinte").trim() || "#000000";
    K.papier = s.getPropertyValue("--papier").trim() || "#e8e6df";
  };
  const themaSetzen = () => {
    if (thema) wurzel.dataset.theme = thema; else delete wurzel.dataset.theme;
    $("#thema").textContent = nacht() ? (sprache === "de" ? "Hell" : "Light") : (sprache === "de" ? "Dunkel" : "Dark");
    farbenLesen();
    welt.heldZeit = -1;
    alleFaecher();
  };

  const B = K.BEWEGUNGEN, Z = K.AUSSEHEN;
  const nachId = new Map();
  B.forEach((x, i) => { x.art = "b"; x.versatz = K.rnd(i * 3.3) * 10; nachId.set(x.id, x); });
  Z.forEach((x, i) => { x.art = "a"; x.versatz = K.rnd(i * 5.9) * 10; nachId.set(x.id, x); });
  const suchen = (n) => B.concat(Z).find((x) => x.n === n);
  const RUHE = suchen("Rumstehen") || B[0];
  const WANDERN = suchen("Wandern mit Stock") || B[0];
  const SLOTS = ["skin", "kopf", "augen", "gesicht", "hals", "koerper"];

  const zustand = { anim: suchen("Disco") || B[0], outfit: {}, gewaehlt: null, party: false };
  const wanderhut = suchen("Wanderhut");
  const heldOutfit = wanderhut ? { kopf: wanderhut } : {};

  const welt = { pre: $("#welt"), cols: 0, rows: 0, zeile: 14, zeichen: 7.8, heldZeilen: 40, heldText: [], boden: 20, heldZeit: -1, gesamt: 200, letzteZeile: -1 };
  const messen = () => {
    const probe = document.createElement("span");
    probe.textContent = "MMMMMMMMMM";
    welt.pre.textContent = "";
    welt.pre.append(probe);
    welt.zeichen = probe.getBoundingClientRect().width / 10 || 7.8;
    probe.remove();
    welt.zeile = parseFloat(getComputedStyle(welt.pre).lineHeight) || 14;
    welt.cols = Math.ceil(innerWidth / welt.zeichen) + 1;
    welt.rows = Math.ceil(innerHeight / welt.zeile) + 2;
    welt.heldZeilen = Math.ceil($("#start").offsetHeight / welt.zeile);
    welt.gesamt = Math.ceil(wurzel.scrollHeight / welt.zeile) + 4;
    welt.heldZeit = -1;
    weltZeichnen(performance.now() / 1000, true);
  };
  const weltZeichnen = (t, erzwingen) => {
    if (t - welt.heldZeit > 0.4 || welt.heldZeit < 0) {
      const l = K.landschaft(welt.cols, welt.heldZeilen, reduziert ? 0 : t, nacht(), "CLAUDE", "companion");
      const frei = Math.min(welt.cols, Math.ceil(Math.min(600, innerWidth - 20) / welt.zeichen) + 4);
      welt.heldText = l.text.split("\n").map((z, i) => (i >= 8 && i < 21 ? " ".repeat(frei) + z.slice(frei) : z));
      welt.boden = l.boden;
      welt.heldZeit = t;
      erzwingen = true;
    }
    const start = Math.floor(scrollY / welt.zeile);
    if (!erzwingen && start === welt.letzteZeile) { welt.pre.style.transform = `translateY(${-(scrollY % welt.zeile)}px)`; return; }
    welt.letzteZeile = start;
    welt.pre.textContent = K.welt(welt.cols, welt.rows, start, reduziert ? 0 : t, nacht(), welt.heldZeilen, welt.heldText, welt.gesamt);
    welt.pre.style.transform = `translateY(${-(scrollY % welt.zeile)}px)`;
  };
  addEventListener("scroll", () => weltZeichnen(performance.now() / 1000, false), { passive: true });
  addEventListener("resize", messen);

  const wanderer = { cv: $("#wanderer"), x: -200, richtung: 1, pauseBis: 0, pauseAnim: null, naechstePause: 9 };
  wanderer.ctx = wanderer.cv.getContext("2d");
  const PAUSEN = ["Winken", "Umschauen", "Strecken", "Hüpfen", "Selfie"].map(suchen).filter(Boolean);
  const wandererZeichnen = (t, dt) => {
    if (scrollY > $("#start").offsetHeight) return;
    const breite = wanderer.cv.getBoundingClientRect().width, skala = breite / K.W;
    let anim = WANDERN;
    if (t < wanderer.pauseBis && wanderer.pauseAnim) anim = wanderer.pauseAnim;
    else {
      if (!reduziert) wanderer.x += wanderer.richtung * Math.abs(WANDERN.laeuft) * skala * 1.6 * dt * (wanderer.x < 0 ? 5 : 1);
      const maxX = innerWidth - breite;
      if (wanderer.x > maxX) { wanderer.x = maxX; wanderer.richtung = -1; }
      if (wanderer.x < 0 && wanderer.richtung < 0) { wanderer.x = 0; wanderer.richtung = 1; }
      wanderer.naechstePause -= dt;
      if (wanderer.naechstePause < 0 && PAUSEN.length) { wanderer.pauseAnim = PAUSEN[Math.floor(Math.random() * PAUSEN.length)]; wanderer.pauseBis = t + 3.5; wanderer.naechstePause = 10 + Math.random() * 8; }
    }
    const oben = (welt.boden + 1) * welt.zeile - K.BODEN * skala;
    wanderer.cv.style.transform = `translate(${Math.round(wanderer.x)}px, ${Math.round(oben)}px)`;
    const spiegel = anim.laeuft ? wanderer.richtung < 0 : false;
    const p = K.posieren(anim, reduziert ? 0.8 : t, { buehne: true, spiegel });
    K.male(wanderer.ctx, p, reduziert ? 0.8 : t, heldOutfit, { boden: false, tinte: K.tinte });
  };

  const outfitFach = (x) => {
    if (x.art === "b") return zustand.outfit.skin ? { skin: zustand.outfit.skin } : {};
    if (x.slot === "skin") return { skin: x };
    return { [x.slot]: x };
  };
  const aktiv = (x) => (x.art === "b" ? zustand.anim === x : zustand.outfit[x.slot] === x);

  const zeichneFach = (x, t) => {
    if (!x.ctx) return;
    const anim = zustand.party ? (suchen("Konfettiparty") || x) : x.art === "b" ? x : RUHE;
    const tt = t + x.versatz;
    K.male(x.ctx, K.posieren(anim, tt), tt, outfitFach(x), { tinte: aktiv(x) ? K.papier : K.tinte });
  };
  const sichtbar = new Set();
  const beobachter = new IntersectionObserver((e) => {
    for (const eintrag of e) {
      const x = nachId.get(eintrag.target.dataset.id);
      if (eintrag.isIntersecting) { sichtbar.add(x); zeichneFach(x, reduziert ? 0.8 : performance.now() / 1000); } else sichtbar.delete(x);
    }
  }, { rootMargin: "120px" });
  const alleFaecher = () => { const t = performance.now() / 1000; for (const x of sichtbar) zeichneFach(x, reduziert ? 0.8 : t); };

  const fachBauen = (x) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "fach";
    b.dataset.id = x.id;
    const cv = document.createElement("canvas");
    cv.width = K.W;
    cv.height = K.H;
    cv.setAttribute("aria-hidden", "true");
    x.nameEl = document.createElement("span");
    x.nameEl.className = "name";
    x.gruppeEl = document.createElement("span");
    x.gruppeEl.className = "gruppe";
    b.append(cv, x.nameEl, x.gruppeEl);
    b.addEventListener("click", () => fachKlick(x));
    b.addEventListener("pointerenter", () => { x.hover = true; });
    b.addEventListener("pointerleave", () => { x.hover = false; });
    x.ctx = cv.getContext("2d");
    x.el = b;
    beobachter.observe(b);
    return b;
  };
  B.forEach((x) => $("#kasten-b").append(fachBauen(x)));
  Z.forEach((x) => $("#kasten-a").append(fachBauen(x)));

  const markieren = () => { for (const x of B.concat(Z)) x.el.setAttribute("aria-pressed", String(aktiv(x))); };

  const filter = { b: { gruppe: "alle", suche: "" }, a: { gruppe: "alle", suche: "" } };
  const filtern = (art) => {
    const f = filter[art], q = f.suche.trim().toLowerCase();
    let treffer = 0;
    for (const x of art === "b" ? B : Z) {
      const ok = (f.gruppe === "alle" || gruppeVon(x) === f.gruppe) && (!q || nameVon(x).toLowerCase().includes(q) || x.n.toLowerCase().includes(q) || gruppenName(gruppeVon(x)).toLowerCase().includes(q));
      x.el.hidden = !ok;
      if (ok) treffer++;
    }
    $(`#leer-${art}`).hidden = treffer > 0;
  };
  const gruppenBauen = (art) => {
    const box = $(`#gruppen-${art}`), liste = art === "b" ? B : Z;
    box.textContent = "";
    const zahlen = new Map();
    for (const x of liste) zahlen.set(gruppeVon(x), (zahlen.get(gruppeVon(x)) || 0) + 1);
    for (const [wert, n] of [["alle", liste.length], ...zahlen]) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-pressed", String(filter[art].gruppe === wert));
      b.append(document.createTextNode((wert === "alle" ? t_().alle : gruppenName(wert)) + " "));
      const s = document.createElement("span");
      s.className = "n";
      s.textContent = n;
      b.append(s);
      b.addEventListener("click", () => { filter[art].gruppe = wert; gruppenBauen(art); filtern(art); });
      box.append(b);
    }
  };
  $("#suche-b").addEventListener("input", (e) => { filter.b.suche = e.target.value; filtern("b"); });
  $("#suche-a").addEventListener("input", (e) => { filter.a.suche = e.target.value; filtern("a"); });

  const raum = { cv: $("#buehne") };
  raum.ctx = raum.cv.getContext("2d");
  const selects = {};
  const optionen = () => {
    const move = $("#wahl-move");
    move.textContent = "";
    for (const g of [...new Set(B.map((x) => x.c))]) {
      const og = document.createElement("optgroup");
      og.label = gruppenName(g);
      for (const x of B.filter((y) => y.c === g)) og.append(new Option(nameVon(x), x.id));
      move.append(og);
    }
    move.value = zustand.anim.id;
    for (const slot of SLOTS) {
      const sel = $(`#wahl-${slot}`);
      selects[slot] = sel;
      sel.textContent = "";
      sel.append(new Option(`(${t_().keins})`, ""));
      for (const x of Z.filter((z) => z.slot === slot)) sel.append(new Option(nameVon(x), x.id));
      sel.value = zustand.outfit[slot] ? zustand.outfit[slot].id : "";
    }
  };
  $("#wahl-move").addEventListener("change", (e) => { zustand.anim = nachId.get(e.target.value) || zustand.anim; geaendert(); });
  SLOTS.forEach((slot) => $(`#wahl-${slot}`).addEventListener("change", (e) => {
    const x = nachId.get(e.target.value);
    if (x) zustand.outfit[slot] = x; else delete zustand.outfit[slot];
    geaendert();
  }));

  const hashSchreiben = () => {
    const teile = [`m:${zustand.anim.id}`].concat(Object.entries(zustand.outfit).map(([s, x]) => `${s}:${x.id}`));
    history.replaceState(null, "", `#look=${teile.join(";")}`);
  };
  const hashLesen = () => {
    if (!location.hash.startsWith("#look=")) return false;
    const outfit = {};
    for (const teil of decodeURIComponent(location.hash.slice(6)).split(";")) {
      const [s, id] = teil.split(":");
      const x = nachId.get(id);
      if (!x) continue;
      if (s === "m" && x.art === "b") zustand.anim = x;
      else if (x.art === "a" && x.slot === s) outfit[s] = x;
    }
    zustand.outfit = outfit;
    return true;
  };

  const geaendert = (hashAuch = true) => {
    optionenWerte();
    markieren();
    alleFaecher();
    $("#buehne-name").textContent = [nameVon(zustand.anim)].concat(Object.values(zustand.outfit).map(nameVon)).join(", ");
    if (hashAuch && location.hash.startsWith("#look=")) hashSchreiben();
  };
  const optionenWerte = () => {
    $("#wahl-move").value = zustand.anim.id;
    for (const slot of SLOTS) selects[slot].value = zustand.outfit[slot] ? zustand.outfit[slot].id : "";
  };

  const hinweis = (s) => { $("#hinweis").textContent = s; };
  const zufall = (arr, rng = Math.random) => arr[Math.floor(rng() * arr.length)];
  const wuerfeln = (rng = Math.random) => {
    const o = {};
    const chancen = { skin: 1, kopf: 0.75, augen: 0.4, gesicht: 0.2, hals: 0.3, koerper: 0.15 };
    for (const slot of SLOTS) { const pool = Z.filter((z) => z.slot === slot); if (pool.length && rng() < chancen[slot]) o[slot] = zufall(pool, rng); }
    zustand.outfit = o;
    zustand.anim = zufall(B.filter((b) => !b.laeuft), rng);
  };
  const saat = (s) => { let a = 0; for (const ch of s) a = (a * 31 + ch.charCodeAt(0)) >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  $("#wuerfeln").addEventListener("click", () => { wuerfeln(); geaendert(false); hashSchreiben(); hinweis(t_().zufall); });
  $("#tag").addEventListener("click", () => { wuerfeln(saat(new Date().toISOString().slice(0, 10))); geaendert(false); hashSchreiben(); hinweis(t_().tag); });
  $("#teilen").addEventListener("click", async () => {
    hashSchreiben();
    try { await navigator.clipboard.writeText(location.href); } catch (e) { return hinweis(location.href); }
    hinweis(t_().kopiert);
  });
  const herunterladen = (cv, datei) => {
    const a = document.createElement("a");
    a.href = cv.toDataURL("image/png");
    a.download = datei;
    a.click();
    hinweis(t_().gespeichert(datei));
  };
  const dateiName = () => "claude-companion-" + K.en(zustand.anim).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const bild = (skala, bilder, fps) => {
    const klein = document.createElement("canvas");
    klein.width = K.W; klein.height = K.H;
    const kctx = klein.getContext("2d");
    const gross = document.createElement("canvas");
    gross.width = K.W * skala * bilder; gross.height = K.H * skala;
    const g = gross.getContext("2d");
    g.imageSmoothingEnabled = false;
    for (let i = 0; i < bilder; i++) {
      const t = bilder === 1 ? performance.now() / 1000 : i / fps;
      K.male(kctx, K.posieren(zustand.anim, t), t, zustand.outfit, { boden: false, tinte: "#000000" });
      g.drawImage(klein, i * K.W * skala, 0, K.W * skala, K.H * skala);
    }
    return gross;
  };
  $("#png").addEventListener("click", () => herunterladen(bild(8, 1, 12), dateiName() + ".png"));
  $("#sheet").addEventListener("click", () => herunterladen(bild(4, 24, 12), dateiName() + "-sheet.png"));

  const begleiter = { box: $("#begleiter"), cv: $("#begleiter-bild"), blase: $("#sprechblase"), eigen: null, eigenBis: 0, blaseBis: 0, bereich: null };
  begleiter.ctx = begleiter.cv.getContext("2d");
  const BEREICHE = { moves: "Disco", wardrobe: "Selfie", how: "Tippen" };
  const bereichBeobachter = new IntersectionObserver((e) => {
    for (const eintrag of e) if (eintrag.isIntersecting) begleiter.bereich = eintrag.target.id;
  }, { threshold: 0.25 });
  ["start", "moves", "wardrobe", "dressing-room", "how"].forEach((id) => bereichBeobachter.observe(document.getElementById(id)));
  bereichBeobachter.observe($(".fuss"));
  const sagen = (s, dauer = 4.5) => { begleiter.blase.textContent = s; begleiter.blase.hidden = false; begleiter.blaseBis = performance.now() / 1000 + dauer; };
  let spruch = Math.floor(Math.random() * 7);
  $("#begleiter-knopf").addEventListener("click", () => {
    const frei = B.filter((b) => !b.laeuft);
    begleiter.eigen = zufall(frei);
    begleiter.eigenBis = performance.now() / 1000 + 5;
    sagen(SPRUECHE[sprache][spruch++ % SPRUECHE[sprache].length]);
  });
  const begleiterZeichnen = (t) => {
    const imHeld = scrollY < $("#start").offsetHeight * 0.6;
    const imRaum = begleiter.bereich === "dressing-room";
    begleiter.box.hidden = imHeld || imRaum;
    if (begleiter.box.hidden) return;
    if (begleiter.blaseBis && t > begleiter.blaseBis) { begleiter.blase.hidden = true; begleiter.blaseBis = 0; }
    let anim = zustand.anim;
    if (!zustand.gewaehlt) anim = suchen(BEREICHE[begleiter.bereich]) || (begleiter.bereich === null ? RUHE : suchen("Sterne gucken") || RUHE);
    if (zustand.party) anim = suchen("Konfettiparty") || anim;
    if (begleiter.eigen && t < begleiter.eigenBis) anim = begleiter.eigen;
    const tt = reduziert ? 0.8 : t;
    K.male(begleiter.ctx, K.posieren(anim, tt), tt, zustand.outfit, { boden: false, tinte: K.tinte });
  };

  const fachKlick = (x) => {
    if (x.art === "b") { zustand.anim = x; zustand.gewaehlt = x; }
    else if (zustand.outfit[x.slot] === x) delete zustand.outfit[x.slot];
    else zustand.outfit[x.slot] = x;
    begleiter.eigen = null;
    geaendert();
  };

  const raumZeichnen = (t) => {
    const r = raum.cv.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const tt = reduziert ? 0.8 : t;
    K.male(raum.ctx, K.posieren(zustand.anim, tt), tt, zustand.outfit, { tinte: K.tinte });
  };

  const texteSetzen = () => {
    wurzel.lang = sprache;
    const tab = sprache === "de" ? DE : EN;
    document.querySelectorAll("[data-t]").forEach((el) => { if (tab[el.dataset.t]) el.textContent = tab[el.dataset.t]; });
    document.querySelectorAll("[data-tp]").forEach((el) => { if (tab[el.dataset.tp]) el.placeholder = tab[el.dataset.tp]; });
    $("#sprache").textContent = sprache === "en" ? "DE" : "EN";
    $("#thema").textContent = nacht() ? (sprache === "de" ? "Hell" : "Light") : (sprache === "de" ? "Dunkel" : "Dark");
    for (const x of B.concat(Z)) { x.nameEl.textContent = nameVon(x); x.gruppeEl.textContent = gruppenName(gruppeVon(x)); }
    gruppenBauen("b"); gruppenBauen("a"); filtern("b"); filtern("a");
    optionen();
    geaendert(false);
  };
  $("#sprache").addEventListener("click", () => { sprache = sprache === "en" ? "de" : "en"; speicher.schreiben("companion.sprache", sprache); texteSetzen(); });
  $("#thema").addEventListener("click", () => { thema = nacht() ? "light" : "dark"; speicher.schreiben("companion.thema", thema); themaSetzen(); weltZeichnen(performance.now() / 1000, true); });
  dunkelMq.addEventListener("change", () => { if (!thema) { themaSetzen(); weltZeichnen(performance.now() / 1000, true); } });

  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let konami = 0, getippt = "";
  addEventListener("keydown", (e) => {
    if (e.target.matches("input, select, textarea")) return;
    konami = e.key === KONAMI[konami] ? konami + 1 : e.key === KONAMI[0] ? 1 : 0;
    if (konami === KONAMI.length) { konami = 0; zustand.party = !zustand.party; sagen(t_().party, 3); alleFaecher(); }
    getippt = (getippt + e.key.toLowerCase()).slice(-6);
    if (getippt === "claude") { begleiter.eigen = suchen("Beidhändig winken") || RUHE; begleiter.eigenBis = performance.now() / 1000 + 4; sagen(sprache === "de" ? "Hallo! Das bin ich." : "Hi! That's me."); }
  });

  let letzte = 0, vorher = performance.now();
  const schleife = (jetzt) => {
    requestAnimationFrame(schleife);
    if (jetzt - letzte < 1000 / 12) return;
    letzte = jetzt;
    const t = jetzt / 1000, dt = Math.min(0.2, (jetzt - vorher) / 1000);
    vorher = jetzt;
    if (!reduziert) weltZeichnen(t, false);
    wandererZeichnen(t, dt);
    for (const x of sichtbar) if (!reduziert || x.hover) zeichneFach(x, t);
    begleiterZeichnen(t);
    raumZeichnen(t);
  };

  const selbsttest = () => {
    const cv = document.createElement("canvas");
    cv.width = K.W; cv.height = K.H;
    const ctx = cv.getContext("2d");
    const fehler = [];
    for (const x of B.concat(Z)) {
      try {
        for (const t of [0, 1.3, 3.1]) K.male(ctx, K.posieren(x.art === "b" ? x : RUHE, t), t, outfitFach(x), {});
      } catch (e) { fehler.push(`${x.n}: ${e.message}`); }
    }
    const welttext = K.welt(160, 400, 0, 1, false, 40, Array(40).fill(""), 400);
    document.title = `SELBSTTEST moves=${B.length} looks=${Z.length} fehler=${fehler.length} welt=${welttext.length} ${fehler.join(" | ")}`;
  };

  const start = () => {
    if (hashLesen()) zustand.gewaehlt = zustand.anim;
    else if (wanderhut) zustand.outfit = { kopf: wanderhut };
    themaSetzen();
    texteSetzen();
    messen();
    if (location.hash.startsWith("#look=")) setTimeout(() => document.getElementById("dressing-room").scrollIntoView(), 50);
    if (params.has("wx")) wanderer.x = Number(params.get("wx"));
    if (params.has("ziel")) {
      wurzel.style.scrollBehavior = "auto";
      const ziel = document.getElementById(params.get("ziel"));
      if (ziel) setTimeout(() => { scrollTo(0, ziel.getBoundingClientRect().top + scrollY - Number(params.get("rand") || 60)); weltZeichnen(performance.now() / 1000, true); }, 300);
    }
    requestAnimationFrame(schleife);
    if (params.has("selbsttest")) selbsttest();
  };
  const schriftGeladen = document.fonts && document.fonts.load ? Promise.race([Promise.all([document.fonts.load('13px "Welt Mono"', "█▀▄M"), document.fonts.load('14px "Martian Mono"')]), new Promise((r) => setTimeout(r, 2500))]) : Promise.resolve();
  schriftGeladen.then(start, start);
  if (document.fonts) document.fonts.addEventListener("loadingdone", () => messen());
  addEventListener("load", () => { welt.gesamt = Math.ceil(wurzel.scrollHeight / welt.zeile) + 4; });
})();
