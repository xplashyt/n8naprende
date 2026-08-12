"use client";

import { GlifoAgente, GlifoNodo, GlifoPuerto, GlifoRama } from "@/components/Glifos";
import { formatCOP, formatHoras, type Plan } from "@/lib/plans";

interface Props {
  plan: Plan;
  onElegir: (plan: Plan) => void;
}

function glifoDelNivel(nivel: number) {
  if (nivel <= 1) return GlifoNodo;
  if (nivel === 2) return GlifoRama;
  return GlifoAgente;
}

export function PlanCard({ plan, onElegir }: Props) {
  const Glifo = glifoDelNivel(plan.nivel);
  const destacado = plan.popular === true;

  return (
    <article
      className={`relative flex flex-col border-2 bg-mesa/40 ${
        destacado ? "border-ambar" : "border-reja"
      }`}
    >
      {/* Puertos de entrada y salida: la tarjeta es un nodo del lienzo. */}
      <span
        aria-hidden="true"
        className={`absolute -left-[6px] top-6 h-3 w-3 ${destacado ? "bg-ambar" : "bg-reja"}`}
      />
      <span
        aria-hidden="true"
        className={`absolute -right-[6px] top-6 h-3 w-3 ${destacado ? "bg-ambar" : "bg-reja"}`}
      />

      <div
        className={`flex items-center gap-2 border-b-2 px-4 py-2.5 ${
          destacado ? "border-ambar bg-ambar text-cianotipo" : "border-reja bg-mesa text-tiza"
        }`}
      >
        <Glifo className="h-4 w-4 shrink-0" />
        <span className="dato truncate">Nivel {plan.nivel}</span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-2xl font-bold leading-tight tracking-tight">
          {plan.name}
        </h3>
        <p className="mt-2 text-[0.9375rem] leading-snug text-gis">{plan.summary}</p>

        <p className="mt-5 font-dato text-3xl font-bold text-ambar">{formatCOP(plan.priceCOP)}</p>
        <p className="dato mt-1 text-gis">COP · pago único</p>

        <dl className="mt-5 grid grid-cols-3 border-y-2 border-reja">
          <div className="border-r-2 border-reja px-2 py-2.5">
            <dt className="dato text-gis">Módulos</dt>
            <dd className="mt-1 font-dato text-base font-bold">{plan.modules}</dd>
          </div>
          <div className="border-r-2 border-reja px-2 py-2.5">
            <dt className="dato text-gis">Flujos</dt>
            <dd className="mt-1 font-dato text-base font-bold">{plan.flujos}</dd>
          </div>
          <div className="px-2 py-2.5">
            <dt className="dato text-gis">Video</dt>
            <dd className="mt-1 font-dato text-base font-bold">{formatHoras(plan.horasVideo)}</dd>
          </div>
        </dl>

        <p className="dato mt-5 text-gis">Parámetros</p>
        <ul className="mt-3 space-y-2.5">
          {plan.includes.map((linea) => (
            <li key={linea} className="flex gap-2.5 text-[0.9375rem] leading-snug">
              <GlifoPuerto className="mt-1.5 h-2.5 w-2.5 shrink-0 text-ambar" />
              <span>{linea}</span>
            </li>
          ))}
        </ul>

        <p className="dato mt-6 text-gis">Disparadores que dominas</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {plan.disparadores.map((disparador) => (
            <li key={disparador} className="dato border border-reja px-2 py-1 text-tiza">
              {disparador}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onElegir(plan)}
          className={`mt-6 w-full py-3.5 font-display text-sm font-bold uppercase tracking-widest ${
            destacado
              ? "bg-ambar text-cianotipo"
              : "border-2 border-ambar bg-cianotipo text-ambar"
          }`}
        >
          Ejecutar · {formatCOP(plan.priceCOP)}
        </button>
      </div>
    </article>
  );
}
