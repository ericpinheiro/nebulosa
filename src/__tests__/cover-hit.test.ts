import { pickCover } from '@/ui/galaxy/cover-hit';

describe('pickCover', () => {
  const a = { index: 1, x: 100, y: 100, size: 40, z: 10 };
  const b = { index: 2, x: 110, y: 100, size: 40, z: 20 };

  it('nada quando o toque está longe', () => {
    expect(pickCover([a, b], 300, 300, 20)).toBeNull();
  });

  it('escolhe a mais à frente quando há sobreposição', () => {
    expect(pickCover([a, b], 105, 100, 20)).toBe(2);
    expect(pickCover([b, a], 105, 100, 20)).toBe(2);
  });

  it('raio mínimo ajuda capas pequenas', () => {
    const tiny = { index: 3, x: 50, y: 50, size: 10, z: 1 };
    expect(pickCover([tiny], 70, 50, 10)).toBeNull();
    expect(pickCover([tiny], 70, 50, 34)).toBe(3);
  });
});
