# docs/ba — Không gian làm việc BA / SRS (QTKHCN)

Cài đặt từ kit DMS-THTM (2026-08-05) vào harness QTKHCN **không ghi đè** file harness phần mềm.
Đường dẫn `BA/...` trong workflow gốc map sang `docs/ba/...`.

## Cấu trúc

| Đường dẫn | Mục đích |
|---|---|
| `OQ-TRACKER.md` | Sổ Open Question cho SRS |
| `Blueprint Review/` | BRN + `_extracted/` từ blueprint |
| `Tài liệu SRS/` | Output SRS `.md` (+ `img/`, `drawio/`) |
| `templates/` | Mẫu VTS (SAMPLE_TKCT, BM.03, BM.04) |

## Harness liên quan

- Workflows: `.harness/workflows/blueprint-review.md`, `srs-authoring.md`
- Rules: `.harness/rules/srs-definition-of-done.md`, `srs-screen-template.md`, `review-policy-srs.md`, `approval-policy-srs.md`
- Skills: `ba-doc-write`, `ba-doc-review`, `babok-assistant`, `srs-to-drawio-flows`, `skill-*`
- Tools: `tools/blueprint-extract/`, `tools/document-reader/`, `tools/docs-to-drive/`
- Quyết định: **D23–D27** trong `.harness/state/decisions.md`

## Quy tắc nhanh

1. SRS AI chỉ viết `.md` (D23).
2. Mọi giả định phải có mã OQ (D24).
3. Review blueprint trước khi viết SRS (D25).
4. Không đánh dấu "đã review" khi Trang ký còn trống.
