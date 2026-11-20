# Nebulosa

App de música (React Native + Expo) que toca a biblioteca do Jellyfin do brunoflix, com uma galáxia 3D como tela principal: cada ponto é uma música, agrupada por similaridade.

Briefing e referências visuais: [`estudo/`](estudo/). Specs e histórico de mudanças: [`openspec/`](openspec/).

## Estado

O MVP do briefing está implementado e rodando no iPhone (development build). Validação: typecheck, testes (Jest), lint, `expo-doctor` e bundle JS de iOS/Android (`expo export`).

## Rodando

Requer Node 22.13 (`nvm use`; para fixar: `nvm alias default 22.13.0`) e Xcode + CocoaPods. Não roda no Expo Go.

```bash
npm install                # aplica também os patches de patches/ (postinstall)
npm run typecheck && npm test && npm run lint
```

### Primeira instalação no iPhone

1. iPhone no cabo, desbloqueado, "Confiar neste computador". Ativar **Ajustes → Privacidade e Segurança → Modo Desenvolvedor** (a opção só aparece depois que o Xcode reconhece o aparelho em *Window → Devices and Simulators*).
2. Xcode → Settings → Accounts: Apple ID adicionado e certificado *Apple Development* criado (*Manage Certificates → + → Apple Development*). O time já está em `app.config.ts` (`ios.appleTeamId`).
3. Build e instalação:
   ```bash
   npm run prebuild            # gera ios/ e android/ (não versionados)
   npx expo run:ios --device   # escolher o iPhone pelo nome, não o simulador
   ```
   Se o chaveiro pedir senha durante a assinatura: senha do Mac + **Sempre Permitir**.
4. No iPhone: **Ajustes → Geral → VPN e Gerenciamento de Dispositivos → confiar** no Apple ID.

O primeiro build precisa de ~15 GB livres em disco.

### Dia a dia (depois de reiniciar o computador, etc.)

O app já fica instalado; basta subir o Metro:

```bash
nvm use
npm start
```

Abrir o Nebulosa no iPhone (mesma rede Wi-Fi do Mac; se não conectar sozinho, escanear o QR code do terminal).

Recompilar com `npx expo run:ios --device` só quando:

- passarem **7 dias** da instalação (assinatura da conta grátis expira; iPhone no cabo);
- entrar uma biblioteca com código nativo ou mudar `app.config.ts` (rodar `npm run prebuild` antes);
- atualizar o Xcode ou o iOS.

Problemas comuns:

- Tela vermelha ou código desatualizado: `npm start -- --clear`.
- App não encontra o servidor: conferir o Wi-Fi ou usar `npx expo start --dev-client --tunnel`.

### Contornos no build

- `patches/expo-modules-jsi+*.patch`: erro de concorrência do Swift 6.2 (Xcode 26). Pode sair ao migrar para Xcode 27+.
- `metro.config.js`: `three` resolvido para o build ESM (o CommonJS do three ≥ 0.180 chama `process.emitWarning`, que não existe no React Native).
- O watchman do Homebrew nesta máquina está quebrado (`brew reinstall watchman folly`); Metro e Jest estão configurados para não depender dele.

## Estrutura

```
src/app/            rotas (Expo Router): login, tela principal, Last.fm
src/config/         server.ts (URLs, chaves) e tuning.ts (todos os parâmetros ajustáveis)
src/services/       única camada que fala com servidores: jellyfin/, lastfm/, player/ (AudioEngine + adaptador), storage/
src/state/          Zustand + SQLite: sessão, biblioteca, player, fila, rádio, favoritos, scrobble, reporter
src/galaxy/         dados da galáxia: contrato v1, gerador do mock, índice espacial, envelopes, rádio
src/ui/             componentes: galaxy/ (three.js), now-playing/, library/
scripts/            generate-galaxy-mock.mts
```

## Configuração

- `src/config/server.ts`
  - `GALAXY_URL`: JSON v1 com as posições reais. Vazio = mock gerado no app com os ids da biblioteca.
  - `ENVELOPE_BASE_URL`: envelopes de energia (`{base}/{id}.json`). Vazio = onda sintética.
  - `LASTFM_API_KEY` / `LASTFM_API_SECRET`: vazio = scrobble pelo app desligado (pendência: app ou plugin no Jellyfin).
- `src/config/tuning.ts`: cores, rastro, pulsação, zoom das capas, velocidades, fps, tempo para esconder a interface.

## Mock da galáxia em arquivo

```bash
JELLYFIN_USER=eric JELLYFIN_PASSWORD=... npm run galaxy:mock -- galaxy.json
```

Gera o JSON v1 com os ids reais e as mesmas posições do mock do app.
