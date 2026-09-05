import { wompiBaseUrl, publicKeyOrThrow } from "@/lib/wompi-env";
import { clasificarErrorPasarela, type CodigoErrorPago } from "@/lib/payment-errors";

// SERVIDOR. Nada de este archivo puede importarse desde un componente cliente:
// usa la llave privada.

export interface AcceptanceTokens {
  acceptanceToken: string;
  personalDataToken: string;
  termsPermalink: string;
  personalDataPermalink: string;
}

interface AcceptanceLeaf {
  acceptance_token: string;
  permalink: string;
}

function privateKeyOrThrow(): string {
  const key = process.env.WOMPI_PRIVATE_KEY;
  if (!key) throw new Error("Falta WOMPI_PRIVATE_KEY en el entorno del servidor.");
  return key;
}

/** Falla de la pasarela ya clasificada (red caída, bloqueo de seguridad, Wompi caído...). */
export class ErrorPasarela extends Error {
  readonly codigo: CodigoErrorPago;
  constructor(codigo: CodigoErrorPago, mensaje: string) {
    super(mensaje);
    this.name = "ErrorPasarela";
    this.codigo = codigo;
  }
}

function lanzarFallaPasarela(falla: Parameters<typeof clasificarErrorPasarela>[0]): never {
  const clasificado = clasificarErrorPasarela(falla);
  throw new ErrorPasarela(clasificado.codigo, `${clasificado.mensaje} ${clasificado.consejo ?? ""}`.trim());
}

// Misma forma que el `{ ok: false }` de createTransaction: útil para no repetir
// la clasificación en cada punto de salida de esa función.
function resultadoFallaPasarela(
  falla: Parameters<typeof clasificarErrorPasarela>[0],
): { ok: false; messages: string[]; codigo: CodigoErrorPago } {
  const clasificado = clasificarErrorPasarela(falla);
  return {
    ok: false,
    messages: [`${clasificado.mensaje} ${clasificado.consejo ?? ""}`.trim()],
    codigo: clasificado.codigo,
  };
}

// Los tokens de aceptación caducan a la hora, así que se piden justo antes de cobrar.
export async function getAcceptanceTokens(): Promise<AcceptanceTokens> {
  const publicKey = publicKeyOrThrow();

  let response: Response;
  try {
    response = await fetch(`${wompiBaseUrl(publicKey)}/merchants/${publicKey}`, {
      cache: "no-store",
    });
  } catch (error) {
    console.error("No se pudo contactar a Wompi (merchants):", error);
    lanzarFallaPasarela({ redCaida: true });
  }

  const raw = await response.text();

  if (!response.ok) {
    console.error("Wompi /merchants respondió", response.status, raw.slice(0, 500));
    lanzarFallaPasarela({ httpStatus: response.status });
  }

  let payload: {
    data?: {
      presigned_acceptance?: AcceptanceLeaf;
      presigned_personal_data_auth?: AcceptanceLeaf;
    };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    console.error("Wompi /merchants no devolvió JSON válido:", raw.slice(0, 500));
    lanzarFallaPasarela({ respuestaNoJson: true });
  }

  const terms = payload.data?.presigned_acceptance;
  const personal = payload.data?.presigned_personal_data_auth;

  if (!terms || !personal) {
    console.error("Wompi /merchants respondió sin tokens de aceptación", payload);
    throw new Error("No pudimos consultar los términos de la pasarela.");
  }

  return {
    acceptanceToken: terms.acceptance_token,
    personalDataToken: personal.acceptance_token,
    termsPermalink: terms.permalink,
    personalDataPermalink: personal.permalink,
  };
}

export type PaymentMethodPayload =
  | { type: "CARD"; token: string; installments: number }
  | { type: "NEQUI"; phone_number: string };

export interface CreateTransactionInput {
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  fullName: string;
  phone?: string;
  paymentMethod: PaymentMethodPayload;
  signature: string;
  acceptance: AcceptanceTokens;
}

export interface WompiTransaction {
  id: string;
  status: string;
  reference: string;
  amount_in_cents: number;
  payment_method_type: string | null;
  status_message?: string | null;
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<
  | { ok: true; transaction: WompiTransaction }
  | { ok: false; messages: string[]; codigo?: CodigoErrorPago }
> {
  const publicKey = publicKeyOrThrow();

  let response: Response;
  try {
    response = await fetch(`${wompiBaseUrl(publicKey)}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${privateKeyOrThrow()}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        amount_in_cents: input.amountInCents,
        currency: input.currency,
        customer_email: input.customerEmail,
        reference: input.reference,
        signature: input.signature,
        acceptance_token: input.acceptance.acceptanceToken,
        accept_personal_auth: input.acceptance.personalDataToken,
        payment_method: input.paymentMethod,
        customer_data: {
          full_name: input.fullName,
          ...(input.phone ? { phone_number: input.phone } : {}),
        },
      }),
    });
  } catch (error) {
    console.error("No se pudo contactar a Wompi (transactions):", error);
    return resultadoFallaPasarela({ redCaida: true });
  }

  const raw = await response.text();
  let payload: { data?: WompiTransaction; error?: { type?: string } & Record<string, unknown> } = {};
  let isJson = true;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      isJson = false;
    }
  }

  if (!response.ok || !payload.data) {
    console.error(
      "Wompi rechazó la transacción",
      isJson ? JSON.stringify(payload) : raw.slice(0, 500),
    );

    // Si la respuesta ni siquiera es JSON (típico de un bloqueo de WAF), no
    // hay nada que extraer: la falla es de la pasarela, no de los datos.
    if (!isJson) {
      return resultadoFallaPasarela({ httpStatus: response.status, respuestaNoJson: true });
    }

    // Un mensaje de validación de Wompi se conserva tal cual: es información
    // concreta sobre lo que falló en la solicitud. Si no hay uno, la falla es
    // de la pasarela y se clasifica por el status HTTP.
    const found = collectMessages(payload);
    if (found.length > 0) {
      return { ok: false, messages: found };
    }

    const tipoError = payload.error?.type ?? null;
    return resultadoFallaPasarela({ httpStatus: response.status, wompiErrorType: tipoError });
  }

  return { ok: true, transaction: payload.data };
}

export async function getTransaction(id: string): Promise<WompiTransaction | null> {
  const publicKey = publicKeyOrThrow();

  let response: Response;
  try {
    response = await fetch(`${wompiBaseUrl(publicKey)}/transactions/${id}`, {
      headers: { Authorization: `Bearer ${privateKeyOrThrow()}` },
      cache: "no-store",
    });
  } catch (error) {
    console.error("No se pudo contactar a Wompi (consulta de transacción):", error);
    return null;
  }

  if (!response.ok) return null;

  const raw = await response.text();
  try {
    const payload = JSON.parse(raw) as { data?: WompiTransaction };
    return payload.data ?? null;
  } catch {
    console.error("Wompi /transactions/{id} no devolvió JSON válido:", raw.slice(0, 500));
    return null;
  }
}

// Los errores de validación de Wompi vienen anidados con profundidad variable
// ({ payment_method: { messages: { token: [...] } } }): solo nos sirven las hojas.
// No trae un mensaje de respaldo: si no encuentra nada, el llamador decide
// (normalmente, clasificando la falla por el status HTTP en vez de mostrar un
// genérico plano).
export function collectMessages(payload: unknown): string[] {
  const found: string[] = [];

  const walk = (node: unknown) => {
    if (typeof node === "string") {
      found.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === "object") {
      Object.values(node as Record<string, unknown>).forEach(walk);
    }
  };

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    walk(record.error ?? record.messages ?? record);
  }

  const unique = Array.from(new Set(found.filter((text) => text.trim().length > 1)));
  return unique.slice(0, 4);
}
