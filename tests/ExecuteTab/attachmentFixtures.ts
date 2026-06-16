/**
 * Helper for the run-level attachment specs (TC-088/090/091/093).
 *
 * The Test Run attachment area rejects a file whose name already exists on the run ("...already
 * exists") — which collides when these mutating specs run in parallel or when a prior run left a
 * persisted file (attachments load asynchronously, so a pre-clean can miss them). Copying each
 * fixture to a uniquely-named temp file means an upload is never a duplicate, so the save always
 * has a real change to report.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

export interface UniqueFixture {
  filePath: string;
  fileName: string;
}

/** Copies `<fixturesDir>/<fixtureName>` to a uniquely-named temp file and returns both paths. */
export function uniqueFixture(fixtureName: string, prefix: string): UniqueFixture {
  const src = path.resolve(__dirname, '../fixtures', fixtureName);
  const ext = path.extname(src);
  const base = path.basename(fixtureName, ext);
  const fileName = `${prefix}_${base}_${Date.now()}_${Math.floor(Math.random() * 1e4)}${ext}`;
  const filePath = path.join(os.tmpdir(), fileName);
  fs.copyFileSync(src, filePath);
  return { filePath, fileName };
}

/** Best-effort removal of a temp fixture copy created by {@link uniqueFixture}. */
export function cleanupFixture(filePath: string): void {
  try { fs.unlinkSync(filePath); } catch { /* ignore */ }
}
