## Context

O banco local já guarda `is_favorite`/`favorited_at` e a sincronização reaplica os favoritos do servidor. O reporter já avisa início e fim de cada faixa com o tempo efetivamente ouvido.

## Decisions

- **Favoritos otimistas**: `toggleFavorite(id)` grava no SQLite, incrementa a versão da biblioteca (as listas atualizam), chama `markFavoriteItem`/`unmarkFavoriteItem` do SDK e desfaz em caso de erro. Um hook `useIsFavorite(id)` lê do banco com a versão como chave.
- **Primeiro plano**: `AppState` → `refreshUserData` (favoritos + últimas reproduções) com intervalo mínimo de 1 minuto.
- **Last.fm pelo app** (uma das duas opções da pendência): API 2.0 com assinatura MD5 (`expo-crypto`), `auth.getMobileSession`, `track.updateNowPlaying`, `track.scrobble`. Chave e segredo em `src/config/server.ts`, vazias = desligado. Se a decisão for o plugin do Jellyfin, basta deixar vazio.
- **Regras** puras e testadas (`shouldScrobble`), fila em MMKV com até 500 itens, envio em lotes de até 50.

## Risks / Trade-offs

- [Segredo da API no app] → app de uso pessoal; para distribuir, mover a assinatura para o servidor do Eric ou usar o plugin.
