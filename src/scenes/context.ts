import type { Input } from '../core/input'
import type { Hud } from '../ui/hud'

/** What a scene needs from the game shell. */
export interface SceneDeps {
  input: Input
  hud: Hud
  /** Logical canvas size in CSS pixels. */
  view: { w: number; h: number }
  /** Device pixels per logical pixel, for baking crisp textures. */
  quality: number
  /** Current ship colour. */
  shipColor: () => string
  /** Record a find; shows a banner the first time. */
  discover: (id: string, title: string, note: string) => void
}
