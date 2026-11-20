## Why

Todo o MVP foi implementado e validado sem Xcode (typecheck, 46 testes, lint, expo-doctor e bundle JS de iOS e Android via `expo export`). Falta o que só dá para verificar com o build nativo no iPhone do Eric: módulos nativos (áudio, GL, MMKV, SQLite, Keychain), desempenho da galáxia e integração real com o brunoflix. Esta mudança fica aberta até essa verificação.

## What Changes

- Primeiro build de desenvolvimento no iPhone (conta grátis da Apple, Xcode).
- Validação do motor de áudio `react-native-track-player` 4.x na New Architecture; troca do adaptador se necessário.
- Checagem contra o servidor real (versão do Jellyfin, rotas, direct play de FLAC, relatório de reprodução).
- Ajuste dos parâmetros de `src/config/tuning.ts` no aparelho (cor de destaque, pulsação, zoom das capas, velocidade).

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `playback`: confirma no aparelho a reprodução em segundo plano e a emenda entre faixas.

## Impact

Sem mudança de código prevista; ajustes conforme o que o build revelar.
