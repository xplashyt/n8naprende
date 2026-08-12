import { GlifoMarca } from "@/components/Glifos";
import { CORREO_CONTACTO, HORAS_DE_ENTREGA } from "@/lib/contacto";

export function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-reja bg-mesa/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
              <GlifoMarca className="h-5 w-7 shrink-0 text-ambar" />
              <span>
                <span className="text-ambar">n8n</span>aprende
              </span>
            </p>
            <p className="mt-3 text-[0.9375rem] leading-snug text-gis">
              Cursos en video para automatizar con n8n, del primer nodo al agente de IA.
            </p>
            <p className="dato mt-5 text-gis">Soporte y entrega</p>
            <a
              href={`mailto:${CORREO_CONTACTO}`}
              className="mt-1 block break-all font-dato text-base text-ambar underline decoration-2 underline-offset-4"
            >
              {CORREO_CONTACTO}
            </a>
            <p className="mt-2 text-[0.875rem] leading-snug text-gis">
              El acceso se envía a mano dentro de las {HORAS_DE_ENTREGA} horas siguientes al
              pago. Ese correo es el único canal.
            </p>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <p className="dato text-gis">Aviso legal</p>
            <div className="mt-3 space-y-3 text-[0.875rem] leading-relaxed text-gis">
              <p>
                Se vende contenido educativo en video. No se venden insumos, equipos ni
                licencias de software, y el precio no incluye ningún servicio de terceros que
                el estudiante decida contratar por su cuenta.
              </p>
              <p>
                No se garantizan resultados: lo que consigas depende de tu práctica, de tus
                datos y de las herramientas que conectes.
              </p>
              <p>
                n8n, OpenAI, Google, Telegram y Nequi son marcas de sus respectivos dueños. No
                patrocinan ni respaldan estos cursos, y no tienen relación con este sitio.
              </p>
              <p>Los pagos los procesa Wompi. Nosotros nunca vemos ni guardamos tu tarjeta.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
