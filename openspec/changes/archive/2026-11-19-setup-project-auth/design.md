## Context

Repositório vazio exceto pelo briefing (`estudo/`). O app é React Native + Expo com development build porque áudio e 3D nativos não rodam no Expo Go. O Eric não tem Xcode instalado no momento, então tudo precisa ser validável por `tsc` e Jest; o build nativo vem depois via `npx expo run:ios`.

## Goals / Non-Goals

**Goals:**
- Base do projeto pronta para as próximas mudanças, com a separação em 3 camadas.
- Login funcional contra o Jellyfin com token no Keychain.

**Non-Goals:**
- Escolha de servidor, múltiplas contas, Quick Connect.
- Pastas nativas `ios/`/`android/` versionadas (usamos Continuous Native Generation: `expo prebuild` gera na hora).

## Decisions

- **Expo SDK atual + Expo Router (pasta `app/`)**: grupo `(auth)` para login e `(main)` para o app; o layout raiz redireciona conforme o estado da sessão. Alternativa (React Navigation manual) dá mais código sem ganho.
- **CNG em vez de pastas nativas commitadas**: `ios/` e `android/` ficam no `.gitignore`; tudo nativo é configurado por `app.config.ts` e config plugins. Facilita atualizar o SDK.
- **`@jellyfin/sdk` encapsulado em `src/services/jellyfin/`**: o resto do app não importa o SDK diretamente; recebe funções tipadas. Isso permite mocks em testes e protege contra mudanças de rota entre versões do servidor.
- **Sessão em `expo-secure-store`, estado em Zustand**: `useSessionStore` tem `status: 'loading' | 'signedOut' | 'signedIn'`. O secure store é a fonte persistente; o Zustand é o espelho em memória para a UI.
- **Device id em MMKV**: gerado uma vez (UUID) e guardado em MMKV, que é síncrono e rápido. Não é segredo.
- **Tratamento de 401 centralizado**: um interceptor do axios do SDK chama `sessionStore.expire()`.
- **Mensagens de erro mapeadas por função pura** (`describeLoginError`) testável em Jest.

## Risks / Trade-offs

- [Versão do Jellyfin desconhecida] → SDK oficial cobre 10.8+; rotas confirmadas quando o usuário do Eric for criado (pendência do briefing).
- [Sem Xcode para validar nativo] → manter dependências nativas compatíveis com o SDK do Expo (`npx expo install`) e rodar `expo-doctor`.
- [react-native-mmkv exige build nativo] → em testes é mockado.
