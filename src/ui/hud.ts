/**
 * On-screen furniture: three round buttons, a place name, and the banner that
 * announces a discovery.
 *
 * Deliberately sparse. The buttons are icons, not words, and they live inside a
 * generous thumb-reach band at the bottom of a portrait screen.
 */

import { TAU, clamp, easeOutCubic } from '../core/math'
import { CREAM, INK, SHIP_COLORS, withAlpha, shade } from '../render/palette'
import { blobPath, ink, roundRectPath, starPath, sparkle, type Ctx } from '../render/shapes'

export type ButtonId = 'paint' | 'book' | 'sound' | 'map'

interface Button {
  id: ButtonId
  x: number
  y: number
  r: number
}

export interface Toast {
  title: string
  note: string
  /** Seconds since it appeared. */
  age: number
  isNew: boolean
}

const BUTTON_R = 25

export class Hud {
  private buttons: Button[] = []
  private toasts: Toast[] = []
  /** Fades the place name in when you arrive somewhere. */
  private placeName = ''
  private placeAge = 99

  /** Safe-area inset at the bottom, for phones with a home bar. */
  private inset = 0

  layout(w: number, h: number) {
    // env(safe-area-inset-bottom) isn't readable from canvas, so approximate it
    // for tall screens where a home indicator is likely.
    this.inset = h / w > 1.9 ? 22 : 8
    const y = h - BUTTON_R - 14 - this.inset
    this.buttons = [
      { id: 'paint', x: BUTTON_R + 16, y, r: BUTTON_R },
      { id: 'book', x: w - BUTTON_R - 16, y, r: BUTTON_R },
      { id: 'sound', x: w - BUTTON_R - 16, y: BUTTON_R + 18, r: 21 },
      { id: 'map', x: BUTTON_R + 16, y: BUTTON_R + 18, r: 21 },
    ]
  }

  get bottomInset(): number {
    return this.inset
  }

  /** True while a banner is on screen, so scenes can hold back their own text. */
  get busy(): boolean {
    return this.toasts.length > 0
  }

  hitTest(x: number, y: number): ButtonId | null {
    for (const b of this.buttons) {
      // Slightly generous hit radius — fingers are not styluses.
      if (Math.hypot(x - b.x, y - b.y) <= b.r + 10) return b.id
    }
    return null
  }

  announcePlace(name: string) {
    this.placeName = name
    this.placeAge = 0
  }

  toast(title: string, note: string, isNew = true) {
    // Don't stack duplicates of the same find.
    if (this.toasts.some((t) => t.title === title && t.age < 1)) return
    this.toasts.push({ title, note, age: 0, isNew })
    if (this.toasts.length > 2) this.toasts.shift()
  }

  update(dt: number) {
    this.placeAge += dt
    for (const t of this.toasts) t.age += dt
    this.toasts = this.toasts.filter((t) => t.age < 5.4)
  }

  draw(
    ctx: Ctx,
    w: number,
    h: number,
    state: { shipColor: number; muted: boolean; found: number; total: number; mapOpen: boolean },
  ) {
    this.drawPlaceName(ctx, w)
    for (let i = 0; i < this.toasts.length; i++) {
      this.drawToast(ctx, w, h, this.toasts[i], i)
    }

    for (const b of this.buttons) {
      ctx.save()
      ctx.translate(b.x, b.y)
      // Body.
      blobPath(ctx, 0, 0, b.r, b.id.charCodeAt(0) * 31, { points: 16, wobble: 0.035 })
      ctx.fillStyle = withAlpha('#2b2340', 0.92)
      ctx.fill()
      ink(ctx, 2, withAlpha(CREAM, 0.42))
      ctx.stroke()

      switch (b.id) {
        case 'paint':
          drawPaintIcon(ctx, state.shipColor)
          break
        case 'book':
          drawBookIcon(ctx, state.found, state.total)
          break
        case 'sound':
          drawSoundIcon(ctx, state.muted)
          break
        case 'map':
          drawMapIcon(ctx, state.mapOpen)
          break
      }
      ctx.restore()
    }
  }

  private drawPlaceName(ctx: Ctx, w: number) {
    if (this.placeAge > 4.4) return
    const fadeIn = easeOutCubic(clamp(this.placeAge / 0.6, 0, 1))
    const fadeOut = 1 - clamp((this.placeAge - 3.2) / 1.2, 0, 1)
    const a = fadeIn * fadeOut
    if (a <= 0.01) return
    ctx.save()
    ctx.globalAlpha = a
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const y = 54 + (1 - fadeIn) * 10
    ctx.font = '600 20px ui-rounded, "SF Pro Rounded", Nunito, "Trebuchet MS", system-ui, sans-serif'
    ctx.fillStyle = withAlpha(INK, 0.55)
    ctx.fillText(this.placeName, w / 2 + 1, y + 1.5)
    ctx.fillStyle = CREAM
    ctx.fillText(this.placeName, w / 2, y)
    // Small rule underneath.
    ink(ctx, 1.4, withAlpha(CREAM, 0.4))
    const tw = ctx.measureText(this.placeName).width
    ctx.beginPath()
    ctx.moveTo(w / 2 - tw / 2 - 12, y + 16)
    ctx.lineTo(w / 2 + tw / 2 + 12, y + 16)
    ctx.stroke()
    ctx.restore()
  }

  private drawToast(ctx: Ctx, w: number, h: number, toast: Toast, index: number) {
    const inT = easeOutCubic(clamp(toast.age / 0.45, 0, 1))
    const out = 1 - clamp((toast.age - 4.2) / 1.2, 0, 1)
    const a = inT * out
    if (a <= 0.01) return

    const pad = 18
    const boxW = Math.min(w - pad * 2, 330)
    const boxH = 74
    const x = (w - boxW) / 2
    const y = h - 130 - this.inset - index * (boxH + 10) + (1 - inT) * 24

    ctx.save()
    ctx.globalAlpha = a
    roundRectPath(ctx, x, y, boxW, boxH, 16)
    ctx.fillStyle = withAlpha('#2b2340', 0.9)
    ctx.fill()
    ink(ctx, 2, withAlpha(CREAM, 0.4))
    ctx.stroke()

    // A star on the left for a first-time find.
    ctx.save()
    ctx.translate(x + 30, y + boxH / 2)
    if (toast.isNew) {
      starPath(ctx, 0, 0, 13, 6, 5, -Math.PI / 2 + toast.age * 0.6)
      ctx.fillStyle = '#f0d894'
      ctx.fill()
      ink(ctx, 1.6, withAlpha(INK, 0.5))
      ctx.stroke()
      for (let i = 0; i < 3; i++) {
        const p = (toast.age * 0.8 + i * 0.33) % 1
        sparkle(ctx, Math.cos(i * 2.1) * 18 * p, Math.sin(i * 2.1) * 18 * p, 4 * (1 - p), withAlpha(CREAM, 0.7 * (1 - p)))
      }
    } else {
      ctx.beginPath()
      ctx.arc(0, 0, 10, 0, TAU)
      ink(ctx, 2, withAlpha(CREAM, 0.5))
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, 0, 3.4, 0, TAU)
      ctx.fillStyle = withAlpha(CREAM, 0.6)
      ctx.fill()
    }
    ctx.restore()

    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '600 15px ui-rounded, "SF Pro Rounded", Nunito, "Trebuchet MS", system-ui, sans-serif'
    ctx.fillStyle = CREAM
    ctx.fillText(toast.title, x + 54, y + 30)
    ctx.font = '400 12px ui-rounded, "SF Pro Rounded", Nunito, "Trebuchet MS", system-ui, sans-serif'
    ctx.fillStyle = withAlpha(CREAM, 0.72)
    wrapText(ctx, toast.note, x + 54, y + 48, boxW - 70, 14, 2)
    ctx.restore()
  }
}

function drawPaintIcon(ctx: Ctx, colorIndex: number) {
  // A blob of the current colour with two neighbours peeking out behind.
  const n = SHIP_COLORS.length
  for (let i = 2; i >= 1; i--) {
    const c = SHIP_COLORS[(colorIndex + i) % n]
    blobPath(ctx, i * 5 - 1, -i * 2, 9 - i, 777 + i, { points: 10, wobble: 0.1 })
    ctx.fillStyle = withAlpha(c, 0.75)
    ctx.fill()
  }
  blobPath(ctx, -2, 1, 12, 999, { points: 12, wobble: 0.08 })
  ctx.fillStyle = SHIP_COLORS[colorIndex % n]
  ctx.fill()
  ink(ctx, 1.8, withAlpha(INK, 0.6))
  ctx.stroke()
}

function drawBookIcon(ctx: Ctx, found: number, total: number) {
  roundRectPath(ctx, -11, -13, 22, 26, 3)
  ctx.fillStyle = '#c9a45c'
  ctx.fill()
  ink(ctx, 1.8, withAlpha(INK, 0.6))
  ctx.stroke()
  ink(ctx, 1.4, withAlpha(INK, 0.45))
  ctx.beginPath()
  ctx.moveTo(-6, -13)
  ctx.lineTo(-6, 13)
  ctx.stroke()
  // Two little stickers on the cover.
  starPath(ctx, 2, -5, 5, 2.2, 5, -Math.PI / 2)
  ctx.fillStyle = '#f0d894'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(3, 5, 3.4, 0, TAU)
  ctx.fillStyle = '#93ab7c'
  ctx.fill()
  // Count badge.
  if (found > 0) {
    ctx.beginPath()
    ctx.arc(13, -14, 9, 0, TAU)
    ctx.fillStyle = '#d4744f'
    ctx.fill()
    ink(ctx, 1.5, withAlpha(CREAM, 0.7))
    ctx.stroke()
    ctx.font = '700 10px ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = CREAM
    ctx.fillText(String(Math.min(found, total)), 13, -13.5)
  }
}

function drawSoundIcon(ctx: Ctx, muted: boolean) {
  ctx.fillStyle = CREAM
  ctx.beginPath()
  ctx.moveTo(-8, -4)
  ctx.lineTo(-3, -4)
  ctx.lineTo(2, -9)
  ctx.lineTo(2, 9)
  ctx.lineTo(-3, 4)
  ctx.lineTo(-8, 4)
  ctx.closePath()
  ctx.fill()
  if (muted) {
    ink(ctx, 2.2, '#d4744f')
    ctx.beginPath()
    ctx.moveTo(5, -6)
    ctx.lineTo(12, 6)
    ctx.moveTo(12, -6)
    ctx.lineTo(5, 6)
    ctx.stroke()
  } else {
    ink(ctx, 2, withAlpha(CREAM, 0.85))
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath()
      ctx.arc(3, 0, 3 + i * 3.6, -0.9, 0.9)
      ctx.stroke()
    }
  }
}

function drawMapIcon(ctx: Ctx, open: boolean) {
  // A small constellation.
  const pts = [
    [-8, 4],
    [-2, -6],
    [6, -1],
    [3, 8],
  ] as const
  ink(ctx, 1.4, withAlpha(CREAM, open ? 0.9 : 0.5))
  ctx.beginPath()
  pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)))
  ctx.stroke()
  for (const [px, py] of pts) {
    ctx.beginPath()
    ctx.arc(px, py, 2.2, 0, TAU)
    ctx.fillStyle = open ? '#f0d894' : CREAM
    ctx.fill()
  }
}

/** Word-wrap helper, capped at `maxLines` with an ellipsis. */
export function wrapText(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 99,
) {
  const words = text.split(' ')
  let line = ''
  let lines = 0
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i]
    if (ctx.measureText(test).width > maxWidth && line) {
      if (lines + 1 >= maxLines) {
        // Trim the last line so the ellipsis fits.
        let trimmed = line
        while (ctx.measureText(`${trimmed}…`).width > maxWidth && trimmed.length > 1) {
          trimmed = trimmed.slice(0, -1)
        }
        ctx.fillText(`${trimmed}…`, x, y + lines * lineHeight)
        return
      }
      ctx.fillText(line, x, y + lines * lineHeight)
      lines++
      line = words[i]
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, y + lines * lineHeight)
}

/** Shared button styling for overlay close buttons. */
export function drawCloseButton(ctx: Ctx, x: number, y: number, r: number) {
  blobPath(ctx, x, y, r, 12345, { points: 14, wobble: 0.04 })
  ctx.fillStyle = withAlpha('#2b2340', 0.9)
  ctx.fill()
  ink(ctx, 2, withAlpha(CREAM, 0.5))
  ctx.stroke()
  ink(ctx, 2.6, CREAM)
  const k = r * 0.4
  ctx.beginPath()
  ctx.moveTo(x - k, y - k)
  ctx.lineTo(x + k, y + k)
  ctx.moveTo(x + k, y - k)
  ctx.lineTo(x - k, y + k)
  ctx.stroke()
}

export { shade }
