// Seeded random numbers for Gobble Run. Every roll the game makes comes
// from here, so a fixed seed replays the same farmyard: screenshots and
// play-tests stay reproducible instead of changing on every load.

// mulberry32: a tiny, fast seeded generator with a decent spread.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A small bag of helpers over one seeded stream.
export function makeRng(seed) {
  const next = mulberry32(seed);
  return {
    next,
    // A float in [min, max).
    range(min, max) {
      return min + next() * (max - min);
    },
    // An integer in [min, max] inclusive.
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    // One item from an array.
    pick(items) {
      return items[Math.floor(next() * items.length)];
    },
    // True with probability p (0..1).
    chance(p) {
      return next() < p;
    },
    // A shuffled copy of an array (Fisher-Yates over the seeded stream).
    shuffle(items) {
      const copy = items.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
  };
}
