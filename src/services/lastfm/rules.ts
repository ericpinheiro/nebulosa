/** Regras do Last.fm: faixa > 30 s, ouvida por metade da duração ou 4 minutos. */
export function shouldScrobble(durationS: number, listenedS: number): boolean {
  if (!(durationS > 30)) return false;
  return listenedS >= Math.min(durationS / 2, 240);
}

export interface ScrobbleEntry {
  artist: string;
  track: string;
  album?: string;
  duration?: number;
  /** Unix (s) do início da reprodução. */
  timestamp: number;
}

/** Parâmetros de `track.scrobble` em lote (`artist[0]`, `track[0]`, ...). */
export function batchParams(entries: ScrobbleEntry[]): Record<string, string> {
  const params: Record<string, string> = {};
  entries.forEach((e, i) => {
    params[`artist[${i}]`] = e.artist;
    params[`track[${i}]`] = e.track;
    params[`timestamp[${i}]`] = String(e.timestamp);
    if (e.album) params[`album[${i}]`] = e.album;
    if (e.duration) params[`duration[${i}]`] = String(Math.round(e.duration));
  });
  return params;
}

/** Texto que é assinado: chaves em ordem, `chave+valor` concatenados, mais o segredo. */
export function signatureBase(params: Record<string, string>, secret: string): string {
  return (
    Object.keys(params)
      .filter((k) => k !== 'format' && k !== 'callback')
      .sort()
      .map((k) => `${k}${params[k]}`)
      .join('') + secret
  );
}
