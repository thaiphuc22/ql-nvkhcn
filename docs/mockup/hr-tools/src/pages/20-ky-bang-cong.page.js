/* =============================================================================
 * Đợt 2 phần 1 — Kỳ, bảng công BM0, bảng lương BM0 (§6.1, §6.2, §6.6, §7.2).
 *
 * Hai thực thể tách bạch, đừng gộp:
 *   · `BangCongThangImport` (BM0) — HR import từ SAP/HRM, **CHỈ ĐỌC**, sửa = import đè cả kỳ.
 *   · `PhanBoCong` (BM2.1/2.2) — PA/PM chấm trên màn, sửa được tới khi submit. Ở file 30.
 *
 * Bảng lương có HAI artboard vì phân quyền là **fail-closed**: tài khoản không có quyền thì cột
 * tiền KHÔNG ĐƯỢC RENDER, chứ không phải render rồi chặn khi bấm.
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, frame, bare, DIM, dlg, toast, pageHead, btn, input, select, search, field, tag, table, tableFoot, rowActions, note, days31, money } = U;

const MONTH = 'Tháng 05/2025';

/* Người thật lấy từ danh mục nhân viên ở artboard 12 — giữ nguyên bộ này qua mọi màn để số liệu
   giữa các artboard không đá nhau khi khách soi chéo. */
const NGUOI = [
  ['801234', 'Trần Minh Quân', 'Kỹ sư chính', 21.0],
  ['805512', 'Lê Thị Hồng Nhung', 'Kỹ sư bậc 3', 20.0],
  ['807781', 'Phạm Văn Đức', 'Trợ lý dự án', 21.0],
  ['803095', 'Nguyễn Hoàng Anh', 'Kỹ sư bậc 1', 19.5],
  ['809442', 'Vũ Thị Thu Hà', 'Chuyên viên Công nghệ', 21.0],
  ['802217', 'Đỗ Quang Huy', 'Trưởng phòng ban', 18.0],
];

/* Ký hiệu công của BM0 — ma trận người × 31 ngày, ô là `X:8` / `P:8` / `DL:8`.
   Nghỉ lễ 01/05 và 02/05 (Quốc tế Lao động) là dữ liệu thật của tháng 5/2025. */
function bm0Row(idx) {
  return days31.map((d) => {
    if (d.d === 1 || d.d === 2) return { k: 'locked', t: 'DL' };
    if (d.weekend) return { k: 'weekend', t: '' };
    // vài ngày nghỉ phép rải rác để nhìn ra được luật khoá ô ở màn chấm công
    if (idx === 1 && (d.d === 12 || d.d === 13)) return { k: 'locked', t: 'P' };
    if (idx === 3 && d.d === 26) return { k: 'locked', t: 'P' };
    if (idx === 5 && d.d >= 19 && d.d <= 23) return { k: 'locked', t: 'P' };
    return { k: 'empty', t: 'X' };
  });
}

const dayTh = () =>
  days31
    .map(
      (x) =>
        `<div class="tbl__th matrix__th-day"${x.weekend ? ' style="background:var(--vht-gray-90)"' : ''}>` +
        `<div>${x.d}</div><div class="matrix__dow">${x.dow}</div></div>`,
    )
    .join('');

/* ================================================================ 20 · Kỳ chấm công */
const kyList = (opts = {}) =>
  frame(
    'ky',
    `<div class="page">
      ${pageHead('Kỳ chấm công', 'Kỳ khoá toàn bộ bảng công, bảng lương và báo cáo. Kỳ lương ≠ kỳ trả — BM3.2 ghi rõ "Kỳ lương 06/2025 - Kỳ trả 07/2025".', `${btn('Tạo kỳ mới', { icon: 'plus' })}`)}
      <div class="card">
        <div class="filters">
          <div class="filters__left">${tag('Đang mở: 1 kỳ', 'success')}${tag('Đang chốt: 1 kỳ', 'warning')}</div>
          ${select('Năm 2025')}${select('Loại kỳ: Tháng')}${search('Tìm theo mã kỳ')}
        </div>
        ${table(
          [
            { t: 'STT', w: 'w-56', cls: 'tbl__th--center' },
            { t: 'Thao tác', w: 'w-140' },
            { t: 'Trạng thái', w: 'w-140', cls: 'tbl__th--center' },
            { t: 'Mã kỳ', w: 'w-110' },
            { t: 'Loại', w: 'w-80' },
            { t: 'Từ ngày', w: 'w-110' },
            { t: 'Đến ngày', w: 'w-110' },
            { t: 'Ngày công chuẩn', w: 'w-120', cls: 'tbl__th--num' },
            { t: 'Kỳ trả lương', w: 'w-110' },
            { t: 'Đơn vị đã chốt', w: 'w-120', cls: 'tbl__th--num' },
          ],
          [
            ['1', `<div class="actions">${btn('Khoá kỳ', { icon: 'lock', variant: 'secondary', sm: true })}</div>`, { h: tag('Đang mở', 'success'), cls: 'tbl__td--center' }, '<span class="code-link">2025-06</span>', 'Tháng', '01/06/2025', '30/06/2025', { h: '21,0', cls: 'tbl__td--num' }, '07/2025', { h: '3 / 30', cls: 'tbl__td--num' }],
            ['2', `<div class="actions">${btn('Khoá kỳ', { icon: 'lock', variant: 'secondary', sm: true })}</div>`, { h: tag('Đang chốt', 'warning'), cls: 'tbl__td--center' }, '<span class="code-link">2025-05</span>', 'Tháng', '01/05/2025', '31/05/2025', { h: '20,0', cls: 'tbl__td--num' }, '06/2025', { h: '27 / 30', cls: 'tbl__td--num' }],
            ['3', `<div class="actions">${btn('Mở lại kỳ', { icon: 'unlock', variant: 'secondary', sm: true })}</div>`, { h: tag('Đã khoá', ''), cls: 'tbl__td--center' }, '<span class="code-link">2025-04</span>', 'Tháng', '01/04/2025', '30/04/2025', { h: '20,0', cls: 'tbl__td--num' }, '05/2025', { h: '30 / 30', cls: 'tbl__td--num' }],
            ['4', `<div class="actions">${btn('Mở lại kỳ', { icon: 'unlock', variant: 'secondary', sm: true })}</div>`, { h: tag('Đã khoá', ''), cls: 'tbl__td--center' }, '<span class="code-link">2025-03</span>', 'Tháng', '01/03/2025', '31/03/2025', { h: '21,0', cls: 'tbl__td--num' }, '04/2025', { h: '30 / 30', cls: 'tbl__td--num' }],
          ],
          { rowCls: (i) => (i === 1 ? 'tbl__row--selected' : '') },
        )}
        ${tableFoot(18, { pages: [1] })}
      </div>

      <div class="card">
        <div class="card__title">Nhật ký mở/khoá kỳ</div>
        <div class="caption">Thao tác mở kỳ đã khoá <strong>ghi audit kèm lý do</strong>. Không có việc này thì số báo cáo đổi sau lưng người đã ký.</div>
        ${table(
          [
            { t: 'Thời điểm', w: 'w-160' },
            { t: 'Kỳ', w: 'w-110' },
            { t: 'Hành động', w: 'w-140' },
            { t: 'Người thực hiện', w: 'w-220' },
            { t: 'Lý do' },
          ],
          [
            ['18/06/2025 09:14', '2025-04', tag('Mở lại kỳ', 'warning'), 'Nguyễn Thu Hà (HR)', 'Bổ sung 3 nhân sự Trung tâm Camera bị sót trong file HRM'],
            ['16/06/2025 17:02', '2025-04', tag('Khoá kỳ', ''), 'Nguyễn Thu Hà (HR)', '—'],
            ['02/06/2025 08:30', '2025-05', tag('Tạo kỳ', 'info'), 'Hệ thống (tự động)', 'Sinh kỳ theo lịch tháng'],
          ],
        )}
      </div>
    </div>`,
    opts,
  ) +
  note('Câu hỏi còn CHẶN đợt 2 (Q2 trong kế hoạch)', [
    '<strong>Ai được mở lại kỳ đã khoá</strong>, và lý do có bắt buộc không? Mockup này giả định: chỉ vai trò HR, và lý do BẮT BUỘC. Cần khách xác nhận.',
    'Kỳ đã khoá thì bảng công và bảng lương của kỳ đó không sửa được — kể cả import đè.',
  ]);

/* ============================================== 21 · Dialog mở lại kỳ đã khoá */
const dialogMoKy = () =>
  kyList({
    overlay: `<div class="dialog dialog--form">
        <div class="dialog__head"><div class="dialog__title">Mở lại kỳ 2025-04</div>${ico('x', 18)}</div>
        <div class="dialog__body">
          <div class="alert alert--warn">${ico('alert', 18)}
            <div class="alert__body"><div class="alert__title">Kỳ này đã khoá và đã trình ký</div>
            <div>Mở lại sẽ cho phép sửa bảng công, bảng lương và <strong>làm thay đổi số liệu của 5 báo cáo</strong> mà lãnh đạo đã xem. Thao tác được ghi vào nhật ký kèm tên bạn.</div></div>
          </div>
          <div class="desc" style="gap:8px 24px">
            <div class="desc__item"><div class="desc__label">Kỳ</div><div class="desc__value">2025-04 (01/04 – 30/04/2025)</div></div>
            <div class="desc__item"><div class="desc__label">Khoá lúc</div><div class="desc__value">16/06/2025 17:02</div></div>
            <div class="desc__item"><div class="desc__label">Đơn vị đã chốt</div><div class="desc__value">30 / 30</div></div>
            <div class="desc__item"><div class="desc__label">Đã trình ký VOffice</div><div class="desc__value">Có — số 412/TTr-CNC</div></div>
          </div>
          ${field('Lý do mở lại kỳ', input('Bổ sung 3 nhân sự Trung tâm Camera bị sót trong file HRM tháng 4', { cls: 'input--area' }), { required: true, help: 'Bắt buộc — hiện trong nhật ký và trong báo cáo chênh lệch số liệu.' })}
          <div class="choice"><div class="checkbox checkbox--on">${ico('check', 14)}</div><span>Tôi hiểu số liệu báo cáo của kỳ này sẽ thay đổi</span></div>
        </div>
      <div class="dialog__foot">${btn('Huỷ', { variant: 'secondary' })}${btn('Mở lại kỳ', { icon: 'unlock' })}</div>
    </div>`,
  });

/* ================================ 21B · Xác nhận ĐÈ CẢ KỲ khi import lại (hộp 400) */
const dialogDeCaKy = () =>
  bangCong({
    overlay: dlg({
      title: 'Kỳ 05/2025 đã có dữ liệu',
      size: 'confirm',
      body: `
          <div class="alert alert--warn">${ico('alert', 18)}
            <div class="alert__body"><div class="alert__title">Nhập lại sẽ ĐÈ CẢ KỲ</div>
            <div>Toàn bộ <strong>1.179 dòng</strong> bảng công tháng 05/2025 đang có sẽ bị xoá và thay bằng dữ liệu trong file mới. Hệ thống <strong>không</strong> ghép từng dòng.</div></div>
          </div>
          <div class="desc" style="gap:8px 24px">
            <div class="desc__item"><div class="desc__label">Đang có</div><div class="desc__value">1.179 dòng · nhập 02/06/2025</div></div>
            <div class="desc__item"><div class="desc__label">File mới</div><div class="desc__value">1.184 dòng · BM0_T05_2025_v2.xlsx</div></div>
          </div>
          <div class="choice"><div class="checkbox checkbox--on">${ico('check', 14)}</div><span>Tôi hiểu dữ liệu bảng công cũ của kỳ này sẽ bị xoá</span></div>`,
      foot: `${btn('Huỷ', { variant: 'secondary' })}${btn('Xoá và nhập đè cả kỳ', { icon: 'upload' })}`,
    }),
  }) +
  note('Hộp xác nhận phá huỷ — vì sao viết dài đến vậy', [
    'Ramp <strong>brand</strong> và <strong>danger</strong> của design system TRÙNG NHAU (#EE0033) ⇒ không được phân biệt hành động phá huỷ bằng màu. Phải phân biệt bằng <strong>chữ trên nút</strong> ("Xoá và nhập đè cả kỳ", không phải "OK"), bằng con số cụ thể sẽ mất, và bằng ô tích xác nhận.',
    'Kế hoạch §6.6 ghi rõ: <em>"Import lại kỳ đã có ⇒ hỏi rõ ĐÈ CẢ KỲ, không merge từng dòng"</em>. Đây là màn hiện thực câu đó.',
    'Kỳ đã <strong>khoá</strong> thì không tới được hộp này — nút Nhập BM0 bị chặn từ trước.',
  ]);

/* ==================== 21C · Đang xử lý + toast thất bại (trạng thái chạy nền) */
const dangImport = () =>
  bangCong({
    overlay: `<div class="overlay-busy">
        ${ico('upload', 28)}
        <div class="col" style="gap:4px;align-items:center">
          <div class="strong">Đang nhập bảng công tháng 05/2025</div>
          <div class="caption">Đã xử lý 742 / 1.184 dòng · còn khoảng 25 giây</div>
        </div>
        <div class="progress"><div class="progress__bar" style="width:63%"></div></div>
        <div class="caption">Đừng đóng trình duyệt. Hệ thống ghi đè theo kỳ nên nửa chừng dừng lại là kỳ ở trạng thái dở dang.</div>
      </div>`,
    toasts: toast('error', 'Lần nhập trước thất bại', 'File BM0_T05_2025.xlsx: dòng 58 thiếu mã nhân viên. Kỳ 05/2025 đã được khôi phục về dữ liệu cũ.'),
  }) +
  note('Trạng thái "đang chạy" — dùng thanh tiến trình, không dùng spinner', [
    'Spinner là hoạt ảnh: ảnh chụp tĩnh chỉ ra một cung tròn cụt, và Figma cũng không dựng được hoạt ảnh. Thanh tiến trình <strong>xác định</strong> vừa kết xuất được, vừa nói cho người dùng biết còn bao lâu.',
    'Nói rõ hậu quả nếu dừng giữa chừng — import ghi đè theo kỳ nên đây không phải cảnh báo thừa.',
    'Toast <strong>error</strong> phải nêu <em>dòng nào, thiếu gì</em> và hệ thống đã làm gì (khôi phục dữ liệu cũ). Toast chỉ ghi "Có lỗi xảy ra" thì không ai sửa được.',
  ]);

/* ============================================= 22 · Bảng công tháng (BM0, chỉ đọc) */
const bangCong = (opts = {}) =>
  frame(
    'bang-cong',
    `<div class="page">
      ${pageHead('Bảng công tháng — ' + MONTH, 'Dữ liệu HRM/SAP do HR nhập từ file BM0. CHỈ ĐỌC — muốn sửa phải import đè cả kỳ, không sửa từng ô.', `${btn('Xuất Excel', { icon: 'download', variant: 'secondary' })}${btn('Nhập BM0 bảng công', { icon: 'upload' })}`)}
      <div class="card">
        <div class="filters">
          <div class="filters__left">
            ${tag('Nguồn: BM0_BangCong_T05_2025.xlsx · 1.179 dòng · nhập 02/06 08:15', 'info')}
          </div>
          ${select('Kỳ 2025-05')}${select('Khối 1 - TCT CNC')}${select('Trung tâm CHĐK')}${search('Tìm mã NV / họ tên')}
        </div>

        <div class="tbl">
          <div class="tbl__head">
            <div class="tbl__th w-48 tbl__th--center">TT</div>
            <div class="tbl__th w-90">Mã NV</div>
            <div class="tbl__th w-180">Họ và tên</div>
            <div class="tbl__th w-160">Chức danh</div>
            ${dayTh()}
            <div class="tbl__th w-120 tbl__th--num">Công tính lương</div>
          </div>
          ${NGUOI.map(
            (p, i) => `<div class="tbl__row">
              <div class="tbl__td w-48 tbl__td--center">${i + 1}</div>
              <div class="tbl__td w-90"><span class="code-link">${p[0]}</span></div>
              <div class="tbl__td w-180">${p[1]}</div>
              <div class="tbl__td w-160">${p[2]}</div>
              ${bm0Row(i)
                .map((c) => `<div class="tbl__td matrix__day"><div class="cell cell--${c.k}">${c.t}</div></div>`)
                .join('')}
              <div class="tbl__td w-120 tbl__td--num"><strong>${String(p[3]).replace('.', ',')}</strong></div>
            </div>`,
          ).join('')}
        </div>

        <div class="row row--wrap" style="gap:20px">
          <div class="legend"><span class="legend__swatch" style="background:transparent;border:1px solid var(--vht-border)"></span>X — đi làm</div>
          <div class="legend"><span class="legend__swatch" style="background:var(--vht-gray-95)"></span>T7 / CN</div>
          <div class="legend"><span class="legend__swatch" style="background:var(--vht-gray-90)"></span>P — nghỉ phép · DL — nghỉ lễ</div>
          <div class="legend">Ô trong file gốc có dạng <code>X:8</code> — ký hiệu và số giờ. Mockup hiện ký hiệu, số giờ nằm ở tooltip.</div>
        </div>
        ${tableFoot(148, { pages: [1, 2, 3, 4, '…', 6] })}
      </div>
    </div>`,
    { wide: true, ...opts },
  ) +
  note('Bảng công BM0 — bốn điều dễ làm sai', [
    'Đây là dữ liệu <strong>CHỈ ĐỌC</strong>. Không có nút sửa ô, không có nút thêm dòng. Sửa = import đè cả kỳ, và hệ thống phải <strong>hỏi rõ "đè cả kỳ"</strong> chứ không merge từng dòng.',
    'Cột <strong>Công tính lương</strong> là MẪU SỐ của công thức CPNC (<code>tyLe = congPhanBo / congTinhLuong</code>) — mẫu số là công của CHÍNH NGƯỜI ĐÓ, không phải ngày công chuẩn của kỳ.',
    'Ô <code>P</code>/<code>DL</code> ở đây chính là nguồn của luật khoá ô bên màn chấm công — xem artboard 28.',
    'Kỳ đã khoá ⇒ nút <em>Nhập BM0</em> phải bị chặn, không chỉ ẩn.',
  ]);

/* ============================================= 23 · Bảng lương tháng — vai trò HR */
const KHOAN = [
  ['Lương tháng', 24500000], ['Lương tháng (trừ BH cá nhân)', 22800000],
  ['Truy thu/truy lĩnh', 0], ['Lương SXKD', 3200000],
  ['BHXH cá nhân', 1960000], ['BHXH đơn vị', 3675000],
  ['BHYT cá nhân', 367500], ['BHYT đơn vị', 735000],
  ['BHTN cá nhân', 245000], ['BHTN đơn vị', 245000],
  ['KPCĐ', 490000], ['Ăn ca, điện thoại, phụ cấp', 1850000],
];

const bangLuongHR = () =>
  frame(
    'bang-luong',
    `<div class="page">
      ${pageHead('Bảng lương tháng — ' + MONTH, 'Import từ BM0, CHỈ ĐỌC. BRD giới hạn rõ: hệ thống không xử lý lương chi tiết — chỉ dùng làm tử số của công thức phân bổ CPNC.', `${btn('Xuất BM3.1 / BM3.2', { icon: 'download', variant: 'secondary' })}${btn('Nhập BM0 bảng lương', { icon: 'upload' })}`)}
      <div class="card">
        <div class="filters">
          <div class="filters__left">${tag('Vai trò: HR — thấy đầy đủ cột tiền', 'success')}</div>
          ${select('Kỳ 2025-05')}${select('Trung tâm CHĐK')}${search('Tìm mã NV / họ tên')}
        </div>

        <div class="tbl">
          <div class="tbl__head">
            <div class="tbl__th w-48 tbl__th--center">TT</div>
            <div class="tbl__th w-90">Mã NV</div>
            <div class="tbl__th w-180">Họ và tên</div>
            <div class="tbl__th w-110 tbl__th--num">Công TL</div>
            ${KHOAN.map((k) => `<div class="tbl__th w-140 tbl__th--num">${k[0]}</div>`).join('')}
            <div class="tbl__th w-160 tbl__th--num">CỘNG</div>
          </div>
          ${NGUOI.map((p, i) => {
            const f = [1, 0.94, 1.05, 0.88, 1.12, 0.8][i];
            const cells = KHOAN.map((k) => Math.round((k[1] * f) / 1000) * 1000);
            const tong = cells.reduce((a, b) => a + b, 0);
            return `<div class="tbl__row">
              <div class="tbl__td w-48 tbl__td--center">${i + 1}</div>
              <div class="tbl__td w-90"><span class="code-link">${p[0]}</span></div>
              <div class="tbl__td w-180">${p[1]}</div>
              <div class="tbl__td w-110 tbl__td--num">${String(p[3]).replace('.', ',')}</div>
              ${cells.map((c) => `<div class="tbl__td w-140 tbl__td--num">${c ? money(c) : '—'}</div>`).join('')}
              <div class="tbl__td w-160 tbl__td--num"><strong>${money(tong)}</strong></div>
            </div>`;
          }).join('')}
          <div class="tbl__row tbl__row--total">
            <div class="tbl__td w-48"></div><div class="tbl__td w-90"></div>
            <div class="tbl__td w-180">Tổng đơn vị (148 người)</div>
            <div class="tbl__td w-110 tbl__td--num">2.987,5</div>
            ${KHOAN.map((k) => `<div class="tbl__td w-140 tbl__td--num">${money(Math.round(k[1] * 148 * 0.97))}</div>`).join('')}
            <div class="tbl__td w-160 tbl__td--num">3.482.150.000</div>
          </div>
        </div>

        <div class="alert">${ico('info', 18)}
          <div class="alert__body"><div class="alert__title">13 khoản mục, chia pro-rata từng khoản</div>
          <div>CPNC không phải một con số mà là <strong>vector khoản mục</strong>. Công thức áp cho <em>từng</em> khoản: <code>CPNC_phânBổ[khoản] = CPNC_tháng[khoản] × (côngPhânBổ / côngTínhLương)</code> — không nhân vào tổng rồi chia ngược.</div></div>
        </div>
        ${tableFoot(148, { pages: [1, 2, 3, 4, '…', 6] })}
      </div>
    </div>`,
    { wide: true },
  );

/* ================================= 24 · Bảng lương tháng — vai trò PA (fail-closed) */
const bangLuongPA = () =>
  frame(
    'bang-luong',
    `<div class="page">
      ${pageHead('Bảng lương tháng — ' + MONTH, 'Cùng một màn, tài khoản PA đơn vị. Các cột chi phí KHÔNG được render — không phải render rồi chặn khi bấm.', `${btn('Xuất Excel', { icon: 'download', variant: 'secondary', cls: 'btn--disabled' })}`)}
      <div class="card">
        <div class="alert alert--warn">${ico('lock', 18)}
          <div class="alert__body"><div class="alert__title">Bạn không có quyền xem dữ liệu lương</div>
          <div>Ma trận quyền của khách: <strong>chỉ vai trò HR</strong> được xuất bảng lương (BM3.1 / BM3.2). Vai trò PA đơn vị chủ trì, PA đơn vị khác và PM đều không thấy cột tiền.</div></div>
        </div>
        <div class="filters">
          <div class="filters__left">${tag('Vai trò: PA · Trung tâm CHĐK', 'warning')}</div>
          ${select('Kỳ 2025-05')}${search('Tìm mã NV / họ tên')}
        </div>
        ${table(
          [
            { t: 'TT', w: 'w-56', cls: 'tbl__th--center' },
            { t: 'Mã NV', w: 'w-110' },
            { t: 'Họ và tên', w: 'w-240' },
            { t: 'Chức danh', w: 'w-200' },
            { t: 'Công tính lương', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Công đã phân bổ', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Trạng thái chấm công' },
          ],
          NGUOI.map((p, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            `<span class="code-link">${p[0]}</span>`,
            p[1], p[2],
            { h: String(p[3]).replace('.', ','), cls: 'tbl__td--num' },
            { h: [16, 20, 21, 12, 21, 6][i].toFixed(1).replace('.', ','), cls: 'tbl__td--num' },
            [tag('Còn 5,0 công chưa phân bổ', 'warning'), tag('Đã phân bổ đủ', 'success'), tag('Đã phân bổ đủ', 'success'), tag('Còn 7,5 công chưa phân bổ', 'warning'), tag('Đã phân bổ đủ', 'success'), tag('Còn 12,0 công chưa phân bổ', 'warning')][i],
          ]),
        )}
        ${tableFoot(148, { pages: [1, 2, 3, 4, '…', 6] })}
      </div>
    </div>`,
  ) +
  note('Fail-closed — cách kiểm chứng', [
    'Nghiệm thu phải soi <strong>trong DOM</strong>, không nhìn bằng mắt: đăng nhập tài khoản PA rồi tìm chuỗi tiền trong HTML — không được có.',
    'Mã quyền bảng lương <strong>tách riêng</strong> khỏi mã quyền bảng công. Gộp một mã là mở quyền lương cho mọi người chấm công.',
    'Nhắc lại bẫy đã ghi: catalog quyền của identity-service <strong>gate hành động thật</strong> — tắt một mã là cắt quyền thật, không chỉ ẩn UI.',
  ]);

module.exports = [
  { code: '20', group: '2 · Kỳ & Bảng công', title: 'Kỳ chấm công', desc: 'Danh sách kỳ + nhật ký mở/khoá', body: kyList },
  { code: '21', group: '2 · Kỳ & Bảng công', title: 'Dialog mở lại kỳ đã khoá', desc: 'Lý do bắt buộc + cảnh báo đổi số báo cáo', body: dialogMoKy },
  { code: '21B', group: '2 · Kỳ & Bảng công', title: 'Xác nhận đè cả kỳ khi import lại', desc: 'Hộp xác nhận 400px nổi trên màn', body: dialogDeCaKy },
  { code: '21C', group: '2 · Kỳ & Bảng công', title: 'Đang nhập dữ liệu và toast thất bại', desc: 'Lớp phủ tiến trình + toast lỗi', body: dangImport },
  { code: '22', group: '2 · Kỳ & Bảng công', title: 'Bảng công tháng BM0', desc: 'Ma trận người × 31 ngày, chỉ đọc — khổ rộng', body: bangCong },
  { code: '23', group: '2 · Kỳ & Bảng công', title: 'Bảng lương tháng — vai trò HR', desc: '13 khoản mục, đầy đủ cột tiền — khổ rộng', body: bangLuongHR },
  { code: '24', group: '2 · Kỳ & Bảng công', title: 'Bảng lương tháng — vai trò PA', desc: 'Fail-closed: cột tiền không render', body: bangLuongPA },
];
