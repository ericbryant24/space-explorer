/**
 * Starling — an endless, gentle space sandbox.
 *
 * The shell: canvas setup, the frame loop, and the little state machine that
 * moves between flying, landing, walking around and warping to the next system.
 */

import { audio } from './core/audio'
import { Input, type InputCapture } from './core/input'
import { clamp } from './core/math'
import { save } from './core/save'
import { installPaper, setVignette } from './render/paper'
import { SHIP_COLORS } from './render/palette'
import { SpaceScene } from './scenes/space'
import { SurfaceScene } from './scenes/surface'
import type { SceneDeps } from './scenes/context'
import { Hud, type ButtonId } from './ui/hud'
import { StickerBook } from './ui/stickerbook'
import { COLLECTION_TOTAL } from './world/collection'
import type { Planet } from './world/planet'
import { getSystem, type SolarSystem } from './world/universe'

type Mode = 'space' | 'surface' | 'landing' | 'takeoff' | 'warp'

const LANDING_TIME = 0.95
const TAKEOFF_TIME = 0.8
const WARP_TIME = 1.45

class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private uiCanvas: HTMLCanvasElement
  private uiCtx: CanvasRenderingContext2D
  private input: Input
  private hud = new Hud()
  private book = new StickerBook()

  private view = { w: 0, h: 0 }
  private dpr = 1

  private sector: { x: number; y: number }
  private system: SolarSystem
  private space: SpaceScene
  private surface: SurfaceScene | null = null

  private mode: Mode = 'space'
  private transition = 0
  /** Planet being landed on / taken off from. */
  private target: Planet | null = null
  /** Direction of the current warp. */
  private warpDir = { x: 1, y: 0 }
  private warpDone = false

  private shipColor = save.shipColor
  private lastTime = 0
  private booted = false

  private deps: SceneDeps

  constructor() {
    this.canvas = document.getElementById('stage') as HTMLCanvasElement
    const ctx = this.canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('This browser cannot give us a 2D canvas.')
    this.ctx = ctx
    this.uiCanvas = document.getElementById('ui') as HTMLCanvasElement
    const uiCtx = this.uiCanvas.getContext('2d')
    if (!uiCtx) throw new Error('This browser cannot give us a 2D canvas.')
    this.uiCtx = uiCtx
    installPaper()
    // Input listens on the world canvas; the UI canvas is pointer-events: none,
    // so taps fall straight through to it.
    this.input = new Input(this.canvas)

    this.sector = { x: save.sector.x, y: save.sector.y }
    this.system = getSystem(this.sector.x, this.sector.y)

    this.deps = {
      input: this.input,
      hud: this.hud,
      view: this.view,
      quality: 1,
      shipColor: () => SHIP_COLORS[this.shipColor % SHIP_COLORS.length],
      discover: (id, title, note) => this.discover(id, title, note),
    }

    this.resize()
    this.space = new SpaceScene(this.deps, this.system)
    this.hud.announcePlace(this.system.name)

    this.input.setCapture(this.makeCapture())
    window.addEventListener('resize', () => this.resize())
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 120))
    // Audio can only start inside a gesture.
    const unlock = () => {
      audio.ensure()
      if (save.muted !== audio.isMuted) audio.toggleMute()
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    requestAnimationFrame(this.frame)
  }

  /** Read-only snapshot of the current state, for automated checks. */
  probe() {
    return {
      mode: this.mode,
      sector: { ...this.sector },
      system: this.system.name,
      found: save.foundCount,
      total: COLLECTION_TOTAL,
      landings: save.landings,
      surface: this.surface
        ? {
            planet: this.surface.planet.name,
            biome: this.surface.planet.biome,
            gravity: Number(this.surface.planet.gravity.toFixed(2)),
            hasEgg: this.surface.surface.eggId,
            digs: this.surface.surface.digs.length,
            props: this.surface.surface.props.length,
            critters: this.surface.surface.critters.length,
            waterY: this.surface.surface.waterY,
            terrain: this.surface.terrainRange(),
          }
        : null,
      planets: this.system.planets.map((p) => {
        const s = this.space.cam.worldToScreen(p.x, p.y)
        return {
          name: p.name,
          biome: p.biome,
          landable: p.landable,
          screen: { x: Math.round(s.x), y: Math.round(s.y) },
          screenRadius: Math.round(p.radius * this.space.cam.zoom),
          hasEgg: p.eggId,
          shipDistance: Math.round(
            Math.hypot(this.space.ship.x - p.x, this.space.ship.y - p.y) - p.radius,
          ),
        }
      }),
      spaceEggs: this.system.spaceEggs.map((e) => e.id),
    }
  }

  private makeCapture(): InputCapture {
    return {
      onDown: (x, y) => {
        if (this.book.isOpen) return this.book.onPointerDown(x, y)
        const btn = this.hud.hitTest(x, y)
        if (btn) {
          this.pressButton(btn)
          return true
        }
        return false
      },
      onMove: (_x, y) => {
        if (this.book.isOpen) this.book.onPointerMove(y)
      },
      onUp: (x, y) => {
        if (this.book.isOpen) this.book.onPointerUp(x, y)
      },
    }
  }

  private pressButton(id: ButtonId) {
    audio.ensure()
    switch (id) {
      case 'paint':
        this.shipColor = (this.shipColor + 1) % SHIP_COLORS.length
        save.shipColor = this.shipColor
        audio.note(undefined, { gain: 0.16, decay: 0.8 })
        break
      case 'book':
        this.book.open()
        audio.tick()
        break
      case 'sound':
        save.muted = audio.toggleMute()
        break
      case 'map':
        this.space.mapOpen = !this.space.mapOpen
        audio.tick()
        break
    }
  }

  private discover(id: string, title: string, note: string) {
    const isNew = save.discover(id)
    this.surface?.noteFound(id)
    if (!isNew) return
    this.hud.toast(title, note, true)
    audio.chime()
  }

  private resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    // Cap the pixel ratio: 3x on a big phone screen costs a lot for very
    // little visible gain on soft, flat artwork.
    this.dpr = clamp(window.devicePixelRatio || 1, 1, 2.25)
    this.view.w = w
    this.view.h = h
    for (const c of [this.canvas, this.uiCanvas]) {
      c.width = Math.round(w * this.dpr)
      c.height = Math.round(h * this.dpr)
      c.style.width = `${w}px`
      c.style.height = `${h}px`
    }
    this.deps.quality = this.dpr
    this.hud.layout(w, h)
    this.space?.resize(w, h)
    this.surface?.resize(w, h)
  }

  private frame = (now: number) => {
    requestAnimationFrame(this.frame)
    const t = now / 1000
    // Clamp dt so a backgrounded tab doesn't teleport the ship into a star.
    const dt = this.lastTime === 0 ? 1 / 60 : clamp(t - this.lastTime, 0, 1 / 20)
    this.lastTime = t

    this.update(dt)
    this.render()

    if (!this.booted) {
      this.booted = true
      document.getElementById('boot')?.classList.add('gone')
    }
  }

  private update(dt: number) {
    this.input.update(dt)
    this.hud.update(dt)
    this.book.update(dt)

    // The sticker book pauses the world; it's a book, after all.
    if (this.book.isOpen) return

    switch (this.mode) {
      case 'space': {
        const outcome = this.space.update(dt)
        if (outcome?.type === 'land') this.beginLanding(outcome.planet)
        else if (outcome?.type === 'warp') this.beginWarp(outcome.dx, outcome.dy)
        break
      }
      case 'surface': {
        const outcome = this.surface?.update(dt)
        if (outcome?.type === 'takeoff') this.beginTakeoff()
        break
      }
      case 'landing': {
        // Keep the system alive underneath the wipe.
        this.space.update(dt)
        this.transition += dt / LANDING_TIME
        if (this.transition >= 1) this.finishLanding()
        break
      }
      case 'takeoff': {
        this.surface?.update(dt)
        this.transition += dt / TAKEOFF_TIME
        if (this.transition >= 1) this.finishTakeoff()
        break
      }
      case 'warp': {
        this.space.update(dt)
        this.transition += dt / WARP_TIME
        if (this.transition >= 0.5 && !this.warpDone) {
          this.warpDone = true
          this.arriveInNextSystem()
        }
        if (this.transition >= 1) {
          this.mode = 'space'
          audio.setPadLevel(1)
        }
        break
      }
    }
  }

  // --- transitions ---

  private beginLanding(planet: Planet) {
    this.target = planet
    this.mode = 'landing'
    this.transition = 0
    this.input.clearTaps()
    this.space.mapOpen = false
    audio.whoosh(1)
  }

  private finishLanding() {
    const planet = this.target!
    // Land under the ship's current angle around the planet, so where you
    // approach from decides where you set down.
    const landingX = ((Math.atan2(this.space.ship.y - planet.y, this.space.ship.x - planet.x) + Math.PI * 2) %
      (Math.PI * 2)) * 400
    this.surface = new SurfaceScene(this.deps, planet, this.system, landingX)
    this.surface.primeFound(save.foundIds())
    this.mode = 'surface'
    this.transition = 0
    this.input.clearTaps()
    setVignette(0.2)
    save.countLanding()
    this.hud.announcePlace(planet.name)
    audio.thud()
  }

  private beginTakeoff() {
    this.mode = 'takeoff'
    this.transition = 0
    this.input.clearTaps()
    audio.whoosh(0.9)
  }

  private finishTakeoff() {
    if (this.target) this.space.placeAbove(this.target)
    this.surface = null
    this.mode = 'space'
    this.transition = 0
    this.input.clearTaps()
    setVignette(0.34)
    this.hud.announcePlace(this.system.name)
  }

  private beginWarp(dx: number, dy: number) {
    this.mode = 'warp'
    this.transition = 0
    this.warpDone = false
    this.input.clearTaps()
    // Snap to whichever axis the ship left by, so the grid stays legible.
    if (Math.abs(dx) > Math.abs(dy)) this.warpDir = { x: Math.sign(dx), y: 0 }
    else this.warpDir = { x: 0, y: Math.sign(dy) }
    audio.whoosh(WARP_TIME)
    audio.setPadLevel(0.3, 0.3)
  }

  private arriveInNextSystem() {
    this.sector = { x: this.sector.x + this.warpDir.x, y: this.sector.y + this.warpDir.y }
    save.sector = this.sector
    this.system = getSystem(this.sector.x, this.sector.y)
    this.space.enter(this.system, this.warpDir.x, this.warpDir.y)
  }

  // --- rendering ---

  private render() {
    const ctx = this.ctx
    const { w, h } = this.view
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)

    switch (this.mode) {
      case 'space':
      case 'warp':
        this.space.draw(ctx)
        break
      case 'landing':
        this.space.draw(ctx)
        if (this.target) this.space.drawLandingZoom(ctx, this.target, this.transition)
        break
      case 'surface':
        this.surface?.draw(ctx)
        break
      case 'takeoff':
        this.surface?.draw(ctx)
        this.surface?.drawSkyWash(ctx, this.transition)
        break
    }

    if (this.mode === 'warp') {
      this.space.drawWarpStreaks(ctx, this.transition, this.warpDir.x, this.warpDir.y)
      this.space.drawTransitionSparkles(ctx, this.transition)
    }

    // UI on its own layer, above the paper texture.
    const ui = this.uiCtx
    ui.setTransform(1, 0, 0, 1, 0, 0)
    ui.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height)
    ui.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.hud.draw(ui, w, h, {
      shipColor: this.shipColor,
      muted: audio.isMuted,
      found: save.foundCount,
      total: COLLECTION_TOTAL,
      mapOpen: this.space.mapOpen && this.mode === 'space',
    })
    if (this.book.isVisible) this.book.draw(ui, w, h, this.hud.bottomInset)
  }
}

const game = new Game()

// A small seam for automated checks: reports where things are on screen so a
// test can aim a tap at a planet without guessing.
;(window as unknown as { starling: unknown }).starling = {
  probe: () => game.probe(),
}
