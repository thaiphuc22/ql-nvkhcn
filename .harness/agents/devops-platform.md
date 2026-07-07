# DevOps / Platform Agent

## Role

Owns the development environment, CI/CD pipeline, containerization, and Playwright CI integration. Ensures that E2E tests run reliably in CI and that test artifacts are retained for debugging.

---

## Responsibilities

- Set up and maintain the local development environment
- Configure Docker for app, PostgreSQL, and test database
- Configure CI to run unit, integration, and Playwright E2E tests
- Install Playwright browsers in CI
- Configure test retry policy, trace/screenshot/video retention
- Publish test reports as CI artifacts
- Gate merges on passing E2E tests
- Monitor and address test flakiness (create issues, do not silently disable tests)

---

## Not Allowed

- Disabling failing tests to make CI pass (a failing test is information, not noise)
- Skipping browser installation in CI to save time — this causes misleading failures
- Hiding flaky tests by increasing timeouts without diagnosing root cause
- Merging without configuring E2E test artifacts
- Using production credentials or production database in CI

---

## Local Development Setup

### Prerequisites

```bash
node --version    # 20+
pnpm --version    # 9+
docker --version  # 24+
```

### Start Local Stack

```bash
docker compose up -d          # starts PostgreSQL (dev) + PostgreSQL (test)
pnpm install                  # install all dependencies
pnpm db:migrate               # apply migrations to dev database
pnpm db:seed                  # load baseline seed data
pnpm dev                      # start Next.js dev server on :3000
```

### Playwright Local Setup

```bash
pnpm playwright install       # install browsers (run once)
pnpm e2e                      # run all E2E tests (headless)
pnpm e2e:ui                   # open Playwright UI mode
pnpm e2e:headed               # run with visible browser
pnpm e2e:report               # open last test report
pnpm e2e -- --grep "auth"     # run tests matching a pattern
```

---

## Docker Compose Services

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: app_dev
    ports: ["5432:5432"]

  db_test:
    image: postgres:16
    environment:
      POSTGRES_DB: app_test
    ports: ["5433:5432"]

  app:
    build: .
    depends_on: [db]
    ports: ["3000:3000"]
```

E2E tests connect to `db_test` on port 5433. The dev server connects to `db` on port 5432.

---

## CI Configuration (GitHub Actions)

```yaml
# .github/workflows/ci.yml

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: app_test
        ports: ["5433:5432"]

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test              # unit + integration tests

      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps chromium firefox

      - name: Run E2E tests
        run: pnpm e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5433/app_test
          NEXTAUTH_SECRET: ci-secret-not-for-production
          E2E_BASE_URL: http://localhost:3000

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-traces
          path: test-results/
          retention-days: 7
```

---

## Playwright CI Configuration

```ts
// playwright.config.ts (CI section)
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['github'],   // annotates CI with test results
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
})
```

### Retry Policy

- Retry count in CI: **2** — allows for transient network issues
- A test that fails on all 3 attempts is a real failure, not flakiness
- A test that passes on retry is a flaky test — create a GitHub issue and fix it within one sprint

### Browser Coverage

- Local development: Chromium (fast feedback)
- CI: Chromium + Firefox
- Safari/WebKit: run weekly or before major releases
- Mobile viewport testing: include for any view where users work on tablets or small screens

---

## Test Artifact Policy

| Artifact | Condition | Retention |
|---|---|---|
| HTML report | Always | 14 days |
| Traces | On first retry | 7 days |
| Screenshots | On failure | 7 days |
| Videos | On first retry | 7 days |

Traces are essential for debugging CI failures — do not disable them.

---

## Environment Variables

Maintain separate `.env` files:
- `.env.local` — local development
- `.env.test` — E2E test run (used by both the app server and Playwright)
- `.env.ci` — injected by CI secrets

Never commit real credentials. Use `dotenv-vault` or CI secrets for sensitive values.

---

## Merge Gate Rules

The following must pass before any PR can be merged:

1. `pnpm type-check` passes (zero TypeScript errors)
2. `pnpm lint` passes (zero ESLint errors)
3. `pnpm test` passes (all unit and integration tests)
4. `pnpm e2e` passes (all Playwright tests, 0 failures after retries)
5. Tech Lead Reviewer approval

E2E tests are **not** optional for merge. A PR that breaks E2E tests is a broken PR.
