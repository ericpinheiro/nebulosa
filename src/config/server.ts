/** Servidor fixo do Nebulosa. Não existe tela de escolher servidor. */
export const SERVER_URL = 'https://brunoflix.rizomalivre.com';

export const CLIENT_NAME = 'Nebulosa';

/** Tamanho da página ao baixar metadados da biblioteca. */
export const LIBRARY_PAGE_SIZE = 500;

/** Ticks do Jellyfin: 1 tick = 100 ns. */
export const TICKS_PER_SECOND = 10_000_000;

/**
 * URL do JSON v1 da galáxia com dados reais (UMAP). Vazio = mock gerado no app
 * a partir dos ids da biblioteca local. Ver estudo/briefing.md, "Dados da galáxia".
 */
export const GALAXY_URL = '';

/** Base dos envelopes de energia (`{base}/{id}.json`). Vazio = envelope sintético. */
export const ENVELOPE_BASE_URL = '';

/**
 * Last.fm pelo app (pendência do briefing: app ou plugin no Jellyfin).
 * Vazio = scrobble desligado. Crie as chaves em https://www.last.fm/api/account/create.
 */
export const LASTFM_API_KEY = '';
export const LASTFM_API_SECRET = '';
