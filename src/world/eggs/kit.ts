/**
 * Shared kit for drawing Easter eggs.
 *
 * Every egg is an original silhouette or shape study drawn from scratch in
 * code, and titled descriptively rather than by its source. Nothing here copies
 * a franchise's characters, artwork, logos or names — they're visual rhymes, and
 * recognising them is the whole game.
 *
 * Drawing conventions:
 *   surface eggs — the origin sits on the ground, up is -y, and a person is
 *                  about 26 units tall, matching the surface scene's scale.
 *   space eggs   — the origin is the centre of the vignette.
 */

import { TAU } from '../../core/math'
import { Rng } from '../../core/rng'
import { CREAM, INK, withAlpha } from '../../render/palette'
import { ink, roundRectPath, type Ctx } from '../../render/shapes'
import type { Biome } from '../planet'

export interface EasterEgg {
  id: string
  /** Shown when you find it. Descriptive, never the source's title. */
  title: string
  /** A single gentle line of flavour. */
  note: string
  place: 'surface' | 'space'
  /** Surface eggs only appear on these biomes. Omit for anywhere landable. */
  biomes?: readonly Biome[]
  /** Relative rarity — bigger is more common. */
  weight: number
  /** How close you need to be, in scene units, to discover it. */
  reach: number
  /**
   * Tunes how the drawing is fitted into a sticker-book tile. Vignettes vary
   * hugely in size — a spinning top and a world-carrying turtle both need to
   * fill their square.
   */
  thumb?: { scale?: number; offsetY?: number }
  draw(ctx: Ctx, t: number): void
}

/** Fill and ink the current path in one call. */
export function shapeFill(ctx: Ctx, fill: string, lw = 1.6, stroke = INK) {
  ctx.fillStyle = fill
  ctx.fill()
  ink(ctx, lw, stroke)
  ctx.stroke()
}

/** A simple standing person, feet at (x, y). */
export function figure(ctx: Ctx, x: number, y: number, h: number, color: string, lean = 0) {
  const headR = h * 0.17
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(lean)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(-h * 0.13, 0)
  ctx.quadraticCurveTo(-h * 0.16, -h * 0.5, -h * 0.09, -h * 0.66)
  ctx.lineTo(h * 0.09, -h * 0.66)
  ctx.quadraticCurveTo(h * 0.16, -h * 0.5, h * 0.13, 0)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, -h * 0.66 - headR * 0.8, headR, 0, TAU)
  ctx.fill()
  ctx.restore()
}

/** A star or sun disc with a soft additive halo. */
export function sun(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 4.2)
  g.addColorStop(0, withAlpha(color, 0.55))
  g.addColorStop(0.3, withAlpha(color, 0.16))
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r * 4.2, 0, TAU)
  ctx.fill()
  ctx.restore()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
}

/** A soft point of light, for lamps, lanterns and indicators. */
export function glowDot(ctx: Ctx, x: number, y: number, r: number, color: string, spread = 5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * spread)
  g.addColorStop(0, withAlpha(color, 0.42))
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r * spread, 0, TAU)
  ctx.fill()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
}

/** Rising puffs of smoke or steam. */
export function smoke(
  ctx: Ctx,
  x: number,
  y: number,
  t: number,
  count = 4,
  color = CREAM,
  rise = 30,
  spread = 6,
) {
  for (let i = 0; i < count; i++) {
    const p = (t * 0.35 + i / count) % 1
    ctx.beginPath()
    ctx.arc(x + Math.sin(p * 5 + i) * spread, y - p * rise, 2.5 + p * 5, 0, TAU)
    ctx.fillStyle = withAlpha(color, 0.3 * (1 - p))
    ctx.fill()
  }
}

/** A patch of brickwork, for walls that things are halfway through. */
export function brickWall(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  brickH = 6,
) {
  ctx.save()
  roundRectPath(ctx, x, y, w, h, 1.5)
  ctx.fillStyle = color
  ctx.fill()
  ctx.clip()
  ink(ctx, 1, withAlpha(INK, 0.3))
  const rows = Math.ceil(h / brickH)
  for (let r = 0; r < rows; r++) {
    const ry = y + r * brickH
    ctx.beginPath()
    ctx.moveTo(x, ry)
    ctx.lineTo(x + w, ry)
    ctx.stroke()
    // Offset alternate courses.
    const offset = r % 2 === 0 ? 0 : brickH
    for (let bx = x + offset; bx < x + w; bx += brickH * 2) {
      ctx.beginPath()
      ctx.moveTo(bx, ry)
      ctx.lineTo(bx, ry + brickH)
      ctx.stroke()
    }
  }
  ctx.restore()
  ink(ctx, 1.5)
  roundRectPath(ctx, x, y, w, h, 1.5)
  ctx.stroke()
}

/** A run of fence posts with two rails. */
export function fence(ctx: Ctx, x0: number, x1: number, y: number, h: number, color: string) {
  ink(ctx, 2.2, color)
  for (let x = x0; x <= x1; x += 16) {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y - h)
    ctx.stroke()
  }
  ink(ctx, 1.8, color)
  for (const ry of [y - h * 0.85, y - h * 0.4]) {
    ctx.beginPath()
    ctx.moveTo(x0, ry)
    ctx.lineTo(x1, ry)
    ctx.stroke()
  }
}

/** Expanding rings, for things resting on or breaking water. */
export function ripples(ctx: Ctx, x: number, y: number, t: number, color: string, count = 2) {
  for (let i = 0; i < count; i++) {
    const p = (t * 0.7 + i / count) % 1
    ink(ctx, 1.6, withAlpha(color, 0.5 * (1 - p)))
    ctx.beginPath()
    ctx.ellipse(x, y, 8 + p * 22, (8 + p * 22) * 0.26, 0, 0, TAU)
    ctx.stroke()
  }
}

/** A tapering light trail behind something moving. */
export function trail(ctx: Ctx, x: number, y: number, dx: number, dy: number, color: string, width = 5) {
  const g = ctx.createLinearGradient(x, y, x + dx, y + dy)
  g.addColorStop(0, withAlpha(color, 0.7))
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.strokeStyle = g
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + dx, y + dy)
  ctx.stroke()
}

/** A row of lit windows on a building face. */
export function windows(
  ctx: Ctx,
  x: number,
  y: number,
  cols: number,
  rows: number,
  cw: number,
  ch: number,
  gap: number,
  seed: number,
  lit = '#f6dd9c',
  dark = '#4a5568',
) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = (seed >>> (r * cols + c)) % 3 !== 0
      roundRectPath(ctx, x + c * (cw + gap), y + r * (ch + gap), cw, ch, 1)
      ctx.fillStyle = withAlpha(on ? lit : dark, on ? 0.92 : 0.7)
      ctx.fill()
    }
  }
}

/** Deterministic scatter helper — a fresh Rng seeded per call site. */
export const scatter = (seed: number): Rng => new Rng(seed)
