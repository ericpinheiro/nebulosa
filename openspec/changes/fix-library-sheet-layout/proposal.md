## Why

No painel da biblioteca, a lista é desenhada por cima do cabeçalho: na aba inicial os álbuns cobrem a busca e as abas (item 5), e dentro de um álbum o botão "Voltar" não responde ao toque (item 4). A causa é a mesma: no `@gorhom/bottom-sheet` 5.x o `BottomSheetView` é `position: absolute`, então o corpo do painel começa no topo e fica por cima do cabeçalho.

## What Changes

- O cabeçalho do painel (busca, conta, abas, "Voltar" e aviso de sincronização) passa a ocupar seu próprio espaço no fluxo do layout, e a lista começa logo abaixo dele.
- O cabeçalho deixa de registrar o painel como "conteúdo de view", o que hoje disputa com o registro da lista rolável (`useBottomSheetScrollableCreator`).
- Sem mudança visual além de o conteúdo parar de se sobrepor.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `library-ui`: o cabeçalho do painel fica sempre visível e tocável, sem conteúdo por cima.

## Impact

- `src/ui/library/LibrarySheet.tsx` (troca do `BottomSheetView` do cabeçalho por um `View` comum).
- Sem dependências novas. Verificação final no aparelho (build nativo).
