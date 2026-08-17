/**
 * Standing on a planet.
 *
 * A side-on strip of ground that wraps around, with gravity taken from the
 * planet you landed on — so a small icy moon lets you float half a screen high
 * and a dense rock keeps you firmly on the floor.
 *
 * Hold a finger to walk toward it, tap to hop, tap a thing to poke it.
 */

import { TAU, clamp, damp } from '../core/math'
import { audio } from '../core/audio'
import { Rng, hashCombine } from '../core/rng'
import { CREAM, INK, mix, withAlpha, shade, tint } from '../render/palette'
import { save } from '../core/save'
import { cloudPath, ink, sparkle, type Ctx } from '../render/shapes'
import { drawBurst, drawExplorer, drawLandedShip, drawPuff } from '../world/actors'
import { biomeKey, digKey, eggKey } from '../world/collection'
import { getEgg } from '../world/eggs'
import type { Planet } from '../world/planet'
import {
  DIG_LABELS,
  drawCritter,
  drawDig,
  drawProp,
  drawSapling,
  generateSurface,
  terrainSlope,
  terrainY,
  wrapDelta,
  type SurfaceData,
} from '../world/surface'
import type { SolarSystem } from '../world/universe'
import type { SceneDeps } from './context'

const WALK_SPEED = 108
/** Scene units per CSS pixel. The explorer is ~32 units, so this sets how big
 *  they read on a phone — around 53px tall, which is comfortably pokeable. */
const SURFACE_ZOOM = 1.65

export type SurfaceOutcome = { type: 'takeoff' }

type Weather = 'none' | 'rain' | 'snow' | 'ash' | 'spores' | 'dust'

interface Puff {
  x: number
  y: number
  age: number
  life: number
}

export class SurfaceScene {
  surface: SurfaceData
  planet: Planet
  private t = 0
  /** Unwrapped x; the terrain is periodic so this can grow without bound. */
  private x: number
  private h = 0
  private vh = 0
  private vx = 0
  private facing = 1
  private walk = 0
  private onGround = true
  private digging = 0
  private camX = 0
  private camY = 0
  private zoom = SURFACE_ZOOM * 0.82
  private weather: Weather
  private puffs: Puff[] = []
  private burst = { x: 0, y: 0, p: 1 }
  private shipInRange = false
  private settleIn = 0.45
  /** Parallax hill layers, generated once. */
  private hills: { amp: number; freq: number; phase: number; parallax: number; shade: number }[] = []

  constructor(
    private deps: SceneDeps,
    planet: Planet,
    private system: SolarSystem,
    landingX: number,
  ) {
    this.planet = planet
    this.surface = generateSurface(planet, landingX)
    // Stand beside the ship rather than inside it.
    this.x = this.surface.landingX + 46
    this.camX = this.x
    this.camY = terrainY(this.surface, this.x) - 60
    this.weather = pickWeather(planet)

    // Index 0 is the farthest ridge. Far ridges are taller, paler and hazier;
    // near ones hug the ground line and are darkest. They're drawn in this
    // order, so later layers sit in front.
    const rng = new Rng(hashCombine(planet.seed, 0x71115))
    for (let i = 0; i < 3; i++) {
      this.hills.push({
        amp: rng.range(30, 56) * (1 - i * 0.22),
        freq: rng.int(2, 5) + i,
        phase: rng.range(0, TAU),
        parallax: 0.16 + i * 0.19,
        shade: 0.14 + i * 0.14,
      })
    }
  }

  get gravity(): number {
    return 900 * this.planet.gravity
  }

  /** Highest and lowest ground on this world, for automated checks. */
  terrainRange(): { high: number; low: number } {
    let high = Infinity
    let low = -Infinity
    for (let i = 0; i < 128; i++) {
      const y = terrainY(this.surface, (i / 128) * this.surface.width)
      if (y < high) high = y
      if (y > low) low = y
    }
    return { high: Math.round(high), low: Math.round(low) }
  }

  resize(_w: number, _h: number) {
    void _w
    void _h
  }

  update(dt: number): SurfaceOutcome | null {
    this.t += dt
    this.settleIn = Math.max(0, this.settleIn - dt)
    const s = this.surface

    // Saplings grow, slowly.
    for (const sap of s.saplings) sap.growth = Math.min(1, sap.growth + dt * 0.12)
    for (const dig of s.digs) if (dig.dug) dig.age += dt
    for (const prop of s.props) prop.wobble = Math.max(0, prop.wobble - dt * 2.2)
    this.burst.p = Math.min(1, this.burst.p + dt * 1.5)
    this.digging = Math.max(0, this.digging - dt)

    this.updateExplorer(dt)
    this.updateCritters(dt)

    for (const p of this.puffs) p.age += dt
    this.puffs = this.puffs.filter((p) => p.age < p.life)

    // Discover the biome once you're actually standing on it.
    if (this.t > 0.4) {
      const info = BIOME_TOAST[this.planet.biome]
      this.deps.discover(biomeKey(this.planet.biome), info.title, info.note)
    }

    // Walk close enough to the curiosity and it's yours.
    if (s.eggX !== null && s.eggId) {
      const def = getEgg(s.eggId)
      if (def && Math.abs(wrapDelta(this.x, s.eggX, s.width)) < def.reach) {
        const first = !this.wasFound(eggKey(def.id))
        this.deps.discover(eggKey(def.id), def.title, def.note)
        if (first) {
          this.burst = { x: s.eggX, y: terrainY(s, s.eggX) - 40, p: 0 }
        }
      }
    }

    const outcome = this.handleTaps()
    if (outcome) return outcome

    // Camera. Terrain is periodic, so tracking unwrapped x is enough.
    const groundY = terrainY(s, this.x)
    this.camX = damp(this.camX, this.x + this.vx * 0.22, 5, dt)
    // Sit the explorer a little below the middle of the screen, and rise with
    // them on a big low-gravity hop so they never leave the frame.
    this.camY = damp(this.camY, groundY - this.h * 0.8 - 40, 4.5, dt)
    this.zoom = damp(this.zoom, SURFACE_ZOOM, 3.2, dt)

    return null
  }

  private wasFound(id: string): boolean {
    // The shell owns the save; ask it indirectly by checking before discovering.
    // `discover` is idempotent, so this is only used to gate the sparkle burst.
    return this.foundCache.has(id)
  }

  private foundCache = new Set<string>()

  private updateExplorer(dt: number) {
    const { input } = this.deps
    const s = this.surface
    const groundY = terrainY(s, this.x)

    // Walk toward the finger, if it's off to one side.
    let dir = 0
    if (input.down && input.heldFor > 0.06) {
      const worldX = this.screenToWorldX(input.x)
      const delta = worldX - this.x
      if (Math.abs(delta) > 8) dir = Math.sign(delta)
    }
    const k = input.keyAxis()
    if (k.x !== 0) dir = k.x
    if ((input.keys.has(' ') || input.keys.has('arrowup') || input.keys.has('w')) && this.onGround) {
      this.jump()
    }

    if (dir !== 0) {
      this.facing = dir
      this.vx = damp(this.vx, dir * WALK_SPEED, 9, dt)
    } else {
      this.vx = damp(this.vx, 0, 12, dt)
    }
    this.walk = damp(this.walk, this.onGround ? clamp(Math.abs(this.vx) / WALK_SPEED, 0, 1) : 0, 10, dt)

    this.x += this.vx * dt

    // Vertical: hop, then fall back to the ground under this new x.
    if (!this.onGround) {
      this.vh -= this.gravity * dt
      this.h += this.vh * dt
      if (this.h <= 0) {
        this.h = 0
        this.vh = 0
        this.onGround = true
        this.puffs.push({ x: this.x, y: terrainY(s, this.x), age: 0, life: 0.5 })
        audio.note(undefined, { gain: 0.1, decay: 0.5 })
      }
    } else {
      // Walking dust.
      if (Math.abs(this.vx) > 40 && Math.random() < dt * 7) {
        this.puffs.push({ x: this.x - this.facing * 6, y: groundY, age: 0, life: 0.45 })
      }
    }

    // Are we standing next to the ship?
    this.shipInRange = Math.abs(wrapDelta(this.x, s.landingX, s.width)) < 76
  }

  private jump() {
    if (!this.onGround) return
    this.onGround = false
    // Weaker gravity gives a slower, higher, more floaty hop.
    this.vh = 330 * Math.pow(clamp(this.planet.gravity, 0.26, 1.85), 0.35)
    this.puffs.push({ x: this.x, y: terrainY(this.surface, this.x), age: 0, life: 0.45 })
    audio.note(undefined, { gain: 0.14, decay: 0.7 })
  }

  private updateCritters(dt: number) {
    const s = this.surface
    for (const c of s.critters) {
      c.phase += dt
      c.startled = Math.max(0, c.startled - dt)

      if (c.kind === 'floater' || c.kind === 'glider') {
        // Drift about at a comfortable altitude, bobbing.
        c.x += c.vx * dt
        const target = c.kind === 'floater' ? 54 : 40
        c.vh = damp(c.vh, (target - c.h) * 1.4 + Math.sin(c.phase * 1.3) * 12, 3, dt)
        c.h += c.vh * dt
        if (Math.random() < dt * 0.35) c.vx = (Math.random() - 0.5) * 34
      } else {
        c.x += c.vx * dt
        if (Math.random() < dt * 0.5) c.vx = (Math.random() - 0.5) * 30
        // Hoppers hop.
        if (c.kind === 'hopper' && c.h <= 0 && Math.random() < dt * 0.7) {
          c.vh = 150 * Math.pow(clamp(this.planet.gravity, 0.26, 1.85), 0.3)
        }
        if (c.h > 0 || c.vh > 0) {
          c.vh -= this.gravity * 0.75 * dt
          c.h = Math.max(0, c.h + c.vh * dt)
          if (c.h === 0) c.vh = 0
        }
      }

      // Startled critters scurry away from the explorer; otherwise they just
      // keep a bit of personal space, which also stops them standing inside you.
      const gap = wrapDelta(this.x, c.x, s.width)
      if (c.startled > 0) {
        c.vx = damp(c.vx, Math.sign(gap || 1) * 60, 4, dt)
      } else if (Math.abs(gap) < 34) {
        c.vx = damp(c.vx, Math.sign(gap || 1) * 22, 2.5, dt)
      }

      c.x = ((c.x % s.width) + s.width) % s.width
    }
  }

  private handleTaps(): SurfaceOutcome | null {
    const taps = this.deps.input.takeTaps()
    if (taps.length === 0 || this.settleIn > 0) return null
    const s = this.surface

    for (const tap of taps) {
      const worldX = this.screenToWorldX(tap.x)
      const worldY = this.screenToWorldY(tap.y)

      // The ship, if we're standing near it.
      if (this.shipInRange) {
        const shipX = this.x + wrapDelta(this.x, s.landingX, s.width)
        const shipY = terrainY(s, shipX) - 34
        if (Math.hypot(worldX - shipX, worldY - shipY) < 44) {
          return { type: 'takeoff' }
        }
      }

      // A dig site within arm's reach of both the tap and the explorer.
      let acted = false
      for (const dig of s.digs) {
        if (dig.dug) continue
        const dx = this.x + wrapDelta(this.x, dig.x, s.width)
        const digY = terrainY(s, dx)
        if (Math.abs(worldX - dx) < 30 && Math.abs(worldY - digY) < 46 && Math.abs(dx - this.x) < 60) {
          dig.dug = true
          dig.age = 0
          this.digging = 0.6
          audio.chime()
          const label = DIG_LABELS[dig.reward]
          this.deps.discover(digKey(dig.reward), label.title, label.note)
          this.burst = { x: dx, y: digY - 24, p: 0 }
          // A seed plants itself where you found it.
          if (dig.reward === 'seed') {
            s.saplings.push({
              x: dig.x + 24,
              growth: 0,
              seed: hashCombine(dig.seed, 5),
              color: this.planet.palette.accent,
            })
          }
          acted = true
          break
        }
      }
      if (acted) continue

      // A critter.
      for (const c of s.critters) {
        const cx = this.x + wrapDelta(this.x, c.x, s.width)
        const cy = terrainY(s, cx) - c.h - 12 * c.size
        if (Math.hypot(worldX - cx, worldY - cy) < 34) {
          c.startled = 1.1
          c.met = true
          audio.note(undefined, { gain: 0.16, decay: 0.9, octave: 1 })
          acted = true
          break
        }
      }
      if (acted) continue

      // A prop.
      let nearest: { d: number; index: number } | null = null
      for (let i = 0; i < s.props.length; i++) {
        const p = s.props[i]
        const px = this.x + wrapDelta(this.x, p.x, s.width)
        const py = terrainY(s, px) - 16 * p.size
        const d = Math.hypot(worldX - px, worldY - py)
        if (d < 34 && (!nearest || d < nearest.d)) nearest = { d, index: i }
      }
      if (nearest) {
        const p = s.props[nearest.index]
        p.wobble = 1
        p.touched = true
        audio.note(undefined, { gain: 0.13, decay: 1.1 })
        continue
      }

      // Nothing to poke — hop instead.
      this.jump()
    }
    return null
  }

  // --- coordinate helpers ---

  private screenToWorldX(sx: number): number {
    return (sx - this.deps.view.w / 2) / this.zoom + this.camX
  }

  private screenToWorldY(sy: number): number {
    return (sy - this.deps.view.h * 0.62) / this.zoom + this.camY
  }

  private applyCamera(ctx: Ctx) {
    ctx.save()
    ctx.translate(this.deps.view.w / 2, this.deps.view.h * 0.62)
    ctx.scale(this.zoom, this.zoom)
    ctx.translate(-this.camX, -this.camY)
  }

  /** Nearest unwrapped position of a wrapped x, relative to the camera. */
  private near(x: number): number {
    return this.camX + wrapDelta(this.camX, x, this.surface.width)
  }

  // --- drawing ---

  draw(ctx: Ctx) {
    const { w, h } = this.deps.view
    const p = this.planet.palette

    // Sky.
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, shade(p.sky, 0.22))
    g.addColorStop(0.55, p.sky)
    g.addColorStop(1, p.skyLow)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    this.drawSkyBodies(ctx)
    this.drawSkyClouds(ctx)
    this.drawHills(ctx)

    this.applyCamera(ctx)
    this.drawWaterBehind(ctx)
    this.drawGround(ctx)
    this.drawWaterline(ctx)
    this.drawScenery(ctx)
    ctx.restore()

    this.drawWeather(ctx)
    this.drawHints(ctx)
  }

  /** Star(s) and moons hanging in the sky, plus a few daytime stars. */
  private drawSkyBodies(ctx: Ctx) {
    const { w, h } = this.deps.view
    // Very slow drift tied to the planet's own position, so different visits
    // have the sun in different places.
    const base = Math.atan2(this.planet.y, this.planet.x)
    for (let i = 0; i < this.system.stars.length; i++) {
      const star = this.system.stars[i]
      const a = base + i * 0.7
      const sx = w * (0.5 + Math.cos(a) * 0.34)
      const sy = h * (0.24 - Math.sin(a) * 0.1)
      const r = Math.max(12, star.radius * 0.3)
      // Additive bloom: over a coloured sky a plain alpha halo goes muddy grey.
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const grad = ctx.createRadialGradient(sx, sy, r * 0.6, sx, sy, r * 7)
      grad.addColorStop(0, withAlpha(star.color, 0.5))
      grad.addColorStop(0.25, withAlpha(star.color, 0.16))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(sx, sy, r * 7, 0, TAU)
      ctx.fill()
      ctx.restore()
      ctx.beginPath()
      ctx.arc(sx, sy, r, 0, TAU)
      ctx.fillStyle = tint(star.color, 0.25)
      ctx.fill()
    }

    // Moons of this planet, seen from below.
    for (let i = 0; i < this.planet.moons.length; i++) {
      const moon = this.planet.moons[i]
      const a = moon.orbitAngle * 0.5 + i
      const mx = this.deps.view.w * (0.5 + Math.sin(a) * 0.4)
      const my = this.deps.view.h * (0.2 + Math.cos(a * 0.7) * 0.07)
      const r = 10 + moon.radius * 0.6
      ctx.beginPath()
      ctx.arc(mx, my, r, 0, TAU)
      ctx.fillStyle = withAlpha(moon.color, 0.85)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(mx + r * 0.3, my - r * 0.22, r * 0.26, 0, TAU)
      ctx.fillStyle = withAlpha(INK, 0.12)
      ctx.fill()
      ink(ctx, 1.5, withAlpha(INK, 0.28))
      ctx.beginPath()
      ctx.arc(mx, my, r, 0, TAU)
      ctx.stroke()
    }

    // A handful of stars that are stubborn enough to show in daylight.
    const rng = new Rng(this.planet.seed ^ 0x51a12)
    for (let i = 0; i < 26; i++) {
      const sx = rng.range(0, this.deps.view.w)
      const sy = rng.range(0, this.deps.view.h * 0.55)
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(this.t * 0.9 + i))
      ctx.beginPath()
      ctx.arc(sx, sy, rng.range(0.7, 1.5), 0, TAU)
      ctx.fillStyle = withAlpha(CREAM, 0.3 * tw)
      ctx.fill()
    }
  }

  /** Soft clouds drifting across the sky on worlds that have weather. */
  private drawSkyClouds(ctx: Ctx) {
    const cover = this.planet.cloudiness
    if (cover <= 0.02) return
    const { w, h } = this.deps.view
    const count = Math.round(2 + cover * 5)
    for (let i = 0; i < count; i++) {
      const rng = new Rng(hashCombine(this.planet.seed, 0xc10d, i))
      const speed = rng.range(4, 11)
      const y = rng.range(h * 0.1, h * 0.46)
      const scale = rng.range(0.7, 1.8)
      // Wrap across the screen with a little parallax from walking.
      const span = w + 400 * scale
      const x = mod(rng.next() * span - this.t * speed - this.camX * 0.05, span) - 200 * scale
      ctx.save()
      ctx.globalAlpha = 0.16 + cover * 0.3
      cloudPath(ctx, x, y, 150 * scale, 42 * scale, hashCombine(this.planet.seed, i), rng.int(3, 5))
      ctx.fillStyle = CREAM
      ctx.fill()
      // A slightly brighter cap along the sunward top edge.
      ctx.globalAlpha *= 0.5
      cloudPath(ctx, x, y - 5 * scale, 132 * scale, 34 * scale, hashCombine(this.planet.seed, i, 2), 3)
      ctx.fill()
      ctx.restore()
    }
  }

  /** Parallax ridges behind the playable ground. */
  private drawHills(ctx: Ctx) {
    const { w, h } = this.deps.view
    const s = this.surface
    for (let i = 0; i < this.hills.length; i++) {
      const layer = this.hills[i]
      const offset = this.camX * layer.parallax
      // Far ridges sit higher above the horizon, near ones step down toward it.
      const horizon = h * 0.6 - 54 + i * 22
      ctx.beginPath()
      ctx.moveTo(-4, h)
      for (let sx = -4; sx <= w + 4; sx += 10) {
        const wx = sx + offset
        const y =
          horizon -
          layer.amp * Math.sin((TAU * layer.freq * wx) / s.width + layer.phase) -
          layer.amp * 0.35 * Math.sin((TAU * (layer.freq * 3) * wx) / s.width + layer.phase * 2)
        ctx.lineTo(sx, y)
      }
      ctx.lineTo(w + 4, h)
      ctx.closePath()
      // Atmospheric perspective: distant ridges wash out toward the sky colour
      // instead of just going grey, which keeps pale palettes from turning drab.
      const haze = 0.56 - i * 0.24
      ctx.fillStyle = mix(shade(this.planet.palette.ground, layer.shade), this.planet.palette.sky, haze)
      ctx.fill()
    }
  }

  /** The ground the explorer stands on, plus what's under it. */
  private drawGround(ctx: Ctx) {
    const s = this.surface
    const { w, h } = this.deps.view
    const halfW = w / 2 / this.zoom + 40
    const x0 = this.camX - halfW
    const x1 = this.camX + halfW
    const bottom = this.camY + h / this.zoom

    ctx.beginPath()
    ctx.moveTo(x0, bottom + 200)
    for (let x = x0; x <= x1; x += 5) ctx.lineTo(x, terrainY(s, x))
    ctx.lineTo(x1, bottom + 200)
    ctx.closePath()
    const p = this.planet.palette
    ctx.fillStyle = shade(p.ground, 0.46)
    ctx.fill()

    // A brighter crust band along the top.
    ctx.save()
    ctx.clip()
    ctx.beginPath()
    ctx.moveTo(x0, terrainY(s, x0))
    for (let x = x0; x <= x1; x += 5) ctx.lineTo(x, terrainY(s, x))
    ctx.lineTo(x1, terrainY(s, x1) + 26)
    for (let x = x1; x >= x0; x -= 5) ctx.lineTo(x, terrainY(s, x) + 26)
    ctx.closePath()
    ctx.fillStyle = p.ground
    ctx.fill()

    // Strata bands following the surface, fading as they go deeper.
    for (let band = 0; band < 4; band++) {
      const depth = 46 + band * 62
      ctx.beginPath()
      ctx.moveTo(x0, terrainY(s, x0) + depth)
      for (let x = x0; x <= x1; x += 8) ctx.lineTo(x, terrainY(s, x) + depth)
      ctx.lineTo(x1, terrainY(s, x1) + depth + 22)
      for (let x = x1; x >= x0; x -= 8) ctx.lineTo(x, terrainY(s, x) + depth + 22)
      ctx.closePath()
      ctx.fillStyle = withAlpha(INK, 0.05 + band * 0.02)
      ctx.fill()
    }

    // Buried pebbles. Anchored to world cells, not to the camera — otherwise
    // they swim across the ground as you walk.
    const cell = 56
    ctx.fillStyle = withAlpha(INK, 0.16)
    const c0 = Math.floor(x0 / cell)
    const c1 = Math.floor(x1 / cell)
    for (let cx = c0; cx <= c1; cx++) {
      for (let row = 0; row < 5; row++) {
        const seed = hashCombine(this.planet.seed, cx, row)
        const r1 = (seed % 1000) / 1000
        const r2 = ((seed >>> 10) % 1000) / 1000
        const r3 = ((seed >>> 20) % 1000) / 1000
        const px = cx * cell + r1 * cell
        const py = terrainY(s, px) + 40 + row * 62 + r2 * 46
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(r3 * TAU)
        ctx.beginPath()
        ctx.ellipse(0, 0, 2.5 + r2 * 4.5, 1.6 + r3 * 2.4, 0, 0, TAU)
        ctx.fill()
        ctx.restore()
      }
    }
    ctx.restore()

    // Ink line along the surface.
    ink(ctx, 2.4)
    ctx.beginPath()
    ctx.moveTo(x0, terrainY(s, x0))
    for (let x = x0; x <= x1; x += 5) ctx.lineTo(x, terrainY(s, x))
    ctx.stroke()
  }

  /**
   * Water fills every dip below the water line.
   *
   * Drawn *behind* the ground: the band spans the full width from the water
   * line down, then the land is painted over it, so water survives only where
   * the terrain sits lower. That's one fill instead of re-drawing the entire
   * ground on top of a clip, which is both cheaper and much easier to reason
   * about.
   */
  private drawWaterBehind(ctx: Ctx) {
    const s = this.surface
    if (s.waterY === null) return
    const { w, h } = this.deps.view
    const halfW = w / 2 / this.zoom + 40
    const x0 = this.camX - halfW
    const x1 = this.camX + halfW
    const bottom = this.camY + h / this.zoom + 240
    const level = s.waterY

    const swell = (x: number) => level + Math.sin(x * 0.03 + this.t * 1.3) * 1.8

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x0, swell(x0))
    for (let x = x0; x <= x1; x += 6) ctx.lineTo(x, swell(x))
    ctx.lineTo(x1, bottom)
    ctx.lineTo(x0, bottom)
    ctx.closePath()
    // Bluer than the ground it sits in, so a flooded dip reads as water rather
    // than as a slightly different shade of the same rock.
    ctx.fillStyle = mix(this.planet.palette.sky, '#4b7c96', 0.45)
    ctx.fill()
    // Depth: darker further down.
    ctx.save()
    ctx.clip()
    const grad = ctx.createLinearGradient(0, level, 0, level + 220)
    grad.addColorStop(0, withAlpha('#bfe0ee', 0.28))
    grad.addColorStop(1, withAlpha('#173a52', 0.5))
    ctx.fillStyle = grad
    ctx.fillRect(x0, level, x1 - x0, bottom - level)
    // A few drifting highlight lines.
    ink(ctx, 1.4, withAlpha(CREAM, 0.22))
    for (let i = 0; i < 6; i++) {
      const y = level + 14 + i * 22
      ctx.beginPath()
      ctx.moveTo(x0, y)
      for (let x = x0; x <= x1; x += 26) ctx.lineTo(x, y + Math.sin(x * 0.05 + this.t + i) * 2.5)
      ctx.stroke()
    }
    ctx.restore()
    ctx.restore()
  }

  /** The waterline, drawn after the ground so it reads on top of the shore. */
  private drawWaterline(ctx: Ctx) {
    const s = this.surface
    if (s.waterY === null) return
    const { w } = this.deps.view
    const halfW = w / 2 / this.zoom + 40
    const x0 = this.camX - halfW
    const x1 = this.camX + halfW
    const level = s.waterY
    ink(ctx, 2, withAlpha('#dff0f6', 0.75))
    ctx.beginPath()
    let drawing = false
    for (let x = x0; x <= x1; x += 6) {
      const y = level + Math.sin(x * 0.03 + this.t * 1.3) * 1.8
      // Only where there is actually water here, i.e. the ground is lower.
      if (terrainY(s, x) > level) {
        if (drawing) ctx.lineTo(x, y)
        else {
          ctx.moveTo(x, y)
          drawing = true
        }
      } else {
        drawing = false
      }
    }
    ctx.stroke()
  }

  /** Props, critters, the curiosity, the ship and the explorer. */
  private drawScenery(ctx: Ctx) {
    const s = this.surface
    const halfW = this.deps.view.w / 2 / this.zoom + 200

    // The hidden curiosity, behind everything else.
    if (s.eggX !== null && s.eggId) {
      const def = getEgg(s.eggId)
      if (def) {
        const ex = this.near(s.eggX)
        if (Math.abs(ex - this.camX) < halfW + 200) {
          ctx.save()
          ctx.translate(ex, terrainY(s, ex))
          def.draw(ctx, this.t)
          ctx.restore()
        }
      }
    }

    // Dig sites.
    for (const dig of s.digs) {
      const dx = this.near(dig.x)
      if (Math.abs(dx - this.camX) > halfW) continue
      ctx.save()
      ctx.translate(dx, terrainY(s, dx))
      drawDig(ctx, dig, this.t)
      ctx.restore()
    }

    // Props, sorted small to large at generation time so bigger things read as
    // being nearer the front.
    for (const prop of s.props) {
      const px = this.near(prop.x)
      if (Math.abs(px - this.camX) > halfW) continue
      ctx.save()
      ctx.translate(px, terrainY(s, px))
      drawProp(ctx, prop, this.t)
      ctx.restore()
    }

    for (const sap of s.saplings) {
      const sx = this.near(sap.x)
      if (Math.abs(sx - this.camX) > halfW) continue
      ctx.save()
      ctx.translate(sx, terrainY(s, sx))
      drawSapling(ctx, sap, this.t)
      ctx.restore()
    }

    // Dust puffs.
    for (const puff of this.puffs) {
      drawPuff(ctx, this.near(puff.x), puff.y, puff.age, puff.life, tint(this.planet.palette.ground, 0.4))
    }

    // Critters.
    for (const c of s.critters) {
      const cx = this.near(c.x)
      if (Math.abs(cx - this.camX) > halfW) continue
      ctx.save()
      ctx.translate(cx, terrainY(s, cx) - c.h)
      drawCritter(ctx, c, this.t)
      ctx.restore()
      if (c.startled > 0.5) this.drawStartleMark(ctx, cx, terrainY(s, cx) - c.h - 26 * c.size)
    }

    // The ship, waiting patiently.
    const shipX = this.near(s.landingX)
    ctx.save()
    ctx.translate(shipX, terrainY(s, shipX))
    drawLandedShip(ctx, this.deps.shipColor(), this.t, 0)
    if (this.shipInRange) {
      const bob = Math.sin(this.t * 2.6) * 3
      ink(ctx, 2.6, withAlpha(CREAM, 0.8))
      ctx.beginPath()
      ctx.moveTo(-8, -66 + bob)
      ctx.lineTo(0, -75 + bob)
      ctx.lineTo(8, -66 + bob)
      ctx.stroke()
    }
    ctx.restore()

    // The explorer, standing on (or hopping above) the ground.
    const groundY = terrainY(s, this.x)
    ctx.save()
    ctx.translate(this.x, groundY - this.h)
    // Lean into the slope when walking.
    if (this.onGround) ctx.rotate(clamp(terrainSlope(s, this.x), -0.5, 0.5) * 0.6)
    // Shadow.
    ctx.save()
    ctx.scale(1, 1)
    ctx.beginPath()
    ctx.ellipse(0, this.h * 0.02, 9, 3, 0, 0, TAU)
    ctx.fillStyle = withAlpha(INK, 0.22 * (1 - clamp(this.h / 120, 0, 0.7)))
    ctx.fill()
    ctx.restore()
    drawExplorer(ctx, this.deps.shipColor(), this.t, {
      walk: this.walk,
      airborne: !this.onGround,
      facing: this.facing,
      digging: this.digging,
    })
    ctx.restore()

    // Wading: a ripple where the explorer breaks the water surface.
    if (s.waterY !== null && groundY - this.h > s.waterY) {
      const level = s.waterY + Math.sin(this.x * 0.03 + this.t * 1.3) * 1.8
      ctx.save()
      ctx.translate(this.x, level)
      for (let i = 0; i < 2; i++) {
        const p = ((this.t * 0.9 + i * 0.5) % 1)
        ink(ctx, 1.6, withAlpha('#dff0f6', 0.5 * (1 - p)))
        ctx.beginPath()
        ctx.ellipse(0, 0, 8 + p * 20, (8 + p * 20) * 0.26, 0, 0, TAU)
        ctx.stroke()
      }
      ctx.restore()
    }

    if (this.burst.p < 1) drawBurst(ctx, this.near(this.burst.x), this.burst.y, this.burst.p)
  }

  private drawStartleMark(ctx: Ctx, x: number, y: number) {
    ctx.save()
    ctx.translate(x, y)
    ink(ctx, 2.4, CREAM)
    ctx.beginPath()
    ctx.moveTo(0, -8)
    ctx.lineTo(0, -1)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 2.5, 1.4, 0, TAU)
    ctx.fillStyle = CREAM
    ctx.fill()
    ctx.restore()
  }

  /** Screen-space weather, so it doesn't scroll with the camera. */
  private drawWeather(ctx: Ctx) {
    if (this.weather === 'none') return
    const { w, h } = this.deps.view
    const count = this.weather === 'rain' ? 60 : this.weather === 'snow' ? 46 : 34
    const rng = new Rng(0x5e1f)
    ctx.save()
    for (let i = 0; i < count; i++) {
      const seedX = rng.next()
      const seedY = rng.next()
      const speed = rng.range(0.4, 1.2)
      switch (this.weather) {
        case 'rain': {
          const x = seedX * w - this.camX * 0.3 * speed
          const y = ((seedY * h + this.t * 620 * speed) % (h + 40)) - 20
          ink(ctx, 1.3, withAlpha('#cfe4ee', 0.45))
          ctx.beginPath()
          ctx.moveTo(mod(x, w), y)
          ctx.lineTo(mod(x, w) - 2.5, y + 13)
          ctx.stroke()
          break
        }
        case 'snow': {
          const x = seedX * w + Math.sin(this.t * 0.7 + i) * 16 - this.camX * 0.2
          const y = ((seedY * h + this.t * 60 * speed) % (h + 20)) - 10
          ctx.beginPath()
          ctx.arc(mod(x, w), y, rng.range(1.1, 2.4), 0, TAU)
          ctx.fillStyle = withAlpha(CREAM, 0.8)
          ctx.fill()
          break
        }
        case 'ash': {
          const x = seedX * w + Math.sin(this.t * 0.4 + i) * 24 - this.camX * 0.15
          const y = ((seedY * h + this.t * 44 * speed) % (h + 20)) - 10
          ctx.beginPath()
          ctx.arc(mod(x, w), y, rng.range(1, 2.6), 0, TAU)
          ctx.fillStyle = withAlpha('#6b6560', 0.6)
          ctx.fill()
          break
        }
        case 'spores': {
          const x = seedX * w + Math.sin(this.t * 0.5 + i * 1.7) * 30 - this.camX * 0.18
          const y = h - ((seedY * h + this.t * 26 * speed) % (h + 20))
          sparkle(ctx, mod(x, w), y, rng.range(2, 4.5), withAlpha('#f0d894', 0.5))
          break
        }
        case 'dust': {
          const x = mod(seedX * w - this.t * 150 * speed - this.camX * 0.25, w)
          const y = seedY * h * 0.5 + h * 0.4 + Math.sin(this.t * 2 + i) * 8
          ink(ctx, 1.4, withAlpha('#d8bd92', 0.3))
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + 16, y - 2)
          ctx.stroke()
          break
        }
      }
    }
    ctx.restore()
  }

  /** Very light guidance: which way the curiosity is, and how to leave. */
  private drawHints(ctx: Ctx) {
    const s = this.surface
    const { w, h } = this.deps.view

    // An arrow at the screen edge pointing the long way round to the ship.
    const shipDelta = wrapDelta(this.x, s.landingX, s.width)
    if (Math.abs(shipDelta) > w * 0.5) {
      const side = shipDelta > 0 ? 1 : -1
      const x = side > 0 ? w - 22 : 22
      const y = h * 0.5
      ctx.save()
      ctx.globalAlpha = 0.55
      ctx.translate(x, y)
      ctx.scale(side, 1)
      ink(ctx, 2.4, CREAM)
      ctx.beginPath()
      ctx.moveTo(-5, -7)
      ctx.lineTo(4, 0)
      ctx.lineTo(-5, 7)
      ctx.stroke()
      // A tiny ship glyph above the arrow.
      ctx.beginPath()
      ctx.moveTo(0, -22)
      ctx.quadraticCurveTo(5, -16, 4, -11)
      ctx.lineTo(-4, -11)
      ctx.quadraticCurveTo(-5, -16, 0, -22)
      ctx.closePath()
      ctx.fillStyle = this.deps.shipColor()
      ctx.fill()
      ctx.restore()
    }

    // First-visit nudge: how to move. Only on the first couple of landings —
    // after that you know, and the screen should stay clean. It shares space
    // with the discovery banner, so it yields to that.
    if (save.landings <= 2 && this.t < 4.5 && !this.deps.input.down && !this.deps.hud.busy) {
      const a = Math.sin(clamp(this.t / 4.5, 0, 1) * Math.PI) * 0.7
      ctx.save()
      ctx.globalAlpha = a
      ctx.font = '500 13px ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = CREAM
      ctx.fillText('hold to walk  ·  tap to hop', w / 2, h - 96 - this.deps.hud.bottomInset)
      ctx.restore()
    }
  }

  /** Called by the shell during the landing/takeoff wipe. */
  drawSkyWash(ctx: Ctx, alpha: number) {
    const { w, h } = this.deps.view
    ctx.save()
    ctx.globalAlpha = clamp(alpha, 0, 1)
    ctx.fillStyle = this.planet.palette.sky
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }

  /** Note the ids already found, so the sparkle burst only fires once. */
  primeFound(ids: readonly string[]) {
    for (const id of ids) this.foundCache.add(id)
  }

  noteFound(id: string) {
    this.foundCache.add(id)
  }
}

function mod(v: number, m: number): number {
  return ((v % m) + m) % m
}

function pickWeather(planet: Planet): Weather {
  const rng = new Rng(hashCombine(planet.seed, 0x1234))
  switch (planet.biome) {
    case 'ice':
      return rng.chance(0.75) ? 'snow' : 'none'
    case 'volcanic':
      return 'ash'
    case 'fungal':
      return rng.chance(0.8) ? 'spores' : 'none'
    case 'desert':
      return rng.chance(0.65) ? 'dust' : 'none'
    case 'ocean':
    case 'forest':
    case 'meadow':
      return rng.chance(0.4) ? 'rain' : 'none'
    default:
      return rng.chance(0.15) ? 'rain' : 'none'
  }
}

const BIOME_TOAST: Record<string, { title: string; note: string }> = {
  rocky: { title: 'A Stony World', note: 'Craters, dust, and a horizon that goes on politely forever.' },
  forest: { title: 'A Wooded World', note: 'Tall things that creak. Something is always rustling behind you.' },
  ocean: { title: 'A Water World', note: 'More sea than land, and the land is mostly opinion.' },
  desert: { title: 'A Sand World', note: 'Dunes that move overnight and never say where they went.' },
  ice: { title: 'A Frozen World', note: 'Everything squeaks underfoot. Your breath draws in the air.' },
  gas: { title: 'A Cloud World', note: 'No floor at all. Beautiful from a distance, which is where you stay.' },
  volcanic: { title: 'An Ember World', note: 'Warm rock, orange seams, and air that tastes of matches.' },
  crystal: { title: 'A Glass World', note: 'It chimes when you walk. Every step is a slightly different note.' },
  fungal: { title: 'A Spore World', note: 'Soft, springy, and quietly enormous underneath.' },
  meadow: { title: 'A Meadow World', note: 'Grass to the knees and flowers that turn to watch you pass.' },
}

