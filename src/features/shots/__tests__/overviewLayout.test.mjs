import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IntlProvider } from 'react-intl';
import { loadComponent } from '../../../shared/components/__tests__/renderComponent.mjs';

const { InjectionSiteStatistics } = loadComponent(
  new URL('../components/injectionSiteStatistics.tsx', import.meta.url)
);
const { InjectionSiteWeightLossStats } = loadComponent(
  new URL('../components/InjectionSiteWeightLossStats.tsx', import.meta.url)
);
const { ShotsPage } = loadComponent(new URL('../ShotsPage.tsx', import.meta.url));
const { getInjectionSiteCounts, getMostUsedInjectionSiteStats } = loadComponent(
  new URL('../utils/shotStatsUtils.ts', import.meta.url)
);
const { buildInjectionPeriods, buildInjectionSiteStats } = loadComponent(
  new URL('../utils/injectionSiteWeightLossUtils.ts', import.meta.url)
);
const { ProfileProvider } = loadComponent(
  new URL('../../profile/ProfileContext.tsx', import.meta.url)
);
const { WeightPage } = loadComponent(new URL('../../weight/WeightPage.tsx', import.meta.url));
const profile = {
  displayName: 'Demo',
  unitSystem: 'metric',
  startWeight: 100,
  goalWeight: 75,
  height: 170,
};
const shot = (day, injectionSite, extras = {}) => ({
  id: `shot-${day}`,
  dateTime: `2026-08-${String(day).padStart(2, '0')}T10:00:00Z`,
  dosage: 2.5,
  injectionSite,
  ...extras,
});
const weight = (day, amount, time = '08') => ({
  id: `weight-${day}`,
  dateTime: `2026-08-${String(day).padStart(2, '0')}T${time}:00:00Z`,
  weight: amount,
});
const shots = [
  shot(1, 'abdomen_left', { sideEffects: ['fatigue'] }),
  shot(8, 'abdomen_left'),
  shot(15, 'abdomen_right'),
  shot(22, 'left_thigh', { notes: 'Sanitized demo note' }),
];
const weights = [
  weight(1, 100),
  weight(7, 99),
  weight(8, 99),
  weight(14, 98),
  weight(15, 98),
  weight(21, 99),
  weight(22, 99),
  weight(28, 98.5),
];
const noop = async () => {};
const render = (Component, props, overrides = {}) =>
  renderToStaticMarkup(
    h(
      IntlProvider,
      { locale: 'en' },
      h(ProfileProvider, { initialProfile: { ...profile, ...overrides } }, h(Component, props))
    )
  );

test('distribution shares the existing most-used-site counts and stable ranking', () => {
  assert.deepEqual(getInjectionSiteCounts(shots), [
    { site: 'abdomen_left', count: 2 },
    { site: 'abdomen_right', count: 1 },
    { site: 'left_thigh', count: 1 },
  ]);
  assert.deepEqual(getMostUsedInjectionSiteStats(shots), {
    value: 'Left abdomen',
    meta: 'Used 2 times',
  });
  assert.deepEqual(getInjectionSiteCounts([]), []);
  assert.deepEqual(getInjectionSiteCounts([{ ...shots[0], injectionSite: undefined }]), []);
  assert.equal(shots.length, 4);
});

test('distribution contains only the always-visible site summary and needs no weight data', () => {
  const markup = render(InjectionSiteStatistics, { shots });
  assert.equal((markup.match(/class="injection-site-distribution__item"/g) ?? []).length, 3);
  assert.doesNotMatch(markup, /<details/);
  assert.match(markup, /width:50%/);
  assert.match(markup, /Used 2 times/);
});

test('compact weight-change details preserve every computed period, total, average and best value', () => {
  const stats = buildInjectionSiteStats(buildInjectionPeriods(shots, weights));
  assert.deepEqual(
    stats.map(({ completedPeriods, totalWeightLoss, averageWeightLoss, bestPeriodLoss }) => [
      completedPeriods,
      totalWeightLoss,
      averageWeightLoss,
      bestPeriodLoss,
    ]),
    [
      [2, 2, 1, 1],
      [1, 0.5, 0.5, 0.5],
      [1, -1, -1, -1],
    ]
  );
  const markup = render(InjectionSiteWeightLossStats, { shots, weights });
  assert.match(markup, /<table>/);
  assert.match(markup, /2.0 kg/);
  assert.match(markup, /1.0 kg/);
  assert.match(markup, /-1.0 kg/);
  assert.match(markup, /Highest average/);
  assert.match(markup, /are descriptive and do not indicate that a site causes weight change/);
});

test('shots overview precedes site distribution and the three-row full-width history', () => {
  const markup = render(ShotsPage, { shots, weights, onShotAdded: noop, onDeleteShot: noop });
  assert.ok(markup.indexOf('shot-overview') < markup.indexOf('injection-site-distribution'));
  assert.ok(
    markup.indexOf('injection-site-distribution') < markup.indexOf('injection-site-weight-change')
  );
  assert.ok(markup.indexOf('injection-site-weight-change') < markup.indexOf('history-card--full'));
  assert.match(
    markup,
    /<\/section><\/div><\/div><details[^>]*class="[^"]*injection-site-weight-change/
  );
  assert.doesNotMatch(markup.match(/<details[^>]*>/)[0], /\bopen(?:[=\s>])/);
  assert.equal((markup.match(/class="history-card__row /g) ?? []).length, 3);
  assert.match(markup, /Show more \(1 remaining\)/);
  assert.match(markup, /1\/4/);
  assert.match(markup, /Most common: Fatigue/);
  assert.match(markup, /1 shot has notes/);
});

test('weight overview precedes the always-visible BMI and the three-row history', () => {
  const markup = render(WeightPage, { weights, onWeightAdded: noop, onDeleteWeight: noop });
  assert.ok(markup.indexOf('weight-overview') < markup.indexOf('bmi-range-card'));
  assert.ok(markup.indexOf('bmi-range-card') < markup.indexOf('history-card--full'));
  assert.equal((markup.match(/class="history-card__row /g) ?? []).length, 3);
  assert.match(markup, /Show more \(5 remaining\)/);
  assert.doesNotMatch(markup, /<details/);
  for (const label of ['Average per week', 'Average per month', 'Journey week', 'Weight entries'])
    assert.ok(markup.includes(label));
});

test('empty histories and missing height/goal have explicit, readable states', () => {
  const shotsMarkup = render(ShotsPage, {
    shots: [],
    weights: [],
    onShotAdded: noop,
    onDeleteShot: noop,
  });
  assert.match(shotsMarkup, /Log an injection with a site/);
  assert.match(shotsMarkup, /No shots recorded yet/);
  assert.match(shotsMarkup, /weight entries before and after/);
  const weightMarkup = render(
    WeightPage,
    { weights, onWeightAdded: noop, onDeleteWeight: noop },
    { height: null }
  );
  assert.match(weightMarkup, /Add your height in profile settings/);
  const noGoal = render(
    WeightPage,
    { weights, onWeightAdded: noop, onDeleteWeight: noop },
    { goalWeight: null }
  );
  assert.doesNotMatch(noGoal, /Goal BMI/);
});
