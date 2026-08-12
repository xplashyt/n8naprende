# n8naprende

Sitio de una página que vende tres cursos en video sobre n8n (nivel 1 Cableado,
nivel 2 Ramas y datos, nivel 3 Agentes de IA), con checkout propio contra la API
REST de Wompi. Pago único por nivel, tarjeta o Nequi, sin salir del sitio.

Next.js 14 (App Router) + TypeScript + Tailwind 3. Sin librerías de UI, sin
iconos de librería y sin proveedor de correo.

## Cómo se corre

Todo nativo en el sistema operativo local, con el Node del host. No hay Docker,
ni docker-compose, ni WSL, ni nada que los invoque.

```bash
npm install
npm run dev
```

Antes de que el checkout sirva hay que llenar las cuatro variables de
`.env.local` (están vacías y comentadas paso a paso). Next las lee **solo al
arrancar**: si las llenas con el servidor prendido, hay que reiniciarlo.

Sin llaves, la página se ve completa y el formulario valida, pero
`/api/wompi/acceptance` responde 502 y el pago no se puede ejecutar. Es lo
esperado.

No corras `npm run build` con el servidor de desarrollo levantado: pisa `.next`
y el dev server queda roto.

## Cómo funciona el pago

1. El comprador abre el panel de ejecución (el checkout acoplado abajo) desde
   una tarjeta de nivel. Ahí mismo se arma la referencia:
   `n8a-<idPlan>-<timestamp>`, por ejemplo `n8a-medio-1753632000000`.
2. Si paga con tarjeta, el navegador cambia el número y el CVC por un token
   contra `POST {base}/tokens/cards` con la llave pública. **Esa llamada se
   queda en el navegador a propósito**: el número de la tarjeta nunca toca
   nuestro servidor ni nuestros logs, y eso es lo que nos deja fuera del alcance
   pesado de PCI DSS. No la muevas al backend.
3. `POST /api/wompi/pay` recibe el token (o el celular de Nequi), el nombre, el
   correo y la referencia. **El monto no viaja desde el navegador**: el servidor
   deriva el plan desde la referencia y calcula `priceCOP * 100`.
4. El servidor pide los tokens de aceptación (`GET {base}/merchants/{publicKey}`)
   justo antes de cobrar, porque caducan a la hora. Al navegador solo le llegan
   los *permalinks* de los contratos, nunca los tokens. Si `acceptedTerms` no es
   `true`, responde 400.
5. Firma de integridad: `sha256(referencia + montoEnCentavos + moneda + secreto)`,
   calculada en el servidor. **Verifica el orden de la concatenación contra la
   documentación vigente de Wompi antes de producción.**
6. Mientras la transacción está en `PENDING`, el navegador consulta
   `/api/wompi/status/[id]` cada 2500 ms, hasta 5 minutos. Si se agota, no dice
   que falló: dice que sigue en proceso. El sondeo muere si se cierra el panel.
7. **El webhook es la única fuente de verdad.** `POST /api/wompi/webhook`
   verifica la firma del evento (`sha256(valores de signature.properties +
   timestamp + secreto)` comparado con `timingSafeEqual`), responde 401 si no
   cuadra, y solo actúa si el estado es `APPROVED`. Al aprobar **no manda ningún
   correo**: escribe una línea `[VENTA PAGADA]` en el log con curso, referencia,
   id de transacción, correo del comprador, monto y medio de pago.
8. El ambiente sale de la llave pública: `pub_test_` → sandbox, cualquier otra →
   producción. No hay variable extra para eso.

La referencia se parsea **desde la derecha** porque el id del plan lleva guiones:
el último segmento es el timestamp y todo lo anterior es el id.

### Un comercio de Wompi por proyecto

La URL de eventos de un comercio es **una sola**. Si varios proyectos comparten
comercio, todos los avisos llegan al mismo sitio: este webhook ignora en
silencio las referencias que no empiecen por `n8a-`, así que los otros proyectos
simplemente no se enteran de sus ventas. Usa un comercio por proyecto.

## Decisiones de diseño

- **Dirección**: el lienzo de n8n visto como plano de instalación (cianotipo).
  Superficie azul de plano `#0B2239`, nodos y paneles en `#12314E`, retícula y
  bordes en `#1D4468`, tinta `#E9EFF4`, secundaria `#9FB3C6`. Dos acentos: ámbar
  `#F5A524` (el cable vivo: disparadores, precios, botón de pago) y bermellón
  `#F2704A` (advertencias y ramal de error). La regla de contraste está escrita
  como comentario en `tailwind.config.ts` y se respeta: todo el texto pequeño
  pasa 4.5:1 sobre las dos superficies.
- **Tipografías**: Chakra Petch (técnica, terminaciones cuadradas) para
  titulares e interfaz; Azeret Mono para todo lo que es dato: precios,
  expresiones cron, referencias, ids, rótulos.
- **Geometría**: radio 0, bordes de 2 px, puertos cuadrados y cables ortogonales.
  Nada de esquinas redondeadas ni sombras difusas.
- **Motivo firma** (`components/Lienzo.tsx`): un flujo de cuatro nodos
  —webhook → IF → hoja de cálculo / Telegram— sobre la retícula de puntos. Al
  cargar, la ejecución lo recorre: el cable se tiende desde el disparador y cada
  nodo se enciende cuando le llega, en poco más de un segundo. Termina en el
  estado que dice la barra de abajo: ejecución correcta, 5 ítems repartidos en
  3 y 2. Con `prefers-reduced-motion` desaparece entera y todo queda encendido.
- **Las tarjetas son nodos**: puerto de entrada y de salida a los lados, franja
  de tipo arriba y "Parámetros" en vez de "Incluye". Se diferencian por datos
  verdaderos (módulos, flujos, horas de video, disparadores que cubre), no por
  un sticker de "más popular".
- **El separador** es el empalme del cable entre dos tramos, con su rótulo.
- **El checkout** es el panel de ejecución acoplado al borde inferior, con las
  fases nombradas como estados de una ejecución: Parámetros, Ejecutando,
  Ejecución correcta, Nodo con error, Sin respuesta todavía.
- **Hoja de referencia**: las diez expresiones cron que de verdad se usan en el
  disparador programado, con los cinco campos explicados y cuatro advertencias
  (zona horaria, ejecuciones perdidas si el equipo está apagado, sexto campo de
  segundos, y el cruce entre día del mes y día de la semana).

## Verificado

- `npm install && npm run build` sin errores; `npx tsc --noEmit` limpio con
  `strict: true`.
- En navegador real, a 360 px y a 1440 px: sin scroll horizontal de página, sin
  avisos de hidratación en consola, el botón de pagar deshabilitado sin términos
  y con correos distintos, y Escape cierra el panel y devuelve el scroll.
- Los 502 de `/api/wompi/acceptance` sin llaves son esperados.

## Pendientes antes de vender de verdad

1. **Grabar el contenido.** El catálogo (`lib/plans.ts`) describe módulos,
   flujos y horas que todavía hay que producir. Los números son promesas: si
   cambian, cámbialos ahí.
2. **La entrega es manual.** Nadie envía correos: el comprador ve la referencia
   y el id de transacción en la pantalla de aprobación, y tú le mandas el acceso
   a mano dentro de las 12 horas que promete `lib/contacto.ts`. Si esa promesa
   no se puede cumplir, baja el número antes de publicar.
3. **El aviso de la venta también es manual.** Te enteras por el panel de Wompi
   (que ya notifica y muestra el correo del comprador) o por la línea
   `[VENTA PAGADA]` del log. El `Set` que evita líneas repetidas vive en memoria:
   no persiste, no sirve con varias instancias, y el log se pierde al reiniciar.
   Si un día importa, eso es una base de datos, no un parche.
4. **Correo de contacto real.** `hola@n8naprende.co` está en `lib/contacto.ts` y
   aparece en el footer, en una pregunta frecuente y en la pantalla de pago
   aprobado. Tiene que existir y alguien tiene que leerlo.
5. **Revisión legal.** Falta que un abogado revise el derecho de retracto y la
   reversión del pago del Estatuto del Consumidor (Ley 1480) aplicados a
   contenido digital, y la política de tratamiento de datos personales de la
   Ley 1581. El aviso del footer cubre lo básico, no reemplaza eso.
6. **Dominio y hosting.** Hay que registrar la URL de eventos
   (`https://TU-DOMINIO/api/wompi/webhook`) en el panel de Wompi y cambiar la
   llave de `pub_test_` a `pub_prod_` cuando se vaya a cobrar de verdad.
