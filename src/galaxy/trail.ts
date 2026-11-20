/** Valor de `aPlayed` para pontos sem rastro. */
export const NO_TRAIL = -1e9;

/**
 * Monta o atributo do rastro: para cada ponto, segundos entre `epoch` e a última reprodução,
 * ou NO_TRAIL se não tocou dentro da janela.
 */
export function buildTrail(
  count: number,
  indexById: Map<string, number>,
  played: { id: string; lastPlayedAt: number }[],
  epoch: number,
  now: number,
  windowMs: number,
): Float32Array {
  const out = new Float32Array(count).fill(NO_TRAIL);
  for (const p of played) {
    if (now - p.lastPlayedAt > windowMs) continue;
    const i = indexById.get(p.id);
    if (i == null) continue;
    out[i] = (p.lastPlayedAt - epoch) / 1000;
  }
  return out;
}
