/* =============================================================================
 * Đợt 2 phần 2 — Màn chấm công phân bổ (§6.2 → §6.5, §6.7, §6.8).
 *
 * BA BIẾN THỂ, KHÔNG PHẢI MỘT MÀN CÓ *ngIf. Sheet `2.Chấm công` mô tả rõ ba layout khác nhau
 * theo `phanLoai`; kiến trúc là **một** component bảng chấm công dùng chung + **ba** component
 * header riêng. Nhồi cả ba vào một template với @if lồng nhau là thứ không ai sửa nổi sau ba
 * tháng — nên ở mockup cũng vẽ thành ba artboard tách bạch.
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, frame, bare, DIM, dlg, toast, pageHead, btn, input, select, search, field, tag, table, tableFoot, note, days31, money } = U;

const NGUOI = [
  ['801234', 'Trần Minh Quân', 'Kỹ sư chính', 21.0],
  ['805512', 'Lê Thị Hồng Nhung', 'Kỹ sư bậc 3', 20.0],
  ['807781', 'Phạm Văn Đức', 'Trợ lý dự án', 21.0],
  ['803095', 'Nguyễn Hoàng Anh', 'Kỹ sư bậc 1', 19.5],
  ['809442', 'Vũ Thị Thu Hà', 'Chuyên viên Công nghệ', 21.0],
];

const dayTh = () =>
  days31
    .map(
      (x) =>
        `<div class="tbl__th matrix__th-day"${x.weekend ? ' style="background:var(--vht-gray-90)"' : ''}>` +
        `<div>${x.d}</div><div class="matrix__dow">${x.dow}</div></div>`,
    )
    .join('');

/* Sinh một dòng chấm công. `plan` mô tả người này chấm vào nội dung CV nào, ngày nào —
 * và ở đâu bị KHOÁ. Bốn luật khoá (sheet 2.Chấm công dòng 127):
 *   T7/CN · nghỉ phép-lễ theo BM0 · đã submit ở nhiệm vụ khác cùng tháng · ngoài hạn nhiệm vụ. */
function chamRow(idx, { taken = [], missing = [], nghiPhep = [] } = {}) {
  const KIND = ['a', 'b', 'a', 'c', 'b'];
  return days31.map((d) => {
    if (d.d === 1 || d.d === 2) return { k: 'locked', t: 'DL' };
    if (d.weekend) return { k: 'weekend', t: '' };
    if (nghiPhep.includes(d.d)) return { k: 'locked', t: 'P' };
    if (taken.includes(d.d)) return { k: 'taken', t: '×' };
    if (missing.includes(d.d)) return { k: 'missing', t: '8' };
    if (d.d > 23 && idx > 2) return { k: 'empty', t: '' };
    return { k: KIND[idx], t: '8' };
  });
}

const matrixTable = (rows, { colNoiDung = 'Nội dung công việc tham gia', groupRows = null } = {}) => `
  <div class="tbl">
    <div class="tbl__head">
      <div class="tbl__th w-48 tbl__th--center">TT</div>
      <div class="tbl__th w-90">Mã NV</div>
      <div class="tbl__th w-180">Họ và tên</div>
      <div class="tbl__th w-160">Chức danh</div>
      <div class="tbl__th w-220">${colNoiDung}</div>
      ${dayTh()}
      <div class="tbl__th w-110 tbl__th--num">Tổng công</div>
      <div class="tbl__th w-140">Thao tác</div>
    </div>
    ${rows}
  </div>`;

function personRow(i, p, noiDung, cells, { warn = false } = {}) {
  const tong = cells.filter((c) => c.t === '8').length * 1;
  return `<div class="tbl__row${warn ? ' tbl__row--warn' : ''}">
    <div class="tbl__td w-48 tbl__td--center">${i + 1}</div>
    <div class="tbl__td w-90"><span class="code-link">${p[0]}</span></div>
    <div class="tbl__td w-180">${p[1]}</div>
    <div class="tbl__td w-160">${p[2]}</div>
    <div class="tbl__td w-220">${noiDung}</div>
    ${cells.map((c) => `<div class="tbl__td matrix__day"><div class="cell cell--${c.k}">${c.t}</div></div>`).join('')}
    <div class="tbl__td w-110 tbl__td--num"><strong>${String(tong).replace('.', ',')},0</strong></div>
    <div class="tbl__td w-140"><div class="actions">${btn('Sửa', { icon: 'pencil', variant: 'secondary', sm: true })}${btn('', { icon: 'trash', variant: 'ghost', sm: true, cls: 'btn--icon' })}</div></div>
  </div>`;
}

/* Khối 7 trường thông tin nhiệm vụ — CHUNG cho cả ba biến thể. */
const headerNhiemVu = (phanLoai, extra = '') => `
  <div class="card">
    <div class="card__head">
      <div class="card__title">Thông tin nhiệm vụ</div>
      <div class="row">${btn('Sửa', { icon: 'pencil', variant: 'secondary', sm: true })}${btn('Tạo mới', { icon: 'plus', variant: 'secondary', sm: true })}${btn('Nhập từ BM5', { icon: 'upload', variant: 'secondary', sm: true })}</div>
    </div>
    <div class="row row--wrap" style="gap:12px">
      ${field('Nhiệm vụ', input('011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần', { icon: 'search', w: '' }), {})}
    </div>
    <div class="desc">
      <div class="desc__item"><div class="desc__label">Mã nhiệm vụ</div><div class="desc__value">011-24-TĐ-RDP-QS</div></div>
      <div class="desc__item"><div class="desc__label">Phân loại</div><div class="desc__value">${tag(phanLoai, 'info')}</div></div>
      <div class="desc__item"><div class="desc__label">Đơn vị chủ trì</div><div class="desc__value">Trung tâm CHĐK · Khối 1 - TCT CNC</div></div>
      <div class="desc__item"><div class="desc__label">Thời gian</div><div class="desc__value">08/04/2025 – 31/12/2026</div></div>
      <div class="desc__item"><div class="desc__label">Chủ nhiệm (PM)</div><div class="desc__value">Đỗ Quang Huy · huydq@viettel.com.vn</div></div>
      <div class="desc__item"><div class="desc__label">Trợ lý (PA)</div><div class="desc__value">Phạm Văn Đức · ducpv@viettel.com.vn</div></div>
      <div class="desc__item"><div class="desc__label">Tổng dự toán được phê duyệt</div><div class="desc__value">5.400.000.000 ₫</div></div>
      <div class="desc__item"><div class="desc__label">CPNC được phê duyệt</div><div class="desc__value">1.850.000.000 ₫ <span class="caption">(khác tổng dự toán — hai trường riêng)</span></div></div>
    </div>
    ${extra}
  </div>`;

/* Thanh chọn kỳ + đơn vị. Đơn vị phải CHỌN CHỦ ĐỘNG, không mặc định theo đơn vị người đăng nhập
   — khách đã đổi yêu cầu này (PA phòng Tổng hợp chấm công hộ đơn vị khác). */
const thanhChon = (trangThai) => `
  <div class="card">
    <div class="row row--wrap" style="gap:12px;align-items:flex-end">
      <div style="flex:0 0 200px">${field('Kỳ', select('Tháng 05/2025'), { required: true })}</div>
      <div style="flex:0 0 240px">${field('Khối (cấp 4)', select('Khối 1 - TCT CNC'), { required: true })}</div>
      <div style="flex:0 0 300px">${field('Đơn vị chấm công (cấp 5)', select('Trung tâm Chế tạo Điện tử Khí tài'), { required: true, help: 'Chọn chủ động — không mặc định theo đơn vị của bạn.' })}</div>
      <div class="spacer"></div>
      <div class="row" style="gap:8px">${trangThai}</div>
    </div>
  </div>`;

const legend = () => `
  <div class="row row--wrap" style="gap:16px">
    <div class="legend"><span class="legend__swatch" style="background:var(--vht-info-90)"></span>NDCV-01 Thiết kế khối cao tần</div>
    <div class="legend"><span class="legend__swatch" style="background:var(--vht-success-90)"></span>NDCV-02 Lập trình firmware</div>
    <div class="legend"><span class="legend__swatch" style="background:var(--vht-warning-90)"></span>NDCV-03 Kiểm thử tích hợp</div>
    <div class="legend"><span class="legend__swatch" style="background:var(--vht-gray-95)"></span>T7 / CN</div>
    <div class="legend"><span class="legend__swatch" style="background:var(--vht-gray-90)"></span>Nghỉ phép / lễ (BM0)</div>
    <div class="legend"><span class="legend__swatch" style="background:var(--vht-gray-80)"></span>Đã chấm ở nhiệm vụ khác</div>
  </div>`;

/* ========================================== 25 · Biến thể A — Đề tài KHCN */
const NDCV = [
  ['NDCV-01', 'Thiết kế khối cao tần', 'Trung tâm CHĐK', 620000000, 214500000, 30000000, 435500000, 96000000, 192000000],
  ['NDCV-02', 'Lập trình firmware', 'Trung tâm CHĐK', 480000000, 188200000, 24000000, 315800000, 84000000, 168000000],
  ['NDCV-03', 'Kiểm thử tích hợp', 'Trung tâm ĐBCL', 310000000, 96400000, 15000000, 228600000, 45000000, 90000000],
  ['NDCV-04', 'Quản lý tiến độ, báo cáo', 'Phòng Tổng hợp', 140000000, 61800000, 7000000, 85200000, 24000000, 48000000],
];

const chamCongKHCN = (opts = {}) =>
  frame(
    'cham-cong-pb',
    `<div class="page">
      ${pageHead('Chấm công phân bổ', 'Biến thể A — nhiệm vụ phân loại Đề tài KHCN. Mỗi ngày chấm vào ĐÚNG MỘT nội dung công việc.', `${btn('Xuất BM2.1', { icon: 'download', variant: 'secondary' })}${btn('Lưu nháp', { icon: 'save', variant: 'secondary' })}${btn('Submit chấm công', { icon: 'check' })}`)}
      ${thanhChon(tag('Chưa chấm công', ''))}
      ${headerNhiemVu('Đề tài KHCN')}

      <div class="card">
        <div class="card__head">
          <div class="card__title">Nội dung công việc và nguồn CPNC</div>
          ${btn('Thêm nội dung CV', { icon: 'plus', variant: 'secondary', sm: true })}
        </div>
        ${table(
          [
            { t: 'Mã', w: 'w-110' },
            { t: 'Nội dung công việc', w: 'w-280' },
            { t: 'Đơn vị phân bổ', w: 'w-200' },
            { t: 'CPNC được phê duyệt', w: 'w-180', cls: 'tbl__th--num' },
            { t: 'Đã phân bổ đến T04', w: 'w-180', cls: 'tbl__th--num' },
            { t: 'Dự phòng', w: 'w-140', cls: 'tbl__th--num' },
            { t: 'CPNC còn lại', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Tạm tính 6 tháng', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Tạm tính năm', w: 'w-160', cls: 'tbl__th--num' },
          ],
          NDCV.map((n) => [
            `<span class="code-link">${n[0]}</span>`, n[1], n[2],
            { h: money(n[3]), cls: 'tbl__td--num' },
            { h: money(n[4]), cls: 'tbl__td--num' },
            { h: money(n[5]), cls: 'tbl__td--num' },
            { h: money(n[6]), cls: 'tbl__td--num' },
            { h: money(n[7]), cls: 'tbl__td--num' },
            { h: money(n[8]), cls: 'tbl__td--num' },
          ]).concat([[
            '', '<strong>Tổng</strong>', '',
            { h: '<strong>1.550.000.000</strong>', cls: 'tbl__td--num' },
            { h: '<strong>560.900.000</strong>', cls: 'tbl__td--num' },
            { h: '<strong>76.000.000</strong>', cls: 'tbl__td--num' },
            { h: '<strong>1.065.100.000</strong>', cls: 'tbl__td--num' },
            { h: '<strong>249.000.000</strong>', cls: 'tbl__td--num' },
            { h: '<strong>498.000.000</strong>', cls: 'tbl__td--num' },
          ]]),
          { rowCls: (i) => (i === 4 ? 'tbl__row--total' : '') },
        )}
        <div class="caption">Nguồn lập dự toán = <strong>CPNC được phê duyệt + Dự phòng</strong> (sheet 3.Báo cáo dòng 9). CPNC còn lại <strong>có thể âm</strong> — mẫu của khách ghi <code>-2000</code>, không được clamp về 0.</div>
      </div>

      <div class="card">
        <div class="card__head">
          <div class="col" style="gap:2px">
            <div class="card__title">Bảng chấm công — tháng 05/2025</div>
            <div class="caption">Gõ mã NV để tự hiện tên + chức danh. Chọn tháng mới sẽ tự gợi ý danh sách nhân sự như tháng gần nhất.</div>
          </div>
          <div class="row">${btn('Gợi ý theo tháng 04', { icon: 'refresh', variant: 'secondary', sm: true })}${btn('Thêm nhân sự', { icon: 'plus', variant: 'secondary', sm: true })}</div>
        </div>
        ${matrixTable(
          NGUOI.map((p, i) =>
            personRow(
              i, p,
              ['NDCV-01 Thiết kế khối cao tần', 'NDCV-02 Lập trình firmware', 'NDCV-01 Thiết kế khối cao tần', 'NDCV-03 Kiểm thử tích hợp', 'NDCV-02 Lập trình firmware'][i],
              chamRow(i, {
                nghiPhep: i === 1 ? [12, 13] : i === 3 ? [26] : [],
                taken: i === 0 ? [19, 20, 21] : [],
              }),
            ),
          ).join(''),
        )}
        ${legend()}
        <div class="row row--between">
          <div class="row" style="gap:12px">
            <div class="stat" style="flex:0 0 220px"><small>CPNC tạm tính kỳ này</small><strong>184.320.000 ₫</strong></div>
            <div class="stat" style="flex:0 0 220px"><small>Công đã phân bổ / công tính lương</small><strong>78,0 / 102,5</strong></div>
            <div class="stat stat--warn" style="flex:0 0 260px"><small>Công thừa sẽ vào "Chi phí quản lý"</small><strong>24,5 công</strong></div>
          </div>
          <div class="row">${btn('Lưu nháp', { icon: 'save', variant: 'secondary' })}${btn('Submit chấm công', { icon: 'check' })}</div>
        </div>
      </div>
    </div>`,
    { wide: true, ...opts },
  ) +
  note('Biến thể A — điều phải giữ đúng', [
    'Cột <strong>Nội dung công việc tham gia</strong> chọn theo danh sách đã phê duyệt, <strong>không nhập tự do</strong>.',
    'Ràng buộc <strong>1 ngày = 1 nội dung CV</strong> sống ở tầng <code>PhanBoCong</code>, không ở model nhân sự.',
    'CPNC tạm tính hiện <strong>ngay trên màn</strong>, tính theo bảng lương đã import (sheet 2.Chấm công dòng 27–28).',
    'Quy tắc công thừa: người có công tính lương 21 mà chỉ chấm 6 ngày ⇒ hệ thống <strong>tự sinh 15 ngày</strong> vào "Nhiệm vụ khác / Chi phí quản lý", tổng CPNC phân bổ = 100% CPNC tháng.',
  ]);

/* ========================================= 26 · Biến thể B — Phương án kinh doanh */
const chamCongPAKD = () =>
  frame(
    'cham-cong-pb',
    `<div class="page">
      ${pageHead('Chấm công phân bổ', 'Biến thể B — nhiệm vụ phân loại Phương án kinh doanh. Bắt buộc CHỌN NGUỒN trước khi chấm; bảng có thêm dòng nhóm theo sản phẩm.', `${btn('Xuất BM2.2', { icon: 'download', variant: 'secondary' })}${btn('Lưu nháp', { icon: 'save', variant: 'secondary' })}${btn('Submit chấm công', { icon: 'check' })}`)}
      ${thanhChon(tag('PA đã submit chấm công', 'info'))}
      ${headerNhiemVu('Phương án kinh doanh')
        .replace('011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần', 'PO-92166 — Cung cấp hệ thống camera giám sát AI')
        .replace(/011-24-TĐ-RDP-QS/g, 'PO-92166')
        .replace('1.850.000.000 ₫ <span class="caption">(khác tổng dự toán — hai trường riêng)</span>', '980.000.000 ₫')}

      <div class="card">
        <div class="card__head">
          <div class="card__title">Phân nguồn × Sản phẩm</div>
          ${btn('Thêm dòng', { icon: 'plus', variant: 'secondary', sm: true })}
        </div>
        ${table(
          [
            { t: 'Phân nguồn', w: 'w-160' },
            { t: 'Sản phẩm', w: 'w-240' },
            { t: 'Bắt đầu', w: 'w-120' },
            { t: 'Kết thúc', w: 'w-120' },
            { t: 'CPNC được phê duyệt', w: 'w-180', cls: 'tbl__th--num' },
            { t: 'Đã phân bổ đến T04', w: 'w-180', cls: 'tbl__th--num' },
            { t: 'Dự phòng', w: 'w-140', cls: 'tbl__th--num' },
            { t: 'CPNC còn lại', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Tạm tính 6 tháng', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Tạm tính năm', w: 'w-160', cls: 'tbl__th--num' },
          ],
          [
            ['SXKD', 'A — Khối thu phát cao tần', '01/01/2025', '31/12/2025', { h: money(420000000), cls: 'tbl__td--num' }, { h: money(168000000), cls: 'tbl__td--num' }, { h: money(20000000), cls: 'tbl__td--num' }, { h: money(272000000), cls: 'tbl__td--num' }, { h: money(72000000), cls: 'tbl__td--num' }, { h: money(144000000), cls: 'tbl__td--num' }],
            ['SXKD', 'B — Bộ điều khiển trung tâm', '01/01/2025', '31/12/2025', { h: money(260000000), cls: 'tbl__td--num' }, { h: money(112400000), cls: 'tbl__td--num' }, { h: money(13000000), cls: 'tbl__td--num' }, { h: money(160600000), cls: 'tbl__td--num' }, { h: money(48000000), cls: 'tbl__td--num' }, { h: money(96000000), cls: 'tbl__td--num' }],
            ['Bán hàng', 'A — Khối thu phát cao tần', '01/03/2025', '31/12/2025', { h: money(180000000), cls: 'tbl__td--num' }, { h: money(64200000), cls: 'tbl__td--num' }, { h: money(9000000), cls: 'tbl__td--num' }, { h: money(124800000), cls: 'tbl__td--num' }, { h: money(30000000), cls: 'tbl__td--num' }, { h: money(60000000), cls: 'tbl__td--num' }],
            ['Bán hàng', 'B — Bộ điều khiển trung tâm', '01/03/2025', '31/12/2025', { h: money(120000000), cls: 'tbl__td--num' }, { h: money(38600000), cls: 'tbl__td--num' }, { h: money(6000000), cls: 'tbl__td--num' }, { h: money(87400000), cls: 'tbl__td--num' }, { h: money(18000000), cls: 'tbl__td--num' }, { h: money(36000000), cls: 'tbl__td--num' }],
            [
              '<strong>Bảo hành</strong>',
              '<span class="muted">— không theo sản phẩm —</span>',
              '01/01/2025', '31/12/2025',
              { h: '<span class="muted">—</span>', cls: 'tbl__td--num' },
              { h: '<strong>' + money(41300000) + '</strong>', cls: 'tbl__td--num' },
              { h: '<span class="muted">—</span>', cls: 'tbl__td--num' },
              { h: '<span class="muted"></span>', cls: 'tbl__td--num' },
              { h: '<span class="muted">—</span>', cls: 'tbl__td--num' },
              { h: '<span class="muted">—</span>', cls: 'tbl__td--num' },
            ],
          ],
          { rowCls: (i) => (i === 4 ? 'tbl__row--warn' : '') },
        )}
        <div class="alert alert--warn">${ico('alert', 18)}
          <div class="alert__body"><div class="alert__title">Nguồn Bảo hành — ô "CPNC còn lại" ĐỂ TRỐNG, không hiện 0</div>
          <div>Sheet <code>2.Chấm công</code> dòng 59: bảo hành <strong>chỉ theo dõi số đã phân bổ</strong>, không lập dự toán. Hiện <code>0</code> ở ô còn lại thì người đọc hiểu thành <em>hết nguồn</em> và sẽ dừng chấm công — sai hoàn toàn.</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <div class="col" style="gap:2px">
            <div class="card__title">Bảng chấm công — tháng 05/2025</div>
            <div class="caption">Dòng nhóm theo sản phẩm, rồi mới tới các dòng nhân sự.</div>
          </div>
          <div style="flex:0 0 260px">${field('Chọn nguồn', select('SXKD'), { required: true })}</div>
        </div>
        ${matrixTable(
          `<div class="tbl__row tbl__row--group">
             <div class="tbl__td w-48"></div>
             <div class="tbl__td grow"><strong>A — SẢN PHẨM A · Khối thu phát cao tần</strong></div>
           </div>` +
            NGUOI.slice(0, 3)
              .map((p, i) => personRow(i, p, 'A · Lắp ráp, hiệu chỉnh', chamRow(i, { nghiPhep: i === 1 ? [12, 13] : [] })))
              .join('') +
            `<div class="tbl__row tbl__row--group">
             <div class="tbl__td w-48"></div>
             <div class="tbl__td grow"><strong>B — SẢN PHẨM B · Bộ điều khiển trung tâm</strong></div>
           </div>` +
            NGUOI.slice(3, 5)
              .map((p, i) => personRow(i + 3, p, 'B · Tích hợp phần mềm', chamRow(i + 3, { nghiPhep: i === 0 ? [26] : [] })))
              .join(''),
          { colNoiDung: 'Sản phẩm / nội dung tham gia' },
        )}
        ${legend()}
      </div>
    </div>`,
    { wide: true },
  );

/* ====================================== 27 · Biến thể C — Dự án ĐTPT / Nhiệm vụ QPAN */
const chamCongDTPT = () =>
  frame(
    'cham-cong-pb',
    `<div class="page">
      ${pageHead('Chấm công phân bổ', 'Biến thể C — nhiệm vụ phân loại Dự án ĐTPT hoặc Nhiệm vụ QPAN. KHÔNG có bảng nội dung công việc, chỉ một dòng tổng.', `${btn('Xuất BM2.1', { icon: 'download', variant: 'secondary' })}${btn('Lưu nháp', { icon: 'save', variant: 'secondary' })}${btn('Submit chấm công', { icon: 'check' })}`)}
      ${thanhChon(tag('PA/PM chủ trì đã xác nhận', 'warning'))}
      ${headerNhiemVu('Dự án ĐTPT')
        .replace('011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần', 'DTPT-25-014 — Nâng cấp dây chuyền SMT nhà máy M1')
        .replace(/011-24-TĐ-RDP-QS/g, 'DTPT-25-014')}

      <div class="card">
        <div class="card__title">Nguồn CPNC của nhiệm vụ</div>
        ${table(
          [
            { t: 'Phân nguồn', w: 'w-180' },
            { t: 'CPNC được phê duyệt', w: 'w-200', cls: 'tbl__th--num' },
            { t: 'Đã phân bổ đến T04', w: 'w-200', cls: 'tbl__th--num' },
            { t: 'Dự phòng', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'CPNC còn lại', w: 'w-180', cls: 'tbl__th--num' },
            { t: 'Tạm tính 6 tháng', w: 'w-180', cls: 'tbl__th--num' },
            { t: 'Tạm tính năm', w: 'w-180', cls: 'tbl__th--num' },
          ],
          [[
            'ĐTPT',
            { h: money(740000000), cls: 'tbl__td--num' },
            { h: money(742000000), cls: 'tbl__td--num' },
            { h: money(0), cls: 'tbl__td--num' },
            { h: '<strong style="color:var(--vht-brand-40)">-2.000.000</strong>', cls: 'tbl__td--num' },
            { h: money(120000000), cls: 'tbl__td--num' },
            { h: money(240000000), cls: 'tbl__td--num' },
          ]],
          { rowCls: () => 'tbl__row--warn' },
        )}
        <div class="alert alert--error">${ico('alert', 18)}
          <div class="alert__body"><div class="alert__title">CPNC còn lại ÂM — hiển thị đúng dấu âm, không clamp về 0</div>
          <div>Mẫu của khách ghi thẳng <code>-2000</code>. Clamp về 0 là giấu mất việc nhiệm vụ đã tiêu vượt nguồn — đúng thứ mà báo cáo "nhiệm vụ sắp hết nguồn" sinh ra để bắt.</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card__title">Bảng chấm công — tháng 05/2025</div>
        ${matrixTable(
          NGUOI.slice(0, 4)
            .map((p, i) => personRow(i, p, 'Toàn nhiệm vụ', chamRow(i, { nghiPhep: i === 1 ? [12, 13] : [] })))
            .join(''),
          { colNoiDung: 'Nội dung tham gia' },
        )}
        ${legend()}
      </div>
    </div>`,
    { wide: true },
  );

/* ================================================ 28 · Luật khoá ô — màn giải thích */
const cellDemo = (kind, txt, title, why, src) => `
  <div class="row" style="gap:12px;align-items:flex-start;flex:1 1 460px;min-width:440px">
    <div class="tbl__td matrix__day" style="flex:0 0 34px;height:56px"><div class="cell cell--${kind}">${txt}</div></div>
    <div class="col" style="gap:2px">
      <div class="strong">${title}</div>
      <div class="caption">${why}</div>
      <div class="caption">Nguồn dữ liệu: <strong>${src}</strong></div>
    </div>
  </div>`;

const luatKhoaO = () =>
  frame(
    'cham-cong-pb',
    `<div class="page">
      ${pageHead('Chấm công — luật khoá ô', 'Phần logic nặng nhất của cả phân hệ. Sheet 2.Chấm công dòng 127 liệt kê bốn luật; đây là biểu hiện trên giao diện của từng luật.', '', true)}

      <div class="card">
        <div class="card__title">Bốn luật khoá — và thứ người dùng nhìn thấy</div>
        <div class="row row--wrap" style="gap:24px">
          ${cellDemo('weekend', '', 'Ngày T7 / CN', 'Ô nền xám nhạt, tooltip "Ngày nghỉ tuần". Không bấm được.', 'Lịch')}
          ${cellDemo('locked', 'P', 'Nghỉ phép', 'Ô xám đậm hơn, HIỆN KÝ HIỆU GỐC của BM0 (P, DL, Ô, TS, KL) — không chỉ đổi màu, để in đen trắng vẫn đọc được.', 'BM0 bảng công')}
          ${cellDemo('locked', 'DL', 'Nghỉ lễ', 'Cùng kiểu với nghỉ phép, ký hiệu DL.', 'BM0 bảng công')}
          ${cellDemo('taken', '×', 'Đã chấm ở nhiệm vụ khác', 'Ô xám, tooltip nêu ĐÍCH DANH tên nhiệm vụ đang giữ ngày đó. Chỉ khoá khi nhiệm vụ kia ĐÃ SUBMIT.', 'PhanBoCong của nhiệm vụ khác cùng kỳ')}
          ${cellDemo('locked', '', 'Ngoài thời gian nhiệm vụ', 'Ngày trước tuNgay hoặc sau denNgay của nhiệm vụ.', 'NhiemVu.tuNgay / denNgay')}
          ${cellDemo('missing', '8', 'Đã chấm nhưng THIẾU nội dung CV', 'Viền đứt đỏ. Không phải ô khoá — là ô chặn submit, xem artboard 29.', 'Validate lúc submit')}
        </div>
      </div>

      <div class="card">
        <div class="card__title">Tooltip khi rê vào ô bị khoá</div>
        <div class="caption">Tooltip phải nói RÕ nhiệm vụ nào đang giữ ngày đó. "Ngày này đã được sử dụng" không giúp PA biết phải đi hỏi ai.</div>
        <div class="row" style="gap:32px;align-items:flex-start">
          <div class="col" style="gap:8px;flex:0 0 420px">
            <div class="row" style="gap:2px">
              ${[17, 18, 19, 20, 21, 22, 23]
                .map((d) => {
                  const taken = d >= 19 && d <= 21;
                  const weekend = d === 17 || d === 18;
                  return `<div class="col" style="gap:2px;align-items:center">
                    <div class="caption">${d}</div>
                    <div class="cell cell--${taken ? 'taken' : weekend ? 'weekend' : 'a'}">${taken ? '×' : weekend ? '' : '8'}</div>
                  </div>`;
                })
                .join('')}
            </div>
            <div style="padding:10px 12px;border-radius:8px;background:var(--vht-gray-10);color:#fff;max-width:320px">
              <div style="font:var(--vht-font-label);font-family:var(--vht-built-font)">Ngày 20/05/2025 đã bị khoá</div>
              <div class="caption" style="color:var(--vht-gray-80)">Nhân sự này đã được chấm vào nhiệm vụ <strong style="color:#fff">PO-92166 — Cung cấp hệ thống camera giám sát AI</strong> (PA Lê Văn Thành đã submit ngày 03/06).</div>
            </div>
          </div>
          <div class="col" style="gap:12px;flex:1 1 auto">
            <div class="alert alert--warn">${ico('alert', 18)}
              <div class="alert__body"><div class="alert__title">Hai điểm dễ sai nhất</div>
              <div><strong>(a)</strong> Chỉ khoá khi nhiệm vụ kia <strong>đã submit</strong>. Khoá cả bản nháp thì hai PA chặn nhau vĩnh viễn — người mở màn trước giữ mất ngày của người mở sau.<br>
              <strong>(b)</strong> Khoá phải <strong>tính lại khi đổi tháng</strong>. PhanBoCong của tháng khác không liên quan gì tới tháng đang chấm.</div></div>
            </div>
            <div class="alert">${ico('info', 18)}
              <div class="alert__body"><div class="alert__title">Ô khoá vẫn phải đọc được khi in đen trắng</div>
              <div>Vì vậy ô nghỉ phép mang <strong>ký hiệu chữ</strong> (P / DL / Ô / TS), ô bị nhiệm vụ khác giữ mang dấu <strong>×</strong>, ô cuối tuần để trống. Ba mức xám khác nhau chỉ là lớp thông tin thứ hai.</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>`,
  );

/* ============================================ 29 · Submit — validate liệt kê từng ô */
const submitLoi = () =>
  frame(
    'cham-cong-pb',
    `<div class="page">
      ${pageHead('Chấm công phân bổ — submit không hợp lệ', 'Sheet 2.Chấm công dòng 128: chỉ submit được khi đã điền đủ nội dung CV và nguồn. Validate phải LIỆT KÊ TỪNG Ô THIẾU, không chỉ báo "dữ liệu chưa hợp lệ".', `${btn('Lưu nháp', { icon: 'save', variant: 'secondary' })}${btn('Submit chấm công', { icon: 'check', cls: 'btn--disabled' })}`)}

      <div class="card">
        <div class="alert alert--error">${ico('x-circle', 18)}
          <div class="alert__body">
            <div class="alert__title">Không submit được — còn 4 vấn đề cần sửa</div>
            <div>Bấm vào từng dòng để nhảy tới ô tương ứng trong bảng.</div>
          </div>
        </div>
        ${table(
          [
            { t: '', w: 'w-48', cls: 'tbl__th--center' },
            { t: 'Nhân sự', w: 'w-240' },
            { t: 'Ngày', w: 'w-160' },
            { t: 'Vấn đề' },
            { t: 'Cách sửa', w: 'w-280' },
          ],
          [
            [{ h: ico('x-circle', 18), cls: 'tbl__td--center' }, '805512 · Lê Thị Hồng Nhung', '14/05, 15/05', 'Đã chấm 8 giờ nhưng <strong>chưa chọn nội dung công việc</strong>', '<span class="code-link">Chọn nội dung CV cho 2 ô</span>'],
            [{ h: ico('x-circle', 18), cls: 'tbl__td--center' }, '803095 · Nguyễn Hoàng Anh', '05/05 → 09/05', 'Chấm vào nội dung CV <strong>NDCV-03</strong> nhưng người này <strong>không thuộc</strong> nội dung CV đó (BM1)', '<span class="code-link">Bổ sung vào danh sách nhân sự</span>'],
            [{ h: ico('x-circle', 18), cls: 'tbl__td--center' }, '809442 · Vũ Thị Thu Hà', '28/05', 'Ngày <strong>ngoài thời gian nhiệm vụ</strong> (nhiệm vụ kết thúc 23/05)', '<span class="code-link">Xoá ô</span>'],
            [{ h: ico('alert', 18), cls: 'tbl__td--center' }, '801234 · Trần Minh Quân', 'Cả tháng', 'Tổng công phân bổ <strong>22,0</strong> vượt công tính lương <strong>21,0</strong> của kỳ', '<span class="code-link">Bỏ bớt 1 ngày</span>'],
          ],
          { rowCls: (i) => (i === 3 ? 'tbl__row--warn' : '') },
        )}
      </div>

      <div class="card">
        <div class="card__title">Bảng chấm công — các ô có vấn đề được đánh dấu tại chỗ</div>
        ${matrixTable(
          NGUOI.slice(0, 4)
            .map((p, i) =>
              personRow(
                i, p,
                i === 1 ? '<span style="color:var(--vht-brand-50)">— chưa chọn —</span>' : ['NDCV-01 Thiết kế khối cao tần', '', 'NDCV-01 Thiết kế khối cao tần', 'NDCV-03 Kiểm thử tích hợp'][i],
                chamRow(i, {
                  missing: i === 1 ? [14, 15] : [],
                  nghiPhep: i === 1 ? [12, 13] : i === 3 ? [26] : [],
                }),
                { warn: i === 1 },
              ),
            )
            .join(''),
        )}
        <div class="row row--wrap" style="gap:16px">
          <div class="legend"><span class="legend__swatch" style="background:#fff;border:1px dashed var(--vht-brand-50)"></span>Ô đã chấm nhưng thiếu nội dung công việc — chặn submit</div>
          <div class="legend"><span class="legend__swatch" style="background:var(--vht-brand-99);border:1px solid var(--vht-brand-80)"></span>Dòng có vấn đề — nền đỏ nhạt</div>
        </div>
      </div>
    </div>`,
    { wide: true },
  );

/* ========================================= 2A · Chấm công theo đơn vị (màn HR) */
const DONVI = [
  ['Khối 1 - TCT CNC', 'Trung tâm Chế tạo Điện tử Khí tài', 4, 96.4, 148],
  ['Khối 1 - TCT CNC', 'Trung tâm Kinh doanh Điều hành', 3, 88.2, 96],
  ['Khối 1 - TCT CNC', 'Phòng Tổng hợp', 2, 71.5, 32],
  ['Khối 2 - TCT CNC', 'Trung tâm Camera', 4, 92.8, 124],
  ['Khối 2 - TCT CNC', 'Trung tâm Quang điện tử', 1, 0, 68],
  ['TT QLCL', 'Trung tâm Quản lý Chất lượng', 3, 64.3, 41],
];
const TT = ['Chưa chấm công', 'PA đã submit chấm công', 'PA/PM chủ trì đã xác nhận', 'HR hoàn thành trình ký'];
const TTV = ['', 'info', 'warning', 'success'];

const chamCongDonVi = () =>
  frame(
    'cham-cong-dv',
    `<div class="page">
      ${pageHead('Chấm công theo đơn vị', 'Màn của HR. Bốn trạng thái là vòng đời chính thức của việc chấm công (sheet 1.DS Nhân sự dòng 23–26). Click một dòng để mở bảng chấm của đơn vị đó.', `${btn('Xuất BM3', { icon: 'download', variant: 'secondary' })}${btn('Trình ký VOffice', { icon: 'send' })}`)}
      <div class="card">
        <div class="filters">
          <div class="filters__left">${tag('Tháng 05/2025 · 27/30 đơn vị đã chốt', 'info')}</div>
          ${select('Kỳ 2025-05')}${select('Tất cả khối', { placeholder: true })}${select('Tất cả trạng thái', { placeholder: true })}
        </div>
        <div class="stats">
          <div class="stat"><small>Chưa chấm công</small><strong>3 đơn vị</strong></div>
          <div class="stat"><small>PA đã submit</small><strong>8 đơn vị</strong></div>
          <div class="stat"><small>PA/PM chủ trì đã xác nhận</small><strong>12 đơn vị</strong></div>
          <div class="stat stat--ok"><small>HR hoàn thành trình ký</small><strong>7 đơn vị</strong></div>
        </div>
        ${table(
          [
            { t: 'STT', w: 'w-56', cls: 'tbl__th--center' },
            { t: 'Thao tác', w: 'w-160' },
            { t: 'Trạng thái', w: 'w-240', cls: 'tbl__th--center' },
            { t: 'Đơn vị cấp 4 (Khối)', w: 'w-220' },
            { t: 'Đơn vị cấp 5' },
            { t: 'Số nhân sự', w: 'w-120', cls: 'tbl__th--num' },
            { t: 'Tỷ lệ PBNC', w: 'w-240' },
          ],
          DONVI.map((d, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            `<div class="actions">${btn('Xem bảng chấm', { icon: 'eye', variant: 'secondary', sm: true })}</div>`,
            { h: tag(TT[d[2] - 1], TTV[d[2] - 1]), cls: 'tbl__td--center' },
            d[0],
            `<span class="code-link">${d[1]}</span>`,
            { h: String(d[4]), cls: 'tbl__td--num' },
            `<div class="col" style="gap:4px;width:100%">
               <div class="row row--between"><span class="caption">${d[3] ? d[3].toFixed(1).replace('.', ',') + '%' : 'chưa có số'}</span>${d[3] && d[3] < 70 ? `<span class="caption" style="color:var(--vht-brand-40)">dưới ngưỡng 70%</span>` : ''}</div>
               <div class="progress"><div class="progress__fill${d[3] >= 70 ? ' progress__fill--ok' : d[3] ? ' progress__fill--warn' : ''}" style="width:${d[3]}%"></div></div>
             </div>`,
          ]),
          { rowCls: (i) => (DONVI[i][3] && DONVI[i][3] < 70 ? 'tbl__row--warn' : '') },
        )}
        ${tableFoot(30, { pages: [1, 2] })}
      </div>
    </div>`,
  ) +
  note('Vòng đời chấm công — hai nhánh của bước xác nhận', [
    '<strong>TH1</strong> — đơn vị chấm công ≠ đơn vị chủ trì ⇒ PA/PM của <strong>đơn vị chủ trì</strong> phải xác nhận.',
    '<strong>TH2</strong> — đơn vị chấm công = đơn vị chủ trì ⇒ <strong>submit đồng thời là xác nhận</strong>, không sinh bước chờ. Đây là đường chạy chính với nhiệm vụ một đơn vị, không phải trường hợp đặc biệt bỏ qua được.',
    'Sau đó là <strong>HR thẩm định</strong> — BRD bước 6 ghi rõ đây là <em>một nút xác nhận</em>, không phải một luồng phê duyệt. Đừng dựng workflow Camunda cho nó.',
  ]);

/* ================================================== 2B · Trình ký VOffice */
const trinhKy = () =>
  chamCongKHCN({
    overlay: `<div class="dialog dialog--form">
        <div class="dialog__head"><div class="dialog__title">Trình ký VOffice</div>${ico('x', 18)}</div>
        <div class="dialog__body">
          ${field('Gói trình ký', select('Theo nhiệm vụ — BM1 + BM2.1 + BM3.1/3.2'), { required: true, help: 'Hai gói: theo nhiệm vụ, hoặc bảng tổng hợp (BM3 + BM4).' })}
          ${field('Kỳ', input('Tháng 05/2025', { state: 'readonly' }))}
          ${field('Đơn vị', input('Trung tâm Chế tạo Điện tử Khí tài', { state: 'readonly' }))}
          <div class="col" style="gap:8px">
            <div class="field__label">Tài liệu đính kèm</div>
            ${['BM1 — Danh sách nhân sự tham gia', 'BM2.1 — Bảng chấm công theo nội dung CV', 'BM3.1 — Bảng lương KHCN', 'BM3.2 — Bảng lương SXKD']
              .map((f) => `<div class="choice"><div class="checkbox checkbox--on">${ico('check', 14)}</div>${ico('file', 16)}<span>${f}</span></div>`)
              .join('')}
          </div>
          ${field('Ghi chú trình ký', input('Nhập ghi chú gửi kèm', { placeholder: true, cls: 'input--area' }))}
        </div>
        <div class="dialog__foot">${btn('Huỷ', { variant: 'secondary' })}${btn('Trình ký', { icon: 'send' })}</div>
      </div>`,
  }) +
  note('VOffice dựng đúng chỗ — đừng tạo nguồn cấu hình thứ hai', [
    'VOffice đăng ký như một <code>IntegrationSystem</code> key <code>voffice</code>, kiểu <code>connector</code>, hiện ở <strong>màn Tích hợp chung</strong> đã có sẵn. HR Tools chỉ gọi adapter, <strong>không dựng màn cấu hình tích hợp riêng</strong>.',
    'Nút + modal + thẻ trạng thái đặt ở <code>shared/hr/trinh-ky-voffice/</code>, dùng chung cho cả bảng công (đợt 2) lẫn bảng lương (đợt 3).',
    'Câu hỏi còn mở (Q3): VOffice đã có tài liệu API thật chưa, hay tiếp tục mock?',
  ]);

/* ============ 2C · Gợi ý danh sách nhân sự như tháng gần nhất (§6.5, dòng 125–126) */
const goiYNhanSu = () =>
  chamCongKHCN({
    overlay: dlg({
      title: 'Gợi ý nhân sự từ tháng gần nhất',
      size: 'wide',
      body: `
          <div class="alert alert--info">${ico('info', 18)}
            <div class="alert__body"><div class="alert__title">Lấy theo tháng 04/2025 — tháng gần nhất có chấm công của đơn vị này</div>
            <div>Không có tiện ích này thì mỗi tháng PA phải nhập lại từ đầu — đúng thứ khách đang than trong bản khảo sát. Danh sách dưới đây đã đối chiếu với bảng công BM0 tháng 05/2025.</div></div>
          </div>
          <div class="row" style="gap:12px">
            <div class="stat stat--ok"><small>Giữ nguyên — vẫn còn ở đơn vị</small><strong>5 người</strong></div>
            <div class="stat stat--warn"><small>Đã chuyển đi / nghỉ việc</small><strong>1 người</strong></div>
            <div class="stat"><small>Mới về đơn vị trong tháng 05</small><strong>2 người</strong></div>
          </div>
          ${table(
            [
              { t: '', w: 'w-56', cls: 'tbl__th--center' },
              { t: 'Mã NV', w: 'w-100' },
              { t: 'Họ và tên', w: 'w-180' },
              { t: 'Chức danh', w: 'w-140' },
              { t: 'Nội dung CV tháng trước', w: 'w-220' },
              { t: 'Công tính lương 05/2025', w: 'w-140', cls: 'tbl__th--num' },
              { t: 'Ghi chú' },
            ],
            [
              [{ h: `<div class="checkbox checkbox--on">${ico('check', 14)}</div>`, cls: 'tbl__td--center' }, '801234', 'Trần Minh Quân', 'Kỹ sư chính', 'Thiết kế mạch RF', { h: '21,0', cls: 'tbl__td--num' }, '—'],
              [{ h: `<div class="checkbox checkbox--on">${ico('check', 14)}</div>`, cls: 'tbl__td--center' }, '805512', 'Lê Thị Hồng Nhung', 'Kỹ sư bậc 3', 'Kiểm thử tương thích', { h: '20,0', cls: 'tbl__td--num' }, '—'],
              [{ h: `<div class="checkbox checkbox--on">${ico('check', 14)}</div>`, cls: 'tbl__td--center' }, '807781', 'Phạm Văn Đức', 'Trợ lý dự án', 'Quản trị dự án', { h: '21,0', cls: 'tbl__td--num' }, '—'],
              [{ h: `<div class="checkbox checkbox--on">${ico('check', 14)}</div>`, cls: 'tbl__td--center' }, '803095', 'Nguyễn Hoàng Anh', 'Kỹ sư bậc 1', 'Thiết kế mạch RF', { h: '19,5', cls: 'tbl__td--num' }, '—'],
              [{ h: `<div class="checkbox checkbox--on">${ico('check', 14)}</div>`, cls: 'tbl__td--center' }, '809442', 'Vũ Thị Thu Hà', 'Chuyên viên Công nghệ', 'Tài liệu kỹ thuật', { h: '21,0', cls: 'tbl__td--num' }, '—'],
              [{ h: '<div class="checkbox"></div>', cls: 'tbl__td--center' }, '806120', 'Trần Thị Mai', 'Kỹ sư bậc 2', 'Kiểm thử tương thích', { h: '', cls: 'tbl__td--num' }, `${tag('Không còn ở đơn vị', 'warning')} — không có trong BM0 tháng 05`],
              [{ h: '<div class="checkbox"></div>', cls: 'tbl__td--center' }, '802217', 'Đỗ Quang Huy', 'Trưởng phòng ban', '— (mới về)', { h: '18,0', cls: 'tbl__td--num' }, `${tag('Mới trong BM0 05/2025', 'info')}`],
              [{ h: '<div class="checkbox"></div>', cls: 'tbl__td--center' }, '810993', 'Nguyễn Văn Tú', 'Kỹ sư bậc 1', '— (mới về)', { h: '21,0', cls: 'tbl__td--num' }, `${tag('Mới trong BM0 05/2025', 'info')}`],
            ],
            { rowCls: (i) => (i === 5 ? 'tbl__row--warn' : '') },
          )}`,
      foot: `<div class="spacer caption">Đã chọn <strong>5</strong> / 8 người</div>${btn('Huỷ', { variant: 'secondary' })}${btn('Thêm 5 người vào bảng chấm', { icon: 'check' })}`,
    }),
  }) +
  note('Tiện ích BẮT BUỘC của đợt 2 (kế hoạch §6.5)', [
    'Chọn tháng mới ⇒ <strong>tự gợi ý danh sách nhân sự như tháng gần nhất</strong>. Đây là yêu cầu ghi thẳng ở dòng 125–126 sheet <code>2.Chấm công</code>, không phải tính năng thêm cho đẹp.',
    'Gợi ý phải <strong>đối chiếu với BM0 của kỳ đang chấm</strong>: ai không còn trong bảng công tháng này thì bỏ tích sẵn và nói rõ lý do; ai mới xuất hiện thì gợi ý thêm vào.',
    'Không tự động thêm thẳng — vẫn để PA tích chọn. Nhiệm vụ khác nhau thì thành phần khác nhau, tự thêm là ép dữ liệu sai.',
  ]);

/* ================= 2D · Hai tiện ích còn lại của §6.5 — autocomplete + CPNC tạm tính */
const tienIchNhapLieu = () =>
  bare(
    `<div class="page" style="width:1440px;margin:0 auto">
      ${pageHead('Tiện ích nhập liệu bắt buộc', 'Ba tiện ích ở §6.5 kế hoạch. Artboard 2C vẽ cái thứ nhất; hai cái còn lại ở đây vì chúng là component nội trang, không phải hộp thoại.')}
      <div class="row" style="gap:24px;align-items:flex-start">
        <div class="card grow">
          <div class="card__title">Gõ mã NV ⇒ tự hiện tên và chức danh</div>
          <div class="caption">Panel gợi ý mở ngay dưới ô nhập. Mỗi dòng phải có <strong>đủ ba thứ</strong>: mã, họ tên, đơn vị — mã NV 6 số một mình không đủ để người chấm biết mình chọn đúng ai.</div>
          <div class="col" style="gap:0;width:520px">
            ${field('Mã nhân viên', input('8055', { iconRight: 'search' }))}
            <div class="ddpanel">
              <div class="ddopt ddopt--active">${ico('user', 16)}<span><strong>805512</strong> · Lê Thị Hồng Nhung</span><span class="ddopt__meta">Kỹ sư bậc 3 · TT Chế tạo ĐTKT</span></div>
              <div class="ddopt">${ico('user', 16)}<span><strong>805518</strong> · Đặng Thị Hồng Vân</span><span class="ddopt__meta">Chuyên viên · Phòng Tổng hợp</span></div>
              <div class="ddopt">${ico('user', 16)}<span><strong>805540</strong> · Lê Hồng Sơn</span><span class="ddopt__meta">Kỹ sư bậc 2 · TT Camera</span></div>
            </div>
          </div>
          <div class="alert alert--warn">${ico('alert', 18)}
            <div class="alert__body"><div class="alert__title">Trạng thái không tìm thấy</div>
            <div>Gõ mã không có trong danh mục Nhân viên ⇒ panel hiện <em>"Không có nhân viên nào khớp — mã NV phải khai ở Danh mục Nhân viên trước"</em>, kèm link mở màn danh mục. Không cho nhập tự do.</div></div>
          </div>
        </div>

        <div class="card grow">
          <div class="card__title">CPNC tạm tính hiện ngay trên màn</div>
          <div class="caption">Tính theo bảng lương đã import của kỳ (sheet <code>2.Chấm công</code> dòng 27–28). Là con số <strong>tạm tính</strong> — chốt thật ở BM3 sau khi kỳ khoá.</div>
          <div class="row" style="gap:12px">
            <div class="stat"><small>Công đã phân bổ</small><strong>6,0 / 21,0</strong></div>
            <div class="stat"><small>Tỷ lệ</small><strong>28,6%</strong></div>
            <div class="stat stat--ok"><small>CPNC tạm tính tháng này</small><strong>${money(9714286)} đ</strong></div>
          </div>
          <div class="row" style="gap:12px">
            <div class="stat stat--warn" style="flex:1 1 auto"><small>Công thừa sẽ tự vào "Chi phí quản lý"</small><strong>15,0 công · ${money(24285714)} đ</strong></div>
          </div>
          <div class="alert alert--info">${ico('info', 18)}
            <div class="alert__body"><div class="alert__title">Mẫu số là công của CHÍNH NGƯỜI ĐÓ</div>
            <div><code>tyLe = congPhanBo / congTinhLuong</code> — 21,0 ở đây là công tính lương của Trần Minh Quân trong BM0, <strong>không phải</strong> ngày công chuẩn 20,0 của kỳ. Tỷ lệ này áp cho <strong>từng khoản</strong> trong 13 khoản mục, không áp cho tổng.</div></div>
          </div>
        </div>
      </div>
    </div>`,
  ) +
  note('Ba tiện ích này quyết định người dùng có chịu dùng phần mềm hay không', [
    'Chúng nằm ở dòng 125–126 sheet <code>2.Chấm công</code> — tức là khách đã nêu đích danh, không phải đề xuất của đội làm.',
    'CPNC tạm tính phải đọc <strong>một nguồn duy nhất</strong> là <code>cpnc.service.ts</code>, cùng nơi BM3 và 5 báo cáo đọc. Tính lại tại chỗ cho nhanh là mở đường cho hai con số khác nhau trên hai màn.',
    'Con số tạm tính phải ghi rõ chữ <strong>"tạm tính"</strong>: kỳ chưa khoá thì bảng lương còn có thể import đè.',
  ]);

/* ------------------------------- 2B2 · Hai kết cục sau khi bấm Trình ký ------- */
const trinhKyKetQua = () =>
  bare(
    `<div class="page" style="width:1440px;margin:0 auto">
      ${pageHead('Trình ký VOffice — hai kết cục', 'Adapter mock BẮT BUỘC có nhánh trả lỗi, nếu không thì không ai dựng được giao diện thất bại. Hai thẻ dưới đây là hai trạng thái loại trừ nhau của cùng một nút.')}
      <div class="row" style="gap:24px;align-items:flex-start">
        <div class="card grow">
          <div class="card__title">Trạng thái sau khi trình — thành công</div>
          <div class="alert alert--success">${ico('check-circle', 18)}
            <div class="alert__body"><div class="alert__title">Đã trình ký thành công</div>
            <div>Số văn bản <strong>412/TTr-CNC</strong> · trình lúc 03/06/2025 15:41 · đang chờ lãnh đạo Khối 1 ký.</div></div>
          </div>
          <div class="row" style="gap:8px">${tag('Đang chờ ký', 'warning')}${btn('Mở trên VOffice', { icon: 'link', variant: 'secondary', sm: true })}</div>
        </div>
        <div class="card grow">
          <div class="card__title">Trạng thái sau khi trình — thất bại</div>
          <div class="alert alert--error">${ico('x-circle', 18)}
            <div class="alert__body"><div class="alert__title">Không gửi được sang VOffice</div>
            <div>Kết nối bị từ chối (HTTP 502 · <code>voffice-adapter</code> · 15:41:08). Bản chấm công <strong>vẫn giữ nguyên trạng thái đã xác nhận</strong> — không bị mất.</div></div>
          </div>
          <div class="row" style="gap:8px">${btn('Thử lại', { icon: 'refresh', variant: 'secondary', sm: true })}${btn('Xem cấu hình tích hợp', { icon: 'settings', variant: 'ghost', sm: true })}</div>
        </div>
      </div>

      <div class="card">
        <div class="card__title">Cùng hai kết cục đó khi hiện dưới dạng toast</div>
        <div class="caption">Thẻ trạng thái ở trên nằm LẠI trên màn; toast chỉ chớp qua. Cả hai đều cần — người dùng rời màn rồi quay lại vẫn phải biết đã trình ký hay chưa.</div>
        <div class="row" style="gap:24px;align-items:flex-start">
          ${toast('success', 'Đã trình ký VOffice', 'Số văn bản 412/TTr-CNC · đang chờ lãnh đạo Khối 1 ký.')}
          ${toast('error', 'Trình ký thất bại', 'HTTP 502 từ voffice-adapter lúc 15:41:08. Bản chấm công vẫn giữ nguyên trạng thái đã xác nhận.')}
        </div>
      </div>
    </div>`,
  ) +
      note('Hai kết cục — vì sao phải vẽ cả hai', [
        'Adapter mock phải <strong>có nhánh trả lỗi</strong> để dựng được giao diện thất bại. Thiếu nhánh này thì đến lúc VOffice thật trả 502, màn hình không có gì để hiện.',
        'Thông báo lỗi phải nêu <strong>mã lỗi, hệ thống nào, lúc mấy giờ</strong> — và nói rõ dữ liệu <strong>không bị mất</strong>. Đây là nỗi sợ đầu tiên của người vừa bấm Trình ký.',
        'Nút <em>Thử lại</em> và <em>Xem cấu hình tích hợp</em> đi kèm nhánh lỗi: một cho người dùng, một cho quản trị.',
      ]);

module.exports = [
  { code: '25', group: '2 · Chấm công', title: 'Chấm công biến thể A — KHCN', desc: 'Bảng nội dung CV + ma trận 31 ngày — khổ rộng', body: chamCongKHCN },
  { code: '26', group: '2 · Chấm công', title: 'Chấm công biến thể B — PAKD', desc: 'Phân nguồn × sản phẩm, Bảo hành để trống — khổ rộng', body: chamCongPAKD },
  { code: '27', group: '2 · Chấm công', title: 'Chấm công biến thể C — ĐTPT QPAN', desc: 'Một dòng tổng, CPNC còn lại âm — khổ rộng', body: chamCongDTPT },
  { code: '28', group: '2 · Chấm công', title: 'Luật khoá ô chấm công', desc: 'Bốn luật khoá + tooltip nêu tên nhiệm vụ', body: luatKhoaO },
  { code: '29', group: '2 · Chấm công', title: 'Submit không hợp lệ', desc: 'Liệt kê từng ô thiếu — khổ rộng', body: submitLoi },
  { code: '2A', group: '2 · Chấm công', title: 'Chấm công theo đơn vị', desc: 'Màn HR: 4 trạng thái × tỷ lệ PBNC', body: chamCongDonVi },
  { code: '2B', group: '2 · Chấm công', title: 'Trình ký VOffice', desc: 'Modal nổi trên màn chấm công', body: trinhKy },
  { code: '2B2', group: '2 · Chấm công', title: 'Kết quả trình ký VOffice', desc: 'Hai nhánh thành công / thất bại + toast', body: trinhKyKetQua },
  { code: '2C', group: '2 · Chấm công', title: 'Gợi ý nhân sự từ tháng gần nhất', desc: 'Tiện ích bắt buộc §6.5 — dialog 900px', body: goiYNhanSu },
  { code: '2D', group: '2 · Chấm công', title: 'Tiện ích nhập liệu bắt buộc', desc: 'Autocomplete mã NV + CPNC tạm tính', body: tienIchNhapLieu },
];
