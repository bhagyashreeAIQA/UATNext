/**
 * Feature      : Coordinator – Generate Test Log
 * Test Case ID : GTL_TC_006
 * Test Name    : Verify Generate Test Log Displays Last Log and New Log Sections
 *
 * Description  : Generating a test log displays both Last Log and New Log sections in the right panel.
 *
 * Pre-conditions: Logged in; Test Run selected and GENERATE TEST LOG enabled.
 *
 * Steps:
 *   1. Follow GTL_TC_005.
 *   2. Click GENERATE TEST LOG.
 *   3. Validate the Last Log section, columns and data.
 *   4. Validate the New Log section, Status default, SAVE, columns and data.
 *
 * Expected:
 *   1. Last Log section displayed with the 6 columns and a read-only Status.
 *   2. New Log section displayed below with the same columns, SAVE enabled, statuses defaulting to
 *      "Unexecuted" and Actual Result placeholders.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenGenerateTestLog, searchSelectAndGenerate } from './coordinatorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Coordinator | Sub-Feature: Generate Test Log', () => {

  test('GTL_TC_006 | Verify Generate Test Log Displays Last Log and New Log Sections', async ({ page }) => {
    test.slow(); // coordinator nav + qTest search/generate make this flow slower than the 30s default
    const { generateTestLogPage: gtl } = await loginAndOpenGenerateTestLog(page);
    const data = EXPECTED.generateTestLog;

    await searchSelectAndGenerate(gtl, data.validTestCasePid, data.validTestRun);

    // Expected 1: Last Log section + columns + read-only overall Status
    await expect(gtl.lastLogHeading).toBeVisible();
    await expect(gtl.lastLogTable).toBeVisible();
    expect(await gtl.getColumnHeaders('last')).toEqual(data.gridColumns);
    await expect(gtl.lastLogStatus).toHaveAttribute('readonly', /.*/);

    // Expected 2: New Log section below, SAVE enabled, same columns
    await expect(gtl.newLogHeading).toBeVisible();
    await expect(gtl.newLogTable).toBeVisible();
    await expect(gtl.saveButton).toBeVisible();
    await expect(gtl.saveButton).toBeEnabled();
    expect(await gtl.getColumnHeaders('new')).toEqual(data.gridColumns);

    // New Log defaults: every step Status = "Unexecuted"
    const newStatuses = await gtl.getStepStatusValues('new');
    expect(newStatuses.length).toBeGreaterThan(0);
    expect(newStatuses.every(s => s === data.defaultStatus)).toBe(true);

    // New Log overall Status defaults to "Unexecuted"
    expect((await gtl.newLogStatus.inputValue()).trim()).toBe(data.defaultStatus);

    // Actual Result placeholder present on New Log cells
    await expect(gtl.actualResultCells('new').first().locator('em')).toBeVisible();
    await captureScreenshot(page, "Final state — GTL_TC_006 | Verify Generate Test Log Displays Last Log and New Log Sections");
  });

});
