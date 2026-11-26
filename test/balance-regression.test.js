// Balance regression guard. A seeded "careless average player" bot (scripts/balance-sim.js, no guarding,
// no runes/bonds) climbs the real engine; the median floor where runs end must stay near the recorded
// values. This is a SNAPSHOT: if you retune the game on purpose, run
//   node scripts/balance-sim.js survive --seed 5 --runs 8 --diff easy,normal,hard,nightmare
// and update EXPECTED below (a value of 101 means the run cleared floor 100).
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const SIM = path.join(__dirname, '..', 'scripts', 'balance-sim.js');
const DIFFS = ['easy', 'normal', 'hard', 'nightmare'];
const CLASSES = ['blade', 'elementalist', 'cleric', 'berserker', 'ranger'];
// Re-recorded 2026-11-26 (2): player hits +20%, stagger rarer (16 per power), All-Out x1.1 base, softer
// mini-bosses, Nightmare ramping x1.22 -> x1.5. Earlier the same day: every class got its signature mechanic (class-mech*.js) and Nightmare
// enemies ramp from x1.22 on floor 1 to x1.32 by floor 30 to compensate; before that,
// 2026-11-25: Break-only stagger, attributes, level-gated skills with ranks, less late gold, gear forging.
const EXPECTED = {
  easy:      { blade: 101, elementalist: 101, cleric: 101, berserker: 101, ranger: 101 },
  normal:    { blade: 101, elementalist: 100, cleric: 101, berserker: 100, ranger: 97 },
  hard:      { blade: 101, elementalist: 98,  cleric: 100, berserker: 101, ranger: 81 },
  nightmare: { blade: 86,  elementalist: 73,  cleric: 90,  berserker: 97,  ranger: 70 }
};
const TOLERANCE = 15;

const out = execFileSync(process.execPath, [SIM, 'survive', '--seed', '5', '--runs', '8', '--diff', DIFFS.join(','), '--class', CLASSES.join(',')], { encoding: 'utf8', maxBuffer: 1 << 24 });
const measured = {};
for (const line of out.split('\n')) {
  const m = line.match(/^(\w+)\s+(\w+)\s+clears\s+(\d+)\/(\d+)\s+\|\s+death floor: min\s+(\d+)\s+median\s+(\d+)/);
  if (m) (measured[m[1]] = measured[m[1]] || {})[m[2]] = { clears: Number(m[3]), runs: Number(m[4]), min: Number(m[5]), median: Number(m[6]) };
}

test('the simulator produced a result for every difficulty x class', () => {
  for (const d of DIFFS) for (const c of CLASSES) assert.ok(measured[d] && measured[d][c], 'no result for ' + d + '/' + c + '\n' + out);
});

test('median death floor has not drifted from the recorded balance (tolerance ' + TOLERANCE + ' floors)', () => {
  for (const d of DIFFS) {
    for (const c of CLASSES) {
      const got = measured[d][c].median, want = EXPECTED[d][c];
      assert.ok(Math.abs(got - want) <= TOLERANCE, d + '/' + c + ': median death floor is now ' + got + ' (recorded ' + want + '). Balance moved; if intentional, update EXPECTED.');
    }
  }
});

test('harder difficulties are never clearly easier than easier ones', () => {
  for (const c of CLASSES) {
    for (let i = 1; i < DIFFS.length; i++) {
      assert.ok(measured[DIFFS[i]][c].median <= measured[DIFFS[i - 1]][c].median + 10,
        c + ': ' + DIFFS[i] + ' (' + measured[DIFFS[i]][c].median + ') is easier than ' + DIFFS[i - 1] + ' (' + measured[DIFFS[i - 1]][c].median + ')');
    }
  }
});

test('on Easy no run dies early (a new player should not hit a wall before floor 60)', () => {
  for (const c of CLASSES) assert.ok(measured.easy[c].min >= 60, 'easy/' + c + ': a run died on floor ' + measured.easy[c].min);
});

test('class parity: on Easy and Normal no class falls more than 30 floors behind the best class', () => {
  const gaps = [];
  for (const d of ['easy', 'normal']) {
    const best = Math.max(...CLASSES.map((c) => measured[d][c].median));
    CLASSES.forEach((c) => { if (best - measured[d][c].median > 30) gaps.push(d + '/' + c + ' median ' + measured[d][c].median + ' vs best ' + best); });
  }
  assert.deepEqual(gaps, [], 'class parity gap: ' + gaps.join('; '));
});
