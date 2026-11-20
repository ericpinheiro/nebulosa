## 1. Build (requer Xcode)

- [ ] 1.1 Instalar Xcode, abrir uma vez, aceitar licença; `sudo xcode-select -s /Applications/Xcode.app`
- [ ] 1.2 Instalar CocoaPods (`brew install cocoapods`) e corrigir o watchman (`brew reinstall watchman folly`)
- [ ] 1.3 `npm run prebuild` e `npx expo run:ios --device` com a conta grátis da Apple (assinar o target Nebulosa)
- [ ] 1.4 Se o `react-native-track-player` 4.x falhar na New Architecture: trocar o adaptador em `src/services/player/` (v5 licenciada ou `expo-audio`)

## 2. Servidor real

- [ ] 2.1 Criar o usuário do Eric no brunoflix e confirmar a versão do Jellyfin
- [ ] 2.2 Login, sincronização das 7.258 faixas e tempo da primeira sincronização
- [ ] 2.3 FLAC em direct play (`/Audio/{id}/universal`) e relatório aparecendo no painel do Jellyfin
- [ ] 2.4 Favoritar no app e conferir no Jellyfin web (e o contrário)

## 3. Galáxia no aparelho

- [ ] 3.1 60 fps com gesto, 30 fps em rotação automática, sem desenho em segundo plano
- [ ] 3.2 Capas no zoom próximo: bounce, 1º/2º toque, rádio
- [ ] 3.3 Ajustar `src/config/tuning.ts`: cor de destaque e rastro, pulsação, zoom das capas, velocidade
- [ ] 3.4 Gerar o JSON mock com `npm run galaxy:mock` e comparar com o mock do app

## 4. Reprodução

- [ ] 4.1 Segundo plano, tela de bloqueio, central de controle e fones
- [ ] 4.2 Emenda entre faixas de um álbum FLAC (gapless)
