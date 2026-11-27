// The run itself: spawning, movement, collision and scoring for Gobble Run.
// This file knows nothing about drawing or sound; it updates plain state
// and hands back a list of events (jump, corn, hit, caught, escaped) for
// the main loop to turn into sound and feedback.

import { GAME, TURKEY, RUN, SCORE, SPAWN } from './config.js';
import { makeRng } from './random.js';

// Obstacle shapes, in pixels. Heights are measured up from the ground.
const SHAPES = {
  oven: { w: 78, h: 66 },
  fence: { w: 26, h: 54 },
  hay: { w: 68, h: 46 },
  'knife-fly': { w: 58, h: 14 },
  'knife-fall': { w: 16, h: 56 },
};

export function createWorld(seed = 1) {
  return {
    seed,
    rng: makeRng(seed),
    distance: 0,
    score: 0,
    lives: RUN.startLives,
    farmerGap: RUN.startFarmerGap,
    speed: RUN.baseSpeed,
    time: 0,
    over: false,
    result: null, // 'caught' | 'escaped'
    cleanTime: 0,
    hitCooldown: 0,
    dodged: 0, // obstacles cleared without a touch, shown on the end screen
    cornEaten: 0, // kernels collected, shown on the end screen
    nextSpawnInMetres: 10,
    turkey: {
      feetY: GAME.groundY,
      vy: 0,
      grounded: true,
      ducking: false,
      runPhase: 0,
      blink: 0,
    },
    obstacles: [], // {kind, x, y, w, h, vy, landed, scored}
    pickups: [], // {kind, x, y, bob}
    particles: [], // {x, y, vx, vy, life, maxLife, color, size}
  };
}

// Shrink a box a little before testing it, so near-misses feel fair.
function overlaps(a, b, shrink = 6) {
  return (
    a.x + shrink < b.x + b.w - shrink &&
    a.x + a.w - shrink > b.x + shrink &&
    a.y + shrink < b.y + b.h - shrink &&
    a.y + a.h - shrink > b.y + shrink
  );
}

function turkeyBox(world) {
  const t = world.turkey;
  const height = t.ducking ? TURKEY.duckHeight : TURKEY.standHeight;
  return {
    x: TURKEY.x - 26,
    y: t.feetY - height,
    w: 54,
    h: height,
  };
}

function spawnObstacle(world) {
  const rng = world.rng;
  const kinds = ['oven', 'fence', 'hay'];
  if (world.distance >= SPAWN.flyKnifeFromMetres) kinds.push('knife-fly');
  if (world.distance >= SPAWN.fallKnifeFromMetres) kinds.push('knife-fall');
  // Early on the farmyard is gentle: ovens and fences only.
  const kind = world.distance < 60 ? rng.pick(['fence', 'hay']) : rng.pick(kinds);
  const shape = SHAPES[kind];
  const x = GAME.width + 60;
  if (kind === 'knife-fly') {
    // A carving knife sails across at head height: duck under it.
    world.obstacles.push({
      kind,
      x,
      y: GAME.groundY - GAME.knifeFlyHeight,
      w: shape.w,
      h: shape.h,
      vy: 0,
      landed: false,
      scored: false,
    });
    return;
  }
  if (kind === 'knife-fall') {
    // A knife drops from the sky ahead and sticks in the dirt: jump it.
    world.obstacles.push({
      kind,
      x: x + rng.range(0, 120),
      y: -80,
      w: shape.w,
      h: shape.h,
      vy: 0,
      landed: false,
      scored: false,
    });
    return;
  }
  world.obstacles.push({
    kind,
    x,
    y: GAME.groundY - shape.h,
    w: shape.w,
    h: shape.h,
    vy: 0,
    landed: true,
    scored: false,
  });
}

function spawnPickups(world) {
  const rng = world.rng;
  const x = GAME.width + 80;
  if (rng.chance(SPAWN.featherChance)) {
    // A golden feather floats high: worth a jump, restores a life.
    world.pickups.push({
      kind: 'feather',
      x: x + 40,
      y: GAME.groundY - 150,
      bob: rng.range(0, Math.PI * 2),
    });
  }
  if (!rng.chance(SPAWN.cornArcChance)) return;
  // An arc of corn kernels, sometimes riding over an obstacle.
  const count = rng.int(3, 5);
  const arcHeight = rng.pick([70, 110, 150]);
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1) - 0.5;
    world.pickups.push({
      kind: 'corn',
      x: x + i * 34,
      y: GAME.groundY - arcHeight + Math.abs(t) * 46,
      bob: rng.range(0, Math.PI * 2),
    });
  }
}

function burst(world, x, y, color, count, speed = 140) {
  for (let i = 0; i < count; i += 1) {
    const angle = world.rng.range(0, Math.PI * 2);
    const v = world.rng.range(speed * 0.3, speed);
    world.particles.push({
      x,
      y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v - 60,
      life: 0.5,
      maxLife: 0.5,
      color,
      size: world.rng.range(2, 5),
    });
  }
}

export function updateWorld(world, input, dt, events) {
  if (world.over) return;
  world.time += dt;
  world.cleanTime += dt;
  if (world.hitCooldown > 0) world.hitCooldown -= dt;

  const t = world.turkey;

  // --- the turkey: jump, duck, gravity, landing dust ---
  if (input.jumpQueued && t.grounded && !t.ducking) {
    t.vy = TURKEY.jumpVelocity;
    t.grounded = false;
    events.push({ type: 'jump' });
  }
  t.ducking = input.duckHeld && t.grounded;
  if (!t.grounded) {
    t.vy += GAME.gravity * dt;
    t.feetY += t.vy * dt;
    if (t.feetY >= GAME.groundY) {
      t.feetY = GAME.groundY;
      t.vy = 0;
      t.grounded = true;
      burst(world, TURKEY.x, GAME.groundY, '#c9a06a', 6, 90);
      events.push({ type: 'land' });
    }
  }
  t.runPhase += dt * (world.speed / 28);
  if (t.blink > 0) t.blink -= dt;

  // --- speed and distance ---
  world.speed = Math.min(
    RUN.maxSpeed,
    RUN.baseSpeed + world.distance * RUN.speedPerMetre,
  );
  const travelled = (world.speed * dt) / GAME.pxPerMetre;
  world.distance += travelled;
  world.score += travelled * SCORE.perMetre;
  const speedPx = world.speed * dt;

  // --- the farmer: stumbles cost ground, clean running wins it back ---
  if (world.cleanTime > RUN.cleanTimeForRecovery && world.farmerGap < RUN.maxFarmerGap) {
    world.farmerGap = Math.min(RUN.maxFarmerGap, world.farmerGap + RUN.gapRecovery * dt);
  }

  // --- spawning, in metres of travel so spacing stays fair at any speed ---
  world.nextSpawnInMetres -= travelled;
  if (world.nextSpawnInMetres <= 0) {
    spawnObstacle(world);
    spawnPickups(world);
    world.nextSpawnInMetres = world.rng.range(SPAWN.minGapMetres, SPAWN.maxGapMetres);
  }

  // --- obstacles move left; falling knives drop; the landed ones stick ---
  for (const o of world.obstacles) {
    const extra = o.kind === 'knife-fly' ? world.speed * 0.18 : 0;
    o.x -= speedPx + extra * dt;
    if (o.kind === 'knife-fall' && !o.landed) {
      o.vy += 1900 * dt;
      o.y += o.vy * dt;
      if (o.y + o.h >= GAME.groundY) {
        o.y = GAME.groundY - 30;
        o.h = 30;
        o.landed = true;
        burst(world, o.x + 8, GAME.groundY, '#c9a06a', 5, 80);
      }
    }
  }
  world.obstacles = world.obstacles.filter((o) => o.x + o.w > -80);

  // --- pickups drift left and bob ---
  for (const p of world.pickups) {
    p.x -= speedPx;
    p.bob += dt * 3;
  }
  world.pickups = world.pickups.filter((p) => p.x > -40);

  // --- particles ---
  for (const p of world.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 500 * dt;
    p.life -= dt;
  }
  world.particles = world.particles.filter((p) => p.life > 0);

  // --- collisions ---
  const box = turkeyBox(world);
  for (const o of world.obstacles) {
    if (!o.scored && o.x + o.w < TURKEY.x - 26) {
      o.scored = true;
      world.score += SCORE.dodge;
      world.dodged += 1;
      events.push({ type: 'dodge' });
    }
    if (world.hitCooldown > 0) continue;
    const hitBox = { x: o.x, y: o.y, w: o.w, h: o.h };
    if (overlaps(box, hitBox, o.kind === 'knife-fly' ? 4 : 7)) {
      world.lives -= 1;
      world.farmerGap -= RUN.hitGapLoss;
      world.hitCooldown = RUN.hitCooldown;
      world.cleanTime = 0;
      t.blink = 0.4;
      burst(world, TURKEY.x, t.feetY - 30, '#e74c3c', 12, 180);
      events.push({ type: 'hit' });
      world.obstacles = world.obstacles.filter((other) => other !== o);
      if (world.lives <= 0 || world.farmerGap <= 0) {
        world.over = true;
        world.result = 'caught';
        events.push({ type: 'caught' });
        return;
      }
      break;
    }
  }

  for (const p of world.pickups) {
    const pickupBox = { x: p.x - 14, y: p.y - 14, w: 28, h: 28 };
    if (overlaps(box, pickupBox, 2)) {
      p.taken = true;
      if (p.kind === 'corn') {
        world.score += SCORE.corn;
        world.cornEaten += 1;
        burst(world, p.x, p.y, '#ffd23e', 8, 120);
        events.push({ type: 'corn' });
      } else {
        world.lives = Math.min(RUN.startLives, world.lives + 1);
        world.score += SCORE.feather;
        burst(world, p.x, p.y, '#ffcf3d', 14, 160);
        events.push({ type: 'feather' });
      }
    }
  }
  world.pickups = world.pickups.filter((p) => !p.taken);

  // --- the forest gate: 1000 metres and the turkey is free ---
  if (world.distance >= GAME.goalDistance) {
    world.over = true;
    world.result = 'escaped';
    events.push({ type: 'escaped' });
  }
}
