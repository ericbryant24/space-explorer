/**
 * Paper texture and vignette.
 *
 * Both are static full-screen effects, so they live in CSS layers above the
 * canvas rather than as per-frame canvas passes. A full-screen `overlay` blend
 * in canvas cost about two thirds of the frame budget at a 2x pixel ratio; on
 * the compositor it costs nothing measurable.
 */

const TILE = 128

/** Build the noise tile and hand it to the #grain layer as a data URI. */
export function installPaper() {
  const grain = document.getElementById('grain')
  if (!grain) return
  const c = document.createElement('canvas')
  c.width = TILE
  c.height = TILE
  const g = c.getContext('2d')
  if (!g) return
  const img = g.createImageData(TILE, TILE)
  const d = img.data
  for (let i = 0; i < TILE * TILE; i++) {
    // Mostly mid-grey with occasional darker flecks, like cold-press paper.
    // Mid-grey is the identity value for an `overlay` blend, so only the
    // deviation shows through.
    const base = 118 + Math.random() * 24
    const fleck = Math.random() < 0.045 ? -34 : 0
    const v = Math.max(0, Math.min(255, base + fleck))
    const o = i * 4
    d[o] = v
    d[o + 1] = v
    d[o + 2] = v
    d[o + 3] = 255
  }
  g.putImageData(img, 0, 0)
  grain.style.backgroundImage = `url(${c.toDataURL('image/png')})`
  grain.style.backgroundSize = `${TILE}px ${TILE}px`
}

/**
 * Vignette strength, 0..1. Space wants a deeper falloff than a daylit planet
 * surface, so the shell nudges this on scene changes.
 */
export function setVignette(strength: number) {
  document.documentElement.style.setProperty('--vignette', strength.toFixed(3))
}
