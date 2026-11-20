import { parseGalaxy } from '@/galaxy/contract';
import { generateMockGalaxy } from '@/galaxy/generator';
import { radioWalk } from '@/galaxy/radio';
import { SpatialIndex } from '@/galaxy/spatial-index';
import { setEngine } from '@/services/player';
import { usePlayerStore } from '@/state/player';
import { createFakeEngine, makeTracks } from '@/test-utils/fake-engine';

describe('radioWalk', () => {
  const data = parseGalaxy(generateMockGalaxy(Array.from({ length: 1500 }, (_, i) => `r${i}`)));
  const index = new SpatialIndex(data.positions);

  it('começa pela semente, não repete e respeita o tamanho', () => {
    const path = radioWalk(data.positions, index, 10, 50);
    expect(path[0]).toBe(10);
    expect(path).toHaveLength(50);
    expect(new Set(path).size).toBe(50);
  });

  it('cada passo vai para um vizinho próximo', () => {
    const path = radioWalk(data.positions, index, 10, 20);
    const d = (a: number, b: number) =>
      Math.hypot(
        data.positions[a * 3] - data.positions[b * 3],
        data.positions[a * 3 + 1] - data.positions[b * 3 + 1],
        data.positions[a * 3 + 2] - data.positions[b * 3 + 2],
      );
    const steps = path.slice(1).map((p, i) => d(path[i], p));
    expect(Math.max(...steps)).toBeLessThan(0.5);
  });

  it('pula pontos não elegíveis', () => {
    const path = radioWalk(data.positions, index, 0, 30, (i) => i % 2 === 0);
    expect(path.slice(1).every((i) => i % 2 === 0)).toBe(true);
  });
});

describe('replaceQueue', () => {
  const { engine, fake } = createFakeEngine();
  setEngine(engine);

  it('troca a fila sem recarregar a música atual', async () => {
    const tracks = makeTracks(5);
    await usePlayerStore.getState().playList(tracks, 2, { kind: 'tracks' });
    const loadsBefore = fake.window[0].id;
    const radio = [tracks[2], ...makeTracks(3).map((t) => ({ ...t, id: `n${t.id}` }))];
    await usePlayerStore.getState().replaceQueue(radio, { kind: 'radio', seedId: 't3' });
    expect(usePlayerStore.getState().current?.id).toBe('t3');
    expect(fake.window[0].id).toBe(loadsBefore);
    expect(fake.window[1].id).toBe('nt1');
    expect(usePlayerStore.getState().source).toEqual({ kind: 'radio', seedId: 't3' });
  });
});

afterAll(async () => {
  await usePlayerStore.getState().stop();
});
