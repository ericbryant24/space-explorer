/**
 * The two things the player actually controls: a little ship, and the small
 * person who climbs out of it.
 *
 * Both take a colour so the paint blob in the corner recolours them together.
 */

import { TAU } from '../core/math'
import { CREAM, INK, withAlpha, shade, tint } from '../render/palette'
import { blobPath, ink, roundRectPath, face, sparkle, type Ctx } from '../render/shapes'

/**
 * Ship, drawn nose-up in local space (so callers rotate by heading + PI/2).
 * `thrust` in 0..1 grows the flame; `tilt` leans the fins for a bit of life.
 */
export function drawShip(
  ctx: Ctx,
  color: string,
  t: number,
  thrust: number,
  opts: { tilt?: number; blink?: number } = {},
) {
  const tilt = opts.tilt ?? 0

  // Flame first, so the hull covers its root.
  if (thrust > 0.02) {
    const len = 14 + thrust * 26 + Math.sin(t * 30) * 3
    const w = 6 + thrust * 3
    ctx.beginPath()
    ctx.moveTo(-w, 14)
    ctx.quadraticCurveTo(-w * 0.4, 14 + len * 0.7, 0, 14 + len)
    ctx.quadraticCurveTo(w * 0.4, 14 + len * 0.7, w, 14)
    ctx.closePath()
    ctx.fillStyle = withAlpha('#f2a94c', 0.9)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(-w * 0.5, 14)
    ctx.quadraticCurveTo(0, 14 + len * 0.5, 0, 14 + len * 0.62)
    ctx.quadraticCurveTo(0, 14 + len * 0.5, w * 0.5, 14)
    ctx.closePath()
    ctx.fillStyle = withAlpha('#f8e3a0', 0.95)
    ctx.fill()
  }

  // Fins.
  ctx.save()
  ctx.rotate(tilt * 0.06)
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(side * 8, 2)
    ctx.quadraticCurveTo(side * 20, 8, side * 15, 17)
    ctx.quadraticCurveTo(side * 10, 14, side * 8, 12)
    ctx.closePath()
    ctx.fillStyle = shade(color, 0.28)
    ctx.fill()
    ink(ctx, 1.8)
    ctx.stroke()
  }
  ctx.restore()

  // Hull: a rounded teardrop.
  ctx.beginPath()
  ctx.moveTo(0, -22)
  ctx.quadraticCurveTo(11, -14, 11, 2)
  ctx.quadraticCurveTo(11, 12, 8, 15)
  ctx.lineTo(-8, 15)
  ctx.quadraticCurveTo(-11, 12, -11, 2)
  ctx.quadraticCurveTo(-11, -14, 0, -22)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ink(ctx, 2.2)
  ctx.stroke()

  // A pale belly stripe.
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(0, -22)
  ctx.quadraticCurveTo(11, -14, 11, 2)
  ctx.quadraticCurveTo(11, 12, 8, 15)
  ctx.lineTo(-8, 15)
  ctx.quadraticCurveTo(-11, 12, -11, 2)
  ctx.quadraticCurveTo(-11, -14, 0, -22)
  ctx.closePath()
  ctx.clip()
  ctx.fillStyle = withAlpha(CREAM, 0.22)
  ctx.fillRect(-12, 6, 24, 12)
  ctx.restore()

  // Window, with a face in it.
  ctx.beginPath()
  ctx.arc(0, -6, 7, 0, TAU)
  ctx.fillStyle = tint('#7fb2cc', 0.15)
  ctx.fill()
  ink(ctx, 2)
  ctx.stroke()
  face(ctx, 0, -7, 1.05, { blink: opts.blink ?? 0, smile: 0.7 })
  // A glint on the glass.
  ctx.beginPath()
  ctx.arc(-2.6, -9, 1.8, 0, TAU)
  ctx.fillStyle = withAlpha(CREAM, 0.55)
  ctx.fill()

  // Nose cap.
  ctx.beginPath()
  ctx.moveTo(-4.5, -19)
  ctx.quadraticCurveTo(0, -25, 4.5, -19)
  ctx.closePath()
  ctx.fillStyle = shade(color, 0.35)
  ctx.fill()
  ink(ctx, 1.6)
  ctx.stroke()
}

/**
 * The explorer, standing on the ground at the origin.
 * `walk` in 0..1 drives the leg cycle, `airborne` tucks the legs up.
 */
export function drawExplorer(
  ctx: Ctx,
  color: string,
  t: number,
  opts: { walk?: number; airborne?: boolean; facing?: number; digging?: number } = {},
) {
  const walk = opts.walk ?? 0
  const facing = opts.facing ?? 1
  const airborne = opts.airborne ?? false
  const dig = opts.digging ?? 0

  ctx.save()
  ctx.scale(facing, 1)

  const step = Math.sin(t * 11) * walk
  const bob = Math.abs(Math.sin(t * 11)) * walk * 1.4

  // Legs.
  ink(ctx, 3.6, shade(color, 0.4))
  if (airborne) {
    ctx.beginPath()
    ctx.moveTo(-2.5, -8)
    ctx.lineTo(-5, -2)
    ctx.moveTo(2.5, -8)
    ctx.lineTo(5, -3)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(-1.5, -8)
    ctx.lineTo(-2 + step * 4, 0)
    ctx.moveTo(1.5, -8)
    ctx.lineTo(2 - step * 4, 0)
    ctx.stroke()
  }

  ctx.translate(0, -bob)

  // Backpack.
  roundRectPath(ctx, -9.5, -19, 6, 11, 2.5)
  ctx.fillStyle = shade(color, 0.34)
  ctx.fill()
  ink(ctx, 1.6)
  ctx.stroke()

  // Suit.
  roundRectPath(ctx, -5.5, -20, 11, 13, 4.5)
  ctx.fillStyle = color
  ctx.fill()
  ink(ctx, 2)
  ctx.stroke()

  // Arm, swinging or reaching down to dig.
  ink(ctx, 3, color)
  ctx.beginPath()
  ctx.moveTo(3, -17)
  if (dig > 0) {
    const swing = Math.sin(dig * 14)
    ctx.quadraticCurveTo(9, -13, 8 + swing * 2, -5 - swing * 3)
  } else {
    ctx.quadraticCurveTo(7, -14, 6 - step * 3, -9)
  }
  ctx.stroke()

  // Helmet.
  ctx.beginPath()
  ctx.arc(0, -25, 7.5, 0, TAU)
  ctx.fillStyle = tint(color, 0.55)
  ctx.fill()
  ink(ctx, 2)
  ctx.stroke()
  // Visor.
  ctx.beginPath()
  ctx.arc(1, -25.5, 5.2, 0, TAU)
  ctx.fillStyle = '#38405a'
  ctx.fill()
  // Reflection and a hint of a face inside.
  ctx.beginPath()
  ctx.arc(-0.6, -27.4, 1.7, 0, TAU)
  ctx.fillStyle = withAlpha(CREAM, 0.55)
  ctx.fill()
  ctx.fillStyle = withAlpha(CREAM, 0.32)
  for (const ex of [0.4, 2.8]) {
    ctx.beginPath()
    ctx.arc(ex, -24.6, 0.9, 0, TAU)
    ctx.fill()
  }
  // Antenna.
  ink(ctx, 1.3, shade(color, 0.4))
  ctx.beginPath()
  ctx.moveTo(-5, -30)
  ctx.lineTo(-7, -35)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(-7, -36, 1.6, 0, TAU)
  ctx.fillStyle = '#e8823f'
  ctx.fill()

  ctx.restore()
}

/** A landed ship resting on its fins, seen from the side. */
export function drawLandedShip(ctx: Ctx, color: string, t: number, blink: number) {
  ctx.save()
  ctx.scale(1.25, 1.25)
  // Landing legs.
  ink(ctx, 2.4, shade(color, 0.42))
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(side * 7, -8)
    ctx.lineTo(side * 13, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(side * 10, 0)
    ctx.lineTo(side * 16, 0)
    ctx.stroke()
  }
  ctx.translate(0, -8)
  drawShip(ctx, color, t, 0, { blink })
  ctx.restore()
  // A soft shadow on the ground.
  ctx.beginPath()
  ctx.ellipse(0, 1, 20, 4, 0, 0, TAU)
  ctx.fillStyle = withAlpha(INK, 0.22)
  ctx.fill()
}

/** Tiny puff of dust, used for footsteps, landings and take-offs. */
export function drawPuff(ctx: Ctx, x: number, y: number, age: number, life: number, color: string) {
  const p = age / life
  if (p >= 1) return
  const r = 3 + p * 12
  ctx.beginPath()
  ctx.arc(x, y - p * 8, r, 0, TAU)
  ctx.fillStyle = withAlpha(color, 0.32 * (1 - p))
  ctx.fill()
}

/** A sparkle burst, for discoveries. */
export function drawBurst(ctx: Ctx, x: number, y: number, p: number) {
  if (p >= 1) return
  const n = 7
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + p * 1.6
    const d = p * 52
    sparkle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, 5 * (1 - p), withAlpha(CREAM, 1 - p))
  }
}

/** A little cluster of blobs used as the "you can land here" marker. */
export function drawLandingMarker(ctx: Ctx, r: number, t: number, alpha: number) {
  ctx.save()
  ctx.globalAlpha = alpha
  ink(ctx, 2, withAlpha(CREAM, 0.75))
  ctx.setLineDash([9, 11])
  ctx.lineDashOffset = -t * 22
  blobPath(ctx, 0, 0, r, 424242, { points: 22, wobble: 0.02 })
  ctx.stroke()
  ctx.setLineDash([])
  // Chevron pointing inward.
  const bob = Math.sin(t * 2.4) * 3
  ctx.beginPath()
  ctx.moveTo(-8, -r - 20 + bob)
  ctx.lineTo(0, -r - 11 + bob)
  ctx.lineTo(8, -r - 20 + bob)
  ink(ctx, 2.6, withAlpha(CREAM, 0.85))
  ctx.stroke()
  ctx.restore()
}
