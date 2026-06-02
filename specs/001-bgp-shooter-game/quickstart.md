# Quickstart: BGP-Shooter

A zero-dependency, single-page browser game. No backend, no build step.

## Prerequisites

- A modern desktop browser (Chrome, Firefox, Edge, or Safari).
- Node.js 18+ — **only** to run the unit test suite (`node --test`). Not needed to play.

## Run the game

Because it uses native ES modules, serve the folder over HTTP (modules don't load from
`file://` in most browsers):

```powershell
# From the repository root — any static server works; example using Node's http-server:
npx http-server . -p 8080
# then open http://localhost:8080/index.html
```

Or use any static file server / IDE "Live Server". Then:

1. Press **Enter** to start.
2. Read the prompt (e.g., "Destroy the shortest AS path").
3. **Steer** with ← / → (or A / D), **thrust** with ↑ (or W), **fire** with **Space**.
4. Shoot the one target that BGP would prefer to clear the group and advance.
5. You start with **5 lives**. A wrong target or a shot that hits nothing costs a life.
6. At 0 lives the game ends — press **Enter** to restart.

## BGP best-path cheat sheet (what "correct" means)

| Judged attribute | Shoot the target with the… |
|------------------|----------------------------|
| AS Path | **shortest** AS path |
| MED | **lowest** MED |
| Local Preference | **highest** Local Preference |
| Prefix length | **longest** (most specific) prefix |

## Run the tests (Test-First)

Game logic in `src/game/` is pure and DOM-free, so it runs under Node's built-in runner:

```powershell
node --test tests/unit
```

Per the project constitution, tests are written **before** the implementing code and the
full suite must pass before merge.

## Lint & format

```powershell
npx eslint src tests
npx prettier --check .
```

## Project layout

- `index.html` — the single page hosting the canvas and HUD.
- `styles/styles.css` — black background, vibrant palette.
- `src/game/` — pure logic (attributes, group generation, session, scoring) — **tested**.
- `src/render/`, `src/input/`, `src/main.js` — canvas rendering, keyboard input, game loop.
- `tests/unit/` — `node:test` specs for the logic modules.
