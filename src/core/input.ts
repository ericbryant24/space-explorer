/**
 * One-finger input, sized for a phone held upright.
 *
 * Everything in the game is driven by a single pointer: hold to steer, tap to
 * poke. Mouse and arrow keys are wired up too so the game is playable on a
 * desktop while developing.
 */

export interface Tap {
  x: number
  y: number
}

/**
 * Lets an overlay (a HUD button, the sticker book) claim a gesture before the
 * game world sees it. `onDown` returning true captures the whole gesture.
 */
export interface InputCapture {
  onDown(x: number, y: number): boolean
  onMove(x: number, y: number): void
  onUp(x: number, y: number): void
}

export class Input {
  /** Pointer position in CSS pixels relative to the canvas. */
  x = 0
  y = 0
  /** True while a finger / button is down. */
  down = false
  /** Seconds the current press has lasted. */
  heldFor = 0
  /** Where the current press started. */
  startX = 0
  startY = 0
  /** Taps that finished this frame, drained by scenes via `takeTaps()`. */
  private taps: Tap[] = []
  /** Held arrow / WASD direction, for desktop play. */
  keys = new Set<string>()

  private movedDuringPress = 0
  private capture: InputCapture | null = null
  private captured = false

  constructor(private el: HTMLElement) {
    el.addEventListener('pointerdown', this.onDown, { passive: false })
    el.addEventListener('pointermove', this.onMove, { passive: false })
    window.addEventListener('pointerup', this.onUp, { passive: false })
    window.addEventListener('pointercancel', this.onUp, { passive: false })
    // Belt and braces: iOS Safari still likes to scroll/zoom without these.
    el.addEventListener('touchstart', prevent, { passive: false })
    el.addEventListener('touchmove', prevent, { passive: false })
    el.addEventListener('gesturestart', prevent as EventListener)
    el.addEventListener('contextmenu', prevent as EventListener)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  private setFromEvent(e: PointerEvent) {
    const r = this.el.getBoundingClientRect()
    this.x = e.clientX - r.left
    this.y = e.clientY - r.top
  }

  /** Install an overlay that gets first refusal on every gesture. */
  setCapture(capture: InputCapture | null) {
    this.capture = capture
  }

  private onDown = (e: PointerEvent) => {
    e.preventDefault()
    // Ignore additional fingers; this is a one-finger game.
    if (this.down || this.captured) return
    this.setFromEvent(e)
    if (this.capture?.onDown(this.x, this.y)) {
      this.captured = true
      this.el.setPointerCapture?.(e.pointerId)
      return
    }
    this.down = true
    this.heldFor = 0
    this.movedDuringPress = 0
    this.startX = this.x
    this.startY = this.y
    this.el.setPointerCapture?.(e.pointerId)
  }

  private onMove = (e: PointerEvent) => {
    const px = this.x
    const py = this.y
    this.setFromEvent(e)
    if (this.captured) {
      this.capture?.onMove(this.x, this.y)
      return
    }
    if (this.down) this.movedDuringPress += Math.hypot(this.x - px, this.y - py)
  }

  private onUp = (e: PointerEvent) => {
    if (this.captured) {
      this.setFromEvent(e)
      this.captured = false
      this.capture?.onUp(this.x, this.y)
      return
    }
    if (!this.down) return
    this.setFromEvent(e)
    this.down = false
    // A tap is short and mostly stationary — anything else was a drag.
    if (this.heldFor < 0.32 && this.movedDuringPress < 14) {
      this.taps.push({ x: this.x, y: this.y })
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key.toLowerCase())
  }

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase())
  }

  /** Advance press timers. Call once per frame, before scene updates. */
  update(dt: number) {
    if (this.down) this.heldFor += dt
  }

  /** Remove and return this frame's completed taps. */
  takeTaps(): Tap[] {
    if (this.taps.length === 0) return EMPTY
    const out = this.taps
    this.taps = []
    return out
  }

  /** Discard any pending taps — used when a scene change eats the gesture. */
  clearTaps() {
    this.taps.length = 0
  }

  /** Keyboard direction vector, for desktop play. */
  keyAxis(): { x: number; y: number } {
    let x = 0
    let y = 0
    const k = this.keys
    if (k.has('arrowleft') || k.has('a')) x -= 1
    if (k.has('arrowright') || k.has('d')) x += 1
    if (k.has('arrowup') || k.has('w')) y -= 1
    if (k.has('arrowdown') || k.has('s')) y += 1
    return { x, y }
  }
}

const EMPTY: Tap[] = []
const prevent = (e: Event) => e.preventDefault()
