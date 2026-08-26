/* =============================================================================
 * 02 · Lớp phủ, hộp thoại và toast — sticker sheet thứ hai.
 *
 * Artboard 00 dựng thành phần TĨNH (màu, chữ, nút, bảng). Artboard này dựng những thứ **nổi lên
 * trên** màn: nền mờ, bốn cỡ hộp thoại, bốn mức toast, lớp phủ đang xử lý.
 *
 * Vì sao tách riêng: trong Figma đây là nhóm component khác hẳn — chúng luôn nằm trên một frame
 * khác, luôn dùng shadow 2xl, và luôn kèm nền mờ. Trộn chung với sticker sheet 00 thì người dựng
 * phải lọc lại bằng mắt.
 *
 * Các artboard 18 / 19 / 21 / 21B / 21C / 2B / 2C và 61 / 65 / 68 là **ví dụ dùng thật** của bộ
 * này, đặt đúng trên màn nền của chúng.
 * ========================================================================== */
const U = require('../lib/ui');
const { ico, bare, btn, input, select, field, tag, table, toast, note } = U;

const H2 = (t, sub) =>
  `<div class="col" style="gap:2px"><div class="section-title">${t}</div>` +
  `<div class="caption">${sub}</div></div>`;

const block = (title, sub, body) =>
  `<div class="col col--16">${H2(title, sub)}<div class="card">${body}</div></div>`;

/* Hộp thoại rút gọn — chỉ để đo cỡ, thân chỉ một dòng. */
const dlgSpec = (size, w, ten, dung) => `
  <div class="col" style="gap:8px">
    <div class="caption"><strong>${w}px</strong> · <code>.dialog--${size}</code> — ${dung}</div>
    <div class="dialog dialog--${size}">
      <div class="dialog__head"><div class="dialog__title">${ten}</div>${ico('x', 18)}</div>
      <div class="dialog__body"><div class="skel skel--line" style="width:70%"></div><div class="skel skel--text" style="width:90%"></div><div class="skel skel--text" style="width:52%"></div></div>
      <div class="dialog__foot">${btn('Huỷ', { variant: 'secondary' })}${btn('Đồng ý', { icon: 'check' })}</div>
    </div>
  </div>`;

const lopPhu = () =>
  bare(`
  <div class="content" style="gap:20px">
    <div class="page__head">
      <div class="page__titletext">
        <h1>Lớp phủ · Hộp thoại · Toast</h1>
        <p>Mọi thứ nổi lên trên màn. Import artboard này ngay sau <strong>00 — Sticker sheet</strong> rồi mới import các màn dùng chúng.</p>
      </div>
      <div class="page__actions">${tag('Import thứ hai', 'info')}</div>
    </div>

    ${block(
      '1 · Nền mờ (DIM)',
      'Một giá trị duy nhất cho toàn phân hệ: đen #1A1C1E ở 45%. Không đổi độ mờ theo từng màn — người dùng đọc độ mờ như "màn này đang bị chặn", đổi qua đổi lại là làm hỏng tín hiệu đó.',
      `
      <div class="row" style="gap:24px;align-items:flex-start">
        <div class="col grow" style="gap:8px">
          <div class="caption">Nền mờ phủ <strong>toàn bộ chiều cao artboard</strong>, kể cả artboard cao 3.000px. Hộp thoại căn ngang giữa, cách đỉnh <strong>120px</strong> — xấp xỉ vị trí thật của modal trong khung nhìn 800px, chứ không căn giữa theo chiều dọc của cả trang dài.</div>
          <div style="background:rgba(26,28,30,.45);padding:24px;display:flex;justify-content:center">
            <div class="dialog dialog--confirm">
              <div class="dialog__head"><div class="dialog__title">Hộp thoại nổi trên nền mờ</div>${ico('x', 18)}</div>
              <div class="dialog__body"><div class="caption">Đây chính là cách 10 artboard hộp thoại trong bộ này được dựng: màn thật ở dưới, mờ đi, hộp thoại ở trên.</div></div>
              <div class="dialog__foot">${btn('Huỷ', { variant: 'secondary' })}${btn('Đồng ý', { icon: 'check' })}</div>
            </div>
          </div>
        </div>
        <div class="col" style="gap:8px;flex:0 0 420px">
          <div class="strong">Thông số</div>
          <div class="desc" style="gap:8px 24px">
            <div class="desc__item"><div class="desc__label">Màu</div><div class="desc__value">rgba(26, 28, 30, 0.45)</div></div>
            <div class="desc__item"><div class="desc__label">Phủ</div><div class="desc__value">Toàn artboard, dưới cả topbar và sider</div></div>
            <div class="desc__item"><div class="desc__label">Cách đỉnh</div><div class="desc__value">120px</div></div>
            <div class="desc__item"><div class="desc__label">Đổ bóng hộp</div><div class="desc__value">shadow-2xl</div></div>
            <div class="desc__item"><div class="desc__label">Bo góc hộp</div><div class="desc__value">12px</div></div>
            <div class="desc__item"><div class="desc__label">Chiều cao header</div><div class="desc__value">60px, có kẻ dưới</div></div>
          </div>
        </div>
      </div>`,
    )}

    ${block(
      '2 · Bốn cỡ hộp thoại',
      'Bốn cỡ, không hơn. Mỗi lần thêm một cỡ mới là thêm một component nữa phải bảo trì trong Figma và một breakpoint nữa phải test.',
      `
      <div class="col col--16">
        <div class="row" style="gap:24px;align-items:flex-start">
          ${dlgSpec('confirm', 400, 'Xác nhận xoá', 'hộp xác nhận, cảnh báo phá huỷ')}
          ${dlgSpec('form', 520, 'Thêm mới nhân viên', 'form thêm/sửa một bản ghi')}
        </div>
        ${dlgSpec('wide', 900, 'Nhập danh mục từ Excel', 'preview import, bảng lỗi/cảnh báo, gợi ý nhân sự')}
        ${dlgSpec('picker', 1360, 'Chọn nhân sự', 'pop-up chọn dữ liệu có bảng + phân trang')}
      </div>`,
    )}

    ${block(
      '3 · Bốn mức toast',
      'Góc phải trên, top 76px (dưới topbar 60 + 16), cách mép phải 24px. Rộng 400px, xếp chồng dọc cách nhau 12px, toast mới nhất ở TRÊN. Toast nổi trên cả nền mờ của hộp thoại.',
      `
      <div class="col col--16">
        <div class="row row--wrap" style="gap:16px;align-items:flex-start">
          ${toast('success', 'Đã lưu bảng chấm công', 'Tháng 05/2025 · Trung tâm Chế tạo Điện tử Khí tài · 5 nhân sự, 90,0 công.')}
          ${toast('info', 'Đã gợi ý 5 nhân sự', 'Lấy theo tháng 04/2025 — tháng gần nhất có chấm công của đơn vị này.')}
        </div>
        <div class="row row--wrap" style="gap:16px;align-items:flex-start">
          ${toast('warn', 'Kỳ 05/2025 đang chốt', 'Còn 3/30 đơn vị chưa submit. Sau 25/06 kỳ sẽ khoá và không sửa được nữa.')}
          ${toast('error', 'Trình ký thất bại', 'HTTP 502 từ voffice-adapter lúc 15:41:08. Bản chấm công vẫn giữ nguyên trạng thái đã xác nhận.')}
        </div>
        <div class="alert alert--warn">${ico('alert', 18)}
          <div class="alert__body"><div class="alert__title">Toast lỗi không được phân biệt bằng màu</div>
          <div>Ramp <strong>brand</strong> và <strong>danger</strong> của design system trùng nhau (#EE0033) ⇒ viền trái đỏ của toast lỗi trông y hệt một toast thương hiệu. Tiêu đề <strong>bắt buộc</strong> mở đầu bằng "Lỗi" / "Thất bại" / "Không …", và phải nêu <em>cái gì hỏng, lúc nào, dữ liệu có mất không</em>.</div></div>
        </div>
      </div>`,
    )}

    ${block(
      '4 · Toast xếp chồng',
      'Nhiều toast cùng lúc là chuyện thường khi import: một dòng kết quả, một dòng cảnh báo. Xếp dọc, không gộp.',
      `
      <div class="col" style="gap:12px;align-items:flex-end">
        ${toast('success', 'Đã nhập 1.164 dòng', 'Bảng công tháng 05/2025 · file BM0_T05_2025_v2.xlsx.')}
        ${toast('warn', 'Bỏ qua 9 dòng lỗi chặn', 'Mã NV không có trong danh mục Nhân viên. Tải file lỗi chi tiết để rà.')}
        ${toast('info', 'Ghi 6 ký hiệu công lạ vào "chờ khai báo"', 'Vào Danh mục › Ký hiệu công để duyệt.')}
      </div>`,
    )}

    ${block(
      '5 · Lớp phủ đang xử lý',
      'Dùng thanh tiến trình XÁC ĐỊNH, không dùng spinner: spinner là hoạt ảnh, ảnh tĩnh chỉ ra một cung tròn cụt và Figma cũng không dựng được hoạt ảnh.',
      `
      <div style="background:rgba(26,28,30,.45);padding:24px;display:flex;justify-content:center">
        <div class="overlay-busy">
          ${ico('upload', 28)}
          <div class="col" style="gap:4px;align-items:center">
            <div class="strong">Đang nhập bảng công tháng 05/2025</div>
            <div class="caption">Đã xử lý 742 / 1.184 dòng · còn khoảng 25 giây</div>
          </div>
          <div class="progress"><div class="progress__bar" style="width:63%"></div></div>
          <div class="caption">Đừng đóng trình duyệt. Import ghi đè theo kỳ nên dừng nửa chừng là kỳ ở trạng thái dở dang.</div>
        </div>
      </div>`,
    )}

    ${block(
      '6 · Giải phẫu hộp xác nhận phá huỷ',
      'Ba thứ bắt buộc, vì màu không dùng được để cảnh báo trong design system này.',
      `
      <div class="row" style="gap:24px;align-items:flex-start">
        <div class="dialog dialog--confirm" style="flex:0 0 400px">
          <div class="dialog__head"><div class="dialog__title">Xoá nhiệm vụ</div>${ico('x', 18)}</div>
          <div class="dialog__body">
            <div>Xoá nhiệm vụ <strong>011-24-TĐ-RDP-QS</strong> — Nghiên cứu chế tạo khối thu phát cao tần? Thao tác này <strong>không hoàn tác được</strong>.</div>
            <div class="caption">Nhiệm vụ đang có <strong>4 nội dung công việc</strong> và <strong>8 dòng phân công nhân sự</strong> — tất cả sẽ bị xoá theo.</div>
          </div>
          <div class="dialog__foot">${btn('Huỷ', { variant: 'secondary' })}${btn('Xoá nhiệm vụ', { icon: 'trash' })}</div>
        </div>
        <div class="col grow" style="gap:12px">
          <div class="alert">${ico('info', 18)}
            <div class="alert__body"><div class="alert__title">1 · Nêu đích danh bản ghi</div>
            <div>Mã + tên, in đậm. "Bạn có chắc không?" không cho người dùng biết họ đang xoá cái gì — và người dùng thường mở nhầm dòng.</div></div>
          </div>
          <div class="alert">${ico('info', 18)}
            <div class="alert__body"><div class="alert__title">2 · Nói con số sẽ mất theo</div>
            <div>4 nội dung công việc, 8 dòng phân công. Đây là thứ quyết định người ta bấm Huỷ hay bấm Xoá.</div></div>
          </div>
          <div class="alert">${ico('info', 18)}
            <div class="alert__body"><div class="alert__title">3 · Nút mang tên hành động</div>
            <div><em>"Xoá nhiệm vụ"</em>, không phải <em>"OK"</em> hay <em>"Đồng ý"</em>. Với thao tác nặng hơn (đè cả kỳ, mở lại kỳ đã khoá) thì thêm ô tích xác nhận và ô lý do bắt buộc — xem artboard 21 và 21B.</div></div>
          </div>
        </div>
      </div>`,
    )}
  </div>`) +
  note('Vì sao artboard này phải import sớm', [
    'Bốn cỡ hộp thoại và bốn mức toast ở đây là <strong>component gốc</strong>. Dựng chúng thành Component trong Figma trước, rồi mọi artboard hộp thoại sau này chỉ là instance đổi nội dung.',
    'Bỏ qua bước này thì file Figma sẽ có 10 hộp thoại "gần giống nhau" — sửa bo góc một lần phải sửa 10 chỗ.',
    'Nền mờ và toast là hai layer duy nhất trong cả bộ mockup được phép ra khỏi luồng bố cục (luật 2 của <code>app.css</code>). Trong Figma chúng thành layer "absolute position" bên trong Auto Layout của frame — đúng cách Figma mô tả overlay, không cần dọn tay.',
  ]);

module.exports = {
  code: '02',
  group: '0 · Nền tảng',
  title: 'Lớp phủ hộp thoại và toast',
  desc: 'Nền mờ · 4 cỡ dialog · 4 mức toast · lớp phủ đang xử lý',
  body: lopPhu,
};
