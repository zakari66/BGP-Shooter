# BGP-Shooter

A late-80s asteroid-style arcade game that trains network engineers on **BGP best-path
selection**. Fly your ship and shoot the one route in each four-target group that BGP would
actually prefer. Start with five lives — a wrong shot or a shot that hits nothing costs a
life. At zero lives the game ends.

Vanilla HTML + CSS + JavaScript (ES modules). **No backend, no build step, no runtime
dependencies.**

## Play

Native ES modules need to be served over HTTP (most browsers block them on `file://`):

```powershell
npx http-server . -p 8080
# then open http://localhost:8080/index.html
```

Any static server / IDE "Live Server" works too.

**Controls**

| Action | Keys |
|--------|------|
| Steer | ← / → or A / D |
| Thrust | ↑ or W |
| Fire | Space |
| Start / Restart | Enter |

## What "correct" means (BGP best-path cheat sheet)

| Judged attribute | Shoot the target with the… |
|------------------|----------------------------|
| AS Path | **shortest** AS path |
| MED | **lowest** MED |
| Local Preference | **highest** Local Preference |
| Prefix length | **longest** (most specific) prefix |

## Develop & test

Game rules live in DOM-free modules under `src/game/` and are unit-tested with Node's
built-in runner (no frameworks):

```powershell
npm test          # unit tests (node --test)
npm run test:perf # per-frame performance budget check
npm run lint      # ESLint
npm run format    # Prettier --check
```

Per the project [constitution](.specify/memory/constitution.md), tests are written **before**
the implementing code and the full suite must pass before merge.

## Layout

```text
index.html            # single page: canvas + HUD
styles/styles.css     # black background, vibrant neon palette
src/game/             # PURE logic (tested): attributes, groupGenerator, session,
                      #   scoring, collision, gameState, rng
src/render/renderer.js# Canvas 2D drawing
src/input/controls.js # keyToIntent (tested) + thin DOM listener
src/main.js           # requestAnimationFrame loop wiring it together
tests/unit/           # node:test specs for the logic modules
tests/perf/           # frame-time budget + pool-size invariant
```

See [`specs/001-bgp-shooter-game/`](specs/001-bgp-shooter-game/) for the full spec, plan,
and task breakdown.
