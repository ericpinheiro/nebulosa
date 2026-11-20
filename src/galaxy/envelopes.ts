import { ENVELOPE_BASE_URL } from '@/config/server';

import { mockEnvelope, parseEnvelope, type EnergyEnvelope, type EnvelopeJson } from './energy';

const cache = new Map<string, EnergyEnvelope>();
const MAX_CACHED = 8;

/** Busca o envelope da música (remoto se configurado, senão sintético). Nunca falha. */
export async function loadEnvelope(id: string, durationS: number): Promise<EnergyEnvelope> {
  const hit = cache.get(id);
  if (hit) return hit;
  let env: EnergyEnvelope | null = null;
  if (ENVELOPE_BASE_URL) {
    try {
      const res = await fetch(`${ENVELOPE_BASE_URL}/${encodeURIComponent(id)}.json`);
      if (res.ok) env = parseEnvelope((await res.json()) as EnvelopeJson);
    } catch {
      env = null;
    }
  }
  env ??= mockEnvelope(id, durationS);
  cache.set(id, env);
  if (cache.size > MAX_CACHED) cache.delete(cache.keys().next().value!);
  return env;
}
