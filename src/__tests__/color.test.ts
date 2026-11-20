import { backgroundGradient, formatDuration, luminance, mixWithBlack, mixWithWhite } from '@/ui/color';

describe('cores', () => {
  it('mistura com branco', () => {
    expect(mixWithWhite('#000000', 0.5)).toBe('#808080');
    expect(mixWithWhite('#ff0000', 1)).toBe('#ffffff');
    expect(mixWithWhite('#f00', 0)).toBe('#ff0000');
  });
  it('mistura com preto', () => {
    expect(mixWithBlack('#ffffff', 0.5)).toBe('#808080');
    expect(mixWithBlack('#ff0000', 1)).toBe('#000000');
  });
  it('degradê padrão sem capa e escuro com capa', () => {
    expect(backgroundGradient(null, 0.7)).toEqual(['#141418', '#26262c']);
    for (const cover of ['#cc2200', '#ffffff', '#f5e050']) {
      const [top, bottom] = backgroundGradient(cover, 0.7);
      expect(luminance(top)).toBeLessThan(0.1);
      expect(luminance(bottom)).toBeLessThan(0.15);
      expect(luminance(bottom)).toBeGreaterThan(luminance(top));
    }
  });
});

describe('duração', () => {
  it('formata', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(61_000)).toBe('1:01');
    expect(formatDuration(3_725_000)).toBe('1:02:05');
  });
});
