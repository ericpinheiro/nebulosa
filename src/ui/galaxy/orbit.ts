import { tuning } from '@/config/tuning';

/** Estado da câmera em órbita. Mutável de propósito: é atualizado a cada quadro. */
export interface Orbit {
  yaw: number;
  pitch: number;
  distance: number;
  target: [number, number, number];
  velYaw: number;
  velPitch: number;
  /** Instante (ms) do último toque; a rotação automática espera depois dele. */
  lastInteraction: number;
  interacting: boolean;
  /** 0..1: quanto da rotação automática está aplicada (entra suave). */
  autoBlend: number;
}

const g = tuning.galaxy;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

export function createOrbit(): Orbit {
  return {
    yaw: 0,
    pitch: 0.25,
    distance: g.cameraInitialDistance,
    target: [0, 0, 0],
    velYaw: 0,
    velPitch: 0,
    lastInteraction: 0,
    interacting: false,
    autoBlend: 1,
  };
}

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export function beginInteraction(o: Orbit, now = Date.now()): void {
  o.interacting = true;
  o.lastInteraction = now;
  o.autoBlend = 0;
  o.velYaw = 0;
  o.velPitch = 0;
}

export function endInteraction(o: Orbit, now = Date.now()): void {
  o.interacting = false;
  o.lastInteraction = now;
}

/** Arrasto de um dedo: dx/dy em pixels desde o último evento. */
export function drag(o: Orbit, dx: number, dy: number, dtMs = 16): void {
  const dYaw = -dx * g.dragSensitivity;
  const dPitch = dy * g.dragSensitivity;
  o.yaw += dYaw;
  o.pitch = clamp(o.pitch + dPitch, -PITCH_LIMIT, PITCH_LIMIT);
  const dt = Math.max(dtMs, 1) / 1000;
  o.velYaw = dYaw / dt;
  o.velPitch = dPitch / dt;
}

/** Pinça: `scaleDelta` > 1 aproxima. */
export function pinch(o: Orbit, scaleDelta: number): void {
  if (scaleDelta <= 0) return;
  o.distance = clamp(o.distance / scaleDelta, g.cameraMinDistance, g.cameraMaxDistance);
}

/** Dois dedos arrastando: desloca o alvo no plano da câmera. */
export function pan(o: Orbit, dx: number, dy: number, viewportHeight: number): void {
  const worldPerPx = (2 * o.distance * Math.tan((50 * Math.PI) / 360)) / Math.max(viewportHeight, 1);
  const right: [number, number, number] = [Math.cos(o.yaw), 0, -Math.sin(o.yaw)];
  const up: [number, number, number] = [
    -Math.sin(o.pitch) * Math.sin(o.yaw),
    Math.cos(o.pitch),
    -Math.sin(o.pitch) * Math.cos(o.yaw),
  ];
  const limit = g.worldRadius * 1.2;
  for (let i = 0; i < 3; i++) {
    o.target[i] = clamp(o.target[i] - right[i] * dx * worldPerPx + up[i] * dy * worldPerPx, -limit, limit);
  }
}

/** Avança a órbita: inércia do arrasto e rotação automática. Retorna se houve movimento "ativo". */
export function step(o: Orbit, dtS: number, now = Date.now()): boolean {
  if (o.interacting) return true;
  let active = false;
  if (Math.abs(o.velYaw) > 1e-3 || Math.abs(o.velPitch) > 1e-3) {
    o.yaw += o.velYaw * dtS;
    o.pitch = clamp(o.pitch + o.velPitch * dtS, -PITCH_LIMIT, PITCH_LIMIT);
    const decay = Math.pow(g.dragDamping, dtS * 60);
    o.velYaw *= decay;
    o.velPitch *= decay;
    active = true;
  } else {
    o.velYaw = 0;
    o.velPitch = 0;
  }
  if (now - o.lastInteraction > g.autoRotateResumeMs) {
    o.autoBlend = Math.min(1, o.autoBlend + dtS / 1.5);
    o.yaw += g.autoRotateSpeed * o.autoBlend * dtS;
    if (o.autoBlend < 1) active = true;
  }
  return active;
}

export function cameraPosition(o: Orbit): [number, number, number] {
  const cp = Math.cos(o.pitch);
  return [
    o.target[0] + o.distance * cp * Math.sin(o.yaw),
    o.target[1] + o.distance * Math.sin(o.pitch),
    o.target[2] + o.distance * cp * Math.cos(o.yaw),
  ];
}

/** Zoom próximo: capas aparecem e a pulsação desliga. */
export function isCloseZoom(o: Orbit): boolean {
  return o.distance < g.coverZoomDistance;
}
