// BM.02.00/CV — Công văn đăng ký xét duyệt nhiệm vụ KHCN.
// Nguồn: docs/bieumau/bm.02.00cv-dki-xetduyetNV.md.
const required = { required: true }
const emailRequired = { required: true, validationType: 'email' }
const phoneRequired = { required: true, pattern: '^(?:\\+84|0)[0-9]{9,10}$' }

function contactFields(prefix: string, title: string) {
  return [
    { type: 'text', id: `${prefix}-heading`, text: `**${title}**` },
    { type: 'textfield', id: `${prefix}-name`, key: `${prefix}HoTen`, label: 'Họ và tên', validate: required },
    { type: 'textfield', id: `${prefix}-email`, key: `${prefix}Email`, label: 'Email', validate: emailRequired },
    { type: 'textfield', id: `${prefix}-phone`, key: `${prefix}SoDienThoai`, label: 'Số điện thoại', validate: phoneRequired },
  ]
}

export const congVanDangKyXetDuyetNvKhcnSchema = {
  type: 'default', id: 'bm-02-00-cv-dang-ky-xet-duyet-nv-khcn', components: [
    { type: 'text', id: 'header', text: '## BM.02.00/CV — Công văn đăng ký xét duyệt nhiệm vụ KHCN\n\n**Tổng Công ty Công nghiệp Công nghệ cao Viettel (TCT VHT)**' },
    { type: 'separator', id: 'separator-header' },
    { type: 'text', id: 'section-document', text: '### 1. Thông tin công văn' },
    { type: 'textfield', id: 'document-number', key: 'soCongVan', label: 'Số công văn', validate: required },
    { type: 'datetime', subtype: 'date', id: 'issue-date', key: 'ngayBanHanh', label: 'Ngày ban hành', validate: required },
    { type: 'textfield', id: 'mission-name', key: 'tenNhiemVuKhcn', label: 'Tên nhiệm vụ/đề tài KHCN', validate: required },
    { type: 'textfield', id: 'subject', key: 'trichYeu', label: 'Trích yếu công văn', validate: required },
    { type: 'text', id: 'subject-hint', text: 'Gợi ý: **V/v xin ý kiến thẩm định Hồ sơ đăng ký xét duyệt NV KHCN [tên nhiệm vụ]**.' },
    { type: 'textarea', id: 'recipients', key: 'kinhGui', label: 'Kính gửi', validate: required },
    { type: 'text', id: 'recipients-hint', text: 'Theo mẫu: Ban Tổng Giám đốc Tập đoàn; Cơ quan Quản lý KHCN Tập đoàn.' },
    { type: 'separator', id: 'separator-legal' },
    { type: 'text', id: 'section-legal', text: '### 2. Căn cứ và nội dung đề nghị\n\nTrước hết, Tổng Công ty Công nghiệp Công nghệ cao Viettel (TCT VHT) xin gửi lời chào trân trọng tới Ban Tổng Giám đốc Tập đoàn, Hội đồng KHCN lĩnh vực vũ khí, trang bị công nghệ cao (Hội đồng KHCN) và cảm ơn sự phối hợp, hỗ trợ nhiệt tình cho TCT VHT trong thời gian qua.\n\nCăn cứ Quyết định số 9415/QĐ-CNVTQĐ ngày 09/11/2023 về việc ban hành Quy chế Khoa học và công nghệ của Công ty mẹ - Tập đoàn Công nghiệp - Viễn thông Quân đội.\n\nCăn cứ Quyết định số 11641/QĐ-CNVTQĐ ngày 24/09/2025 của Chủ tịch Tập đoàn về việc sửa đổi một số điều của Quy chế KHCN ban hành kèm theo Quyết định số 9415/QĐ-CNVTQĐ ngày 09/11/2023.\n\nCăn cứ Quyết định số 2891/QĐ-CNVTQĐ ngày 31/12/2025 của Chủ tịch Tập đoàn về việc giao kế hoạch sản xuất kinh doanh, xây dựng đơn vị năm 2026 cho Tổng Giám đốc TCT VHT.\n\nCăn cứ chức năng và nhiệm vụ của TCT VHT, TCT VHT kính đề nghị Hội đồng KHCN Tập đoàn thẩm định đề xuất đề tài KHCN nêu trên.' },
    { type: 'textarea', id: 'proposal-summary', key: 'noiDungDeNghi', label: 'Nội dung đề nghị bổ sung (nếu có)' },
    { type: 'textarea', id: 'attachments', key: 'taiLieuDinhKem', label: 'Tài liệu đính kèm', validate: required },
    { type: 'text', id: 'attachments-hint', text: 'Theo mẫu: Dự thảo Tờ trình về việc đề xuất thực hiện đề tài.' },
    { type: 'separator', id: 'separator-contacts' },
    { type: 'text', id: 'section-contacts', text: '### 3. Đầu mối phối hợp\n\nKhai báo các đầu mối tiếp nhận thông tin, làm rõ kỹ thuật và phối hợp ngành dọc tại TCT VHT.' },
    ...contactFields('chuNhiem', 'Cá nhân đăng ký Chủ nhiệm đề tài'),
    ...contactFields('taiChinh', 'Đầu mối Phòng Tài chính VHT'),
    ...contactFields('muaSam', 'Đầu mối Trung tâm Mua sắm VHT'),
    ...contactFields('clKhcn', 'Đầu mối Phòng CLKHCN VHT'),
    ...contactFields('nhanSu', 'Đầu mối Phòng Nhân sự VHT'),
    { type: 'separator', id: 'separator-signature' },
    { type: 'text', id: 'section-signature', text: '### 4. Hoàn thiện và ký ban hành\n\nMột lần nữa, TCT VHT xin cảm ơn và rất mong Cơ quan Quản lý KHCN Tập đoàn hỗ trợ đơn vị triển khai xét duyệt NV KHCN nêu trên.\n\nTrân trọng./.' },
    { type: 'textarea', id: 'distribution', key: 'noiNhan', label: 'Nơi nhận', validate: required },
    { type: 'textfield', id: 'archive-number', key: 'soBanLuu', label: 'Số lượng bản lưu' },
    { type: 'textfield', id: 'signer-name', key: 'nguoiKy', label: 'Người ký', validate: required },
    { type: 'textfield', id: 'signer-title', key: 'chucVuNguoiKy', label: 'Chức vụ người ký', validate: required },
  ],
}
