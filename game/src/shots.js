// Deterministic screenshot scenes for Gobble Run. When the page is opened
// with ?shot=start|play|end&seed=N, main.js draws one fixed scene instead
// of starting the game loop, so a headless screenshot of the same URL
// always shows the same frame. Nothing here is random at draw time: every
// position is set by hand from the seed.

import { GAME } from './config.js';
import { createWorld } from './world.js';

export function buildShot(kind, seed = 1) {
  if (kind === 'play') {
    // A busy mid-run frame: 412 m in, two lives left, the farmer close,
    // an oven and a fence ahead, a knife sailing at head height, corn
    // overhead and a golden feather worth the jump.
    const world = createWorld(seed);
    world.distance = 412;
    world.score = 350;
    world.lives = 2;
    world.farmerGap = 11;
    world.speed = 402;
    world.time = 1.6;
    world.cleanTime = 0.5;
    world.turkey.runPhase = 3.2;
    world.obstacles = [
      { kind: 'hay', x: 330, y: GAME.groundY - 46, w: 68, h: 46, vy: 0, landed: true, scored: false },
      { kind: 'oven', x: 520, y: GAME.groundY - 66, w: 78, h: 66, vy: 0, landed: true, scored: false },
      { kind: 'knife-fly', x: 700, y: GAME.groundY - GAME.knifeFlyHeight, w: 58, h: 14, vy: 0, landed: false, scored: false },
      { kind: 'fence', x: 880, y: GAME.groundY - 54, w: 26, h: 54, vy: 0, landed: true, scored: false },
    ];
    world.pickups = [
      { kind: 'corn', x: 430, y: GAME.groundY - 150, bob: 0.4 },
      { kind: 'corn', x: 464, y: GAME.groundY - 168, bob: 1.1 },
      { kind: 'corn', x: 498, y: GAME.groundY - 150, bob: 2.0 },
      { kind: 'feather', x: 640, y: GAME.groundY - 150, bob: 0.9 },
    ];
    // A little kicked-up dust behind the turkey's feet.
    world.particles = [
      { x: 140, y: GAME.groundY - 4, vx: -60, vy: -30, life: 0.3, maxLife: 0.5, color: '#c9a06a', size: 4 },
      { x: 122, y: GAME.groundY - 2, vx: -80, vy: -18, life: 0.2, maxLife: 0.5, color: '#c9a06a', size: 3 },
      { x: 152, y: GAME.groundY - 6, vx: -40, vy: -40, life: 0.4, maxLife: 0.5, color: '#c9a06a', size: 3 },
    ];
    return { state: 'playing', world, time: 1.6 };
  }

  if (kind === 'end') {
    // The caught end screen: the farmer finally closed the gap at 731 m.
    const world = createWorld(seed);
    world.distance = 731;
    world.score = 480;
    world.lives = 0;
    world.farmerGap = 0;
    world.speed = 0;
    world.time = 2.2;
    world.dodged = 19;
    world.cornEaten = 12;
    world.over = true;
    world.result = 'caught';
    world.turkey.runPhase = 0;
    world.obstacles = [
      { kind: 'hay', x: 640, y: GAME.groundY - 46, w: 68, h: 46, vy: 0, landed: true, scored: false },
    ];
    return { state: 'caught', world, time: 2.2 };
  }

  // 'start' and anything unknown: the title screen over a quiet farmyard.
  const world = createWorld(seed);
  world.time = 0.8;
  world.turkey.runPhase = 1.2;
  return { state: 'title', world, time: 0.8 };
}
