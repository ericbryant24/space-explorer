/**
 * Planet surfaces.
 *
 * A surface is a side-on strip that wraps: walk far enough in one direction and
 * you come back to where you started. The terrain is a short sum of sine waves
 * with whole-number frequencies, which makes it seamless at the wrap point for
 * free.
 */

import { TAU, clamp } from '../core/math'
import { Rng, hashCombine } from '../core/rng'
import { CREAM, INK, HUES, withAlpha, shade, tint } from '../render/palette'
import { blobPath, ink, leafPath, roundRectPath, starPath, type Ctx } from '../render/shapes'
import { getEgg } from './eggs'
import type { Biome, Planet } from './planet'

export type PropKind =
  | 'tree'
  | 'bush'
  | 'rock'
  | 'crystal'
  | 'flower'
  | 'mushroom'
  | 'grass'
  | 'cactus'
  | 'iceSpike'
  | 'vent'
  | 'shell'
  | 'hut'

export interface SurfaceProp {
  kind: PropKind
  x: number
  size: number
  seed: number
  color: string
  /** Decays back to zero after a poke. */
  wobble: number
  /** Set once the player has touched it. */
  touched: boolean
}

export type CritterKind = 'hopper' | 'floater' | 'crawler' | 'glider'

export interface Critter {
  kind: CritterKind
  x: number
  /** Height above the ground. */
  h: number
  vx: number
  vh: number
  size: number
  color: string
  seed: number
  phase: number
  /** Counts down after being startled. */
  startled: number
  met: boolean
}

export type DigReward = 'gem' | 'seed' | 'fossil' | 'spring'

export interface DigSpot {
  x: number
  reward: DigReward
  dug: boolean
  /** Animation timer once dug. */
  age: number
  seed: number
}

export interface Sapling {
  x: number
  growth: number
  seed: number
  color: string
}

export interface SurfaceData {
  planet: Planet
  /** Circumference in scene units; x wraps in [0, width). */
  width: number
  /** Sine terms: [amplitude, integer frequency, phase]. */
  terms: readonly (readonly [number, number, number])[]
  /** Ground y where the terrain is flat (y grows downward). */
  baseline: number
  /** Water fills anything below this y, or null for dry worlds. */
  waterY: number | null
  props: SurfaceProp[]
  critters: Critter[]
  digs: DigSpot[]
  saplings: Sapling[]
  /** Where the hidden curiosity stands, if this planet has one. */
  eggX: number | null
  eggId: string | null
  /** Where the ship touched down. */
  landingX: number
}

/** Props that suit each biome, with weights. */
const BIOME_PROPS: Record<Biome, readonly (readonly [PropKind, number])[]> = {
  rocky: [['rock', 8], ['crystal', 2], ['grass', 1], ['vent', 1]],
  forest: [['tree', 9], ['bush', 5], ['mushroom', 3], ['flower', 3], ['grass', 4], ['rock', 2]],
  ocean: [['shell', 6], ['rock', 3], ['grass', 3], ['flower', 2], ['hut', 1]],
  desert: [['cactus', 6], ['rock', 5], ['grass', 2], ['crystal', 1]],
  ice: [['iceSpike', 7], ['rock', 3], ['crystal', 2], ['hut', 1]],
  gas: [['grass', 1]],
  volcanic: [['rock', 6], ['vent', 5], ['crystal', 2]],
  crystal: [['crystal', 9], ['rock', 3], ['grass', 1]],
  fungal: [['mushroom', 9], ['bush', 3], ['grass', 3], ['flower', 2]],
  meadow: [['grass', 8], ['flower', 7], ['bush', 4], ['tree', 3], ['rock', 2]],
}

const CRITTERS: Record<Biome, readonly CritterKind[]> = {
  rocky: ['crawler', 'hopper'],
  forest: ['hopper', 'glider', 'crawler'],
  ocean: ['floater', 'crawler'],
  desert: ['crawler', 'hopper'],
  ice: ['hopper', 'floater'],
  gas: ['floater'],
  volcanic: ['crawler'],
  crystal: ['floater', 'glider'],
  fungal: ['hopper', 'floater'],
  meadow: ['hopper', 'glider', 'crawler'],
}

const CRITTER_COLORS = [
  HUES.butter, HUES.blush, HUES.mint, HUES.lilac, HUES.apricot, HUES.sky, CREAM, HUES.lime,
]

/** Terrain height at x. Smaller y is higher up. */
export function terrainY(surface: SurfaceData, x: number): number {
  const w = surface.width
  let y = surface.baseline
  for (const [amp, freq, phase] of surface.terms) {
    y -= amp * Math.sin((TAU * freq * x) / w + phase)
  }
  return y
}

/** Surface slope at x, useful for standing angle. */
export function terrainSlope(surface: SurfaceData, x: number): number {
  const d = 4
  return (terrainY(surface, x + d) - terrainY(surface, x - d)) / (2 * d)
}

/** Shortest signed distance from a to b on the wrapping x axis. */
export function wrapDelta(a: number, b: number, width: number): number {
  let d = (b - a) % width
  if (d > width / 2) d -= width
  if (d < -width / 2) d += width
  return d
}

export function wrapX(x: number, width: number): number {
  return ((x % width) + width) % width
}

export function generateSurface(planet: Planet, landingX: number): SurfaceData {
  const rng = new Rng(hashCombine(planet.seed, 0xbead))
  // Wide enough that finding things takes a walk, small enough that the walk
  // stays under a minute at a stroll.
  const width = Math.round(760 + planet.radius * 18)

  // Roughness by biome. Ice and ocean are smooth; volcanic and rocky are not.
  const rough =
    planet.biome === 'volcanic' || planet.biome === 'rocky'
      ? 1.35
      : planet.biome === 'ice' || planet.biome === 'ocean'
        ? 0.55
        : 1

  const terms: [number, number, number][] = []
  const termCount = rng.int(3, 5)
  for (let i = 0; i < termCount; i++) {
    const freq = i === 0 ? rng.int(1, 2) : rng.int(2, 9)
    terms.push([rng.range(8, 46) * rough * (1 / (1 + i * 0.5)), freq, rng.range(0, TAU)])
  }

  const baseline = 0
  const surface: SurfaceData = {
    planet,
    width,
    terms,
    baseline,
    waterY: null,
    props: [],
    critters: [],
    digs: [],
    saplings: [],
    eggX: null,
    eggId: planet.eggId,
    landingX: wrapX(landingX, width),
  }

  // Water on worlds that should have it. Sits a little below the average height.
  if (planet.biome === 'ocean' || (planet.biome !== 'volcanic' && planet.biome !== 'desert' && rng.chance(0.3))) {
    let sum = 0
    const samples = 64
    for (let i = 0; i < samples; i++) sum += terrainY(surface, (i / samples) * width)
    const avg = sum / samples
    surface.waterY = avg + (planet.biome === 'ocean' ? rng.range(4, 18) : rng.range(14, 34))
  }

  // Props.
  const table = BIOME_PROPS[planet.biome]
  const kinds = table.map((t) => t[0])
  const weights = table.map((t) => t[1])
  const density = planet.biome === 'gas' ? 0 : rng.range(0.02, 0.05)
  const propCount = Math.round(width * density)
  for (let i = 0; i < propCount; i++) {
    const kind = rng.pickWeighted(kinds, weights)
    const x = rng.range(0, width)
    // Nothing grows underwater.
    if (surface.waterY !== null && terrainY(surface, x) > surface.waterY - 2) continue
    surface.props.push({
      kind,
      x,
      size: rng.range(0.72, 1.5),
      seed: hashCombine(planet.seed, i, 77),
      color: propColor(kind, planet, rng),
      wobble: 0,
      touched: false,
    })
  }
  surface.props.sort((a, b) => a.size - b.size)

  // Critters.
  const critterKinds = CRITTERS[planet.biome]
  const critterCount = rng.int(3, 9)
  for (let i = 0; i < critterCount; i++) {
    const kind = rng.pick(critterKinds)
    surface.critters.push({
      kind,
      x: rng.range(0, width),
      h: kind === 'floater' || kind === 'glider' ? rng.range(30, 90) : 0,
      vx: rng.range(-18, 18),
      vh: 0,
      size: rng.range(0.8, 1.45),
      color: rng.pick(CRITTER_COLORS),
      seed: hashCombine(planet.seed, i, 909),
      phase: rng.range(0, TAU),
      startled: 0,
      met: false,
    })
  }

  // Buried things.
  const digCount = rng.int(2, 6)
  for (let i = 0; i < digCount; i++) {
    surface.digs.push({
      x: rng.range(0, width),
      reward: rng.pickWeighted<DigReward>(['gem', 'seed', 'fossil', 'spring'], [4, 5, 3, 2]),
      dug: false,
      age: 0,
      seed: hashCombine(planet.seed, i, 4242),
    })
  }

  // Put the curiosity somewhere you have to walk to find.
  if (planet.eggId && getEgg(planet.eggId)) {
    surface.eggX = wrapX(surface.landingX + width * rng.range(0.18, 0.82), width)
    // Clear props out of its way.
    const clear = getEgg(planet.eggId)!.reach + 30
    surface.props = surface.props.filter(
      (p) => Math.abs(wrapDelta(p.x, surface.eggX!, width)) > clear,
    )
  }

  return surface
}

function propColor(kind: PropKind, planet: Planet, rng: Rng): string {
  const p = planet.palette
  switch (kind) {
    case 'tree':
    case 'bush':
      return rng.pick([HUES.moss, HUES.sage, p.accent, HUES.lime])
    case 'flower':
      return rng.pick([HUES.blush, HUES.butter, HUES.lilac, HUES.rose, CREAM])
    case 'mushroom':
      return rng.pick([HUES.clay, HUES.plum, HUES.apricot, CREAM])
    case 'crystal':
      return rng.pick([p.accent, HUES.lilac, HUES.mint, HUES.sky])
    case 'rock':
      return shade(p.ground, rng.range(0.18, 0.4))
    case 'grass':
      return rng.pick([HUES.moss, HUES.sage, HUES.lime])
    case 'cactus':
      return rng.pick([HUES.moss, HUES.sage])
    case 'iceSpike':
      return rng.pick([HUES.ice, tint(HUES.sky, 0.4), CREAM])
    case 'vent':
      return shade(p.ground, 0.5)
    case 'shell':
      return rng.pick([HUES.blush, CREAM, HUES.butter, HUES.sky])
    case 'hut':
      return rng.pick([HUES.clay, HUES.apricot, HUES.slate])
  }
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

/** Draw one prop with its base at the origin, growing upward. */
export function drawProp(ctx: Ctx, prop: SurfaceProp, t: number) {
  const s = prop.size
  // Poked props sway; everything else breathes very slightly in the wind.
  const sway = Math.sin(t * 1.1 + prop.seed % 100) * 0.02 + prop.wobble * Math.sin(t * 16) * 0.18
  ctx.save()
  ctx.rotate(sway)
  ctx.scale(s, s)

  switch (prop.kind) {
    case 'tree': {
      ink(ctx, 4.5, '#6b5442')
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.quadraticCurveTo(-2, -14, 1, -26)
      ctx.stroke()
      blobPath(ctx, 1, -34, 14, prop.seed, { points: 13, wobble: 0.16, squash: 0.88 })
      ctx.fillStyle = prop.color
      ctx.fill()
      ink(ctx, 1.8)
      ctx.stroke()
      blobPath(ctx, -7, -30, 8, prop.seed + 1, { points: 11, wobble: 0.18 })
      ctx.fillStyle = tint(prop.color, 0.18)
      ctx.fill()
      ink(ctx, 1.5)
      ctx.stroke()
      break
    }
    case 'bush': {
      blobPath(ctx, 0, -8, 11, prop.seed, { points: 12, wobble: 0.2, squash: 0.8 })
      ctx.fillStyle = prop.color
      ctx.fill()
      ink(ctx, 1.8)
      ctx.stroke()
      // A couple of berries.
      ctx.fillStyle = HUES.clay
      for (let i = 0; i < 3; i++) {
        const rng = new Rng(prop.seed + i)
        ctx.beginPath()
        ctx.arc(rng.range(-7, 7), -8 + rng.range(-5, 4), 1.6, 0, TAU)
        ctx.fill()
      }
      break
    }
    case 'rock': {
      blobPath(ctx, 0, -5, 9, prop.seed, { points: 9, wobble: 0.22, squash: 0.72 })
      ctx.fillStyle = prop.color
      ctx.fill()
      ink(ctx, 1.8)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(-2.5, -7, 2.4, 0, TAU)
      ctx.fillStyle = withAlpha(CREAM, 0.2)
      ctx.fill()
      break
    }
    case 'crystal': {
      const rng = new Rng(prop.seed)
      for (let i = 0; i < 3; i++) {
        const lean = rng.range(-0.5, 0.5)
        const h = rng.range(12, 26)
        const w = rng.range(3, 6)
        ctx.save()
        ctx.translate(rng.range(-6, 6), 0)
        ctx.rotate(lean)
        ctx.beginPath()
        ctx.moveTo(-w, 0)
        ctx.lineTo(-w * 0.6, -h * 0.7)
        ctx.lineTo(0, -h)
        ctx.lineTo(w * 0.6, -h * 0.7)
        ctx.lineTo(w, 0)
        ctx.closePath()
        ctx.fillStyle = withAlpha(prop.color, 0.85)
        ctx.fill()
        ink(ctx, 1.4, withAlpha(INK, 0.55))
        ctx.stroke()
        // Inner highlight.
        ink(ctx, 1, withAlpha(CREAM, 0.5))
        ctx.beginPath()
        ctx.moveTo(-w * 0.3, -2)
        ctx.lineTo(0, -h * 0.8)
        ctx.stroke()
        ctx.restore()
      }
      break
    }
    case 'flower': {
      ink(ctx, 1.6, HUES.moss)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.quadraticCurveTo(1.5, -6, 0, -12)
      ctx.stroke()
      leafPath(ctx, 0, -6, 5, 2, 0.4)
      ctx.fillStyle = HUES.moss
      ctx.fill()
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + t * 0.2
        ctx.beginPath()
        ctx.ellipse(Math.cos(a) * 3.4, -12 + Math.sin(a) * 3.4, 3, 2.2, a, 0, TAU)
        ctx.fillStyle = prop.color
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(0, -12, 2, 0, TAU)
      ctx.fillStyle = HUES.mustard
      ctx.fill()
      break
    }
    case 'mushroom': {
      ctx.beginPath()
      ctx.moveTo(-3, 0)
      ctx.quadraticCurveTo(-2, -6, -3, -11)
      ctx.lineTo(3, -11)
      ctx.quadraticCurveTo(2, -6, 3, 0)
      ctx.closePath()
      ctx.fillStyle = '#e8dcc4'
      ctx.fill()
      ink(ctx, 1.6)
      ctx.stroke()
      blobPath(ctx, 0, -12, 9, prop.seed, { points: 11, wobble: 0.1, squash: 0.6 })
      ctx.fillStyle = prop.color
      ctx.fill()
      ink(ctx, 1.8)
      ctx.stroke()
      ctx.fillStyle = withAlpha(CREAM, 0.7)
      for (let i = 0; i < 3; i++) {
        const rng = new Rng(prop.seed + i * 3)
        ctx.beginPath()
        ctx.arc(rng.range(-6, 6), -13 + rng.range(-2, 2), rng.range(0.9, 1.7), 0, TAU)
        ctx.fill()
      }
      break
    }
    case 'grass': {
      ink(ctx, 1.5, prop.color)
      const rng = new Rng(prop.seed)
      for (let i = 0; i < 5; i++) {
        const bx = rng.range(-6, 6)
        const h = rng.range(6, 14)
        ctx.beginPath()
        ctx.moveTo(bx, 0)
        ctx.quadraticCurveTo(bx + 2, -h * 0.6, bx + rng.range(-3, 3) + Math.sin(t + i) * 1.5, -h)
        ctx.stroke()
      }
      break
    }
    case 'cactus': {
      roundRectPath(ctx, -5, -24, 10, 24, 5)
      ctx.fillStyle = prop.color
      ctx.fill()
      ink(ctx, 1.8)
      ctx.stroke()
      // Arms.
      const rng = new Rng(prop.seed)
      if (rng.chance(0.7)) {
        roundRectPath(ctx, -13, -18, 8, 5, 2.5)
        ctx.fillStyle = prop.color
        ctx.fill()
        ink(ctx, 1.6)
        ctx.stroke()
        roundRectPath(ctx, -13, -26, 5, 10, 2.5)
        ctx.fillStyle = prop.color
        ctx.fill()
        ink(ctx, 1.6)
        ctx.stroke()
      }
      // Spines.
      ink(ctx, 0.9, withAlpha(INK, 0.5))
      for (let i = 0; i < 5; i++) {
        const y = -4 - i * 4
        ctx.beginPath()
        ctx.moveTo(-5, y)
        ctx.lineTo(-7.5, y - 1)
        ctx.moveTo(5, y)
        ctx.lineTo(7.5, y - 1)
        ctx.stroke()
      }
      // A single flower on top, if it feels like it.
      if (rng.chance(0.4)) {
        starPath(ctx, 0, -26, 4, 1.8, 5, t * 0.3)
        ctx.fillStyle = HUES.blush
        ctx.fill()
      }
      break
    }
    case 'iceSpike': {
      const rng = new Rng(prop.seed)
      for (let i = 0; i < 2; i++) {
        const w = rng.range(4, 8)
        const h = rng.range(14, 32)
        const ox = rng.range(-6, 6)
        ctx.beginPath()
        ctx.moveTo(ox - w, 0)
        ctx.lineTo(ox, -h)
        ctx.lineTo(ox + w, 0)
        ctx.closePath()
        ctx.fillStyle = withAlpha(prop.color, 0.9)
        ctx.fill()
        ink(ctx, 1.5, withAlpha(INK, 0.45))
        ctx.stroke()
        ink(ctx, 1, withAlpha(CREAM, 0.6))
        ctx.beginPath()
        ctx.moveTo(ox - w * 0.3, -2)
        ctx.lineTo(ox, -h * 0.85)
        ctx.stroke()
      }
      break
    }
    case 'vent': {
      ctx.beginPath()
      ctx.moveTo(-9, 0)
      ctx.quadraticCurveTo(-5, -9, 0, -10)
      ctx.quadraticCurveTo(5, -9, 9, 0)
      ctx.closePath()
      ctx.fillStyle = prop.color
      ctx.fill()
      ink(ctx, 1.8)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(0, -10, 4, 1.6, 0, 0, TAU)
      ctx.fillStyle = '#e8823f'
      ctx.fill()
      // Smoke puffs rising.
      for (let i = 0; i < 3; i++) {
        const p = ((t * 0.4 + i * 0.33) % 1)
        ctx.beginPath()
        ctx.arc(Math.sin(p * 6 + i) * 4, -12 - p * 30, 2 + p * 5, 0, TAU)
        ctx.fillStyle = withAlpha('#b8aca0', 0.3 * (1 - p))
        ctx.fill()
      }
      break
    }
    case 'shell': {
      ctx.save()
      ctx.rotate(-0.3)
      ctx.beginPath()
      ctx.moveTo(-8, 0)
      ctx.quadraticCurveTo(-9, -11, 0, -12)
      ctx.quadraticCurveTo(9, -11, 8, 0)
      ctx.closePath()
      ctx.fillStyle = prop.color
      ctx.fill()
      ink(ctx, 1.7)
      ctx.stroke()
      ink(ctx, 1, withAlpha(INK, 0.35))
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath()
        ctx.moveTo(i * 3, -1)
        ctx.quadraticCurveTo(i * 4, -7, i * 2, -11.5)
        ctx.stroke()
      }
      ctx.restore()
      break
    }
    case 'hut': {
      roundRectPath(ctx, -13, -16, 26, 16, 2)
      ctx.fillStyle = prop.color
      ctx.fill()
      ink(ctx, 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-16, -16)
      ctx.lineTo(0, -28)
      ctx.lineTo(16, -16)
      ctx.closePath()
      ctx.fillStyle = shade(prop.color, 0.3)
      ctx.fill()
      ink(ctx, 2)
      ctx.stroke()
      roundRectPath(ctx, -4, -10, 8, 10, 1.5)
      ctx.fillStyle = withAlpha('#f6dd9c', 0.85)
      ctx.fill()
      ink(ctx, 1.4)
      ctx.stroke()
      break
    }
  }
  ctx.restore()
}

/** Draw a critter with its feet (or centre, for floaters) at the origin. */
export function drawCritter(ctx: Ctx, c: Critter, t: number) {
  const s = c.size
  ctx.save()
  ctx.scale(s, s)
  const squish = c.startled > 0 ? 1 + Math.sin(c.startled * 22) * 0.12 : 1

  switch (c.kind) {
    case 'hopper': {
      // A round body with two long feet.
      ink(ctx, 1.8, shade(c.color, 0.4))
      ctx.beginPath()
      ctx.moveTo(-3, 0)
      ctx.lineTo(-4, -4)
      ctx.moveTo(3, 0)
      ctx.lineTo(4, -4)
      ctx.stroke()
      blobPath(ctx, 0, -9, 8 * squish, c.seed, { points: 12, wobble: 0.08, squash: 1 / squish })
      ctx.fillStyle = c.color
      ctx.fill()
      ink(ctx, 1.8)
      ctx.stroke()
      // Ear tufts.
      for (const side of [-1, 1]) {
        leafPath(ctx, side * 4, -15, 6, 2.2, side > 0 ? -1.1 : -Math.PI + 1.1)
        ctx.fillStyle = c.color
        ctx.fill()
        ink(ctx, 1.3)
        ctx.stroke()
      }
      critterFace(ctx, 0, -9, 1, c, t)
      break
    }
    case 'crawler': {
      // A low segmented body on many little legs.
      ink(ctx, 1.4, shade(c.color, 0.4))
      for (let i = 0; i < 4; i++) {
        const lx = -7 + i * 5
        const step = Math.sin(t * 7 + i) * 1.6
        ctx.beginPath()
        ctx.moveTo(lx, -4)
        ctx.lineTo(lx + step, 0)
        ctx.stroke()
      }
      for (let i = 3; i >= 0; i--) {
        blobPath(ctx, -7 + i * 5, -7 - Math.sin(t * 5 + i) * 0.6, 5 - i * 0.4, c.seed + i, {
          points: 9,
          wobble: 0.1,
        })
        ctx.fillStyle = i === 3 ? tint(c.color, 0.15) : c.color
        ctx.fill()
        ink(ctx, 1.5)
        ctx.stroke()
      }
      critterFace(ctx, 8, -7, 0.8, c, t)
      break
    }
    case 'floater': {
      // A jellyfish bell with trailing ribbons.
      const pulse = 1 + Math.sin(t * 2 + c.phase) * 0.1
      ctx.save()
      ctx.scale(pulse, 1 / pulse)
      blobPath(ctx, 0, 0, 10, c.seed, { points: 13, wobble: 0.08, squash: 0.78 })
      ctx.fillStyle = withAlpha(c.color, 0.85)
      ctx.fill()
      ink(ctx, 1.8)
      ctx.stroke()
      ctx.restore()
      ink(ctx, 1.4, withAlpha(c.color, 0.9))
      for (let i = 0; i < 4; i++) {
        const bx = -6 + i * 4
        ctx.beginPath()
        ctx.moveTo(bx, 6)
        ctx.quadraticCurveTo(bx + Math.sin(t * 2.4 + i) * 4, 14, bx + Math.sin(t * 2.4 + i) * 6, 22)
        ctx.stroke()
      }
      critterFace(ctx, 0, -1, 0.9, c, t)
      break
    }
    case 'glider': {
      // A moth with two flapping wings.
      const flap = Math.abs(Math.sin(t * 6 + c.phase))
      for (const side of [-1, 1]) {
        ctx.save()
        ctx.translate(0, -2)
        ctx.scale(side, 1)
        ctx.rotate(-0.4 - flap * 0.5)
        ctx.beginPath()
        ctx.ellipse(9, 0, 10, 5.5, 0, 0, TAU)
        ctx.fillStyle = withAlpha(c.color, 0.85)
        ctx.fill()
        ink(ctx, 1.5)
        ctx.stroke()
        ctx.restore()
      }
      blobPath(ctx, 0, -2, 5, c.seed, { points: 10, wobble: 0.08, squash: 1.3 })
      ctx.fillStyle = shade(c.color, 0.25)
      ctx.fill()
      ink(ctx, 1.6)
      ctx.stroke()
      // Antennae.
      ink(ctx, 1.1, INK)
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(side * 1.5, -6)
        ctx.quadraticCurveTo(side * 5, -11, side * 4, -14)
        ctx.stroke()
      }
      critterFace(ctx, 0, -4, 0.7, c, t)
      break
    }
  }
  ctx.restore()
}

function critterFace(ctx: Ctx, x: number, y: number, scale: number, c: Critter, t: number) {
  const blink = Math.sin(t * 1.3 + c.phase) > 0.96 ? 1 : 0
  const startled = c.startled > 0
  ctx.fillStyle = INK
  for (const side of [-1, 1]) {
    const ex = x + side * 2.6 * scale
    if (blink) {
      ink(ctx, 1 * scale)
      ctx.beginPath()
      ctx.moveTo(ex - 1.4 * scale, y)
      ctx.lineTo(ex + 1.4 * scale, y)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.arc(ex, y, (startled ? 1.9 : 1.4) * scale, 0, TAU)
      ctx.fill()
    }
  }
  if (startled) {
    ctx.beginPath()
    ctx.arc(x, y + 3.4 * scale, 1.4 * scale, 0, TAU)
    ctx.fill()
  } else {
    ink(ctx, 1 * scale)
    ctx.beginPath()
    ctx.moveTo(x - 1.6 * scale, y + 3 * scale)
    ctx.quadraticCurveTo(x, y + 5 * scale, x + 1.6 * scale, y + 3 * scale)
    ctx.stroke()
  }
}

/** A little mound, or the hole and prize once it's been dug up. */
export function drawDig(ctx: Ctx, dig: DigSpot, t: number) {
  if (!dig.dug) {
    // Loose earth with a hint of something under it.
    ctx.beginPath()
    ctx.ellipse(0, 0, 11, 5, 0, Math.PI, TAU)
    ctx.closePath()
    ctx.fillStyle = withAlpha(INK, 0.3)
    ctx.fill()
    ink(ctx, 1.4, withAlpha(INK, 0.45))
    ctx.stroke()
    // Three dashes, the universal sign for "dig here".
    ink(ctx, 1.2, withAlpha(CREAM, 0.4))
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 4, -7 - Math.sin(t * 2 + i) * 1)
      ctx.lineTo(i * 4, -10 - Math.sin(t * 2 + i) * 1)
      ctx.stroke()
    }
    return
  }

  // The hole.
  ctx.beginPath()
  ctx.ellipse(0, 0, 10, 4, 0, 0, TAU)
  ctx.fillStyle = '#2a2130'
  ctx.fill()

  const rise = Math.min(1, dig.age * 1.6)
  const y = -10 - rise * 16
  ctx.save()
  ctx.translate(0, y)
  ctx.rotate(Math.sin(t * 1.2) * 0.12)
  switch (dig.reward) {
    case 'gem':
      starPath(ctx, 0, 0, 8, 4, 6, t * 0.4)
      ctx.fillStyle = withAlpha(HUES.lilac, 0.92)
      ctx.fill()
      ink(ctx, 1.6)
      ctx.stroke()
      break
    case 'seed':
      ctx.beginPath()
      ctx.ellipse(0, 0, 4.5, 6.5, 0.3, 0, TAU)
      ctx.fillStyle = '#a5744f'
      ctx.fill()
      ink(ctx, 1.6)
      ctx.stroke()
      leafPath(ctx, 0, -5, 7, 2.6, -1.2)
      ctx.fillStyle = HUES.sage
      ctx.fill()
      break
    case 'fossil':
      // A little curled shell.
      ink(ctx, 2.2, '#d8cdb4')
      ctx.beginPath()
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * TAU * 1.7
        const r = 1 + i * 0.32
        const px = Math.cos(a) * r
        const py = Math.sin(a) * r
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
      break
    case 'spring':
      // A small fountain.
      ink(ctx, 2, withAlpha('#9dc6da', 0.9))
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.moveTo(0, 6)
        ctx.quadraticCurveTo(i * 6, -8 - Math.sin(t * 3 + i) * 3, i * 11, 8)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(0, 6, 3.4, 0, TAU)
      ctx.fillStyle = withAlpha('#bfe0ee', 0.9)
      ctx.fill()
      break
  }
  ctx.restore()

  // Sparkles on first reveal.
  if (dig.age < 1.2) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU + dig.age * 3
      const d = dig.age * 40
      starPath(ctx, Math.cos(a) * d, y + Math.sin(a) * d, 3 * (1 - dig.age / 1.2), 1, 4, a)
      ctx.fillStyle = withAlpha(CREAM, 0.8 * (1 - dig.age / 1.2))
      ctx.fill()
    }
  }
}

/** A sapling the player planted, part-grown. */
export function drawSapling(ctx: Ctx, sap: Sapling, t: number) {
  const g = clamp(sap.growth, 0, 1)
  const h = 4 + g * 30
  ctx.save()
  ctx.rotate(Math.sin(t * 1.4 + sap.seed % 10) * 0.03)
  ink(ctx, 1.5 + g * 3, '#6b5442')
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(-1.5, -h * 0.6, 1, -h)
  ctx.stroke()
  if (g > 0.15) {
    blobPath(ctx, 1, -h - g * 8, 4 + g * 12, sap.seed, { points: 12, wobble: 0.18, squash: 0.9 })
    ctx.fillStyle = sap.color
    ctx.fill()
    ink(ctx, 1.6)
    ctx.stroke()
  } else {
    leafPath(ctx, 0, -h, 6, 2.4, -1.1)
    ctx.fillStyle = sap.color
    ctx.fill()
  }
  ctx.restore()
}

/** Human-readable label for a dug-up prize, used by the discovery banner. */
export const DIG_LABELS: Record<DigReward, { title: string; note: string }> = {
  gem: { title: 'A Buried Gem', note: 'Six sides, faintly warm, and humming a note only you can hear.' },
  seed: { title: 'A Sleeping Seed', note: 'Plant it anywhere. It will not ask what year it is.' },
  fossil: { title: 'A Curled Fossil', note: 'Something lived here first, and spiralled beautifully while doing it.' },
  spring: { title: 'A Little Spring', note: 'Cold, clear and in no hurry. It has been waiting a long time.' },
}
