/**
 * Feature      : Execute Test Case
 * Sub-Feature  : Workspace
 * Test Case ID : TC-002
 * Test Name    : Verify Workspace can be changed using the dropdown options
 *
 * Description  : As a Test Engineer, I want to verify that the Workspace field is
 *                automatically populated with the value synced from qTest, and I am
 *                able to change that using the dropdown options.
 *
 * Pre-conditions:
 *   1. User has valid login credentials.
 *   2. User is logged into the UATNext application.
 *   3. User has access to qTest.
 *
 * Dependencies : TC-001 pre-conditions must hold (Workspace is auto-filled on load).
 *
 * Note: pinned to the "UATNext Dev" Environment, same as TC-001 — see that spec's header
 *       note.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { ExecuteTabPage } from '../../pages/ExecuteTab/ExecuteTabPage';
import { CREDENTIALS, URLS, EXPECTED } from '../../utils/testData';
import { captureScreenshot } from '../../utils/screenshot';

test.describe('Feature: Execute Test Case | Sub-Feature: Workspace', () => {

  test('TC-002 | Verify Workspace can be changed using the dropdown options', async ({ page }) => {
    const loginPage      = new LoginPage(page);
    const homePage       = new HomePage(page);
    const executeTabPage = new ExecuteTabPage(page);

    // ─── Pre-condition: TC-001 steps (login + navigate + auto-fill verified) ──

    await loginPage.goto(URLS.base);
    if (loginPage.isOnLoginPage()) {
      await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
    }
    await homePage.waitForPageLoad();
    await homePage.navigateToExecuteTab();
    await executeTabPage.waitForSidebarLoad();
    await executeTabPage.switchEnvironment('UATNext Dev'); // pin baseline Environment (see header note)
    await captureScreenshot(page, "Pre-condition: TC-001 steps (login + navigate + auto-fill verified)");

    // ─── Step 1: Workspace field is auto-filled with qTest synced value ───────
    // Expected: Workspace field should be auto-filled with qTest synced value

    await executeTabPage.verifyWorkspaceAutoFilled(EXPECTED.workspaceValue);
    const initialWorkspace = await executeTabPage.getWorkspaceValue();
    await captureScreenshot(page, "Step 1: Workspace field is auto-filled with qTest synced value");

    // ─── Step 2: Click on the dropdown ───────────────────────────────────────
    // Expected: Available workspace names are displayed in the dropdown options

    await executeTabPage.openWorkspaceDropdown();
    await executeTabPage.verifyDropdownIsOpen();
    await executeTabPage.verifyAtLeastOneOptionVisible();

    const availableOptions = await executeTabPage.getWorkspaceOptions();
    expect(availableOptions.length).toBeGreaterThan(0);
    await captureScreenshot(page, "Step 2: Click on the dropdown");

    // ─── Step 3: Select a workspace ──────────────────────────────────────────
    // Expected: Page should refresh and workspace input updates to selected value
    //
    // Note: under "UATNext Dev" this account's sidebar Projects dropdown lists 4 workspaces
    // (CorePlus, PDC Accounting, SET Dealer CRM, Testdata_Module — verified live 2026-08-18),
    // so selectDifferentWorkspace genuinely switches to a different one.

    const selectedWorkspace = await executeTabPage.selectDifferentWorkspace(initialWorkspace);

    // Dropdown must close after selection
    await executeTabPage.verifyDropdownIsClosed();

    // Workspace input must reflect the selected value
    await executeTabPage.verifyWorkspaceUpdatedTo(selectedWorkspace);

    // Sidebar must complete its Blazor refresh cycle
    await executeTabPage.verifySidebarRefreshed();
    await captureScreenshot(page, "Step 3: Select a workspace");
  });

});
