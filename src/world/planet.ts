/**
 * Planets: what they are, and how they're drawn as little paper discs.
 *
 * A planet is derived entirely from its seed. The disc art is expensive-ish
 * (dozens of wobbly shapes) so it's rendered once into an offscreen canvas and
 * then blitted every frame.
 */

import { TAU, clamp, lerp } from '../core/math'
import { Rng, fbm1, hashCombine } from '../core/rng'
import {
  INK,
  PLANET_PALETTES,
  withAlpha,
  shade,
  tint,
  CREAM,
  type PlanetPalette,
} from '../render/palette'
import { blobPath, ink, starPath, type Ctx } from '../render/shapes'
import { planetName, moonName } from './names'

export type Biome =
  | 'rocky'
  | 'forest'
  | 'ocean'
  | 'desert'
  | 'ice'
  | 'gas'
  | 'volcanic'
  | 'crystal'
  | 'fungal'
  | 'meadow'

/** Which palettes suit which biome, so an ice world is never lime green. */
const BIOME_PALETTES: Record<Biome, readonly number[]> = {
  rocky: [7, 10, 2],
  forest: [1, 8],
  ocean: [3, 5],
  desert: [0, 2, 9],
  ice: [5, 3],
  gas: [4, 11, 9],
  volcanic: [0, 9],
  crystal: [4, 11, 5],
  fungal: [6, 11, 8],
  meadow: [1, 8, 6],
}

const BIOME_WEIGHTS: Record<Biome, number> = {
  rocky: 16,
  forest: 12,
  ocean: 10,
  desert: 12,
  ice: 9,
  gas: 8,
  volcanic: 7,
  crystal: 6,
  fungal: 6,
  meadow: 10,
}

const BIOMES = Object.keys(BIOME_WEIGHTS) as Biome[]

export interface Moon {
  seed: number
  name: string
  radius: number
  orbitRadius: number
  orbitAngle: number
  orbitSpeed: number
  color: string
  /** Filled in each frame. */
  x: number
  y: number
}

export interface Planet {
  id: string
  seed: number
  name: string
  biome: Biome
  /** Radius in space-view world units. */
  radius: number
  palette: PlanetPalette
  /** Surface gravity multiplier. Low-gravity worlds are floaty and fun. */
  gravity: number
  orbitRadius: number
  orbitAngle: number
  orbitSpeed: number
  spin: number
  rings: number
  ringTilt: number
  moons: Moon[]
  /** 0 = clear, 1 = thick cloud cover. */
  cloudiness: number
  /** Id of an Easter egg hidden on this planet's surface, if any. */
  eggId: string | null
  /** Gas giants can't be landed on. */
  landable: boolean
  /** Position in the system, refreshed by `System.update`. */
  x: number
  y: number
}

export function makePlanet(
  systemSeed: number,
  index: number,
  orbitRadius: number,
  rng: Rng,
): Planet {
  const seed = hashCombine(systemSeed, 7717, index)
  const biome = rng.pickWeighted(
    BIOMES,
    BIOMES.map((b) => BIOME_WEIGHTS[b]),
  )
  const paletteIdx = rng.pick(BIOME_PALETTES[biome])
  const isGas = biome === 'gas'
  const radius = isGas ? rng.range(86, 128) : rng.range(34, 84)

  // Bigger, denser worlds pull harder. Small moons of ice barely pull at all.
  const density = biome === 'gas' ? 0.5 : biome === 'ice' ? 0.7 : rng.range(0.72, 1.3)
  const gravity = clamp((0.36 + (radius / 84) * 0.95) * density, 0.26, 1.85)

  const moonCount = rng.chance(0.42) ? rng.int(1, isGas ? 3 : 2) : 0
  const moons: Moon[] = []
  for (let m = 0; m < moonCount; m++) {
    const mSeed = hashCombine(seed, 313, m)
    const mr = rng.range(7, Math.max(9, radius * 0.24))
    moons.push({
      seed: mSeed,
      name: moonName(mSeed),
      radius: mr,
      orbitRadius: radius + 34 + m * rng.range(24, 44),
      orbitAngle: rng.range(0, TAU),
      orbitSpeed: rng.range(0.28, 0.72) * (rng.chance(0.2) ? -1 : 1),
      color: rng.pick(['#cfc6b4', '#b9b4c4', '#e0d5bd', '#a9a4b0']),
      x: 0,
      y: 0,
    })
  }

  return {
    id: `p:${systemSeed}:${index}`,
    seed,
    name: planetName(seed),
    biome,
    radius,
    palette: PLANET_PALETTES[paletteIdx],
    gravity,
    orbitRadius,
    orbitAngle: rng.range(0, TAU),
    // Outer planets orbit slower, as they should.
    orbitSpeed: (rng.chance(0.12) ? -1 : 1) * rng.range(0.018, 0.05) * (420 / orbitRadius),
    spin: rng.range(-0.22, 0.22),
    rings: isGas ? (rng.chance(0.6) ? rng.int(2, 3) : 0) : rng.chance(0.16) ? rng.int(1, 2) : 0,
    ringTilt: rng.range(-0.42, 0.42),
    moons,
    cloudiness: rng.chance(0.5) ? rng.range(0.15, 0.8) : 0,
    eggId: null,
    landable: !isGas,
    x: 0,
    y: 0,
  }
}

// ---------------------------------------------------------------------------
// Disc art
// ---------------------------------------------------------------------------

interface CachedTexture {
  canvas: HTMLCanvasElement
  /** Device pixels per world unit this was baked at. */
  scale: number
  /** Half-size of the canvas in world units. */
  half: number
}

const textureCache = new Map<string, CachedTexture>()
const TEXTURE_BUDGET = 96

/** Draw a planet at world position, using (and filling) the texture cache. */
export function drawPlanet(ctx: Ctx, planet: Planet, time: number, quality: number) {
  const half = planet.radius * 1.05 + 4
  let tex = textureCache.get(planet.id)
  if (!tex || tex.scale < quality * 0.85) {
    tex = bakePlanet(planet, quality, half)
    if (textureCache.size > TEXTURE_BUDGET) {
      // Cheap eviction: drop the oldest insertion.
      const oldest = textureCache.keys().next().value
      if (oldest !== undefined) textureCache.delete(oldest)
    }
    textureCache.set(planet.id, tex)
  }

  ctx.save()
  ctx.translate(planet.x, planet.y)

  // Rings behind the planet.
  if (planet.rings > 0) drawRings(ctx, planet, true)

  ctx.save()
  ctx.rotate(time * planet.spin * 0.12)
  ctx.drawImage(tex.canvas, -tex.half, -tex.half, tex.half * 2, tex.half * 2)
  ctx.restore()

  // Clouds drift independently of the surface, so they can't be baked in.
  if (planet.cloudiness > 0) drawClouds(ctx, planet, time)

  // Day/night terminator: a soft crescent of shadow toward the outer system.
  drawTerminator(ctx, planet)

  if (planet.rings > 0) drawRings(ctx, planet, false)

  ctx.restore()

  for (const moon of planet.moons) {
    ctx.save()
    ctx.translate(moon.x, moon.y)
    ctx.beginPath()
    ctx.arc(0, 0, moon.radius, 0, TAU)
    ctx.fillStyle = moon.color
    ctx.fill()
    // One crater so moons read as moons at small sizes.
    ctx.beginPath()
    ctx.arc(moon.radius * 0.28, -moon.radius * 0.2, moon.radius * 0.26, 0, TAU)
    ctx.fillStyle = withAlpha(INK, 0.14)
    ctx.fill()
    ink(ctx, 1.6)
    ctx.beginPath()
    ctx.arc(0, 0, moon.radius, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }
}

function bakePlanet(planet: Planet, quality: number, half: number): CachedTexture {
  const px = Math.max(24, Math.ceil(half * 2 * quality))
  const c = document.createElement('canvas')
  c.width = px
  c.height = px
  const g = c.getContext('2d')!
  g.translate(px / 2, px / 2)
  const s = px / (half * 2)
  g.scale(s, s)

  const r = planet.radius
  const p = planet.palette
  const rng = new Rng(planet.seed)

  // Base disc. Everything else is clipped to it.
  blobPath(g, 0, 0, r, planet.seed, { points: 26, wobble: 0.014 })
  g.save()
  g.clip()
  g.fillStyle = p.ground
  g.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4)

  switch (planet.biome) {
    case 'gas':
      paintBands(g, r, p, rng, planet.seed)
      break
    case 'ocean':
      paintOcean(g, r, p, rng, planet.seed)
      break
    case 'forest':
    case 'meadow':
      paintContinents(g, r, p, rng, planet.seed, planet.biome === 'forest' ? 0.62 : 0.4)
      break
    case 'desert':
      paintDunes(g, r, p, rng, planet.seed)
      break
    case 'ice':
      paintIce(g, r, p, rng, planet.seed)
      break
    case 'volcanic':
      paintVolcanic(g, r, p, rng)
      break
    case 'crystal':
      paintCrystal(g, r, p, rng, planet.seed)
      break
    case 'fungal':
      paintFungal(g, r, p, rng, planet.seed)
      break
    case 'rocky':
      paintCraters(g, r, p, rng, planet.seed)
      break
  }

  // Soft limb shading, warm on the lit side.
  const grad = g.createRadialGradient(-r * 0.32, -r * 0.34, r * 0.12, 0, 0, r * 1.08)
  grad.addColorStop(0, withAlpha(CREAM, 0.2))
  grad.addColorStop(0.55, 'rgba(0,0,0,0)')
  grad.addColorStop(1, withAlpha(INK, 0.3))
  g.fillStyle = grad
  g.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4)
  g.restore()

  // Ink outline last, so it sits on top of every fill.
  blobPath(g, 0, 0, r, planet.seed, { points: 26, wobble: 0.014 })
  ink(g, 2.2)
  g.stroke()

  return { canvas: c, scale: quality, half }
}

function paintCraters(g: Ctx, r: number, p: PlanetPalette, rng: Rng, seed: number) {
  const n = rng.int(5, 11)
  for (let i = 0; i < n; i++) {
    const a = rng.range(0, TAU)
    const d = rng.range(0, r * 0.86)
    const cr = rng.range(r * 0.07, r * 0.2)
    const x = Math.cos(a) * d
    const y = Math.sin(a) * d
    blobPath(g, x, y, cr, hashCombine(seed, i, 5), { points: 10, wobble: 0.12 })
    g.fillStyle = shade(p.ground, 0.16)
    g.fill()
    blobPath(g, x - cr * 0.16, y - cr * 0.2, cr * 0.7, hashCombine(seed, i, 6), {
      points: 9,
      wobble: 0.14,
    })
    g.fillStyle = shade(p.shade, 0.1)
    g.fill()
  }
}

function paintContinents(g: Ctx, r: number, p: PlanetPalette, rng: Rng, seed: number, density: number) {
  const n = rng.int(3, 6)
  for (let i = 0; i < n; i++) {
    const a = rng.range(0, TAU)
    const d = rng.range(0, r * 0.6)
    const cr = rng.range(r * 0.28, r * 0.55)
    blobPath(g, Math.cos(a) * d, Math.sin(a) * d, cr, hashCombine(seed, i, 21), {
      points: 11,
      wobble: 0.3,
    })
    g.fillStyle = i % 2 === 0 ? p.shade : shade(p.ground, 0.08)
    g.fill()
  }
  // Speckles of vegetation.
  const dots = Math.round(density * 42)
  g.fillStyle = withAlpha(p.accent, 0.5)
  for (let i = 0; i < dots; i++) {
    const a = rng.range(0, TAU)
    const d = Math.sqrt(rng.next()) * r * 0.92
    g.beginPath()
    g.arc(Math.cos(a) * d, Math.sin(a) * d, rng.range(1.2, 3.2), 0, TAU)
    g.fill()
  }
}

function paintOcean(g: Ctx, r: number, p: PlanetPalette, rng: Rng, seed: number) {
  g.fillStyle = p.shade
  g.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4)
  const n = rng.int(3, 7)
  for (let i = 0; i < n; i++) {
    const a = rng.range(0, TAU)
    const d = rng.range(0, r * 0.72)
    blobPath(g, Math.cos(a) * d, Math.sin(a) * d, rng.range(r * 0.1, r * 0.3), hashCombine(seed, i, 33), {
      points: 10,
      wobble: 0.34,
    })
    g.fillStyle = i % 3 === 0 ? p.accent : tint(p.ground, 0.2)
    g.fill()
  }
  // A few current lines.
  ink(g, 1.4, withAlpha(CREAM, 0.28))
  for (let i = 0; i < 5; i++) {
    const y = rng.range(-r * 0.8, r * 0.8)
    const w = Math.sqrt(Math.max(0, r * r - y * y)) * 0.7
    g.beginPath()
    g.moveTo(-w, y)
    g.quadraticCurveTo(0, y + rng.range(-5, 5), w, y)
    g.stroke()
  }
}

function paintDunes(g: Ctx, r: number, p: PlanetPalette, rng: Rng, seed: number) {
  const bands = rng.int(5, 9)
  for (let i = 0; i < bands; i++) {
    const y = -r + ((i + 0.5) / bands) * r * 2
    g.beginPath()
    g.moveTo(-r * 1.2, y)
    for (let x = -r * 1.2; x <= r * 1.2; x += r * 0.16) {
      g.lineTo(x, y + (fbm1(hashCombine(seed, i), x * 0.02 + 5, 2) - 0.5) * r * 0.22)
    }
    g.lineTo(r * 1.2, y + r * 0.5)
    g.lineTo(-r * 1.2, y + r * 0.5)
    g.closePath()
    g.fillStyle = withAlpha(i % 2 === 0 ? p.shade : p.accent, 0.34)
    g.fill()
  }
}

function paintIce(g: Ctx, r: number, p: PlanetPalette, rng: Rng, seed: number) {
  // Polar caps.
  for (const sign of [-1, 1]) {
    blobPath(g, 0, sign * r * 0.86, r * 0.7, hashCombine(seed, sign + 9), { points: 12, wobble: 0.18 })
    g.fillStyle = tint(CREAM, 0.3)
    g.fill()
  }
  ink(g, 1.5, withAlpha(p.sky, 0.5))
  for (let i = 0; i < rng.int(4, 8); i++) {
    const a = rng.range(0, TAU)
    const x = Math.cos(a) * r * 0.5
    const y = Math.sin(a) * r * 0.5
    g.beginPath()
    g.moveTo(x, y)
    let cx = x
    let cy = y
    for (let s = 0; s < 3; s++) {
      cx += rng.range(-r * 0.24, r * 0.24)
      cy += rng.range(-r * 0.24, r * 0.24)
      g.lineTo(cx, cy)
    }
    g.stroke()
  }
}

function paintVolcanic(g: Ctx, r: number, p: PlanetPalette, rng: Rng) {
  g.fillStyle = shade(p.ground, 0.5)
  g.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4)
  // Glowing fissures radiating from a hot spot.
  const hotA = rng.range(0, TAU)
  const hx = Math.cos(hotA) * r * 0.3
  const hy = Math.sin(hotA) * r * 0.3
  for (let i = 0; i < rng.int(5, 9); i++) {
    const a = rng.range(0, TAU)
    let cx = hx
    let cy = hy
    ink(g, rng.range(2, 4.5), i % 2 === 0 ? '#e8823f' : '#f2b95c')
    g.beginPath()
    g.moveTo(cx, cy)
    for (let s = 0; s < 4; s++) {
      cx += Math.cos(a + rng.range(-0.6, 0.6)) * r * 0.2
      cy += Math.sin(a + rng.range(-0.6, 0.6)) * r * 0.2
      g.lineTo(cx, cy)
    }
    g.stroke()
  }
  const gl = g.createRadialGradient(hx, hy, 0, hx, hy, r * 0.6)
  gl.addColorStop(0, 'rgba(255, 176, 92, 0.55)')
  gl.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = gl
  g.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4)
}

function paintCrystal(g: Ctx, r: number, p: PlanetPalette, rng: Rng, seed: number) {
  for (let i = 0; i < rng.int(7, 13); i++) {
    const a = rng.range(0, TAU)
    const d = rng.range(r * 0.1, r * 0.8)
    const size = rng.range(r * 0.1, r * 0.26)
    starPath(g, Math.cos(a) * d, Math.sin(a) * d, size, size * 0.42, rng.int(3, 5), rng.range(0, TAU))
    g.fillStyle = withAlpha(i % 2 === 0 ? p.accent : tint(p.sky, 0.2), 0.72)
    g.fill()
    ink(g, 1.2, withAlpha(INK, 0.4))
    g.stroke()
  }
  void seed
}

function paintFungal(g: Ctx, r: number, p: PlanetPalette, rng: Rng, seed: number) {
  for (let i = 0; i < rng.int(9, 18); i++) {
    const a = rng.range(0, TAU)
    const d = Math.sqrt(rng.next()) * r * 0.9
    const cr = rng.range(r * 0.06, r * 0.18)
    const x = Math.cos(a) * d
    const y = Math.sin(a) * d
    blobPath(g, x, y, cr, hashCombine(seed, i, 71), { points: 9, wobble: 0.16 })
    g.fillStyle = withAlpha(i % 3 === 0 ? p.accent : p.shade, 0.75)
    g.fill()
    g.beginPath()
    g.arc(x, y, cr * 0.32, 0, TAU)
    g.fillStyle = withAlpha(CREAM, 0.45)
    g.fill()
  }
}

function paintBands(g: Ctx, r: number, p: PlanetPalette, rng: Rng, seed: number) {
  const bands = rng.int(6, 11)
  let y = -r
  for (let i = 0; i < bands; i++) {
    const h = (r * 2) / bands
    g.beginPath()
    g.moveTo(-r * 1.2, y)
    for (let x = -r * 1.2; x <= r * 1.2; x += r * 0.1) {
      g.lineTo(x, y + (fbm1(hashCombine(seed, i, 3), x * 0.03, 2) - 0.5) * h * 0.5)
    }
    g.lineTo(r * 1.2, y + h)
    g.lineTo(-r * 1.2, y + h)
    g.closePath()
    const t = i / bands
    g.fillStyle =
      i % 3 === 0 ? withAlpha(p.accent, 0.5) : withAlpha(i % 2 === 0 ? p.shade : p.ground, 0.85)
    g.fill()
    void t
    y += h
  }
  // The obligatory great storm.
  if (rng.chance(0.7)) {
    const sx = rng.range(-r * 0.4, r * 0.4)
    const sy = rng.range(-r * 0.5, r * 0.5)
    g.save()
    g.translate(sx, sy)
    g.rotate(rng.range(-0.4, 0.4))
    blobPath(g, 0, 0, r * 0.26, hashCombine(seed, 909), { points: 14, wobble: 0.08, squash: 0.6 })
    g.fillStyle = withAlpha(p.accent, 0.85)
    g.fill()
    ink(g, 1.6, withAlpha(INK, 0.35))
    g.stroke()
    blobPath(g, 0, 0, r * 0.12, hashCombine(seed, 910), { points: 10, wobble: 0.1, squash: 0.6 })
    g.fillStyle = withAlpha(CREAM, 0.5)
    g.fill()
    g.restore()
  }
}

function drawRings(ctx: Ctx, planet: Planet, behind: boolean) {
  const r = planet.radius
  ctx.save()
  ctx.rotate(planet.ringTilt)
  const squash = 0.22 + Math.abs(planet.ringTilt) * 0.3
  for (let i = 0; i < planet.rings; i++) {
    const rr = r * (1.45 + i * 0.26)
    ctx.beginPath()
    // Front and back halves are drawn separately so the planet can sit between.
    ctx.ellipse(0, 0, rr, rr * squash, 0, behind ? Math.PI : 0, behind ? TAU : Math.PI)
    ink(ctx, r * 0.1, withAlpha(i % 2 === 0 ? planet.palette.accent : planet.palette.sky, behind ? 0.5 : 0.8))
    ctx.stroke()
  }
  ctx.restore()
}

function drawClouds(ctx: Ctx, planet: Planet, time: number) {
  const r = planet.radius
  const rng = new Rng(hashCombine(planet.seed, 4242))
  const count = Math.round(2 + planet.cloudiness * 6)
  ctx.save()
  blobPath(ctx, 0, 0, r * 0.99, planet.seed, { points: 26, wobble: 0.014 })
  ctx.clip()
  for (let i = 0; i < count; i++) {
    const baseY = rng.range(-r * 0.85, r * 0.85)
    const speed = rng.range(0.06, 0.16) * (rng.chance(0.3) ? -1 : 1)
    const span = Math.sqrt(Math.max(1, r * r - baseY * baseY))
    // Wrap the cloud around the disc.
    const phase = ((time * speed + i * 0.37) % 1 + 1) % 1
    const x = -span + phase * span * 2
    const w = rng.range(r * 0.18, r * 0.42)
    blobPath(ctx, x, baseY, w, hashCombine(planet.seed, i, 88), {
      points: 10,
      wobble: 0.22,
      squash: 0.42,
    })
    ctx.fillStyle = withAlpha(CREAM, 0.2 + planet.cloudiness * 0.35)
    ctx.fill()
  }
  ctx.restore()
}

function drawTerminator(ctx: Ctx, planet: Planet) {
  const r = planet.radius
  // Light comes from the star at the origin, so shadow falls away from it.
  const a = Math.atan2(planet.y, planet.x)
  ctx.save()
  blobPath(ctx, 0, 0, r * 0.99, planet.seed, { points: 26, wobble: 0.014 })
  ctx.clip()
  const gx = Math.cos(a) * r * 1.15
  const gy = Math.sin(a) * r * 1.15
  const grad = ctx.createLinearGradient(-gx * 0.4, -gy * 0.4, gx, gy)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(0.55, withAlpha('#1d1730', 0.12))
  grad.addColorStop(1, withAlpha('#151024', 0.62))
  ctx.fillStyle = grad
  ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4)
  ctx.restore()
}

/** Approximate sky tint at a given altitude fraction, used by the surface scene. */
export function skyColorAt(planet: Planet, t: number): string {
  return lerp(0, 1, t) < 0.5 ? planet.palette.skyLow : planet.palette.sky
}
