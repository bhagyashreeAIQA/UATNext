/**
 * Codemod: insert a labelled `captureScreenshot(page, 'Step N: …')` at the end of every
 * `// ─── Step N` block in each spec, plus the import. Purely additive — existing logic is
 * untouched. Idempotent: skips files that already import the helper.
 *
 * Run:  node scripts/add-step-screenshots.mjs           (apply)
 *       node scripts/add-step-screenshots.mjs --dry      (report only)
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const TESTS_DIR = path.join(ROOT, 'tests');
const DRY = process.argv.includes('--dry');

// Two step-comment styles exist in this suite:
//  (A) box-drawing section header: `// ─── <label> ───`  (decorative run uses ─ U+2500)
//  (B) plain step note:            `// Step(s) N: <label>`  (no box chars)
// A file is matched in box mode if it has any box header; otherwise plain mode. ASCII hyphens in
// labels (e.g. "Steps 3-4", "Assigned-to-me") are preserved — only trailing ─ runs are trimmed.
const BOX_RE   = /^(\s*)\/\/\s*─{2,}\s*(.*?)\s*─*\s*$/;
const PLAIN_RE = /^(\s*)\/\/\s*(Steps?\b[:\s].*?)\s*$/;
// `test('name', async ({ page }) => {` — not test.describe / test.fixme (no screenshots there).
// Captures the title (group 2) and the callback params (group 3).
const TEST_START_RE = /\btest\s*\(\s*(['"`])((?:\\.|(?!\1).)*)\1\s*,\s*async\s*\(([^)]*)\)\s*=>\s*\{/;

// Returns the step matcher to use for a file, or null if it has no step comments at all.
function stepMatcherFor(src) {
  const lines = src.split('\n');
  const hasBox = lines.some((l) => { const m = l.match(BOX_RE); return m && m[2].trim() !== ''; });
  if (hasBox) return (line) => { const m = line.match(BOX_RE); return m && m[2].trim() ? { indent: m[1], label: m[2].trim() } : null; };
  const hasPlain = lines.some((l) => PLAIN_RE.test(l));
  if (hasPlain) return (line) => { const m = line.match(PLAIN_RE); return m ? { indent: m[1], label: m[2].trim() } : null; };
  return null;
}

const netBraces = (line) => (line.match(/\{/g)?.length ?? 0) - (line.match(/\}/g)?.length ?? 0);

const pageVarFrom = (params) => (/\bpage\b/.test(params) ? 'page' : null);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}

function addImport(lines) {
  // End of the import block = last import-terminating line before any real code. Handles both
  // single-line `import … from '…';` and the closing `} from '…';` of a multi-line import.
  const FROM_END = /\bfrom\s+['"][^'"]+['"];?\s*$/;
  const SIDE_EFFECT = /^\s*import\s+['"][^'"]+['"];?\s*$/;
  const CODE_START = /^\s*(test\b|const\b|let\b|var\b|function\b|class\b|export\b)/;
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (CODE_START.test(lines[i])) break;
    if (FROM_END.test(lines[i]) || SIDE_EFFECT.test(lines[i])) end = i;
  }
  if (end === -1) return false; // no imports — leave for manual handling
  lines.splice(end + 1, 0, `import { captureScreenshot } from '../../utils/screenshot';`);
  return true;
}

function transform(src, matchStep) {
  const lines = src.split('\n');
  const out = [];
  let inTest = false;
  let depth = 0;
  let pageVar = 'page';
  let title = '';
  let bodyIndent = '    ';
  let steps = []; // { indent, label } seen in the current test
  let inserted = 0;

  const pushCapture = ({ indent, label }) => {
    while (out.length && out[out.length - 1].trim() === '') out.pop(); // attach to prev step's code
    out.push(`${indent}await captureScreenshot(${pageVar}, ${JSON.stringify(label)});`);
    inserted++;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inTest) {
      const m = line.match(TEST_START_RE);
      out.push(line);
      if (m) {
        pageVar = pageVarFrom(m[3]);
        inTest = pageVar !== null; // skip tests with no `page` param
        title = m[2];
        bodyIndent = (line.match(/^\s*/)?.[0] ?? '') + '  ';
        depth = netBraces(line);
        steps = [];
      }
      continue;
    }

    const before = depth;
    depth += netBraces(line);

    // Line that closes the test body: emit the final capture (last step, or the test title when
    // the test has no step structure at all) so every test gets at least one labelled shot.
    if (depth <= 0 && before > 0) {
      const finalShot = steps.length
        ? steps[steps.length - 1]
        : { indent: bodyIndent, label: `Final state — ${title}` };
      pushCapture(finalShot);
      // drop any helper-added trailing blank so the close brace stays tight
      if (out[out.length - 1] === '' && line.trim().startsWith('}')) out.pop();
      out.push(line);
      inTest = false;
      continue;
    }

    const sm = matchStep(line);
    if (sm) {
      if (steps.length) {
        pushCapture(steps[steps.length - 1]);
        out.push('');
      }
      steps.push(sm);
      out.push(line);
      continue;
    }

    out.push(line);
  }

  return { text: out.join('\n'), inserted };
}

const files = walk(TESTS_DIR).filter((f) => !f.endsWith('example.spec.ts'));
let changed = 0, skipped = 0, noImport = [], noSteps = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (src.includes('utils/screenshot')) { skipped++; continue; } // already instrumented
  const matchStep = stepMatcherFor(src);
  if (!matchStep) noSteps.push(file); // still instrumented, but only with a final end-of-test shot

  const { text, inserted } = transform(src, matchStep ?? (() => null));
  if (inserted === 0) { skipped++; continue; } // no `test(... page ...)` body found

  const lines = text.split('\n');
  if (!addImport(lines)) { noImport.push(file); continue; }

  if (!DRY) fs.writeFileSync(file, lines.join('\n'), 'utf8');
  changed++;
  console.log(`${DRY ? '[dry] ' : ''}${path.relative(ROOT, file)}  (+${inserted} shots)`);
}

console.log(`\n${DRY ? 'Would change' : 'Changed'}: ${changed}   skipped: ${skipped}`);
if (noSteps.length) console.log(`\nNo step comments found (${noSteps.length}):\n  ${noSteps.map((f) => path.relative(ROOT, f)).join('\n  ')}`);
if (noImport.length) console.log(`\nNo import anchor (handle manually):\n  ${noImport.map((f) => path.relative(ROOT, f)).join('\n  ')}`);
