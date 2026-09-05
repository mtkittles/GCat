"use client";
import { Component, type ReactNode } from "react";

/** Granica błędu: awaria widoku 3D nie może wywracać całej strony. */
export default class Sim3DBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) {
      return (
        <div className="sim-3d-fallback">
          <strong>Widok 3D został przerwany.</strong>
          <p>Najczęstsza przyczyna to wyłączona akceleracja sprzętowa w przeglądarce. W Brave sprawdź <code className="inline-code">brave://settings/system</code>, a w razie potrzeby <code className="inline-code">brave://gpu</code>. Symulacja 2D działa niezależnie i pokazuje ten sam tor narzędzia.</p>
          <button className="btn ghost w-fit" onClick={() => this.setState({ crashed: false })}>Spróbuj ponownie</button>
        </div>
      );
    }
    return this.props.children;
  }
}
