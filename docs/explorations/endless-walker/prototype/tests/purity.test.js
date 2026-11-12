import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const dir = (d) => readdirSync(new URL(`../src/${d}/`, import.meta.url)).filter(f => f.endsWith('.js'));
const src = (d, f) => readFileSync(new URL(`../src/${d}/${f}`, import.meta.url), 'utf8');

test('load appears only in the stamina rule', () => {
  for (const f of dir('rules')) if (f !== 'stamina.js') assert.ok(!/\bload\b/.test(src('rules', f)), f);
});

test('rules import nothing from three or the CDN', () => {
  for (const f of dir('rules')) assert.ok(!/from ['"](three|lil-gui|http)/.test(src('rules', f)), f);
});

test('feedback never assigns to state', () => {
  for (const f of dir('feedback')) assert.ok(!/\bstate\.[\w.]+\s*([-+*/]?=)(?!=)/.test(src('feedback', f)), f);
});
