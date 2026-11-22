import { diagrams } from "@/components/diagrams";

/*
  Nazwy komponentów dozwolonych w treści i id rysunków — dla loadera i walidacji przy buildzie,
  bez importu komponentów React (symulator itd.). Zgodność z mapą w components.tsx pilnuje test.
*/
export const componentNames = ["Term", "Diagram", "Rys", "Obraz", "Note", "Code", "Sim", "Demo", "Widget", "Table", "Kolor", "Wzor"];
export const diagramIds = new Set(Object.keys(diagrams));
