# Nghiên cứu: Heatmap sơ đồ BPMN kiểu "Instant Process Dashboard" (Camunda Optimize)

> **Trạng thái:** RESEARCH ONLY — chưa code, chưa khoá quyết định. Viết theo yêu cầu "nghiên cứu làm
> phần heatmap giống Instant Process Dashboard của Optimize". **Ngày:** 2026-07-16.
> **Không thuộc active task hiện tại** (đang có nhiều lát dở dang: Lát 0 tách Service Hồ sơ, Port
> Service Task Config, ...). Tài liệu này chỉ để có cơ sở quyết định trước khi mở task mới; theo
> hard rule của harness, không bắt đầu code phần này cho tới khi user xác nhận ưu tiên và ít nhất
> Foundation liên quan (F1 scaffold) đủ chín — hiện 1/6 foundation COMPLETE.

## 1. Instant Process Dashboard heatmap của Optimize hoạt động thế nào

Khi mở một process definition trong Optimize mà chưa cấu hình report nào, Optimize tự sinh một
"Instant Preview Dashboard" gồm vài widget chuẩn, trong đó có **heatmap phủ lên đúng sơ đồ BPMN**:

- **Nguồn dữ liệu**: lịch sử flow-node instance của mọi process instance thuộc definition đó — mỗi
  lần một element (task/gateway/event) được thực thi là một bản ghi có `elementId`, thời điểm
  bắt đầu/kết thúc, trạng thái (completed/canceled/incident). Optimize lấy dữ liệu này từ chính kho
  lưu trữ mà Zeebe exporter ghi ra (Elasticsearch/OpenSearch) — cùng nguồn Operate cũng đọc.
- **Metric chọn được**: phổ biến nhất là **Tần suất** (đếm số lần element được thực thi qua tất cả
  instance) và **Thời gian xử lý** (avg/median/p90 duration mỗi element). Optimize cho chọn khoảng
  ngày, version, và filter theo trạng thái instance.
- **Cách vẽ**: mỗi shape trên sơ đồ BPMN được tô màu theo thang nhiệt (heat scale) tương đối — value
  càng cao (chạy nhiều nhất / chậm nhất) càng "nóng" (thường vàng → cam → đỏ), value thấp gần như
  không màu. Có legend giải thích thang màu, và hover vào từng element hiện tooltip số liệu chính
  xác (count, avg duration).
- **Ý nghĩa nghiệp vụ**: giúp nhìn ngay bằng mắt bước nào bị nghẽn (duration cao) hoặc bước nào ít đi
  qua hơn kỳ vọng (frequency thấp bất thường — có thể do gateway rẽ nhánh lệch), mà không cần viết
  report/SQL.

Về mặt kỹ thuật, phần khó nhất **không phải** việc vẽ màu (bpmn-js xử lý tốt) mà là **có sẵn dữ liệu
lịch sử flow-node instance đã tổng hợp theo elementId** để vẽ.

## 2. Đối chiếu với trạng thái hiện tại của dự án

- **Optimize chưa được xác nhận có trong license/topology** — `OQ-CAM-COMPONENTS` (xem
  `decisions.md`, `docs/arch/camunda-integration-explained.md` dòng "Optimize | (tuỳ) phân tích/BI
  luồng | ❔ tuỳ nhu cầu") vẫn còn treo. Không nên giả định Optimize sẽ được deploy — cần thiết kế
  heatmap **không phụ thuộc Optimize**.
- **Operate thì đã được xác nhận dùng** (kênh 4 REST, "giám sát instance, xử lý incident" — ✅ trong
  bảng component). Operate lưu đúng loại dữ liệu heatmap cần (flow node instance history) trong
  Elasticsearch/OpenSearch nội bộ cụm Camunda, và có REST API (Operate API v1) để search/filter theo
  `processDefinitionKey`, `processInstanceKey`, `flowNodeId`, thời gian bắt đầu/kết thúc.
- **D3 (Camunda không giữ business data)** không cấm đọc dữ liệu *vận hành workflow* (process/flow
  node instance) từ Camunda — D3 chỉ cấm nhồi *business data* vào Camunda variables. Đọc lịch sử
  thực thi để làm heatmap là dùng đúng vai trò "trạng thái workflow" của Camunda, không vi phạm D3.
- **D18 (tách service)**: service Quản trị quy trình sở hữu "process instance/task/incident" — đây
  chính là nơi hợp lý để đặt logic tổng hợp heatmap (không phải service Hồ sơ).
- **Hạ tầng BPMN viewer đã có sẵn nền tảng gần giống**: `BpmnViewerComponent`
  (`frontend-angular/src/app/shared/bpmn-viewer/bpmn-viewer.ts`) đã dùng `NavigatedViewer` +
  `canvas.addMarker/removeMarker` để tô sáng phần tử active/incident (dùng ở `/quy-trinh/nhap/:id/chay-thu`
  cho Test BPMN). Đây là **on/off marker theo CSS class**, không phải thang màu liên tục — cần mở
  rộng, không viết lại từ đầu.
- **Test BPMN (engine cô lập)** không phải nguồn dữ liệu phù hợp cho heatmap thật — nó chạy trên
  engine tách biệt (`bpmn-test-orchestration`, cổng riêng), dữ liệu là phiên test tạm thời, không
  phản ánh lịch sử vận hành thật của process production.

## 3. Nguồn dữ liệu — 2 phương án

### Phương án A — Đọc trực tiếp qua Operate REST API (khuyến nghị bắt đầu)

- Query Operate API (`/v1/flownode-instances/search` hoặc tương đương) lọc theo
  `processDefinitionKey` (+ version nếu cần), group theo `flowNodeId` ở tầng backend (Operate API
  trả instance-level, tổng hợp count/avg-duration làm ở service Quy trình).
- **Ưu điểm**: không phải xây pipeline ghi dữ liệu riêng; tái dùng đúng kênh đã duyệt (D2 kênh 4);
  triển khai nhanh, đúng tinh thần "Instant Dashboard" (không cấu hình trước).
- **Giới hạn cần lường trước**:
  - Operate/Zeebe có chính sách **retention** process instance đã hoàn tất (mặc định có thể xoá dữ
    liệu instance cũ sau một khoảng thời gian cấu hình) — nếu cần thống kê dài hạn (nhiều tháng/năm)
    vượt retention, phương án A không đủ, phải rơi về phương án B.
  - Cần xác nhận **mạng/quyền truy cập** từ service Quy trình tới Operate API khả dụng ở môi trường
    (phụ thuộc `OQ-CAM-DEPLOY` — Self-Managed nội bộ đã giả định thông mạng, nhưng production
    topology vẫn đang mở).
  - Tổng hợp (aggregate) qua nhiều instance ở tầng backend có chi phí query nếu volume lớn — cần
    cache/tính theo lô định kỳ thay vì tính lại mỗi lần mở màn hình.

### Phương án B — Service Quy trình tự ghi nhận flow-node history vào DB riêng

- Thêm job worker/consumer lắng nghe Zeebe process events (đã có sẵn Spring Zeebe client trong
  backend), ghi mỗi lần element start/complete vào bảng riêng (`processFlowNodeInstance`:
  processDefinitionKey, version, elementId, processInstanceKey, startedAt, completedAt, outcome).
- **Ưu điểm**: hoàn toàn độc lập Operate/Optimize, không bị giới hạn retention, chủ động lưu lâu
  dài, join được với business context nếu cần (dù D3 vẫn giữ business data ở service Hồ sơ, chỉ nối
  qua `hoSoId`/`nhiemVuId`/`businessKey`).
- **Nhược điểm**: phải tự xây, tự vận hành pipeline ghi nhận (idempotency khi replay, xử lý
  event out-of-order), trùng lặp một phần với chức năng Operate đã có sẵn.

**Khuyến nghị**: bắt đầu bằng **Phương án A** cho MVP (đúng tinh thần "instant", chi phí thấp nhất,
tận dụng quyết định D2 đã duyệt), có cơ chế cache tổng hợp định kỳ ở service Quy trình để tránh query
Operate lặp lại. Chỉ chuyển một phần sang Phương án B nếu về sau xác nhận cần lưu lịch sử vượt
retention của Operate, hoặc Operate API không đáp ứng đủ hiệu năng.

## 4. Vẽ heatmap trên sơ đồ (frontend)

- **Không dùng lại marker on/off hiện tại nguyên trạng** — cần thang màu liên tục theo giá trị
  chuẩn hoá (normalize 0–1 trong tập element của cùng 1 definition), khác cơ chế class CSS cố định
  đang dùng cho active/incident.
- **Cách làm khuyến nghị**: viết một hàm tiện ích riêng (không sửa `BpmnViewerComponent` hiện có, để
  không ảnh hưởng chỗ đang dùng cho Test BPMN) dùng chính API bpmn-js đã có sẵn trong dự án:
  - Lấy graphics của từng element qua `elementRegistry.get(elementId)` + set màu fill trực tiếp lên
    SVG shape (giống cách nhiều heatmap plugin bpmn-js cộng đồng làm) — đơn giản hơn so với custom
    Overlays cho nhu cầu "tô màu nguyên khối", không cần thêm DOM overlay riêng.
  - Dùng module `Overlays` sẵn có của bpmn-js (không cần thêm dependency mới) để gắn tooltip/badge
    số liệu khi hover — giữ đúng trải nghiệm Optimize (hover thấy số count/duration chính xác).
  - Legend + toggle "Tần suất / Thời gian xử lý" đặt ở khung ngoài component, không phải trong bpmn-js.
- Nên tạo component/tiện ích mới (vd. `BpmnHeatmapComponent` hoặc hàm `applyHeatmap(viewer, metrics)`
  dùng chung với `BpmnViewerComponent` qua composition), thay vì nhồi logic heat vào component viewer
  hiện có đang phục vụ nhiều nơi khác (Test BPMN, các trang xem sơ đồ khác).

## 5. Đề xuất vị trí trong UI

Ứng viên hợp lý nhất: một tab/route mới trong khu vực Quản lý quy trình hiện có (`/quy-trinh`), ví dụ
`/quy-trinh/:processCode/phan-tich` — vì đây đã là nơi user xem draft/deploy/version của process
definition, mở rộng thêm "Phân tích luồng" là hợp logic điều hướng, không cần menu mới. Nội dung màn:
sơ đồ BPMN tô heatmap + toggle metric + filter khoảng ngày/version + legend + click element mở
drawer chi tiết số liệu (nhất quán pattern drawer đã dùng khắp nơi trong app).

## 6. Câu hỏi cần chốt trước khi lên plan triển khai thật

1. Ưu tiên ngay bây giờ hay để sau khi Lát 0 (tách Service Hồ sơ) và các task đang dở dang khác xong?
   Đây là feature mới, chưa nằm trong `active-task.md`.
2. Xác nhận Operate API khả dụng/đủ quyền truy cập từ môi trường backend hiện tại (đã có Docker
   Operate chạy chưa, hay chỉ có Zeebe + test engine cô lập hiện nay?).
3. Định nghĩa "Thời gian xử lý" là elapsed time (kể cả thời gian chờ ở hàng đợi/người dùng) hay active
   processing time — ảnh hưởng cách tính và cách diễn giải cho người dùng nghiệp vụ.
4. Áp dụng cho toàn bộ RD01–RD10 hay chỉ RD01/RD02/RD05 (phạm vi Phase 1 hiện tại)?
5. Có cần lưu lịch sử vượt retention của Operate không (ảnh hưởng chọn Phương án A hay B ở mục 3)?

## 7. Nếu được duyệt triển khai — sơ bộ chia lát (chưa làm, chỉ để tham khảo)

1. **Lát 1 — Backend**: endpoint tổng hợp `GET /api/process-analytics/{processCode}/heatmap` ở
   service Quy trình, query Operate API + tổng hợp count/duration theo elementId, cache ngắn hạn.
2. **Lát 2 — Frontend tiện ích**: hàm/component áp màu heat + tooltip lên sơ đồ, tách biệt
   `BpmnViewerComponent` hiện có.
3. **Lát 3 — UI**: route/tab "Phân tích luồng", filter, legend, drawer chi tiết.
4. **Lát 4 — Verify**: unit test tổng hợp số liệu, real-stack smoke với Operate thật (nếu đã có trong
   Docker Compose dev), browser click-through.
