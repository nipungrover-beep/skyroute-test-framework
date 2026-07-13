#!/usr/bin/env node
/**
 * Validates the test case registry (test-management/test-cases/*.yaml)
 * against the actual Playwright spec files.
 *
 * Catches the most common form of registry drift: someone renames/removes a
 * test but forgets to update the registry, or adds a registry entry before
 * writing the test and forgets to circle back. Run via `npm run
 * validate:test-registry`; wired into CI so drift fails the build (see
 * .github/workflows/regression.yml).
 *
 * Exit code 0 = clean, 1 = problems found.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..', '..');
const REGISTRY_DIR = path.join(ROOT, 'test-management', 'test-cases');

function loadRegistryEntries() {
  const files = fs.readdirSync(REGISTRY_DIR).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  const entries = [];
  for (const file of files) {
    const full = path.join(REGISTRY_DIR, file);
    const parsed = yaml.load(fs.readFileSync(full, 'utf8')) || [];
    for (const entry of parsed) {
      entries.push({ ...entry, __file: file });
    }
  }
  return entries;
}

function specFileHasTitle(specRelPath, title) {
  const specFull = path.join(ROOT, specRelPath);
  if (!fs.existsSync(specFull)) return { fileExists: false, titleFound: false };
  const contents = fs.readFileSync(specFull, 'utf8');
  // Matches both `test('title', ...)` and `test('title', { tag: [...] }, ...)`.
  const titleFound = contents.includes(`'${title}'`) || contents.includes(`"${title}"`);
  return { fileExists: true, titleFound };
}

function main() {
  const entries = loadRegistryEntries();
  const problems = [];
  const seenIds = new Map();

  for (const entry of entries) {
    if (!entry.id) {
      problems.push(`[${entry.__file}] entry missing "id" field: ${JSON.stringify(entry)}`);
      continue;
    }
    if (seenIds.has(entry.id)) {
      problems.push(`Duplicate test case id "${entry.id}" in ${entry.__file} and ${seenIds.get(entry.id)}`);
    }
    seenIds.set(entry.id, entry.__file);

    if (!entry.automated) continue; // manual/pending cases have no spec to check
    if (!entry.test_ref) {
      problems.push(`[${entry.id}] automated: true but no test_ref set`);
      continue;
    }

    const [specPath, , title] = entry.test_ref.split('::');
    if (!specPath || !title) {
      problems.push(`[${entry.id}] test_ref is malformed, expected "path::describe::title": ${entry.test_ref}`);
      continue;
    }

    const { fileExists, titleFound } = specFileHasTitle(specPath, title);
    if (!fileExists) {
      problems.push(`[${entry.id}] test_ref points to a spec file that doesn't exist: ${specPath}`);
    } else if (!titleFound) {
      problems.push(
        `[${entry.id}] test title not found in ${specPath} — the test may have been renamed/removed. Registry says: "${title}"`
      );
    }
  }

  if (problems.length === 0) {
    console.log(`✔ Test case registry OK — ${entries.length} entries checked, no drift found.`);
    process.exit(0);
  }

  console.error(`✘ Test case registry has ${problems.length} problem(s):\n`);
  problems.forEach((p) => console.error(`  - ${p}`));
  console.error('\nUpdate the registry entry or the spec file so they match. See test-management/README.md.');
  process.exit(1);
}

main();
