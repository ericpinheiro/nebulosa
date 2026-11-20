import { mapTrack, msToTicks, ticksToMs } from '@/state/library/mappers';
import { likePattern, normalizeSearch, sortKey } from '@/state/library/normalize';

describe('normalização', () => {
  it('remove acentos e maiúsculas', () => {
    expect(normalizeSearch('São  Paulo')).toBe('sao paulo');
    expect(likePattern('Ação_100%')).toBe('%acao\\_100\\%%');
  });
  it('ordenação ignora artigos', () => {
    expect(sortKey('The Beatles')).toBe('beatles');
    expect(sortKey('Os Mutantes')).toBe('mutantes');
  });
});

describe('mapTrack', () => {
  it('converte BaseItemDto para linha', () => {
    const row = mapTrack(
      {
        Id: 'x',
        Name: 'Águas de Março',
        Artists: ['Elis Regina', 'Tom Jobim'],
        Album: 'Elis & Tom',
        AlbumId: 'al',
        RunTimeTicks: 2_100_000_000,
        IndexNumber: 1,
        ParentIndexNumber: 1,
        ProductionYear: 1974,
        Genres: ['MPB'],
        AlbumPrimaryImageTag: 'tag',
        ArtistItems: [{ Id: 'a1' }, { Id: 'a2' }],
        AlbumArtists: [{ Id: 'a1' }],
        UserData: { IsFavorite: true, LastPlayedDate: '2026-11-19T10:00:00Z', Key: 'k' },
      },
      1000,
    );
    expect(row.artist).toBe('Elis Regina, Tom Jobim');
    expect(row.durationMs).toBe(210_000);
    expect(row.artistIds).toEqual(['a1', 'a2']);
    expect(row.isFavorite).toBe(true);
    expect(row.favoritedAt).toBe(1000);
    expect(row.lastPlayedAt).toBe(Date.parse('2026-11-19T10:00:00Z'));
    expect(row.genre).toBe('MPB');
  });
  it('ticks <-> ms', () => {
    expect(ticksToMs(msToTicks(1234))).toBe(1234);
  });
});
