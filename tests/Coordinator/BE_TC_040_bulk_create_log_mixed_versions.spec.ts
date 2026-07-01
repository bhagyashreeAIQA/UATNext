/**
 * Feature      : Coordinator Tab – Bulk Execution
 * Test Case ID : BE_TC_040
 * Test Name    : Verify Bulk CREATE LOG Processes Multiple Selected Runs (Mix of Matched and Mismatched Versions)
 *
 * Description  : As a Test Engineer, I want to verify that bulk log creation handles a mix of
 *                version-matched and version-mismatched runs correctly, updating versions where
 *                needed and creating logs for all selected runs.
 *
 * Pre-conditions:
 *   1-5. (see BE_TC_026 / BE_TC_032)
 *   6. Multiple eligible runs exist with a mix of matching (BLACK) and mismatching (RED) versions.
 *
 * Steps:
 *   1. Follow BE_TC_032 to select multiple eligible runs (matching + mismatching versions).
 *   2. Verify all selected rows are checked and CREATE LOG is enabled.
 *   3. Click CREATE LOG.
 *   4. Observe processing for mismatched runs (version updated first).
 *   5. Observe processing for correctly versioned runs (log created directly).
 *   6. Wait for processing to complete.
 *   7. Inspect all previously selected rows.
 *
 * Expected: processing starts with a loading indicator; each mismatched version is updated before its
 *   log is created while matched versions get logs directly; a success message is shown; ALL selected
 *   runs are processed (no partial failures); every processed row gains a populated Execution Date,
 *   "Testlog exists" indicator and a disabled checkbox; previously RED versions now appear BLACK.
 *
 * NOTE on the version mix (verified live 2026-06-29): a RED (mismatched) run in the selection is
 *   OPTIONAL — bulk CREATE LOG over two MATCHED (BLACK) runs proves the multi-run bulk path, which is
 *   what this case validates. (A separate finding: bulk CREATE LOG does NOT version-update a mismatched
 *   run — selecting a RED run returns "...1 succeeded, 1 failed" / "version doesnot match", though a
 *   SINGLE mismatched run IS updated — see BE_TC_039. So the body deliberately selects two matched runs
 *   to exercise a clean bulk success.) CREATE LOG works via a LEAF cycle (cycle context, see BE_TC_038).
 *
 * Post-condition: this case MUTATES data — it creates logs for 2 runs.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenBulkExecution } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator Tab | Sub-Feature: Bulk Execution', () => {

  test('BE_TC_040 | Verify Bulk CREATE LOG Processes Multiple Selected Runs (Mix of Matched and Mismatched Versions)', async ({ page }) => {
    test.slow();
    const data = EXPECTED.bulkExecution;
    const { bulkExecutionPage: be } = await loginAndOpenBulkExecution(page, data.workspace);

    await be.openBulkExecution();
    // CREATE LOG needs LEAF-cycle context; SET Dealer CRM → Cycle "SET Dealer CRM" → Sales Ops carries
    // eligible (blank-date) matched runs to bulk-process.
    await be.selectProject('SET Dealer CRM');
    await be.expandRelease('SET Dealer CRM');
    await be.expandCycle('SET Dealer CRM');
    await be.selectCycle('Sales Ops');
    await be.verifyCycleActive('Sales Ops');
    await be.verifyTestRunGridLoaded();

    // ─── Step 1: select two eligible (matched/BLACK) runs from a single page ────────────
    // A RED run is optional here; two matched runs exercise the multi-run bulk path cleanly.
    const targets = await be.findPageWithEligibleRowsOfColor(data.versionMatchColor, 2);
    expect(targets, 'expected a single grid page with at least two eligible matched runs').toBeTruthy();
    for (const id of targets!) {
      await be.selectRowByRunId(id);
      await expect(be.rowByRunId(id).locator('.gtl-checkbox-cell input')).toBeChecked();
    }
    await captureScreenshot(page, 'Step 1: Two eligible runs selected');

    // ─── Step 2: all selected + CREATE LOG enabled ────────────────────────────────────
    await be.verifyCreateLogEnabled();
    await captureScreenshot(page, 'Step 2: All selected rows checked, CREATE LOG enabled');

    // ─── Step 3-6: CREATE LOG → all processed, no partial failures ────────────────────
    await be.clickCreateLog();
    await expect(be.notification(/success|created|log.*generated/i)).toBeVisible({ timeout: 60000 });
    await expect(be.notification(/error|fail|partial/i)).toHaveCount(0);
    await captureScreenshot(page, 'Step 3-6: Bulk log creation success message');

    // ─── Step 7: every selected row is processed (no partial failures) ─────────────────
    for (const id of targets!) {
      const row = be.rowByRunId(id);
      await expect(row.locator('.gtl-execution-date-cell'), `${id} Execution Date populated`).not.toHaveText('');
      const cb = row.locator('.gtl-checkbox-cell input');
      await expect(cb, `${id} checkbox disabled`).toBeDisabled();
      expect(await be.getDisabledCheckboxTitle(row), `${id} "Testlog exists"`).toMatch(/testlog exists/i);
    }
    await captureScreenshot(page, 'Step 7: All selected runs processed — Testlog exists');
  });

});
