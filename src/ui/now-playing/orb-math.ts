/**
 * Matemática do botão orbital (funções puras, testadas em `orb.test.ts`).
 * Ângulos medidos a partir do topo, no sentido horário, em radianos.
 */

export const TAU = Math.PI * 2;

export type OrbZone = 'center' | 'ring' | 'none';

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

/** Decide pela posição do toque (coordenadas locais do botão) se ele começou no centro ou no anel. */
export function classifyTouch(x: number, y: number, size: number, innerRatio: number, ringSlop: number): OrbZone {
  const radius = size / 2;
  const r = Math.hypot(x - radius, y - radius);
  if (r <= radius * innerRatio) return 'center';
  if (r <= radius + ringSlop) return 'ring';
  return 'none';
}

/** Ângulo do vetor (dx, dy) a partir do topo, sentido horário, em [0, 2π). Y cresce para baixo. */
export function angleOf(dx: number, dy: number): number {
  const a = Math.atan2(dx, -dy);
  return a < 0 ? a + TAU : a;
}

/** Menor diferença assinada entre dois ângulos do dedo, em (-π, π]. Positiva = sentido horário. */
export function angleDelta(prev: number, raw: number): number {
  let d = raw - prev;
  while (d > Math.PI) d -= TAU;
  while (d <= -Math.PI) d += TAU;
  return d;
}

/**
 * Seek relativo: soma à fração atual o quanto o dedo girou em volta do anel (uma volta = a música toda),
 * presa em [0, 1]. Tocar no anel sem girar não muda a posição.
 */
export function scrubFraction(fraction: number, prevAngle: number, rawAngle: number): number {
  return clamp(fraction + angleDelta(prevAngle, rawAngle) / TAU, 0, 1);
}

/** Quanto do arrasto do centro já foi feito, em [-1, 1] (±1 = soltar confirma a troca). */
export function swipeProgress(dx: number, threshold: number): number {
  if (threshold <= 0) return 0;
  return clamp(dx / threshold, -1, 1);
}

export function angleToFraction(angle: number): number {
  return clamp(angle / TAU, 0, 1);
}

/** Deslocamento com resistência: acompanha o dedo no início e se aproxima de `max`. */
export function rubberBand(dx: number, max: number): number {
  if (max <= 0) return 0;
  return Math.sign(dx) * max * (1 - Math.exp(-Math.abs(dx) / max));
}

export type SwipeAction = 'next' | 'previous' | null;

/** Ação ao soltar o arrasto do centro: distância além do limiar, ou fling na mesma direção. */
export function swipeAction(dx: number, vx: number, threshold: number, velocity: number): SwipeAction {
  const flingMin = threshold * 0.4;
  if (dx >= threshold || (vx >= velocity && dx >= flingMin)) return 'next';
  if (dx <= -threshold || (vx <= -velocity && dx <= -flingMin)) return 'previous';
  return null;
}

/** Ação que o arrasto confirmaria se soltasse agora (para o ícone de pista). */
export function armedAction(dx: number, threshold: number): SwipeAction {
  if (dx >= threshold) return 'next';
  if (dx <= -threshold) return 'previous';
  return null;
}
