## 1. Projeto base

- [x] 1.1 Criar projeto Expo TypeScript na raiz (package.json, app.config.ts, tsconfig, babel) com Expo Router
- [x] 1.2 Configurar app.config.ts: nome Nebulosa, bundle id, background audio no iOS, plugins nativos
- [x] 1.3 Configurar Jest (jest-expo), scripts `typecheck`, `test`, `lint` e .gitignore com ios/ e android/
- [x] 1.4 Criar estrutura de pastas (src/services, src/state, src/ui, src/config) e `src/config/tuning.ts` e `src/config/server.ts`

## 2. Serviço Jellyfin e sessão

- [x] 2.1 Device id estável em MMKV e informações do cliente (Nebulosa, versão, aparelho)
- [x] 2.2 Cliente Jellyfin encapsulado (`src/services/jellyfin/client.ts`) com servidor fixo
- [x] 2.3 Função de login, logout e mapeamento de erros (`describeLoginError`) com testes
- [x] 2.4 Persistência da sessão em expo-secure-store e `useSessionStore` (Zustand) com restore/expire
- [x] 2.5 Interceptor de 401 que expira a sessão

## 3. Telas

- [x] 3.1 Layout raiz com providers (Gesture Handler, Query, SafeArea) e redirecionamento por sessão
- [x] 3.2 Tela de login em português com validação e mensagens de erro
- [x] 3.3 Tela principal provisória com opção "Sair"

## 4. Verificação

- [x] 4.1 `npm run typecheck` e `npm test` passando
