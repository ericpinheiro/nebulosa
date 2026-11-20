import { backgroundGradient, formatDuration, luminance, mixWithWhite } from '@/ui/color';

describe('cores', () => {
  it('mistura com branco', () => {
    expect(mixWithWhite('#000000', 0.5)).toBe('#808080');
    expect(mixWithWhite('#ff0000', 1)).toBe('#ffffff');
    expect(mixWithWhite('#f00', 0)).toBe('#ff0000');
  });
  it('degradê padrão sem capa e claro com capa', () => {
    expect(backgroundGradient(null, 0.6)).toEqual(['#a9a9ad', '#dcdcdf']);
    const [top, bottom] = backgroundGradient('#cc2200', 0.62);
    expect(luminance(top)).toBeGreaterThan(0.25);
    expect(luminance(bottom)).toBeGreaterThan(luminance(top));
  });
});

describe('duração', () => {
  it('formata', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(61_000)).toBe('1:01');
    expect(formatDuration(3_725_000)).toBe('1:02:05');
  });
});
