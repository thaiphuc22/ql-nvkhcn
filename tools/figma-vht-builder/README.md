# VHT Figma Builder

Development plugin chạy cục bộ trong Figma Desktop, không dùng Figma MCP và không cần gói trả phí.

## Cài đặt

1. Mở file đích trong **Figma Desktop**.
2. Chọn **Figma menu → Plugins → Development → Import plugin from manifest…**.
3. Chọn file `manifest.json` trong thư mục này.
4. Chạy **Plugins → Development → VHT Figma Builder**.

Nếu Figma báo ID manifest đã tồn tại/không hợp lệ, chọn **Plugins → Development → New plugin… → Custom UI**, sau đó giữ `id` Figma vừa sinh và thay các file còn lại bằng nội dung thư mục này.

## Cách dùng

- **Foundations**: variables, text styles, effect styles và trang tài liệu màu.
- **Components**: Button, Status Badge, Filter Chip, KPI Card, Subsystem Card và Left Menu variant sets.
- **Danh sách Phân hệ**: dựng mockup desktop có cấu trúc.
- **Quản lý người dùng**: dựng mockup desktop có bảng user.
- **Cơ cấu tổ chức**: dựng workspace cây đơn vị và danh sách thành viên.
- **Phân quyền**: dựng tab ma trận chức năng × quyền.
- **Nhiệm vụ KHCN**: dựng danh sách, thống kê và bộ lọc nhiệm vụ.
- **Tạo nhiệm vụ**: dựng form tạo nhiệm vụ và hồ sơ Chủ trương theo bố cục hai cột.
- **Chi tiết RD.2026.012**: dựng vòng đời, thông tin nhiệm vụ, chủ nhiệm và danh sách hồ sơ.
- **Hồ sơ KHCN**: dựng KPI trạng thái, bộ lọc và danh sách hồ sơ.
- **Tạo hồ sơ**: dựng form khởi tạo cùng tóm tắt nhiệm vụ, preview quy trình và lịch sử hồ sơ.
- **Chi tiết HS-2026-018**: dựng trạng thái xử lý, routing hiện tại, thông tin, tài liệu và timeline phê duyệt.
- **Việc của tôi**: dựng KPI công việc, bộ lọc loại Camunda user task và danh sách việc theo hạn xử lý.
- **Danh mục quy trình**: dựng KPI, bộ lọc và bảng phiên bản/trạng thái quy trình.
- **Tạo & vẽ BPMN**: dựng form thông tin chung cùng workspace BPMN editor, toolbar và panel thuộc tính.
- **Chi tiết RD01.01**: dựng trạng thái, thông tin, mô tả luồng và lịch sử phiên bản của quy trình.
- **Luật quy mô**: dựng metadata, bảng quyết định DMN và vùng chạy thử luật phân loại quy mô nhiệm vụ.
- **Trạng thái tích hợp**: dựng KPI và các card kết nối QLNS, MS, SAP, QLTS, PLM, IAM.
- **Build tất cả**: chạy toàn bộ theo đúng thứ tự.

Plugin dùng `pluginData` và tên collection/page để chạy lại an toàn. Các node do người dùng tự tạo không bị xóa.

## Nguồn chuẩn

- `webapp/src/branding/tokens.css`
- `webapp/src/theme.ts`
- `webapp/src/App.tsx`
- `webapp/src/pages/SubsystemList.tsx`
- `webapp/src/pages/UserManagement.tsx`
- `webapp/src/pages/NhiemVuList.tsx`
- `webapp/src/pages/NhiemVuCreate.tsx`
- `webapp/src/pages/NhiemVuDetail.tsx`
- `webapp/src/pages/DossierList.tsx`
- `webapp/src/pages/DossierCreate.tsx`
- `webapp/src/pages/DossierDetail.tsx`
- `webapp/src/pages/Worklist.tsx`
- `webapp/src/pages/ProcessCatalog.tsx`
- `webapp/src/pages/ProcessCreate.tsx`
- `webapp/src/pages/ProcessDetail.tsx`
- `webapp/src/pages/RuleDetail.tsx`
- `webapp/src/pages/IntegrationStatus.tsx`
- `webapp/src/data/nhiemVu.ts`
- `webapp/src/data/dossiers.ts`
- `webapp/src/data/userTasks.ts`
- `webapp/src/data/processes.ts`
- `webapp/src/data/rules.ts`
- `webapp/src/data/camundaOps.ts`
- `webapp/src/data/users.ts`
