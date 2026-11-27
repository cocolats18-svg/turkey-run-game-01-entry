// Gobble Run — the game loop and the state machine. States: title, playing,
// paused, caught, escaped. This file wires input, world, sound and drawing
// together and owns the buttons the mouse can press.

import { GAME } from './config.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { createWorld, updateWorld } from './world.js';
import {
  drawScene,
  drawHUD,
  drawTitle,
  drawEndScreen,
  drawPausedOverlay,
} from './render.js';
import { buildShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = GAME.width;
canvas.height = GAME.height;

const input = new Input(canvas);
const sounds = new SoundBank();

let state = 'title'; // title | playing | paused | caught | escaped
let world = createWorld(GAME.titleSeed);
let buttons = {}; // the rects the current screen drew, for click testing
let lastTime = 0;

// --- screenshot mode: one fixed scene, drawn once, no loop ---
const params = new URLSearchParams(window.location.search);
const shotKind = params.get('shot');
if (shotKind) {
  const scene = buildShot(shotKind, Number(params.get('seed') || 1));
  if (scene.state === 'title') {
    drawScene(ctx, scene.world);
    buttons = drawTitle(ctx, scene.time);
  } else if (scene.state === 'playing') {
    drawScene(ctx, scene.world);
    drawHUD(ctx, scene.world, false);
  } else {
    drawScene(ctx, scene.world);
    drawEndScreen(ctx, scene.world);
  }
} else {
  requestAnimationFrame(frame);
}

function startRun() {
  world = createWorld((Math.random() * 1e9) | 0);
  state = 'playing';
  sounds.ensure();
  sounds.uiClick();
  sounds.gobble();
}

function backToTitle() {
  world = createWorld(GAME.titleSeed);
  state = 'title';
}

function playEvents(events) {
  for (const event of events) {
    switch (event.type) {
      case 'jump':
        sounds.jump();
        break;
      case 'land':
        sounds.land();
        break;
      case 'corn':
        sounds.chime();
        break;
      case 'feather':
        sounds.feather();
        break;
      case 'hit':
        sounds.thud();
        break;
      case 'caught':
        sounds.caught();
        break;
      case 'escaped':
        sounds.escaped();
        break;
      default:
        break;
    }
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.033, Math.max(0, (now - lastTime) / 1000 || 0.016));
  lastTime = now;

  // Mute works on every screen.
  if (input.muteQueued) {
    sounds.toggleMute();
  }

  // Clicks: the start button, the restart button, or anywhere to resume.
  if (state === 'title' && buttons.start && input.clickedInside(buttons.start)) {
    sounds.ensure();
    startRun();
  } else if ((state === 'caught' || state === 'escaped') && buttons.restart && input.clickedInside(buttons.restart)) {
    sounds.ensure();
    startRun();
  } else if (state === 'paused' && input.nextClick()) {
    sounds.ensure();
    sounds.uiClick();
    state = 'playing';
  }

  // Space / Up: start, restart, or jump, depending on the screen.
  if (input.jumpQueued) {
    if (state === 'title' || state === 'caught' || state === 'escaped') {
      sounds.ensure();
      startRun();
    }
  }
  if (input.pauseQueued && (state === 'playing' || state === 'paused')) {
    sounds.ensure();
    state = state === 'playing' ? 'paused' : 'playing';
  }

  if (state === 'playing') {
    const events = [];
    updateWorld(world, input, dt, events);
    playEvents(events);
    if (world.over) {
      state = world.result; // 'caught' or 'escaped'
    }
  }

  // --- draw the current screen ---
  ctx.clearRect(0, 0, GAME.width, GAME.height);
  if (state === 'title') {
    drawScene(ctx, world);
    buttons = drawTitle(ctx, now / 1000);
  } else if (state === 'paused') {
    drawScene(ctx, world);
    drawHUD(ctx, world, sounds.muted);
    drawPausedOverlay(ctx);
  } else if (state === 'caught' || state === 'escaped') {
    drawScene(ctx, world);
    buttons = drawEndScreen(ctx, world);
  } else {
    drawScene(ctx, world);
    drawHUD(ctx, world, sounds.muted);
  }

  input.clearEdges();
}

// Prime the audio context on the first gesture, so browsers allow sound.
function primeAudio() {
  sounds.ensure();
}
window.addEventListener('keydown', primeAudio);
canvas.addEventListener('pointerdown', primeAudio);
