/**
 * Easter eggs — small vignettes hidden across the universe that nod to films,
 * shows and books.
 *
 * Every one is drawn from scratch here as an original silhouette or shape
 * study, and titled descriptively. Nothing copies a franchise's characters,
 * artwork, logos or names: they're the kind of visual rhyme you'd sketch in a
 * margin, and the fun is in recognising them.
 *
 * Drawing conventions:
 *   surface eggs — origin sits on the ground, up is -y, roughly 26 units to a
 *                  person's height, matching the surface scene's scale.
 *   space eggs   — origin is the centre of the vignette.
 */

import { TAU } from '../core/math'
import { Rng } from '../core/rng'
import { CREAM, HUES, INK, withAlpha, shade, tint } from '../render/palette'
import { blobPath, ink, roundRectPath, sparkle, starPath, leafPath, type Ctx } from '../render/shapes'
import type { Biome } from './planet'

export interface EasterEgg {
  id: string
  /** Shown when you find it. Descriptive, never the source's title. */
  title: string
  /** A single gentle line of flavour. */
  note: string
  place: 'surface' | 'space'
  /** Surface eggs only appear on these biomes. Empty means anywhere landable. */
  biomes?: readonly Biome[]
  /** Relative rarity — bigger is more common. */
  weight: number
  /** How close you need to be, in scene units, to discover it. */
  reach: number
  draw(ctx: Ctx, t: number): void
}

// --- little shared helpers -------------------------------------------------

/** A simple standing person, feet at (x, y). */
function figure(ctx: Ctx, x: number, y: number, h: number, color: string, lean = 0) {
  const headR = h * 0.17
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(lean)
  ctx.fillStyle = color
  // body
  ctx.beginPath()
  ctx.moveTo(-h * 0.13, 0)
  ctx.quadraticCurveTo(-h * 0.16, -h * 0.5, -h * 0.09, -h * 0.66)
  ctx.lineTo(h * 0.09, -h * 0.66)
  ctx.quadraticCurveTo(h * 0.16, -h * 0.5, h * 0.13, 0)
  ctx.closePath()
  ctx.fill()
  // head
  ctx.beginPath()
  ctx.arc(0, -h * 0.66 - headR * 0.8, headR, 0, TAU)
  ctx.fill()
  ctx.restore()
}

/** A star / sun disc with a soft halo. */
function sun(ctx: Ctx, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4)
  g.addColorStop(0, withAlpha(color, 0.65))
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r * 3.4, 0, TAU)
  ctx.fill()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
}

/** Outlined fill in one call. */
function shapeFill(ctx: Ctx, fill: string, lw = 1.6, stroke = INK) {
  ctx.fillStyle = fill
  ctx.fill()
  ink(ctx, lw, stroke)
  ctx.stroke()
}

// --- surface eggs ----------------------------------------------------------

const TALL_SLAB: EasterEgg = {
  id: 'tall-slab',
  title: 'The Tall Black Slab',
  note: 'Perfectly smooth, perfectly still. Nobody remembers putting it here.',
  place: 'surface',
  biomes: ['rocky', 'ice', 'desert'],
  weight: 8,
  reach: 46,
  draw(ctx, t) {
    // Three small onlookers keeping a respectful distance.
    for (let i = 0; i < 3; i++) {
      const x = -46 - i * 15
      const bob = Math.sin(t * 1.4 + i) * 1.2
      figure(ctx, x, bob, 15 + i * 1.5, withAlpha(INK, 0.62), Math.sin(t * 0.8 + i) * 0.04)
    }
    ctx.save()
    // A slab is 1 : 4 : 9, and it is not going to explain itself.
    const w = 16
    const h = 72
    roundRectPath(ctx, -w / 2, -h, w, h, 1.2)
    ctx.fillStyle = '#151119'
    ctx.fill()
    ink(ctx, 2, withAlpha(CREAM, 0.28))
    ctx.stroke()
    // A single glint travelling down the face.
    const gy = -h + ((t * 26) % (h + 30))
    const g = ctx.createLinearGradient(0, gy - 14, 0, gy + 14)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.18)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.save()
    roundRectPath(ctx, -w / 2, -h, w, h, 1.2)
    ctx.clip()
    ctx.fillStyle = g
    ctx.fillRect(-w / 2, gy - 14, w, 28)
    ctx.restore()
    ctx.restore()
  },
}

const PATIENT_LENS: EasterEgg = {
  id: 'patient-lens',
  title: 'The Patient Red Lens',
  note: 'It watches you cross the room. It would rather you did not touch that.',
  place: 'surface',
  biomes: ['rocky', 'crystal', 'ice'],
  weight: 6,
  reach: 40,
  draw(ctx, t) {
    // A panel half-buried in the ground.
    roundRectPath(ctx, -26, -34, 52, 34, 3)
    shapeFill(ctx, '#cfc6b2', 2)
    roundRectPath(ctx, -20, -28, 40, 22, 2)
    shapeFill(ctx, '#8e8a94', 1.4)
    const pulse = 0.55 + 0.45 * Math.sin(t * 1.6)
    const g = ctx.createRadialGradient(0, -17, 0, 0, -17, 16)
    g.addColorStop(0, withAlpha('#ff5b47', 0.9 * pulse))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, -17, 16, 0, TAU)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(0, -17, 6.5, 0, TAU)
    shapeFill(ctx, '#3a1614', 1.6)
    ctx.beginPath()
    ctx.arc(0, -17, 3.6, 0, TAU)
    ctx.fillStyle = withAlpha('#ff6a52', 0.6 + 0.4 * pulse)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(-1.4, -18.6, 1.2, 0, TAU)
    ctx.fillStyle = withAlpha(CREAM, 0.8)
    ctx.fill()
  },
}

const GREAT_BURROWER: EasterEgg = {
  id: 'great-burrower',
  title: 'The Great Burrower',
  note: 'The sand drums, and something enormous decides you are not worth it.',
  place: 'surface',
  biomes: ['desert'],
  weight: 5,
  reach: 120,
  draw(ctx, t) {
    // A long segmented body arcing up out of the dunes and back down.
    const rise = 90 + Math.sin(t * 0.5) * 18
    const span = 150
    ctx.save()
    const segs = 16
    for (let i = segs; i >= 0; i--) {
      const p = i / segs
      const x = -span / 2 + p * span
      // Arc, flattened at the ends where it enters the sand.
      const y = -Math.sin(p * Math.PI) * rise
      const r = 6 + Math.sin(p * Math.PI) * 15
      ctx.beginPath()
      ctx.ellipse(x, y, r * 0.9, r, Math.cos(p * Math.PI) * 0.4, 0, TAU)
      ctx.fillStyle = i % 2 === 0 ? '#c19a6b' : '#ad8659'
      ctx.fill()
      ink(ctx, 1.4, withAlpha(INK, 0.45))
      ctx.stroke()
    }
    // The mouth: a ring of pale teeth at the leading end.
    const mx = span / 2
    const my = 0
    ctx.save()
    ctx.translate(mx, my)
    ctx.rotate(0.8)
    ctx.beginPath()
    ctx.ellipse(0, 0, 12, 16, 0, 0, TAU)
    shapeFill(ctx, '#8d6a48', 1.6)
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU
      starPath(ctx, Math.cos(a) * 8, Math.sin(a) * 11, 3.4, 1.2, 3, a)
      ctx.fillStyle = '#efe3cd'
      ctx.fill()
    }
    ctx.restore()
    // Sand thrown up where it broke the surface.
    for (let i = 0; i < 10; i++) {
      const rng = new Rng(i * 977)
      const px = -span / 2 + rng.next() * span
      const py = -Math.abs(Math.sin(t * 1.3 + i)) * 14
      ctx.beginPath()
      ctx.arc(px, py, rng.range(1, 3), 0, TAU)
      ctx.fillStyle = withAlpha('#d8bd92', 0.7)
      ctx.fill()
    }
    ctx.restore()
  },
}

const TWO_SUNS: EasterEgg = {
  id: 'two-suns',
  title: 'Two Suns Setting',
  note: 'Somebody stands at the ridge every evening, looking anywhere but home.',
  place: 'surface',
  biomes: ['desert', 'rocky'],
  weight: 7,
  reach: 60,
  draw(ctx, t) {
    // Suns low over a ridge, one chasing the other down.
    sun(ctx, -18, -96, 13, '#f6c76a')
    sun(ctx, 12, -80, 8, '#ef8f5c')
    // Ridge.
    ctx.beginPath()
    ctx.moveTo(-90, 0)
    ctx.quadraticCurveTo(-40, -26, 4, -20)
    ctx.quadraticCurveTo(50, -14, 92, 0)
    ctx.closePath()
    ctx.fillStyle = withAlpha('#7a4a3c', 0.85)
    ctx.fill()
    figure(ctx, 4, -20, 24, withAlpha(INK, 0.8), Math.sin(t * 0.6) * 0.02)
  },
}

const SNOWY_WARDROBE: EasterEgg = {
  id: 'snowy-wardrobe',
  title: 'The Snowy Wardrobe',
  note: 'The doors are ajar. Cold air comes out, and it smells of pine.',
  place: 'surface',
  biomes: ['ice'],
  weight: 6,
  reach: 44,
  draw(ctx, t) {
    // Iron lamppost, lit.
    ctx.save()
    ink(ctx, 3, '#3c3c46')
    ctx.beginPath()
    ctx.moveTo(38, 0)
    ctx.lineTo(38, -50)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(38, -56, 6.5, 0, TAU)
    shapeFill(ctx, withAlpha('#f7dc9a', 0.9), 1.6)
    const g = ctx.createRadialGradient(38, -56, 0, 38, -56, 34)
    g.addColorStop(0, withAlpha('#f7dc9a', 0.34))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(38, -56, 34, 0, TAU)
    ctx.fill()
    ctx.restore()

    // Wardrobe.
    roundRectPath(ctx, -26, -52, 52, 52, 2.5)
    shapeFill(ctx, '#8b5f43', 2)
    roundRectPath(ctx, -23, -48, 22, 46, 1.5)
    shapeFill(ctx, '#a5744f', 1.3)
    // Right door swung open onto darkness with a hint of trees.
    ctx.save()
    roundRectPath(ctx, 1, -48, 22, 46, 1.5)
    ctx.clip()
    ctx.fillStyle = '#20222c'
    ctx.fillRect(1, -48, 22, 46)
    for (let i = 0; i < 4; i++) {
      const tx = 4 + i * 5.5
      const th = 14 + (i % 2) * 6
      ctx.beginPath()
      ctx.moveTo(tx, -2)
      ctx.lineTo(tx - 2.6, -2)
      ctx.lineTo(tx, -2 - th)
      ctx.lineTo(tx + 2.6, -2)
      ctx.closePath()
      ctx.fillStyle = withAlpha('#4c6b52', 0.9)
      ctx.fill()
    }
    // Snow falling inside the wardrobe, which is the whole point.
    for (let i = 0; i < 9; i++) {
      const rng = new Rng(i * 613)
      const sx = 2 + rng.next() * 20
      const sy = -48 + ((t * 12 + rng.next() * 46) % 46)
      ctx.beginPath()
      ctx.arc(sx, sy, 0.9, 0, TAU)
      ctx.fillStyle = withAlpha(CREAM, 0.8)
      ctx.fill()
    }
    ctx.restore()
    ink(ctx, 1.6)
    roundRectPath(ctx, 1, -48, 22, 46, 1.5)
    ctx.stroke()
    // Knobs.
    for (const kx of [-3.5, 3.5]) {
      ctx.beginPath()
      ctx.arc(kx, -26, 1.8, 0, TAU)
      ctx.fillStyle = '#e0c27c'
      ctx.fill()
    }
  },
}

const ROUND_GREEN_DOOR: EasterEgg = {
  id: 'round-green-door',
  title: 'The Round Green Door',
  note: 'A hill with a doorknob in the middle of it. Second breakfast is at ten.',
  place: 'surface',
  biomes: ['meadow', 'forest'],
  weight: 7,
  reach: 46,
  draw(ctx, t) {
    // Grassy mound.
    ctx.beginPath()
    ctx.moveTo(-72, 0)
    ctx.quadraticCurveTo(-40, -56, 0, -56)
    ctx.quadraticCurveTo(40, -56, 72, 0)
    ctx.closePath()
    shapeFill(ctx, '#7d9c62', 2)
    // Door.
    ctx.beginPath()
    ctx.arc(0, -20, 17, 0, TAU)
    shapeFill(ctx, '#4f8b5d', 2)
    ctx.beginPath()
    ctx.arc(0, -20, 13, 0, TAU)
    ink(ctx, 1.2, withAlpha(INK, 0.4))
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, -20, 2.4, 0, TAU)
    ctx.fillStyle = '#e5c374'
    ctx.fill()
    // Round windows either side.
    for (const wx of [-38, 38]) {
      ctx.beginPath()
      ctx.arc(wx, -26, 7, 0, TAU)
      shapeFill(ctx, withAlpha('#f4d98d', 0.85), 1.6)
    }
    // Chimney smoke.
    ctx.save()
    ink(ctx, 2.4, '#8b6a52')
    ctx.beginPath()
    ctx.moveTo(-14, -54)
    ctx.lineTo(-14, -64)
    ctx.stroke()
    for (let i = 0; i < 4; i++) {
      const p = ((t * 0.35 + i * 0.25) % 1)
      ctx.beginPath()
      ctx.arc(-14 + Math.sin(p * 5) * 6, -66 - p * 30, 3 + p * 5, 0, TAU)
      ctx.fillStyle = withAlpha(CREAM, 0.28 * (1 - p))
      ctx.fill()
    }
    ctx.restore()
    // A bench by the door.
    ink(ctx, 2, '#8b6a52')
    ctx.beginPath()
    ctx.moveTo(26, -4)
    ctx.lineTo(48, -4)
    ctx.stroke()
  },
}

const BLUE_BOOTH: EasterEgg = {
  id: 'blue-booth',
  title: 'The Blue Wooden Booth',
  note: 'Taller inside than out, which is rude of it. It hums when you get close.',
  place: 'surface',
  weight: 4,
  reach: 42,
  draw(ctx, t) {
    const hum = Math.sin(t * 5) * 0.5
    ctx.save()
    ctx.translate(hum, 0)
    roundRectPath(ctx, -15, -58, 30, 58, 1.5)
    shapeFill(ctx, '#2f4f7d', 2)
    // Panels.
    for (let row = 0; row < 3; row++) {
      roundRectPath(ctx, -11, -53 + row * 16, 22, 12, 1)
      ink(ctx, 1.1, withAlpha(INK, 0.45))
      ctx.stroke()
    }
    // Lamp on top, blinking.
    ctx.beginPath()
    ctx.arc(0, -62, 4, 0, TAU)
    const lit = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.2))
    shapeFill(ctx, withAlpha('#f6e6b8', lit), 1.4)
    const g = ctx.createRadialGradient(0, -62, 0, 0, -62, 26)
    g.addColorStop(0, withAlpha('#cfe3ff', 0.3 * lit))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, -62, 26, 0, TAU)
    ctx.fill()
    // Sign band.
    roundRectPath(ctx, -13, -57, 26, 6, 1)
    ctx.fillStyle = withAlpha(CREAM, 0.85)
    ctx.fill()
    ctx.restore()
  },
}

const THUMB_AND_TOWEL: EasterEgg = {
  id: 'thumb-and-towel',
  title: 'A Thumb and a Towel',
  note: "Waiting for a lift. Brought a towel, which was the sensible part.",
  place: 'surface',
  biomes: ['desert', 'rocky', 'meadow'],
  weight: 6,
  reach: 42,
  draw(ctx, t) {
    // Signpost pointing hopefully at the sky.
    ink(ctx, 2.6, '#8b6a52')
    ctx.beginPath()
    ctx.moveTo(28, 0)
    ctx.lineTo(28, -40)
    ctx.stroke()
    ctx.save()
    ctx.translate(28, -38)
    ctx.rotate(-0.12)
    roundRectPath(ctx, 0, -5, 26, 10, 2)
    shapeFill(ctx, '#e3c37a', 1.5)
    // Two little dashes standing in for words nobody needs to read.
    ink(ctx, 1.6, withAlpha(INK, 0.6))
    ctx.beginPath()
    ctx.moveTo(4, 0)
    ctx.lineTo(11, 0)
    ctx.moveTo(14, 0)
    ctx.lineTo(21, 0)
    ctx.stroke()
    ctx.restore()

    // Traveller sitting on a case, one arm up, thumb out.
    roundRectPath(ctx, -30, -13, 22, 13, 2)
    shapeFill(ctx, '#9a6f4d', 1.6)
    figure(ctx, -19, -13, 21, withAlpha(INK, 0.78))
    ink(ctx, 2.4, withAlpha(INK, 0.78))
    ctx.beginPath()
    ctx.moveTo(-19, -26)
    ctx.lineTo(-11 + Math.sin(t * 2) * 1.5, -34)
    ctx.stroke()
    // The towel, draped and fluttering.
    ctx.beginPath()
    ctx.moveTo(-26, -22)
    ctx.quadraticCurveTo(-36, -16 + Math.sin(t * 2.2) * 2, -34, -4)
    ctx.quadraticCurveTo(-29, -10, -22, -16)
    ctx.closePath()
    shapeFill(ctx, '#5fa9a8', 1.4)
  },
}

const LONG_LEGGED_WALKER: EasterEgg = {
  id: 'long-legged-walker',
  title: 'The Long-Legged Walker',
  note: 'Three legs, no hurry. It has been crossing this plain for a long time.',
  place: 'surface',
  biomes: ['rocky', 'desert', 'volcanic'],
  weight: 5,
  reach: 90,
  draw(ctx, t) {
    const sway = Math.sin(t * 0.7) * 3
    ctx.save()
    ctx.translate(sway, 0)
    ink(ctx, 3.4, withAlpha(INK, 0.72))
    // Legs, each with a knee, striding slightly out of phase.
    for (let i = 0; i < 3; i++) {
      const phase = t * 0.9 + (i * TAU) / 3
      const footX = (i - 1) * 26 + Math.sin(phase) * 12
      const kneeX = (i - 1) * 13 + Math.sin(phase) * 5
      ctx.beginPath()
      ctx.moveTo(0, -66)
      ctx.lineTo(kneeX, -34)
      ctx.lineTo(footX, Math.max(0, -Math.sin(phase) * 8))
      ctx.stroke()
    }
    // Hood.
    ctx.beginPath()
    ctx.ellipse(0, -74, 22, 14, 0, 0, TAU)
    shapeFill(ctx, '#5d6a5a', 2)
    ctx.beginPath()
    ctx.ellipse(0, -78, 13, 7, 0, 0, TAU)
    ctx.fillStyle = withAlpha('#f2d78c', 0.5)
    ctx.fill()
    ctx.restore()
  },
}

const OCEAN_LIGHT: EasterEgg = {
  id: 'ocean-light',
  title: 'The Light at the End',
  note: 'Somebody keeps it burning. The nearest shore is four worlds away.',
  place: 'surface',
  biomes: ['ocean', 'ice'],
  weight: 7,
  reach: 50,
  draw(ctx, t) {
    // Tapered tower with candy stripes.
    ctx.beginPath()
    ctx.moveTo(-14, 0)
    ctx.lineTo(-8, -62)
    ctx.lineTo(8, -62)
    ctx.lineTo(14, 0)
    ctx.closePath()
    shapeFill(ctx, CREAM, 2)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(-14, 0)
    ctx.lineTo(-8, -62)
    ctx.lineTo(8, -62)
    ctx.lineTo(14, 0)
    ctx.closePath()
    ctx.clip()
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = withAlpha(HUES.clay, 0.85)
      ctx.fillRect(-16, -60 + i * 16, 32, 8)
    }
    ctx.restore()
    // Lamp room.
    roundRectPath(ctx, -11, -76, 22, 14, 2)
    shapeFill(ctx, '#4f6a78', 1.8)
    ctx.beginPath()
    ctx.arc(0, -69, 4.5, 0, TAU)
    ctx.fillStyle = '#f8e6ac'
    ctx.fill()
    // Sweeping beam.
    const a = Math.sin(t * 0.5) * 0.7
    ctx.save()
    ctx.translate(0, -69)
    ctx.rotate(a)
    const g = ctx.createLinearGradient(0, 0, 130, 0)
    g.addColorStop(0, withAlpha('#f8e6ac', 0.42))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(130, -22)
    ctx.lineTo(130, 22)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    // Cap.
    ctx.beginPath()
    ctx.moveTo(-13, -76)
    ctx.lineTo(0, -86)
    ctx.lineTo(13, -76)
    ctx.closePath()
    shapeFill(ctx, HUES.clay, 1.8)
  },
}

const CUBE_COLLECTOR: EasterEgg = {
  id: 'cube-collector',
  title: 'The Little Cube Collector',
  note: 'It has stacked these neatly for years. In one boot: a single green shoot.',
  place: 'surface',
  biomes: ['rocky', 'desert', 'volcanic'],
  weight: 7,
  reach: 44,
  draw(ctx, t) {
    // Tidy tower of cubes.
    for (let i = 0; i < 4; i++) {
      roundRectPath(ctx, 22 + (i % 2) * 1.5, -10 - i * 9, 16, 9, 1.5)
      shapeFill(ctx, i % 2 === 0 ? '#b2ac9c' : '#9d9789', 1.4)
    }
    // The little worker: boxy body, treads, telescoping eyes.
    const bob = Math.sin(t * 1.6) * 1
    ctx.save()
    ctx.translate(-16, bob)
    roundRectPath(ctx, -13, -6, 26, 6, 2)
    shapeFill(ctx, '#4c4c58', 1.5)
    roundRectPath(ctx, -12, -24, 24, 19, 3)
    shapeFill(ctx, '#e0b452', 2)
    // Eyes on stalks, tracking you.
    for (const ex of [-5, 5]) {
      ink(ctx, 1.8, '#7a7a86')
      ctx.beginPath()
      ctx.moveTo(ex, -24)
      ctx.lineTo(ex, -31)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(ex, -33, 5, 4.4, 0, 0, TAU)
      shapeFill(ctx, '#e8e2d2', 1.4)
      ctx.beginPath()
      ctx.arc(ex + Math.sin(t * 0.9) * 1.2, -33, 1.7, 0, TAU)
      ctx.fillStyle = INK
      ctx.fill()
    }
    // Boot planter with a shoot.
    roundRectPath(ctx, -26, -12, 11, 12, 2)
    shapeFill(ctx, '#8a6a4e', 1.4)
    ink(ctx, 1.6, '#6f9a5c')
    ctx.beginPath()
    ctx.moveTo(-20, -12)
    ctx.quadraticCurveTo(-20 + Math.sin(t) * 2, -20, -17, -24)
    ctx.stroke()
    leafPath(ctx, -17, -24, 6, 2.4, -0.6)
    ctx.fillStyle = '#7fae65'
    ctx.fill()
    ctx.restore()
  },
}

const TALL_IRON_FRIEND: EasterEgg = {
  id: 'tall-iron-friend',
  title: 'The Tall Iron Friend',
  note: 'Rusted, gentle, and enormous. It offers you a hand the size of a bed.',
  place: 'surface',
  biomes: ['meadow', 'forest', 'rocky'],
  weight: 5,
  reach: 80,
  draw(ctx, t) {
    const breathe = Math.sin(t * 0.6) * 1.5
    ctx.save()
    ctx.translate(0, breathe)
    // Sitting: legs folded forward.
    roundRectPath(ctx, -8, -18, 46, 14, 5)
    shapeFill(ctx, '#8a7160', 2)
    // Torso.
    roundRectPath(ctx, -26, -74, 44, 58, 8)
    shapeFill(ctx, '#9c8271', 2.2)
    // Rivets.
    ctx.fillStyle = withAlpha(INK, 0.35)
    for (let i = 0; i < 6; i++) {
      ctx.beginPath()
      ctx.arc(-20 + (i % 3) * 16, -66 + Math.floor(i / 3) * 42, 1.6, 0, TAU)
      ctx.fill()
    }
    // Head with two lamp eyes.
    roundRectPath(ctx, -20, -100, 32, 26, 9)
    shapeFill(ctx, '#a58a78', 2.2)
    for (const ex of [-11, 3]) {
      ctx.beginPath()
      ctx.arc(ex, -88, 4.4, 0, TAU)
      shapeFill(ctx, withAlpha('#f6dd9c', 0.65 + 0.3 * Math.sin(t * 1.1 + ex)), 1.4)
    }
    // The offered hand.
    ink(ctx, 6, '#8a7160')
    ctx.beginPath()
    ctx.moveTo(-24, -54)
    ctx.quadraticCurveTo(-48, -46, -52, -26)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(-53, -20, 9, 7, 0.3, 0, TAU)
    shapeFill(ctx, '#9c8271', 1.8)
    ctx.restore()
    // Moss creeping up one leg.
    ctx.fillStyle = withAlpha('#6f9a5c', 0.7)
    for (let i = 0; i < 7; i++) {
      const rng = new Rng(i * 313)
      ctx.beginPath()
      ctx.arc(-4 + rng.next() * 36, -6 - rng.next() * 12, rng.range(1.5, 3.4), 0, TAU)
      ctx.fill()
    }
  },
}

const RAINY_BUS_STOP: EasterEgg = {
  id: 'rainy-bus-stop',
  title: 'The Stop in the Rain',
  note: 'Something large and furry is waiting beside you, holding a borrowed umbrella.',
  place: 'surface',
  biomes: ['forest', 'meadow', 'fungal'],
  weight: 5,
  reach: 52,
  draw(ctx, t) {
    // Sign.
    ink(ctx, 2.4, '#6f6a5e')
    ctx.beginPath()
    ctx.moveTo(-34, 0)
    ctx.lineTo(-34, -46)
    ctx.stroke()
    roundRectPath(ctx, -44, -56, 20, 12, 2)
    shapeFill(ctx, CREAM, 1.6)

    // A big rounded neighbour with a small umbrella.
    const bob = Math.sin(t * 0.9) * 1.2
    ctx.save()
    ctx.translate(8, bob)
    blobPath(ctx, 0, -30, 30, 1234, { points: 16, wobble: 0.05, squash: 1.05 })
    shapeFill(ctx, '#7d7382', 2.2)
    // Pale belly.
    blobPath(ctx, 0, -22, 18, 4321, { points: 14, wobble: 0.08, squash: 0.9 })
    ctx.fillStyle = withAlpha(CREAM, 0.5)
    ctx.fill()
    // Chevron markings.
    ink(ctx, 1.8, withAlpha(INK, 0.35))
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(-8, -26 + i * 6)
      ctx.lineTo(0, -30 + i * 6)
      ctx.lineTo(8, -26 + i * 6)
      ctx.stroke()
    }
    // Ears.
    for (const s of [-1, 1]) {
      leafPath(ctx, s * 13, -52, 12, 5, s > 0 ? -0.9 : -TAU / 2 + 0.9)
      shapeFill(ctx, '#7d7382', 1.6)
    }
    // Eyes and a very small mouth.
    for (const ex of [-9, 9]) {
      ctx.beginPath()
      ctx.arc(ex, -44, 3.2, 0, TAU)
      ctx.fillStyle = CREAM
      ctx.fill()
      ctx.beginPath()
      ctx.arc(ex + Math.sin(t * 0.7) * 0.8, -44, 1.6, 0, TAU)
      ctx.fillStyle = INK
      ctx.fill()
    }
    ctx.beginPath()
    ctx.arc(0, -38, 2, 0, TAU)
    ctx.fillStyle = INK
    ctx.fill()
    // Umbrella held far too high.
    ink(ctx, 1.8, '#5a4a3e')
    ctx.beginPath()
    ctx.moveTo(24, -34)
    ctx.lineTo(24, -66)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(6, -66)
    ctx.quadraticCurveTo(24, -80, 42, -66)
    ctx.quadraticCurveTo(33, -70, 24, -66)
    ctx.quadraticCurveTo(15, -70, 6, -66)
    ctx.closePath()
    shapeFill(ctx, '#4f6f6a', 1.8)
    ctx.restore()

    // Rain.
    ink(ctx, 1.2, withAlpha('#bcd6e2', 0.55))
    for (let i = 0; i < 16; i++) {
      const rng = new Rng(i * 733)
      const rx = -60 + rng.next() * 130
      const ry = -90 + ((t * 90 + rng.next() * 90) % 90)
      ctx.beginPath()
      ctx.moveTo(rx, ry)
      ctx.lineTo(rx - 1.5, ry + 7)
      ctx.stroke()
    }
  },
}

const STANDING_RING: EasterEgg = {
  id: 'standing-ring',
  title: 'The Standing Ring',
  note: 'Carved symbols around the rim. Seven of them are worn smoother than the rest.',
  place: 'surface',
  biomes: ['rocky', 'desert', 'crystal', 'ice'],
  weight: 6,
  reach: 50,
  draw(ctx, t) {
    const R = 34
    ctx.save()
    ctx.translate(0, -R - 6)
    // Ring body.
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, TAU)
    ctx.arc(0, 0, R - 8, 0, TAU, true)
    ctx.fillStyle = '#8d8a80'
    ctx.fill('evenodd')
    ink(ctx, 1.8)
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, TAU)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, R - 8, 0, TAU)
    ctx.stroke()
    // Glyph blocks, a few of them lit in sequence.
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU - Math.PI / 2
      const lit = Math.floor(t * 1.2) % 14 === i
      ctx.save()
      ctx.translate(Math.cos(a) * (R - 4), Math.sin(a) * (R - 4))
      ctx.rotate(a + Math.PI / 2)
      roundRectPath(ctx, -3, -2.6, 6, 5.2, 1)
      ctx.fillStyle = lit ? '#f5c86a' : '#6f6c64'
      ctx.fill()
      ctx.restore()
    }
    // The event surface, rippling.
    ctx.beginPath()
    ctx.arc(0, 0, R - 9, 0, TAU)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R - 9)
    g.addColorStop(0, withAlpha('#9fd4ea', 0.5))
    g.addColorStop(0.7, withAlpha('#4b86b4', 0.42))
    g.addColorStop(1, withAlpha('#2c5a80', 0.6))
    ctx.fillStyle = g
    ctx.fill()
    ctx.save()
    ctx.beginPath()
    ctx.arc(0, 0, R - 9, 0, TAU)
    ctx.clip()
    ink(ctx, 1.2, withAlpha(CREAM, 0.3))
    for (let i = 0; i < 4; i++) {
      const rr = ((t * 10 + i * 8) % (R - 9))
      ctx.beginPath()
      ctx.arc(0, 0, rr, 0, TAU)
      ctx.stroke()
    }
    ctx.restore()
    ctx.restore()
    // Plinth.
    roundRectPath(ctx, -16, -8, 32, 8, 2)
    shapeFill(ctx, '#7a776e', 1.8)
  },
}

const ROOM_BEHIND_THE_CLOCK: EasterEgg = {
  id: 'room-behind-the-clock',
  title: 'The Room Behind the Clock',
  note: 'Shelves in every direction, and a watch ticking a message you almost catch.',
  place: 'surface',
  biomes: ['crystal', 'ice', 'rocky'],
  weight: 4,
  reach: 54,
  draw(ctx, t) {
    // A lattice of shelves receding into the dark.
    ctx.save()
    ctx.translate(0, -46)
    for (let depth = 3; depth >= 0; depth--) {
      const s = 1 - depth * 0.19
      const w = 74 * s
      const h = 74 * s
      ctx.globalAlpha = 0.35 + (3 - depth) * 0.2
      roundRectPath(ctx, -w / 2, -h / 2, w, h, 2)
      ctx.fillStyle = depth === 0 ? '#241d2a' : '#2e2634'
      ctx.fill()
      ink(ctx, 1.3, withAlpha('#c8a86a', 0.7))
      ctx.stroke()
      // Shelf lines and book spines.
      for (let r = 1; r < 4; r++) {
        const y = -h / 2 + (r * h) / 4
        ctx.beginPath()
        ctx.moveTo(-w / 2, y)
        ctx.lineTo(w / 2, y)
        ctx.stroke()
        for (let b = 0; b < 7; b++) {
          const bw = (w / 8) * 0.7
          ctx.fillStyle = withAlpha(b % 2 ? '#a5714f' : '#7c6a94', 0.8)
          ctx.fillRect(-w / 2 + 3 + b * (w / 8), y - h / 4 + 2, bw, h / 4 - 4)
        }
      }
      ctx.globalAlpha = 1
    }
    // The watch, hanging and ticking.
    const swing = Math.sin(t * 1.1) * 0.14
    ctx.save()
    ctx.translate(0, -40)
    ctx.rotate(swing)
    ink(ctx, 1.2, '#c8a86a')
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, 22)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 26, 6, 0, TAU)
    shapeFill(ctx, '#e6d6a8', 1.4)
    ink(ctx, 1.1, INK)
    ctx.beginPath()
    ctx.moveTo(0, 26)
    ctx.lineTo(0, 22)
    ctx.moveTo(0, 26)
    // The second hand jerks rather than sweeps.
    const tick = Math.floor(t * 2) % 12
    ctx.lineTo(Math.cos((tick / 12) * TAU) * 4, 26 + Math.sin((tick / 12) * TAU) * 4)
    ctx.stroke()
    ctx.restore()
    ctx.restore()
  },
}

const BOTANISTS_TENT: EasterEgg = {
  id: 'botanists-tent',
  title: "A Botanist's Garden",
  note: 'Somebody is growing potatoes here, against every reasonable objection.',
  place: 'surface',
  biomes: ['rocky', 'desert'],
  weight: 7,
  reach: 48,
  draw(ctx, t) {
    // Habitat dome.
    ctx.beginPath()
    ctx.arc(-16, 0, 30, Math.PI, TAU)
    ctx.closePath()
    shapeFill(ctx, withAlpha(CREAM, 0.82), 2)
    ctx.save()
    ctx.beginPath()
    ctx.arc(-16, 0, 30, Math.PI, TAU)
    ctx.closePath()
    ctx.clip()
    // Rows of hopeful green.
    for (let i = 0; i < 5; i++) {
      const x = -38 + i * 11
      ink(ctx, 1.8, '#6f9a5c')
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.quadraticCurveTo(x + Math.sin(t * 0.8 + i) * 2, -8, x + 1, -13)
      ctx.stroke()
      leafPath(ctx, x + 1, -13, 6, 2.6, -1.4 + Math.sin(t + i) * 0.15)
      ctx.fillStyle = '#83b167'
      ctx.fill()
    }
    ctx.restore()
    // Airlock.
    roundRectPath(ctx, 10, -22, 16, 22, 3)
    shapeFill(ctx, '#b9b2a2', 1.8)
    ctx.beginPath()
    ctx.arc(18, -13, 5, 0, TAU)
    shapeFill(ctx, withAlpha('#9fd0e0', 0.8), 1.4)
    // Rover tracks heading off out of frame.
    ink(ctx, 1.4, withAlpha(INK, 0.3))
    for (let i = 0; i < 8; i++) {
      const x = 30 + i * 9
      ctx.beginPath()
      ctx.moveTo(x, -2)
      ctx.lineTo(x + 4, -2)
      ctx.moveTo(x, -5)
      ctx.lineTo(x + 4, -5)
      ctx.stroke()
    }
  },
}

const FIRST_FOOTPRINTS: EasterEgg = {
  id: 'first-footprints',
  title: 'The First Footprints',
  note: 'A stiff little flag, a ladder, and two sets of boots that never came back.',
  place: 'surface',
  biomes: ['rocky', 'ice'],
  weight: 7,
  reach: 46,
  draw(ctx, _t) {
    void _t
    // Lander: squat, gold-footed, four legs.
    roundRectPath(ctx, -22, -30, 40, 20, 3)
    shapeFill(ctx, '#c9a45c', 2)
    roundRectPath(ctx, -14, -44, 26, 15, 3)
    shapeFill(ctx, '#d9d2c0', 1.8)
    ink(ctx, 2.4, '#9a8a68')
    for (const [x1, x2] of [
      [-20, -30],
      [16, 26],
      [-8, -14],
      [8, 14],
    ]) {
      ctx.beginPath()
      ctx.moveTo(x1, -12)
      ctx.lineTo(x2, 0)
      ctx.stroke()
    }
    // Ladder.
    ink(ctx, 1.4, '#9a8a68')
    ctx.beginPath()
    ctx.moveTo(-4, -10)
    ctx.lineTo(-4, 0)
    ctx.moveTo(2, -10)
    ctx.lineTo(2, 0)
    for (let i = 0; i < 3; i++) {
      ctx.moveTo(-4, -8 + i * 3)
      ctx.lineTo(2, -8 + i * 3)
    }
    ctx.stroke()
    // Flag, held out flat by a wire because there is no wind.
    ink(ctx, 2, '#c8c2b0')
    ctx.beginPath()
    ctx.moveTo(34, 0)
    ctx.lineTo(34, -40)
    ctx.lineTo(52, -40)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(34, -40)
    ctx.lineTo(52, -40)
    ctx.lineTo(52, -27)
    ctx.lineTo(34, -27)
    ctx.closePath()
    shapeFill(ctx, '#c8544a', 1.4)
    // Boot prints.
    ctx.fillStyle = withAlpha(INK, 0.28)
    for (let i = 0; i < 6; i++) {
      ctx.beginPath()
      ctx.ellipse(-40 - i * 11, -2 + (i % 2) * 3, 4, 2.4, 0.2, 0, TAU)
      ctx.fill()
    }
  },
}

const PERFECT_CIRCLES: EasterEgg = {
  id: 'perfect-circles',
  title: 'Perfect Circles in the Grain',
  note: 'Flattened overnight, with no tracks leading in. The stalks are bent, not broken.',
  place: 'surface',
  biomes: ['meadow', 'forest'],
  weight: 6,
  reach: 70,
  draw(ctx, t) {
    // Seen almost from above, as a set of rings pressed into tall grass.
    ctx.save()
    ctx.translate(0, -6)
    ctx.scale(1, 0.34)
    for (const [cx, r] of [
      [0, 42],
      [-52, 18],
      [46, 24],
      [16, 10],
    ] as const) {
      ctx.beginPath()
      ctx.arc(cx, 0, r, 0, TAU)
      ctx.fillStyle = withAlpha('#c3cf78', 0.5)
      ctx.fill()
      ink(ctx, 2.4, withAlpha('#8fa35c', 0.9))
      ctx.stroke()
    }
    ctx.restore()
    // Standing stalks around the edge.
    ink(ctx, 1.3, '#93ab7c')
    for (let i = 0; i < 26; i++) {
      const rng = new Rng(i * 419)
      const x = -80 + rng.next() * 160
      const h = 8 + rng.next() * 8
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.quadraticCurveTo(x + Math.sin(t * 0.9 + i) * 2, -h * 0.6, x + Math.sin(t * 0.9 + i) * 3, -h)
      ctx.stroke()
    }
  },
}

const SMALLEST_DOORS: EasterEgg = {
  id: 'smallest-doors',
  title: 'The Smallest Doors',
  note: 'Each stalk has a door, and each door has a mat. Nobody is home. Probably.',
  place: 'surface',
  biomes: ['fungal', 'forest'],
  weight: 7,
  reach: 46,
  draw(ctx, t) {
    for (let i = 0; i < 3; i++) {
      const x = -34 + i * 34
      const h = 34 + (i % 2) * 12
      const sway = Math.sin(t * 0.8 + i) * 1.4
      ctx.save()
      ctx.translate(x, 0)
      // Stalk.
      ctx.beginPath()
      ctx.moveTo(-7, 0)
      ctx.quadraticCurveTo(-5 + sway, -h * 0.6, -6 + sway, -h)
      ctx.lineTo(6 + sway, -h)
      ctx.quadraticCurveTo(5 + sway, -h * 0.6, 7, 0)
      ctx.closePath()
      shapeFill(ctx, '#e8dcc4', 1.8)
      // Cap.
      blobPath(ctx, sway, -h - 4, 19, 5000 + i, { points: 12, wobble: 0.08, squash: 0.62 })
      shapeFill(ctx, i % 2 === 0 ? HUES.clay : HUES.plum, 2)
      // Spots.
      ctx.fillStyle = withAlpha(CREAM, 0.7)
      for (let s = 0; s < 4; s++) {
        const rng = new Rng(i * 91 + s)
        ctx.beginPath()
        ctx.arc(sway + rng.range(-13, 13), -h - 4 + rng.range(-6, 3), rng.range(1.6, 3), 0, TAU)
        ctx.fill()
      }
      // Door and mat.
      ctx.beginPath()
      ctx.moveTo(-3.6, 0)
      ctx.lineTo(-3.6, -7)
      ctx.quadraticCurveTo(0, -11, 3.6, -7)
      ctx.lineTo(3.6, 0)
      ctx.closePath()
      shapeFill(ctx, '#6b4a34', 1.3)
      ctx.beginPath()
      ctx.arc(1.8, -4.5, 0.9, 0, TAU)
      ctx.fillStyle = '#e5c374'
      ctx.fill()
      ctx.restore()
    }
  },
}

const HOLE_WITH_A_WATCH: EasterEgg = {
  id: 'hole-with-a-watch',
  title: 'The Hole with the Watch',
  note: 'Deeper than it has any right to be. Someone dropped a pocket watch in and it never landed.',
  place: 'surface',
  biomes: ['meadow', 'forest'],
  weight: 6,
  reach: 40,
  draw(ctx, t) {
    // Mound and a very dark hole.
    ctx.beginPath()
    ctx.ellipse(0, 0, 34, 11, 0, Math.PI, TAU)
    ctx.closePath()
    shapeFill(ctx, '#8a6a4e', 1.8)
    ctx.beginPath()
    ctx.ellipse(0, -2, 20, 7, 0, 0, TAU)
    ctx.fillStyle = '#181420'
    ctx.fill()
    ink(ctx, 1.6)
    ctx.stroke()
    // A faint spiral going down.
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(0, -2, 20, 7, 0, 0, TAU)
    ctx.clip()
    ink(ctx, 1, withAlpha('#7c6a94', 0.6))
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.ellipse(0, -2, 5 + i * 5, 2 + i * 2, t * 0.3 + i, 0, TAU)
      ctx.stroke()
    }
    ctx.restore()
    // The watch, floating out and drifting back.
    const fy = -14 - Math.abs(Math.sin(t * 0.6)) * 16
    ctx.save()
    ctx.translate(6, fy)
    ctx.rotate(Math.sin(t * 0.9) * 0.4)
    ink(ctx, 1.1, '#c8a86a')
    ctx.beginPath()
    ctx.moveTo(0, -6)
    ctx.quadraticCurveTo(6, -2, 4, 4)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, -8, 5.5, 0, TAU)
    shapeFill(ctx, '#e6d6a8', 1.4)
    ink(ctx, 1, INK)
    ctx.beginPath()
    ctx.moveTo(0, -8)
    ctx.lineTo(0, -12)
    ctx.moveTo(0, -8)
    ctx.lineTo(3.4, -8)
    ctx.stroke()
    ctx.restore()
    // Grass tufts.
    ink(ctx, 1.4, '#7d9c62')
    for (let i = 0; i < 8; i++) {
      const rng = new Rng(i * 271)
      const x = -40 + rng.next() * 80
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + rng.range(-3, 3), -rng.range(5, 11))
      ctx.stroke()
    }
  },
}

const IRON_FISH: EasterEgg = {
  id: 'iron-fish',
  title: 'The Iron Fish',
  note: 'Riveted plates and a glass eye. Sailors called it a monster; it was a submarine.',
  place: 'surface',
  biomes: ['ocean', 'ice'],
  weight: 6,
  reach: 64,
  draw(ctx, t) {
    ctx.save()
    ctx.translate(0, -14 + Math.sin(t * 0.7) * 1.5)
    ctx.rotate(-0.08)
    // Hull.
    blobPath(ctx, 0, 0, 46, 8811, { points: 16, wobble: 0.05, squash: 0.38 })
    shapeFill(ctx, '#5c6a6a', 2.2)
    // Plate seams.
    ink(ctx, 1.2, withAlpha(INK, 0.4))
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 15, -14)
      ctx.quadraticCurveTo(i * 15 + 2, 0, i * 15, 14)
      ctx.stroke()
    }
    // Rivets.
    ctx.fillStyle = withAlpha(CREAM, 0.35)
    for (let i = 0; i < 14; i++) {
      const rng = new Rng(i * 137)
      ctx.beginPath()
      ctx.arc(rng.range(-42, 42), rng.range(-12, 12), 1.1, 0, TAU)
      ctx.fill()
    }
    // Glass eye, lit.
    ctx.beginPath()
    ctx.arc(-34, -3, 7, 0, TAU)
    shapeFill(ctx, withAlpha('#f0dd9c', 0.85), 1.8)
    ctx.beginPath()
    ctx.arc(-34, -3, 3, 0, TAU)
    ctx.fillStyle = withAlpha('#8fbcd0', 0.9)
    ctx.fill()
    // Dorsal ridge and a spiked tail.
    ctx.beginPath()
    ctx.moveTo(-6, -16)
    ctx.lineTo(4, -30)
    ctx.lineTo(14, -15)
    ctx.closePath()
    shapeFill(ctx, '#4c5959', 1.8)
    ctx.beginPath()
    ctx.moveTo(42, -6)
    ctx.lineTo(60, -18)
    ctx.lineTo(56, 0)
    ctx.lineTo(60, 14)
    ctx.lineTo(42, 6)
    ctx.closePath()
    shapeFill(ctx, '#4c5959', 1.8)
    ctx.restore()
  },
}

// --- space eggs ------------------------------------------------------------

const FACE_IN_THE_MOON: EasterEgg = {
  id: 'face-in-the-moon',
  title: 'The Face in the Moon',
  note: 'It is squinting. There appears to be a small rocket lodged in its eye.',
  place: 'space',
  weight: 6,
  reach: 130,
  draw(ctx, t) {
    const R = 62
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, TAU)
    shapeFill(ctx, '#e8dcc0', 2.4)
    // Cratered cheeks.
    ctx.fillStyle = withAlpha(INK, 0.08)
    for (let i = 0; i < 9; i++) {
      const rng = new Rng(i * 733)
      const a = rng.range(0, TAU)
      const d = rng.range(0, R * 0.85)
      ctx.beginPath()
      ctx.arc(Math.cos(a) * d, Math.sin(a) * d, rng.range(3, 9), 0, TAU)
      ctx.fill()
    }
    // A grumpy face.
    ink(ctx, 3, withAlpha(INK, 0.75))
    ctx.beginPath()
    ctx.arc(-22, -12, 9, 0.1, Math.PI - 0.1)
    ctx.stroke()
    // Brows.
    ctx.beginPath()
    ctx.moveTo(-32, -28)
    ctx.quadraticCurveTo(-22, -33, -12, -27)
    ctx.moveTo(12, -30)
    ctx.quadraticCurveTo(22, -35, 32, -28)
    ctx.stroke()
    // Mouth, distinctly put out.
    ctx.beginPath()
    ctx.moveTo(-16, 26)
    ctx.quadraticCurveTo(0, 18, 16, 26)
    ctx.stroke()
    // The rocket in the right eye, wobbling.
    ctx.save()
    ctx.translate(22, -14)
    ctx.rotate(-0.7 + Math.sin(t * 1.4) * 0.05)
    ctx.beginPath()
    ctx.moveTo(0, -16)
    ctx.quadraticCurveTo(7, 0, 5, 16)
    ctx.lineTo(-5, 16)
    ctx.quadraticCurveTo(-7, 0, 0, -16)
    ctx.closePath()
    shapeFill(ctx, '#d8d0bc', 1.8)
    ctx.beginPath()
    ctx.moveTo(-5, 12)
    ctx.lineTo(-11, 20)
    ctx.lineTo(-3, 17)
    ctx.closePath()
    shapeFill(ctx, HUES.clay, 1.4)
    ctx.restore()
    // Squinting eye socket ring.
    ctx.beginPath()
    ctx.arc(22, -14, 13, 0, TAU)
    ink(ctx, 2.4, withAlpha(INK, 0.55))
    ctx.stroke()
  },
}

const WHALE_AND_PETUNIAS: EasterEgg = {
  id: 'whale-and-petunias',
  title: 'A Whale and a Bowl of Petunias',
  note: 'Both newly created, both falling, and only one of them has done this before.',
  place: 'space',
  weight: 5,
  reach: 140,
  draw(ctx, t) {
    const fall = Math.sin(t * 0.5) * 8
    // Whale, tumbling gently and thinking hard.
    ctx.save()
    ctx.translate(-14, fall)
    ctx.rotate(0.3 + Math.sin(t * 0.4) * 0.08)
    blobPath(ctx, 0, 0, 52, 4242, { points: 18, wobble: 0.06, squash: 0.56 })
    shapeFill(ctx, '#6f8aa8', 2.4)
    // Pale belly.
    ctx.save()
    blobPath(ctx, 0, 0, 52, 4242, { points: 18, wobble: 0.06, squash: 0.56 })
    ctx.clip()
    ctx.beginPath()
    ctx.ellipse(0, 16, 44, 16, 0, 0, TAU)
    ctx.fillStyle = withAlpha(CREAM, 0.4)
    ctx.fill()
    ctx.restore()
    // Tail flukes.
    ctx.beginPath()
    ctx.moveTo(44, -2)
    ctx.quadraticCurveTo(64, -22, 70, -6)
    ctx.quadraticCurveTo(60, -2, 62, 8)
    ctx.quadraticCurveTo(52, 6, 44, 6)
    ctx.closePath()
    shapeFill(ctx, '#5f7a96', 2)
    // Flipper.
    ctx.beginPath()
    ctx.moveTo(-6, 18)
    ctx.quadraticCurveTo(-2, 34, -18, 30)
    ctx.closePath()
    shapeFill(ctx, '#5f7a96', 1.8)
    // A large, curious eye.
    ctx.beginPath()
    ctx.arc(-32, -6, 6.5, 0, TAU)
    ctx.fillStyle = CREAM
    ctx.fill()
    ctx.beginPath()
    ctx.arc(-33.5, -6, 3, 0, TAU)
    ctx.fillStyle = INK
    ctx.fill()
    ink(ctx, 1.6)
    ctx.beginPath()
    ctx.arc(-32, -6, 6.5, 0, TAU)
    ctx.stroke()
    ctx.restore()
    // The petunias, in a bowl, resigned.
    ctx.save()
    ctx.translate(58, -46 - fall * 0.6)
    ctx.rotate(-0.4 + Math.sin(t * 0.8) * 0.12)
    ctx.beginPath()
    ctx.moveTo(-11, 0)
    ctx.quadraticCurveTo(0, 12, 11, 0)
    ctx.closePath()
    shapeFill(ctx, '#b06a58', 1.8)
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.45
      ink(ctx, 1.4, '#6f9a5c')
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12)
      ctx.stroke()
      starPath(ctx, Math.cos(a) * 13, Math.sin(a) * 13, 4.4, 2, 5, i)
      shapeFill(ctx, i % 2 ? '#d9a0c8' : '#e8c0d8', 1.1)
    }
    ctx.restore()
  },
}

const THE_STARMAN: EasterEgg = {
  id: 'the-starman',
  title: 'The Starman',
  note: 'Drifting with his hands behind his head. A bolt of colour across the visor.',
  place: 'space',
  weight: 5,
  reach: 110,
  draw(ctx, t) {
    ctx.save()
    ctx.rotate(Math.sin(t * 0.35) * 0.18)
    // Suit.
    roundRectPath(ctx, -16, -14, 32, 44, 12)
    shapeFill(ctx, '#e8e2d4', 2.2)
    // Legs, crossed at the ankle because there is no rush.
    ink(ctx, 8, '#e8e2d4')
    ctx.beginPath()
    ctx.moveTo(-7, 28)
    ctx.lineTo(6, 46)
    ctx.moveTo(7, 28)
    ctx.lineTo(-4, 46)
    ctx.stroke()
    // Arms tucked behind the head.
    ink(ctx, 6, '#e8e2d4')
    ctx.beginPath()
    ctx.moveTo(-14, -6)
    ctx.quadraticCurveTo(-30, -18, -14, -28)
    ctx.moveTo(14, -6)
    ctx.quadraticCurveTo(30, -18, 14, -28)
    ctx.stroke()
    // Helmet.
    ctx.beginPath()
    ctx.arc(0, -28, 17, 0, TAU)
    shapeFill(ctx, '#f0ebde', 2.2)
    ctx.beginPath()
    ctx.arc(0, -28, 12.5, 0, TAU)
    ctx.fillStyle = '#2a2338'
    ctx.fill()
    // The bolt across the visor.
    ctx.save()
    ctx.beginPath()
    ctx.arc(0, -28, 12.5, 0, TAU)
    ctx.clip()
    ctx.beginPath()
    ctx.moveTo(-13, -40)
    ctx.lineTo(-2, -30)
    ctx.lineTo(-7, -28)
    ctx.lineTo(6, -14)
    ctx.lineTo(1, -27)
    ctx.lineTo(7, -29)
    ctx.lineTo(-4, -40)
    ctx.closePath()
    const g = ctx.createLinearGradient(-13, -40, 7, -14)
    g.addColorStop(0, '#ef6a6a')
    g.addColorStop(0.5, '#f4c05e')
    g.addColorStop(1, '#6fa8d8')
    ctx.fillStyle = g
    ctx.fill()
    // Stars reflected in the visor.
    ctx.fillStyle = withAlpha(CREAM, 0.8)
    for (let i = 0; i < 5; i++) {
      const rng = new Rng(i * 601)
      ctx.beginPath()
      ctx.arc(rng.range(-11, 11), -28 + rng.range(-11, 11), 0.9, 0, TAU)
      ctx.fill()
    }
    ctx.restore()
    // Tether trailing off into nothing.
    ink(ctx, 1.6, withAlpha(CREAM, 0.5))
    ctx.beginPath()
    ctx.moveTo(12, 6)
    ctx.quadraticCurveTo(46, 18, 72, -6 + Math.sin(t) * 6)
    ctx.stroke()
    ctx.restore()
  },
}

const GOLDEN_RECORD: EasterEgg = {
  id: 'golden-record',
  title: 'The Golden Record',
  note: 'A small machine, very far from home, still carrying greetings in fifty-five languages.',
  place: 'space',
  weight: 6,
  reach: 100,
  draw(ctx, t) {
    ctx.save()
    ctx.rotate(Math.sin(t * 0.25) * 0.12)
    // Dish.
    ctx.beginPath()
    ctx.ellipse(0, -18, 34, 12, 0, 0, TAU)
    shapeFill(ctx, '#ddd6c4', 2)
    ctx.beginPath()
    ctx.ellipse(0, -18, 26, 8, 0, 0, TAU)
    ink(ctx, 1.2, withAlpha(INK, 0.35))
    ctx.stroke()
    ink(ctx, 1.6, '#9a927e')
    ctx.beginPath()
    ctx.moveTo(0, -18)
    ctx.lineTo(0, -34)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, -36, 3, 0, TAU)
    ctx.fillStyle = '#c9c1ac'
    ctx.fill()
    // Bus.
    roundRectPath(ctx, -13, -8, 26, 18, 3)
    shapeFill(ctx, '#b8b0a0', 2)
    // Booms.
    ink(ctx, 2, '#9a927e')
    ctx.beginPath()
    ctx.moveTo(-13, 2)
    ctx.lineTo(-52, 16)
    ctx.moveTo(13, 0)
    ctx.lineTo(44, -12)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(-54, 17, 4, 0, TAU)
    shapeFill(ctx, '#8e8676', 1.4)
    // The record itself, catching the light.
    ctx.save()
    ctx.translate(6, 16)
    ctx.rotate(0.35)
    ctx.beginPath()
    ctx.ellipse(0, 0, 13, 12, 0, 0, TAU)
    const g = ctx.createLinearGradient(-13, -12, 13, 12)
    g.addColorStop(0, '#f6d98c')
    g.addColorStop(0.5, '#e0b45c')
    g.addColorStop(1, '#f8e6b0')
    ctx.fillStyle = g
    ctx.fill()
    ink(ctx, 1.6, '#9a7c3c')
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, 2.4, 0, TAU)
    ctx.fillStyle = '#8a6a2c'
    ctx.fill()
    // Engraved rings.
    ink(ctx, 0.8, withAlpha('#8a6a2c', 0.5))
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath()
      ctx.ellipse(0, 0, 3 + i * 2.6, 2.8 + i * 2.4, 0, 0, TAU)
      ctx.stroke()
    }
    ctx.restore()
    sparkle(ctx, 18, 6, 5 + Math.sin(t * 2) * 2, withAlpha(CREAM, 0.7))
    ctx.restore()
  },
}

const WORLD_TURTLE: EasterEgg = {
  id: 'world-turtle',
  title: 'The World Turtle',
  note: 'Four elephants, one enormous turtle, and a flat world balanced on top. It works.',
  place: 'space',
  weight: 4,
  reach: 180,
  draw(ctx, t) {
    const swim = Math.sin(t * 0.3) * 4
    ctx.save()
    ctx.translate(0, swim)
    // The disc, edge-on, with a ring of falling sea.
    ctx.beginPath()
    ctx.ellipse(0, -68, 96, 18, 0, 0, TAU)
    shapeFill(ctx, '#7d9c62', 2.2)
    ctx.beginPath()
    ctx.ellipse(0, -70, 72, 12, 0, 0, TAU)
    ctx.fillStyle = withAlpha('#5f9a9c', 0.65)
    ctx.fill()
    // Rimfall.
    ink(ctx, 1.4, withAlpha('#9dc6da', 0.55))
    for (let i = 0; i < 10; i++) {
      const x = -92 + i * 20
      ctx.beginPath()
      ctx.moveTo(x, -60)
      ctx.lineTo(x + Math.sin(t + i) * 2, -60 + 16 + (i % 3) * 5)
      ctx.stroke()
    }
    // A tiny mountain at the hub.
    ctx.beginPath()
    ctx.moveTo(-10, -74)
    ctx.lineTo(0, -92)
    ctx.lineTo(10, -74)
    ctx.closePath()
    shapeFill(ctx, '#c9c0aa', 1.6)
    // Four elephants.
    for (let i = 0; i < 4; i++) {
      const x = -48 + i * 32
      const depth = i === 1 || i === 2 ? 1 : 0.85
      ctx.save()
      ctx.translate(x, -46)
      ctx.scale(depth, depth)
      roundRectPath(ctx, -13, -12, 26, 24, 8)
      shapeFill(ctx, i % 2 ? '#8d8a94' : '#9a97a2', 1.8)
      // Trunk and legs.
      ink(ctx, 3, '#8d8a94')
      ctx.beginPath()
      ctx.moveTo(-11, 2)
      ctx.quadraticCurveTo(-18, 10, -14, 18)
      ctx.stroke()
      ink(ctx, 4.5, '#8d8a94')
      ctx.beginPath()
      ctx.moveTo(-6, 10)
      ctx.lineTo(-6, 20)
      ctx.moveTo(6, 10)
      ctx.lineTo(6, 20)
      ctx.stroke()
      // Ear.
      ctx.beginPath()
      ctx.ellipse(-2, -2, 7, 9, -0.2, 0, TAU)
      shapeFill(ctx, '#a5a2ac', 1.3)
      ctx.restore()
    }
    // The turtle.
    ctx.beginPath()
    ctx.ellipse(0, 4, 88, 34, 0, Math.PI, TAU)
    ctx.closePath()
    shapeFill(ctx, '#6f7a5c', 2.4)
    // Shell plates.
    ink(ctx, 1.4, withAlpha(INK, 0.4))
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 28, 4)
      ctx.quadraticCurveTo(i * 28 + 4, -18, i * 22, -30)
      ctx.stroke()
    }
    // Head and flippers.
    ctx.beginPath()
    ctx.ellipse(-96, -2, 20, 13, -0.15, 0, TAU)
    shapeFill(ctx, '#7d8a68', 2)
    ctx.beginPath()
    ctx.arc(-104, -6, 2.6, 0, TAU)
    ctx.fillStyle = INK
    ctx.fill()
    for (const [fx, fa] of [
      [-52, 0.5],
      [52, -0.5],
    ] as const) {
      ctx.save()
      ctx.translate(fx, 6)
      ctx.rotate(fa + Math.sin(t * 0.5 + fx) * 0.12)
      ctx.beginPath()
      ctx.ellipse(0, 10, 12, 26, 0, 0, TAU)
      shapeFill(ctx, '#7d8a68', 1.8)
      ctx.restore()
    }
    ctx.restore()
  },
}

const RING_STATION: EasterEgg = {
  id: 'ring-station',
  title: 'The Slowly Turning Ring',
  note: 'A wheel of windows, spinning just fast enough to have a floor.',
  place: 'space',
  weight: 6,
  reach: 130,
  draw(ctx, t) {
    const R = 56
    ctx.save()
    ctx.rotate(t * 0.12)
    // Outer ring.
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, TAU)
    ctx.arc(0, 0, R - 13, 0, TAU, true)
    ctx.fillStyle = '#cfc8b6'
    ctx.fill('evenodd')
    ink(ctx, 2)
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, TAU)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, R - 13, 0, TAU)
    ctx.stroke()
    // Windows.
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * TAU
      ctx.save()
      ctx.translate(Math.cos(a) * (R - 6.5), Math.sin(a) * (R - 6.5))
      ctx.rotate(a)
      roundRectPath(ctx, -2, -3, 4, 6, 1)
      ctx.fillStyle = withAlpha('#f6e3a8', i % 4 === 0 ? 0.45 : 0.9)
      ctx.fill()
      ctx.restore()
    }
    // Spokes and hub.
    ink(ctx, 4, '#b8b0a0')
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * 11, Math.sin(a) * 11)
      ctx.lineTo(Math.cos(a) * (R - 13), Math.sin(a) * (R - 13))
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.arc(0, 0, 12, 0, TAU)
    shapeFill(ctx, '#ddd6c4', 2)
    ctx.restore()
    // A shuttle on final approach.
    const ap = (t * 0.15) % 1
    const ax = -150 + ap * 100
    ctx.save()
    ctx.translate(ax, 40 - ap * 24)
    ctx.rotate(-0.3)
    roundRectPath(ctx, -9, -3.5, 18, 7, 3)
    shapeFill(ctx, '#e0d8c6', 1.4)
    ink(ctx, 1.6, withAlpha('#9fd0e0', 0.8))
    ctx.beginPath()
    ctx.moveTo(-9, 0)
    ctx.lineTo(-18, 0)
    ctx.stroke()
    ctx.restore()
  },
}

const FLOATING_GARDEN: EasterEgg = {
  id: 'floating-garden',
  title: 'The Floating Garden',
  note: 'A hill in the sky with one great tree, and a mossy machine still tending it.',
  place: 'space',
  weight: 5,
  reach: 150,
  draw(ctx, t) {
    const bob = Math.sin(t * 0.4) * 4
    ctx.save()
    ctx.translate(0, bob)
    // Rocky underside tapering to a point.
    ctx.beginPath()
    ctx.moveTo(-72, 0)
    ctx.quadraticCurveTo(-30, 54, -6, 96)
    ctx.quadraticCurveTo(10, 50, 72, 0)
    ctx.closePath()
    shapeFill(ctx, '#7a6a58', 2.2)
    // A few roots dangling.
    ink(ctx, 1.6, '#6a5a48')
    for (let i = 0; i < 5; i++) {
      const x = -40 + i * 20
      ctx.beginPath()
      ctx.moveTo(x, 8)
      ctx.quadraticCurveTo(x + Math.sin(t + i) * 6, 30, x + Math.sin(t + i) * 3, 48)
      ctx.stroke()
    }
    // Green top.
    ctx.beginPath()
    ctx.ellipse(0, 0, 74, 17, 0, Math.PI, TAU)
    ctx.closePath()
    shapeFill(ctx, '#7d9c62', 2.2)
    // The great tree.
    ink(ctx, 7, '#6b5442')
    ctx.beginPath()
    ctx.moveTo(6, -8)
    ctx.quadraticCurveTo(2, -40, 8, -58)
    ctx.stroke()
    blobPath(ctx, 8, -70, 30, 7788, { points: 15, wobble: 0.12, squash: 0.82 })
    shapeFill(ctx, '#6f9a5c', 2.2)
    blobPath(ctx, -14, -56, 17, 7789, { points: 12, wobble: 0.14, squash: 0.86 })
    shapeFill(ctx, '#83b167', 1.8)
    // The mossy gardener.
    ctx.save()
    ctx.translate(-40, -6)
    roundRectPath(ctx, -8, -22, 16, 22, 5)
    shapeFill(ctx, '#8a8a76', 1.8)
    ctx.beginPath()
    ctx.arc(0, -27, 7, 0, TAU)
    shapeFill(ctx, '#9a9a86', 1.8)
    for (const ex of [-3, 3]) {
      ctx.beginPath()
      ctx.arc(ex, -28, 1.8, 0, TAU)
      ctx.fillStyle = withAlpha('#f6dd9c', 0.9)
      ctx.fill()
    }
    // Arms hanging, one holding a flower.
    ink(ctx, 2.6, '#8a8a76')
    ctx.beginPath()
    ctx.moveTo(-8, -16)
    ctx.lineTo(-13, -2)
    ctx.moveTo(8, -16)
    ctx.lineTo(12, -4)
    ctx.stroke()
    starPath(ctx, 13, -6, 3.6, 1.6, 5, t * 0.4)
    ctx.fillStyle = '#e8c0d8'
    ctx.fill()
    // Moss.
    ctx.fillStyle = withAlpha('#6f9a5c', 0.75)
    for (let i = 0; i < 6; i++) {
      const rng = new Rng(i * 457)
      ctx.beginPath()
      ctx.arc(rng.range(-8, 8), rng.range(-24, -2), rng.range(1.4, 3), 0, TAU)
      ctx.fill()
    }
    ctx.restore()
    ctx.restore()
  },
}

const PALE_BLUE_DOT: EasterEgg = {
  id: 'pale-blue-dot',
  title: 'The Pale Blue Dot',
  note: 'A single speck caught in a band of scattered light. Everyone you know lives there.',
  place: 'space',
  weight: 5,
  reach: 120,
  draw(ctx, t) {
    // Bands of scattered sunlight across the frame.
    ctx.save()
    ctx.rotate(-0.5)
    for (let i = -1; i <= 1; i++) {
      const g = ctx.createLinearGradient(-160, i * 46, 160, i * 46)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(0.5, withAlpha(i === 0 ? '#f4d9a8' : '#c9b78e', i === 0 ? 0.3 : 0.16))
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(-160, i * 46 - 22, 320, 44)
    }
    ctx.restore()
    // The dot. Not much to look at.
    const pulse = 0.8 + 0.2 * Math.sin(t * 1.3)
    const g2 = ctx.createRadialGradient(6, -8, 0, 6, -8, 22)
    g2.addColorStop(0, withAlpha('#9dc6da', 0.5 * pulse))
    g2.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g2
    ctx.beginPath()
    ctx.arc(6, -8, 22, 0, TAU)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(6, -8, 3.4, 0, TAU)
    ctx.fillStyle = '#bfe0ee'
    ctx.fill()
  },
}

const CHEESE_MOON: EasterEgg = {
  id: 'cheese-moon',
  title: 'The Moon Made of Cheese',
  note: 'Somebody came a very long way to check, and brought crackers.',
  place: 'space',
  weight: 5,
  reach: 120,
  draw(ctx, t) {
    // A wedge with holes.
    ctx.save()
    ctx.rotate(Math.sin(t * 0.3) * 0.08)
    ctx.beginPath()
    ctx.moveTo(-46, 26)
    ctx.lineTo(46, 26)
    ctx.lineTo(46, -6)
    ctx.quadraticCurveTo(0, -34, -46, -6)
    ctx.closePath()
    shapeFill(ctx, '#f0c869', 2.4)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(-46, 26)
    ctx.lineTo(46, 26)
    ctx.lineTo(46, -6)
    ctx.quadraticCurveTo(0, -34, -46, -6)
    ctx.closePath()
    ctx.clip()
    for (let i = 0; i < 9; i++) {
      const rng = new Rng(i * 811)
      ctx.beginPath()
      ctx.arc(rng.range(-40, 40), rng.range(-16, 20), rng.range(2.6, 7), 0, TAU)
      ctx.fillStyle = withAlpha('#c99a3c', 0.5)
      ctx.fill()
    }
    ctx.restore()
    // Rind.
    ink(ctx, 3, '#d8a94c')
    ctx.beginPath()
    ctx.moveTo(-46, -6)
    ctx.quadraticCurveTo(0, -34, 46, -6)
    ctx.stroke()
    // A folding chair, a small figure, and a plate of crackers.
    ink(ctx, 1.8, '#6a5a48')
    ctx.beginPath()
    ctx.moveTo(-24, -12)
    ctx.lineTo(-24, -22)
    ctx.lineTo(-14, -22)
    ctx.moveTo(-14, -22)
    ctx.lineTo(-14, -12)
    ctx.stroke()
    figure(ctx, -19, -22, 17, withAlpha(INK, 0.7))
    ctx.beginPath()
    ctx.ellipse(4, -14, 8, 2.6, 0, 0, TAU)
    shapeFill(ctx, '#e8e2d2', 1.2)
    for (let i = 0; i < 3; i++) {
      roundRectPath(ctx, -1 + i * 3, -19 - i * 1.4, 5, 2.4, 0.6)
      ctx.fillStyle = '#d8b478'
      ctx.fill()
    }
    ctx.restore()
  },
}

const HOUSE_THAT_FLEW: EasterEgg = {
  id: 'house-that-flew',
  title: 'The House That Flew',
  note: 'One small house, several thousand balloons, and a promise finally being kept.',
  place: 'space',
  weight: 5,
  reach: 140,
  draw(ctx, t) {
    const sway = Math.sin(t * 0.45) * 5
    ctx.save()
    ctx.translate(sway, 0)
    ctx.rotate(Math.sin(t * 0.45) * 0.05)
    // The balloon cloud.
    const rng = new Rng(20220)
    for (let i = 0; i < 46; i++) {
      const a = rng.range(0, TAU)
      const d = Math.sqrt(rng.next()) * 62
      const bx = Math.cos(a) * d
      const by = -74 + Math.sin(a) * d * 0.72
      const r = rng.range(6, 11)
      const col = rng.pick(['#e06a5c', '#f0b24c', '#f4d76a', '#6fa8c8', '#8ab86c', '#d987a8', '#b78ac8'])
      ink(ctx, 0.8, withAlpha(CREAM, 0.28))
      ctx.beginPath()
      ctx.moveTo(bx, by + r)
      ctx.quadraticCurveTo(bx + 3, -26, 0, -18)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(bx, by, r * 0.9, r, 0, 0, TAU)
      ctx.fillStyle = col
      ctx.fill()
      ink(ctx, 1, withAlpha(INK, 0.3))
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(bx - r * 0.3, by - r * 0.35, r * 0.22, 0, TAU)
      ctx.fillStyle = withAlpha(CREAM, 0.55)
      ctx.fill()
    }
    // The house.
    roundRectPath(ctx, -26, -16, 52, 34, 2)
    shapeFill(ctx, '#e8dcc0', 2.2)
    ctx.beginPath()
    ctx.moveTo(-31, -16)
    ctx.lineTo(0, -38)
    ctx.lineTo(31, -16)
    ctx.closePath()
    shapeFill(ctx, '#a5583f', 2.2)
    // Windows, one of them lit.
    for (let i = 0; i < 3; i++) {
      roundRectPath(ctx, -20 + i * 15, -10, 11, 11, 1.5)
      shapeFill(ctx, i === 1 ? withAlpha('#f6dd9c', 0.95) : withAlpha('#7fa6bd', 0.7), 1.3)
    }
    // Door and a crooked porch rail.
    roundRectPath(ctx, -6, 2, 12, 16, 1.5)
    shapeFill(ctx, '#6b8a5c', 1.5)
    ink(ctx, 1.4, '#8b6a52')
    ctx.beginPath()
    ctx.moveTo(-26, 18)
    ctx.lineTo(26, 18)
    ctx.stroke()
    ctx.restore()
  },
}

// --- registry --------------------------------------------------------------

export const EGGS: readonly EasterEgg[] = [
  TALL_SLAB,
  PATIENT_LENS,
  GREAT_BURROWER,
  TWO_SUNS,
  SNOWY_WARDROBE,
  ROUND_GREEN_DOOR,
  BLUE_BOOTH,
  THUMB_AND_TOWEL,
  LONG_LEGGED_WALKER,
  OCEAN_LIGHT,
  CUBE_COLLECTOR,
  TALL_IRON_FRIEND,
  RAINY_BUS_STOP,
  STANDING_RING,
  ROOM_BEHIND_THE_CLOCK,
  BOTANISTS_TENT,
  FIRST_FOOTPRINTS,
  PERFECT_CIRCLES,
  SMALLEST_DOORS,
  HOLE_WITH_A_WATCH,
  IRON_FISH,
  FACE_IN_THE_MOON,
  WHALE_AND_PETUNIAS,
  THE_STARMAN,
  GOLDEN_RECORD,
  WORLD_TURTLE,
  RING_STATION,
  FLOATING_GARDEN,
  PALE_BLUE_DOT,
  CHEESE_MOON,
  HOUSE_THAT_FLEW,
]

const BY_ID = new Map(EGGS.map((e) => [e.id, e]))

export function getEgg(id: string): EasterEgg | undefined {
  return BY_ID.get(id)
}

export const SURFACE_EGGS = EGGS.filter((e) => e.place === 'surface')
export const SPACE_EGGS = EGGS.filter((e) => e.place === 'space')

/** Pick a surface egg that suits a biome, or null. */
export function pickSurfaceEgg(rng: { pickWeighted: <T>(i: readonly T[], w: readonly number[]) => T }, biome: Biome): EasterEgg | null {
  const candidates = SURFACE_EGGS.filter((e) => !e.biomes || e.biomes.includes(biome))
  if (candidates.length === 0) return null
  return rng.pickWeighted(candidates, candidates.map((c) => c.weight))
}

/** Pick any space egg. */
export function pickSpaceEgg(rng: { pickWeighted: <T>(i: readonly T[], w: readonly number[]) => T }): EasterEgg {
  return rng.pickWeighted(SPACE_EGGS, SPACE_EGGS.map((c) => c.weight))
}

/** Total number of discoverable curiosities, for the sticker book. */
export const EGG_COUNT = EGGS.length

/** Cosmetic: a tiny icon for the sticker book grid, drawn at ~unit scale. */
export function drawEggThumb(ctx: Ctx, egg: EasterEgg, size: number, t = 0.5) {
  // Reuse the full drawing, scaled into the tile. Surface eggs sit on a
  // baseline, space eggs are centred.
  const bounds = egg.place === 'surface' ? 210 : 260
  const s = size / bounds
  ctx.save()
  ctx.scale(s, s)
  if (egg.place === 'surface') ctx.translate(0, bounds * 0.3)
  egg.draw(ctx, t)
  ctx.restore()
}

/** Shared tint for the little "new discovery" banner. */
export const DISCOVERY_TINT = tint(HUES.butter, 0.2)
export const DISCOVERY_SHADE = shade(HUES.plum, 0.2)
