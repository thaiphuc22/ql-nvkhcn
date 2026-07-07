# Coding Standards

These standards apply to all code in this project. They are enforced by the Tech Lead Reviewer.

---

## TypeScript

- **Strict mode is on.** `tsconfig.json` must have `"strict": true`. No exceptions.
- No `any` type without a comment explaining why it is unavoidable.
- No `// @ts-ignore` without a comment explaining the TypeScript version limitation or upstream type bug.
- Use `unknown` instead of `any` for external data (API responses, extraction output, file uploads) until it is validated with Zod.
- Use `satisfies` for type-narrowing complex config objects.
- Prefer explicit return types on exported functions.

---

## Next.js Patterns

### Server vs Client

- Default to React Server Components. Use `'use client'` only when the component requires:
  - Browser APIs (localStorage, window, ResizeObserver)
  - React hooks (`useState`, `useEffect`, `useRef`)
  - Interactive event handlers
- Mutations go through **Server Actions** when called from within the Next.js app.
- **Route Handlers** (`/api/...`) are for external consumers, webhooks, or file upload endpoints.

### Routing and Auth

- Route protection is enforced in `middleware.ts` — not in individual page components.
- Never trust `params.tenantId` or `searchParams.resourceId` from the URL as authorization. Always resolve the tenant from the authenticated session.

### Data Fetching

- Fetch on the server in Server Components using `fetch` or the ORM directly.
- Client-side data fetching uses SWR or React Query. Always handle loading, error, and empty states.

---

## Database (PostgreSQL)

### Tenant Isolation (Non-Negotiable)

Every query that reads or writes tenant-scoped data must include both the `tenant_id` (resolved from the session) AND the `resource_id`:

```ts
// WRONG
db.select().from(records).where(eq(records.resourceId, resourceId))

// CORRECT
db.select().from(records).where(
  and(
    eq(records.tenantId, session.tenantId),  // from session, not user input
    eq(records.resourceId, resourceId)        // validated as belonging to this tenant
  )
)
```

### Migrations

- Migration files are named `YYYYMMDD_HHMMSS_description.sql`.
- Every migration must have a documented rollback strategy.
- Destructive changes (DROP COLUMN, DROP TABLE) require Tech Lead Reviewer approval and a data migration plan.
- Never write ad-hoc queries that modify schema — always use migration files.

### ORM Rules

- Do not write raw SQL strings for data access. Use the ORM's query builder.
- Exception: complex analytical queries or batch operations where the ORM produces incorrect SQL. Document the exception.

---

## API Contracts

- All API request and response schemas are validated with Zod.
- Backend schemas are the source of truth. Frontend infers types from them.
- Changing an existing endpoint's contract (path, method, required fields, response shape) requires:
  1. Updating the contract document in `.harness/`
  2. Notifying the Frontend Developer before merging
  3. Tech Lead Reviewer approval

---

## Error Handling

### API Responses

Use structured error bodies consistently:

```json
{
  "error": {
    "code": "TENANT_MISMATCH",
    "message": "The requested resource does not belong to your account.",
    "field": null
  }
}
```

Status code conventions:
- `400` — malformed request (wrong content-type, missing required field)
- `401` — unauthenticated
- `403` — authenticated but forbidden
- `404` — resource does not exist (or exists in another tenant, return 403 not 404)
- `409` — conflict (duplicate creation)
- `422` — validation error (request is well-formed but business rules reject it)
- `500` — unexpected server error (logged, not exposed to client)

Never return a `500` with a raw stack trace to the client.

---

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `record-upload.tsx` |
| React components | `PascalCase` | `RecordUploadPanel` |
| Functions / variables | `camelCase` | `parseExtractionResult` |
| Database tables | `snake_case` | `records`, `tenant_resources` |
| Database columns | `snake_case` | `extraction_confidence`, `tenant_id` |
| Environment variables | `UPPER_SNAKE_CASE` | `DATABASE_URL` |
| `data-testid` | `kebab-case` | `record-upload-dropzone` |
| Zod schemas | `PascalCase` + `Schema` | `RecordUploadSchema` |

---

## Comments

Write comments only for the non-obvious:
- A hidden constraint that is not apparent from the code
- A workaround for a specific bug or upstream limitation
- The reason a safe-looking simplification would break something

Do not write comments that describe what the code does (the code does that). Do not write TODO comments without a GitHub issue reference.

---

## Logging

- Use a structured logger (Pino or equivalent). No `console.log` in production code paths.
- Log levels: `error` for unexpected failures, `warn` for expected-but-notable states, `info` for significant business events, `debug` for local development.
- Never log: personally identifiable or regulated identifiers, sensitive amounts in plaintext (use masked versions), file contents, session tokens.
- Audit events go to the audit log (separate table), not the application log.

---

## File Uploads

- Validate MIME type from the file itself (not just the extension or Content-Type header).
- Enforce max file size at the API layer.
- Store raw files in object storage. Never store binary data in PostgreSQL.
- The database stores only the storage key (URL/path), metadata, and status.
