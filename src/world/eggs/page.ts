/**
 * Curiosities that rhyme with books, fairy tales and folklore.
 *
 * Original silhouettes and shape studies, titled descriptively. See `kit.ts`
 * for the drawing conventions and the shared helpers.
 */

import { TAU } from '../../core/math'
import { Rng } from '../../core/rng'
import { CREAM, HUES, INK, withAlpha } from '../../render/palette'
import { blobPath, ink, roundRectPath, starPath, leafPath, cloudPath } from '../../render/shapes'
import { type EasterEgg, figure, sun, shapeFill, glowDot, smoke, brickWall, ripples, scatter } from './kit'

const SNOWY_WARDROBE: EasterEgg = {
  id: 'snowy-wardrobe',
  title: 'The Snowy Wardrobe',
  note: 'The doors are ajar. Cold air comes out, and it smells of pine.',
  place: 'surface',
  biomes: ['ice'],
  weight: 6,
  reach: 44,
  thumb: { scale: 1.35 },
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
  thumb: { scale: 1.2 },
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

const THUMB_AND_TOWEL: EasterEgg = {
  id: 'thumb-and-towel',
  title: 'A Thumb and a Towel',
  note: "Waiting for a lift. Brought a towel, which was the sensible part.",
  place: 'surface',
  biomes: ['desert', 'rocky', 'meadow'],
  weight: 6,
  reach: 42,
  thumb: { scale: 1.5 },
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

const SMALLEST_DOORS: EasterEgg = {
  id: 'smallest-doors',
  title: 'The Smallest Doors',
  note: 'Each stalk has a door, and each door has a mat. Nobody is home. Probably.',
  place: 'surface',
  biomes: ['fungal', 'forest'],
  weight: 7,
  reach: 46,
  thumb: { scale: 1.3 },
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
  thumb: { scale: 1.7 },
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
  thumb: { scale: 1.15 },
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

const WHALE_AND_PETUNIAS: EasterEgg = {
  id: 'whale-and-petunias',
  title: 'A Whale and a Bowl of Petunias',
  note: 'Both newly created, both falling, and only one of them has done this before.',
  place: 'space',
  weight: 5,
  reach: 140,
  thumb: { scale: 1.2 },
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

const WORLD_TURTLE: EasterEgg = {
  id: 'world-turtle',
  title: 'The World Turtle',
  note: 'Four elephants, one enormous turtle, and a flat world balanced on top. It works.',
  place: 'space',
  weight: 4,
  reach: 180,
  thumb: { scale: 0.95 },
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

const THE_STARMAN: EasterEgg = {
  id: 'the-starman',
  title: 'The Starman',
  note: 'Drifting with his hands behind his head. A bolt of colour across the visor.',
  place: 'space',
  weight: 5,
  reach: 110,
  thumb: { scale: 1.3 },
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

const SWORD_IN_STONE: EasterEgg = {
  id: 'sword-in-stone',
  title: 'A Sword Left in a Stone',
  note: 'Loose enough to pull out, if you happen to be the right person about it.',
  place: 'surface',
  biomes: ['meadow', 'rocky', 'forest'],
  weight: 6,
  reach: 42,
  thumb: { scale: 1.9 },
  draw(ctx, t) {
    // Anvil-topped stone, half sunk in the turf.
    blobPath(ctx, 0, -9, 20, 77001, { points: 11, wobble: 0.14, squash: 0.62 })
    shapeFill(ctx, '#8f8a80', 2.2)
    roundRectPath(ctx, -13, -25, 26, 9, 2)
    shapeFill(ctx, '#7d786e', 1.8)
    // Blade, buried a third of the way.
    ctx.save()
    ctx.translate(0, -25)
    ctx.rotate(0.04)
    ctx.beginPath()
    ctx.moveTo(-2.6, 4)
    ctx.lineTo(-2.6, -30)
    ctx.lineTo(0, -35)
    ctx.lineTo(2.6, -30)
    ctx.lineTo(2.6, 4)
    ctx.closePath()
    shapeFill(ctx, '#d4d8dc', 1.6)
    ink(ctx, 1, withAlpha(CREAM, 0.6))
    ctx.beginPath()
    ctx.moveTo(0, 2)
    ctx.lineTo(0, -30)
    ctx.stroke()
    // Crossguard, grip, pommel.
    roundRectPath(ctx, -10, -12, 20, 3.5, 1.5)
    shapeFill(ctx, '#c9a45c', 1.4)
    roundRectPath(ctx, -2, -22, 4, 10, 1.5)
    shapeFill(ctx, '#6b4a34', 1.2)
    ctx.beginPath()
    ctx.arc(0, -24, 2.6, 0, TAU)
    shapeFill(ctx, '#c9a45c', 1.2)
    ctx.restore()
    // A shaft of light that doesn't come from the sun.
    const g = ctx.createLinearGradient(0, -80, 0, -20)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, withAlpha('#f6e8b8', 0.2 + Math.sin(t * 0.9) * 0.05))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(-16, -80)
    ctx.lineTo(16, -80)
    ctx.lineTo(9, -20)
    ctx.lineTo(-9, -20)
    ctx.closePath()
    ctx.fill()
  },
}

const SPIRAL_ROAD: EasterEgg = {
  id: 'spiral-road',
  title: 'The Road That Spirals Away',
  note: 'Yellow brick, laid in a coil, heading off in a direction that is not on the map.',
  place: 'surface',
  biomes: ['meadow', 'desert'],
  weight: 6,
  reach: 76,
  thumb: { scale: 0.95 },
  draw(ctx, t) {
    // Seen almost from above, so squash the whole thing.
    ctx.save()
    ctx.translate(0, -6)
    ctx.scale(1, 0.36)
    // A widening coil of bricks.
    for (let i = 0; i < 52; i++) {
      const p = i / 52
      const a = p * TAU * 2.4
      const r = 14 + p * 74
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(a + Math.PI / 2)
      roundRectPath(ctx, -7, -4.5, 14, 9, 1.5)
      ctx.fillStyle = i % 2 === 0 ? '#e8be5c' : '#d8a94a'
      ctx.fill()
      ink(ctx, 1, withAlpha('#a5782c', 0.6))
      ctx.stroke()
      ctx.restore()
    }
    ctx.restore()
    // Three pairs of footprints setting off along it, and one set of paw prints.
    ctx.fillStyle = withAlpha(INK, 0.2)
    for (let i = 0; i < 6; i++) {
      ctx.beginPath()
      ctx.ellipse(-64 + i * 9, -3 + (i % 2) * 3, 3.4, 2, 0.2, 0, TAU)
      ctx.fill()
    }
    // A pair of shoes nobody claimed, at the very start.
    for (const sx of [-82, -74]) {
      ctx.beginPath()
      ctx.moveTo(sx, -1)
      ctx.quadraticCurveTo(sx - 1, -7, sx + 3, -7)
      ctx.quadraticCurveTo(sx + 7, -7, sx + 6, -1)
      ctx.closePath()
      shapeFill(ctx, '#c04a56', 1.3)
    }
    // A dust devil where the road goes over the horizon.
    ink(ctx, 1.6, withAlpha('#d8bd92', 0.4))
    for (let i = 0; i < 3; i++) {
      const yy = -8 - i * 9
      ctx.beginPath()
      ctx.ellipse(70, yy, 5 + i * 2, 2.4, Math.sin(t * 1.2 + i) * 0.4, 0, TAU)
      ctx.stroke()
    }
  },
}

const STONE_TROLLS: EasterEgg = {
  id: 'stone-trolls',
  title: 'Three Stones That Were Not Always Stones',
  note: 'Caught out by a sunrise, mid-argument, and still leaning toward each other.',
  place: 'surface',
  biomes: ['rocky', 'forest', 'meadow'],
  weight: 6,
  reach: 66,
  thumb: { scale: 1.05 },
  draw(ctx, _t) {
    void _t
    const trolls = [
      { x: -38, r: 26, lean: -0.16, col: '#88837a' },
      { x: 4, r: 32, lean: 0.08, col: '#7d7870' },
      { x: 46, r: 24, lean: 0.2, col: '#928d84' },
    ]
    for (const tr of trolls) {
      ctx.save()
      ctx.translate(tr.x, 0)
      ctx.rotate(tr.lean)
      // A lumpy body.
      blobPath(ctx, 0, -tr.r * 0.95, tr.r, 4400 + tr.x, { points: 12, wobble: 0.14 })
      shapeFill(ctx, tr.col, 2.2)
      // A brow and two hollow eyes, still cross about it.
      ink(ctx, 2.4, withAlpha(INK, 0.45))
      ctx.beginPath()
      ctx.moveTo(-tr.r * 0.45, -tr.r * 1.3)
      ctx.quadraticCurveTo(0, -tr.r * 1.45, tr.r * 0.45, -tr.r * 1.3)
      ctx.stroke()
      for (const ex of [-tr.r * 0.3, tr.r * 0.3]) {
        ctx.beginPath()
        ctx.ellipse(ex, -tr.r * 1.1, tr.r * 0.12, tr.r * 0.16, 0, 0, TAU)
        ctx.fillStyle = withAlpha(INK, 0.42)
        ctx.fill()
      }
      // A downturned mouth, cut deep.
      ink(ctx, 2.2, withAlpha(INK, 0.4))
      ctx.beginPath()
      ctx.moveTo(-tr.r * 0.3, -tr.r * 0.7)
      ctx.quadraticCurveTo(0, -tr.r * 0.55, tr.r * 0.3, -tr.r * 0.72)
      ctx.stroke()
      // Lichen, because it has been a while.
      ctx.fillStyle = withAlpha('#8fa35c', 0.55)
      for (let i = 0; i < 5; i++) {
        const rng = scatter(i * 271 + tr.x)
        ctx.beginPath()
        ctx.arc(rng.range(-tr.r * 0.7, tr.r * 0.7), -tr.r * 0.5 + rng.range(-tr.r * 0.4, tr.r * 0.4), rng.range(1.6, 3.6), 0, TAU)
        ctx.fill()
      }
      ctx.restore()
    }
  },
}

const TOO_TALL_STALK: EasterEgg = {
  id: 'too-tall-stalk',
  title: 'The Stalk That Went Too Far',
  note: 'It came up overnight. The top of it is somewhere above the weather.',
  place: 'surface',
  biomes: ['meadow', 'forest'],
  weight: 6,
  reach: 62,
  thumb: { scale: 0.85, offsetY: 20 },
  draw(ctx, t) {
    // A turned-over patch of earth at the base.
    ctx.beginPath()
    ctx.ellipse(0, 0, 26, 7, 0, Math.PI, TAU)
    ctx.closePath()
    shapeFill(ctx, '#7a5a42', 1.8)
    // Two entwined stems, going up and out of frame.
    for (const dir of [-1, 1]) {
      ink(ctx, 7, dir > 0 ? '#6f9a5c' : '#5f8a4c')
      ctx.beginPath()
      ctx.moveTo(0, -4)
      for (let i = 0; i <= 12; i++) {
        const p = i / 12
        ctx.lineTo(Math.sin(p * 9 + (dir > 0 ? 0 : Math.PI)) * 12 * (0.3 + p * 0.7), -6 - p * 170)
      }
      ctx.stroke()
    }
    // Leaves, big ones, at intervals.
    for (let i = 1; i <= 6; i++) {
      const y = -20 - i * 26
      const side = i % 2 === 0 ? 1 : -1
      const sway = Math.sin(t * 0.8 + i) * 0.1
      leafPath(ctx, side * 6, y, 26, 11, side > 0 ? -0.3 + sway : Math.PI + 0.3 + sway)
      shapeFill(ctx, i % 2 === 0 ? '#7fae65' : '#6f9a5c', 1.8)
    }
    // Three beans in the dirt, one of them clearly a mistake.
    for (const [bx, col] of [
      [-16, '#a5744f'],
      [-9, '#a5744f'],
      [16, '#9a8cc0'],
    ] as const) {
      ctx.beginPath()
      ctx.ellipse(bx, -3, 3.4, 4.6, 0.3, 0, TAU)
      shapeFill(ctx, col, 1.2)
    }
  },
}

const RING_OVER_FIRE: EasterEgg = {
  id: 'ring-over-fire',
  title: 'A Small Gold Ring',
  note: 'Hanging on a thin chain above a crack in the floor. It feels heavier than it is.',
  place: 'surface',
  biomes: ['volcanic'],
  weight: 7,
  reach: 44,
  thumb: { scale: 1.9 },
  draw(ctx, t) {
    // A fissure with something bright a long way down.
    // A narrow jagged crack, with the light coming from inside it.
    ctx.beginPath()
    ctx.moveTo(-34, 0)
    ctx.lineTo(-16, -4)
    ctx.lineTo(-6, -1)
    ctx.lineTo(4, -5)
    ctx.lineTo(18, -2)
    ctx.lineTo(34, 0)
    ctx.lineTo(30, 6)
    ctx.lineTo(-30, 6)
    ctx.closePath()
    ctx.fillStyle = '#1d1512'
    ctx.fill()
    ctx.save()
    ctx.clip()
    const g = ctx.createLinearGradient(0, 6, 0, -6)
    g.addColorStop(0, withAlpha('#ff9a4c', 0.9))
    g.addColorStop(1, withAlpha('#c8402c', 0.5))
    ctx.fillStyle = g
    ctx.fillRect(-34, -8, 68, 16)
    ctx.restore()
    // Flame licking up out of the gap.
    for (let i = 0; i < 4; i++) {
      const p = (t * 0.9 + i * 0.25) % 1
      const fx = -18 + i * 12
      ctx.beginPath()
      ctx.moveTo(fx - 4, -1)
      ctx.quadraticCurveTo(fx, -8 - p * 14, fx + 2, -12 - p * 20)
      ctx.quadraticCurveTo(fx + 3, -8 - p * 12, fx + 4, -1)
      ctx.closePath()
      ctx.fillStyle = withAlpha(i % 2 ? '#f6b45c' : '#ef7a3c', 0.55 * (1 - p))
      ctx.fill()
    }
    smoke(ctx, 0, -14, t, 4, '#6b6058', 40, 10)
    // The chain, and the ring turning slowly on it.
    const swing = Math.sin(t * 0.8) * 0.1
    ctx.save()
    ctx.translate(0, -52)
    ctx.rotate(swing)
    ink(ctx, 1.2, '#8a7c5c')
    ctx.beginPath()
    ctx.moveTo(0, -30)
    ctx.lineTo(0, 16)
    ctx.stroke()
    ctx.save()
    ctx.translate(0, 19)
    // Squash the circle as it rotates, so it reads as spinning.
    const spin = Math.abs(Math.cos(t * 0.9))
    ctx.beginPath()
    ctx.ellipse(0, 0, 7 * spin + 1.2, 7, 0, 0, TAU)
    ink(ctx, 2.6, '#e8c45c')
    ctx.stroke()
    ink(ctx, 1, withAlpha(CREAM, 0.6))
    ctx.beginPath()
    ctx.ellipse(0, 0, 7 * spin + 1.2, 7, 0, -2.4, -1.4)
    ctx.stroke()
    ctx.restore()
    ctx.restore()
  },
}

const CROWN_ON_STUMP: EasterEgg = {
  id: 'crown-on-stump',
  title: 'A Crown Left on a Stump',
  note: 'Somebody was king here for a while, then decided supper mattered more.',
  place: 'surface',
  biomes: ['forest', 'meadow', 'fungal'],
  weight: 6,
  reach: 50,
  thumb: { scale: 1.6 },
  draw(ctx, t) {
    // Very large footprints, coming and going.
    ctx.fillStyle = withAlpha(INK, 0.18)
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.ellipse(-64 + i * 26, -2 + (i % 2) * 4, 11, 6, 0.15, 0, TAU)
      ctx.fill()
      // Three claw dents at the front of each.
      for (const cx of [-4, 0, 4]) {
        ctx.beginPath()
        ctx.arc(-64 + i * 26 + cx + 9, -4 + (i % 2) * 4, 1.6, 0, TAU)
        ctx.fill()
      }
    }
    // The stump.
    roundRectPath(ctx, -17, -20, 34, 20, 3)
    shapeFill(ctx, '#8a6a4e', 2.2)
    ctx.beginPath()
    ctx.ellipse(0, -20, 17, 6, 0, 0, TAU)
    shapeFill(ctx, '#b08c62', 1.8)
    ink(ctx, 1, withAlpha(INK, 0.28))
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath()
      ctx.ellipse(0, -20, i * 4.4, i * 1.6, 0, 0, TAU)
      ctx.stroke()
    }
    // The crown, tipped over, catching the light.
    ctx.save()
    ctx.translate(2, -22)
    ctx.rotate(-0.18)
    ctx.beginPath()
    ctx.moveTo(-11, 0)
    ctx.lineTo(-11, -6)
    ctx.lineTo(-7, -2)
    ctx.lineTo(-3.5, -9)
    ctx.lineTo(0, -2)
    ctx.lineTo(3.5, -9)
    ctx.lineTo(7, -2)
    ctx.lineTo(11, -6)
    ctx.lineTo(11, 0)
    ctx.closePath()
    shapeFill(ctx, '#e8c45c', 1.6)
    for (const jx of [-7, 0, 7]) {
      ctx.beginPath()
      ctx.arc(jx, -2.5, 1.3, 0, TAU)
      ctx.fillStyle = '#c04a56'
      ctx.fill()
    }
    ctx.restore()
    // A boat, tiny, moored at the edge of the frame.
    ctx.save()
    ctx.translate(40, -3 + Math.sin(t * 0.8) * 1)
    ctx.beginPath()
    ctx.moveTo(-11, 0)
    ctx.quadraticCurveTo(0, 6, 11, 0)
    ctx.closePath()
    shapeFill(ctx, '#8a6a4e', 1.4)
    ink(ctx, 1.6, '#8a6a4e')
    ctx.beginPath()
    ctx.moveTo(0, -1)
    ctx.lineTo(0, -16)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, -16)
    ctx.quadraticCurveTo(8, -10, 0, -4)
    ctx.closePath()
    shapeFill(ctx, withAlpha(CREAM, 0.9), 1.2)
    ctx.restore()
  },
}

const WEB_WITH_WORDS: EasterEgg = {
  id: 'web-with-words',
  title: 'The Web That Wrote Something',
  note: 'Spun overnight, between two posts, by someone with an opinion about a pig.',
  place: 'surface',
  biomes: ['meadow', 'forest', 'fungal'],
  weight: 6,
  reach: 48,
  thumb: { scale: 1.5 },
  draw(ctx, t) {
    // Two posts and a crossbeam.
    ink(ctx, 3, '#8b6a52')
    for (const px of [-30, 30]) {
      ctx.beginPath()
      ctx.moveTo(px, 0)
      ctx.lineTo(px, -46)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(-33, -46)
    ctx.lineTo(33, -46)
    ctx.stroke()
    // The web: radials, then a spiral.
    const cx = 0
    const cy = -26
    ink(ctx, 1, withAlpha(CREAM, 0.55))
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(a) * 25, cy + Math.sin(a) * 19)
      ctx.stroke()
    }
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath()
      for (let i = 0; i <= 10; i++) {
        const a = (i / 10) * TAU
        const x = cx + Math.cos(a) * (ring * 6.2)
        const y = cy + Math.sin(a) * (ring * 4.7)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    // Thicker strands spelling a shape in the middle of it.
    ink(ctx, 1.8, withAlpha(CREAM, 0.95))
    ctx.beginPath()
    ctx.moveTo(-10, -20)
    ctx.lineTo(-10, -32)
    ctx.lineTo(-4, -26)
    ctx.lineTo(-4, -20)
    ctx.moveTo(1, -32)
    ctx.lineTo(1, -20)
    ctx.moveTo(6, -20)
    ctx.lineTo(9, -32)
    ctx.lineTo(12, -20)
    ctx.stroke()
    // The author, small, off to one side.
    ctx.save()
    ctx.translate(20 + Math.sin(t * 0.6) * 2, -38)
    ctx.beginPath()
    ctx.ellipse(0, 0, 3.4, 2.8, 0, 0, TAU)
    ctx.fillStyle = '#4a3a44'
    ctx.fill()
    ink(ctx, 0.8, '#4a3a44')
    for (let i = 0; i < 4; i++) {
      const a = -0.6 + i * 0.4
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * 6, Math.sin(a) * 5 + 1)
      ctx.moveTo(0, 0)
      ctx.lineTo(-Math.cos(a) * 6, Math.sin(a) * 5 + 1)
      ctx.stroke()
    }
    ctx.restore()
    // Dew.
    ctx.fillStyle = withAlpha('#dff0f6', 0.8)
    for (let i = 0; i < 7; i++) {
      const rng = scatter(i * 419)
      const a = rng.range(0, TAU)
      const r = rng.range(0.4, 1) * 22
      ctx.beginPath()
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.76, 1.1, 0, TAU)
      ctx.fill()
    }
  },
}

const NIBBLED_LEAF: EasterEgg = {
  id: 'nibbled-leaf',
  title: 'A Leaf With Holes In It',
  note: 'One apple, two pears, three plums. Something has been extremely busy.',
  place: 'surface',
  biomes: ['meadow', 'fungal', 'forest'],
  weight: 6,
  reach: 42,
  thumb: { scale: 1.8 },
  draw(ctx, t) {
    // A big leaf on a stem, with tidy round holes chewed through it.
    ink(ctx, 2.6, '#6f9a5c')
    ctx.beginPath()
    ctx.moveTo(-6, 0)
    ctx.quadraticCurveTo(-4, -14, 0, -22)
    ctx.stroke()
    ctx.save()
    ctx.translate(0, -22)
    ctx.rotate(Math.sin(t * 0.8) * 0.05)
    leafPath(ctx, 0, 0, 40, 18, -1.2)
    shapeFill(ctx, '#83b167', 2)
    ctx.save()
    leafPath(ctx, 0, 0, 40, 18, -1.2)
    ctx.clip()
    // The holes. Six of them, getting bigger.
    for (let i = 0; i < 6; i++) {
      ctx.beginPath()
      ctx.arc(-6 + (i % 3) * 6, -8 - Math.floor(i / 3) * 12, 2 + i * 0.5, 0, TAU)
      ctx.fillStyle = '#0000'
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.restore()
    ink(ctx, 1.2, withAlpha('#5f8a4c', 0.7))
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -38)
    ctx.stroke()
    ctx.restore()
    // The culprit: a very round caterpillar, mid-leaf.
    ctx.save()
    ctx.translate(16, -16)
    for (let i = 5; i >= 0; i--) {
      const bob = Math.sin(t * 4 - i * 0.6) * 1.2
      ctx.beginPath()
      ctx.arc(-i * 7, bob, 6 - i * 0.35, 0, TAU)
      shapeFill(ctx, i === 0 ? '#c04a3c' : i % 2 === 0 ? '#8fb35c' : '#7fa34c', 1.6)
    }
    // Face on the front segment.
    ctx.fillStyle = INK
    for (const ex of [1.5, 4.5] as const) {
      ctx.beginPath()
      ctx.arc(ex, -1 + Math.sin(t * 4) * 1.2, 1.2, 0, TAU)
      ctx.fill()
    }
    ink(ctx, 1.2, INK)
    for (const ax of [1, 4]) {
      ctx.beginPath()
      ctx.moveTo(ax, -5)
      ctx.lineTo(ax + 1.5, -9)
      ctx.stroke()
    }
    ctx.restore()
  },
}

const WAVING_SNOWMAN: EasterEgg = {
  id: 'waving-snowman',
  title: 'The Snowman Who Waves',
  note: 'He was not waving a moment ago. Coal buttons, borrowed scarf, no comment.',
  place: 'surface',
  biomes: ['ice'],
  weight: 7,
  reach: 44,
  thumb: { scale: 1.55 },
  draw(ctx, t) {
    const wave = Math.sin(t * 2.4)
    // Three balls, smallest on top.
    for (const [cy, r] of [
      [-15, 16],
      [-36, 12],
      [-53, 9],
    ] as const) {
      blobPath(ctx, 0, cy, r, 8811 + r, { points: 14, wobble: 0.05 })
      shapeFill(ctx, '#f2ede0', 2)
    }
    // Coal buttons.
    ctx.fillStyle = '#332f36'
    for (const by of [-32, -38, -44]) {
      ctx.beginPath()
      ctx.arc(0, by, 1.6, 0, TAU)
      ctx.fill()
    }
    // Eyes, a carrot, and a small pleased mouth.
    for (const ex of [-3.4, 3.4]) {
      ctx.beginPath()
      ctx.arc(ex, -56, 1.6, 0, TAU)
      ctx.fill()
    }
    ctx.beginPath()
    ctx.moveTo(0, -53)
    ctx.lineTo(7, -51)
    ctx.lineTo(0, -50)
    ctx.closePath()
    shapeFill(ctx, '#e08a3c', 1.1)
    ink(ctx, 1.2, '#332f36')
    ctx.beginPath()
    ctx.arc(0, -48, 3.4, 0.4, Math.PI - 0.4)
    ctx.stroke()
    // Stick arms — one down, one up and waving.
    ink(ctx, 2.2, '#7a5a3c')
    ctx.beginPath()
    ctx.moveTo(-10, -38)
    ctx.lineTo(-22, -32)
    ctx.moveTo(-22, -32)
    ctx.lineTo(-27, -35)
    ctx.stroke()
    ctx.save()
    ctx.translate(10, -40)
    ctx.rotate(-0.6 + wave * 0.35)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(15, 0)
    ctx.moveTo(15, 0)
    ctx.lineTo(20, -4)
    ctx.moveTo(15, 0)
    ctx.lineTo(20, 3)
    ctx.stroke()
    ctx.restore()
    // A scarf that is clearly somebody's.
    ctx.beginPath()
    ctx.moveTo(-11, -46)
    ctx.quadraticCurveTo(0, -42, 11, -46)
    ctx.lineTo(11, -42)
    ctx.quadraticCurveTo(0, -38, -11, -42)
    ctx.closePath()
    shapeFill(ctx, '#c04a56', 1.5)
    ctx.beginPath()
    ctx.moveTo(8, -43)
    ctx.quadraticCurveTo(18, -36 + wave * 2, 15, -24 + wave * 2)
    ctx.lineTo(10, -25 + wave * 2)
    ctx.quadraticCurveTo(13, -35, 5, -41)
    ctx.closePath()
    shapeFill(ctx, '#a83a48', 1.4)
    // A hat, slightly too big.
    ctx.beginPath()
    ctx.ellipse(0, -61, 12, 3, 0, 0, TAU)
    shapeFill(ctx, '#3f3a44', 1.5)
    roundRectPath(ctx, -7, -73, 14, 12, 2)
    shapeFill(ctx, '#3f3a44', 1.6)
  },
}

const GIANT_PEACH: EasterEgg = {
  id: 'giant-peach',
  title: 'A Peach the Size of a House',
  note: 'Somebody has cut a small round door into the side and moved in.',
  place: 'surface',
  biomes: ['meadow', 'forest'],
  weight: 5,
  reach: 76,
  thumb: { scale: 0.95 },
  draw(ctx, t) {
    // The peach.
    blobPath(ctx, 0, -56, 56, 606060, { points: 18, wobble: 0.035 })
    shapeFill(ctx, '#f0a07c', 2.4)
    // The cleft.
    ink(ctx, 2.6, withAlpha('#c86a4c', 0.8))
    ctx.beginPath()
    ctx.moveTo(-4, -108)
    ctx.quadraticCurveTo(-16, -56, -2, -6)
    ctx.stroke()
    // A blush on the sunward side.
    ctx.save()
    blobPath(ctx, 0, -56, 55, 606060, { points: 18, wobble: 0.035 })
    ctx.clip()
    const g = ctx.createRadialGradient(-24, -78, 4, -24, -78, 54)
    g.addColorStop(0, withAlpha('#e8604c', 0.42))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(-60, -116, 120, 120)
    ctx.restore()
    // Stem and one leaf.
    ink(ctx, 4, '#6b5442')
    ctx.beginPath()
    ctx.moveTo(-2, -110)
    ctx.quadraticCurveTo(2, -120, 8, -122)
    ctx.stroke()
    leafPath(ctx, 8, -122, 22, 9, -0.4 + Math.sin(t * 0.7) * 0.08)
    shapeFill(ctx, '#6f9a5c', 1.8)
    // A round door, and a window above it.
    ctx.beginPath()
    ctx.arc(14, -26, 11, 0, TAU)
    shapeFill(ctx, '#7a5a3c', 2)
    ctx.beginPath()
    ctx.arc(14, -26, 8, 0, TAU)
    ink(ctx, 1.2, withAlpha(INK, 0.35))
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(30, -56, 6, 0, TAU)
    shapeFill(ctx, withAlpha('#f6dd9c', 0.85), 1.6)
    // Threads going up from the top, and something hopeful on the end of them.
    ink(ctx, 1, withAlpha(CREAM, 0.5))
    for (const [dx, dy] of [
      [-40, -150],
      [-18, -158],
      [8, -156],
    ] as const) {
      ctx.beginPath()
      ctx.moveTo(-6, -110)
      ctx.quadraticCurveTo(dx * 0.5, -136, dx, dy)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(dx, dy - 4 + Math.sin(t + dx) * 2, 7, 9, 0, 0, TAU)
      shapeFill(ctx, withAlpha(CREAM, 0.92), 1.4)
    }
  },
}

const DREAM_JARS: EasterEgg = {
  id: 'dream-jars',
  title: 'Jars With Something Moving Inside',
  note: 'Each one labelled in enormous handwriting. They glow brighter if you whisper.',
  place: 'surface',
  biomes: ['fungal', 'crystal', 'ice'],
  weight: 6,
  reach: 52,
  thumb: { scale: 1.4 },
  draw(ctx, t) {
    // A shelf, propped on two stones.
    for (const sx of [-34, 34]) {
      blobPath(ctx, sx, -5, 9, 9110 + sx, { points: 9, wobble: 0.2, squash: 0.7 })
      shapeFill(ctx, '#8f8a80', 1.6)
    }
    roundRectPath(ctx, -44, -16, 88, 5, 1.5)
    shapeFill(ctx, '#8a6a4e', 1.8)
    // Five jars of different sizes, each with a shape swimming in it.
    const jars = [
      { x: -32, w: 11, h: 20, col: '#7fd4e8' },
      { x: -14, w: 14, h: 26, col: '#c8a0e0' },
      { x: 6, w: 12, h: 22, col: '#f0d07c' },
      { x: 24, w: 10, h: 17, col: '#8fd4a0' },
      { x: 38, w: 8, h: 14, col: '#f0a0b4' },
    ]
    for (const j of jars) {
      ctx.save()
      ctx.translate(j.x, -16)
      roundRectPath(ctx, -j.w / 2, -j.h, j.w, j.h, 3)
      ctx.fillStyle = withAlpha('#dff0f6', 0.18)
      ctx.fill()
      ctx.save()
      roundRectPath(ctx, -j.w / 2, -j.h, j.w, j.h, 3)
      ctx.clip()
      // The thing inside: a wisp on a slow loop.
      const p = (t * 0.4 + j.x) % 1
      const wx = Math.sin(p * TAU) * (j.w * 0.22)
      const wy = -j.h * 0.3 - Math.cos(p * TAU) * (j.h * 0.22)
      glowDot(ctx, wx, wy, 2.4, j.col, 5)
      ink(ctx, 1.4, withAlpha(j.col, 0.6))
      ctx.beginPath()
      ctx.moveTo(wx, wy)
      ctx.quadraticCurveTo(wx - 4, wy + 5, wx + 2, wy + 9)
      ctx.stroke()
      ctx.restore()
      ink(ctx, 1.6, withAlpha('#dff0f6', 0.7))
      roundRectPath(ctx, -j.w / 2, -j.h, j.w, j.h, 3)
      ctx.stroke()
      // Cork and a label with handwriting far too big for it.
      roundRectPath(ctx, -j.w / 4, -j.h - 4, j.w / 2, 4, 1)
      shapeFill(ctx, '#b08c62', 1.2)
      roundRectPath(ctx, -j.w / 2 + 1, -j.h * 0.55, j.w - 2, 6, 1)
      ctx.fillStyle = withAlpha(CREAM, 0.85)
      ctx.fill()
      ink(ctx, 1.1, withAlpha(INK, 0.55))
      ctx.beginPath()
      ctx.moveTo(-j.w / 2 + 2.5, -j.h * 0.55 + 3)
      ctx.lineTo(j.w / 2 - 2.5, -j.h * 0.55 + 3)
      ctx.stroke()
      ctx.restore()
    }
  },
}

const TOWER_ONE_WINDOW: EasterEgg = {
  id: 'tower-one-window',
  title: 'A Tower With One Window',
  note: 'No door at all. Something very long and golden is hanging out of the top.',
  place: 'surface',
  biomes: ['meadow', 'forest', 'rocky'],
  weight: 6,
  reach: 60,
  thumb: { scale: 0.9, offsetY: 14 },
  draw(ctx, t) {
    // A tall, slightly tapered tower.
    ctx.beginPath()
    ctx.moveTo(-20, 0)
    ctx.lineTo(-15, -112)
    ctx.lineTo(15, -112)
    ctx.lineTo(20, 0)
    ctx.closePath()
    shapeFill(ctx, '#b5aa96', 2.2)
    // Stonework.
    ink(ctx, 1, withAlpha(INK, 0.22))
    for (let i = 1; i < 12; i++) {
      const y = -i * 9.5
      const halfW = 20 - (i / 12) * 5
      ctx.beginPath()
      ctx.moveTo(-halfW, y)
      ctx.lineTo(halfW, y)
      ctx.stroke()
    }
    // Battlements and a conical roof.
    for (let i = 0; i < 4; i++) {
      roundRectPath(ctx, -16 + i * 9, -120, 6, 9, 1)
      shapeFill(ctx, '#a89d8a', 1.4)
    }
    ctx.beginPath()
    ctx.moveTo(-19, -120)
    ctx.lineTo(0, -146)
    ctx.lineTo(19, -120)
    ctx.closePath()
    shapeFill(ctx, '#7a5a6a', 2)
    // The one window, arched and lit.
    ctx.beginPath()
    ctx.moveTo(-7, -78)
    ctx.lineTo(-7, -94)
    ctx.quadraticCurveTo(0, -102, 7, -94)
    ctx.lineTo(7, -78)
    ctx.closePath()
    shapeFill(ctx, withAlpha('#f6dd9c', 0.9), 2)
    // A very long braid coming out of it and down the wall.
    ink(ctx, 4.5, '#e8c45c')
    ctx.beginPath()
    ctx.moveTo(2, -84)
    for (let i = 0; i <= 14; i++) {
      const p = i / 14
      ctx.lineTo(8 + Math.sin(p * 7 + t * 0.5) * 5, -80 + p * 78)
    }
    ctx.stroke()
    // Plaits, as little cross-ties.
    ink(ctx, 1.4, withAlpha('#a5782c', 0.6))
    for (let i = 1; i < 14; i += 2) {
      const p = i / 14
      const bx = 8 + Math.sin(p * 7 + t * 0.5) * 5
      ctx.beginPath()
      ctx.moveTo(bx - 3, -80 + p * 78)
      ctx.lineTo(bx + 3, -80 + p * 78)
      ctx.stroke()
    }
    // A bow at the bottom end.
    ctx.beginPath()
    ctx.arc(8 + Math.sin(7 + t * 0.5) * 5, 0, 3, 0, TAU)
    shapeFill(ctx, '#c04a6a', 1.2)
  },
}

const BRASS_LAMP: EasterEgg = {
  id: 'brass-lamp',
  title: 'A Lamp With Something In It',
  note: 'Half buried, badly dented, and warm to the touch. It hums when you rub it.',
  place: 'surface',
  biomes: ['desert'],
  weight: 7,
  reach: 38,
  thumb: { scale: 2.2 },
  draw(ctx, t) {
    // Sand drifted over one end.
    ctx.beginPath()
    ctx.ellipse(0, 0, 30, 7, 0, Math.PI, TAU)
    ctx.closePath()
    ctx.fillStyle = withAlpha('#d8bd92', 0.8)
    ctx.fill()
    // The lamp: a squat teardrop with a spout and a curled handle.
    ctx.save()
    ctx.translate(0, -8)
    ctx.rotate(-0.1)
    ctx.beginPath()
    ctx.moveTo(-14, 4)
    ctx.quadraticCurveTo(-16, -8, 0, -9)
    ctx.quadraticCurveTo(15, -8, 13, 4)
    ctx.closePath()
    shapeFill(ctx, '#d8a94c', 2)
    ctx.beginPath()
    ctx.moveTo(-13, -2)
    ctx.quadraticCurveTo(-24, -4, -28, -12)
    ctx.quadraticCurveTo(-22, -8, -13, -6)
    ctx.closePath()
    shapeFill(ctx, '#c9993c', 1.6)
    ink(ctx, 2.4, '#c9993c')
    ctx.beginPath()
    ctx.moveTo(12, -2)
    ctx.quadraticCurveTo(22, -6, 16, -12)
    ctx.stroke()
    roundRectPath(ctx, -3, -13, 6, 5, 1.5)
    shapeFill(ctx, '#c9993c', 1.4)
    // A dent, and a highlight along the belly.
    ink(ctx, 1.2, withAlpha(CREAM, 0.5))
    ctx.beginPath()
    ctx.moveTo(-8, 1)
    ctx.quadraticCurveTo(-2, -3, 6, 0)
    ctx.stroke()
    ctx.restore()
    // Smoke leaving the spout, thinking about becoming a shape.
    ctx.save()
    for (let i = 0; i < 5; i++) {
      const p = (t * 0.3 + i * 0.2) % 1
      const y = -22 - p * 44
      const x = -24 + Math.sin(p * 6) * 8 * p + p * 18
      ctx.beginPath()
      ctx.arc(x, y, 3 + p * 9, 0, TAU)
      ctx.fillStyle = withAlpha('#a89ac8', 0.3 * (1 - p))
      ctx.fill()
    }
    // Two eyes appearing in the top of the plume.
    const eye = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.7))
    for (const ex of [-5, 5]) {
      ctx.beginPath()
      ctx.arc(-6 + ex, -62, 1.8, 0, TAU)
      ctx.fillStyle = withAlpha('#e8e2f0', eye)
      ctx.fill()
    }
    ctx.restore()
  },
}

const TRAVELLING_CHAIR: EasterEgg = {
  id: 'travelling-chair',
  title: 'The Chair That Travels',
  note: 'Brass, buttoned leather, one big lever. The dial beside it reads a very long number.',
  place: 'surface',
  biomes: ['crystal', 'rocky', 'ice'],
  weight: 5,
  reach: 48,
  thumb: { scale: 1.6 },
  draw(ctx, t) {
    // Base and runners.
    roundRectPath(ctx, -26, -8, 52, 8, 2)
    shapeFill(ctx, '#8a7c5c', 2)
    // Seat and back.
    roundRectPath(ctx, -18, -22, 36, 14, 3)
    shapeFill(ctx, '#7a4a3c', 2)
    roundRectPath(ctx, -18, -48, 12, 28, 3)
    shapeFill(ctx, '#8a5646', 2)
    ctx.fillStyle = withAlpha(INK, 0.3)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 2; c++) {
        ctx.beginPath()
        ctx.arc(-14 + c * 6, -42 + r * 8, 1.1, 0, TAU)
        ctx.fill()
      }
    }
    // The big spinning disc behind the seat.
    ctx.save()
    ctx.translate(12, -34)
    ctx.rotate(t * 1.6)
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.ellipse(0, 0, 17, 6, (i / 3) * Math.PI, 0, TAU)
      ink(ctx, 2, withAlpha('#e8c45c', 0.85))
      ctx.stroke()
    }
    ctx.restore()
    glowDot(ctx, 12, -34, 2.6, '#f6e8b8', 8)
    // Streaks, because it is not entirely here.
    ink(ctx, 1.2, withAlpha('#bfe4ff', 0.35))
    for (let i = 0; i < 4; i++) {
      const y = -46 + i * 11
      ctx.beginPath()
      ctx.moveTo(-34 - ((t * 30 + i * 9) % 16), y)
      ctx.lineTo(-22, y)
      ctx.stroke()
    }
    // The lever, and a dial with far too many digits.
    ink(ctx, 2.4, '#c9a45c')
    ctx.beginPath()
    ctx.moveTo(-4, -22)
    ctx.lineTo(2 + Math.sin(t * 0.5) * 2, -36)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(2 + Math.sin(t * 0.5) * 2, -37, 2.4, 0, TAU)
    shapeFill(ctx, '#e8c45c', 1.2)
    roundRectPath(ctx, -32, -30, 12, 8, 1.5)
    shapeFill(ctx, '#c9c2b0', 1.4)
    ink(ctx, 1, withAlpha(INK, 0.6))
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(-30 + i * 2.6, -27)
      ctx.lineTo(-30 + i * 2.6, -24)
      ctx.stroke()
    }
  },
}

const MOON_CANNON: EasterEgg = {
  id: 'moon-cannon',
  title: 'A Cannon Aimed at the Moon',
  note: 'Nine hundred feet of iron, pointed hopefully upward. Somebody climbed in.',
  place: 'surface',
  biomes: ['desert', 'rocky'],
  weight: 6,
  reach: 78,
  thumb: { scale: 0.95 },
  draw(ctx, t) {
    // Earthworks banked around the breech.
    ctx.beginPath()
    ctx.moveTo(-70, 0)
    ctx.quadraticCurveTo(-40, -22, -6, -18)
    ctx.lineTo(-6, 0)
    ctx.closePath()
    shapeFill(ctx, '#8a6a4e', 2)
    // The barrel, angled at the sky.
    ctx.save()
    ctx.translate(-8, -14)
    ctx.rotate(-0.62)
    roundRectPath(ctx, 0, -13, 108, 26, 4)
    shapeFill(ctx, '#4f4a52', 2.4)
    // Reinforcing bands.
    for (let i = 1; i <= 5; i++) {
      roundRectPath(ctx, i * 17, -15, 5, 30, 2)
      shapeFill(ctx, '#5f5a62', 1.4)
    }
    // The muzzle, and a capsule just visible in it.
    ctx.beginPath()
    ctx.ellipse(108, 0, 5, 13, 0, 0, TAU)
    shapeFill(ctx, '#2b2830', 1.8)
    ctx.beginPath()
    ctx.ellipse(104, 0, 4, 9, 0, 0, TAU)
    shapeFill(ctx, '#c9a45c', 1.4)
    ctx.restore()
    // A wooden gantry alongside it.
    ink(ctx, 2, '#8b6a52')
    for (let i = 0; i < 4; i++) {
      const x = 6 + i * 17
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, -14 - i * 15)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(6, -14)
    ctx.lineTo(57, -59)
    ctx.stroke()
    // Two small figures, looking up, having second thoughts.
    figure(ctx, 74, 0, 18, withAlpha(INK, 0.7))
    figure(ctx, 86, 0, 16, withAlpha(INK, 0.6), 0.06)
    // A thin moon, low, exactly where the barrel is pointing.
    ctx.save()
    ctx.globalAlpha = 0.9
    sun(ctx, -84, -120, 13, '#efe4c4')
    ctx.restore()
    smoke(ctx, -16, -22, t, 3, '#9a9284', 26, 6)
  },
}

const WELL_TRAVELLED_BEAR: EasterEgg = {
  id: 'well-travelled-bear',
  title: 'A Small Bear, Well Travelled',
  note: 'Duffle coat, battered suitcase, and a label asking somebody to please look after him.',
  place: 'surface',
  biomes: ['meadow', 'forest'],
  weight: 6,
  reach: 40,
  thumb: { scale: 2 },
  draw(ctx, t) {
    // A bench end to sit beside, and the suitcase.
    roundRectPath(ctx, 14, -13, 22, 13, 2)
    shapeFill(ctx, '#9a6f4d', 1.8)
    ink(ctx, 1.2, withAlpha(INK, 0.4))
    ctx.beginPath()
    ctx.moveTo(14, -8)
    ctx.lineTo(36, -8)
    ctx.stroke()
    roundRectPath(ctx, 22, -16, 6, 3, 1)
    shapeFill(ctx, '#6b4a34', 1.1)
    // The bear: a rounded coat, small ears, a hat with a floppy brim.
    ctx.save()
    ctx.translate(-8, 0)
    ctx.rotate(Math.sin(t * 0.7) * 0.02)
    // Legs.
    ink(ctx, 3.4, '#8a6a4e')
    ctx.beginPath()
    ctx.moveTo(-4, -8)
    ctx.lineTo(-4, 0)
    ctx.moveTo(4, -8)
    ctx.lineTo(4, 0)
    ctx.stroke()
    // Coat.
    ctx.beginPath()
    ctx.moveTo(-9, -8)
    ctx.quadraticCurveTo(-11, -24, -6, -27)
    ctx.lineTo(6, -27)
    ctx.quadraticCurveTo(11, -24, 9, -8)
    ctx.closePath()
    shapeFill(ctx, '#4f6a86', 2)
    // Toggles.
    ctx.fillStyle = '#e0c27c'
    for (const by of [-22, -16, -11]) {
      ctx.beginPath()
      ctx.arc(0, by, 1.3, 0, TAU)
      ctx.fill()
    }
    // Head.
    ctx.beginPath()
    ctx.arc(0, -33, 8, 0, TAU)
    shapeFill(ctx, '#a8814f', 1.8)
    for (const ex of [-6.5, 6.5]) {
      ctx.beginPath()
      ctx.arc(ex, -39, 3.2, 0, TAU)
      shapeFill(ctx, '#a8814f', 1.4)
    }
    for (const ex of [-2.8, 2.8]) {
      ctx.beginPath()
      ctx.arc(ex, -34, 1.3, 0, TAU)
      ctx.fillStyle = INK
      ctx.fill()
    }
    ctx.beginPath()
    ctx.ellipse(0, -30, 2.4, 1.8, 0, 0, TAU)
    ctx.fillStyle = '#5b3a2e'
    ctx.fill()
    // Hat.
    ctx.beginPath()
    ctx.ellipse(0, -40, 12, 3.4, 0, 0, TAU)
    shapeFill(ctx, '#c04a3c', 1.6)
    ctx.beginPath()
    ctx.moveTo(-6, -40)
    ctx.quadraticCurveTo(0, -50, 6, -40)
    ctx.closePath()
    shapeFill(ctx, '#c04a3c', 1.6)
    // The label, on a string.
    ink(ctx, 1, withAlpha(CREAM, 0.7))
    ctx.beginPath()
    ctx.moveTo(-7, -22)
    ctx.lineTo(-13, -18)
    ctx.stroke()
    ctx.save()
    ctx.translate(-16, -16)
    ctx.rotate(-0.25 + Math.sin(t * 1.2) * 0.06)
    roundRectPath(ctx, -6, -4, 12, 8, 1)
    shapeFill(ctx, withAlpha(CREAM, 0.92), 1.1)
    ink(ctx, 0.9, withAlpha(INK, 0.55))
    ctx.beginPath()
    ctx.moveTo(-4, -1)
    ctx.lineTo(4, -1)
    ctx.moveTo(-4, 1.5)
    ctx.lineTo(2, 1.5)
    ctx.stroke()
    ctx.restore()
    ctx.restore()
  },
}

const BOULDER_HALFWAY: EasterEgg = {
  id: 'boulder-halfway',
  title: 'The Boulder, Halfway Up',
  note: 'It has been exactly halfway up for a very long time. He seems fine about it.',
  place: 'surface',
  biomes: ['rocky', 'desert'],
  weight: 6,
  reach: 64,
  thumb: { scale: 1.1 },
  draw(ctx, t) {
    // A slope, rising to the right.
    ctx.beginPath()
    ctx.moveTo(-76, 0)
    ctx.quadraticCurveTo(-10, -12, 40, -54)
    ctx.lineTo(76, -78)
    ctx.lineTo(76, 0)
    ctx.closePath()
    shapeFill(ctx, '#9a8570', 2.2)
    // A groove worn into it by many previous attempts.
    ink(ctx, 2, withAlpha(INK, 0.22))
    ctx.beginPath()
    ctx.moveTo(-70, -3)
    ctx.quadraticCurveTo(-8, -15, 38, -56)
    ctx.stroke()
    // The boulder, rocking very slightly.
    const rock = Math.sin(t * 0.9) * 2
    ctx.save()
    ctx.translate(6 + rock, -36 - rock * 0.6)
    ctx.rotate(rock * 0.03)
    blobPath(ctx, 0, 0, 20, 515151, { points: 11, wobble: 0.1 })
    shapeFill(ctx, '#8f8a80', 2.2)
    ctx.fillStyle = withAlpha(INK, 0.12)
    for (const [ox, oy, r] of [
      [-6, -5, 5],
      [7, 3, 4],
      [2, -9, 3],
    ] as const) {
      ctx.beginPath()
      ctx.arc(ox, oy, r, 0, TAU)
      ctx.fill()
    }
    ctx.restore()
    // Him, leaning into it, braced.
    ctx.save()
    ctx.translate(-16 + rock, -30 - rock * 0.6)
    ctx.rotate(0.5)
    figure(ctx, 0, 0, 24, withAlpha(INK, 0.78))
    ink(ctx, 2.4, withAlpha(INK, 0.78))
    ctx.beginPath()
    ctx.moveTo(0, -14)
    ctx.lineTo(9, -13)
    ctx.stroke()
    ctx.restore()
  },
}

const BOTTLE_MESSAGE: EasterEgg = {
  id: 'bottle-message',
  title: 'A Bottle With Something to Say',
  note: 'Corked tight and rolled up small. Whoever wrote it is a very long way from here.',
  place: 'surface',
  biomes: ['ocean', 'ice'],
  weight: 7,
  reach: 34,
  thumb: { scale: 2.6 },
  draw(ctx, t) {
    ripples(ctx, 0, -1, t, '#dff0f6', 2)
    ctx.save()
    ctx.translate(0, -8)
    ctx.rotate(-0.36 + Math.sin(t * 0.9) * 0.04)
    // Bottle.
    ctx.beginPath()
    ctx.moveTo(-15, 6)
    ctx.quadraticCurveTo(-17, -6, -6, -8)
    ctx.lineTo(-6, -12)
    ctx.lineTo(4, -12)
    ctx.lineTo(4, -8)
    ctx.quadraticCurveTo(15, -6, 13, 6)
    ctx.closePath()
    ctx.fillStyle = withAlpha('#7fae8c', 0.55)
    ctx.fill()
    ink(ctx, 1.8, withAlpha('#2f4a3c', 0.8))
    ctx.stroke()
    // The rolled note.
    ctx.save()
    ctx.rotate(0.2)
    roundRectPath(ctx, -8, -2, 15, 6, 3)
    shapeFill(ctx, withAlpha(CREAM, 0.95), 1.2)
    ink(ctx, 0.9, withAlpha(INK, 0.4))
    ctx.beginPath()
    ctx.moveTo(-5, 1)
    ctx.lineTo(4, 1)
    ctx.stroke()
    ctx.restore()
    // Cork, and a highlight down the glass.
    roundRectPath(ctx, -5, -17, 8, 6, 2)
    shapeFill(ctx, '#b08c62', 1.3)
    ink(ctx, 1.4, withAlpha(CREAM, 0.6))
    ctx.beginPath()
    ctx.moveTo(-11, 2)
    ctx.quadraticCurveTo(-13, -4, -6, -6)
    ctx.stroke()
    ctx.restore()
  },
}

const POLITE_TENTACLE: EasterEgg = {
  id: 'polite-tentacle',
  title: 'An Arm From Below, Being Polite',
  note: 'Enormous, patient, and holding out one small shell as though offering it.',
  place: 'surface',
  biomes: ['ocean'],
  weight: 5,
  reach: 86,
  thumb: { scale: 0.95 },
  draw(ctx, t) {
    const curl = Math.sin(t * 0.5)
    // One great arm rising out of the water and curling over.
    ctx.beginPath()
    ctx.moveTo(-46, 6)
    ctx.quadraticCurveTo(-52, -50, -12, -74)
    ctx.quadraticCurveTo(24, -94, 44, -62 + curl * 6)
    ctx.quadraticCurveTo(52, -46, 34, -44 + curl * 6)
    ctx.quadraticCurveTo(34, -66, 6, -58)
    ctx.quadraticCurveTo(-26, -46, -18, 6)
    ctx.closePath()
    shapeFill(ctx, '#8a5a78', 2.4)
    // Suckers along the underside.
    ctx.fillStyle = withAlpha('#e8c0d0', 0.75)
    for (let i = 0; i < 11; i++) {
      const p = i / 10
      const x = -34 + p * 62
      const y = 0 - Math.sin(p * 2.1) * 52 - 4
      ctx.beginPath()
      ctx.arc(x, y, 3.4 - p * 1.4, 0, TAU)
      ctx.fill()
    }
    // A shell balanced on the very tip, offered up.
    ctx.save()
    ctx.translate(38, -50 + curl * 6)
    ctx.rotate(-0.3 + curl * 0.06)
    ctx.beginPath()
    ctx.moveTo(-7, 0)
    ctx.quadraticCurveTo(-8, -10, 0, -11)
    ctx.quadraticCurveTo(8, -10, 7, 0)
    ctx.closePath()
    shapeFill(ctx, '#f0c0bb', 1.6)
    ink(ctx, 1, withAlpha(INK, 0.35))
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 2.6, -1)
      ctx.quadraticCurveTo(i * 3.4, -6, i * 1.8, -10.5)
      ctx.stroke()
    }
    ctx.restore()
    ripples(ctx, -32, 4, t, '#dff0f6', 2)
  },
}

const THREAD_INTO_MAZE: EasterEgg = {
  id: 'thread-into-maze',
  title: 'A Thread Into the Maze',
  note: 'Tied off at the entrance and running in. Somebody was thinking ahead.',
  place: 'surface',
  biomes: ['rocky', 'crystal', 'desert'],
  weight: 6,
  reach: 62,
  thumb: { scale: 1.05 },
  draw(ctx, t) {
    // A wall with a dark opening, and maze corridors visible through it.
    brickWall(ctx, -66, -60, 132, 60, '#a09884', 8)
    ctx.save()
    roundRectPath(ctx, -15, -46, 30, 46, 2)
    ctx.fillStyle = '#181420'
    ctx.fill()
    ctx.clip()
    // Suggestion of turnings inside, receding.
    ink(ctx, 3, withAlpha('#5f5a52', 0.9))
    ctx.beginPath()
    ctx.moveTo(-9, 0)
    ctx.lineTo(-9, -26)
    ctx.lineTo(4, -26)
    ctx.lineTo(4, -14)
    ctx.stroke()
    ink(ctx, 2, withAlpha('#4a463f', 0.9))
    ctx.beginPath()
    ctx.moveTo(9, 0)
    ctx.lineTo(9, -34)
    ctx.stroke()
    ctx.restore()
    ink(ctx, 2)
    roundRectPath(ctx, -15, -46, 30, 46, 2)
    ctx.stroke()
    // The thread: tied to a peg outside, running in and away.
    ink(ctx, 2.6, '#8b6a52')
    ctx.beginPath()
    ctx.moveTo(-40, 0)
    ctx.lineTo(-40, -12)
    ctx.stroke()
    ink(ctx, 1.6, '#c04a56')
    ctx.beginPath()
    ctx.moveTo(-40, -11)
    ctx.quadraticCurveTo(-30, -6, -18, -8)
    ctx.quadraticCurveTo(-8, -10, -8, -22)
    ctx.lineTo(-8, -34)
    ctx.stroke()
    // A ball of it, mostly unwound, on the ground.
    ctx.beginPath()
    ctx.arc(-52, -6, 6, 0, TAU)
    shapeFill(ctx, '#c04a56', 1.4)
    ink(ctx, 0.9, withAlpha(CREAM, 0.4))
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(-52, -6, 2 + i * 1.6, 0.4 + i, 3 + i)
      ctx.stroke()
    }
    // Something a long way in shifting its weight.
    const thud = Math.sin(t * 0.6) > 0.9 ? 1 : 0
    if (thud) {
      ink(ctx, 1.6, withAlpha('#c8b48c', 0.4))
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath()
        ctx.arc(0, -22, 6 + i * 6, -2.4, -0.7)
        ctx.stroke()
      }
    }
  },
}

const SCATTERED_FEATHERS: EasterEgg = {
  id: 'scattered-feathers',
  title: 'Wings, and the Feathers That Left Them',
  note: 'Wax at the joints, softened. Whoever wore these was told, and went up anyway.',
  place: 'surface',
  biomes: ['desert', 'rocky', 'ocean'],
  weight: 6,
  reach: 56,
  thumb: { scale: 1.35 },
  draw(ctx, t) {
    // A wooden frame, one wing largely bare.
    for (const side of [-1, 1]) {
      ctx.save()
      ctx.translate(side * 8, -14)
      ctx.rotate(side * (0.35 + (side > 0 ? 0.12 : 0)))
      ink(ctx, 2.6, '#8b6a52')
      ctx.beginPath()
      ctx.moveTo(0, 14)
      ctx.quadraticCurveTo(6, -14, 34, -28)
      ctx.stroke()
      // Quills; the right wing has lost most of them.
      const count = side > 0 ? 3 : 8
      for (let i = 0; i < 8; i++) {
        const p = i / 7
        const bx = p * 30
        const by = 12 - p * 38
        if (i >= count) continue
        leafPath(ctx, bx, by, 16 - p * 4, 4.5, 1.9 + p * 0.5)
        shapeFill(ctx, withAlpha(CREAM, 0.92), 1.1)
      }
      ctx.restore()
    }
    // Straps.
    ink(ctx, 2, '#6b4a34')
    ctx.beginPath()
    ctx.moveTo(-8, -8)
    ctx.lineTo(8, -8)
    ctx.moveTo(-6, -16)
    ctx.lineTo(6, -16)
    ctx.stroke()
    // Loose feathers on the ground and one still drifting down.
    for (let i = 0; i < 6; i++) {
      const rng = scatter(i * 733)
      ctx.save()
      ctx.translate(rng.range(-56, 56), rng.range(-4, 0))
      ctx.rotate(rng.range(0, Math.PI))
      leafPath(ctx, 0, 0, 12, 3.6, 0)
      shapeFill(ctx, withAlpha(CREAM, 0.85), 1)
      ctx.restore()
    }
    const fy = -80 + ((t * 11) % 76)
    ctx.save()
    ctx.translate(34 + Math.sin(fy * 0.11) * 9, fy)
    ctx.rotate(Math.sin(fy * 0.1) * 0.7)
    leafPath(ctx, 0, 0, 13, 4, -1.4)
    shapeFill(ctx, withAlpha(CREAM, 0.9), 1)
    ctx.restore()
    // A sun, high and unhelpful.
    sun(ctx, 52, -96, 9, '#f6c76a')
  },
}

const HUMMING_CHEST: EasterEgg = {
  id: 'humming-chest',
  title: 'A Chest, Slightly Open',
  note: 'Not locked. Something inside is lit, and holding a single sustained note.',
  place: 'surface',
  weight: 6,
  reach: 40,
  thumb: { scale: 2 },
  draw(ctx, t) {
    // Light escaping the gap, first, so the lid sits over it.
    const lift = 5 + Math.sin(t * 1.1) * 1.2
    const g = ctx.createLinearGradient(0, -14, 0, -46)
    g.addColorStop(0, withAlpha('#f6e8b8', 0.4))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(-11, -14)
    ctx.lineTo(11, -14)
    ctx.lineTo(20, -46)
    ctx.lineTo(-20, -46)
    ctx.closePath()
    ctx.fill()
    // Body.
    roundRectPath(ctx, -16, -14, 32, 14, 2)
    shapeFill(ctx, '#8a6a4e', 2)
    // Iron bands and a lock plate.
    for (const bx of [-10, 8]) {
      roundRectPath(ctx, bx, -15, 4, 16, 1)
      shapeFill(ctx, '#7a7568', 1.2)
    }
    roundRectPath(ctx, -3, -12, 6, 6, 1)
    shapeFill(ctx, '#c9a45c', 1.2)
    // Lid, propped open.
    ctx.save()
    ctx.translate(-16, -14)
    ctx.rotate(-0.4 - lift * 0.02)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -7)
    ctx.quadraticCurveTo(16, -13, 32, -7)
    ctx.lineTo(32, 0)
    ctx.closePath()
    shapeFill(ctx, '#9a7756', 2)
    ctx.restore()
    // Three notes rising out of it.
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.5 + i * 0.33) % 1
      const nx = Math.sin(p * 5 + i * 2) * 12
      const ny = -20 - p * 40
      ctx.save()
      ctx.globalAlpha = 1 - p
      ctx.beginPath()
      ctx.ellipse(nx, ny, 3, 2.2, -0.3, 0, TAU)
      ctx.fillStyle = '#f6e8b8'
      ctx.fill()
      ink(ctx, 1.4, '#f6e8b8')
      ctx.beginPath()
      ctx.moveTo(nx + 2.8, ny - 0.6)
      ctx.lineTo(nx + 2.8, ny - 8)
      ctx.stroke()
      ctx.restore()
    }
  },
}

const TORTOISE_AND_HARE: EasterEgg = {
  id: 'tortoise-and-hare',
  title: 'The Tortoise and the Sleeping Hare',
  note: 'One of them is having a lie down. The other has not stopped once.',
  place: 'surface',
  biomes: ['meadow', 'desert', 'forest'],
  weight: 6,
  reach: 52,
  thumb: { scale: 1.5 },
  draw(ctx, t) {
    // A finish line, tantalisingly close on the right.
    ink(ctx, 2.4, '#8b6a52')
    ctx.beginPath()
    ctx.moveTo(52, 0)
    ctx.lineTo(52, -34)
    ctx.stroke()
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 === 0 ? CREAM : withAlpha(INK, 0.6)
      ctx.fillRect(52, -34 + i * 5, 14, 5)
    }
    // The hare, flat out asleep under a tuft of grass.
    ctx.save()
    ctx.translate(-38, -5)
    blobPath(ctx, 0, 0, 15, 2222, { points: 13, wobble: 0.08, squash: 0.5 })
    shapeFill(ctx, '#c9b294', 1.8)
    // Long ears, laid back.
    for (const off of [-1, 2]) {
      leafPath(ctx, -8 + off, -3, 17, 4.2, Math.PI - 0.25)
      shapeFill(ctx, '#c9b294', 1.3)
    }
    // Closed eye and a snore.
    ink(ctx, 1.2, INK)
    ctx.beginPath()
    ctx.moveTo(6, -3)
    ctx.lineTo(10, -3)
    ctx.stroke()
    ctx.save()
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.4)
    ctx.font = '600 9px ui-rounded, system-ui, sans-serif'
    ctx.fillStyle = CREAM
    ctx.fillText('z', 14, -12)
    ctx.fillText('z', 19, -19)
    ctx.restore()
    ctx.restore()
    ink(ctx, 1.4, '#7d9c62')
    for (let i = 0; i < 5; i++) {
      const x = -50 + i * 6
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + Math.sin(t + i) * 2, -11)
      ctx.stroke()
    }
    // The tortoise, plodding, nearly there.
    ctx.save()
    ctx.translate(26 + Math.sin(t * 0.4) * 3, 0)
    ink(ctx, 2.6, '#7a8a5c')
    for (let i = 0; i < 2; i++) {
      const lx = -6 + i * 12
      ctx.beginPath()
      ctx.moveTo(lx, -5)
      ctx.lineTo(lx + Math.sin(t * 2 + i * 3) * 2, 0)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.ellipse(0, -8, 15, 9, 0, Math.PI, TAU)
    ctx.closePath()
    shapeFill(ctx, '#6f7a4c', 2)
    ink(ctx, 1.2, withAlpha(INK, 0.4))
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 7, -8)
      ctx.lineTo(i * 5, -16)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.ellipse(17, -7, 7, 5, -0.15, 0, TAU)
    shapeFill(ctx, '#8a9a6c', 1.6)
    ctx.beginPath()
    ctx.arc(21, -8, 1.2, 0, TAU)
    ctx.fillStyle = INK
    ctx.fill()
    ctx.restore()
  },
}

const TEA_PARTY: EasterEgg = {
  id: 'tea-party',
  title: 'A Teapot and Too Many Cups',
  note: 'Laid for six, drifting in formation, and still perfectly full.',
  place: 'space',
  weight: 5,
  reach: 120,
  thumb: { scale: 1.2 },
  draw(ctx, t) {
    // The teapot at the centre, turning slowly.
    ctx.save()
    ctx.rotate(Math.sin(t * 0.3) * 0.14)
    ctx.beginPath()
    ctx.moveTo(-22, 10)
    ctx.quadraticCurveTo(-26, -12, 0, -14)
    ctx.quadraticCurveTo(26, -12, 22, 10)
    ctx.quadraticCurveTo(0, 18, -22, 10)
    ctx.closePath()
    shapeFill(ctx, '#efe6d2', 2.2)
    // Spout, handle, lid.
    ctx.beginPath()
    ctx.moveTo(-20, -2)
    ctx.quadraticCurveTo(-34, -6, -36, -18)
    ctx.quadraticCurveTo(-28, -10, -19, -8)
    ctx.closePath()
    shapeFill(ctx, '#e4d9c2', 1.6)
    ink(ctx, 3.4, '#e4d9c2')
    ctx.beginPath()
    ctx.moveTo(21, -4)
    ctx.quadraticCurveTo(34, -2, 26, 8)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(0, -14, 9, 3.4, 0, 0, TAU)
    shapeFill(ctx, '#e4d9c2', 1.4)
    ctx.beginPath()
    ctx.arc(0, -19, 2.6, 0, TAU)
    shapeFill(ctx, '#c04a56', 1.2)
    // A blue floral band, abstracted to dots.
    ctx.fillStyle = '#5f7fa8'
    for (let i = 0; i < 7; i++) {
      ctx.beginPath()
      ctx.arc(-16 + i * 5.4, 2, 1.5, 0, TAU)
      ctx.fill()
    }
    ctx.restore()
    // A ribbon of tea leaving the spout and looping back into a cup.
    ink(ctx, 2.4, withAlpha('#b5844c', 0.8))
    ctx.beginPath()
    ctx.moveTo(-36, -18)
    ctx.quadraticCurveTo(-64, -40, -70, -8)
    ctx.stroke()
    // Six cups and saucers in orbit.
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + t * 0.22
      const r = 66 + (i % 2) * 12
      const cx = Math.cos(a) * r
      const cy = Math.sin(a) * r * 0.62
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(Math.sin(t * 0.5 + i) * 0.5)
      ctx.beginPath()
      ctx.ellipse(0, 6, 11, 3, 0, 0, TAU)
      shapeFill(ctx, '#e4d9c2', 1.3)
      ctx.beginPath()
      ctx.moveTo(-7, 0)
      ctx.quadraticCurveTo(-8, 5, 0, 5)
      ctx.quadraticCurveTo(8, 5, 7, 0)
      ctx.closePath()
      shapeFill(ctx, '#efe6d2', 1.4)
      // Tea, still level, which it should not be.
      ctx.beginPath()
      ctx.ellipse(0, 0, 6.4, 1.6, 0, 0, TAU)
      ctx.fillStyle = '#a5743c'
      ctx.fill()
      ink(ctx, 1.4, '#e4d9c2')
      ctx.beginPath()
      ctx.arc(9, 2, 3, -1.2, 1.2)
      ctx.stroke()
      ctx.restore()
    }
  },
}

const GLASS_LIFT: EasterEgg = {
  id: 'glass-lift',
  title: 'A Glass Lift, Going Up',
  note: 'Buttons for nine hundred floors, none of which are in a building.',
  place: 'space',
  weight: 5,
  reach: 115,
  thumb: { scale: 1.4 },
  draw(ctx, t) {
    const rise = Math.sin(t * 0.4) * 5
    ctx.save()
    ctx.translate(0, rise)
    // A glass box with a brass frame.
    roundRectPath(ctx, -26, -34, 52, 68, 3)
    ctx.fillStyle = withAlpha('#bfe0ee', 0.2)
    ctx.fill()
    ink(ctx, 3, '#e8c45c')
    ctx.stroke()
    // Frame members.
    ink(ctx, 2, '#d8a94c')
    ctx.beginPath()
    ctx.moveTo(-26, -6)
    ctx.lineTo(26, -6)
    ctx.moveTo(0, -34)
    ctx.lineTo(0, 34)
    ctx.stroke()
    // Two passengers, one delighted, one holding the rail.
    figure(ctx, -12, 30, 26, '#8a5a6a')
    figure(ctx, 12, 30, 20, '#4f6a86', 0.1)
    ink(ctx, 2, '#8a5a6a')
    ctx.beginPath()
    ctx.moveTo(-12, 12)
    ctx.lineTo(-19, 2)
    ctx.stroke()
    // A panel of far too many buttons.
    roundRectPath(ctx, 16, 2, 8, 26, 2)
    shapeFill(ctx, withAlpha('#c9c2b0', 0.9), 1.2)
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 2; c++) {
        ctx.beginPath()
        ctx.arc(18.5 + c * 3, 5 + r * 4, 1, 0, TAU)
        ctx.fillStyle = (r * 2 + c) === 7 ? '#f0b24c' : withAlpha(INK, 0.4)
        ctx.fill()
      }
    }
    // Highlight down the glass.
    ink(ctx, 2, withAlpha(CREAM, 0.4))
    ctx.beginPath()
    ctx.moveTo(-20, 24)
    ctx.lineTo(-14, -28)
    ctx.stroke()
    ctx.restore()
    // A jet of sparks underneath, doing the actual work.
    for (let i = 0; i < 7; i++) {
      const p = (t * 1.4 + i / 7) % 1
      ctx.beginPath()
      ctx.arc(Math.sin(i * 2.3) * 14 * p, 40 + rise + p * 46, 3 * (1 - p), 0, TAU)
      ctx.fillStyle = withAlpha('#f6c86a', 0.8 * (1 - p))
      ctx.fill()
    }
  },
}

const WICKER_BASKET: EasterEgg = {
  id: 'wicker-basket',
  title: 'A Wicker Basket, Very High Up',
  note: 'Sandbags, a brass barometer, and a plan to be round the world by Tuesday.',
  place: 'space',
  weight: 5,
  reach: 130,
  thumb: { scale: 1 },
  draw(ctx, t) {
    const sway = Math.sin(t * 0.45) * 4
    ctx.save()
    ctx.translate(sway, 0)
    ctx.rotate(Math.sin(t * 0.45) * 0.04)
    // The envelope: a striped balloon.
    ctx.beginPath()
    ctx.moveTo(-42, -30)
    ctx.quadraticCurveTo(-52, -96, 0, -100)
    ctx.quadraticCurveTo(52, -96, 42, -30)
    ctx.quadraticCurveTo(0, -12, -42, -30)
    ctx.closePath()
    shapeFill(ctx, '#e8dcc0', 2.4)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(-42, -30)
    ctx.quadraticCurveTo(-52, -96, 0, -100)
    ctx.quadraticCurveTo(52, -96, 42, -30)
    ctx.quadraticCurveTo(0, -12, -42, -30)
    ctx.closePath()
    ctx.clip()
    for (let i = -3; i <= 3; i++) {
      if (i % 2 !== 0) continue
      ctx.beginPath()
      ctx.moveTo(i * 14 - 6, -104)
      ctx.quadraticCurveTo(i * 20, -56, i * 14 - 6, -8)
      ctx.lineTo(i * 14 + 8, -8)
      ctx.quadraticCurveTo(i * 20 + 14, -56, i * 14 + 8, -104)
      ctx.closePath()
      ctx.fillStyle = withAlpha('#c04a56', 0.7)
      ctx.fill()
    }
    ctx.restore()
    // Rigging.
    ink(ctx, 1.2, withAlpha(INK, 0.5))
    for (const rx of [-20, -7, 7, 20]) {
      ctx.beginPath()
      ctx.moveTo(rx * 1.5, -22)
      ctx.lineTo(rx * 0.55, 6)
      ctx.stroke()
    }
    // The basket.
    roundRectPath(ctx, -15, 6, 30, 20, 3)
    shapeFill(ctx, '#b08c62', 2)
    ink(ctx, 1, withAlpha(INK, 0.35))
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(-15, 10 + i * 4)
      ctx.lineTo(15, 10 + i * 4)
      ctx.stroke()
    }
    // A head over the rim and a hand on a brass instrument.
    ctx.beginPath()
    ctx.arc(-4, 3, 4.4, 0, TAU)
    ctx.fillStyle = withAlpha(INK, 0.7)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(10, 4, 3, 0, TAU)
    shapeFill(ctx, '#e8c45c', 1.1)
    // Sandbags, one already cut loose.
    for (const bx of [-17, 17]) {
      ctx.beginPath()
      ctx.ellipse(bx, 28, 4, 6, 0, 0, TAU)
      shapeFill(ctx, '#9a8468', 1.3)
    }
    ctx.restore()
    ctx.save()
    const drop = ((t * 26) % 90)
    ctx.beginPath()
    ctx.ellipse(sway + 24, 34 + drop, 4, 6, 0.3, 0, TAU)
    ctx.fillStyle = withAlpha('#9a8468', Math.max(0, 1 - drop / 90))
    ctx.fill()
    ctx.restore()
  },
}

const UMBRELLA_DESCENT: EasterEgg = {
  id: 'umbrella-descent',
  title: 'Someone Coming Down by Umbrella',
  note: 'Carpet bag, neat hat, and absolutely no concern about the drop.',
  place: 'space',
  weight: 5,
  reach: 110,
  thumb: { scale: 1.4 },
  draw(ctx, t) {
    const drift = Math.sin(t * 0.5) * 6
    ctx.save()
    ctx.translate(drift, Math.sin(t * 0.8) * 3)
    ctx.rotate(Math.sin(t * 0.5) * 0.05)
    // The canopy.
    ctx.beginPath()
    ctx.moveTo(-40, -34)
    for (let i = 0; i < 5; i++) {
      const x0 = -40 + i * 16
      ctx.quadraticCurveTo(x0 + 8, -48, x0 + 16, -34)
    }
    ctx.quadraticCurveTo(0, -26, -40, -34)
    ctx.closePath()
    shapeFill(ctx, '#3f5a6a', 2.4)
    // Ribs.
    ink(ctx, 1.2, withAlpha(INK, 0.4))
    for (let i = 1; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(0, -30)
      ctx.lineTo(-40 + i * 16, -34)
      ctx.stroke()
    }
    // Shaft and a handle shaped like a bird's head.
    ink(ctx, 2.4, '#6b4a34')
    ctx.beginPath()
    ctx.moveTo(0, -30)
    ctx.lineTo(0, 4)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, 2)
    ctx.quadraticCurveTo(7, 2, 8, 8)
    ctx.quadraticCurveTo(3, 7, 0, 6)
    ctx.closePath()
    shapeFill(ctx, '#8a6a4e', 1.3)
    // Her: coat, hat, one hand up, the other with a bag.
    figure(ctx, -2, 40, 38, '#4a4358')
    ctx.beginPath()
    ctx.ellipse(-2, 12, 14, 3.6, 0, 0, TAU)
    shapeFill(ctx, '#332e40', 1.6)
    roundRectPath(ctx, -9, 3, 14, 10, 2)
    shapeFill(ctx, '#332e40', 1.6)
    ctx.beginPath()
    ctx.arc(2, 6, 2, 0, TAU)
    ctx.fillStyle = '#c04a56'
    ctx.fill()
    ink(ctx, 2.6, '#3a3444')
    ctx.beginPath()
    ctx.moveTo(-2, 20)
    ctx.lineTo(0, 6)
    ctx.stroke()
    // The carpet bag.
    ctx.save()
    ctx.translate(14, 30)
    ctx.rotate(Math.sin(t * 1.1) * 0.1)
    roundRectPath(ctx, -8, -7, 16, 13, 3)
    shapeFill(ctx, '#7a4a5c', 1.8)
    ink(ctx, 1.4, '#c9a45c')
    ctx.beginPath()
    ctx.moveTo(-5, -7)
    ctx.quadraticCurveTo(0, -13, 5, -7)
    ctx.stroke()
    ctx.fillStyle = withAlpha('#e8c45c', 0.7)
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(-4 + i * 4, -1, 1.4, 0, TAU)
      ctx.fill()
    }
    ctx.restore()
    ink(ctx, 2.4, '#3a3444')
    ctx.beginPath()
    ctx.moveTo(4, 20)
    ctx.lineTo(13, 24)
    ctx.stroke()
    ctx.restore()
  },
}

const RED_BALLOON: EasterEgg = {
  id: 'red-balloon',
  title: 'A Single Red Balloon',
  note: 'Nobody holding the string. It has been following you for three systems.',
  place: 'space',
  weight: 6,
  reach: 90,
  thumb: { scale: 1.9 },
  draw(ctx, t) {
    const sway = Math.sin(t * 0.6) * 8
    ctx.save()
    ctx.translate(sway, Math.sin(t * 0.9) * 4)
    ctx.rotate(Math.sin(t * 0.6) * 0.08)
    ctx.beginPath()
    ctx.ellipse(0, 0, 22, 25, 0, 0, TAU)
    shapeFill(ctx, '#d4443c', 2.2)
    // Knot and a very long string.
    ctx.beginPath()
    ctx.moveTo(-3, 24)
    ctx.lineTo(3, 24)
    ctx.lineTo(0, 30)
    ctx.closePath()
    shapeFill(ctx, '#b8352e', 1.4)
    ink(ctx, 1, withAlpha(CREAM, 0.5))
    ctx.beginPath()
    ctx.moveTo(0, 30)
    for (let i = 1; i <= 8; i++) {
      ctx.lineTo(Math.sin(t * 0.9 + i * 0.6) * i * 1.6, 30 + i * 11)
    }
    ctx.stroke()
    // Highlight, and a reflected star or two.
    ctx.beginPath()
    ctx.ellipse(-7, -9, 6, 8, -0.4, 0, TAU)
    ctx.fillStyle = withAlpha(CREAM, 0.35)
    ctx.fill()
    ctx.fillStyle = withAlpha(CREAM, 0.7)
    for (const [px, py] of [
      [8, 4],
      [4, 12],
    ] as const) {
      ctx.beginPath()
      ctx.arc(px, py, 1, 0, TAU)
      ctx.fill()
    }
    ctx.restore()
  },
}

const CLOUD_DRAGON: EasterEgg = {
  id: 'cloud-dragon',
  title: 'A Dragon Made of Cloud',
  note: 'Enormous, soft-edged, and apparently asleep. It rolls over as you pass.',
  place: 'space',
  weight: 4,
  reach: 170,
  thumb: { scale: 0.6 },
  draw(ctx, t) {
    const roll = Math.sin(t * 0.3)
    // The spine: one long S through the frame, thickest a third of the way
    // along. Stacking cloud puffs along a curve just makes a mountain range —
    // a tapered ribbon is what reads as one continuous animal.
    const N = 40
    const spine: { x: number; y: number; w: number }[] = []
    for (let i = 0; i <= N; i++) {
      const p = i / N
      spine.push({
        x: -172 + p * 300,
        y: Math.sin(p * 5.2 + roll * 0.5) * 44 - p * 10,
        // Thin at the tail, full through the body, narrowing into the neck.
        w: 4 + Math.sin(Math.pow(p, 0.65) * Math.PI) * 26,
      })
    }
    // Walk one side and back down the other to close the ribbon.
    const edge = (sign: number) => {
      for (let i = 0; i <= N; i++) {
        const k = sign > 0 ? i : N - i
        const s = spine[k]
        const prev = spine[Math.max(0, k - 1)]
        const next = spine[Math.min(N, k + 1)]
        const dx = next.x - prev.x
        const dy = next.y - prev.y
        const len = Math.hypot(dx, dy) || 1
        const nx = (-dy / len) * s.w * sign
        const ny = (dx / len) * s.w * sign
        if (i === 0 && sign > 0) ctx.moveTo(s.x + nx, s.y + ny)
        else ctx.lineTo(s.x + nx, s.y + ny)
      }
    }
    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    edge(1)
    edge(-1)
    ctx.closePath()
    ctx.fillStyle = '#eceef4'
    ctx.fill()
    // A soft shadow along the underside, to give the coil some roundness.
    ctx.save()
    ctx.clip()
    for (let i = 0; i <= N; i += 2) {
      const s = spine[i]
      ctx.beginPath()
      ctx.arc(s.x, s.y + s.w * 0.45, s.w * 0.62, 0, TAU)
      ctx.fillStyle = withAlpha('#b8c0d4', 0.16)
      ctx.fill()
    }
    ctx.restore()
    // Puffs along the top edge, so the silhouette still reads as cloud.
    for (let i = 2; i < N; i += 3) {
      const s = spine[i]
      ctx.beginPath()
      ctx.arc(s.x, s.y - s.w * 0.55, s.w * 0.5, 0, TAU)
      ctx.fillStyle = '#f4f6fa'
      ctx.fill()
    }
    ctx.restore()
    // Four short legs under the fat part of the body, with claws.
    ctx.save()
    ctx.globalAlpha = 0.8
    for (const i of [12, 18, 24, 30]) {
      const s = spine[i]
      ctx.beginPath()
      ctx.arc(s.x, s.y + s.w + 5, 10, 0, TAU)
      ctx.fillStyle = '#dfe3ec'
      ctx.fill()
      ink(ctx, 1.6, withAlpha('#9aa4c0', 0.8))
      for (const cx of [-5, 0, 5]) {
        ctx.beginPath()
        ctx.moveTo(s.x + cx, s.y + s.w + 9)
        ctx.lineTo(s.x + cx * 1.4, s.y + s.w + 16)
        ctx.stroke()
      }
    }
    ctx.restore()
    // The head, well clear of the neck and much bigger than any coil.
    const neck = spine[N]
    ctx.save()
    ctx.translate(neck.x + 20, neck.y - 4)
    ctx.rotate(-0.34 + roll * 0.07)
    // Skull and a long snout.
    ctx.beginPath()
    ctx.ellipse(0, 0, 34, 24, 0, 0, TAU)
    ctx.fillStyle = '#f4f6fa'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(14, -12)
    ctx.quadraticCurveTo(56, -12, 62, 2)
    ctx.quadraticCurveTo(56, 14, 14, 14)
    ctx.closePath()
    ctx.fillStyle = '#eceef4'
    ctx.fill()
    // A jaw line, slightly open.
    ink(ctx, 2, withAlpha('#9aa4c0', 0.7))
    ctx.beginPath()
    ctx.moveTo(18, 6)
    ctx.quadraticCurveTo(42, 10, 60, 3)
    ctx.stroke()
    // Two horns swept back over the skull.
    ink(ctx, 5, '#dfe3ec')
    for (const hy of [-8, 6]) {
      ctx.beginPath()
      ctx.moveTo(-14, hy - 10)
      ctx.quadraticCurveTo(-38, hy - 26, -54, hy - 18)
      ctx.stroke()
    }
    // A mane of small puffs behind the skull.
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.arc(-24 - i * 6, 6 + i * 5, 9 - i, 0, TAU)
      ctx.fillStyle = '#e4e8f0'
      ctx.fill()
    }
    // Whiskers off the snout, and one heavy-lidded eye.
    ink(ctx, 2.2, withAlpha('#9aa4c0', 0.85))
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(58, side * 6)
      ctx.quadraticCurveTo(86, side * 22 + roll * 7, 106, side * 10)
      ctx.stroke()
    }
    ink(ctx, 3.4, withAlpha('#5f6a8a', 0.9))
    ctx.beginPath()
    ctx.arc(6, -6, 9, 0.2, Math.PI - 0.2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(52, -2, 2.4, 0, TAU)
    ctx.fillStyle = withAlpha('#9aa4c0', 0.85)
    ctx.fill()
    ctx.restore()
    // Wisps coming off the tail.
    ctx.save()
    ctx.globalAlpha = 0.24
    for (let i = 0; i < 4; i++) {
      cloudPath(ctx, -196 - i * 20, spine[0].y - 4 + Math.sin(i) * 12, 28, 10, 8000 + i, 2)
      ctx.fillStyle = '#d8dce8'
      ctx.fill()
    }
    ctx.restore()
  },
}

export const PAGE_EGGS: readonly EasterEgg[] = [
  SNOWY_WARDROBE,
  ROUND_GREEN_DOOR,
  THUMB_AND_TOWEL,
  SMALLEST_DOORS,
  HOLE_WITH_A_WATCH,
  IRON_FISH,
  WHALE_AND_PETUNIAS,
  WORLD_TURTLE,
  THE_STARMAN,
  SWORD_IN_STONE,
  SPIRAL_ROAD,
  STONE_TROLLS,
  TOO_TALL_STALK,
  RING_OVER_FIRE,
  CROWN_ON_STUMP,
  WEB_WITH_WORDS,
  NIBBLED_LEAF,
  WAVING_SNOWMAN,
  GIANT_PEACH,
  DREAM_JARS,
  TOWER_ONE_WINDOW,
  BRASS_LAMP,
  TRAVELLING_CHAIR,
  MOON_CANNON,
  WELL_TRAVELLED_BEAR,
  BOULDER_HALFWAY,
  BOTTLE_MESSAGE,
  POLITE_TENTACLE,
  THREAD_INTO_MAZE,
  SCATTERED_FEATHERS,
  HUMMING_CHEST,
  TORTOISE_AND_HARE,
  TEA_PARTY,
  GLASS_LIFT,
  WICKER_BASKET,
  UMBRELLA_DESCENT,
  RED_BALLOON,
  CLOUD_DRAGON,
]
