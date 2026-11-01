import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const sourceUrl = new URL('../utils/weightLossMilestones.ts', import.meta.url);
const source = await readFile(sourceUrl, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { generateWeightLossMilestones } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);

const weightEntry = (weight, dateTime = '2026-01-01T12:00:00.000Z') => ({
  id: `weight_${Date.parse(dateTime)}`,
  dateTime,
  weight,
});

const createResult = (loss, startWeight = 100) =>
  generateWeightLossMilestones([weightEntry(startWeight - loss)], startWeight);

const completedThresholds = (result) =>
  result.achievements
    .filter((achievement) => achievement.status === 'completed')
    .map((achievement) => achievement.thresholdKg);

const assertApproximately = (actual, expected) => {
  assert.ok(Math.abs(actual - expected) < 0.000001, `Expected ${actual} to be near ${expected}`);
};

test('generates no completed achievement at 0 kg lost', () => {
  const result = createResult(0);

  assert.deepEqual(completedThresholds(result), []);
  assert.equal(result.nextAchievement?.thresholdKg, 5);
  assert.equal(result.nextAchievement?.progress, 0);
});

test('keeps 4.9 kg below the first achievement threshold', () => {
  const result = createResult(4.9);

  assert.deepEqual(completedThresholds(result), []);
  assert.equal(result.nextAchievement?.thresholdKg, 5);
  assertApproximately(result.nextAchievement?.progress, 98);
  assertApproximately(result.nextAchievement?.remainingKg, 0.1);
});

test('awards thresholds exactly at 5 and 10 kg, but not below them', () => {
  assert.deepEqual(completedThresholds(createResult(5)), [5]);
  assert.deepEqual(completedThresholds(createResult(9.9)), [5]);

  const result = createResult(10);
  assert.deepEqual(completedThresholds(result), [5, 10]);
  assert.equal(result.nextAchievement?.thresholdKg, 15);
});

test('continues dynamically beyond 20 kg and uses each 5 kg interval for progress', () => {
  assert.deepEqual(completedThresholds(createResult(20)), [5, 10, 15, 20]);
  assert.deepEqual(completedThresholds(createResult(24.9)), [5, 10, 15, 20]);
  assert.deepEqual(completedThresholds(createResult(25)), [5, 10, 15, 20, 25]);

  const result = createResult(30.1, 98);
  assert.deepEqual(completedThresholds(result), [5, 10, 15, 20, 25, 30]);
  assert.equal(result.nextAchievement?.thresholdKg, 35);
  assertApproximately(result.nextAchievement?.progress, 2);
  assertApproximately(result.nextAchievement?.remainingKg, 4.9);
});

test('generates achievements above 40 kg without a fixed upper threshold', () => {
  const result = createResult(47.2);

  assert.deepEqual(completedThresholds(result), [5, 10, 15, 20, 25, 30, 35, 40, 45]);
  assert.equal(result.nextAchievement?.thresholdKg, 50);
});

test('keeps historically achieved thresholds completed after regain', () => {
  const result = generateWeightLossMilestones(
    [
      weightEntry(100, '2026-01-01T12:00:00.000Z'),
      weightEntry(75, '2026-01-10T12:00:00.000Z'),
      weightEntry(77, '2026-01-15T12:00:00.000Z'),
    ],
    100
  );
  const twentyFiveKgAchievement = result.achievements.find(
    (achievement) => achievement.thresholdKg === 25
  );

  assert.equal(twentyFiveKgAchievement?.status, 'completed');
  assert.equal(twentyFiveKgAchievement?.achievedAt, '2026-01-10T12:00:00.000Z');
  assert.equal(result.nextAchievement?.thresholdKg, 30);
});

test('returns no weight-loss achievements without a valid start weight or records', () => {
  assert.deepEqual(generateWeightLossMilestones([weightEntry(95)], null), {
    achievements: [],
    nextAchievement: null,
    currentLossKg: null,
  });
  assert.deepEqual(generateWeightLossMilestones([], 100), {
    achievements: [],
    nextAchievement: null,
    currentLossKg: null,
  });
});

test('ignores invalid weight measurements and invalid dates', () => {
  const result = generateWeightLossMilestones(
    [
      weightEntry(Number.NaN),
      weightEntry(0),
      weightEntry(-5),
      weightEntry(50, 'not-a-date'),
      weightEntry(95, '2026-01-01T12:00:00.000Z'),
    ],
    100
  );

  assert.deepEqual(completedThresholds(result), [5]);
  assert.equal(result.currentLossKg, 5);
  assert.equal(result.nextAchievement?.thresholdKg, 10);
});

test('keeps achievement IDs and kilogram thresholds independent of display units', () => {
  const metricResult = createResult(10);
  const imperialResult = createResult(10);

  assert.deepEqual(
    metricResult.achievements.map(({ id, thresholdKg }) => ({ id, thresholdKg })),
    imperialResult.achievements.map(({ id, thresholdKg }) => ({ id, thresholdKg }))
  );
});
