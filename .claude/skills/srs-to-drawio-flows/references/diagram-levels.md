# Diagram levels

Use one business truth and three presentation depths. Never add invented cases to make a level look more detailed.

## Simple

Use for overview, review meetings, or early BA alignment.

- Show 1–2 user/system steps.
- Show one processor.
- Show the main data source.
- Show one success result.
- Show at least one critical case.
- Prefer 6–8 visible business nodes.
- Keep wording short enough to scan without zooming.

The simple level must still identify the real function, actor, data object, and most important exception.

## Medium

Use as the default functional specification diagram.

- Show 2–3 steps.
- Show permission/scope checking and the main business validation.
- Show API/database data.
- Show success, audit/notification when relevant.
- Show at least two and normally three function-specific cases.
- Include empty data, invalid input/state, permission, conflict, or API failure only when supported.

The medium level should be understandable without reading the full SRS.

## Detailed

Use for implementation handoff, QA case design, or complex review.

- Show 3–4 ordered steps.
- Include confirmation/cancel, conditional UI behavior, validation boundaries, state transitions, and cross-record checks when applicable.
- Show all supported data sources needed for the function.
- Show success with persisted state, notification, and audit behavior.
- Show every material supported case, normally 3–6.
- Include a source-grounded business-rule note.
- Preserve exact limits, error codes, statuses, and messages when documented.

Do not force five or six cases when only three are supported. Completeness means all supported material cases, not artificial volume.

## Level selection rules

- If the user says `đơn giản`, generate `simple`.
- If the user says `trung bình`, `vừa`, or gives no level for a normal SRS handoff, generate `medium`.
- If the user says `chi tiết`, `đầy đủ`, `implementation`, `test case`, or `QA`, generate `detailed`.
- If the user asks for comparison or all levels, generate all three files.
- If the user says `trung bình–cao`, generate `medium` and include all critical/major cases; use `detailed` only when they explicitly ask for implementation-level depth.

