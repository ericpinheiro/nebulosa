import {
  angleDelta,
  angleOf,
  angleToFraction,
  armedAction,
  classifyTouch,
  rubberBand,
  swipeAction,
  scrubFraction,
  swipeProgress,
  TAU,
} from '@/ui/now-playing/orb-math';

describe('classifyTouch', () => {
  it('centro, anel e fora', () => {
    expect(classifyTouch(42, 42, 84, 0.62, 14)).toBe('center');
    expect(classifyTouch(42, 4, 84, 0.62, 14)).toBe('ring');
    expect(classifyTouch(42, -10, 84, 0.62, 14)).toBe('ring');
    expect(classifyTouch(42, -40, 84, 0.62, 14)).toBe('none');
  });
});

describe('angleOf', () => {
  it('começa no topo e cresce no sentido horário', () => {
    expect(angleOf(0, -1)).toBeCloseTo(0);
    expect(angleOf(1, 0)).toBeCloseTo(Math.PI / 2);
    expect(angleOf(0, 1)).toBeCloseTo(Math.PI);
    expect(angleOf(-1, 0)).toBeCloseTo((3 * Math.PI) / 2);
  });

  it('quarto de volta vira 1/4 da duração', () => {
    expect(angleToFraction(angleOf(1, 0))).toBeCloseTo(0.25);
  });
});

describe('seek relativo', () => {
  it('diferença de ângulo pelo caminho curto, inclusive passando pelo topo', () => {
    expect(angleDelta(1, 1.2)).toBeCloseTo(0.2);
    expect(angleDelta(TAU - 0.1, 0.1)).toBeCloseTo(0.2);
    expect(angleDelta(0.1, TAU - 0.1)).toBeCloseTo(-0.2);
  });

  it('parte da posição atual: tocar sem girar não muda nada', () => {
    expect(scrubFraction(0.4, 2, 2)).toBeCloseTo(0.4);
  });

  it('um quarto de volta no sentido horário avança um quarto da música', () => {
    expect(scrubFraction(0.1, 0, Math.PI / 2)).toBeCloseTo(0.35);
    expect(scrubFraction(0.5, Math.PI, Math.PI / 2)).toBeCloseTo(0.25);
  });

  it('para no fim e no começo', () => {
    expect(scrubFraction(0.95, 0, 1)).toBe(1);
    expect(scrubFraction(0.05, 1, 0)).toBe(0);
  });
});

describe('arrasto do centro', () => {
  it('limiar de distância', () => {
    expect(swipeAction(50, 0, 44, 700)).toBe('next');
    expect(swipeAction(-50, 0, 44, 700)).toBe('previous');
    expect(swipeAction(20, 0, 44, 700)).toBeNull();
  });

  it('fling confirma arrasto curto, mas não um toque', () => {
    expect(swipeAction(20, 900, 44, 700)).toBe('next');
    expect(swipeAction(-20, -900, 44, 700)).toBe('previous');
    expect(swipeAction(5, 900, 44, 700)).toBeNull();
    expect(swipeAction(20, -900, 44, 700)).toBeNull();
  });

  it('troca de ícone acompanha o arrasto até o limiar', () => {
    expect(swipeProgress(22, 44)).toBeCloseTo(0.5);
    expect(swipeProgress(-100, 44)).toBe(-1);
  });

  it('ação armada só depois do limiar', () => {
    expect(armedAction(30, 44)).toBeNull();
    expect(armedAction(44, 44)).toBe('next');
  });

  it('resistência limita o deslocamento', () => {
    expect(rubberBand(10, 56)).toBeGreaterThan(8);
    expect(rubberBand(500, 56)).toBeLessThan(56);
    expect(rubberBand(-500, 56)).toBeGreaterThan(-56);
  });
});
