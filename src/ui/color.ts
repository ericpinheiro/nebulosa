/** Utilidades de cor e formatação (puras). */

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

const toHex = (n: number) =>
  Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, '0');

/** Mistura a cor com branco: 0 = cor pura, 1 = branco. */
export function mixWithWhite(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return '#ffffff';
  const a = Math.max(0, Math.min(1, amount));
  return `#${rgb.map((c) => toHex(c + (255 - c) * a)).join('')}`;
}

/** Mistura a cor com preto: 0 = cor pura, 1 = preto. */
export function mixWithBlack(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return '#000000';
  const a = Math.max(0, Math.min(1, amount));
  return `#${rgb.map((c) => toHex(c * (1 - a))).join('')}`;
}

/** Escurece (amount > 0) ou clareia (amount < 0) levemente. */
export function shade(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return `#${rgb.map((c) => toHex(amount >= 0 ? c * (1 - amount) : c + (255 - c) * -amount)).join('')}`;
}

export function withAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.max(0, Math.min(1, alpha))})`;
}

/** Luminância relativa (0..1), para decidir texto claro/escuro. */
export function luminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 1;
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Degradê escuro do fundo: cor da capa misturada com preto; topo mais escuro, base um pouco mais clara. */
export function backgroundGradient(coverColor: string | null, darkMix: number): [string, string] {
  if (!coverColor) return ['#141418', '#26262c'];
  const base = mixWithBlack(coverColor, darkMix);
  return [shade(base, 0.35), mixWithWhite(base, 0.06)];
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0:00';
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}
