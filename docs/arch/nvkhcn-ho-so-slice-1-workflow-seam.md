# Lát 1 — WorkflowClient seam trong monolith

> Ngày triển khai: 2026-07-16  
> Trạng thái: hoàn tất và verified  
> Topology: không đổi; toàn bộ lời gọi vẫn chạy in-process trong backend Spring Boot hiện tại

## 1. Kết quả

`HoSoService` không còn import hoặc phụ thuộc trực tiếp `Rd0101ProcessService`. Chiều phụ thuộc mới:

```text
HoSoService
  -> WorkflowClient (application port)
      -> InProcessWorkflowClient (adapter cùng process)
          -> Rd0101ProcessService
              -> CamundaClient
```

Port và DTO đặt tại `vn.vht.qtkhcn.workflow`:

- `WorkflowClient`: start workflow và áp dụng action.
- `StartWorkflowCommand`: business key, process code, ID hồ sơ/nhiệm vụ, initiator và control variables.
- `WorkflowInstance`: process instance id dạng string, an toàn khi chuyển sang JSON transport ở lát sau.
- `WorkflowActionCommand`/`WorkflowAction`: action nghiệp vụ độc lập với Camunda job/task DTO.

Adapter `InProcessWorkflowClient` giữ mapping legacy `RD01.01 -> RD01_01` thông qua
`Rd0101ProcessService`. Chưa có HTTP client, endpoint nội bộ, service/container, database hoặc migration mới.

## 2. Hành vi được giữ nguyên

- Tạo draft không gọi workflow.
- Submit chỉ hỗ trợ `RD01.01`; command chỉ chứa correlation/control data tối thiểu.
- Start Camunda vẫn xảy ra trước khi lưu hồ sơ.
- Legacy fail-soft vẫn được characterize: start trả `null` được ánh xạ thành `Optional.empty()`, hồ sơ vẫn
  lưu `PROCESSING` với process key null. Hành vi này chỉ đổi có chủ đích ở lát outbox.
- Action vẫn gọi workflow trước khi cập nhật/lưu domain và fail-closed nếu workflow lỗi.
- Public REST contract `/api/ho-so/**` không đổi.

## 3. Verification

- Kiểm tra source: không còn tham chiếu `Rd0101ProcessService` trong package `service` hoặc
  `HoSoServiceTest`.
- `InProcessWorkflowClientTest`: 4/4 pass, khóa mapping start, fail-soft, action và process không hỗ trợ.
- `HoSoServiceTest`: 8 pass, 1 skipped có chủ đích; assertions khóa toàn bộ application command gửi qua port.
- Full backend: 113 test, 112 pass, 1 skipped có chủ đích, 0 failure/error.

## 4. Ngoài phạm vi Lát 1

- Chưa scaffold service Hồ sơ riêng.
- Chưa thêm HTTP implementation cho `WorkflowClient`.
- Chưa thêm outbox/idempotency persistence.
- Chưa đổi database ownership, gateway route hay runtime topology.
