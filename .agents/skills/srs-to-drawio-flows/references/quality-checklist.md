# Quality checklist

## Source completeness

- Read paragraphs, tables, and embedded UI/images.
- Confirm the exact function count and source order.
- Confirm every function has actor, entry point, process, data, success, and cases.
- Confirm every displayed rule is supported by a source reference.
- Separate business rules from UI-only behavior.

## Wording

- Use the exact function title as the visible header.
- Name the real object: hội nghị, sự cố, điểm cầu, đơn vị, cán bộ, thiết bị, or the source domain.
- State case condition and handling.
- State whether data is written, rolled back, left unchanged, or reloaded.
- Preserve exact status names, limits, error codes, and messages when supplied.
- Remove copy/paste contamination from another function.
- Mark unresolved ambiguity as `cần xác nhận`.

## Visual fidelity

- Preserve template colors and font sizes.
- Keep actor yellow, process/result white with yellow accent, and data `D` gray.
- Keep the main line left-to-right.
- Keep data and success lines vertical.
- Use separate processor anchors for cases.
- Attach no edge to decorative background nodes.
- Avoid crossing lines and text/edge collisions.
- Keep each page readable at a normal zoom.

## Structural validation

- Page count equals template pages plus manifest functions.
- Page IDs, page names, and cell IDs are unique.
- Every edge source and target exists.
- Every edge is orthogonal and anchored.
- Visible header equals the manifest title and contains no `Fxx` prefix.
- Case count matches the selected level.
- No identical full case set is reused across unrelated functions.
- No `TODO`, placeholder, mojibake, or generic category title remains.

## Delivery

- Keep a verified local `.drawio`.
- Render representative functions from every category.
- Validate every requested level.
- For Drive publishing, fetch the saved file back and compare size plus SHA-256.
- Report exact created/updated file and whether the previous artifact was preserved.

