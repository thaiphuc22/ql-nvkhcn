/* =============================================================================
 * Đợt 5 — Cảnh báo và Thông báo (§9).
 *
 * BRD 4.9 yêu cầu **Email · SMS · thông báo trong hệ thống**. KHÔNG có Zalo.
 *
 * Nợ kỹ thuật đã ghi nhận có ý thức: hệ thống sẽ có **hai nguồn mẫu thông báo song song** —
 * kho của HR Tools và `SEND_NOTIFICATION.templateCode` của phân hệ Quy trình. Ba việc rẻ tiền
 * để trả được món nợ này về sau đã áp vào mockup:
 *   1. `MauThongBao.code` dùng cùng quy ước đặt mã với `templateCode` (chữ thường, gạch ngang);
 *   2. giữ đúng 4 kênh `email | in_app | sms | zalo` trong model, nhưng CHỈ BẬT 3 kênh khách cần;
 *   3. ghi một dòng nợ vào `decisions.md`.
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, frame, bare, DIM, pageHead, btn, input, select, search, field, tag, table, tableFoot, note } = U;

const sw = (on) => `<div class="switch${on ? ' switch--on' : ''}"><div class="switch__knob"></div></div>`;

/* ==================================================== 50 · Kho mẫu thông báo */
const mauList = () =>
  frame(
    'mau-thong-bao',
    `<div class="page">
      ${pageHead('Mẫu thông báo', 'Mã mẫu dùng CÙNG quy ước đặt mã với templateCode của service task SEND_NOTIFICATION — chữ thường, gạch ngang. Sau này hợp nhất hai kho là map thẳng.', `${btn('Thêm mẫu', { icon: 'plus' })}`)}
      <div class="card">
        <div class="alert">${ico('info', 18)}
          <div class="alert__body"><div class="alert__title">Đây là kho mẫu RIÊNG của HR Tools — lựa chọn có chủ ý</div>
          <div>Phân hệ Quy trình đã có <code>SEND_NOTIFICATION.templateCode</code> nhưng <strong>không có bảng catalog mẫu nào</strong> trong cả 39 migration — <code>templateCode</code> hiện là chuỗi gõ tay. Hợp nhất hai kho được hoãn lại, đã ghi nợ kỹ thuật trong <code>decisions.md</code>.</div></div>
        </div>
        <div class="filters">
          ${select('Tất cả kênh', { placeholder: true })}${select('Tất cả trạng thái', { placeholder: true })}${search('Tìm theo mã hoặc tên mẫu')}
        </div>
        ${table(
          [
            { t: 'STT', w: 'w-56', cls: 'tbl__th--center' },
            { t: 'Thao tác', w: 'w-110' },
            { t: 'Trạng thái', w: 'w-110', cls: 'tbl__th--center' },
            { t: 'Mã mẫu', w: 'w-260' },
            { t: 'Tên mẫu' },
            { t: 'Kênh', w: 'w-220' },
            { t: 'Lần gửi (30 ngày)', w: 'w-170', cls: 'tbl__th--num' },
          ],
          [
            ['hr-nhiem-vu-sap-het-nguon', 'Nhiệm vụ sắp hết nguồn CPNC', ['Email', 'Trong hệ thống', 'SMS'], 42, true],
            ['hr-ty-le-pbnc-don-vi-thap', 'Tỷ lệ PBNC đơn vị dưới ngưỡng', ['Email', 'Trong hệ thống'], 8, true],
            ['hr-ty-le-pbnc-khoi-thap', 'Tỷ lệ PBNC khối dưới ngưỡng', ['Email'], 2, true],
            ['hr-nhac-cham-cong', 'Nhắc đơn vị chưa chấm công', ['Email', 'Trong hệ thống'], 63, true],
            ['hr-cham-cong-cho-xac-nhan', 'Chấm công chờ PA/PM chủ trì xác nhận', ['Trong hệ thống'], 118, true],
            ['hr-trinh-ky-thanh-cong', 'Trình ký VOffice thành công', ['Email', 'Trong hệ thống'], 27, true],
            ['hr-ky-da-khoa', 'Kỳ đã khoá', ['Trong hệ thống'], 5, false],
          ].map((m, i) => [
            { h: String(i + 1), cls: 'tbl__td--center' },
            `<div class="actions">${ico('pencil', 18)}<div class="actions__sep"></div><span style="color:var(--vht-brand-50)">${ico('trash', 18)}</span></div>`,
            { h: sw(m[4]), cls: 'tbl__td--center' },
            `<span class="code-link">${m[0]}</span>`,
            m[1],
            `<div class="row" style="gap:4px">${m[2].map((k) => tag(k, k === 'SMS' ? 'warning' : k === 'Email' ? 'info' : '', false)).join('')}</div>`,
            { h: String(m[3]), cls: 'tbl__td--num' },
          ]),
        )}
        ${tableFoot(12, { pages: [1] })}
      </div>
    </div>`,
  );

/* ============================================ 51 · Soạn mẫu thông báo */
const mauSoan = () =>
  frame(
    'mau-thong-bao',
    `<div class="page">
      ${pageHead('Sửa mẫu · hr-nhiem-vu-sap-het-nguon', 'Placeholder dạng {{...}} lấy từ danh sách biến khả dụng bên phải — gõ tay tên biến sai thì thông báo gửi ra chuỗi rỗng mà không ai biết.', `${btn('Huỷ', { variant: 'secondary' })}${btn('Gửi thử', { icon: 'send', variant: 'secondary' })}${btn('Lưu', { icon: 'check' })}`, true)}
      <div class="row" style="gap:20px;align-items:flex-start">
        <div class="card grow">
          <div class="row row--wrap" style="gap:16px">
            <div style="flex:1 1 320px">${field('Mã mẫu', input('hr-nhiem-vu-sap-het-nguon', { state: 'readonly' }), { required: true, help: 'Chữ thường, gạch ngang — cùng quy ước với templateCode.' })}</div>
            <div style="flex:1 1 320px">${field('Tên mẫu', input('Nhiệm vụ sắp hết nguồn CPNC'), { required: true })}</div>
          </div>

          <div class="col" style="gap:8px">
            <div class="field__label">Kênh gửi <span class="req">*</span></div>
            <div class="row row--wrap" style="gap:20px">
              <div class="choice"><div class="checkbox checkbox--on">${ico('check', 14)}</div><span>Email</span></div>
              <div class="choice"><div class="checkbox checkbox--on">${ico('check', 14)}</div><span>Thông báo trong hệ thống</span></div>
              <div class="choice"><div class="checkbox checkbox--on">${ico('check', 14)}</div><span>SMS</span></div>
              <div class="choice"><div class="checkbox"></div><span class="muted">Zalo — giữ trong model để hợp nhất được, khách KHÔNG yêu cầu</span></div>
            </div>
          </div>

          ${field('Tiêu đề', input('[CẢNH BÁO] Nhiệm vụ {{maNhiemVu}} sắp hết nguồn CPNC'), { required: true })}
          ${field(
            'Nội dung',
            `<div class="input input--area" style="min-height:200px;align-items:flex-start">
              <div class="col" style="gap:8px">
                <div>Kính gửi {{tenNguoiNhan}},</div>
                <div>Nhiệm vụ <strong>{{maNhiemVu}} — {{tenNhiemVu}}</strong> do đơn vị {{donViChuTri}} chủ trì đang có nguồn CPNC còn lại là <strong>{{nguonConLai}}</strong>.</div>
                <div>Với mức phân bổ tháng {{ky}} là {{phanBoThangNay}}, nguồn dự kiến chỉ đủ đến <strong>{{duDenThang}}</strong>.</div>
                <div>Đề nghị rà soát và điều chỉnh kế hoạch phân bổ nhân công.</div>
                <div class="muted">— Hệ thống Quản lý chi phí nhân công VHT</div>
              </div>
            </div>`,
            { required: true },
          )}
          ${field('Người nhận', select('Theo cấu hình vai trò của sự kiện'), { help: 'Vai trò lấy từ core/models/roles.ts — không tự định nghĩa danh sách vai trò mới.' })}
        </div>

        <div class="card" style="flex:0 0 380px">
          <div class="card__title">Biến khả dụng</div>
          <div class="caption">Bấm để chèn vào vị trí con trỏ.</div>
          <div class="col" style="gap:6px">
            ${[
              ['{{maNhiemVu}}', '011-24-TĐ-RDP-QS'],
              ['{{tenNhiemVu}}', 'Nghiên cứu chế tạo khối thu phát cao tần'],
              ['{{donViChuTri}}', 'Trung tâm CHĐK'],
              ['{{ky}}', '05/2025'],
              ['{{nguonConLai}}', '18.400.000 ₫'],
              ['{{phanBoThangNay}}', '48.200.000 ₫'],
              ['{{duDenThang}}', 'T06/2025'],
              ['{{tenNguoiNhan}}', 'Đỗ Quang Huy'],
              ['{{vaiTroNguoiNhan}}', 'Chủ nhiệm nhiệm vụ (PM)'],
            ]
              .map(
                ([v, ex]) => `<div class="row row--between" style="padding:6px 8px;border:1px solid var(--vht-border);border-radius:8px">
                  <span style="font-family:var(--vht-font-mono);font-size:12px;color:var(--vht-brand-50)">${v}</span>
                  <span class="caption">${ex}</span>
                </div>`,
              )
              .join('')}
          </div>
          <div class="section-title">Xem trước — Email</div>
          <div style="padding:12px;border:1px solid var(--vht-border);border-radius:8px;background:var(--vht-gray-99)">
            <div class="strong">[CẢNH BÁO] Nhiệm vụ 011-24-TĐ-RDP-QS sắp hết nguồn CPNC</div>
            <div class="caption" style="margin-top:6px">Kính gửi Đỗ Quang Huy, nhiệm vụ 011-24-TĐ-RDP-QS — Nghiên cứu chế tạo khối thu phát cao tần do đơn vị Trung tâm CHĐK chủ trì đang có nguồn CPNC còn lại là 18.400.000 ₫…</div>
          </div>
        </div>
      </div>
    </div>`,
  );

/* ======================================== 52 · Cấu hình ngưỡng cảnh báo */
const nguongCanhBao = () =>
  frame(
    'nguong',
    `<div class="page">
      ${pageHead('Cấu hình ngưỡng cảnh báo', 'Ngưỡng 70% và tầm nhìn 2 tháng phải nằm Ở ĐÂY, không hardcode trong code báo cáo. Khách đổi ngưỡng là việc của người quản trị, không phải của lập trình viên.', `${btn('Huỷ', { variant: 'secondary' })}${btn('Lưu cấu hình', { icon: 'check' })}`)}

      <div class="card">
        <div class="card__title">Luật 1 — Nhiệm vụ sắp hết nguồn</div>
        <div class="caption">Phép ngoại suy tuyến tính: giả định N+1 và N+2 tiêu bằng tháng N. Không phải ngưỡng phần trăm.</div>
        <div class="row row--wrap" style="gap:16px;align-items:flex-end">
          <div style="flex:0 0 220px">${field('Tầm nhìn ngoại suy', select('2 tháng'), { required: true })}</div>
          <div style="flex:0 0 220px">${field('Tần suất kiểm tra', select('Theo sự kiện (khi submit)'), { required: true })}</div>
          <div class="spacer"></div>
          <div class="choice">${sw(true)}<span>Đang bật</span></div>
        </div>
        ${table(
          [
            { t: 'Người nhận', w: 'w-280' },
            { t: 'Nhận cảnh báo N+1', w: 'w-200', cls: 'tbl__th--center' },
            { t: 'Nhận cảnh báo N+2', w: 'w-200', cls: 'tbl__th--center' },
            { t: 'Kênh' },
          ],
          [
            ['PA / PM của nhiệm vụ', true, true, ['Email', 'Trong hệ thống', 'SMS']],
            ['GĐTT — Giám đốc Trung tâm', true, false, ['Email', 'Trong hệ thống']],
            ['BGĐ Khối', false, false, []],
            ['HR — Phòng Nhân sự', true, true, ['Email', 'Trong hệ thống']],
          ].map((x) => [
            x[0],
            { h: x[1] ? `<div class="checkbox checkbox--on">${ico('check', 14)}</div>` : '<div class="checkbox"></div>', cls: 'tbl__td--center' },
            { h: x[2] ? `<div class="checkbox checkbox--on">${ico('check', 14)}</div>` : '<div class="checkbox"></div>', cls: 'tbl__td--center' },
            `<div class="row" style="gap:4px">${x[3].length ? x[3].map((k) => tag(k, k === 'SMS' ? 'warning' : k === 'Email' ? 'info' : '', false)).join('') : '<span class="muted">—</span>'}</div>`,
          ]),
        )}
      </div>

      <div class="row" style="gap:20px;align-items:stretch">
        <div class="card grow">
          <div class="card__title">Luật 2 — Tỷ lệ PBNC của đơn vị</div>
          <div class="row row--wrap" style="gap:16px;align-items:flex-end">
            <div style="flex:0 0 180px">${field('Ngưỡng', input('70', { iconRight: 'chevron-down' }), { required: true, help: 'Đơn vị: %' })}</div>
            <div style="flex:0 0 200px">${field('Tần suất', select('Hàng tháng'), { required: true })}</div>
            <div class="spacer"></div>
            <div class="choice">${sw(true)}<span>Đang bật</span></div>
          </div>
          <div class="col" style="gap:6px">
            <div class="field__label">Người nhận</div>
            <div class="row row--wrap" style="gap:16px">
              <div class="choice"><div class="checkbox"></div><span class="muted">PA / PM</span></div>
              <div class="choice"><div class="checkbox checkbox--on">${ico('check', 14)}</div><span>GĐTT</span></div>
              <div class="choice"><div class="checkbox"></div><span class="muted">BGĐ Khối</span></div>
              <div class="choice"><div class="checkbox checkbox--on">${ico('check', 14)}</div><span>HR</span></div>
            </div>
          </div>
        </div>

        <div class="card grow">
          <div class="card__title">Luật 3 — Tỷ lệ PBNC của khối</div>
          <div class="row row--wrap" style="gap:16px;align-items:flex-end">
            <div style="flex:0 0 180px">${field('Ngưỡng', input('70', { iconRight: 'chevron-down' }), { required: true, help: 'Đơn vị: %' })}</div>
            <div style="flex:0 0 200px">${field('Tần suất', select('Hàng quý'), { required: true, help: 'Khác luật 2 — hàng quý, không phải hàng tháng.' })}</div>
            <div class="spacer"></div>
            <div class="choice">${sw(true)}<span>Đang bật</span></div>
          </div>
          <div class="col" style="gap:6px">
            <div class="field__label">Người nhận</div>
            <div class="row row--wrap" style="gap:16px">
              <div class="choice"><div class="checkbox"></div><span class="muted">PA / PM</span></div>
              <div class="choice"><div class="checkbox"></div><span class="muted">GĐTT</span></div>
              <div class="choice"><div class="checkbox checkbox--on">${ico('check', 14)}</div><span>BGĐ Khối</span></div>
              <div class="choice"><div class="checkbox checkbox--on">${ico('check', 14)}</div><span>HR</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert--warn">${ico('alert', 18)}
        <div class="alert__body"><div class="alert__title">Hai vai trò còn thiếu trong hệ thống</div>
        <div><strong>GĐTT (Giám đốc Trung tâm)</strong> và <strong>BGĐ Khối</strong> chưa có trong <code>core/models/roles.ts</code>. Phải bổ sung vào đúng file đó — không tự định nghĩa một danh sách vai trò thứ hai riêng cho thông báo.</div></div>
      </div>
    </div>`,
  );

/* ================================================= 53 · Cấu hình kênh gửi */
const cauHinhKenh = () =>
  frame(
    'kenh',
    `<div class="page">
      ${pageHead('Cấu hình kênh gửi', 'Model giữ đúng 4 kênh email | in_app | sms | zalo để sau này hợp nhất được với SendNotificationConfig, nhưng chỉ BẬT 3 kênh khách yêu cầu (BRD 4.9). Không tự nghĩ thêm kênh mới.', `${btn('Gửi thử', { icon: 'send', variant: 'secondary' })}${btn('Lưu cấu hình', { icon: 'check' })}`)}
      <div class="row" style="gap:20px;align-items:flex-start">
        <div class="card grow">
          <div class="card__head"><div class="row" style="gap:12px">${ico('mail', 20)}<div class="card__title">Email (SMTP)</div></div>${sw(true)}</div>
          <div class="row row--wrap" style="gap:16px">
            <div style="flex:1 1 240px">${field('Máy chủ SMTP', input('smtp.viettel.com.vn'), { required: true })}</div>
            <div style="flex:0 0 120px">${field('Cổng', input('587'), { required: true })}</div>
            <div style="flex:1 1 240px">${field('Tài khoản', input('qtkhcn-noreply@viettel.com.vn'), { required: true })}</div>
            <div style="flex:1 1 240px">${field('Mật khẩu', input('••••••••••••', { iconRight: 'eye' }), { required: true })}</div>
            <div style="flex:1 1 240px">${field('Tên người gửi', input('Hệ thống QTKHCN — VHT'))}</div>
            <div style="flex:0 0 200px">${field('Bảo mật', select('STARTTLS'))}</div>
          </div>
          <div class="row"><div class="choice">${sw(true)}<span>Ghi log toàn bộ email đã gửi</span></div></div>
        </div>

        <div class="card" style="flex:0 0 460px">
          <div class="card__head"><div class="row" style="gap:12px">${ico('bell', 20)}<div class="card__title">Thông báo trong hệ thống</div></div>${sw(true)}</div>
          ${field('Số ngày giữ thông báo', input('90'), { help: 'Quá hạn thì tự dọn khỏi trung tâm thông báo.' })}
          <div class="choice">${sw(true)}<span>Hiện badge số trên chuông ở topbar</span></div>
        </div>
      </div>

      <div class="row" style="gap:20px;align-items:flex-start">
        <div class="card grow">
          <div class="card__head"><div class="row" style="gap:12px">${ico('send', 20)}<div class="card__title">SMS (gateway)</div></div>${sw(true)}</div>
          <div class="row row--wrap" style="gap:16px">
            <div style="flex:1 1 260px">${field('Endpoint gateway', input('https://sms-gw.viettel.com.vn/api/v2/send'), { required: true })}</div>
            <div style="flex:1 1 200px">${field('Brandname', input('VIETTEL-CNC'), { required: true })}</div>
            <div style="flex:1 1 200px">${field('API key', input('••••••••••••••••', { iconRight: 'eye' }), { required: true })}</div>
            <div style="flex:0 0 200px">${field('Giới hạn/ngày', input('500'))}</div>
          </div>
          <div class="alert alert--warn">${ico('alert', 18)}
            <div class="alert__body">SMS chỉ dùng cho <strong>cảnh báo nhiệm vụ sắp hết nguồn</strong>. Bật SMS cho mẫu nhắc chấm công hàng tháng là 30 tin/người/tháng — khách sẽ tắt cả kênh.</div>
          </div>
        </div>

        <div class="card" style="flex:0 0 460px">
          <div class="card__head"><div class="row" style="gap:12px"><span class="muted">${ico('send', 20)}</span><div class="card__title muted">Zalo</div></div>${sw(false)}</div>
          <div class="alert">${ico('info', 18)}
            <div class="alert__body"><div class="alert__title">Giữ kênh trong model, tắt ở cấu hình</div>
            <div>BRD 4.9 chỉ yêu cầu Email, SMS và thông báo trong hệ thống — <strong>không có Zalo</strong>. Kênh này vẫn khai trong model vì <code>SendNotificationConfig</code> của phân hệ Quy trình có 4 kênh; bỏ đi là sau này không map thẳng được.</div></div>
          </div>
        </div>
      </div>
    </div>`,
  );

/* ============================================== 54 · Thông báo đã gửi */
const daGui = () =>
  frame(
    'da-gui',
    `<div class="page">
      ${pageHead('Thông báo đã gửi', 'Cột LÝ DO LỖI là bắt buộc — thông báo thất bại mà không nói vì sao thì không ai sửa được gì.', `${btn('Xuất Excel', { icon: 'download', variant: 'secondary' })}${btn('Gửi lại các bản lỗi', { icon: 'refresh' })}`)}
      <div class="card">
        <div class="stats">
          <div class="stat stat--ok"><small>Gửi thành công (30 ngày)</small><strong>1.842</strong></div>
          <div class="stat stat--warn"><small>Thất bại</small><strong>27</strong></div>
          <div class="stat"><small>Tỷ lệ thành công</small><strong>98,6%</strong></div>
          <div class="stat"><small>Kênh lỗi nhiều nhất</small><strong>SMS (21/27)</strong></div>
        </div>
        <div class="filters">
          ${select('Tất cả mẫu', { placeholder: true })}${select('Tất cả kênh', { placeholder: true })}${select('Trạng thái: Thất bại')}${search('Tìm người nhận')}
        </div>
        ${table(
          [
            { t: 'Thời điểm', w: 'w-160' },
            { t: 'Trạng thái', w: 'w-160', cls: 'tbl__th--center' },
            { t: 'Kênh', w: 'w-140', cls: 'tbl__th--center' },
            { t: 'Mẫu', w: 'w-260' },
            { t: 'Người nhận', w: 'w-220' },
            { t: 'Lý do lỗi' },
            { t: '', w: 'w-110' },
          ],
          [
            ['03/06 16:22', false, 'SMS', 'hr-nhiem-vu-sap-het-nguon', 'Đỗ Quang Huy · 098xxxx217', 'Gateway trả <code>ERR_QUOTA_EXCEEDED</code> — vượt giới hạn 500 tin/ngày lúc 16:20'],
            ['03/06 16:22', false, 'SMS', 'hr-nhiem-vu-sap-het-nguon', 'Phạm Văn Đức · 097xxxx781', 'Gateway trả <code>ERR_QUOTA_EXCEEDED</code> — vượt giới hạn 500 tin/ngày lúc 16:20'],
            ['03/06 16:22', true, 'Email', 'hr-nhiem-vu-sap-het-nguon', 'huydq@viettel.com.vn', '—'],
            ['03/06 16:22', true, 'Trong hệ thống', 'hr-nhiem-vu-sap-het-nguon', 'Đỗ Quang Huy', '—'],
            ['01/06 08:01', false, 'Email', 'hr-ty-le-pbnc-don-vi-thap', 'giamdoc.qdt@viettel.com.vn', 'SMTP <code>550 5.1.1</code> — hộp thư không tồn tại (nhân sự đã chuyển công tác)'],
            ['01/06 08:00', true, 'Email', 'hr-ty-le-pbnc-don-vi-thap', 'hant@viettel.com.vn', '—'],
            ['31/05 17:00', false, 'Trong hệ thống', 'hr-nhac-cham-cong', 'PA Trung tâm Quang điện tử', 'Không tìm thấy người dùng nào giữ vai trò <code>PA</code> ở đơn vị 9014088'],
          ].map((x) => [
            x[0],
            { h: x[1] ? tag('Gửi thành công', 'success') : tag('Thất bại', 'danger'), cls: 'tbl__td--center' },
            { h: tag(x[2], x[2] === 'SMS' ? 'warning' : x[2] === 'Email' ? 'info' : '', false), cls: 'tbl__td--center' },
            `<span class="code-link">${x[3]}</span>`,
            x[4],
            x[1] ? '<span class="muted">—</span>' : `<span style="color:var(--vht-brand-30)">${x[5]}</span>`,
            x[1] ? '' : `<div class="actions">${btn('Gửi lại', { icon: 'refresh', variant: 'secondary', sm: true })}</div>`,
          ]),
          { rowCls: (i) => ([0, 1, 4, 6].includes(i) ? 'tbl__row--warn' : '') },
        )}
        ${tableFoot(1869, { pages: [1, 2, 3, 4, '…', 75] })}
      </div>
    </div>`,
  ) +
  note('Ba lý do lỗi trên đây là ba loại khác nhau — và cần ba cách sửa khác nhau', [
    '<strong>Vượt hạn mức gateway</strong> ⇒ sửa ở cấu hình kênh (giới hạn/ngày) hoặc giãn lịch gửi. Gửi lại ngay sẽ lỗi tiếp.',
    '<strong>Hộp thư không tồn tại</strong> ⇒ dữ liệu người dùng cũ, sửa ở danh mục Nhân viên. Đây là lỗi <em>dữ liệu</em>, không phải lỗi <em>hệ thống</em>.',
    '<strong>Không tìm thấy người giữ vai trò</strong> ⇒ đơn vị chưa gán PA. Đây là lỗi <em>cấu hình tổ chức</em> — và là thứ đáng báo cho HR nhất, vì nó có nghĩa cả đơn vị đó đang không ai nhận thông báo.',
  ]);

/* ========================================= 55 · Trung tâm thông báo (panel chuông) */
const trungTam = () =>
  bare(
    `${U.topbar()}
      <div class="row" style="justify-content:flex-end;padding:8px 24px 48px;background:var(--vht-surface-2);align-items:flex-start">
        <div class="card" style="flex:0 0 420px;gap:0;padding:0;overflow:hidden">
          <div class="row row--between" style="padding:16px">
            <div class="card__title">Thông báo</div>
            <div class="row" style="gap:8px"><span class="code-link">Đánh dấu đã đọc</span>${ico('settings', 18)}</div>
          </div>
          <div class="tabs" style="padding:0 16px">
            <div class="tab tab--active">Chưa đọc <span class="badge">3</span></div>
            <div class="tab">Tất cả</div>
            <div class="tab">Cảnh báo</div>
          </div>
          ${[
            ['alert', 'danger', 'Nhiệm vụ DTPT-25-014 đã tiêu vượt nguồn CPNC', 'Nguồn còn lại -2.000.000 ₫. Đề nghị rà soát kế hoạch phân bổ.', '2 phút trước', true],
            ['clock', 'warning', 'Chấm công tháng 05 chờ bạn xác nhận', 'Trung tâm Kinh doanh Điều hành đã submit chấm công cho nhiệm vụ 011-24-TĐ-RDP-QS.', '1 giờ trước', true],
            ['check-circle', 'success', 'Trình ký VOffice thành công', 'Số văn bản 412/TTr-CNC — đang chờ lãnh đạo Khối 1 ký.', '3 giờ trước', true],
            ['info', '', 'Kỳ 2025-04 đã được mở lại', 'Nguyễn Thu Hà (HR) mở lại kỳ với lý do: bổ sung 3 nhân sự Trung tâm Camera bị sót.', 'Hôm qua', false],
            ['alert', 'warning', 'Tỷ lệ PBNC Phòng Tổng hợp 71,5% — sát ngưỡng', 'Ngưỡng cảnh báo hiện tại là 70%.', '2 ngày trước', false],
          ]
            .map(
              ([i, v, t, d, when, unread]) => `<div class="row" style="gap:12px;align-items:flex-start;padding:14px 16px;border-top:1px solid var(--vht-border);${unread ? 'background:var(--vht-brand-99)' : ''}">
                <span style="color:var(--vht-${v === 'danger' ? 'brand-50' : v === 'warning' ? 'warning-50' : v === 'success' ? 'success-50' : 'info-50'})">${ico(i, 20)}</span>
                <div class="col" style="gap:2px">
                  <div class="strong">${t}</div>
                  <div class="caption">${d}</div>
                  <div class="caption">${when}</div>
                </div>
                ${unread ? '<div style="width:8px;height:8px;border-radius:999px;background:var(--vht-brand-50);flex:0 0 8px;margin-top:6px"></div>' : ''}
              </div>`,
            )
            .join('')}
          <div class="row text-center" style="padding:12px;border-top:1px solid var(--vht-border);justify-content:center">
            <span class="code-link">Xem tất cả thông báo</span>
          </div>
        </div>
      </div>`,
  );

module.exports = [
  { code: '50', group: '5 · Cảnh báo & Thông báo', title: 'Kho mẫu thông báo', desc: 'Mã mẫu cùng quy ước với templateCode', body: mauList },
  { code: '51', group: '5 · Cảnh báo & Thông báo', title: 'Soạn mẫu thông báo', desc: 'Placeholder + biến khả dụng + xem trước', body: mauSoan },
  { code: '52', group: '5 · Cảnh báo & Thông báo', title: 'Cấu hình ngưỡng cảnh báo', desc: '3 luật, người nhận khác nhau từng luật', body: nguongCanhBao },
  { code: '53', group: '5 · Cảnh báo & Thông báo', title: 'Cấu hình kênh gửi', desc: '4 kênh trong model, bật 3 theo BRD', body: cauHinhKenh },
  { code: '54', group: '5 · Cảnh báo & Thông báo', title: 'Thông báo đã gửi', desc: 'Có cột lý do lỗi + nút gửi lại', body: daGui },
  { code: '55', group: '5 · Cảnh báo & Thông báo', title: 'Trung tâm thông báo', desc: 'Panel chuông ở topbar', body: trungTam },
];
