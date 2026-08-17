/**
 * The Easter egg registry.
 *
 * Curiosities are grouped by where they come from — the screen, the page, and
 * things people actually built and left lying about. Every one is an original
 * drawing titled descriptively; none reproduces a franchise's characters,
 * artwork, logos or names.
 */

import type { Rng } from '../../core/rng'
import type { Biome } from '../planet'
import type { Ctx } from '../../render/shapes'
import type { EasterEgg } from './kit'
import { SCREEN_EGGS } from './screen'
import { PAGE_EGGS } from './page'
import { ORBIT_EGGS } from './orbit'

export type { EasterEgg } from './kit'
export { SCREEN_EGGS } from './screen'
export { PAGE_EGGS } from './page'
export { ORBIT_EGGS } from './orbit'

export const EGGS: readonly EasterEgg[] = [...SCREEN_EGGS, ...PAGE_EGGS, ...ORBIT_EGGS]

const BY_ID = new Map(EGGS.map((e) => [e.id, e]))

// Two eggs sharing an id would silently shadow each other in the sticker book,
// and the ids are persisted, so catch it as early as possible.
if (BY_ID.size !== EGGS.length) {
  const seen = new Set<string>()
  const dupes = EGGS.map((e) => e.id).filter((id) => (seen.has(id) ? true : (seen.add(id), false)))
  throw new Error(`Duplicate Easter egg ids: ${[...new Set(dupes)].join(', ')}`)
}

export function getEgg(id: string): EasterEgg | undefined {
  return BY_ID.get(id)
}

export const SURFACE_EGGS = EGGS.filter((e) => e.place === 'surface')
export const SPACE_EGGS = EGGS.filter((e) => e.place === 'space')

/** Surface eggs that suit a given biome, precomputed once per biome. */
const BY_BIOME = new Map<Biome, EasterEgg[]>()

function surfaceEggsFor(biome: Biome): EasterEgg[] {
  let list = BY_BIOME.get(biome)
  if (!list) {
    list = SURFACE_EGGS.filter((e) => !e.biomes || e.biomes.includes(biome))
    BY_BIOME.set(biome, list)
  }
  return list
}

/** Pick a surface egg that suits a biome, or null if none do. */
export function pickSurfaceEgg(rng: Rng, biome: Biome): EasterEgg | null {
  const candidates = surfaceEggsFor(biome)
  if (candidates.length === 0) return null
  return rng.pickWeighted(candidates, candidates.map((c) => c.weight))
}

/** Pick any space egg. */
export function pickSpaceEgg(rng: Rng): EasterEgg {
  return rng.pickWeighted(SPACE_EGGS, SPACE_EGGS.map((c) => c.weight))
}

/** Total number of discoverable curiosities, for the sticker book. */
export const EGG_COUNT = EGGS.length

/**
 * Draw an egg fitted into a square sticker tile.
 *
 * Vignettes range from a spinning top to a world-carrying turtle, so each one
 * can nudge the fit via its `thumb` field rather than every drawing having to
 * agree on a size.
 */
export function drawEggThumb(ctx: Ctx, egg: EasterEgg, size: number, t = 0.5) {
  const base = egg.place === 'surface' ? 210 : 260
  const bounds = base / (egg.thumb?.scale ?? 1)
  const s = size / bounds
  ctx.save()
  ctx.scale(s, s)
  ctx.translate(0, (egg.place === 'surface' ? bounds * 0.3 : 0) + (egg.thumb?.offsetY ?? 0))
  egg.draw(ctx, t)
  ctx.restore()
}
