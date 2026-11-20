import { createMMKV } from 'react-native-mmkv';

/** Preferências e dados pequenos não sensíveis. Segredos ficam no secure store. */
export const kv = createMMKV({ id: 'nebulosa' });

export function getJSON<T>(key: string): T | undefined {
  const raw = kv.getString(key);
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function setJSON(key: string, value: unknown): void {
  kv.set(key, JSON.stringify(value));
}
