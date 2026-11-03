import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './renderComponent.mjs';

const { PageHeader } = loadComponent(new URL('../PageHeader.tsx', import.meta.url));
const { HistoryCard, HistoryCardHeader, HistoryGroup, HistoryEmptyState, HistoryDeleteButton } =
  loadComponent(new URL('../historyCard.tsx', import.meta.url));

test('page header keeps one title and supports copy, metadata and an action', () => {
  const markup = renderToStaticMarkup(
    h(PageHeader, {
      title: 'Your weight',
      eyebrow: 'Your progress',
      description: 'Track your measurements.',
      actionMeta: 'Today · 3 Nov 2026',
      action: h('button', { type: 'button' }, 'Add weight'),
    })
  );
  assert.equal((markup.match(/<h1/g) ?? []).length, 1);
  assert.match(markup, /Your weight<\/h1>/);
  assert.match(markup, /Today · 3 Nov 2026/);
  assert.match(markup, /<button type="button">Add weight<\/button>/);
  const minimal = renderToStaticMarkup(h(PageHeader, { title: 'Your profile' }));
  assert.doesNotMatch(minimal, /page-header__action|page-header__description/);
  assert.match(
    renderToStaticMarkup(h(PageHeader, { title: 'Your profile', actionMeta: 'Account' })),
    /Account/
  );
});

test('history composition preserves month headings, records, summaries and actions', () => {
  const markup = renderToStaticMarkup(
    h(
      HistoryCard,
      null,
      h(HistoryCardHeader, { title: 'Measurements', summary: '2 measurements' }),
      h(HistoryGroup, { label: 'November 2026' }, h('li', null, '90 kg'), h('li', null, '89 kg'))
    )
  );
  assert.match(markup, /<h2[^>]*>Measurements<\/h2>/);
  assert.match(markup, /2 measurements/);
  assert.match(markup, /<h3[^>]*>November 2026<\/h3><ul[^>]*><li>90 kg<\/li><li>89 kg<\/li>/);
});

test('empty history supports the existing feature accent and meaningful text', () => {
  const markup = renderToStaticMarkup(
    h(
      HistoryEmptyState,
      {
        tone: 'accent',
        icon: h('span', null, 'icon'),
      },
      'No measurements recorded yet'
    )
  );
  assert.match(markup, /history-card__empty-icon--accent/);
  assert.match(markup, /aria-hidden="true"/);
  assert.match(markup, /No measurements recorded yet/);
});

test('delete controls have a record-specific accessible label and invoke the supplied handler', () => {
  let clicks = 0;
  const button = HistoryDeleteButton({
    label: 'Delete shot from 3 Nov 2026',
    onClick: () => {
      clicks += 1;
    },
  });
  assert.equal(button.props.type, 'button');
  assert.equal(button.props['aria-label'], 'Delete shot from 3 Nov 2026');
  button.props.onClick();
  assert.equal(clicks, 1);
});
