import { createQueue, currentIndex, currentItem, hasNext, next, previous, setShuffle, upcoming } from '@/state/queue';

const album = Array.from({ length: 10 }, (_, i) => `t${i + 1}`);

function seeded(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe('fila', () => {
  it('tocar a faixa 4 enfileira 5..10 e anterior leva à 3', () => {
    const q = createQueue(album, 3, false);
    expect(currentItem(q)).toBe('t4');
    expect(upcoming(q, 10)).toEqual(['t5', 't6', 't7', 't8', 't9', 't10']);
    expect(currentItem(previous(q))).toBe('t3');
  });

  it('para no fim da fila', () => {
    let q = createQueue(album, 9, false);
    expect(hasNext(q)).toBe(false);
    q = next(q);
    expect(currentItem(q)).toBe('t10');
  });

  it('shuffle começa pela faixa escolhida e contém todas', () => {
    const q = createQueue(album, 3, true, seeded());
    expect(currentItem(q)).toBe('t4');
    expect([...q.order].sort((a, b) => a - b)).toEqual(album.map((_, i) => i));
  });

  it('ligar e desligar shuffle mantém a atual e volta à ordem original', () => {
    let q = createQueue(album, 3, false);
    q = setShuffle(q, true, seeded(7));
    expect(currentItem(q)).toBe('t4');
    q = next(next(q));
    const playing = currentIndex(q);
    q = setShuffle(q, false);
    expect(currentIndex(q)).toBe(playing);
    expect(upcoming(q, 1)).toEqual(playing < 9 ? [album[playing + 1]] : []);
  });

  it('ligar shuffle no meio preserva as já tocadas para trás', () => {
    let q = createQueue(album, 0, false);
    q = next(next(q)); // t3
    q = setShuffle(q, true, seeded(3));
    expect(currentItem(q)).toBe('t3');
    expect(currentItem(previous(q))).toBe('t2');
    expect(new Set(upcoming(q, 20))).toEqual(new Set(album.slice(3)));
  });
});
