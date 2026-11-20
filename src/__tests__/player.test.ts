import { setEngine } from '@/services/player';
import { usePlayerStore } from '@/state/player';

import { createFakeEngine, makeTracks } from '@/test-utils/fake-engine';

const { engine, fake } = createFakeEngine();
setEngine(engine);

describe('player store', () => {
  const tracks = makeTracks(10);

  beforeEach(async () => {
    await usePlayerStore.getState().stop();
    usePlayerStore.setState({ shuffle: false });
  });

  it('tocar do meio carrega a atual e pré-carrega a próxima', async () => {
    await usePlayerStore.getState().playList(tracks, 3, { kind: 'album', id: 'a1' });
    expect(usePlayerStore.getState().current?.id).toBe('t4');
    expect(fake.window.map((t) => t.id)).toEqual(['t4', 't5']);
    expect(usePlayerStore.getState().status).toBe('playing');
  });

  it('avanço natural do motor avança a fila e pré-carrega a seguinte', async () => {
    await usePlayerStore.getState().playList(tracks, 3, { kind: 'album', id: 'a1' });
    fake.emit('advanced', tracks[4]);
    await new Promise((r) => setTimeout(r, 0));
    expect(usePlayerStore.getState().current?.id).toBe('t5');
    expect(fake.window.map((t) => t.id)).toContain('t6');
  });

  it('anterior nos 3 primeiros segundos volta faixa; depois reinicia', async () => {
    await usePlayerStore.getState().playList(tracks, 3, { kind: 'album', id: 'a1' });
    usePlayerStore.setState({ position: 1 });
    await usePlayerStore.getState().previous();
    expect(usePlayerStore.getState().current?.id).toBe('t3');
    usePlayerStore.setState({ position: 30 });
    await usePlayerStore.getState().previous();
    expect(usePlayerStore.getState().current?.id).toBe('t3');
    expect(fake.position).toBe(0);
  });

  it('fim da fila para e mantém a faixa na posição inicial', async () => {
    await usePlayerStore.getState().playList(tracks, 9, { kind: 'album', id: 'a1' });
    fake.emit('ended');
    expect(usePlayerStore.getState().current?.id).toBe('t10');
    expect(usePlayerStore.getState().position).toBe(0);
    expect(usePlayerStore.getState().status).toBe('paused');
  });

  it('shuffle não interrompe a faixa atual', async () => {
    await usePlayerStore.getState().playList(tracks, 3, { kind: 'album', id: 'a1' });
    await usePlayerStore.getState().toggleShuffle();
    expect(usePlayerStore.getState().current?.id).toBe('t4');
    expect(fake.window[0].id).toBe('t4');
    await usePlayerStore.getState().toggleShuffle();
    expect(fake.window.map((t) => t.id)).toEqual(['t4', 't5']);
  });

  it('stop esvazia a fila', async () => {
    await usePlayerStore.getState().playList(tracks, 0, { kind: 'tracks' });
    await usePlayerStore.getState().stop();
    expect(usePlayerStore.getState().current).toBeNull();
    expect(usePlayerStore.getState().queue.items).toHaveLength(0);
  });
});

afterAll(async () => {
  await usePlayerStore.getState().stop();
});
