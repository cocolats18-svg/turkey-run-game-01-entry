// Keyboard and mouse input for Gobble Run. The game reads this class once
// per frame: jumps and pauses are queued edges (they fire once per press),
// ducking is a held state, and mouse clicks arrive as canvas coordinates
// the game can hit-test against its buttons.

import { GAME } from './config.js';

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.jumpQueued = false;
    this.pauseQueued = false;
    this.muteQueued = false;
    this.duckHeld = false;
    this.anyKeyQueued = false;
    this.clicks = []; // {x, y} in canvas pixels, oldest first

    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      switch (event.code) {
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
          this.jumpQueued = true;
          this.anyKeyQueued = true;
          event.preventDefault();
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.duckHeld = true;
          event.preventDefault();
          break;
        case 'KeyP':
        case 'Escape':
          this.pauseQueued = true;
          break;
        case 'KeyM':
          this.muteQueued = true;
          break;
        default:
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        this.duckHeld = false;
      }
    });

    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * GAME.width;
      const y = ((event.clientY - rect.top) / rect.height) * GAME.height;
      this.clicks.push({ x, y });
      this.anyKeyQueued = true;
    });

    // If the window loses focus mid-duck, never stay ducked forever.
    window.addEventListener('blur', () => {
      this.duckHeld = false;
    });
  }

  // Take the next unhandled click, or null when there is none.
  nextClick() {
    return this.clicks.shift() ?? null;
  }

  // True when at least one click is still waiting to be handled.
  hasClick() {
    return this.clicks.length > 0;
  }

  // Drop every queued click, for example when leaving a screen.
  clearClicks() {
    this.clicks.length = 0;
  }

  // True when a click landed inside the given rectangle.
  clickedInside(rect) {
    for (let i = 0; i < this.clicks.length; i += 1) {
      const c = this.clicks[i];
      if (c.x >= rect.x && c.x <= rect.x + rect.w && c.y >= rect.y && c.y <= rect.y + rect.h) {
        this.clicks.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  // Drop every queued edge at the end of a frame so a press fires once.
  clearEdges() {
    this.jumpQueued = false;
    this.pauseQueued = false;
    this.muteQueued = false;
    this.anyKeyQueued = false;
  }
}
