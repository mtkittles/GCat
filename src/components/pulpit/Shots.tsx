/*
  „Zrzuty” do kart strony głównej (UI-5, w duchu Framera): uproszczone makiety ekranów serwisu — lekcja,
  symulator, kalkulator — rysowane w HTML/SVG, wygaszone ku dołowi i w prawo (maska w pulpit.css).
  Tylko ozdoba karty (aria-hidden); liczby z tych samych wzorów co kalkulator.
*/
import { Check, CircleAlert, Play, Rotate3d, SlidersHorizontal } from "lucide-react";

const VC = 150, D = 10, FZ = 0.05, Z = 3;
const N = Math.round((1000 * VC) / (Math.PI * D));
const VF = Math.round(N * FZ * Z);

export function ShotLesson() {
  return (
    <div className="sh sh-lesson" aria-hidden>
      <div className="sh-bar"><b>F2.3</b><span>Interpolacja kołowa</span><em>4 / 9</em></div>
      <div className="sh-body">
        <p className="sh-q">Który blok zatoczy łuk przeciwnie do ruchu wskazówek zegara?</p>
        <ul className="sh-opts">
          <li><code>G02 X80. Y10. R10.</code></li>
          <li className="is-ok"><code><i className="k-arc">G03</i> X80. Y10. R10.</code><Check /></li>
          <li><code>G01 X80. Y10. F200</code></li>
        </ul>
      </div>
    </div>
  );
}

export function ShotSim() {
  return (
    <div className="sh sh-sim" aria-hidden>
      <div className="sh-bar">
        <span className="sh-tabs"><i className="is-on">2D</i><i>3D</i></span>
        <span className="sh-ico"><Rotate3d /><Play /></span>
      </div>
      <div className="sh-canvas">
        <svg viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="sh-grid" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" className="sh-grid" /></pattern>
          </defs>
          <rect width="240" height="120" fill="url(#sh-grid)" />
          <rect x="44" y="22" width="132" height="76" rx="3" className="sh-stock" />
          <path d="M14 114 L58 98 M110 22 V60" className="sh-g0" />
          <path d="M58 98 H162 M176 84 V36 M162 22 H58 M44 36 V84" className="sh-g1" />
          <path d="M162 98 A14 14 0 0 0 176 84 M176 36 A14 14 0 0 0 162 22 M58 22 A14 14 0 0 0 44 36 M44 84 A14 14 0 0 0 58 98" className="sh-g2" />
          <circle cx="110" cy="60" r="15" className="sh-g2" />
          <circle cx="125" cy="60" r="4.5" className="sh-tool" />
        </svg>
      </div>
      <div className="sh-foot">
        <span><Check className="is-ok" />Składnia</span>
        <span><Check className="is-ok" />Obroty</span>
        <span><CircleAlert className="is-warn" />G43 po T02</span>
      </div>
    </div>
  );
}

export function ShotCalc() {
  return (
    <div className="sh sh-calc" aria-hidden>
      <div className="sh-bar"><SlidersHorizontal /><span>Parametry skrawania</span></div>
      <div className="sh-body">
        <div className="sh-row"><span>Vc</span><span className="sh-track"><i style={{ width: "58%" }} /></span><b>{VC} m/min</b></div>
        <div className="sh-row"><span>D</span><span className="sh-track"><i style={{ width: "24%" }} /></span><b>⌀{D} mm</b></div>
        <div className="sh-row"><span>fz</span><span className="sh-track"><i style={{ width: "36%" }} /></span><b>{String(FZ).replace(".", ",")} mm</b></div>
        <div className="sh-out">
          <span><small>n</small><strong>{N.toLocaleString("pl-PL")}</strong><small>obr/min</small></span>
          <span><small>Vf</small><strong>{VF.toLocaleString("pl-PL")}</strong><small>mm/min</small></span>
        </div>
      </div>
    </div>
  );
}
