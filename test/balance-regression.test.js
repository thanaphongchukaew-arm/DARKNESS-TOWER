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
const EXPECTED = {
  easy:      { blade: 101, elementalist: 101, cleric: 101, berserker: 101, ranger: 86 },
  normal:    { blade: 101, elementalist: 96,  cleric: 100, berserker: 100, ranger: 76 },
  hard:      { blade: 100, elementalist: 75,  cleric: 85,  berserker: 90,  ranger: 75 },
  nightmare: { blade: 85,  elementalist: 70,  cleric: 79,  berserker: 100, ranger: 55 }
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
