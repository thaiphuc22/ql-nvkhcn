// Camunda Form (form-js schema) — Phiếu nhận xét / góp ý hồ sơ.
export const phieuNhanXetSchema = {
  type: 'default',
  id: 'phieu-nhan-xet',
  components: [
    {
      type: 'text',
      id: 'hdr',
      text: '## Phiếu nhận xét / góp ý hồ sơ\n\nCơ quan nghiệp vụ đánh giá và cho ý kiến về hồ sơ nhiệm vụ KHCN.',
    },
    {
      type: 'checklist',
      id: 'tc',
      key: 'tieuChi',
      label: 'Đánh giá tiêu chí (tích các mục Đạt)',
      values: [
        { value: 'capThiet', label: 'Tính cấp thiết' },
        { value: 'khaThi', label: 'Tính khả thi khoa học – công nghệ' },
        { value: 'duToan', label: 'Dự toán hợp lý' },
        { value: 'nhanSu', label: 'Năng lực nhân sự thực hiện' },
      ],
    },
    {
      type: 'radio',
      id: 'kl',
      key: 'ketLuan',
      label: 'Kết luận',
      validate: { required: true },
      values: [
        { value: 'dong_y', label: 'Đồng ý thông qua' },
        { value: 'chinh_sua', label: 'Đề nghị chỉnh sửa / Không thông qua' },
      ],
    },
    { type: 'textarea', id: 'yk', key: 'yKien', label: 'Ý kiến nhận xét', validate: { required: true } },
  ],
}
