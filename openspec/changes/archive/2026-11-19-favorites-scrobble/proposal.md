## Why

Última capacidade do MVP: favoritar pela tela principal e pelas listas, sincronizado com os favoritos do Jellyfin, e registrar as reproduções no Last.fm. A forma do scrobble (app ou plugin do Jellyfin) ainda está em aberto no briefing, então o scrobble pelo app entra desligado por padrão, pronto para ligar.

## What Changes

- Favoritar/desfavoritar música na tela principal, no mini player e nas listas, com atualização otimista e sincronização com o Jellyfin (`/UserFavoriteItems/{id}`).
- Favoritos do servidor reaplicados ao voltar o app para o primeiro plano.
- Scrobbler do Last.fm pelo app: login com usuário e senha (`auth.getMobileSession`), "tocando agora" e scrobble com as regras do Last.fm, fila de reenvio offline. Desligado enquanto não houver chave de API configurada.

## Capabilities

### New Capabilities
- `favorites-scrobble`: favoritos sincronizados com o Jellyfin e scrobble no Last.fm.

### Modified Capabilities
(nenhuma)

## Impact

- `src/services/jellyfin/favorites.ts`, `src/state/favorites.ts`, `src/services/lastfm/*`, `src/state/scrobble.ts`, tela `src/app/(main)/lastfm.tsx`.
- Config `LASTFM_API_KEY`/`LASTFM_API_SECRET` em `src/config/server.ts` (vazias por padrão).
