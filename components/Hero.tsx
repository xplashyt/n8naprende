import { Lienzo } from "@/components/Lienzo";
import { PLANS, TOTAL_FLUJOS } from "@/lib/plans";

export function Hero() {
  return (
    <section id="top" className="mx-auto max-w-6xl px-4 pb-4 pt-10 sm:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="dato text-ambar">Curso en video · {PLANS.length} niveles</p>

          <h1 className="mt-5 font-display text-[2.1rem] font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Que la tarea repetida la haga el flujo, no tú.
          </h1>

          <p className="mt-6 text-[1.0625rem] leading-relaxed text-gis">
            n8n es un lienzo: arrastras nodos, los conectas con un cable y eso queda
            corriendo solo. Cada hora, cada vez que llega un formulario, cada vez que
            alguien te escribe. Aquí lo aprendes en {PLANS.length} niveles, desde el primer
            nodo hasta el agente de IA que usa tus propios flujos como herramientas.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#niveles"
              className="bg-ambar px-5 py-3 font-display text-sm font-bold uppercase tracking-widest text-cianotipo"
            >
              Ver los {PLANS.length} niveles
            </a>
            <a
              href="#cron"
              className="border-2 border-reja px-5 py-3 font-display text-sm font-bold uppercase tracking-widest text-tiza"
            >
              Hoja de cron
            </a>
          </div>

          <p className="dato mt-6 text-gis">
            {TOTAL_FLUJOS} flujos en .json · pago único · sin suscripción
          </p>
        </div>

        {/* min-w-0: sin esto la columna no baja del ancho mínimo del lienzo y
            aparece scroll horizontal en toda la página. */}
        <div className="min-w-0 lg:col-span-7">
          <Lienzo />
        </div>
      </div>
    </section>
  );
}
