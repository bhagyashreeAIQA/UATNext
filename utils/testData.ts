import fs from 'fs';
import path from 'path';

// Load a local, gitignored `.env` (KEY=VALUE per line) at the project root if present, so
// credentials never live in source control. Real environment variables take precedence,
// so CI can inject them directly. Copy `.env.example` to `.env` to run locally.
(() => {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
})();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        'Copy .env.example to .env and fill in your UATNext credentials (see README).',
    );
  }
  return value;
}

export const CREDENTIALS = {
  email: requiredEnv('UATNEXT_EMAIL'),
  password: requiredEnv('UATNEXT_PASSWORD'),
};

export const URLS = {
  base: process.env.UATNEXT_BASE_URL ?? 'https://webapp-v1-blazor-uatnext-dev.azurewebsites.net',
};

export const EXPECTED = {
  workspaceValue: 'ADO Requirement',
  activeProject: 'qConnect - Sample Project',
  appTitle: 'UATNext',
  // Test-run grid columns expected by the spec (TC-008). The live grid also renders
  // a "Business User" column between "Assigned To" and "Status"; it is validated
  // separately so this list stays aligned with the documented test case.
  gridColumns: [
    'Test Run ID',
    'Test Case ID',
    'Name',
    'Assigned To',
    'Status',
    'Execution Date',
    'Planned Start Date',
    'Planned End Date',
    'Action',
  ],
  // Execution statuses offered by the grid's Status dropdown. The live app renders
  // "InProgress" without a space (the documented spec writes it as "In Progress").
  statusOptions: [
    'Passed',
    'Failed',
    'Retest',
    'Blocked',
    'InProgress',
    'Incomplete',
    'Unexecuted',
  ],
  // A deliberately non-existent but validly-formatted Test Run ID. The grid's search
  // only acts on recognised TR-/TC- identifiers, so this reliably yields zero matches.
  nonMatchingSearchId: 'TR-99999999',

  // ── Test Run Execution Details page (TC-068 onward) ────────────────────────
  // Column headers of the Test Logs / test-steps grid. The live app labels the
  // spec's "Step No" as "Step Number" and "Test Step" as "Description"; the spec's
  // wording is mapped to the rendered labels here.
  executionStepColumns: [
    'Step Number',
    'UAT Category',
    'Description',
    'Expected Result',
    'Actual Result',
    'Status',
  ],
  // Statuses offered by the test-run-level Status dropdown on the execution page.
  // As in the grid filter, the live app renders "InProgress" without a space (the
  // documented spec writes "In Progress").
  executionStatusOptions: [
    'Passed',
    'Failed',
    'Retest',
    'Blocked',
    'InProgress',
    'Incomplete',
  ],
  // Toast shown after saving a test run. The live app renders "Test log updated
  // successfully" (the documented spec writes "Testlog Updated Successfully."); matched
  // case-insensitively so the wording deviation does not break the assertion.
  saveSuccessMessage: 'Test log updated successfully',
  // Toast shown after saving a test run that has a newly-attached file. The documented
  // spec writes "Testlog Updated Successfully With Attachment." — the live wording is
  // verified at runtime and matched case-insensitively.
  saveWithAttachmentMessage: 'with attachment',
  // The accept filter on the Test Run attachment file input.
  attachmentAcceptedTypes: ['.xlsx', '.xls', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.pdf', '.mp4'],

  // ── Link Defect (TC-083, TC-084, TC-085) ───────────────────────────────────
  // Existing qTest defect IDs that the Link Defect search reliably returns and that
  // can be linked to a UATNext-Dev test run / step. The link-defect specs pick the
  // first of these that is NOT already linked (a defect already linked to the target
  // leaves the LINK button disabled), link it, assert, then unlink it again so the
  // suite is repeatable and does not accumulate links. Defect IDs persist in qTest,
  // so this pool only needs a couple of spare entries beyond what one run uses.
  linkDefectCandidates: ['DF-140', 'DF-232', 'DF-233', 'DF-236', 'DF-237', 'DF-264'],
  // Confirmation shown when unlinking a defect (YES/NO).
  unlinkConfirmMessage: 'unlinking of Defect',
  // A validly-formatted but non-existent Defect ID — the Link Defect search returns
  // "No matching records found." and leaves LINK disabled (TC-134).
  invalidDefectId: 'DF-99999999',

  // ── Create Defect form (TC-105 to TC-110) ───────────────────────────────────
  createDefect: {
    // Mandatory fields, each marked with a "*" in the form. The documented spec listed
    // Module as mandatory, but the live form no longer marks it: Module is auto-populated
    // from the test case's qTest mapping (validated separately by TC-110), so it is not a
    // user-entered required field and carries no "*". The live form additionally marks Team*.
    mandatoryFields: [
      'Summary',
      'Affected Release/Build',
      'Severity',
      'Priority',
      'Status',
      'Type',
      'Description',
    ],
    defaultStatus: 'New',   // Status field pre-populated value (TC-108)
    defaultType: 'Bug',     // Type field pre-populated value (TC-109)
    // ── Create Defect dropdown fields (TC-111 to TC-121) ──────────────────────
    // Each dropdown is an `input.searchable-dropdown-input` identified by its unique
    // "-- Select X --" placeholder.
    dropdownPlaceholders: {
      module:        '-- Select Module --',
      environment:   '-- Select Environment --',
      severity:      '-- Select Severity --',
      type:          '-- Select Type --',
      category:      '-- Select Category --',
      team:          '-- Select Team --',
      priority:      '-- Select Priority --',
      status:        '-- Select Status --',
      reason:        '-- Select Reason --',
      businessUser:  '-- Select Business User --',
      rootCause:     '-- Select Root Cause --',
      targetRelease: '-- Select Target Release --',
      assignedTo:    '-- Select Assigned To User --',
    },
    defaultSeverity: '3 - Medium',  // Severity default (TC-132)
    defaultPriority: '3 - Medium',  // Priority default (TC-133)
    // Sections the pre-populated Description template must contain (TC-128).
    descriptionTemplateSections: ['Business Impact', 'Steps to Reproduce', 'Expected Result', 'Actual Result'],
    // Toast shown after a successful Create Defect SAVE (TC-131). The documented wording is
    // "Defect Created Successfully"; the live build shows "Defect created and linked successfully."
    // (the new defect is auto-linked to the run). Matched leniently to cover both.
    defectCreatedMessage: /defect created.*successfully/i,
    // Documented Type values (live list matches these exactly).
    typeOptions: ['Bug', 'Enhancement', 'Change Request', 'Other'],
    // Documented Status values. The live workflow exposes a superset (15), so these are asserted
    // as a subset that must be present rather than an exact list.
    statusOptions: [
      'New', 'Rejected', 'Deferred', 'Open', 'Assigned', 'Remediation Started', 'Fixed', 'Ready To Retest',
    ],
    // Module is pre-populated with the mapped qTest module code. The documented spec example is
    // "MD-6078 SET Dealer CRM"; the live mapping for this test data is "MD-6111 Testdata_Module"
    // — both match this "MD-<id> <name>" shape, which is what the test asserts.
    modulePattern: /^MD-\d+\s+\S/,
    // Validation shown when SAVE is clicked with a blank Summary. The documented spec writes
    // "Please fill all mandatory fields"; the live build shows the field-specific message below.
    summaryBlankError: /summary cannot be blank/i,
    summaryMaxLength: 255,
  },

  // ── Defect tab (Def_TC_001 to Def_TC_010) ───────────────────────────────────
  // The Defect tab is verified against the project that carries seeded defect data
  // (the default-loaded "qConnect - Sample Project" exposes 2783 defects). The
  // documented precondition names Business Unit "UATNext Dev", but that BU's Defect
  // tab holds 0 entries, so the data-dependent search/list cases would have nothing
  // to assert against; the project that owns the seeded defects is used instead so
  // the list, search and filter behaviours are exercisable.
  defect: {
    // Left-panel filter controls expected by Def_TC_001, in top-to-bottom order. The
    // SEARCH/CLEAR buttons are present but rendered disabled until a filter is entered.
    leftPanelControls: [
      'SEARCH',
      'CLEAR',
      'Projects',
      'Summary / Defect ID',
      'Affected Release',
      'Status',
      'Team',
      'Severity',
      'Priority',
      'Assigned To',
      'Business User',
      'Created By',
      'Submitted After',
      'Submitted Before',
    ],
    // Right-panel grid columns expected by Def_TC_002, in left-to-right order.
    gridColumns: [
      'Defect ID',
      'Summary',
      'Affected Release/Build',
      'Status',
      'Team',
      'Severity',
      'Priority',
      'Assigned To',
      'Business User',
    ],
    // Empty-state message shown in the right panel when a search yields no defects
    // (Def_TC_005 / Def_TC_007). Verified verbatim against the live app.
    noDefectsMessage: 'No defects found. Use the filters to search for defects.',
    // A validly-formatted but non-existent Defect ID — search returns 0 results and
    // the no-defects message (Def_TC_005).
    invalidDefectId: 'DF-99999999',
    // A summary string that matches no defect — search returns 0 results (Def_TC_007).
    invalidSummary: 'zzz-no-such-defect-summary-qwerty',
    // A value not present in the Affected Release dropdown — typing it shows the
    // dropdown's "No results found" state and leaves only "Please Select" (Def_TC_009).
    invalidRelease: 'ZZZ-invalid-release-xyz',
    // Text a searchable dropdown renders when a typed value matches no option (shared by
    // every filter dropdown — Affected Release, Status, Team, Severity, Priority,
    // Assigned To, Business User).
    dropdownNoResultsText: 'No results found',
    // A value not present in any filter dropdown — typing it shows the "No results found"
    // state and leaves only "Please Select" (Def_TC_011/013/015/017/019/021).
    invalidDropdownValue: 'ZZZ-invalid-xyz-123',
    // A Status value present in the Status dropdown, used for the valid-filter case
    // (Def_TC_010). Live Status options: New, Assigned, Resolved, Reopened, Closed,
    // Deferred.
    validStatus: 'Resolved',
    // Candidate Created By value for Def_TC_022. NOTE: no selectable Created By value
    // actually owns defects — the seeded defects were created by a qTest integration
    // account that is not present in the ~852-user Created By dropdown (verified by
    // sampling), so Def_TC_022 is test.fixme. This value is kept for when such data exists.
    validCreatedBy: 'Teresa Amand',
    // Submitted After / Submitted Before dates (yyyy-mm-dd) chosen wide enough that every
    // defect qualifies, so the valid date-filter cases reliably return matches
    // (Def_TC_024 / Def_TC_025).
    submittedAfterDate: '2000-01-01',
    submittedBeforeDate: '2035-12-31',
  },

  // ── Coordinator → Generate Test Log (GTL_TC_001 to GTL_TC_014) ───────────────
  // The COORDINATOR tab is permission-gated and runs on the default qConnect - Sample Project BU,
  // which exposes approved test cases with runs (the documented "UATNext Dev" BU has no executable
  // test data — the same deviation the Defect-tab specs note). Values verified live 2026-06-18.
  generateTestLog: {
    // An approved test case (under qConnect) with multiple associated test runs. Read at use; if
    // the seed data changes, update this PID. Version auto-populates to "6.0".
    validTestCasePid: 'TC-3017',
    // The latest approved version auto-populated for validTestCasePid.
    expectedVersion: '6.0',
    // A test run id belonging to validTestCasePid (its Test Runs dropdown lists TR-2235/2251/2267/2283).
    validTestRun: 'TR-2235',
    // A validly-formatted but non-existent Test Case PID — search returns no version/runs and an
    // error message (GTL_TC_004). NOTE: the live message is "Error fetching test runs. Please try
    // again." (the spec wording is "No test runs found"), matched leniently below.
    invalidTestCasePid: 'TC-99999999',
    noRunsMessage: /error fetching test runs|no test runs found|not found/i,
    // New Log step Status options (live build). The documented spec lists a 7-item superset that
    // also includes "Retest" and "In Progress"; this build exposes only these five.
    newLogStatusOptions: ['Passed', 'Failed', 'Incomplete', 'Blocked', 'Unexecuted'],
    // Default per-step / overall status on a fresh New Log.
    defaultStatus: 'Unexecuted',
    // Documented log-grid columns (both Last Log and New Log).
    gridColumns: ['Step Number', 'UAT Category', 'Description', 'Expected Result', 'Actual Result', 'Status'],
    // Enabled GENERATE button colour (orange call-to-action) — rgb form for a robust assertion.
    generateEnabledColor: 'rgb(255, 183, 0)',
    // Toast shown after a successful New Log SAVE.
    saveSuccessMessage: /test log created successfully/i,
  },

  // ── Coordinator → Bulk Execution (BE_TC_001) ─────────────────────────────────
  // Bulk Execution renders its Release tree + Test Run grid on the UATNext Dev workspace (under the
  // default qConnect BU the panel does not render). Values verified live 2026-06-19.
  bulkExecution: {
    // Workspace that exposes Bulk Execution releases with test runs.
    workspace: 'UATNext Dev',
    // Project pre-selected in the left-panel Projects dropdown for that workspace.
    expectedProject: 'Testdata_Module',
    // A Release node that loads a populated Test Run grid when clicked.
    releaseWithRuns: 'Testdata_Release_P03',
    // Test Run grid columns (left-to-right) shown after selecting a Release.
    gridColumns: [
      'Test Run ID', 'Test Case PID', 'Test Case Version', 'Name', 'Status',
      'Execution Date', 'Assign To', 'Business User',
    ],
  },

  // ── DEFECT-tab Create / View-Modify Defect form (Def_TC_036 to Def_TC_051) ──
  // The DEFECT tab's CREATE DEFECT button opens a "New Defect" form that replaces the grid. It
  // shares its DOM with the execution-page Create-Defect popup, but here there is NO test-case
  // context, so (unlike that popup) none of the dropdowns are pre-populated and only Affected
  // Release/Build carries a "*". Verified live 2026-06-17.
  createDefectPage: {
    // The fields the New Defect / details form must expose (Def_TC_036 / Def_TC_041). The dropdowns
    // are verified by their placeholders (see CreateDefectPage.PLACEHOLDER); this list documents the
    // human-readable expectation from the spec.
    expectedFields: [
      'Save Button', 'Close Button', 'Summary', 'Affected Release/Build', 'Fixed Release/Build',
      'Severity', 'Type', 'Module', 'Reason', 'Category', 'Environment', 'Target Release/Build',
      'Status', 'Priority', 'Assigned To', 'Team', 'Business User', 'Root Cause', 'Description',
      'Browse File', 'Linked Test Run Section',
    ],
    // The ONLY field marked mandatory ("*") on the DEFECT-tab form for the default project/BU.
    // The documented spec also lists Summary/Severity/Status/Priority/Team as mandatory, but this
    // build marks none of those with "*"; instead it enforces several fields (Affected Release/Build,
    // Reason, Business User, …) via field-by-field "Please select a valid X." validation on save.
    markedMandatoryField: 'Affected Release/Build',
    // Team is NOT marked mandatory for the default BU (Def_TC_046 — Team optional).
    teamOptionalForDefaultBu: true,
    // Unsaved-changes confirmation popup text (verified verbatim, Def_TC_038).
    unsavedChangesMessage: 'You have unsaved changes. Are you sure you want to proceed?',
    // Toast after a successful create (Def_TC_037 / 047) — live wording "Defect created successfully."
    createdSuccessMessage: /defect created successfully/i,
    // Toast after a successful update (Def_TC_042) — live wording "Defect updated successfully."
    updatedSuccessMessage: /defect updated successfully/i,
    // Over-10MB attachment rejection (Def_TC_039): toast "Error: File '<name>' exceeds the 10MB
    // limit." plus the same message inline in the drop zone.
    fileTooLargeMessage: /exceeds the 10\s*mb limit/i,
    // Date-range coupling on the left filter panel (Def_TC_050): setting Submitted After applies its
    // value as the `min` of Submitted Before, so earlier dates are disabled in the picker.
    dateValidation: { after: '2027-04-20', beforeEarlier: '2026-04-20' },
  },
};
