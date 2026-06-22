/**
 * One-off fixer: relocate the `captureScreenshot` import to the correct position (after the full
 * import block). The original codemod inserted it after the last line *starting* with `import`,
 * which lands inside a trailing multi-line `import { … } from '…'` block. Idempotent.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const IMPORT_LINE = `import { captureScreenshot } from '../../utils/screenshot';`;
const FROM_END = /\bfrom\s+['"][^'"]+['"];?\s*$/;        // `… from '…';`  and  `} from '…';`
const SIDE_EFFECT = /^\s*import\s+['"][^'"]+['"];?\s*$/;  // `import '…';`
const CODE_START = /^\s*(test\b|const\b|let\b|var\b|function\b|class\b|export\b)/;

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(f));
    else if (e.name.endsWith('.spec.ts')) out.push(f);
  }
  return out;
}

let fixed = 0;
for (const file of walk(path.join(ROOT, 'tests'))) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  if (!lines.some((l) => l.trim() === IMPORT_LINE.trim())) continue;

  // Strip every existing occurrence of the import line.
  lines = lines.filter((l) => l.trim() !== IMPORT_LINE.trim());

  // Find the end of the import block: last import-terminating line before any real code.
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (CODE_START.test(lines[i])) break;
    if (FROM_END.test(lines[i]) || SIDE_EFFECT.test(lines[i])) end = i;
  }
  if (end === -1) { console.warn(`! no import anchor: ${path.relative(ROOT, file)}`); continue; }

  lines.splice(end + 1, 0, IMPORT_LINE);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  fixed++;
}
console.log(`Relocated import in ${fixed} files.`);
