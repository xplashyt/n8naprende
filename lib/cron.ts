export interface LineaCron {
  expresion: string;
  dispara: string;
  para: string;
}

// Cron estándar de cinco campos, que es el que acepta el disparador programado
// de n8n. Cada línea está escrita para poder copiarse tal cual.
export const CAMPOS_CRON = [
  { simbolo: "*", nombre: "minuto", rango: "0-59" },
  { simbolo: "*", nombre: "hora", rango: "0-23" },
  { simbolo: "*", nombre: "día del mes", rango: "1-31" },
  { simbolo: "*", nombre: "mes", rango: "1-12" },
  { simbolo: "*", nombre: "día de semana", rango: "0-6 · 0 = domingo" },
];

export const LINEAS_CRON: LineaCron[] = [
  {
    expresion: "*/5 * * * *",
    dispara: "Cada 5 minutos, todo el día",
    para: "Sondear un servicio que no tiene webhook",
  },
  {
    expresion: "0 * * * *",
    dispara: "En el minuto 0 de cada hora",
    para: "Resumen por hora sin saturar la API",
  },
  {
    expresion: "0 7 * * 1-5",
    dispara: "7:00, de lunes a viernes",
    para: "El reporte que quieres leer antes de empezar",
  },
  {
    expresion: "*/15 9-18 * * 1-5",
    dispara: "Cada 15 min entre 9:00 y 18:45, L-V",
    para: "Revisar pedidos solo en horario de atención",
  },
  {
    expresion: "0 3 * * *",
    dispara: "3:00 de la mañana, todos los días",
    para: "Respaldos y limpiezas: nadie está mirando",
  },
  {
    expresion: "30 18 * * 5",
    dispara: "Viernes a las 18:30",
    para: "Cierre de semana y envío del consolidado",
  },
  {
    expresion: "0 12 1,15 * *",
    dispara: "Mediodía del 1 y del 15",
    para: "Quincenas: cobros y recordatorios",
  },
  {
    expresion: "0 0 1 * *",
    dispara: "Medianoche del primer día del mes",
    para: "Cortar el mes y armar la facturación",
  },
  {
    expresion: "15 2 * * 0",
    dispara: "Domingos a las 2:15",
    para: "Borrar archivos temporales de la semana",
  },
  {
    expresion: "0 9 * * 1",
    dispara: "Lunes a las 9:00",
    para: "Abrir la semana con la lista de pendientes",
  },
];

export const NOTAS_CRON = [
  "Cinco campos separados por espacio. n8n acepta además un sexto campo al principio para los segundos: úsalo solo si de verdad lo necesitas.",
  "La hora sale de la zona horaria configurada en n8n, no de la de tu navegador. Revísala antes de confiar en el disparo: es el error más común.",
  "Si el equipo está apagado a la hora del disparo, esa ejecución no se recupera después. No hay cola de atrasados.",
  "Punto de partida: si llenas día del mes y día de la semana a la vez, la mayoría de los programadores disparan cuando se cumple cualquiera de los dos, no los dos. Compruébalo en tu versión.",
];
