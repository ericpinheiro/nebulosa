# Nebulosa — Briefing inicial

Nov 19, 2026 · @Eric Pinheiro

## Visão geral

O Nebulosa é um app de música em React Native (iOS primeiro, depois Android) que toca a biblioteca do Jellyfin do Bruno, em brunoflix.rizomalivre.com. O centro da experiência é uma galáxia 3D onde cada ponto é uma música, agrupada por similaridade.

- **Nome:** Nebulosa. Completa a família com o Rizoma (servidor do Bruno) e a Fenda (servidor do Eric).
- **Usuários:** o Eric (iPhone 16 Pro) e o Bruno (Android, modelo a confirmar, não é de entrada).
- **Servidor:** fixo no brunoflix. Não há tela de escolher servidor, só login com usuário e senha.
- **Biblioteca atual:** 7.258 músicas, quase todas em FLAC.
- **Distribuição inicial:** iOS com a conta grátis da Apple, instalado pelo Xcode e renovado a cada 7 dias. Android por APK direto.
- **Idioma:** português.
- **O Bruno sabe e concorda** com o app e com o registro de reproduções no servidor.

## Escopo do MVP

O MVP é o app que o Eric usa no dia a dia no iPhone: tocar música da biblioteca com a galáxia como tela principal. Os dados da galáxia vêm de um mock até o pipeline real ficar pronto.

1. **Login** no brunoflix com usuário e senha. Token guardado de forma segura.
2. **Reprodução:** play/pause, anterior, próxima, shuffle e barra de progresso. Toca em segundo plano, com controles na tela de bloqueio e na central de controle.
3. **Fila:** tocar uma música de uma lista coloca o resto da lista na fila. A fila não aparece na interface.
4. **Galáxia 3D (mock):** gestos, rotação automática, destaque da música tocando, rastro de 24 h, pulsação sutil e capas ao dar zoom.
5. **Rádio por proximidade:** fila gerada pelas músicas vizinhas na galáxia.
6. **Capa expandida:** a capa no topo abre o álbum, com a lista de faixas, no lugar da galáxia.
7. **Biblioteca em painel:** álbuns, músicas, artistas, playlists e favoritos, com busca e mini player.
8. **Favoritos sincronizados** com o Jellyfin.
9. **Relatório de reprodução** ao Jellyfin (tocando agora, progresso, última vez tocada).
10. **Scrobble no Last.fm** (a forma de integração está em Pendências).

## Próximos passos (fora do MVP)

Ficam para depois do MVP, mais ou menos nesta ordem:

1. **Dados reais da galáxia:** script que converte a saída do Bruno para o JSON do app e um endpoint para servir esse JSON, provavelmente no servidor do Eric.
2. **Versão Android** distribuída ao Bruno por APK, com ajuste de desempenho da galáxia no aparelho dele.
3. **Qualidade por rede:** FLAC original no Wi-Fi e AAC 256 kbps convertido pelo servidor nos dados móveis.
4. **Modo offline:** baixar álbuns e playlists, gerenciar espaço e enviar ao Jellyfin as reproduções feitas offline.
5. **Cache antecipado:** baixar as próximas faixas do álbum enquanto está no Wi-Fi.
6. **Crossfade inteligente:** ligado em playlists e shuffle, desligado em álbuns tocados em ordem.
7. **Motor de áudio próprio no iOS** (AVAudioEngine), se o gapless da biblioteca padrão incomodar.
8. **Cores por agrupamento** na galáxia, usando o parâmetro de cor já previsto.
9. **CarPlay e Android Auto.** O CarPlay exige conta paga e uma permissão especial da Apple.
10. **Conta paga da Apple e TestFlight**, quando o app estiver estável para uso diário.

## Tela principal

A tela principal é extremamente limpa: a galáxia ocupa o centro, a capa e o título ficam no topo, e os controles ficam embaixo.

**Layout, de cima para baixo**

- Capa do álbum pequena, com título da música e artista ao lado.
- Galáxia 3D no centro.
- Barra de progresso fina e sutil.
- Controles: anterior, play/pause, próxima, shuffle. Sem botão de repetir.
- Botão de abrir a biblioteca.

**Esconder a interface:** depois de 10 segundos sem toque, tudo some menos a galáxia. Qualquer toque na tela traz tudo de volta.

**Fundo:** degradê claro e meio opaco, com a cor tirada da capa do álbum tocando. Precisa ser suave o bastante para não atrapalhar a leitura do que está por cima. A transição de cor acompanha a troca de música.

**Capa expandida**

- Tocar na capa pequena faz ela crescer e ocupar o lugar da galáxia.
- Logo abaixo aparece a lista de faixas do álbum. Tocar numa faixa troca a música e coloca o resto do álbum na fila.
- Para voltar à galáxia: tocar de novo na capa ou arrastar para baixo.

**Estado vazio (nada tocando):** a galáxia aparece normalmente, girando, e o único botão visível é o de abrir a biblioteca.

## Galáxia 3D

A galáxia é uma nuvem de 7.258 partículas, uma por música, posicionadas em 3D por similaridade (UMAP). É monocromática e gira devagar quando ninguém está mexendo.

**Gestos:** arrastar gira, pinça dá zoom. A rotação automática para durante o gesto e volta depois de alguns segundos parada.

**Comportamento por nível de zoom**

|  | Zoom afastado | Zoom próximo |
| --- | --- | --- |
| O que aparece | Pontos | Os pontos no campo de visão viram capas pequenas, surgindo com efeito de bounce |
| Toque num item | Não faz nada (evita tocar no ponto errado) | 1º toque aumenta a capa um pouco; 2º toque toca a música |
| Pulsação | Ligada | Desligada, para não atrapalhar a navegação |

**Música tocando:** o ponto dela brilha mais, troca de cor e pulsa de leve. Tudo bem sutil.

**Pulsação com o som:** os pontos em volta da música tocando balançam no ritmo da música. O efeito é mais forte perto dela e vai sumindo com a distância. Tem que ser muito sutil, nada agressivo.

**Rastro das últimas 24 horas:** cada música tocada fica com a cor mais forte, que vai voltando à cor normal dos pontos conforme o tempo passa. Depois de 24 h ela fica igual aos outros pontos. O resultado é um caminho que vai se apagando.

**Rádio por proximidade:** a partir da música atual, gera uma fila com as músicas vizinhas no espaço 3D.

**Mock:** enquanto não houver dados reais, as posições vêm de um JSON gerado, e cada música tocada é associada a um ponto aleatório.

**Parâmetros configuráveis**, reunidos num só lugar do código para ajustar sem caçar valores:

| Parâmetro | Valor inicial |
| --- | --- |
| Cor dos pontos | Branco (prepara cor por agrupamento no futuro) |
| Cor de destaque | A definir no protótipo |
| Duração do rastro | 24 h |
| Intensidade da pulsação e raio de alcance | Sutil, ajustar no protótipo |
| Zoom que mostra as capas | Ajustar no protótipo |
| Velocidade da rotação automática | Lenta, ajustar no protótipo |
| Tempo para esconder a interface | 10 s |

## Biblioteca

A biblioteca abre como um painel que sobe de baixo e pode ser arrastado, com a galáxia continuando visível atrás. Um mini player flutuante fica sempre no painel.

| Visão | Layout | Ordenação | Toque |
| --- | --- | --- | --- |
| Álbuns | Grade de 3 colunas com destaque para as capas | A–Z | Abre o álbum com a lista de faixas |
| Músicas | Lista: capinha à esquerda, título, artista, álbum, duração e ano (quando houver) | A–Z, por álbum, por gênero (se houver o dado) | Toca a música e enfileira o resto da lista |
| Artistas | Lista | A–Z | Abre os álbuns do artista |
| Playlists | Lista | A–Z | Abre a playlist |
| Favoritos | Lista de músicas | Data em que favoritou | Toca e enfileira o resto |

- **Duas formas de chegar numa música:** abrindo um álbum ou pela listagem de músicas.
- **Busca** por música, álbum e artista.
- **Favoritar** pela lista ou pela tela principal, sincronizando com os favoritos do Jellyfin.
- **Fila:** não é exibida nem editável no MVP.

## Arquitetura técnica

O app tem três camadas: as telas leem só o estado local, e só a camada de serviços conversa com os servidores. O player fica isolado atrás de uma interface própria, para poder trocar o motor de áudio sem mexer nas telas.

&#91;embedded content: arquitetura do app · 3 camadas, 2 servidores\]

A galáxia é a peça central da interface. O Last.fm fica fora do desenho até decidir se o scrobble sai do app ou de um plugin no Jellyfin.

**Stack**

| Camada | Escolha |
| --- | --- |
| Linguagem | TypeScript |
| Framework | React Native + Expo (development build), Expo Router |
| Animações e gestos | Reanimated + Gesture Handler |
| 3D | three.js via react-three-fiber + expo-gl |
| Áudio | react-native-track-player v5 |
| Painel da biblioteca | @gorhom/bottom-sheet |
| Listas longas | FlashList |
| Imagens | expo-image, com cache |
| Dados do servidor | @jellyfin/sdk + TanStack Query |
| Estado do player e da interface | Zustand |
| Biblioteca local e busca | expo-sqlite |
| Preferências | MMKV |
| Token | expo-secure-store |
| Cor da capa | react-native-image-colors |

## Dados da galáxia

O app consome um único JSON versionado com a posição de cada música. O mesmo formato serve para o mock e para os dados reais, então trocar um pelo outro é só trocar a URL.

**Contrato (v1)**

```json
{
  "version": "2026-11-19.1",
  "generatedAt": "2026-11-19T22:00:00Z",
  "count": 7258,
  "points": [
    { "id": "<jellyfin item id>", "p": [0.12, -0.53, 0.88], "group": "opcional" }
  ]
}
```

- `id` é o id do item de áudio no Jellyfin. É isso que liga o ponto à música, à capa e ao histórico.
- `p` vem normalizado entre -1 e 1 em cada eixo, para o app não depender da escala do UMAP.
- `group` é opcional e fica reservado para a cor por agrupamento no futuro.
- O app guarda o JSON em cache e só baixa de novo quando `version` muda.

**Envelope de energia (para a pulsação):** um arquivo por música com a energia do áudio amostrada cerca de 20 vezes por segundo. Uma faixa de 4 minutos dá uns 4.800 números. O app sincroniza esses valores com a posição da reprodução. Veja o motivo em Decisões técnicas.

**Mock**

- Um script busca no Jellyfin os ids das 7.258 músicas e atribui a cada uma uma posição sintética, com braços e aglomerados parecidos com o UMAP do vídeo.
- Assim, o mock já tem ids reais: as capas no zoom e o rastro funcionam de verdade, e só a posição é falsa.
- O envelope do mock é uma onda sintética, até existir a análise real.
- O briefing original previa associar cada música tocada a um ponto aleatório. Atribuir ids reais dá o mesmo resultado visual e testa mais coisas.

**Pipeline real (próximo passo)**

1. O script do Bruno gera as coordenadas UMAP.
2. Um script de conversão casa cada música com o id do Jellyfin, normaliza as coordenadas e gera o JSON v1.
3. O mesmo pipeline calcula os envelopes de energia.
4. Os arquivos são servidos por HTTPS, provavelmente no servidor do Eric.

## Integração com o Jellyfin

Tudo o que não é galáxia vem da API REST do Jellyfin, acessada pelo SDK oficial em TypeScript (`@jellyfin/sdk`). As rotas abaixo são as previstas; os detalhes devem ser confirmados contra a versão do servidor do Bruno.

| Função | Rota |
| --- | --- |
| Login | `POST /Users/AuthenticateByName` (devolve o token) |
| Álbuns, músicas, playlists | `GET /Items` com `IncludeItemTypes` = `MusicAlbum`, `Audio` ou `Playlist`, e `Recursive=true` |
| Artistas | `GET /Artists/AlbumArtists` |
| Gêneros | `GET /MusicGenres` |
| Faixas de uma playlist | `GET /Playlists/{id}/Items` |
| Busca | `GET /Items?searchTerm=...` |
| Favoritos | `GET /Items?Filters=IsFavorite`; favoritar e desfavoritar pela rota de favoritos do usuário (o caminho varia conforme a versão) |
| Capas | `GET /Items/{id}/Images/Primary` com largura máxima |
| Áudio | `GET /Audio/{id}/universal` (FLAC em direct play) |
| Relatório de reprodução | `POST /Sessions/Playing`, `/Sessions/Playing/Progress`, `/Sessions/Playing/Stopped` |
| Rastro de 24 h | `GET /Items` com `SortBy=DatePlayed`, filtrando as últimas 24 h no app |

- **Rastro vindo do servidor:** o Jellyfin já guarda a data da última reprodução de cada música. Usar esse dado faz o rastro sobreviver a reinstalar o app e funcionar em mais de um aparelho.
- **Plano B para o rádio:** o Jellyfin tem o recurso Instant Mix, que pode servir de rádio enquanto a galáxia for mock.
- **Biblioteca local:** na primeira abertura, o app baixa os metadados das 7.258 músicas em páginas e guarda localmente. Navegação e busca ficam instantâneas, com atualização incremental depois.

## Decisões técnicas e riscos

A decisão mais importante é fazer a pulsação com dados pré-calculados. Assim o app não precisa analisar o áudio em tempo real e pode usar a biblioteca de áudio padrão.

| Tema | Decisão | Por quê |
| --- | --- | --- |
| Pulsação | Envelope de energia pré-calculado por música, sincronizado com a posição da reprodução | Analisar o som em tempo real não funciona com o player padrão do iOS e obrigaria a escrever um motor de áudio próprio |
| Renderização | Todos os pontos num único objeto de partículas, com shader próprio. Rastro e pulsação calculados na GPU | 7.258 pontos num único desenho rodam com folga a 60 fps no iPhone 16 Pro |
| Toque em pontos | Detecção só no zoom próximo, contra os pontos visíveis, com índice espacial | Evita varrer 7.258 pontos a cada toque |
| Capas no zoom | Limite de capas simultâneas (por exemplo, 40), miniaturas pequenas e em cache | Controla memória e tempo de carregamento |
| Áudio | react-native-track-player v5, FLAC em direct play, com pré-carregamento da próxima faixa | FLAC não tem silêncio extra da compressão, então o gapless fica bom sem motor próprio |
| Cor de fundo | Cor dominante da capa, misturada com branco e aplicada num degradê opaco | Mantém a tendência clara e a leitura confortável |
| Build | Expo com development build (não o Expo Go), compilado no Mac do Eric | As bibliotecas nativas de áudio e 3D não rodam no Expo Go |

**Riscos**

- **Bateria:** renderizar a 60 fps o tempo todo gasta bateria. Reduzir para 30 fps na rotação automática e parar de desenhar com o app em segundo plano ou a tela apagada.
- **Sincronia da pulsação:** a posição informada pelo player pode ter atraso. Interpolar entre as leituras para o balanço não ficar fora do ritmo.
- **Android do Bruno:** o modelo é desconhecido. Pode ser preciso reduzir efeitos no Android.
- **Conta grátis da Apple:** o app precisa ser reinstalado pelo Xcode a cada 7 dias, e a conta aceita no máximo 3 apps instalados assim.
- **Licença do react-native-track-player v5:** grátis para uso pessoal, paga para uso comercial. Rever se o app virar produto.
- **Gapless:** o pré-carregamento resolve a maior parte, mas a emenda pode não ficar perfeita no iOS. O motor de áudio próprio fica como próximo passo.

## Pendências

- [ ] Criar o usuário do Eric no brunoflix e confirmar a versão do Jellyfin.
- [ ] Confirmar que o usuário tem acesso à biblioteca de música e se a transcodificação de áudio está liberada.
- [ ] Perguntar ao Bruno se a biblioteca tem FLAC hi-res (24-bit) e se as músicas têm gênero preenchido.
- [ ] Descobrir o modelo do Android do Bruno.
- [ ] Decidir como fazer o scrobble no Last.fm: pelo app, com chave própria da API do Last.fm, ou por um plugin de Last.fm instalado no Jellyfin.
- [ ] Combinar com o Bruno o formato de saída do script dele, para escrever o conversor.
- [ ] Definir onde ficam hospedados o JSON da galáxia e os envelopes.
- [ ] Escolher a cor de destaque da música tocando e do rastro, no protótipo.

## Processo

O código fica num repositório no GitHub, e a implementação é especificada e conduzida com **OpenSpec**. Este briefing é a base das primeiras specs.

**Capacidades sugeridas para as specs**

| Capacidade | Cobre |
| --- | --- |
| `auth` | Login no brunoflix e armazenamento seguro do token |
| `library-sync` | Download e cache local dos metadados, atualização incremental |
| `playback` | Player, fila, tela de bloqueio, relatório ao Jellyfin |
| `now-playing` | Tela principal, capa expandida, cor de fundo, esconder a interface |
| `galaxy` | Renderização 3D, gestos, zoom com capas, destaque, rastro, pulsação |
| `galaxy-data` | Contrato JSON, mock, envelopes de energia |
| `radio` | Fila por proximidade na galáxia |
| `library-ui` | Painel, visões, ordenação, busca, mini player |
| `favorites-scrobble` | Favoritos sincronizados e Last.fm |

**Ordem sugerida das primeiras mudanças**

1. Projeto Expo com development build rodando no iPhone, mais `auth`.
2. `library-sync` e `playback` mínimo: tocar um álbum em segundo plano.
3. `galaxy-data` (mock) e `galaxy` sem pulsação.
4. `now-playing` e `library-ui`.
5. Rastro, pulsação, capas no zoom e `radio`.
6. `favorites-scrobble`.
