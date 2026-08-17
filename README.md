# Starling

An endless, gentle space sandbox for a phone held upright. Fly a small rocket
around a solar system, land on planets, walk about, poke things, dig things up,
and drift off the edge into the next system — forever.

There is no score, no timer and no way to lose. The only progression is a
sticker book that slowly fills up with the things you've found.

## Playing

One finger does everything.

**In space**
- **Hold** anywhere — the ship thrusts toward your finger. Let go to coast.
- **Tap a nearby planet** — land on it. A dashed ring appears once you're close
  enough.
- **Fly past the dashed boundary** — warp to a neighbouring system.

**On a planet**
- **Hold** to one side — walk that way. The ground wraps, so you always come
  back around.
- **Tap** — hop. Gravity differs per world, so some let you float half a screen
  up and others keep you firmly down.
- **Tap a plant, rock, critter or mound** — poke it, startle it, or dig it up.
- **Tap your ship** — take off.

**Buttons** — star map (top left), sound (top right), repaint your ship (bottom
left), sticker book (bottom right).

Arrow keys / WASD and space also work, for playing at a desk.

## How it's infinite

Nothing about the universe is stored. Every sector of an infinite grid hashes
its integer coordinates into a seed, and that seed derives the whole system:
star colours, planet count, biomes, gravity, moons, ring systems, asteroid
belts, and every pebble and creature on every surface. Fly away and back and you
get the same place, bit for bit, because it was never saved — only recomputed.

Planet surfaces wrap because the terrain is a short sum of sine waves at
whole-number frequencies, which is seamless at the join for free.

The save file holds only which curiosities you've met, your ship colour, and
which sector you were last in.

## The Easter eggs

Scattered rarely across worlds and drifting in the dark between them are around
thirty small vignettes that nod to films, television and books — a tall black
slab on an empty plain, a whale and a bowl of petunias falling through the sky,
a wardrobe standing in the snow, four elephants on the back of a very large
turtle.

Every one is drawn from scratch in code as an original silhouette or shape
study, and titled descriptively rather than by its source. They're visual
rhymes, not reproductions: no franchise's characters, artwork, logos or names
appear anywhere in this project. Recognising them is the fun.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the built output
```

Deployment is automatic: pushing to `main` builds and publishes to GitHub Pages
via `.github/workflows/deploy.yml`. The Vite `base` is `'./'`, so the build works
from a repository sub-path as well as from a domain root.

## How it's built

Plain TypeScript and a 2D canvas — no engine, no framework, no art assets. Every
shape is drawn at runtime.

```
src/
  core/       seeded hashing and PRNG, vector maths, one-finger input,
              procedural audio, save file
  render/     palette, hand-drawn shape primitives, camera and starfield,
              paper texture
  world/      universe and system generation, planets, surfaces, creatures,
              the ship and explorer, Easter eggs, the collection
  scenes/     flying around a system, walking on a surface
  ui/         HUD, sticker book
  main.ts     canvas setup, frame loop, transitions between scenes
```

A few things worth knowing if you poke at it:

- **Nothing is a perfect circle.** `render/shapes.ts` builds closed outlines
  whose radius is nudged by deterministic noise, then smooths them, which is
  most of what gives the game its cut-paper look.
- **Paper grain and the vignette are CSS layers**, not canvas passes. A
  full-screen `overlay` blend per frame in canvas cost about two thirds of the
  frame budget at a 2x pixel ratio; on the compositor it's free. The HUD gets
  its own canvas above those layers so it stays crisp.
- **Planet discs are baked once** into offscreen canvases and blitted, since
  each one is dozens of wobbly shapes. Clouds and the day/night terminator are
  drawn live on top.
- **Colour helpers compose.** `mix`, `shade`, `tint` and `withAlpha` in
  `render/palette.ts` all accept hex or `rgb()` and return hex, so nesting them
  works.

`window.starling.probe()` returns a snapshot of the current state — mode,
sector, planet positions in screen space, what's hidden where. It exists so
automated checks can drive the game without guessing where to tap.
