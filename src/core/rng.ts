/**
 * Deterministic hashing + PRNG.
 *
 * The universe is infinite because nothing about it is stored: every star,
 * planet, pebble and creature is derived from integer coordinates run through
 * these hashes. Fly away and back and you get the same system, bit for bit.
 */

/** 32-bit integer hash (xorshift-multiply mix). Always returns a uint32. */
export function hash32(x: number): number {
  let h = x | 0
  h ^= h >>> 16
  h = Math.imul(h, 0x21f0aaad)
  h ^= h >>> 15
  h = Math.imul(h, 0x735a2d97)
  h ^= h >>> 15
  return h >>> 0
}

/** Combine several integers into one uint32 seed. Order matters. */
export function hashCombine(...parts: number[]): number {
  let h = 0x9e3779b9
  for (const p of parts) {
    h = (hash32(h ^ (p | 0)) + 0x6d2b79f5) >>> 0
  }
  return hash32(h)
}

/** Hash a string into a uint32 — handy for naming things from seeds. */
export function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return hash32(h)
}

/** A small, fast, seedable PRNG (mulberry32). */
export class Rng {
  private s: number

  constructor(seed: number) {
    this.s = seed >>> 0 || 1
  }

  /** Next float in [0, 1). */
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0
    let t = this.s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** Float in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1))
  }

  /** True with probability p. */
  chance(p: number): boolean {
    return this.next() < p
  }

  /** Uniform pick. */
  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)]
  }

  /** Weighted pick. `weights` must be the same length as `items`. */
  pickWeighted<T>(items: readonly T[], weights: readonly number[]): T {
    let total = 0
    for (const w of weights) total += w
    let roll = this.next() * total
    for (let i = 0; i < items.length; i++) {
      roll -= weights[i]
      if (roll <= 0) return items[i]
    }
    return items[items.length - 1]
  }

  /** Fisher–Yates, in place, returning the same array. */
  shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[items[i], items[j]] = [items[j], items[i]]
    }
    return items
  }

  /** Roughly gaussian via the mean of four samples. */
  gauss(): number {
    return (this.next() + this.next() + this.next() + this.next() - 2) * 0.7071
  }
}

/**
 * Smooth 1D value noise — used for planet horizons, hills and drifting motion.
 * Deterministic in `seed`, continuous in `x`.
 */
export function noise1(seed: number, x: number): number {
  const i = Math.floor(x)
  const f = x - i
  const a = hash32(hashCombine(seed, i)) / 4294967296
  const b = hash32(hashCombine(seed, i + 1)) / 4294967296
  // smoothstep for C1 continuity
  const t = f * f * (3 - 2 * f)
  return a + (b - a) * t
}

/** Layered value noise in [0, 1]. */
export function fbm1(seed: number, x: number, octaves = 4, gain = 0.5): number {
  let sum = 0
  let amp = 1
  let norm = 0
  let freq = 1
  for (let o = 0; o < octaves; o++) {
    sum += noise1(hashCombine(seed, o * 7919), x * freq) * amp
    norm += amp
    amp *= gain
    freq *= 2
  }
  return sum / norm
}
