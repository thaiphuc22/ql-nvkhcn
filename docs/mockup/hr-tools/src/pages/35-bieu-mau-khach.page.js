/* =============================================================================
 * Bốn biểu mẫu cứng còn lại của khách (kế hoạch §11).
 *
 * §11 liệt kê SÁU biểu mẫu. Ba cái khó nhất đã có artboard riêng ở file 30 (BM3, BM3.1, BM3.2) và
 * artboard 33 dựng quy cách khuôn in chung. File này dựng bốn cái còn lại **đúng hình bản giấy**:
 *
 *   34 · BM.06     — Danh sách nhân sự tham gia nhiệm vụ (BM1), 7 cột, độ khó THẤP
 *   35 · BM.03.01  — Bảng chấm công theo nội dung công việc (BM2.1), 47 cột, header 3 TẦNG
 *   36 · BM.04.02  — Bảng tổng hợp phân bổ CPNC nội bộ (BM4), độ khó trung bình
 *   37 · BM5       — Danh sách nhiệm vụ, có CỘT ĐỘNG theo tháng
 *
 * Vì sao vẽ bản giấy chứ không chỉ bảng trên màn: bốn cái này là văn bản trình ký (QĐ
 * 3021/QĐ-CNVTQĐ-CNCNC). Quốc hiệu, tiêu ngữ, dòng "Hà Nội, ngày…" và vùng ký là **nội dung bắt
 * buộc**, không phải trang trí — thiếu là văn bản không ký được.
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, bare, table, note, days31, money } = U;

/* Đầu văn bản dùng chung — 4 biểu mẫu chỉ khác nhau ở tiêu đề và dòng phụ đề. */
const dauVanBan = (soHieu) => `
  <div class="paper__head">
    <div class="paper__block" style="flex:0 0 340px">
      <div style="font-size:12px">TẬP ĐOÀN CÔNG NGHIỆP – VIỄN THÔNG QUÂN ĐỘI</div>
      <div style="font-size:13px;font-weight:700">TỔNG CÔNG TY CN CÔNG NGHỆ CAO VIETTEL</div>
      <div style="width:150px;border-top:1px solid #000;margin-top:4px"></div>
      <div style="font-size:12px;margin-top:4px">Số: ......./${soHieu}</div>
    </div>
    <div class="paper__block" style="flex:1 1 auto">
      <div style="font-size:13px;font-weight:700">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div style="font-size:14px;font-weight:700">Độc lập – Tự do – Hạnh phúc</div>
      <div style="width:220px;border-top:1px solid #000;margin-top:4px"></div>
      <div style="font-size:13px;font-style:italic;margin-top:8px">Hà Nội, ngày ..... tháng ..... năm 20.....</div>
    </div>
  </div>`;

const tieuDe = (ten, ma, phu = []) => `
  <div class="col" style="gap:4px">
    <div class="paper__title">${ten}</div>
    <div class="paper__sub">(Ban hành kèm theo Quyết định số 3021/QĐ-CNVTQĐ-CNCNC — mã biểu mẫu ${ma})</div>
    ${phu.map((p) => `<div class="paper__sub">${p}</div>`).join('')}
  </div>`;

const vungKy = (cot) => `
  <div class="paper__signs">
    ${cot.map((c) => `<div class="paper__sign"><strong>${c[0]}</strong><div>${c[1]}</div></div>`).join('')}
  </div>`;

const to = (body, w = 1240, wide = false) =>
  bare(
    `<div class="paper" style="width:${w}px;margin:0 auto;box-shadow:var(--vht-shadow-lg)">${body}</div>`,
    `background:var(--vht-gray-90);padding:32px ${wide ? '48px' : '0'}`,
    { wide },
  );

/* ================================================================== 34 · BM1 (BM.06) */
const NHANSU_BM1 = [
  ['801234', 'Trần Minh Quân', 'Kỹ sư chính', 'Thành viên', 'NDCV-01 Thiết kế khối cao tần', '08/04/2025', '31/12/2026'],
  ['805512', 'Lê Thị Hồng Nhung', 'Kỹ sư bậc 3', 'Thành viên', 'NDCV-02 Lập trình firmware', '08/04/2025', '31/12/2026'],
  ['807781', 'Phạm Văn Đức', 'Trợ lý dự án', 'PA — Trợ lý nhiệm vụ', 'NDCV-04 Quản lý tiến độ, báo cáo', '08/04/2025', '31/12/2026'],
  ['803095', 'Nguyễn Hoàng Anh', 'Kỹ sư bậc 1', 'Thành viên', 'NDCV-01 Thiết kế khối cao tần', '01/06/2025', '31/12/2026'],
  ['809442', 'Vũ Thị Thu Hà', 'Chuyên viên Công nghệ', 'Thành viên', 'NDCV-03 Kiểm thử tích hợp', '08/04/2025', '30/09/2026'],
  ['802217', 'Đỗ Quang Huy', 'Trưởng phòng ban', 'PM — Chủ nhiệm nhiệm vụ', 'NDCV-01, NDCV-02, NDCV-03, NDCV-04', '08/04/2025', '31/12/2026'],
];

const bm1 = () =>
  to(`
    ${dauVanBan('BM.06')}
    ${tieuDe('DANH SÁCH NHÂN SỰ THAM GIA NHIỆM VỤ KHOA HỌC CÔNG NGHỆ', 'BM.06', [
      'Nhiệm vụ: 011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần',
      'Đơn vị chủ trì: Trung tâm Chế tạo Điện tử Khí tài — Khối 1, TCT CNC',
    ])}
    ${table(
      [
        { t: 'TT', w: 'w-48', cls: 'tbl__th--center' },
        { t: 'Mã NV', w: 'w-90' },
        { t: 'Họ và tên', w: 'w-200' },
        { t: 'Chức danh', w: 'w-180' },
        { t: 'Vai trò tham gia', w: 'w-200' },
        { t: 'Nội dung công việc tham gia' },
        { t: 'Từ ngày', w: 'w-110', cls: 'tbl__th--center' },
        { t: 'Đến ngày', w: 'w-110', cls: 'tbl__th--center' },
      ],
      NHANSU_BM1.map((p, i) => [
        { h: String(i + 1), cls: 'tbl__td--center' },
        p[0], p[1], p[2], p[3], p[4],
        { h: p[5], cls: 'tbl__td--center' },
        { h: p[6], cls: 'tbl__td--center' },
      ]),
    )}
    <div style="font-size:12px;font-style:italic">Ghi chú: biểu mẫu này KHÔNG có cột tỷ lệ dự kiến. Trường <code>tyLePhanBo</code> trong hệ thống là tuỳ chọn, để trống là dạng dữ liệu đúng — xem câu hỏi Q4 với khách.</div>
    ${vungKy([
      ['Người lập biểu', 'Phạm Văn Đức'],
      ['Chủ nhiệm nhiệm vụ', 'Đỗ Quang Huy'],
      ['Lãnh đạo đơn vị chủ trì', '(Ký, ghi rõ họ tên)'],
    ])}
  `, 1300) +
  note('BM.06 — độ khó thấp, nhưng có hai chỗ dễ sai', [
    '<strong>Không có cột tỷ lệ.</strong> Bản giấy của khách chỉ 7 cột. Tự thêm cột "% dự kiến" cho đẹp là làm lệch biểu mẫu trình ký.',
    'Một người có thể tham gia <strong>nhiều nội dung công việc</strong> (dòng cuối) — ô này là danh sách, không phải một giá trị.',
    '"Vai trò tham gia" (PM/PA/Thành viên) là <code>VaiTroNhiemVu</code>, <strong>tách khỏi</strong> chức danh HRM ở cột bên cạnh. Hai cột này không được suy ra từ nhau.',
  ]);

/* ======================================================= 35 · BM2.1 (BM.03.01), 47 cột */
const W_DAY = 34;
const NGUOI_BM21 = [
  ['801234', 'Trần Minh Quân', 'NDCV-01', 21.0],
  ['805512', 'Lê Thị Hồng Nhung', 'NDCV-02', 20.0],
  ['807781', 'Phạm Văn Đức', 'NDCV-04', 21.0],
  ['803095', 'Nguyễn Hoàng Anh', 'NDCV-01', 19.5],
  ['809442', 'Vũ Thị Thu Hà', 'NDCV-03', 21.0],
];

/* Ô ngày của bản giấy: chỉ có số công hoặc ký hiệu, không tô màu — bản in đen trắng. */
const oNgay = (idx, d) => {
  if (d.d === 1 || d.d === 2) return 'DL';
  if (d.weekend) return '';
  if (idx === 1 && (d.d === 12 || d.d === 13)) return 'P';
  if (idx === 4 && d.d >= 19 && d.d <= 23) return 'P';
  return '8';
};

const congThang = (idx) =>
  days31.reduce((s, d) => s + (oNgay(idx, d) === '8' ? 1 : 0), 0);

const bm21 = () => {
  const headTang1 =
    `<div class="tbl__head">` +
    `<div class="tbl__th" style="width:${48 + 90 + 180 + 160}px">Thông tin nhân sự</div>` +
    `<div class="tbl__th tbl__th--center" style="width:${W_DAY * 31}px">Ngày trong tháng 05/2025</div>` +
    `<div class="tbl__th tbl__th--center" style="width:${110 + 110}px">Tổng hợp</div>` +
    `</div>`;

  const headTang2 =
    `<div class="tbl__head">` +
    `<div class="tbl__th w-48 tbl__th--center">TT</div>` +
    `<div class="tbl__th w-90">Mã NV</div>` +
    `<div class="tbl__th w-180">Họ và tên</div>` +
    `<div class="tbl__th w-160">Nội dung CV</div>` +
    days31
      .map(
        (d) =>
          `<div class="tbl__th tbl__th--center" style="width:${W_DAY}px${d.weekend ? ';background:var(--vht-gray-90)' : ''}">${d.d}</div>`,
      )
      .join('') +
    `<div class="tbl__th w-110 tbl__th--num">Công phân bổ</div>` +
    `<div class="tbl__th w-110 tbl__th--num">Công tính lương</div>` +
    `</div>`;

  const headTang3 =
    `<div class="tbl__head">` +
    `<div class="tbl__th" style="width:${48 + 90 + 180 + 160}px"></div>` +
    days31
      .map(
        (d) =>
          `<div class="tbl__th tbl__th--center" style="width:${W_DAY}px${d.weekend ? ';background:var(--vht-gray-90)' : ''}">${d.dow}</div>`,
      )
      .join('') +
    `<div class="tbl__th" style="width:${110 + 110}px"></div>` +
    `</div>`;

  const rows = NGUOI_BM21.map((p, i) => {
    const cells = days31
      .map(
        (d) =>
          `<div class="tbl__td tbl__td--center" style="width:${W_DAY}px${d.weekend ? ';background:var(--vht-gray-95)' : ''}">${oNgay(i, d)}</div>`,
      )
      .join('');
    return (
      `<div class="tbl__row">` +
      `<div class="tbl__td w-48 tbl__td--center">${i + 1}</div>` +
      `<div class="tbl__td w-90">${p[0]}</div>` +
      `<div class="tbl__td w-180">${p[1]}</div>` +
      `<div class="tbl__td w-160">${p[2]}</div>` +
      cells +
      `<div class="tbl__td w-110 tbl__td--num">${String(congThang(i)).replace('.', ',')},0</div>` +
      `<div class="tbl__td w-110 tbl__td--num">${String(p[3]).replace('.', ',')}</div>` +
      `</div>`
    );
  }).join('');

  const tong = NGUOI_BM21.reduce((s, _, i) => s + congThang(i), 0);
  const rowTong =
    `<div class="tbl__row tbl__row--total">` +
    `<div class="tbl__td" style="width:${48 + 90}px"></div>` +
    `<div class="tbl__td" style="width:${180 + 160}px"><strong>Tổng cộng</strong></div>` +
    days31.map(() => `<div class="tbl__td" style="width:${W_DAY}px"></div>`).join('') +
    `<div class="tbl__td w-110 tbl__td--num"><strong>${String(tong)},0</strong></div>` +
    `<div class="tbl__td w-110 tbl__td--num"><strong>102,5</strong></div>` +
    `</div>`;

  return (
    to(
      `
    ${dauVanBan('BM.03.01')}
    ${tieuDe('BẢNG CHẤM CÔNG THEO NỘI DUNG CÔNG VIỆC', 'BM.03.01', [
      'Kỳ: tháng 05 năm 2025 — Đơn vị: Trung tâm Chế tạo Điện tử Khí tài',
      'Nhiệm vụ: 011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần',
    ])}
    <div class="tbl">${headTang1}${headTang2}${headTang3}${rows}${rowTong}</div>
    <div style="font-size:12px;font-style:italic">Ký hiệu: <strong>8</strong> = 8 giờ công phân bổ cho nội dung công việc ở cột bên trái · <strong>P</strong> = nghỉ phép · <strong>DL</strong> = nghỉ lễ · ô trống = thứ Bảy, Chủ nhật hoặc không phân bổ. Ký hiệu lấy nguyên từ bảng công BM0 do HR nhập, không nhập lại tay.</div>
    ${vungKy([
      ['Người lập biểu', 'Phạm Văn Đức'],
      ['Chủ nhiệm nhiệm vụ', 'Đỗ Quang Huy'],
      ['Phòng Nhân sự', 'Nguyễn Thu Hà'],
      ['Lãnh đạo đơn vị', '(Ký, ghi rõ họ tên)'],
    ])}
  `,
      48 + 90 + 180 + 160 + W_DAY * 31 + 110 + 110 + 96,
      true,
    ) +
    note('BM.03.01 — biểu mẫu khó thứ hai của cả bộ (47 cột, header 3 tầng)', [
      'Header <strong>ba tầng có merge</strong>: tầng 1 gộp 31 cột ngày thành một ô "Ngày trong tháng"; tầng 2 là số ngày; tầng 3 là thứ. Ở HTML mỗi tầng là một hàng flex, ô "merge" là một div có bề rộng bằng TỔNG bề rộng các cột con — không dùng <code>colspan</code> vì bảng ở đây dựng bằng div (luật 6).',
      '<strong>Quyết định còn cần lấy:</strong> <code>export-bieu-mau.ts</code> xuất <code>.xls</code> bằng bảng HTML nên giữ được rowspan/colspan — header đa tầng ra đúng hình. Nhưng KHÔNG kiểm soát được bề rộng cột, freeze pane và định dạng số. Kế hoạch đề nghị <strong>thử đúng biểu mẫu này trước</strong>; khách không chấp nhận thì mới bàn thêm SheetJS.',
      'Cột <strong>Công tính lương</strong> lấy từ BM0, KHÔNG phải tổng của 31 ô. Hai số này lệch nhau là chuyện bình thường (HRM có điều chỉnh tay) — và chính vì thế công thức CPNC mới cần cả hai.',
      'Bản in đen trắng: ô ngày <strong>không tô màu</strong>. Màu chỉ dùng trên màn hình (artboard 25–27) để phân biệt nội dung công việc.',
    ])
  );
};

/* ================================================================ 36 · BM4 (BM.04.02) */
const BM4_ROWS = [
  ['011-24-TĐ-RDP-QS', 'Nghiên cứu chế tạo khối thu phát cao tần', 'KHCN', 1850000000, 642900000, 34.8, 96000000, 1207100000],
  ['012-24-PAKD-CAM', 'Phương án kinh doanh camera AI thế hệ 2', 'SXKD', 980000000, 415200000, 42.4, 62000000, 564800000],
  ['013-25-TĐ-DTPT', 'Đầu tư phát triển dây chuyền SMT', 'ĐTPT', 1240000000, 1310500000, 105.7, 88000000, -70500000],
  ['014-24-BH-RAD', 'Bảo hành đài radar cảnh giới', 'Bảo hành', null, 148300000, null, 21000000, null],
  ['—', 'Nhiệm vụ khác / Chi phí quản lý (hệ thống tự sinh)', 'Quản lý', null, 386400000, null, 54000000, null],
];

const bm4 = () =>
  to(`
    ${dauVanBan('BM.04.02')}
    ${tieuDe('BẢNG TỔNG HỢP PHÂN BỔ CHI PHÍ NHÂN CÔNG NỘI BỘ', 'BM.04.02', [
      'Kỳ lương: tháng 05 năm 2025 — Kỳ trả: tháng 06 năm 2025',
      'Đơn vị: Trung tâm Chế tạo Điện tử Khí tài — Khối 1, TCT CNC',
    ])}
    ${table(
      [
        { t: 'TT', w: 'w-48', cls: 'tbl__th--center' },
        { t: 'Mã nhiệm vụ', w: 'w-160' },
        { t: 'Tên nhiệm vụ' },
        { t: 'Nguồn', w: 'w-90', cls: 'tbl__th--center' },
        { t: 'Nguồn đã lập dự toán', w: 'w-160', cls: 'tbl__th--num' },
        { t: 'CPNC đã phân bổ luỹ kế', w: 'w-160', cls: 'tbl__th--num' },
        { t: 'Tỷ lệ (%)', w: 'w-90', cls: 'tbl__th--num' },
        { t: 'CPNC kỳ này', w: 'w-140', cls: 'tbl__th--num' },
        { t: 'Nguồn còn lại', w: 'w-140', cls: 'tbl__th--num' },
      ],
      BM4_ROWS.map((r, i) => [
        { h: String(i + 1), cls: 'tbl__td--center' },
        r[0], r[1],
        { h: r[2], cls: 'tbl__td--center' },
        { h: money(r[3]), cls: 'tbl__td--num' },
        { h: money(r[4]), cls: 'tbl__td--num' },
        { h: r[5] === null ? '' : String(r[5]).replace('.', ','), cls: 'tbl__td--num' },
        { h: money(r[6]), cls: 'tbl__td--num' },
        { h: money(r[7]), cls: 'tbl__td--num' },
      ]).concat([
        [
          '', '', { h: '<strong>Tổng cộng</strong>' }, '',
          { h: `<strong>${money(4070000000)}</strong>`, cls: 'tbl__td--num' },
          { h: `<strong>${money(2903300000)}</strong>`, cls: 'tbl__td--num' },
          '',
          { h: `<strong>${money(321000000)}</strong>`, cls: 'tbl__td--num' },
          { h: `<strong>${money(1701400000)}</strong>`, cls: 'tbl__td--num' },
        ],
      ]),
      { rowCls: (i) => (i === 5 ? 'tbl__row--total' : i === 2 ? 'tbl__row--warn' : '') },
    )}
    <div style="font-size:12px;font-style:italic">Ghi chú: nguồn <strong>Bảo hành</strong> chỉ theo dõi số đã phân bổ, không lập dự toán ⇒ cột "Nguồn đã lập dự toán", "Tỷ lệ" và "Nguồn còn lại" để <strong>TRỐNG</strong>, không ghi 0. Nguồn <strong>Quản lý</strong> do hệ thống tự gán cho công thừa, người dùng không chọn được.</div>
    ${vungKy([
      ['Người lập biểu', 'Phạm Văn Đức'],
      ['Phòng Nhân sự', 'Nguyễn Thu Hà'],
      ['Phòng Tài chính', '(Ký, ghi rõ họ tên)'],
      ['Lãnh đạo đơn vị', '(Ký, ghi rõ họ tên)'],
    ])}
  `, 1400) +
  note('BM.04.02 — ba con số dễ bị "làm đẹp" sai', [
    'Dòng <strong>013-25-TĐ-DTPT</strong>: tỷ lệ <strong>105,7%</strong> và nguồn còn lại <strong>−70.500.000</strong>. Số âm là <strong>dữ liệu đúng</strong> và là lý do biểu mẫu này tồn tại — clamp về 0 là giấu mất đúng thứ lãnh đạo cần thấy.',
    'Dòng <strong>014-24-BH-RAD</strong> (Bảo hành): ô trống, <strong>không phải số 0</strong>. Ghi 0 thì người đọc hiểu là "đã hết nguồn" trong khi thực tế là "nguồn này không lập dự toán".',
    'Dòng cuối <strong>Chi phí quản lý</strong> do hệ thống tự sinh từ quy tắc công thừa (§4.3). Câu hỏi Q6 với khách: đây là <em>một</em> nhiệm vụ ảo dùng chung toàn VHT, hay mỗi đơn vị một cái? Mockup đang giả định mỗi đơn vị một dòng.',
  ]);

/* ===================================================================== 37 · BM5 */
const THANG = ['01', '02', '03', '04', '05', '06'];
const BM5_ROWS = [
  ['011-24-TĐ-RDP-QS', 'Nghiên cứu chế tạo khối thu phát cao tần', 'KHCN', 'ĐT.2024.017', 'Trung tâm CHĐK', 'Đang phân bổ', [88, 92, 105, 118, 121, 118]],
  ['012-24-PAKD-CAM', 'Phương án kinh doanh camera AI thế hệ 2', 'PAKD', '', 'Trung tâm Camera', 'Đang phân bổ', [64, 71, 70, 78, 82, 50]],
  ['013-25-TĐ-DTPT', 'Đầu tư phát triển dây chuyền SMT', 'ĐTPT', '', 'Trung tâm CĐT', 'Đang phân bổ', [0, 0, 96, 142, 168, 174]],
  ['014-24-BH-RAD', 'Bảo hành đài radar cảnh giới', 'QPAN', 'ĐT.2022.004', 'Trung tâm ĐBCL', 'Đã hết hạn', [32, 28, 30, 26, 21, 11]],
  ['015-25-TĐ-RDP-QS', 'Nghiên cứu vật liệu hấp thụ sóng', 'KHCN', 'ĐT.2025.003', 'Trung tâm CHĐK', 'Đang trình phê duyệt', [0, 0, 0, 0, 0, 0]],
];

const bm5 = () =>
  to(
    `
    ${dauVanBan('BM.05')}
    ${tieuDe('DANH SÁCH NHIỆM VỤ VÀ CHI PHÍ NHÂN CÔNG PHÂN BỔ THEO THÁNG', 'BM5', [
      'Kỳ báo cáo: 6 tháng đầu năm 2025 — Đơn vị: Khối 1, TCT CNC',
    ])}
    <div class="tbl">
      <div class="tbl__head">
        <div class="tbl__th" style="width:${48 + 160 + 300 + 90 + 140 + 180 + 170}px">Thông tin nhiệm vụ</div>
        <div class="tbl__th tbl__th--center" style="width:${110 * 6}px">CPNC phân bổ theo tháng (triệu đồng) — CỘT ĐỘNG</div>
        <div class="tbl__th tbl__th--num" style="width:140px">Luỹ kế</div>
      </div>
      <div class="tbl__head">
        <div class="tbl__th w-48 tbl__th--center">TT</div>
        <div class="tbl__th w-160">Mã nhiệm vụ</div>
        <div class="tbl__th w-300">Tên nhiệm vụ</div>
        <div class="tbl__th w-90 tbl__th--center">Phân loại</div>
        <div class="tbl__th w-140">Mã đề tài</div>
        <div class="tbl__th w-180">Đơn vị chủ trì</div>
        <div class="tbl__th w-170">Tình trạng phân bổ</div>
        ${THANG.map((t) => `<div class="tbl__th tbl__th--num" style="width:110px">T${t}/2025</div>`).join('')}
        <div class="tbl__th tbl__th--num" style="width:140px"></div>
      </div>
      ${BM5_ROWS.map((r, i) => {
        const luyKe = r[6].reduce((a, b) => a + b, 0);
        return (
          `<div class="tbl__row">` +
          `<div class="tbl__td w-48 tbl__td--center">${i + 1}</div>` +
          `<div class="tbl__td w-160">${r[0]}</div>` +
          `<div class="tbl__td w-300">${r[1]}</div>` +
          `<div class="tbl__td w-90 tbl__td--center">${r[2]}</div>` +
          `<div class="tbl__td w-140">${r[3] || '—'}</div>` +
          `<div class="tbl__td w-180">${r[4]}</div>` +
          `<div class="tbl__td w-170">${r[5]}</div>` +
          r[6]
            .map((v) => `<div class="tbl__td tbl__td--num" style="width:110px">${v ? money(v) : '—'}</div>`)
            .join('') +
          `<div class="tbl__td tbl__td--num" style="width:140px"><strong>${money(luyKe)}</strong></div>` +
          `</div>`
        );
      }).join('')}
    </div>
    <div style="font-size:12px;font-style:italic">Cột <strong>Mã đề tài</strong> để trống là hợp lệ: nhiệm vụ HR <strong>không</strong> nhất thiết thuộc một đề tài KHCN — quan hệ là tham chiếu <code>maDeTai</code> có thể rỗng, không phải quan hệ cha–con (chốt 2026-08-26).</div>
    ${vungKy([
      ['Người lập biểu', 'Nguyễn Thu Hà'],
      ['Phòng Nhân sự', '(Ký, ghi rõ họ tên)'],
      ['Ban Giám đốc Khối', '(Ký, ghi rõ họ tên)'],
    ])}
  `,
    48 + 160 + 300 + 90 + 140 + 180 + 170 + 110 * 6 + 140 + 96,
    true,
  ) +
  note('BM5 — cột động theo tháng là phần phải thiết kế trước, không sửa sau', [
    'Số cột tháng <strong>thay đổi theo kỳ báo cáo</strong>: 6 cột cho báo cáo 6 tháng, 12 cột cho báo cáo năm, 3 cột cho quý. Component bảng phải nhận mảng cột, không được khai cứng.',
    'Đây cũng là biểu mẫu <strong>xuất kèm cảnh báo "nhiệm vụ sắp hết nguồn"</strong> cho toàn VHT (artboard 45) — dùng chính dãy tháng này để ngoại suy 2 tháng tới.',
    'Ô CPNC bằng 0 hiện <strong>—</strong> chứ không hiện <code>0</code>: nhiệm vụ chưa bắt đầu và nhiệm vụ đã tiêu hết 0 đồng là hai chuyện khác nhau.',
    '<code>Mã đề tài</code> rỗng là hợp lệ. Đây là chỗ dễ bị "sửa cho sạch dữ liệu" nhất — đừng.',
  ]);

module.exports = [
  { code: '34', group: '3 · Biểu mẫu CPNC', title: 'BM.06 Danh sách nhân sự tham gia', desc: 'Bản in BM1 — 8 cột, không có cột tỷ lệ', body: bm1 },
  { code: '35', group: '3 · Biểu mẫu CPNC', title: 'BM.03.01 Bảng chấm công theo nội dung CV', desc: 'Bản in BM2.1 — 47 cột, header 3 tầng — khổ rộng', body: bm21 },
  { code: '36', group: '3 · Biểu mẫu CPNC', title: 'BM.04.02 Bảng tổng hợp phân bổ CPNC', desc: 'Bản in BM4 — có số âm và ô để trống', body: bm4 },
  { code: '37', group: '3 · Biểu mẫu CPNC', title: 'BM5 Danh sách nhiệm vụ', desc: 'Bản in — cột động theo tháng — khổ rộng', body: bm5 },
];
