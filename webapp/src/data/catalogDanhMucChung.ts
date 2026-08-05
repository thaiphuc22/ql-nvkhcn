/**
 * Danh mục dùng chung — các bản ghi thuộc từng Loại danh mục dùng chung.
 */

export interface DanhMucChung {
  id: string
  ma: string
  ten: string
  loaiId: string
  giaTri?: string
  moTa?: string
  thuTu?: number
  trangThai: 'active' | 'inactive'
}

export const TRANG_THAI_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
]

export const seedDanhMucChung: DanhMucChung[] = [
  // Ngành (L001)
  { id: 'D001', ma: 'CNTT', ten: 'Công nghệ thông tin', loaiId: 'L001', giaTri: 'cntt', thuTu: 1, trangThai: 'active' },
  { id: 'D002', ma: 'DTVT', ten: 'Điện tử viễn thông', loaiId: 'L001', giaTri: 'dtvt', thuTu: 2, trangThai: 'active' },
  { id: 'D003', ma: 'CK', ten: 'Cơ khí', loaiId: 'L001', giaTri: 'co_khi', thuTu: 3, trangThai: 'active' },
  { id: 'D004', ma: 'VL', ten: 'Vật liệu', loaiId: 'L001', giaTri: 'vat_lieu', thuTu: 4, trangThai: 'active' },
  { id: 'D005', ma: 'QT', ten: 'Quân sự - quốc phòng', loaiId: 'L001', giaTri: 'quoc_phong', thuTu: 5, trangThai: 'active' },

  // Lĩnh vực (L002)
  { id: 'D006', ma: 'AI', ten: 'Trí tuệ nhân tạo', loaiId: 'L002', giaTri: 'ai', thuTu: 1, trangThai: 'active' },
  { id: 'D007', ma: 'IOT', ten: 'Internet vạn vật', loaiId: 'L002', giaTri: 'iot', thuTu: 2, trangThai: 'active' },
  { id: 'D008', ma: '5G', ten: 'Mạng 5G / di động', loaiId: 'L002', giaTri: '5g', thuTu: 3, trangThai: 'active' },
  { id: 'D009', ma: 'CYBER', ten: 'An ninh mạng', loaiId: 'L002', giaTri: 'cyber', thuTu: 4, trangThai: 'active' },
  { id: 'D010', ma: 'RADAR', ten: 'Radar & xử lý tín hiệu', loaiId: 'L002', giaTri: 'radar', thuTu: 5, trangThai: 'active' },
  { id: 'D011', ma: 'SENSOR', ten: 'Cảm biến & đo lường', loaiId: 'L002', giaTri: 'sensor', thuTu: 6, trangThai: 'active' },

  // Loại kết quả NCKH (L003)
  { id: 'D012', ma: 'KQ-PM', ten: 'Phần mềm', loaiId: 'L003', giaTri: 'phan_mem', thuTu: 1, trangThai: 'active' },
  { id: 'D013', ma: 'KQ-TB', ten: 'Thiết bị / mẫu thử', loaiId: 'L003', giaTri: 'thiet_bi', thuTu: 2, trangThai: 'active' },
  { id: 'D014', ma: 'KQ-BC', ten: 'Báo cáo / thuyết minh', loaiId: 'L003', giaTri: 'bao_cao', thuTu: 3, trangThai: 'active' },
  { id: 'D015', ma: 'KQ-BB', ten: 'Bài báo khoa học', loaiId: 'L003', giaTri: 'bai_bao', thuTu: 4, trangThai: 'active' },
  { id: 'D016', ma: 'KQ-SHTT', ten: 'Sở hữu trí tuệ', loaiId: 'L003', giaTri: 'shtt', thuTu: 5, trangThai: 'active' },

  // Loại nhiệm vụ (L004)
  { id: 'D017', ma: 'NV-DT', ten: 'Đề tài', loaiId: 'L004', giaTri: 'de_tai', thuTu: 1, trangThai: 'active' },
  { id: 'D018', ma: 'NV-DA', ten: 'Dự án', loaiId: 'L004', giaTri: 'du_an', thuTu: 2, trangThai: 'active' },
  { id: 'D019', ma: 'NV-SX', ten: 'Sản xuất thử nghiệm', loaiId: 'L004', giaTri: 'sx_thu_nghiem', thuTu: 3, trangThai: 'active' },
  { id: 'D020', ma: 'NV-NV', ten: 'Nhiệm vụ thường xuyên', loaiId: 'L004', giaTri: 'thuong_xuyen', thuTu: 4, trangThai: 'active' },

  // Hình thức thực hiện (L005)
  { id: 'D021', ma: 'HT-DL', ten: 'Độc lập', loaiId: 'L005', giaTri: 'doc_lap', thuTu: 1, trangThai: 'active' },
  { id: 'D022', ma: 'HT-NHOM', ten: 'Theo nhóm', loaiId: 'L005', giaTri: 'nhom', thuTu: 2, trangThai: 'active' },
  { id: 'D023', ma: 'HT-QT', ten: 'Hợp tác quốc tế', loaiId: 'L005', giaTri: 'quoc_te', thuTu: 3, trangThai: 'active' },
]
