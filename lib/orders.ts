import { findPlan, type Plan } from "@/lib/plans";

const PREFIX = "n8a";

// Los ids del catálogo ya empiezan por el prefijo ("n8a-inicio"), así que la
// referencia no lo repite: n8a-inicio-1753632000000.
export function buildReference(planId: string): string {
  return `${planId}-${Date.now()}`;
}

export interface ParsedReference {
  planId: string;
  plan: Plan;
  createdAt: number;
}

// Se parsea desde la derecha porque el id del plan contiene guiones: el último
// segmento es el timestamp y todo lo anterior es el id.
export function parseReference(reference: string): ParsedReference | null {
  const parts = reference.split("-");
  if (parts.length < 3) return null;
  if (parts[0] !== PREFIX) return null;

  const stamp = parts[parts.length - 1];
  if (!/^\d+$/.test(stamp)) return null;

  const planId = parts.slice(0, -1).join("-");
  const plan = findPlan(planId);
  if (!plan) return null;

  return { planId, plan, createdAt: Number(stamp) };
}
