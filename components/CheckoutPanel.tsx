"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GlifoPuerto } from "@/components/Glifos";
import { CORREO_CONTACTO, HORAS_DE_ENTREGA } from "@/lib/contacto";
import { buildReference } from "@/lib/orders";
import { formatCOP, type Plan } from "@/lib/plans";
import { digitsOnly, formatCardNumber, formatExpiry, tokenizeCard } from "@/lib/wompi-client";

type Fase = "form" | "procesando" | "aprobado" | "rechazado" | "expirado";
type Metodo = "CARD" | "NEQUI";

interface Props {
  plan: Plan;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CUOTAS = [1, 3, 6, 12, 24];

const ROTULO_FASE: Record<Fase, string> = {
  form: "Parámetros",
  procesando: "Ejecutando",
  aprobado: "Ejecución correcta",
  rechazado: "Nodo con error",
  expirado: "Sin respuesta todavía",
};

export function CheckoutPanel({ plan, onClose }: Props) {
  const [fase, setFase] = useState<Fase>("form");
  const [metodo, setMetodo] = useState<Metodo>("CARD");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [correoConfirma, setCorreoConfirma] = useState("");
  const [numero, setNumero] = useState("");
  const [vence, setVence] = useState("");
  const [cvc, setCvc] = useState("");
  const [cuotas, setCuotas] = useState(1);
  const [celular, setCelular] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [contratos, setContratos] = useState<{ terminos: string; datos: string } | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [copiada, setCopiada] = useState(false);

  const primerCampo = useRef<HTMLInputElement>(null);
  const referencia = useMemo(() => buildReference(plan.id), [plan.id]);

  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    primerCampo.current?.focus();

    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onClose();
    };
    window.addEventListener("keydown", alTeclear);

    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [onClose]);

  useEffect(() => {
    let vivo = true;
    fetch("/api/wompi/acceptance", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!vivo || !data) return;
        setContratos({ terminos: data.termsPermalink, datos: data.personalDataPermalink });
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, []);

  // Tiempo transcurrido, no barra de progreso: no sabemos cuánto falta.
  useEffect(() => {
    if (fase !== "procesando") return;
    setSegundos(0);
    const id = setInterval(() => setSegundos((valor) => valor + 1), 1000);
    return () => clearInterval(id);
  }, [fase]);

  // Lo que ve el navegador es cosmético: la confirmación real la trae el webhook.
  // Si el panel se cierra, el sondeo muere con el cleanup.
  useEffect(() => {
    if (!tx) return;
    let vivo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const limite = Date.now() + 5 * 60 * 1000;

    const consultar = async () => {
      if (!vivo) return;
      try {
        const res = await fetch(`/api/wompi/status/${tx}`, { cache: "no-store" });
        const data = (await res.json()) as { status?: string; statusMessage?: string | null };
        if (!vivo) return;

        if (data.status === "APPROVED") {
          setFase("aprobado");
          return;
        }
        if (data.status && ["DECLINED", "VOIDED", "ERROR"].includes(data.status)) {
          setMensaje(data.statusMessage ?? null);
          setFase("rechazado");
          return;
        }
      } catch {
        // Un fallo de red no decide nada: se vuelve a consultar.
      }
      if (!vivo) return;
      if (Date.now() > limite) {
        setFase("expirado");
        return;
      }
      timer = setTimeout(consultar, 2500);
    };

    timer = setTimeout(consultar, 2500);
    return () => {
      vivo = false;
      if (timer) clearTimeout(timer);
    };
  }, [tx]);

  const correosOk =
    EMAIL_RE.test(correo.trim()) &&
    correo.trim().toLowerCase() === correoConfirma.trim().toLowerCase();

  const tarjetaOk =
    digitsOnly(numero).length >= 13 &&
    /^(0[1-9]|1[0-2])\/\d{2}$/.test(vence) &&
    digitsOnly(cvc).length >= 3;

  const nequiOk = /^3\d{9}$/.test(digitsOnly(celular));

  const puedePagar =
    nombre.trim().length >= 3 && correosOk && acepta && (metodo === "CARD" ? tarjetaOk : nequiOk);

  async function pagar() {
    setError(null);
    setFase("procesando");

    let cardToken: string | undefined;
    if (metodo === "CARD") {
      const tokenizado = await tokenizeCard({ number: numero, expiry: vence, cvc, holder: nombre });
      if (!tokenizado.ok) {
        setError(tokenizado.messages.join(" "));
        setFase("form");
        return;
      }
      cardToken = tokenizado.token;
    }

    try {
      const res = await fetch("/api/wompi/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: referencia,
          email: correo.trim(),
          fullName: nombre.trim(),
          acceptedTerms: acepta,
          method: metodo,
          cardToken,
          installments: cuotas,
          phone: digitsOnly(celular),
        }),
      });

      const data = (await res.json()) as { id?: string; status?: string; error?: string };

      if (!res.ok || !data.id) {
        setError(data.error ?? "El pago no se pudo procesar.");
        setFase("form");
        return;
      }

      if (data.status === "APPROVED") {
        setFase("aprobado");
        return;
      }
      if (data.status && ["DECLINED", "VOIDED", "ERROR"].includes(data.status)) {
        setFase("rechazado");
        return;
      }
      setTx(data.id);
    } catch {
      setError("Se cayó la conexión. Revisa tu internet y vuelve a intentar.");
      setFase("form");
    }
  }

  async function copiarReferencia() {
    try {
      await navigator.clipboard.writeText(referencia);
      setCopiada(true);
    } catch {
      setCopiada(false);
    }
  }

  const transcurrido = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(
    segundos % 60,
  ).padStart(2, "0")}`;

  const asunto = encodeURIComponent(`Acceso al curso · ${referencia}`);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-cianotipo/90"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      {/* El panel de ejecución de n8n: se acopla al borde de abajo y ocupa todo
          el ancho, con la barra del nodo arriba y los parámetros dentro. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-ejecucion"
        className="anim-panel flex max-h-[92vh] w-full flex-col border-t-2 border-ambar bg-cianotipo"
      >
        <div className="shrink-0 border-b-2 border-reja bg-mesa px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="dato flex items-center gap-2 text-ambar">
                <GlifoPuerto className="h-2.5 w-2.5 shrink-0" />
                {ROTULO_FASE[fase]}
              </p>
              <h2 id="titulo-ejecucion" className="mt-2 truncate font-display text-xl font-bold">
                Nivel {plan.nivel} · {plan.name}
              </h2>
              <p className="dato mt-1 truncate text-gis">
                {plan.modules} módulos · {plan.flujos} flujos
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-dato text-xl font-bold text-ambar">{formatCOP(plan.priceCOP)}</p>
              <p className="dato mt-1 text-gis">Pago único</p>
              <button
                type="button"
                onClick={onClose}
                className="dato mt-2 text-tiza underline decoration-ambar decoration-2 underline-offset-4"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto w-full max-w-3xl">
            {fase === "form" ? (
              <form
                onSubmit={(evento) => {
                  evento.preventDefault();
                  if (puedePagar) void pagar();
                }}
                noValidate
              >
                <fieldset>
                  <legend className="dato text-gis">Dónde entra el acceso</legend>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <Campo etiqueta="Nombre completo" id="nombre" className="sm:col-span-2">
                      <input
                        ref={primerCampo}
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        autoComplete="name"
                        className={ESTILO_INPUT}
                        placeholder="Como aparece en tu tarjeta"
                      />
                    </Campo>

                    <Campo etiqueta="Correo para el acceso" id="correo">
                      <input
                        id="correo"
                        type="email"
                        inputMode="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        autoComplete="email"
                        className={ESTILO_INPUT}
                        placeholder="tucorreo@ejemplo.com"
                      />
                    </Campo>

                    <Campo etiqueta="Confirma el correo" id="correo2">
                      <input
                        id="correo2"
                        type="email"
                        inputMode="email"
                        value={correoConfirma}
                        onChange={(e) => setCorreoConfirma(e.target.value)}
                        autoComplete="email"
                        className={ESTILO_INPUT}
                        placeholder="Escríbelo otra vez"
                      />
                      {correoConfirma.length > 3 && !correosOk ? (
                        <p className="mt-1.5 font-dato text-[0.75rem] text-bermellon">
                          Los dos correos tienen que coincidir: ahí llega el acceso.
                        </p>
                      ) : null}
                    </Campo>
                  </div>
                  <p className="mt-3 text-[0.8125rem] leading-snug text-gis">
                    No pedimos contraseñas de ninguna otra cuenta. Solo tu nombre y el correo
                    donde quieres recibir el curso.
                  </p>
                </fieldset>

                <fieldset className="mt-8">
                  <legend className="dato text-gis">Medio de pago</legend>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(["CARD", "NEQUI"] as Metodo[]).map((opcion) => (
                      <button
                        key={opcion}
                        type="button"
                        aria-pressed={metodo === opcion}
                        onClick={() => setMetodo(opcion)}
                        className={`border-2 py-3 font-display text-xs font-bold uppercase tracking-widest ${
                          metodo === opcion
                            ? "border-ambar bg-ambar text-cianotipo"
                            : "border-reja bg-mesa text-tiza"
                        }`}
                      >
                        {opcion === "CARD" ? "Tarjeta" : "Nequi"}
                      </button>
                    ))}
                  </div>

                  {metodo === "CARD" ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Campo etiqueta="Número de la tarjeta" id="tarjeta" className="sm:col-span-2">
                        <input
                          id="tarjeta"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          value={numero}
                          onChange={(e) => setNumero(formatCardNumber(e.target.value))}
                          className={`${ESTILO_INPUT} font-dato`}
                          placeholder="4242 4242 4242 4242"
                        />
                      </Campo>
                      <div className="grid grid-cols-2 gap-3">
                        <Campo etiqueta="Vence (MM/AA)" id="vence">
                          <input
                            id="vence"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            value={vence}
                            onChange={(e) => setVence(formatExpiry(e.target.value))}
                            className={`${ESTILO_INPUT} font-dato`}
                            placeholder="09/28"
                          />
                        </Campo>
                        <Campo etiqueta="CVC" id="cvc">
                          <input
                            id="cvc"
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            value={cvc}
                            onChange={(e) => setCvc(digitsOnly(e.target.value).slice(0, 4))}
                            className={`${ESTILO_INPUT} font-dato`}
                            placeholder="123"
                          />
                        </Campo>
                      </div>
                      <Campo etiqueta="Cuotas" id="cuotas">
                        <select
                          id="cuotas"
                          value={cuotas}
                          onChange={(e) => setCuotas(Number(e.target.value))}
                          className={`${ESTILO_INPUT} font-dato`}
                        >
                          {CUOTAS.map((n) => (
                            <option key={n} value={n}>
                              {n === 1 ? "1 cuota" : `${n} cuotas`}
                            </option>
                          ))}
                        </select>
                      </Campo>
                    </div>
                  ) : (
                    <div className="mt-4 max-w-sm">
                      <Campo etiqueta="Celular de Nequi" id="celular">
                        <input
                          id="celular"
                          inputMode="tel"
                          autoComplete="tel-national"
                          value={celular}
                          onChange={(e) => setCelular(digitsOnly(e.target.value).slice(0, 10))}
                          className={`${ESTILO_INPUT} font-dato`}
                          placeholder="3001234567"
                        />
                      </Campo>
                      <p className="mt-2 font-dato text-[0.75rem] leading-snug text-gis">
                        Te llega una notificación a la app de Nequi para aprobar el cobro.
                      </p>
                    </div>
                  )}
                </fieldset>

                <label className="mt-8 flex cursor-pointer items-start gap-3 text-[0.875rem] leading-snug">
                  <input
                    type="checkbox"
                    checked={acepta}
                    onChange={(e) => setAcepta(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-ambar"
                  />
                  <span>
                    Acepto los <Contrato href={contratos?.terminos}>términos y condiciones</Contrato>{" "}
                    y la{" "}
                    <Contrato href={contratos?.datos}>autorización de datos personales</Contrato> de
                    la pasarela de pagos.
                  </span>
                </label>

                {error ? (
                  <p
                    role="alert"
                    className="mt-6 border-l-4 border-bermellon bg-mesa px-4 py-3 text-[0.875rem] leading-snug"
                  >
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={!puedePagar}
                  className="mt-6 w-full bg-ambar py-4 font-display text-sm font-bold uppercase tracking-widest text-cianotipo disabled:cursor-not-allowed disabled:border-2 disabled:border-reja disabled:bg-mesa disabled:text-gis"
                >
                  Ejecutar pago · {formatCOP(plan.priceCOP)}
                </button>

                <p className="dato mt-4 break-all text-center text-gis">Ref. {referencia}</p>
              </form>
            ) : null}

            {fase === "procesando" ? (
              <Estado
                titulo="Ejecutando"
                detalle={
                  metodo === "NEQUI"
                    ? "Abre la app de Nequi y aprueba el cobro. Este panel se actualiza solo."
                    : "Estamos esperando la respuesta del banco. No cierres el panel."
                }
              >
                <div className="mt-7 flex items-center gap-3 border-2 border-reja bg-mesa px-4 py-3">
                  <span className="anim-latido block h-2.5 w-2.5 shrink-0 bg-ambar" />
                  <p className="font-dato text-lg font-bold tracking-wider">{transcurrido}</p>
                  <p className="dato text-gis">Transcurrido</p>
                </div>
              </Estado>
            ) : null}

            {fase === "aprobado" ? (
              <Estado
                titulo="Ejecución correcta"
                detalle={`El pago quedó registrado. Esta pantalla es tu comprobante: el acceso se envía a mano a ${correo.trim()} dentro de las próximas ${HORAS_DE_ENTREGA} horas. No esperes un correo automático, no lo hay.`}
              >
                <dl className="mt-6 border-2 border-reja">
                  <Salida etiqueta="Correo de entrega" valor={correo.trim()} />
                  <Salida etiqueta="Referencia" valor={referencia} />
                  <Salida etiqueta="Id de transacción" valor={tx ?? "aprobada al instante"} />
                </dl>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void copiarReferencia()}
                    className="border-2 border-ambar px-4 py-3 font-display text-xs font-bold uppercase tracking-widest text-ambar"
                  >
                    {copiada ? "Referencia copiada" : "Copiar referencia"}
                  </button>
                  <a
                    href={`mailto:${CORREO_CONTACTO}?subject=${asunto}`}
                    className="border-2 border-reja px-4 py-3 font-display text-xs font-bold uppercase tracking-widest text-tiza"
                  >
                    Escribir a soporte
                  </a>
                </div>

                <p className="mt-5 text-[0.875rem] leading-relaxed text-gis">
                  Si pasadas {HORAS_DE_ENTREGA} horas no te ha llegado nada, escribe a{" "}
                  <span className="font-dato text-tiza">{CORREO_CONTACTO}</span> con esta
                  referencia o con el comprobante de Wompi y te respondemos con el acceso.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 w-full bg-ambar py-3.5 font-display text-sm font-bold uppercase tracking-widest text-cianotipo"
                >
                  Cerrar panel
                </button>
              </Estado>
            ) : null}

            {fase === "rechazado" ? (
              <Estado
                titulo="Nodo con error"
                detalle={
                  mensaje ??
                  "El banco no autorizó el cobro. No te descontamos nada: puedes intentar con otra tarjeta o con Nequi."
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    setTx(null);
                    setMensaje(null);
                    setFase("form");
                  }}
                  className="mt-6 w-full bg-ambar py-3.5 font-display text-sm font-bold uppercase tracking-widest text-cianotipo"
                >
                  Reintentar
                </button>
              </Estado>
            ) : null}

            {fase === "expirado" ? (
              <Estado
                titulo="Sigue ejecutando"
                detalle={`El banco todavía no responde, pero la transacción no se perdió. Cuando confirme, el acceso llega a ${correo.trim()} sin que tengas que hacer nada más.`}
              >
                <dl className="mt-6 border-2 border-reja">
                  <Salida etiqueta="Referencia" valor={referencia} />
                  <Salida etiqueta="Id de transacción" valor={tx ?? "sin id"} />
                </dl>
                <p className="mt-4 text-[0.875rem] leading-relaxed text-gis">
                  Guarda la referencia. Si en {HORAS_DE_ENTREGA} horas no hay noticias, escribe a{" "}
                  <span className="font-dato text-tiza">{CORREO_CONTACTO}</span>.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 w-full border-2 border-ambar py-3.5 font-display text-sm font-bold uppercase tracking-widest text-ambar"
                >
                  Cerrar panel
                </button>
              </Estado>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const ESTILO_INPUT =
  "w-full border-2 border-reja bg-mesa px-3 py-2.5 text-[0.9375rem] text-tiza placeholder:text-gis/60";

function Campo({
  etiqueta,
  id,
  className,
  children,
}: {
  etiqueta: string;
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="dato block pb-1.5 text-tiza">
        {etiqueta}
      </label>
      {children}
    </div>
  );
}

function Contrato({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) {
    return <span className="underline decoration-reja underline-offset-2">{children}</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-ambar decoration-2 underline-offset-2"
    >
      {children}
    </a>
  );
}

// La salida de un nodo: rótulo del campo y su valor, como en el panel de n8n.
function Salida({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-reja px-3 py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="dato shrink-0 text-gis sm:w-44">{etiqueta}</dt>
      <dd className="min-w-0 break-all font-dato text-[0.875rem] text-tiza">{valor}</dd>
    </div>
  );
}

function Estado({
  titulo,
  detalle,
  children,
}: {
  titulo: string;
  detalle: string;
  children?: React.ReactNode;
}) {
  return (
    <div aria-live="polite" className="py-1">
      <h3 className="font-display text-2xl font-bold leading-tight tracking-tight">{titulo}</h3>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-gis">{detalle}</p>
      {children}
    </div>
  );
}
