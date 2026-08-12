"use client";

import { useState } from "react";
import { CheckoutPanel } from "@/components/CheckoutPanel";
import { Empalme } from "@/components/Empalme";
import { Footer } from "@/components/Footer";
import { GlifoPuerto } from "@/components/Glifos";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PlanCard } from "@/components/PlanCard";
import { TablaCron } from "@/components/TablaCron";
import { TrustBar } from "@/components/TrustBar";
import { CORREO_CONTACTO, HORAS_DE_ENTREGA } from "@/lib/contacto";
import { PLANS, type Plan } from "@/lib/plans";

const PASOS = [
  {
    titulo: "Pagas el nivel",
    texto:
      "Eliges el nivel y pagas con tarjeta o Nequi sin salir de esta página. La pantalla de aprobación es tu comprobante: ahí está la referencia.",
  },
  {
    titulo: "Te llega el acceso",
    texto: `Dentro de las ${HORAS_DE_ENTREGA} horas siguientes te escribimos al correo que dejaste, con los videos y los flujos. Lo mandamos a mano, uno por uno.`,
  },
  {
    titulo: "Importas y ejecutas",
    texto:
      "Abres n8n, importas el .json del primer flujo y le das ejecutar. De ahí en adelante el curso va nodo por nodo, sin saltos.",
  },
];

const PREGUNTAS = [
  {
    pregunta: "¿Necesito saber programar?",
    respuesta:
      "No. Se escriben expresiones cortas como {{ $json.correo }} y se leen datos en JSON, que es una lista de campos con su valor. El nivel 1 empieza justo ahí, suponiendo que nunca lo has visto.",
  },
  {
    pregunta: "¿En qué computador corre esto?",
    respuesta:
      "n8n se instala en Windows, macOS o Linux, y también puede quedar en un servidor. En el nivel 1 lo dejamos corriendo en tu equipo; en el nivel 3 lo pasamos a un servidor para que no dependa de que tu computador esté prendido.",
  },
  {
    pregunta: "Pagué y no me llega el acceso.",
    respuesta: `Escribe a ${CORREO_CONTACTO} con la referencia del pedido (empieza por n8a-) o con el comprobante de Wompi. La entrega es manual y puede tardar hasta ${HORAS_DE_ENTREGA} horas: no hay correo automático que se te haya perdido en spam.`,
  },
  {
    pregunta: "¿Los flujos siguen sirviendo cuando n8n cambia de versión?",
    respuesta:
      "Los nodos cambian de nombre y de campos cada cierto tiempo. Por eso cada flujo se explica por dentro: si un nodo cambia, sabes qué hacía y lo vuelves a armar. Los .json se entregan tal como quedaron grabados.",
  },
  {
    pregunta: "¿Con qué puedo pagar?",
    respuesta:
      "Tarjeta de crédito o débito, con cuotas si quieres, y Nequi. No hay PSE ni transferencia bancaria porque obligan a salir del sitio a la página del banco.",
  },
  {
    pregunta: "¿Puedo llevar los tres niveles?",
    respuesta:
      "Sí, uno por uno: cada nivel es un pago aparte y no hay combo. El nivel 2 da por sabido lo del 1, y el 3 lo del 2, así que el orden importa más que el precio.",
  },
];

export default function Page() {
  const [planElegido, setPlanElegido] = useState<Plan | null>(null);

  return (
    <>
      <Header />

      <main>
        <Hero />

        <div className="mt-12">
          <TrustBar />
        </div>

        <div className="mx-auto max-w-6xl px-4">
          <Empalme rotulo="Tres niveles" />
        </div>

        <section id="niveles" className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="dato text-ambar">Catálogo</p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Del primer nodo al agente que trabaja solo
              </h2>
            </div>
            <p className="text-[0.9375rem] leading-relaxed text-gis lg:col-span-6 lg:pt-12">
              Cada nivel termina con flujos andando, no con teoría. Se diferencian en cuántos
              flujos armas, con qué se disparan y hasta dónde llegan: el 1 hace que algo corra
              solo, el 2 lo vuelve capaz de aguantar datos raros y errores, y el 3 le pone un
              agente de IA encima.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onElegir={setPlanElegido} />
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4">
          <Empalme rotulo="Hoja de cron" />
        </div>

        <TablaCron />

        <div className="mx-auto max-w-6xl px-4">
          <Empalme rotulo="Cómo llega" />
        </div>

        <section className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Cómo llega el curso
          </h2>

          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {PASOS.map((paso, indice) => (
              <li key={paso.titulo} className="relative border-2 border-reja bg-mesa/40">
                <div className="flex items-center gap-2 border-b-2 border-reja bg-mesa px-3 py-2">
                  <GlifoPuerto className="h-3 w-3 shrink-0 text-ambar" />
                  <span className="dato text-tiza">Paso {indice + 1}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-xl font-bold leading-tight">{paso.titulo}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-snug text-gis">{paso.texto}</p>
                </div>
                {/* El cable que sale hacia el paso siguiente. */}
                {indice < PASOS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-[-26px] top-[26px] hidden h-0.5 w-[26px] bg-reja md:block"
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <div className="mx-auto max-w-6xl px-4">
          <Empalme rotulo="Preguntas" />
        </div>

        <section className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Preguntas frecuentes
          </h2>

          <dl className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {PREGUNTAS.map(({ pregunta, respuesta }) => (
              <div key={pregunta} className="border-l-2 border-ambar pl-4">
                <dt className="font-display text-lg font-bold leading-snug">{pregunta}</dt>
                <dd className="mt-2 text-[0.9375rem] leading-relaxed text-gis">{respuesta}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <Footer />

      {planElegido ? (
        <CheckoutPanel plan={planElegido} onClose={() => setPlanElegido(null)} />
      ) : null}
    </>
  );
}
