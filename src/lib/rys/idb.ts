/*
  Mały magazyn klucz → wartość w IndexedDB (przeglądarka): szkice, kopie automatyczne i kalka rysownika.
  localStorage ma ~5 MB i trzyma tylko tekst — obraz kalki i kilkanaście kopii by się nie zmieściły.
  Błędy (tryb prywatny, brak miejsca) nie przerywają pracy: odczyt zwraca undefined, zapis false.
*/
const DB = "gcat-rysownik", ST = "kv";
let dbp: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(ST);
    r.onsuccess = () => res(r.result);
    r.onerror = () => { dbp = null; rej(r.error); };
  });
  return dbp;
}
async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((res, rej) => {
    const rq = fn(db.transaction(ST, mode).objectStore(ST));
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}

export const idbGet = <T>(key: string): Promise<T | undefined> => run<T>("readonly", (s) => s.get(key) as IDBRequest<T>).catch(() => undefined);
export const idbSet = (key: string, val: unknown): Promise<boolean> => run("readwrite", (s) => s.put(val, key)).then(() => true, () => false);
export const idbDel = (key: string): Promise<void> => run("readwrite", (s) => s.delete(key)).then(() => undefined, () => undefined);
/** Wszystkie wpisy o kluczu zaczynającym się od `prefix`, w kolejności kluczy. */
export async function idbList<T>(prefix: string): Promise<[string, T][]> {
  const range = IDBKeyRange.bound(prefix, `${prefix}￿`);
  try {
    const [keys, vals] = await Promise.all([run<IDBValidKey[]>("readonly", (s) => s.getAllKeys(range)), run<T[]>("readonly", (s) => s.getAll(range) as IDBRequest<T[]>)]);
    return keys.map((k, i) => [String(k), vals[i]]);
  } catch { return []; }
}
