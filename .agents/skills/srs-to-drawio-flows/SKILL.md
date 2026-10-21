---
name: srs-to-drawio-flows
description: Analyze Vietnamese or English SRS/URD/business specifications, UI evidence, and an existing diagrams.net template; then generate or revise one function-specific `.drawio` flow per function at simple, medium, and detailed levels with exact template colors, anchored connectors, function-specific cases, API/database evidence, and deterministic validation. Use when Codex or Codex must study a diagrams.net template, convert SRS functions into flowcharts, correct generic or inaccurate diagram wording, produce multiple diagram detail levels, or verify/update a Drive-hosted `.drawio` artifact.
---

# SRS to diagrams.net flows

Produce source-grounded, template-faithful diagrams. Treat visual generation as the final stage of business analysis, not as a substitute for it.

## Required outcome

- Create one diagram page for exactly one function.
- Use the exact function title as the visible header. Do not prefix it with `F01`, `F03`, or another internal code unless the user explicitly requests that.
- Preserve the supplied template's colors, shapes, dimensions, font sizes, and connector style.
- Use UI evidence only for screen names, buttons, fields, states, and interaction order. Use the SRS/URD as the authority for permissions, validation, business states, API/database effects, messages, and exceptions.
- Write cases for the specific function. Never reuse one generic three-case set across unrelated functions.
- Generate valid, editable diagrams.net XML and validate it before delivery.

## Inputs

Ground these artifacts before authoring:

1. SRS/URD/DOCX/PDF or structured business specification.
2. Existing `.drawio` template or diagrams.net/Google Drive URL.
3. UI screenshots, Figma links, or embedded document images when supplied.
4. Requested level: `simple`, `medium`, `detailed`, or `all`.
5. Destination: local file only, new Drive file, or in-place Drive update.

If the user asks only to study or learn the template, analyze it and stop. Do not mutate files.

## Workflow

### 1. Inspect the template

- Fetch original `.drawio` XML/Base64 for Drive-hosted files before relying on the browser UI.
- Identify the authoritative template page.
- Record exact actor, process, data, result, note, and edge styles.
- Preserve all original template pages in generated outputs unless the user requests otherwise.

Use `assets/template.drawio` only when the user supplies no project template.

### 2. Extract all SRS evidence

For DOCX input, run:

```text
python scripts/extract_srs.py INPUT.docx WORK/extracted
```

Inspect `records.json`, `functions.json`, extracted images, tables, and candidate exception lines. Do not infer a flow from function headings alone.

For each function, ground:

- exact title and scope;
- actor and permission;
- preconditions and data scope;
- UI entry point, fields, buttons, confirmation/cancel behavior;
- main business sequence;
- API/database reads and writes;
- success result, status transition, notification, and audit log;
- validation failures, empty states, concurrency/version conflicts, missing/deleted data, permission failures, integration failures, and retry behavior;
- source reference for every case.

### 3. Build and review the manifest

Create a starter manifest:

```text
python scripts/scaffold_manifest.py WORK/extracted/functions.json WORK/flow-manifest.json
```

Read `references/manifest-schema.md` completely before filling the manifest.

Replace every `TODO`. Review every function individually. Keep case wording concise:

- name the real domain object;
- state the triggering condition;
- state the system handling and resulting data/state;
- use exact limits, statuses, error codes, and messages when the SRS provides them;
- mark an unsupported rule as `cần xác nhận` instead of inventing it.

Do not generate diagrams while the manifest contains placeholders or lacks source references.

### 4. Select the detail level

Read `references/diagram-levels.md` completely.

- Generate only the requested level.
- Generate all three levels when the user asks for comparison or does not choose a level.
- Use the same function scope and business truth across levels; change only how much supported detail is displayed.

### 5. Generate

Run:

```text
python scripts/generate_drawio.py \
  --template TEMPLATE.drawio \
  --manifest WORK/flow-manifest.json \
  --level all \
  --output-dir OUTPUT
```

The generator must:

- append one page per function;
- keep the visible header equal to the function title;
- draw the main flow left-to-right;
- connect the data annotation vertically into the processor;
- draw success downward;
- draw each case to the right from a distinct processor anchor;
- attach no connector to a decorative yellow background;
- include detailed business-rule notes only at the detailed level.

### 6. Validate

Run validation on every output:

```text
python scripts/validate_drawio.py \
  --drawio OUTPUT/result_detailed.drawio \
  --manifest WORK/flow-manifest.json \
  --level detailed
```

Fix every reported issue. Do not deliver with warnings treated as unresolved business defects.

Read `references/quality-checklist.md` and complete the visual review on representative pages from each function category: report, list, detail, form, action, selection, and synchronization.

### 7. Publish safely

- Keep the local verified output.
- Upload a new Drive file only when the user requests a new file.
- Replace bytes in place only when the user requests revision of an existing file.
- Preserve the existing Drive ID, name, parent folders, and sharing state during an in-place update.
- Fetch the uploaded file back and compare size and SHA-256 with the local output.
- Return only observed Drive IDs/URLs.

## Diagram conventions

- Actor: yellow rectangle.
- UI/action, processor, success, and case: white rectangle with the template's yellow process accent.
- Data: gray `D` cell plus the template data annotation.
- Main direction: actor → UI/action → system → data/state result.
- Success: downward branch.
- Cases: right-side orthogonal branches using distinct anchors.
- Detailed business rules: pale-yellow note only when backed by source evidence.

Show explicit outcomes where applicable:

- có dữ liệu / không có dữ liệu;
- hợp lệ / không hợp lệ;
- xác nhận / hủy;
- thành công / thất bại;
- permission denied;
- missing/deleted record;
- duplicate/conflict;
- 409/version conflict;
- API/DB/integration failure;
- audit log and notifications.

## Cross-client compatibility

Keep `SKILL.md`, `scripts/`, `references/`, and `assets/` unchanged across clients.

- Codex discovery path: `~/.codex/skills/srs-to-drawio-flows`.
- Codex discovery path: `~/.Codex/skills/srs-to-drawio-flows`.
- `agents/openai.yaml` is Codex UI metadata; Codex may ignore it.
- Run scripts with the Python runtime available in the current client.

