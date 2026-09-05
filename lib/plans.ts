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
    priceCOP: 4000,
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
    id: "n8a-credenciales",
    name: "Credenciales y HTTP a fondo",
    nivel: 1.5,
    priceCOP: 10000,
    modules: 4,
    summary:
      "Todo lo del Nivel 1 más las credenciales bien hechas y el nodo HTTP Request explotado a fondo.",
    includes: [
      "Incluye completo el Nivel 1.",
      "Credenciales en n8n: por qué no se pegan las llaves directo en el nodo",
      "HTTP Request a fondo: query params, headers y cuerpo en cada método",
      "Autenticación: API key, Bearer token y OAuth2 explicados con ejemplos reales",
      "Paginación: traer 500 registros cuando la API solo entrega de a 20",
    ],
    flujos: 5,
    horasVideo: 2.5,
    disparadores: ["Manual", "Cron"],
  },
  {
    id: "n8a-datos",
    name: "Datos y transformación",
    nivel: 1.8,
    priceCOP: 25000,
    modules: 5,
    summary:
      "Todo lo del Nivel 1 más darle forma a los datos antes de un Set, y el nodo Code para lo que Set no alcanza.",
    includes: [
      "Incluye completo el Nivel 1.",
      "Fechas: zona horaria, formato y por qué la hora de n8n no es la tuya",
      "Funciones de texto y número dentro de una expresión",
      "El nodo Code: cuándo un poco de JavaScript reemplaza cinco nodos",
      "Conectar una base de datos con el nodo Postgres/MySQL, sin salir de aquí",
    ],
    flujos: 6,
    horasVideo: 3,
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
    id: "n8a-servicios",
    name: "Servicios conectados",
    nivel: 2.5,
    priceCOP: 100000,
    modules: 6,
    summary:
      "Todo lo del Nivel 2 más Slack, correo y calendario, y llamar un flujo desde otro sin repetir nodos.",
    includes: [
      "Incluye completos los Niveles 1 y 2.",
      "Slack y Discord: enviar y recibir mensajes desde un flujo",
      "Correo con el nodo IMAP/SMTP: leer una bandeja y responder automático",
      "Calendario: crear y mover eventos desde un flujo",
      "Execute Workflow: llamar un flujo desde otro para no repetir los mismos nodos",
    ],
    flujos: 8,
    horasVideo: 4,
    disparadores: ["Manual", "Cron", "Webhook", "Formulario"],
  },
  {
    id: "n8a-lotes",
    name: "Lotes y monitoreo",
    nivel: 2.8,
    priceCOP: 150000,
    modules: 6,
    summary:
      "Todo lo del Nivel 2 más procesar miles de registros sin tumbar la API externa, y un panel simple para saber si algo se cayó.",
    includes: [
      "Incluye completos los Niveles 1 y 2.",
      "SplitInBatches: procesar 10.000 filas sin que el proveedor externo te bloquee",
      "Límites de velocidad (rate limit): esperar lo justo entre llamadas",
      "Panel simple de estado: un flujo que consulta si los demás siguen corriendo",
      "Bitácora de ejecuciones: qué mirar cuando algo salió distinto a lo esperado",
    ],
    flujos: 7,
    horasVideo: 4,
    disparadores: ["Manual", "Cron", "Webhook"],
  },
  {
    id: "n8a-pro",
    name: "Agentes de IA",
    nivel: 3,
    priceCOP: 494900,
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
