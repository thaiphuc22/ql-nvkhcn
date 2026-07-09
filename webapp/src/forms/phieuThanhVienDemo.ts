// Biểu mẫu DEMO cho eForm B-engine Lát 3 — trình diễn ③ BẢNG ĐỘNG (`dynamiclist`):
// danh sách thành viên thêm/xoá được, mỗi dòng có trường nhập + trường tự tính + ẩn/hiện
// có điều kiện THEO DÒNG (kiểm chứng phạm vi biến FEEL trong dòng — rủi ro R2).
//
// Schema đúng chuẩn form-js (dynamiclist + components con). Seed BỔ SUNG (không sửa seed cũ).
// Xem docs/arch/eform-b-engine-architecture.md §6 & §8.
//
// Phạm vi biến FEEL trong dòng = { ...gốc, ...dòng } (dòng ưu tiên):
//   - `chiPhiUocTinh` (dòng)   = soThang * heSo          → chỉ dùng biến của DÒNG.
//   - `ghiChu` hiện khi         = vaiTro = "chu_nhiem"    → điều kiện theo biến DÒNG.
//   - `soThanhVien` (gốc)       = count(danhSachThanhVien) → biểu thức GỐC đọc mảng dòng.
export const phieuThanhVienDemoSchema = {
  type: 'default',
  id: 'phieu-thanh-vien-demo',
  components: [
    {
      type: 'text',
      id: 'h',
      text: '## Đăng ký thành viên nhiệm vụ (demo Lát 3)\n\nMinh hoạ **bảng động** — thêm/xoá dòng, mỗi dòng có **trường tự tính** và **ẩn/hiện theo dòng**.',
    },
    {
      type: 'dynamiclist',
      id: 'ds',
      key: 'danhSachThanhVien',
      label: 'Danh sách thành viên',
      validate: { required: true },
      components: [
        {
          type: 'textfield',
          id: 'ht',
          key: 'hoTen',
          label: 'Họ và tên',
          validate: { required: true },
        },
        {
          type: 'select',
          id: 'vt',
          key: 'vaiTro',
          label: 'Vai trò',
          validate: { required: true },
          values: [
            { value: 'chu_nhiem', label: 'Chủ nhiệm' },
            { value: 'thanh_vien', label: 'Thành viên' },
            { value: 'thu_ky', label: 'Thư ký' },
          ],
        },
        {
          type: 'number',
          id: 'st',
          key: 'soThang',
          label: 'Số tháng tham gia',
          validate: { min: 0, max: 24 },
        },
        {
          type: 'number',
          id: 'hs',
          key: 'heSo',
          label: 'Hệ số công (triệu đồng/tháng)',
          validate: { min: 0 },
        },
        // ② Tự tính theo DÒNG: chi phí ước tính = số tháng × hệ số (guard null ⇒ 0).
        {
          type: 'expression',
          id: 'cp',
          key: 'chiPhiUocTinh',
          label: 'Chi phí ước tính (tự tính)',
          expression:
            '=(if soThang = null then 0 else soThang) * (if heSo = null then 0 else heSo)',
        },
        // ① Ẩn/hiện theo DÒNG: ghi chú nhiệm vụ chủ nhiệm chỉ hiện khi vai trò = Chủ nhiệm.
        {
          type: 'textarea',
          id: 'gc',
          key: 'ghiChu',
          label: 'Ghi chú trách nhiệm chủ nhiệm',
          conditional: { hide: '=vaiTro != "chu_nhiem"' },
        },
      ],
    },
    { type: 'separator', id: 's1' },
    // Biểu thức GỐC đọc mảng dòng: đếm số thành viên đã thêm.
    {
      type: 'expression',
      id: 'stv',
      key: 'soThanhVien',
      label: 'Số thành viên (tự đếm)',
      expression: '=if danhSachThanhVien = null then 0 else count(danhSachThanhVien)',
    },
    { type: 'textarea', id: 'yk', key: 'yKien', label: 'Ý kiến / ghi chú chung' },
  ],
}
