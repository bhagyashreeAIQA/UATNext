/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_007
 * Test Name    : Verify Last Log Section Displays Most Recent Execution Data Correctly
 *
 * Description  : The Last Log section shows the most recently saved execution data in read-only mode.
 *
 * Pre-conditions: Logged in; right panel shows both Last Log and New Log (a previously-saved run).
 *
 * Steps:
 *   1. Follow GTL_TC_006.
 *   2-5. Validate the Last Log heading, Status, each row and that Actual Result is not editable.
 *
 * Expected:
 *   1. Last Log heading visible; overall Status read-only.
 *   2. Rows display the 6 columns.
 *   3. Actual Result fields are read-only (rendered as a view-only rich editor, no input control).
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog, searchSelectAndGenerate } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_007 | Verify Last Log Section Displays Most Recent Execution Data Correctly', async ({ page }) => {
    test.slow(); // coordinator nav + qTest search/generate make this flow slower than the 30s default
    const data = EXPECTED.generateTestLog;
    // The qConnect sample project's test cases lost their step rows; use the multi-step TC-26300 in
    // the UATNext Dev workspace — its run TR-1681 carries a saved Last Log to inspect.
    const ws = data.withSteps;
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page, ws.workspace);

    await searchSelectAndGenerate(gtl, ws.pid, ws.executedRun);
    // Last Log step rows stream in a beat after the table mounts — wait before reading its data.
    await gtl.waitForSteps('last');

    // Expected 1: heading + read-only overall Status
    await expect(gtl.lastLogHeading).toBeVisible();
    await expect(gtl.lastLogStatus).toHaveAttribute('readonly', /.*/);
    expect((await gtl.lastLogStatus.inputValue()).trim()).not.toBe('');

    // Expected 2: rows present with the documented columns
    expect(await gtl.getColumnHeaders('last')).toEqual(data.gridColumns);
    expect(await gtl.getStepCount('last')).toBeGreaterThan(0);

    // Each Last Log step Status is read-only / disabled
    const statuses = gtl.stepStatusInputs('last');
    const n = await statuses.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      await expect(statuses.nth(i)).toBeDisabled();
    }

    // Expected 3: Actual Result rendered view-only (no editable input/textarea in the cell)
    const firstActual = gtl.actualResultCells('last').first();
    await expect(firstActual.locator('.rich-editor-viewonly')).toBeVisible();
    expect(await firstActual.locator('input, textarea').count()).toBe(0);
    await captureScreenshot(page, "Final state — GTL_TC_007 | Verify Last Log Section Displays Most Recent Execution Data Correctly");
  });

});
