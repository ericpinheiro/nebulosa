/**
 * Gerador determinístico de posições sintéticas parecidas com o UMAP do Bruno
 * (núcleo com braços e aglomerados). Sem dependências: usado pelo app e pelo script Node.
 */

export type Vec3 = [number, number, number];

export function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number): number {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

interface Arm {
  dir: Vec3;
  bend: Vec3;
  length: number;
  weight: number;
  width: number;
}

const norm = (v: Vec3): Vec3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

/** Braços inspirados no vídeo: um longo para cima, dois laterais e um mais curto e largo. */
const ARMS: Arm[] = [
  { dir: norm([0.15, 1, 0.2]), bend: [0.35, 0, -0.2], length: 1.0, weight: 0.3, width: 0.09 },
  { dir: norm([1, -0.25, 0.1]), bend: [0, 0.3, 0.25], length: 0.95, weight: 0.27, width: 0.12 },
  { dir: norm([-0.8, -0.55, -0.15]), bend: [-0.1, 0.25, 0.3], length: 0.85, weight: 0.25, width: 0.11 },
  { dir: norm([-0.3, 0.1, -1]), bend: [0.3, -0.2, 0], length: 0.6, weight: 0.18, width: 0.15 },
];

/** Aglomerados densos ao longo dos braços: [braço, posição no braço, espalhamento]. */
const CLUSTERS: [number, number, number][] = [
  [0, 0.35, 0.05],
  [0, 0.85, 0.06],
  [1, 0.55, 0.07],
  [1, 0.92, 0.05],
  [2, 0.4, 0.06],
  [2, 0.8, 0.07],
  [3, 0.7, 0.08],
];

const CORE_SHARE = 0.12;
const CLUSTER_SHARE = 0.3;
/** Maior distância possível aproximada, para normalizar sem depender dos outros pontos. */
const BOUND = 1.05;

function armPoint(arm: Arm, t: number): Vec3 {
  const s = Math.sin(t * Math.PI);
  return [
    arm.dir[0] * t * arm.length + arm.bend[0] * s * t,
    arm.dir[1] * t * arm.length + arm.bend[1] * s * t,
    arm.dir[2] * t * arm.length + arm.bend[2] * s * t,
  ];
}

function pickArm(r: number): number {
  let acc = 0;
  for (let i = 0; i < ARMS.length; i++) {
    acc += ARMS[i].weight;
    if (r < acc) return i;
  }
  return ARMS.length - 1;
}

const clamp1 = (x: number) => Math.max(-1, Math.min(1, x));

/** Posição normalizada em [-1, 1] para um id. Mesma entrada, mesma saída. */
export function positionForId(id: string): Vec3 {
  const rng = mulberry32(fnv1a(id));
  const kind = rng();
  let base: Vec3;
  let spread: number;

  if (kind < CORE_SHARE) {
    base = [0, 0, 0];
    spread = 0.12;
  } else if (kind < CORE_SHARE + CLUSTER_SHARE) {
    const [armIdx, t, sigma] = CLUSTERS[Math.floor(rng() * CLUSTERS.length)];
    base = armPoint(ARMS[armIdx], t);
    spread = sigma;
  } else {
    const arm = ARMS[pickArm(rng())];
    const t = Math.pow(rng(), 0.8);
    base = armPoint(arm, t);
    // Braços afinam na ponta e engrossam no meio.
    spread = arm.width * (0.6 + Math.sin(t * Math.PI) * 0.8);
  }

  return [
    clamp1((base[0] + gaussian(rng) * spread) / BOUND),
    clamp1((base[1] + gaussian(rng) * spread) / BOUND),
    clamp1((base[2] + gaussian(rng) * spread) / BOUND),
  ];
}

export interface GalaxyPointJson {
  id: string;
  p: [number, number, number];
  group?: string;
}

export interface GalaxyJson {
  version: string;
  generatedAt: string;
  count: number;
  points: GalaxyPointJson[];
}

const round = (x: number) => Math.round(x * 10000) / 10000;

/** Gera o JSON v1 completo do mock para uma lista de ids. */
export function generateMockGalaxy(ids: string[], now = new Date()): GalaxyJson {
  const unique = Array.from(new Set(ids));
  const points = unique.map((id) => {
    const p = positionForId(id);
    return { id, p: [round(p[0]), round(p[1]), round(p[2])] as [number, number, number] };
  });
  const day = now.toISOString().slice(0, 10);
  return {
    version: `${day}.mock-${fnv1a(unique.slice().sort().join('|')).toString(36)}`,
    generatedAt: now.toISOString(),
    count: points.length,
    points,
  };
}
