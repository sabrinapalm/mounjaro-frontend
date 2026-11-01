import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

const sourceUrl = new URL('../utils/shotHistoryUtils.ts', import.meta.url);
const source = await readFile(sourceUrl, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { groupShotsByMonth, getNextShotHistoryCount, sortShotsNewestFirst } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);

const shotStatsUrl = new URL('../utils/shotStatsUtils.ts', import.meta.url);
const shotStatsSource = await readFile(shotStatsUrl, 'utf8');
const shotStatsCompiled = ts.transpileModule(shotStatsSource, {
  compilerOptions: {
    esModuleInterop: true,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const shotStatsModule = { exports: {} };
const requireFromShotStats = createRequire(shotStatsUrl);
const dayjs = requireFromShotStats('dayjs');
const shotStatsRequire = (specifier) =>
  specifier === '../../../shared/utils/dateHelpers'
    ? { getTimestamp: (date) => dayjs(date).valueOf() }
    : requireFromShotStats(specifier);
new Function('require', 'module', 'exports', shotStatsCompiled)(
  shotStatsRequire,
  shotStatsModule,
  shotStatsModule.exports
);
const { getLatestDoseStats, getLatestShot, getNextShotStats, getNotesStats, getSideEffectStats } =
  shotStatsModule.exports;

const shot = (id, dateTime) => ({
  id,
  dateTime,
  dosage: 2.5,
  injectionSite: 'abdomen_left',
  sideEffects: ['nausea'],
  notes: 'Logged after breakfast',
});

test('sorts shot history newest first without mutating the source array', () => {
  const shots = [
    shot('older', '2026-01-02T10:00:00.000Z'),
    shot('newest', '2026-03-02T10:00:00.000Z'),
    shot('middle', '2026-02-02T10:00:00.000Z'),
  ];

  assert.deepEqual(
    sortShotsNewestFirst(shots).map(({ id }) => id),
    ['newest', 'middle', 'older']
  );
  assert.equal(shots[0]?.id, 'older');
});

test('groups newest-first shot history by month without dropping details', () => {
  const shots = sortShotsNewestFirst([
    shot('jan-older', '2026-01-02T10:00:00.000Z'),
    shot('feb', '2026-02-12T10:00:00.000Z'),
    shot('jan-newer', '2026-01-28T10:00:00.000Z'),
  ]);
  const groups = groupShotsByMonth(shots);

  assert.deepEqual(
    groups.map(({ label, shots: groupedShots }) => [label, groupedShots.map(({ id }) => id)]),
    [
      ['February 2026', ['feb']],
      ['January 2026', ['jan-newer', 'jan-older']],
    ]
  );
  assert.deepEqual(groups[0]?.shots[0]?.sideEffects, ['nausea']);
  assert.equal(groups[0]?.shots[0]?.notes, 'Logged after breakfast');
});

test('keeps records with invalid dates accessible in an unavailable-date group', () => {
  const groups = groupShotsByMonth([shot('invalid', 'not-a-date')]);

  assert.equal(groups[0]?.label, 'Date unavailable');
  assert.equal(groups[0]?.shots[0]?.id, 'invalid');
});

test('show more advances by a page and never exceeds the remaining record count', () => {
  assert.equal(getNextShotHistoryCount(10, 26, 10), 20);
  assert.equal(getNextShotHistoryCount(20, 26, 10), 26);
  assert.equal(getNextShotHistoryCount(10, 10, 10), 10);
});

test('uses the latest recorded shot for overview dosage and the existing next-shot schedule', () => {
  const shots = [
    { ...shot('older', '2026-02-20T10:00:00.000Z'), dosage: 2.5 },
    { ...shot('latest', '2026-03-01T10:00:00.000Z'), dosage: 5 },
  ];
  const latestShot = getLatestShot(shots);
  const latestShotDate = dayjs(latestShot.dateTime).startOf('day');
  const nextShot = getNextShotStats(latestShotDate, dayjs('2026-03-04'));

  assert.equal(latestShot.id, 'latest');
  assert.deepEqual(getLatestDoseStats(latestShot), {
    value: '5 mg',
    meta: 'Logged Mar 1',
  });
  assert.equal(nextShot.date.format('YYYY-MM-DD'), '2026-03-08');
  assert.equal(nextShot.value, 'In 4 days');
  assert.equal(nextShot.meta, 'Mar 8');
});

test('keeps side-effect and notes summaries available for treatment statistics', () => {
  const shots = [
    {
      ...shot('with-details', '2026-03-01T10:00:00.000Z'),
      sideEffects: ['nausea'],
      notes: 'Felt tired',
    },
    { ...shot('without-details', '2026-03-08T10:00:00.000Z'), sideEffects: [], notes: '' },
  ];

  assert.equal(getSideEffectStats(shots).value, '1/2');
  assert.equal(getNotesStats(shots).value, 1);
});
