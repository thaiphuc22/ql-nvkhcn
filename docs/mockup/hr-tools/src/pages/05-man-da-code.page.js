/* =============================================================================
 * Đợt 1 — NĂM MÀN ĐÃ CODE BẰNG ANGULAR, dựng lại thành HTML tĩnh.
 *
 * Khác mọi file khác trong bộ này: đây KHÔNG phải đề xuất thiết kế. Năm màn dưới đây đã chạy thật
 * trong `frontend-angular/src/app/pages/hr-*`. Chúng được dựng lại ở đây để **file Figma có đủ
 * phân hệ** — thiếu chúng thì bản thiết kế chỉ có phần chưa làm, và người xem không nối được
 * luồng từ "khai báo nhiệm vụ" sang "chấm công".
 *
 *   1A · /hr/nhiem-vu             ← pages/hr-nhiem-vu-list
 *   1B · dialog Xoá nhiệm vụ      ← cùng file, `cmm-dialog` 400px
 *   1C · dialog Từ chối bản khai  ← cùng file, `cmm-dialog` 520px
 *   1D · /hr/khai-bao-nhiem-vu    ← pages/hr-khai-bao-list
 *   1E · /hr/nhiem-vu/:ma         ← pages/hr-nhiem-vu-detail, tab Nội dung công việc
 *   1F · ba tab còn lại của màn chi tiết
 *   1G · dialog Thêm nội dung CV  ← cùng file chi tiết, `cmm-dialog` 520px
 *   1H · /hr/nhan-su              ← pages/hr-nhan-su-list
 *   1I · /hr/nhan-su/moi          ← pages/hr-nhan-su-form
 *   1J · pop-up Chọn nhân sự      ← shared/hr/nhan-su-picker, 1360px
 *
 * VÌ THẾ: khi bản đã code khác artboard ở đây thì **bản đã code đúng**. Số cột, nhãn nút và thứ tự
 * trường ở dưới chép từ chính `columns()` và template của các component đó (đọc 2026-08-27).
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, frame, bare, dlg, pageHead, btn, iconBtn, input, select, search, field, tag, table, tableFoot, rowActions, note, money } = U;

const STT = { t: 'STT', w: 'w-56', cls: 'tbl__th--center' };
const CHECK = { t: '', w: 'w-48', cls: 'tbl__th--center' };
const cb = (on) => (on ? `<div class="checkbox checkbox--on">${ico('check', 14)}</div>` : '<div class="checkbox"></div>');
const link = (t) => `<span class="code-link">${t}</span>`;

/* ============================================================ 60 · Danh mục nhiệm vụ */
const NV = [
  ['011-24-TĐ-RDP-QS', 'Nghiên cứu chế tạo khối thu phát cao tần', 'ĐT.2024.017', 'Khối 1 - TCT CNC', 'Trung tâm CHĐK', 'Đề tài KHCN', 'KHCN', 5400000000, 1850000000, '04/2025 – 12/2026', ['Đang phân bổ', 'success'], ['Đang thực hiện', 'info']],
  ['012-24-PAKD-CAM', 'Phương án kinh doanh camera AI thế hệ 2', '—', 'Khối 2 - TCT CNC', 'Trung tâm Camera', 'Phương án KD', 'SXKD', 2100000000, 980000000, '01/2025 – 12/2025', ['Đang phân bổ', 'success'], ['Đang thực hiện', 'info']],
  ['013-25-TĐ-DTPT', 'Đầu tư phát triển dây chuyền SMT', '—', 'Khối 1 - TCT CNC', 'Trung tâm CĐT', 'ĐTPT', 'ĐTPT', 3800000000, 1240000000, '03/2025 – 06/2026', ['Đang phân bổ', 'warning'], ['Đang thực hiện', 'info']],
  ['014-24-BH-RAD', 'Bảo hành đài radar cảnh giới', 'ĐT.2022.004', 'TT QLCL', 'Trung tâm ĐBCL', 'QPAN', 'Bảo hành', 640000000, null, '01/2024 – 12/2024', ['Đã hết hạn', ''], ['Đã kết thúc', '']],
  ['015-25-TĐ-RDP-QS', 'Nghiên cứu vật liệu hấp thụ sóng', 'ĐT.2025.003', 'Khối 1 - TCT CNC', 'Trung tâm CHĐK', 'Đề tài KHCN', 'KHCN', 2900000000, 1120000000, '06/2025 – 12/2027', ['Đang trình phê duyệt', 'info'], ['Chờ duyệt', 'warning']],
];

const nvCols = [
  STT,
  { t: 'Thao tác', w: 'w-140' },
  { t: 'Mã nhiệm vụ', w: 'w-160' },
  { t: 'Tên nhiệm vụ', w: 'w-300' },
  { t: 'Mã đề tài', w: 'w-140' },
  { t: 'Khối', w: 'w-160' },
  { t: 'Đơn vị chủ trì', w: 'w-190' },
  { t: 'Phân loại', w: 'w-140' },
  { t: 'Nguồn', w: 'w-110' },
  { t: 'Tổng dự toán', w: 'w-160', cls: 'tbl__th--num' },
  { t: 'CPNC phê duyệt', w: 'w-160', cls: 'tbl__th--num' },
  { t: 'Thời gian', w: 'w-160' },
  { t: 'Tình trạng PB', w: 'w-170' },
  { t: 'Trạng thái', w: 'w-140' },
];

const nvRow = (r, i) => [
  { h: String(i + 1), cls: 'tbl__td--center' },
  i === 4
    ? `<div class="actions">${iconBtn('pencil')}<div class="actions__sep"></div>${iconBtn('trash', 'danger')}<div class="actions__sep"></div>${iconBtn('check')}${iconBtn('ban', 'danger')}</div>`
    : rowActions(),
  link(r[0]), r[1], r[2], r[3], r[4], r[5], r[6],
  { h: money(r[7]), cls: 'tbl__td--num' },
  { h: r[8] === null ? '—' : money(r[8]), cls: 'tbl__td--num' },
  r[9],
  tag(r[10][0], r[10][1]),
  tag(r[11][0], r[11][1]),
];

const nhiemVuList = (opts = {}) =>
  frame(
    'dm-nhiem-vu',
    `<div class="page">
      ${pageHead('Danh mục nhiệm vụ', 'Toàn bộ nhiệm vụ/dự án đang theo dõi chi phí nhân công (BM5).', btn('Thêm mới', { icon: 'plus' }))}
      <div class="card">
        <div class="filters">
          ${select('Khối', { placeholder: true })}${select('Phân loại', { placeholder: true })}${select('Trạng thái', { placeholder: true })}
          ${search('Tìm theo mã, tên, mã đề tài...')}
        </div>
        ${table(nvCols, NV.map(nvRow), { rowCls: (i) => (i === 1 ? 'tbl__row--hover' : '') })}
        ${tableFoot(37, { pages: [1, 2] })}
      </div>
    </div>`,
    { wide: true, ...opts },
  );

const manNhiemVuList = () =>
  nhiemVuList() +
  note('Đã code — bản Angular thắng artboard này nếu hai bên lệch', [
    'Nguồn: <code>pages/hr-nhiem-vu-list/</code>. Bảng dựng bằng <code>&lt;ubck-table&gt;</code> của <code>@khcn-core/ui</code>, chân bảng là <code>&lt;ubck-paginator&gt;</code>, nút là <code>&lt;cmm-button&gt;</code>.',
    'Hàng lọc <strong>căn phải</strong> trong card — khác các màn cũ của phân hệ Quy trình (căn trái). Đây là chủ ý theo bản thiết kế D23, đừng "sửa cho đồng bộ".',
    'Dòng cuối ở trạng thái <em>Chờ duyệt</em> nên cột Thao tác có thêm hai nút <strong>Duyệt</strong> / <strong>Từ chối</strong>. Các dòng khác không có — nút hiện theo trạng thái, không hiện rồi vô hiệu hoá.',
    'Bảng rộng hơn 1440 nên trong app thật nó <strong>cuộn ngang</strong>; artboard vẽ đủ bề ngang để duyệt được toàn bộ cột.',
  ]);

/* ------------------------------------------------- 61 · Dialog xoá (400px) */
const dialogXoa = () =>
  nhiemVuList({
    overlay: dlg({
      title: 'Xoá nhiệm vụ',
      size: 'confirm',
      body: `
          <div>Xoá nhiệm vụ <strong>011-24-TĐ-RDP-QS</strong> — Nghiên cứu chế tạo khối thu phát cao tần? Thao tác này <strong>không hoàn tác được</strong>.</div>
          <div class="caption">Nhiệm vụ đang có <strong>4 nội dung công việc</strong>, <strong>8 dòng phân công nhân sự</strong> và <strong>3 kỳ đã chấm công</strong>.</div>`,
      foot: `${btn('Huỷ', { variant: 'secondary' })}${btn('Xoá', { icon: 'trash' })}`,
    }),
  }) +
  note('Hộp xác nhận xoá — chép nguyên hành vi của bản đã code', [
    'Template thật ghi rõ trong chú thích: <em>"nêu RÕ TÊN bản ghi. Không dựa vào màu để báo đây là hành động phá huỷ vì ramp brand và danger trùng nhau nên nút chính và nút xoá cùng đỏ"</em>.',
    'Nhãn nút trong bản đã code là <strong>Xoá</strong>; bản mockup 02 đề xuất đặt tên đầy đủ hơn (<em>Xoá nhiệm vụ</em>). Nếu chốt đổi thì đổi ở <code>hr-nhiem-vu-list.html</code>, không đổi riêng ở Figma.',
  ]);

/* -------------------------------------------- 62 · Dialog từ chối bản khai (520px) */
const dialogTuChoi = () =>
  nhiemVuList({
    overlay: dlg({
      title: 'Từ chối bản khai',
      size: 'form',
      body: `
          <div class="caption">Bản khai <strong>015-25-TĐ-RDP-QS</strong> — Nghiên cứu vật liệu hấp thụ sóng · người khai: Vũ Thị Thu Hà · 24/06/2025.</div>
          ${field('Lý do từ chối', input('Nêu rõ điểm cần sửa để người khai biết phải làm gì.', { placeholder: true, cls: 'input--area' }), { required: true, help: 'Bỏ trống thì nút Từ chối bị vô hiệu hoá — bản đã code khoá đúng như vậy.' })}`,
      foot: `${btn('Huỷ', { variant: 'secondary' })}${btn('Từ chối', { icon: 'ban' })}`,
    }),
  }) +
  note('Vì sao lý do là bắt buộc', [
    'Bản đã code buộc <code>[disabled]="!tuChoiLyDo().trim()"</code>. Từ chối mà không nói lý do thì người khai gửi lại y nguyên — vòng lặp vô ích giữa hai người.',
    'Cùng một mẫu này dùng lại cho <em>Từ chối phân công nhân sự</em> ở màn 1H. Trong Figma nên là MỘT component, đổi tiêu đề.',
  ]);

/* ========================================================= 63 · Khai báo nhiệm vụ */
const KHAIBAO = [
  ['015-25-TĐ-RDP-QS', 'Nghiên cứu vật liệu hấp thụ sóng', 'Đề tài KHCN', 'Khối 1 - TCT CNC', 1120000000, '06/2025 – 12/2027', '24/06/2025', ['Chờ duyệt', 'warning'], false],
  ['016-25-PAKD-IOT', 'Phương án kinh doanh thiết bị IoT công nghiệp', 'Phương án KD', 'Khối 2 - TCT CNC', 760000000, '07/2025 – 06/2026', '25/06/2025', ['Nháp', ''], true],
  ['017-25-TĐ-DTPT', 'Nâng cấp phòng thử nghiệm EMC', 'ĐTPT', 'TT QLCL', 430000000, '08/2025 – 12/2026', '25/06/2025', ['Nháp', ''], true],
  ['013-25-TĐ-DTPT', 'Đầu tư phát triển dây chuyền SMT', 'ĐTPT', 'Khối 1 - TCT CNC', 1240000000, '03/2025 – 06/2026', '18/03/2025', ['Đã duyệt', 'success'], false],
  ['014-24-BH-RAD', 'Bảo hành đài radar cảnh giới', 'QPAN', 'TT QLCL', 210000000, '01/2024 – 12/2024', '05/01/2024', ['Bị từ chối', 'danger'], false],
];

const khaiBaoList = () =>
  frame(
    'khai-bao-nhiem-vu',
    `<div class="page">
      ${pageHead('Khai báo nhiệm vụ', 'Bản khai nhiệm vụ của bạn và của đơn vị.', `${btn('Trình duyệt (2)', { icon: 'send', variant: 'secondary' })}${btn('Khai báo nhiệm vụ', { icon: 'plus' })}`)}
      <div class="card">
        <div class="row row--between">
          <div class="row">${btn('Ẩn tìm kiếm nâng cao', { icon: 'chevron-up', variant: 'ghost', sm: true })}</div>
        </div>
        <div class="advsearch">
          <div class="advsearch__grid">
            ${field('Từ khoá', input('Mã, tên nhiệm vụ, mã đề tài', { placeholder: true }))}
            ${field('Phân loại', select('Tất cả', { placeholder: true }))}
            ${field('Khối', select('Tất cả', { placeholder: true }))}
            ${field('Trạng thái', select('Tất cả', { placeholder: true }))}
            ${field('Năm bắt đầu', input('2025'), { help: 'Ô số không gom nhóm hàng nghìn — năm là MÃ, để mặc định thì 2025 hiện ra "2.025".' })}
          </div>
          <div class="advsearch__foot">${btn('Làm mới', { icon: 'refresh', variant: 'secondary' })}${btn('Tìm kiếm', { icon: 'search' })}</div>
        </div>
        <div class="filters">
          <div class="filters__left">
            <div class="tabs"><div class="tab tab--active">Của tôi</div><div class="tab">Của đơn vị</div></div>
          </div>
        </div>
        ${table(
          [
            CHECK, STT,
            { t: 'Thao tác', w: 'w-110' },
            { t: 'Mã nhiệm vụ', w: 'w-160' },
            { t: 'Tên nhiệm vụ', w: 'w-320' },
            { t: 'Phân loại', w: 'w-140' },
            { t: 'Khối', w: 'w-170' },
            { t: 'CPNC phê duyệt', w: 'w-170', cls: 'tbl__th--num' },
            { t: 'Thời gian', w: 'w-160' },
            { t: 'Ngày khai', w: 'w-130' },
            { t: 'Trạng thái', w: 'w-140' },
          ],
          KHAIBAO.map((r, i) => [
            { h: cb(r[8]), cls: 'tbl__td--center' },
            { h: String(i + 1), cls: 'tbl__td--center' },
            r[7][0] === 'Đã duyệt' || r[7][0] === 'Chờ duyệt'
              ? `<div class="actions"><div class="actions__sep"></div>${iconBtn('eye')}</div>`
              : `<div class="actions">${iconBtn('pencil')}<div class="actions__sep"></div>${iconBtn('eye')}</div>`,
            link(r[0]), r[1], r[2], r[3],
            { h: money(r[4]), cls: 'tbl__td--num' },
            r[5], r[6], tag(r[7][0], r[7][1]),
          ]),
          { rowCls: (i) => (r_selected(i) ? 'tbl__row--selected' : '') },
        )}
        ${tableFoot(12, { pages: [1] })}
      </div>
    </div>`,
    { wide: true },
  ) +
  note('Đã code — ba chi tiết dễ bị dựng sai trong Figma', [
    'Khối <strong>tìm kiếm nâng cao nằm TRONG card</strong>, ngay trên bảng (D23, màn 06) — không phải một card riêng phía trên.',
    'Cột Thao tác của bản khai <strong>đã gửi</strong> bỏ hẳn icon Sửa, chỉ còn icon Xem. Chú thích trong code nói rõ lý do: cột chỉ rộng 110px, một icon "bấm được nhưng không làm gì" là mời người dùng bấm nhầm.',
    'Nút <em>Trình duyệt (2)</em> hiện số dòng đang tích và bị vô hiệu hoá khi chưa chọn dòng nào.',
    'Bộ chuyển <em>Của tôi / Của đơn vị</em> là <code>cmm-selectbutton</code>, không phải tab điều hướng — nó lọc dữ liệu, không đổi route.',
  ]);

/* helper nhỏ cho rowCls ở trên: hai dòng nháp đang được tích chọn */
function r_selected(i) {
  return i === 1 || i === 2;
}

/* ==================================================== 64 · Chi tiết nhiệm vụ (tab 1) */
const DESC = [
  ['Trạng thái', tag('Đang thực hiện', 'info')],
  ['Tình trạng phân bổ', tag('Đang phân bổ', 'success')],
  ['Phân loại', 'Đề tài KHCN'],
  ['Phân nguồn', 'KHCN'],
  ['Mã đề tài', 'ĐT.2024.017'],
  ['Tên đề tài', 'Nghiên cứu công nghệ thu phát cao tần băng X'],
  ['Khối', 'Khối 1 - TCT CNC'],
  ['Đơn vị chủ trì', 'Trung tâm Chế tạo Điện tử Khí tài'],
  ['Đơn vị phân bổ', 'Trung tâm CHĐK · Trung tâm ĐBCL · Phòng Tổng hợp'],
  ['PM', 'Đỗ Quang Huy (802217)'],
  ['PA đơn vị chủ trì', 'Phạm Văn Đức (807781)'],
  ['Tổng dự toán', money(5400000000) + ' ₫'],
  ['CPNC được phê duyệt', money(1850000000) + ' ₫'],
  ['Dự phòng', money(96000000) + ' ₫'],
  ['Thời gian thực hiện', '08/04/2025 → 31/12/2026'],
  ['Người khai báo', 'Phạm Văn Đức (08/04/2025)'],
  ['Mô tả', 'Nghiên cứu, thiết kế và chế tạo khối thu phát cao tần dùng cho đài radar cảnh giới thế hệ mới.'],
];

const descBlock = () =>
  `<div class="desc">${DESC.map((d) => `<div class="desc__item"><div class="desc__label">${d[0]}</div><div class="desc__value">${d[1]}</div></div>`).join('')}</div>`;

const tabStrip = (active) =>
  `<div class="tabs">${['Nội dung công việc', 'Vai trò PM/PA', 'Nhân sự tham gia', 'Lịch sử']
    .map((t) => `<div class="tab${t === active ? ' tab--active' : ''}">${t}</div>`)
    .join('')}</div>`;

const NDCV = [
  ['Thiết kế khối cao tần', 'Trung tâm CHĐK', 'KHCN', 620000000, 30000000, 650000000, '08/04/2025 → 31/12/2026', ['Đang phân bổ', 'success']],
  ['Lập trình firmware', 'Trung tâm CHĐK', 'KHCN', 480000000, 24000000, 504000000, '01/06/2025 → 31/12/2026', ['Đang phân bổ', 'success']],
  ['Kiểm thử tích hợp', 'Trung tâm ĐBCL', 'KHCN', 310000000, 15000000, 325000000, '01/09/2025 → 30/09/2026', ['Đang phân bổ', 'success']],
  ['Quản lý tiến độ, báo cáo', 'Phòng Tổng hợp', 'Quản lý', 140000000, 7000000, 147000000, '08/04/2025 → 31/12/2026', ['Đang phân bổ', 'success']],
  ['Bảo hành sau nghiệm thu', 'Trung tâm ĐBCL', 'Bảo hành', 0, 0, null, '01/01/2027 → 31/12/2027', ['Đang trình phê duyệt', 'info']],
];

const chiTietHead = () => `
  ${pageHead(
    '011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần',
    'Chi tiết nhiệm vụ · Trung tâm Chế tạo Điện tử Khí tài',
    `${btn('Trình duyệt', { icon: 'send' })}${btn('Tạm dừng', { icon: 'ban', variant: 'secondary' })}`,
    true,
  )}
  <div class="card">${descBlock()}</div>`;

const chiTiet = (opts = {}) =>
  frame(
    'dm-nhiem-vu',
    `<div class="page">
      ${chiTietHead()}
      <div class="card">
        ${tabStrip('Nội dung công việc')}
        <div class="row" style="gap:12px">
          <div class="stat"><small>Số nội dung công việc</small><strong>5</strong></div>
          <div class="stat"><small>Tổng CPNC phê duyệt của các nội dung</small><strong>${money(1550000000)} ₫</strong></div>
          <div class="stat stat--warn"><small>CPNC phê duyệt của nhiệm vụ</small><strong>${money(1850000000)} ₫</strong></div>
        </div>
        <div class="filters">${btn('Thêm nội dung công việc', { icon: 'plus', sm: true })}</div>
        ${table(
          [
            STT,
            { t: 'Thao tác', w: 'w-110' },
            { t: 'Nội dung công việc', w: 'w-260' },
            { t: 'Đơn vị phân bổ', w: 'w-200' },
            { t: 'Nguồn', w: 'w-110' },
            { t: 'CPNC phê duyệt', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Dự phòng', w: 'w-140', cls: 'tbl__th--num' },
            { t: 'Nguồn đã lập dự toán', w: 'w-170', cls: 'tbl__th--num' },
            { t: 'Thời gian', w: 'w-200' },
            { t: 'Tình trạng PB', w: 'w-170' },
          ],
          NDCV.map((r, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            rowActions(),
            r[0], r[1], r[2],
            { h: money(r[3]), cls: 'tbl__td--num' },
            { h: money(r[4]), cls: 'tbl__td--num' },
            { h: r[5] === null ? '' : money(r[5]), cls: 'tbl__td--num' },
            r[6], tag(r[7][0], r[7][1]),
          ]),
          { rowCls: (i) => (i === 4 ? 'tbl__row--warn' : '') },
        )}
      </div>
    </div>`,
    { wide: true, ...opts },
  );

const manChiTiet = () =>
  chiTiet() +
  note('Đã code — hai luật số liệu nằm ngay trên màn này', [
    'Dòng cuối là nguồn <strong>Bảo hành</strong>: cột "Nguồn đã lập dự toán" <strong>để TRỐNG</strong>, không ghi 0 — 0 đọc thành "hết nguồn", mà bảo hành thì không lập dự toán bao giờ.',
    'Tổng CPNC của các nội dung (1,55 tỷ) <strong>nhỏ hơn</strong> CPNC phê duyệt của nhiệm vụ (1,85 tỷ). Đây là chênh lệch hợp lệ — phần chưa phân bổ hết cho nội dung nào. Không được tự cân bằng hai con số này.',
    'Nguồn: <code>pages/hr-nhiem-vu-detail/</code>. Tab dùng <code>&lt;p-tabs&gt;</code> của PrimeNG, không phải component tab tự viết của phân hệ Quy trình.',
  ]);

/* ------------------------------------ 65 · Ba tab còn lại của màn chi tiết */
const VAITRO = [
  ['Chủ nhiệm nhiệm vụ (PM)', 'Đỗ Quang Huy (802217)', 'Trung tâm Chế tạo Điện tử Khí tài'],
  ['Trợ lý nhiệm vụ (PA)', 'Phạm Văn Đức (807781)', 'Phòng Tổng hợp'],
  ['Trợ lý nhiệm vụ (PA)', 'Vũ Thị Thu Hà (809442)', 'Trung tâm Đảm bảo Chất lượng'],
];

const NHANSU_TAB = [
  ['801234', 'Trần Minh Quân', 'Trung tâm CHĐK', 'Thành viên', 'Thiết kế khối cao tần', '—', '08/04/2025 → 31/12/2026', ['Đã duyệt', 'success']],
  ['805512', 'Lê Thị Hồng Nhung', 'Trung tâm CHĐK', 'Thành viên', 'Lập trình firmware', '60%', '08/04/2025 → 31/12/2026', ['Đã duyệt', 'success']],
  ['807781', 'Phạm Văn Đức', 'Phòng Tổng hợp', 'PA', 'Quản lý tiến độ, báo cáo', '—', '08/04/2025 → 31/12/2026', ['Đã duyệt', 'success']],
  ['803095', 'Nguyễn Hoàng Anh', 'Trung tâm CHĐK', 'Thành viên', 'Thiết kế khối cao tần', '40%', '01/06/2025 → 31/12/2026', ['Chờ duyệt', 'warning']],
];

const LICHSU = [
  ['Trình duyệt bản khai', '08/04/2025 09:12', 'Phạm Văn Đức', ''],
  ['Duyệt bản khai', '09/04/2025 14:30', 'Đỗ Quang Huy', 'Đồng ý, triển khai theo tiến độ đã trình.'],
  ['Thêm nội dung công việc "Kiểm thử tích hợp"', '02/06/2025 10:05', 'Phạm Văn Đức', ''],
  ['Cập nhật CPNC phê duyệt', '17/06/2025 16:44', 'Nguyễn Thu Hà', 'Điều chỉnh theo quyết định giao dự toán đợt 2.'],
];

const cardTab = (active, body) => `<div class="card">${tabStrip(active)}${body}</div>`;

const chiTietTabs = () =>
  bare(
    `<div class="content" style="gap:20px">
      ${pageHead('Chi tiết nhiệm vụ — ba tab còn lại', 'Cùng một khung tab, đổi nội dung. Tách ra artboard riêng để trong Figma dựng được ba trạng thái của cùng một component tab.')}
      ${cardTab(
        'Vai trò PM/PA',
        `<div class="filters">${btn('Thêm vai trò', { icon: 'plus', sm: true })}</div>` +
          table(
            [
              STT,
              { t: 'Thao tác', w: 'w-90' },
              { t: 'Vai trò', w: 'w-220' },
              { t: 'Nhân sự', w: 'w-280' },
              { t: 'Đơn vị phụ trách' },
            ],
            VAITRO.map((r, i) => [
              { h: String(i + 1), cls: 'tbl__td--center' },
              `<div class="actions">${iconBtn('trash', 'danger')}</div>`,
              r[0], r[1], r[2],
            ]),
          ),
      )}
      ${cardTab(
        'Nhân sự tham gia',
        table(
          [
            STT,
            { t: 'Mã NV', w: 'w-110' },
            { t: 'Họ tên', w: 'w-200' },
            { t: 'Đơn vị', w: 'w-170' },
            { t: 'Vai trò tham gia', w: 'w-160' },
            { t: 'Nội dung công việc tham gia', w: 'w-220' },
            { t: 'Tỷ lệ dự kiến', w: 'w-120', cls: 'tbl__th--num' },
            { t: 'Thời gian', w: 'w-180' },
            { t: 'Trạng thái', w: 'w-140' },
          ],
          NHANSU_TAB.map((r, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            link(r[0]), r[1], r[2], r[3], r[4],
            { h: r[5], cls: 'tbl__td--num' },
            r[6], tag(r[7][0], r[7][1]),
          ]),
        ),
      )}
      ${cardTab(
        'Lịch sử',
        `<div class="tline">${LICHSU.map(
          (r, i) => `<div class="tline__item">
              <div class="tline__rail"><div class="tline__dot"></div>${i < LICHSU.length - 1 ? '<div class="tline__bar"></div>' : ''}</div>
              <div class="tline__body"><div class="strong">${r[0]}</div><div class="caption">${r[1]} · ${r[2]}</div>${r[3] ? `<div>${r[3]}</div>` : ''}</div>
            </div>`,
        ).join('')}</div>`,
      )}
    </div>`,
  ) +
  note('Ba tab này dùng chung một khung — trong Figma là một component, ba instance', [
    'Tab <strong>Nhân sự tham gia</strong>: cột "Tỷ lệ dự kiến" hiện <strong>—</strong> khi bỏ trống, KHÔNG hiện <code>0%</code>. Bỏ trống là dạng dữ liệu đúng theo BM1.',
    'Tab <strong>Vai trò PM/PA</strong> chỉ có nút Xoá, không có nút Sửa — sửa vai trò = xoá rồi thêm lại, đúng như bản đã code.',
    'Tab <strong>Lịch sử</strong> là <code>cmm-timeline</code>; mỗi mục có hành động, thời điểm, người thực hiện và ghi chú tuỳ chọn.',
  ]);

/* ------------------------- 66 · Dialog thêm nội dung công việc (overlay trên 64) */
const dialogThemNoiDung = () =>
  chiTiet({
    overlay: dlg({
      title: 'Thêm nội dung công việc',
      size: 'form',
      body: `
          ${field('Tên nội dung công việc', input('Nhập tên nội dung công việc', { placeholder: true }), { required: true })}
          ${field('Đơn vị phân bổ', select('Chọn đơn vị', { placeholder: true, w: '' }), { required: true, help: 'Nội dung công việc có ĐƠN VỊ PHÂN BỔ RIÊNG — không mặc định theo đơn vị chủ trì của nhiệm vụ.' })}
          ${field('Phân nguồn', select('KHCN', { w: '' }), { required: true })}
          ${field('CPNC được phê duyệt (đồng)', input('0', { placeholder: true }), { required: true })}
          ${field('Dự phòng (đồng)', input('0', { placeholder: true }))}
          <div class="row" style="gap:12px">
            <div class="grow">${field('Từ ngày', input('dd/mm/yyyy', { placeholder: true, iconRight: 'calendar' }), { required: true })}</div>
            <div class="grow">${field('Đến ngày', input('dd/mm/yyyy', { placeholder: true, iconRight: 'calendar' }), { required: true })}</div>
          </div>
          ${field('Tình trạng phân bổ', select('Đang trình phê duyệt', { w: '' }))}`,
      foot: `${btn('Huỷ', { variant: 'secondary' })}${btn('Lưu', { icon: 'check' })}`,
    }),
  }) +
  note('Nội dung công việc — thực thể mới của HR Tools, không có trong phân hệ Quy trình', [
    'Nó có <strong>đơn vị phân bổ riêng</strong> và <strong>CPNC phê duyệt riêng</strong>, khác nhiệm vụ cha. Đây là lý do chấm công gán ngày vào <em>nội dung công việc</em> chứ không gán thẳng vào nhiệm vụ.',
    'Nhiệm vụ chưa khai nội dung công việc nào thì màn thêm nhân sự (1I) hiện cảnh báo và khoá ô chọn nội dung — không cho đi tiếp bằng dữ liệu rỗng.',
  ]);

/* ======================================================= 67 · Danh sách nhân sự */
const PHANCONG = [
  ['801234', 'Trần Minh Quân', 'quantm@viettel.com.vn', 'Trung tâm CHĐK', '011-24-TĐ-RDP-QS', 'Thành viên', 'Thiết kế khối cao tần', '—', '08/04/2025 → 31/12/2026', ['Đã duyệt', 'success'], false],
  ['805512', 'Lê Thị Hồng Nhung', 'nhunglth@viettel.com.vn', 'Trung tâm CHĐK', '011-24-TĐ-RDP-QS', 'Thành viên', 'Lập trình firmware', '60%', '08/04/2025 → 31/12/2026', ['Đã duyệt', 'success'], false],
  ['805512', 'Lê Thị Hồng Nhung', 'nhunglth@viettel.com.vn', 'Trung tâm CHĐK', '012-24-PAKD-CAM', 'Thành viên', 'Tối ưu thuật toán nhận dạng', '55%', '01/05/2025 → 31/12/2025', ['Chờ duyệt', 'warning'], true],
  ['807781', 'Phạm Văn Đức', 'ducpv@viettel.com.vn', 'Phòng Tổng hợp', '011-24-TĐ-RDP-QS', 'PA', 'Quản lý tiến độ, báo cáo', '—', '08/04/2025 → 31/12/2026', ['Đã duyệt', 'success'], false],
  ['803095', 'Nguyễn Hoàng Anh', 'anhnh@viettel.com.vn', 'Trung tâm CHĐK', '011-24-TĐ-RDP-QS', 'Thành viên', 'Thiết kế khối cao tần', '40%', '01/06/2025 → 31/12/2026', ['Chờ duyệt', 'warning'], true],
];

const nhanSuList = (opts = {}) =>
  frame(
    'ds-nhan-su',
    `<div class="page">
      ${pageHead(
        'Danh sách nhân sự',
        'Nhân sự tham gia nhiệm vụ và nội dung công việc được phân công (BM1).',
        `${btn('In', { icon: 'printer', variant: 'secondary' })}${btn('Xuất Excel', { icon: 'download', variant: 'secondary' })}${btn('Nhập từ file', { icon: 'upload', variant: 'secondary' })}${btn('Thêm mới', { icon: 'plus' })}`,
      )}
      <div class="card">
        <div class="row" style="gap:12px">
          <div class="stat"><small>Tổng số dòng phân công</small><strong>28</strong></div>
          <div class="stat"><small>Đang chờ duyệt</small><strong>6</strong></div>
          <div class="stat stat--warn"><small>Nhân sự vượt 100% tỷ lệ dự kiến</small><strong>1</strong></div>
        </div>
        <div class="filters">
          <div class="filters__left row" style="gap:8px;align-items:center">
            <span class="caption">Đã chọn 2 dòng:</span>
            ${btn('Trình duyệt', { icon: 'send', variant: 'secondary', sm: true })}
            ${btn('Duyệt', { icon: 'check', variant: 'secondary', sm: true })}
            ${btn('Từ chối', { icon: 'ban', variant: 'secondary', sm: true })}
          </div>
          ${select('Nhiệm vụ', { placeholder: true })}${select('Trạng thái', { placeholder: true })}
          ${search('Tìm theo mã NV, họ tên, đơn vị...')}
        </div>
        ${table(
          [
            CHECK, STT,
            { t: 'Thao tác', w: 'w-110' },
            { t: 'Mã NV', w: 'w-110' },
            { t: 'Họ và tên', w: 'w-240' },
            { t: 'Đơn vị', w: 'w-180' },
            { t: 'Mã nhiệm vụ', w: 'w-160' },
            { t: 'Vai trò tham gia', w: 'w-170' },
            { t: 'Nội dung công việc', w: 'w-240' },
            { t: 'Tỷ lệ dự kiến', w: 'w-120', cls: 'tbl__th--num' },
            { t: 'Thời gian tham gia', w: 'w-200' },
            { t: 'Trạng thái', w: 'w-140' },
          ],
          PHANCONG.map((r, i) => [
            { h: cb(r[10]), cls: 'tbl__td--center' },
            { h: String(i + 1), cls: 'tbl__td--center' },
            rowActions(),
            link(r[0]),
            `<div class="col" style="gap:0"><div>${r[1]}</div><div class="caption">${r[2]}</div></div>`,
            r[3], link(r[4]), r[5], r[6],
            { h: r[7], cls: 'tbl__td--num' },
            r[8], tag(r[9][0], r[9][1]),
          ]),
          { rowCls: (i) => (i === 2 || i === 4 ? 'tbl__row--selected' : '') },
        )}
        ${tableFoot(28, { pages: [1, 2] })}
      </div>
    </div>`,
    { wide: true, ...opts },
  );

const manNhanSuList = () =>
  nhanSuList() +
  note('Đã code — thanh thao tác hàng loạt chỉ hiện khi có dòng được tích', [
    'Ba nút <em>Trình duyệt / Duyệt / Từ chối</em> nằm bên trái hàng lọc và <strong>chỉ xuất hiện khi đã chọn ≥ 1 dòng</strong>. Trong Figma nên tách thành một component riêng, hiện/ẩn theo trạng thái.',
    'Cùng một người (805512) có <strong>hai dòng ở hai nhiệm vụ khác nhau</strong> — đây là dữ liệu đúng, không phải trùng lặp. Khoá là (nhân sự, nhiệm vụ, nội dung CV, khoảng thời gian).',
    'Thẻ thống kê "vượt 100% tỷ lệ dự kiến" là cảnh báo, không phải lỗi chặn — vẫn lưu được, nhưng phải nhìn thấy.',
    'Màn này có bản in riêng dùng <strong>chính tập dòng đang lọc</strong> (BM.06, artboard 34) — in ra đúng cái người dùng đang nhìn.',
  ]);

/* ============================================== 68 · Form thêm nhân sự vào nhiệm vụ */
const inputSm = (t, ph = false) => input(t, { placeholder: ph });

const THANHVIEN = [
  ['801234', 'Trần Minh Quân', 'Trung tâm CHĐK · Kỹ sư chính', 'Thành viên', 'Thiết kế khối cao tần', '', false],
  ['805512', 'Lê Thị Hồng Nhung', 'Trung tâm CHĐK · Kỹ sư bậc 3', 'Thành viên', 'Lập trình firmware', '60', false],
  ['803095', 'Nguyễn Hoàng Anh', 'Trung tâm CHĐK · Kỹ sư bậc 1', 'Thành viên', 'Thiết kế khối cao tần', '75', true],
];

const nhanSuForm = (opts = {}) =>
  frame(
    'ds-nhan-su',
    `<div class="page">
      ${pageHead('Thêm nhân sự vào nhiệm vụ', 'Chọn nhiệm vụ, chọn nhân sự và khai nội dung công việc tham gia.', `${btn('Huỷ', { variant: 'secondary' })}${btn('Lưu', { icon: 'save' })}`, true)}

      <div class="card">
        <div class="card__title">Thông tin chung</div>
        <div class="row" style="gap:16px">
          <div class="grow">${field('Nhiệm vụ', select('011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần', { w: '' }), { required: true })}</div>
          <div class="grow">${field('Đơn vị chủ trì', input('Trung tâm Chế tạo Điện tử Khí tài', { state: 'readonly' }), { help: 'Tự điền theo nhiệm vụ — không sửa tay.' })}</div>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <div class="card__title">Danh sách nhân sự tham gia</div>
          ${btn('Chọn nhân sự', { icon: 'users', variant: 'secondary' })}
        </div>
        <div class="alert alert--warn">${ico('alert', 18)}
          <div class="alert__body"><div class="alert__title">Có nhân sự vượt 100% tổng tỷ lệ dự kiến trong kỳ chồng lấn</div>
          <div>Giảm tỷ lệ hoặc thu hẹp thời gian tham gia trước khi lưu. Dòng bị tô ở dưới là dòng gây vượt.</div></div>
        </div>
        ${table(
          [
            STT,
            { t: 'Mã NV', w: 'w-110' },
            { t: 'Họ tên / Đơn vị', w: 'w-260' },
            { t: 'Vai trò tham gia', w: 'w-190' },
            { t: 'Nội dung công việc tham gia', w: 'w-300' },
            { t: 'Tỷ lệ dự kiến (%)', w: 'w-160' },
            { t: 'Từ ngày', w: 'w-160' },
            { t: 'Đến ngày', w: 'w-160' },
            { t: 'Ghi chú', w: 'w-200' },
            { t: '', w: 'w-56', cls: 'tbl__th--center' },
          ],
          THANHVIEN.map((r, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            `<code>${r[0]}</code>`,
            `<div class="col" style="gap:0"><div>${r[1]}</div><div class="caption">${r[2]}</div></div>`,
            select(r[3], { w: '' }),
            select(r[4], { w: '' }),
            r[5]
              ? `<div class="col" style="gap:2px">${inputSm(r[5])}${r[6] ? '<div class="field__error">Tổng 115%</div>' : ''}</div>`
              : inputSm('Không bắt buộc', true),
            input('08/04/2025', { iconRight: 'calendar' }),
            input('31/12/2026', { iconRight: 'calendar' }),
            inputSm('', true),
            { h: iconBtn('trash', 'danger'), cls: 'tbl__td--center' },
          ]),
          { rowCls: (i) => (i === 2 ? 'tbl__row--warn' : '') },
        )}
      </div>
    </div>`,
    { wide: true, ...opts },
  );

const manNhanSuForm = () =>
  nhanSuForm() +
  note('Đã code — đây là LƯỚI NHẬP LIỆU, cố ý không dùng component bảng chung', [
    'Chú thích trong code nói rõ: lưới này để <strong>nhập</strong>, không phải bảng để <strong>đọc</strong> ⇒ không dùng <code>&lt;ubck-table&gt;</code>. Trong Figma cũng nên là component khác với bảng danh sách: mỗi ô là một control, chiều cao hàng do control quyết định.',
    'Ô <strong>Tỷ lệ dự kiến để trống là hợp lệ</strong> — BM1 không có cột này. Chỉ khi có giá trị mới kiểm tra tổng ≤ 100% trong kỳ chồng lấn.',
    'Ở chế độ <strong>sửa</strong> thì ô Nhiệm vụ bị khoá, nút "Chọn nhân sự" và icon Xoá dòng biến mất — sửa là sửa một phân công, không phải sửa cả danh sách.',
    'Nhiệm vụ chưa khai nội dung công việc nào ⇒ hiện cảnh báo và <strong>khoá</strong> ô chọn nội dung, kèm hướng dẫn khai ở tab "Nội dung công việc" của màn chi tiết trước.',
  ]);

/* --------------------------------- 69 · Pop-up chọn nhân sự (1360px, có bảng) */
const PICKER = [
  ['801234', 'Trần Minh Quân', 'Kỹ sư chính', 'Trung tâm CHĐK', 'Khối 1 - TCT CNC', 'quantm@viettel.com.vn', true, true],
  ['805512', 'Lê Thị Hồng Nhung', 'Kỹ sư bậc 3', 'Trung tâm CHĐK', 'Khối 1 - TCT CNC', 'nhunglth@viettel.com.vn', true, true],
  ['807781', 'Phạm Văn Đức', 'Trợ lý dự án', 'Phòng Tổng hợp', 'Khối 1 - TCT CNC', 'ducpv@viettel.com.vn', false, true],
  ['803095', 'Nguyễn Hoàng Anh', 'Kỹ sư bậc 1', 'Trung tâm CHĐK', 'Khối 1 - TCT CNC', 'anhnh@viettel.com.vn', true, false],
  ['809442', 'Vũ Thị Thu Hà', 'Chuyên viên Công nghệ', 'Trung tâm Camera', 'Khối 2 - TCT CNC', 'havtt@viettel.com.vn', false, false],
  ['802217', 'Đỗ Quang Huy', 'Trưởng phòng ban', 'Trung tâm QLCL', 'TT QLCL', 'huydq@viettel.com.vn', false, false],
];

const dialogPicker = () =>
  nhanSuForm({
    overlay: dlg({
      title: 'Chọn nhân sự',
      size: 'picker',
      body: `
          <div class="filters">
            ${select('Khối 1 - TCT CNC')}${select('Trung tâm Chế tạo Điện tử Khí tài')}${select('Chức danh', { placeholder: true })}
            ${search('Tìm theo mã NV, họ tên, email')}
          </div>
          ${table(
            [
              CHECK,
              { t: 'Mã NV', w: 'w-110' },
              { t: 'Họ và tên', w: 'w-220' },
              { t: 'Chức danh', w: 'w-190' },
              { t: 'Đơn vị (cấp 5)', w: 'w-260' },
              { t: 'Khối', w: 'w-160' },
              { t: 'Email' },
              { t: 'Trạng thái', w: 'w-190', cls: 'tbl__th--center' },
            ],
            PICKER.map((r) => [
              { h: r[7] ? '<div class="checkbox checkbox--on">' + ico('check', 14) + '</div>' : cb(r[6]), cls: 'tbl__td--center' },
              link(r[0]), r[1], r[2], r[3], r[4], r[5],
              { h: r[7] ? tag('Đã có trong nhiệm vụ', '') : '', cls: 'tbl__td--center' },
            ]),
            { rowCls: (i) => (i < 3 ? 'tbl__row--selected' : '') },
          )}
          ${tableFoot(1179, { pages: [1, 2, 3, '…', 48] })}`,
      foot: `<div class="spacer caption">Đã chọn <strong>1</strong> người mới · 3 người đã có sẵn trong nhiệm vụ</div>${btn('Huỷ', { variant: 'secondary' })}${btn('Thêm vào danh sách', { icon: 'check' })}`,
    }),
  }) +
  note('Pop-up chọn dữ liệu — cỡ 1360px, khác hẳn dialog form', [
    'Người <strong>đã có trong nhiệm vụ</strong> vẫn hiện nhưng ô tích bị khoá ở trạng thái đã chọn và có thẻ ghi rõ lý do. Ẩn họ đi thì người dùng tưởng danh mục thiếu người và đi thêm trùng.',
    'Pop-up có <strong>bộ lọc và phân trang riêng</strong> — nó là một màn danh sách thu nhỏ, không phải một ô select dài.',
    'Chân hộp thoại nói rõ <strong>đang chọn bao nhiêu</strong> trước khi bấm Thêm — bảng dài 1.179 dòng thì không ai đếm bằng mắt được.',
  ]);

module.exports = [
  { code: '1A', group: '1 · Màn đã code (đợt 1)', title: 'Danh mục nhiệm vụ', desc: '/hr/nhiem-vu — 14 cột — khổ rộng', body: manNhiemVuList },
  { code: '1B', group: '1 · Màn đã code (đợt 1)', title: 'Dialog xoá nhiệm vụ', desc: 'Hộp xác nhận 400px nổi trên màn', body: dialogXoa },
  { code: '1C', group: '1 · Màn đã code (đợt 1)', title: 'Dialog từ chối bản khai', desc: 'Form 520px, lý do bắt buộc', body: dialogTuChoi },
  { code: '1D', group: '1 · Màn đã code (đợt 1)', title: 'Khai báo nhiệm vụ', desc: '/hr/khai-bao-nhiem-vu — tìm kiếm nâng cao + chọn nhiều — khổ rộng', body: khaiBaoList },
  { code: '1E', group: '1 · Màn đã code (đợt 1)', title: 'Chi tiết nhiệm vụ', desc: '/hr/nhiem-vu/:ma — tab Nội dung công việc — khổ rộng', body: manChiTiet },
  { code: '1F', group: '1 · Màn đã code (đợt 1)', title: 'Chi tiết nhiệm vụ — ba tab còn lại', desc: 'Vai trò PM/PA · Nhân sự tham gia · Lịch sử', body: chiTietTabs },
  { code: '1G', group: '1 · Màn đã code (đợt 1)', title: 'Dialog thêm nội dung công việc', desc: 'Form 520px nổi trên màn chi tiết', body: dialogThemNoiDung },
  { code: '1H', group: '1 · Màn đã code (đợt 1)', title: 'Danh sách nhân sự', desc: '/hr/nhan-su — thao tác hàng loạt — khổ rộng', body: manNhanSuList },
  { code: '1I', group: '1 · Màn đã code (đợt 1)', title: 'Thêm nhân sự vào nhiệm vụ', desc: '/hr/nhan-su/moi — lưới nhập liệu — khổ rộng', body: manNhanSuForm },
  { code: '1J', group: '1 · Màn đã code (đợt 1)', title: 'Pop-up chọn nhân sự', desc: 'Dialog 1360px có bảng và phân trang', body: dialogPicker },
];
