/* Testy celowane: kalkulator łuku (R ↔ I/J) i walidacja pól kalkulatora skrawania.
   Uruchomienie: npm run test:calc */
import { arcGeometry } from "../src/components/ArcCalc";
import { check, cutPower, drillRate, turnRate } from "../src/app/kalkulator/Calc";

let fails = 0;
const ok = (name: string, cond: boolean, got?: unknown) => { if (!cond) { fails++; console.log("FAIL", name, got ?? ""); } else console.log("ok  ", name); };
const near = (a: number, b: number, eps = 0.01) => Math.abs(a - b) <= eps;

// --- łuk: start (20,20), koniec (50,50), r 30, G03
const s = arcGeometry(20, 20, 50, 50, 30, "ccw", false);
ok("krótki G03 istnieje", s.ok);
if (s.ok) {
  ok("krótki: środek (20,50)", near(s.cx, 20) && near(s.cy, 50), [s.cx, s.cy]);
  ok("krótki: I0 J30", near(s.I, 0) && near(s.J, 30), [s.I, s.J]);
  ok("krótki: 90°, 47,12 mm, strzałka 8,79", near(s.deg, 90) && near(s.len, 47.12) && near(s.sag, 8.79), [s.deg, s.len, s.sag]);
}
const l = arcGeometry(20, 20, 50, 50, 30, "ccw", true);
ok("długi G03 istnieje", l.ok);
if (l.ok) {
  ok("długi: środek (50,20)", near(l.cx, 50) && near(l.cy, 20), [l.cx, l.cy]);
  ok("długi: I30 J0", near(l.I, 30) && near(l.J, 0), [l.I, l.J]);
  ok("długi: 270°, 141,37 mm, strzałka 51,21", near(l.deg, 270) && near(l.len, 141.37) && near(l.sag, 51.21), [l.deg, l.len, l.sag]);
}
const neg = arcGeometry(20, 20, 50, 50, -30, "ccw", false);
ok("ujemne R = długi łuk", neg.ok && near(neg.deg, 270));
const half = arcGeometry(0, 0, 20, 0, 10, "ccw", false), half2 = arcGeometry(0, 0, 20, 0, 10, "ccw", true);
ok("półokrąg: 180°, strzałka = r (oba warianty)", half.ok && half2.ok && near(half.deg, 180) && near(half.sag, 10) && near(half2.sag, 10));
ok("te same punkty → komunikat", !arcGeometry(10, 10, 10, 10, 5, "ccw", false).ok);
ok("|R| < c/2 → komunikat", !arcGeometry(0, 0, 20, 0, 9.99, "ccw", false).ok);
ok("|R| tuż ponad c/2 → łuk istnieje", arcGeometry(0, 0, 20, 0, 10.000001, "ccw", false).ok);

// --- wydajność i moc (błędy sprzed paczki UC: Q toczenia 1000× za małe, moc wiercenia liczona z Vf zamiast z Vc)
ok("toczenie: Q = Vc·ap·f → 240·2·0,28 = 134,4 cm³/min", near(turnRate(240, 2, 0.28), 134.4));
ok("toczenie: P = Q·kc/60000 → 3,36 kW", near(cutPower(turnRate(240, 2, 0.28), 1500), 3.36));
{
  const D = 8, f = 0.16, vc = 77, kc = 1500, n = (vc * 1000) / (Math.PI * D), vf = n * f;
  ok("wiercenie: Q = D·f·Vc/4 → 24,64 cm³/min", near(drillRate(D, vf), (D * f * vc) / 4) && near(drillRate(D, vf), 24.64));
  ok("wiercenie: P = kc·D·f·Vc/240000 → 0,62 kW", near(cutPower(drillRate(D, vf), kc), (kc * D * f * vc) / 240000, 1e-9) && near(cutPower(drillRate(D, vf), kc), 0.62));
}
ok("frezowanie: P = ap·ae·Vf·kc/(60·10⁶) → 1,24 kW", near(cutPower((5 * 5 * 1986) / 1000, 1500), (5 * 5 * 1986 * 1500) / 60e6, 1e-9));

// --- walidacja pól
const D = { min: 0, max: 200 };
ok("D=0 → komunikat", check("0", D) !== null);
ok("D=10,5 (przecinek) → poprawne", check("10,5", D) === null);
ok("D=10.5 (kropka) → poprawne", check("10.5", D) === null);
ok("puste → komunikat", check("", D) !== null);
ok("samo „,” → komunikat", check(",", D) !== null);
ok("za duże → komunikat", check("500", D) !== null);
ok("z=2,5 → liczba całkowita", check("2,5", { min: 1, max: 20, int: true, minIncl: true }) !== null);
ok("z=1 (dolna granica włącznie) → poprawne", check("1", { min: 1, max: 20, int: true, minIncl: true }) === null);
ok("z=0 → komunikat", check("0", { min: 1, max: 20, int: true, minIncl: true }) !== null);

console.log(fails ? `\n${fails} błędów` : "\nwszystko ok");
process.exit(fails ? 1 : 0);
