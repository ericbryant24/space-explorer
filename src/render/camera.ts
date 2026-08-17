import { TAU, damp, clamp } from '../core/math'
import { hashCombine } from '../core/rng'
import { CREAM, CREAM_DIM, withAlpha } from './palette'
import { sparkle, type Ctx } from './shapes'

/** A follow camera with damping, zoom and a little shake. */
export class Camera {
  x = 0
  y = 0
  zoom = 1
  private targetZoom = 1
  private shakeAmount = 0
  private shakeTime = 0
  /** Applied offset for the current frame, including shake. */
  private ox = 0
  private oy = 0

  constructor(
    public viewW: number,
    public viewH: number,
  ) {}

  resize(w: number, h: number) {
    this.viewW = w
    this.viewH = h
  }

  /** Snap instantly, e.g. after a warp. */
  jumpTo(x: number, y: number, zoom = this.targetZoom) {
    this.x = x
    this.y = y
    this.zoom = zoom
    this.targetZoom = zoom
  }

  setZoom(z: number) {
    this.targetZoom = z
  }

  shake(amount: number) {
    this.shakeAmount = Math.max(this.shakeAmount, amount)
  }

  /** Follow a world point. `lead` pushes the view ahead of a velocity. */
  follow(tx: number, ty: number, dt: number, rate = 6, leadX = 0, leadY = 0) {
    this.x = damp(this.x, tx + leadX, rate, dt)
    this.y = damp(this.y, ty + leadY, rate, dt)
    this.zoom = damp(this.zoom, this.targetZoom, 4, dt)
    this.shakeAmount = damp(this.shakeAmount, 0, 6, dt)
    this.shakeTime += dt
    const s = this.shakeAmount
    this.ox = Math.sin(this.shakeTime * 47) * s
    this.oy = Math.cos(this.shakeTime * 39) * s
  }

  /** Apply the camera transform. Pair with ctx.restore(). */
  apply(ctx: Ctx) {
    ctx.save()
    ctx.translate(this.viewW / 2 + this.ox, this.viewH / 2 + this.oy)
    ctx.scale(this.zoom, this.zoom)
    ctx.translate(-this.x, -this.y)
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return {
      x: (wx - this.x) * this.zoom + this.viewW / 2 + this.ox,
      y: (wy - this.y) * this.zoom + this.viewH / 2 + this.oy,
    }
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
      x: (sx - this.viewW / 2 - this.ox) / this.zoom + this.x,
      y: (sy - this.viewH / 2 - this.oy) / this.zoom + this.y,
    }
  }

  /** Generous visible bounds in world space, for culling. */
  bounds(margin = 80): { x0: number; y0: number; x1: number; y1: number } {
    const hw = this.viewW / 2 / this.zoom + margin
    const hh = this.viewH / 2 / this.zoom + margin
    return { x0: this.x - hw, y0: this.y - hh, x1: this.x + hw, y1: this.y + hh }
  }
}

interface StarLayer {
  /** Fraction of camera movement this layer tracks; smaller = further away. */
  parallax: number
  /** World-space tile size at this depth. */
  tile: number
  /** Stars per tile. */
  density: number
  radius: number
  alpha: number
  seed: number
}

const LAYERS: readonly StarLayer[] = [
  { parallax: 0.06, tile: 220, density: 7, radius: 0.9, alpha: 0.5, seed: 101 },
  { parallax: 0.14, tile: 300, density: 5, radius: 1.35, alpha: 0.7, seed: 202 },
  { parallax: 0.28, tile: 440, density: 3, radius: 1.9, alpha: 0.9, seed: 303 },
]

/**
 * An endless starfield. Stars aren't stored — each parallax layer is a grid of
 * tiles, and a tile's stars are hashed from its integer coordinates, so the
 * same patch of sky always looks the same however far you roam.
 */
export class Starfield {
  private t = 0

  /** Offsets the whole field, so each solar system has its own backdrop. */
  constructor(private sectorSeed = 0) {}

  setSector(seed: number) {
    this.sectorSeed = seed
  }

  update(dt: number) {
    this.t += dt
  }

  draw(ctx: Ctx, cam: Camera) {
    const w = cam.viewW
    const h = cam.viewH
    for (const layer of LAYERS) {
      // Screen-space origin for this layer, after parallax.
      const px = cam.x * layer.parallax
      const py = cam.y * layer.parallax
      const t0x = Math.floor((px - w / 2) / layer.tile)
      const t1x = Math.floor((px + w / 2) / layer.tile)
      const t0y = Math.floor((py - h / 2) / layer.tile)
      const t1y = Math.floor((py + h / 2) / layer.tile)

      for (let ty = t0y; ty <= t1y; ty++) {
        for (let tx = t0x; tx <= t1x; tx++) {
          const base = hashCombine(this.sectorSeed, layer.seed, tx, ty)
          for (let i = 0; i < layer.density; i++) {
            const h1 = hashCombine(base, i * 31)
            const h2 = hashCombine(base, i * 31 + 1)
            const h3 = hashCombine(base, i * 31 + 2)
            const sx = tx * layer.tile + (h1 % 100000) / 100000 * layer.tile - px + w / 2
            const sy = ty * layer.tile + (h2 % 100000) / 100000 * layer.tile - py + h / 2
            if (sx < -6 || sx > w + 6 || sy < -6 || sy > h + 6) continue

            // Slow twinkle, phase-shifted per star.
            const phase = (h3 % 1000) / 1000 * TAU
            const twinkle = 0.62 + 0.38 * Math.sin(this.t * 1.1 + phase)
            const r = layer.radius * (0.75 + ((h3 >>> 10) % 100) / 100 * 0.6)
            const a = clamp(layer.alpha * twinkle, 0, 1)

            // A few of the biggest stars get drawn as four-point sparkles.
            if (layer.radius > 1.6 && h3 % 11 === 0) {
              sparkle(ctx, sx, sy, r * 2.6, withAlpha(CREAM, a * 0.85))
            } else {
              ctx.fillStyle = withAlpha(r > 1.2 ? CREAM : CREAM_DIM, a)
              ctx.beginPath()
              ctx.arc(sx, sy, r, 0, TAU)
              ctx.fill()
            }
          }
        }
      }
    }
  }
}

/**
 * Occasional shooting stars, drawn over the starfield. Pok Pok added these to
 * its Space toy and they're the kind of thing you wait for, so they're rare.
 */
export class ShootingStars {
  private items: { x: number; y: number; vx: number; vy: number; life: number; len: number }[] = []
  private cooldown = 4

  update(dt: number, viewW: number, viewH: number) {
    this.cooldown -= dt
    if (this.cooldown <= 0) {
      this.cooldown = 7 + Math.random() * 16
      const fromLeft = Math.random() < 0.5
      const speed = 260 + Math.random() * 220
      const angle = (fromLeft ? 0.35 : Math.PI - 0.35) + (Math.random() - 0.5) * 0.4
      this.items.push({
        x: fromLeft ? -40 : viewW + 40,
        y: Math.random() * viewH * 0.55,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        len: 40 + Math.random() * 60,
      })
    }
    for (const s of this.items) {
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.life -= dt * 0.5
    }
    this.items = this.items.filter((s) => s.life > 0)
  }

  draw(ctx: Ctx) {
    for (const s of this.items) {
      const nx = s.vx / Math.hypot(s.vx, s.vy)
      const ny = s.vy / Math.hypot(s.vx, s.vy)
      const fade = Math.sin(Math.min(1, s.life) * Math.PI)
      const g = ctx.createLinearGradient(s.x, s.y, s.x - nx * s.len, s.y - ny * s.len)
      g.addColorStop(0, withAlpha(CREAM, 0.9 * fade))
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.strokeStyle = g
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(s.x - nx * s.len, s.y - ny * s.len)
      ctx.stroke()
      sparkle(ctx, s.x, s.y, 5 * fade, withAlpha(CREAM, fade))
    }
  }
}
