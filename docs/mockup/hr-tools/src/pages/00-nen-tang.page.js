/* =============================================================================
 * 00 — Sticker sheet, và 01 — bộ trạng thái dùng chung.
 *
 * IMPORT HAI ARTBOARD NÀY TRƯỚC. Từ đây tạo Styles (màu, chữ, đổ bóng) và Components (nút, ô
 * nhập, tag, ô bảng, pager, dialog) trong Figma; các artboard màn hình sau đó chỉ việc thay
 * instance vào. Bỏ qua bước này thì mỗi màn import về một bộ style trùng lặp riêng, và file
 * Figma sẽ có 40 sắc đỏ "khác nhau" cùng là #EE0033.
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, bare, btn, input, select, search, field, tag, table, tableFoot, rowActions, note } = U;

/* --------------------------------------------------------------- mảnh dựng riêng */
const H2 = (t, sub) =>
  `<div class="col" style="gap:2px"><div style="font:var(--vht-font-title);font-family:var(--vht-built-font)">${t}</div>` +
  (sub ? `<div class="caption">${sub}</div>` : '') +
  `</div>`;

const block = (title, sub, body) =>
  `<div class="card" style="gap:16px">${H2(title, sub)}${body}</div>`;

const swatch = (name, val, dark = false) =>
  `<div class="col" style="gap:4px;flex:0 0 92px">
     <div style="height:56px;border-radius:8px;background:${val};border:1px solid var(--vht-border)"></div>
     <div class="caption" style="color:var(--vht-ink)">${name}</div>
     <div class="caption" style="font-family:var(--vht-font-mono);font-size:11px">${val}</div>
   </div>`;

const ramp = (label, prefix, steps, note = '') =>
  `<div class="col" style="gap:8px">
     <div class="row"><div class="strong">${label}</div>${note ? `<div class="caption">${note}</div>` : ''}</div>
     <div class="row row--wrap" style="gap:8px">
       ${steps.map((s) => swatch(s.k, s.v)).join('')}
     </div>
   </div>`;

const BRAND = [
  { k: '10', v: '#3C0006' }, { k: '20', v: '#61000E' }, { k: '30', v: '#890019' },
  { k: '40', v: '#B30024' }, { k: '50', v: '#EE0033' }, { k: '60', v: '#FF3B4A' },
  { k: '70', v: '#FF7F7E' }, { k: '80', v: '#FFAEAB' }, { k: '90', v: '#FFD8D6' },
  { k: '95', v: '#FFECEA' }, { k: '99', v: '#FFFBFA' },
];
const GRAY = [
  { k: '10', v: '#1A1C1E' }, { k: '20', v: '#2F3033' }, { k: '30', v: '#45474A' },
  { k: '40', v: '#5D5E61' }, { k: '50', v: '#76777A' }, { k: '60', v: '#909094' },
  { k: '70', v: '#AAABAE' }, { k: '80', v: '#C6C6C9' }, { k: '90', v: '#E2E2E5' },
  { k: '95', v: '#F1F0F4' }, { k: '99', v: '#FCFCFF' },
];
const SUCCESS = [
  { k: '10', v: '#00230F' }, { k: '30', v: '#00552E' }, { k: '50', v: '#008E50' },
  { k: '70', v: '#3EC87C' }, { k: '90', v: '#8BFFB4' }, { k: '95', v: '#CEFFD9' },
];
const WARNING = [
  { k: '10', v: '#261900' }, { k: '30', v: '#5D4200' }, { k: '50', v: '#996F00' },
  { k: '70', v: '#DBA000' }, { k: '90', v: '#FFDEA3' }, { k: '95', v: '#FFEED6' },
];
const INFO = [
  { k: '10', v: '#00174A' }, { k: '30', v: '#1E4193' }, { k: '50', v: '#5573C7' },
  { k: '70', v: '#8BA7FF' }, { k: '90', v: '#DBE1FF' }, { k: '95', v: '#EEF0FF' },
];

const typeRow = (token, spec, sample) =>
  `<div class="row" style="gap:24px;align-items:baseline">
     <div class="caption" style="flex:0 0 200px;font-family:var(--vht-font-mono)">${token}</div>
     <div class="caption" style="flex:0 0 190px">${spec}</div>
     <div style="font:var(--vht-font-${token});font-family:var(--vht-built-font)">${sample}</div>
   </div>`;

const shadowBox = (name, v) =>
  `<div class="col" style="gap:6px;flex:0 0 150px">
     <div style="height:64px;border-radius:12px;background:#fff;box-shadow:${v}"></div>
     <div class="caption" style="color:var(--vht-ink)">${name}</div>
   </div>`;

/* ============================================================ 00 · STICKER SHEET */
const stickerSheet = () =>
  bare(`
  <div class="content" style="gap:20px">
    <div class="page__head">
      <div class="page__titletext">
        <h1>HR Tools — Sticker sheet</h1>
        <p>Nguồn: <strong>@khcn-core</strong> + <code>tokens.scss</code> nhóm <code>--vht-built-*</code>. D23: khi DS Figma lệch bản đã build thì bản đã build thắng.</p>
      </div>
      <div class="page__actions">${tag('Import trước tiên', 'info')}</div>
    </div>

    ${block('1 · Màu', 'Brand và Danger DÙNG CHUNG một ramp — cố ý. Hệ quả: không phân biệt hành động phá huỷ bằng màu, phải bằng chữ + icon + bước xác nhận.', `
      <div class="col col--16">
        ${ramp('Brand / Danger', 'brand', BRAND, 'nút chính · pill nav · link · nút xoá')}
        ${ramp('Coolgray', 'gray', GRAY, 'nền · chữ · viền · chrome')}
        <div class="row row--wrap" style="gap:32px;align-items:flex-start">
          <div class="col" style="gap:8px">${ramp('Success', 's', SUCCESS)}</div>
          <div class="col" style="gap:8px">${ramp('Warning', 'w', WARNING)}</div>
          <div class="col" style="gap:8px">${ramp('Info', 'i', INFO)}</div>
        </div>
        <div class="alert alert--warn">${ico('alert', 18)}
          <div class="alert__body">
            <div class="alert__title">Bẫy trong file Figma — đừng đọc phần chữ</div>
            <div>Bảng semantic của file DS ghi <code>interactive/primary #F95E00</code> (cam). Sai. Ramp render ra <code>brand/50 = #EE0033</code> và mọi màn thiết kế thật đều đỏ. Luôn lấy theo giá trị render.</div>
          </div>
        </div>
      </div>`)}

    ${block('2 · Chữ — Roboto', 'Bản đã build dùng Roboto, không phải Inter như DS §2 ghi. semibold 600 ánh xạ vào 700 vì Roboto không có 600.', `
      <div class="col" style="gap:10px">
        ${typeRow('display', '28 / 120% / -0.5 / 600', 'Quản lý chi phí nhân công')}
        ${typeRow('heading', '22 / 125% / -0.25 / 600', 'Danh mục nhiệm vụ')}
        ${typeRow('title', '18 / 130% / 0 / 600', 'Nội dung công việc')}
        ${typeRow('subtitle', '16 / 135% / 0 / 500', 'Bảng chấm công theo nội dung công việc')}
        ${typeRow('body', '14 / 150% / 0 / 400', 'Chi phí nhân công được phê duyệt của đề tài 011-24-TĐ-RDP-QS')}
        ${typeRow('body-emphasis', '14 / 150% / 0 / 500', 'Trung tâm Chế tạo Điện tử Khí tài')}
        ${typeRow('label', '13 / 140% / +0.1 / 500', 'Nhãn trường · nút · mục menu')}
        ${typeRow('caption', '12 / 140% / +0.2 / 400', 'Kỳ lương 06/2025 — Kỳ trả 07/2025')}
      </div>`)}

    ${block('3 · Giãn cách, bo góc, đổ bóng', 'Thang 4pt là mặc định cho màn dày dữ liệu; 8pt cho khoảng cách giữa khối lớn.', `
      <div class="col col--16">
        <div class="row row--wrap" style="gap:12px;align-items:flex-end">
          ${[4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64].map((s) => `<div class="col" style="gap:4px;align-items:center"><div style="width:${s}px;height:${s}px;background:var(--vht-brand-90);border-radius:2px"></div><div class="caption">${s}</div></div>`).join('')}
        </div>
        <div class="row row--wrap" style="gap:16px">
          ${[
            ['4 · checkbox', 4], ['8 · logo, nút icon', 8], ['12 · nút, ô nhập, pill nav', 12],
            ['16 · card', 16], ['999 · tag, switch', 999],
          ].map(([lbl, r]) => `<div class="col" style="gap:6px;flex:0 0 150px"><div style="height:52px;border-radius:${r}px;background:var(--vht-gray-95);border:1px solid var(--vht-border)"></div><div class="caption">${lbl}</div></div>`).join('')}
        </div>
        <div class="row row--wrap" style="gap:16px">
          ${shadowBox('none — viền 1px', '0 0 0 1px rgba(0,0,0,.08)')}
          ${shadowBox('sm — Raised', '0 1px 2px rgba(0,0,0,.06), 0 1px 3px -1px rgba(0,0,0,.04)')}
          ${shadowBox('md — Hover', '0 2px 4px rgba(0,0,0,.08), 0 4px 8px -2px rgba(0,0,0,.06)')}
          ${shadowBox('lg — Floating', '0 4px 8px rgba(0,0,0,.1), 0 8px 16px -4px rgba(0,0,0,.08)')}
          ${shadowBox('xl — Overlay', '0 8px 16px rgba(0,0,0,.12), 0 16px 32px -8px rgba(0,0,0,.1)')}
          ${shadowBox('2xl — Top', '0 12px 24px rgba(0,0,0,.14), 0 20px 40px -10px rgba(0,0,0,.12)')}
        </div>
        <div class="caption">Mức <strong>none</strong> KHÔNG phải "không có bóng" — nó là viền 1px vẽ bằng shadow. Đổi thành <code>none</code> là mọi card mất đường bao.</div>
      </div>`)}

    ${block('4 · Nút — cao 40px', 'Bản đã build 40px, DS Figma ghi 36. Sai 4px là lộ ngay ở hàng lọc khi đặt cạnh phân hệ Danh mục dùng chung.', `
      <div class="col col--16">
        <div class="row row--wrap" style="gap:12px">
          ${btn('Thêm mới', { icon: 'plus' })}
          ${btn('Hover', { icon: 'plus', cls: 'btn--hover' })}
          ${btn('Pressed', { icon: 'plus', cls: 'btn--pressed' })}
          ${btn('Focus', { icon: 'plus', cls: 'btn--focus' })}
          ${btn('Disabled', { icon: 'plus', cls: 'btn--disabled' })}
        </div>
        <div class="row row--wrap" style="gap:12px">
          ${btn('Huỷ', { variant: 'secondary' })}
          ${btn('Xuất Excel', { icon: 'download', variant: 'secondary' })}
          ${btn('In biểu mẫu', { icon: 'printer', variant: 'secondary' })}
          ${btn('Làm mới', { icon: 'refresh', variant: 'ghost' })}
          ${btn('Xoá nhiệm vụ', { icon: 'trash' })}
          ${btn('', { icon: 'settings', variant: 'secondary', cls: 'btn--icon' })}
          ${btn('Nút nhỏ', { icon: 'plus', sm: true })}
        </div>
        <div class="alert alert--error">${ico('alert', 18)}
          <div class="alert__body"><div class="alert__title">Nút xoá KHÔNG khác màu nút chính</div>
          <div>Ramp Brand và Danger trùng nhau hoàn toàn. Phân biệt bằng <strong>chữ</strong> ("Xoá nhiệm vụ", không phải "Đồng ý"), <strong>icon thùng rác</strong>, và <strong>hộp xác nhận nêu tên bản ghi</strong>.</div></div>
        </div>
      </div>`)}

    ${block('5 · Ô nhập — cao 40px', '', `
      <div class="col col--16">
        <div class="row row--wrap" style="gap:16px;align-items:flex-start">
          <div style="flex:0 0 260px">${field('Mã nhiệm vụ', input('011-24-TĐ-RDP-QS'), { required: true })}</div>
          <div style="flex:0 0 260px">${field('Placeholder', input('Nhập mã nhiệm vụ', { placeholder: true }))}</div>
          <div style="flex:0 0 260px">${field('Focus', input('011-24', { state: 'focus' }))}</div>
          <div style="flex:0 0 260px">${field('Lỗi', input('011-24-TĐ', { state: 'error' }), { error: 'Mã nhiệm vụ đã tồn tại' })}</div>
          <div style="flex:0 0 260px">${field('Disabled', input('Không sửa được', { state: 'disabled' }))}</div>
          <div style="flex:0 0 260px">${field('Chỉ đọc — import từ HRM', input('21,0 công', { state: 'readonly' }))}</div>
        </div>
        <div class="row row--wrap" style="gap:16px;align-items:flex-start">
          <div style="flex:0 0 260px">${field('Select', select('Đề tài KHCN'))}</div>
          <div style="flex:0 0 260px">${field('Select rỗng', select('Chọn phân loại', { placeholder: true }))}</div>
          <div style="flex:0 0 260px">${field('Ngày', input('08/04/2025', { iconRight: 'calendar' }))}</div>
          <div style="flex:0 0 280px">${field('Tìm kiếm', search('Tìm theo mã hoặc tên nhiệm vụ'))}</div>
          <div style="flex:0 0 360px">${field('Ghi chú', input('Tham gia từ 15/05, chuyển sang nội dung CV khác từ 20/05', { cls: 'input--area' }))}</div>
        </div>
        <div class="row row--wrap" style="gap:24px">
          <div class="choice"><div class="checkbox checkbox--on">${ico('check', 14)}</div><span>Đã chọn</span></div>
          <div class="choice"><div class="checkbox"></div><span>Chưa chọn</span></div>
          <div class="choice"><div class="radio"><div class="radio__dot"></div></div><span>Radio bật</span></div>
          <div class="choice"><div class="radio"></div><span>Radio tắt</span></div>
          <div class="choice"><div class="switch switch--on"><div class="switch__knob"></div></div><span>Đang hoạt động</span></div>
          <div class="choice"><div class="switch"><div class="switch__knob"></div></div><span>Ngừng hoạt động</span></div>
        </div>
      </div>`)}

    ${block('6 · Tag trạng thái', 'Tag luôn có chấm tròn + chữ. Trạng thái không bao giờ chỉ là màu.', `
      <div class="row row--wrap" style="gap:12px">
        ${tag('Chưa chấm công')}
        ${tag('PA đã submit chấm công', 'info')}
        ${tag('PA/PM chủ trì đã xác nhận', 'warning')}
        ${tag('HR hoàn thành trình ký', 'success')}
        ${tag('Đang phân bổ', 'info')}
        ${tag('Đang trình phê duyệt', 'warning')}
        ${tag('Đã hết hạn', 'danger')}
        ${tag('Kỳ đang mở', 'success')}
        ${tag('Kỳ đã khoá', '')}
      </div>`)}

    ${block('7 · Bảng — header 40 · ô 56 · nền header xám', 'Ba con số này là dấu hiệu nhận ra ngay khi đặt cạnh phân hệ Danh mục dùng chung. Thứ tự cột cố định: STT · Thao tác · Trạng thái · dữ liệu.', `
      <div class="col col--16">
        ${table(
          [
            { t: 'STT', w: 'w-56', cls: 'tbl__th--center' },
            { t: 'Thao tác', w: 'w-110' },
            { t: 'Trạng thái', w: 'w-120', cls: 'tbl__th--center' },
            { t: 'Mã nhiệm vụ', w: 'w-200' },
            { t: 'Tên nhiệm vụ' },
            { t: 'CPNC phê duyệt', w: 'w-160', cls: 'tbl__th--num' },
          ],
          [
            ['1', rowActions(), { h: '<div class="switch switch--on"><div class="switch__knob"></div></div>', cls: 'tbl__td--center' }, '<span class="code-link">011-24-TĐ-RDP-QS</span>', 'Hàng bình thường', { h: '1.850.000.000', cls: 'tbl__td--num' }],
            ['2', rowActions(), { h: '<div class="switch"><div class="switch__knob"></div></div>', cls: 'tbl__td--center' }, '<span class="code-link">PO-92166</span>', 'Hàng đang hover', { h: '620.000.000', cls: 'tbl__td--num' }],
            ['3', rowActions(), { h: tag('Đang phân bổ', 'info'), cls: 'tbl__td--center' }, '<span class="code-link">012-25-TĐ-RDP-QS</span>', 'Hàng đang chọn', { h: '2.400.000.000', cls: 'tbl__td--num' }],
            ['4', rowActions(), { h: tag('Đã hết hạn', 'danger'), cls: 'tbl__td--center' }, '<span class="code-link">009-23-TĐ-RDP-QS</span>', 'Hàng cảnh báo — nền đỏ nhạt, không chỉ chữ đỏ', { h: '-2.000.000', cls: 'tbl__td--num' }],
          ],
          { rowCls: (i) => ['', 'tbl__row--hover', 'tbl__row--selected', 'tbl__row--warn'][i] },
        )}
        ${tableFoot(1000)}
      </div>`)}

    ${block('8 · Ô ma trận chấm công', 'Bốn kiểu ô phải đọc được cả khi in đen trắng ⇒ ô khoá mang KÝ HIỆU, không chỉ đổi màu.', `
      <div class="row row--wrap" style="gap:20px">
        ${[
          ['Chưa chấm', 'empty', ''],
          ['Nội dung CV A', 'a', '8'],
          ['Nội dung CV B', 'b', '8'],
          ['Nội dung CV C', 'c', '8'],
          ['Nội dung CV D', 'd', '8'],
          ['T7 / CN', 'weekend', ''],
          ['Nghỉ phép (BM0)', 'locked', 'P'],
          ['Nghỉ lễ (BM0)', 'locked', 'DL'],
          ['Đã chấm ở NV khác', 'taken', '×'],
          ['Thiếu nội dung CV', 'missing', '!'],
        ].map(([lbl, k, txt]) => `<div class="col" style="gap:6px;align-items:center;flex:0 0 120px"><div class="cell cell--${k}">${txt}</div><div class="caption text-center">${lbl}</div></div>`).join('')}
      </div>`)}

    ${block('9 · Dialog — 400 / 520 / 1360', 'Hộp xác nhận 400 · form thêm-sửa 520 · pop-up chọn dữ liệu có bảng 1360.', `
      <div class="row" style="gap:24px;align-items:flex-start">
        <div class="dialog dialog--confirm" style="box-shadow:var(--vht-shadow-lg)">
          <div class="dialog__head"><div class="dialog__title">Xác nhận xoá</div>${ico('x', 18)}</div>
          <div class="dialog__body"><div>Xoá nhiệm vụ <strong style="color:var(--vht-brand-50)">011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát</strong>? Thao tác không hoàn tác được.</div></div>
          <div class="dialog__foot">${btn('Huỷ', { variant: 'secondary' })}${btn('Xoá nhiệm vụ', { icon: 'trash' })}</div>
        </div>
        <div class="dialog dialog--form" style="box-shadow:var(--vht-shadow-lg)">
          <div class="dialog__head"><div class="dialog__title">Thêm mới nội dung công việc</div>${ico('x', 18)}</div>
          <div class="dialog__body">
            ${field('Tên nội dung công việc', input('Thiết kế khối cao tần'), { required: true })}
            ${field('Nhóm công việc', select('Giải pháp'), { required: true })}
            ${field('Đơn vị phân bổ', select('Trung tâm CHĐK'), { required: true })}
          </div>
          <div class="dialog__foot">${btn('Huỷ', { variant: 'secondary' })}${btn('Lưu', { icon: 'check' })}</div>
        </div>
      </div>`)}

    ${block('10 · Chrome — topbar 60 · sider 256 · nav 224×48', 'Topbar TỐI chạy hết chiều ngang, nằm TRÊN cả sider. Sider NỀN TRẮNG. Pill mục đang chọn đỏ đặc, bo 12 (DS ghi 8).', `
      <div class="col" style="gap:12px">
        ${U.topbar()}
        <div class="row" style="gap:24px;align-items:flex-start">
          <div style="flex:0 0 256px;border:1px solid var(--vht-border);border-radius:8px">${U.sider('cham-cong-pb')}</div>
          <div class="col" style="gap:8px;flex:0 0 300px">
            <div class="nav__item">${ico('chart', 18)}<div class="nav__label">Mục thường</div></div>
            <div class="nav__item nav__item--active">${ico('chart', 18)}<div class="nav__label">Mục đang chọn — pill đỏ</div></div>
            <div class="nav__item nav__item--parent-active">${ico('chart', 18)}<div class="nav__label">Nhóm đóng có con đang mở</div>${ico('chevron-down', 14, 'nav__caret')}</div>
            <div class="nav__child">Mục con thường</div>
            <div class="nav__child nav__child--active">Mục con đang chọn</div>
          </div>
        </div>
      </div>`)}
  </div>
  ${note('Ghi chú cho người dựng Figma', [
    'Bo góc mục nav là <strong>12px</strong>, và pill đỏ bên trong cũng 12px ở bản đã build — DS Figma ghi 8, đã bị D23 gạt.',
    'Trang hiện tại của pager là ô <strong>nền xám #F2F2F2</strong>, KHÔNG viền đỏ và KHÔNG tô đỏ đặc. Chỗ này từng sai theo cả hai hướng.',
    'Card bo <strong>16px</strong>, không phải 12.',
    'Sau khi import: tạo Color Styles từ mục 1, Text Styles từ mục 2, Effect Styles từ mục 3, rồi Component hoá mục 4–9.',
  ])}
`);

/* ============================================== 01 · TRẠNG THÁI RỖNG / TẢI / LỖI / KHÔNG QUYỀN */
const stateBlock = (title, sub, body) =>
  `<div class="col" style="gap:8px;flex:1 1 640px;min-width:600px">
     <div class="strong">${title}</div><div class="caption">${sub}</div>
     <div class="card">${body}</div>
   </div>`;

const skelRow = () =>
  `<div class="tbl__row"><div class="tbl__td w-56"><div class="skel skel--text" style="width:20px"></div></div>` +
  `<div class="tbl__td w-110"><div class="skel skel--text" style="width:64px"></div></div>` +
  `<div class="tbl__td w-200"><div class="skel skel--text" style="width:140px"></div></div>` +
  `<div class="tbl__td grow"><div class="skel skel--text" style="width:70%"></div></div>` +
  `<div class="tbl__td w-160"><div class="skel skel--text" style="width:90px"></div></div></div>`;

const trangThaiChung = () =>
  bare(`
  <div class="content" style="gap:20px">
    <div class="page__head">
      <div class="page__titletext">
        <h1>Bộ trạng thái dùng chung</h1>
        <p>Bốn trạng thái này lặp lại ở MỌI màn danh sách. Component hoá một lần trong Figma rồi thay text, đừng vẽ lại từng màn.</p>
      </div>
      <div class="page__actions">${tag('Import trước tiên', 'info')}</div>
    </div>

    <div class="row row--wrap" style="gap:20px;align-items:flex-start">
      ${stateBlock('A · Rỗng — chưa có dữ liệu', 'Luôn kèm nút hành động chính. Trạng thái rỗng không có lối đi tiếp là ngõ cụt.', `
        <div class="state">
          <div class="state__icon">${ico('inbox', 28)}</div>
          <div class="state__title">Chưa có nhiệm vụ nào</div>
          <div class="state__desc">Thêm nhiệm vụ thủ công, hoặc nhập từ file BM5 do phòng Kế hoạch gửi.</div>
          <div class="row" style="gap:8px">${btn('Thêm nhiệm vụ', { icon: 'plus' })}${btn('Nhập từ BM5', { icon: 'upload', variant: 'secondary' })}</div>
        </div>`)}

      ${stateBlock('B · Rỗng — lọc không ra kết quả', 'KHÁC trạng thái A: dữ liệu có, chỉ là bộ lọc quá hẹp ⇒ lối thoát là xoá lọc, không phải thêm mới.', `
        <div class="state">
          <div class="state__icon">${ico('search', 28)}</div>
          <div class="state__title">Không tìm thấy nhiệm vụ khớp bộ lọc</div>
          <div class="state__desc">Khối <strong>Khối 1</strong> · Phân loại <strong>Phương án kinh doanh</strong> · từ khoá <strong>"cao tần"</strong></div>
          <div class="row" style="gap:8px">${btn('Xoá bộ lọc', { icon: 'refresh', variant: 'secondary' })}</div>
        </div>`)}

      ${stateBlock('C · Đang tải', 'Skeleton giữ ĐÚNG nhịp 40/56 của bảng thật để không giật khi dữ liệu về.', `
        <div class="col col--16">
          <div class="filters">
            <div class="skel skel--line" style="width:180px;height:40px;border-radius:12px"></div>
            <div class="skel skel--line" style="width:280px;height:40px;border-radius:12px"></div>
          </div>
          ${table(
            [{ t: 'STT', w: 'w-56' }, { t: 'Thao tác', w: 'w-110' }, { t: 'Mã', w: 'w-200' }, { t: 'Tên nhiệm vụ' }, { t: 'CPNC', w: 'w-160' }],
            [],
          ).replace('</div>', skelRow() + skelRow() + skelRow() + skelRow() + '</div>')}
        </div>`)}

      ${stateBlock('D · Lỗi tải dữ liệu', 'Nêu MÃ LỖI và nút thử lại. Thông báo "Đã có lỗi xảy ra" không giúp ai sửa được gì.', `
        <div class="state">
          <div class="state__icon" style="background:var(--vht-brand-95);color:var(--vht-brand-50)">${ico('x-circle', 28)}</div>
          <div class="state__title">Không tải được danh sách nhiệm vụ</div>
          <div class="state__desc">Dịch vụ nhân sự không phản hồi (HTTP 503 · mã <code>HR-NV-503</code> · 14:22:07). Dữ liệu đang hiển thị có thể đã cũ.</div>
          <div class="row" style="gap:8px">${btn('Thử lại', { icon: 'refresh' })}${btn('Báo quản trị', { icon: 'send', variant: 'secondary' })}</div>
        </div>`)}

      ${stateBlock('E · Không có quyền — fail-closed', 'Cột tiền KHÔNG được render, không phải render rồi chặn khi bấm. Đây là ma trận quyền của khách: chỉ HR xuất được bảng lương.', `
        <div class="col col--16">
          <div class="alert alert--warn">${ico('lock', 18)}
            <div class="alert__body"><div class="alert__title">Bạn không có quyền xem dữ liệu lương</div>
            <div>Vai trò <strong>PA đơn vị</strong> chỉ thấy cột công. Các cột chi phí đã bị loại khỏi cả bảng lẫn bản xuất — liên hệ HR nếu cần số liệu.</div></div>
          </div>
          ${table(
            [{ t: 'STT', w: 'w-56' }, { t: 'Mã NV', w: 'w-110' }, { t: 'Họ và tên' }, { t: 'Công tính lương', w: 'w-140', cls: 'tbl__th--num' }],
            [
              ['1', '801234', 'Trần Minh Quân', { h: '21,0', cls: 'tbl__td--num' }],
              ['2', '805512', 'Lê Thị Hồng Nhung', { h: '20,0', cls: 'tbl__td--num' }],
            ],
          )}
        </div>`)}

      ${stateBlock('F · Không có quyền — cả màn', 'Dùng khi người dùng vào thẳng URL của màn không thuộc quyền.', `
        <div class="state">
          <div class="state__icon" style="background:var(--vht-warning-95);color:var(--vht-warning-40)">${ico('shield', 28)}</div>
          <div class="state__title">Màn hình này dành cho vai trò HR</div>
          <div class="state__desc">Tài khoản của bạn (<strong>PA · Trung tâm CHĐK</strong>) không có quyền <code>hrtools.bang-luong.xem</code>.</div>
          <div class="row" style="gap:8px">${btn('Về trang chủ', { variant: 'secondary' })}${btn('Yêu cầu cấp quyền', { icon: 'send' })}</div>
        </div>`)}
    </div>
  </div>
  ${note('Vì sao tách riêng artboard này', [
    'Vẽ 4 trạng thái cho từng màn trong 25 màn = 100 artboard, không ai duyệt nổi. Ở đây làm <strong>một bộ chuẩn</strong>, các màn sau chỉ vẽ trạng thái mặc định + những state MANG NGHIỆP VỤ RIÊNG (ô khoá chấm công, cột tiền fail-closed, nguồn Bảo hành để trống).',
    'Trạng thái rỗng có <strong>hai loại khác nhau</strong> (A và B) — gộp làm một là bắt người dùng bấm "Thêm mới" trong khi thứ họ cần là xoá bộ lọc.',
  ])}
`);

module.exports = [
  { code: '00', group: '0 · Nền tảng', title: 'Sticker sheet', desc: 'Màu · chữ · nút · ô nhập · bảng · dialog · chrome', body: stickerSheet },
  { code: '01', group: '0 · Nền tảng', title: 'Bộ trạng thái dùng chung', desc: 'Rỗng · lọc rỗng · đang tải · lỗi · không quyền', body: trangThaiChung },
];
