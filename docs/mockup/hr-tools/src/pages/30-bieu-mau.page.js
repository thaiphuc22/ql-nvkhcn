/* =============================================================================
 * Đợt 3 — Bảng lương + tính CPNC (§7, §11).
 *
 * Bảng lương CHỈ import và CHỈ đọc (BRD: "không xử lý lương chi tiết"). Việc thật của đợt 3 là
 * **tính CPNC** rồi dựng BM3, BM3.1, BM3.2.
 *
 * Biểu mẫu là **văn bản pháp lý** theo QĐ 3021/QĐ-CNVTQĐ-CNCNC — mã BM.03.01, BM.04.01,
 * BM.04.02, BM.05, BM.06. Phần kết xuất phải bám đúng file gốc: quốc hiệu, tiêu ngữ, dòng
 * "Hà Nội, ngày … tháng … năm 20..", vùng ký. Không tự bịa bố cục.
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, frame, bare, DIM, pageHead, btn, select, search, tag, table, tableFoot, note, money, field, input } = U;

const NGUOI = [
  ['801234', 'Trần Minh Quân', 'Kỹ sư chính', 21.0, 16.0],
  ['805512', 'Lê Thị Hồng Nhung', 'Kỹ sư bậc 3', 20.0, 20.0],
  ['807781', 'Phạm Văn Đức', 'Trợ lý dự án', 21.0, 21.0],
  ['803095', 'Nguyễn Hoàng Anh', 'Kỹ sư bậc 1', 19.5, 12.0],
  ['809442', 'Vũ Thị Thu Hà', 'Chuyên viên Công nghệ', 21.0, 21.0],
];

/* 13 khoản mục của BM3 (cột 17–31) + CỘNG. Đây là thứ quyết định độ rộng biểu mẫu. */
const KHOAN = [
  'Lương tháng', 'Lương tháng (trừ BH cá nhân)', 'Truy thu/truy lĩnh', 'Lương SXKD',
  'Lương thử việc, tập nghề', 'Lương KD thử việc', 'BHXH cá nhân', 'BHXH đơn vị',
  'BHYT cá nhân', 'BHYT đơn vị', 'BHTN cá nhân', 'BHTN đơn vị', 'KPCĐ',
  'Ăn ca, ĐT, phụ cấp',
];
const GOC = [24500000, 22800000, 0, 3200000, 0, 0, 1960000, 3675000, 367500, 735000, 245000, 245000, 490000, 1850000];

/* ============================================== 30 · BM3 — Bảng tổng hợp phân bổ */
const bm3 = () =>
  frame(
    'bm3',
    `<div class="page">
      ${pageHead('BM3 — Bảng tổng hợp phân bổ chi phí nhân công', 'Kết quả TÍNH, không nhập tay. 51 cột. Mọi màn và báo cáo đọc từ cùng một nơi tính: cpnc.service.ts.', `${btn('In biểu mẫu', { icon: 'printer', variant: 'secondary' })}${btn('Xuất Excel', { icon: 'download' })}`)}
      <div class="card">
        <div class="filters">
          <div class="filters__left">${tag('Kỳ lương 05/2025 — Kỳ trả 06/2025', 'info')}${tag('Đã tính lúc 03/06 16:20', 'success')}</div>
          ${select('Kỳ 2025-05')}${select('Trung tâm CHĐK')}${select('Tất cả nhiệm vụ', { placeholder: true })}${btn('Tính lại CPNC', { icon: 'refresh', variant: 'secondary' })}
        </div>

        <div class="tbl">
          <div class="tbl__head">
            <div class="tbl__th w-48 tbl__th--center">TT</div>
            <div class="tbl__th w-90">Mã NV</div>
            <div class="tbl__th w-180">Họ và tên</div>
            <div class="tbl__th w-200">Nhiệm vụ</div>
            <div class="tbl__th w-200">Nội dung công việc</div>
            <div class="tbl__th w-110 tbl__th--num">Công PB</div>
            <div class="tbl__th w-110 tbl__th--num">Công TL</div>
            <div class="tbl__th w-100 tbl__th--num">Tỷ lệ</div>
            ${KHOAN.map((k) => `<div class="tbl__th w-140 tbl__th--num">${k}</div>`).join('')}
            <div class="tbl__th w-160 tbl__th--num">CỘNG</div>
          </div>
          ${NGUOI.map((p, i) => {
            const tyLe = p[4] / p[3];
            const cells = GOC.map((g) => Math.round((g * tyLe) / 1000) * 1000);
            const tong = cells.reduce((a, b) => a + b, 0);
            return `<div class="tbl__row">
              <div class="tbl__td w-48 tbl__td--center">${i + 1}</div>
              <div class="tbl__td w-90"><span class="code-link">${p[0]}</span></div>
              <div class="tbl__td w-180">${p[1]}</div>
              <div class="tbl__td w-200">011-24-TĐ-RDP-QS</div>
              <div class="tbl__td w-200">${['NDCV-01 Thiết kế khối cao tần', 'NDCV-02 Lập trình firmware', 'NDCV-01 Thiết kế khối cao tần', 'NDCV-03 Kiểm thử tích hợp', 'NDCV-02 Lập trình firmware'][i]}</div>
              <div class="tbl__td w-110 tbl__td--num">${String(p[4]).replace('.', ',')}</div>
              <div class="tbl__td w-110 tbl__td--num">${String(p[3]).replace('.', ',')}</div>
              <div class="tbl__td w-100 tbl__td--num"><strong>${(tyLe * 100).toFixed(1).replace('.', ',')}%</strong></div>
              ${cells.map((c) => `<div class="tbl__td w-140 tbl__td--num">${c ? money(c) : '—'}</div>`).join('')}
              <div class="tbl__td w-160 tbl__td--num"><strong>${money(tong)}</strong></div>
            </div>`;
          }).join('')}
          <div class="tbl__row tbl__row--warn">
            <div class="tbl__td w-48 tbl__td--center">6</div>
            <div class="tbl__td w-90"><span class="code-link">801234</span></div>
            <div class="tbl__td w-180">Trần Minh Quân</div>
            <div class="tbl__td w-200"><strong>Chi phí quản lý</strong></div>
            <div class="tbl__td w-200"><span class="muted">Công thừa — hệ thống tự sinh</span></div>
            <div class="tbl__td w-110 tbl__td--num">5,0</div>
            <div class="tbl__td w-110 tbl__td--num">21,0</div>
            <div class="tbl__td w-100 tbl__td--num"><strong>23,8%</strong></div>
            ${GOC.map((g) => `<div class="tbl__td w-140 tbl__td--num">${g ? money(Math.round((g * 5) / 21 / 1000) * 1000) : '—'}</div>`).join('')}
            <div class="tbl__td w-160 tbl__td--num"><strong>${money(Math.round((GOC.reduce((a, b) => a + b, 0) * 5) / 21))}</strong></div>
          </div>
        </div>

        <div class="alert alert--warn">${ico('info', 18)}
          <div class="alert__body"><div class="alert__title">Quy tắc công thừa — dễ bỏ sót nhất</div>
          <div>Người có công tính lương <strong>21</strong> mà chỉ chấm <strong>16</strong> ngày vào nhiệm vụ ⇒ hệ thống <strong>tự sinh dòng 5 ngày</strong> vào "Nhiệm vụ khác / Chi phí quản lý", nguồn <code>Quản lý</code>. Tổng CPNC phân bổ của mỗi người phải luôn bằng <strong>100%</strong> CPNC tháng của người đó — không có đồng nào rơi ra ngoài.</div></div>
        </div>
        ${tableFoot(312, { pages: [1, 2, 3, '…', 13] })}
      </div>
    </div>`,
    { wide: true },
  ) +
  note('Công thức CPNC — khoá ở MỘT chỗ duy nhất', [
    '<code>tyLe = congPhanBo / congTinhLuong</code> — mẫu số là công tính lương <strong>của chính người đó</strong>, không phải ngày công chuẩn của kỳ.',
    '<code>CPNC_phanBo[khoanMuc] = CPNC_thang[khoanMuc] × tyLe</code> — áp cho <strong>TỪNG khoản</strong> trong 13 khoản, không nhân vào tổng.',
    'Một nơi tính duy nhất: <code>core/services/hr/cpnc.service.ts</code>. Mỗi màn tự cài lại một kiểu là bảo đảm 6 tháng nữa có 4 con số khác nhau cho cùng một ô.',
    'Nghiệm thu bắt buộc: nhập BM0 công + BM0 lương <strong>tháng 5/2025 từ file thật</strong>, chấm lại đúng phân bổ của BM3 dòng 5–9, hệ thống phải ra <strong>đúng đến từng đồng</strong>.',
  ]);

/* ================================== 31 · BM3.1 — Bảng lương KHCN theo nội dung CV */
const bm31 = () =>
  frame(
    'bm31',
    `<div class="page">
      ${pageHead('BM.04.01 — Bảng chi tiết phân bổ CPNC nội bộ (BM3.1)', 'Bảng lương KHCN gom theo nội dung công việc. Header 4 tầng merge — độ khó kết xuất CAO.', `${btn('In biểu mẫu', { icon: 'printer', variant: 'secondary' })}${btn('Xuất Excel', { icon: 'download' })}`)}
      <div class="card">
        <div class="filters">
          <div class="filters__left">${tag('Chỉ vai trò HR mới xuất được biểu mẫu này', 'warning')}</div>
          ${select('Kỳ 2025-05')}${select('011-24-TĐ-RDP-QS')}
        </div>

        <div class="tbl">
          <div class="tbl__head">
            <div class="tbl__th w-48 tbl__th--center">TT</div>
            <div class="tbl__th w-90">Mã NV</div>
            <div class="tbl__th w-180">Họ và tên</div>
            <div class="tbl__th w-160">Chức danh</div>
            <div class="tbl__th w-110 tbl__th--num">Công PB</div>
            <div class="tbl__th w-100 tbl__th--num">Tỷ lệ</div>
            ${['Lương', 'Bảo hiểm cá nhân', 'Bảo hiểm đơn vị', 'KPCĐ', 'Phụ cấp'].map((k) => `<div class="tbl__th w-160 tbl__th--num">${k}</div>`).join('')}
            <div class="tbl__th w-180 tbl__th--num">CỘNG</div>
          </div>
          ${[
            ['NDCV-01 · Thiết kế khối cao tần', [0, 2]],
            ['NDCV-02 · Lập trình firmware', [1, 4]],
            ['NDCV-03 · Kiểm thử tích hợp', [3]],
          ]
            .map(
              ([ten, idxs]) =>
                `<div class="tbl__row tbl__row--group"><div class="tbl__td w-48"></div><div class="tbl__td grow"><strong>${ten}</strong></div></div>` +
                idxs
                  .map((i) => {
                    const p = NGUOI[i];
                    const tyLe = p[4] / p[3];
                    const v = [27700000, 2572500, 4655000, 490000, 1850000].map((g) => Math.round((g * tyLe) / 1000) * 1000);
                    return `<div class="tbl__row">
                    <div class="tbl__td w-48 tbl__td--center">${i + 1}</div>
                    <div class="tbl__td w-90"><span class="code-link">${p[0]}</span></div>
                    <div class="tbl__td w-180">${p[1]}</div>
                    <div class="tbl__td w-160">${p[2]}</div>
                    <div class="tbl__td w-110 tbl__td--num">${String(p[4]).replace('.', ',')}</div>
                    <div class="tbl__td w-100 tbl__td--num">${(tyLe * 100).toFixed(1).replace('.', ',')}%</div>
                    ${v.map((x) => `<div class="tbl__td w-160 tbl__td--num">${money(x)}</div>`).join('')}
                    <div class="tbl__td w-180 tbl__td--num"><strong>${money(v.reduce((a, b) => a + b, 0))}</strong></div>
                  </div>`;
                  })
                  .join(''),
            )
            .join('')}
          <div class="tbl__row tbl__row--total">
            <div class="tbl__td w-48"></div><div class="tbl__td w-90"></div>
            <div class="tbl__td w-180"><strong>TỔNG CỘNG</strong></div>
            <div class="tbl__td w-160"></div>
            <div class="tbl__td w-110 tbl__td--num">90,0</div>
            <div class="tbl__td w-100 tbl__td--num">—</div>
            ${[124650000, 11576000, 20947000, 2205000, 8325000].map((x) => `<div class="tbl__td w-160 tbl__td--num">${money(x)}</div>`).join('')}
            <div class="tbl__td w-180 tbl__td--num">${money(167703000)}</div>
          </div>
        </div>
      </div>
    </div>`,
    { wide: true },
  );

/* ================================ 32 · BM3.2 — Bảng lương SXKD theo sản phẩm/nguồn */
const bm32 = () =>
  frame(
    'bm32',
    `<div class="page">
      ${pageHead('BM3.2 — Bảng lương SXKD theo sản phẩm và phân nguồn', 'Kỳ lương và kỳ trả TÁCH RỜI — biểu mẫu gốc ghi "Kỳ lương 06/2025 - Kỳ trả 07/2025". Đừng gộp thành một trường.', `${btn('In biểu mẫu', { icon: 'printer', variant: 'secondary' })}${btn('Xuất Excel', { icon: 'download' })}`)}
      <div class="card">
        <div class="filters">
          <div class="filters__left">
            ${tag('Kỳ lương 06/2025', 'info')}${tag('Kỳ trả 07/2025', 'warning')}
          </div>
          ${select('PO-92166')}${select('Tất cả nguồn', { placeholder: true })}
        </div>
        ${table(
          [
            { t: 'TT', w: 'w-56', cls: 'tbl__th--center' },
            { t: 'Phân nguồn', w: 'w-140' },
            { t: 'Sản phẩm', w: 'w-240' },
            { t: 'Số nhân sự', w: 'w-120', cls: 'tbl__th--num' },
            { t: 'Công phân bổ', w: 'w-140', cls: 'tbl__th--num' },
            { t: 'Lương', w: 'w-180', cls: 'tbl__th--num' },
            { t: 'Bảo hiểm', w: 'w-180', cls: 'tbl__th--num' },
            { t: 'Phụ cấp', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'CỘNG', w: 'w-180', cls: 'tbl__th--num' },
          ],
          [
            [{ h: '1', cls: 'tbl__td--center' }, 'SXKD', 'A — Khối thu phát cao tần', { h: '12', cls: 'tbl__td--num' }, { h: '186,0', cls: 'tbl__td--num' }, { h: money(248400000), cls: 'tbl__td--num' }, { h: money(52164000), cls: 'tbl__td--num' }, { h: money(18600000), cls: 'tbl__td--num' }, { h: '<strong>' + money(319164000) + '</strong>', cls: 'tbl__td--num' }],
            [{ h: '2', cls: 'tbl__td--center' }, 'SXKD', 'B — Bộ điều khiển trung tâm', { h: '8', cls: 'tbl__td--num' }, { h: '124,0', cls: 'tbl__td--num' }, { h: money(161200000), cls: 'tbl__td--num' }, { h: money(33852000), cls: 'tbl__td--num' }, { h: money(12400000), cls: 'tbl__td--num' }, { h: '<strong>' + money(207452000) + '</strong>', cls: 'tbl__td--num' }],
            [{ h: '3', cls: 'tbl__td--center' }, 'Bán hàng', 'A — Khối thu phát cao tần', { h: '5', cls: 'tbl__td--num' }, { h: '78,0', cls: 'tbl__td--num' }, { h: money(93600000), cls: 'tbl__td--num' }, { h: money(19656000), cls: 'tbl__td--num' }, { h: money(7800000), cls: 'tbl__td--num' }, { h: '<strong>' + money(121056000) + '</strong>', cls: 'tbl__td--num' }],
            [{ h: '4', cls: 'tbl__td--center' }, '<strong>Bảo hành</strong>', '<span class="muted">— không theo sản phẩm —</span>', { h: '3', cls: 'tbl__td--num' }, { h: '31,0', cls: 'tbl__td--num' }, { h: money(32550000), cls: 'tbl__td--num' }, { h: money(6835000), cls: 'tbl__td--num' }, { h: money(1915000), cls: 'tbl__td--num' }, { h: '<strong>' + money(41300000) + '</strong>', cls: 'tbl__td--num' }],
            ['', '<strong>TỔNG</strong>', '', { h: '<strong>28</strong>', cls: 'tbl__td--num' }, { h: '<strong>419,0</strong>', cls: 'tbl__td--num' }, { h: '<strong>' + money(535750000) + '</strong>', cls: 'tbl__td--num' }, { h: '<strong>' + money(112507000) + '</strong>', cls: 'tbl__td--num' }, { h: '<strong>' + money(40715000) + '</strong>', cls: 'tbl__td--num' }, { h: '<strong>' + money(688972000) + '</strong>', cls: 'tbl__td--num' }],
          ],
          { rowCls: (i) => (i === 4 ? 'tbl__row--total' : i === 3 ? 'tbl__row--warn' : '') },
        )}
      </div>
    </div>`,
    { wide: true },
  );

/* ============================================= 33 · Khuôn in biểu mẫu (bản giấy) */
const khuonIn = () =>
  bare(
    `<div class="paper" style="width:1240px;margin:0 auto;box-shadow:var(--vht-shadow-lg)">
        <div class="paper__head">
          <div class="paper__block" style="flex:0 0 340px">
            <div style="font-size:12px">TẬP ĐOÀN CÔNG NGHIỆP – VIỄN THÔNG QUÂN ĐỘI</div>
            <div style="font-size:13px;font-weight:700">TỔNG CÔNG TY CN CÔNG NGHỆ CAO VIETTEL</div>
            <div style="width:150px;border-top:1px solid #000;margin-top:4px"></div>
            <div style="font-size:12px;margin-top:4px">Số: ......./BM-CNC</div>
          </div>
          <div class="paper__block" style="flex:1 1 auto">
            <div style="font-size:13px;font-weight:700">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-size:14px;font-weight:700">Độc lập – Tự do – Hạnh phúc</div>
            <div style="width:220px;border-top:1px solid #000;margin-top:4px"></div>
            <div style="font-size:13px;font-style:italic;margin-top:8px">Hà Nội, ngày ..... tháng ..... năm 20.....</div>
          </div>
        </div>

        <div class="col" style="gap:4px">
          <div class="paper__title">BẢNG CHẤM CÔNG THEO NỘI DUNG CÔNG VIỆC</div>
          <div class="paper__sub">(Ban hành kèm theo Quyết định số 3021/QĐ-CNVTQĐ-CNCNC — mã biểu mẫu BM.03.01)</div>
          <div class="paper__sub">Kỳ: tháng 05 năm 2025 — Đơn vị: Trung tâm Chế tạo Điện tử Khí tài</div>
          <div class="paper__sub">Nhiệm vụ: 011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần</div>
        </div>

        ${table(
          [
            { t: 'TT', w: 'w-48', cls: 'tbl__th--center' },
            { t: 'Mã NV', w: 'w-90' },
            { t: 'Họ và tên', w: 'w-200' },
            { t: 'Chức danh', w: 'w-180' },
            { t: 'Nội dung công việc tham gia' },
            { t: 'Công phân bổ', w: 'w-120', cls: 'tbl__th--num' },
            { t: 'Ghi chú', w: 'w-160' },
          ],
          NGUOI.map((p, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            p[0], p[1], p[2],
            ['NDCV-01 Thiết kế khối cao tần', 'NDCV-02 Lập trình firmware', 'NDCV-01 Thiết kế khối cao tần', 'NDCV-03 Kiểm thử tích hợp', 'NDCV-02 Lập trình firmware'][i],
            { h: String(p[4]).replace('.', ','), cls: 'tbl__td--num' },
            '',
          ]).concat([['', '', '<strong>Tổng cộng</strong>', '', '', { h: '<strong>90,0</strong>', cls: 'tbl__td--num' }, '']]),
          { rowCls: (i) => (i === 5 ? 'tbl__row--total' : '') },
        )}

        <div class="paper__signs">
          <div class="paper__sign"><strong>Người lập biểu</strong><div>Phạm Văn Đức</div></div>
          <div class="paper__sign"><strong>Chủ nhiệm nhiệm vụ</strong><div>Đỗ Quang Huy</div></div>
          <div class="paper__sign"><strong>Phòng Nhân sự</strong><div>Nguyễn Thu Hà</div></div>
          <div class="paper__sign"><strong>Lãnh đạo đơn vị</strong><div>(Ký, ghi rõ họ tên)</div></div>
        </div>
      </div>`,
    'background:var(--vht-gray-90);padding:32px 0',
  ) +
      note('Sáu biểu mẫu và độ khó kết xuất', [
        '<strong>BM.06</strong> Danh sách nhân sự tham gia (BM1) — thấp, 7 cột · <strong>BM.03.01</strong> Bảng chấm công (BM2.1/2.2) — <strong>cao</strong>, 47 cột, header 3 tầng merge',
        '<strong>BM.04.01</strong> Chi tiết phân bổ CPNC (BM3.1) — <strong>cao</strong>, header 4 tầng · <strong>BM.04.02</strong> Tổng hợp (BM4) — trung bình',
        '<strong>BM3</strong> Bảng tổng hợp phân bổ — <strong>rất cao</strong>, 51 cột · <strong>BM5</strong> Danh sách nhiệm vụ — trung bình, có cột động theo tháng',
        'Quyết định còn cần lấy: <code>export-bieu-mau.ts</code> hiện xuất <code>.xls</code> bằng bảng HTML — giữ được rowspan/colspan nên header đa tầng ra đúng hình, nhưng KHÔNG kiểm soát được độ rộng cột, định dạng số 12 chữ số và freeze pane. Đề xuất thử BM.03.01 trước bằng cách hiện có; nếu khách không chấp nhận mới thêm SheetJS.',
      ]);

module.exports = [
  { code: '30', group: '3 · Biểu mẫu CPNC', title: 'BM3 Bảng tổng hợp phân bổ', desc: '13 khoản mục + dòng công thừa tự sinh — khổ rộng', body: bm3 },
  { code: '31', group: '3 · Biểu mẫu CPNC', title: 'BM3.1 Bảng lương KHCN', desc: 'Gom theo nội dung công việc — khổ rộng', body: bm31 },
  { code: '32', group: '3 · Biểu mẫu CPNC', title: 'BM3.2 Bảng lương SXKD', desc: 'Theo sản phẩm và phân nguồn, kỳ lương ≠ kỳ trả — khổ rộng', body: bm32 },
  { code: '33', group: '3 · Biểu mẫu CPNC', title: 'Khuôn in biểu mẫu', desc: 'Quốc hiệu, tiêu ngữ, vùng ký — bản giấy', body: khuonIn },
];
