/* =============================================================================
 * Đợt 1.5 — Danh mục (§5 kế hoạch thi công).
 *
 * `Book1` liệt kê 6 danh mục, cộng `Ký hiệu công` và `Nhóm công việc` (§2.2) là 8. BRD §4.6 nhắc
 * thêm 4 cái nữa — `loại chi phí nhân công`, `đối tác`, `nhiệm vụ mẫu`, `trạng thái nhiệm vụ` —
 * bổ sung 2026-08-27, thành 12. Mỗi cái đủ `Danh sách · Chi tiết · CRUD · Import · Export`;
 * riêng phần **Chi tiết** dùng chung một khuôn, vẽ ở artboard 12B.
 *
 * Bảy màn dùng CHUNG một khuôn (danh sách phẳng theo mẫu DMDC) nên sinh bằng vòng lặp — sửa
 * khuôn là cả bảy đổi theo. Riêng **Đơn vị** khác khuôn: cây 5 cấp bên trái + bảng bên phải.
 *
 * Dữ liệu lấy từ `docs/hr_tool/trich-xuat/` (sheet `List`, `BM0`, `Book1`) — tên đơn vị, mã đơn
 * vị, ký hiệu công đều là số liệu thật của khách, KHÔNG bịa thêm tên mới.
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, frame, bare, DIM, dlg, toast, pageHead, btn, input, select, search, field, tag, table, tableFoot, rowActions, note, money } = U;

const sw = (on) => `<div class="switch${on ? ' switch--on' : ''}"><div class="switch__knob"></div></div>`;
const STT = { t: 'STT', w: 'w-56', cls: 'tbl__th--center' };
const THAOTAC = { t: 'Thao tác', w: 'w-110' };
const TRANGTHAI = { t: 'Trạng thái', w: 'w-110', cls: 'tbl__th--center' };

/* Khuôn danh sách danh mục — hàng lọc CĂN PHẢI trong card, đúng bản thiết kế. */
function danhSach({ nav, title, desc, cols, rows, total, filters, extra = '' }) {
  return frame(
    nav,
    `<div class="page">
      ${pageHead(title, desc, `${btn('Nhập từ Excel', { icon: 'upload', variant: 'secondary' })}${btn('Xuất Excel', { icon: 'download', variant: 'secondary' })}${btn('Thêm mới', { icon: 'plus' })}`)}
      <div class="card">
        ${extra}
        <div class="filters">${filters}</div>
        ${table([STT, THAOTAC, TRANGTHAI, ...cols], rows, { rowCls: (i) => (i === 2 ? 'tbl__row--hover' : '') })}
        ${tableFoot(total, { pages: [1, 2, 3, 4, '…', Math.ceil(total / 25)] })}
      </div>
    </div>`,
  );
}

const r = (i, ...cells) => [String(i), rowActions(), { h: sw(i !== 4), cls: 'tbl__td--center' }, ...cells];

/* ------------------------------------------------------------------ 10 · Đơn vị */
const TREE = [
  [0, 'Tập đoàn Công nghiệp - Viễn thông Quân đội', '148842', 1],
  [1, 'Công ty mẹ - Tập đoàn', '9001803', 2],
  [2, 'Tổng công ty Công nghiệp Công nghệ cao Viettel', '9013878', 3],
  [3, 'Khối 1 - TCT CNC', '9013948', 4],
  [4, 'Trung tâm Chế tạo Điện tử Khí tài', '9014021', 5],
  [4, 'Trung tâm Kinh doanh Điều hành', '9014022', 5],
  [4, 'Phòng Tổng hợp', '9014023', 5],
  [3, 'Khối 2 - TCT CNC', '9013949', 4],
  [3, 'Khối 3 - TCT CNC', '9013950', 4],
  [3, 'Trung tâm Kinh doanh', '9013951', 4],
  [3, 'Trung tâm Quản lý Chất lượng', '9013952', 4],
];

const donVi = () =>
  frame(
    'dm-don-vi',
    `<div class="page">
      ${pageHead('Danh mục Đơn vị', 'Cây đơn vị 5 cấp. Nghiệp vụ chỉ chạy ở cấp 4 (Khối — đơn vị báo cáo) và cấp 5 (Đơn vị — đơn vị chấm công); cấp 1–3 chỉ để hiển thị.', `${btn('Nhập từ Excel', { icon: 'upload', variant: 'secondary' })}${btn('Xuất Excel', { icon: 'download', variant: 'secondary' })}${btn('Thêm đơn vị', { icon: 'plus' })}`)}
      <div class="row" style="gap:20px;align-items:stretch">
        <div class="card" style="flex:0 0 380px">
          <div class="card__head"><div class="card__title">Cây đơn vị</div>${btn('', { icon: 'refresh', variant: 'ghost', sm: true, cls: 'btn--icon' })}</div>
          ${search('Tìm đơn vị', { w: '' })}
          <div class="tree">
            ${TREE.map(([lv, ten, ma, cap]) => {
              const active = ten === 'Trung tâm Chế tạo Điện tử Khí tài';
              return `<div class="treenode${active ? ' treenode--active' : ''}">
                <div class="treenode__indent" style="width:${lv * 16}px"></div>
                ${lv < 4 ? ico('chevron-down', 14, 'treenode__caret') : `<div style="width:14px"></div>`}
                ${ico(cap === 5 ? 'users' : 'building', 16)}
                <div class="grow">${ten}</div>
                <div class="caption">C${cap}</div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <div class="card grow">
          <div class="card__head">
            <div class="col" style="gap:2px">
              <div class="card__title">Trung tâm Chế tạo Điện tử Khí tài</div>
              <div class="caption">Mã 9014021 · Cấp 5 · thuộc Khối 1 - TCT CNC (9013948)</div>
            </div>
            <div class="row">${btn('Sửa', { icon: 'pencil', variant: 'secondary', sm: true })}${btn('Xoá', { icon: 'trash', variant: 'secondary', sm: true })}</div>
          </div>
          <div class="desc">
            <div class="desc__item"><div class="desc__label">Mã đơn vị</div><div class="desc__value">9014021</div></div>
            <div class="desc__item"><div class="desc__label">Cấp</div><div class="desc__value">Cấp 5 — đơn vị chấm công</div></div>
            <div class="desc__item"><div class="desc__label">Đơn vị cha</div><div class="desc__value">Khối 1 - TCT CNC</div></div>
            <div class="desc__item"><div class="desc__label">Trạng thái</div><div class="desc__value">${tag('Đang hoạt động', 'success')}</div></div>
            <div class="desc__item"><div class="desc__label">Số nhân sự</div><div class="desc__value">148</div></div>
            <div class="desc__item"><div class="desc__label">Quỹ lương tháng 05/2025</div><div class="desc__value">3.482.150.000 ₫</div></div>
          </div>
          <div class="section-title">Đơn vị trực thuộc</div>
          ${table(
            [STT, THAOTAC, { t: 'Mã đơn vị', w: 'w-140' }, { t: 'Tên đơn vị' }, { t: 'Cấp', w: 'w-80', cls: 'tbl__th--center' }, { t: 'Số nhân sự', w: 'w-120', cls: 'tbl__th--num' }],
            [
              ['1', rowActions(), '<span class="code-link">9014021</span>', 'Trung tâm Chế tạo Điện tử Khí tài', { h: '5', cls: 'tbl__td--center' }, { h: '148', cls: 'tbl__td--num' }],
              ['2', rowActions(), '<span class="code-link">9014022</span>', 'Trung tâm Kinh doanh Điều hành', { h: '5', cls: 'tbl__td--center' }, { h: '96', cls: 'tbl__td--num' }],
              ['3', rowActions(), '<span class="code-link">9014023</span>', 'Phòng Tổng hợp', { h: '5', cls: 'tbl__td--center' }, { h: '32', cls: 'tbl__td--num' }],
            ],
          )}
          <div class="alert">${ico('info', 18)}
            <div class="alert__body"><div class="alert__title">Mã đơn vị trong file import đi kèm chuỗi tên</div>
            <div>Ví dụ thật: <code>"Khối 1 - TCT CNC - 9013948"</code>. Parser phải tách theo dấu <code>-</code> <strong>từ phải sang</strong>, vì tên đơn vị cũng chứa dấu gạch nối.</div></div>
          </div>
        </div>
      </div>
    </div>`,
  );

/* ------------------------------------------------- 11–17 · bảy danh mục phẳng */
const FLAT = [
  {
    code: '11', nav: 'dm-chuc-danh', title: 'Danh mục Chức danh',
    desc: 'Chức danh theo HRM. KHÁC với vai trò PM/PA của nhiệm vụ — hai thứ không được gộp (khách ghi rõ ở sheet 1.DS Nhân sự).',
    filters: `${select('Nhóm chức danh', { placeholder: true })}${select('Trạng thái', { placeholder: true })}${search('Tìm theo mã hoặc tên chức danh')}`,
    cols: [{ t: 'Mã chức danh', w: 'w-160' }, { t: 'Tên chức danh', w: 'w-320' }, { t: 'Nhóm chức danh', w: 'w-200' }, { t: 'Mô tả' }],
    rows: [
      ['CD-KS1', 'Kỹ sư bậc 1', 'Kỹ thuật', 'Kỹ sư mới, dưới 2 năm kinh nghiệm'],
      ['CD-KS3', 'Kỹ sư bậc 3', 'Kỹ thuật', 'Kỹ sư chủ trì hạng mục'],
      ['CD-KSC', 'Kỹ sư chính', 'Kỹ thuật', 'Chủ trì thiết kế hệ thống'],
      ['CD-TPB', 'Trưởng phòng ban', 'Quản lý', 'Quản lý đơn vị cấp 5'],
      ['CD-CVCN', 'Chuyên viên Công nghệ', 'Kỹ thuật', 'Chuyên viên nghiên cứu'],
      ['CD-TLDA', 'Trợ lý dự án', 'Hỗ trợ', 'Trợ lý đề tài/dự án (PA)'],
      ['CD-NVKT', 'Nhân viên Kế toán', 'Nghiệp vụ', 'Phòng Tài chính'],
    ],
    total: 42,
  },
  {
    code: '13', nav: 'dm-nguon-kinh-phi', title: 'Danh mục Nguồn kinh phí',
    desc: 'Phân nguồn quyết định CPNC tính vào nguồn nào. KHÁC với Phân loại nhiệm vụ (quyết định layout màn chấm công) — hai enum khác nhau, đừng gộp.',
    filters: `${select('Trạng thái', { placeholder: true })}${search('Tìm theo mã hoặc tên nguồn')}`,
    cols: [{ t: 'Mã nguồn', w: 'w-140' }, { t: 'Tên nguồn kinh phí', w: 'w-240' }, { t: 'Lập dự toán', w: 'w-140', cls: 'tbl__th--center' }, { t: 'Ghi chú' }],
    rows: [
      ['KHCN', 'Khoa học công nghệ', { h: tag('Có', 'success'), cls: 'tbl__td--center' }, 'Đề tài KHCN — có mã đề tài bên QTKHCN'],
      ['SXKD', 'Sản xuất kinh doanh', { h: tag('Có', 'success'), cls: 'tbl__td--center' }, 'Phương án kinh doanh'],
      ['BANHANG', 'Bán hàng', { h: tag('Có', 'success'), cls: 'tbl__td--center' }, 'Theo sản phẩm của PAKD'],
      ['BAOHANH', 'Bảo hành', { h: tag('Không', 'warning'), cls: 'tbl__td--center' }, '<strong>Chỉ theo dõi số đã phân bổ</strong> — cột "còn lại" phải ĐỂ TRỐNG, không hiện 0'],
      ['DTPT', 'Đầu tư phát triển', { h: tag('Có', 'success'), cls: 'tbl__td--center' }, 'Dự án ĐTPT'],
      ['QUANLY', 'Quản lý', { h: tag('Không', 'warning'), cls: 'tbl__td--center' }, '<strong>Hệ thống tự gán</strong> cho công thừa — người dùng không chọn được'],
    ],
    total: 6,
  },
  {
    code: '14', nav: 'dm-san-pham', title: 'Danh mục Sản phẩm',
    desc: 'Chỉ dùng cho nhiệm vụ phân loại PAKD — là tầng gom trên nội dung công việc (BM2.2).',
    filters: `${select('Nhóm sản phẩm', { placeholder: true })}${select('Trạng thái', { placeholder: true })}${search('Tìm theo mã hoặc tên sản phẩm')}`,
    cols: [{ t: 'Mã sản phẩm', w: 'w-140' }, { t: 'Tên sản phẩm', w: 'w-320' }, { t: 'Nhóm sản phẩm', w: 'w-200' }, { t: 'Số nhiệm vụ dùng', w: 'w-160', cls: 'tbl__th--num' }],
    rows: [
      ['SP-A', 'Sản phẩm A — Khối thu phát cao tần', 'Thiết bị vô tuyến', { h: '12', cls: 'tbl__td--num' }],
      ['SP-B', 'Sản phẩm B — Bộ điều khiển trung tâm', 'Thiết bị điều khiển', { h: '8', cls: 'tbl__td--num' }],
      ['SP-C', 'Sản phẩm C — Camera giám sát AI', 'Camera', { h: '15', cls: 'tbl__td--num' }],
      ['SP-D', 'Sản phẩm D — Trạm quan trắc', 'Thiết bị đo', { h: '3', cls: 'tbl__td--num' }],
    ],
    total: 24,
  },
  {
    code: '15', nav: 'dm-thu-vien-cv', title: 'Danh mục Thư viện công việc',
    desc: 'Nội dung công việc mẫu, tái dùng khi lập nhiệm vụ. Nguồn: Book1 module Danh mục.',
    filters: `${select('Nhóm công việc', { placeholder: true })}${select('Trạng thái', { placeholder: true })}${search('Tìm theo tên nội dung công việc')}`,
    cols: [{ t: 'Mã', w: 'w-120' }, { t: 'Tên nội dung công việc' }, { t: 'Nhóm công việc', w: 'w-200' }, { t: 'Lần dùng', w: 'w-110', cls: 'tbl__th--num' }],
    rows: [
      ['TV-001', 'Khảo sát, phân tích yêu cầu', 'Giải pháp', { h: '87', cls: 'tbl__td--num' }],
      ['TV-002', 'Thiết kế kiến trúc hệ thống', 'Giải pháp', { h: '64', cls: 'tbl__td--num' }],
      ['TV-011', 'Thiết kế khối cao tần', 'Thiết kế', { h: '23', cls: 'tbl__td--num' }],
      ['TV-021', 'Lập trình firmware', 'Phát triển', { h: '119', cls: 'tbl__td--num' }],
      ['TV-031', 'Kiểm thử tích hợp', 'Kiểm thử', { h: '95', cls: 'tbl__td--num' }],
      ['TV-041', 'Triển khai thử nghiệm hiện trường', 'Triển khai', { h: '31', cls: 'tbl__td--num' }],
      ['TV-051', 'Quản lý tiến độ, báo cáo', 'Quản lý dự án', { h: '142', cls: 'tbl__td--num' }],
    ],
    total: 118,
  },
  {
    code: '16', nav: 'dm-ky-hieu-cong', title: 'Danh mục Ký hiệu công',
    desc: 'Ký hiệu trong file BM0 do HR nhập từ SAP/HRM, dạng X:8 · P:8 · DL:8. Cột "Khoá ô chấm công" là thứ điều khiển luật khoá ở màn chấm công.',
    filters: `${select('Trạng thái', { placeholder: true })}${search('Tìm theo ký hiệu')}`,
    cols: [{ t: 'Ký hiệu', w: 'w-110', cls: 'tbl__th--center' }, { t: 'Tên ký hiệu', w: 'w-280' }, { t: 'Tính công', w: 'w-140', cls: 'tbl__th--center' }, { t: 'Khoá ô chấm công', w: 'w-180', cls: 'tbl__th--center' }, { t: 'Ghi chú' }],
    rows: [
      [{ h: '<strong>X</strong>', cls: 'tbl__td--center' }, 'Đi làm', { h: tag('Có', 'success'), cls: 'tbl__td--center' }, { h: tag('Không', ''), cls: 'tbl__td--center' }, 'Ô chấm công bình thường'],
      [{ h: '<strong>P</strong>', cls: 'tbl__td--center' }, 'Nghỉ phép', { h: tag('Có', 'success'), cls: 'tbl__td--center' }, { h: tag('Khoá', 'danger'), cls: 'tbl__td--center' }, 'Ô xám, hiện ký hiệu gốc'],
      [{ h: '<strong>DL</strong>', cls: 'tbl__td--center' }, 'Nghỉ lễ', { h: tag('Có', 'success'), cls: 'tbl__td--center' }, { h: tag('Khoá', 'danger'), cls: 'tbl__td--center' }, 'Ô xám, hiện ký hiệu gốc'],
      [{ h: '<strong>Ô</strong>', cls: 'tbl__td--center' }, 'Nghỉ ốm', { h: tag('Có', 'success'), cls: 'tbl__td--center' }, { h: tag('Khoá', 'danger'), cls: 'tbl__td--center' }, ''],
      [{ h: '<strong>TS</strong>', cls: 'tbl__td--center' }, 'Nghỉ thai sản', { h: tag('Không', ''), cls: 'tbl__td--center' }, { h: tag('Khoá', 'danger'), cls: 'tbl__td--center' }, ''],
      [{ h: '<strong>CT</strong>', cls: 'tbl__td--center' }, 'Công tác', { h: tag('Có', 'success'), cls: 'tbl__td--center' }, { h: tag('Không', ''), cls: 'tbl__td--center' }, 'Vẫn chấm được vào nhiệm vụ'],
      [{ h: '<strong>KL</strong>', cls: 'tbl__td--center' }, 'Nghỉ không lương', { h: tag('Không', ''), cls: 'tbl__td--center' }, { h: tag('Khoá', 'danger'), cls: 'tbl__td--center' }, ''],
      [{ h: '<strong>NB</strong>', cls: 'tbl__td--center' }, 'Chờ khai báo', { h: tag('—', 'warning'), cls: 'tbl__td--center' }, { h: tag('—', 'warning'), cls: 'tbl__td--center' }, '<strong>Ký hiệu lạ từ file import</strong> — cảnh báo cho qua, chờ HR khai'],
    ],
    total: 8,
  },
  {
    code: '17', nav: 'dm-nhom-cv', title: 'Danh mục Nhóm công việc',
    desc: 'Gom nội dung công việc để báo cáo. Nguồn: Book1 sheet Quy trình.',
    filters: `${select('Trạng thái', { placeholder: true })}${search('Tìm theo tên nhóm')}`,
    cols: [{ t: 'Mã nhóm', w: 'w-140' }, { t: 'Tên nhóm công việc', w: 'w-320' }, { t: 'Thứ tự', w: 'w-100', cls: 'tbl__th--center' }, { t: 'Số nội dung CV', w: 'w-160', cls: 'tbl__th--num' }],
    rows: [
      ['NCV-01', 'Giải pháp', { h: '1', cls: 'tbl__td--center' }, { h: '18', cls: 'tbl__td--num' }],
      ['NCV-02', 'Thiết kế', { h: '2', cls: 'tbl__td--center' }, { h: '26', cls: 'tbl__td--num' }],
      ['NCV-03', 'Phát triển', { h: '3', cls: 'tbl__td--center' }, { h: '41', cls: 'tbl__td--num' }],
      ['NCV-04', 'Kiểm thử', { h: '4', cls: 'tbl__td--center' }, { h: '19', cls: 'tbl__td--num' }],
      ['NCV-05', 'Triển khai', { h: '5', cls: 'tbl__td--center' }, { h: '9', cls: 'tbl__td--num' }],
      ['NCV-06', 'Quản lý dự án', { h: '6', cls: 'tbl__td--center' }, { h: '5', cls: 'tbl__td--num' }],
    ],
    total: 6,
  },
  {
    code: '13B', nav: 'dm-loai-cpnc', title: 'Danh mục Loại chi phí nhân công',
    desc: 'BRD §4.6. Đúng 14 khoản mục của BM3, giữ nguyên THỨ TỰ trong file gốc — thêm hoặc bớt một khoản là đổi bố cục cả BM3, BM3.1 và BM4.',
    filters: `${select('Nhóm khoản mục', { placeholder: true })}${select('Trạng thái', { placeholder: true })}${search('Tìm theo tên khoản mục')}`,
    cols: [{ t: 'Mã khoản', w: 'w-140' }, { t: 'Tên khoản mục CPNC', w: 'w-320' }, { t: 'Nhóm', w: 'w-160' }, { t: 'Thứ tự BM3', w: 'w-120', cls: 'tbl__th--center' }, { t: 'Ghi chú' }],
    rows: [
      ['LCP-01', 'Lương tháng', 'Lương', { h: '1', cls: 'tbl__td--center' }, 'Khoản lớn nhất — chiếm phần lớn CPNC'],
      ['LCP-02', 'Lương tháng (trừ BH cá nhân)', 'Lương', { h: '2', cls: 'tbl__td--center' }, 'Là <strong>dẫn xuất</strong> của LCP-01, không cộng dồn hai lần'],
      ['LCP-03', 'Truy thu/truy lĩnh (lương tháng lần 2)', 'Lương', { h: '3', cls: 'tbl__td--center' }, 'Có thể <strong>âm</strong> khi truy thu'],
      ['LCP-04', 'Lương SXKD (nếu có)', 'Lương', { h: '4', cls: 'tbl__td--center' }, 'Chỉ nhiệm vụ phân loại PAKD'],
      ['LCP-05', 'Lương thử việc, tập nghề', 'Lương', { h: '5', cls: 'tbl__td--center' }, ''],
      ['LCP-06', 'Lương kinh doanh thử việc, tập nghề', 'Lương', { h: '6', cls: 'tbl__td--center' }, ''],
      ['LCP-07', 'BHXH — Cá nhân', 'Bảo hiểm', { h: '7', cls: 'tbl__td--center' }, ''],
      ['LCP-08', 'BHXH — Đơn vị', 'Bảo hiểm', { h: '8', cls: 'tbl__td--center' }, ''],
      ['LCP-09', 'BHYT — Cá nhân', 'Bảo hiểm', { h: '9', cls: 'tbl__td--center' }, ''],
      ['LCP-10', 'BHYT — Đơn vị', 'Bảo hiểm', { h: '10', cls: 'tbl__td--center' }, ''],
      ['LCP-11', 'BHTN — Cá nhân', 'Bảo hiểm', { h: '11', cls: 'tbl__td--center' }, ''],
      ['LCP-12', 'BHTN — Đơn vị', 'Bảo hiểm', { h: '12', cls: 'tbl__td--center' }, ''],
      ['LCP-13', 'KPCĐ', 'Bảo hiểm', { h: '13', cls: 'tbl__td--center' }, ''],
      ['LCP-14', 'Các khoản ăn ca, điện thoại, chi phí phụ cấp', 'Phụ cấp', { h: '14', cls: 'tbl__td--center' }, 'Gộp nhiều khoản nhỏ — BM3 để một cột'],
    ],
    total: 14,
  },
  {
    code: '14B', nav: 'dm-doi-tac', title: 'Danh mục Đối tác',
    desc: 'BRD §4.6. Đối tác ngoài tham gia nhiệm vụ. Nhân công thuê ngoài KHÔNG có mã NV trong HRM nên không đi qua BM0 — chi phí của họ vào nhiệm vụ theo đường hợp đồng, không theo bảng chấm công.',
    filters: `${select('Loại đối tác', { placeholder: true })}${select('Trạng thái', { placeholder: true })}${search('Tìm theo mã, tên hoặc mã số thuế')}`,
    cols: [{ t: 'Mã đối tác', w: 'w-140' }, { t: 'Tên đối tác' }, { t: 'Loại', w: 'w-180' }, { t: 'Mã số thuế', w: 'w-160' }, { t: 'Nhiệm vụ tham gia', w: 'w-180', cls: 'tbl__th--num' }],
    rows: [
      ['DT-001', 'Viện Khoa học và Công nghệ Quân sự', 'Viện nghiên cứu', '0100109106', { h: '4', cls: 'tbl__td--num' }],
      ['DT-002', 'Đại học Bách khoa Hà Nội', 'Trường đại học', '0100686656', { h: '2', cls: 'tbl__td--num' }],
      ['DT-003', 'Công ty CP Công nghệ Tân Tiến', 'Nhà thầu phụ', '0106284117', { h: '7', cls: 'tbl__td--num' }],
      ['DT-004', 'Trung tâm Đo lường Chất lượng 1', 'Đơn vị kiểm định', '0100233583', { h: '1', cls: 'tbl__td--num' }],
    ],
    total: 18,
  },
  {
    code: '15B', nav: 'dm-nhiem-vu-mau', title: 'Danh mục Nhiệm vụ mẫu',
    desc: 'BRD §4.6. Bộ nội dung công việc dựng sẵn theo phân loại — chọn mẫu khi khai nhiệm vụ mới thì sinh luôn danh sách nội dung CV. Khác Thư viện công việc: thư viện là TỪNG nội dung CV rời, mẫu là cả BỘ.',
    filters: `${select('Phân loại', { placeholder: true })}${select('Trạng thái', { placeholder: true })}${search('Tìm theo tên nhiệm vụ mẫu')}`,
    cols: [{ t: 'Mã mẫu', w: 'w-140' }, { t: 'Tên nhiệm vụ mẫu' }, { t: 'Phân loại áp dụng', w: 'w-200' }, { t: 'Số nội dung CV', w: 'w-160', cls: 'tbl__th--num' }, { t: 'Lần dùng', w: 'w-120', cls: 'tbl__th--num' }],
    rows: [
      ['NVM-01', 'Đề tài nghiên cứu chế tạo thiết bị', 'Đề tài KHCN', { h: '8', cls: 'tbl__td--num' }, { h: '23', cls: 'tbl__td--num' }],
      ['NVM-02', 'Đề tài nghiên cứu vật liệu', 'Đề tài KHCN', { h: '6', cls: 'tbl__td--num' }, { h: '9', cls: 'tbl__td--num' }],
      ['NVM-03', 'Phương án kinh doanh sản phẩm mới', 'Phương án kinh doanh', { h: '7', cls: 'tbl__td--num' }, { h: '14', cls: 'tbl__td--num' }],
      ['NVM-04', 'Dự án đầu tư dây chuyền sản xuất', 'Dự án ĐTPT', { h: '5', cls: 'tbl__td--num' }, { h: '4', cls: 'tbl__td--num' }],
      ['NVM-05', 'Nhiệm vụ quốc phòng an ninh', 'Nhiệm vụ QPAN', { h: '5', cls: 'tbl__td--num' }, { h: '6', cls: 'tbl__td--num' }],
    ],
    total: 12,
  },
  {
    code: '17B', nav: 'dm-trang-thai-nv', title: 'Danh mục Trạng thái nhiệm vụ',
    desc: 'BRD §4.6. Hai cột giữa ĐIỀU KHIỂN luật khoá ô chấm công (artboard 28) và nút Đóng nhiệm vụ (artboard 62) — không phải nhãn hiển thị. Sửa một ô ở đây là đổi hành vi màn chấm công.',
    filters: `${search('Tìm theo tên trạng thái')}`,
    cols: [{ t: 'Mã', w: 'w-180' }, { t: 'Tên trạng thái', w: 'w-220' }, { t: 'Cho chấm công', w: 'w-160', cls: 'tbl__th--center' }, { t: 'Cho sửa nhiệm vụ', w: 'w-180', cls: 'tbl__th--center' }, { t: 'Ghi chú' }],
    rows: [
      ['DANG_TRINH_PD', 'Đang trình phê duyệt', { h: tag('Không', 'danger'), cls: 'tbl__td--center' }, { h: tag('Có', 'success'), cls: 'tbl__td--center' }, 'Chưa có quyết định phê duyệt CPNC nên chưa có nguồn để phân bổ'],
      ['DANG_PHAN_BO', 'Đang phân bổ', { h: tag('Có', 'success'), cls: 'tbl__td--center' }, { h: tag('Có', 'success'), cls: 'tbl__td--center' }, '<strong>Trạng thái DUY NHẤT cho chấm công.</strong> Luật khoá ô §6.4 dựa vào đúng dòng này'],
      ['TAM_DUNG', 'Tạm dừng', { h: tag('Không', 'danger'), cls: 'tbl__td--center' }, { h: tag('Có', 'success'), cls: 'tbl__td--center' }, 'Giữ nguyên số đã phân bổ, chỉ chặn chấm mới'],
      ['DA_HET_HAN', 'Đã hết hạn', { h: tag('Không', 'danger'), cls: 'tbl__td--center' }, { h: tag('Không', 'danger'), cls: 'tbl__td--center' }, 'Quá thời gian kết thúc — hệ thống tự chuyển, người dùng không đặt tay'],
      ['DA_DONG', 'Đã đóng', { h: tag('Không', 'danger'), cls: 'tbl__td--center' }, { h: tag('Không', 'danger'), cls: 'tbl__td--center' }, 'Đã trình ký BM.05 xong (artboard 62) — chốt sổ, không quay lại được'],
    ],
    total: 5,
  },
];

/* ---------------------------------------- 12 · Nhân viên (có tìm kiếm nâng cao) */
const nhanVien = (opts = {}) =>
  frame(
    'dm-nhan-vien',
    `<div class="page">
      ${pageHead('Danh mục Nhân viên', 'Master data người — nguồn của mọi màn chấm công. Mã NV không có trong danh mục này thì dòng BM0 bị CHẶN khi import.', `${btn('Nhập từ Excel', { icon: 'upload', variant: 'secondary' })}${btn('Xuất Excel', { icon: 'download', variant: 'secondary' })}${btn('Thêm mới', { icon: 'plus' })}`)}
      <div class="card">
        <div class="row row--between">
          <div class="row">${btn('Ẩn tìm kiếm nâng cao', { icon: 'chevron-up', variant: 'ghost', sm: true })}</div>
        </div>
        <div class="advsearch">
          <div class="advsearch__grid">
            ${field('Mã nhân viên', input('Nhập mã nhân viên', { placeholder: true }))}
            ${field('Họ và tên', input('Nhập họ và tên', { placeholder: true }))}
            ${field('Khối (cấp 4)', select('Khối 1 - TCT CNC'))}
            ${field('Đơn vị (cấp 5)', select('Trung tâm Chế tạo Điện tử Khí tài'))}
            ${field('Chức danh', select('Tất cả', { placeholder: true }))}
            ${field('Trạng thái', select('Đang làm việc'))}
          </div>
          <div class="advsearch__foot">${btn('Làm mới', { icon: 'refresh', variant: 'secondary' })}${btn('Tìm kiếm', { icon: 'search' })}</div>
        </div>
        ${table(
          [
            STT, THAOTAC, TRANGTHAI,
            { t: 'Mã NV', w: 'w-100' }, { t: 'Họ và tên', w: 'w-200' },
            { t: 'Chức danh', w: 'w-160' }, { t: 'Đơn vị (cấp 5)', w: 'w-240' },
            { t: 'Khối', w: 'w-120' }, { t: 'Email' },
          ],
          [
            r(1, '<span class="code-link">801234</span>', 'Trần Minh Quân', 'Kỹ sư chính', 'Trung tâm Chế tạo Điện tử Khí tài', 'Khối 1', 'quantm@viettel.com.vn'),
            r(2, '<span class="code-link">805512</span>', 'Lê Thị Hồng Nhung', 'Kỹ sư bậc 3', 'Trung tâm Chế tạo Điện tử Khí tài', 'Khối 1', 'nhunglth@viettel.com.vn'),
            r(3, '<span class="code-link">807781</span>', 'Phạm Văn Đức', 'Trợ lý dự án', 'Phòng Tổng hợp', 'Khối 1', 'ducpv@viettel.com.vn'),
            r(4, '<span class="code-link">803095</span>', 'Nguyễn Hoàng Anh', 'Kỹ sư bậc 1', 'Trung tâm Kinh doanh Điều hành', 'Khối 1', 'anhnh@viettel.com.vn'),
            r(5, '<span class="code-link">809442</span>', 'Vũ Thị Thu Hà', 'Chuyên viên Công nghệ', 'Trung tâm Camera', 'Khối 2', 'havtt@viettel.com.vn'),
            r(6, '<span class="code-link">802217</span>', 'Đỗ Quang Huy', 'Trưởng phòng ban', 'Trung tâm Quản lý Chất lượng', 'TT QLCL', 'huydq@viettel.com.vn'),
          ],
          { rowCls: (i) => (i === 2 ? 'tbl__row--hover' : '') },
        )}
        ${tableFoot(1179, { pages: [1, 2, 3, 4, '…', 48] })}
      </div>
    </div>`,
    opts,
  );

/* ------------------------------------------- 12B · Màn hình CHI TIẾT của một danh mục
 * `Book1` yêu cầu mỗi danh mục đủ năm chức năng: `Danh sách · CHI TIẾT · CRUD · Import · Export`.
 * Bộ dựng trước chỉ có danh sách + dialog thêm/sửa, thiếu hẳn màn chi tiết — dialog 520px không
 * chứa nổi phần "người này đang dính vào những nhiệm vụ nào".
 *
 * Đây là KHUÔN chi tiết dùng chung cho cả tám danh mục: đầu trang có nút quay lại → khối `desc`
 * thuộc tính → các bảng con "đang được dùng ở đâu". Nhân viên là ví dụ nặng nhất; bảy danh mục
 * còn lại là bản rút gọn của chính khuôn này, không cần vẽ thêm artboard. */
const chiTietNhanVien = () =>
  frame(
    'dm-nhan-vien',
    `<div class="page">
      <div class="breadcrumb">
        <span>Danh mục</span><span class="breadcrumb__sep">/</span>
        <span>Nhân viên</span><span class="breadcrumb__sep">/</span>
        <span class="strong">801234 — Trần Minh Quân</span>
      </div>
      ${pageHead(
        'Trần Minh Quân',
        'Mã NV 801234 · Kỹ sư chính · Trung tâm Chế tạo Điện tử Khí tài',
        `${btn('Xuất Excel', { icon: 'download', variant: 'secondary' })}${btn('Sửa', { icon: 'pencil', variant: 'secondary' })}${btn('Ngừng hoạt động', { icon: 'ban' })}`,
        true,
      )}

      <div class="card">
        <div class="card__head"><div class="card__title">Thông tin nhân viên</div>${tag('Đang làm việc', 'success')}</div>
        <div class="desc">
          <div class="desc__item"><div class="desc__label">Mã nhân viên</div><div class="desc__value">801234 <span class="caption">(khoá đối chiếu khi import BM0)</span></div></div>
          <div class="desc__item"><div class="desc__label">Họ và tên</div><div class="desc__value">Trần Minh Quân</div></div>
          <div class="desc__item"><div class="desc__label">Chức danh</div><div class="desc__value">Kỹ sư chính</div></div>
          <div class="desc__item"><div class="desc__label">Email công tác</div><div class="desc__value">quantm@viettel.com.vn</div></div>
          <div class="desc__item"><div class="desc__label">Đơn vị (cấp 5)</div><div class="desc__value">Trung tâm Chế tạo Điện tử Khí tài</div></div>
          <div class="desc__item"><div class="desc__label">Khối (cấp 4)</div><div class="desc__value">Khối 1 - TCT CNC</div></div>
          <div class="desc__item"><div class="desc__label">Ngày vào đơn vị</div><div class="desc__value">01/03/2019</div></div>
          <div class="desc__item"><div class="desc__label">Nguồn dữ liệu</div><div class="desc__value">Đồng bộ từ HRM/SAP <span class="caption">— sửa tay chỉ áp cho email</span></div></div>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <div class="card__title">Đang tham gia 3 nhiệm vụ</div>
          <div class="caption">Bảng này là lý do phải có màn chi tiết: nó trả lời "xoá nhân viên này thì hỏng cái gì".</div>
        </div>
        ${table(
          [
            { t: 'STT', w: 'w-56', cls: 'tbl__th--center' },
            { t: 'Mã nhiệm vụ', w: 'w-180' },
            { t: 'Tên nhiệm vụ' },
            { t: 'Vai trò', w: 'w-140' },
            { t: 'Nội dung công việc', w: 'w-220' },
            { t: 'Từ ngày', w: 'w-110', cls: 'tbl__th--center' },
            { t: 'Đến ngày', w: 'w-110', cls: 'tbl__th--center' },
          ],
          [
            [{ h: '1', cls: 'tbl__td--center' }, '<span class="code-link">011-24-TĐ-RDP-QS</span>', 'Nghiên cứu chế tạo khối thu phát cao tần', 'Thành viên', 'NDCV-01 Thiết kế khối cao tần', { h: '08/04/2025', cls: 'tbl__td--center' }, { h: '31/12/2026', cls: 'tbl__td--center' }],
            [{ h: '2', cls: 'tbl__td--center' }, '<span class="code-link">012-24-PAKD-CAM</span>', 'Phương án kinh doanh camera AI thế hệ 2', 'Thành viên', 'NDCV-12 Hiệu chỉnh dây chuyền', { h: '01/02/2025', cls: 'tbl__td--center' }, { h: '31/12/2025', cls: 'tbl__td--center' }],
            [{ h: '3', cls: 'tbl__td--center' }, '<span class="code-link">015-25-TĐ-RDP-QS</span>', 'Nghiên cứu vật liệu hấp thụ sóng', 'PA — Trợ lý nhiệm vụ', 'NDCV-04 Quản lý tiến độ, báo cáo', { h: '01/06/2025', cls: 'tbl__td--center' }, { h: '31/12/2027', cls: 'tbl__td--center' }],
          ],
        )}
      </div>

      <div class="card">
        <div class="card__head"><div class="card__title">Lịch sử công và CPNC phân bổ</div>${select('6 tháng gần nhất')}</div>
        ${table(
          [
            { t: 'Kỳ', w: 'w-110' },
            { t: 'Công chế độ', w: 'w-140', cls: 'tbl__th--num' },
            { t: 'Công tính lương', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Công phân bổ', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Tỷ lệ phân bổ', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'CPNC phân bổ (₫)', cls: 'tbl__th--num' },
          ],
          [
            ['12/2024', { h: '22,0', cls: 'tbl__td--num' }, { h: '22,0', cls: 'tbl__td--num' }, { h: '22,0', cls: 'tbl__td--num' }, { h: '100,0%', cls: 'tbl__td--num' }, { h: money(35410000), cls: 'tbl__td--num' }],
            ['01/2025', { h: '20,0', cls: 'tbl__td--num' }, { h: '20,0', cls: 'tbl__td--num' }, { h: '18,0', cls: 'tbl__td--num' }, { h: '90,0%', cls: 'tbl__td--num' }, { h: money(31869000), cls: 'tbl__td--num' }],
            ['02/2025', { h: '18,0', cls: 'tbl__td--num' }, { h: '18,0', cls: 'tbl__td--num' }, { h: '18,0', cls: 'tbl__td--num' }, { h: '100,0%', cls: 'tbl__td--num' }, { h: money(35410000), cls: 'tbl__td--num' }],
            ['03/2025', { h: '21,0', cls: 'tbl__td--num' }, { h: '21,0', cls: 'tbl__td--num' }, { h: '21,0', cls: 'tbl__td--num' }, { h: '100,0%', cls: 'tbl__td--num' }, { h: money(35410000), cls: 'tbl__td--num' }],
            ['04/2025', { h: '20,0', cls: 'tbl__td--num' }, { h: '20,0', cls: 'tbl__td--num' }, { h: '20,0', cls: 'tbl__td--num' }, { h: '100,0%', cls: 'tbl__td--num' }, { h: money(35410000), cls: 'tbl__td--num' }],
            [{ h: '<strong>05/2025</strong>' }, { h: '20,0', cls: 'tbl__td--num' }, { h: '<strong>21,0</strong>', cls: 'tbl__td--num' }, { h: '21,0', cls: 'tbl__td--num' }, { h: '100,0%', cls: 'tbl__td--num' }, { h: money(35410000), cls: 'tbl__td--num' }],
          ],
          { rowCls: (i) => (i === 5 ? 'tbl__row--selected' : '') },
        )}
        <div class="alert">${ico('info', 18)}
          <div class="alert__body"><div class="alert__title">Kỳ 05/2025: công tính lương 21,0 &gt; công chế độ 20,0</div>
          <div>Đây là dữ liệu <strong>đúng</strong>, không phải lỗi nhập: HRM có điều chỉnh tay nên hai số lệch nhau là bình thường. Tỷ lệ phân bổ lấy mẫu số là <strong>công tính lương</strong>, không phải công chế độ.</div></div>
        </div>
      </div>
    </div>`,
  ) +
  note('Màn chi tiết danh mục — khuôn dùng chung cho cả tám danh mục', [
    'Khách yêu cầu <strong>mỗi danh mục đủ 5 chức năng</strong>: <code>Danh sách · Chi tiết · CRUD · Import · Export</code> (Book1, module Danh mục). Dialog thêm/sửa 520px ở artboard 18 phủ được CRUD, <strong>không</strong> phủ được Chi tiết.',
    'Phần bắt buộc của mọi màn chi tiết là bảng <strong>"đang được dùng ở đâu"</strong>. Không có nó thì người dùng bấm Xoá mà không biết mình phá cái gì — và với danh mục Nhân viên thì xoá nhầm là hỏng cả bảng chấm công của kỳ.',
    'Bảy danh mục còn lại dùng đúng khuôn này, chỉ đổi khối <code>desc</code> và các bảng con: Đơn vị → đơn vị con + nhân sự; Nguồn kinh phí → nhiệm vụ đang dùng nguồn; Ký hiệu công → số ô đang mang ký hiệu đó. <strong>Không cần vẽ thêm bảy artboard</strong> — trong Figma là một component đổi nội dung.',
    'Nút phá huỷ ở đây là <strong>Ngừng hoạt động</strong>, không phải Xoá: master data đã đi vào bảng công kỳ trước thì không được xoá cứng, nếu không số báo cáo cũ đổi sau lưng người đã ký.',
  ]);

/* --------------------------------------------------- 18 · Dialog thêm / sửa */
const dialogThemSua = () =>
  nhanVien({
    overlay: `<div class="dialog dialog--form">
        <div class="dialog__head"><div class="dialog__title">Thêm mới nhân viên</div>${ico('x', 18)}</div>
        <div class="dialog__body">
          ${field('Mã nhân viên', input('Nhập mã nhân viên trên HRM', { placeholder: true }), { required: true, help: 'Trùng mã với hệ thống HRM/SAP — đây là khoá đối chiếu khi import BM0.' })}
          ${field('Họ và tên', input('Nhập họ và tên', { placeholder: true }), { required: true })}
          ${field('Chức danh', select('Chọn chức danh', { placeholder: true, w: '' }), { required: true })}
          ${field('Khối (cấp 4)', select('Chọn khối', { placeholder: true, w: '' }), { required: true })}
          ${field('Đơn vị (cấp 5)', select('Chọn đơn vị chấm công', { placeholder: true, w: '' }), { required: true })}
          ${field('Email', input('Nhập email công tác', { placeholder: true }))}
          <div class="choice"><div class="switch switch--on"><div class="switch__knob"></div></div><span>Đang làm việc</span></div>
        </div>
        <div class="dialog__foot">${btn('Huỷ', { variant: 'secondary' })}${btn('Lưu', { icon: 'check' })}</div>
    </div>`,
  }) +
  note('Quy cách dialog', [
    'Hộp thoại NỔI TRÊN màn nền đã làm mờ (đen 45%) chứ không phải artboard rời — để duyệt được cả trạng thái của màn bên dưới.',
    'Rộng <strong>520px</strong> cho form thêm/sửa · <strong>400px</strong> cho hộp xác nhận · <strong>900px</strong> cho preview import · <strong>1360px</strong> cho pop-up chọn dữ liệu có bảng.',
    'Nhãn bắt buộc có dấu <span style="color:#EE0033">*</span> đỏ. Nút <em>Huỷ</em> (viền) đứng trước nút chính đỏ, cả hai căn phải ở đáy.',
    'Header cao 60px, có đường kẻ dưới tiêu đề và nút ✕ bên phải.',
  ]);

/* ------------------------------ 18B · Toast kết quả thao tác (không có hộp thoại) */
const toastLuu = () =>
  nhanVien({
    toasts:
      toast('success', 'Đã lưu nhân viên', 'Mã NV <strong>810993</strong> — Nguyễn Văn Tú đã thêm vào danh mục.') +
      toast('warn', 'Có 1 cảnh báo', 'Nhân viên chưa có email công tác nên sẽ không nhận được thông báo qua email.'),
  }) +
  note('Toast — vị trí và luật đọc', [
    'Góc phải trên: cách mép phải 24px, cách đáy topbar 16px (top 76px). Rộng 400px, xếp chồng dọc cách nhau 12px, toast mới nhất ở TRÊN.',
    'Bốn mức: <strong>success</strong> xanh lá · <strong>info</strong> xanh dương · <strong>warn</strong> cam · <strong>error</strong> đỏ. Xem đủ bốn ở artboard <strong>02</strong>.',
    'Toast lỗi dùng ramp brand vì brand ≡ danger trong design system này ⇒ nhãn BẮT BUỘC có chữ "Lỗi"/"Thất bại"; chỉ nhìn màu thì không phân biệt được với toast thương hiệu.',
    'Toast nổi TRÊN cả lớp mờ của hộp thoại — kết quả thao tác phải đọc được kể cả khi dialog đang mở.',
  ]);

/* --------------------------------------- 19 · Dialog import + preview lỗi/cảnh báo */
const importPreview = () =>
  nhanVien({
    overlay: `<div class="dialog dialog--wide">
        <div class="dialog__head"><div class="dialog__title">Nhập danh mục Nhân viên từ Excel</div>${ico('x', 18)}</div>
        <div class="dialog__body">
          <div class="row" style="gap:12px;align-items:center">
            ${ico('file', 20)}
            <div class="col" style="gap:0">
              <div class="strong">DS_nhan_vien_T05_2025.xlsx</div>
              <div class="caption">1.179 dòng · 218 KB · tải lên 14:22</div>
            </div>
            <div class="spacer"></div>
            ${btn('Chọn file khác', { icon: 'upload', variant: 'secondary', sm: true })}
          </div>

          <div class="row" style="gap:12px">
            <div class="stat stat--ok"><small>Hợp lệ — sẽ nhập</small><strong>1.164 dòng</strong></div>
            <div class="stat stat--warn"><small>Lỗi chặn — không nhập</small><strong>9 dòng</strong></div>
            <div class="stat"><small>Cảnh báo — vẫn nhập</small><strong>6 dòng</strong></div>
          </div>

          <div class="alert alert--warn">${ico('alert', 18)}
            <div class="alert__body"><div class="alert__title">Hai loại vấn đề, xử lý khác nhau</div>
            <div><strong>Lỗi chặn</strong> làm dòng đó bị bỏ qua hoàn toàn. <strong>Cảnh báo</strong> vẫn nhập nhưng ghi lại để rà sau — ví dụ ký hiệu công lạ sẽ vào danh mục "chờ khai báo".</div></div>
          </div>

          ${table(
            [
              { t: 'Dòng', w: 'w-80', cls: 'tbl__th--center' },
              { t: 'Mức', w: 'w-140', cls: 'tbl__th--center' },
              { t: 'Mã NV', w: 'w-110' },
              { t: 'Họ và tên', w: 'w-200' },
              { t: 'Vấn đề' },
              { t: 'Xử lý', w: 'w-160' },
            ],
            [
              [{ h: '17', cls: 'tbl__td--center' }, { h: tag('Lỗi chặn', 'danger'), cls: 'tbl__td--center' }, '810993', 'Nguyễn Văn Tú', 'Mã NV không có trong danh mục Nhân viên', '<span class="code-link">Thêm vào danh mục</span>'],
              [{ h: '43', cls: 'tbl__td--center' }, { h: tag('Lỗi chặn', 'danger'), cls: 'tbl__td--center' }, '806120', 'Trần Thị Mai', 'Đơn vị cấp 5 "TT CNTT" không khớp cây đơn vị', '<span class="code-link">Đối chiếu cây</span>'],
              [{ h: '58', cls: 'tbl__td--center' }, { h: tag('Lỗi chặn', 'danger'), cls: 'tbl__td--center' }, '—', 'Lê Quốc Bảo', 'Thiếu mã nhân viên', '—'],
              [{ h: '112', cls: 'tbl__td--center' }, { h: tag('Cảnh báo', 'warning'), cls: 'tbl__td--center' }, '804471', 'Hoàng Minh Sơn', 'Ký hiệu công lạ <code>NB</code> — ngoài danh mục Ký hiệu công', 'Ghi "chờ khai báo"'],
              [{ h: '206', cls: 'tbl__td--center' }, { h: tag('Cảnh báo', 'warning'), cls: 'tbl__td--center' }, '801234', 'Trần Minh Quân', 'Công tính lương (21,0) ≠ tổng ô trong tháng (20,5)', 'Vẫn nhập, ghi log'],
            ],
          )}
          <div class="caption">Hiển thị 5/15 dòng có vấn đề · <span class="code-link">Tải file lỗi chi tiết (.xlsx)</span></div>
        </div>
        <div class="dialog__foot">
          <div class="spacer caption">Kỳ <strong>05/2025</strong> đã có dữ liệu — nhập lại sẽ <strong>ĐÈ CẢ KỲ</strong>, không merge từng dòng.</div>
          ${btn('Huỷ', { variant: 'secondary' })}${btn('Nhập 1.164 dòng hợp lệ', { icon: 'check' })}
      </div>
    </div>`,
  }) +
      note('Luật validate — hai bộ, đừng trộn', [
        'Bộ này là cho <strong>BM0 / danh mục</strong>: mã NV lạ ⇒ chặn · đơn vị không khớp cây ⇒ chặn · ký hiệu công lạ ⇒ cảnh báo cho qua · công tính lương lệch tổng ô ⇒ cảnh báo · kỳ đã khoá ⇒ chặn.',
        'Bộ cho <strong>PhanBoCong</strong> KHÁC HẲN: người không thuộc nội dung CV · nhiệm vụ không ở trạng thái "Đang phân bổ" · trùng (người, ngày) · vượt công tính lương của kỳ.',
        'Đây là màn dùng chung <code>shared/hr/import-preview/</code> — việc đầu tiên của đợt 2 là tách nó ra khỏi <code>pages/hr-nhan-su-list</code>, trước khi chép sang màn thứ hai.',
      ]);

module.exports = [
  { code: '10', group: '1.5 · Danh mục', title: 'Danh mục Đơn vị', desc: 'Cây 5 cấp + chi tiết đơn vị', body: donVi },
  { code: '12', group: '1.5 · Danh mục', title: 'Danh mục Nhân viên', desc: 'Có khối tìm kiếm nâng cao 3 cột', body: nhanVien },
  { code: '12B', group: '1.5 · Danh mục', title: 'Chi tiết danh mục — khuôn dùng chung', desc: 'Màn chi tiết mà Book1 yêu cầu; ví dụ trên danh mục Nhân viên', body: chiTietNhanVien },
  ...FLAT.map((d) => ({
    code: d.code,
    group: '1.5 · Danh mục',
    title: d.title,
    desc: d.desc.slice(0, 70) + '…',
    body: () =>
      danhSach({
        nav: d.nav, title: d.title, desc: d.desc, cols: d.cols, total: d.total,
        filters: d.filters,
        rows: d.rows.map((row, i) => r(i + 1, ...row)),
      }),
  })),
  { code: '18', group: '1.5 · Danh mục', title: 'Dialog thêm sửa danh mục', desc: 'Form 520px', body: dialogThemSua },
  { code: '18B', group: '1.5 · Danh mục', title: 'Toast kết quả thao tác', desc: 'Toast nổi trên màn, góc phải trên', body: toastLuu },
  { code: '19', group: '1.5 · Danh mục', title: 'Dialog import và preview lỗi', desc: 'Phân biệt lỗi chặn vs cảnh báo', body: importPreview },
];
