import { NextResponse } from "next/server";
import { parseReference } from "@/lib/orders";
import { formatCOP } from "@/lib/plans";
import { verifyEventSignature, type WompiEvent } from "@/lib/wompi";

export const runtime = "nodejs";

// Un reintento de Wompi no debe duplicar la línea del log. Este Set vive en la
// memoria del proceso: con varias instancias, o tras un reinicio, no garantiza
// nada. Es suficiente mientras el sitio corra en un solo proceso.
const yaRegistradas = new Set<string>();

// El webhook es la única fuente de verdad del pago. No manda correos: deja la
// venta escrita en el log y el vendedor la ve también en el panel de Wompi.
export async function POST(request: Request) {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) {
    console.error("Falta WOMPI_EVENTS_SECRET");
    return NextResponse.json({ error: "Webhook mal configurado." }, { status: 500 });
  }

  let evento: WompiEvent;
  try {
    evento = (await request.json()) as WompiEvent;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  if (!verifyEventSignature(evento, secret)) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  const transaccion = evento.data?.transaction;
  if (!transaccion) return NextResponse.json({ ok: true });

  // La URL de eventos del comercio es una sola: si otro proyecto comparte
  // comercio, sus referencias no son nuestras y se ignoran en silencio.
  const parsed = parseReference(transaccion.reference ?? "");
  if (!parsed) return NextResponse.json({ ok: true });

  if (transaccion.status === "APPROVED" && !yaRegistradas.has(transaccion.id)) {
    yaRegistradas.add(transaccion.id);
    console.log(
      `[VENTA PAGADA] ${parsed.plan.name} (nivel ${parsed.plan.nivel}) | ref ${transaccion.reference} | tx ${transaccion.id} | ${
        transaccion.customer_email ?? "sin correo"
      } | ${formatCOP(Math.round(transaccion.amount_in_cents / 100))} | ${
        transaccion.payment_method_type ?? "medio desconocido"
      }`,
    );
  }

  // Con la firma verificada ya no hay nada que pueda fallar: siempre 200, para
  // que Wompi no reintente el mismo evento.
  return NextResponse.json({ ok: true });
}
