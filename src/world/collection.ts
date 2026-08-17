/**
 * The sticker book's contents: everything that can be found.
 *
 * Three kinds of entry — the kinds of world you've set foot on, the things you
 * can dig up, and the hidden curiosities. Ids here are what gets persisted, so
 * they must stay stable.
 */

import { TAU } from '../core/math'
import { hashString } from '../core/rng'
import { CREAM, HUES, INK, PLANET_PALETTES, withAlpha, shade, tint } from '../render/palette'
import { blobPath, ink, leafPath, starPath, type Ctx } from '../render/shapes'
import { ORBIT_EGGS, PAGE_EGGS, SCREEN_EGGS, drawEggThumb, type EasterEgg } from './eggs'
import { DIG_LABELS, type DigReward } from './surface'
import type { Biome } from './planet'

export type EntryKind = 'egg' | 'dig' | 'biome'

export interface CollectionEntry {
  /** Persisted id. */
  id: string
  kind: EntryKind
  title: string
  note: string
  draw(ctx: Ctx, size: number, t: number): void
}

export const eggKey = (id: string) => `egg:${id}`
export const digKey = (reward: DigReward) => `dig:${reward}`
export const biomeKey = (biome: Biome) => `biome:${biome}`

const BIOME_INFO: Record<Biome, { title: string; note: string; palette: number }> = {
  rocky: { title: 'A Stony World', note: 'Craters, dust, and a horizon that goes on politely forever.', palette: 7 },
  forest: { title: 'A Wooded World', note: 'Tall things that creak. Something is always rustling behind you.', palette: 1 },
  ocean: { title: 'A Water World', note: 'More sea than land, and the land is mostly opinion.', palette: 3 },
  desert: { title: 'A Sand World', note: 'Dunes that move overnight and never say where they went.', palette: 0 },
  ice: { title: 'A Frozen World', note: 'Everything squeaks underfoot. Your breath draws in the air.', palette: 5 },
  gas: { title: 'A Cloud World', note: 'No floor at all. Beautiful from a distance, which is where you stay.', palette: 4 },
  volcanic: { title: 'An Ember World', note: 'Warm rock, orange seams, and air that tastes of matches.', palette: 9 },
  crystal: { title: 'A Glass World', note: 'It chimes when you walk. Every step is a slightly different note.', palette: 11 },
  fungal: { title: 'A Spore World', note: 'Soft, springy, and quietly enormous underneath.', palette: 6 },
  meadow: { title: 'A Meadow World', note: 'Grass to the knees and flowers that turn to watch you pass.', palette: 8 },
}

function drawBiomeThumb(ctx: Ctx, biome: Biome, size: number, t: number) {
  const info = BIOME_INFO[biome]
  const p = PLANET_PALETTES[info.palette]
  const r = size * 0.36
  // Hash the name, not its length — otherwise same-length biomes get identical
  // outlines and the page looks copy-pasted.
  const shapeSeed = hashString(biome)
  // A little planet with a hint of its character.
  blobPath(ctx, 0, 0, r, shapeSeed, { points: 20, wobble: 0.02 })
  ctx.save()
  ctx.clip()
  ctx.fillStyle = p.ground
  ctx.fillRect(-r, -r, r * 2, r * 2)
  ctx.fillStyle = p.shade
  if (biome === 'gas' || biome === 'desert') {
    for (let i = 0; i < 4; i++) ctx.fillRect(-r, -r + i * r * 0.5, r * 2, r * 0.24)
  } else if (biome === 'ocean') {
    ctx.fillRect(-r, -r, r * 2, r * 2)
    ctx.fillStyle = p.accent
    ctx.beginPath()
    ctx.arc(-r * 0.2, r * 0.1, r * 0.34, 0, TAU)
    ctx.fill()
  } else {
    for (let i = 0; i < 3; i++) {
      blobPath(ctx, Math.cos(i * 2.3) * r * 0.4, Math.sin(i * 2.3) * r * 0.4, r * 0.42, shapeSeed + i * 31, {
        points: 10,
        wobble: 0.3,
      })
      ctx.fill()
    }
  }
  if (biome === 'ice') {
    ctx.fillStyle = tint(CREAM, 0.2)
    ctx.beginPath()
    ctx.ellipse(0, -r * 0.9, r * 0.7, r * 0.3, 0, 0, TAU)
    ctx.fill()
  }
  if (biome === 'volcanic') {
    ink(ctx, 2, '#e8823f')
    ctx.beginPath()
    ctx.moveTo(-r * 0.5, r * 0.2)
    ctx.lineTo(0, -r * 0.1)
    ctx.lineTo(r * 0.5, r * 0.3)
    ctx.stroke()
  }
  if (biome === 'crystal') {
    starPath(ctx, 0, 0, r * 0.5, r * 0.2, 4, t * 0.3)
    ctx.fillStyle = withAlpha(p.accent, 0.9)
    ctx.fill()
  }
  ctx.restore()
  ink(ctx, 2, INK)
  blobPath(ctx, 0, 0, r, shapeSeed, { points: 20, wobble: 0.02 })
  ctx.stroke()
  // A tiny flag, planted.
  ink(ctx, 1.6, CREAM)
  ctx.beginPath()
  ctx.moveTo(r * 0.5, -r * 0.72)
  ctx.lineTo(r * 0.62, -r * 1.25)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(r * 0.62, -r * 1.25)
  ctx.lineTo(r * 1.0, -r * 1.12)
  ctx.lineTo(r * 0.66, -r * 0.98)
  ctx.closePath()
  ctx.fillStyle = HUES.clay
  ctx.fill()
}

function drawDigThumb(ctx: Ctx, reward: DigReward, size: number, t: number) {
  const s = size / 44
  ctx.save()
  ctx.scale(s, s)
  switch (reward) {
    case 'gem':
      starPath(ctx, 0, 0, 15, 7, 6, t * 0.3)
      ctx.fillStyle = withAlpha(HUES.lilac, 0.92)
      ctx.fill()
      ink(ctx, 2)
      ctx.stroke()
      ink(ctx, 1.2, withAlpha(CREAM, 0.6))
      ctx.beginPath()
      ctx.moveTo(-4, -6)
      ctx.lineTo(2, 4)
      ctx.stroke()
      break
    case 'seed':
      ctx.beginPath()
      ctx.ellipse(0, 4, 8, 11, 0.25, 0, TAU)
      ctx.fillStyle = '#a5744f'
      ctx.fill()
      ink(ctx, 2)
      ctx.stroke()
      leafPath(ctx, 0, -5, 13, 5, -1.2)
      ctx.fillStyle = HUES.sage
      ctx.fill()
      ink(ctx, 1.4)
      ctx.stroke()
      break
    case 'fossil':
      ink(ctx, 3.4, '#d8cdb4')
      ctx.beginPath()
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * TAU * 1.8
        const rr = 1.5 + i * 0.55
        const px = Math.cos(a) * rr
        const py = Math.sin(a) * rr
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
      break
    case 'spring':
      ink(ctx, 2.6, withAlpha('#9dc6da', 0.95))
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.moveTo(0, 12)
        ctx.quadraticCurveTo(i * 9, -12 - Math.sin(t * 2 + i) * 3, i * 16, 14)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.ellipse(0, 14, 12, 4, 0, 0, TAU)
      ctx.fillStyle = withAlpha('#bfe0ee', 0.85)
      ctx.fill()
      break
  }
  ctx.restore()
}

function eggEntry(egg: EasterEgg): CollectionEntry {
  return {
    id: eggKey(egg.id),
    kind: 'egg',
    title: egg.title,
    note: egg.note,
    draw: (ctx, size, t) => drawEggThumb(ctx, egg, size * 0.92, t),
  }
}

const DIG_ORDER: readonly DigReward[] = ['gem', 'seed', 'fossil', 'spring']
const BIOME_ORDER: readonly Biome[] = [
  'meadow', 'forest', 'ocean', 'desert', 'rocky', 'ice', 'volcanic', 'crystal', 'fungal', 'gas',
]

export interface CollectionSection {
  title: string
  /** One line under the heading, for a bit of context. */
  blurb: string
  entries: readonly CollectionEntry[]
}

const WORLD_ENTRIES = BIOME_ORDER.map<CollectionEntry>((biome) => ({
  id: biomeKey(biome),
  kind: 'biome',
  title: BIOME_INFO[biome].title,
  note: BIOME_INFO[biome].note,
  draw: (ctx, size, t) => drawBiomeThumb(ctx, biome, size, t),
}))

const DIG_ENTRIES = DIG_ORDER.map<CollectionEntry>((reward) => ({
  id: digKey(reward),
  kind: 'dig',
  title: DIG_LABELS[reward].title,
  note: DIG_LABELS[reward].note,
  draw: (ctx, size, t) => drawDigThumb(ctx, reward, size, t),
}))

/**
 * The book, in sections. Eighty-odd curiosities in one undifferentiated grid is
 * a lot to scan, so they're split by where they come from.
 */
export const SECTIONS: readonly CollectionSection[] = [
  { title: 'Worlds', blurb: 'Kinds of ground you have stood on', entries: WORLD_ENTRIES },
  { title: 'Finds', blurb: 'Things that were under the ground', entries: DIG_ENTRIES },
  { title: 'From the Screen', blurb: 'Half-remembered from films and television', entries: SCREEN_EGGS.map(eggEntry) },
  { title: 'From the Page', blurb: 'Half-remembered from books and old stories', entries: PAGE_EGGS.map(eggEntry) },
  { title: 'Left Behind', blurb: 'Things people really built, and really left', entries: ORBIT_EGGS.map(eggEntry) },
]

export const COLLECTION: readonly CollectionEntry[] = SECTIONS.flatMap((s) => s.entries)

export const COLLECTION_TOTAL = COLLECTION.length

/** The placeholder drawn in place of something not yet found. */
export function drawUnknown(ctx: Ctx, size: number) {
  const r = size * 0.3
  blobPath(ctx, 0, 0, r, 5150, { points: 13, wobble: 0.09 })
  ctx.fillStyle = withAlpha(CREAM, 0.07)
  ctx.fill()
  ink(ctx, 2, withAlpha(CREAM, 0.22))
  ctx.setLineDash([5, 6])
  ctx.stroke()
  ctx.setLineDash([])
  ctx.font = `700 ${Math.round(size * 0.34)}px ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = withAlpha(CREAM, 0.28)
  ctx.fillText('?', 0, 1)
}

export { shade }
