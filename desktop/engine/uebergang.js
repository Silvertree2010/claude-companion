(() => {
  const K = window.K;
  const ARME = ["oben", "hoch", "halb", "raus", "unten", "tief"];
  const glatt = (q) => q * q * (3 - 2 * q);
  const linear = (a, b, q) => (q <= 0 ? a : q >= 1 ? b : a + (b - a) * q);
  const misch = (a, b, q) => (q <= 0 ? a : q >= 1 ? b : Math.round(a + (b - a) * q));
  const winkelDiff = (a, b) => ((((b - a) % 360) + 540) % 360) - 180;

  K.poseKopie = (p) => Object.assign({}, p, { lift: p.lift.slice(), aL: p.aL.slice(), aR: p.aR.slice(), props: p.props.slice(), fx: p.fx.slice() });

  const arm = (a, b, oa, ob, q) => {
    const ia = ARME.indexOf(a), ib = ARME.indexOf(b);
    if (ia >= 0 && ib >= 0) return [ARME[Math.round(ia + (ib - ia) * q)], [misch(oa[0], ob[0], q), misch(oa[1], ob[1], q)]];
    return q < 0.5 ? [a, oa.slice()] : [b, ob.slice()];
  };

  K.mischen = (a, b, roh) => {
    if (roh <= 0) return K.poseKopie(a);
    if (roh >= 1) return K.poseKopie(b);
    const r = roh, q = glatt(r);
    const p = K.poseKopie(q < 0.5 ? a : b);
    const sa = a.beine === "sitzen" ? 3 : 0, sb = b.beine === "sitzen" ? 3 : 0;
    const na = sa === sb ? 0 : sa, nb = sa === sb ? 0 : sb;
    const aus = sa !== sb && p.beine === "sitzen" ? -3 : 0;
    p.dy = misch(a.dy + na, b.dy + nb, q) + aus;
    p.lift = p.lift.map((_, i) => misch((a.lift[i] || 0) + na, (b.lift[i] || 0) + nb, q) + aus);
    for (const f of ["dx", "bw", "bh", "ex", "ey", "mundY"]) p[f] = misch(a[f] || 0, b[f] || 0, q);
    [p.armL, p.aL] = arm(a.armL, b.armL, a.aL, b.aL, q);
    [p.armR, p.aR] = arm(a.armR, b.armR, a.aR, b.aR, q);
    if (a.augen !== b.augen && a.augen !== "zu" && b.augen !== "zu" && r > 0.3 && r < 0.7) p.augen = "zu";
    const da = a.dreh || 0, db = b.dreh || 0;
    if ((da || db) && (!da || !db || a.pivot === b.pivot)) {
      p.pivot = db ? b.pivot : a.pivot;
      p.dreh = q >= 1 ? db : da + winkelDiff(da, db) * q;
    }
    p.alpha = linear(a.alpha, b.alpha, q);
    p.skala = linear(a.skala, b.skala, q);
    p.glitch = linear(a.glitch || 0, b.glitch || 0, q);
    return p;
  };

  K.uebergang = (dauer = 0.3) => {
    const u = { dauer, von: null, seit: -1e9, letzte: null };
    u.wechsel = (t) => {
      u.seit = t;
      u.von = u.letzte;
    };
    u.anteil = (t) => (u.von ? Math.max(0, Math.min(1, (t - u.seit) / u.dauer)) : 1);
    u.aktiv = (t) => u.anteil(t) < 1;
    u.pose = (p, t) => {
      const q = u.anteil(t);
      if (q >= 1) u.von = null;
      const aus = q >= 1 ? p : K.mischen(u.von, p, q);
      u.letzte = K.poseKopie(aus);
      return aus;
    };
    return u;
  };
  K.glatt = glatt;
})();
