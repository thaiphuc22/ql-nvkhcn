# QTKHCN — Web App (Frontend SPA)

Ứng dụng web cho hệ thống Quản trị KHCN (VHT). Đợt này: **màn Quản lý Danh mục quy trình** với dữ liệu mock.

## Stack (quyết định F2 — đã lock)

- **React 18 + TypeScript**
- **Vite** (dev server + build)
- **Ant Design v5** (component library) + `@ant-design/icons`
- **React Router v6**
- Locale **tiếng Việt** (`antd/locale/vi_VN`)

> ⚠️ **Scope hiện tại: Frontend + mock data.** Chưa nối backend/Camunda. Dữ liệu ở `src/data/processes.ts`,
> in-memory, reset khi tải lại trang. Backend/DB là foundation riêng (chưa làm).

## Chạy

```bash
cd webapp
npm install
npm run dev        # http://localhost:5173  (tự mở trình duyệt)
```

Lệnh khác:
```bash
npm run build      # tsc -b && vite build → dist/
npm run preview    # xem bản build
npm run typecheck  # kiểm tra kiểu, không phát sinh output
```

## Cấu trúc

```
webapp/
├─ index.html
├─ package.json · vite.config.ts · tsconfig*.json
└─ src/
   ├─ main.tsx              # bootstrap: ConfigProvider (theme + viVN) + Router
   ├─ theme.ts             # token theme (đỏ Viettel)
   ├─ App.tsx              # Layout (Sider + Header) + routing
   ├─ data/processes.ts    # types + seed mock (RD01–RD10)
   └─ pages/ProcessCatalog.tsx   # màn Danh mục quy trình
```

## Màn Danh mục quy trình có gì

- KPI (Statistic), bộ lọc (tìm/nhóm/pha/trạng thái), Table.
- Drawer chi tiết: Descriptions + Steps (luồng BPMN minh hoạ) + Timeline (lịch sử phiên bản).
- Deploy quy trình mới / deploy phiên bản (Modal + Upload.Dragger mô phỏng), kích hoạt/tạm ngừng.
- Dữ liệu phản ánh đúng độ phủ RTM: RD01/02/05 = Đang chạy; RD03/04 = Nháp; RD06 = Chưa triển khai.

## Ghi chú

- Đây là **F3 scaffold + màn đầu tiên**, thay thế `../prototype/` (mockup HTML thuần — có thể xoá sau).
- Khi có backend: thay `src/data/processes.ts` bằng lớp gọi API.
