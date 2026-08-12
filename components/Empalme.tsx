import { GlifoPuerto } from "@/components/Glifos";

// Separador: el empalme del cable entre dos tramos, con su rótulo. Es la misma
// pieza que une dos nodos en el lienzo, estirada de lado a lado.
export function Empalme({ rotulo }: { rotulo: string }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-3 py-12 sm:py-16">
      <span className="h-2.5 w-2.5 shrink-0 bg-reja" />
      <span className="h-0.5 min-w-4 flex-1 bg-reja" />
      <span className="flex min-w-0 shrink items-center gap-2 border-2 border-reja bg-mesa px-3 py-1.5">
        <GlifoPuerto className="h-2.5 w-2.5 shrink-0 text-ambar" />
        <span className="dato truncate text-gis">{rotulo}</span>
      </span>
      <span className="h-0.5 min-w-4 flex-1 bg-reja" />
      <span className="h-2.5 w-2.5 shrink-0 bg-reja" />
    </div>
  );
}
