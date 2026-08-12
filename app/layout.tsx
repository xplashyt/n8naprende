import type { Metadata } from "next";
import { Azeret_Mono, Chakra_Petch } from "next/font/google";
import "./globals.css";

const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--fuente-display",
  display: "swap",
});

const dato = Azeret_Mono({
  subsets: ["latin"],
  variable: "--fuente-dato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "n8naprende · Automatiza con n8n en tres niveles",
  description:
    "Cursos en video para automatizar tareas con n8n: del primer nodo del lienzo al agente de IA que usa tus propios flujos como herramientas. Pago único.",
  openGraph: {
    title: "n8naprende · Automatiza con n8n en tres niveles",
    description:
      "Del primer nodo del lienzo al agente de IA. Tres niveles, pago único, flujos en .json listos para importar.",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body className={`${display.variable} ${dato.variable} font-display antialiased`}>
        {children}
      </body>
    </html>
  );
}
