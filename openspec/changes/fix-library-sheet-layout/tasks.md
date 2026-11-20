## 1. Correção do layout

- [x] 1.1 Em `LibrarySheet.tsx`, trocar o `BottomSheetView` do cabeçalho por `View` e envolver cabeçalho + corpo num contêiner `flex: 1`
- [x] 1.2 Garantir `overflow: 'hidden'` no corpo para a lista não desenhar fora dele
- [x] 1.3 Remover o import não usado de `BottomSheetView`

## 2. Validação

- [x] 2.1 `npm run typecheck && npm test && npm run lint` e `CI=1 npx expo export --platform ios`
- [ ] 2.2 (build nativo) Abrir a biblioteca: busca e abas visíveis e tocáveis, nas duas alturas do painel
- [ ] 2.3 (build nativo) Abrir um álbum e tocar "Voltar"; abrir artista → álbum → "Voltar" duas vezes
- [ ] 2.4 (build nativo) Rolar a grade e a lista do álbum; arrastar o painel pelo cabeçalho continua funcionando
