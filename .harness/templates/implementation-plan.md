# Implementation Plan Template

Copy this template for each feature. Fill before implementation begins. Produced by Solution Architect.

---

## Feature Name

<!-- Reference the Feature Plan -->

## Architecture Summary

<!-- What modules are touched? What is the data flow? Keep it brief — link to deeper docs if needed. -->

## Module Impact

| Module | Change type | Notes |
|---|---|---|
| `invoice` | New endpoint | |
| `reconciliation` | Modified logic | |
| `audit` | New event type | |

## API Contracts

### `POST /api/invoices/upload`

**Request**:
```
Content-Type: multipart/form-data
Fields:
  - file: File (PDF or XML, max 10MB)
  - clientId: string (UUID)
```

**Response 202**:
```json
{
  "invoiceId": "uuid",
  "status": "processing",
  "jobId": "uuid"
}
```

**Error responses**:
- `400` — invalid file type or size
- `403` — clientId does not belong to authenticated tenant
- `422` — file rejected by validation

### `GET /api/invoices/:id/status`

<!-- Document similarly -->

## Database Schema Changes

```sql
-- Migration: YYYYMMDD_description.sql
ALTER TABLE invoices ADD COLUMN ocr_confidence JSONB;
ALTER TABLE invoices ADD COLUMN ocr_raw_output TEXT;
ALTER TABLE invoices ADD COLUMN review_required BOOLEAN DEFAULT false;
```

**Rollback**:
```sql
ALTER TABLE invoices DROP COLUMN ocr_confidence;
ALTER TABLE invoices DROP COLUMN ocr_raw_output;
ALTER TABLE invoices DROP COLUMN review_required;
```

## Background Jobs

<!-- Describe any async work. Include queue name, retry policy, failure handling. -->

| Job | Queue | Trigger | Retry | Failure action |
|---|---|---|---|---|
| `ocr-process` | `ocr` | Invoice upload | 3x exponential | Mark invoice `ocr_failed`, notify frontend |

## Integration Points

<!-- External services involved. Document failure modes. -->

| Service | Call type | Failure mode | Handled by |
|---|---|---|---|
| <extraction/ingestion service> | Async job | Unavailable → job queued, retry | Job worker |

## Testing Strategy

| Layer | What to test |
|---|---|
| Unit | OCR confidence parsing, confidence threshold logic |
| Integration | Upload endpoint: valid file, invalid type, wrong tenant |
| E2E | Upload → processing state → result displayed → low-confidence flagged |

## E2E Coverage Requirements

<!-- Communicate to QA Agent. -->

Must cover:
1. Happy path: upload valid HĐDT, OCR completes, structured result shown
2. Failure: upload invalid file type → error message
3. Low confidence: OCR returns < 85% for a field → field is visually flagged
4. Network failure: OCR service down → invoice stays in `processing` with user notification

## Open Technical Decisions

<!-- Anything requiring human decision or Tech Lead Reviewer approval before implementation. -->

1.
2.

## Approvals

| Role | Name | Date | Decision |
|---|---|---|---|
| Tech Lead Reviewer | | | |
| Human (if escalated) | | | |
