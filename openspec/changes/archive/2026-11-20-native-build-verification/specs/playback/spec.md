## ADDED Requirements

### Requirement: Validação no aparelho
A reprodução SHALL ser validada num iPhone real com build de desenvolvimento, cobrindo segundo plano, tela de bloqueio e emenda entre faixas FLAC de um álbum.

#### Scenario: Álbum em segundo plano
- **WHEN** um álbum toca com o iPhone bloqueado
- **THEN** as faixas emendam sem silêncio perceptível e os controles da tela de bloqueio funcionam
