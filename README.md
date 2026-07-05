# QL NVKH Công nghệ (ql-nvkhcn)

Hệ thống **Quản lý Nhiệm vụ Khoa học Công nghệ (QTKHCN)** của Tổng Công ty Công nghiệp
Công nghệ cao Viettel (VHT) — số hoá luồng phê duyệt/nghiệp vụ nhiều cấp cho Nhiệm vụ
KHCN (RD01–RD10): chủ trương → xét duyệt → thực hiện → điều chỉnh → nghiệm thu → quyết toán.

Repo này chỉ chứa phần **nghiệp vụ** (không kèm harness/skill nội bộ).

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `webapp/` | Ứng dụng web QTKHCN (React + BPMN editor, các module KHCN, form designer). |
| `prototype/` | Prototype HTML/CSS/JS ban đầu. |
| `docs/` | Tài liệu nghiệp vụ: yêu cầu (`docs/req/`) và kiến trúc (`docs/arch/`). |

## Chạy webapp

```bash
cd webapp
npm install
npm run dev
```

Chi tiết xem `webapp/README.md`.
