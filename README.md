# UATNext Playwright Tests

Automated Playwright tests for the UATNext Blazor WebAssembly application (qTest integration).

## Setup

```bash
npm install
npx playwright install
```

Copy `.env.example` to `.env` and fill in your UATNext credentials:

```bash
cp .env.example .env
```

```
UATNEXT_EMAIL=your.email@example.com
UATNEXT_PASSWORD=your-password
UATNEXT_BASE_URL=https://webapp-v1-blazor-uatnext-dev.azurewebsites.net
```

`.env` is gitignored and must never be committed. CI can inject the same variables
directly into the environment instead of using a file.

## Running tests

```bash
# Whole suite
npx playwright test

# A single feature folder
npx playwright test tests/DefectTab

# A single test
npx playwright test tests/DefectTab/Def_TC_001_left_panel_ui.spec.ts
```

A global setup (`utils/authSetup.ts`) logs in once and saves the session to
`.auth/user.json` (also gitignored); the specs reuse it via `storageState`.

## Layout

- `pages/` — Page Objects (POM), grouped by feature tab (`ExecuteTab`, `DefectTab`, …).
- `tests/` — specs, grouped by feature tab, with per-folder navigation helpers.
- `utils/` — shared test data, expected values and the auth setup.
