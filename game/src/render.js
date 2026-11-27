// Drawing for Gobble Run: every picture in the game is flat vector shapes
// drawn on the canvas — the dusk farmyard, the turkey, the farmer, the
// oven and knives, the HUD and the title and end screens. No images, no
// fonts from the network; the only font is the browser's own serif stack.

import { GAME, TURKEY, RUN, PALETTE } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- the farmyard at dusk, three parallax layers behind the ground ---

export function drawBackground(ctx, scrollPx, time) {
  const { width, height, groundY } = GAME;

  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, PALETTE.skyTop);
  sky.addColorStop(0.55, PALETTE.skyMid);
  sky.addColorStop(1, PALETTE.skyLow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, groundY + 2);

  // Low sun, sinking behind the farm.
  const sunX = width - 190;
  const sunY = groundY - 150;
  const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 130);
  glow.addColorStop(0, PALETTE.sunGlow);
  glow.addColorStop(1, 'rgba(247, 201, 72, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - 130, sunY - 130, 260, 260);
  ctx.fillStyle = PALETTE.sun;
  ellipse(ctx, sunX, sunY, 44, 44);

  // Slow clouds.
  ctx.fillStyle = PALETTE.cloud;
  for (let i = 0; i < 4; i += 1) {
    const cx = ((i * 280 - scrollPx * 0.08 - time * 6) % (width + 320) + width + 320) % (width + 320) - 160;
    const cy = 54 + i * 34;
    ellipse(ctx, cx, cy, 62, 15);
    ellipse(ctx, cx + 34, cy + 6, 44, 12);
    ellipse(ctx, cx - 38, cy + 7, 36, 10);
  }

  // Far hills.
  ctx.fillStyle = PALETTE.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= width; x += 60) {
    ctx.lineTo(x, groundY - 46 - Math.sin((x + scrollPx * 0.15) * 0.008) * 22);
  }
  ctx.lineTo(width, groundY);
  ctx.closePath();
  ctx.fill();

  // The barn, sliding past slowly, and a row of trees.
  const barnX = width - ((scrollPx * 0.3) % (width + 420)) + 60;
  drawBarn(ctx, barnX, groundY);
  ctx.fillStyle = PALETTE.tree;
  for (let i = 0; i < 7; i += 1) {
    const tx = ((i * 173 - scrollPx * 0.45) % (width + 200) + width + 200) % (width + 200) - 100;
    drawTree(ctx, tx, groundY, 34 + (i % 3) * 10);
  }

  // Near hill band.
  ctx.fillStyle = PALETTE.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= width; x += 48) {
    ctx.lineTo(x, groundY - 16 - Math.sin((x + scrollPx * 0.6) * 0.012) * 8);
  }
  ctx.lineTo(width, groundY);
  ctx.closePath();
  ctx.fill();

  // The ground itself.
  ctx.fillStyle = PALETTE.ground;
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = PALETTE.groundTop;
  ctx.fillRect(0, groundY, width, 10);

  // A fence line and pumpkins rushing past at full speed.
  ctx.strokeStyle = PALETTE.fence;
  ctx.lineWidth = 4;
  for (let x = -((scrollPx) % 96); x < width + 96; x += 96) {
    ctx.beginPath();
    ctx.moveTo(x, groundY - 26);
    ctx.lineTo(x, groundY + 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, groundY - 18);
  ctx.lineTo(width, groundY - 18);
  ctx.stroke();
  for (let i = 0; i < 5; i += 1) {
    const px = ((i * 257 - scrollPx) % (width + 160) + width + 160) % (width + 160) - 80;
    drawPumpkin(ctx, px, groundY + 52);
  }

  // Grass tufts on the ground's edge.
  ctx.strokeStyle = PALETTE.grass;
  ctx.lineWidth = 2;
  for (let x = -((scrollPx * 1.2) % 70); x < width; x += 70) {
    ctx.beginPath();
    ctx.moveTo(x, groundY + 4);
    ctx.lineTo(x - 4, groundY - 6);
    ctx.moveTo(x + 5, groundY + 4);
    ctx.lineTo(x + 8, groundY - 5);
    ctx.stroke();
  }
}

function drawBarn(ctx, x, groundY) {
  ctx.fillStyle = PALETTE.barn;
  ctx.fillRect(x, groundY - 118, 150, 118);
  ctx.fillStyle = PALETTE.barnRoof;
  ctx.beginPath();
  ctx.moveTo(x - 10, groundY - 118);
  ctx.lineTo(x + 75, groundY - 168);
  ctx.lineTo(x + 160, groundY - 118);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.barnTrim;
  ctx.fillRect(x + 58, groundY - 72, 34, 72);
  ctx.strokeStyle = PALETTE.barnTrim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 58, groundY - 72);
  ctx.lineTo(x + 92, groundY);
  ctx.moveTo(x + 92, groundY - 72);
  ctx.lineTo(x + 58, groundY);
  ctx.stroke();
  ctx.fillStyle = PALETTE.sun;
  ctx.fillRect(x + 18, groundY - 102, 20, 20);
  ctx.fillRect(x + 112, groundY - 102, 20, 20);
}

function drawTree(ctx, x, groundY, size) {
  ctx.fillStyle = PALETTE.treeTrunk;
  ctx.fillRect(x - 4, groundY - size * 0.5, 8, size * 0.5);
  ctx.fillStyle = PALETTE.tree;
  ctx.beginPath();
  ctx.moveTo(x, groundY - size * 1.6);
  ctx.lineTo(x - size * 0.55, groundY - size * 0.45);
  ctx.lineTo(x + size * 0.55, groundY - size * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, groundY - size * 2.1);
  ctx.lineTo(x - size * 0.42, groundY - size * 1.1);
  ctx.lineTo(x + size * 0.42, groundY - size * 1.1);
  ctx.closePath();
  ctx.fill();
}

function drawPumpkin(ctx, x, y) {
  ctx.fillStyle = '#d2691e';
  ellipse(ctx, x, y, 16, 12);
  ctx.fillStyle = '#e8823f';
  ellipse(ctx, x, y, 10, 11);
  ctx.strokeStyle = '#5d7a2e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - 11);
  ctx.lineTo(x + 3, y - 17);
  ctx.stroke();
}

// --- the turkey ---

export function drawTurkey(ctx, world, blinkOn) {
  const t = world.turkey;
  const ducking = t.ducking;
  const bob = t.grounded && !ducking ? Math.sin(t.runPhase) * TURKEY.runBob : 0;
  const feetY = t.feetY + bob;
  const x = TURKEY.x;
  if (blinkOn && Math.floor(world.time * 14) % 2 === 0) return; // hit blink

  ctx.save();
  ctx.translate(x, feetY);

  const bodyH = ducking ? 26 : 40;
  const bodyY = -bodyH / 2 - 6;

  // Tail feathers, fanned behind.
  ctx.fillStyle = PALETTE.turkeyTail;
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.translate(-24, bodyY - 4);
    ctx.rotate(i * 0.38 - 0.5);
    ctx.beginPath();
    ctx.ellipse(0, -20, 7, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#7a4a1e';
  for (let i = -1; i <= 1; i += 1) {
    ctx.save();
    ctx.translate(-24, bodyY - 4);
    ctx.rotate(i * 0.38 - 0.5);
    ctx.beginPath();
    ctx.ellipse(0, -20, 4, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Body and wing.
  ctx.fillStyle = PALETTE.turkeyBody;
  ellipse(ctx, 0, bodyY, 30, bodyH / 2 + 4);
  ctx.fillStyle = PALETTE.turkeyWing;
  const wingFlap = t.grounded ? Math.sin(t.runPhase * 2) * 4 : -10;
  ctx.beginPath();
  ctx.ellipse(-4, bodyY + wingFlap * 0.4, 16, 10, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Legs: running scissor, tucked when airborne.
  ctx.strokeStyle = '#e8a13c';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  if (t.grounded) {
    const swing = Math.sin(t.runPhase) * 10;
    ctx.beginPath();
    ctx.moveTo(-8, bodyY + 16);
    ctx.lineTo(-8 + swing, 0);
    ctx.moveTo(8, bodyY + 16);
    ctx.lineTo(8 - swing, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-8, bodyY + 16);
    ctx.lineTo(-12, -2);
    ctx.moveTo(8, bodyY + 16);
    ctx.lineTo(12, -2);
    ctx.stroke();
  }

  // Head, beak and wattle at the front.
  const headX = ducking ? 30 : 26;
  const headY = ducking ? bodyY - 2 : bodyY - 30;
  ctx.fillStyle = PALETTE.turkeyNeck;
  ctx.fillRect(headX - 8, headY + 4, 10, ducking ? 8 : 22);
  ctx.fillStyle = PALETTE.turkeyHead;
  ellipse(ctx, headX, headY, 11, 10);
  ctx.fillStyle = PALETTE.turkeyBeak;
  ctx.beginPath();
  ctx.moveTo(headX + 8, headY - 2);
  ctx.lineTo(headX + 22, headY + 3);
  ctx.lineTo(headX + 8, headY + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.turkeyWattle;
  ctx.beginPath();
  ctx.ellipse(headX + 6, headY + 10, 4, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1d24';
  ellipse(ctx, headX + 3, headY - 3, 2.2, 2.2);

  ctx.restore();
}

// --- the farmer, closing in from behind ---

export function drawFarmer(ctx, world) {
  const gapPx = world.farmerGap * 7;
  const x = Math.max(28, TURKEY.x - 96 - gapPx);
  const feetY = GAME.groundY;
  const phase = world.time * 11;
  const bob = Math.abs(Math.sin(phase)) * 4;

  ctx.save();
  ctx.translate(x, feetY - bob);

  // Legs and overalls.
  ctx.strokeStyle = PALETTE.farmerOveralls;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  const swing = Math.sin(phase) * 9;
  ctx.beginPath();
  ctx.moveTo(-6, -34);
  ctx.lineTo(-6 + swing, 0);
  ctx.moveTo(6, -34);
  ctx.lineTo(6 - swing, 0);
  ctx.stroke();
  ctx.fillStyle = PALETTE.farmerOveralls;
  ctx.fillRect(-13, -58, 26, 28);

  // Shirt, arms reaching forward, and a waving pitchfork.
  ctx.fillStyle = PALETTE.farmerShirt;
  ctx.fillRect(-14, -82, 28, 28);
  ctx.strokeStyle = PALETTE.farmerShirt;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(10, -76);
  ctx.lineTo(26, -62);
  ctx.stroke();
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(24, -92);
  ctx.lineTo(34, -52);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.knifeBlade;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, -92);
  ctx.lineTo(20, -102);
  ctx.moveTo(24, -92);
  ctx.lineTo(26, -102);
  ctx.moveTo(24, -92);
  ctx.lineTo(32, -100);
  ctx.stroke();

  // Head, straw hat and moustache.
  ctx.fillStyle = PALETTE.farmerSkin;
  ellipse(ctx, 0, -92, 11, 12);
  ctx.fillStyle = PALETTE.farmerHat;
  ellipse(ctx, 0, -100, 17, 5);
  ctx.fillRect(-9, -114, 18, 12);
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(-7, -104, 14, 3);
  ellipse(ctx, 4, -86, 6, 2.5);

  ctx.restore();

  // When he is close, a warning flashes at the screen's left edge.
  if (world.farmerGap < 9 && !world.over) {
    const pulse = 0.25 + 0.2 * Math.sin(world.time * 8);
    ctx.fillStyle = `rgba(231, 76, 60, ${pulse})`;
    ctx.fillRect(0, 0, 14, GAME.height);
    text(ctx, 'HE IS CLOSE!', 24, 96, 20, PALETTE.danger);
  }
}

// --- obstacles and pickups ---

function drawOven(ctx, o) {
  ctx.fillStyle = PALETTE.oven;
  roundRect(ctx, o.x, o.y, o.w, o.h, 6);
  ctx.fill();
  ctx.fillStyle = PALETTE.ovenDoor;
  roundRect(ctx, o.x + 10, o.y + 14, o.w - 20, o.h - 26, 4);
  ctx.fill();
  ctx.fillStyle = PALETTE.ovenGlow;
  roundRect(ctx, o.x + 16, o.y + 22, o.w - 32, 18, 3);
  ctx.fill();
  ctx.fillStyle = '#9aa0aa';
  ctx.fillRect(o.x + 8, o.y + 4, o.w - 16, 5);
  ctx.fillStyle = PALETTE.danger;
  ctx.beginPath();
  ctx.arc(o.x + o.w - 12, o.y + 7, 3, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'HOT!', o.x + o.w / 2, o.y - 12, 15, PALETTE.ovenGlow, 'center');
}

function drawFence(ctx, o) {
  ctx.fillStyle = PALETTE.fence;
  ctx.fillRect(o.x, o.y, 6, o.h);
  ctx.fillRect(o.x + o.w - 6, o.y, 6, o.h);
  ctx.fillRect(o.x, o.y + 8, o.w, 7);
  ctx.fillRect(o.x, o.y + 28, o.w, 7);
}

function drawHay(ctx, o) {
  ctx.fillStyle = PALETTE.hay;
  ellipse(ctx, o.x + o.w / 2, o.y + o.h / 2, o.w / 2, o.h / 2);
  ctx.fillStyle = PALETTE.hayDark;
  ellipse(ctx, o.x + o.w / 2, o.y + o.h / 2, o.w / 2 - 8, o.h / 2 - 7);
  ctx.strokeStyle = PALETTE.hayDark;
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(o.x + o.w / 2 + i * 14, o.y + 6);
    ctx.lineTo(o.x + o.w / 2 + i * 14, o.y + o.h - 6);
    ctx.stroke();
  }
}

function drawKnife(ctx, o) {
  const angle = o.kind === 'knife-fall' && !o.landed ? 1.35 : o.kind === 'knife-fly' ? 0 : 1.2;
  ctx.save();
  ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
  ctx.rotate(angle);
  ctx.fillStyle = PALETTE.knifeBlade;
  ctx.beginPath();
  ctx.moveTo(-26, -5);
  ctx.lineTo(14, -6);
  ctx.lineTo(28, 0);
  ctx.lineTo(14, 6);
  ctx.lineTo(-26, 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.knifeHandle;
  roundRect(ctx, -34, -6, 12, 12, 3);
  ctx.fill();
  ctx.restore();
  // A falling knife is telegraphed by its shadow on the ground.
  if (o.kind === 'knife-fall' && !o.landed) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ellipse(ctx, o.x + 8, GAME.groundY + 4, 18, 5);
  }
}

function drawCorn(ctx, p) {
  const y = p.y + Math.sin(p.bob) * 3;
  ctx.fillStyle = PALETTE.cornHusk;
  ctx.beginPath();
  ctx.moveTo(p.x - 10, y + 8);
  ctx.lineTo(p.x - 2, y - 6);
  ctx.lineTo(p.x - 10, y - 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.corn;
  ellipse(ctx, p.x, y, 8, 11);
  ctx.fillStyle = '#e8a13c';
  ctx.fillRect(p.x - 5, y - 6, 10, 2);
  ctx.fillRect(p.x - 5, y, 10, 2);
  ctx.fillRect(p.x - 5, y + 6, 10, 2);
}

function drawFeather(ctx, p) {
  const y = p.y + Math.sin(p.bob) * 5;
  ctx.save();
  ctx.translate(p.x, y);
  ctx.rotate(Math.sin(p.bob * 0.7) * 0.25);
  ctx.fillStyle = PALETTE.featherGold;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.beginPath();
  ctx.ellipse(0, -5, 5, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b57f22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, 24);
  ctx.stroke();
  ctx.restore();
  text(ctx, '+1 LIFE', p.x, y - 36, 13, PALETTE.featherGold, 'center');
}

// --- the HUD ---

function drawHeart(ctx, x, y, filled, size = 11) {
  ctx.fillStyle = filled ? '#e74c3c' : 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.7);
  ctx.bezierCurveTo(x - size * 1.2, y - size * 0.2, x - size * 0.6, y - size, x, y - size * 0.35);
  ctx.bezierCurveTo(x + size * 0.6, y - size, x + size * 1.2, y - size * 0.2, x, y + size * 0.7);
  ctx.fill();
}

export function drawHUD(ctx, world, muted) {
  const { width } = GAME;
  ctx.fillStyle = PALETTE.hudPanel;
  roundRect(ctx, 12, 12, 220, 66, 10);
  ctx.fill();
  text(ctx, `SCORE ${Math.floor(world.score)}`, 26, 34, 22, PALETTE.hudText);
  text(ctx, `DISTANCE ${Math.floor(world.distance)} m / ${GAME.goalDistance} m`, 26, 60, 15, PALETTE.accent);

  // Progress bar to the forest gate.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  roundRect(ctx, width / 2 - 150, 22, 300, 14, 7);
  ctx.fill();
  const progress = Math.min(1, world.distance / GAME.goalDistance);
  ctx.fillStyle = '#6fae3f';
  roundRect(ctx, width / 2 - 150, 22, 300 * progress, 14, 7);
  ctx.fill();
  text(ctx, 'FOREST GATE', width / 2, 54, 13, PALETTE.hudText, 'center');
  text(ctx, `${Math.floor(progress * 100)}%`, width / 2, 72, 13, PALETTE.accent, 'center');

  // Lives as hearts, top right, beside the mute button.
  ctx.fillStyle = PALETTE.hudPanel;
  roundRect(ctx, width - 236, 12, 224, 44, 10);
  ctx.fill();
  for (let i = 0; i < RUN.startLives; i += 1) {
    drawHeart(ctx, width - 212 + i * 30, 34, i < world.lives);
  }
  text(ctx, muted ? 'SOUND OFF (M)' : 'SOUND ON (M)', width - 64, 34, 12, PALETTE.hudText, 'center');

  // Farmer gap meter, bottom left.
  ctx.fillStyle = PALETTE.hudPanel;
  roundRect(ctx, 12, GAME.height - 44, 220, 32, 8);
  ctx.fill();
  text(ctx, 'FARMER', 24, GAME.height - 28, 13, PALETTE.hudText);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  roundRect(ctx, 92, GAME.height - 35, 120, 12, 6);
  ctx.fill();
  const gapFrac = Math.max(0, Math.min(1, world.farmerGap / RUN.maxFarmerGap));
  ctx.fillStyle = gapFrac < 0.3 ? PALETTE.danger : PALETTE.accent;
  roundRect(ctx, 92, GAME.height - 35, 120 * gapFrac, 12, 6);
  ctx.fill();
}

// --- full scene, screens and overlays ---

export function drawScene(ctx, world) {
  const scrollPx = world.distance * GAME.pxPerMetre;
  drawBackground(ctx, scrollPx, world.time);
  for (const p of world.pickups) {
    if (p.kind === 'corn') drawCorn(ctx, p);
    else drawFeather(ctx, p);
  }
  for (const o of world.obstacles) {
    if (o.kind === 'oven') drawOven(ctx, o);
    else if (o.kind === 'fence') drawFence(ctx, o);
    else if (o.kind === 'hay') drawHay(ctx, o);
    else drawKnife(ctx, o);
  }
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ellipse(ctx, p.x, p.y, p.size, p.size);
    ctx.globalAlpha = 1;
  }
  drawFarmer(ctx, world);
  drawTurkey(ctx, world, world.hitCooldown > 0);
}

function button(ctx, rect, label, sublabel = null) {
  ctx.fillStyle = '#c0392b';
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#fff3d6';
  ctx.lineWidth = 3;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.stroke();
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h / 2 - (sublabel ? 10 : 0), 26, '#fff3d6', 'center');
  if (sublabel) {
    text(ctx, sublabel, rect.x + rect.w / 2, rect.y + rect.h / 2 + 18, 14, '#ffe9c4', 'center');
  }
}

export function drawTitle(ctx, time) {
  const { width, height } = GAME;
  ctx.fillStyle = 'rgba(20, 12, 32, 0.45)';
  ctx.fillRect(0, 0, width, height);

  text(ctx, 'GOBBLE RUN', width / 2, 92, 74, PALETTE.accent, 'center');
  text(ctx, '— Thanksgiving Escape —', width / 2, 148, 26, PALETTE.hudText, 'center');
  text(ctx, 'The farmer is coming for dinner. You are dinner. RUN.', width / 2, 186, 20, '#ffd9a0', 'center');

  // A big turkey posing under the title, centred on the screen.
  const poseWorld = {
    time,
    hitCooldown: 0,
    turkey: { feetY: 330, vy: 0, grounded: true, ducking: false, runPhase: time * 6 },
  };
  ctx.save();
  ctx.translate(GAME.width / 2, 320);
  ctx.scale(1.3, 1.3);
  ctx.translate(-TURKEY.x, -330);
  drawTurkey(ctx, poseWorld, false);
  ctx.restore();

  const lines = [
    'SPACE or UP — jump over ovens, fences and hay bales',
    'DOWN — duck under flying carving knives',
    'Grab corn for points, golden feathers for a life',
    'Reach the forest gate at 1000 m. Do not let the farmer catch you.',
    'P pauses · M mutes · Click the buttons or use the keys',
  ];
  lines.forEach((line, i) => {
    text(ctx, line, width / 2, 340 + i * 22, 16, PALETTE.hudText, 'center');
  });

  const startRect = { x: width / 2 - 130, y: height - 92, w: 260, h: 60 };
  button(ctx, startRect, 'START RUN', 'or press SPACE');
  return { start: startRect };
}

export function drawEndScreen(ctx, world) {
  const { width, height } = GAME;
  const escaped = world.result === 'escaped';
  ctx.fillStyle = escaped ? 'rgba(20, 50, 20, 0.55)' : 'rgba(40, 8, 8, 0.6)';
  ctx.fillRect(0, 0, width, height);

  text(ctx, escaped ? 'ESCAPED!' : 'CAUGHT!', width / 2, 120, 72, escaped ? '#8be06a' : PALETTE.danger, 'center');
  text(
    ctx,
    escaped
      ? 'You burst through the forest gate — free for another year!'
      : 'The farmer got you. Thanksgiving dinner is served…',
    width / 2,
    178,
    21,
    PALETTE.hudText,
    'center',
  );
  text(ctx, `SCORE  ${Math.floor(world.score)}`, width / 2, 240, 30, PALETTE.accent, 'center');
  text(ctx, `DISTANCE  ${Math.floor(world.distance)} m`, width / 2, 282, 22, PALETTE.hudText, 'center');
  text(
    ctx,
    `OBSTACLES DODGED  ${world.dodged}    ·    CORN EATEN  ${world.cornEaten}`,
    width / 2,
    314,
    16,
    PALETTE.accent,
    'center',
  );
  text(
    ctx,
    escaped ? 'The forest is yours. Run again for a bigger score?' : 'So close — the forest gate was waiting.',
    width / 2,
    348,
    17,
    '#ffd9a0',
    'center',
  );

  const restartRect = { x: width / 2 - 130, y: height - 110, w: 260, h: 60 };
  button(ctx, restartRect, 'RUN AGAIN', 'or press SPACE');
  return { restart: restartRect };
}

export function drawPausedOverlay(ctx) {
  const { width, height } = GAME;
  ctx.fillStyle = 'rgba(20, 12, 32, 0.6)';
  ctx.fillRect(0, 0, width, height);
  text(ctx, 'PAUSED', width / 2, height / 2 - 20, 56, PALETTE.hudText, 'center');
  text(ctx, 'Press P or click to keep running', width / 2, height / 2 + 30, 18, '#ffd9a0', 'center');
}
