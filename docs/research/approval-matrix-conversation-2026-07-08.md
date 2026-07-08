# Conversation Note - Approval Matrix Review

Date: 2026-07-08

Scope: Review and refactor direction for `/ma-tran-phe-duyet` (EPIC06 - Approval Matrix).

---

## 1. Review màn `/ma-tran-phe-duyet`

Màn hiện tại là prototype client-side cho Approval Matrix. Nó có các phần chính:

- Bảng luật ánh xạ: slot phê duyệt + điều kiện -> nhóm/người phê duyệt.
- Modal thêm/sửa/xóa/bật tắt luật.
- Khu vực ủy quyền/thay thế tạm thời.
- Simulation để thử resolve người phê duyệt theo slot, cấp nhiệm vụ, loại hội đồng, ngân sách.

Logic hiện tại:

- `ApprovalMatrix.tsx` giữ state `rules` từ `APPROVAL_MATRIX`.
- `resolveApprovers()` lọc luật match context, sort theo `priority` tăng dần, lấy rule đầu tiên.
- `resolveGroups()` map `candidateGroup` -> user cụ thể, sau đó áp ủy quyền nếu có hiệu lực.
- Dữ liệu chỉ nằm trong memory, chưa có persistence/backend.

Nhận xét chính:

- Ý tưởng kiến trúc đúng: BPMN trả lời "phê duyệt ở bước nào", DMN/rule trả lời "điều kiện/cấp/loại nào", Approval Matrix trả lời "ai phê duyệt".
- Nhưng runtime hồ sơ hiện chưa dùng đầy đủ `resolveApprovers(slot + conditions)`. `DossierDetail` đang dùng `resolveGroups(currentStep.vaiTroCodes)`, tức lấy candidateGroups đã có sẵn từ step rồi map ra user.
- Vì vậy sửa luật trên màn `/ma-tran-phe-duyet` chưa thực sự ảnh hưởng tới luồng hồ sơ.
- UI chưa làm rõ "nhóm phê duyệt" khác với "người phê duyệt cụ thể".
- Chưa có cảnh báo conflict/overlap rule, chưa validate khoảng ngân sách, chưa có audit vì sao một rule match.

---

## 2. Ý nghĩa của trường Slot phê duyệt

`Slot phê duyệt` là vị trí/vai trò phê duyệt trừu tượng trong workflow, chưa phải người hoặc nhóm cụ thể.

Ví dụ:

- `THAM_DINH`: cần một tuyến thẩm định.
- `HOI_DONG`: cần một hội đồng phê duyệt/xét duyệt.
- `PHE_DUYET`: cần cấp ký duyệt/phê duyệt cuối.

Cùng một slot có thể resolve ra các nhóm khác nhau tùy điều kiện:

- `PHE_DUYET` + cấp Tập đoàn + ngân sách > 5 tỷ -> Ban TGĐ Tập đoàn.
- `PHE_DUYET` + cấp Cơ sở -> TGĐ VHT.

Kết luận: slot là "ô cần lấp người phê duyệt" trong workflow; Approval Matrix quyết định ô đó sẽ được lấp bằng ai.

---

## 3. Vấn đề điều kiện đang bị hard-code

Mockup hiện có các điều kiện cứng:

- Cấp nhiệm vụ.
- Loại hội đồng.
- Ngân sách tối thiểu.
- Ngân sách tối đa.

Thực tế điều kiện có thể rất nhiều:

- Loại nhiệm vụ.
- Tổng dự toán.
- Đơn vị chủ trì.
- Nguồn vốn.
- Lĩnh vực KHCN.
- Mức độ mật.
- Có mua sắm hay không.
- Có thuê ngoài hay không.
- Mã quy trình.
- Bước quy trình.
- Cấp tổ chức.
- Loại hội đồng.

Đề xuất: thay schema cứng bằng Condition Builder động.

Mô hình đề xuất:

```ts
ApprovalRule {
  id: string
  name: string
  slot: SlotCode
  conditions: ConditionGroup
  result: ApprovalAssignment
  priority: number
  enabled: boolean
}
```

Ví dụ:

```ts
{
  logic: "AND",
  items: [
    { field: "capNhiemVu", operator: "=", value: "TD" },
    { field: "tongDuToan", operator: ">=", value: 5000000000 },
    {
      logic: "OR",
      items: [
        { field: "loaiNhiemVu", operator: "=", value: "NCKH" },
        { field: "nguonVon", operator: "=", value: "VHT" }
      ]
    }
  ]
}
```

Cần có registry biến điều kiện:

```ts
{
  key: "tongDuToan",
  label: "Tổng dự toán",
  type: "number",
  operators: [">", ">=", "<", "<=", "=", "between"]
}
```

UI nên có:

- Nút thêm điều kiện.
- Dropdown chọn biến.
- Dropdown chọn toán tử.
- Input giá trị theo type.
- Nhóm AND/OR.
- Preview câu đọc được cho người nghiệp vụ.

---

## 4. Các module liên quan

Approval Matrix là module định tuyến người xử lý, nên liên quan trực tiếp tới:

1. Quản lý quy trình / BPMN
   - BPMN xác định bước cần phê duyệt.
   - Approval Matrix xác định ai phê duyệt bước đó.

2. Business Rule / DMN
   - DMN quyết định điều kiện nghiệp vụ: cấp nhiệm vụ, loại hội đồng, cần hội đồng hay không.
   - Approval Matrix dùng output đó để chọn người/nhóm.

3. Hồ sơ / Nhiệm vụ KHCN
   - Cung cấp context đầu vào: cấp nhiệm vụ, loại nhiệm vụ, dự toán, đơn vị chủ trì, nguồn vốn...

4. Người dùng / Vai trò / RBAC
   - Ma trận trả về user/group.
   - RBAC vẫn quản lý quyền hệ thống, Approval Matrix chỉ quản lý phân công phê duyệt theo nghiệp vụ.

5. Cơ cấu tổ chức
   - Cần resolve theo đơn vị, chức danh, cấp trên trực tiếp, người phụ trách thay thế.

6. Ủy quyền / Vắng mặt / Thay thế
   - Áp sau khi đã tìm được người gốc.

7. Hội đồng / Tổ chuyên gia
   - Ma trận chọn loại hội đồng hoặc tuyến hội đồng.
   - Module hội đồng quản lý thành viên, chủ tịch, thư ký, tỷ lệ biểu quyết.

8. Worklist / Việc của tôi
   - Tiêu thụ output candidateUsers/candidateGroups.

9. Giám sát tiến trình
   - Hiển thị bước đang chờ ai và vì sao.

10. Audit log
    - Ghi context đầu vào, rule match, người được chọn, ủy quyền áp dụng.

11. Tích hợp Camunda/Zeebe
    - Service/worker resolve assignment rồi set candidateUsers/candidateGroups cho task.

Ranh giới nên giữ:

- Approval Matrix không làm thay Business Rule.
- Approval Matrix không làm thay RBAC.
- Approval Matrix không làm thay quản lý hội đồng.
- Approval Matrix không làm thay quản lý tổ chức.

Câu hỏi duy nhất của module này là:

> Với bước phê duyệt này và context này, ai là người/nhóm có trách nhiệm xử lý?

