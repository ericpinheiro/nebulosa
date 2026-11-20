import { File, Paths } from 'expo-file-system';
import { create } from 'zustand';

import { GALAXY_URL } from '@/config/server';
import { getDb } from '@/state/library/db';
import { useLibraryStore } from '@/state/library/sync';
import { kv } from '@/services/storage/kv';

import { boundingSphere, type BoundingSphere } from './bounds';
import { parseGalaxy, type GalaxyData } from './contract';
import { generateMockGalaxy, mulberry32 } from './generator';
import { SpatialIndex } from './spatial-index';

interface GalaxyState {
  data: GalaxyData | null;
  index: SpatialIndex | null;
  /** Esfera envolvente (coordenadas normalizadas), para enquadrar a galáxia inteira. */
  bounds: BoundingSphere | null;
  source: 'none' | 'placeholder' | 'mock' | 'remote';
  load: () => Promise<void>;
}

const VERSION_KEY = 'galaxy.version';
const PLACEHOLDER_COUNT = 7258;

function cacheFile() {
  return new File(Paths.document, 'galaxy.json');
}

function withIndex(data: GalaxyData) {
  return { data, index: new SpatialIndex(data.positions), bounds: boundingSphere(data.positions) };
}

/** Pontos decorativos enquanto a biblioteca não chegou (a galáxia aparece girando mesmo vazia). */
function placeholder(): GalaxyData {
  const rng = mulberry32(7258);
  const json = generateMockGalaxy(Array.from({ length: PLACEHOLDER_COUNT }, () => `ph-${Math.floor(rng() * 1e12)}`));
  const data = parseGalaxy(json);
  return { ...data, ids: data.ids.map(() => null), indexById: new Map() };
}

async function loadRemote(): Promise<GalaxyData | null> {
  const file = cacheFile();
  let cached: GalaxyData | null = null;
  if (file.exists) {
    try {
      cached = parseGalaxy(JSON.parse(await file.text()));
    } catch {
      cached = null;
    }
  }
  try {
    const res = await fetch(GALAXY_URL);
    if (!res.ok) return cached;
    const text = await res.text();
    const json = JSON.parse(text) as { version?: string };
    if (cached && json.version === cached.version) return cached;
    const data = parseGalaxy(json);
    await file.write(text);
    kv.set(VERSION_KEY, data.version);
    return data;
  } catch {
    return cached;
  }
}

async function loadMock(): Promise<GalaxyData | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string }>('SELECT id FROM tracks');
  if (rows.length === 0) return null;
  return parseGalaxy(generateMockGalaxy(rows.map((r) => r.id)));
}

export const useGalaxyStore = create<GalaxyState>((set, get) => ({
  data: null,
  index: null,
  bounds: null,
  source: 'none',
  load: async () => {
    if (!get().data) set({ ...withIndex(placeholder()), source: 'placeholder' });
    if (GALAXY_URL) {
      const data = await loadRemote();
      if (data && data.version !== get().data?.version) set({ ...withIndex(data), source: 'remote' });
      return;
    }
    const data = await loadMock().catch(() => null);
    if (data && data.version !== get().data?.version) set({ ...withIndex(data), source: 'mock' });
  },
}));

/** Regera o mock quando uma sincronização termina (a versão só muda se os ids mudarem). */
useLibraryStore.subscribe((s, prev) => {
  if (GALAXY_URL || s.progress.phase !== 'done' || prev.progress.phase === 'done') return;
  void useGalaxyStore.getState().load();
});
