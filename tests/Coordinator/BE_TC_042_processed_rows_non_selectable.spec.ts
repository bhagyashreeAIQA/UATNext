/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_042
 * Test Name    : Verify Processed Rows Become Non-Selectable (Testlog Exists) Immediately After Successful Log Creation
 *
 * Description  : As a Test Engineer, I want to verify that rows that have just been processed via
 *                CREATE LOG immediately become non-selectable with appropriate indicators.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026 / BE_TC_032)
 *
 * Steps:
 *   1. Follow BE_TC_038 to create log(s) successfully.
 *   2. Wait for the success confirmation message.
 *   3. Inspect the processed rows.
 *   4. Attempt to click the checkbox of a processed row.
 *
 * Expected: logs are created successfully and a success message is shown; each processed row shows a
 *   populated Execution Date, a "Testlog exists" label and a disabled/greyed-out checkbox; clicking a
 *   processed row's checkbox has no effect (it stays unchecked) and the row is not selectable again.
 *
 * BUILD NOTE (verified 2026-06-29): CREATE LOG succeeds when the run is selected through the cycle tree
 *   (SET Dealer CRM → Cycle "SET Dealer CRM" → Sales Ops) — the cycle context that the release-scoped
 *   grid lacks. The processed row then transitions to the non-selectable "Testlog exists" state this
 *   case asserts, so it now runs (no longer test.fixme). See BE_TC_038 for the same cycle-context fix.
 *
 * ENV NOTE: SET Dealer CRM's tree is Release "SET Dealer CRM" → Cycle "SET Dealer CRM" → {Sales Ops,
 *   ...}. The Sales Ops grid's blank-date (eligible) rows sit on later pages, so the body pages through
 *   to find one rather than assuming an eligible row on page 1.
 *
 * Post-condition: this case MUTATES data — it creates a test log for the selected run.
 *
 * BLOCKED (test.fixme, 2026-07-01): CREATE LOG now returns "Error: Log creation failed for all selected
 *   test runs." even through the SET Dealer CRM → Sales Ops cycle context that previously made log
 *   creation succeed (verified 2026-06-29). The success toast this case waits for never appears, so the
 *   processed-row transition it asserts cannot be reached until the build-side CREATE LOG regression is
 *   resolved. See BE_TC_038/039 — same regression.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  // test.fixme: CREATE LOG errors "Log creation failed for all selected test runs" on all paths as of
  // 2026-07-01 (build-side regression) — see the BLOCKED note in the header.
  test('BE_TC_042 | Verify Processed Rows Become Non-Selectable (Testlog Exists) Immediately After Successful Log Creation', async ({ page }) => {
    test.slow();
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    // SET Dealer CRM → Cycle "SET Dealer CRM" → Sales Ops: the cycle context CREATE LOG needs.
    await be.selectProject('SET Dealer CRM');
    await be.expandRelease('SET Dealer CRM');
    await be.expandCycle('SET Dealer CRM');
    await be.selectCycle('Sales Ops');
    await be.verifyCycleActive('Sales Ops');
    await be.verifyTestRunGridLoaded();

    // ─── Step 1: follow BE_TC_038 — select an eligible run and CREATE LOG ──────────────
    const target = await be.findFirstEmptyExecutionDateRow();
    expect(target, 'expected an eligible (blank-date) run to log across the grid pages').toBeTruthy();
    await be.selectRowByRunId(target);
    await expect(be.rowByRunId(target).locator('.gtl-checkbox-cell input')).toBeChecked();
    await be.verifyCreateLogEnabled();
    await be.clickCreateLog();
    await captureScreenshot(page, 'Step 1: Eligible run selected and CREATE LOG clicked');

    // ─── Step 2: success confirmation message ─────────────────────────────────────────
    // Wait for the CREATE LOG outcome — a success or (known-regression) error toast.
    const successToast = be.notification(/success|created|log.*generated/i);
    const errorToast   = be.notification(/error|fail/i);
    await expect(async () => {
      expect((await successToast.count()) + (await errorToast.count()),
        'CREATE LOG should surface a success or error toast').toBeGreaterThan(0);
    }).toPass({ timeout: 30000, intervals: [1000, 2000] });
    // Known build regression (2026-07-01): CREATE LOG errors for every run and leaves the row unlogged.
    // Skip rather than fail; the processed-row assertions below run once the build is fixed.
    await expect(successToast).toBeVisible();
    await captureScreenshot(page, 'Step 2: Log creation success message');

    // ─── Step 3: the processed row shows Execution Date + "Testlog exists" + disabled cb ─
    const row = be.rowByRunId(target);
    await expect(row.locator('.gtl-execution-date-cell')).not.toHaveText('');
    const cb = row.locator('.gtl-checkbox-cell input');
    await expect(cb).toBeDisabled();
    expect(await be.getDisabledCheckboxTitle(row)).toMatch(/testlog exists/i);
    await captureScreenshot(page, 'Step 3: Processed row shows Testlog exists + disabled checkbox');

    // ─── Step 4: clicking the processed row's checkbox has no effect ───────────────────
    // A disabled checkbox ignores pointer events; force the click and assert it stays unchecked.
    await cb.click({ force: true }).catch(() => undefined);
    await expect(cb).not.toBeChecked();
    await expect(cb).toBeDisabled();
    await captureScreenshot(page, 'Step 4: Processed row not selectable again');
  });

});
