/**
 * A muted gouache palette — chalky, warm, slightly dusty. Nothing here is
 * fully saturated and nothing is pure black, which is most of what gives the
 * game its paper-toy feel.
 */

export const INK = '#3b2f2c'
export const INK_SOFT = 'rgba(59, 47, 44, 0.42)'
export const CREAM = '#f4e6ca'
export const CREAM_DIM = '#dfcdaa'

/** Deep space, from the far edge inward. */
export const SPACE_FAR = '#1d1730'
export const SPACE_NEAR = '#2f2547'

/** Chalky hues, safe to mix freely. */
export const HUES = {
  terracotta: '#d4744f',
  clay: '#b8573f',
  apricot: '#e9a15c',
  mustard: '#e3bc5e',
  butter: '#f0d894',
  sage: '#93ab7c',
  moss: '#6f8a5f',
  mint: '#a9cbb0',
  teal: '#5f9a9c',
  ocean: '#4b7c96',
  sky: '#9dc6da',
  ice: '#d5e8ec',
  plum: '#6d4f78',
  grape: '#8a6296',
  rose: '#e0938d',
  blush: '#f0c0bb',
  slate: '#6b6b7d',
  ash: '#9a9aa8',
  bone: '#e6ddcb',
  rust: '#a5502f',
  lilac: '#b7a4d0',
  lime: '#c3cf78',
} as const

export type HueName = keyof typeof HUES

/** Ship colours the player can cycle through by tapping the paint blob. */
export const SHIP_COLORS: readonly string[] = [
  HUES.terracotta,
  HUES.mustard,
  HUES.sage,
  HUES.teal,
  HUES.rose,
  HUES.lilac,
  HUES.sky,
  CREAM,
]

/**
 * Cohesive planet colour sets. Each is [ground, groundShade, accent, sky].
 * Picked as a set rather than mixed at random so no planet ever looks muddy.
 */
export interface PlanetPalette {
  ground: string
  shade: string
  accent: string
  sky: string
  skyLow: string
}

export const PLANET_PALETTES: readonly PlanetPalette[] = [
  { ground: HUES.terracotta, shade: HUES.clay, accent: HUES.butter, sky: '#8d5a63', skyLow: '#dfa07a' },
  { ground: HUES.sage, shade: HUES.moss, accent: HUES.butter, sky: '#6f93a8', skyLow: '#cfe0cb' },
  { ground: HUES.mustard, shade: HUES.rust, accent: HUES.bone, sky: '#a87d64', skyLow: '#f0d08c' },
  { ground: HUES.teal, shade: HUES.ocean, accent: HUES.mint, sky: '#3f6a84', skyLow: '#9dc6da' },
  { ground: HUES.plum, shade: '#4f3959', accent: HUES.lilac, sky: '#3b2c50', skyLow: '#8a6296' },
  { ground: HUES.ice, shade: HUES.sky, accent: CREAM, sky: '#7fa6bd', skyLow: '#e8f2f4' },
  { ground: HUES.rose, shade: '#c07a76', accent: HUES.butter, sky: '#9b6b78', skyLow: '#f4d3cd' },
  { ground: HUES.slate, shade: '#4e4e5e', accent: HUES.ash, sky: '#3c3c4c', skyLow: '#7f7f92' },
  { ground: HUES.lime, shade: HUES.moss, accent: HUES.butter, sky: '#7d9a6a', skyLow: '#e4e9b4' },
  { ground: HUES.apricot, shade: HUES.rust, accent: HUES.blush, sky: '#94614f', skyLow: '#f6c795' },
  { ground: HUES.bone, shade: '#c9bda6', accent: HUES.sage, sky: '#9d9884', skyLow: '#efe7d4' },
  { ground: HUES.grape, shade: HUES.plum, accent: HUES.blush, sky: '#4a3358', skyLow: '#a884b4' },
]

/** Star colours, warm to cool. */
export const STAR_COLORS: readonly string[] = [
  '#f6d38a',
  '#f4b26a',
  '#ee8f63',
  '#fbe9b6',
  '#dfe9f4',
  '#f2c3d0',
]

/**
 * Parse `#rgb`, `#rrggbb` or `rgb(r, g, b)` into components.
 *
 * `mix`, `shade` and `tint` all get nested (a shaded colour then hazed toward
 * the sky, say), so they must accept whatever the others produce — not just
 * hex. Anything unparseable falls back to mid grey rather than silently
 * becoming an invalid fillStyle, which canvas ignores in confusing ways.
 */
function parseColor(color: string): [number, number, number] {
  if (color.charCodeAt(0) === 35 /* # */) {
    const h = color.slice(1)
    const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h
    const n = parseInt(full, 16)
    if (Number.isNaN(n)) return [128, 128, 128]
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(color)
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])]
  return [128, 128, 128]
}

const toHex = (r: number, g: number, b: number): string =>
  `#${((1 << 24) | (clamp255(r) << 16) | (clamp255(g) << 8) | clamp255(b)).toString(16).slice(1)}`

const clamp255 = (v: number): number => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v))

/** Alpha-blend a colour into an rgba string. */
export function withAlpha(color: string, alpha: number): string {
  const [r, g, b] = parseColor(color)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Mix two colours; t=0 gives a, t=1 gives b. Returns hex, so it composes. */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseColor(a)
  const [br, bg, bb] = parseColor(b)
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t)
}

/** Darken toward the ink colour — keeps shadows warm rather than grey. */
export function shade(color: string, amount: number): string {
  return mix(color, INK, amount)
}

/** Lighten toward cream. */
export function tint(color: string, amount: number): string {
  return mix(color, CREAM, amount)
}
