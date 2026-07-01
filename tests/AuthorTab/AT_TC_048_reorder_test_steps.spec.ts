/**
 * Feature      : Author Test Cases Tab
 * Test Case ID : AT_TC_048
 * Test Name    : Verify User Can Move Test Steps Using Up and Down Arrow Actions
 *
 * Description  : As a Test Engineer, I want to validate that test steps can be reordered with the
 *                Up/Down arrows, that step numbers update, and that the arrows are disabled at the
 *                first/last boundaries.
 *
 * Pre-conditions: valid login; logged in; Business Unit "UATNext Dev"; project "Testdata_Module";
 *                 a test case with at least THREE existing test steps.
 *
 * Steps (1-13): open a test case with ≥3 steps → Up/Down arrows visible+enabled on a non-boundary step
 *   → click Up → step moves up + numbers update → first step's Up arrow disabled → click Down on a
 *   movable step → moves down + numbers update → last step's Down arrow disabled.
 *
 * Implementation notes: under epicB/featureB the first requirement's row-0 test case has ≥3 saved
 *   steps. The `.step-number` labels are POSITIONAL (always 1..N) and do NOT change on a reorder, so a
 *   move is detected by the step DESCRIPTIONS' order changing (`getStepDescriptions`), not the numbers.
 *   The N `.move-up`/`.move-down` arrows align 1:1 with the N saved steps (a boundary arrow carries
 *   `.disable` + `aria-disabled`). The reorder is NOT saved (no SAVE click), so the change is transient
 *   and the test is idempotent across runs.
 *
 * Post-condition: read-only — the reorder is not saved, so no data is persisted.
 */

import { test, expect } from '@playwright/test';
import { loginAndOpenAuthorTab } from './authorNavHelpers';
import { EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Author Test Cases Tab | Sub-Feature: Test Step Management – Reorder', () => {

  test('AT_TC_048 | Verify User Can Move Test Steps Using Up and Down Arrow Actions', async ({ page }) => {
    test.setTimeout(180000);
    const data = EXPECTED.author;
    const { authorPage } = await loginAndOpenAuthorTab(page, data.workspace);
    await authorPage.selectProject(data.projectWithRequirements);
    await authorPage.selectEpic(data.epicB);
    await authorPage.waitForTotalEntriesStable();
    await authorPage.selectFeature(data.featureB);
    await authorPage.waitForTotalEntries(data.epicBCount);

    // ─── Step 1-3: open a test case with ≥3 steps ──────────────────────────────────────
    await authorPage.selectRequirementWithLinkedTestCases();
    await authorPage.openTestCaseDetail(0);
    const stepCount = (await authorPage.getStepNumbers()).length;
    expect(stepCount, 'a test case with ≥3 steps').toBeGreaterThanOrEqual(3);

    // ─── Step 4-7: Up/Down arrows on a non-first step → click Up → step order updates ──
    await expect(authorPage.stepMoveUp(1)).toBeVisible();
    await expect(authorPage.stepMoveDown(1)).toBeVisible();
    expect(await authorPage.isStepArrowDisabled(authorPage.stepMoveUp(1)), '2nd step Up enabled').toBe(false);
    const beforeUp = await authorPage.getStepDescriptions();
    await authorPage.moveStepUp(1);
    expect(await authorPage.getStepDescriptions(), 'step order changed after Move Up').not.toEqual(beforeUp);
    // step numbers stay sequential 1..N (they are positional labels, not identities)
    expect(await authorPage.getStepNumbers(), 'numbers stay sequential')
      .toEqual(beforeUp.map((_, i) => String(i + 1)));
    await captureScreenshot(page, 'Step 4-7: Step moved up');

    // ─── Step 8-9: first step's Up arrow disabled (top boundary) ────────────────────────
    expect(await authorPage.isStepArrowDisabled(authorPage.stepMoveUp(0)), 'first step Up disabled').toBe(true);
    await captureScreenshot(page, 'Step 8-9: First step Up arrow disabled');

    // ─── Step 10-11: click Down on a movable step → step order updates ──────────────────
    const beforeDown = await authorPage.getStepDescriptions();
    await authorPage.moveStepDown(0);
    expect(await authorPage.getStepDescriptions(), 'step order changed after Move Down').not.toEqual(beforeDown);
    await captureScreenshot(page, 'Step 10-11: Step moved down');

    // ─── Step 12-13: last step's Down arrow disabled (bottom boundary) ──────────────────
    const last = (await authorPage.getStepNumbers()).length - 1;
    expect(await authorPage.isStepArrowDisabled(authorPage.stepMoveDown(last)), 'last step Down disabled').toBe(true);
    await captureScreenshot(page, 'Step 12-13: Last step Down arrow disabled');
  });

});
