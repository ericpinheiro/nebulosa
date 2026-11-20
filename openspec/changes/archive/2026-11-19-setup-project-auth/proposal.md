## Why

O Nebulosa ainda não existe como código: o repositório só tem o briefing. A primeira mudança precisa criar a base do app (Expo com development build, Expo Router, estrutura em 3 camadas) e a capacidade `auth`, porque todo o resto (biblioteca, reprodução, galáxia) depende de um token válido do Jellyfin do brunoflix.

## What Changes

- Projeto Expo (TypeScript, Expo Router, development build — sem Expo Go) com `app.config.ts`, bundle id, modo de áudio em segundo plano no iOS e scripts de typecheck/test.
- Estrutura de pastas em 3 camadas: `src/services` (rede), `src/state` (Zustand/SQLite/Query), `app/` e `src/ui` (telas).
- Arquivo único de parâmetros ajustáveis `src/config/tuning.ts` e constantes do servidor fixo `src/config/server.ts`.
- Cliente Jellyfin baseado em `@jellyfin/sdk` apontando fixo para `https://brunoflix.rizomalivre.com`, com identificação do dispositivo.
- Tela de login (usuário e senha, em português), token guardado no `expo-secure-store`, restauração da sessão na abertura e logout.
- Rotas protegidas: sem sessão, o app mostra só o login.

## Capabilities

### New Capabilities
- `auth`: login no brunoflix com usuário e senha, armazenamento seguro do token, restauração e encerramento da sessão.

### Modified Capabilities
(nenhuma — primeira mudança do projeto)

## Impact

- Cria `package.json`, `app.config.ts`, `tsconfig.json`, `babel.config.js`, `jest.config.js`, `app/`, `src/`.
- Dependências novas: expo, expo-router, react-native, @jellyfin/sdk, expo-secure-store, zustand, react-native-mmkv, @tanstack/react-query, jest-expo.
- Build nativo (iOS) exige Xcode no Mac do Eric; esta mudança é validada sem Xcode por typecheck e testes unitários.
