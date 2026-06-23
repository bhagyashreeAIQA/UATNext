// Builds a traceability matrix CSV: every spec (manual TC ID → automation spec) joined with the most
// recent recorded run status from the JSON reports in test-logs/. Tests with no recorded run are
// "Not Run". A separate Skipped flag marks tests whose last run was skipped (e.g. runtime test.skip).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { globSync } from 'node:fs';

const repo = process.cwd();

// ── 1. Inventory: all spec files with their docblock manual ID + name ──────────
const specFiles = globSync('tests/**/*.spec.ts', { cwd: repo })
  .map(p => p.replace(/\\/g, '/'))
  .filter(p => basename(p) !== 'example.spec.ts')
  .sort();

const field = (txt, label) => {
  const m = txt.match(new RegExp(`Test ${label}\\s*:\\s*(.+)`));
  return m ? m[1].trim() : '';
};

const inventory = specFiles.map(file => {
  const txt = readFileSync(join(repo, file), 'utf8');
  return {
    manualId: field(txt, 'Case ID'),
    name: field(txt, 'Name'),
    module: file.split('/')[1],
    file,
  };
});

// ── 2. Parse reports → latest status per spec file (by report timestamp) ───────
const outcomeToStatus = { expected: 'Passed', unexpected: 'Failed', flaky: 'Flaky', skipped: 'Skipped' };

function collectSpecs(suite, file, acc) {
  const f = suite.file || file;
  for (const sp of suite.specs || []) {
    const t = (sp.tests && sp.tests[0]) || {};
    const status = outcomeToStatus[t.status] || (sp.ok ? 'Passed' : 'Failed');
    acc.push({ file: (sp.file || f).replace(/\\/g, '/'), title: sp.title, status });
  }
  for (const child of suite.suites || []) collectSpecs(child, f, acc);
}

// Recency is keyed by the report file's MODIFICATION TIME, not the filename. The project's reporter
// names files `report-${Date.now()}.json`, but Date.now() collides in this environment so the numeric
// suffix is unreliable; the file mtime reflects which run actually wrote last.
const latest = new Map(); // basename -> { status, ts }
const reports = readdirSync(join(repo, 'test-logs')).filter(f => f.endsWith('.json'));
for (const r of reports) {
  const full = join(repo, 'test-logs', r);
  let json;
  try { json = JSON.parse(readFileSync(full, 'utf8')); } catch { continue; }
  const ts = statSync(full).mtimeMs;
  const acc = [];
  for (const s of json.suites || []) collectSpecs(s, undefined, acc);
  for (const e of acc) {
    const key = basename(e.file);
    const prev = latest.get(key);
    if (!prev || ts > prev.ts) latest.set(key, { status: e.status, ts });
  }
}

const fmtDate = ms => Number.isFinite(ms) ? new Date(ms).toISOString().slice(0, 19).replace('T', ' ') : '';

// ── 3. Join + emit CSV ─────────────────────────────────────────────────────────
const csvCell = s => `"${String(s).replace(/"/g, '""')}"`;
const rows = [['Manual Test Case ID', 'Automation Spec File', 'Module', 'Test Name', 'Last Run Status', 'Skipped', 'Last Run (UTC)']];
const counts = {};
for (const it of inventory) {
  const run = latest.get(basename(it.file));
  const status = run ? run.status : 'Not Run';
  const skipped = status === 'Skipped' ? 'YES' : '';
  counts[status] = (counts[status] || 0) + 1;
  rows.push([it.manualId, it.file, it.module, it.name, status, skipped, run ? fmtDate(run.ts) : '']
    .map(csvCell).join(','));
}

writeFileSync(join(repo, 'docs/traceability-matrix.csv'), rows.map(r => Array.isArray(r) ? r.map(csvCell).join(',') : r).join('\n') + '\n');
console.log(`Wrote docs/traceability-matrix.csv (${inventory.length} tests)`);
console.log('Status breakdown:', counts);
