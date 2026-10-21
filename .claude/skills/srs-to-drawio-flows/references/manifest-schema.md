# Flow manifest schema

## Top-level shape

```json
{
  "metadata": {
    "source": "SRS.docx",
    "template_page": "Template",
    "language": "vi"
  },
  "functions": []
}
```

## Function shape

```json
{
  "id": "F03",
  "title": "Xem dashboard thống kê số lượng sự cố theo trạng thái",
  "actor": "Người dùng được phân quyền",
  "screen": "Dashboard thống kê sự cố",
  "data": [
    "GET /api/incidents/statistics",
    "incident"
  ],
  "flow": {
    "simple": {
      "steps": [
        "Truy cập Dashboard thống kê sự cố"
      ],
      "process": "HT kiểm tra quyền và tổng hợp sự cố theo trạng thái",
      "success": "Hiển thị biểu đồ sự cố theo trạng thái",
      "case_ids": ["C1"]
    },
    "medium": {
      "steps": [
        "Truy cập Dashboard thống kê sự cố",
        "Chọn bộ lọc và yêu cầu xem"
      ],
      "process": "HT kiểm tra quyền, phạm vi; truy vấn và tổng hợp số liệu",
      "success": "Hiển thị biểu đồ và cho phép drill-down danh sách sự cố",
      "case_ids": ["C1", "C2", "C3"]
    },
    "detailed": {
      "steps": [
        "Truy cập Dashboard thống kê sự cố",
        "Chọn trạng thái và phạm vi dữ liệu",
        "HT validate bộ lọc và gửi yêu cầu thống kê"
      ],
      "process": "HT kiểm tra quyền, phạm vi; truy vấn, tổng hợp và chuẩn bị drill-down",
      "success": "Hiển thị biểu đồ; drill-down đúng bộ lọc và phạm vi",
      "case_ids": ["C1", "C2", "C3"]
    }
  },
  "cases": [
    {
      "id": "C1",
      "title": "Không có quyền xem thống kê sự cố",
      "condition": "Người dùng thiếu quyền XEM_BAO_CAO_THONG_KE_SU_CO",
      "handling": "Không hiển thị số liệu; thông báo không có quyền",
      "source": "F03 - Luồng nghiệp vụ, bước kiểm tra quyền"
    },
    {
      "id": "C2",
      "title": "Không có sự cố theo bộ lọc",
      "condition": "API trả về danh sách rỗng",
      "handling": "Hiển thị biểu đồ ở trạng thái rỗng",
      "source": "F03 - Ngoại lệ không có dữ liệu"
    },
    {
      "id": "C3",
      "title": "Lỗi tải biểu đồ hoặc drill-down",
      "condition": "API timeout hoặc lỗi tải danh sách sự cố",
      "handling": "Hiển thị Thử lại; không mở drill-down sai dữ liệu",
      "source": "F03 - Ngoại lệ API"
    }
  ],
  "business_rules": [
    "Chỉ thống kê sự cố thuộc phạm vi phân quyền",
    "Drill-down phải giữ nguyên bộ lọc biểu đồ"
  ],
  "audit": "",
  "ui_evidence": [
    "UI: bộ lọc trạng thái; biểu đồ tròn; thao tác drill-down"
  ],
  "source_refs": [
    "SRS Function 3",
    "Ảnh màn hình Dashboard sự cố"
  ]
}
```

## Required rules

- `id`: unique page ordering key. It may appear in the page tab but not the visible header by default.
- `title`: exact user-facing function title after approved typo normalization.
- `actor`: real actor or role. Do not use a generic actor when the SRS names a specific role.
- `data`: ordered API/table/service labels. Include all auxiliary lookup data required for the function at the detailed level.
- `flow.simple`: require 1–2 steps and at least 1 case.
- `flow.medium`: require 2–3 steps and at least 2 cases.
- `flow.detailed`: require 3–4 steps and at least 3 cases.
- `case_ids`: reference existing case IDs without duplication.
- `cases[].title`: identify the domain-specific failure, not only `Lỗi hệ thống`.
- `cases[].condition`: state what triggers the case.
- `cases[].handling`: state UI response plus data/state outcome.
- `cases[].source`: cite the SRS/UI evidence. Use `cần xác nhận` only when the source is ambiguous.
- `business_rules`: include only supported rules.
- `audit`: describe audit log/history only when applicable.
- `ui_evidence`: use `not_provided` when no UI was supplied.
- `source_refs`: list the authoritative source locations reviewed for the function.

## Prohibited values

Reject the manifest when it contains:

- `TODO`, `[đối tượng]`, `[tên bảng đối tượng]`;
- a visible title such as `XEM BÁO CÁO / THỐNG KÊ`;
- function titles prefixed with an internal ID;
- missing case source references;
- identical complete case sets copied across unrelated functions;
- invented API, permission, status, validation limit, or message.

