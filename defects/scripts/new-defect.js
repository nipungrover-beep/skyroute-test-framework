#!/usr/bin/env node
/**
 * Scaffolds a new defect entry (and, for High/Critical severity, an RCA
 * file from the template). Keeps defects.json and rca/*.md consistent
 * without hand-editing IDs.
 *
 * Usage:
 *   node defects/scripts/new-defect.js \
 *     --title "Sort by price does not re-sort after filter change" \
 *     --severity High \
 *     --linked-test-case TC-RESULTS-001 \
 *     --steps "Search DEL->BOM;Sort by price;Apply nonstop filter" \
 *     --expected "List stays sorted by price after filtering" \
 *     --actual "List reverts to default (unsorted) order" \
 *     --release-found 2026.07-R2
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFECTS_FILE = path.join(ROOT, 'defects', 'defects.json');
const RCA_DIR = path.join(ROOT, 'defects', 'rca');
const RCA_TEMPLATE = path.join(RCA_DIR, '_TEMPLATE.md');

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    args[key] = argv[i + 1];
  }
  return args;
}

function nextId(defects) {
  const nums = defects
    .map((d) => parseInt((d.id || '').replace('DEF-', ''), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `DEF-${String(next).padStart(4, '0')}`;
}

function main() {
  const args = parseArgs();
  if (!args.title || !args.severity) {
    console.error('Required: --title "<title>" --severity <Critical|High|Medium|Low>');
    console.error('Optional: --linked-test-case, --linked-enhancement, --steps (semicolon-separated),');
    console.error('          --expected, --actual, --release-found');
    process.exit(1);
  }

  const defects = JSON.parse(fs.readFileSync(DEFECTS_FILE, 'utf8'));
  const id = nextId(defects);
  const today = new Date().toISOString().slice(0, 10);

  const needsRca = ['Critical', 'High'].includes(args.severity);
  const rcaRef = needsRca ? `defects/rca/${id}-rca.md` : null;

  const entry = {
    id,
    title: args.title,
    severity: args.severity,
    status: 'Open',
    linked_test_case: args.linkedTestCase || null,
    linked_enhancement: args.linkedEnhancement || null,
    release_found: args.releaseFound || 'local',
    release_fixed: null,
    steps_to_reproduce: args.steps ? args.steps.split(';').map((s) => s.trim()) : [],
    expected: args.expected || '',
    actual: args.actual || '',
    date_raised: today,
    date_resolved: null,
    rca_ref: rcaRef,
  };

  defects.push(entry);
  fs.writeFileSync(DEFECTS_FILE, JSON.stringify(defects, null, 2) + '\n');
  console.log(`✔ Added ${id} to defects/defects.json`);

  if (needsRca) {
    const template = fs.readFileSync(RCA_TEMPLATE, 'utf8');
    const rcaContent = template
      .replace(/DEF-XXXX/g, id)
      .replace('<title>', args.title)
      .replace('Critical / High / Medium / Low', args.severity)
      .replace('TC-XXX-XXX', args.linkedTestCase || 'TC-XXX-XXX');
    const rcaPath = path.join(RCA_DIR, `${id}-rca.md`);
    fs.writeFileSync(rcaPath, rcaContent);
    console.log(`✔ Scaffolded RCA at defects/rca/${id}-rca.md (severity ${args.severity} requires RCA)`);
  }
}

main();
