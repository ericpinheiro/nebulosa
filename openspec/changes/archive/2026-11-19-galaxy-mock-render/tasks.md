## 1. Dados da galáxia

- [x] 1.1 Tipos e validação do contrato v1 (`src/galaxy/contract.ts`) com testes
- [x] 1.2 Gerador determinístico com braços e aglomerados (`src/galaxy/generator.ts`) com testes
- [x] 1.3 Índice espacial em grade (`src/galaxy/spatial-index.ts`) com testes
- [x] 1.4 Envelope de energia: contrato, mock, cache e consulta interpolada (`src/galaxy/energy.ts`) com testes
- [x] 1.5 Store da galáxia: fonte mock (biblioteca local) ou remota com cache por versão
- [x] 1.6 Script `scripts/generate-galaxy-mock.ts`

## 2. Renderização

- [x] 2.1 Shader de pontos (destaque; uniforms prontos para rastro e pulsação)
- [x] 2.2 Componente `GalaxyView` com Canvas, Points e câmera de órbita
- [x] 2.3 Gestos: girar, pinça, dois dedos; inércia; rotação automática
- [x] 2.4 Frame loop 30/60 fps e pausa em segundo plano
- [x] 2.5 Destaque ligado ao player

## 3. Verificação

- [x] 3.1 Typecheck e testes passando
