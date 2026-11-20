/** Capa candidata ao toque: centro e tamanho na tela (px) e ordem de profundidade (maior = mais à frente). */
export interface CoverHitCandidate {
  index: number;
  x: number;
  y: number;
  size: number;
  z: number;
}

/**
 * Capa tocada em (x, y): a mais à frente entre as que contêm o toque,
 * usando o maior entre metade do tamanho e `minRadius` (capas pequenas ficam fáceis de tocar).
 */
export function pickCover(candidates: Iterable<CoverHitCandidate>, x: number, y: number, minRadius: number) {
  let best: CoverHitCandidate | null = null;
  for (const c of candidates) {
    const r = Math.max(minRadius, c.size / 2);
    if (Math.hypot(c.x - x, c.y - y) > r) continue;
    if (!best || c.z > best.z) best = c;
  }
  return best ? best.index : null;
}
