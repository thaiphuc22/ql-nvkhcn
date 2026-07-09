// Biểu mẫu DEMO cho eForm B-engine Lát 2 — trình diễn ① hiển thị có điều kiện
// (`conditional.hide`) + ② trường tính toán (`expression`, readonly).
//
// Schema đúng chuẩn form-js: builder FormDesigner có thể tạo được form thế này
// (conditional + expression là thuộc tính form-js sẵn có). Đây là biểu mẫu SEED bổ
// sung (không sửa các seed cũ) để kiểm chứng Lát 2 — xem
// docs/arch/eform-b-engine-architecture.md §4 & §8.
//
// FEEL của form-js viết với tiền tố '='. Biểu thức tính tổng bọc `if x=null then 0`
// để trống ô ⇒ coi như 0 (tránh null làm phép cộng ra null).
export const phieuDuToanDemoSchema = {
  type: 'default',
  id: 'phieu-du-toan-demo',
  components: [
    {
      type: 'text',
      id: 'h',
      text: '## Phiếu thẩm định dự toán (demo Lát 2)\n\nMinh hoạ **ẩn/hiện có điều kiện** và **trường tự tính**.',
    },
    {
      type: 'radio',
      id: 'kl',
      key: 'ketLuan',
      label: 'Kết luận thẩm định',
      validate: { required: true },
      values: [
        { value: 'dat', label: 'Đạt' },
        { value: 'chua_dat', label: 'Chưa đạt' },
      ],
    },
    // ① Chỉ hiện khi Kết luận = "Chưa đạt". Khi ẩn: không validate, không nộp.
    {
      type: 'textarea',
      id: 'ld',
      key: 'lyDoChuaDat',
      label: 'Lý do chưa đạt',
      validate: { required: true },
      conditional: { hide: '=ketLuan != "chua_dat"' },
    },
    { type: 'separator', id: 's1' },
    {
      type: 'number',
      id: 'pl1',
      key: 'kinhPhiPL1',
      label: 'Kinh phí PL1 (triệu đồng)',
      validate: { min: 0 },
    },
    {
      type: 'number',
      id: 'pl2',
      key: 'kinhPhiPL2',
      label: 'Kinh phí PL2 (triệu đồng)',
      validate: { min: 0 },
    },
    // ② Tự tính tổng PL1+PL2, readonly (người dùng không gõ tay).
    {
      type: 'expression',
      id: 'tong',
      key: 'tongKinhPhi',
      label: 'Tổng kinh phí (tự tính)',
      expression:
        '=(if kinhPhiPL1 = null then 0 else kinhPhiPL1) + (if kinhPhiPL2 = null then 0 else kinhPhiPL2)',
    },
    { type: 'textarea', id: 'yk', key: 'yKien', label: 'Ý kiến thẩm định' },
  ],
}
