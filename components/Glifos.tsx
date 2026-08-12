// Glifos dibujados a mano con polígonos y polilíneas ortogonales: son los
// objetos del lienzo (puertos, cables, nodos), no iconos de librería.

interface Props {
  className?: string;
}

export function GlifoPuerto({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <polygon points="12,4 20,12 12,20 4,12" fill="currentColor" />
    </svg>
  );
}

export function GlifoNodo({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <polygon points="1,11 5,11 5,13 1,13" fill="currentColor" />
      <polygon points="19,11 23,11 23,13 19,13" fill="currentColor" />
      <polygon
        points="5,5 19,5 19,19 5,19"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon points="8,9 16,9 16,11 8,11" fill="currentColor" />
      <polygon points="8,13 13,13 13,15 8,15" fill="currentColor" />
    </svg>
  );
}

export function GlifoWebhook({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <polygon points="8,2 10,2 10,7 8,7" fill="currentColor" />
      <polygon points="14,2 16,2 16,7 14,7" fill="currentColor" />
      <polygon points="5,7 19,7 19,14 12,20 5,14" fill="currentColor" />
    </svg>
  );
}

export function GlifoCron({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <polygon
        points="3,4 21,4 21,21 3,21"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon points="3,4 21,4 21,8 3,8" fill="currentColor" />
      <polygon points="11,10 13,10 13,15 11,15" fill="currentColor" />
      <polygon points="13,13 18,13 18,15 13,15" fill="currentColor" />
    </svg>
  );
}

export function GlifoRama({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <polyline
        points="2,12 9,12 9,5 20,5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polyline
        points="9,12 9,19 20,19"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon points="20,3 23,3 23,7 20,7" fill="currentColor" />
      <polygon points="20,17 23,17 23,21 20,21" fill="currentColor" />
    </svg>
  );
}

export function GlifoLlave({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <polygon
        points="2,7 10,7 10,17 2,17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon points="10,11 22,11 22,13 10,13" fill="currentColor" />
      <polygon points="16,13 18,13 18,17 16,17" fill="currentColor" />
      <polygon points="20,13 22,13 22,16 20,16" fill="currentColor" />
    </svg>
  );
}

export function GlifoAgente({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <polygon points="11,1 13,1 13,4 11,4" fill="currentColor" />
      <polygon
        points="4,4 20,4 20,14 4,14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon points="8,7 11,7 11,11 8,11" fill="currentColor" />
      <polygon points="13,7 16,7 16,11 13,11" fill="currentColor" />
      <polyline
        points="7,14 7,19 17,19 17,14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polyline points="12,14 12,19" fill="none" stroke="currentColor" strokeWidth="2" />
      <polygon points="5,19 9,19 9,22 5,22" fill="currentColor" />
      <polygon points="10,19 14,19 14,22 10,22" fill="currentColor" />
      <polygon points="15,19 19,19 19,22 15,22" fill="currentColor" />
    </svg>
  );
}

export function GlifoArchivo({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <polygon
        points="4,2 15,2 20,7 20,22 4,22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon points="14,2 20,8 14,8" fill="currentColor" />
      <polygon points="7,12 10,12 10,14 9,14 9,18 7,18" fill="currentColor" />
      <polygon points="14,12 17,12 17,18 14,18 14,16 15,16 15,14 14,14" fill="currentColor" />
    </svg>
  );
}

export function GlifoMarca({ className }: Props) {
  return (
    <svg viewBox="0 0 32 24" aria-hidden="true" className={className}>
      <polygon points="0,11 4,11 4,13 0,13" fill="currentColor" />
      <polygon
        points="4,4 18,4 18,20 4,20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon points="18,11 24,11 24,6 28,6 28,8 26,8 26,13 18,13" fill="currentColor" />
      <polygon points="28,3 32,3 32,9 28,9" fill="currentColor" />
    </svg>
  );
}
