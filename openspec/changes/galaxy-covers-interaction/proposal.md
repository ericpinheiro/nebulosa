## Why

No zoom próximo, as capas são botões (`Pressable`) numa camada acima da área de gestos da galáxia: com muitas capas na tela, a pinça só funciona começando num espaço vazio (item 8). A capa surge com `BounceIn`, uma mola agressiva (item 9), e ao tocar numa capa ela cresce com outra mola, o que fica esquisito (item 10). Também falta reforçar o foco na capa escolhida.

## What Changes

- As capas deixam de capturar toques: todos os gestos (girar, pinça, mover) funcionam em qualquer lugar, inclusive em cima das capas. O toque numa capa passa a ser detectado pela própria galáxia, comparando o ponto tocado com a posição das capas no quadro.
- A capa surge com fade in crescendo até o tamanho final, com no máximo uma leve passada do tamanho e volta (uma vez só), sem efeito de mola.
- Ao tocar numa capa, ela só aumenta (transição suave, sem bounce) e todas as outras ficam em preto e branco (e levemente esmaecidas) enquanto ela estiver selecionada; ao desmarcar, as cores voltam com transição.
- O segundo toque na mesma capa continua tocando a música (rádio de proximidade).

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `galaxy`: aparição das capas no zoom próximo, toque nas capas (aumento sem bounce e foco em preto e branco) e gestos funcionando por cima das capas.

## Impact

- `src/ui/galaxy/GalaxyCovers.tsx` (animação de entrada, seleção, preto e branco, teste de toque).
- `src/ui/galaxy/GalaxyView.tsx` (toque com coordenadas repassado para as capas antes de virar "toque vazio").
- `src/app/(main)/index.tsx` (ligação entre galáxia e capas).
- `src/config/tuning.ts` (usa o `coverHitRadiusPx` que já existe; novos tempos de animação).
