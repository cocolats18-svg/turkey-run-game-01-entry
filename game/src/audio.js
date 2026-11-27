// Synthesised sound for Gobble Run. No audio files: every effect is built
// from WebAudio oscillators and filtered noise at play time, so the game
// ships no assets and makes no network request. The context is created on
// the first user gesture, never before, so browsers never block it.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.master = null;
  }

  // Call from any user gesture (key or click) so the context may start.
  ensure() {
    if (!this.ctx) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.master.connect(this.ctx.destination);
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  // A soft click for button presses on the menus.
  uiClick() {
    this.tone(520, 0.07, 'triangle', 0.16);
  }

  // One short oscillator note, optionally sliding to another pitch.
  tone(freq, duration, type = 'sine', volume = 0.25, slideTo = null, delay = 0) {
    if (!this.ctx || this.muted) return;
    const start = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), start + duration);
    }
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  // A burst of filtered noise: thuds, landings, the farmer's footsteps.
  noiseBurst(duration, volume = 0.3, cutoff = 400, delay = 0) {
    if (!this.ctx || this.muted) return;
    const start = this.ctx.currentTime + delay;
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(start);
  }

  // The turkey's own voice: two quick low blips, gobble-gobble.
  gobble() {
    this.tone(320, 0.09, 'square', 0.16, 180);
    this.tone(300, 0.09, 'square', 0.16, 170, 0.11);
    this.tone(340, 0.12, 'square', 0.14, 190, 0.22);
  }

  jump() {
    this.tone(280, 0.16, 'sine', 0.2, 620);
  }

  land() {
    this.noiseBurst(0.08, 0.18, 300);
  }

  // A bright two-note pickup chime for corn.
  chime() {
    this.tone(880, 0.12, 'sine', 0.22);
    this.tone(1318, 0.18, 'sine', 0.2, null, 0.07);
  }

  // A golden feather: a rising little arpeggio.
  feather() {
    this.tone(660, 0.1, 'triangle', 0.22);
    this.tone(880, 0.1, 'triangle', 0.22, null, 0.08);
    this.tone(1174, 0.16, 'triangle', 0.22, null, 0.16);
  }

  // A dull thud when the turkey stumbles into something.
  thud() {
    this.noiseBurst(0.18, 0.4, 220);
    this.tone(140, 0.2, 'sine', 0.3, 60);
  }

  // The farmer closes in: low stomps, then a descending buzz.
  caught() {
    this.noiseBurst(0.15, 0.35, 300, 0);
    this.noiseBurst(0.15, 0.35, 300, 0.18);
    this.tone(220, 0.5, 'sawtooth', 0.18, 70, 0.3);
  }

  // Escaped: a cheerful little fanfare.
  escaped() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, i) => {
      this.tone(freq, 0.18, 'triangle', 0.22, null, i * 0.11);
    });
    this.tone(1318, 0.35, 'triangle', 0.2, null, 0.46);
  }
}
