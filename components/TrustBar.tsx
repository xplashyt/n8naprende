import { GlifoArchivo, GlifoLlave, GlifoNodo } from "@/components/Glifos";
import { TOTAL_FLUJOS } from "@/lib/plans";

const HECHOS = [
  {
    rotulo: "Pago único",
    Glifo: GlifoLlave,
    texto: "Un solo pago por nivel. No hay suscripción, ni renovación, ni cobro mensual.",
  },
  {
    rotulo: `${TOTAL_FLUJOS} flujos en .json`,
    Glifo: GlifoArchivo,
    texto: "Los flujos se entregan como archivo: los importas al lienzo y quedan andando.",
  },
  {
    rotulo: "Tu equipo o un servidor",
    Glifo: GlifoNodo,
    texto: "n8n se instala gratis en tu computador. Aquí pagas el curso, no la herramienta.",
  },
];

export function TrustBar() {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {HECHOS.map(({ rotulo, texto, Glifo }) => (
          <div key={rotulo} className="border-2 border-reja bg-mesa/40">
            <div className="flex items-center gap-2 border-b-2 border-reja bg-mesa px-3 py-2">
              <Glifo className="h-4 w-4 shrink-0 text-ambar" />
              <span className="dato truncate text-tiza">{rotulo}</span>
            </div>
            <p className="px-3 py-3 text-[0.9375rem] leading-snug text-gis">{texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
