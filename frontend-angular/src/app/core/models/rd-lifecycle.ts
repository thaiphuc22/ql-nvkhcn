/**
 * Bản đồ luồng RD03–RD10 theo
 * `docs/req/1. Quy trinh Phan mem KHCN chi tiet (clean).md`
 * (nguồn PDF: Quy trình Phần mềm KHCN chi tiết).
 */

export type RdPhase = 1 | 2;
export type RdCap = 'CS' | 'TD' | 'ALL' | 'INT';

export interface RdActor {
  nhom: string;
  vaiTro: string;
}

export interface RdLuong {
  ma: string;
  ten: string;
  nhom: 'RD03' | 'RD04' | 'RD05' | 'RD06' | 'RD07' | 'RD08' | 'RD09' | 'RD10';
  pha: RdPhase;
  cap: RdCap;
  batDau: string;
  ketThuc: string;
  rangBuoc: string;
  tichHop: string[];
  buocTomTat: string[];
  tacNhan: RdActor[];
  /** Route UI đã có trên Angular (nếu có). */
  uiRoute?: string;
  uiLabel?: string;
  ghiChu?: string;
}

export interface RdNhomMeta {
  ma: string;
  ten: string;
  pha: RdPhase;
  moTa: string;
  mau: string;
}

export const RD_NHOM_META: RdNhomMeta[] = [
  {
    ma: 'RD03',
    ten: 'Thực hiện NV KHCN',
    pha: 2,
    mau: '#fa8c16',
    moTa: 'Quản lý thực hiện đề tài: nhân sự, mua sắm, chi phí SAP, tài sản, PLM/tiến độ, báo cáo tiến độ (RD03.06 Pha 1).',
  },
  {
    ma: 'RD04',
    ten: 'Điều chỉnh NV KHCN',
    pha: 2,
    mau: '#f5222d',
    moTa: '10 luồng điều chỉnh CS/TĐ: chủ nhiệm, nội dung/dự toán, mục tiêu/tăng dự toán, tạm dừng, dừng.',
  },
  {
    ma: 'RD05',
    ten: 'Nghiệm thu',
    pha: 1,
    mau: '#722ed1',
    moTa: 'Nghiệm thu cấp Cơ sở và Tập đoàn (có Tổ KT); QĐ TL HĐNT → đánh giá → công nhận kết quả.',
  },
  {
    ma: 'RD06',
    ten: 'Quyết toán',
    pha: 1,
    mau: '#13c2c2',
    moTa: 'Quyết toán chi phí sau QĐ công nhận KQ; số liệu SAP. RD06.02 có trang luồng dữ liệu riêng.',
  },
  {
    ma: 'RD07',
    ten: 'Danh mục SPDV nghiên cứu',
    pha: 2,
    mau: '#eb2f96',
    moTa: 'Vòng đời sản phẩm/dịch vụ NC: nghiên cứu → nghiệm thu → kinh doanh → cải tiến; đồng bộ CRM.',
  },
  {
    ma: 'RD08',
    ten: 'Sở hữu trí tuệ',
    pha: 1,
    mau: '#a0d911',
    moTa: 'Đăng ký SHTT (bài báo, sáng chế), công nghệ lõi; gắn thực hiện đề tài + Storage.',
  },
  {
    ma: 'RD09',
    ten: 'Dashboard / tổng hợp thông tin',
    pha: 2,
    mau: '#2f54eb',
    moTa: 'Bức tranh tổng thể thời gian thực: danh mục đề tài, chi phí, nhân sự, tài sản trí tuệ.',
  },
  {
    ma: 'RD10',
    ten: 'Lưu trữ hồ sơ / biểu mẫu',
    pha: 1,
    mau: '#fa541c',
    moTa: 'Form mẫu hồ sơ/báo cáo, danh mục quy trình-quy định; kho tài liệu dự án (QĐ 1752).',
  },
];

export const RD_LUONGS: RdLuong[] = [
  // —— RD03 ——
  {
    ma: 'RD03.01',
    ten: 'Tương tác QLKHCN ↔ QLNS (nhân sự)',
    nhom: 'RD03',
    pha: 2,
    cap: 'INT',
    batDau: 'Khởi tạo / cập nhật thông tin NV KHCN & DS nhân sự',
    ketThuc: 'Đồng bộ trạng thái nhân sự + chi phí lương (PL1)',
    rangBuoc: 'Kết nối phần mềm QLNS ngoài',
    tichHop: ['QLNS'],
    buocTomTat: [
      'Khởi tạo thông tin chung NV (mã, PM, ĐV chủ trì, PL1)',
      'Gán/cập nhật DS nhân sự + hệ số lương từ QLNS',
      'Xuất định kỳ/đột xuất DS nhân sự & chi phí nhân công',
    ],
    tacNhan: [
      { nhom: 'PM QTKHCN', vaiTro: 'Khởi tạo / gán DS / yêu cầu xuất' },
      { nhom: 'PM QLNS', vaiTro: 'Tiếp nhận DS; trả trạng thái & chi phí lương' },
    ],
  },
  {
    ma: 'RD03.02',
    ten: 'Tương tác QLKHCN ↔ Mua sắm (MS)',
    nhom: 'RD03',
    pha: 2,
    cap: 'INT',
    batDau: 'Khai báo cấu trúc sản phẩm (System→…→VTLK)',
    ketThuc: 'Đồng bộ TTr / gói thầu / HĐ / chi phí mua sắm',
    rangBuoc: 'Đồng bộ PM Mua sắm (TT MS), XNK',
    tichHop: ['MS', 'XNK'],
    buocTomTat: [
      'Khởi tạo NV + dự toán full',
      'Khai báo cấu trúc SP chi tiết hơn dự toán',
      'Đồng bộ tiến độ TTr / gói thầu / hợp đồng từ MS',
    ],
    tacNhan: [
      { nhom: 'PM QTKHCN', vaiTro: 'Khai báo cấu trúc SP; yêu cầu xuất' },
      { nhom: 'PM MS', vaiTro: 'Cập nhật TTr, gói thầu, HĐ theo cấu trúc' },
    ],
  },
  {
    ma: 'RD03.03',
    ten: 'Tương tác QLKHCN ↔ SAP (chi phí)',
    nhom: 'RD03',
    pha: 2,
    cap: 'INT',
    batDau: 'Đồng bộ khởi tạo NV + cấu trúc SP sang SAP',
    ketThuc: 'Kinh phí đã thực hiện / quyết toán theo PL1–PL6',
    rangBuoc: 'Kết nối phần mềm quản lý chi phí (SAP)',
    tichHop: ['SAP'],
    buocTomTat: [
      'Khởi tạo / điều chỉnh thông tin NV trên cả hai hệ',
      'Khai báo cấu trúc SP → SAP cập nhật kinh phí theo PL',
      'Xuất định kỳ số liệu kinh phí thực hiện',
    ],
    tacNhan: [
      { nhom: 'PM QTKHCN', vaiTro: 'Khởi tạo; yêu cầu số liệu' },
      { nhom: 'SAP', vaiTro: 'Trả kinh phí thực hiện / quyết toán PL1–6' },
    ],
  },
  {
    ma: 'RD03.04',
    ten: 'Tương tác QLKHCN ↔ QLTS (tài sản)',
    nhom: 'RD03',
    pha: 2,
    cap: 'INT',
    batDau: 'Khai báo cấu trúc SP gắn VTLK / CCDC / TS',
    ketThuc: 'Đồng bộ phiếu NXK, danh mục tài sản bàn giao',
    rangBuoc: 'Đồng bộ phần mềm QLTS / NXK (TTMS)',
    tichHop: ['QLTS', 'TTMS'],
    buocTomTat: [
      'Khởi tạo NV trên QLKHCN & QLTS',
      'Đồng bộ VTLK / CCDC / TS theo cấu trúc SP',
      'Xuất danh sách tài sản + phiếu NXK',
    ],
    tacNhan: [
      { nhom: 'PM QTKHCN', vaiTro: 'Khai báo cấu trúc; yêu cầu xuất' },
      { nhom: 'PM QLTS', vaiTro: 'Trả danh mục VTLK/CCDC/TS đã xuất kho' },
    ],
  },
  {
    ma: 'RD03.05',
    ten: 'Tương tác QLKHCN ↔ PLM (tiến độ / sản phẩm)',
    nhom: 'RD03',
    pha: 2,
    cap: 'INT',
    batDau: 'Khai báo milestone, DS sản phẩm, kế hoạch',
    ketThuc: 'Cập nhật tiến độ / kết quả theo kế hoạch & khối SP',
    rangBuoc: 'Đồng bộ PLM + Storage',
    tichHop: ['PLM', 'Storage'],
    buocTomTat: [
      'Khởi tạo kế hoạch & DS sản phẩm NV',
      'Đồng bộ milestone / cấu trúc SP với PLM',
      'Nhận tiến độ & kết quả hoàn thành từ PLM',
    ],
    tacNhan: [
      { nhom: 'PM QTKHCN', vaiTro: 'Khai báo kế hoạch / SP' },
      { nhom: 'PM PLM', vaiTro: 'Cập nhật tiến độ & kết quả' },
    ],
  },
  {
    ma: 'RD03.06',
    ten: 'Báo cáo tiến độ thực hiện đề tài',
    nhom: 'RD03',
    pha: 1,
    cap: 'CS',
    batDau: 'Khởi tạo / cập nhật báo cáo tiến độ theo form mẫu',
    ketThuc: 'BTGĐ VHT phê duyệt / từ chối Báo cáo',
    rangBuoc: 'Đồng bộ PLM, QLNS; dùng form mẫu RD10',
    tichHop: ['PLM', 'QLNS'],
    buocTomTat: [
      'PM/PA khởi tạo & cập nhật tiến độ; trình ký',
      'CQ KHCN / MS / TCKT / NS nhận xét, ký',
      'BGĐ TT/Khối → CQNV VHT → BTGĐ VHT phê duyệt',
    ],
    tacNhan: [
      { nhom: 'PM / PA / NNC', vaiTro: 'Khởi tạo; cập nhật; trình ký BC' },
      { nhom: 'CQ KHCN, MS, TCKT, NS', vaiTro: 'Nhận xét; ký / từ chối' },
      { nhom: 'BGĐ TT / Khối', vaiTro: 'Ký duyệt' },
      { nhom: 'CQNV VHT', vaiTro: 'Ký duyệt' },
      { nhom: 'BTGĐ VHT', vaiTro: 'Phê duyệt / từ chối Báo cáo' },
    ],
  },
  // —— RD04 ——
  {
    ma: 'RD04.01',
    ten: 'Điều chỉnh Chủ nhiệm qua CQ KHCN (CS)',
    nhom: 'RD04',
    pha: 2,
    cap: 'CS',
    batDau: 'PM cũ khởi tạo HS điều chỉnh CNĐT',
    ketThuc: 'TGĐ / PTGĐ phê duyệt QĐ điều chỉnh CNĐT',
    rangBuoc: 'Điều chỉnh chủ nhiệm đề tài cấp Cơ sở',
    tichHop: [],
    buocTomTat: [
      'PM cũ xây dựng HS; PM mới ký',
      'BGĐ TT/Khối ký → CQ KHCN thẩm định',
      'BTGĐ VHT phê duyệt QĐ ĐC CNĐT',
    ],
    tacNhan: [
      { nhom: 'PM (cũ/mới)', vaiTro: 'Khởi tạo / ký duyệt HS' },
      { nhom: 'BGĐ TT / Khối', vaiTro: 'Ký / từ chối' },
      { nhom: 'CQ KHCN VHT', vaiTro: 'Thẩm định điều kiện trên hệ thống' },
      { nhom: 'BTGĐ VHT', vaiTro: 'Phê duyệt QĐ ĐC CNĐT' },
    ],
  },
  {
    ma: 'RD04.02',
    ten: 'Điều chỉnh nội dung/dự toán (không tăng tổng) qua HĐ KHCN (CS)',
    nhom: 'RD04',
    pha: 2,
    cap: 'CS',
    batDau: 'PM khởi tạo HS điều chỉnh nội dung / thời gian / dự toán',
    ketThuc: 'HĐ KHCN / BTGĐ thông qua HS điều chỉnh',
    rangBuoc: 'Không tăng tổng dự toán NV',
    tichHop: [],
    buocTomTat: [
      'PM xây dựng HS ĐC',
      'CQ KHCN lập Báo cáo thông qua HS ĐC',
      'HĐ KHCN VHT thẩm định / phê duyệt',
    ],
    tacNhan: [
      { nhom: 'PM / PA / NNC', vaiTro: 'Khởi tạo HS' },
      { nhom: 'CQ KHCN VHT', vaiTro: 'Lập & trình Báo cáo thông qua' },
      { nhom: 'HĐ KHCN VHT', vaiTro: 'Thẩm định; phê duyệt / từ chối' },
    ],
  },
  {
    ma: 'RD04.03',
    ten: 'Điều chỉnh mục tiêu / tăng dự toán qua HĐXD ĐC (CS)',
    nhom: 'RD04',
    pha: 2,
    cap: 'CS',
    batDau: 'PM khởi tạo HS điều chỉnh mục tiêu hoặc tăng dự toán',
    ketThuc: 'HĐXD ĐC thông qua; không vượt chủ trương',
    rangBuoc: 'Tăng dự toán nhưng không vượt chủ trương đã duyệt',
    tichHop: [],
    buocTomTat: [
      'PM lập HS ĐC mục tiêu / dự toán',
      'Thẩm định qua chuỗi CQ → HĐXD ĐC',
      'Phê duyệt trong hạn mức chủ trương',
    ],
    tacNhan: [
      { nhom: 'PM', vaiTro: 'Khởi tạo HS' },
      { nhom: 'HĐXD ĐC cấp CS', vaiTro: 'Xét duyệt điều chỉnh' },
    ],
  },
  {
    ma: 'RD04.04',
    ten: 'Tạm dừng NV KHCN (CS)',
    nhom: 'RD04',
    pha: 2,
    cap: 'CS',
    batDau: 'Đề nghị tạm dừng NV',
    ketThuc: 'QĐ tạm dừng được phê duyệt',
    rangBuoc: 'Xét tạm dừng cấp Cơ sở',
    tichHop: [],
    buocTomTat: ['Lập hồ sơ tạm dừng', 'Thẩm định / Hội đồng', 'Ban hành QĐ tạm dừng'],
    tacNhan: [{ nhom: 'PM / CQ / HĐ', vaiTro: 'Theo quy trình tạm dừng CS' }],
  },
  {
    ma: 'RD04.05',
    ten: 'Dừng thực hiện NV KHCN (CS)',
    nhom: 'RD04',
    pha: 2,
    cap: 'CS',
    batDau: 'Đề nghị dừng NV',
    ketThuc: 'QĐ dừng qua HĐ Đánh giá hoàn thành (ĐGHT)',
    rangBuoc: 'Qua HĐ ĐGHT cấp CS',
    tichHop: [],
    buocTomTat: ['Lập hồ sơ dừng', 'HĐ ĐGHT đánh giá', 'Ban hành QĐ dừng'],
    tacNhan: [{ nhom: 'PM / HĐ ĐGHT', vaiTro: 'Xét dừng NV' }],
  },
  {
    ma: 'RD04.06',
    ten: 'Điều chỉnh Chủ nhiệm qua CQ KHCN (TĐ)',
    nhom: 'RD04',
    pha: 2,
    cap: 'TD',
    batDau: 'HS ĐC CNĐT cấp Tập đoàn',
    ketThuc: 'BTGĐ TĐ phê duyệt QĐ ĐC CNĐT',
    rangBuoc: 'Tương tự RD04.01, cấp Tập đoàn + vai trò thay thế',
    tichHop: [],
    buocTomTat: ['Khởi tạo HS ĐC CNĐT TĐ', 'CQ KHCN TĐ thẩm định', 'BTGĐ TĐ phê duyệt'],
    tacNhan: [
      { nhom: 'PM / CQ KHCN TĐ', vaiTro: 'Lập & thẩm định' },
      { nhom: 'BTGĐ TĐ', vaiTro: 'Phê duyệt QĐ' },
    ],
  },
  {
    ma: 'RD04.07',
    ten: 'Điều chỉnh nội dung/dự toán qua HĐ KHCN (TĐ)',
    nhom: 'RD04',
    pha: 2,
    cap: 'TD',
    batDau: 'HS ĐC nội dung / dự toán (không tăng tổng) cấp TĐ',
    ketThuc: 'HĐ KHCN TĐ thông qua',
    rangBuoc: 'Không tăng tổng dự toán',
    tichHop: [],
    buocTomTat: ['Lập HS ĐC TĐ', 'Thẩm định CQ / HĐ KHCN TĐ', 'Phê duyệt'],
    tacNhan: [{ nhom: 'PM / HĐ KHCN TĐ', vaiTro: 'Xét điều chỉnh' }],
  },
  {
    ma: 'RD04.08',
    ten: 'Điều chỉnh mục tiêu / tăng dự toán qua HĐXD ĐC (TĐ)',
    nhom: 'RD04',
    pha: 2,
    cap: 'TD',
    batDau: 'HS ĐC mục tiêu / tăng dự toán cấp TĐ',
    ketThuc: 'HĐXD ĐC TĐ thông qua; không vượt chủ trương',
    rangBuoc: 'Không vượt chủ trương TĐ',
    tichHop: [],
    buocTomTat: ['Lập HS', 'HĐXD ĐC TĐ xét duyệt', 'Phê duyệt'],
    tacNhan: [{ nhom: 'PM / HĐXD ĐC TĐ', vaiTro: 'Xét điều chỉnh' }],
  },
  {
    ma: 'RD04.09',
    ten: 'Tạm dừng NV KHCN (TĐ)',
    nhom: 'RD04',
    pha: 2,
    cap: 'TD',
    batDau: 'Đề nghị tạm dừng cấp TĐ',
    ketThuc: 'QĐ tạm dừng TĐ',
    rangBuoc: 'Cấp Tập đoàn',
    tichHop: [],
    buocTomTat: ['Lập HS tạm dừng TĐ', 'Thẩm định / phê duyệt TĐ'],
    tacNhan: [{ nhom: 'PM / CQ / BTGĐ TĐ', vaiTro: 'Xét tạm dừng' }],
  },
  {
    ma: 'RD04.10',
    ten: 'Dừng NV KHCN (TĐ)',
    nhom: 'RD04',
    pha: 2,
    cap: 'TD',
    batDau: 'Đề nghị dừng cấp TĐ',
    ketThuc: 'QĐ dừng qua HĐ ĐGHT TĐ',
    rangBuoc: 'HĐ ĐGHT cấp Tập đoàn',
    tichHop: [],
    buocTomTat: ['Lập HS dừng TĐ', 'HĐ ĐGHT TĐ', 'Ban hành QĐ'],
    tacNhan: [{ nhom: 'PM / HĐ ĐGHT TĐ', vaiTro: 'Xét dừng' }],
  },
  // —— RD05 ——
  {
    ma: 'RD05.01',
    ten: 'Nghiệm thu NV KHCN cấp Cơ sở',
    nhom: 'RD05',
    pha: 1,
    cap: 'CS',
    batDau: 'Khởi tạo hồ sơ nghiệm thu cấp CS',
    ketThuc: 'TGĐ VHT phê duyệt QĐ công nhận kết quả',
    rangBuoc: 'Nội dung thực hiện (RD03) đã hoàn thành',
    tichHop: [],
    buocTomTat: [
      'PM lập & trình HS nghiệm thu',
      'CQ lập QĐ TL HĐNT → TGĐ phê duyệt',
      'HĐNT phiên 1&2 đánh giá → QĐ công nhận KQ',
    ],
    tacNhan: [
      { nhom: 'PM / PA / NNC', vaiTro: 'Khởi tạo; trình ký HS' },
      { nhom: 'BGĐ TT / Khối', vaiTro: 'Ký duyệt HS' },
      { nhom: 'CQ KHCN / MS / NS / TCKT', vaiTro: 'Thẩm định; ký' },
      { nhom: 'HĐNT cấp CS', vaiTro: 'PNX / PĐG / BB phiên 1–2' },
      { nhom: 'TGĐ VHT', vaiTro: 'Phê duyệt QĐ TL HĐNT & công nhận KQ' },
    ],
  },
  {
    ma: 'RD05.02',
    ten: 'Nghiệm thu NV KHCN cấp Tập đoàn',
    nhom: 'RD05',
    pha: 1,
    cap: 'TD',
    batDau: 'Khởi tạo nghiệm thu (sau chuỗi CS + CV đề nghị TĐ)',
    ketThuc: 'BTGĐ TĐ phê duyệt QĐ công nhận KQ',
    rangBuoc: 'RD03 hoàn thành; có Tổ KT tại HĐNT TĐ',
    tichHop: [],
    buocTomTat: [
      'Chuỗi CS + CV đề nghị nghiệm thu cấp TĐ',
      'HĐNT TĐ + Tổ KT đánh giá',
      'BTGĐ TĐ phê duyệt QĐ TL HĐNT & công nhận KQ',
    ],
    tacNhan: [
      { nhom: 'PM / CQ VHT', vaiTro: 'HS + CV đề nghị TĐ' },
      { nhom: 'CQ KHCN TĐ', vaiTro: 'Thẩm định; QĐ TL HĐNT TĐ' },
      { nhom: 'HĐNT TĐ / Tổ KT', vaiTro: 'Đánh giá; BBNT' },
      { nhom: 'BTGĐ TĐ', vaiTro: 'Phê duyệt QĐ công nhận KQ' },
    ],
  },
  // —— RD06 ——
  {
    ma: 'RD06.01',
    ten: 'Quyết toán NV KHCN cấp Cơ sở',
    nhom: 'RD06',
    pha: 1,
    cap: 'CS',
    batDau: 'Có QĐ công nhận kết quả NV',
    ketThuc: 'Phê duyệt Báo cáo quyết toán chi phí',
    rangBuoc: 'NV đã nghiệm thu; số liệu SAP',
    tichHop: ['SAP'],
    buocTomTat: [
      'Khởi tạo QT sau QĐ công nhận KQ',
      'Lập BC quyết toán từ số liệu thực chi',
      'Phê duyệt BC quyết toán cấp CS',
    ],
    tacNhan: [
      { nhom: 'PM / PA', vaiTro: 'Khởi tạo HS QT; neo mã NV–SAP; lập BM; trình ký' },
      { nhom: 'BGĐ TT / Khối', vaiTro: 'Ký duyệt HS QT nội bộ' },
      { nhom: 'CQ KHCN / MS / NS', vaiTro: 'Nhận xét phạm vi NV / mua sắm / nhân sự' },
      { nhom: 'TCKT', vaiTro: 'Đối soát SAP, quỹ, thanh toán, HĐ; lập BC QT' },
      { nhom: 'CQNV VHT', vaiTro: 'Thẩm định chung; trình phê duyệt' },
      { nhom: 'BTGĐ / TGĐ VHT', vaiTro: 'Phê duyệt BC quyết toán; khóa số' },
    ],
    ghiChu: '[GIẢ ĐỊNH] AS-RD06-01..04 — khảo sát BA 2026-09-29; chờ VTS OQ-043. Gốc §6.1.2 trống.',
  },
  {
    ma: 'RD06.02',
    ten: 'Quyết toán NV KHCN cấp Tập đoàn',
    nhom: 'RD06',
    pha: 1,
    cap: 'TD',
    batDau: 'Có QĐ công nhận kết quả NV',
    ketThuc: 'Phê duyệt BC quyết toán & khóa số cấp TĐ',
    rangBuoc: 'NV đã nghiệm thu; đối soát NV–SAP',
    tichHop: ['SAP', 'DTMS', 'KTTC'],
    buocTomTat: [
      'Khởi tạo & neo mã NV ↔ SAP',
      'Lập biểu mẫu / chứng từ đa đơn vị',
      'Thẩm định VHT → TĐ → phê duyệt & khóa số',
    ],
    tacNhan: [
      { nhom: 'PM / TCKT / TTMS / PNS', vaiTro: 'Pha A–B: khởi tạo & lập chứng từ song song' },
      { nhom: 'CQ chuyên môn + CQNV VHT', vaiTro: 'Pha C: thẩm định & ký trong VHT' },
      { nhom: 'CQ KHCN TĐ', vaiTro: 'Pha D: thẩm định Tập đoàn' },
      { nhom: 'BTGĐ TĐ', vaiTro: 'Pha E: phê duyệt BC QT & khóa số' },
    ],
    uiRoute: '/quy-trinh/rd06-02-du-lieu',
    uiLabel: 'Luồng dữ liệu RD06.02',
    ghiChu: '[GIẢ ĐỊNH] kế thừa CS + tuyến TĐ — OQ-043. Gốc §6.2.2 trống.',
  },
  // —— RD07–10 ——
  {
    ma: 'RD07',
    ten: 'Quản lý Danh mục SPDV nghiên cứu',
    nhom: 'RD07',
    pha: 2,
    cap: 'ALL',
    batDau: 'Khởi tạo hồ sơ danh mục SPDV',
    ketThuc: 'Cập nhật vòng đời: NC → NT → KD → cải tiến',
    rangBuoc: 'Đồng bộ CRM kinh doanh / doanh thu',
    tichHop: ['CRM'],
    buocTomTat: [
      'Đơn vị QL DM SPDV khởi tạo / xuất dữ liệu',
      'TT KD / TT NCSP / P.TCKT xây dựng & cập nhật',
      'Đồng bộ doanh thu với CRM',
    ],
    tacNhan: [
      { nhom: 'Đơn vị QL DM SPDV', vaiTro: 'Khởi tạo; xuất / cập nhật' },
      { nhom: 'TT KD VHT', vaiTro: 'Xây dựng / cập nhật hồ sơ' },
      { nhom: 'TT NCSP', vaiTro: 'Xây dựng / cập nhật (PM, BGĐ TT)' },
      { nhom: 'P.TCKT VHT', vaiTro: 'Xây dựng / cập nhật dữ liệu TC' },
    ],
    uiRoute: '/danh-muc-spdv',
    uiLabel: 'Danh mục SPDV',
  },
  {
    ma: 'RD08',
    ten: 'Quản lý sở hữu trí tuệ',
    nhom: 'RD08',
    pha: 1,
    cap: 'ALL',
    batDau: 'Đăng ký SHTT gắn NV KHCN',
    ketThuc: 'Hồ sơ SHTT / công nghệ lõi được lưu & đồng bộ Storage',
    rangBuoc: 'Gắn nghiệp vụ thực hiện đề tài; đồng bộ Storage',
    tichHop: ['Storage'],
    buocTomTat: [
      'Đăng ký bài báo / sáng chế',
      'Quản lý công nghệ lõi hình thành từ NV',
      'Đồng bộ tài liệu với kho lưu trữ',
    ],
    tacNhan: [
      { nhom: 'PM / Tác giả', vaiTro: 'Khởi tạo HS; cập nhật quyền sở hữu; trình duyệt' },
      { nhom: 'BGĐ TT / Khối', vaiTro: 'Xác nhận đơn vị chủ quản / tỷ lệ quyền' },
      { nhom: 'CQ QLKHCN', vaiTro: 'Thẩm định; theo dõi đăng ký bảo hộ' },
      { nhom: 'Pháp chế (nếu có)', vaiTro: 'Rà chủ sở hữu / hồ sơ nộp Cục SHTT' },
      { nhom: 'BTGĐ VHT', vaiTro: 'Phê duyệt trình nộp đơn nội bộ' },
    ],
    uiRoute: '/ho-so-shtt',
    uiLabel: 'Hồ sơ SHTT',
    ghiChu: '[GIẢ ĐỊNH] AS-RD08-01..04 — khảo sát BA 2026-09-29; chờ VTS OQ-044. Gốc §8 không có bảng tác nhân.',
  },
  {
    ma: 'RD09',
    ten: 'Dashboard tổng hợp thông tin',
    nhom: 'RD09',
    pha: 2,
    cap: 'ALL',
    batDau: 'Tổng hợp dữ liệu xuyên RD01–RD08',
    ketThuc: 'Hiển thị bức tranh theo đề tài / toàn bộ đề tài',
    rangBuoc: 'Near/real-time — ngưỡng trễ chưa chốt (OQ-016)',
    tichHop: ['SAP', 'QLNS', 'SHTT'],
    buocTomTat: [
      'Tổng hợp danh mục đề tài',
      'Chi phí / nhân sự / tài sản trí tuệ',
      'Lọc theo 1 đề tài hoặc toàn bộ',
    ],
    tacNhan: [{ nhom: 'Lãnh đạo / PM', vaiTro: 'Xem dashboard theo quyền (OQ-015)' }],
    uiRoute: '/tong-quan',
    uiLabel: 'Tổng quan hệ thống',
  },
  {
    ma: 'RD10',
    ten: 'Lưu trữ hồ sơ / biểu mẫu / quy định',
    nhom: 'RD10',
    pha: 1,
    cap: 'ALL',
    batDau: 'Quản lý form mẫu & cấu hình lưu trữ',
    ketThuc: 'Hồ sơ RD01–RD06 dùng form / kho chuẩn',
    rangBuoc: 'Master data biểu mẫu dùng chung; QĐ 1752 / BM-PYC',
    tichHop: ['Storage'],
    buocTomTat: [
      'Form mẫu hồ sơ đề tài & báo cáo',
      'Danh sách quy trình / quy định KHCN',
      'Kho tài liệu dự án (cây thư mục + PYC + đặt tên)',
    ],
    tacNhan: [
      { nhom: 'P.KHCN / PM', vaiTro: 'Dùng form & kho tài liệu' },
      { nhom: 'P.CNTT', vaiTro: 'Khai báo phân vùng (BM-PYC)' },
    ],
    uiRoute: '/kho-tai-lieu',
    uiLabel: 'Hồ sơ tài liệu dự án',
  },
];

export function luongsByNhom(nhom: string): RdLuong[] {
  return RD_LUONGS.filter((l) => l.nhom === nhom);
}

export function findLuong(ma: string): RdLuong | undefined {
  return RD_LUONGS.find((l) => l.ma === ma);
}
