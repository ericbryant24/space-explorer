/**
 * Procedural names. Soft consonants and open vowels, so everything sounds like
 * a place you'd want to visit rather than a catalogue number.
 */

import { Rng } from '../core/rng'

const ONSETS = [
  'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'z',
  'br', 'cl', 'dr', 'fl', 'gl', 'kr', 'pl', 'sh', 'sl', 'st', 'th', 'tr', 'vy', 'ch',
]
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'ae', 'ei', 'ia', 'oo', 'ou', 'y', 'ya', 'io']
const CODAS = ['', '', '', 'n', 'l', 'r', 's', 'm', 'th', 'sh', 'nd', 'lo', 'ra', 'na', 'ka']

const STAR_SUFFIX = ['', '', '', ' Minor', ' Major', ' Prime', ' Nova', "'s Lantern", ' Beacon']

const PLANET_EPITHET = [
  'the Quiet', 'the Round', 'the Kind', 'the Wandering', 'the Patient', 'the Bright',
  'the Sleepy', 'the Hollow', 'the Singing', 'the Gentle', 'the Dusty', 'the Far',
]

function syllable(rng: Rng): string {
  return rng.pick(ONSETS) + rng.pick(VOWELS) + rng.pick(CODAS)
}

function word(rng: Rng, syllables: number): string {
  let s = ''
  for (let i = 0; i < syllables; i++) s += syllable(rng)
  // Tidy up the worst clusters so everything stays pronounceable.
  s = s.replace(/([bcdfgklmnprstvz])\1+/g, '$1').replace(/[^aeiouy]{4,}/g, (m) => m.slice(0, 2))
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function starName(seed: number): string {
  const rng = new Rng(seed ^ 0x5ca1ab1e)
  return word(rng, rng.int(1, 2)) + rng.pick(STAR_SUFFIX)
}

export function planetName(seed: number): string {
  const rng = new Rng(seed ^ 0x1eaf1e55)
  const base = word(rng, rng.int(1, 2))
  if (rng.chance(0.12)) return `${base}, ${rng.pick(PLANET_EPITHET)}`
  return base
}

export function moonName(seed: number): string {
  const rng = new Rng(seed ^ 0x33aa11)
  return word(rng, 1)
}
