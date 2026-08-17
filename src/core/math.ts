export const TAU = Math.PI * 2

export interface Vec {
  x: number
  y: number
}

export const vec = (x = 0, y = 0): Vec => ({ x, y })

export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** Frame-rate independent exponential approach. `rate` is per second. */
export const damp = (a: number, b: number, rate: number, dt: number): number =>
  b + (a - b) * Math.exp(-rate * dt)

export const smoothstep = (t: number): number => {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
export const easeInOutCubic = (t: number): number => {
  const c = clamp(t, 0, 1)
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2
}

/** Map v from one range to another, clamped. */
export const remap = (v: number, a0: number, a1: number, b0: number, b1: number): number =>
  lerp(b0, b1, clamp((v - a0) / (a1 - a0 || 1), 0, 1))

export const dist = (ax: number, ay: number, bx: number, by: number): number =>
  Math.hypot(bx - ax, by - ay)

export const dist2 = (ax: number, ay: number, bx: number, by: number): number => {
  const dx = bx - ax
  const dy = by - ay
  return dx * dx + dy * dy
}

/** Shortest signed angular difference from a to b, in (-PI, PI]. */
export function angleDelta(a: number, b: number): number {
  let d = (b - a) % TAU
  if (d > Math.PI) d -= TAU
  if (d < -Math.PI) d += TAU
  return d
}

/** Rotate towards a target angle by at most `maxStep`. */
export function turnTowards(a: number, b: number, maxStep: number): number {
  const d = angleDelta(a, b)
  return a + clamp(d, -maxStep, maxStep)
}

/** Wrap into [0, TAU). */
export const wrapAngle = (a: number): number => ((a % TAU) + TAU) % TAU
