// Gobble Run — the hand-in program (Node 22, standard library only).
// It copies this repository's game/ and screenshots/ beside it into the
// output directory and writes /output/dossier.json with the vendored
// make.fun library, so the sealed scorer can check the entry and the judge
// can read it. Run it twice and both runs write the same bytes.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The directory this file lives in: the repository root.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyGameFiles() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  const shots = join(repoRoot, 'screenshots');
  if (existsSync(shots)) {
    cpSync(shots, join(outputDir, 'screenshots'), { recursive: true });
  }
}

function writeDossier() {
  // The scorer's own caps, from the competition's gate: the text cap shapes
  // the dossier's bytes, the others refuse an entry the scorer would refuse
  // (more than 4 screenshots or one over 256 KiB; game/ over 993 files or
  // 48 MiB in all, or a path under game/ over 1000 bytes).
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

// Count the files under a directory, for the summary line below.
function countFiles(dir) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    count += entry.isDirectory() ? countFiles(full) : 1;
  }
  return count;
}

copyGameFiles();
writeDossier();
console.log(
  `wrote ${outputDir}: ${countFiles(join(outputDir, 'game'))} game files, ` +
    `${readdirSync(join(outputDir, 'screenshots')).length} screenshots, ` +
    `dossier.json (${statSync(join(outputDir, 'dossier.json')).size} bytes)`,
);
