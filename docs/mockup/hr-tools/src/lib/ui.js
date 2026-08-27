/* =============================================================================
 * Bộ dựng khung dùng chung cho mọi artboard.
 *
 * Vì sao trang nguồn là `.page.js` chứ không phải `.html` viết tay: bảng chấm công là ma trận
 * người × 31 ngày — viết tay một artboard đã là ~1.500 thẻ, mà có 6 artboard như vậy. Vòng lặp
 * `for` sinh ra đúng HTML tĩnh đó trong 5 dòng, và khi khách đổi số liệu thì sửa một chỗ.
 *
 * Kết quả build (`dist/*.html`) là **HTML/CSS tĩnh thuần, không JavaScript** — đúng thứ cần cho
 * html.to.design. Phần JS chỉ tồn tại ở khâu sinh file, không đi kèm sản phẩm.
 * ========================================================================== */

/* ---------------------------------------------------------------------- ICON
 * Feather-style, stroke 1.6, viewBox 24. Luôn INLINE `<svg>`: icon-font (PrimeIcons `pi pi-*`
 * mà app thật đang dùng) và icon vẽ bằng `::before` đều KHÔNG qua được cầu HTML→Figma. */
const PATHS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  pencil: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z"/>',
  trash: '<path d="M4 7h16M10 4h4M6 7l1 13h10l1-13"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  'chevron-up': '<path d="M6 15l6-6 6 6"/>',
  'chevron-left': '<path d="M15 6l-6 6 6 6"/>',
  'chevron-right': '<path d="M9 6l6 6-6 6"/>',
  'chevrons-left': '<path d="M11 6l-6 6 6 6M18 6l-6 6 6 6"/>',
  'chevrons-right': '<path d="M13 6l6 6-6 6M6 6l6 6-6 6"/>',
  'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.3 20a2 2 0 0 0 3.4 0"/>',
  upload: '<path d="M4 17v3h16v-3M12 15V4M8 8l4-4 4 4"/>',
  download: '<path d="M4 17v3h16v-3M12 4v11M8 11l4 4 4-4"/>',
  printer: '<path d="M7 9V3h10v6M7 19H4v-7h16v7h-3M8 15h8v6H8z"/>',
  check: '<path d="M5 13l4 4L19 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
  alert: '<path d="M12 3l9 16H3l9-16z"/><path d="M12 9v5M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  'x-circle': '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  chart: '<path d="M4 20h16M7 16V9M12 16V5M17 16v-4"/>',
  pie: '<path d="M12 3a9 9 0 1 0 9 9h-9V3z"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.6M17.5 20c0-2.6-1-4-2.5-4.7"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12h18"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14h2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-1.5 5.5"/><path d="M20 4v6h-6"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.8"/>',
  'eye-off': '<path d="M4 4l16 16"/><path d="M9.5 6.5A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.4 4M6.4 8.4C3.9 9.9 2 12 2 12s3.5 6 10 6c1 0 1.9-.1 2.7-.4"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4-2v-4L3 5z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  inbox: '<path d="M3 12l3-7h12l3 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/><path d="M3 12h5l1 2h6l1-2h5"/>',
  database: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3z"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M6 6l12 12"/>',
  minus: '<path d="M5 12h14"/>',
  save: '<path d="M5 3h11l3 3v15H5V3z"/><path d="M9 3v6h6M8 14h8v7H8z"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7L11.5 6.8"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1.4-1.4"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3 4v5h5M12 8v4.5l3 1.8"/>',
};

function ico(name, size = 16, cls = '') {
  const d = PATHS[name];
  if (!d) throw new Error(`Icon không có trong bộ: "${name}"`);
  return (
    `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ` +
    `aria-hidden="true">${d}</svg>`
  );
}

/* --------------------------------------------------------------- Số & tiền tệ */
const nf = new Intl.NumberFormat('vi-VN');
const money = (n) => (n === null || n === undefined || n === '' ? '' : nf.format(n));

/* ==================================================================== ĐIỀU HƯỚNG
 * Cây menu đầy đủ của phân hệ (gồm cả màn đã code lẫn chưa code) — để mọi artboard có cùng một
 * sider và Figma chỉ cần một component sider duy nhất.
 * Chỉ nhóm chứa mục đang mở mới bung ra, đúng hành vi `isOpen()` của shell thật. */
const NAV = [
  { key: 'tong-quan', label: 'Tổng quan', icon: 'grid' },
  {
    key: 'nhiem-vu', label: 'Quản lý nhiệm vụ', icon: 'briefcase',
    children: [
      { key: 'dm-nhiem-vu', label: 'Danh mục nhiệm vụ' },
      { key: 'khai-bao-nhiem-vu', label: 'Khai báo nhiệm vụ' },
      { key: 'noi-dung-cv', label: 'Nội dung công việc' },
      { key: 'ho-so-nhiem-vu', label: 'Hồ sơ đính kèm' },
    ],
  },
  {
    key: 'nhan-su', label: 'Quản lý nhân sự', icon: 'users',
    children: [{ key: 'ds-nhan-su', label: 'Danh sách nhân sự' }],
  },
  {
    key: 'cham-cong', label: 'Chấm công', icon: 'clock',
    children: [
      { key: 'ds-nhan-su-thang', label: 'Nhân sự theo tháng' },
      { key: 'ky', label: 'Kỳ chấm công' },
      { key: 'bang-cong', label: 'Bảng công tháng' },
      { key: 'cham-cong-pb', label: 'Chấm công phân bổ' },
      { key: 'cham-cong-dv', label: 'Chấm công theo đơn vị' },
    ],
  },
  {
    key: 'cpnc', label: 'Chi phí nhân công', icon: 'wallet',
    children: [
      { key: 'bang-luong', label: 'Bảng lương tháng' },
      { key: 'luong-muc-tieu', label: 'Bảng lương mục tiêu' },
      { key: 'bm3', label: 'Tổng hợp phân bổ (BM3)' },
      { key: 'bm31', label: 'Bảng lương KHCN (BM3.1)' },
      { key: 'bm32', label: 'Bảng lương SXKD (BM3.2)' },
    ],
  },
  {
    key: 'trinh-ky', label: 'Trình ký', icon: 'send',
    children: [
      { key: 'trinh-ky-thang', label: 'Trình ký theo tháng' },
      { key: 'dong-nhiem-vu', label: 'Đóng nhiệm vụ' },
    ],
  },
  {
    key: 'bao-cao', label: 'Báo cáo', icon: 'chart',
    children: [
      { key: 'bc-nguon', label: 'Nguồn CPNC nhiệm vụ' },
      { key: 'bc-ty-le-dv', label: 'Tỷ lệ PBNC đơn vị' },
      { key: 'bc-khoi', label: 'Tổng hợp khối' },
      { key: 'bc-vht', label: 'Tổng hợp VHT' },
      { key: 'bc-het-nguon', label: 'Nhiệm vụ sắp hết nguồn' },
    ],
  },
  {
    key: 'canh-bao', label: 'Cảnh báo & Thông báo', icon: 'bell',
    children: [
      { key: 'mau-thong-bao', label: 'Mẫu thông báo' },
      { key: 'da-gui', label: 'Thông báo đã gửi' },
      { key: 'nguong', label: 'Ngưỡng cảnh báo' },
      { key: 'kenh', label: 'Cấu hình kênh' },
    ],
  },
  {
    key: 'danh-muc', label: 'Danh mục', icon: 'database',
    children: [
      { key: 'dm-don-vi', label: 'Đơn vị' },
      { key: 'dm-chuc-danh', label: 'Chức danh' },
      { key: 'dm-nhan-vien', label: 'Nhân viên' },
      { key: 'dm-nguon-kinh-phi', label: 'Nguồn kinh phí' },
      { key: 'dm-san-pham', label: 'Sản phẩm' },
      { key: 'dm-thu-vien-cv', label: 'Thư viện công việc' },
      { key: 'dm-ky-hieu-cong', label: 'Ký hiệu công' },
      { key: 'dm-nhom-cv', label: 'Nhóm công việc' },
      { key: 'dm-loai-cpnc', label: 'Loại chi phí nhân công' },
      { key: 'dm-doi-tac', label: 'Đối tác' },
      { key: 'dm-nhiem-vu-mau', label: 'Nhiệm vụ mẫu' },
      { key: 'dm-trang-thai-nv', label: 'Trạng thái nhiệm vụ' },
    ],
  },
  {
    key: 'cau-hinh', label: 'Cấu hình', icon: 'shield',
    children: [{ key: 'phan-quyen-dv', label: 'Phân quyền đơn vị' }],
  },
];

function topbar(badge = 3) {
  return `
    <div class="topbar">
      <div class="topbar__brand">
        <div class="topbar__logo">VHT</div>
        <div class="topbar__text"><strong>QTKHCN</strong><small>Quản lý chi phí nhân công</small></div>
      </div>
      <div class="topbar__right">
        <div class="topbar__bell">${ico('bell', 20)}<div class="topbar__badge">${badge}</div></div>
        <div class="topbar__divider"></div>
        <div class="topbar__account">
          <div class="topbar__avatar">NT</div>
          <div class="topbar__name">Nguyễn Thu Hà</div>
          ${ico('chevron-down', 14)}
        </div>
      </div>
    </div>`;
}

function sider(active) {
  const items = NAV.map((it) => {
    if (!it.children) {
      const on = it.key === active;
      return `<div class="nav__item${on ? ' nav__item--active' : ''}">${ico(it.icon, 18)}<div class="nav__label">${it.label}</div></div>`;
    }
    const open = it.children.some((c) => c.key === active);
    const head =
      `<div class="nav__item">${ico(it.icon, 18)}<div class="nav__label">${it.label}</div>` +
      `${ico(open ? 'chevron-up' : 'chevron-down', 14, 'nav__caret')}</div>`;
    if (!open) return head;
    const kids = it.children
      .map(
        (c) =>
          `<div class="nav__child${c.key === active ? ' nav__child--active' : ''}">${c.label}</div>`,
      )
      .join('');
    return `<div class="col" style="gap:4px">${head}<div class="nav__children">${kids}</div></div>`;
  }).join('');

  return `
    <div class="sider">
      <div class="sider__appcard">
        <div class="sider__appicon">${ico('wallet', 18)}</div>
        <div class="sider__apptext"><small>PHÂN HỆ</small><strong>Chi phí nhân công</strong></div>
      </div>
      <div class="nav">${items}</div>
      <div class="sider__footer">v1.0 - © 2026</div>
    </div>`;
}

/* Một artboard đầy đủ: topbar + sider + nội dung.
   `wide` = khổ 2200 cho màn có ma trận 31 ngày — thực tế app vẫn 1440 và bảng cuộn ngang, nhưng
   mockup phải vẽ đủ để duyệt được toàn bộ dữ liệu. */
function frame(activeNav, content, { wide = false, overlay = '', toasts = '' } = {}) {
  // Lớp phủ: nền mờ + hộp thoại nổi lên TRÊN màn thật, không phải artboard rời. Khi có lớp phủ thì
  // artboard thành `.stack` (position:relative) — ngoại lệ duy nhất của luật 2, xem app.css.
  const layers =
    (overlay ? `<div class="stack__dim">${overlay}</div>` : '') +
    (toasts ? `<div class="toaster">${toasts}</div>` : '');
  return `<div class="artboard ${wide ? 'artboard--wide' : ''} ${layers ? 'stack' : ''}"><div class="shell">${topbar()}
      <div class="shell__body">${sider(activeNav)}
        <div class="content">${content}</div>
      </div>
    </div>${layers}</div>`;
}

/* Artboard không có shell — dùng cho dialog, biểu mẫu in và sticker sheet.
   MỖI FILE ĐÚNG MỘT `.artboard`: lồng hai lớp thì plugin sinh ra frame trong frame, và người
   dựng Figma phải bóc tay từng cái. `check-layout` bắt lỗi này. */
function bare(content, style = '', { wide = false } = {}) {
  return `<div class="artboard ${wide ? 'artboard--wide' : ''}"${style ? ` style="${style}"` : ''}>${content}</div>`;
}

/* Nền mờ của dialog — dialog dựng thành artboard riêng thay vì phủ lên màn (luật 2 của app.css). */
const DIM = 'background:rgba(26,28,30,.45);padding:48px 0';

/* ------------------------------------------------------------- mảnh dùng lại */

function pageHead(title, desc, actions = '', back = false) {
  return `<div class="page__head">
      <div class="page__title">
        ${back ? `<div class="page__back">${ico('arrow-left', 16)}</div>` : ''}
        <div class="page__titletext"><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ''}</div>
      </div>
      <div class="page__actions">${actions}</div>
    </div>`;
}

const btn = (label, { icon, variant = '', sm = false, cls = '' } = {}) =>
  `<div class="btn ${variant ? 'btn--' + variant : ''} ${sm ? 'btn--sm' : ''} ${cls}">` +
  `${icon ? ico(icon, sm ? 14 : 16) : ''}${label ? `<span>${label}</span>` : ''}</div>`;

const iconBtn = (icon, variant = '') =>
  `<div class="iconbtn ${variant ? 'iconbtn--' + variant : ''}">${ico(icon, 18)}</div>`;

const input = (text, { placeholder = false, icon, iconRight, w = '', state = '', cls = '' } = {}) =>
  `<div class="input ${placeholder ? 'input--placeholder' : ''} ${state ? 'input--' + state : ''} ${w} ${cls}">` +
  `${icon ? `<span class="input__icon">${ico(icon, 16)}</span>` : ''}` +
  `<span class="input__text">${text}</span>` +
  `${iconRight ? `<span class="input__icon">${ico(iconRight, 16)}</span>` : ''}</div>`;

const select = (text, { placeholder = false, w = 'select' } = {}) =>
  input(text, { placeholder, iconRight: 'chevron-down', w });

const search = (text = 'Tìm kiếm', { w = 'search' } = {}) =>
  input(text, { placeholder: true, icon: 'search', w });

const field = (label, control, { required = false, help = '', error = '' } = {}) =>
  `<div class="field"><div class="field__label">${label}${required ? ' <span class="req">*</span>' : ''}</div>` +
  `${control}${help ? `<div class="field__help">${help}</div>` : ''}` +
  `${error ? `<div class="field__error">${error}</div>` : ''}</div>`;

const tag = (label, variant = '', dot = true) =>
  `<div class="tag ${variant ? 'tag--' + variant : ''}">${dot ? '<span class="tag__dot"></span>' : ''}<span>${label}</span></div>`;

const rowActions = (extra = '') =>
  `<div class="actions">${iconBtn('pencil')}<div class="actions__sep"></div>${iconBtn('trash', 'danger')}${extra}</div>`;

/* Footer bảng: trái = số bản ghi/trang, phải = tổng + pager. Trang hiện tại NỀN XÁM. */
function tableFoot(total, { perPage = 25, page = 1, pages = [1, 2, 3, 4, '…', 99] } = {}) {
  const nums = pages
    .map((p) =>
      p === '…'
        ? `<div class="pager__page">…</div>`
        : `<div class="pager__page${p === page ? ' pager__page--active' : ''}">${p}</div>`,
    )
    .join('');
  return `<div class="tblfoot">
      <div class="tblfoot__left"><span>Hiển thị bản ghi/trang:</span>${select(String(perPage), { w: '' })}</div>
      <div class="tblfoot__right">
        <span class="tblfoot__left">Tổng số bản ghi: ${money(total)}</span>
        <div class="pager">
          <div class="pager__btn">${ico('chevrons-left', 14)}</div>
          <div class="pager__btn">${ico('chevron-left', 14)}</div>
          ${nums}
          <div class="pager__btn">${ico('chevron-right', 14)}</div>
          <div class="pager__btn">${ico('chevrons-right', 14)}</div>
        </div>
      </div>
    </div>`;
}

/* Bảng: cols = [{t, w, cls}], rows = [[cell,…]] (cell là chuỗi HTML hoặc {h, cls}) */
function table(cols, rows, { rowCls = () => '', flush = false, scroll = false } = {}) {
  const head =
    `<div class="tbl__head">` +
    cols.map((c) => `<div class="tbl__th ${c.w || 'grow'} ${c.cls || ''}">${c.t}</div>`).join('') +
    `</div>`;
  const body = rows
    .map((r, i) => {
      const cells = r
        .map((cell, j) => {
          const c = cols[j] || {};
          const v = typeof cell === 'object' && cell !== null ? cell : { h: cell };
          return `<div class="tbl__td ${c.w || 'grow'} ${c.cls || ''} ${v.cls || ''}">${v.h ?? ''}</div>`;
        })
        .join('');
      return `<div class="tbl__row ${rowCls(i)}">${cells}</div>`;
    })
    .join('');
  const inner = head + body;
  return `<div class="tbl ${flush ? 'tbl--flush' : ''}">${scroll ? `<div class="tbl__scroll">${inner}</div>` : inner}</div>`;
}

/* ---------------------------------------------------------------- lịch tháng
 * 05/2025: 31 ngày, mùng 1 rơi vào thứ Năm. Dùng chung cho mọi màn chấm công để số liệu
 * giữa các artboard không đá nhau. */
const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const days31 = Array.from({ length: 31 }, (_, i) => {
  const d = i + 1;
  const dow = (d + 3) % 7; // 1/5/2025 = thứ Năm (index 4)
  return { d, dow: DOW[(dow + 1) % 7], weekend: (dow + 1) % 7 === 0 || (dow + 1) % 7 === 6 };
});

const dayHeaders = () =>
  days31
    .map(
      (x) =>
        `<div class="tbl__th matrix__th-day"><div>${x.d}</div><div class="matrix__dow">${x.dow}</div></div>`,
    )
    .join('');

const cell = (kind, text = '') => `<div class="cell cell--${kind}">${text}</div>`;

/* ------------------------------------------------------------------- DIALOG
 * `size`: confirm 400 · form 520 · wide 900 · picker 1360. Nút Huỷ (viền) đứng trước nút chính.
 * Hành động phá huỷ KHÔNG được phân biệt bằng màu — ramp brand và danger của design system trùng
 * nhau (#EE0033) ⇒ phải nói rõ bằng CHỮ trong thân hộp thoại và nhãn nút. */
const dlg = ({ title, size = 'form', body, foot = '', head = true }) =>
  `<div class="dialog dialog--${size}">
      ${head ? `<div class="dialog__head"><div class="dialog__title">${title}</div>${ico('x', 18)}</div>` : ''}
      <div class="dialog__body">${body}</div>
      ${foot ? `<div class="dialog__foot">${foot}</div>` : ''}
    </div>`;

/* --------------------------------------------------------------------- TOAST
 * Bản đã build dùng `ToastService` của `@khcn-core/ui` (PrimeNG `MessageService`) — toast nổi ở
 * GÓC PHẢI TRÊN, dưới topbar. Bốn mức: success · info · warn · error. */
const toast = (kind, title, msg, { icon } = {}) =>
  `<div class="toast toast--${kind}">
      <div class="toast__icon">${ico(icon || { success: 'check-circle', info: 'info', warn: 'alert', error: 'x-circle' }[kind], 20)}</div>
      <div class="toast__body"><div class="toast__title">${title}</div><div class="toast__msg">${msg}</div></div>
      <div class="toast__close">${ico('x', 16)}</div>
    </div>`;

const note = (title, lines) =>
  `<div class="note"><strong>${title}</strong><ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul></div>`;

/* ============================================================== BIỂU MẪU GIẤY
 * Biểu mẫu trình ký theo QĐ 3021/QĐ-CNVTQĐ-CNCNC. Quốc hiệu, tiêu ngữ, dòng "Hà Nội, ngày…" và
 * vùng ký là NỘI DUNG BẮT BUỘC của văn bản, không phải trang trí — thiếu là không ký được.
 *
 * `soHieu` và `ma` nhận `null` cho biểu mẫu quản trị nội bộ (BM5, BM3, BM3.2) — những cái KHÔNG
 * mang mã BM.xx và KHÔNG thuộc QĐ 3021. Đóng dấu mã pháp lý lên chúng là làm sai văn bản; đó
 * đúng là lỗi đã phải sửa ở artboard 37 ngày 2026-08-27. */
const dauVanBan = (soHieu) => `
  <div class="paper__head">
    <div class="paper__block" style="flex:0 0 340px">
      <div style="font-size:12px">TẬP ĐOÀN CÔNG NGHIỆP – VIỄN THÔNG QUÂN ĐỘI</div>
      <div style="font-size:13px;font-weight:700">TỔNG CÔNG TY CN CÔNG NGHỆ CAO VIETTEL</div>
      <div style="width:150px;border-top:1px solid #000;margin-top:4px"></div>
      <div style="font-size:12px;margin-top:4px">Số: ${soHieu ? '......./' + soHieu : '.................'}</div>
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
    <div class="paper__sub">${ma
      ? `(Ban hành kèm theo Quyết định số 3021/QĐ-CNVTQĐ-CNCNC — mã biểu mẫu ${ma})`
      : '(Biểu mẫu quản trị nội bộ — KHÔNG thuộc bộ biểu mẫu ban hành kèm Quyết định 3021/QĐ-CNVTQĐ-CNCNC)'}</div>
    ${phu.map((p) => `<div class="paper__sub">${p}</div>`).join('')}
  </div>`;

const vungKy = (cot) => `
  <div class="paper__signs">
    ${cot.map((c) => `<div class="paper__sign"><strong>${c[0]}</strong><div>${c[1]}</div></div>`).join('')}
  </div>`;

/* Tờ giấy đặt giữa nền xám. `w` là bề rộng giấy — phải >= tổng bề rộng cột + 96px padding của
 * `.paper`, nếu không `check-layout.js` báo bảng tràn khung. */
const giayIn = (body, w = 1240, wide = false) =>
  bare(
    `<div class="paper" style="width:${w}px;margin:0 auto;box-shadow:var(--vht-shadow-lg)">${body}</div>`,
    `background:var(--vht-gray-90);padding:32px ${wide ? '48px' : '0'}`,
    { wide },
  );

module.exports = {
  ico, money, NAV, topbar, sider, frame, bare, DIM, pageHead, btn, iconBtn, input, select, search,
  field, tag, rowActions, tableFoot, table, days31, dayHeaders, cell, note, DOW, dlg, toast,
  dauVanBan, tieuDe, vungKy, giayIn,
};
