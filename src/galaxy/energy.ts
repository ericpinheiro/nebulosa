import { fnv1a, mulberry32 } from './generator';

/**
 * Envelope de energia de uma música: valores 0..1 amostrados `rate` vezes por segundo.
 * Formato remoto: `{ "id": "...", "rate": 20, "e": [0..255, ...] }`.
 */
export interface EnergyEnvelope {
  id: string;
  rate: number;
  values: Float32Array;
}

export interface EnvelopeJson {
  id: string;
  rate: number;
  e: number[];
}

export function parseEnvelope(json: EnvelopeJson): EnergyEnvelope {
  const values = new Float32Array(json.e.length);
  for (let i = 0; i < json.e.length; i++) values[i] = Math.max(0, Math.min(255, json.e[i])) / 255;
  return { id: json.id, rate: json.rate > 0 ? json.rate : 20, values };
}

/** Valor do envelope em `seconds`, com interpolação linear entre amostras. */
export function energyAt(env: EnergyEnvelope, seconds: number): number {
  const n = env.values.length;
  if (n === 0 || seconds < 0) return 0;
  const x = seconds * env.rate;
  const i = Math.floor(x);
  if (i >= n - 1) return i === n - 1 ? env.values[n - 1] : 0;
  const f = x - i;
  return env.values[i] * (1 - f) + env.values[i + 1] * f;
}

/** Envelope sintético: batidas regulares com BPM derivado do id, decaimento e variação lenta. */
export function mockEnvelope(id: string, durationS: number, rate = 20): EnergyEnvelope {
  const rng = mulberry32(fnv1a(`env:${id}`));
  const bpm = 80 + Math.floor(rng() * 60);
  const beat = 60 / bpm;
  const phase = rng() * beat;
  const swell = 0.5 + rng() * 0.5;
  const n = Math.max(1, Math.ceil(Math.max(durationS, 1) * rate));
  const values = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const sinceBeat = ((t + phase) % beat) / beat;
    const kick = Math.exp(-sinceBeat * 6);
    const slow = 0.55 + 0.45 * Math.sin((t / Math.max(durationS, 1)) * Math.PI * 2 * swell + phase);
    values[i] = Math.max(0, Math.min(1, kick * (0.35 + 0.65 * slow)));
  }
  return { id, rate, values };
}
