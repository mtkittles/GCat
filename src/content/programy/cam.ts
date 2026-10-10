import { solveAngles, type Rot3 } from "@/lib/parser";

/*
  Programy „jak z CAM”: gęste ruchy G01 po powierzchni, liczone tutaj zamiast przechowywać
  tysiące linii w repozytorium. Format jak z typowego postprocesora: współrzędne z trzema
  miejscami po przecinku, ruch modalny, bez numerów bloków.
*/

const f3 = (v: number) => (Math.abs(v) < 5e-4 ? "0." : v.toFixed(3));

/* ---------- 3 osie: forma z powierzchnią swobodną ---------- */

/** Powierzchnia formy: fala z garbem, Z od ok. −14 do −3 (wierzch półfabrykatu Z0). */
const surf = (x: number, y: number) =>
  -10 + 4 * Math.cos((2 * Math.PI * (x - 40)) / 50) * Math.cos((Math.PI * (y - 30)) / 40) + 3 * Math.exp(-((x - 58) ** 2 + (y - 22) ** 2) / 90);

/** Najniższe położenie czoła narzędzia nad powierzchnią (frez płaski: r, kulisty: kula o promieniu r). */
function toolZ(x: number, y: number, r: number, ball: boolean, allow: number): number {
  let z = -Infinity;
  for (const rr of [0, r * 0.35, r * 0.7, r]) {
    const n = rr === 0 ? 1 : 12;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * 2 * Math.PI, px = x + rr * Math.cos(a), py = y + rr * Math.sin(a);
      const lift = ball ? Math.sqrt(Math.max(0, r * r - rr * rr)) - r : 0;
      z = Math.max(z, surf(px, py) + allow + lift);
    }
  }
  return z;
}

export function camForma(): string {
  const out: string[] = [
    "%",
    "O6001 (FORMA - POWIERZCHNIA SWOBODNA)",
    "(PROGRAM JAK Z CAM: ZGRUBNIE WARSTWAMI FI10, WYKANCZANIE KULISTYM FI6)",
    "(PREFORMA 80X60X25, ZERO: LEWY DOLNY NAROZNIK, Z0 NA GORZE)",
    "G21 G90 G94 G17 G40 G49 G80",
    "G54",
    "(--- ZGRUBNIE: WARSTWY CO 3 MM, NADDATEK 0.8 ---)",
    "T1 M06 (FREZ FI10)",
    "G43 H1 Z50.",
    "S6000 M03",
    "M08",
  ];
  for (const level of [-3, -6, -9, -12]) {
    out.push("G00 Z5.", "G00 X-7. Y-2.", `G01 Z${f3(Math.max(level, toolZ(-7, -2, 5, false, 0.8)))} F400`, "F1800");
    let row = 0;
    for (let y = -2; y <= 62.01; y += 7, row++) {
      const xs: number[] = []; for (let x = -7; x <= 87.01; x += 2) xs.push(x);
      if (row % 2) xs.reverse();
      for (const x of xs) out.push(`X${f3(x)} Y${f3(y)} Z${f3(Math.min(1, Math.max(level, toolZ(x, y, 5, false, 0.8))))}`);
    }
  }
  out.push("G00 Z50.", "M09", "M05",
    "(--- WYKANCZANIE: KULISTY FI6, KROK 1 MM ---)",
    "T2 M06 (FREZ KULISTY FI6)", "G43 H2 Z50.", "S12000 M03", "M08",
    "G00 X-1. Y0", `G00 Z5.`, `G01 Z${f3(toolZ(-1, 0, 3, true, 0))} F400`, "F2500");
  let row = 0;
  for (let y = 0; y <= 60.01; y += 1, row++) {
    const xs: number[] = []; for (let x = -1; x <= 81.01; x += 1) xs.push(x);
    if (row % 2) xs.reverse();
    for (const x of xs) out.push(`X${f3(x)} Y${f3(y)} Z${f3(toolZ(x, y, 3, true, 0))}`);
  }
  out.push("G00 Z50.", "M09", "M05", "G91 G28 Z0", "G90", "M30", "%");
  return out.join("\n");
}

/* ---------- 5 osi: kopuła z TCP (stół A/C) ---------- */

const C0 = { x: 0, y: 0, z: -35 }, RS = 33;          // środek i promień kuli kopuły
const zBand = -20;                                    // dół kopuły (od tej wysokości wykańczamy)

export function camKopula(): string {
  const out: string[] = [
    "%",
    "O6002 (KOPULA - 5 OSI JEDNOCZESNIE, TCP)",
    "(PROGRAM JAK Z CAM: ZGRUBNIE 3 OSIE FI12, WYKANCZANIE 5 OSI KULISTYM FI6)",
    "(KOSTKA 60X60X40, ZERO: SRODEK GORNEJ POWIERZCHNI = SRODEK OBROTU STOLU A/C)",
    "(OS NARZEDZIA POCHYLONA W STRONE NORMALNEJ DO POWIERZCHNI - POL KATA)",
    "G21 G90 G94 G17 G40 G49 G80",
    "G54",
    "(--- ZGRUBNIE: OKREGI WOKOL KOPULY, WARSTWY CO 3 MM ---)",
    "T1 M06 (FREZ FI12)",
    "G43 H1 Z60.",
    "S5000 M03",
    "M08",
  ];
  for (let z = -3; z >= zBand + 2 - 1e-9; z -= 3) {
    const rd = Math.sqrt(Math.max(0, RS * RS - (z - C0.z) ** 2));
    const r0 = rd + 6 + 0.5;
    out.push("G00 Z2.", `G00 X${f3(r0)} Y0`, `G01 Z${f3(z)} F300`, "F1500");
    for (let r = r0; r <= 46; r += 9) {
      out.push(`G01 X${f3(r)} Y0`, `G02 X${f3(r)} Y0 I${f3(-r)} J0`);
    }
  }
  out.push("G00 Z100.", "M09", "M05",
    "(--- WYKANCZANIE 5 OSI: SPIRALA OD DOLU DO SZCZYTU ---)",
    "T2 M06 (FREZ KULISTY FI6)", "S14000 M03", "M08");
  const r = 3;
  const phiMax = Math.acos((zBand - C0.z) / RS);      // kąt od pionu na dole kopuły
  const dPhi = 1.2 / RS;                              // krok 1,2 mm na obrót
  const stepDeg = 4;
  let cur: Rot3 = { a: 0, b: 0, c: 0 };
  const point = (phi: number, th: number) => {
    const n = { x: Math.sin(phi) * Math.cos(th), y: Math.sin(phi) * Math.sin(th), z: Math.cos(phi) };
    const t0 = { x: n.x, y: n.y, z: n.z + 1 }, tl = Math.hypot(t0.x, t0.y, t0.z);
    const t = { x: t0.x / tl, y: t0.y / tl, z: t0.z / tl };      // oś narzędzia: połowa kąta normalnej
    const ctr = { x: C0.x + (RS + r) * n.x, y: C0.y + (RS + r) * n.y, z: C0.z + (RS + r) * n.z };
    const tip = { x: ctr.x - r * t.x, y: ctr.y - r * t.y, z: ctr.z - r * t.z };
    const ang = solveAngles("AC", t, cur) ?? cur;
    cur = ang;
    return { tip, t, ang };
  };
  const first = point(phiMax, 0);
  out.push(`G00 A${f3(first.ang.a)} C${f3(first.ang.c)}`, "G43.4 H2 (TCP: X Y Z = WIERZCHOLEK NARZEDZIA)");
  const appr = { x: first.tip.x + 20 * first.t.x, y: first.tip.y + 20 * first.t.y, z: first.tip.z + 20 * first.t.z };
  out.push(`G00 X${f3(appr.x)} Y${f3(appr.y)} Z${f3(appr.z)}`, `G01 X${f3(first.tip.x)} Y${f3(first.tip.y)} Z${f3(first.tip.z)} F500`, "F3000");
  let last = first;
  for (let deg = stepDeg; ; deg += stepDeg) {
    const phi = phiMax - (deg / 360) * dPhi;          // jeden obrót spirali = krok dPhi
    const th = (-deg * Math.PI) / 180;                // spirala w prawo — C rośnie
    const p = point(Math.max(0, phi), th);
    out.push(`X${f3(p.tip.x)} Y${f3(p.tip.y)} Z${f3(p.tip.z)} A${f3(p.ang.a)} C${f3(p.ang.c)}`);
    last = p;
    if (phi <= 0) break;
  }
  const ret = { x: last.tip.x + 30 * last.t.x, y: last.tip.y + 30 * last.t.y, z: last.tip.z + 30 * last.t.z };
  // stół wraca do najbliższej pełnej wielokrotności 360° na C (bez odkręcania kilkudziesięciu obrotów)
  const cHome = 360 * Math.round(cur.c / 360);
  out.push(`G01 X${f3(ret.x)} Y${f3(ret.y)} Z${f3(ret.z)} F1500`, "G00 Z100.", "G49", `G00 A0 C${f3(cHome)}`, "M09", "M05", "M30", "%");
  return out.join("\n");
}
