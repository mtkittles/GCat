import { diagrams } from "@/components/diagrams";

/*
  Nazwy komponentów dozwolonych w treści i id rysunków — dla loadera i walidacji przy buildzie,
  bez importu komponentów React (symulator itd.). Zgodność z mapą w components.tsx pilnuje test.
*/
export const componentNames = ["Term", "Diagram", "Note", "Code", "Sim", "Demo", "Widget", "Table"];
export const diagramIds = new Set(Object.keys(diagrams));
