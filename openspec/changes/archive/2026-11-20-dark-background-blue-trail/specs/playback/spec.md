## MODIFIED Requirements

### Requirement: Relatório de reprodução ao Jellyfin
O app SHALL informar ao Jellyfin o início (`/Sessions/Playing`) quando a faixa atingir o tempo mínimo ouvido configurado (20 segundos), o progresso a cada 10 segundos e em pausa/seek (`/Sessions/Playing/Progress`) e a parada ou troca de faixa (`/Sessions/Playing/Stopped`) com a posição em ticks. Uma faixa trocada antes do tempo mínimo MUST NOT ser reportada (nem início, nem progresso, nem parada), para o Jellyfin não registrar faixas puladas como tocadas. Falhas de relatório MUST NOT interromper a reprodução.

#### Scenario: Troca de faixa
- **WHEN** a faixa atual, ouvida por mais de 20 segundos, muda para a próxima
- **THEN** o app envia "Stopped" da faixa anterior com a posição final, e "Playing" da nova quando ela completar 20 segundos ouvidos

#### Scenario: Faixa pulada
- **WHEN** o usuário pula a faixa atual depois de 5 segundos
- **THEN** o app não envia nenhum relatório dessa faixa ao Jellyfin

#### Scenario: Servidor fora do ar
- **WHEN** o relatório falha
- **THEN** a música continua tocando normalmente
