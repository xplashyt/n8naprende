import { GlifoMarca } from "@/components/Glifos";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-reja bg-cianotipo">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <a href="#top" className="flex min-w-0 items-center gap-2">
          <GlifoMarca className="h-5 w-7 shrink-0 text-ambar" />
          <span className="truncate font-display text-lg font-bold tracking-tight">
            <span className="text-ambar">n8n</span>aprende
          </span>
        </a>

        {/* Dos rótulos: el largo desborda a 360 px. */}
        <a
          href="#niveles"
          className="shrink-0 border-2 border-ambar px-3 py-1.5 font-display text-xs font-bold uppercase tracking-widest text-ambar"
        >
          <span className="sm:hidden">Niveles</span>
          <span className="hidden sm:inline">Ver los tres niveles</span>
        </a>
      </div>
    </header>
  );
}
