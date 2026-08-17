/**
 * The sticker book: a scrollable grid of everything there is to find.
 *
 * This is the only progression in the game. Nothing is scored, nothing is
 * timed, and nothing is lost — the book just slowly fills up.
 */

import { clamp, damp, easeOutCubic } from '../core/math'
import { save } from '../core/save'
import { CREAM, INK, withAlpha } from '../render/palette'
import { blobPath, ink, roundRectPath, starPath, type Ctx } from '../render/shapes'
import { COLLECTION, COLLECTION_TOTAL, SECTIONS, drawUnknown, type CollectionEntry } from '../world/collection'
import { drawCloseButton, wrapText } from './hud'

const TILE_GAP = 10
const HEADER = 96
/** Vertical room a section heading takes above its first row of tiles. */
const SECTION_HEAD = 44
/** Breathing room after a section's last row. */
const SECTION_GAP = 18

export class StickerBook {
  private opened = false
  /** 0 closed, 1 fully open. */
  private reveal = 0
  private scroll = 0
  private scrollVel = 0
  private maxScroll = 0
  private dragging = false
  private dragLastY = 0
  private dragTotal = 0
  private selected: CollectionEntry | null = null
  private t = 0

  /** Tile rects from the last draw, for hit testing. */
  private tiles: { entry: CollectionEntry; x: number; y: number; size: number }[] = []
  private closeRect = { x: 0, y: 0, r: 20 }

  get isOpen(): boolean {
    return this.opened
  }

  /** True while the panel is still animating in or out. */
  get isVisible(): boolean {
    return this.opened || this.reveal > 0.01
  }

  open() {
    this.opened = true
    this.selected = null
  }

  close() {
    this.opened = false
    this.dragging = false
  }

  update(dt: number) {
    this.t += dt
    this.reveal = damp(this.reveal, this.opened ? 1 : 0, 11, dt)
    if (!this.dragging) {
      this.scroll += this.scrollVel * dt
      this.scrollVel = damp(this.scrollVel, 0, 7, dt)
      // Rubber-band back into range.
      if (this.scroll < 0) {
        this.scroll = damp(this.scroll, 0, 12, dt)
        this.scrollVel = 0
      } else if (this.scroll > this.maxScroll) {
        this.scroll = damp(this.scroll, this.maxScroll, 12, dt)
        this.scrollVel = 0
      }
    }
  }

  /** Returns true if the book consumed the gesture. */
  onPointerDown(x: number, y: number): boolean {
    if (!this.opened) return false
    if (Math.hypot(x - this.closeRect.x, y - this.closeRect.y) <= this.closeRect.r + 12) {
      this.close()
      return true
    }
    this.dragging = true
    this.dragLastY = y
    this.dragTotal = 0
    this.scrollVel = 0
    void x
    return true
  }

  onPointerMove(y: number): boolean {
    if (!this.dragging) return false
    const dy = y - this.dragLastY
    this.dragLastY = y
    this.dragTotal += Math.abs(dy)
    // Half-speed drag past the ends, so the limits feel soft.
    const soft = this.scroll < 0 || this.scroll > this.maxScroll ? 0.4 : 1
    this.scroll -= dy * soft
    this.scrollVel = -dy * 12
    return true
  }

  onPointerUp(x: number, y: number): boolean {
    if (!this.opened) return false
    const wasDrag = this.dragTotal > 12
    this.dragging = false
    if (wasDrag) return true
    // A tap: select a tile, or dismiss the detail card.
    if (this.selected) {
      this.selected = null
      return true
    }
    for (const tile of this.tiles) {
      if (
        x >= tile.x &&
        x <= tile.x + tile.size &&
        y >= tile.y &&
        y <= tile.y + tile.size &&
        save.has(tile.entry.id)
      ) {
        this.selected = tile.entry
        return true
      }
    }
    return true
  }

  draw(ctx: Ctx, w: number, h: number, bottomInset: number) {
    if (this.reveal <= 0.01) return
    const e = easeOutCubic(this.reveal)

    // Dim the game behind.
    ctx.save()
    ctx.fillStyle = withAlpha('#171223', 0.86 * e)
    ctx.fillRect(0, 0, w, h)

    ctx.translate(0, (1 - e) * h * 0.35)
    ctx.globalAlpha = e

    // Header.
    const found = COLLECTION.reduce((n, entry) => n + (save.has(entry.id) ? 1 : 0), 0)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '600 22px ui-rounded, "SF Pro Rounded", Nunito, "Trebuchet MS", system-ui, sans-serif'
    ctx.fillStyle = CREAM
    ctx.fillText('Sticker Book', w / 2, 46)
    ctx.font = '400 13px ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif'
    ctx.fillStyle = withAlpha(CREAM, 0.62)
    const landings = save.landings
    ctx.fillText(
      `${found} of ${COLLECTION_TOTAL} found · ${landings} landing${landings === 1 ? '' : 's'}`,
      w / 2,
      70,
    )

    // Grid, laid out section by section.
    const cols = w < 380 ? 3 : 4
    const pad = 18
    const size = (w - pad * 2 - TILE_GAP * (cols - 1)) / cols
    const viewTop = HEADER
    const viewH = h - HEADER - 14 - bottomInset

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, viewTop, w, viewH)
    ctx.clip()

    this.tiles = []
    let cursor = viewTop - this.scroll
    for (const section of SECTIONS) {
      const rows = Math.ceil(section.entries.length / cols)
      const blockH = SECTION_HEAD + rows * (size + TILE_GAP) + SECTION_GAP
      // Skip whole sections that are nowhere near the viewport.
      if (cursor + blockH < viewTop - 40 || cursor > viewTop + viewH + 40) {
        cursor += blockH
        continue
      }

      const done = section.entries.reduce((n, e) => n + (save.has(e.id) ? 1 : 0), 0)
      this.drawSectionHead(ctx, section.title, section.blurb, done, section.entries.length, pad, w, cursor)

      for (let i = 0; i < section.entries.length; i++) {
        const entry = section.entries[i]
        const x = pad + (i % cols) * (size + TILE_GAP)
        const y = cursor + SECTION_HEAD + Math.floor(i / cols) * (size + TILE_GAP)
        if (y + size < viewTop - 20 || y > viewTop + viewH + 20) continue
        this.tiles.push({ entry, x, y, size })

        const has = save.has(entry.id)
        roundRectPath(ctx, x, y, size, size, 14)
        ctx.fillStyle = withAlpha(has ? '#2f2747' : '#241d33', has ? 0.95 : 0.7)
        ctx.fill()
        ink(ctx, 1.8, withAlpha(CREAM, has ? 0.34 : 0.14))
        ctx.stroke()

        ctx.save()
        ctx.beginPath()
        roundRectPath(ctx, x, y, size, size, 14)
        ctx.clip()
        ctx.translate(x + size / 2, y + size / 2)
        if (has) entry.draw(ctx, size, this.t)
        else drawUnknown(ctx, size)
        ctx.restore()
      }
      cursor += blockH
    }
    // Total height is wherever the cursor ended up, in unscrolled coordinates.
    const contentH = cursor + this.scroll - viewTop + 16
    this.maxScroll = Math.max(0, contentH - viewH)
    ctx.restore()

    // Scroll hint fades at the edges of the list.
    if (this.maxScroll > 4) {
      const topFade = clamp(this.scroll / 40, 0, 1)
      const botFade = clamp((this.maxScroll - this.scroll) / 40, 0, 1)
      if (topFade > 0) {
        const g = ctx.createLinearGradient(0, viewTop, 0, viewTop + 34)
        g.addColorStop(0, withAlpha('#171223', 0.9 * topFade))
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, viewTop, w, 34)
      }
      if (botFade > 0) {
        const g = ctx.createLinearGradient(0, viewTop + viewH, 0, viewTop + viewH - 34)
        g.addColorStop(0, withAlpha('#171223', 0.9 * botFade))
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, viewTop + viewH - 34, w, 34)
      }
    }

    this.closeRect = { x: w - 34, y: 40, r: 19 }
    drawCloseButton(ctx, this.closeRect.x, this.closeRect.y, this.closeRect.r)

    if (this.selected) this.drawDetail(ctx, w, h)

    ctx.restore()
  }

  /** A section heading: name, how far through it you are, and a hairline. */
  private drawSectionHead(
    ctx: Ctx,
    title: string,
    blurb: string,
    done: number,
    total: number,
    pad: number,
    w: number,
    y: number,
  ) {
    const complete = done === total
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '600 14px ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif'
    ctx.fillStyle = withAlpha(CREAM, complete ? 1 : 0.9)
    ctx.fillText(title, pad, y + 18)
    const titleW = ctx.measureText(title).width

    // A little star once a whole section is filled in.
    if (complete) {
      starPath(ctx, pad + titleW + 12, y + 13, 6, 2.8, 5, -Math.PI / 2 + this.t * 0.4)
      ctx.fillStyle = '#f0d894'
      ctx.fill()
    }

    ctx.font = '400 11px ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif'
    ctx.fillStyle = withAlpha(CREAM, 0.5)
    ctx.fillText(blurb, pad, y + 33)
    ctx.textAlign = 'right'
    ctx.fillStyle = withAlpha(CREAM, complete ? 0.85 : 0.55)
    ctx.fillText(`${done}/${total}`, w - pad, y + 18)
    ctx.textAlign = 'left'

    ink(ctx, 1, withAlpha(CREAM, 0.16))
    ctx.beginPath()
    ctx.moveTo(pad, y + 39)
    ctx.lineTo(w - pad, y + 39)
    ctx.stroke()
  }

  private drawDetail(ctx: Ctx, w: number, h: number) {
    const entry = this.selected!
    const cardW = Math.min(w - 40, 320)
    const cardH = 300
    const x = (w - cardW) / 2
    const y = (h - cardH) / 2

    ctx.save()
    ctx.fillStyle = withAlpha('#120e1c', 0.7)
    ctx.fillRect(0, 0, w, h)

    roundRectPath(ctx, x, y, cardW, cardH, 22)
    ctx.fillStyle = '#2f2747'
    ctx.fill()
    ink(ctx, 2.2, withAlpha(CREAM, 0.42))
    ctx.stroke()

    // The picture, on its own little paper square.
    const artSize = cardW - 56
    roundRectPath(ctx, x + 28, y + 26, artSize, artSize * 0.72, 14)
    ctx.fillStyle = withAlpha('#211a30', 0.9)
    ctx.fill()
    ctx.save()
    roundRectPath(ctx, x + 28, y + 26, artSize, artSize * 0.72, 14)
    ctx.clip()
    ctx.translate(x + 28 + artSize / 2, y + 26 + artSize * 0.36)
    entry.draw(ctx, artSize * 0.86, this.t)
    ctx.restore()

    let ty = y + 34 + artSize * 0.72 + 22
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.font = '600 17px ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif'
    ctx.fillStyle = CREAM
    ctx.fillText(entry.title, x + cardW / 2, ty)
    ty += 22
    ctx.font = '400 13px ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif'
    ctx.fillStyle = withAlpha(CREAM, 0.72)
    wrapText(ctx, entry.note, x + cardW / 2, ty, cardW - 52, 18, 4)

    // A hint that tapping anywhere closes the card.
    blobPath(ctx, x + cardW / 2, y + cardH - 16, 5, 808, { points: 9, wobble: 0.14 })
    ctx.fillStyle = withAlpha(CREAM, 0.3)
    ctx.fill()
    ctx.restore()
    void INK
  }
}
