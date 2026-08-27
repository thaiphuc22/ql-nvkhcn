/* =============================================================================
 * Ba màn của module Nhiệm vụ mà bộ dựng 2026-08-26 còn thiếu — rà lại theo tài liệu khách
 * 2026-08-27 (`docs/hr_tool/trich-xuat/phan-ra-chuc-nang.md`).
 *
 *   1K · Hồ sơ đính kèm nhiệm vụ   — `MotaCV` §I.1: *"Kèm upload bản ký đề tài được phê duyệt"*
 *   1L · Danh sách nội dung công việc — `Book1` §1.2 liệt kê "DS công việc" là tính năng CRUD
 *        **độc lập**, đủ `Danh sách · Chi tiết · CRUD · Import · Export`, ngang hàng với Nhiệm vụ
 *        và DS nhân sự. Bộ cũ chỉ có nó dưới dạng một tab trong màn chi tiết nhiệm vụ (1E).
 *   1P · Bảng lương mục tiêu        — `MotaCV` §I.3: *"Cập nhật bảng lương mục tiêu … xuất báo cáo
 *        thông tin đề tài, tính CPNC dự kiến, luỹ kế CPNC và thời gian tham gia đến hiện tại"*
 *
 * Ba màn này **chưa code**, khác nhóm 1x — nên ở đây artboard là bản vẽ đề xuất, không phải bản
 * chụp lại code đang chạy.
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, frame, pageHead, btn, input, select, search, field, tag, table, tableFoot, rowActions, note, money } = U;

const STT = { t: 'STT', w: 'w-56', cls: 'tbl__th--center' };

/* Thanh chọn nhiệm vụ — dùng lại ở cả 1K và 1P. Ô tìm theo mã HOẶC tên, đúng sheet 2.Chấm công. */
const chonNhiemVu = () => `
  <div class="card">
    <div class="row row--wrap" style="gap:12px;align-items:flex-end">
      <div style="flex:1 1 520px">${field('Nhiệm vụ', input('011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần', { icon: 'search' }), { required: true, help: 'Gõ mã hoặc tên nhiệm vụ. Chưa có thì tạo mới hoặc nhập từ BM5.' })}</div>
      <div style="flex:0 0 220px">${field('Phân loại', input('Đề tài KHCN', { state: 'readonly' }))}</div>
      <div style="flex:0 0 260px">${field('Đơn vị chủ trì', input('Trung tâm CHĐK · Khối 1', { state: 'readonly' }))}</div>
      <div style="flex:0 0 200px">${field('Trạng thái', tag('Đang phân bổ', 'success'))}</div>
    </div>
  </div>`;

/* ================================================== 1K · Hồ sơ đính kèm nhiệm vụ */
const TAILIEU = [
  ['Quyết định phê duyệt nhiệm vụ', 'QD-3417-phe-duyet-011-24.pdf', '3417/QĐ-CNC · 08/04/2025', 'Nguyễn Thu Hà', '09/04/2025', 'ok'],
  ['Bản ký danh sách nhân sự (BM.06)', 'BM06-DS-nhan-su-011-24-ky.pdf', '412/TTr-CNC · 15/04/2025', 'Phạm Văn Đức', '16/04/2025', 'ok'],
  ['Quyết định điều chỉnh CPNC', 'QD-5120-dieu-chinh-CPNC.pdf', '5120/QĐ-CNC · 02/12/2025', 'Nguyễn Thu Hà', '03/12/2025', 'ok'],
  ['Thuyết minh nhiệm vụ', 'Thuyet-minh-011-24-v3.docx', '— (tài liệu tham khảo)', 'Đỗ Quang Huy', '08/04/2025', 'phu'],
  ['Bản ký điều chỉnh nhân sự lần 2', '—', '—', '—', '—', 'thieu'],
];
const TT_TL = {
  ok: tag('Đã ký, còn hiệu lực', 'success'),
  phu: tag('Tài liệu tham khảo', 'info'),
  thieu: tag('Chưa có bản ký', 'danger'),
};

const hoSoDinhKem = () =>
  frame(
    'ho-so-nhiem-vu',
    `<div class="page">
      ${pageHead('Hồ sơ đính kèm nhiệm vụ', 'MotaCV §I.1 — mỗi lần mở hoặc điều chỉnh nhiệm vụ đều phải kèm bản ký được phê duyệt. Đây là chứng từ gốc của con số "CPNC được phê duyệt", không phải tệp trang trí.', `${btn('Tải tất cả (.zip)', { icon: 'download', variant: 'secondary' })}${btn('Tải tài liệu lên', { icon: 'upload' })}`)}
      ${chonNhiemVu()}

      <div class="card">
        <div class="card__head">
          <div class="card__title">Tài liệu của nhiệm vụ</div>
          <div class="row">${select('Tất cả loại tài liệu', { placeholder: true })}${search('Tìm theo tên tệp hoặc số văn bản')}</div>
        </div>

        <div class="alert alert--warn">${ico('alert', 18)}
          <div class="alert__body"><div class="alert__title">Thiếu 1 bản ký bắt buộc — nhiệm vụ vẫn chấm công được, nhưng không đóng được</div>
          <div>Điều chỉnh nhân sự lần 2 (ngày 01/06/2025) chưa có bản ký kèm theo. Nút <strong>Đóng nhiệm vụ</strong> (artboard 62) chặn khi còn dòng "Chưa có bản ký".</div></div>
        </div>

        ${table(
          [
            STT,
            { t: 'Thao tác', w: 'w-90' },
            { t: 'Loại tài liệu', w: 'w-180' },
            { t: 'Tên tệp' },
            { t: 'Số / ngày văn bản', w: 'w-160' },
            { t: 'Người tải lên', w: 'w-140' },
            { t: 'Ngày tải', w: 'w-120', cls: 'tbl__th--center' },
            { t: 'Trạng thái', w: 'w-120', cls: 'tbl__th--center' },
          ],
          TAILIEU.map((t, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            t[5] === 'thieu'
              ? `<div class="actions">${btn('', { icon: 'upload', variant: 'ghost', sm: true, cls: 'btn--icon' })}</div>`
              : `<div class="actions">${btn('', { icon: 'eye', variant: 'ghost', sm: true, cls: 'btn--icon' })}${btn('', { icon: 'download', variant: 'ghost', sm: true, cls: 'btn--icon' })}</div>`,
            t[0],
            t[1] === '—' ? '<span class="muted">— chưa tải lên —</span>' : `<div class="row" style="gap:8px">${ico('file', 16)}<span class="code-link">${t[1]}</span></div>`,
            t[2],
            t[3],
            { h: t[4], cls: 'tbl__td--center' },
            { h: TT_TL[t[5]], cls: 'tbl__td--center' },
          ]),
          { rowCls: (i) => (TAILIEU[i][5] === 'thieu' ? 'tbl__row--warn' : '') },
        )}

        <div class="dropzone">
          ${ico('upload', 24)}
          <div class="strong">Kéo tệp vào đây hoặc bấm để chọn</div>
          <div class="caption">PDF, DOCX, XLSX · tối đa 20 MB mỗi tệp · bản ký phải là <strong>PDF có chữ ký số hoặc bản scan</strong></div>
        </div>
        ${tableFoot(5, { perPage: 25, pages: [1] })}
      </div>
    </div>`,
  ) +
  note('Hồ sơ đính kèm — vì sao là màn riêng chứ không phải một ô upload trong form khai báo', [
    'Khách yêu cầu upload <strong>mỗi lần mở HOẶC điều chỉnh</strong> nhiệm vụ (MotaCV §I.1) ⇒ một nhiệm vụ có <strong>nhiều</strong> bản ký theo thời gian, không phải một tệp duy nhất. Một ô upload trong form khai báo chỉ chứa được cái mới nhất và ghi đè lịch sử.',
    'Cột <strong>Số / ngày văn bản</strong> là bắt buộc với bản ký, tuỳ chọn với tài liệu tham khảo. Đây là thứ đối chiếu khi kiểm toán hỏi "con số 1.850.000.000 ₫ căn cứ vào đâu".',
    'Dòng <strong>Chưa có bản ký</strong> vẫn hiện trong bảng thay vì ẩn đi — nghiệp vụ cần thấy chỗ thiếu, không cần một danh sách sạch. Đây cũng là điều kiện chặn ở nút Đóng nhiệm vụ.',
    'Tệp lưu ở kho tài liệu chung của hệ thống, <strong>không</strong> nhét vào Camunda và <strong>không</strong> lưu blob trong bảng nghiệp vụ — quyết định D3 (Camunda chỉ giữ biến điều phối).',
  ]);

/* ============================================ 1L · Danh sách nội dung công việc (DS công việc) */
const NDCV_ROWS = [
  ['NDCV-01', 'Thiết kế khối cao tần', '011-24-TĐ-RDP-QS', 'Thiết kế', 620000000, 214500000, 435500000, 4],
  ['NDCV-02', 'Lập trình firmware', '011-24-TĐ-RDP-QS', 'Phát triển', 480000000, 188200000, 315800000, 3],
  ['NDCV-03', 'Kiểm thử tích hợp', '011-24-TĐ-RDP-QS', 'Kiểm thử', 310000000, 96400000, 228600000, 2],
  ['NDCV-04', 'Quản lý tiến độ, báo cáo', '011-24-TĐ-RDP-QS', 'Quản lý dự án', 140000000, 61800000, 85200000, 1],
  ['NDCV-11', 'Sản xuất loạt 0', '012-24-PAKD-CAM', 'Phát triển', 890000000, 512300000, 407700000, 8],
  ['NDCV-12', 'Hiệu chỉnh dây chuyền', '012-24-PAKD-CAM', 'Phát triển', 260000000, 288400000, -28400000, 3],
  ['NDCV-21', 'Hỗ trợ bán hàng', '012-24-PAKD-CAM', 'Triển khai', 120000000, 43100000, 76900000, 2],
  ['NDCV-31', 'Xử lý lỗi bảo hành', '012-24-PAKD-CAM', 'Triển khai', null, 91700000, null, 5],
];

const noiDungCongViec = () =>
  frame(
    'noi-dung-cv',
    `<div class="page">
      ${pageHead('Nội dung công việc', 'Book1 §1.2 liệt kê "DS công việc" là tính năng CRUD độc lập, đủ Danh sách · Chi tiết · CRUD · Import · Export — ngang hàng với Nhiệm vụ và DS nhân sự, không chỉ là một tab trong màn chi tiết nhiệm vụ.', `${btn('Nhập từ Excel', { icon: 'upload', variant: 'secondary' })}${btn('Xuất Excel', { icon: 'download', variant: 'secondary' })}${btn('Thêm nội dung công việc', { icon: 'plus' })}`)}
      <div class="card">
        <div class="filters">
          <div class="filters__left">${tag('8 nội dung CV · 2 nhiệm vụ', 'info')}</div>
          ${select('Tất cả nhiệm vụ', { placeholder: true })}${select('Tất cả nhóm công việc', { placeholder: true })}${search('Tìm theo mã hoặc tên nội dung công việc')}
        </div>

        ${table(
          [
            STT,
            { t: 'Thao tác', w: 'w-90' },
            { t: 'Mã', w: 'w-110' },
            { t: 'Tên nội dung công việc' },
            { t: 'Thuộc nhiệm vụ', w: 'w-180' },
            { t: 'CPNC được duyệt', w: 'w-140', cls: 'tbl__th--num' },
            { t: 'Đã phân bổ', w: 'w-140', cls: 'tbl__th--num' },
            { t: 'Còn lại', w: 'w-140', cls: 'tbl__th--num' },
          ],
          NDCV_ROWS.map((r, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            rowActions(),
            `<span class="code-link">${r[0]}</span>`,
            `<div class="col" style="gap:2px"><span>${r[1]}</span><span class="caption">${r[3]} · ${r[7]} nhân sự tham gia</span></div>`,
            `<span class="code-link">${r[2]}</span>`,
            { h: r[4] === null ? '<span class="muted">—</span>' : money(r[4]), cls: 'tbl__td--num' },
            { h: money(r[5]), cls: 'tbl__td--num' },
            {
              h:
                r[6] === null
                  ? '<span class="muted">—</span>'
                  : r[6] < 0
                    ? `<strong style="color:var(--vht-brand-40)">${money(r[6])}</strong>`
                    : money(r[6]),
              cls: 'tbl__td--num',
            },
          ]),
          { rowCls: (i) => (NDCV_ROWS[i][6] !== null && NDCV_ROWS[i][6] < 0 ? 'tbl__row--warn' : '') },
        )}
        ${tableFoot(118, { pages: [1, 2, 3, '…', 5] })}
      </div>
    </div>`,
  ) +
  note('Nội dung công việc — thực thể trung tâm của cả phân hệ, phải có màn riêng', [
    'Bốn biểu mẫu ăn thẳng vào nó: <strong>BM1</strong> (cột "nội dung CV tham gia"), <strong>BM2.1/2.2</strong> (gom dòng theo nội dung CV), <strong>BM3.1</strong> (bảng lương gom theo nội dung CV), <strong>BM4</strong>. Không có màn quản lý riêng thì mọi sửa đổi phải chui qua màn chi tiết nhiệm vụ từng cái một.',
    'Dòng <strong>NDCV-12 âm 28.400.000 ₫</strong> là dữ liệu hợp lệ, không phải lỗi: đã phân bổ vượt dự toán. Báo cáo 41 cũng cho phép số âm — <strong>đừng clamp về 0</strong>.',
    'Dòng <strong>NDCV-31 (nguồn Bảo hành)</strong> để TRỐNG cột được duyệt và còn lại, không hiện <code>0</code>: Bảo hành chỉ theo dõi số đã phân bổ, không lập dự toán. Hiện 0 là nói sai rằng dự toán bằng không.',
    '<strong>Import</strong> ở màn này khác import BM5: BM5 nhập cả nhiệm vụ kèm nội dung CV; màn này nhập bổ sung nội dung CV cho nhiệm vụ đã có. Hai bộ luật validate khác nhau, dùng chung <code>shared/hr/import-preview/</code>.',
    'Ràng buộc <strong>1 ngày = 1 nội dung CV</strong> cho một người sống ở tầng <code>PhanBoCong</code> (màn chấm công), <strong>không</strong> ở đây. Ghi chú chéo trong code để người đọc không đi tìm nhầm chỗ.',
  ]);

/* ================================================== 1P · Bảng lương mục tiêu */
const LUONG_MT = [
  ['801234', 'Trần Minh Quân', 'Kỹ sư chính', 35410000, '04/2025 – 12/2026', 21, 743610000, 177050000],
  ['805512', 'Lê Thị Hồng Nhung', 'Kỹ sư bậc 3', 27180000, '04/2025 – 12/2026', 21, 570780000, 135900000],
  ['807781', 'Phạm Văn Đức', 'Trợ lý dự án', 22450000, '04/2025 – 12/2026', 21, 471450000, 112250000],
  ['803095', 'Nguyễn Hoàng Anh', 'Kỹ sư bậc 1', 18900000, '06/2025 – 12/2026', 19, 359100000, 0],
  ['809442', 'Vũ Thị Thu Hà', 'Chuyên viên Công nghệ', 24600000, '04/2025 – 09/2026', 18, 442800000, 123000000],
];

const luongMucTieu = () => {
  const tongDuKien = LUONG_MT.reduce((s, r) => s + r[6], 0);
  const tongLuyKe = LUONG_MT.reduce((s, r) => s + r[7], 0);
  return (
    frame(
      'luong-muc-tieu',
      `<div class="page">
      ${pageHead('Bảng lương mục tiêu', 'MotaCV §I.3 — HR cập nhật khi có thay đổi kiện toàn mô hình hoặc mức lương. Đây là căn cứ tính CPNC DỰ KIẾN của cả vòng đời nhiệm vụ, khác hẳn bảng lương tháng BM0 (số thực tế đã trả).', `${btn('Nhập từ Excel', { icon: 'upload', variant: 'secondary' })}${btn('Xuất báo cáo CPNC dự kiến', { icon: 'download' })}`)}
      ${chonNhiemVu()}

      <div class="card">
        <div class="stats">
          <div class="stat"><small>CPNC được phê duyệt</small><strong>1.850.000.000 ₫</strong></div>
          <div class="stat"><small>CPNC dự kiến cả vòng đời</small><strong>${money(tongDuKien)} ₫</strong></div>
          <div class="stat stat--warn"><small>Chênh so với phê duyệt</small><strong>+${money(tongDuKien - 1850000000)} ₫</strong></div>
          <div class="stat stat--ok"><small>Luỹ kế đã phân bổ đến 05/2025</small><strong>${money(tongLuyKe)} ₫</strong></div>
        </div>

        <div class="alert alert--warn">${ico('alert', 18)}
          <div class="alert__body"><div class="alert__title">CPNC dự kiến vượt mức được phê duyệt ${money(tongDuKien - 1850000000)} ₫</div>
          <div>Ngoại suy theo mức lương mục tiêu và thời gian tham gia hiện khai. Cảnh báo <strong>không chặn lưu</strong> — nghiệp vụ có thể chấp nhận rồi điều chỉnh nhân sự hoặc xin bổ sung dự toán sau.</div></div>
        </div>

        ${table(
          [
            STT,
            { t: 'Mã NV', w: 'w-90' },
            { t: 'Họ và tên' },
            { t: 'Chức danh', w: 'w-160' },
            { t: 'Lương mục tiêu / tháng', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Thời gian tham gia', w: 'w-160' },
            { t: 'CPNC dự kiến', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Luỹ kế đến nay', w: 'w-160', cls: 'tbl__th--num' },
          ],
          LUONG_MT.map((r, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            `<span class="code-link">${r[0]}</span>`,
            r[1],
            r[2],
            { h: money(r[3]), cls: 'tbl__td--num' },
            `<div class="col" style="gap:2px"><span>${r[4]}</span><span class="caption">${r[5]} tháng</span></div>`,
            { h: money(r[6]), cls: 'tbl__td--num' },
            { h: r[7] ? money(r[7]) : '<span class="muted">chưa tham gia</span>', cls: 'tbl__td--num' },
          ]),
        )}
        ${tableFoot(5, { perPage: 25, pages: [1] })}
      </div>
    </div>`,
    ) +
    note('Bảng lương mục tiêu — ba chỗ dễ nhầm với bảng lương tháng', [
      '<strong>Khác nguồn.</strong> Bảng lương tháng (BM0, artboard 23) là số HRM đã trả, import hàng tháng, chỉ đọc. Bảng lương mục tiêu là số <em>kế hoạch</em>, HR nhập khi kiện toàn mô hình — tần suất "khi có thay đổi", không phải hàng tháng.',
      '<strong>Khác công dụng.</strong> CPNC thực tế của tháng vẫn tính từ bảng lương tháng theo công thức §4.1; bảng này chỉ để trả lời "cứ đà này thì hết bao nhiêu" và sinh báo cáo CPNC dự kiến mà MotaCV §I.3 yêu cầu.',
      '<strong>Khác quyền.</strong> Cột tiền ở đây cũng chỉ HR thấy, giống bảng lương tháng (ma trận quyền sheet 2.Chấm công dòng 138) — PA/PM mở màn này thấy cột tiền không render, như artboard 24.',
      '<strong>Câu hỏi Q8 với khách, chưa trả lời:</strong> nguyên văn trong MotaCV — <em>"Thông tin lương mục tiêu có cần quản lý quá trình lương, thâm niên, các danh mục diện đối tượng, diện hợp đồng… không hay thông tin người dùng upload thuần tuý?"</em> Artboard này đang giả định <strong>upload thuần tuý</strong>, một mức lương một người một nhiệm vụ. Nếu khách cần quá trình lương theo thời gian thì bảng phải thêm chiều <em>hiệu lực từ – đến</em>, và CPNC dự kiến thành tổng theo đoạn.',
    ])
  );
};

module.exports = [
  { code: '1K', group: '1.6 · Nhiệm vụ — phần chưa code', title: 'Hồ sơ đính kèm nhiệm vụ', desc: 'Bản ký được phê duyệt (MotaCV §I.1) — có dòng thiếu bản ký', body: hoSoDinhKem },
  { code: '1L', group: '1.6 · Nhiệm vụ — phần chưa code', title: 'Danh sách nội dung công việc', desc: '"DS công việc" — tính năng CRUD độc lập của Book1 §1.2', body: noiDungCongViec },
  { code: '1P', group: '1.6 · Nhiệm vụ — phần chưa code', title: 'Bảng lương mục tiêu', desc: 'CPNC dự kiến cả vòng đời (MotaCV §I.3) — kèm câu hỏi Q8', body: luongMucTieu },
];
