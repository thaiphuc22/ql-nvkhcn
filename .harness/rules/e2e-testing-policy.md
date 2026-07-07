# E2E Testing Policy

This policy governs all Playwright E2E testing in this project. Any coding agent must follow it without guessing.

---

## Directory Structure

The names below are illustrative — substitute your own feature folders and page objects. The structure (tests / fixtures / pages / helpers / test-data) is the part to keep.

```
apps/e2e/
  playwright.config.ts          # single config file; all projects defined here
  tests/
    auth/                       # login, logout, session expiry, protected routes
    dashboard/                  # multi-resource view, switching, status indicators
    records/                    # upload, extraction status, manual review queue, failure
    review-flow/                # multi-source match, flag, approve, override
    export/                     # export generation, submission, export history
    rbac/                       # role-based access, tenant isolation
    billing/                    # plan limits, upgrade prompt
  fixtures/
    auth.fixture.ts             # per-role storage state management
    database.fixture.ts         # test DB setup/teardown, transaction helpers
  pages/
    BasePage.ts                 # shared navigation, common assertions
    LoginPage.ts
    DashboardPage.ts
    RecordUploadPage.ts
    RecordReviewPage.ts
    ReviewFlowPage.ts
    ExportPage.ts
  helpers/
    api-setup.ts                # create tenants, resources, records, users via API
    file-helpers.ts             # load sample upload files
    wait-helpers.ts             # named wait utilities
  test-data/
    sample-records/             # realistic sample files (PDFs, XMLs, etc.)
      valid-record.pdf
      low-quality-scan.pdf      # for low-confidence tests
      invalid-format.exe        # for rejection tests
    seed-scripts/
      baseline.sql              # applied before test suite
```

---

## playwright.config.ts Baseline

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ...(process.env.CI ? [['github'] as const] : []),
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    // Auth setup runs first
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // Accountant tests
    {
      name: 'accountant-chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/accountant.json',
      },
    },

    // Admin tests
    {
      name: 'admin-chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
    },

    // Firefox (CI only)
    ...(process.env.CI ? [{
      name: 'accountant-firefox',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/accountant.json',
      },
    }] : []),
  ],
})
```

---

## Selector Rules (Enforced)

### Priority Order

1. `page.getByRole('button', { name: /upload/i })` — buttons, links, checkboxes, radios, headings
2. `page.getByLabel('Record file')` — labeled form inputs
3. `page.getByText('Review complete')` — unique visible text
4. `page.getByPlaceholder('Search resources...')` — inputs with placeholders
5. `page.getByTestId('record-upload-dropzone')` — only when 1–4 cannot uniquely identify

### Prohibited

```ts
// NEVER — CSS class
page.locator('.btn-primary')
page.locator('.record-row')

// NEVER — index-based
page.locator('table tr:nth-child(3)')
page.locator('ul > li:first-child')

// NEVER — XPath (unless last resort with documented reason)
page.locator('//div[@class="container"]/button')

// NEVER — arbitrary waits
await page.waitForTimeout(3000)
```

### data-testid Naming Convention

Format: `kebab-case`, scoped to component purpose.

Example test IDs (accounting SaaS):

```
record-upload-dropzone
record-status-processing
record-status-complete
record-status-needs-review
extraction-result-panel
extraction-field-{fieldName}           # e.g., extraction-field-seller-id
extraction-field-low-confidence        # applied to any field below threshold
review-flow-row-{recordId}
review-flow-flag-button
review-flow-approve-button
resource-card-{resourceId}
resource-switcher
export-button
export-history-row-{exportId}
```

---

## Auth Pattern

### Setup File

```ts
// tests/auth/auth.setup.ts
import { test as setup } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'

setup('authenticate as accountant', async ({ page }) => {
  const login = new LoginPage(page)
  await login.goto()
  await login.login('accountant@test.example', process.env.E2E_ACCOUNTANT_PASSWORD!)
  await page.context().storageState({ path: 'playwright/.auth/accountant.json' })
})

setup('authenticate as admin', async ({ page }) => {
  const login = new LoginPage(page)
  await login.goto()
  await login.login('admin@test.example', process.env.E2E_ADMIN_PASSWORD!)
  await page.context().storageState({ path: 'playwright/.auth/admin.json' })
})
```

### Test File Using Storage State

```ts
// tests/records/upload.spec.ts
import { test, expect } from '@playwright/test'
// No login needed — storageState is loaded from playwright.config.ts

test('uploads a valid record', async ({ page }) => {
  await page.goto('/resources/test-resource-1/records/upload')
  // ...
})
```

---

## Test Data Pattern

### API Setup (Preferred)

```ts
import { test, expect } from '@playwright/test'
import { createTestResource, createTestRecord } from '../../helpers/api-setup'

test.beforeAll(async ({ request }) => {
  await createTestResource(request, { tenantId: 'tenant-a', name: 'Test Resource Co' })
})

test.afterAll(async ({ request }) => {
  await cleanupTestData(request, { tenantId: 'tenant-a' })
})
```

### Data Isolation

Each test run uses either:
- A unique `tenant_id` per run (generated in setup), **OR**
- Database transactions that roll back after each suite

Never assume shared data exists from a previous run.

---

## Waiting Rules

```ts
// CORRECT — wait for a specific state
await page.getByTestId('extraction-result-panel').waitFor({ state: 'visible', timeout: 60_000 })
await page.getByTestId('record-status-processing').waitFor({ state: 'hidden', timeout: 60_000 })

// CORRECT — wait for network idle after action
await page.getByRole('button', { name: /upload/i }).click()
await page.waitForURL(/\/records\/[a-z0-9-]+/)

// CORRECT — wait for API response
const [response] = await Promise.all([
  page.waitForResponse(r => r.url().includes('/api/records') && r.status() === 202),
  page.getByTestId('record-upload-dropzone').setInputFiles('test-data/sample-records/valid-record.pdf'),
])

// WRONG — arbitrary timeout
await page.waitForTimeout(5000)
```

---

## Page Object Model Pattern

```ts
// pages/RecordUploadPage.ts
import { Page, Locator } from '@playwright/test'

export class RecordUploadPage {
  readonly page: Page
  readonly dropzone: Locator
  readonly statusProcessing: Locator
  readonly statusComplete: Locator
  readonly extractionResultPanel: Locator

  constructor(page: Page) {
    this.page = page
    this.dropzone = page.getByTestId('record-upload-dropzone')
    this.statusProcessing = page.getByTestId('record-status-processing')
    this.statusComplete = page.getByTestId('record-status-complete')
    this.extractionResultPanel = page.getByTestId('extraction-result-panel')
  }

  async goto(resourceId: string) {
    await this.page.goto(`/resources/${resourceId}/records/upload`)
  }

  async uploadFile(filePath: string) {
    await this.dropzone.setInputFiles(filePath)
  }

  async waitForExtractionComplete(timeout = 60_000) {
    await this.statusProcessing.waitFor({ state: 'hidden', timeout })
    await this.extractionResultPanel.waitFor({ state: 'visible', timeout })
  }
}
```

---

## CI Commands

```bash
pnpm e2e                               # all tests, headless
pnpm e2e:ui                            # Playwright UI mode (interactive)
pnpm e2e:headed                        # headed browser (debug locally)
pnpm e2e:report                        # open HTML report from last run
pnpm e2e -- --grep "review-flow"      # run tests matching pattern
pnpm e2e -- --project accountant-chromium  # run specific project
pnpm playwright install --with-deps chromium firefox  # install browsers
```

---

## Flakiness Policy

A test is flaky if it passes sometimes and fails other times on the same code.

1. A flaky test must **not** be silently accepted — create a GitHub issue immediately.
2. Do not increase `retries` to hide flakiness.
3. Common causes to investigate:
   - Race condition between an async job and test assertion → fix with `waitFor`
   - Shared test data mutated by a concurrent test → fix with data isolation
   - Selector matches multiple elements → make selector more specific
   - Network timeout in CI → increase timeout with a comment explaining why
4. Flaky tests must be fixed within the same sprint they are identified.

---

## Skipping Tests

A test may be skipped only with a documented reason:

```ts
test.skip(
  'review-flow export — skipped: export not yet implemented (see issue #42)',
  async () => { /* ... */ }
)
```

Skipped tests without a reason or issue reference are rejected in code review.

---

## Done Definition for E2E

A feature's E2E coverage is complete when:

1. All acceptance criteria have at least one corresponding Playwright assertion
2. At least one failure path is tested per critical operation
3. RBAC is tested (unauthorized user cannot perform the action)
4. Test data is isolated and repeatable
5. No `waitForTimeout` calls exist in the test
6. All tests pass in CI without retries (green, not passed-on-retry)
7. Tech Lead Reviewer has approved the test coverage via `templates/test-review.md`
