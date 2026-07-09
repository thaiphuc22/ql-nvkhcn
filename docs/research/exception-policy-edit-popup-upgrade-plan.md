# Review và kế hoạch nâng cấp popup Sửa luật Chi tiết

## Phạm vi

Tài liệu này review popup **Sửa luật Chi tiết** trong `webapp/src/pages/ActionStudio.tsx`.

Lưu ý phân biệt:

- `ActionStudio.tsx`: popup cấu hình **luật Chi tiết** cho admin.
- `DossierDetail.tsx`: popup người dùng gửi **yêu cầu xử lý Chi tiết** trên hồ sơ.

## Hiện trạng

Popup hiện đã có nền tảng đúng hướng:

- Quản lý `ExceptionActionPolicy`.
- Tự sinh/cập nhật `ActionAvailabilityPolicy` liên quan để nút xin Chi tiết xuất hiện trên màn chi tiết hồ sơ.
- Có 4 nhóm cấu hình chính:
  - Chi tiết phát sinh ở đâu.
  - Nút xin Chi tiết trên hồ sơ.
  - Ai duyệt và cần căn cứ gì.
  - Nếu được duyệt thì đi đâu.
- Có preview luồng xử lý và preview nút.

Các mốc code chính:

- `ExceptionTab`: `webapp/src/pages/ActionStudio.tsx`
- Mở sửa luật: `openEdit(p: ExceptionActionPolicy)`
- Lưu luật: `save()`
- Modal: title `Sửa luật Chi tiết`
- Preview: `RoutingPreviewCard`, `ButtonPreviewCard`

## Vấn đề cần cải thiện

### 1. UX còn thiên về kỹ thuật

Popup đang lộ nhiều khái niệm kỹ thuật như `actionCode`, `taskKey`, `targetTaskKey`, `conditionExpression`. Các trường này cần cho mock/dev, nhưng người cấu hình nghiệp vụ sẽ khó tự tin khi sửa luật.

Đề xuất:

- Đưa mã kỹ thuật vào tag phụ hoặc tooltip.
- Ưu tiên nhãn nghiệp vụ: "Bước phát sinh", "Bước chuyển tới", "Vai trò thấy nút", "Vai trò duyệt".
- Thêm câu tóm tắt luật bằng ngôn ngữ tự nhiên.

### 2. Guard theo ngữ cảnh chưa đủ chặt

Một số tình huống có thể gây cấu hình sai hoặc kẹt form:

- Chọn đích đến kiểu `STEP` nhưng để `processCode = null`, làm danh sách bước đích rỗng.
- Đổi quy trình nhưng `sourceTaskKey` hoặc `targetTaskKey` cũ vẫn còn trong form.
- Chọn bước đích trùng bước phát sinh.
- Chọn bước đích nằm trước bước phát sinh trong quy trình.
- Bật luật nhưng chưa chọn vai trò duyệt.

Đề xuất:

- Nếu `targetType = STEP`, bắt buộc chọn quy trình cụ thể.
- Reset `sourceTaskKey` và `targetTaskKey` khi đổi `processCode`.
- Chặn `targetTaskKey === sourceTaskKey`.
- Cảnh báo nếu bước đích nằm trước bước phát sinh.
- Chặn lưu luật bật khi `requiredApproverRoleCodes` rỗng.

### 3. Preview chưa đủ giải thích nghiệp vụ

Preview hiện có sơ đồ và nút, nhưng chưa trả lời nhanh 3 câu hỏi:

- Nút này xuất hiện ở đâu?
- Ai nhìn thấy và ai duyệt?
- Sau khi duyệt, hồ sơ đi đâu?

Đề xuất:

- Thêm card "Tóm tắt luật".
- Tô rõ bước phát sinh và bước đích Chi tiết.
- Hiển thị trạng thái lỗi/cảnh báo ngay trong preview nếu cấu hình chưa hợp lệ.

### 4. Liên kết với màn hồ sơ cần rõ hơn

`DossierDetail.tsx` đang resolve policy để quyết định:

- Loại Chi tiết nào được mở.
- Có bắt buộc lý do/căn cứ không.
- Ai duyệt Chi tiết.
- Giới hạn số lần Chi tiết trên hồ sơ.

Popup cấu hình nên hiển thị rõ tác động này để admin thấy luật vừa lưu sẽ ảnh hưởng gì trên màn hồ sơ.

## Kế hoạch nâng cấp

### Phase 1: Bổ sung validation nghiệp vụ

Mục tiêu: tránh lưu cấu hình sai.

Việc cần làm:

- Thêm helper lấy thứ tự bước trong quy trình.
- Reset bước phát sinh/bước đích khi đổi quy trình.
- Chặn đích đến `STEP` nếu chưa chọn quy trình.
- Chặn bước đích trùng bước phát sinh.
- Cảnh báo bước đích nằm trước bước phát sinh.
- Chặn lưu luật đang bật nhưng không có vai trò duyệt.

Tiêu chí đạt:

- Không thể lưu luật Chi tiết bật mà thiếu người duyệt.
- Không thể lưu đích `STEP` mơ hồ khi chưa có quy trình.
- Form không giữ task key cũ sau khi đổi quy trình.

### Phase 2: Nâng cấp layout popup

Mục tiêu: popup đọc được như một màn cấu hình nghiệp vụ.

Đề xuất layout:

- Header:
  - Tên luật.
  - Trạng thái bật/tắt.
  - Tag action code nhỏ.
- Cột trái:
  - Form theo 4 nhóm hiện tại.
- Cột phải:
  - Tóm tắt luật.
  - Preview luồng.
  - Preview nút.

Tiêu chí đạt:

- Người cấu hình đọc được tác động của luật mà không cần hiểu code.
- Các mã kỹ thuật vẫn xem được nhưng không chiếm vai trò chính.

### Phase 3: Nâng cấp preview

Mục tiêu: preview giúp admin tự kiểm tra trước khi lưu.

Nội dung preview đề xuất:

```text
Khi hồ sơ RD01.01 đang xử lý tại bước "Hội đồng KHCN",
vai trò PM/NNC thấy nút "Xin bỏ qua Hội đồng".
Nếu được TGD_VHT duyệt, hồ sơ chuyển tới bước "Phê duyệt chủ trương".
Yêu cầu bắt buộc lý do và căn cứ, tối đa 1 lần/hồ sơ.
```

Việc cần làm:

- Thêm `PolicySummaryCard`.
- Hiển thị role label thay vì role code khi có thể.
- Hiển thị cảnh báo validation trong preview.
- Với `targetType = STEP`, preview cả source step và target step.

Tiêu chí đạt:

- Preview trả lời rõ: ở đâu, ai thấy, ai duyệt, đi đâu.

### Phase 4: Đồng bộ với popup xin Chi tiết trên hồ sơ

Mục tiêu: đảm bảo cấu hình ở Action Studio phản ánh đúng trên `DossierDetail.tsx`.

Việc cần làm:

- Kiểm tra `resolveExceptionPolicy` dùng đủ `processCode`, `taskDefinitionKey`, `objectStatus`.
- Đảm bảo `DossierDetail.tsx` dùng `requireReason`, `requireEvidence`, `maxTimesPerDossier`, `requiredApproverRoleCodes` từ policy.
- Nếu có target cố định trong policy, cân nhắc tự chọn/khóa bước đích trong popup xin Chi tiết.

Tiêu chí đạt:

- Admin sửa luật trong Action Studio, hành vi ở màn chi tiết hồ sơ thay đổi tương ứng.

## Ưu tiên thực hiện

Khuyến nghị làm theo thứ tự:

1. Validation nghiệp vụ.
2. Tóm tắt luật và preview cảnh báo.
3. Layout lại modal.
4. Đồng bộ sâu với popup xin Chi tiết trên hồ sơ.

Lý do: validation giúp giảm rủi ro demo ngay; layout và preview làm sau sẽ ít phải sửa lại logic.

## Ghi chú triển khai

- Không nên tách abstraction lớn ở bước đầu; giữ scoped trong `ActionStudio.tsx`.
- Có thể thêm helper nhỏ gần `stepOptionsForProcess` và `stepLabel`.
- Nếu popup tiếp tục phình, lúc đó mới tách `ExceptionPolicyModal` và các preview card ra component riêng.
- Tài liệu liên quan:
  - `docs/research/action-availability-model.md`
  - `docs/research/controlled-exception-handling.md`
