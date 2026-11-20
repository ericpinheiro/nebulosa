import { tuning } from '@/config/tuning';
import { boundingSphere } from '@/galaxy/bounds';
import {
  beginInteraction,
  CAMERA_FOV,
  configureFit,
  createOrbit,
  drag,
  endInteraction,
  fitDistance,
  fitFactor,
  focusOn,
  maxDistance,
  pan,
  pinch,
  step,
} from '@/ui/galaxy/orbit';

const PORTRAIT = { width: 393, height: 852 };
const INSETS = { top: 120, bottom: 160 };

function fitted() {
  const o = createOrbit();
  configureFit(o, [0, 0, 0], 10, fitFactor(PORTRAIT, INSETS));
  return o;
}

/** Raio (em px) que uma esfera ocupa na tela a uma distância d, pelo eixo mais apertado. */
function projectedHalfAngle(radius: number, d: number) {
  return Math.asin(radius / d);
}

describe('órbita', () => {
  it('pinça respeita os limites', () => {
    const o = fitted();
    pinch(o, 1000);
    expect(o.distance).toBe(tuning.galaxy.cameraMinDistance);
    pinch(o, 0.0001);
    expect(o.distance).toBeCloseTo(maxDistance(o));
  });

  it('rotação automática pausa no gesto e volta depois do tempo configurado', () => {
    const o = createOrbit();
    const t0 = 1_000_000;
    beginInteraction(o, t0);
    drag(o, 10, 0, 16);
    endInteraction(o, t0);
    o.velYaw = 0;
    const yaw = o.yaw;
    step(o, 0.016, t0 + 1000);
    expect(o.yaw).toBe(yaw);
    for (let i = 0; i < 200; i++) step(o, 0.016, t0 + tuning.galaxy.autoRotateResumeMs + 100 + i * 16);
    expect(o.yaw).toBeGreaterThan(yaw);
  });

  it('arrasto horizontal gira em yaw com inércia', () => {
    const o = createOrbit();
    beginInteraction(o, 0);
    drag(o, -100, 0, 16);
    endInteraction(o, 0);
    const yaw = o.yaw;
    step(o, 0.016, 10);
    expect(o.yaw).not.toBe(yaw);
  });

  it('enquadramento cabe a esfera no eixo mais apertado (retrato: horizontal)', () => {
    const d = fitDistance(10, PORTRAIT, { top: 0, bottom: 0 }, CAMERA_FOV, 0);
    const focal = PORTRAIT.height / 2 / Math.tan((CAMERA_FOV * Math.PI) / 360);
    const halfH = Math.atan(PORTRAIT.width / 2 / focal);
    expect(projectedHalfAngle(10, d)).toBeCloseTo(halfH);
    // Muito acima do antigo máximo fixo (34).
    expect(d).toBeGreaterThan(34);
  });

  it('recortes da interface só aumentam a distância quando a área livre fica mais apertada', () => {
    const free = fitDistance(10, PORTRAIT, { top: 0, bottom: 0 });
    expect(fitDistance(10, PORTRAIT, INSETS)).toBeGreaterThanOrEqual(free);
    const tight = fitDistance(10, PORTRAIT, { top: 300, bottom: 300 });
    expect(tight).toBeGreaterThan(free);
  });

  it('abre centralizado no centro da nuvem e no zoom máximo', () => {
    const o = createOrbit();
    configureFit(o, [1, 2, 3], 10, fitFactor(PORTRAIT, INSETS));
    expect(o.target).toEqual([1, 2, 3]);
    expect(o.distance).toBeCloseTo(maxDistance(o));
  });

  it('esfera envolvente', () => {
    const b = boundingSphere(new Float32Array([-1, 0, 0, 1, 0, 0, 0, 0.5, 0]));
    expect(b.center[0]).toBeCloseTo(0);
    expect(b.radius).toBeCloseTo(Math.hypot(1, 0.5 / 3));
  });

  it('recentro desliza até a música sem mudar o zoom', () => {
    const o = fitted();
    pinch(o, 2);
    const d = o.distance;
    focusOn(o, [5, 0, 0], 0);
    step(o, 0.016, tuning.galaxy.focusDurationMs / 2);
    expect(o.target[0]).toBeGreaterThan(0);
    expect(o.target[0]).toBeLessThan(5);
    step(o, 0.016, tuning.galaxy.focusDurationMs + 1);
    expect(o.target).toEqual([5, 0, 0]);
    expect(o.distance).toBeCloseTo(d);
  });

  it('no zoom máximo, a distância acompanha o novo máximo', () => {
    const o = fitted();
    const before = o.distance;
    focusOn(o, [8, 0, 0], 0);
    step(o, 0.016, tuning.galaxy.focusDurationMs + 1);
    expect(o.distance).toBeCloseTo(maxDistance(o));
    expect(o.distance).toBeGreaterThan(before);
  });

  it('recentro espera o gesto terminar', () => {
    const o = fitted();
    beginInteraction(o, 0);
    focusOn(o, [5, 0, 0], 10);
    step(o, 0.016, 2000);
    expect(o.target).toEqual([0, 0, 0]);
    endInteraction(o, 3000);
    step(o, 0.016, 3000 + tuning.galaxy.focusDurationMs + 1);
    expect(o.target).toEqual([5, 0, 0]);
  });

  it('mover com dois dedos cancela o recentro', () => {
    const o = fitted();
    focusOn(o, [5, 0, 0], 0);
    beginInteraction(o, 10);
    pan(o, 1, 0, 800);
    endInteraction(o, 20);
    expect(o.focus).toBeNull();
    step(o, 0.016, 5000);
    expect(o.target[0]).toBeLessThan(1);
  });

  it('dados novos não tiram o centro da música', () => {
    const o = fitted();
    focusOn(o, [5, 0, 0], 0);
    step(o, 0.016, tuning.galaxy.focusDurationMs + 1);
    configureFit(o, [0, 0, 0], 11, fitFactor(PORTRAIT, INSETS));
    expect(o.target).toEqual([5, 0, 0]);
  });
});
