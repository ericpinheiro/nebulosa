/** Texto para busca: sem acento, minúsculo, espaços normalizados. */
export function normalizeSearch(text: string | null | undefined): string {
  if (!text) return '';
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Escapa curingas do LIKE (usado com `ESCAPE '\\'`). */
export function likePattern(query: string): string {
  const q = normalizeSearch(query).replace(/[\\%_]/g, (c) => `\\${c}`);
  return `%${q}%`;
}

/** Chave de ordenação A–Z que ignora acentos e artigos comuns. */
export function sortKey(text: string | null | undefined): string {
  return normalizeSearch(text).replace(/^(the|a|an|o|os|as|um|uma) /, '');
}
