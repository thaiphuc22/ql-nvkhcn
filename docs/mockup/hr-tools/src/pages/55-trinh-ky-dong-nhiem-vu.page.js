/* =============================================================================
 * Tab 4 "Trình ký" và bước "Đóng đề tài dự án" — hai mảng tài liệu khách mô tả rõ mà bộ dựng
 * 2026-08-26 bỏ trắng hoàn toàn. Rà lại 2026-08-27.
 *
 *   60 · Tab Trình ký (HR)            — `dac-ta-man-hinh.md` §4: màn RIÊNG, chỉ tài khoản HR thấy,
 *        chọn Tháng/Năm, **bốn nhóm nút**. Bộ cũ chỉ có modal VOffice nổi trên màn chấm công
 *        (artboard 2B) — đó là một nút, không phải cái tab.
 *   61 · Trình ký danh sách nhân sự   — `MotaCV` §I.2: *"DS nhân sự sau khi lập/điều chỉnh có nút
 *        trình ký xác nhận qua VOffice"*. Gói ký này chạy theo VÒNG ĐỜI NHIỆM VỤ, không theo tháng.
 *   62 · Đóng nhiệm vụ                — `MotaCV` §III: lập bảng tổng hợp CPNC theo biểu mẫu và
 *        trình ký **BM.05**, do PA thực hiện.
 *   63 · BM.05 bản in                 — *Bảng tổng hợp chi phí nhân công theo nội dung công việc*.
 *
 * ⚠ **BM.05 ≠ BM5.** BM.05 là biểu mẫu pháp lý của QĐ 3021 dùng ở bước đóng nhiệm vụ (artboard 63);
 * `BM5.DS Nhiem vu` là biểu mẫu quản trị nội bộ không mang mã BM.xx (artboard 37). Hai văn bản khác
 * hẳn nhau dù cùng đọc là "BM năm" — bẫy này đã làm hỏng artboard 37 một lần.
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, frame, pageHead, btn, select, search, field, tag, table, tableFoot, note, money, dauVanBan, tieuDe, vungKy, giayIn } = U;

const STT = { t: 'STT', w: 'w-56', cls: 'tbl__th--center' };

/* ==================================================== 60 · Tab Trình ký (HR) */
/* Bốn nhóm nút, đúng bảng §4 của đặc tả. `tanSuat` là cột "Tần suất" trong bảng gốc. */
const NHOM_NUT = [
  {
    icon: 'upload', ten: 'IMPORT', mau: '',
    gom: ['0. Bảng lương tháng', '0. Bảng công tháng', '5. Danh sách nhiệm vụ'],
    tanSuat: 'Hai cái đầu nhập hàng tháng · DS nhiệm vụ nhập khi có nhiệm vụ mới',
    trangThai: ['Bảng công 05/2025', 'ok'],
  },
  {
    icon: 'download', ten: 'XUẤT EXCEL', mau: '',
    gom: ['3. Bảng tổng hợp phân bổ', '4. Bảng TH phân bổ CPNC'],
    tanSuat: 'Xuất để đối soát trước khi trình ký',
    trangThai: ['Đã xuất 14:02 hôm nay', 'ok'],
  },
  {
    icon: 'send', ten: 'TRÌNH KÝ VO THEO NHIỆM VỤ', mau: '',
    gom: ['1. Danh sách nhân sự', '2.1 & 2.2 Bảng công', '3.1 & 3.2 Bảng lương'],
    tanSuat: 'Mỗi nhiệm vụ một gói — 12 nhiệm vụ đủ điều kiện trong kỳ này',
    trangThai: ['5/12 nhiệm vụ đã ký', 'wait'],
  },
  {
    icon: 'send', ten: 'TRÌNH KÝ VO BẢNG TỔNG HỢP', mau: '',
    gom: ['4. Bảng TH phân bổ CPNC (toàn kỳ)'],
    tanSuat: 'Một gói cho cả kỳ — chỉ bấm được khi mọi nhiệm vụ đã ký xong',
    trangThai: ['Chờ 7 nhiệm vụ còn lại', 'block'],
  },
];
const TT_NHOM = {
  ok: tag('Xong', 'success'),
  wait: tag('Đang chạy', 'warning'),
  block: tag('Chưa mở', 'danger'),
};

const GOI_KY = [
  ['011-24-TĐ-RDP-QS', 'Nghiên cứu chế tạo khối thu phát cao tần', 'Trung tâm CHĐK', 'Theo nhiệm vụ', 'ky', '412/TTr-CNC'],
  ['012-24-PAKD-CAM', 'Phương án kinh doanh camera AI thế hệ 2', 'Trung tâm Camera', 'Theo nhiệm vụ', 'ky', '413/TTr-CNC'],
  ['013-25-TĐ-DTPT', 'Đầu tư phát triển dây chuyền SMT', 'Trung tâm CĐT', 'Theo nhiệm vụ', 'cho', '—'],
  ['015-25-TĐ-RDP-QS', 'Nghiên cứu vật liệu hấp thụ sóng', 'Trung tâm CHĐK', 'Theo nhiệm vụ', 'chua', '—'],
  ['014-24-BH-RAD', 'Bảo hành đài radar cảnh giới', 'Trung tâm ĐBCL', 'Theo nhiệm vụ', 'loi', '—'],
];
const TT_GOI = {
  ky: tag('Đã ký', 'success'),
  cho: tag('Chờ lãnh đạo ký', 'warning'),
  chua: tag('Chưa trình ký', ''),
  loi: tag('Trình ký thất bại', 'danger'),
};

const tabTrinhKy = () =>
  frame(
    'trinh-ky-thang',
    `<div class="page">
      ${pageHead('Trình ký', 'Tab 4 trong đặc tả màn hình của khách — chỉ tài khoản HR thấy. Bốn nhóm nút dưới đây là nguyên văn bảng §4, không phải cách gom do người dựng tự nghĩ.', `${btn('Nhật ký trình ký', { icon: 'history', variant: 'secondary' })}`)}

      <div class="card">
        <div class="row row--wrap" style="gap:12px;align-items:flex-end">
          <div style="flex:0 0 200px">${field('Kỳ', select('Tháng 05/2025'), { required: true })}</div>
          <div style="flex:0 0 240px">${field('Khối (cấp 4)', select('Tất cả khối'), {})}</div>
          <div class="spacer"></div>
          <div class="row">${tag('Kỳ 05/2025 đã khoá — số liệu không đổi nữa', 'info')}</div>
        </div>
      </div>

      <div class="row" style="gap:20px;align-items:stretch">
        ${NHOM_NUT.map(
          (n) => `<div class="card" style="flex:1 1 0">
            <div class="card__head">
              <div class="row" style="gap:8px">${ico(n.icon, 18)}<div class="card__title">${n.ten}</div></div>
            </div>
            <div class="col" style="gap:6px">
              ${n.gom.map((g) => `<div class="row" style="gap:8px">${ico('file', 14)}<span class="caption">${g}</span></div>`).join('')}
            </div>
            <div class="caption">${n.tanSuat}</div>
            <div class="spacer"></div>
            <div class="row row--between" style="align-items:center">
              ${TT_NHOM[n.trangThai[1]]}
              <span class="caption">${n.trangThai[0]}</span>
            </div>
            ${btn(n.ten.startsWith('IMPORT') ? 'Chọn tệp' : n.ten.startsWith('XUẤT') ? 'Xuất Excel' : 'Trình ký', {
              icon: n.icon,
              variant: n.trangThai[1] === 'block' ? 'disabled' : '',
            })}
          </div>`,
        ).join('')}
      </div>

      <div class="card">
        <div class="card__head">
          <div class="card__title">Gói trình ký theo nhiệm vụ — kỳ 05/2025</div>
          <div class="row">${select('Tất cả trạng thái', { placeholder: true })}${search('Tìm theo mã hoặc tên nhiệm vụ')}</div>
        </div>
        ${table(
          [
            STT,
            { t: 'Thao tác', w: 'w-140' },
            { t: 'Mã nhiệm vụ', w: 'w-180' },
            { t: 'Tên nhiệm vụ' },
            { t: 'Đơn vị chủ trì', w: 'w-160' },
            { t: 'Gói', w: 'w-180' },
            { t: 'Trạng thái ký', w: 'w-160', cls: 'tbl__th--center' },
          ],
          GOI_KY.map((g, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            g[4] === 'ky'
              ? `<div class="actions">${btn('Xem VB', { icon: 'eye', variant: 'secondary', sm: true })}</div>`
              : g[4] === 'loi'
                ? `<div class="actions">${btn('Thử lại', { icon: 'refresh', variant: 'secondary', sm: true })}</div>`
                : `<div class="actions">${btn('Trình ký', { icon: 'send', variant: 'secondary', sm: true })}</div>`,
            `<span class="code-link">${g[0]}</span>`,
            g[1],
            g[2],
            `<div class="col" style="gap:2px"><span>${g[3]}</span><span class="caption">BM1 + BM2.1 + BM3.1</span></div>`,
            {
              h: `<div class="col" style="gap:4px;align-items:center">${TT_GOI[g[4]]}${g[5] !== '—' ? `<span class="caption">${g[5]}</span>` : ''}</div>`,
              cls: 'tbl__td--center',
            },
          ]),
          { rowCls: (i) => (GOI_KY[i][4] === 'loi' ? 'tbl__row--warn' : '') },
        )}
        ${tableFoot(12, { pages: [1] })}
      </div>
    </div>`,
  ) +
  note('Tab Trình ký — bốn điều tài liệu nói rõ mà dễ dựng sai', [
    '<strong>Đây là màn riêng, không phải nút trên màn chấm công.</strong> Đặc tả xếp nó ngang hàng với ba tab kia. Lý do nghiệp vụ: HR trình ký cho <em>nhiều</em> nhiệm vụ trong một kỳ, không thể bắt mở từng màn chấm công một.',
    '<strong>Hai gói ký khác nhau, đừng gộp.</strong> "Theo nhiệm vụ" gồm BM1 + BM2.1/2.2 + BM3.1/3.2 và chạy mỗi nhiệm vụ một lần. "Bảng tổng hợp" chỉ có BM4 và chạy một lần cho cả kỳ — <strong>chỉ mở sau khi mọi gói nhiệm vụ đã ký xong</strong>, nên nút thứ tư ở trạng thái chưa mở là đúng, không phải lỗi hiển thị.',
    '<strong>IMPORT nằm trong tab này</strong> theo đúng bảng §4 — dù nút import cũng có ở màn chấm công và màn bảng công. Cùng một hành động, ba lối vào; phải là một component <code>shared/hr/import-preview/</code>, không phải ba bản chép.',
    'Nhánh <strong>thất bại</strong> (dòng cuối) phải hiện ngay trong bảng với nút <em>Thử lại</em>. Chi tiết lỗi và toast xem artboard 2B2 — VOffice là hệ ngoài, mock bắt buộc có nhánh trả lỗi.',
    '<strong>Câu hỏi Q3 chưa chốt:</strong> VOffice đã có tài liệu API thật chưa. Toàn bộ nhóm này đang dựng trên adapter mock.',
  ]);

/* ======================================= 61 · Trình ký danh sách nhân sự (BM1) */
const NS_KY = [
  ['801234', 'Trần Minh Quân', 'Kỹ sư chính', 'Thành viên', 'NDCV-01 Thiết kế khối cao tần', '08/04/2025', '31/12/2026'],
  ['805512', 'Lê Thị Hồng Nhung', 'Kỹ sư bậc 3', 'Thành viên', 'NDCV-02 Lập trình firmware', '08/04/2025', '31/12/2026'],
  ['807781', 'Phạm Văn Đức', 'Trợ lý dự án', 'PA — Trợ lý nhiệm vụ', 'NDCV-04 Quản lý tiến độ', '08/04/2025', '31/12/2026'],
  ['803095', 'Nguyễn Hoàng Anh', 'Kỹ sư bậc 1', 'Thành viên', 'NDCV-01 Thiết kế khối cao tần', '01/06/2025', '31/12/2026'],
  ['809442', 'Vũ Thị Thu Hà', 'Chuyên viên Công nghệ', 'Thành viên', 'NDCV-03 Kiểm thử tích hợp', '08/04/2025', '30/09/2026'],
  ['802217', 'Đỗ Quang Huy', 'Trưởng phòng ban', 'PM — Chủ nhiệm nhiệm vụ', 'NDCV-01, 02, 03, 04', '08/04/2025', '31/12/2026'],
];

const LICH_SU_KY = [
  ['Lập lần đầu · 5 nhân sự', '08/04/2025 · Phạm Văn Đức (PA)', 'Trình ký VOffice số 118/TTr-CNC — đã ký 11/04/2025'],
  ['Điều chỉnh lần 1 · thêm Nguyễn Hoàng Anh', '01/06/2025 · Phạm Văn Đức (PA)', 'Trình ký VOffice số 267/TTr-CNC — đã ký 04/06/2025'],
  ['Điều chỉnh lần 2 · đổi nội dung CV của Vũ Thị Thu Hà', '12/08/2025 · Phạm Văn Đức (PA)', 'CHƯA trình ký — danh sách đang lệch bản đã ký'],
];

const trinhKyNhanSu = () =>
  frame(
    'ds-nhan-su',
    `<div class="page">
      ${pageHead('Danh sách nhân sự — trình ký xác nhận', 'MotaCV §I.2 — danh sách nhân sự sau khi lập hoặc điều chỉnh phải có nút trình ký xác nhận qua VOffice. Gói ký này chạy theo VÒNG ĐỜI NHIỆM VỤ, không theo tháng như gói ở artboard 60.', `${btn('Xuất BM.06', { icon: 'printer', variant: 'secondary' })}${btn('Trình ký VOffice', { icon: 'send' })}`)}

      <div class="card">
        <div class="row row--wrap" style="gap:12px;align-items:center">
          <div class="col" style="gap:2px">
            <div class="strong">011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần</div>
            <div class="caption">Trung tâm Chế tạo Điện tử Khí tài · Khối 1 - TCT CNC · PM Đỗ Quang Huy · PA Phạm Văn Đức</div>
          </div>
          <div class="spacer"></div>
          ${tag('Danh sách lệch bản đã ký', 'warning')}
        </div>
      </div>

      <div class="card">
        <div class="alert alert--warn">${ico('alert', 18)}
          <div class="alert__body"><div class="alert__title">Có 1 điều chỉnh chưa trình ký (12/08/2025)</div>
          <div>Bản ký gần nhất là <strong>267/TTr-CNC</strong> ngày 04/06/2025. Từ đó tới nay danh sách đã đổi 1 lần. Chấm công vẫn chạy bình thường — nhưng <strong>không đóng được nhiệm vụ</strong> khi còn điều chỉnh chưa ký (artboard 62).</div></div>
        </div>

        ${table(
          [
            STT,
            { t: 'Mã NV', w: 'w-90' },
            { t: 'Họ và tên' },
            { t: 'Chức danh', w: 'w-140' },
            { t: 'Vai trò tham gia', w: 'w-180' },
            { t: 'Nội dung công việc', w: 'w-200' },
            { t: 'Từ ngày', w: 'w-110', cls: 'tbl__th--center' },
            { t: 'Đến ngày', w: 'w-110', cls: 'tbl__th--center' },
          ],
          NS_KY.map((p, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            `<span class="code-link">${p[0]}</span>`,
            p[1],
            p[2],
            p[3],
            p[4],
            { h: p[5], cls: 'tbl__td--center' },
            { h: p[6], cls: 'tbl__td--center' },
          ]),
          { rowCls: (i) => (i === 4 ? 'tbl__row--warn' : '') },
        )}
        <div class="caption">Dòng tô cảnh báo là dòng đã đổi so với bản ký 267/TTr-CNC.</div>
      </div>

      <div class="card">
        <div class="card__head"><div class="card__title">Lịch sử lập và trình ký danh sách</div></div>
        <div class="tline">
          ${LICH_SU_KY.map(
            (l, i) => `<div class="tline__item">
              <div class="tline__rail"><div class="tline__dot"></div>${i < LICH_SU_KY.length - 1 ? '<div class="tline__bar"></div>' : ''}</div>
              <div class="tline__body">
                <div class="strong">${l[0]}</div>
                <div class="caption">${l[1]}</div>
                <div class="${i === LICH_SU_KY.length - 1 ? 'strong' : 'caption'}">${l[2]}</div>
              </div>
            </div>`,
          ).join('')}
        </div>
      </div>
    </div>`,
  ) +
  note('Trình ký DS nhân sự — vì sao KHÔNG dùng lại gói ký theo tháng', [
    '<strong>Khác nhịp.</strong> Gói theo tháng (artboard 60) chạy mỗi kỳ một lần cho cả BM1 + BM2 + BM3. Gói này chạy <em>mỗi lần danh sách nhân sự đổi</em> — có thể ba tháng không chạy lần nào, cũng có thể hai lần trong một tháng.',
    '<strong>Khác nội dung.</strong> Gói này chỉ có BM.06 (danh sách nhân sự), không kèm bảng công và bảng lương. Nó xác nhận <em>ai được tham gia nhiệm vụ</em>, chưa nói gì tới tiền.',
    '<strong>Khác người ký.</strong> MotaCV §I.2 giao cho PM và PA lập; gói theo tháng thì HR trình. Đây là hai luồng ký khác nhau đi qua cùng một adapter VOffice.',
    'Khối <strong>lịch sử</strong> là phần bắt buộc, không phải trang trí: nghiệp vụ cần trả lời "bản ký nào đang có hiệu lực, và từ đó tới nay đã đổi gì". Không có nó thì cột "lệch bản đã ký" không có căn cứ.',
    'Trạng thái <em>lệch bản đã ký</em> <strong>không chặn chấm công</strong> — chặn là làm tê liệt việc chấm công hàng tháng chỉ vì một thủ tục giấy tờ. Nó chỉ chặn ở bước đóng nhiệm vụ.',
  ]);

/* ================================================== 62 · Đóng nhiệm vụ */
const DIEU_KIEN = [
  ['Mọi kỳ chấm công đã khoá', 'ok', '14/14 kỳ từ 04/2025 đến 05/2026 đã khoá', '—'],
  ['Không còn bản chấm chờ xác nhận', 'ok', 'Kỳ cuối 05/2026: PA/PM chủ trì đã xác nhận', '—'],
  ['Hồ sơ đính kèm đủ bản ký', 'loi', 'Thiếu bản ký điều chỉnh nhân sự lần 2 (01/06/2025)', 'Mở hồ sơ đính kèm'],
  ['Danh sách nhân sự khớp bản đã ký', 'loi', 'Điều chỉnh 12/08/2025 chưa trình ký VOffice', 'Trình ký DS nhân sự'],
  ['CPNC đã phân bổ nằm trong dự toán', 'canh', 'Đã phân bổ 1.902.400.000 ₫ / được duyệt 1.850.000.000 ₫ — vượt 52.400.000 ₫', 'Xem BM.05'],
  ['Bảng tổng hợp BM.05 đã lập', 'cho', 'Sẽ sinh tự động khi bấm nút bên dưới', '—'],
];
const TT_DK = {
  ok: tag('Đạt', 'success'),
  loi: tag('Chưa đạt — chặn', 'danger'),
  canh: tag('Cảnh báo — không chặn', 'warning'),
  cho: tag('Chờ thực hiện', 'info'),
};

const dongNhiemVu = () =>
  frame(
    'dong-nhiem-vu',
    `<div class="page">
      ${pageHead('Đóng nhiệm vụ', 'MotaCV §III — bước cuối vòng đời: lập bảng tổng hợp CPNC theo nội dung công việc và trình ký BM.05. Do PA thực hiện. Đóng xong thì nhiệm vụ sang trạng thái "Đã đóng", không quay lại được.', `${btn('Xem BM.05', { icon: 'printer', variant: 'secondary' })}`)}

      <div class="card">
        <div class="row row--wrap" style="gap:12px;align-items:center">
          <div class="col" style="gap:2px">
            <div class="strong">011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần</div>
            <div class="caption">Thời gian 08/04/2025 – 31/12/2026 · Đề tài KHCN · PA Phạm Văn Đức</div>
          </div>
          <div class="spacer"></div>
          ${tag('Đang phân bổ', 'success')}
        </div>
        <div class="stats">
          <div class="stat"><small>CPNC được phê duyệt</small><strong>1.850.000.000 ₫</strong></div>
          <div class="stat stat--warn"><small>CPNC đã phân bổ</small><strong>1.902.400.000 ₫</strong></div>
          <div class="stat"><small>Số kỳ đã chấm công</small><strong>14 kỳ</strong></div>
          <div class="stat"><small>Nhân sự đã tham gia</small><strong>23 người</strong></div>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <div class="card__title">Điều kiện đóng nhiệm vụ</div>
          <div class="caption">2 điều kiện chưa đạt · 1 cảnh báo không chặn</div>
        </div>
        ${table(
          [
            STT,
            { t: 'Điều kiện' },
            { t: 'Trạng thái', w: 'w-200', cls: 'tbl__th--center' },
            { t: 'Chi tiết', w: 'w-320' },
            { t: 'Xử lý', w: 'w-180' },
          ],
          DIEU_KIEN.map((d, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            d[0],
            { h: TT_DK[d[1]], cls: 'tbl__td--center' },
            d[2],
            d[3] === '—' ? '<span class="muted">—</span>' : `<span class="code-link">${d[3]}</span>`,
          ]),
          { rowCls: (i) => (DIEU_KIEN[i][1] === 'loi' ? 'tbl__row--warn' : '') },
        )}

        <div class="alert alert--warn">${ico('alert', 18)}
          <div class="alert__body"><div class="alert__title">Chưa đóng được — còn 2 điều kiện chặn</div>
          <div>Cả hai đều là <strong>thủ tục giấy tờ chưa hoàn tất</strong>, không phải sai số liệu. Xử lý xong hai dòng đỏ thì nút dưới đây mở. Riêng dòng vượt dự toán chỉ cảnh báo: nghiệp vụ chấp nhận đóng nhiệm vụ vượt CPNC, miễn là con số hiện đúng trên BM.05 để cấp trên nhìn thấy khi ký.</div></div>
        </div>

        <div class="row row--between" style="align-items:center">
          <div class="caption">Đóng nhiệm vụ sẽ: sinh BM.05 → trình ký VOffice → chuyển trạng thái sang <strong>Đã đóng</strong> → khoá vĩnh viễn mọi thao tác chấm công.</div>
          <div class="row">${btn('Huỷ', { variant: 'secondary' })}${btn('Lập BM.05 và trình ký', { icon: 'send', variant: 'disabled' })}</div>
        </div>
      </div>
    </div>`,
  ) +
  note('Đóng nhiệm vụ — chức năng chưa có trong bất kỳ kế hoạch nào trước 2026-08-27', [
    '<strong>Nguồn duy nhất là <code>MotaCV</code> §III</strong> (file mô tả phần mềm 23/06/2025): <em>"Lập bảng tổng hợp CPNC theo biểu mẫu — trình ký VOffice BM.05, do PA thực hiện."</em> <code>Book1</code> không có, đặc tả màn hình mới không có, kế hoạch thi công không có. Bản trích xuất đã đánh dấu là <strong>cần hỏi khách còn trong phạm vi không</strong> — artboard này là bản đề xuất để hỏi, không phải phạm vi đã chốt.',
    '<strong>Danh sách điều kiện là phần cần khách duyệt nhất.</strong> Sáu dòng ở đây suy ra từ các ràng buộc rải rác trong tài liệu, không phải khách liệt kê. Cụ thể cần hỏi: vượt dự toán thì <em>cảnh báo</em> hay <em>chặn</em>? Ai được bấm — chỉ PA, hay PM và HR cũng được?',
    '<strong>Hai loại điều kiện phải phân biệt bằng CHỮ, không bằng màu.</strong> Ramp brand và danger của design system trùng nhau (#EE0033) nên "Chưa đạt — chặn" và "Cảnh báo — không chặn" khác nhau ở nhãn, không ở sắc đỏ.',
    'Nút chính để <strong>disabled</strong> kèm dòng giải thích ngay bên trái, thay vì ẩn đi. Ẩn nút là người dùng không biết chức năng có tồn tại; hiện mà mờ thì đọc được lý do.',
    'Trạng thái <strong>Đã đóng</strong> khai trong danh mục Trạng thái nhiệm vụ (artboard 17B) với cả hai cột "cho chấm công" và "cho sửa" đều Không — đó là chỗ luật này sống, không hardcode trong màn.',
  ]);

/* ================================================== 63 · BM.05 bản in */
const W63 = { tt: 48, ndcv: 260, nhom: 150, ns: 120, cong: 130, duyet: 160, phanBo: 160, chenh: 150, tyLe: 120 };
const W63_ALL = Object.values(W63).reduce((a, b) => a + b, 0);

const BM05_ROWS = [
  ['Thiết kế khối cao tần', 'Thiết kế', 6, 1284, 620000000, 648200000, 96.2],
  ['Lập trình firmware', 'Phát triển', 5, 1102, 480000000, 471900000, 98.3],
  ['Kiểm thử tích hợp', 'Kiểm thử', 4, 806, 310000000, 342600000, 110.5],
  ['Triển khai thử nghiệm hiện trường', 'Triển khai', 5, 624, 300000000, 278400000, 92.8],
  ['Quản lý tiến độ, báo cáo', 'Quản lý dự án', 3, 412, 140000000, 161300000, 115.2],
];

const bm05 = () => {
  const th = (w, t, cls = '') => `<div class="tbl__th ${cls}" style="width:${w}px">${t}</div>`;
  const td = (w, t, cls = '') => `<div class="tbl__td ${cls}" style="width:${w}px">${t}</div>`;

  const head =
    `<div class="tbl__head">` +
    th(W63.tt, 'TT', 'tbl__th--center') +
    th(W63.ndcv, 'Nội dung công việc') +
    th(W63.nhom, 'Nhóm công việc') +
    th(W63.ns, 'Số nhân sự', 'tbl__th--num') +
    th(W63.cong, 'Tổng công', 'tbl__th--num') +
    th(W63.duyet, 'CPNC được duyệt', 'tbl__th--num') +
    th(W63.phanBo, 'CPNC đã phân bổ', 'tbl__th--num') +
    th(W63.chenh, 'Chênh lệch', 'tbl__th--num') +
    th(W63.tyLe, 'Tỷ lệ (%)', 'tbl__th--num') +
    `</div>`;

  const rows = BM05_ROWS.map((r, i) => {
    const chenh = r[4] - r[5];
    return (
      `<div class="tbl__row">` +
      td(W63.tt, String(i + 1), 'tbl__td--center') +
      td(W63.ndcv, r[0]) +
      td(W63.nhom, r[1]) +
      td(W63.ns, String(r[2]), 'tbl__td--num') +
      td(W63.cong, money(r[3]), 'tbl__td--num') +
      td(W63.duyet, money(r[4]), 'tbl__td--num') +
      td(W63.phanBo, money(r[5]), 'tbl__td--num') +
      td(W63.chenh, chenh < 0 ? `(${money(-chenh)})` : money(chenh), 'tbl__td--num') +
      td(W63.tyLe, r[6].toFixed(1).replace('.', ','), 'tbl__td--num') +
      `</div>`
    );
  }).join('');

  const tDuyet = BM05_ROWS.reduce((s, r) => s + r[4], 0);
  const tPhanBo = BM05_ROWS.reduce((s, r) => s + r[5], 0);
  const rowTong =
    `<div class="tbl__row tbl__row--total">` +
    td(W63.tt, '') +
    td(W63.ndcv, '<strong>TỔNG CỘNG</strong>') +
    td(W63.nhom, '') +
    td(W63.ns, '<strong>23</strong>', 'tbl__td--num') +
    td(W63.cong, `<strong>${money(BM05_ROWS.reduce((s, r) => s + r[3], 0))}</strong>`, 'tbl__td--num') +
    td(W63.duyet, `<strong>${money(tDuyet)}</strong>`, 'tbl__td--num') +
    td(W63.phanBo, `<strong>${money(tPhanBo)}</strong>`, 'tbl__td--num') +
    td(W63.chenh, `<strong>(${money(tPhanBo - tDuyet)})</strong>`, 'tbl__td--num') +
    td(W63.tyLe, `<strong>${((tPhanBo / tDuyet) * 100).toFixed(1).replace('.', ',')}</strong>`, 'tbl__td--num') +
    `</div>`;

  return (
    giayIn(
      `
    ${dauVanBan('BM.05')}
    ${tieuDe('BẢNG TỔNG HỢP CHI PHÍ NHÂN CÔNG THEO NỘI DUNG CÔNG VIỆC', 'BM.05', [
      'Nhiệm vụ: 011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần',
      'Đơn vị chủ trì: Trung tâm Chế tạo Điện tử Khí tài — Khối 1, TCT CNC',
      'Kỳ tổng hợp: toàn bộ vòng đời nhiệm vụ, từ tháng 04/2025 đến tháng 05/2026',
    ])}
    <div class="tbl">${head}${rows}${rowTong}</div>
    <div style="font-size:12px;font-style:italic">Số trong ngoặc là phần <strong>vượt dự toán</strong>. Tổng CPNC đã phân bổ vượt mức được phê duyệt 52.400.000 ₫ (102,8%) — trình bày nguyên số, không làm tròn xuống và không ẩn dòng vượt.</div>
    ${vungKy([
      ['Người lập biểu', 'Phạm Văn Đức'],
      ['Chủ nhiệm nhiệm vụ', 'Đỗ Quang Huy'],
      ['Phòng Nhân sự', 'Nguyễn Thu Hà'],
      ['Lãnh đạo đơn vị chủ trì', '(Ký, ghi rõ họ tên)'],
    ])}
  `,
      W63_ALL + 100,
    ) +
    note('BM.05 — biểu mẫu bị bỏ sót của cả bộ, và cái bẫy tên gọi đi kèm', [
      '<strong>BM.05 KHÔNG phải BM5.</strong> Đây là biểu mẫu pháp lý của QĐ 3021, dùng ở bước đóng nhiệm vụ, tổng hợp <em>theo nội dung công việc</em> cho <em>cả vòng đời</em>. <code>BM5.DS Nhiem vu</code> (artboard 37) là biểu mẫu quản trị nội bộ, liệt kê <em>nhiều nhiệm vụ</em> theo <em>từng tháng</em>, không mang mã BM.xx. Hai văn bản khác nhau hoàn toàn.',
      '<strong>Khác BM4 ở trục tổng hợp.</strong> BM.04.02 (artboard 36) gom theo <em>nhiệm vụ</em> trong một kỳ lương; BM.05 gom theo <em>nội dung công việc</em> trong một nhiệm vụ, cộng dồn mọi kỳ. Cùng là "bảng tổng hợp" nhưng không suy ra được nhau.',
      '<strong>Cột chênh lệch âm để trong ngoặc</strong> theo quy ước kế toán của bản giấy, không dùng dấu trừ và không tô đỏ — bản in đen trắng.',
      'Nguồn số: cộng dồn <code>PhanBoCong</code> theo <code>noiDungCongViecId</code> qua toàn bộ kỳ của nhiệm vụ. Cùng một <code>cpnc-aggregate.service.ts</code> với năm báo cáo ở nhóm 4 — <strong>một nơi tính duy nhất</strong>, màn chỉ đọc.',
    ])
  );
};

module.exports = [
  { code: '60', group: '6 · Trình ký & Đóng nhiệm vụ', title: 'Tab Trình ký', desc: 'Tab 4 của khách — bốn nhóm nút, chỉ tài khoản HR', body: tabTrinhKy },
  { code: '61', group: '6 · Trình ký & Đóng nhiệm vụ', title: 'Trình ký danh sách nhân sự', desc: 'Gói ký theo vòng đời nhiệm vụ (MotaCV §I.2) + lịch sử ký', body: trinhKyNhanSu },
  { code: '62', group: '6 · Trình ký & Đóng nhiệm vụ', title: 'Đóng nhiệm vụ', desc: 'MotaCV §III — checklist điều kiện, 2 dòng chặn, nút disabled', body: dongNhiemVu },
  { code: '63', group: '6 · Trình ký & Đóng nhiệm vụ', title: 'BM.05 Bảng tổng hợp CPNC theo nội dung CV', desc: 'Bản in bị bỏ sót — KHÁC HẲN BM5 ở artboard 37', body: bm05 },
];
