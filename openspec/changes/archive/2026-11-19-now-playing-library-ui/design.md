## Context

Referências em `estudo/`: a tela "Aura" (fundo cinza claro, partículas brancas, um botão redondo translúcido embaixo, título espaçado no topo), uma lista com capas arredondadas e uma grade de capas em 3 colunas.

## Goals / Non-Goals

**Goals:** tela principal limpa; painel de biblioteca completo; transições suaves.
**Non-Goals:** fila visível, edição de playlists, favoritar (mudança seguinte), capas no zoom (mudança seguinte).

## Decisions

- **Cor de fundo**: `react-native-image-colors` (iOS: `background`/`primary`; Android: `dominant`) → `mixWithWhite` (função pura, testada) → dois `LinearGradient` empilhados com crossfade de opacidade via Reanimated. Cache por id de álbum.
- **Esconder interface**: hook `useAutoHide` com timer; o `View` raiz usa `onTouchStart` (dispara para qualquer toque, inclusive em filhos e na área dos gestos) para reexibir e reiniciar. Opacidade animada com Reanimated; `pointerEvents="none"` quando escondida para o primeiro toque só reexibir.
- **Capa expandida**: estado local `expanded`; a capa é um `Animated.View` cujo tamanho/posição interpolam entre o topo (48 px) e o centro (largura - 64). A galáxia fica montada por baixo (sem recriar o contexto GL) e some por opacidade. Arrastar para baixo com `Gesture.Pan` fecha.
- **Painel**: `@gorhom/bottom-sheet` com snap points 55% e 92%, `enablePanDownToClose`. Navegação interna com uma pilha em estado local (`LibraryRoute[]`), não com Expo Router — o painel é uma camada sobre a tela principal.
- **Listas**: FlashList v2 dentro do painel via `useBottomSheetScrollableCreator`.
- **Dados**: TanStack Query com chave incluindo `useLibraryStore.version`, lendo do SQLite (sem rede).
- **Playlists**: ids das faixas vêm do servidor (`/Playlists/{id}/Items`) e são resolvidos no banco local.
- **Formatação**: `formatDuration` pura e testada.

## Risks / Trade-offs

- [GL por baixo da capa expandida continua desenhando] → frameloop cai para 30 fps; aceitável e evita recriar o contexto.
- [FlashList v2 + bottom sheet] → se houver problema de rolagem, trocar por `BottomSheetFlatList` sem mudar o resto.
