import { wompiBaseUrl } from "@/lib/wompi-env";
import { clasificarErrorPasarela } from "@/lib/payment-errors";

// NAVEGADOR. El número y el CVC de la tarjeta se cambian por un token aquí mismo:
// nunca pasan por nuestro servidor ni por nuestros logs. No mover al backend.

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCardNumber(value: string): string {
  return digitsOnly(value)
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export interface CardInput {
  number: string;
  expiry: string;
  cvc: string;
  holder: string;
}

function mensajeClasificado(falla: Parameters<typeof clasificarErrorPasarela>[0]): string {
  const clasificado = clasificarErrorPasarela(falla);
  return `${clasificado.mensaje} ${clasificado.consejo ?? ""}`.trim();
}

export async function tokenizeCard(
  card: CardInput,
): Promise<{ ok: true; token: string } | { ok: false; messages: string[] }> {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  if (!publicKey) {
    return { ok: false, messages: ["La pasarela no está configurada."] };
  }

  const [month, year] = card.expiry.split("/");

  let response: Response;
  try {
    response = await fetch(`${wompiBaseUrl(publicKey)}/tokens/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicKey}`,
      },
      body: JSON.stringify({
        number: digitsOnly(card.number),
        cvc: digitsOnly(card.cvc),
        exp_month: (month ?? "").padStart(2, "0"),
        exp_year: (year ?? "").slice(-2),
        card_holder: card.holder.trim(),
      }),
    });
  } catch (error) {
    console.error("No se pudo contactar a Wompi (tokenización):", error);
    return { ok: false, messages: [mensajeClasificado({ redCaida: true })] };
  }

  const raw = await response.text();
  let payload: { status?: string; data?: { id?: string }; error?: { type?: string } & Record<string, unknown> } = {};
  let isJson = true;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      isJson = false;
    }
  }

  if (!response.ok || !payload.data?.id) {
    console.error(
      "Tokenización rechazada",
      response.status,
      isJson ? JSON.stringify(payload.error ?? payload) : raw.slice(0, 500),
    );

    if (!isJson) {
      return { ok: false, messages: [mensajeClasificado({ httpStatus: response.status, respuestaNoJson: true })] };
    }

    const found = leafMessages(payload.error);
    if (found.length > 0) return { ok: false, messages: found };

    const tipoError = payload.error?.type ?? null;
    return {
      ok: false,
      messages: [mensajeClasificado({ httpStatus: response.status, wompiErrorType: tipoError })],
    };
  }

  return { ok: true, token: payload.data.id };
}

function leafMessages(error: unknown): string[] {
  const found: string[] = [];
  const walk = (node: unknown) => {
    if (typeof node === "string") found.push(node);
    else if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === "object") Object.values(node).forEach(walk);
  };
  walk(error);
  return Array.from(new Set(found.filter((text) => text.trim().length > 1))).slice(0, 3);
}
