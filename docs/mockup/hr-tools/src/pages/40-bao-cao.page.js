/* =============================================================================
 * Đợt 4 — Báo cáo và Dashboard (§8).
 *
 * `Book1` liệt kê ĐÚNG 5 dashboard, không phải "một trang báo cáo tổng hợp". Cả 5 ăn cùng một
 * nguồn ⇒ `cpnc-aggregate.service.ts` là **nơi tính duy nhất**, các màn chỉ đọc.
 *
 * Biểu đồ dựng bằng div + flex, KHÔNG thêm thư viện chart — app thật dùng lại
 * `shared/simple-bar-chart/`, và ở mockup thì cột vẽ bằng div còn ra layer sửa được trong Figma,
 * chứ canvas thì import về là một ảnh bẹt.
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, frame, pageHead, btn, select, search, tag, table, tableFoot, note, money } = U;

const THANG = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const barChart = (values, { max = 100, unit = '%', colorFn = () => '', labels = THANG } = {}) => `
  <div class="chart">
    <div class="chart__plot">
      ${values
        .map(
          (v, i) => `<div class="chart__col">
            <div class="caption">${v === null ? '' : String(v).replace('.', ',') + unit}</div>
            <div class="chart__bar ${colorFn(v)}" style="height:${v === null ? 0 : Math.max(2, (v / max) * 170)}px"></div>
            <div class="chart__xlabel">${labels[i]}</div>
          </div>`,
        )
        .join('')}
    </div>
  </div>`;

const nguong70 = (v) => (v === null ? 'chart__bar--muted' : v < 70 ? 'chart__bar--warn' : 'chart__bar--ok');

/* ==================================================== 40 · Dashboard tổng quan */
const dashboard = () =>
  frame(
    'tong-quan',
    `<div class="page">
      ${pageHead('Tổng quan', 'Tháng 05/2025 · toàn Tổng công ty CNC. Mọi con số đọc từ cpnc-aggregate.service — màn này không tự tính gì.', `${select('Kỳ 2025-05')}${btn('Xuất báo cáo', { icon: 'download', variant: 'secondary' })}`)}

      <div class="stats">
        <div class="stat"><small>Tổng CPNC đã phân bổ</small><strong>18.462.900.000 ₫</strong></div>
        <div class="stat"><small>Quỹ lương tháng đã import</small><strong>21.840.500.000 ₫</strong></div>
        <div class="stat stat--ok"><small>Tỷ lệ PBNC toàn VHT</small><strong>84,5%</strong></div>
        <div class="stat stat--warn"><small>Đơn vị dưới ngưỡng 70%</small><strong>4 / 30</strong></div>
        <div class="stat stat--warn"><small>Nhiệm vụ sắp hết nguồn</small><strong>7</strong></div>
        <div class="stat"><small>Đơn vị chưa chốt chấm công</small><strong>3 / 30</strong></div>
      </div>

      <div class="row" style="gap:20px;align-items:stretch">
        <div class="card grow">
          <div class="card__head">
            <div class="card__title">Tỷ lệ phân bổ nhân công toàn VHT — 12 tháng</div>
            <div class="caption">Mẫu số: tổng bảng lương tháng đã import</div>
          </div>
          ${barChart([81.2, 79.5, 83.1, 85.4, 84.5, null, null, null, null, null, null, null], { colorFn: nguong70 })}
          <div class="chart__legend">
            <div class="legend"><span class="legend__swatch" style="background:var(--vht-success-50)"></span>Đạt ngưỡng ≥ 70%</div>
            <div class="legend"><span class="legend__swatch" style="background:var(--vht-warning-60)"></span>Dưới ngưỡng</div>
            <div class="legend"><span class="legend__swatch" style="background:var(--vht-gray-80)"></span>Chưa có dữ liệu</div>
          </div>
        </div>

        <div class="card" style="flex:0 0 420px">
          <div class="card__title">Tiến độ chốt chấm công tháng 05</div>
          ${[
            ['HR hoàn thành trình ký', 7, 'ok'],
            ['PA/PM chủ trì đã xác nhận', 12, ''],
            ['PA đã submit chấm công', 8, ''],
            ['Chưa chấm công', 3, 'warn'],
          ]
            .map(
              ([lbl, n, k]) => `<div class="col" style="gap:6px">
                <div class="row row--between"><span>${lbl}</span><strong>${n} đơn vị</strong></div>
                <div class="progress"><div class="progress__fill${k ? ' progress__fill--' + k : ''}" style="width:${(n / 30) * 100}%"></div></div>
              </div>`,
            )
            .join('')}
        </div>
      </div>

      <div class="row" style="gap:20px;align-items:stretch">
        <div class="card grow">
          <div class="card__head"><div class="card__title">Nhiệm vụ sắp hết nguồn</div><span class="code-link">Xem tất cả</span></div>
          ${table(
            [
              { t: 'Mã nhiệm vụ', w: 'w-200' },
              { t: 'Tên nhiệm vụ' },
              { t: 'Nguồn còn lại', w: 'w-180', cls: 'tbl__th--num' },
              { t: 'Đủ đến', w: 'w-140' },
            ],
            [
              ['<span class="code-link">DTPT-25-014</span>', 'Nâng cấp dây chuyền SMT nhà máy M1', { h: '<strong style="color:var(--vht-brand-40)">-2.000.000</strong>', cls: 'tbl__td--num' }, tag('Đã vượt', 'danger')],
              ['<span class="code-link">009-23-TĐ-RDP-QS</span>', 'Nghiên cứu vật liệu hấp thụ sóng', { h: money(18400000), cls: 'tbl__td--num' }, tag('T06/2025', 'warning')],
              ['<span class="code-link">PO-92166</span>', 'Cung cấp hệ thống camera giám sát AI', { h: money(41300000), cls: 'tbl__td--num' }, tag('T07/2025', 'warning')],
            ],
            { rowCls: (i) => (i === 0 ? 'tbl__row--warn' : '') },
          )}
        </div>
        <div class="card" style="flex:0 0 420px">
          <div class="card__head"><div class="card__title">Cảnh báo gần đây</div><span class="badge">5</span></div>
          ${[
            ['alert', 'DTPT-25-014 đã tiêu vượt nguồn CPNC', '03/06 16:22 · gửi PA, PM, HR'],
            ['alert', 'Tỷ lệ PBNC Phòng Tổng hợp 71,5% — sát ngưỡng', '01/06 08:00 · gửi GĐTT, HR'],
            ['x-circle', 'Không gửi được SMS tới 3 người nhận', '01/06 08:01 · lỗi gateway'],
            ['alert', 'Trung tâm Quang điện tử chưa chấm công T05', '31/05 17:00 · gửi GĐTT'],
          ]
            .map(
              ([i, t, s]) => `<div class="row" style="gap:12px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--vht-border)">
                <span style="color:var(--vht-brand-50)">${ico(i, 18)}</span>
                <div class="col" style="gap:2px"><span>${t}</span><span class="caption">${s}</span></div>
              </div>`,
            )
            .join('')}
        </div>
      </div>
    </div>`,
  );

/* =========================== 41 · Báo cáo 1 — Theo dõi nguồn CPNC của các nhiệm vụ */
const NV = [
  ['011-24-TĐ-RDP-QS', 'Nghiên cứu chế tạo khối thu phát cao tần', 'KHCN', 1850000000, 76000000, 560900000, 249000000, 498000000],
  ['012-25-TĐ-RDP-QS', 'Hệ thống định vị quán tính thế hệ 2', 'KHCN', 2400000000, 120000000, 384200000, 312000000, 624000000],
  ['PO-92166', 'Cung cấp hệ thống camera giám sát AI', 'SXKD', 980000000, 48000000, 383200000, 168000000, 336000000],
  ['DTPT-25-014', 'Nâng cấp dây chuyền SMT nhà máy M1', 'ĐTPT', 740000000, 0, 742000000, 120000000, 240000000],
  ['009-23-TĐ-RDP-QS', 'Nghiên cứu vật liệu hấp thụ sóng', 'KHCN', 620000000, 24000000, 625600000, 84000000, 168000000],
];

const bcNguon = () =>
  frame(
    'bc-nguon',
    `<div class="page">
      ${pageHead('Theo dõi nguồn CPNC của các nhiệm vụ', 'Nguồn đã lập dự toán = CPNC được phê duyệt + Dự phòng. Cột "Nguồn còn lại" CÓ THỂ ÂM — mẫu của khách ghi -2000, không được clamp về 0.', `${btn('Xuất BM5', { icon: 'download', variant: 'secondary' })}${btn('In', { icon: 'printer', variant: 'secondary' })}`)}
      <div class="card">
        <div class="filters">
          <div class="filters__left">${tag('2 nhiệm vụ đã vượt nguồn', 'danger')}</div>
          ${select('Kỳ 2025-05')}${select('Tất cả khối', { placeholder: true })}${select('Tất cả phân loại', { placeholder: true })}${search('Tìm nhiệm vụ')}
        </div>
        ${table(
          [
            { t: 'STT', w: 'w-56', cls: 'tbl__th--center' },
            { t: 'Mã nhiệm vụ', w: 'w-200' },
            { t: 'Tên nhiệm vụ' },
            { t: 'Nguồn', w: 'w-100', cls: 'tbl__th--center' },
            { t: 'Nguồn đã lập dự toán', w: 'w-200', cls: 'tbl__th--num' },
            { t: 'Nguồn đã phân bổ', w: 'w-180', cls: 'tbl__th--num' },
            { t: 'Cần phân bổ 6 tháng', w: 'w-190', cls: 'tbl__th--num' },
            { t: 'Cần phân bổ năm', w: 'w-180', cls: 'tbl__th--num' },
            { t: 'Nguồn còn lại', w: 'w-180', cls: 'tbl__th--num' },
          ],
          NV.map((n, i) => {
            const duToan = n[3] + n[4];
            const conLai = duToan - n[5];
            return [
              { h: String(i + 1), cls: 'tbl__td--center' },
              `<span class="code-link">${n[0]}</span>`,
              n[1],
              { h: tag(n[2], n[2] === 'KHCN' ? 'info' : ''), cls: 'tbl__td--center' },
              { h: money(duToan), cls: 'tbl__td--num' },
              { h: money(n[5]), cls: 'tbl__td--num' },
              { h: money(n[6]), cls: 'tbl__td--num' },
              { h: money(n[7]), cls: 'tbl__td--num' },
              { h: conLai < 0 ? `<strong style="color:var(--vht-brand-40)">${money(conLai)}</strong>` : money(conLai), cls: 'tbl__td--num' },
            ];
          }),
          { rowCls: (i) => (NV[i][3] + NV[i][4] - NV[i][5] < 0 ? 'tbl__row--warn' : '') },
        )}
        <div class="alert alert--warn">${ico('alert', 18)}
          <div class="alert__body"><div class="alert__title">Số âm là thông tin, không phải lỗi hiển thị</div>
          <div><code>DTPT-25-014</code> và <code>009-23-TĐ-RDP-QS</code> đã phân bổ vượt nguồn đã lập dự toán. Đây chính là dữ liệu sinh ra cảnh báo "nhiệm vụ sắp hết nguồn" — clamp về 0 là giấu mất nó.</div></div>
        </div>
        ${tableFoot(64, { pages: [1, 2, 3] })}
      </div>
    </div>`,
    { wide: true },
  );

/* ============================ 42 · Báo cáo 2 — Tỷ lệ PBNC của đơn vị trong năm */
const bcTyLeDonVi = () =>
  frame(
    'bc-ty-le-dv',
    `<div class="page">
      ${pageHead('Tỷ lệ phân bổ nhân công của đơn vị', 'Tỷ lệ = Σ CPNC phân bổ tháng / quỹ lương tháng của đơn vị cấp 5. Ngưỡng cảnh báo 70% lấy từ màn cấu hình, KHÔNG hardcode.', `${btn('Xuất Excel', { icon: 'download', variant: 'secondary' })}`)}
      <div class="card">
        <div class="filters">
          ${select('Năm 2025')}${select('Khối 1 - TCT CNC')}${select('Trung tâm Chế tạo Điện tử Khí tài')}
        </div>
        <div class="card__head">
          <div class="card__title">Trung tâm Chế tạo Điện tử Khí tài — 12 tháng năm 2025</div>
          <div class="row">${tag('Ngưỡng 70%', 'info')}${tag('5/5 tháng đạt', 'success')}</div>
        </div>
        ${barChart([88.4, 91.2, 86.7, 94.1, 96.4, null, null, null, null, null, null, null], { colorFn: nguong70 })}
        <div class="chart__legend">
          <div class="legend"><span class="legend__swatch" style="background:var(--vht-success-50)"></span>Đạt ngưỡng</div>
          <div class="legend"><span class="legend__swatch" style="background:var(--vht-warning-60)"></span>Dưới 70% — cảnh báo GĐTT và HR hàng tháng</div>
          <div class="legend"><span class="legend__swatch" style="background:var(--vht-gray-80)"></span>Chưa tới kỳ</div>
        </div>
      </div>

      <div class="card">
        <div class="card__title">Chi tiết theo tháng</div>
        ${table(
          [
            { t: 'Tháng', w: 'w-110' },
            { t: 'Quỹ lương tháng (mẫu số)', w: 'w-240', cls: 'tbl__th--num' },
            { t: 'CPNC đã phân bổ', w: 'w-220', cls: 'tbl__th--num' },
            { t: 'Tỷ lệ PBNC', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Số nhiệm vụ', w: 'w-140', cls: 'tbl__th--num' },
            { t: 'Trạng thái' },
          ],
          [
            ['01/2025', { h: money(3312400000), cls: 'tbl__td--num' }, { h: money(2928160000), cls: 'tbl__td--num' }, { h: '<strong>88,4%</strong>', cls: 'tbl__td--num' }, { h: '9', cls: 'tbl__td--num' }, tag('Đạt', 'success')],
            ['02/2025', { h: money(3298700000), cls: 'tbl__td--num' }, { h: money(3008415000), cls: 'tbl__td--num' }, { h: '<strong>91,2%</strong>', cls: 'tbl__td--num' }, { h: '9', cls: 'tbl__td--num' }, tag('Đạt', 'success')],
            ['03/2025', { h: money(3401200000), cls: 'tbl__td--num' }, { h: money(2948840000), cls: 'tbl__td--num' }, { h: '<strong>86,7%</strong>', cls: 'tbl__td--num' }, { h: '10', cls: 'tbl__td--num' }, tag('Đạt', 'success')],
            ['04/2025', { h: money(3455900000), cls: 'tbl__td--num' }, { h: money(3252003000), cls: 'tbl__td--num' }, { h: '<strong>94,1%</strong>', cls: 'tbl__td--num' }, { h: '11', cls: 'tbl__td--num' }, tag('Đạt', 'success')],
            ['05/2025', { h: money(3482150000), cls: 'tbl__td--num' }, { h: money(3356792000), cls: 'tbl__td--num' }, { h: '<strong>96,4%</strong>', cls: 'tbl__td--num' }, { h: '11', cls: 'tbl__td--num' }, tag('Đạt', 'success')],
          ],
        )}
        <div class="alert">${ico('info', 18)}
          <div class="alert__body"><div class="alert__title">Câu hỏi còn mở với khách (Q7)</div>
          <div>Mẫu số là quỹ lương của <strong>toàn</strong> đơn vị cấp 5, hay chỉ nhân sự có tham gia nhiệm vụ? Mockup đang lấy <strong>toàn đơn vị</strong> — con số này đổi thì mọi tỷ lệ trong 3 báo cáo đổi theo.</div></div>
        </div>
      </div>
    </div>`,
  );

/* ============================== 43 · Báo cáo 3 — Tổng hợp PBNC của khối (cấp 4) */
const bcKhoi = () =>
  frame(
    'bc-khoi',
    `<div class="page">
      ${pageHead('Tổng hợp phân bổ nhân công theo Khối', 'Cộng dồn từ đơn vị cấp 5 lên cấp 4. Cảnh báo khối dưới 70% gửi BGĐ Khối và HR — tần suất HÀNG QUÝ (khác cảnh báo đơn vị: hàng tháng).', `${btn('Xuất Excel', { icon: 'download', variant: 'secondary' })}`)}
      <div class="card">
        <div class="filters">${select('Năm 2025')}${select('Quý II/2025')}</div>
        ${table(
          [
            { t: 'STT', w: 'w-56', cls: 'tbl__th--center' },
            { t: 'Khối (đơn vị cấp 4)', w: 'w-280' },
            { t: 'Số đơn vị cấp 5', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Số nhân sự', w: 'w-140', cls: 'tbl__th--num' },
            { t: 'Quỹ lương quý', w: 'w-200', cls: 'tbl__th--num' },
            { t: 'CPNC đã phân bổ', w: 'w-200', cls: 'tbl__th--num' },
            { t: 'Tỷ lệ PBNC', w: 'w-260' },
          ],
          [
            ['Khối 1 - TCT CNC', 8, 412, 28460000000, 26332000000, 92.5],
            ['Khối 2 - TCT CNC', 7, 356, 24180000000, 21036000000, 87.0],
            ['Khối 3 - TCT CNC', 6, 289, 19240000000, 14624000000, 76.0],
            ['Trung tâm Kinh doanh', 5, 178, 11960000000, 7654000000, 64.0],
            ['Trung tâm Quản lý Chất lượng', 4, 122, 8140000000, 5210000000, 64.0],
          ].map((k, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            k[0],
            { h: String(k[1]), cls: 'tbl__td--num' },
            { h: String(k[2]), cls: 'tbl__td--num' },
            { h: money(k[3]), cls: 'tbl__td--num' },
            { h: money(k[4]), cls: 'tbl__td--num' },
            `<div class="col" style="gap:4px;width:100%">
               <div class="row row--between"><strong>${String(k[5]).replace('.', ',')}%</strong>${k[5] < 70 ? '<span class="caption" style="color:var(--vht-brand-40)">dưới ngưỡng 70%</span>' : ''}</div>
               <div class="progress"><div class="progress__fill${k[5] >= 70 ? ' progress__fill--ok' : ' progress__fill--warn'}" style="width:${k[5]}%"></div></div>
             </div>`,
          ]),
          { rowCls: (i) => (i >= 3 ? 'tbl__row--warn' : '') },
        )}
      </div>
    </div>`,
    { wide: true },
  );

/* ================================= 44 · Báo cáo 4 — Tổng hợp PBNC của toàn VHT */
const bcVHT = () =>
  frame(
    'bc-vht',
    `<div class="page">
      ${pageHead('Tổng hợp phân bổ nhân công toàn VHT', 'Mẫu số là TỔNG BẢNG LƯƠNG THÁNG ĐÃ IMPORT — không phải tổng quỹ lương kế hoạch. Hai con số này lệch nhau và người đọc báo cáo sẽ hỏi.', `${btn('Xuất BM4', { icon: 'download', variant: 'secondary' })}${btn('In', { icon: 'printer', variant: 'secondary' })}`)}
      <div class="card">
        <div class="filters">${select('Năm 2025')}${select('Luỹ kế đến 05/2025')}</div>
        <div class="stats">
          <div class="stat"><small>Tổng bảng lương đã import (mẫu số)</small><strong>21.840.500.000 ₫</strong></div>
          <div class="stat"><small>Tổng CPNC đã phân bổ</small><strong>18.462.900.000 ₫</strong></div>
          <div class="stat stat--ok"><small>Tỷ lệ PBNC toàn VHT</small><strong>84,5%</strong></div>
          <div class="stat"><small>Chi phí quản lý (công thừa)</small><strong>3.377.600.000 ₫</strong></div>
        </div>
        ${barChart([81.2, 79.5, 83.1, 85.4, 84.5, null, null, null, null, null, null, null], { colorFn: nguong70 })}
      </div>

      <div class="card">
        <div class="card__title">Phân bổ theo nguồn kinh phí — luỹ kế 5 tháng</div>
        ${table(
          [
            { t: 'Phân nguồn', w: 'w-200' },
            { t: 'CPNC đã phân bổ', w: 'w-240', cls: 'tbl__th--num' },
            { t: 'Tỷ trọng', w: 'w-300' },
            { t: 'Số nhiệm vụ', w: 'w-160', cls: 'tbl__th--num' },
          ],
          [
            ['KHCN', 8642100000, 46.8, 28],
            ['SXKD', 4931800000, 26.7, 19],
            ['Bán hàng', 1284600000, 7.0, 11],
            ['Bảo hành', 226800000, 1.2, 6],
            ['ĐTPT', 1620000000, 8.8, 7],
            ['Quản lý (công thừa)', 1757600000, 9.5, '—'],
          ].map((x) => [
            x[0],
            { h: money(x[1]), cls: 'tbl__td--num' },
            `<div class="col" style="gap:4px;width:100%"><div class="caption">${String(x[2]).replace('.', ',')}%</div><div class="progress"><div class="progress__fill" style="width:${x[2] * 2}%"></div></div></div>`,
            { h: String(x[3]), cls: 'tbl__td--num' },
          ]),
        )}
      </div>
    </div>`,
  );

/* ============================ 45 · Báo cáo 5 — Nhiệm vụ sắp hết nguồn */
const bcHetNguon = () =>
  frame(
    'bc-het-nguon',
    `<div class="page">
      ${pageHead('Danh sách nhiệm vụ sắp hết nguồn', 'Luật là PHÉP NGOẠI SUY TUYẾN TÍNH, không phải ngưỡng phần trăm: giả định hai tháng tới tiêu bằng tháng này, nếu nguồn còn lại không đủ thì cảnh báo.', `${btn('Xuất kèm BM5 toàn VHT', { icon: 'download', variant: 'secondary' })}${btn('Gửi cảnh báo ngay', { icon: 'send' })}`)}
      <div class="card">
        <div class="alert alert--warn">${ico('alert', 18)}
          <div class="alert__body"><div class="alert__title">Cách tính, viết ra để không ai cài lại thành ngưỡng %</div>
          <div>Với mỗi nhiệm vụ: <code>dựKiến(N+1) = dựKiến(N+2) = đãPhânBổ(N)</code>. Nếu <code>nguồnCònLại &lt; dựKiến(N+1) + dựKiến(N+2)</code> ⇒ cảnh báo. Tầm nhìn <strong>2 tháng</strong> và ngưỡng <strong>70%</strong> nằm ở màn cấu hình, không hardcode.</div></div>
        </div>
        <div class="filters">
          ${select('Kỳ 2025-05')}${select('Tất cả khối', { placeholder: true })}${search('Tìm nhiệm vụ')}
        </div>
        ${table(
          [
            { t: 'STT', w: 'w-56', cls: 'tbl__th--center' },
            { t: 'Mức', w: 'w-110', cls: 'tbl__th--center' },
            { t: 'Mã nhiệm vụ', w: 'w-180' },
            { t: 'Tên nhiệm vụ' },
            { t: 'Đơn vị chủ trì', w: 'w-180' },
            { t: 'Phân bổ T05', w: 'w-140', cls: 'tbl__th--num' },
            { t: 'Nguồn còn lại', w: 'w-160', cls: 'tbl__th--num' },
            { t: 'Đủ đến', w: 'w-110', cls: 'tbl__th--center' },
            { t: 'Người nhận cảnh báo', w: 'w-160' },
          ],
          [
            [tag('Đã vượt', 'danger'), 'DTPT-25-014', 'Nâng cấp dây chuyền SMT nhà máy M1', 'Trung tâm Quang điện tử', 62000000, -2000000, 'Đã vượt', 'PA · PM · GĐTT · HR'],
            [tag('Nguy cấp', 'danger'), '009-23-TĐ-RDP-QS', 'Nghiên cứu vật liệu hấp thụ sóng', 'Trung tâm CHĐK', 48200000, 18400000, 'T06/2025', 'PA · PM · GĐTT · HR'],
            [tag('Cảnh báo', 'warning'), 'PO-92166', 'Cung cấp hệ thống camera giám sát AI', 'Trung tâm Camera', 38400000, 41300000, 'T07/2025', 'PA · PM · HR'],
            [tag('Cảnh báo', 'warning'), '015-25-TĐ-RDP-QS', 'Mô-đun xử lý tín hiệu số băng rộng', 'Trung tâm CHĐK', 52100000, 96800000, 'T07/2025', 'PA · PM · HR'],
          ].map((x, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            { h: x[0], cls: 'tbl__td--center' },
            `<span class="code-link">${x[1]}</span>`,
            x[2], x[3],
            { h: money(x[4]), cls: 'tbl__td--num' },
            { h: x[5] < 0 ? `<strong style="color:var(--vht-brand-40)">${money(x[5])}</strong>` : money(x[5]), cls: 'tbl__td--num' },
            { h: x[6], cls: 'tbl__td--center' },
            `<span class="caption">${x[7]}</span>`,
          ]),
          { rowCls: (i) => (i < 2 ? 'tbl__row--warn' : '') },
        )}
        ${tableFoot(7, { pages: [1] })}
      </div>
    </div>`,
  ) +
  note('Ba luật cảnh báo — người nhận KHÁC NHAU từng luật', [
    '<strong>Nhiệm vụ sắp hết nguồn</strong> (theo sự kiện): PA/PM nhận cả N+1 và N+2 · GĐTT chỉ nhận N+1 · HR nhận cả hai · BGĐ Khối không nhận.',
    '<strong>Tỷ lệ PBNC đơn vị &lt; 70%</strong> (hàng tháng): GĐTT và HR.',
    '<strong>Tỷ lệ PBNC khối &lt; 70%</strong> (hàng quý): BGĐ Khối và HR.',
    'Hai vai trò <strong>GĐTT (Giám đốc Trung tâm)</strong> và <strong>BGĐ Khối</strong> chưa có trong <code>core/models/roles.ts</code> — phải bổ sung ở đúng file đó, không tự định nghĩa danh sách vai trò mới.',
  ]);

module.exports = [
  { code: '40', group: '4 · Báo cáo', title: 'Dashboard tổng quan', desc: 'Chỉ số chính + tiến độ chốt + cảnh báo', body: dashboard },
  { code: '41', group: '4 · Báo cáo', title: 'Theo dõi nguồn CPNC nhiệm vụ', desc: 'Nguồn còn lại có thể ÂM — không clamp · khổ rộng', body: bcNguon },
  { code: '42', group: '4 · Báo cáo', title: 'Tỷ lệ PBNC của đơn vị', desc: 'Biểu đồ 12 tháng + chi tiết', body: bcTyLeDonVi },
  { code: '43', group: '4 · Báo cáo', title: 'Tổng hợp PBNC theo Khối', desc: 'Cộng dồn cấp 5 lên cấp 4, ngưỡng quý · khổ rộng', body: bcKhoi },
  { code: '44', group: '4 · Báo cáo', title: 'Tổng hợp PBNC toàn VHT', desc: 'Mẫu số = tổng bảng lương đã import', body: bcVHT },
  { code: '45', group: '4 · Báo cáo', title: 'Nhiệm vụ sắp hết nguồn', desc: 'Ngoại suy 2 tháng, không phải ngưỡng %', body: bcHetNguon },
];
