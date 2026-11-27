// Gobble Run — tuning constants. One place holds every number that shapes
// how the game feels, so balancing is a matter of editing this file alone.

export const GAME = {
  width: 960,
  height: 540,
  groundY: 462,
  goalDistance: 1000, // metres to the forest gate: reach it and you escape
  pxPerMetre: 42, // world scroll per metre, used for parallax and distance
  gravity: 2600,
  titleSeed: 20261127, // the seed behind the quiet farmyard on the title screen
  knifeFlyHeight: 96, // how high a flying carving knife sails: duck under it
};

export const TURKEY = {
  x: 170, // the turkey stays here; the farmyard scrolls past it
  width: 62,
  standHeight: 58,
  duckHeight: 34,
  jumpVelocity: -880,
  runBob: 3, // pixels of vertical bob while running
};

export const RUN = {
  baseSpeed: 270, // px per second at the start of the run
  maxSpeed: 580,
  speedPerMetre: 0.32, // the run gets faster the further you get
  startLives: 3,
  startFarmerGap: 26, // metres of head start over the farmer
  maxFarmerGap: 30,
  gapRecovery: 1.4, // metres per second regained while running clean
  hitGapLoss: 8, // metres the farmer gains when you stumble
  hitCooldown: 1.2, // seconds of invulnerability after a hit
  cleanTimeForRecovery: 2.5, // seconds without a hit before the gap grows
};

export const SCORE = {
  corn: 10,
  feather: 50,
  dodge: 5, // points for clearing an obstacle without touching it
  perMetre: 1,
};

export const SPAWN = {
  minGapMetres: 13, // closest two obstacles may be, in metres of travel
  maxGapMetres: 24,
  cornArcChance: 0.55,
  featherChance: 0.14, // a golden feather rides along now and then
  flyKnifeFromMetres: 180, // flying knives only appear once you are this far
  fallKnifeFromMetres: 320, // falling knives join in later still
};

// Warm dusk palette: the farmyard at sunset, the night of Thanksgiving eve.
export const PALETTE = {
  skyTop: '#2e1c4e',
  skyMid: '#b4503c',
  skyLow: '#e8823f',
  sun: '#f7c948',
  sunGlow: 'rgba(247, 201, 72, 0.35)',
  cloud: 'rgba(255, 214, 170, 0.55)',
  hillFar: '#5a3a5e',
  hillNear: '#4a2f3d',
  barn: '#7e2f22',
  barnRoof: '#5e2118',
  barnTrim: '#f2e3c6',
  tree: '#2f3d1e',
  treeTrunk: '#4a3220',
  ground: '#6b4423',
  groundTop: '#9c6a2e',
  grass: '#5d7a2e',
  fence: '#8a5a2b',
  hay: '#d9a441',
  hayDark: '#b57f22',
  oven: '#3c3c46',
  ovenDoor: '#1d1d24',
  ovenGlow: '#ff9a3d',
  knifeBlade: '#dfe6ee',
  knifeHandle: '#5a2d1a',
  corn: '#ffd23e',
  cornHusk: '#6fae3f',
  featherGold: '#ffcf3d',
  turkeyBody: '#8a5a2b',
  turkeyWing: '#6e4520',
  turkeyHead: '#c98d5f',
  turkeyNeck: '#b06a3f',
  turkeyBeak: '#e8a13c',
  turkeyWattle: '#c0392b',
  turkeyTail: '#5d3a1a',
  farmerShirt: '#3f6fb5',
  farmerOveralls: '#2e4a6e',
  farmerHat: '#d9b36a',
  farmerSkin: '#e8b98a',
  hudPanel: 'rgba(20, 12, 32, 0.55)',
  hudText: '#fff3d6',
  accent: '#ffd23e',
  danger: '#e74c3c',
};
