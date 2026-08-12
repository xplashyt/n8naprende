import { GlifoCron, GlifoPuerto } from "@/components/Glifos";
import { CAMPOS_CRON, LINEAS_CRON, NOTAS_CRON } from "@/lib/cron";

// La hoja que este oficio tendría pegada a la pared: las expresiones que se
// escriben en el disparador programado, listas para copiar.
export function TablaCron() {
  return (
    <section id="cron" className="mx-auto max-w-6xl px-4">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="dato text-ambar">Hoja de referencia</p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Los cinco campos del disparador programado
          </h2>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-gis">
            Toda la programación de un flujo cabe en cinco números separados por
            espacio. Esta tabla es para copiar y pegar en el campo{" "}
            <span className="font-dato text-tiza">Cron Expression</span>.
          </p>

          <div className="mt-6 border-2 border-reja">
            <div className="flex items-center gap-2 border-b-2 border-reja bg-mesa px-3 py-2">
              <GlifoCron className="h-4 w-4 shrink-0 text-ambar" />
              <span className="dato text-tiza">Orden de los campos</span>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2">
              {CAMPOS_CRON.map((campo, indice) => (
                <li key={campo.nombre} className="border-b border-r border-reja px-3 py-2.5">
                  <span className="font-dato text-lg font-bold text-ambar">
                    {indice + 1}. {campo.simbolo}
                  </span>
                  <p className="mt-0.5 text-[0.875rem] leading-tight">{campo.nombre}</p>
                  <p className="dato mt-1 text-gis">{campo.rango}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* min-w-0 para que la tabla ancha se desplace dentro de su caja y no
            estire la página entera. */}
        <div className="min-w-0 lg:col-span-8">
          <div className="overflow-x-auto border-2 border-reja">
            <table className="w-full min-w-[540px] border-collapse text-left">
              <thead>
                <tr className="bg-mesa">
                  <th scope="col" className="dato border-b-2 border-reja px-3 py-2.5 text-tiza">
                    Expresión
                  </th>
                  <th scope="col" className="dato border-b-2 border-reja px-3 py-2.5 text-tiza">
                    Cuándo dispara
                  </th>
                  <th scope="col" className="dato border-b-2 border-reja px-3 py-2.5 text-tiza">
                    Para qué se usa
                  </th>
                </tr>
              </thead>
              <tbody>
                {LINEAS_CRON.map((linea) => (
                  <tr key={linea.expresion} className="border-b border-reja last:border-b-0">
                    <td className="whitespace-nowrap px-3 py-2.5 font-dato text-[0.8125rem] font-bold text-ambar">
                      {linea.expresion}
                    </td>
                    <td className="px-3 py-2.5 text-[0.875rem] leading-snug">{linea.dispara}</td>
                    <td className="px-3 py-2.5 text-[0.875rem] leading-snug text-gis">
                      {linea.para}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-5 space-y-2.5">
            {NOTAS_CRON.map((nota) => (
              <li key={nota} className="flex gap-2.5 text-[0.875rem] leading-snug text-gis">
                <GlifoPuerto className="mt-1.5 h-2.5 w-2.5 shrink-0 text-bermellon" />
                <span>{nota}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
