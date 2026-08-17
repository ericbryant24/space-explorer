/**
 * The universe: an infinite grid of sectors, each holding one solar system.
 *
 * Systems are generated on demand from their sector coordinates and cached for
 * a while. Fly off the edge of one and you arrive in the neighbour; come back
 * and it is exactly as you left it, because it was never stored in the first
 * place.
 */

import { TAU } from '../core/math'
import { Rng, hashCombine } from '../core/rng'
import { STAR_COLORS } from '../render/palette'
import { pickSpaceEgg, pickSurfaceEgg } from './eggs'
import { starName } from './names'
import { makePlanet, type Planet } from './planet'

/** Change this and every star in the sky moves. */
const UNIVERSE_SEED = 0x5ace1a55

export interface Star {
  seed: number
  radius: number
  color: string
  /** Companions orbit the system barycentre; the primary usually sits still. */
  orbitRadius: number
  orbitAngle: number
  orbitSpeed: number
  x: number
  y: number
}

export interface Rock {
  seed: number
  size: number
  orbitRadius: number
  orbitAngle: number
  orbitSpeed: number
  spin: number
  x: number
  y: number
}

export interface SpaceEgg {
  id: string
  x: number
  y: number
  /** Slow drift so it isn't pinned to one spot. */
  driftPhase: number
}

export interface SolarSystem {
  sx: number
  sy: number
  seed: number
  name: string
  stars: Star[]
  planets: Planet[]
  rocks: Rock[]
  spaceEggs: SpaceEgg[]
  /** Distance from the centre at which warp rings appear. */
  extent: number
  /** Accumulated orbital time. */
  time: number
}

export function sectorSeed(sx: number, sy: number): number {
  return hashCombine(UNIVERSE_SEED, sx, sy)
}

export function sectorKey(sx: number, sy: number): string {
  return `${sx},${sy}`
}

function generateSystem(sx: number, sy: number): SolarSystem {
  const seed = sectorSeed(sx, sy)
  const rng = new Rng(seed)

  // Multiple-star systems are common in reality and lovely to look at.
  const starCount = rng.pickWeighted([1, 2, 3], [66, 25, 9])
  const stars: Star[] = []
  const primaryRadius = rng.range(52, 92)
  for (let i = 0; i < starCount; i++) {
    const companion = i > 0
    stars.push({
      seed: hashCombine(seed, 991, i),
      radius: companion ? primaryRadius * rng.range(0.4, 0.75) : primaryRadius,
      color: rng.pick(STAR_COLORS),
      orbitRadius: companion ? rng.range(70, 130) * i : starCount > 1 ? 46 : 0,
      orbitAngle: (i / starCount) * TAU + rng.range(-0.3, 0.3),
      orbitSpeed: rng.range(0.1, 0.24) * (rng.chance(0.15) ? -1 : 1),
      x: 0,
      y: 0,
    })
  }

  // Planets, spaced far enough apart that orbits never look cramped.
  const planetCount = rng.int(3, 8)
  const planets: Planet[] = []
  let orbit = rng.range(300, 420) + primaryRadius
  for (let i = 0; i < planetCount; i++) {
    const planet = makePlanet(seed, i, orbit, rng)
    // Hide a curiosity on a good fraction of landable worlds. There are a lot
    // of them to find, so this is generous on purpose.
    if (planet.landable && rng.chance(0.44)) {
      const egg = pickSurfaceEgg(rng, planet.biome)
      planet.eggId = egg ? egg.id : null
    }
    planets.push(planet)
    orbit += rng.range(240, 420) + planet.radius * 1.6
  }

  // An asteroid belt, sometimes, in a gap between orbits.
  const rocks: Rock[] = []
  if (rng.chance(0.45) && planets.length >= 2) {
    const gapIndex = rng.int(0, planets.length - 2)
    const inner = planets[gapIndex].orbitRadius + planets[gapIndex].radius + 90
    const outer = planets[gapIndex + 1].orbitRadius - planets[gapIndex + 1].radius - 90
    if (outer > inner + 60) {
      const count = rng.int(40, 90)
      for (let i = 0; i < count; i++) {
        const r = rng.range(inner, outer)
        rocks.push({
          seed: hashCombine(seed, 5150, i),
          size: rng.range(3.5, 12),
          orbitRadius: r,
          orbitAngle: rng.range(0, TAU),
          orbitSpeed: rng.range(0.02, 0.05) * (420 / r),
          spin: rng.range(-1.4, 1.4),
          x: 0,
          y: 0,
        })
      }
    }
  }

  // Most systems have nothing odd floating in the dark; some have one, and a
  // few have two, far enough apart that you won't see both at once.
  const spaceEggs: SpaceEgg[] = []
  const oddities = rng.pickWeighted([0, 1, 2], [58, 32, 10])
  const usedIds = new Set<string>()
  for (let i = 0; i < oddities; i++) {
    const egg = pickSpaceEgg(rng)
    if (usedIds.has(egg.id)) continue
    usedIds.add(egg.id)
    // Spread them around the system rather than clustering.
    const a = rng.range(0, TAU) + (i * TAU) / oddities
    const d = rng.range(orbit * 0.35, orbit * 0.95)
    spaceEggs.push({
      id: egg.id,
      x: Math.cos(a) * d,
      y: Math.sin(a) * d,
      driftPhase: rng.range(0, TAU),
    })
  }

  const extent = orbit + 360

  return {
    sx,
    sy,
    seed,
    name: starName(seed),
    stars,
    planets,
    rocks,
    spaceEggs,
    extent,
    time: rng.range(0, 500),
  }
}

/** Advance orbits and refresh cached positions. */
export function updateSystem(system: SolarSystem, dt: number) {
  system.time += dt
  const t = system.time

  for (const star of system.stars) {
    star.orbitAngle += star.orbitSpeed * dt
    star.x = Math.cos(star.orbitAngle) * star.orbitRadius
    star.y = Math.sin(star.orbitAngle) * star.orbitRadius
  }

  for (const planet of system.planets) {
    planet.orbitAngle += planet.orbitSpeed * dt
    planet.x = Math.cos(planet.orbitAngle) * planet.orbitRadius
    planet.y = Math.sin(planet.orbitAngle) * planet.orbitRadius
    for (const moon of planet.moons) {
      moon.orbitAngle += moon.orbitSpeed * dt
      moon.x = planet.x + Math.cos(moon.orbitAngle) * moon.orbitRadius
      moon.y = planet.y + Math.sin(moon.orbitAngle) * moon.orbitRadius * 0.55
    }
  }

  for (const rock of system.rocks) {
    rock.orbitAngle += rock.orbitSpeed * dt
    rock.x = Math.cos(rock.orbitAngle) * rock.orbitRadius
    rock.y = Math.sin(rock.orbitAngle) * rock.orbitRadius
  }

  for (const egg of system.spaceEggs) {
    // A gentle bob so they feel adrift rather than nailed down.
    egg.driftPhase += dt * 0.22
  }
  void t
}

const cache = new Map<string, SolarSystem>()
const CACHE_LIMIT = 12

export function getSystem(sx: number, sy: number): SolarSystem {
  const key = sectorKey(sx, sy)
  const hit = cache.get(key)
  if (hit) return hit
  const system = generateSystem(sx, sy)
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(key, system)
  // Settle orbits so a freshly-visited system isn't all lined up at angle zero.
  updateSystem(system, 0)
  return system
}

/**
 * Peek at a neighbouring system cheaply — just its name and star colour, for
 * the warp gate signposts. Avoids generating the whole thing.
 */
export function peekSystem(sx: number, sy: number): { name: string; color: string; planets: number } {
  const seed = sectorSeed(sx, sy)
  const rng = new Rng(seed)
  rng.pickWeighted([1, 2, 3], [66, 25, 9])
  rng.range(52, 92)
  return {
    name: starName(seed),
    color: STAR_COLORS[seed % STAR_COLORS.length],
    planets: 3 + (seed % 6),
  }
}
