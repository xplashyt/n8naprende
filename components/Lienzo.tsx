// Motivo firma: el lienzo de n8n con un flujo real de cuatro nodos. Al cargar,
// la ejecución lo recorre —el cable se tiende desde el disparador y cada nodo se
// enciende cuando le llega— y termina exactamente en el estado que dice la barra
// de abajo: ejecución correcta, 5 ítems repartidos en dos ramas.

interface NodoProps {
  x: number;
  y: number;
  ancho: number;
  tipo: string;
  nombre: string;
  demora: number;
  disparador?: boolean;
}

const ALTO_NODO = 70;

function Nodo({ x, y, ancho, tipo, nombre, demora, disparador }: NodoProps) {
  return (
    <g className="anim-nodo" style={{ animationDelay: `${demora}ms` }}>
      <rect
        x={x}
        y={y}
        width={ancho}
        height={ALTO_NODO}
        className={`fill-mesa ${disparador ? "stroke-ambar" : "stroke-reja"}`}
        strokeWidth="2"
      />
      <rect
        x={x}
        y={y}
        width={ancho}
        height={22}
        className={disparador ? "fill-ambar" : "fill-reja"}
      />
      <text
        x={x + 10}
        y={y + 16}
        fontSize="11"
        letterSpacing="1.4"
        className={`font-dato ${disparador ? "fill-cianotipo" : "fill-tiza"}`}
      >
        {tipo}
      </text>
      <text
        x={x + 10}
        y={y + 48}
        fontSize="17"
        fontWeight="600"
        className="fill-tiza font-display"
      >
        {nombre}
      </text>
    </g>
  );
}

function Puerto({ x, y, demora }: { x: number; y: number; demora: number }) {
  return (
    <rect
      x={x - 5}
      y={y - 5}
      width="10"
      height="10"
      className="anim-puerto fill-ambar"
      style={{ animationDelay: `${demora}ms` }}
    />
  );
}

function Cable({ d, demora }: { d: string; demora: number }) {
  return (
    <path
      d={d}
      pathLength="100"
      fill="none"
      strokeWidth="2"
      className="anim-cable stroke-ambar"
      style={{ animationDelay: `${demora}ms` }}
    />
  );
}

function Conteo({ x, y, texto, demora }: { x: number; y: number; texto: string; demora: number }) {
  return (
    <text
      x={x}
      y={y}
      fontSize="11"
      textAnchor="end"
      className="anim-puerto fill-gis font-dato"
      style={{ animationDelay: `${demora}ms` }}
    >
      {texto}
    </text>
  );
}

export function Lienzo() {
  return (
    <figure className="border-2 border-reja bg-mesa/30">
      <figcaption className="flex items-center justify-between gap-3 border-b-2 border-reja bg-cianotipo px-3 py-2">
        <span className="dato truncate text-gis">aviso-de-pedido.json</span>
        <span className="dato flex shrink-0 items-center gap-2 text-ambar">
          <span className="anim-latido block h-2 w-2 bg-ambar" />
          Activo
        </span>
      </figcaption>

      {/* El lienzo se desplaza de lado, como en n8n. La columna que lo contiene
          lleva min-w-0 para que este scroll no empuje el ancho de la página. */}
      <div className="lienzo overflow-x-auto">
        <svg
          viewBox="0 0 600 340"
          role="img"
          aria-label="Lienzo con cuatro nodos: un disparador de tipo webhook lleva a un nodo IF, que reparte en dos ramas: agregar fila a una hoja de cálculo y avisar por Telegram."
          className="block h-auto w-full min-w-[560px]"
        >
          <Cable d="M164,171 H236" demora={140} />
          <Cable d="M376,157 H408 V79 H440" demora={560} />
          <Cable d="M376,185 H408 V261 H440" demora={560} />

          <Nodo x={12} y={136} ancho={152} tipo="WEBHOOK" nombre="Pedido nuevo" demora={0} disparador />
          <Nodo x={236} y={136} ancho={140} tipo="IF" nombre="¿Trae correo?" demora={420} />
          <Nodo x={440} y={44} ancho={148} tipo="HOJA DE CÁLCULO" nombre="Agregar fila" demora={760} />
          <Nodo x={440} y={226} ancho={148} tipo="TELEGRAM" nombre="Avisar al celular" demora={760} />

          <Puerto x={164} y={171} demora={140} />
          <Puerto x={236} y={171} demora={420} />
          <Puerto x={376} y={157} demora={560} />
          <Puerto x={376} y={185} demora={560} />
          <Puerto x={440} y={79} demora={760} />
          <Puerto x={440} y={261} demora={760} />

          <text
            x={404}
            y={104}
            fontSize="11"
            textAnchor="end"
            className="anim-puerto fill-tiza font-dato"
            style={{ animationDelay: "600ms" }}
          >
            verdadero
          </text>
          <text
            x={404}
            y={236}
            fontSize="11"
            textAnchor="end"
            className="anim-puerto fill-tiza font-dato"
            style={{ animationDelay: "600ms" }}
          >
            falso
          </text>

          <Conteo x={232} y={162} texto="5 ítems" demora={400} />
          <Conteo x={436} y={68} texto="3 ítems" demora={900} />
          <Conteo x={436} y={250} texto="2 ítems" demora={900} />
        </svg>
      </div>

      <div className="anim-nodo flex flex-wrap items-center gap-x-4 gap-y-1 border-t-2 border-reja bg-cianotipo px-3 py-2" style={{ animationDelay: "900ms" }}>
        <span className="dato flex items-center gap-2 text-ambar">
          <span className="block h-2 w-2 bg-ambar" />
          Ejecución correcta
        </span>
        <span className="dato text-gis">412 ms</span>
        <span className="dato text-gis">4 nodos · 5 ítems</span>
      </div>
    </figure>
  );
}
