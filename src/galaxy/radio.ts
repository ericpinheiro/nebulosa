import type { SpatialIndex } from './spatial-index';

/**
 * Caminhada pelo vizinho mais próximo: começa em `start` e, a cada passo,
 * escolhe o ponto mais perto do último entre os ainda não visitados.
 * `eligible` filtra pontos sem música (ex.: decorativos).
 */
export function radioWalk(
  positions: Float32Array,
  index: SpatialIndex,
  start: number,
  size: number,
  eligible: (i: number) => boolean = () => true,
): number[] {
  const n = positions.length / 3;
  if (start < 0 || start >= n) return [];
  const visited = new Set<number>([start]);
  const path = [start];
  let last = start;
  while (path.length < size) {
    const [nextIdx] = index.nearest(
      positions[last * 3],
      positions[last * 3 + 1],
      positions[last * 3 + 2],
      1,
      (i) => visited.has(i) || !eligible(i),
    );
    if (nextIdx == null) break;
    visited.add(nextIdx);
    path.push(nextIdx);
    last = nextIdx;
  }
  return path;
}
