/**
 * Hand-drawn shape primitives.
 *
 * Nothing in the game is a perfect circle. Every outline is a closed curve
 * whose radius is nudged by deterministic noise, then smoothed — which reads as
 * "cut from paper by someone in a hurry" rather than "drawn by a computer".
 */

import { TAU } from '../core/math'
import { fbm1 } from '../core/rng'
import { INK } from './palette'

export type Ctx = CanvasRenderingContext2D

/** Set a warm ink stroke with round joins. */
export function ink(ctx: Ctx, width = 2, color = INK) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
}

/**
 * Build a closed, smoothly-curved path through `pts`.
 * Uses midpoints as curve anchors so the result passes near every point
 * without the overshoot you get from naive bezier chaining.
 */
export function closedCurve(ctx: Ctx, pts: readonly { x: number; y: number }[]) {
  const n = pts.length
  if (n < 3) return
  ctx.beginPath()
  let prev = pts[n - 1]
  let cur = pts[0]
  ctx.moveTo((prev.x + cur.x) / 2, (prev.y + cur.y) / 2)
  for (let i = 0; i < n; i++) {
    prev = pts[i]
    cur = pts[(i + 1) % n]
    ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + cur.x) / 2, (prev.y + cur.y) / 2)
  }
  ctx.closePath()
}

export interface BlobOptions {
  /** How many control points. Fewer = lumpier. */
  points?: number
  /** Radius variation as a fraction of r. */
  wobble?: number
  /** Vertical squash; 1 is round, 0.6 is a wide oval. */
  squash?: number
  rotation?: number
  /** Noise detail; higher gives more, smaller bumps. */
  detail?: number
}

/** Deterministic wobbly closed shape. Leaves the path current; you fill/stroke. */
export function blobPath(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  seed: number,
  opts: BlobOptions = {},
) {
  const count = opts.points ?? 14
  const wobble = opts.wobble ?? 0.06
  const squash = opts.squash ?? 1
  const rot = opts.rotation ?? 0
  const detail = opts.detail ?? 1.7

  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU + rot
    // Sample noise on a circle so the shape is seamless at the wrap point.
    const t = (i / count) * detail * count * 0.1
    const n = fbm1(seed, t * 3.1 + 11, 3) - 0.5
    const rr = r * (1 + n * 2 * wobble)
    pts.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr * squash })
  }
  closedCurve(ctx, pts)
}

/** Fill and ink a blob in one call. */
export function blob(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  seed: number,
  fill: string,
  opts: BlobOptions & { stroke?: string | null; lineWidth?: number } = {},
) {
  blobPath(ctx, x, y, r, seed, opts)
  ctx.fillStyle = fill
  ctx.fill()
  if (opts.stroke !== null) {
    ink(ctx, opts.lineWidth ?? 2, opts.stroke ?? INK)
    ctx.stroke()
  }
}

/** A slightly wavering straight line. */
export function sketchLine(
  ctx: Ctx,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  wobble = 1.5,
  segments = 6,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  for (let i = 1; i <= segments; i++) {
    const t = i / segments
    // Taper the wobble to zero at both ends so joins stay tidy.
    const taper = Math.sin(t * Math.PI)
    const off = (fbm1(seed, t * 4 + 3, 2) - 0.5) * 2 * wobble * taper
    ctx.lineTo(x1 + dx * t + nx * off, y1 + dy * t + ny * off)
  }
}

/** Rounded rectangle path. */
export function roundRectPath(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.lineTo(x + w - rad, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad)
  ctx.lineTo(x + w, y + h - rad)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h)
  ctx.lineTo(x + rad, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad)
  ctx.lineTo(x, y + rad)
  ctx.quadraticCurveTo(x, y, x + rad, y)
  ctx.closePath()
}

/** Classic pointed star. */
export function starPath(
  ctx: Ctx,
  x: number,
  y: number,
  outer: number,
  inner: number,
  points = 5,
  rotation = -Math.PI / 2,
) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const a = rotation + (i / (points * 2)) * TAU
    const r = i % 2 === 0 ? outer : inner
    const px = x + Math.cos(a) * r
    const py = y + Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

/** Four-pointed sparkle, the kind drawn with two crossing strokes. */
export function sparkle(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.quadraticCurveTo(x + r * 0.18, y - r * 0.18, x + r, y)
  ctx.quadraticCurveTo(x + r * 0.18, y + r * 0.18, x, y + r)
  ctx.quadraticCurveTo(x - r * 0.18, y + r * 0.18, x - r, y)
  ctx.quadraticCurveTo(x - r * 0.18, y - r * 0.18, x, y - r)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

/**
 * A cloud: a flat base with a row of bumps along the top, as one closed path.
 *
 * Drawn as a single path on purpose — a pile of overlapping translucent circles
 * double-darkens along every seam, which looks like a mistake rather than a
 * cloud.
 */
export function cloudPath(
  ctx: Ctx,
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
  bumps = 4,
) {
  const halfW = width / 2
  ctx.beginPath()
  ctx.moveTo(x - halfW, y)
  // Bumps left to right, each a semicircle-ish arc of varying height.
  const step = width / bumps
  for (let i = 0; i < bumps; i++) {
    const bx = x - halfW + step * i
    // Deterministic variation so a given cloud always has the same silhouette.
    const lift = 0.55 + fbm1(seed, i * 2.7 + 1, 2) * 0.9
    const h = height * lift
    ctx.bezierCurveTo(bx + step * 0.06, y - h, bx + step * 0.94, y - h, bx + step, y)
  }
  ctx.lineTo(x + halfW, y)
  // A gently sagging underside.
  ctx.quadraticCurveTo(x, y + height * 0.14, x - halfW, y)
  ctx.closePath()
}

/** A soft radial glow. Cheap enough to use a few per frame. */
export function glow(ctx: Ctx, x: number, y: number, r: number, color: string, alpha = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.globalAlpha = alpha
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
  ctx.globalAlpha = 1
}

/** A leaf / petal shape pointing along `angle`. */
export function leafPath(ctx: Ctx, x: number, y: number, len: number, width: number, angle: number) {
  const tipX = x + Math.cos(angle) * len
  const tipY = y + Math.sin(angle) * len
  const nx = -Math.sin(angle) * width
  const ny = Math.cos(angle) * width
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.quadraticCurveTo(x + (tipX - x) * 0.5 + nx, y + (tipY - y) * 0.5 + ny, tipX, tipY)
  ctx.quadraticCurveTo(x + (tipX - x) * 0.5 - nx, y + (tipY - y) * 0.5 - ny, x, y)
  ctx.closePath()
}

/** Two dot eyes plus an optional smile — used on ships, critters and moons. */
export function face(
  ctx: Ctx,
  x: number,
  y: number,
  scale: number,
  opts: { blink?: number; smile?: number; look?: number } = {},
) {
  const blink = opts.blink ?? 0
  const smile = opts.smile ?? 1
  const look = opts.look ?? 0
  const eyeGap = 3.1 * scale
  const eyeR = 1.55 * scale
  ctx.fillStyle = INK
  for (const side of [-1, 1]) {
    const ex = x + side * eyeGap + look * scale * 0.8
    if (blink > 0.6) {
      ink(ctx, Math.max(1, 0.9 * scale))
      ctx.beginPath()
      ctx.moveTo(ex - eyeR, y)
      ctx.lineTo(ex + eyeR, y)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.ellipse(ex, y, eyeR, eyeR * (1 - blink * 0.8), 0, 0, TAU)
      ctx.fill()
    }
  }
  if (smile > 0.02) {
    ink(ctx, Math.max(1, 1.1 * scale))
    ctx.beginPath()
    ctx.moveTo(x - 1.9 * scale, y + 2.4 * scale)
    ctx.quadraticCurveTo(x, y + 2.4 * scale + 2.2 * scale * smile, x + 1.9 * scale, y + 2.4 * scale)
    ctx.stroke()
  }
}
