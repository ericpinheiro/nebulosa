/**
 * Shader dos pontos da galáxia. Tudo calculado na GPU:
 * - destaque da música tocando (comparando a posição com uCurrent)
 * - rastro (aPlayed = segundos desde uEpoch em que tocou; NO_TRAIL = sem rastro)
 * - pulsação com o som (uBeat) com queda por distância até uBeatRadius
 */
export const pointsVertexShader = /* glsl */ `
uniform float uTime;
uniform float uPointSize;
uniform float uPixelRatio;
uniform float uSizeRef;
uniform vec3 uColor;
uniform vec3 uHighlightColor;
uniform vec3 uTrailColor;
uniform float uTrailSeconds;
uniform vec3 uCurrent;
uniform float uHasCurrent;
uniform float uHighlightScale;
uniform vec2 uHighlightPulse;
uniform float uBeat;
uniform float uBeatAmp;
uniform float uBeatRadius;
uniform float uPulseEnabled;
uniform float uFade;

attribute float aSeed;
attribute float aPlayed;

varying vec3 vColor;
varying float vAlpha;
varying float vGlow;

void main() {
  vec3 pos = position;
  vec3 toPoint = position - uCurrent;
  float d = length(toPoint);
  float isCurrent = uHasCurrent * (1.0 - step(0.0005, d));

  // Pulsação: vizinhos balançam com a energia do som, mais forte perto da atual.
  float falloff = uHasCurrent * uPulseEnabled * (1.0 - isCurrent)
    * (1.0 - smoothstep(0.0, uBeatRadius, d));
  vec3 dir = d > 0.0001 ? toPoint / d : vec3(0.0);
  pos += dir * uBeat * uBeatAmp * falloff * (0.6 + 0.8 * aSeed);

  // Rastro: forte logo depois de tocar, volta à cor normal em uTrailSeconds.
  float trail = aPlayed > -1.0e8 ? clamp(1.0 - (uTime - aPlayed) / uTrailSeconds, 0.0, 1.0) : 0.0;
  trail = trail * trail;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float pulse = 1.0 + uHighlightPulse.x * sin(uTime * 6.2831853 * uHighlightPulse.y) * uPulseEnabled;
  float size = uPointSize * (0.7 + 0.6 * aSeed) * (1.0 + 0.6 * trail);
  size *= mix(1.0, uHighlightScale * pulse, isCurrent);
  gl_PointSize = max(1.0, size * uPixelRatio * (uSizeRef / max(-mv.z, 0.1)));
  gl_Position = projectionMatrix * mv;

  vColor = mix(mix(uColor, uTrailColor, trail), uHighlightColor, isCurrent);
  vAlpha = uFade * mix(0.55 + 0.45 * aSeed + 0.3 * trail, 1.0, isCurrent);
  vGlow = isCurrent;
}
`;

export const pointsFragmentShader = /* glsl */ `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
varying float vGlow;

void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float r = length(c);
  if (r > 0.5) discard;
  // Núcleo nítido com borda suave; a música atual ganha halo.
  float core = 1.0 - smoothstep(0.18, 0.5, r);
  float halo = vGlow * (1.0 - smoothstep(0.0, 0.5, r)) * 0.6;
  float a = vAlpha * max(core, halo);
  gl_FragColor = vec4(vColor * (1.0 + vGlow * 0.4), a);
}
`;
