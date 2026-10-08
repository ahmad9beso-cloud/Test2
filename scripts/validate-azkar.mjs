#!/usr/bin/env node
/** Validates src/data/azkar/*.json: schema, unique ids, known categories. Run: npm run data:azkar */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'src/data/azkar');
const categories = JSON.parse(readFileSync(join(dir, 'categories.json'), 'utf8'));
const items = JSON.parse(readFileSync(join(dir, 'azkar.json'), 'utf8'));

const errors = [];
const catIds = new Set(categories.map((c) => c.id));
const ids = new Set();

for (const it of items) {
  const where = `item "${it.id ?? '?'}"`;
  if (!it.id) errors.push('item without id');
  if (ids.has(it.id)) errors.push(`${where}: duplicate id`);
  ids.add(it.id);
  if (typeof it.text !== 'string' || !it.text.trim()) errors.push(`${where}: missing text`);
  if (!Number.isInteger(it.count) || it.count < 1) errors.push(`${where}: count must be an integer >= 1`);
  if (!Number.isInteger(it.order)) errors.push(`${where}: order must be an integer`);
  if (!Array.isArray(it.categoryIds) || it.categoryIds.length === 0) errors.push(`${where}: categoryIds required`);
  else for (const c of it.categoryIds) if (!catIds.has(c)) errors.push(`${where}: unknown category "${c}"`);
  if (it.evidence && !(it.evidence.text || it.evidence.source)) errors.push(`${where}: evidence needs text or source`);
}

if (errors.length) {
  console.error(errors.map((e) => `✖ ${e}`).join('\n'));
  process.exit(1);
}
const sample = items.filter((i) => String(i.id).startsWith('sample-')).length;
console.log(`✔ ${items.length} azkar valid (${sample} are sample items — remove ids starting with "sample-" when adding the full content)`);
