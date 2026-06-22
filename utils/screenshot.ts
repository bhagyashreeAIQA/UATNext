import { Page, test, TestInfo } from '@playwright/test';
import path from 'path';

/**
 * Reusable per-step screenshot helper.
 *
 * Drop a call at the end of each step block to capture proof of that step. Screenshots are
 * auto-numbered (01, 02, 03 …) per test, written into that test's own output folder
 * (`test-results/<test>/screenshots/`), and attached to the HTML report so they render inline
 * next to the test. This is independent of the config's `screenshot: 'on'` (which only captures
 * once at the end of each test) — use this when you want a labelled shot at a specific moment.
 *
 * @example
 *   // ─── Step 3: Click the View All radio button ───────────────────────────────
 *   await executeTabPage.selectViewAllAndWaitForRefresh(total);
 *   await captureScreenshot(page, 'View All selected');
 *
 * @param page    The Playwright page to capture.
 * @param label   Human-readable description of the step (used in the filename + report).
 * @param options.fullPage  Capture the entire scrollable page rather than just the viewport.
 */
export async function captureScreenshot(
  page: Page,
  label: string,
  options: { fullPage?: boolean } = {},
): Promise<void> {
  const info = test.info();

  // Maintain a per-test step counter on the TestInfo object so each call increments naturally
  // without the caller passing an index. (Counter resets automatically for every new test.)
  const counter = ((info as TestInfo & { _screenshotStep?: number })._screenshotStep ?? 0) + 1;
  (info as TestInfo & { _screenshotStep?: number })._screenshotStep = counter;

  const step = String(counter).padStart(2, '0');
  const safeLabel = label.trim().replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase();
  const fileName = `${step}_${safeLabel || 'step'}.png`;
  const filePath = path.join(info.outputDir, 'screenshots', fileName);

  const buffer = await page.screenshot({ path: filePath, fullPage: options.fullPage ?? false });

  // Attach to the report so the shot renders inline under the test result.
  await info.attach(`Step ${step}: ${label}`, { body: buffer, contentType: 'image/png' });
}

/**
 * Wraps a step body in a named `test.step()` and auto-captures a screenshot after it runs.
 *
 * Use this instead of a bare comment block when you want the step to appear as a labelled node
 * in the trace/report AND get its screenshot for free — one wrapper per step, no separate
 * `captureScreenshot` call. The screenshot is taken once `body` resolves (i.e. the step's
 * assertions/actions have completed), labelled with the step `name`.
 *
 * @example
 *   await stepScreenshot(page, 'Step 3: Click the View All radio button', async () => {
 *     await executeTabPage.selectViewAllAndWaitForRefresh(total);
 *     expect(await executeTabPage.getTotalEntriesText()).not.toBe(total);
 *   });
 *
 * @param page     The Playwright page to capture after the step.
 * @param name     Step name — shown in the report/trace and used for the screenshot label.
 * @param body     The step's actions and assertions.
 * @param options.fullPage  Capture the entire scrollable page rather than just the viewport.
 * @returns Whatever `body` returns, so you can chain values out of the step.
 */
export async function stepScreenshot<T>(
  page: Page,
  name: string,
  body: () => Promise<T>,
  options: { fullPage?: boolean } = {},
): Promise<T> {
  return test.step(name, async () => {
    const result = await body();
    await captureScreenshot(page, name, options);
    return result;
  });
}
