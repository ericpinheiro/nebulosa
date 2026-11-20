import { buildTrail, NO_TRAIL } from '@/galaxy/trail';
import { parseGalaxy } from '@/galaxy/contract';
import { energyAt, mockEnvelope, parseEnvelope } from '@/galaxy/energy';
import { generateMockGalaxy, positionForId } from '@/galaxy/generator';
import { SpatialIndex } from '@/galaxy/spatial-index';

const ids = Array.from({ length: 7258 }, (_, i) => `id-${i}`);

describe('gerador', () => {
  it('é determinístico por id e independente da ordem', () => {
    const a = generateMockGalaxy(ids);
    const b = generateMockGalaxy(ids.slice().reverse());
    const pa = new Map(a.points.map((p) => [p.id, p.p]));
    for (const p of b.points) expect(pa.get(p.id)).toEqual(p.p);
    expect(a.version).toBe(b.version);
  });

  it('fica em [-1, 1] e espalha os pontos', () => {
    const pts = ids.map(positionForId);
    for (const p of pts) for (const c of p) expect(Math.abs(c)).toBeLessThanOrEqual(1);
    const spread = Math.max(...pts.map((p) => Math.hypot(...p)));
    expect(spread).toBeGreaterThan(0.5);
  });
});

describe('contrato v1', () => {
  it('descarta pontos inválidos e duplicados', () => {
    const data = parseGalaxy({
      version: 'v',
      generatedAt: '',
      count: 4,
      points: [
        { id: 'a', p: [0, 0, 0] },
        { id: 'a', p: [0.1, 0, 0] },
        { id: 'b', p: [2, 0, 0] },
        { id: 'c', p: [0, 0] },
        { id: 'd', p: [0.5, -0.5, 1], group: 'g' },
      ],
    });
    expect(data.ids).toEqual(['a', 'd']);
    expect(data.indexById.get('d')).toBe(1);
    expect(data.groups[1]).toBe('g');
    expect(Array.from(data.positions)).toEqual([0, 0, 0, 0.5, -0.5, 1]);
  });

  it('rejeita JSON sem points', () => {
    expect(() => parseGalaxy({ version: 'x' })).toThrow();
  });
});

describe('índice espacial', () => {
  it('nearest bate com a busca bruta', () => {
    const data = parseGalaxy(generateMockGalaxy(ids.slice(0, 2000)));
    const index = new SpatialIndex(data.positions);
    const target = [data.positions[30], data.positions[31], data.positions[32]];
    const brute = Array.from({ length: 2000 }, (_, i) => i)
      .map((i) => [
        i,
        Math.hypot(
          data.positions[i * 3] - target[0],
          data.positions[i * 3 + 1] - target[1],
          data.positions[i * 3 + 2] - target[2],
        ),
      ])
      .sort((a, b) => a[1] - b[1])
      .slice(0, 20)
      .map((x) => x[0]);
    expect(index.nearest(target[0], target[1], target[2], 20)).toEqual(brute);
  });
});

describe('envelope', () => {
  it('interpola entre amostras', () => {
    const env = parseEnvelope({ id: 'x', rate: 20, e: [0, 255] });
    expect(energyAt(env, 0.025)).toBeCloseTo(0.5, 5);
    expect(energyAt(env, 10)).toBe(0);
  });
  it('mock fica entre 0 e 1 e tem batidas', () => {
    const env = mockEnvelope('abc', 30);
    expect(env.values.length).toBe(600);
    const max = Math.max(...env.values);
    const min = Math.min(...env.values);
    expect(max).toBeLessThanOrEqual(1);
    expect(min).toBeGreaterThanOrEqual(0);
    expect(max - min).toBeGreaterThan(0.3);
  });
});

describe('rastro', () => {
  it('marca só as tocadas na janela, relativas ao epoch', () => {
    const idx = new Map([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]);
    const now = 100 * 3600_000;
    const epoch = now - 1000;
    const trail = buildTrail(
      3,
      idx,
      [
        { id: 'a', lastPlayedAt: now - 2 * 3600_000 },
        { id: 'b', lastPlayedAt: now - 25 * 3600_000 },
        { id: 'zz', lastPlayedAt: now },
      ],
      epoch,
      now,
      24 * 3600_000,
    );
    expect(trail[0]).toBeCloseTo((now - 2 * 3600_000 - epoch) / 1000);
    expect(trail[1]).toBe(NO_TRAIL);
    expect(trail[2]).toBe(NO_TRAIL);
  });
});
