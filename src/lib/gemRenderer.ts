// The live gem: the stone ray-traced in a small WebGL2 shader, instead of played from the 0.8 MB sprite sheet.
//
// For each pixel a ray comes straight down onto the stone. Part of it reflects off the crown (Fresnel), which gives
// the sparkle. The rest refracts in (index of refraction about 2.42), bounces inside with total internal reflection,
// and leaks out a little at every face it meets. Light that leaves downward, through the pavilion, takes the colour of
// the inner orbit's orbs, laid round by direction exactly where they sit under the stone. Light that leaves upward sees
// a dim studio sky with a few small turning lights, and the viewer's own shadow straight overhead. With dispersion on,
// red, green and blue are traced at slightly different indices, which gives real "fire".
//
// The stone never moves (its outline stays inside the bezel); the lights turn, so the sparkle moves as the sprite's did.
// All of this is a few kilobytes of code. createGemRenderer returns null where WebGL2 is missing or the shader fails,
// and the caller falls back to the sprite.

import { FRAME_HALF, PLANE_COUNT, gemPlanes, type GemCut } from './gemCut.ts';

/** Everything that can be tuned without recompiling the shader. */
export interface GemLight {
  /** Index of refraction for green; red and blue are this minus and plus `dispersion`. Diamond is about 2.42. */
  ior: number;
  /** Half the spread of the index across colours. Real diamond is about 0.012; more shows more fire. */
  dispersion: number;
  /** Number of small lights in the sky (1 to 8). */
  lights: number;
  /** Brightness of each light. */
  lightGain: number;
  /** Sharpness of each light (higher is smaller and crisper). */
  lightSharpness: number;
  /** Lowest and highest light elevation, 0 (horizon) to 1.5 (overhead), in radians. */
  elevationLow: number;
  elevationHigh: number;
  /** Brightness of the sky itself, between the lights. */
  sky: number;
  /** Size (0 to 1) and depth (0 to 1) of the viewer's shadow overhead, which gives the stone its dark facets. */
  headSize: number;
  headDepth: number;
  /** How strongly the orbs' colours come up through the pavilion, and how much of it reaches sideways (0 to 1). */
  below: number;
  belowSpread: number;
  /** Overall brightness before tone mapping. */
  exposure: number;
  /** Colour saturation of the final image (1 = as traced). */
  saturation: number;
  /** The viewer's distance in stone radii (0 = looking from infinitely far, flat). Closer gives each facet a gradient. */
  perspective: number;
}

export const DEFAULT_LIGHT: GemLight = {
  ior: 2.42,
  dispersion: 0.025,
  lights: 6,
  lightGain: 2.2,
  lightSharpness: 14,
  elevationLow: 0.45,
  elevationHigh: 0.8,
  sky: 0.12,
  headSize: 0.45,
  headDepth: 0.85,
  below: 1,
  belowSpread: 0.15,
  exposure: 1.4,
  saturation: 1,
  perspective: 6,
};

/** Settings that change the shader itself, so changing them rebuilds it. */
export interface GemQuality {
  /** Internal bounces traced (1 to 8). */
  bounces: number;
  /** Trace red, green and blue separately (fire), at three times the cost. */
  disperse: boolean;
  /** 2 x 2 samples per pixel, for smoother facet edges, at four times the cost. */
  supersample: boolean;
}

export const HIGH_QUALITY: GemQuality = { bounces: 5, disperse: true, supersample: false };
export const LOW_QUALITY: GemQuality = { bounces: 3, disperse: false, supersample: false };

export interface GemFrame {
  /** Angle the sky's lights have turned, in radians. */
  turn: number;
  /** The 16 inner orbs' colours at this moment, 0..255 each. */
  orbs: ArrayLike<ArrayLike<number>>;
  /** The inner orbit's rotation on screen (clockwise), in radians, so the colours sit under the right orbs. */
  orbit: number;
  light?: Partial<GemLight>;
  cut?: Partial<GemCut>;
}

export interface GemRenderer {
  canvas: HTMLCanvasElement;
  quality: GemQuality;
  render(frame: GemFrame): void;
  /** True once the browser has taken the graphics context away (the caller should fall back). */
  lost(): boolean;
  dispose(): void;
}

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

export function fragmentSource(q: GemQuality): string {
  const bounces = Math.max(1, Math.min(8, Math.round(q.bounces)));
  return `#version 300 es
precision highp float;
#define NP ${PLANE_COUNT}
#define BOUNCES ${bounces}
#define DISPERSE ${q.disperse ? 1 : 0}
#define SS ${q.supersample ? 1 : 0}
uniform vec4 uPlanes[NP];
uniform vec3 uOrbs[16];
uniform float uOrbit, uTurn, uPx, uPersp;
uniform vec3 uIor;
uniform int uLights;
uniform float uLightGain, uLightPow, uSky, uExposure, uSat;
uniform vec2 uElev, uHead, uBelow;
in vec2 vUv;
out vec4 outColor;
const float TAU = 6.2831853;

// Light leaving through the pavilion: the orb under the stone in that direction. On screen the orbs sit at angle
// i/16 turns plus the orbit's rotation, measured clockwise (screen y points down, ours up).
vec3 below(vec3 d) {
  float a = -atan(d.y, d.x) - uOrbit;
  float f = fract(a / TAU) * 16.0;
  int i = int(floor(f)) % 16;
  vec3 c = mix(uOrbs[i], uOrbs[(i + 1) % 16], smoothstep(0.0, 1.0, fract(f)));
  return c * uBelow.x * mix(uBelow.y, 1.0, clamp(-d.z, 0.0, 1.0));
}

// Light leaving upward: a dim sky, a few small lights turning round, and the viewer's shadow overhead.
vec3 above(vec3 d) {
  float l = 0.0;
  for (int k = 0; k < 8; k++) {
    if (k >= uLights) break;
    float az = uTurn + float(k) * TAU / float(uLights);
    float el = mix(uElev.x, uElev.y, fract(float(k) * 0.618034));
    vec3 L = vec3(cos(az) * cos(el), sin(az) * cos(el), sin(el));
    l += pow(max(dot(d, L), 0.0), uLightPow) * uLightGain;
  }
  float sky = uSky * (0.25 + 0.75 * clamp(d.z, 0.0, 1.0));
  float hs = max(uHead.x, 0.001);
  float head = smoothstep(1.0 - hs * 0.3, 1.0 - hs * 0.05, d.z);
  return vec3(sky + l) * (1.0 - uHead.y * head);
}

vec3 env(vec3 d) { return mix(below(d), above(d), smoothstep(-0.08, 0.08, d.z)); }

float fresnel(float cosI, float n) {
  float r = (1.0 - n) / (1.0 + n);
  r *= r;
  return r + (1.0 - r) * pow(1.0 - clamp(cosI, 0.0, 1.0), 5.0);
}

// One ray, one colour's index of refraction. o is above the stone, d points down.
vec3 trace(vec3 o, vec3 d, float ior) {
  float tIn = -1e9, tOut = 1e9;
  vec3 nIn = vec3(0.0, 0.0, 1.0);
  for (int i = 0; i < NP; i++) {
    vec4 P = uPlanes[i];
    float den = dot(P.xyz, d);
    float t = (P.w - dot(P.xyz, o)) / den;
    if (den < -1e-6) { if (t > tIn) { tIn = t; nIn = P.xyz; } }
    else if (den > 1e-6) { tOut = min(tOut, t); }
  }
  if (tIn > tOut) return env(d); // missed the stone
  vec3 p = o + d * tIn;
  float F = fresnel(-dot(d, nIn), ior);
  vec3 col = env(reflect(d, nIn)) * F;
  float thr = 1.0 - F;
  d = refract(d, nIn, 1.0 / ior);
  for (int b = 0; b < BOUNCES; b++) {
    float tx = 1e9;
    vec3 nx = vec3(0.0, 0.0, 1.0);
    for (int i = 0; i < NP; i++) {
      vec4 P = uPlanes[i];
      float den = dot(P.xyz, d);
      if (den > 1e-6) {
        float t = (P.w - dot(P.xyz, p)) / den;
        if (t < tx) { tx = t; nx = P.xyz; }
      }
    }
    p += d * tx;
    vec3 r = refract(d, -nx, ior);
    if (dot(r, r) < 1e-6) { d = reflect(d, nx); continue; } // total internal reflection
    float Fx = fresnel(dot(r, nx), ior);
    col += thr * (1.0 - Fx) * env(r);
    thr *= Fx;
    d = reflect(d, nx);
  }
  return col + thr * env(d) * 0.5; // what is still inside after the last bounce
}

vec3 shade(vec2 q) {
  vec3 o = vec3(q, 5.0), d = vec3(0.0, 0.0, -1.0);
  if (uPersp > 0.0) {
    // A viewer at a finite distance: aim at the point q on the girdle's plane (so the outline stays the hexagon), start above the stone.
    vec3 eye = vec3(0.0, 0.0, uPersp), target = vec3(q, 0.0);
    d = normalize(target - eye);
    o = target - d * 3.0;
  }
#if DISPERSE
  return vec3(trace(o, d, uIor.r).r, trace(o, d, uIor.g).g, trace(o, d, uIor.b).b);
#else
  return trace(o, d, uIor.g);
#endif
}

void main() {
  vec2 q = (vUv * 2.0 - 1.0) * ${FRAME_HALF.toFixed(6)};
  // The outline: the girdle hexagon (sides facing left and right), antialiased over one pixel.
  float edge = -1e9;
  for (int k = 0; k < 6; k++) {
    float a = float(k) * TAU / 6.0;
    edge = max(edge, dot(q, vec2(cos(a), sin(a))) - 0.8660254);
  }
  float alpha = clamp(0.5 - edge / uPx, 0.0, 1.0);
  if (alpha <= 0.0) { outColor = vec4(0.0); return; }
#if SS
  float h = uPx * 0.25;
  vec3 c = 0.25 * (shade(q + vec2(-h, -h)) + shade(q + vec2(h, -h)) + shade(q + vec2(-h, h)) + shade(q + vec2(h, h)));
#else
  vec3 c = shade(q);
#endif
  c = 1.0 - exp(-c * uExposure);            // tone map
  float g = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = clamp(mix(vec3(g), c, uSat), 0.0, 1.0);
  c = pow(c, vec3(1.0 / 2.2));
  outColor = vec4(c * alpha, alpha);
}`;
}

let supportCache: boolean | null = null;
/** Whether this browser can run the live gem at all (WebGL2). */
export function liveGemSupported(): boolean {
  if (supportCache !== null) return supportCache;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    supportCache = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    supportCache = false;
  }
  return supportCache;
}

/** Null when WebGL2 is unavailable or the shader fails to build: the caller falls back to the sprite. */
export function createGemRenderer(px: number, quality: GemQuality = HIGH_QUALITY): GemRenderer | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = Math.max(8, Math.round(px));
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl2', { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false, alpha: true });
  } catch {
    gl = null;
  }
  if (!gl) return null;
  const g = gl;
  let isLost = false;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    isLost = true;
  });

  const shader = (type: number, src: string): WebGLShader | null => {
    const s = g.createShader(type);
    if (!s) return null;
    g.shaderSource(s, src);
    g.compileShader(s);
    if (!g.getShaderParameter(s, g.COMPILE_STATUS)) {
      console.warn('live gem: shader did not compile', g.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = shader(g.VERTEX_SHADER, VERT);
  const fs = shader(g.FRAGMENT_SHADER, fragmentSource(quality));
  if (!vs || !fs) return null;
  const prog = g.createProgram();
  if (!prog) return null;
  g.attachShader(prog, vs);
  g.attachShader(prog, fs);
  g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
    console.warn('live gem: shader did not link', g.getProgramInfoLog(prog));
    return null;
  }
  g.useProgram(prog);
  const buf = g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER, buf);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW); // one triangle covers the frame
  const aPos = g.getAttribLocation(prog, 'aPos');
  g.enableVertexAttribArray(aPos);
  g.vertexAttribPointer(aPos, 2, g.FLOAT, false, 0, 0);

  const u = (n: string) => g.getUniformLocation(prog, n);
  const U = {
    planes: u('uPlanes'), orbs: u('uOrbs'), orbit: u('uOrbit'), turn: u('uTurn'), px: u('uPx'), persp: u('uPersp'), ior: u('uIor'),
    lights: u('uLights'), lightGain: u('uLightGain'), lightPow: u('uLightPow'), sky: u('uSky'), exposure: u('uExposure'),
    sat: u('uSat'), elev: u('uElev'), head: u('uHead'), below: u('uBelow'),
  };
  g.uniform1f(U.px, (2 * FRAME_HALF) / canvas.width);

  let cutKey = '';
  const orbBuf = new Float32Array(48);

  return {
    canvas,
    quality,
    lost: () => isLost || g.isContextLost(),
    render(frame) {
      if (isLost) return;
      const L = { ...DEFAULT_LIGHT, ...frame.light };
      const key = JSON.stringify(frame.cut ?? {});
      if (key !== cutKey) {
        cutKey = key;
        g.uniform4fv(U.planes, gemPlanes(frame.cut));
      }
      for (let i = 0; i < 16; i++) {
        const c = frame.orbs[i % Math.max(1, frame.orbs.length)] ?? [255, 255, 255];
        for (let j = 0; j < 3; j++) orbBuf[i * 3 + j] = (c[j] ?? 255) / 255;
      }
      g.uniform3fv(U.orbs, orbBuf);
      g.uniform1f(U.orbit, frame.orbit);
      g.uniform1f(U.turn, frame.turn);
      g.uniform3f(U.ior, L.ior - L.dispersion, L.ior, L.ior + L.dispersion);
      g.uniform1i(U.lights, Math.max(1, Math.min(8, Math.round(L.lights))));
      g.uniform1f(U.lightGain, L.lightGain);
      g.uniform1f(U.lightPow, Math.max(1, L.lightSharpness));
      g.uniform1f(U.sky, L.sky);
      g.uniform1f(U.exposure, L.exposure);
      g.uniform1f(U.sat, L.saturation);
      g.uniform1f(U.persp, Math.max(0, L.perspective));
      g.uniform2f(U.elev, L.elevationLow, L.elevationHigh);
      g.uniform2f(U.head, L.headSize, L.headDepth);
      g.uniform2f(U.below, L.below, L.belowSpread);
      g.viewport(0, 0, canvas.width, canvas.height);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.TRIANGLES, 0, 3);
    },
    dispose() {
      g.deleteProgram(prog);
      g.deleteBuffer(buf);
      g.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
