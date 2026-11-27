# Gobble Run — Thanksgiving Escape

[![turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/cocolats18-svg/turkey-run-game-01-entry/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/cocolats18-svg/turkey-run-game-01-entry/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

A 2D canvas runner: you are a turkey on Thanksgiving eve, and the farmer
is coming for dinner. You are dinner. Run right through the farmyard at
dusk, jump the ovens, fences and hay bales, duck the flying carving
knives, dodge the ones falling from the sky, grab corn for points and
golden feathers for an extra life — and reach the forest gate at 1000 m
before the farmer closes the gap.

## How to play

- The turkey runs on its own. Your job is timing: jump, duck, and keep
  the farmer behind you.
- Every stumble costs a life **and** lets the farmer gain 8 metres. Run
  clean for a while and the gap opens up again.
- The run gets faster the further you get. At 1000 m you burst through
  the forest gate and escape. Lose all 3 lives, or let the farmer catch
  you, and it is Thanksgiving dinner.

## Controls

| Input | Action |
| --- | --- |
| Space / Up / W | Jump |
| Down / S | Duck (hold) |
| P / Esc | Pause |
| M | Mute / unmute sound |
| Mouse | Click Start, Run Again, and the pause overlay |

## Sights and sounds

All art is drawn in canvas code — flat vector shapes in a warm autumn
dusk palette: the barn, the fence line, pumpkins, the low sun, the
turkey with its fanned tail, and the farmer chasing with his pitchfork.
All sound is synthesised WebAudio (gobble blips, pickup chimes, thuds,
a caught sting and an escape fanfare). No external assets, no network
requests, no libraries — vanilla JavaScript only.

## Tips

- Jump early: ovens are wide, and the turkey needs the full arc.
- Duck the moment a flying knife appears at the top of the screen — it
  sails at head height, so staying low is the only way under it.
- Falling knives show a shadow where they will land. Do not stand there.
- Golden feathers are worth the jump: each one restores a life.
- The farmer meter at the bottom left is your real health bar. A stumble
  costs 8 metres; run clean for a few seconds and the gap opens again.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Source layout

- `game/src/config.js` — tuning constants and the palette
- `game/src/random.js` — seeded RNG for reproducible runs
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — synthesised WebAudio sounds
- `game/src/world.js` — spawning, movement, collision, scoring
- `game/src/render.js` — drawing the farmyard, turkey, farmer and HUD
- `game/src/main.js` — game loop and states (title / playing / paused / caught / escaped)
- `game/src/shots.js` — deterministic screenshot scenes (`?shot=start|play|end&seed=1`)
