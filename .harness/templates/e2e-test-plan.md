# E2E Test Plan Template

Copy this template for each feature's Playwright test planning. Produced by QA Agent before implementation.

---

## Feature Name

<!-- Reference the Feature Plan and Implementation Plan -->

## Scope

**In scope** (user workflows tested E2E):
-

**Out of scope** (tested at unit/integration level or explicitly deferred):
-

## Test Data Requirements

### Users Required

| Role | Email | Tenant | Notes |
|---|---|---|---|
| Tenant admin | admin@test.example | tenant-A | Full access |
| Operator | operator@test.example | tenant-A | Cannot manage billing |
| Read-only | readonly@test.example | tenant-A | View only |
| Wrong tenant | other@test.example | tenant-B | For isolation tests |

### Database State Required

<!-- What must exist in the database before tests run? Backend Developer creates seed scripts for these. -->

- [ ] 2 tenants: tenant-A, tenant-B
- [ ] 3 resources under tenant-A
- [ ] At least 1 ingested record per resource in various states (processing, complete, flagged)
- [ ] At least 1 completed multi-source review for test-resource-1
- [ ] Sample input fixture in `test-data/sample-records/valid-record.pdf`

### Selector Requirements

<!-- Elements that Frontend Developer must add data-testid to. -->

| Element | Required selector | Screen |
|---|---|---|
| Upload dropzone | `data-testid="record-upload-dropzone"` | Record Upload |
| Processing status | `data-testid="record-status-processing"` | Record Upload |
| Extraction result panel | `data-testid="extraction-result-panel"` | Record Review |
| Low-confidence field | `data-testid="extraction-field-low-confidence"` | Record Review |

---

## Test Scenarios

### Happy Path

**TP-01**: Ingest a valid record and view extraction results
- **Actor**: Operator
- **Precondition**: Logged in as operator@test.example, test-resource-1 selected
- **Steps**:
  1. Navigate to Record Upload
  2. Drop `valid-record.pdf` onto the upload zone
  3. Verify processing status is shown
  4. Wait for the extraction result panel to appear
  5. Verify structured fields are displayed
  6. Verify confidence indicators are shown for each field
- **Expected outcome**: Record is saved, fields populated, no low-confidence flags for this sample
- **File**: `tests/records/upload-happy-path.spec.ts`

**TP-02**: [next scenario]
- ...

---

### Failure Paths

**FP-01**: Upload an invalid file type
- **Actor**: Operator
- **Precondition**: Logged in, resource selected
- **Steps**:
  1. Navigate to Record Upload
  2. Attempt to upload a `.exe` file
- **Expected outcome**: Error message displayed; no record created in database
- **File**: `tests/records/upload-validation.spec.ts`

**FP-02**: Extraction service unavailable
- **Setup**: Mock the extraction service to return 503 (or use a seed with `status: 'extraction_failed'`)
- **Expected outcome**: Record shows error state; user can retry or manually enter data
- **File**: `tests/records/extraction-failure.spec.ts`

---

### Permission / RBAC Scenarios

**RB-01**: Read-only user cannot upload records
- **Actor**: readonly@test.example
- **Steps**: Navigate to Record Upload
- **Expected outcome**: Upload action is not available (button absent or disabled; 403 if API called directly)
- **File**: `tests/rbac/record-permissions.spec.ts`

**RB-02**: Tenant isolation — tenant-B cannot see tenant-A's records
- **Actor**: other@test.example (tenant-B)
- **Steps**: Attempt to access a record ID belonging to tenant-A via URL
- **Expected outcome**: 403 or 404 — no tenant-A data is returned
- **File**: `tests/rbac/tenant-isolation.spec.ts`

---

### Edge Cases

**EC-01**: Ingest a record with low extraction confidence
- **Setup**: Use `test-data/sample-records/low-confidence.pdf` (known low-confidence fixture)
- **Expected outcome**: Low-confidence field is visually flagged; record is in `needs_review` state
- **File**: `tests/records/extraction-low-confidence.spec.ts`

---

## Async Timing Notes

<!-- Document any operations that require waiting. Frontend Developer should document expected delays. -->

| Operation | Expected duration | Wait strategy |
|---|---|---|
| Extraction processing | 5–30 seconds | `waitFor` on `data-testid="extraction-result-panel"` with 60s timeout |
| Record save | < 1 second | `waitFor` on success toast |

---

## Screenshot / Visual Regression

<!-- Only flag screens that need screenshot regression, not all tests. -->

| Screen | Reason | File |
|---|---|---|
| Extraction result panel | Complex layout; catch regressions in field display | `tests/records/extraction-result.spec.ts` |

---

## Coverage Map

| Acceptance Criterion | Test Scenario | Status |
|---|---|---|
| AC-1: Upload succeeds | TP-01 | Planned |
| AC-2: Invalid file rejected | FP-01 | Planned |
| AC-3: Low confidence flagged | EC-01 | Planned |
| AC-4: Extraction failure handled | FP-02 | Planned |
| AC-5: RBAC enforced | RB-01, RB-02 | Planned |

---

## Approvals

| Role | Name | Date | Decision |
|---|---|---|---|
| Product Analyst | | | Confirms AC coverage |
| Tech Lead Reviewer | | | Confirms depth |
