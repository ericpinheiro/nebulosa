## Context

`LibrarySheet` monta o painel assim: `<BottomSheetView style={header}>…</BottomSheetView>` seguido de `<View style={{flex:1}}>{body}</View>`, onde `body` é uma `FlashList` com `renderScrollComponent` vindo de `useBottomSheetScrollableCreator`.

No `@gorhom/bottom-sheet` 5.2.14, `BottomSheetView` aplica `styles.container = { position: 'absolute', left: 0, top: 0, right: 0 }` e, ao montar, marca o tipo rolável do painel como `VIEW`. Resultado:
- o corpo ignora a altura do cabeçalho e começa no topo; por ser renderizado depois, fica por cima (álbuns sobre a busca; lista do álbum sobre o "Voltar");
- o tipo rolável `VIEW` concorre com o da lista, o que pode atrapalhar o gesto de rolar vs. arrastar o painel.

## Goals / Non-Goals

**Goals:** cabeçalho sempre visível e tocável; lista começando abaixo dele; rolagem da lista integrada ao gesto do painel.

**Non-Goals:** redesenho visual do painel; mudar snap points ou o mini player.

## Decisions

- **Trocar `BottomSheetView` por `View` comum no cabeçalho.** O conteúdo do painel já é uma coluna; um `View` no fluxo empurra o corpo para baixo. Alternativa: manter `BottomSheetView` e dar `paddingTop` medido ao corpo — mais frágil (altura muda com aviso de sincronização e com "Voltar" vs. abas).
- **Envolver cabeçalho + corpo num `View` com `flex: 1`** como filho único do `BottomSheet`, para a `FlashList` ter altura definida.
- **Manter `BottomSheetTextInput`** na busca (ele cuida do teclado e não depende de `BottomSheetView`).
- Dar `zIndex`/fundo ao cabeçalho não é necessário depois da correção; a lista rola dentro do próprio contêiner (com `overflow: hidden` no corpo, por garantia).

## Risks / Trade-offs

- [Algum comportamento de teclado dependia do `BottomSheetView`] → testar busca com o painel na meia altura (`keyboardBehavior="extend"` continua valendo).
- [Não dá para validar sobreposição sem o aparelho] → tarefa explícita de verificação no build nativo.
