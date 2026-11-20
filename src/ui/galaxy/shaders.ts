/**
 * Shaders da galáxia. Tudo calculado na GPU.
 *
 * Nuvem (`points*`):
 * - ponto da música tocando identificado pelo índice (aIndex == uCurrentIndex)
 * - rastro (aPlayed = segundos desde uEpoch em que tocou; NO_TRAIL = sem rastro), com halo colorido
 * - pulsação com o som (uBeat) com queda por distância até uBeatRadius, mais brilho e tamanho no pico
 *
 * Destaque (`highlight*`): um único vértice desenhado por cima da nuvem com núcleo, contorno,
 * halo e anel guiado pelo som, com tamanho mínimo na tela.
 */
export const pointsVertexShader = /* glsl */ `
uniform float uTime;
uniform float uPointSize;
uniform float uPixelRatio;
uniform float uSizeRef;
uniform vec3 uColor;
uniform vec3 uTrailColor;
uniform float uTrailSeconds;
uniform float uTrailGlowScale;
uniform vec3 uCurrent;
uniform float uCurrentIndex;
uniform float uHasCurrent;
uniform float uBeat;
uniform float uBeatAmp;
uniform float uBeatRadius;
uniform float uBeatGlow;
uniform float uBeatGrow;
uniform float uPulseEnabled;
uniform float uFade;

attribute float aSeed;
attribute float aPlayed;
attribute float aIndex;

varying vec3 vColor;
varying float vAlpha;
varying float vTrail;

void main() {
  vec3 pos = position;
  float isCurrent = uHasCurrent * (1.0 - step(0.5, abs(aIndex - uCurrentIndex)));
  vec3 toPoint = position - uCurrent;
  float d = length(toPoint);

  // Pulsação: vizinhos balançam com a energia do som, mais forte perto da atual.
  float falloff = uHasCurrent * uPulseEnabled * (1.0 - isCurrent)
    * (1.0 - smoothstep(0.0, uBeatRadius, d));
  vec3 dir = d > 0.0001 ? toPoint / d : vec3(0.0);
  float kick = uBeat * falloff;
  pos += dir * kick * uBeatAmp * (0.6 + 0.8 * aSeed);

  // Rastro: forte logo depois de tocar, volta à cor normal em uTrailSeconds.
  float trail = aPlayed > -1.0e8 ? clamp(1.0 - (uTime - aPlayed) / uTrailSeconds, 0.0, 1.0) : 0.0;
  trail = trail * trail;
  // O ponto atual é desenhado pelo destaque; aqui ele some para não duplicar.
  trail *= 1.0 - isCurrent;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float size = uPointSize * (0.7 + 0.6 * aSeed) * (1.0 + 0.4 * trail) * (1.0 + uBeatGrow * kick);
  // Espaço extra no sprite para o halo do rastro.
  size *= mix(1.0, uTrailGlowScale, step(0.001, trail));
  gl_PointSize = max(1.0, size * uPixelRatio * (uSizeRef / max(-mv.z, 0.1)));
  gl_Position = projectionMatrix * mv;

  vColor = mix(uColor, uTrailColor, trail) * (1.0 + uBeatGlow * kick);
  vAlpha = uFade * (1.0 - isCurrent) * min(1.0, 0.55 + 0.45 * aSeed + 0.4 * trail + uBeatGlow * kick);
  vTrail = trail;
}
`;

export const pointsFragmentShader = /* glsl */ `
uniform vec3 uTrailGlowColor;
uniform float uTrailGlowScale;
varying vec3 vColor;
varying float vAlpha;
varying float vTrail;

void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float r = length(c);
  if (r > 0.5) discard;
  // Com rastro, o sprite é maior: o núcleo ocupa só o centro e o resto é halo.
  float coreR = vTrail > 0.001 ? 0.5 / uTrailGlowScale : 0.5;
  float core = 1.0 - smoothstep(coreR * 0.36, coreR, r);
  float glow = 1.0 - smoothstep(0.0, 0.5, r);
  float halo = vTrail * glow * glow * 0.85;
  float a = max(vAlpha * core, halo);
  vec3 color = mix(uTrailGlowColor, vColor, core);
  gl_FragColor = vec4(color, a);
}
`;

export const highlightVertexShader = /* glsl */ `
uniform float uPixelRatio;
uniform float uSizeRef;
uniform float uPointSize;
uniform float uPointScale;
uniform float uMinCorePx;
uniform float uBeat;
uniform float uRingBeat;
uniform float uTime;
uniform float uBreath;

varying float vBeat;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  // Núcleo = uPointScale x um ponto normal (mesma regra de tamanho da nuvem); o sprite inteiro
  // (núcleo + halo + anel) é o núcleo dividido pela fração que ele ocupa (CORE_R * 2).
  float pointPx = uPointSize * uSizeRef / max(-mv.z, 0.1);
  float corePx = max(uMinCorePx, uPointScale * pointPx);
  float px = corePx / 0.56 * (1.0 + uRingBeat * uBeat);
  // Respiração lenta só com a música tocando (uBreath = 0 pausado).
  px *= 1.0 + 0.06 * uBreath * sin(uTime * 3.0);
  gl_PointSize = px * uPixelRatio;
  gl_Position = projectionMatrix * mv;
  vBeat = uBeat;
}
`;

export const highlightFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uOutline;
uniform float uVisible;
varying float vBeat;

void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float r = length(c);
  if (r > 0.5) discard;
  // Núcleo sólido (raio 0.28 do sprite) com contorno claro fino.
  float core = 1.0 - smoothstep(0.26, 0.28, r);
  float outline = (1.0 - smoothstep(0.28, 0.32, r)) * (1.0 - core);
  // Halo curto na cor do destaque em volta.
  float halo = pow(1.0 - smoothstep(0.28, 0.5, r), 1.5) * 0.6 * (1.0 - core);
  // Anel fino perto da borda, mais forte no pico da energia.
  float ring = (1.0 - smoothstep(0.015, 0.035, abs(r - 0.44))) * (0.25 + 0.75 * vBeat);
  vec3 color = mix(uColor, uOutline, outline);
  float a = max(max(core, outline), max(halo, ring));
  gl_FragColor = vec4(color, a * uVisible);
}
`;
