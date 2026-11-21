import SimPage from "./SimPage";
export const metadata = { title: "Symulator G-kodu — GCat" };
/* Nagłówek strony dla czytników ekranu — widok symulatora nie ma tytułu na ekranie (pasek nad treścią pokazuje dział). */
export default function Page() {
  return (
    <>
      <h1 className="sr-only">Symulator G-kodu 2D/3D</h1>
      <SimPage />
    </>
  );
}
