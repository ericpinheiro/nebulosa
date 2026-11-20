import { tuning } from '@/config/tuning';
import { beginInteraction, createOrbit, drag, endInteraction, pinch, step } from '@/ui/galaxy/orbit';

describe('órbita', () => {
  it('pinça respeita os limites', () => {
    const o = createOrbit();
    pinch(o, 1000);
    expect(o.distance).toBe(tuning.galaxy.cameraMinDistance);
    pinch(o, 0.0001);
    expect(o.distance).toBe(tuning.galaxy.cameraMaxDistance);
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
});
