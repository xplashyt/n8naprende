export interface Plan {
  id: string;
  name: string;
  nivel: number;
  priceCOP: number;
  modules: number;
  summary: string;
  includes: string[];
  popular?: boolean;
  flujos: number; // flujos terminados que se entregan en .json
  horasVideo: number;
  disparadores: string[]; // con qué arranca lo que construyes en este nivel
}

export const PLANS: Plan[] = [
  {
    id: "n8a-inicio",
    name: "Cableado",
    nivel: 1,
    priceCOP: 48900,
    modules: 5,
    summary: "Instalar n8n, entender el lienzo y dejar tu primer flujo corriendo solo.",
    includes: [
      "Instalar n8n en tu computador y abrir el lienzo por primera vez",
      "Los tres nodos con los que arranca todo: disparador manual, HTTP Request y Set",
      "Leer y escribir en una hoja de cálculo con una credencial que se reusa",
      "Programar un flujo con cron y qué pasa cuando el equipo está apagado",
      "Exportar el flujo a un archivo .json y volver a importarlo",
    ],
    flujos: 4,
    horasVideo: 3.5,
    disparadores: ["Manual", "Cron"],
  },
  {
    id: "n8a-medio",
    name: "Ramas y datos",
    nivel: 2,
    priceCOP: 69900,
    modules: 8,
    summary: "Webhooks, condiciones y errores: flujos que aguantan datos del mundo real.",
    includes: [
      "Webhooks: URL de prueba y URL de producción, y por qué no son la misma",
      "IF y Switch: partir el flujo en ramales según lo que traigan los datos",
      "Expresiones {{ $json.campo }}: fechas, textos y números sin escribir un programa",
      "Recorrer una lista ítem por ítem y unir el resultado de dos ramas",
      "Cuando un nodo falla: reintentos, ramal de error y aviso a tu celular",
      "Conectar Telegram y un formulario a un flujo que ya funciona",
    ],
    popular: true,
    flujos: 9,
    horasVideo: 6,
    disparadores: ["Manual", "Cron", "Webhook", "Formulario"],
  },
  {
    id: "n8a-pro",
    name: "Agentes de IA",
    nivel: 3,
    priceCOP: 89900,
    modules: 11,
    summary: "El nodo Agente con memoria y herramientas, y n8n corriendo en un servidor.",
    includes: [
      "El nodo Agente de IA: modelo, memoria y herramientas colgadas debajo",
      "Tus propios flujos convertidos en herramientas que el agente puede llamar",
      "Responder con tus documentos: cargarlos, trocearlos y consultarlos",
      "n8n en un servidor: variables de entorno, respaldos y que no se caiga",
      "Sub-flujos y versiones: cambiar algo sin romper lo que ya está en producción",
      "Cuánto cuesta cada ejecución de un agente y cómo medirlo antes de soltarlo",
    ],
    flujos: 14,
    horasVideo: 9,
    disparadores: ["Manual", "Cron", "Webhook", "Chat", "Otro flujo"],
  },
];

export function findPlan(id: string): Plan | undefined {
  return PLANS.find((plan) => plan.id === id);
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

// Las horas se muestran como en el lienzo: con coma decimal y sin ceros de más.
export function formatHoras(horas: number): string {
  return `${horas.toLocaleString("es-CO", { maximumFractionDigits: 1 })} h`;
}

export const TOTAL_FLUJOS = PLANS.reduce((suma, plan) => suma + plan.flujos, 0);
