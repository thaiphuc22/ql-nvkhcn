# Module Dashboard quản trị KHCN

Frontend mock dashboard suite cho QTKHCN — React + Ant Design + Recharts.

## Cấu trúc

```
features/dashboard/
├── dashboard.routes.tsx    # Route definitions + menu config
├── models/                 # TypeScript interfaces
├── mocks/                  # Mock data (≥20 NV, ≥30 alerts, 12 tháng)
├── services/
│   ├── dashboard.service.ts       # Interface + factory
│   └── dashboard-mock.service.ts  # Mock implementation (300–500ms delay)
├── shared/                 # KpiCard, FilterBar, ChartCard, hooks...
└── pages/                  # 11 dashboard screens
```

## Routes

| Path | Màn hình |
|------|----------|
| `/dashboard/tong-quan` | Tổng quan điều hành |
| `/dashboard/danh-muc-nhiem-vu` | Danh mục nhiệm vụ |
| `/dashboard/nhiem-vu/:missionId` | Giám sát chi tiết NV |
| `/dashboard/quy-trinh-sla` | Quy trình & SLA (Optimize mock) |
| `/dashboard/tai-xu-ly` | Tải xử lý |
| `/dashboard/hoi-dong` | Hội đồng |
| `/dashboard/kinh-phi` | Kinh phí |
| `/dashboard/nguon-luc` | Nguồn lực |
| `/dashboard/rui-ro` | Rủi ro |
| `/dashboard/tich-hop-du-lieu` | Tích hợp |
| `/dashboard/muc-do-su-dung` | Mức độ sử dụng |

`/tong-quan` redirect → `/dashboard/tong-quan`.

## Thay mock bằng API thật

1. Tạo `dashboard-api.service.ts` implement `DashboardService` từ `services/dashboard.service.ts`.
2. Trong `dashboard-mock.service.ts`, đổi `createDashboardService()` trả về API service.
3. Components/pages **không cần sửa** — chỉ gọi qua `createDashboardService()`.

## Error state test

Thêm `?mockError=1` vào URL hash query để giả lập lỗi tải dữ liệu.

## Filter

Bộ lọc đồng bộ query params (`fromDate`, `toDate`, `planYear`, …). Refresh trang giữ filter.
