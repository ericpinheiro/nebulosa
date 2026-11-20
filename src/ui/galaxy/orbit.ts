import { tuning } from '@/config/tuning';

type Vec3 = [number, number, number];

/** Campo de visão vertical da câmera, em graus. */
export const CAMERA_FOV = 50;

interface Focus {
  from: Vec3;
  to: Vec3;
  t0: number;
  /** A câmera estava no zoom máximo: a distância acompanha o novo máximo. */
  stickToMax: boolean;
}

/** Estado da câmera em órbita. Mutável de propósito: é atualizado a cada quadro. */
export interface Orbit {
  yaw: number;
  pitch: number;
  distance: number;
  target: Vec3;
  velYaw: number;
  velPitch: number;
  /** Instante (ms) do último toque; a rotação automática espera depois dele. */
  lastInteraction: number;
  interacting: boolean;
  /** 0..1: quanto da rotação automática está aplicada (entra suave). */
  autoBlend: number;
  /** Esfera da galáxia (mundo) e distância por unidade de raio para caber na tela. */
  sphereCenter: Vec3;
  sphereRadius: number;
  fitK: number;
  configured: boolean;
  /** O usuário já moveu o centro (pan) ou o centro foi para uma música. */
  moved: boolean;
  /** Deslocamento vertical (px) do centro óptico para o meio da área livre. */
  viewShiftPx: number;
  focus: Focus | null;
  /** Recentro pedido durante um gesto; aplicado ao soltar. */
  pendingFocus: Vec3 | null;
}

const g = tuning.galaxy;
const PITCH_LIMIT = Math.PI / 2 - 0.05;
const MAX_EPS = 0.05;

export function createOrbit(): Orbit {
  return {
    yaw: 0,
    pitch: 0.25,
    distance: 30,
    target: [0, 0, 0],
    velYaw: 0,
    velPitch: 0,
    lastInteraction: 0,
    interacting: false,
    autoBlend: 1,
    sphereCenter: [0, 0, 0],
    sphereRadius: g.worldRadius,
    fitK: 3,
    configured: false,
    moved: false,
    viewShiftPx: 0,
    focus: null,
    pendingFocus: null,
  };
}

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const dist3 = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export interface Viewport {
  width: number;
  height: number;
}

export interface ViewInsets {
  /** Altura ocupada pela interface em cima e embaixo, em px. */
  top: number;
  bottom: number;
}

/**
 * Distância por unidade de raio para uma esfera caber na área livre (tela menos cabeçalho e controles),
 * com o centro no meio dessa área, considerando o campo de visão vertical e o horizontal.
 */
export function fitFactor(
  viewport: Viewport,
  insets: ViewInsets,
  fovDeg: number = CAMERA_FOV,
  margin: number = g.fitMargin,
): number {
  const h = Math.max(viewport.height, 1);
  const w = Math.max(viewport.width, 1);
  const focal = h / 2 / Math.tan((fovDeg * Math.PI) / 360);
  const freeH = Math.max(h - insets.top - insets.bottom, h * 0.2);
  const half = Math.min(Math.atan(freeH / 2 / focal), Math.atan(w / 2 / focal));
  return (1 + margin) / Math.sin(half);
}

/** Distância para caber uma esfera de raio `radius`. */
export function fitDistance(
  radius: number,
  viewport: Viewport,
  insets: ViewInsets,
  fovDeg: number = CAMERA_FOV,
  margin: number = g.fitMargin,
) {
  return radius * fitFactor(viewport, insets, fovDeg, margin);
}

/** Zoom máximo: cabe a galáxia inteira em volta do alvo atual (cresce quando o alvo sai do centro). */
export function maxDistance(o: Orbit, target: Vec3 = o.target): number {
  return Math.max(g.cameraMinDistance, o.fitK * (o.sphereRadius + dist3(target, o.sphereCenter)));
}

/**
 * Atualiza o enquadramento (esfera da galáxia em coordenadas do mundo e fator da tela).
 * Na primeira vez, ou se o usuário ainda não mexeu no centro, centraliza e afasta ao máximo.
 */
export function configureFit(o: Orbit, center: Vec3, radius: number, fitK: number, viewShiftPx = 0): void {
  const wasAtMax = o.configured && o.distance >= maxDistance(o) - MAX_EPS;
  o.sphereCenter = [center[0], center[1], center[2]];
  o.sphereRadius = radius;
  o.fitK = fitK;
  o.viewShiftPx = viewShiftPx;
  if (!o.configured || (!o.moved && !o.focus && !o.pendingFocus)) {
    o.target = [center[0], center[1], center[2]];
    // Recentro pedido antes da primeira medição: desliza a partir do centro da nuvem.
    if (o.focus) o.focus.from = [center[0], center[1], center[2]];
    o.distance = maxDistance(o);
  } else if (wasAtMax) {
    o.distance = maxDistance(o);
  } else {
    o.distance = clamp(o.distance, g.cameraMinDistance, maxDistance(o));
  }
  o.configured = true;
}

function startFocus(o: Orbit, to: Vec3, now: number): void {
  o.focus = {
    from: [o.target[0], o.target[1], o.target[2]],
    to: [to[0], to[1], to[2]],
    t0: now,
    stickToMax: o.distance >= maxDistance(o) - MAX_EPS,
  };
  o.pendingFocus = null;
  o.moved = true;
}

/** Leva o centro da órbita até `pos` (mundo) suavemente; durante um gesto, espera ele terminar. */
export function focusOn(o: Orbit, pos: Vec3, now = Date.now()): void {
  if (o.interacting) {
    o.pendingFocus = [pos[0], pos[1], pos[2]];
    o.focus = null;
    return;
  }
  startFocus(o, pos, now);
}

export function beginInteraction(o: Orbit, now = Date.now()): void {
  o.interacting = true;
  o.lastInteraction = now;
  o.autoBlend = 0;
  o.velYaw = 0;
  o.velPitch = 0;
  // Animação em curso é retomada (do ponto atual) quando o gesto terminar.
  if (o.focus) {
    o.pendingFocus = o.focus.to;
    o.focus = null;
  }
}

export function endInteraction(o: Orbit, now = Date.now()): void {
  o.interacting = false;
  o.lastInteraction = now;
  if (o.pendingFocus) startFocus(o, o.pendingFocus, now);
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
  o.distance = clamp(o.distance / scaleDelta, g.cameraMinDistance, maxDistance(o));
}

/** Dois dedos arrastando: desloca o alvo no plano da câmera. Cancela o recentro em curso. */
export function pan(o: Orbit, dx: number, dy: number, viewportHeight: number): void {
  o.focus = null;
  o.pendingFocus = null;
  o.moved = true;
  const worldPerPx = (2 * o.distance * Math.tan((CAMERA_FOV * Math.PI) / 360)) / Math.max(viewportHeight, 1);
  const right: Vec3 = [Math.cos(o.yaw), 0, -Math.sin(o.yaw)];
  const up: Vec3 = [-Math.sin(o.pitch) * Math.sin(o.yaw), Math.cos(o.pitch), -Math.sin(o.pitch) * Math.cos(o.yaw)];
  const limit = g.worldRadius * 1.2;
  for (let i = 0; i < 3; i++) {
    o.target[i] = clamp(o.target[i] - right[i] * dx * worldPerPx + up[i] * dy * worldPerPx, -limit, limit);
  }
}

/** Avança a órbita: recentro, inércia do arrasto e rotação automática. Retorna se houve movimento "ativo". */
export function step(o: Orbit, dtS: number, now = Date.now()): boolean {
  if (o.interacting) return true;
  let active = false;
  if (o.focus) {
    const f = o.focus;
    const t = clamp((now - f.t0) / g.focusDurationMs, 0, 1);
    const e = easeInOutCubic(t);
    for (let i = 0; i < 3; i++) o.target[i] = f.from[i] + (f.to[i] - f.from[i]) * e;
    if (f.stickToMax) o.distance = maxDistance(o);
    else o.distance = Math.min(o.distance, maxDistance(o));
    if (t >= 1) o.focus = null;
    active = true;
  }
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

export function cameraPosition(o: Orbit): Vec3 {
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
