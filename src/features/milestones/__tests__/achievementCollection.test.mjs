import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../../../shared/components/__tests__/renderComponent.mjs';

const { getFeaturedAchievement, groupAchievements, formatAchievementDate } = loadComponent(
  new URL('../utils/achievementPresentation.ts', import.meta.url)
);
const { buildMilestones, getMilestoneAchievementDates } = loadComponent(
  new URL('../utils/buildMilestones.ts', import.meta.url)
);
const { AchievementCollection } = loadComponent(
  new URL('../components/achievementCollection.tsx', import.meta.url)
);
const { AchievementCard } = loadComponent(
  new URL('../components/achievementCard.tsx', import.meta.url)
);
const { AchievementDetails } = loadComponent(
  new URL('../components/achievementDetails.tsx', import.meta.url)
);
const { MilestonesPage } = loadComponent(new URL('../MilestonesPage.tsx', import.meta.url));
const { ProfileProvider } = loadComponent(
  new URL('../../profile/ProfileContext.tsx', import.meta.url)
);

const milestone = (id, overrides = {}) => ({
  id,
  title: id,
  description: 'Record your progress',
  status: 'locked',
  icon: 'star',
  order: 1,
  ...overrides,
});
const entry = (weight, dateTime) => ({ id: dateTime, weight, dateTime });
const weights = [
  entry(100, '2026-01-01T10:00:00Z'),
  entry(95, '2026-02-01T10:00:00Z'),
  entry(70, '2026-10-31T10:00:00Z'),
  entry(69.9, '2026-11-02T10:00:00Z'),
];
const profile = {
  displayName: 'Demo',
  unitSystem: 'metric',
  height: 170,
  startWeight: 100,
  goalWeight: 65,
};
const renderPage = (unitSystem = 'metric', entries = weights) =>
  renderToStaticMarkup(
    h(
      ProfileProvider,
      { initialProfile: { ...profile, unitSystem } },
      h(MilestonesPage, { profile, weights: entries, shots: [] })
    )
  );

test('features the latest dated unlock instead of status/order sorting', () => {
  const older = milestone('goal-25-percent', {
    status: 'completed',
    achievementDate: '2026-01-01',
    order: 99,
  });
  const newer = milestone('journey-started', {
    status: 'completed',
    achievementDate: '2026-03-01',
  });
  assert.equal(getFeaturedAchievement([older, newer]).id, newer.id);
  assert.equal(getFeaturedAchievement([milestone('locked')]), null);
});

test('simultaneous weight unlocks feature the highest threshold deterministically', () => {
  const items = [
    milestone('weight-loss-25kg', {
      status: 'completed',
      achievementDate: '2026-10-31',
      order: 12,
    }),
    milestone('weight-loss-30kg', {
      status: 'completed',
      achievementDate: '2026-10-31',
      order: 13,
    }),
    milestone('goal-75-percent', { status: 'completed', achievementDate: '2026-10-31', order: 15 }),
  ];
  assert.equal(getFeaturedAchievement(items).id, 'weight-loss-30kg');
});

test('empty achievements show an introductory featured state with no fabricated date', () => {
  const markup = renderToStaticMarkup(
    h(AchievementCollection, { milestones: [], weightMilestones: [], nextAchievement: null })
  );
  assert.match(markup, /Your first achievement awaits/);
  assert.match(markup, /Add a starting weight and a measurement/);
  assert.doesNotMatch(markup, /Achieved \d|Unlocked/);
});

test('completed, upcoming-at-zero and locked badges have readable states and details controls', () => {
  for (const [item, expected] of [
    [milestone('done', { status: 'completed', achievementDate: '2026-10-31' }), 'Unlocked'],
    [milestone('next', { weightLossStatus: 'upcoming', progress: 0 }), 'Up next'],
    [milestone('locked'), 'Locked'],
  ]) {
    const markup = renderToStaticMarkup(
      h(AchievementCard, { milestone: item, onSelect: () => {}, badge: true })
    );
    assert.match(markup, /aria-haspopup="dialog"/);
    assert.ok(markup.includes(expected));
    if (item.status === 'completed') assert.match(markup, /Achieved 31 Oct 2026/);
    if (item.weightLossStatus === 'upcoming') assert.match(markup, /aria-valuenow="0"/);
  }
});

test('achievement grouping preserves every non-weight achievement exactly once', () => {
  const items = [
    milestone('goal-weight'),
    milestone('goal-25-percent'),
    milestone('journey-started'),
    milestone('first-kg'),
    milestone('weight-loss-5kg'),
  ];
  const groups = groupAchievements(items);
  assert.deepEqual(
    groups.goal.map((item) => item.id),
    ['goal-weight', 'goal-25-percent']
  );
  assert.deepEqual(
    groups.journey.map((item) => item.id),
    ['journey-started', 'first-kg']
  );
});

test('historical dates use the unchanged rules and first qualifying recorded entry', () => {
  const params = {
    weights,
    shots: [
      { id: 'shot', dateTime: '2026-01-05T10:00:00Z', dosage: 2.5, injectionSite: 'abdomen_left' },
    ],
    startWeight: 100,
    goalWeight: 65,
    unitSystem: 'metric',
    formatWeight: (value) => `${value} kg`,
  };
  const dates = getMilestoneAchievementDates(params);
  assert.equal(dates.get('journey-started'), '2026-01-05T10:00:00Z');
  assert.equal(dates.get('first-weight-entry'), '2026-01-01T10:00:00Z');
  assert.equal(dates.get('getting-consistent'), '2026-10-31T10:00:00Z');
  assert.equal(dates.get('goal-75-percent'), '2026-10-31T10:00:00Z');
  assert.equal(dates.has('goal-weight'), false);
  assert.equal(
    buildMilestones(params).find((item) => item.id === 'goal-weight').status,
    'inProgress'
  );
});

test('actual page shows the 35 kg next target, 4.9 kg remaining, and 2% interval progress', () => {
  const markup = renderPage();
  assert.match(markup, /35 kg lost/);
  assert.match(markup, /4.9 kg to go/);
  assert.match(markup, /<strong>2%<\/strong>/);
  assert.match(markup, /Achieved 31 October 2026/);
  assert.match(markup, /Goal achievements/);
  assert.match(markup, /Journey achievements/);
  assert.equal((markup.match(/class="achievement-badge achievement-state/g) ?? []).length, 9);
});

test('imperial display preserves kilogram eligibility and converts target/remaining values', () => {
  const markup = renderPage('imperial');
  assert.match(markup, /77.2 lb lost/);
  assert.match(markup, /10.8 lb to go/);
  assert.match(markup, /<strong>2%<\/strong>/);
  assert.equal((markup.match(/class="achievement-badge achievement-state/g) ?? []).length, 9);
});

test('details expose the condition and date with an accessible title and close control', () => {
  const markup = renderToStaticMarkup(
    h(AchievementDetails, {
      milestone: milestone('goal-25-percent', {
        status: 'completed',
        title: 'Quarter way there',
        achievementDate: '2026-10-31',
      }),
      onClose: () => {},
    })
  );
  assert.match(markup, /<dialog[^>]*aria-labelledby="achievement-details-title"/);
  assert.match(markup, /aria-label="Close achievement details"/);
  assert.match(markup, /Reach 25% of the journey/);
  assert.match(markup, /Achieved 31 October 2026/);
  assert.equal(formatAchievementDate('invalid'), null);
});
