import type { Config } from "tailwindcss";

// Superficie dominante oscura (papel de cianotipo). Regla de contraste medida
// sobre `cianotipo` #0B2239, que es el fondo de todo el sitio:
//   tiza 14.5:1 · gis 7.5:1 · ambar 8:1 · bermellon 5.6:1  → texto pequeño OK.
//   Sobre `mesa` #12314E (nodos y paneles) baja a: tiza 6.5:1 · gis 6.2:1.
// El ámbar es el cable vivo: se usa como texto sobre cianotipo/mesa, o como
// fondo con texto cianotipo encima (8:1). Nunca gis sobre ámbar: cae a 1.7:1.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cianotipo: "#0B2239",
        mesa: "#12314E",
        reja: "#1D4468",
        tiza: "#E9EFF4",
        gis: "#9FB3C6",
        ambar: "#F5A524",
        bermellon: "#F2704A",
      },
      fontFamily: {
        display: ["var(--fuente-display)", "system-ui", "sans-serif"],
        dato: ["var(--fuente-dato)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
