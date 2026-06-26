// Updates the traceability matrix CSV: every spec (manual TC ID → automation spec) joined with its
// most recent recorded Execution Status from the JSON reports in test-logs/. Tests with no recorded
// run are "Not Run". Manual review columns (Review Status, Reviewer Name) are PRESERVED across runs by
// Manual Test Case ID, so regenerating never wipes hand-entered review data.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { globSync } from 'node:fs';

const repo = process.cwd();
const OUTPUT = 'docs/UATNext_traceability-matrix.csv';

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

// ── 2. Parse reports → latest Execution Status per spec file (by report mtime) ──
const outcomeToStatus = { expected: 'Passed', unexpected: 'Failed', flaky: 'Flaky', skipped: 'Skipped' };

function collectSpecs(suite, file, acc) {
  const f = suite.file || file;
  for (const sp of suite.specs || []) {
    const t = (sp.tests && sp.tests[0]) || {};
    const status = outcomeToStatus[t.status] || (sp.ok ? 'Passed' : 'Failed');
    acc.push({ file: (sp.file || f).replace(/\\/g, '/'), status });
  }
  for (const child of suite.suites || []) collectSpecs(child, f, acc);
}

// Recency is keyed by report file MODIFICATION TIME, not the filename: the project's reporter names
// files `report-${Date.now()}.json`, but Date.now() collides in this environment so the numeric suffix
// is unreliable; the mtime reflects which run actually wrote last.
const latest = new Map(); // basename -> { status, ts }
const reports = existsSync(join(repo, 'test-logs'))
  ? readdirSync(join(repo, 'test-logs')).filter(f => f.endsWith('.json')) : [];
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

// ── 3. Preserve existing manual review columns (Review Status, Reviewer Name) ───
const parseCsvLine = (line) => {
  const out = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
};

const review = new Map(); // manualId -> { reviewStatus, reviewerName }
if (existsSync(join(repo, OUTPUT))) {
  const lines = readFileSync(join(repo, OUTPUT), 'utf8').split(/\r?\n/).filter(Boolean);
  for (const line of lines.slice(1)) {
    const c = parseCsvLine(line);
    if (c[0] && (c[5] || c[6])) review.set(c[0].trim(), { reviewStatus: c[5] ?? '', reviewerName: c[6] ?? '' });
  }
}

// ── 4. Emit CSV ────────────────────────────────────────────────────────────────
const csvCell = s => `"${String(s ?? '').replace(/"/g, '""')}"`;
const header = ['Manual Test Case ID', 'Automation Spec File', 'Module', 'Test Name', 'Execution Status', 'Review Status', 'Reviewer Name'];
const rows = [header.map(csvCell).join(',')];
const counts = {};
for (const it of inventory) {
  const run = latest.get(basename(it.file));
  const status = run ? run.status : 'Not Run';
  const rv = review.get(it.manualId) ?? { reviewStatus: '', reviewerName: '' };
  counts[status] = (counts[status] || 0) + 1;
  rows.push([it.manualId, it.file, it.module, it.name, status, rv.reviewStatus, rv.reviewerName].map(csvCell).join(','));
}

writeFileSync(join(repo, OUTPUT), rows.join('\n') + '\n');
console.log(`Wrote ${OUTPUT} (${inventory.length} tests)`);
console.log('Execution Status breakdown:', counts);
