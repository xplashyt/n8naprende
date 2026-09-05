// Clasificación de errores de pago, compartida entre navegador y servidor.
//
// Sin imports (ni de Node ni de Wompi): así el checkout y las rutas de API
// usan exactamente el mismo criterio para decidir qué mensaje mostrarle a
// quien está pagando. Módulo isomorfo, igual que lib/wompi-env.ts.
//
// Hay dos fuentes de error muy distintas y este archivo las separa a propósito:
//
// 1. RECHAZO DEL EMISOR (clasificarRechazo): la transacción SÍ se creó y
//    Wompi la dejó en DECLINED/ERROR. El motivo llega como texto libre del
//    adquirente en status_message ("Fondos insuficientes", "Tarjeta
//    vencida"...). No existe una lista cerrada de códigos para esto —es
//    texto que viene del banco emisor—, así que esto es reconocimiento de
//    patrones con un mensaje de respaldo que NUNCA oculta el motivo real que
//    dio el banco cuando no reconocemos el patrón.
//
// 2. FALLA DE LA PASARELA (clasificarErrorPasarela): la transacción ni
//    siquiera se pudo crear —Wompi respondió 403/429/5xx, no respondió JSON
//    (típico de un bloqueo de firewall/WAF delante de su API), o la red
//    falló antes de llegar—. Esto sí se puede clasificar con certeza porque
//    se observa directamente en la respuesta del fetch. Un 403 (o una
//    respuesta que no es JSON) es la señal disponible de que la IP o la red
//    de origen quedó bloqueada por seguridad —Wompi no manda un mensaje
//    literal de "IP baneada", pero esa es la causa real detrás de ese código.

export type CodigoErrorPago =
  | "FONDOS_INSUFICIENTES"
  | "TARJETA_VENCIDA"
  | "CVC_INVALIDO"
  | "TARJETA_INVALIDA"
  | "TARJETA_RESTRINGIDA"
  | "TARJETA_ROBADA_PERDIDA"
  | "SOSPECHA_FRAUDE"
  | "LIMITE_EXCEDIDO"
  | "EMISOR_NO_DISPONIBLE"
  | "NEQUI_RECHAZADO"
  | "NEQUI_EXPIRADO"
  | "RECHAZO_EMISOR"
  | "ACCESO_BLOQUEADO"
  | "DEMASIADOS_INTENTOS"
  | "CONFIGURACION_INVALIDA"
  | "PASARELA_NO_DISPONIBLE"
  | "SIN_CONEXION"
  | "SOLICITUD_INVALIDA"
  | "DESCONOCIDO";

export interface ErrorPago {
  codigo: CodigoErrorPago;
  mensaje: string;
  consejo?: string;
}

// Minúsculas y sin tildes, para que el patrón no dependa de cómo acentuó el banco el texto.
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Ordenados de más a menos específico: se evalúan en orden y gana el primero que calce.
const PATRONES_RECHAZO: ReadonlyArray<{
  test: RegExp;
  codigo: CodigoErrorPago;
  mensaje: string;
  consejo: string;
}> = [
  {
    test: /fondos insuficientes|saldo insuficiente|insufficient funds/,
    codigo: "FONDOS_INSUFICIENTES",
    mensaje: "Tu banco rechazó el pago por fondos insuficientes.",
    consejo: "Verifica el saldo o el cupo disponible, o intenta con otra tarjeta.",
  },
  {
    test: /tarjeta (vencida|expirada)|expired card/,
    codigo: "TARJETA_VENCIDA",
    mensaje: "La tarjeta está vencida.",
    consejo: "Revisa la fecha de vencimiento o usa otra tarjeta.",
  },
  {
    test: /codigo de seguridad|cvv|cvc invalido|security code/,
    codigo: "CVC_INVALIDO",
    mensaje: "El código de seguridad (CVC) no es correcto.",
    consejo: "Verifica los dígitos del reverso de la tarjeta (o el frente, en Amex).",
  },
  {
    test: /robada|perdida|stolen|lost card/,
    codigo: "TARJETA_ROBADA_PERDIDA",
    mensaje: "El banco bloqueó esta tarjeta por reporte de robo o pérdida.",
    consejo: "Contacta a tu banco o utiliza otra tarjeta.",
  },
  {
    test: /restringida|bloqueada|no habilitada|restricted card/,
    codigo: "TARJETA_RESTRINGIDA",
    mensaje: "La tarjeta está restringida para este tipo de compra.",
    consejo: "Habilita las compras por internet con tu banco o usa otra tarjeta.",
  },
  {
    test: /fraude|sospech|actividad inusual|suspected fraud/,
    codigo: "SOSPECHA_FRAUDE",
    mensaje: "El banco bloqueó el pago por seguridad (posible fraude).",
    consejo: "Contacta a tu banco para autorizar la compra, o intenta con otro medio de pago.",
  },
  {
    test: /excede|limite|monto maximo|exceeds/,
    codigo: "LIMITE_EXCEDIDO",
    mensaje: "El monto supera el límite habilitado para esta tarjeta.",
    consejo: "Prueba con otra tarjeta o consulta tu límite de compras en línea con tu banco.",
  },
  {
    test: /emisor no disponible|issuer unavailable|no se pudo contactar/,
    codigo: "EMISOR_NO_DISPONIBLE",
    mensaje: "No pudimos comunicarnos con tu banco.",
    consejo: "Intenta de nuevo en unos minutos o usa otra tarjeta.",
  },
  {
    test: /tarjeta invalida|numero de tarjeta invalido|invalid card/,
    codigo: "TARJETA_INVALIDA",
    mensaje: "El número de la tarjeta no es válido para tu banco.",
    consejo: "Revisa los dígitos o intenta con otra tarjeta.",
  },
  {
    test: /rechazad[oa] por el cliente|cancelad[oa] por el usuario/,
    codigo: "NEQUI_RECHAZADO",
    mensaje: "Rechazaste el pago desde la app de Nequi.",
    consejo: "Si fue sin querer, intenta de nuevo y aprueba la notificación.",
  },
  {
    test: /expir|tiempo de espera|timeout/,
    codigo: "NEQUI_EXPIRADO",
    mensaje: "La notificación de pago expiró antes de que la aprobaras.",
    consejo: "Intenta de nuevo y aprueba la notificación en Nequi apenas te llegue.",
  },
];

// Traduce el status_message de una transacción DECLINED/ERROR a un mensaje
// claro y accionable. Si no reconoce el patrón, conserva el motivo original
// del banco en vez de esconderlo: es información real que el emisor envió.
export function clasificarRechazo(statusMessage: string | null | undefined): ErrorPago {
  const razon = statusMessage?.trim();

  if (razon) {
    const normalizada = normalizar(razon);
    for (const patron of PATRONES_RECHAZO) {
      if (patron.test.test(normalizada)) {
        return { codigo: patron.codigo, mensaje: patron.mensaje, consejo: patron.consejo };
      }
    }
    return {
      codigo: "RECHAZO_EMISOR",
      mensaje: `Tu banco rechazó la transacción: ${razon}.`,
      consejo: "Contacta a tu banco, prueba con otra tarjeta o paga con Nequi.",
    };
  }

  return {
    codigo: "RECHAZO_EMISOR",
    mensaje: "El banco rechazó la transacción.",
    consejo: "Prueba con otra tarjeta, revisa tu cupo o paga con Nequi.",
  };
}

// Lo que la capa de red SÍ puede observar con certeza sobre una falla de la pasarela.
export interface FallaPasarela {
  // true si el fetch nunca obtuvo respuesta (DNS, timeout, sin internet…).
  redCaida?: boolean;
  // true si la respuesta no fue JSON válido (típico de una página de bloqueo de un WAF).
  respuestaNoJson?: boolean;
  httpStatus?: number;
  wompiErrorType?: string | null;
}

// Clasifica una falla al CREAR el pago (tokenización, /merchants o
// /transactions), es decir, antes de que exista una transacción con estado.
// A diferencia del rechazo del emisor, esto sí se puede determinar con
// certeza porque se observa directamente en la respuesta HTTP.
export function clasificarErrorPasarela(falla: FallaPasarela): ErrorPago {
  if (falla.redCaida) {
    return {
      codigo: "SIN_CONEXION",
      mensaje: "No pudimos conectar con la pasarela de pagos.",
      consejo: "Revisa tu conexión a internet e intenta de nuevo.",
    };
  }

  const status = falla.httpStatus ?? 0;

  if (status === 429) {
    return {
      codigo: "DEMASIADOS_INTENTOS",
      mensaje: "Hiciste demasiados intentos de pago seguidos.",
      consejo: "Espera un par de minutos antes de volver a intentarlo.",
    };
  }

  if (status === 401) {
    return {
      codigo: "CONFIGURACION_INVALIDA",
      mensaje: "La pasarela de pagos rechazó la conexión del comercio.",
      consejo: "No es un problema de tu tarjeta; escríbenos para resolverlo.",
    };
  }

  // Un 403 —o una respuesta que no es JSON, típico de una página HTML de
  // bloqueo de Cloudflare/WAF— es la señal disponible de que la IP o la red
  // de origen quedó bloqueada por el filtro de seguridad de la pasarela: VPN,
  // proxy, rango de datacenter, o demasiados intentos fallidos previos.
  if (status === 403 || falla.respuestaNoJson) {
    return {
      codigo: "ACCESO_BLOQUEADO",
      mensaje: "La pasarela de pagos bloqueó esta conexión por seguridad.",
      consejo:
        "Si usas VPN o proxy, desactívalo. Si no, intenta desde otra red o dispositivo, o escríbenos.",
    };
  }

  if (status >= 500) {
    return {
      codigo: "PASARELA_NO_DISPONIBLE",
      mensaje: "La pasarela de pagos no está respondiendo en este momento.",
      consejo: "No se realizó ningún cobro. Intenta de nuevo en unos minutos.",
    };
  }

  if (status === 400 || status === 422 || falla.wompiErrorType === "INPUT_VALIDATION_ERROR") {
    return {
      codigo: "SOLICITUD_INVALIDA",
      mensaje: "Los datos del pago no fueron aceptados por la pasarela.",
      consejo: "Recarga la página e inténtalo de nuevo.",
    };
  }

  return {
    codigo: "DESCONOCIDO",
    mensaje: "No pudimos procesar el pago en este momento.",
    consejo: "No se realizó ningún cobro; intenta de nuevo.",
  };
}
