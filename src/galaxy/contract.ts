import type { GalaxyJson } from './generator';

export type { GalaxyJson, GalaxyPointJson } from './generator';

/** Galáxia em memória, pronta para a GPU. */
export interface GalaxyData {
  version: string;
  /** Id do Jellyfin por índice; null em pontos decorativos (biblioteca ainda vazia). */
  ids: (string | null)[];
  /** xyz normalizados em [-1, 1], 3 floats por ponto. */
  positions: Float32Array;
  groups: (string | null)[];
  indexById: Map<string, number>;
}

const inRange = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x) && x >= -1 && x <= 1;

/** Valida e converte o JSON v1. Pontos inválidos ou repetidos são descartados. */
export function parseGalaxy(json: unknown): GalaxyData {
  if (!json || typeof json !== 'object') throw new Error('JSON da galáxia inválido');
  const j = json as Partial<GalaxyJson>;
  if (typeof j.version !== 'string' || !Array.isArray(j.points)) {
    throw new Error('JSON da galáxia sem version/points');
  }
  const ids: string[] = [];
  const groups: (string | null)[] = [];
  const coords: number[] = [];
  const indexById = new Map<string, number>();
  for (const pt of j.points) {
    if (!pt || typeof pt.id !== 'string' || !pt.id || indexById.has(pt.id)) continue;
    const p = pt.p as unknown;
    if (!Array.isArray(p) || p.length !== 3 || !p.every(inRange)) continue;
    indexById.set(pt.id, ids.length);
    ids.push(pt.id);
    groups.push(typeof pt.group === 'string' ? pt.group : null);
    coords.push(p[0], p[1], p[2]);
  }
  return { version: j.version, ids, positions: new Float32Array(coords), groups, indexById };
}

export function pointPosition(data: GalaxyData, index: number): [number, number, number] {
  const o = index * 3;
  return [data.positions[o], data.positions[o + 1], data.positions[o + 2]];
}
