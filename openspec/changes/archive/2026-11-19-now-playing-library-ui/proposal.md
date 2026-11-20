## Why

Com player, biblioteca e galáxia prontos, falta a interface que o Eric usa no dia a dia: a tela principal extremamente limpa com a galáxia no centro (`now-playing`) e o painel de biblioteca que sobe de baixo (`library-ui`).

## What Changes

- Tela principal: capa pequena + título/artista no topo, galáxia no centro, barra de progresso fina, controles (anterior, play/pause, próxima, shuffle) e botão da biblioteca.
- Fundo em degradê claro com a cor da capa misturada com branco, com transição suave na troca de música.
- Interface some após 10 s sem toque (menos a galáxia); qualquer toque traz de volta.
- Capa expandida: a capa cresce no lugar da galáxia com a lista de faixas do álbum; volta tocando na capa ou arrastando para baixo.
- Estado vazio: galáxia girando e só o botão da biblioteca.
- Painel da biblioteca arrastável (bottom sheet) com galáxia visível atrás e mini player flutuante.
- Visões: Álbuns (grade 3 colunas), Músicas (lista com ordenação A–Z, álbum, gênero), Artistas, Playlists, Favoritos; navegação para álbum, artista e playlist; busca por música, álbum e artista.
- Progresso da sincronização inicial visível no painel.

## Capabilities

### New Capabilities
- `now-playing`: tela principal, capa expandida, cor de fundo, esconder a interface, estado vazio.
- `library-ui`: painel, visões, ordenação, busca, navegação e mini player.

### Modified Capabilities
(nenhuma)

## Impact

- `src/app/(main)/index.tsx` vira a tela completa; novos componentes em `src/ui/now-playing/*` e `src/ui/library/*`.
- Dependências: @gorhom/bottom-sheet, @shopify/flash-list, expo-image, react-native-image-colors, expo-linear-gradient.
