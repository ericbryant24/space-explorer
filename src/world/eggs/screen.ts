/**
 * Curiosities that rhyme with films and television.
 *
 * Original silhouettes and shape studies, titled descriptively. See `kit.ts`
 * for the drawing conventions and the shared helpers.
 */

import { TAU } from '../../core/math'
import { Rng } from '../../core/rng'
import { CREAM, HUES, INK, withAlpha } from '../../render/palette'
import { blobPath, ink, roundRectPath, starPath, leafPath } from '../../render/shapes'
import { type EasterEgg, figure, sun, shapeFill, glowDot, smoke, brickWall, fence, ripples, windows, scatter } from './kit'

const TALL_SLAB: EasterEgg = {
  id: 'tall-slab',
  title: 'The Tall Black Slab',
  note: 'Perfectly smooth, perfectly still. Nobody remembers putting it here.',
  place: 'surface',
  biomes: ['rocky', 'ice', 'desert'],
  weight: 8,
  reach: 46,
  thumb: { scale: 1.25 },
  draw(ctx, t) {
    // Three small onlookers keeping a respectful distance.
    for (let i = 0; i < 3; i++) {
      const x = -30 - i * 13
      const bob = Math.sin(t * 1.4 + i) * 1.2
      figure(ctx, x, bob, 17 + i * 1.5, withAlpha(INK, 0.68), Math.sin(t * 0.8 + i) * 0.04)
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
  thumb: { scale: 1.9 },
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
  thumb: { scale: 0.95 },
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
  thumb: { scale: 1.25 },
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

const BLUE_BOOTH: EasterEgg = {
  id: 'blue-booth',
  title: 'The Blue Wooden Booth',
  note: 'Taller inside than out, which is rude of it. It hums when you get close.',
  place: 'surface',
  weight: 4,
  reach: 42,
  thumb: { scale: 1.6 },
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

const LONG_LEGGED_WALKER: EasterEgg = {
  id: 'long-legged-walker',
  title: 'The Long-Legged Walker',
  note: 'Three legs, no hurry. It has been crossing this plain for a long time.',
  place: 'surface',
  biomes: ['rocky', 'desert', 'volcanic'],
  weight: 5,
  reach: 90,
  thumb: { scale: 1.2 },
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

const CUBE_COLLECTOR: EasterEgg = {
  id: 'cube-collector',
  title: 'The Little Cube Collector',
  note: 'It has stacked these neatly for years. In one boot: a single green shoot.',
  place: 'surface',
  biomes: ['rocky', 'desert', 'volcanic'],
  weight: 7,
  reach: 44,
  thumb: { scale: 1.5 },
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
  thumb: { scale: 1.05 },
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
  thumb: { scale: 1.15 },
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
  thumb: { scale: 1.4 },
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
  thumb: { scale: 1.5 },
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
  thumb: { scale: 1.35 },
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
    for (let i = 0; i < 4; i++) {
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

const FACE_IN_THE_MOON: EasterEgg = {
  id: 'face-in-the-moon',
  title: 'The Face in the Moon',
  note: 'It is squinting. There appears to be a small rocket lodged in its eye.',
  place: 'space',
  weight: 6,
  reach: 130,
  thumb: { scale: 1.15 },
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

const RING_STATION: EasterEgg = {
  id: 'ring-station',
  title: 'The Slowly Turning Ring',
  note: 'A wheel of windows, spinning just fast enough to have a floor.',
  place: 'space',
  weight: 6,
  reach: 130,
  thumb: { scale: 1.5 },
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
  thumb: { scale: 1.1 },
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

const HOUSE_THAT_FLEW: EasterEgg = {
  id: 'house-that-flew',
  title: 'The House That Flew',
  note: 'One small house, several thousand balloons, and a promise finally being kept.',
  place: 'space',
  weight: 5,
  reach: 140,
  thumb: { scale: 1.05 },
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

const CHEESE_MOON: EasterEgg = {
  id: 'cheese-moon',
  title: 'The Moon Made of Cheese',
  note: 'Somebody came a very long way to check, and brought crackers.',
  place: 'space',
  weight: 5,
  reach: 120,
  thumb: { scale: 1.5 },
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

const WALKING_HOUSE: EasterEgg = {
  id: 'walking-house',
  title: 'The House That Walks',
  note: 'It stops when you look at it. The chimney keeps smoking either way.',
  place: 'surface',
  biomes: ['meadow', 'forest', 'rocky'],
  weight: 5,
  reach: 72,
  thumb: { scale: 1.15 },
  draw(ctx, t) {
    const gait = t * 1.5
    const lift = Math.abs(Math.sin(gait)) * 3
    // Two scaly legs with backward knees, out of phase.
    for (let i = 0; i < 2; i++) {
      const ph = gait + i * Math.PI
      const side = i === 0 ? -1 : 1
      const footX = side * 11 + Math.sin(ph) * 13
      const footY = -Math.abs(Math.sin(ph)) * 8
      ink(ctx, 4.5, '#a8834f')
      ctx.beginPath()
      ctx.moveTo(side * 9, -30)
      ctx.lineTo(side * 15 + Math.sin(ph) * 5, -16)
      ctx.lineTo(footX, footY)
      ctx.stroke()
      ink(ctx, 2.2, '#a8834f')
      for (const toe of [-5, 0, 5]) {
        ctx.beginPath()
        ctx.moveTo(footX, footY)
        ctx.lineTo(footX + toe, footY + 3)
        ctx.stroke()
      }
    }
    ctx.save()
    ctx.translate(0, -lift)
    ctx.rotate(Math.sin(gait) * 0.03 - 0.04)
    // Body, deliberately out of square.
    ctx.beginPath()
    ctx.moveTo(-25, -30)
    ctx.lineTo(24, -33)
    ctx.lineTo(26, -66)
    ctx.lineTo(-23, -62)
    ctx.closePath()
    shapeFill(ctx, '#c2a878', 2.2)
    ink(ctx, 1.2, withAlpha(INK, 0.3))
    ctx.beginPath()
    ctx.moveTo(-24, -45)
    ctx.lineTo(25, -47)
    ctx.stroke()
    // Roof, too big for it.
    ctx.beginPath()
    ctx.moveTo(-32, -62)
    ctx.lineTo(2, -88)
    ctx.lineTo(34, -66)
    ctx.closePath()
    shapeFill(ctx, '#8a5a4a', 2.2)
    // One big lit window and a smaller one squinting.
    ctx.beginPath()
    ctx.arc(-8, -48, 8, 0, TAU)
    shapeFill(ctx, withAlpha('#f6dd9c', 0.9), 1.8)
    ctx.beginPath()
    ctx.arc(14, -46, 4.5, 0, TAU)
    shapeFill(ctx, withAlpha('#f6dd9c', 0.55), 1.5)
    roundRectPath(ctx, 12, -96, 9, 16, 1.5)
    shapeFill(ctx, '#8a6a52', 1.8)
    smoke(ctx, 16, -98, t, 4, CREAM, 34, 7)
    ctx.restore()
  },
}

const SILVER_CAR: EasterEgg = {
  id: 'silver-car',
  title: 'A Silver Car Going Nowhere',
  note: 'Doors up like wings, two burnt stripes behind it, and nobody at the wheel.',
  place: 'surface',
  biomes: ['desert', 'rocky'],
  weight: 6,
  reach: 52,
  thumb: { scale: 1.5 },
  draw(ctx, t) {
    // Two scorched tracks trailing off out of frame.
    ink(ctx, 3, withAlpha('#b5561f', 0.45))
    for (const off of [-6, 6]) {
      ctx.beginPath()
      ctx.moveTo(-34 + off, -2)
      ctx.lineTo(-104 + off, -2)
      ctx.stroke()
    }
    for (const wx of [-17, 17]) {
      ctx.beginPath()
      ctx.arc(wx, -6, 6, 0, TAU)
      shapeFill(ctx, '#3d3a40', 1.6)
    }
    // Wedge body.
    ctx.beginPath()
    ctx.moveTo(-30, -6)
    ctx.lineTo(-26, -16)
    ctx.lineTo(20, -18)
    ctx.lineTo(30, -8)
    ctx.lineTo(28, -4)
    ctx.lineTo(-28, -4)
    ctx.closePath()
    shapeFill(ctx, '#c9ccd2', 2)
    // Gull-wing doors, up, breathing very slightly.
    for (const side of [-1, 1]) {
      ctx.save()
      ctx.translate(side * 6, -17)
      ctx.rotate(side * (-1.05 + Math.sin(t * 0.8) * 0.03))
      roundRectPath(ctx, 0, -3.5, 22, 7, 2)
      shapeFill(ctx, '#b8bcc4', 1.8)
      ctx.restore()
    }
    ctx.beginPath()
    ctx.moveTo(-20, -17)
    ctx.lineTo(-14, -24)
    ctx.lineTo(6, -24)
    ctx.lineTo(10, -18)
    ctx.closePath()
    shapeFill(ctx, withAlpha('#9fd0e0', 0.75), 1.6)
    // Something bolted to the back that shouldn't be there, still warm.
    roundRectPath(ctx, 21, -17, 11, 10, 2)
    shapeFill(ctx, '#8d8a94', 1.5)
    glowDot(ctx, 26.5, -12, 2.4, '#7fd4f0', 6)
  },
}

const ORIGAMI_UNICORN: EasterEgg = {
  id: 'origami-unicorn',
  title: 'A Unicorn Folded From Paper',
  note: 'Left on a wet railing by somebody who knew what you were going to ask.',
  place: 'surface',
  biomes: ['rocky', 'crystal'],
  weight: 5,
  reach: 34,
  thumb: { scale: 2.6 },
  draw(ctx, t) {
    // A puddle catching two colours of light that aren't from here.
    ctx.beginPath()
    ctx.ellipse(6, -1, 30, 6, 0, 0, TAU)
    ctx.fillStyle = withAlpha('#20303c', 0.7)
    ctx.fill()
    for (const [ox, col] of [
      [-8, '#e0567a'],
      [16, '#4fc8e8'],
    ] as const) {
      ctx.beginPath()
      ctx.ellipse(ox, -1, 9, 3, 0, 0, TAU)
      ctx.fillStyle = withAlpha(col, 0.32 + Math.sin(t * 3 + ox) * 0.08)
      ctx.fill()
    }
    ink(ctx, 2.4, '#6b6a72')
    ctx.beginPath()
    ctx.moveTo(-34, -1)
    ctx.lineTo(-34, -20)
    ctx.moveTo(34, -1)
    ctx.lineTo(34, -20)
    ctx.moveTo(-38, -20)
    ctx.lineTo(38, -20)
    ctx.stroke()
    // The unicorn: hard folds, no curves anywhere.
    ctx.save()
    ctx.translate(0, -25)
    const pale = '#efe6d2'
    ctx.beginPath()
    ctx.moveTo(-9, 0)
    ctx.lineTo(-6, -8)
    ctx.lineTo(6, -9)
    ctx.lineTo(9, 0)
    ctx.closePath()
    shapeFill(ctx, pale, 1.2)
    ctx.beginPath()
    ctx.moveTo(4, -8)
    ctx.lineTo(9, -19)
    ctx.lineTo(14, -17)
    ctx.lineTo(11, -12)
    ctx.lineTo(15, -12)
    ctx.lineTo(9, -6)
    ctx.closePath()
    shapeFill(ctx, '#e4d9c2', 1.2)
    ctx.beginPath()
    ctx.moveTo(12, -18)
    ctx.lineTo(19, -23)
    ctx.lineTo(13, -20)
    ctx.closePath()
    shapeFill(ctx, pale, 1)
    ctx.beginPath()
    ctx.moveTo(-8, -7)
    ctx.lineTo(-15, -13)
    ctx.lineTo(-11, -4)
    ctx.closePath()
    shapeFill(ctx, '#e4d9c2', 1)
    ink(ctx, 1.6, INK)
    for (const lx of [-6, -2, 3, 7]) {
      ctx.beginPath()
      ctx.moveTo(lx, 0)
      ctx.lineTo(lx, 5)
      ctx.stroke()
    }
    ctx.restore()
  },
}

const BALL_WITH_A_FACE: EasterEgg = {
  id: 'ball-with-a-face',
  title: 'A Ball With a Face Drawn On It',
  note: 'Somebody talked to this for a very long time, and it listened to all of it.',
  place: 'surface',
  biomes: ['ocean'],
  weight: 6,
  reach: 40,
  thumb: { scale: 2 },
  draw(ctx, t) {
    ink(ctx, 3.4, '#9a8468')
    ctx.beginPath()
    ctx.moveTo(-34, -3)
    ctx.quadraticCurveTo(-14, -8, 8, -3)
    ctx.stroke()
    ctx.save()
    ctx.translate(-2, -13)
    ctx.rotate(Math.sin(t * 0.5) * 0.06)
    ctx.beginPath()
    ctx.arc(0, 0, 12, 0, TAU)
    shapeFill(ctx, '#e9e3d4', 2)
    ink(ctx, 1.3, withAlpha(INK, 0.3))
    ctx.beginPath()
    ctx.arc(-3, 0, 11, -1.1, 1.1)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(3, 0, 11, Math.PI - 1.1, Math.PI + 1.1)
    ctx.stroke()
    // A face, drawn in something red, not carefully.
    ink(ctx, 1.8, '#b8503c')
    for (const ex of [-4.5, 4.5]) {
      ctx.beginPath()
      ctx.moveTo(ex - 1.6, -5)
      ctx.lineTo(ex + 1.6, -1.5)
      ctx.moveTo(ex + 1.6, -5)
      ctx.lineTo(ex - 1.6, -1.5)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(-5, 4)
    ctx.quadraticCurveTo(0, 8, 5, 4)
    ctx.stroke()
    // A tuft of dried grass for hair.
    ink(ctx, 1.6, '#8a9a6a')
    for (const a of [-0.5, -0.1, 0.35]) {
      ctx.beginPath()
      ctx.moveTo(Math.sin(a) * 7, -10)
      ctx.lineTo(Math.sin(a) * 12, -19)
      ctx.stroke()
    }
    ctx.restore()
    // Footprints leading away, and not coming back.
    ctx.fillStyle = withAlpha(INK, 0.22)
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.ellipse(16 + i * 9, -2 + (i % 2) * 3, 4, 2.2, 0.2, 0, TAU)
      ctx.fill()
    }
  },
}

const BENCH_AND_CHOCOLATES: EasterEgg = {
  id: 'bench-and-chocolates',
  title: 'A Bench, and a Box of Chocolates',
  note: 'Nobody sitting on it. The box is open, and one of them is missing.',
  place: 'surface',
  biomes: ['meadow', 'forest'],
  weight: 6,
  reach: 46,
  thumb: { scale: 1.5 },
  draw(ctx, t) {
    ink(ctx, 2.6, '#5f6a58')
    for (const lx of [-26, 26]) {
      ctx.beginPath()
      ctx.moveTo(lx, 0)
      ctx.lineTo(lx, -32)
      ctx.stroke()
    }
    for (const sy of [-14, -19]) {
      roundRectPath(ctx, -30, sy - 2, 60, 4, 1.5)
      shapeFill(ctx, '#a8814f', 1.4)
    }
    for (const sy of [-25, -31]) {
      roundRectPath(ctx, -30, sy - 2, 60, 4, 1.5)
      shapeFill(ctx, '#9a7548', 1.4)
    }
    // The box, open, on the seat.
    ctx.save()
    ctx.translate(10, -19)
    roundRectPath(ctx, -9, -5, 18, 5, 1)
    shapeFill(ctx, '#8a4a5a', 1.3)
    ctx.save()
    ctx.rotate(-0.5)
    roundRectPath(ctx, -8, -8, 16, 3, 1)
    shapeFill(ctx, '#a25c6c', 1.2)
    ctx.restore()
    for (let i = 0; i < 4; i++) {
      if (i === 2) continue
      ctx.beginPath()
      ctx.arc(-6 + i * 4, -3.5, 1.6, 0, TAU)
      ctx.fillStyle = '#5b3a2e'
      ctx.fill()
    }
    ctx.restore()
    // A feather, taking its time coming down.
    const fy = -66 + ((t * 9) % 62)
    ctx.save()
    ctx.translate(-36 + Math.sin(fy * 0.1) * 7, fy)
    ctx.rotate(Math.sin(fy * 0.09) * 0.6)
    leafPath(ctx, 0, 0, 11, 3.4, -1.5)
    shapeFill(ctx, withAlpha(CREAM, 0.9), 1)
    ctx.restore()
  },
}

const TRAIN_ON_WATER: EasterEgg = {
  id: 'train-on-water',
  title: 'The Train That Crosses the Shallows',
  note: 'One set of rails, just under the surface, and only one direction of travel.',
  place: 'surface',
  biomes: ['ocean'],
  weight: 6,
  reach: 100,
  thumb: { scale: 0.85 },
  draw(ctx, t) {
    // Rails running away to a point, a hair under the waterline.
    ink(ctx, 1.8, withAlpha('#2f4a58', 0.6))
    ctx.beginPath()
    ctx.moveTo(-130, -3)
    ctx.lineTo(130, -6)
    ctx.moveTo(-130, 1)
    ctx.lineTo(130, -2)
    ctx.stroke()
    for (let i = 0; i < 14; i++) {
      const x = -130 + i * 19
      ink(ctx, 2, withAlpha('#3a3028', 0.4))
      ctx.beginPath()
      ctx.moveTo(x, -4)
      ctx.lineTo(x + 3, 2)
      ctx.stroke()
    }
    const drift = Math.sin(t * 0.4) * 10
    ctx.save()
    ctx.translate(drift, -4)
    // Carriages, back to front.
    for (let i = 2; i >= 0; i--) {
      const cx = -20 - i * 46
      roundRectPath(ctx, cx - 21, -26, 42, 22, 3)
      shapeFill(ctx, i % 2 === 0 ? '#4a5560' : '#54606c', 2)
      windows(ctx, cx - 16, -21, 4, 1, 7, 9, 2, 0x6b + i * 13)
      for (const wx of [-13, 13]) {
        ctx.beginPath()
        ctx.arc(cx + wx, -2, 3.4, 0, TAU)
        shapeFill(ctx, '#2f2c32', 1.2)
      }
    }
    roundRectPath(ctx, 4, -30, 40, 26, 4)
    shapeFill(ctx, '#3d4750', 2.2)
    ctx.beginPath()
    ctx.moveTo(44, -28)
    ctx.quadraticCurveTo(56, -22, 54, -4)
    ctx.lineTo(44, -4)
    ctx.closePath()
    shapeFill(ctx, '#333c44', 2)
    roundRectPath(ctx, 12, -45, 10, 16, 2)
    shapeFill(ctx, '#2f373e', 1.8)
    smoke(ctx, 17, -47, t, 5, '#c8c2b8', 42, 9)
    glowDot(ctx, 52, -14, 3, '#f6dd9c', 6)
    for (const wx of [12, 34]) {
      ctx.beginPath()
      ctx.arc(wx, -2, 4, 0, TAU)
      shapeFill(ctx, '#2f2c32', 1.3)
    }
    ctx.restore()
    ripples(ctx, drift + 20, 0, t, '#dff0f6', 2)
  },
}

const LANTERN_BATHHOUSE: EasterEgg = {
  id: 'lantern-bathhouse',
  title: 'The Lantern-Lit Bathhouse',
  note: 'Open all night, busy with guests, and not especially keen on visitors.',
  place: 'surface',
  biomes: ['ocean', 'fungal', 'forest'],
  weight: 5,
  reach: 80,
  thumb: { scale: 0.95 },
  draw(ctx, t) {
    // Three stacked tiers, each narrower, each with a flared roof.
    const tiers = [
      { w: 74, h: 26, y: 0 },
      { w: 60, h: 24, y: -34 },
      { w: 44, h: 22, y: -66 },
    ]
    for (let i = tiers.length - 1; i >= 0; i--) {
      const tr = tiers[i]
      roundRectPath(ctx, -tr.w / 2, tr.y - tr.h, tr.w, tr.h, 2)
      shapeFill(ctx, i === 0 ? '#8a4a3c' : '#9a5546', 2.2)
      windows(ctx, -tr.w / 2 + 5, tr.y - tr.h + 7, Math.max(2, Math.floor(tr.w / 14)), 1, 8, 10, 5, 0x51 + i * 29)
      ctx.beginPath()
      ctx.moveTo(-tr.w / 2 - 9, tr.y - tr.h)
      ctx.quadraticCurveTo(-tr.w / 2, tr.y - tr.h - 8, 0, tr.y - tr.h - 9)
      ctx.quadraticCurveTo(tr.w / 2, tr.y - tr.h - 8, tr.w / 2 + 9, tr.y - tr.h)
      ctx.quadraticCurveTo(0, tr.y - tr.h + 3, -tr.w / 2 - 9, tr.y - tr.h)
      ctx.closePath()
      shapeFill(ctx, '#3f4a52', 2)
    }
    ctx.beginPath()
    ctx.moveTo(-8, -88)
    ctx.lineTo(0, -100)
    ctx.lineTo(8, -88)
    ctx.closePath()
    shapeFill(ctx, '#3f4a52', 1.8)
    // A string of paper lanterns swinging out front.
    ink(ctx, 1, withAlpha(CREAM, 0.4))
    ctx.beginPath()
    ctx.moveTo(-52, -30)
    ctx.quadraticCurveTo(0, -14, 52, -30)
    ctx.stroke()
    for (let i = 0; i < 6; i++) {
      const p = i / 5
      const lx = -52 + p * 104
      const ly = -30 + Math.sin(p * Math.PI) * 16 + Math.sin(t * 1.4 + i) * 1.2
      ctx.beginPath()
      ctx.ellipse(lx, ly, 4, 5, 0, 0, TAU)
      shapeFill(ctx, withAlpha('#f0a05c', 0.92), 1.2)
      glowDot(ctx, lx, ly, 1.3, '#f6dd9c', 7)
    }
    smoke(ctx, -18, -92, t, 3, '#e8e2d2', 30, 8)
    smoke(ctx, 22, -70, t + 1.4, 3, '#e8e2d2', 26, 7)
  },
}

const PARKED_BROOM: EasterEgg = {
  id: 'parked-broom',
  title: 'A Broom, Parked',
  note: 'Leaning where somebody left it, with a black cat minding the handle.',
  place: 'surface',
  biomes: ['forest', 'meadow', 'fungal'],
  weight: 6,
  reach: 44,
  thumb: { scale: 1.6 },
  draw(ctx, t) {
    fence(ctx, -34, 34, 0, 26, '#8b6a52')
    ctx.save()
    ctx.translate(8, 0)
    ctx.rotate(0.34)
    ink(ctx, 3, '#7a5a3c')
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -44)
    ctx.stroke()
    ink(ctx, 1.6, '#b08c4c')
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, -6)
      ctx.lineTo(i * 1.9, 4 + Math.abs(i) * 0.6)
      ctx.stroke()
    }
    ink(ctx, 2, '#5f4a34')
    ctx.beginPath()
    ctx.moveTo(-3, -7)
    ctx.lineTo(3, -7)
    ctx.stroke()
    ctx.restore()
    // The cat, sitting on the rail with its tail going.
    ctx.save()
    ctx.translate(-16, -22)
    ctx.beginPath()
    ctx.moveTo(-8, 0)
    ctx.quadraticCurveTo(-9, -12, -2, -13)
    ctx.quadraticCurveTo(6, -14, 7, 0)
    ctx.closePath()
    shapeFill(ctx, '#2f2a34', 1.6)
    ctx.beginPath()
    ctx.arc(-2, -17, 6, 0, TAU)
    shapeFill(ctx, '#2f2a34', 1.6)
    for (const [ex, dir] of [
      [-6, -1],
      [2, 1],
    ] as const) {
      ctx.beginPath()
      ctx.moveTo(ex, -21)
      ctx.lineTo(ex + dir * 2, -27)
      ctx.lineTo(ex + dir * 4, -20)
      ctx.closePath()
      ctx.fillStyle = '#2f2a34'
      ctx.fill()
    }
    for (const ex of [-4.6, 0.6]) {
      ctx.beginPath()
      ctx.ellipse(ex, -17.5, 1.5, 2.1, 0, 0, TAU)
      ctx.fillStyle = '#e8c45c'
      ctx.fill()
    }
    ink(ctx, 2.6, '#2f2a34')
    ctx.beginPath()
    ctx.moveTo(6, -2)
    ctx.quadraticCurveTo(16, -4 + Math.sin(t * 2) * 5, 13, -14 + Math.sin(t * 2) * 4)
    ctx.stroke()
    ctx.restore()
  },
}

const ONE_TREE_UNDER_GLASS: EasterEgg = {
  id: 'one-tree-under-glass',
  title: 'One Tree, Under Glass',
  note: 'The last of something, kept going by a machine that waters it on a schedule.',
  place: 'surface',
  biomes: ['rocky', 'ice', 'crystal'],
  weight: 6,
  reach: 58,
  thumb: { scale: 1.25 },
  draw(ctx, t) {
    ctx.beginPath()
    ctx.arc(0, 0, 44, Math.PI, TAU)
    ctx.closePath()
    ctx.fillStyle = withAlpha('#bfe0ee', 0.2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(0, 0, 30, 6, 0, Math.PI, TAU)
    ctx.closePath()
    shapeFill(ctx, '#7a5a42', 1.6)
    ink(ctx, 5, '#6b5442')
    ctx.beginPath()
    ctx.moveTo(0, -3)
    ctx.quadraticCurveTo(-3, -18, 1, -28)
    ctx.stroke()
    blobPath(ctx, 1, -33, 15, 31337, { points: 14, wobble: 0.16, squash: 0.9 })
    shapeFill(ctx, '#6f9a5c', 2)
    blobPath(ctx, -9, -27, 8, 31338, { points: 11, wobble: 0.18 })
    shapeFill(ctx, '#83b167', 1.6)
    // Sprinkler arm, sweeping.
    ink(ctx, 1.8, '#9a9a86')
    ctx.beginPath()
    ctx.moveTo(0, -44)
    ctx.lineTo(0, -37)
    ctx.stroke()
    ctx.save()
    ctx.translate(0, -37)
    ctx.rotate(Math.sin(t * 0.7) * 0.5)
    ctx.beginPath()
    ctx.moveTo(-12, 0)
    ctx.lineTo(12, 0)
    ctx.stroke()
    for (const dx of [-9, -3, 3, 9]) {
      ink(ctx, 1.1, withAlpha('#9fd0e0', 0.7))
      ctx.beginPath()
      ctx.moveTo(dx, 1)
      ctx.lineTo(dx, 5 + ((t * 22 + dx * 3) % 8))
      ctx.stroke()
    }
    ctx.restore()
    // Glass last, so it reads as being in front of the tree.
    ink(ctx, 2.4, withAlpha('#dff0f6', 0.7))
    ctx.beginPath()
    ctx.arc(0, 0, 44, Math.PI, TAU)
    ctx.stroke()
    ink(ctx, 2, withAlpha(CREAM, 0.32))
    ctx.beginPath()
    ctx.arc(0, 0, 38, Math.PI + 0.35, Math.PI + 1)
    ctx.stroke()
    ink(ctx, 1.2, withAlpha('#dff0f6', 0.28))
    for (const a of [-2.3, -1.57, -0.85]) {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * 44, Math.sin(a) * 44)
      ctx.stroke()
    }
  },
}

const SLED_IN_SNOW: EasterEgg = {
  id: 'sled-in-snow',
  title: 'A Sled Nobody Came Back For',
  note: 'A word painted on it, half worn away. Somebody thought about this at the end.',
  place: 'surface',
  biomes: ['ice'],
  weight: 6,
  reach: 40,
  thumb: { scale: 2.1 },
  draw(ctx, t) {
    // A drift banked against the back of it.
    ctx.beginPath()
    ctx.moveTo(-46, 0)
    ctx.quadraticCurveTo(-26, -13, -2, -9)
    ctx.lineTo(-2, 0)
    ctx.closePath()
    ctx.fillStyle = withAlpha(CREAM, 0.85)
    ctx.fill()
    ctx.save()
    ctx.rotate(-0.05)
    // Two runners, each curling up at the front.
    for (const [ry, lw] of [
      [-4, 3],
      [-7, 3.4],
    ] as const) {
      ink(ctx, lw, '#7a5a3c')
      ctx.beginPath()
      ctx.moveTo(-28, ry)
      ctx.lineTo(20, ry)
      ctx.quadraticCurveTo(34, ry, 33, ry - 13)
      ctx.quadraticCurveTo(32, ry - 19, 26, ry - 18)
      ctx.stroke()
    }
    // Uprights between deck and runners.
    ink(ctx, 2.2, '#8a6a4e')
    for (const ux of [-22, -4, 14]) {
      ctx.beginPath()
      ctx.moveTo(ux, -6)
      ctx.lineTo(ux, -15)
      ctx.stroke()
    }
    // The deck: five slats with gaps you can see through.
    for (let i = 0; i < 5; i++) {
      roundRectPath(ctx, -28 + i * 12, -20, 9, 5, 1.5)
      shapeFill(ctx, i % 2 === 0 ? '#a5744f' : '#9a6a46', 1.3)
    }
    // A word painted across the slats, mostly worn away.
    ink(ctx, 2, withAlpha('#b8503c', 0.75))
    ctx.beginPath()
    ctx.moveTo(-24, -17.5)
    ctx.lineTo(-17, -17.5)
    ctx.moveTo(-12, -17.5)
    ctx.lineTo(-8, -17.5)
    ctx.moveTo(2, -17.5)
    ctx.lineTo(9, -17.5)
    ctx.moveTo(14, -17.5)
    ctx.lineTo(16, -17.5)
    ctx.stroke()
    // A pull rope, coiled where it was dropped.
    ink(ctx, 1.8, '#9a8468')
    ctx.beginPath()
    ctx.moveTo(30, -22)
    ctx.quadraticCurveTo(44, -14, 50, -2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(52, -2, 6, 2.6, 0, 0, TAU)
    ctx.stroke()
    ctx.restore()
    // A little snow, still coming down.
    ctx.fillStyle = withAlpha(CREAM, 0.8)
    for (let i = 0; i < 8; i++) {
      const rng = scatter(i * 331)
      const sx = rng.range(-46, 50)
      const sy = -66 + ((t * 13 + rng.next() * 66) % 66)
      ctx.beginPath()
      ctx.arc(sx + Math.sin(t + i) * 3, sy, 1.2, 0, TAU)
      ctx.fill()
    }
  },
}

const TWO_DOORWAYS: EasterEgg = {
  id: 'two-doorways',
  title: 'Two Doorways That Are One Doorway',
  note: 'Lean through the blue one and your own boots walk out of the orange.',
  place: 'surface',
  biomes: ['rocky', 'crystal', 'ice'],
  weight: 5,
  reach: 62,
  thumb: { scale: 1.05 },
  draw(ctx, t) {
    brickWall(ctx, -66, -56, 34, 56, '#a8a094', 7)
    brickWall(ctx, 32, -56, 34, 56, '#a8a094', 7)
    for (const p of [
      { x: -49, col: '#4fa8e8', hi: '#bfe4ff' },
      { x: 49, col: '#f09040', hi: '#ffd8a8' },
    ]) {
      const wob = Math.sin(t * 2.2 + p.x) * 0.8
      ctx.save()
      ctx.translate(p.x, -28)
      ctx.beginPath()
      ctx.ellipse(0, 0, 13 + wob, 22 + wob, 0, 0, TAU)
      ctx.fillStyle = '#141020'
      ctx.fill()
      ink(ctx, 3.4, withAlpha(p.col, 0.9))
      ctx.stroke()
      ink(ctx, 1.4, withAlpha(p.hi, 0.9))
      ctx.beginPath()
      ctx.ellipse(0, 0, 10 + wob, 19 + wob, 0, 0, TAU)
      ctx.stroke()
      // A hint of the other place, scrolling.
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(0, 0, 10, 19, 0, 0, TAU)
      ctx.clip()
      ctx.fillStyle = withAlpha(p.col, 0.16)
      ctx.fillRect(-14, -24, 28, 48)
      ink(ctx, 1.2, withAlpha(p.hi, 0.45))
      for (let i = 0; i < 3; i++) {
        const yy = -18 + ((t * 12 + i * 14) % 38)
        ctx.beginPath()
        ctx.moveTo(-9, yy)
        ctx.lineTo(9, yy)
        ctx.stroke()
      }
      ctx.restore()
      ctx.restore()
      glowDot(ctx, p.x, -28, 1.6, p.hi, 12)
    }
    // A pair of boots stepping out of the orange one.
    ctx.fillStyle = withAlpha(INK, 0.75)
    for (const bx of [39, 48]) {
      roundRectPath(ctx, bx, -8, 7, 8, 2)
      ctx.fill()
    }
    // A cube waiting patiently, with a heart scratched into it.
    ctx.save()
    ctx.translate(-4, -9)
    roundRectPath(ctx, -9, -9, 18, 18, 3)
    shapeFill(ctx, '#c8c2b4', 1.8)
    roundRectPath(ctx, -6, -6, 12, 12, 2)
    ink(ctx, 1.2, withAlpha(INK, 0.35))
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, 2.5)
    ctx.quadraticCurveTo(-5.5, -1.5, -2.6, -4)
    ctx.quadraticCurveTo(0, -5.6, 0, -2)
    ctx.quadraticCurveTo(0, -5.6, 2.6, -4)
    ctx.quadraticCurveTo(5.5, -1.5, 0, 2.5)
    ctx.closePath()
    ctx.fillStyle = '#d4746a'
    ctx.fill()
    ctx.restore()
  },
}

const LONELY_CAKE: EasterEgg = {
  id: 'lonely-cake',
  title: 'A Cake at the End of a Long Room',
  note: 'Promised to somebody a long time ago. It looks real enough from here.',
  place: 'surface',
  biomes: ['rocky', 'crystal'],
  weight: 5,
  reach: 46,
  thumb: { scale: 1.7 },
  draw(ctx, t) {
    // A corridor receding in three rings.
    for (let i = 3; i >= 1; i--) {
      const s = i * 0.28
      const w = 90 * s + 26
      const h = 76 * s + 22
      roundRectPath(ctx, -w / 2, -h, w, h, 3)
      ctx.fillStyle = withAlpha('#2b2a33', 0.55 + (3 - i) * 0.13)
      ctx.fill()
      ink(ctx, 1.4, withAlpha('#8f8a7c', 0.45))
      ctx.stroke()
    }
    for (let i = 0; i < 3; i++) {
      const s = (i + 1) * 0.28
      const y = -(76 * s + 22) + 4
      roundRectPath(ctx, -6 - i * 4, y, 12 + i * 8, 3, 1.5)
      ctx.fillStyle = withAlpha('#f6e8b8', 0.5 + i * 0.12)
      ctx.fill()
    }
    // A pool of light on the plinth.
    const g = ctx.createLinearGradient(0, -40, 0, -10)
    g.addColorStop(0, withAlpha('#f6e8b8', 0.2))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(-6, -40)
    ctx.lineTo(6, -40)
    ctx.lineTo(13, -10)
    ctx.lineTo(-13, -10)
    ctx.closePath()
    ctx.fill()
    roundRectPath(ctx, -11, -12, 22, 12, 2)
    shapeFill(ctx, '#7a7568', 1.6)
    ctx.save()
    ctx.translate(0, -12)
    roundRectPath(ctx, -8, -9, 16, 9, 2)
    shapeFill(ctx, '#5b3a2e', 1.4)
    roundRectPath(ctx, -8, -13.5, 16, 5, 2)
    shapeFill(ctx, '#efe0d0', 1.3)
    ctx.beginPath()
    ctx.arc(0, -16, 2.4, 0, TAU)
    shapeFill(ctx, '#c8503c', 1.1)
    ink(ctx, 1.4, '#e8e2d2')
    ctx.beginPath()
    ctx.moveTo(5, -14)
    ctx.lineTo(5, -20)
    ctx.stroke()
    glowDot(ctx, 5, -22, 1.5 + Math.sin(t * 6) * 0.25, '#f6c86a', 6)
    ctx.restore()
  },
}

const CUBE_HILL: EasterEgg = {
  id: 'cube-hill',
  title: 'A Hill of Perfect Cubes',
  note: 'Somebody has been digging here with more enthusiasm than planning.',
  place: 'surface',
  biomes: ['rocky', 'meadow', 'desert'],
  weight: 6,
  reach: 58,
  thumb: { scale: 1.1 },
  draw(ctx, t) {
    const C = 13
    const cols = [3, 5, 6, 5, 3]
    for (let c = 0; c < cols.length; c++) {
      const x = (c - 2) * C
      for (let r = 0; r < cols[c]; r++) {
        const y = -r * C
        const top = r === cols[c] - 1
        const ore = c === 3 && r === 1
        roundRectPath(ctx, x - C / 2, y - C, C, C, 1)
        shapeFill(ctx, top ? '#6f9a5c' : ore ? '#8a8a94' : '#9a8570', 1.4)
        if (top) {
          ink(ctx, 1.3, '#83b167')
          for (const gx of [-4, 0, 4]) {
            ctx.beginPath()
            ctx.moveTo(x + gx, y - C)
            ctx.lineTo(x + gx + Math.sin(t + gx) * 1.4, y - C - 4)
            ctx.stroke()
          }
        }
        if (ore) {
          ctx.fillStyle = '#5f9a9c'
          for (const [ox, oy] of [
            [-3, -8],
            [2, -4],
            [3, -9],
          ] as const) {
            ctx.beginPath()
            ctx.arc(x + ox, y + oy, 1.8, 0, TAU)
            ctx.fill()
          }
        }
      }
    }
    // A torch jammed in the side, because it is dark in there.
    ink(ctx, 2.4, '#8a6a4e')
    ctx.beginPath()
    ctx.moveTo(-32, -20)
    ctx.lineTo(-38, -28)
    ctx.stroke()
    glowDot(ctx, -39, -30, 2.5 + Math.sin(t * 7) * 0.4, '#f6b45c', 7)
    for (let i = 0; i < 3; i++) {
      roundRectPath(ctx, 42 + (i % 2) * 2, -(i + 1) * 9, 12, 9, 1)
      shapeFill(ctx, '#9a8570', 1.2)
    }
  },
}

const DOOR_IN_THE_AIR: EasterEgg = {
  id: 'door-in-the-air',
  title: 'A Door With No House',
  note: 'Standing on its own. Warm light under it, and a draught that smells of bread.',
  place: 'surface',
  weight: 5,
  reach: 46,
  thumb: { scale: 1.8 },
  draw(ctx, t) {
    // Light spilling out onto the floor, drawn first.
    const g = ctx.createLinearGradient(0, -6, 0, 16)
    g.addColorStop(0, withAlpha('#f4d68c', 0.35))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(-13, 0)
    ctx.lineTo(13, 0)
    ctx.lineTo(24, 16)
    ctx.lineTo(-24, 16)
    ctx.closePath()
    ctx.fill()
    ctx.save()
    ctx.rotate(-0.02)
    roundRectPath(ctx, -17, -50, 34, 50, 2)
    shapeFill(ctx, '#7a5a3c', 2.2)
    ctx.save()
    roundRectPath(ctx, -13, -46, 26, 46, 1.5)
    ctx.clip()
    ctx.fillStyle = '#f4d68c'
    ctx.fillRect(-13, -46, 26, 46)
    // Somebody else's kitchen, in silhouette.
    ctx.fillStyle = withAlpha(INK, 0.42)
    ctx.fillRect(-9, -15, 18, 3)
    ctx.fillRect(-7, -12, 2, 12)
    ctx.fillRect(5, -12, 2, 12)
    ctx.beginPath()
    ctx.arc(0, -19, 4, Math.PI, TAU)
    ctx.closePath()
    ctx.fill()
    for (const hx of [-9, 8]) {
      ctx.fillRect(hx, -44, 1.5, 8)
      ctx.beginPath()
      ctx.arc(hx + 0.75, -35, 2.4, 0, TAU)
      ctx.fill()
    }
    smoke(ctx, 0, -23, t, 3, '#8a7a5a', 16, 4)
    ctx.restore()
    ink(ctx, 2)
    roundRectPath(ctx, -13, -46, 26, 46, 1.5)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(8, -24, 2.2, 0, TAU)
    ctx.fillStyle = '#e0c27c'
    ctx.fill()
    // A dial above the handle, currently pointing at green.
    ctx.beginPath()
    ctx.arc(0, -52, 4, 0, TAU)
    shapeFill(ctx, '#c9c2b0', 1.3)
    ink(ctx, 1.4, '#5f8a5c')
    ctx.beginPath()
    ctx.moveTo(0, -52)
    ctx.lineTo(Math.cos(t * 0.4 - 1.2) * 3, -52 + Math.sin(t * 0.4 - 1.2) * 3)
    ctx.stroke()
    ctx.restore()
  },
}

const SPINNING_TOP: EasterEgg = {
  id: 'spinning-top',
  title: "A Top That Hasn't Fallen Over",
  note: 'Spinning since before you arrived. Nobody wants to be the one who checks.',
  place: 'surface',
  biomes: ['rocky', 'crystal', 'ice'],
  weight: 5,
  reach: 32,
  thumb: { scale: 3 },
  draw(ctx, t) {
    ink(ctx, 2.4, '#7a5a3c')
    for (const lx of [-12, 12]) {
      ctx.beginPath()
      ctx.moveTo(lx, 0)
      ctx.lineTo(lx, -13)
      ctx.stroke()
    }
    roundRectPath(ctx, -16, -16, 32, 4, 1.5)
    shapeFill(ctx, '#a5744f', 1.4)
    ctx.save()
    ctx.translate(0, -16)
    ctx.rotate(Math.sin(t * 3.1) * 0.09)
    ctx.beginPath()
    ctx.moveTo(-5, -9)
    ctx.lineTo(5, -9)
    ctx.lineTo(0, 0)
    ctx.closePath()
    shapeFill(ctx, '#c9a45c', 1.4)
    roundRectPath(ctx, -1, -13, 2, 5, 1)
    shapeFill(ctx, '#8a6a3c', 1)
    ctx.restore()
    // A whisper of motion blur at the widest point.
    ink(ctx, 1.2, withAlpha(CREAM, 0.32))
    ctx.beginPath()
    ctx.ellipse(0, -25, 6, 1.8, 0, 0, TAU)
    ctx.stroke()
  },
}

const LIGHT_WALL: EasterEgg = {
  id: 'light-wall',
  title: 'Lights That Spell Something',
  note: 'A string of bulbs over a row of painted letters. Some of the bulbs answer back.',
  place: 'surface',
  biomes: ['forest', 'meadow', 'fungal'],
  weight: 5,
  reach: 58,
  thumb: { scale: 1.15 },
  draw(ctx, t) {
    for (let i = 0; i < 5; i++) {
      roundRectPath(ctx, -58, -12 - i * 11, 116, 11, 1)
      shapeFill(ctx, i % 2 === 0 ? '#8d6b4c' : '#9a7756', 1.3)
    }
    // Letters as shapes rather than text — unreadable on purpose.
    ink(ctx, 2.6, withAlpha('#3f3428', 0.75))
    for (let i = 0; i < 8; i++) {
      const x = -50 + i * 14
      ctx.beginPath()
      switch (i % 4) {
        case 0:
          ctx.moveTo(x, -22)
          ctx.lineTo(x + 4, -34)
          ctx.lineTo(x + 8, -22)
          break
        case 1:
          ctx.moveTo(x, -22)
          ctx.lineTo(x, -34)
          ctx.lineTo(x + 7, -28)
          ctx.lineTo(x, -28)
          break
        case 2:
          ctx.arc(x + 4, -28, 5, 0.4, TAU - 0.4)
          break
        default:
          ctx.moveTo(x + 4, -22)
          ctx.lineTo(x + 4, -34)
          ctx.moveTo(x, -34)
          ctx.lineTo(x + 8, -34)
      }
      ctx.stroke()
    }
    ink(ctx, 1.2, withAlpha(INK, 0.5))
    ctx.beginPath()
    ctx.moveTo(-58, -52)
    ctx.quadraticCurveTo(0, -40, 58, -52)
    ctx.stroke()
    const lit = Math.floor(t * 2.4) % 8
    for (let i = 0; i < 8; i++) {
      const p = i / 7
      const bx = -58 + p * 116
      const by = -48 + Math.sin(p * Math.PI) * 12
      const col = ['#e0564a', '#f0b24c', '#6fa8c8', '#8ab86c'][i % 4]
      if (i === lit) glowDot(ctx, bx, by, 3.2, col, 7)
      else {
        ctx.beginPath()
        ctx.arc(bx, by, 3, 0, TAU)
        ctx.fillStyle = withAlpha(col, 0.4)
        ctx.fill()
      }
    }
  },
}

const MANY_LEGGED_BUS: EasterEgg = {
  id: 'many-legged-bus',
  title: 'The Bus With Too Many Legs',
  note: 'It does stop, but only where it feels like stopping. Destination board illegible.',
  place: 'space',
  weight: 4,
  reach: 140,
  thumb: { scale: 1.1 },
  draw(ctx, t) {
    const run = t * 6
    ctx.save()
    ctx.translate(Math.sin(t * 0.6) * 6, Math.sin(run) * 1.5)
    ink(ctx, 4, '#6b5a4a')
    for (let i = 0; i < 10; i++) {
      const lx = -62 + i * 14
      const ph = run + i * 0.7
      ctx.beginPath()
      ctx.moveTo(lx, 30)
      ctx.lineTo(lx + Math.sin(ph) * 8, 44 + Math.cos(ph) * 5)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(lx + Math.sin(ph) * 8, 46 + Math.cos(ph) * 5, 4, 2.6, 0, 0, TAU)
      ctx.fillStyle = '#8a7462'
      ctx.fill()
    }
    // Two ear tufts, so the front end is obviously an animal.
    for (const [ex, dir] of [
      [52, -1],
      [70, 1],
    ] as const) {
      leafPath(ctx, ex, -26, 20, 8, dir > 0 ? -0.8 : -TAU / 2 + 0.8)
      shapeFill(ctx, '#6b5a4a', 1.8)
    }
    // A body with enough height to be a bus rather than a slug.
    blobPath(ctx, 0, 0, 76, 20240, { points: 22, wobble: 0.045, squash: 0.52 })
    shapeFill(ctx, '#7c6752', 2.4)
    // A pale belly stripe along the bottom.
    ctx.save()
    blobPath(ctx, 0, 0, 75, 20240, { points: 22, wobble: 0.045, squash: 0.52 })
    ctx.clip()
    ctx.fillStyle = withAlpha(CREAM, 0.16)
    ctx.fillRect(-80, 14, 160, 30)
    ctx.restore()
    // A row of warm windows.
    windows(ctx, -56, -18, 7, 1, 12, 16, 4, 0x9c, '#f2c86a', '#5a4a3c')
    ink(ctx, 1.4, withAlpha(INK, 0.4))
    roundRectPath(ctx, -58, -20, 116, 20, 3)
    ctx.stroke()
    // Destination board, glowing, illegible.
    roundRectPath(ctx, -24, -35, 48, 11, 2)
    shapeFill(ctx, withAlpha('#f2c86a', 0.9), 1.4)
    ink(ctx, 1.6, withAlpha(INK, 0.55))
    ctx.beginPath()
    ctx.moveTo(-18, -29)
    ctx.lineTo(-5, -29)
    ctx.moveTo(0, -29)
    ctx.lineTo(18, -29)
    ctx.stroke()
    // Big lantern eyes and a very wide grin at the front.
    for (const ex of [52, 70]) {
      glowDot(ctx, ex, -8, 6, '#f6e08c', 5)
      ctx.beginPath()
      ctx.arc(ex, -8, 2.2, 0, TAU)
      ctx.fillStyle = INK
      ctx.fill()
    }
    ink(ctx, 3, withAlpha(INK, 0.7))
    ctx.beginPath()
    ctx.moveTo(46, 8)
    ctx.quadraticCurveTo(62, 22, 78, 4)
    ctx.stroke()
    // Teeth, a couple of them.
    ctx.fillStyle = CREAM
    for (const tx of [56, 68]) {
      ctx.beginPath()
      ctx.moveTo(tx - 3, 13)
      ctx.lineTo(tx, 18)
      ctx.lineTo(tx + 3, 13)
      ctx.closePath()
      ctx.fill()
    }
    // Tail.
    ink(ctx, 6, '#7c6752')
    ctx.beginPath()
    ctx.moveTo(-72, 4)
    ctx.quadraticCurveTo(-94, 6 + Math.sin(t * 2) * 9, -104, -10 + Math.sin(t * 2) * 7)
    ctx.stroke()
    ctx.restore()
  },
}

const BICYCLE_MOON: EasterEgg = {
  id: 'bicycle-moon',
  title: 'A Bicycle Against the Moon',
  note: 'Crossing a full moon at altitude, which is not where bicycles usually are.',
  place: 'space',
  weight: 5,
  reach: 135,
  draw(ctx, t) {
    const R = 68
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, TAU)
    ctx.fillStyle = '#efe4c4'
    ctx.fill()
    ctx.fillStyle = withAlpha(INK, 0.07)
    for (let i = 0; i < 8; i++) {
      const rng = scatter(i * 613)
      const a = rng.range(0, TAU)
      const d = rng.range(0, R * 0.8)
      ctx.beginPath()
      ctx.arc(Math.cos(a) * d, Math.sin(a) * d, rng.range(4, 11), 0, TAU)
      ctx.fill()
    }
    ink(ctx, 2.4, withAlpha(INK, 0.22))
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, TAU)
    ctx.stroke()

    const dark = withAlpha(INK, 0.85)
    ctx.save()
    ctx.translate(-12 + Math.sin(t * 0.25) * 22, 8 + Math.sin(t * 0.5) * 4)
    ctx.rotate(-0.12)
    for (const wx of [-13, 13]) {
      ink(ctx, 2, dark)
      ctx.beginPath()
      ctx.arc(wx, 0, 8, 0, TAU)
      ctx.stroke()
      ink(ctx, 0.8, withAlpha(INK, 0.5))
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + t * 1.4
        ctx.beginPath()
        ctx.moveTo(wx, 0)
        ctx.lineTo(wx + Math.cos(a) * 7.4, Math.sin(a) * 7.4)
        ctx.stroke()
      }
    }
    ink(ctx, 2, dark)
    ctx.beginPath()
    ctx.moveTo(-13, 0)
    ctx.lineTo(-2, -9)
    ctx.lineTo(11, -8)
    ctx.lineTo(13, 0)
    ctx.moveTo(-2, -9)
    ctx.lineTo(0, 0)
    ctx.moveTo(11, -8)
    ctx.lineTo(14, -15)
    ctx.lineTo(19, -16)
    ctx.stroke()
    roundRectPath(ctx, 15, -23, 10, 7, 1.5)
    ctx.fillStyle = withAlpha(INK, 0.7)
    ctx.fill()
    figure(ctx, -1, -9, 20, dark, -0.25)
    ctx.beginPath()
    ctx.arc(20, -25, 3.4, 0, TAU)
    ctx.fillStyle = withAlpha(INK, 0.9)
    ctx.fill()
    ctx.restore()
    // Reeds at the bottom of the frame, as if just cleared.
    ink(ctx, 1.6, withAlpha(INK, 0.45))
    for (let i = 0; i < 7; i++) {
      const x = -78 + i * 26
      ctx.beginPath()
      ctx.moveTo(x, 78)
      ctx.quadraticCurveTo(x + 3, 64, x + Math.sin(t + i) * 4, 52)
      ctx.stroke()
    }
  },
}

export const SCREEN_EGGS: readonly EasterEgg[] = [
  TALL_SLAB,
  PATIENT_LENS,
  GREAT_BURROWER,
  TWO_SUNS,
  BLUE_BOOTH,
  LONG_LEGGED_WALKER,
  CUBE_COLLECTOR,
  TALL_IRON_FRIEND,
  RAINY_BUS_STOP,
  STANDING_RING,
  ROOM_BEHIND_THE_CLOCK,
  BOTANISTS_TENT,
  FACE_IN_THE_MOON,
  RING_STATION,
  FLOATING_GARDEN,
  HOUSE_THAT_FLEW,
  CHEESE_MOON,
  WALKING_HOUSE,
  SILVER_CAR,
  ORIGAMI_UNICORN,
  BALL_WITH_A_FACE,
  BENCH_AND_CHOCOLATES,
  TRAIN_ON_WATER,
  LANTERN_BATHHOUSE,
  PARKED_BROOM,
  ONE_TREE_UNDER_GLASS,
  SLED_IN_SNOW,
  TWO_DOORWAYS,
  LONELY_CAKE,
  CUBE_HILL,
  DOOR_IN_THE_AIR,
  SPINNING_TOP,
  LIGHT_WALL,
  MANY_LEGGED_BUS,
  BICYCLE_MOON,
]
