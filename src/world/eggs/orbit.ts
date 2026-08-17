/**
 * Curiosities from things people actually built, left behind, or stood and
 * looked at — spacecraft, monuments, and the odd unexplained circle.
 *
 * Original silhouettes and shape studies. See `kit.ts` for the drawing
 * conventions and the shared helpers.
 */

import { TAU } from '../../core/math'
import { CREAM, HUES, INK, withAlpha, mix } from '../../render/palette'
import { ink, roundRectPath, sparkle } from '../../render/shapes'
import { type EasterEgg, shapeFill, glowDot, smoke, scatter } from './kit'

const OCEAN_LIGHT: EasterEgg = {
  id: 'ocean-light',
  title: 'The Light at the End',
  note: 'Somebody keeps it burning. The nearest shore is four worlds away.',
  place: 'surface',
  biomes: ['ocean', 'ice'],
  weight: 7,
  reach: 50,
  thumb: { scale: 1.3 },
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

const FIRST_FOOTPRINTS: EasterEgg = {
  id: 'first-footprints',
  title: 'The First Footprints',
  note: 'A stiff little flag, a ladder, and two sets of boots that never came back.',
  place: 'surface',
  biomes: ['rocky', 'ice'],
  weight: 7,
  reach: 46,
  thumb: { scale: 1.35 },
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
    // Seen from a low ridge: squashed, but not so hard that circles stop
    // reading as circles.
    ctx.save()
    ctx.translate(0, -14)
    ctx.scale(1, 0.46)
    for (const [cx, cy, r] of [
      [0, 0, 44],
      [-62, -18, 20],
      [54, -26, 26],
      [22, 26, 12],
    ] as const) {
      // Flattened stalks inside, laid in a swirl.
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, TAU)
      ctx.fillStyle = withAlpha('#cfd884', 0.55)
      ctx.fill()
      ink(ctx, 3, withAlpha('#f0f2c0', 0.85))
      ctx.stroke()
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, TAU)
      ctx.clip()
      ink(ctx, 1.6, withAlpha('#9aa858', 0.7))
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a) * r * 0.15, cy + Math.sin(a) * r * 0.15)
        ctx.quadraticCurveTo(
          cx + Math.cos(a + 0.7) * r * 0.6,
          cy + Math.sin(a + 0.7) * r * 0.6,
          cx + Math.cos(a + 1.3) * r,
          cy + Math.sin(a + 1.3) * r,
        )
        ctx.stroke()
      }
      ctx.restore()
      // A tidy ring of standing stalks around the rim.
      ink(ctx, 1.4, withAlpha('#8fa35c', 0.9))
      ctx.beginPath()
      ctx.arc(cx, cy, r + 2, 0, TAU)
      ctx.stroke()
    }
    ctx.restore()
    // Tall crop still standing all around, swaying.
    ink(ctx, 1.4, '#a5b368')
    for (let i = 0; i < 30; i++) {
      const rng = scatter(i * 419)
      const x = -104 + rng.next() * 208
      const h = 9 + rng.next() * 10
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.quadraticCurveTo(x + 1.5, -h * 0.6, x + Math.sin(t * 0.9 + i) * 3, -h)
      ctx.stroke()
    }
    // A single stalk bent over inside the big ring, not broken.
    ink(ctx, 1.8, withAlpha('#c8d078', 0.9))
    ctx.beginPath()
    ctx.moveTo(6, -14)
    ctx.quadraticCurveTo(14, -18, 24, -13)
    ctx.stroke()
  },
}

const GOLDEN_RECORD: EasterEgg = {
  id: 'golden-record',
  title: 'The Golden Record',
  note: 'A small machine, very far from home, still carrying greetings in fifty-five languages.',
  place: 'space',
  weight: 6,
  reach: 100,
  thumb: { scale: 1.4 },
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

const PALE_BLUE_DOT: EasterEgg = {
  id: 'pale-blue-dot',
  title: 'The Pale Blue Dot',
  note: 'A single speck caught in a band of scattered light. Everyone you know lives there.',
  place: 'space',
  weight: 5,
  reach: 120,
  thumb: { scale: 1.1 },
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

const FOLDED_TELESCOPE: EasterEgg = {
  id: 'folded-telescope',
  title: 'The Telescope That Unfolds Like a Flower',
  note: 'Eighteen gold hexagons, one enormous parasol, and a view of a very long time ago.',
  place: 'space',
  weight: 6,
  reach: 130,
  thumb: { scale: 1.05 },
  draw(ctx, t) {
    ctx.save()
    ctx.rotate(-0.32 + Math.sin(t * 0.18) * 0.05)
    // The sunshield: five stacked diamond layers, seen edge-on-ish.
    for (let i = 4; i >= 0; i--) {
      ctx.save()
      ctx.translate(0, 26 + i * 7)
      ctx.beginPath()
      ctx.moveTo(-72, 0)
      ctx.lineTo(0, -13 - i * 1.4)
      ctx.lineTo(72, 0)
      ctx.lineTo(0, 13 + i * 1.4)
      ctx.closePath()
      ctx.fillStyle = withAlpha(i === 0 ? '#c8b8a0' : '#9a92a8', 0.5 + i * 0.09)
      ctx.fill()
      ink(ctx, 1.2, withAlpha(INK, 0.4))
      ctx.stroke()
      ctx.restore()
    }
    // Support struts up to the mirror.
    ink(ctx, 2, '#8a8478')
    for (const sx of [-16, 16]) {
      ctx.beginPath()
      ctx.moveTo(sx, 24)
      ctx.lineTo(sx * 0.5, -4)
      ctx.stroke()
    }
    // The primary: a honeycomb of gold hexagons.
    const H = 11
    const hexes: [number, number][] = []
    for (let row = -2; row <= 2; row++) {
      const count = 5 - Math.abs(row)
      for (let c = 0; c < count; c++) {
        hexes.push([(c - (count - 1) / 2) * H * 1.74, row * H * 1.5])
      }
    }
    for (const [hx, hy] of hexes) {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + Math.PI / 6
        const px = hx + Math.cos(a) * H
        const py = hy - 26 + Math.sin(a) * H
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      // A slow shimmer travelling across the array.
      const shimmer = 0.72 + 0.28 * Math.sin(t * 1.1 + hx * 0.05 + hy * 0.04)
      ctx.fillStyle = withAlpha('#e8bf5c', shimmer)
      ctx.fill()
      ink(ctx, 1, withAlpha('#8a6a2c', 0.7))
      ctx.stroke()
    }
    // The secondary mirror on its tripod, out in front.
    ink(ctx, 1.6, '#8a8478')
    for (const sx of [-18, 0, 18]) {
      ctx.beginPath()
      ctx.moveTo(sx, -32)
      ctx.lineTo(2, -66)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.arc(2, -68, 6, 0, TAU)
    shapeFill(ctx, '#e8bf5c', 1.6)
    ctx.restore()
    // A very old, very red galaxy, caught in it.
    ctx.save()
    ctx.globalAlpha = 0.85
    ctx.translate(-116, -74)
    ctx.rotate(0.5)
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.ellipse(0, 0, 16 - i * 4, 5 - i * 1.2, (i / 3) * Math.PI, 0, TAU)
      ctx.fillStyle = withAlpha('#e08a6c', 0.3)
      ctx.fill()
    }
    ctx.beginPath()
    ctx.arc(0, 0, 3, 0, TAU)
    ctx.fillStyle = withAlpha('#f6d8b8', 0.85)
    ctx.fill()
    ctx.restore()
  },
}

const BEEPING_SPHERE: EasterEgg = {
  id: 'beeping-sphere',
  title: 'The First Beeping Sphere',
  note: 'A polished ball with four whiskers, saying the same short thing over and over.',
  place: 'space',
  weight: 6,
  reach: 95,
  thumb: { scale: 1.9 },
  draw(ctx, t) {
    const spin = t * 0.5
    ctx.save()
    ctx.rotate(Math.sin(spin) * 0.2)
    // Four swept-back antennae.
    ink(ctx, 2, '#b8b4ac')
    for (let i = 0; i < 4; i++) {
      const a = Math.PI * 0.62 + (i - 1.5) * 0.24
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * 15, Math.sin(a) * 15)
      ctx.lineTo(Math.cos(a) * 62, Math.sin(a) * 62 - 4)
      ctx.stroke()
    }
    // The sphere: polished, with a horizon of reflected light.
    ctx.beginPath()
    ctx.arc(0, 0, 20, 0, TAU)
    shapeFill(ctx, '#c9ccd2', 2.2)
    const g = ctx.createRadialGradient(-7, -8, 2, 0, 0, 22)
    g.addColorStop(0, withAlpha(CREAM, 0.75))
    g.addColorStop(0.5, 'rgba(0,0,0,0)')
    g.addColorStop(1, withAlpha(INK, 0.3))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, 20, 0, TAU)
    ctx.fill()
    // The seam around its equator.
    ink(ctx, 1.2, withAlpha(INK, 0.4))
    ctx.beginPath()
    ctx.ellipse(0, 0, 20, 5, 0, 0, TAU)
    ctx.stroke()
    ctx.restore()
    // The beep: rings going out, on a strict schedule.
    const beat = (t * 0.9) % 1
    for (let i = 0; i < 2; i++) {
      const p = (beat + i * 0.5) % 1
      ink(ctx, 2 * (1 - p), withAlpha('#9fd0e0', 0.55 * (1 - p)))
      ctx.beginPath()
      ctx.arc(0, 0, 24 + p * 66, 0, TAU)
      ctx.stroke()
    }
  },
}

const MODULAR_STATION: EasterEgg = {
  id: 'modular-station',
  title: 'A Station Built From Parcels',
  note: 'Bolted together a piece at a time, by people who had to agree on the sizes.',
  place: 'space',
  weight: 6,
  reach: 125,
  thumb: { scale: 0.95 },
  draw(ctx, t) {
    ctx.save()
    ctx.rotate(-0.16 + Math.sin(t * 0.14) * 0.04)
    // The truss down the middle.
    roundRectPath(ctx, -104, -4, 208, 8, 2)
    shapeFill(ctx, '#9a958a', 1.8)
    ink(ctx, 1, withAlpha(INK, 0.35))
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 16, -4)
      ctx.lineTo(i * 16 + 8, 4)
      ctx.stroke()
    }
    // Four pairs of solar wings, each tilted a little differently.
    for (let i = 0; i < 4; i++) {
      const px = -78 + i * 52
      for (const side of [-1, 1]) {
        ctx.save()
        ctx.translate(px, side * 6)
        ctx.rotate(side * (0.12 + Math.sin(t * 0.2 + i) * 0.03))
        roundRectPath(ctx, -22, side > 0 ? 0 : -34, 44, 34, 1.5)
        ctx.fillStyle = '#4a4a6a'
        ctx.fill()
        ink(ctx, 1.4, withAlpha(INK, 0.5))
        ctx.stroke()
        // Cell divisions, and a hint of sky reflected in them.
        ink(ctx, 0.8, withAlpha('#8fa8d0', 0.4))
        for (let c = 1; c < 5; c++) {
          ctx.beginPath()
          ctx.moveTo(-22 + c * 8.8, side > 0 ? 1 : -33)
          ctx.lineTo(-22 + c * 8.8, side > 0 ? 33 : -1)
          ctx.stroke()
        }
        ctx.restore()
      }
    }
    // Pressurised modules, strung along the middle in a cross.
    const mods: [number, number, number, number][] = [
      [-46, -13, 44, 26],
      [4, -13, 52, 26],
      [-10, -50, 26, 34],
      [-10, 16, 26, 34],
    ]
    for (const [mx, my, mw, mh] of mods) {
      roundRectPath(ctx, mx, my, mw, mh, 12)
      shapeFill(ctx, '#ddd6c4', 2)
      // Ribs.
      ink(ctx, 1, withAlpha(INK, 0.28))
      for (let c = 1; c < 3; c++) {
        ctx.beginPath()
        ctx.moveTo(mx + (mw / 3) * c, my + 2)
        ctx.lineTo(mx + (mw / 3) * c, my + mh - 2)
        ctx.stroke()
      }
    }
    // A cupola of windows on the underside, with somebody at it.
    ctx.beginPath()
    ctx.arc(3, 50, 11, 0, TAU)
    shapeFill(ctx, '#c9c2b0', 1.8)
    ctx.beginPath()
    ctx.arc(3, 50, 7.5, 0, TAU)
    shapeFill(ctx, withAlpha('#3a4a68', 0.9), 1.4)
    ctx.beginPath()
    ctx.arc(1, 48, 2.6, 0, TAU)
    ctx.fillStyle = withAlpha(CREAM, 0.5)
    ctx.fill()
    // A docked ferry at one end.
    roundRectPath(ctx, 58, -9, 26, 18, 6)
    shapeFill(ctx, '#c8ccd2', 1.8)
    ctx.beginPath()
    ctx.moveTo(84, -6)
    ctx.lineTo(94, 0)
    ctx.lineTo(84, 6)
    ctx.closePath()
    shapeFill(ctx, '#a8acb4', 1.4)
    ctx.restore()
    // A single beacon, blinking.
    glowDot(ctx, 96, -22, 2.4 + Math.abs(Math.sin(t * 1.4)) * 1.2, '#e0564a', 6)
  },
}

const ROVER_PORTRAIT: EasterEgg = {
  id: 'rover-portrait',
  title: 'A Rover Taking Its Own Portrait',
  note: 'Six wheels, one long arm, and a camera held out to get the whole of itself in.',
  place: 'surface',
  biomes: ['rocky', 'desert', 'ice'],
  weight: 7,
  reach: 52,
  thumb: { scale: 1.35 },
  draw(ctx, t) {
    // Wheel tracks running back out of frame.
    ink(ctx, 1.4, withAlpha(INK, 0.28))
    for (let i = 0; i < 9; i++) {
      const x = -34 - i * 10
      ctx.beginPath()
      ctx.moveTo(x, -2)
      ctx.lineTo(x + 4, -2)
      ctx.moveTo(x, -6)
      ctx.lineTo(x + 4, -6)
      ctx.stroke()
    }
    // Six wheels with cleats.
    for (const wx of [-24, -6, 20]) {
      for (const off of [0, 3]) {
        ctx.beginPath()
        ctx.arc(wx + off, -7, 7, 0, TAU)
        shapeFill(ctx, off ? '#5f5a62' : '#4f4a52', 1.6)
      }
      ink(ctx, 1, withAlpha(CREAM, 0.35))
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + t * 0.4
        ctx.beginPath()
        ctx.moveTo(wx + Math.cos(a) * 3, -7 + Math.sin(a) * 3)
        ctx.lineTo(wx + Math.cos(a) * 6.5, -7 + Math.sin(a) * 6.5)
        ctx.stroke()
      }
    }
    // Rocker-bogie linkage.
    ink(ctx, 2.4, '#8a8478')
    ctx.beginPath()
    ctx.moveTo(-24, -7)
    ctx.lineTo(-14, -20)
    ctx.lineTo(-6, -7)
    ctx.moveTo(-14, -20)
    ctx.lineTo(14, -20)
    ctx.lineTo(20, -7)
    ctx.stroke()
    // Deck.
    roundRectPath(ctx, -20, -32, 42, 13, 2)
    shapeFill(ctx, '#c9c2b0', 2)
    // A power unit at the back with fins.
    roundRectPath(ctx, -30, -34, 12, 10, 2)
    shapeFill(ctx, '#8a8478', 1.6)
    ink(ctx, 1.2, '#6f6a62')
    for (const fy of [-32, -29, -26]) {
      ctx.beginPath()
      ctx.moveTo(-31, fy)
      ctx.lineTo(-17, fy)
      ctx.stroke()
    }
    // Mast and head, with two eyes.
    ink(ctx, 2.6, '#a8a29a')
    ctx.beginPath()
    ctx.moveTo(14, -32)
    ctx.lineTo(14, -52)
    ctx.stroke()
    ctx.save()
    ctx.translate(14, -54)
    ctx.rotate(Math.sin(t * 0.4) * 0.25)
    roundRectPath(ctx, -9, -5, 18, 9, 2)
    shapeFill(ctx, '#c9c2b0', 1.6)
    for (const ex of [-4, 4]) {
      ctx.beginPath()
      ctx.arc(ex, 0, 2.4, 0, TAU)
      shapeFill(ctx, '#3a4a5a', 1.1)
    }
    ctx.restore()
    // The arm, held out with a camera on the end, pointing back at the rover.
    const reach = 0.1 + Math.sin(t * 0.3) * 0.06
    ctx.save()
    ctx.translate(20, -26)
    ctx.rotate(-0.5 + reach)
    ink(ctx, 3, '#a8a29a')
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(26, 0)
    ctx.stroke()
    ctx.save()
    ctx.translate(26, 0)
    ctx.rotate(1.9)
    ink(ctx, 2.6, '#a8a29a')
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(18, 0)
    ctx.stroke()
    roundRectPath(ctx, 16, -5, 9, 10, 2)
    shapeFill(ctx, '#8a8478', 1.4)
    ctx.beginPath()
    ctx.arc(20.5, 0, 2.6, 0, TAU)
    shapeFill(ctx, '#2f3a4a', 1.1)
    // A flash, occasionally.
    if (Math.sin(t * 0.8) > 0.97) glowDot(ctx, 20.5, 0, 4, CREAM, 5)
    ctx.restore()
    ctx.restore()
  },
}

const STONE_HEADS: EasterEgg = {
  id: 'stone-heads',
  title: 'The Ones Who Face Inland',
  note: 'Long noses, heavy brows, and their backs deliberately turned to the sea.',
  place: 'surface',
  biomes: ['rocky', 'meadow', 'ocean'],
  weight: 6,
  reach: 78,
  thumb: { scale: 1 },
  draw(ctx, _t) {
    void _t
    // Four heads in a line, receding a little to the right.
    const heads = [
      { x: -54, s: 1.05 },
      { x: -16, s: 0.95 },
      { x: 18, s: 0.85 },
      { x: 48, s: 0.72 },
    ]
    for (const hd of heads) {
      ctx.save()
      ctx.translate(hd.x, 0)
      ctx.scale(hd.s, hd.s)
      // A buried plinth.
      ctx.beginPath()
      ctx.ellipse(0, 0, 17, 5, 0, Math.PI, TAU)
      ctx.closePath()
      shapeFill(ctx, '#7d786e', 1.6)
      // The head: a long block, wider at the jaw, flat on top.
      ctx.beginPath()
      ctx.moveTo(-14, -2)
      ctx.lineTo(-13, -50)
      ctx.quadraticCurveTo(-12, -58, -3, -58)
      ctx.lineTo(9, -57)
      ctx.quadraticCurveTo(15, -56, 14, -48)
      ctx.lineTo(13, -2)
      ctx.closePath()
      shapeFill(ctx, '#8f8a80', 2.2)
      // Brow, nose, and a very long chin.
      ink(ctx, 2.4, withAlpha(INK, 0.4))
      ctx.beginPath()
      ctx.moveTo(-11, -44)
      ctx.quadraticCurveTo(0, -48, 12, -43)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(1, -42)
      ctx.lineTo(3, -24)
      ctx.lineTo(-3, -23)
      ctx.stroke()
      // Eye sockets, in deep shadow.
      ctx.fillStyle = withAlpha(INK, 0.35)
      for (const ex of [-7, 8]) {
        ctx.beginPath()
        ctx.ellipse(ex, -38, 3.4, 2.4, 0, 0, TAU)
        ctx.fill()
      }
      // A flat mouth, unimpressed.
      ink(ctx, 2, withAlpha(INK, 0.4))
      ctx.beginPath()
      ctx.moveTo(-6, -16)
      ctx.lineTo(7, -16)
      ctx.stroke()
      // A hat of red stone on one of them.
      if (hd.s > 1) {
        roundRectPath(ctx, -10, -68, 20, 11, 3)
        shapeFill(ctx, '#a8523c', 1.8)
      }
      ctx.restore()
    }
  },
}

const STANDING_STONES: EasterEgg = {
  id: 'standing-stones',
  title: 'A Ring of Standing Stones',
  note: 'Set out to catch one particular sunrise, by people who counted very carefully.',
  place: 'surface',
  biomes: ['meadow', 'rocky', 'desert'],
  weight: 6,
  reach: 84,
  thumb: { scale: 0.9 },
  draw(ctx, t) {
    // The ring in perspective: back stones smaller and higher.
    const stones: { x: number; y: number; w: number; h: number; lintel: boolean }[] = []
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i / 8) * Math.PI
      const depth = (Math.sin(a) + 1) / 2
      stones.push({
        x: Math.cos(a) * 84,
        y: -18 + depth * 16,
        w: 11 + depth * 4,
        h: 34 + depth * 16,
        lintel: i % 2 === 0 && i < 8,
      })
    }
    // Draw far ones first.
    stones.sort((a, b) => a.y - b.y)
    for (let i = 0; i < stones.length; i++) {
      const s = stones[i]
      const shadeAmt = 0.36 - (s.y + 18) / 16 * 0.16
      roundRectPath(ctx, s.x - s.w / 2, s.y - s.h, s.w, s.h, 2)
      shapeFill(ctx, mix('#9a958a', '#5a6a78', shadeAmt), 2)
      // A trilithon lintel bridging to the next stone along.
      const next = stones[i + 1]
      if (s.lintel && next && Math.abs(next.x - s.x) < 46 && Math.abs(next.y - s.y) < 5) {
        roundRectPath(
          ctx,
          Math.min(s.x, next.x) - 6,
          Math.min(s.y - s.h, next.y - next.h) - 8,
          Math.abs(next.x - s.x) + 12,
          9,
          2,
        )
        shapeFill(ctx, mix('#a8a29a', '#5a6a78', shadeAmt), 1.8)
      }
    }
    // A sunrise sighted exactly down the axis.
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const g = ctx.createRadialGradient(0, -18, 2, 0, -18, 60)
    g.addColorStop(0, withAlpha('#f6c76a', 0.4 + Math.sin(t * 0.5) * 0.06))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, -18, 60, 0, TAU)
    ctx.fill()
    ctx.restore()
    // A worn path leading in.
    ctx.beginPath()
    ctx.ellipse(0, -2, 40, 7, 0, 0, TAU)
    ctx.fillStyle = withAlpha('#a8956e', 0.35)
    ctx.fill()
  },
}

const DESERT_LINES: EasterEgg = {
  id: 'desert-lines',
  title: 'Lines Drawn for the Sky',
  note: 'A bird a hundred paces across, scratched into the stones for an audience overhead.',
  place: 'surface',
  biomes: ['desert', 'rocky'],
  weight: 6,
  reach: 96,
  thumb: { scale: 0.9 },
  draw(ctx, t) {
    // Seen from a ridge, so squashed hard and drawn as pale trenches.
    ctx.save()
    ctx.translate(0, -8)
    ctx.scale(1, 0.3)
    ink(ctx, 5, withAlpha('#e8dcc0', 0.75))
    ctx.lineJoin = 'round'
    // A hummingbird: long beak, slim body, two swept wings, forked tail.
    ctx.beginPath()
    ctx.moveTo(-96, 0)
    ctx.lineTo(-34, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-34, -7)
    ctx.lineTo(20, -7)
    ctx.lineTo(20, 7)
    ctx.lineTo(-34, 7)
    ctx.closePath()
    ctx.stroke()
    // Wings.
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(-14, side * 7)
      ctx.lineTo(30, side * 62)
      ctx.lineTo(48, side * 56)
      ctx.lineTo(2, side * 7)
      ctx.closePath()
      ctx.stroke()
    }
    // Forked tail.
    ctx.beginPath()
    ctx.moveTo(20, -7)
    ctx.lineTo(74, -22)
    ctx.moveTo(20, 7)
    ctx.lineTo(74, 22)
    ctx.moveTo(20, 0)
    ctx.lineTo(66, 0)
    ctx.stroke()
    ctx.restore()
    // Loose stones piled beside the trenches.
    ctx.fillStyle = withAlpha('#8a7a62', 0.5)
    for (let i = 0; i < 24; i++) {
      const rng = scatter(i * 271)
      ctx.beginPath()
      ctx.arc(rng.range(-100, 90), rng.range(-24, 2), rng.range(1.2, 3), 0, TAU)
      ctx.fill()
    }
    // Something circling, a long way up, appreciating it.
    const a = t * 0.35
    ctx.save()
    ctx.translate(Math.cos(a) * 60, -78 + Math.sin(a) * 12)
    ctx.rotate(Math.sin(a) * 0.3)
    ink(ctx, 1.8, withAlpha(INK, 0.45))
    ctx.beginPath()
    ctx.moveTo(-9, 0)
    ctx.quadraticCurveTo(-4, -4, 0, 0)
    ctx.quadraticCurveTo(4, -4, 9, 0)
    ctx.stroke()
    ctx.restore()
  },
}

const INVISIBLE_FOOTPRINTS: EasterEgg = {
  id: 'invisible-footprints',
  title: 'Footprints With Nobody In Them',
  note: 'Fresh, evenly spaced, still filling in. They stop in the middle of nowhere.',
  place: 'surface',
  biomes: ['desert', 'ice'],
  weight: 6,
  reach: 66,
  thumb: { scale: 1.15 },
  draw(ctx, t) {
    // A trail of prints, the newest ones deepest.
    for (let i = 0; i < 10; i++) {
      const p = i / 9
      const x = -78 + i * 17
      const y = -1 + (i % 2) * 4
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(0.15 + (i % 2) * -0.3)
      ctx.beginPath()
      ctx.ellipse(0, 0, 6, 3.4, 0, 0, TAU)
      ctx.fillStyle = withAlpha(INK, 0.14 + p * 0.3)
      ctx.fill()
      // A pale lip of displaced ground, so a print reads on sand or on snow.
      ink(ctx, 1.2, withAlpha(CREAM, 0.16 + p * 0.24))
      ctx.stroke()
      // The heel, and five small dents at the front.
      ctx.beginPath()
      ctx.ellipse(-4, 0, 2.6, 2.4, 0, 0, TAU)
      ctx.fillStyle = withAlpha(INK, 0.14 + p * 0.24)
      ctx.fill()
      for (let d = 0; d < 4; d++) {
        ctx.beginPath()
        ctx.arc(4 + (d % 2) * 1.4, -2 + d * 1.3, 0.8, 0, TAU)
        ctx.fill()
      }
      ctx.restore()
    }
    // The next one appearing while you watch.
    const step = (t * 0.6) % 1
    ctx.save()
    ctx.translate(96, -1)
    ctx.rotate(0.15)
    ctx.beginPath()
    ctx.ellipse(0, 0, 6 * Math.min(1, step * 3), 3.4 * Math.min(1, step * 3), 0, 0, TAU)
    ctx.fillStyle = withAlpha(INK, 0.34 * Math.min(1, step * 3))
    ctx.fill()
    ctx.restore()
    // A puff of dust kicked up by nothing at all.
    smoke(ctx, 96, -4, t * 1.6, 3, '#d8bd92', 16, 5)
    // A pair of goggles, dropped, because they weren't working either.
    ctx.save()
    ctx.translate(30, -3)
    ctx.rotate(0.3)
    ink(ctx, 1.8, '#6b5a48')
    ctx.beginPath()
    ctx.moveTo(-8, 0)
    ctx.lineTo(8, 0)
    ctx.stroke()
    for (const gx of [-5, 5]) {
      ctx.beginPath()
      ctx.arc(gx, 0, 3.4, 0, TAU)
      shapeFill(ctx, withAlpha('#9fd0e0', 0.6), 1.4)
    }
    ctx.restore()
  },
}

const BRASS_CIRCLES: EasterEgg = {
  id: 'brass-circles',
  title: 'A Cage of Brass Circles',
  note: 'Rings inside rings, each labelled with something, all of them still turning.',
  place: 'space',
  weight: 6,
  reach: 110,
  thumb: { scale: 1.5 },
  draw(ctx, t) {
    ctx.save()
    ctx.rotate(0.2)
    // Outer meridian ring, on a stand.
    ink(ctx, 3.4, '#c9a45c')
    ctx.beginPath()
    ctx.arc(0, 0, 44, 0, TAU)
    ctx.stroke()
    // Graduations around it.
    ink(ctx, 1.2, withAlpha('#8a6a2c', 0.8))
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * TAU
      const inner = i % 3 === 0 ? 38 : 41
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner)
      ctx.lineTo(Math.cos(a) * 44, Math.sin(a) * 44)
      ctx.stroke()
    }
    // Two inner rings on different axes, both turning.
    for (const [i, tilt] of [
      [0, 0.5],
      [1, -0.7],
    ] as const) {
      ctx.save()
      ctx.rotate(tilt + t * (i === 0 ? 0.28 : -0.19))
      ink(ctx, 2.6, i === 0 ? '#e8c45c' : '#b8933c')
      ctx.beginPath()
      ctx.ellipse(0, 0, 34 - i * 9, (34 - i * 9) * (0.3 + Math.abs(Math.sin(t * 0.4 + i)) * 0.5), 0, 0, TAU)
      ctx.stroke()
      ctx.restore()
    }
    // The little world at the centre, and a bead going round it.
    ctx.beginPath()
    ctx.arc(0, 0, 7, 0, TAU)
    shapeFill(ctx, '#5f8aa8', 1.6)
    ctx.beginPath()
    ctx.arc(-2, -2, 3, 0, TAU)
    ctx.fillStyle = withAlpha(CREAM, 0.4)
    ctx.fill()
    const ba = t * 0.9
    ctx.beginPath()
    ctx.arc(Math.cos(ba) * 20, Math.sin(ba) * 8, 2.6, 0, TAU)
    shapeFill(ctx, '#efe4c4', 1.1)
    // The stand, cut off at the frame edge.
    ink(ctx, 3.4, '#a8823c')
    ctx.beginPath()
    ctx.moveTo(-14, 42)
    ctx.lineTo(0, 62)
    ctx.lineTo(14, 42)
    ctx.moveTo(0, 62)
    ctx.lineTo(0, 74)
    ctx.stroke()
    ctx.restore()
    sparkle(ctx, 40, -34, 6 + Math.sin(t * 2) * 2, withAlpha(CREAM, 0.6))
  },
}

export const ORBIT_EGGS: readonly EasterEgg[] = [
  OCEAN_LIGHT,
  FIRST_FOOTPRINTS,
  PERFECT_CIRCLES,
  GOLDEN_RECORD,
  PALE_BLUE_DOT,
  FOLDED_TELESCOPE,
  BEEPING_SPHERE,
  MODULAR_STATION,
  ROVER_PORTRAIT,
  STONE_HEADS,
  STANDING_STONES,
  DESERT_LINES,
  INVISIBLE_FOOTPRINTS,
  BRASS_CIRCLES,
]
