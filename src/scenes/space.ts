/**
 * Flying around a solar system.
 *
 * Hold a finger anywhere and the ship thrusts toward it; let go and it coasts.
 * Tap a planet you're near to land. Drift past the edge of the system and you
 * warp to a neighbouring one, which is what makes the game endless.
 */

import { TAU, clamp, damp, dist, remap, easeOutCubic } from '../core/math'
import { audio } from '../core/audio'
import { Rng } from '../core/rng'
import { Camera, ShootingStars, Starfield } from '../render/camera'
import { CREAM, INK, SPACE_FAR, SPACE_NEAR, withAlpha, shade } from '../render/palette'
import { blobPath, glow, ink, sparkle, starPath, type Ctx } from '../render/shapes'
import { drawBurst, drawLandingMarker, drawShip } from '../world/actors'
import { getEgg } from '../world/eggs'
import { eggKey } from '../world/collection'
import { drawPlanet, type Planet } from '../world/planet'
import { peekSystem, updateSystem, type SolarSystem } from '../world/universe'
import type { SceneDeps } from './context'

const MAX_SPEED = 330
const ACCEL = 560
const DRAG = 0.75

export type SpaceOutcome =
  | { type: 'land'; planet: Planet }
  | { type: 'warp'; dx: number; dy: number }

interface Ship {
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  thrust: number
}

export class SpaceScene {
  system: SolarSystem
  ship: Ship = { x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, thrust: 0 }
  cam: Camera
  private starfield: Starfield
  private shooting = new ShootingStars()
  private t = 0
  private blink = 0
  private blinkTimer = 2
  mapOpen = false
  /** Planet the player is close enough to land on. */
  private landable: Planet | null = null
  private landableGlow = 0
  /** Burst animation when a space curiosity is found. */
  private burst = { x: 0, y: 0, p: 1 }
  /** Eggs that have already played their sparkle in this session. */
  private burstedEggs = new Set<string>()
  /** Suppresses input for a moment after arriving, so a warp tap doesn't land you. */
  private settleIn = 0

  constructor(
    private deps: SceneDeps,
    system: SolarSystem,
  ) {
    this.system = system
    this.cam = new Camera(deps.view.w, deps.view.h)
    this.starfield = new Starfield(system.seed)
    this.placeAtEdge(0, 0)
  }

  /** Enter a system. `fromDx/fromDy` is the direction travelled to get here. */
  enter(system: SolarSystem, fromDx: number, fromDy: number) {
    this.system = system
    this.starfield.setSector(system.seed)
    this.placeAtEdge(fromDx, fromDy)
    this.cam.jumpTo(this.ship.x, this.ship.y, 0.85)
    this.landable = null
    this.settleIn = 0.5
    this.deps.hud.announcePlace(system.name)
  }

  /** Put the ship at the system edge opposite the direction of travel. */
  private placeAtEdge(dx: number, dy: number) {
    const s = this.system
    if (dx === 0 && dy === 0) {
      // First arrival: start out beyond the innermost planet, looking in.
      const first = s.planets[0]
      const r = first ? first.orbitRadius + first.radius + 150 : 500
      this.ship.x = 0
      this.ship.y = r
      this.ship.vx = 0
      this.ship.vy = -60
    } else {
      const len = Math.hypot(dx, dy) || 1
      const nx = dx / len
      const ny = dy / len
      // Arrive on the far side, moving inward.
      this.ship.x = -nx * (s.extent - 40)
      this.ship.y = -ny * (s.extent - 40)
      this.ship.vx = nx * 130
      this.ship.vy = ny * 130
    }
    this.ship.angle = Math.atan2(this.ship.vy, this.ship.vx)
  }

  /** Place the ship just above a planet, e.g. after taking off from it. */
  placeAbove(planet: Planet) {
    const a = Math.atan2(planet.y, planet.x)
    const d = planet.radius + 74
    this.ship.x = planet.x + Math.cos(a) * d
    this.ship.y = planet.y + Math.sin(a) * d
    this.ship.vx = Math.cos(a) * 70
    this.ship.vy = Math.sin(a) * 70
    this.ship.angle = a
    this.cam.jumpTo(this.ship.x, this.ship.y, 1)
    this.settleIn = 0.4
  }

  resize(w: number, h: number) {
    this.cam.resize(w, h)
  }

  update(dt: number): SpaceOutcome | null {
    this.t += dt
    this.settleIn = Math.max(0, this.settleIn - dt)
    updateSystem(this.system, dt)
    this.starfield.update(dt)
    this.shooting.update(dt, this.deps.view.w, this.deps.view.h)
    this.burst.p = Math.min(1, this.burst.p + dt * 1.5)

    // Idle blinking, because the ship has a face.
    this.blinkTimer -= dt
    if (this.blinkTimer <= 0) {
      this.blinkTimer = 2.4 + Math.random() * 4
      this.blink = 0.22
    }
    this.blink = Math.max(0, this.blink - dt)

    this.updateShip(dt)
    this.updateLandable()

    const outcome = this.handleTaps()
    if (outcome) return outcome

    // Camera: pull back as speed builds so fast travel stays readable.
    const speed = Math.hypot(this.ship.vx, this.ship.vy)
    if (this.mapOpen) {
      // Leave room around the edges for the warp-gate signposts and their names.
      const fit = Math.min(
        this.deps.view.w / (this.system.extent * 2.55),
        this.deps.view.h / (this.system.extent * 2.3),
      )
      this.cam.setZoom(fit)
      this.cam.follow(0, 0, dt, 3.4)
    } else {
      this.cam.setZoom(remap(speed, 40, MAX_SPEED, 1.02, 0.66))
      // Lead the camera in the direction of travel.
      this.cam.follow(this.ship.x, this.ship.y, dt, 6, this.ship.vx * 0.28, this.ship.vy * 0.28)
    }

    // Space curiosities are found simply by getting close.
    const egg = this.system.spaceEgg
    if (egg) {
      const def = getEgg(egg.id)
      if (def) {
        const ey = egg.y + Math.sin(egg.driftPhase) * 14
        if (dist(this.ship.x, this.ship.y, egg.x, ey) < def.reach) {
          if (!this.burstedEggs.has(def.id)) {
            this.burstedEggs.add(def.id)
            this.burst = { x: egg.x, y: ey, p: 0 }
          }
          this.deps.discover(eggKey(def.id), def.title, def.note)
        }
      }
    }

    // Past the edge of the system? Off to the next one.
    const r = Math.hypot(this.ship.x, this.ship.y)
    if (r > this.system.extent) {
      const len = r || 1
      return { type: 'warp', dx: this.ship.x / len, dy: this.ship.y / len }
    }

    return null
  }

  private updateShip(dt: number) {
    const { input } = this.deps
    const ship = this.ship
    let ax = 0
    let ay = 0

    if (input.down && !this.mapOpen) {
      const target = this.cam.screenToWorld(input.x, input.y)
      const dx = target.x - ship.x
      const dy = target.y - ship.y
      const d = Math.hypot(dx, dy) || 1
      // Ease off when the finger is very close, so the ship settles instead of
      // jittering back and forth over the target.
      const strength = clamp(d / 90, 0, 1)
      ax = (dx / d) * ACCEL * strength
      ay = (dy / d) * ACCEL * strength
      ship.thrust = damp(ship.thrust, strength, 10, dt)
    } else {
      ship.thrust = damp(ship.thrust, 0, 8, dt)
    }

    // Keyboard, for desktop.
    const k = this.deps.input.keyAxis()
    if (k.x !== 0 || k.y !== 0) {
      const kl = Math.hypot(k.x, k.y)
      ax += (k.x / kl) * ACCEL
      ay += (k.y / kl) * ACCEL
      ship.thrust = damp(ship.thrust, 1, 10, dt)
    }

    // A gentle tug near each planet: enough to bend a flyby into a nice arc,
    // never enough to trap you.
    for (const planet of this.system.planets) {
      const dx = planet.x - ship.x
      const dy = planet.y - ship.y
      const d = Math.hypot(dx, dy) || 1
      const reach = planet.radius * 3.2
      if (d < reach) {
        const pull = 70 * (1 - d / reach) * (planet.gravity * 0.6 + 0.4)
        ax += (dx / d) * pull
        ay += (dy / d) * pull
      }
    }

    ship.vx += ax * dt
    ship.vy += ay * dt

    // Drag, then clamp.
    const dragFactor = Math.exp(-DRAG * dt)
    ship.vx *= dragFactor
    ship.vy *= dragFactor
    const speed = Math.hypot(ship.vx, ship.vy)
    if (speed > MAX_SPEED) {
      ship.vx = (ship.vx / speed) * MAX_SPEED
      ship.vy = (ship.vy / speed) * MAX_SPEED
    }

    ship.x += ship.vx * dt
    ship.y += ship.vy * dt

    // Point where we're going, or where the finger is if drifting.
    if (speed > 12) {
      const target = Math.atan2(ship.vy, ship.vx)
      const delta = ((target - ship.angle + Math.PI * 3) % TAU) - Math.PI
      ship.angle += delta * Math.min(1, dt * 7)
    }

    // Don't let the ship sink into a planet.
    for (const planet of this.system.planets) {
      const d = dist(ship.x, ship.y, planet.x, planet.y)
      const min = planet.radius + 22
      if (d < min) {
        const nx = (ship.x - planet.x) / (d || 1)
        const ny = (ship.y - planet.y) / (d || 1)
        ship.x = planet.x + nx * min
        ship.y = planet.y + ny * min
        // Bounce off softly.
        const vn = ship.vx * nx + ship.vy * ny
        ship.vx -= nx * vn * 1.5
        ship.vy -= ny * vn * 1.5
        if (Math.abs(vn) > 90) {
          this.cam.shake(3)
          audio.thud()
        }
      }
    }

    // And keep clear of the star itself.
    for (const star of this.system.stars) {
      const d = dist(ship.x, ship.y, star.x, star.y)
      const min = star.radius + 46
      if (d < min) {
        const nx = (ship.x - star.x) / (d || 1)
        const ny = (ship.y - star.y) / (d || 1)
        ship.x = star.x + nx * min
        ship.y = star.y + ny * min
        const vn = ship.vx * nx + ship.vy * ny
        ship.vx -= nx * vn * 1.6
        ship.vy -= ny * vn * 1.6
      }
    }
  }

  private updateLandable() {
    let best: Planet | null = null
    let bestD = Infinity
    for (const planet of this.system.planets) {
      if (!planet.landable) continue
      const d = dist(this.ship.x, this.ship.y, planet.x, planet.y) - planet.radius
      if (d < 190 && d < bestD) {
        best = planet
        bestD = d
      }
    }
    this.landable = best
    this.landableGlow = clamp(this.landableGlow + (best ? 0.06 : -0.09), 0, 1)
  }

  private handleTaps(): SpaceOutcome | null {
    const taps = this.deps.input.takeTaps()
    if (taps.length === 0 || this.settleIn > 0) return null
    for (const tap of taps) {
      const world = this.cam.screenToWorld(tap.x, tap.y)
      // Tapping a nearby landable planet takes you down.
      for (const planet of this.system.planets) {
        if (!planet.landable) continue
        const dTap = dist(world.x, world.y, planet.x, planet.y)
        const dShip = dist(this.ship.x, this.ship.y, planet.x, planet.y) - planet.radius
        if (dTap < planet.radius + 40 && dShip < 210) {
          return { type: 'land', planet }
        }
      }
    }
    return null
  }

  draw(ctx: Ctx) {
    const { w, h } = this.deps.view

    // Backdrop.
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, SPACE_FAR)
    g.addColorStop(1, SPACE_NEAR)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    this.starfield.draw(ctx, this.cam)
    this.shooting.draw(ctx)

    this.cam.apply(ctx)

    this.drawOrbits(ctx)
    this.drawWarpBoundary(ctx)
    this.drawRocks(ctx)
    this.drawStars(ctx)

    for (const planet of this.system.planets) {
      drawPlanet(ctx, planet, this.t, this.deps.quality)
      if (planet === this.landable && this.landableGlow > 0.02) {
        ctx.save()
        ctx.translate(planet.x, planet.y)
        drawLandingMarker(ctx, planet.radius + 16, this.t, this.landableGlow * 0.9)
        ctx.restore()
      }
    }

    this.drawSpaceEgg(ctx)

    // Zoomed all the way out the ship is a speck, so ring it.
    if (this.mapOpen) {
      ctx.save()
      ink(ctx, 2 / this.cam.zoom, withAlpha(CREAM, 0.75))
      ctx.beginPath()
      ctx.arc(this.ship.x, this.ship.y, (26 + Math.sin(this.t * 2.4) * 3) / this.cam.zoom, 0, TAU)
      ctx.stroke()
      ctx.restore()
    }

    // The ship.
    ctx.save()
    ctx.translate(this.ship.x, this.ship.y)
    ctx.rotate(this.ship.angle + Math.PI / 2)
    const tilt = clamp((this.ship.vx * Math.cos(this.ship.angle) + this.ship.vy * Math.sin(this.ship.angle)) / 200, -1, 1)
    drawShip(ctx, this.deps.shipColor(), this.t, this.ship.thrust, { tilt, blink: this.blink })
    ctx.restore()

    if (this.burst.p < 1) drawBurst(ctx, this.burst.x, this.burst.y, this.burst.p)

    ctx.restore()

    if (!this.mapOpen) this.drawOffscreenPips(ctx)
    if (this.mapOpen) this.drawMapLabels(ctx)
    this.drawTouchHint(ctx)
  }

  private drawOrbits(ctx: Ctx) {
    ink(ctx, 1 / this.cam.zoom, withAlpha(CREAM, this.mapOpen ? 0.22 : 0.12))
    for (const planet of this.system.planets) {
      ctx.beginPath()
      ctx.arc(0, 0, planet.orbitRadius, 0, TAU)
      ctx.stroke()
    }
  }

  private drawWarpBoundary(ctx: Ctx) {
    const r = this.system.extent
    ctx.save()
    ink(ctx, 2 / this.cam.zoom, withAlpha(CREAM, 0.2))
    ctx.setLineDash([26 / this.cam.zoom, 30 / this.cam.zoom])
    ctx.lineDashOffset = -this.t * 14
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, TAU)
    ctx.stroke()
    ctx.setLineDash([])

    // Signposts to the four neighbouring systems.
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ]
    for (const d of dirs) {
      const peek = peekSystem(this.system.sx + d.dx, this.system.sy + d.dy)
      const x = d.dx * r
      const y = d.dy * r
      const s = 1 / this.cam.zoom
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(s, s)
      // A ring with the neighbour's star colour in it.
      glow(ctx, 0, 0, 34, peek.color, 0.4)
      ink(ctx, 2.4, withAlpha(CREAM, 0.5))
      ctx.beginPath()
      ctx.arc(0, 0, 17, 0, TAU)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, 0, 6.5, 0, TAU)
      ctx.fillStyle = peek.color
      ctx.fill()
      // Arrow pointing outward.
      const a = Math.atan2(d.dy, d.dx)
      ctx.rotate(a)
      ink(ctx, 2.4, withAlpha(CREAM, 0.65))
      ctx.beginPath()
      ctx.moveTo(22, -7)
      ctx.lineTo(31, 0)
      ctx.lineTo(22, 7)
      ctx.stroke()
      ctx.restore()

      if (this.mapOpen) {
        const p = this.cam.worldToScreen(x, y)
        ctx.save()
        ctx.font = '500 12px ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = withAlpha(CREAM, 0.8)
        const offY = d.dy > 0 ? 30 : d.dy < 0 ? -30 : -26
        ctx.fillText(peek.name, p.x, p.y + offY)
        ctx.restore()
      }
    }
    ctx.restore()
  }

  private drawRocks(ctx: Ctx) {
    const b = this.cam.bounds(60)
    for (const rock of this.system.rocks) {
      if (rock.x < b.x0 || rock.x > b.x1 || rock.y < b.y0 || rock.y > b.y1) continue
      ctx.save()
      ctx.translate(rock.x, rock.y)
      ctx.rotate(this.t * rock.spin)
      blobPath(ctx, 0, 0, rock.size, rock.seed, { points: 8, wobble: 0.26 })
      ctx.fillStyle = '#7d7466'
      ctx.fill()
      ink(ctx, 1.4, withAlpha(INK, 0.6))
      ctx.stroke()
      ctx.restore()
    }
  }

  private drawStars(ctx: Ctx) {
    for (const star of this.system.stars) {
      const r = star.radius
      glow(ctx, star.x, star.y, r * 5.2, star.color, 0.5)
      // Corona rays, slowly turning.
      ctx.save()
      ctx.translate(star.x, star.y)
      ctx.rotate(this.t * 0.05)
      const rng = new Rng(star.seed)
      ink(ctx, 3, withAlpha(star.color, 0.42))
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU
        const len = r * rng.range(1.18, 1.5) + Math.sin(this.t * 1.4 + i) * r * 0.05
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * r * 1.04, Math.sin(a) * r * 1.04)
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len)
        ctx.stroke()
      }
      ctx.restore()

      blobPath(ctx, star.x, star.y, r, star.seed, { points: 22, wobble: 0.022 })
      ctx.fillStyle = star.color
      ctx.fill()
      // A paler core.
      blobPath(ctx, star.x - r * 0.1, star.y - r * 0.12, r * 0.72, star.seed + 1, { points: 18, wobble: 0.04 })
      ctx.fillStyle = withAlpha(CREAM, 0.42)
      ctx.fill()
      // Sunspots, for texture.
      const rng2 = new Rng(star.seed + 7)
      for (let i = 0; i < 4; i++) {
        const a = rng2.range(0, TAU)
        const d = rng2.range(0, r * 0.7)
        blobPath(ctx, star.x + Math.cos(a) * d, star.y + Math.sin(a) * d, rng2.range(r * 0.06, r * 0.14), star.seed + i * 3, {
          points: 9,
          wobble: 0.2,
        })
        ctx.fillStyle = withAlpha(shade(star.color, 0.3), 0.35)
        ctx.fill()
      }
    }
  }

  private drawSpaceEgg(ctx: Ctx) {
    const egg = this.system.spaceEgg
    if (!egg) return
    const def = getEgg(egg.id)
    if (!def) return
    const y = egg.y + Math.sin(egg.driftPhase) * 14
    // Only draw when roughly on screen — some of these are big.
    const b = this.cam.bounds(260)
    if (egg.x < b.x0 || egg.x > b.x1 || y < b.y0 || y > b.y1) return
    ctx.save()
    ctx.translate(egg.x, y)
    ctx.rotate(Math.sin(egg.driftPhase * 0.4) * 0.06)
    def.draw(ctx, this.t)
    ctx.restore()
    // A faint ring so you can spot it from a distance.
    if (this.mapOpen) {
      ctx.save()
      ink(ctx, 2 / this.cam.zoom, withAlpha(CREAM, 0.35))
      ctx.beginPath()
      ctx.arc(egg.x, y, def.reach, 0, TAU)
      ctx.stroke()
      ctx.restore()
    }
  }

  /** Small markers at the screen edge for planets you can't currently see. */
  private drawOffscreenPips(ctx: Ctx) {
    const { w, h } = this.deps.view
    const margin = 26
    for (const planet of this.system.planets) {
      const p = this.cam.worldToScreen(planet.x, planet.y)
      const rr = planet.radius * this.cam.zoom
      if (p.x + rr > 0 && p.x - rr < w && p.y + rr > 0 && p.y - rr < h) continue
      // Direction from screen centre to the planet, clipped to the edge.
      const cx = w / 2
      const cy = h / 2
      const dx = p.x - cx
      const dy = p.y - cy
      const scale = Math.min(
        (w / 2 - margin) / Math.max(1, Math.abs(dx)),
        (h / 2 - margin) / Math.max(1, Math.abs(dy)),
      )
      const ex = cx + dx * scale
      const ey = cy + dy * scale
      ctx.save()
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.arc(ex, ey, 4.5, 0, TAU)
      ctx.fillStyle = planet.palette.ground
      ctx.fill()
      ink(ctx, 1.4, withAlpha(CREAM, 0.5))
      ctx.stroke()
      ctx.restore()
    }
  }

  private drawMapLabels(ctx: Ctx) {
    ctx.save()
    ctx.font = '500 11px ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (const planet of this.system.planets) {
      const p = this.cam.worldToScreen(planet.x, planet.y)
      const off = planet.radius * this.cam.zoom + 7
      ctx.fillStyle = withAlpha(CREAM, 0.75)
      ctx.fillText(planet.name, p.x, p.y + off)
      if (!planet.landable) {
        ctx.fillStyle = withAlpha(CREAM, 0.4)
        ctx.fillText('no ground', p.x, p.y + off + 13)
      }
    }
    ctx.restore()
  }

  /** A soft ring under the finger, so touches feel connected to the ship. */
  private drawTouchHint(ctx: Ctx) {
    const { input } = this.deps
    if (!input.down || this.mapOpen) return
    const a = easeOutCubic(clamp(input.heldFor / 0.25, 0, 1)) * 0.5
    ctx.save()
    ctx.globalAlpha = a
    ink(ctx, 2, withAlpha(CREAM, 0.8))
    ctx.beginPath()
    ctx.arc(input.x, input.y, 20 + Math.sin(this.t * 5) * 2.5, 0, TAU)
    ctx.stroke()
    sparkle(ctx, input.x, input.y, 6, withAlpha(CREAM, 0.6))
    ctx.restore()
  }

  /** Draw the warp streak effect over everything. Called by the shell. */
  drawWarpStreaks(ctx: Ctx, p: number, dx: number, dy: number) {
    const { w, h } = this.deps.view
    const intensity = Math.sin(clamp(p, 0, 1) * Math.PI)
    if (intensity <= 0.01) return
    ctx.save()
    ctx.globalAlpha = intensity
    ctx.translate(w / 2, h / 2)
    const a = Math.atan2(dy, dx)
    ctx.rotate(a)
    const rng = new Rng(4242)
    for (let i = 0; i < 70; i++) {
      const y = rng.range(-h, h)
      const x0 = rng.range(-w, w)
      const len = rng.range(40, 260) * intensity
      const g = ctx.createLinearGradient(x0, y, x0 + len, y)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, withAlpha(CREAM, rng.range(0.2, 0.7)))
      ctx.strokeStyle = g
      ctx.lineWidth = rng.range(1, 2.4)
      ctx.beginPath()
      ctx.moveTo(x0, y)
      ctx.lineTo(x0 + len, y)
      ctx.stroke()
    }
    ctx.restore()

    // A flash at the midpoint of the jump.
    const flash = Math.max(0, 1 - Math.abs(p - 0.5) * 6)
    if (flash > 0) {
      ctx.save()
      ctx.globalAlpha = flash * 0.5
      ctx.fillStyle = CREAM
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }
  }

  /** Zoom-in used while landing; returns once fully zoomed. */
  drawLandingZoom(ctx: Ctx, planet: Planet, p: number) {
    // A growing disc of the planet's sky colour, wiping the screen.
    const { w, h } = this.deps.view
    const screen = this.cam.worldToScreen(planet.x, planet.y)
    const maxR = Math.hypot(w, h)
    const r = easeOutCubic(p) * maxR
    ctx.save()
    ctx.globalAlpha = clamp(p * 1.6, 0, 1)
    const g = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, Math.max(1, r))
    g.addColorStop(0, planet.palette.skyLow)
    g.addColorStop(0.7, planet.palette.sky)
    g.addColorStop(1, withAlpha(planet.palette.sky, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(screen.x, screen.y, Math.max(1, r), 0, TAU)
    ctx.fill()
    ctx.restore()
    if (p > 0.55) {
      ctx.save()
      ctx.globalAlpha = remap(p, 0.55, 1, 0, 1)
      ctx.fillStyle = planet.palette.sky
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }
  }

  /** Little decorative stars for the loading flash — keeps transitions lively. */
  drawTransitionSparkles(ctx: Ctx, p: number) {
    const { w, h } = this.deps.view
    const rng = new Rng(99)
    for (let i = 0; i < 12; i++) {
      const x = rng.range(0, w)
      const y = rng.range(0, h)
      const s = Math.sin(clamp(p, 0, 1) * Math.PI) * rng.range(4, 11)
      starPath(ctx, x, y, s, s * 0.4, 4, rng.range(0, TAU))
      ctx.fillStyle = withAlpha(CREAM, 0.5)
      ctx.fill()
    }
  }
}
