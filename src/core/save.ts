/**
 * Persistence. There is no score to save — only which curiosities you've met,
 * what colour your ship is, and where you left off.
 */

const KEY = 'starling.save.v1'

export interface SaveData {
  /** Ids of Easter eggs / creatures / plants that have been discovered. */
  found: string[]
  /** Index into the ship palette. */
  shipColor: number
  /** Sector the player was last in, so a reload lands you back home. */
  sector: { x: number; y: number }
  muted: boolean
  /** Total planets landed on — shown as a gentle tally in the sticker book. */
  landings: number
}

const DEFAULTS: SaveData = {
  found: [],
  shipColor: 0,
  sector: { x: 0, y: 0 },
  muted: false,
  landings: 0,
}

function read(): SaveData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS, found: [] }
    const parsed = JSON.parse(raw) as Partial<SaveData>
    return {
      found: Array.isArray(parsed.found) ? parsed.found.filter((f) => typeof f === 'string') : [],
      shipColor: typeof parsed.shipColor === 'number' ? parsed.shipColor : 0,
      sector:
        parsed.sector && typeof parsed.sector.x === 'number' && typeof parsed.sector.y === 'number'
          ? { x: Math.trunc(parsed.sector.x), y: Math.trunc(parsed.sector.y) }
          : { x: 0, y: 0 },
      muted: parsed.muted === true,
      landings: typeof parsed.landings === 'number' ? parsed.landings : 0,
    }
  } catch {
    // Private browsing, disabled storage, corrupt JSON — play on regardless.
    return { ...DEFAULTS, found: [] }
  }
}

class Save {
  private data: SaveData = read()
  private foundSet = new Set(this.data.found)
  private flushTimer: number | null = null

  get shipColor(): number {
    return this.data.shipColor
  }

  set shipColor(v: number) {
    this.data.shipColor = v
    this.queueFlush()
  }

  get sector(): { x: number; y: number } {
    return this.data.sector
  }

  set sector(v: { x: number; y: number }) {
    this.data.sector = { x: v.x, y: v.y }
    this.queueFlush()
  }

  get muted(): boolean {
    return this.data.muted
  }

  set muted(v: boolean) {
    this.data.muted = v
    this.queueFlush()
  }

  get landings(): number {
    return this.data.landings
  }

  countLanding() {
    this.data.landings++
    this.queueFlush()
  }

  has(id: string): boolean {
    return this.foundSet.has(id)
  }

  /** Record a discovery. Returns true the first time only. */
  discover(id: string): boolean {
    if (this.foundSet.has(id)) return false
    this.foundSet.add(id)
    this.data.found.push(id)
    this.queueFlush()
    return true
  }

  get foundCount(): number {
    return this.foundSet.size
  }

  foundIds(): readonly string[] {
    return this.data.found
  }

  /** Batch writes — discoveries can arrive several per frame. */
  private queueFlush() {
    if (this.flushTimer !== null) return
    this.flushTimer = window.setTimeout(() => {
      this.flushTimer = null
      try {
        localStorage.setItem(KEY, JSON.stringify(this.data))
      } catch {
        // Storage full or blocked; the session still works, it just won't persist.
      }
    }, 400)
  }
}

export const save = new Save()
