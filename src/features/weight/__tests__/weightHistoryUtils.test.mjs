import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

const sourceUrl = new URL('../utils/weightHistoryUtils.ts', import.meta.url);
const source = await readFile(sourceUrl, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const module = { exports: {} };
const requireFromUtils = createRequire(sourceUrl);
new Function('require', 'module', 'exports', compiled)(
  (specifier) =>
    specifier === '../../../shared/utils/dateHelpers'
      ? { getTimestamp: (date) => Date.parse(date) }
      : requireFromUtils(specifier),
  module,
  module.exports
);
const {
  getNextWeightHistoryCount,
  getWeightChangeInDisplayUnits,
  groupWeightsByMonth,
  sortWeightsNewestFirst,
} = module.exports;

const entry = (id, dateTime, weight) => ({ id, dateTime, weight });

test('selects latest measurements first and preserves same-day records', () => {
  const entries = [
    entry('older', '2026-03-01T08:00:00.000Z', 90),
    entry('same-day-first', '2026-03-02T08:00:00.000Z', 89.8),
    entry('latest', '2026-03-02T18:00:00.000Z', 89.5),
  ];

  assert.deepEqual(
    sortWeightsNewestFirst(entries).map(({ id }) => id),
    ['latest', 'same-day-first', 'older']
  );
  assert.equal(entries.length, 3);
});

test('groups history in latest-month-first order and supports an empty history', () => {
  const groups = groupWeightsByMonth(
    sortWeightsNewestFirst([
      entry('jan', '2026-01-02T10:00:00.000Z', 90),
      entry('mar', '2026-03-02T10:00:00.000Z', 89),
      entry('feb', '2026-02-02T10:00:00.000Z', 89.5),
    ])
  );

  assert.deepEqual(
    groups.map(({ label, weights }) => [label, weights.map(({ id }) => id)]),
    [
      ['March 2026', ['mar']],
      ['February 2026', ['feb']],
      ['January 2026', ['jan']],
    ]
  );
  assert.deepEqual(groupWeightsByMonth([]), []);
});

test('reveals history in batches without exceeding the number of records', () => {
  assert.equal(getNextWeightHistoryCount(5, 17, 10), 15);
  assert.equal(getNextWeightHistoryCount(15, 17, 10), 17);
  assert.equal(getNextWeightHistoryCount(5, 5, 10), 5);
});

test('calculates the recorded difference using the selected unit conversion', () => {
  assert.equal(
    getWeightChangeInDisplayUnits(88.5, 90, (value) => value),
    -1.5
  );
  assert.equal(
    getWeightChangeInDisplayUnits(88.5, 90, (value) => Math.round((value / 0.45359237) * 10) / 10),
    -3.3
  );
});

test('BMI metrics retain a collapsed native disclosure with the calculated summary', async () => {
  const { createElement: h } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { loadComponent } = await import(
    '../../../shared/components/__tests__/renderComponent.mjs'
  );
  const { BmiRangeChart } = loadComponent(
    new URL('../components/BmiRangeChart.tsx', import.meta.url)
  );
  const { ProfileProvider } = loadComponent(
    new URL('../../profile/ProfileContext.tsx', import.meta.url)
  );
  const markup = renderToStaticMarkup(
    h(
      ProfileProvider,
      {
        initialProfile: {
          displayName: 'Demo',
          unitSystem: 'metric',
          height: 170,
          startWeight: 100,
          goalWeight: 75,
        },
      },
      h(BmiRangeChart, { weights: [{ id: 'demo', dateTime: '2026-11-02T10:00:00Z', weight: 90 }] })
    )
  );
  assert.match(markup, /^<details[^>]*><summary/);
  assert.doesNotMatch(markup, /<details[^>]*\bopen/);
  assert.match(markup, /BMI &amp; health metrics/);
  assert.match(markup, /Current BMI 31.1 · Obesity class 1/);
});
