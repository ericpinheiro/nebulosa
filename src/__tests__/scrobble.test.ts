import { batchParams, shouldScrobble, signatureBase } from '@/services/lastfm/rules';

describe('regras de scrobble', () => {
  it('ignora faixas curtas e puladas', () => {
    expect(shouldScrobble(25, 25)).toBe(false);
    expect(shouldScrobble(180, 20)).toBe(false);
  });
  it('metade da duração ou 4 minutos', () => {
    expect(shouldScrobble(180, 90)).toBe(true);
    expect(shouldScrobble(180, 89)).toBe(false);
    expect(shouldScrobble(900, 240)).toBe(true);
  });
});

describe('assinatura', () => {
  it('ordena chaves, ignora format e acrescenta o segredo', () => {
    expect(signatureBase({ method: 'm', api_key: 'k', format: 'json', b: '2' }, 'S')).toBe('api_keykb2methodmS');
  });
  it('lote indexado', () => {
    expect(batchParams([{ artist: 'A', track: 'T', timestamp: 10 }])).toEqual({
      'artist[0]': 'A',
      'track[0]': 'T',
      'timestamp[0]': '10',
    });
  });
});
