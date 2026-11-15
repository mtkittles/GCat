import { createElement } from "react";
import type { BasicFormField, FormFieldStoredValue } from "@keystatic/core";
import RysFieldInput from "@/components/rys/FieldInput";
import { H_DEFAULT, parseDoc, storeDoc, type StoredDoc } from "./model";

/*
  Własne pole Keystatic: rysunek z rysownika zapisany w pliku wpisu jako { h, items }.
  Zapis jest kanoniczny (storeDoc ∘ parseDoc), więc otwarcie i zapis bez zmian nie rusza pliku (test round-trip).
  Kształt obiektu = BasicFormField z @keystatic/core 0.6.9 (form/api.d.ts).
*/
export function rysunekPole({ label }: { label: string }): BasicFormField<StoredDoc> {
  const parse = (value: FormFieldStoredValue): StoredDoc => storeDoc(parseDoc(value ?? { h: H_DEFAULT, k: 1, items: [] }));
  return {
    kind: "form",
    label,
    Input: (props) => createElement(RysFieldInput, { value: props.value, onChange: props.onChange, label }),
    defaultValue: () => ({ h: H_DEFAULT, k: 1, items: [] }),
    parse,
    serialize: (value) => ({ value: value as unknown as FormFieldStoredValue }),
    validate: (value) => value,
    reader: { parse },
  };
}
