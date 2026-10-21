const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, VerticalAlign, PageOrientation
} = require("docx");

const FONT = "Times New Roman";

function P(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 80, ...(opts.spacing || {}) },
    alignment: opts.alignment,
    children: [new TextRun({ text, bold: !!opts.bold, italics: !!opts.italics, size: opts.size || 20, font: FONT, color: opts.color })],
  });
}
function multiP(lines, opts = {}) {
  return lines.map((l, i) => P(l, { ...opts, spacing: { after: i === lines.length - 1 ? 0 : 60 } }));
}
const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
};
function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: "D9E2F3" },
    verticalAlign: VerticalAlign.CENTER,
    borders: cellBorder,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [P(text, { bold: true, size: 20, alignment: AlignmentType.CENTER })],
  });
}
function bodyCell(content, width, opts = {}) {
  const children = Array.isArray(content) ? multiP(content, { size: 19 }) : [P(content, { size: 19 })];
  return new TableCell({ width: { size: width, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, borders: cellBorder, margins: { top: 60, bottom: 60, left: 80, right: 80 }, children, ...opts });
}
const W = [500, 1700, 1500, 900, 2500, 2900, 2400, 2000];
const HEADERS = ["STT", "Tên thành phần", "Kiểu dữ liệu\n[Độ dài]", "I/O", "Mô tả", "Quy tắc xử lý dữ liệu", "Nguyên tắc hiển thị", "Mapping CSDL/API"];
function componentTable(rows) {
  const headerRow = new TableRow({ tableHeader: true, children: HEADERS.map((h, i) => headerCell(h, W[i])) });
  const bodyRows = rows.map((r, idx) => new TableRow({
    children: [
      bodyCell(String(idx + 1), W[0]), bodyCell(r.name, W[1]), bodyCell(r.type, W[2]), bodyCell(r.io, W[3]),
      bodyCell(r.desc, W[4]), bodyCell(r.rule, W[5]), bodyCell(r.display, W[6]), bodyCell(r.mapping, W[7]),
    ],
  }));
  return new Table({ width: { size: 14400, type: WidthType.DXA }, rows: [headerRow, ...bodyRows] });
}
function H1(text) {
  return new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 300, after: 160 }, children: [new TextRun({ text, bold: true, font: FONT, size: 26, color: "C00000" })] });
}
function H(text, level) {
  return new Paragraph({ heading: level, spacing: { before: 240, after: 120 }, children: [new TextRun({ text, bold: true, font: FONT })] });
}
function subLabel(text) {
  return new Paragraph({ spacing: { before: 160, after: 80 }, children: [new TextRun({ text, bold: true, italics: true, font: FONT, size: 21 })] });
}
function note(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, italics: true, font: FONT, size: 19, color: "808080" })] });
}
function numbered(lines) {
  return lines.map((l, i) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `${i + 1}. ${l}`, font: FONT, size: 20 })] }));
}
function bullet(text, indent = 400) {
  return new Paragraph({ indent: { left: indent }, spacing: { after: 60 }, children: [new TextRun({ text: `- ${text}`, font: FONT, size: 20 })] });
}

// ================= 1. MOD - QUẢN LÝ QUY TRÌNH =================

const dsQuyTrinhToolbar = [
  {
    name: "Nút \"Xuất excel\"", type: "Button", io: "Input",
    desc: "Xuất danh sách quy trình (theo điều kiện tìm kiếm hiện tại) ra file Excel.",
    rule: "Áp dụng nguyên tắc xử lý số lượng bản ghi lớn tương tự màn hình Danh sách tài khoản (tài liệu UM01, mục 4.4); ngưỡng số bản ghi cụ thể cho màn hình này cần xác nhận thêm (xem mục Vấn đề còn mở).",
    display: "Nút dạng outline, đặt bên trái nút \"Đồng bộ từ Camunda\", góc phải trên cùng.",
    mapping: "N/A (export action)",
  },
  {
    name: "Nút \"Đồng bộ từ Camunda\"", type: "Button", io: "Input",
    desc: "Đồng bộ danh sách quy trình (định nghĩa BPMN) từ Camunda Workflow Engine vào hệ thống QTKHCN.",
    rule: "Gọi API đồng bộ với Camunda; hiển thị loading trong khi đồng bộ; sau khi đồng bộ xong, cập nhật lại bảng danh sách (thêm quy trình mới, cập nhật SL Phiên bản/Trạng thái của quy trình đã có). Kịch bản xử lý khi trùng mã quy trình đã tồn tại (ghi đè hay tạo phiên bản mới) cần xác nhận thêm.",
    display: "Nút màu đỏ (primary), icon dấu \"+\", góc phải trên cùng.",
    mapping: "N/A (đồng bộ qua Camunda API)",
  },
  {
    name: "Ô tìm kiếm", type: "Textbox", io: "Input",
    desc: "Tìm kiếm quy trình theo Mã quy trình, Mã Camunda hoặc Tên quy trình.",
    rule: "Tìm kiếm gần đúng (LIKE), không phân biệt hoa/thường; debounce trước khi gọi API.",
    display: "Đặt trong card danh sách, góc phải phía trên bảng.",
    mapping: "QuyTrinh.ma_quy_trinh, QuyTrinh.ma_camunda, QuyTrinh.ten_quy_trinh",
  },
];

const dsQuyTrinhGrid = [
  { name: "STT", type: "Label", io: "Output", desc: "Số thứ tự dòng.", rule: "Tính theo trang hiện tại.", display: "Căn giữa.", mapping: "N/A" },
  {
    name: "Mã quy trình", type: "Label", io: "Output", desc: "Hiển thị mã quy trình (VD \"RD02_02\").",
    rule: "Mã lấy theo cấu hình BPMN đã đồng bộ. Lưu ý: màn hình này hiển thị mã dạng gạch dưới (VD \"RD02_02\"), trong khi màn hình Chi tiết quy trình (mục 1.2) hiển thị dạng dấu chấm (VD \"RD02.02\") — cần chuẩn hoá thống nhất 1 định dạng (xem mục Vấn đề còn mở).",
    display: "Nếu dài, cắt bớt + tooltip.", mapping: "QuyTrinh.ma_quy_trinh",
  },
  { name: "Mã Camunda", type: "Label", io: "Output", desc: "Định danh quy trình trong Camunda (process definition id).", rule: "N/A", display: "Chuỗi dài, có thể cắt + tooltip.", mapping: "QuyTrinh.ma_camunda" },
  { name: "Tên quy trình", type: "Label", io: "Output", desc: "Tên quy trình nghiệp vụ.", rule: "N/A", display: "Cắt + tooltip nếu dài.", mapping: "QuyTrinh.ten_quy_trinh" },
  {
    name: "SL Phiên bản", type: "Label", io: "Output", desc: "Tổng số phiên bản BPMN đã đồng bộ của quy trình.",
    rule: "Đếm số bản ghi trong bảng lịch sử phiên bản của quy trình (mục 1.2).", display: "Căn giữa.", mapping: "COUNT(QuyTrinh_PhienBan) theo ma_quy_trinh",
  },
  {
    name: "SL đang xử lý", type: "Label", io: "Output", desc: "Số hồ sơ/instance đang chạy theo quy trình này tại thời điểm hiện tại.",
    rule: "Lấy từ Camunda Operate API (số process instance có trạng thái ACTIVE) hoặc qua đồng bộ định kỳ — tần suất cập nhật cụ thể cần xác nhận thêm.",
    display: "Căn giữa.", mapping: "Camunda Operate API (process instance count, status = ACTIVE)",
  },
  {
    name: "Trạng thái", type: "Badge", io: "Output", desc: "Trạng thái hoạt động của quy trình: \"Đang chạy\" / \"Đã dừng\".",
    rule: "N/A", display: "\"Đang chạy\": chip nền xanh; \"Đã dừng\": chip nền vàng/cam.", mapping: "QuyTrinh.trang_thai",
  },
  { name: "Thao tác", type: "Icon Button", io: "Output", desc: "Icon con mắt để xem chi tiết quy trình.", rule: "Click chuyển sang màn hình Chi tiết quy trình (mục 1.2) tương ứng.", display: "Icon nhỏ cuối dòng.", mapping: "N/A" },
];

const chiTietQuyTrinhRows = [
  { name: "Mã quy trình", type: "Label", io: "Output", desc: "Mã quy trình đang xem (VD \"RD02.02\").", rule: "N/A", display: "Text đậm, đầu trang.", mapping: "QuyTrinh.ma_quy_trinh" },
  { name: "Tên quy trình", type: "Label", io: "Output", desc: "Tên quy trình (VD \"Xét duyệt NVKHCN cấp Tập đoàn\").", rule: "N/A", display: "Text đậm, cạnh Mã quy trình.", mapping: "QuyTrinh.ten_quy_trinh" },
  {
    name: "Khung sơ đồ BPMN", type: "Diagram Viewer", io: "Output",
    desc: "Hiển thị sơ đồ BPMN dạng swimlane của phiên bản quy trình đang chọn (mặc định phiên bản hiện hành mới nhất).",
    rule: "Render từ dữ liệu BPMN XML lấy từ Camunda/lưu trữ hệ thống; hỗ trợ zoom in/out/fit-to-screen và kéo/cuộn xem chi tiết.",
    display: "Khung lớn chiếm phần chính màn hình.", mapping: "QuyTrinh_PhienBan.bpmn_xml",
  },
  { name: "Nút Zoom in / Zoom out / Fit to screen", type: "Icon Button", io: "Input", desc: "Phóng to / thu nhỏ / canh giữa sơ đồ BPMN.", rule: "Xử lý hoàn toàn phía client, không gọi API.", display: "Nhóm icon nhỏ, góc trên trái khung sơ đồ.", mapping: "N/A" },
  {
    name: "Toggle \"Thuộc tính nâng cao\"", type: "Toggle Switch", io: "Input",
    desc: "Bật/tắt hiển thị thêm thông tin thuộc tính kỹ thuật (id node, condition expression BPMN...).",
    rule: "Khi bật, panel \"Thuộc tính phần tử\" hiển thị thêm các trường kỹ thuật nâng cao.",
    display: "Đặt góc trên phải khung sơ đồ, mặc định ở trạng thái bật (ON).", mapping: "N/A",
  },
  {
    name: "Panel \"Lịch sử phiên bản\"", type: "List/Timeline", io: "Output",
    desc: "Liệt kê các phiên bản BPMN đã đồng bộ của quy trình, mới nhất hiển thị trên cùng.",
    rule: "Mỗi phiên bản gồm: số phiên bản (v4.0, v3.0...), nhãn trạng thái \"Hiện hành\", tên quy trình theo phiên bản, nhãn phiên bản (VD \"Sửa đổi lần 2\"), thời điểm cập nhật. Toàn bộ các phiên bản trong ảnh chụp đều mang nhãn \"Hiện hành\" — cần làm rõ tiêu chí gắn nhãn này (chỉ phiên bản mới nhất mới là \"hiện hành\", hay mọi phiên bản đã đồng bộ và còn hiệu lực đều được coi là \"hiện hành\"?) — xem mục Vấn đề còn mở.",
    display: "Dạng timeline, chấm tròn màu xanh, badge \"Hiện hành\" nền xanh lá.", mapping: "QuyTrinh_PhienBan (ma_quy_trinh, phien_ban, ten_quy_trinh, nhan_phien_ban, thoi_diem_cap_nhat, trang_thai)",
  },
  {
    name: "Panel \"Thuộc tính phần tử\"", type: "Detail Panel", io: "Output",
    desc: "Hiển thị thuộc tính chi tiết của 1 phần tử (task/gateway/event...) trên sơ đồ BPMN khi được người dùng chọn.",
    rule: "Mặc định hiển thị \"Chưa chọn phần tử\" kèm hướng dẫn \"Chọn một node trên sơ đồ để xem cấu hình thuộc tính\". Khi người dùng click chọn 1 node, panel cập nhật hiển thị thuộc tính tương ứng. Danh sách cụ thể các trường sẽ hiển thị khi đã chọn phần tử chưa có trong ảnh chụp — cần bổ sung ảnh minh họa để mô tả đầy đủ (xem mục Vấn đề còn mở).",
    display: "Panel bên phải, phía dưới \"Lịch sử phiên bản\".", mapping: "Cần xác nhận thêm",
  },
  { name: "Nút \"Thoát\"", type: "Button", io: "Input", desc: "Thoát khỏi màn hình Chi tiết quy trình.", rule: "Quay lại màn hình Danh sách quy trình (mục 1.1).", display: "Nút outline đỏ, góc phải trên cùng.", mapping: "N/A" },
];

// ================= 2. MA TRẬN PHÊ DUYỆT =================

const dsLoaiPheDuyetGrid = [
  { name: "STT", type: "Label", io: "Output", desc: "Số thứ tự dòng.", rule: "N/A", display: "Căn giữa.", mapping: "N/A" },
  { name: "Mã loại phê duyệt", type: "Label", io: "Output", desc: "Mã định danh loại phê duyệt (VD \"THAM_DINH\").", rule: "Duy nhất trong hệ thống.", display: "N/A", mapping: "LoaiPheDuyet.ma_loai_pd" },
  { name: "Tên loại phê duyệt", type: "Label", io: "Output", desc: "Tên loại phê duyệt (VD \"Thẩm định hồ sơ\").", rule: "N/A", display: "Cắt + tooltip nếu dài.", mapping: "LoaiPheDuyet.ten_loai_pd" },
  { name: "Ngày tạo", type: "Label", io: "Output", desc: "Ngày tạo bản ghi.", rule: "N/A", display: "Định dạng dd/MM/yyyy.", mapping: "LoaiPheDuyet.ngay_tao" },
  {
    name: "Ngày cập nhật", type: "Label", io: "Output", desc: "Ngày cập nhật gần nhất.",
    rule: "Lưu ý: trong dữ liệu mẫu, 2 dòng đầu (THAM_DINH, XET_DUYET) hiển thị đúng định dạng ngày tháng, nhưng 5 dòng \"SUBMIT\" phía dưới lại hiển thị giá trị số (\"10\") tại cả 2 cột Ngày tạo/Ngày cập nhật — nghi ngờ là lỗi hiển thị dữ liệu demo, cần xác nhận lại với đội phát triển (xem mục Vấn đề còn mở).",
    display: "Định dạng dd/MM/yyyy.", mapping: "LoaiPheDuyet.ngay_cap_nhat",
  },
  { name: "Trạng thái", type: "Badge", io: "Output", desc: "Trạng thái hoạt động (VD \"Đang chạy\").", rule: "N/A", display: "Chip nền xanh.", mapping: "LoaiPheDuyet.trang_thai" },
  { name: "Thao tác", type: "Icon Button", io: "Output", desc: "Icon con mắt xem chi tiết loại phê duyệt.", rule: "N/A", display: "Icon nhỏ cuối dòng.", mapping: "N/A" },
];

const dsLoaiPheDuyetToolbar = [
  { name: "Nút \"Xuất excel\"", type: "Button", io: "Input", desc: "Xuất danh sách loại phê duyệt ra file Excel.", rule: "Áp dụng nguyên tắc tương tự các màn hình xuất Excel khác trong hệ thống.", display: "Nút outline.", mapping: "N/A" },
  { name: "Nút \"+ Thêm mới\"", type: "Button", io: "Input", desc: "Tạo mới một loại phê duyệt.", rule: "Chuyển sang màn hình \"Thêm mới loại phê duyệt\" — màn hình này chưa có ảnh chụp, cần bổ sung để mô tả đầy đủ các trường nhập liệu.", display: "Nút primary đỏ, góc phải trên cùng.", mapping: "N/A" },
  { name: "Ô tìm kiếm", type: "Textbox", io: "Input", desc: "Tìm kiếm theo Mã loại phê duyệt/Tên loại phê duyệt.", rule: "Tìm kiếm gần đúng.", display: "Góc phải phía trên bảng.", mapping: "LoaiPheDuyet.ma_loai_pd, LoaiPheDuyet.ten_loai_pd" },
];

const taoLuatPheDuyetRows = [
  { name: "Tên luật *", type: "Combobox", io: "Input", desc: "Tên định danh của luật phê duyệt cần tạo (VD \"Thẩm định cấp cơ sở\").", rule: "Bắt buộc chọn/nhập.", display: "Dropdown, hỗ trợ tìm kiếm.", mapping: "LuatPheDuyet.ten_luat" },
  {
    name: "Mã loại phê duyệt *", type: "Combobox", io: "Input", desc: "Chọn loại phê duyệt áp dụng, lấy từ danh mục Loại phê duyệt (mục 2.1) (VD \"THAM_DINH\").",
    rule: "Bắt buộc chọn. Khi chọn, hệ thống tự động điền trường \"Tên loại phê duyệt\" tương ứng.", display: "Dropdown, hỗ trợ tìm kiếm.", mapping: "LuatPheDuyet.ma_loai_pd (FK LoaiPheDuyet.ma_loai_pd)",
  },
  {
    name: "Tên loại phê duyệt *", type: "Combobox/Label", io: "Output (đề xuất readonly)", desc: "Hiển thị tên loại phê duyệt tương ứng với Mã loại phê duyệt đã chọn (VD \"Thẩm định hồ sơ\").",
    rule: "Cần xác nhận: trường này cho phép chọn độc lập, hay chỉ tự sinh readonly theo Mã loại phê duyệt (đề xuất readonly để tránh sai lệch dữ liệu).", display: "Dropdown/label.", mapping: "LoaiPheDuyet.ten_loai_pd",
  },
  {
    name: "Cấu hình luật phê duyệt (Condition Builder)", type: "Dynamic Rows", io: "Input",
    desc: "Xây dựng biểu thức điều kiện áp dụng luật phê duyệt, gồm nhiều dòng điều kiện có thể kết hợp VÀ/HOẶC.",
    rule: "Dòng đầu tiên gồm [Trường điều kiện] - [Toán tử so sánh] - [Giá trị]. Từ dòng thứ 2 trở đi, thêm cột đầu [Toán tử logic: VÀ/HOẶC] để nối với điều kiện phía trên. Nút \"+\" thêm dòng điều kiện mới; nút nhánh (branch) tạo nhóm điều kiện lồng nhau; nút thùng rác xoá dòng điều kiện. Danh sách giá trị cụ thể cho [Trường điều kiện] (VD \"Cấp nhiệm vụ\", \"Loại hồ sơ\") và các [Giá trị] tương ứng (VD \"Cơ sở\", \"Xét duyệt\") lấy từ danh mục nào chưa được xác nhận — cần bổ sung.",
    display: "Mỗi dòng là 1 hàng ngang gồm các ô dropdown/input cạnh nhau, có viền phân tách.", mapping: "LuatPheDuyet_DieuKien (1-N với LuatPheDuyet)",
  },
  { name: "Nhóm phê duyệt *", type: "Combobox", io: "Input", desc: "Chọn nhóm/vai trò sẽ thực hiện phê duyệt khi điều kiện luật thỏa mãn (VD \"Chuyên quản KHCN\").", rule: "Bắt buộc chọn.", display: "Dropdown, hỗ trợ tìm kiếm.", mapping: "LuatPheDuyet.nhom_pd_id (FK)" },
  { name: "Nút \"Hủy\"", type: "Button", io: "Input", desc: "Hủy thao tác tạo mới.", rule: "Quay lại màn hình trước đó; đề xuất hỏi xác nhận nếu đã có thay đổi dữ liệu — cần xác nhận.", display: "Nút outline.", mapping: "N/A" },
  { name: "Nút \"Lưu\"", type: "Button", io: "Input", desc: "Lưu luật phê duyệt mới.", rule: "Validate toàn bộ trường bắt buộc và cấu hình điều kiện (không có dòng thiếu Trường/Toán tử/Giá trị) trước khi lưu.", display: "Nút primary đỏ.", mapping: "N/A" },
];

const chiTietLuatPheDuyetRows = [
  { name: "Tên luật phê duyệt", type: "Label", io: "Output", desc: "Tên luật phê duyệt đang xem.", rule: "N/A", display: "Text tĩnh (readonly).", mapping: "LuatPheDuyet.ten_luat" },
  { name: "Mã loại phê duyệt", type: "Label", io: "Output", desc: "Mã loại phê duyệt áp dụng.", rule: "N/A", display: "Text tĩnh.", mapping: "LuatPheDuyet.ma_loai_pd" },
  { name: "Tên loại phê duyệt", type: "Label", io: "Output", desc: "Tên loại phê duyệt áp dụng.", rule: "N/A", display: "Text tĩnh.", mapping: "LoaiPheDuyet.ten_loai_pd" },
  { name: "Cấu hình luật phê duyệt", type: "Dynamic Rows (readonly)", io: "Output", desc: "Hiển thị lại toàn bộ cấu hình điều kiện đã lưu.", rule: "Không cho chỉnh sửa ở chế độ xem.", display: "Giống mục 2.2 nhưng disabled.", mapping: "LuatPheDuyet_DieuKien" },
  { name: "Nhóm phê duyệt", type: "Label", io: "Output", desc: "Nhóm phê duyệt áp dụng.", rule: "N/A", display: "Text tĩnh.", mapping: "LuatPheDuyet.nhom_pd_id" },
  { name: "Nút \"Hủy\"", type: "Button", io: "Input", desc: "Thoát khỏi màn hình chi tiết.", rule: "Quay lại danh sách.", display: "Nút outline.", mapping: "N/A" },
  { name: "Nút \"Chỉnh sửa\"", type: "Button", io: "Input", desc: "Chuyển màn hình sang chế độ chỉnh sửa.", rule: "Form chuyển sang trạng thái nhập liệu như mục 2.2, dữ liệu hiện tại được điền sẵn; chỉ hiển thị nếu người dùng có quyền chỉnh sửa luật phê duyệt.", display: "Nút primary đỏ.", mapping: "N/A" },
];

// ================= 3. MA TRẬN HÀNH ĐỘNG =================

const taoLuatHienThiNutRows = [
  { name: "Hành động *", type: "Combobox", io: "Input", desc: "Chọn hành động nghiệp vụ áp dụng luật (VD \"Gửi duyệt (SUBMIT)\").", rule: "Danh sách lấy từ Danh mục nút (mục 3.3). Bắt buộc chọn.", display: "Dropdown, hỗ trợ tìm kiếm.", mapping: "LuatHienThiNut.ma_hanh_dong (FK DanhMucNut.ma_nut)" },
  { name: "Tên hiển thị *", type: "Textbox", io: "Input", desc: "Tên nút sẽ hiển thị trên giao diện (VD \"Trình duyệt\").", rule: "Có thể khác với Tên mặc định của hành động, cho phép tùy biến theo màn hình/ngữ cảnh sử dụng.", display: "Input text.", mapping: "LuatHienThiNut.ten_hien_thi" },
  { name: "Loại *", type: "Combobox", io: "Input", desc: "Phân loại nút (VD \"Hành động chính\").", rule: "Bắt buộc chọn; danh sách đầy đủ các giá trị (VD Hành động chính/Hành động phụ...) cần xác nhận thêm.", display: "Dropdown.", mapping: "LuatHienThiNut.loai" },
  { name: "Sắc thái *", type: "Combobox", io: "Input", desc: "Kiểu màu sắc/mức độ nhấn mạnh của nút (VD \"Chính\").", rule: "Bắt buộc chọn; danh sách đầy đủ giá trị (VD Chính/Phụ/Cảnh báo/Nguy hiểm...) cần xác nhận thêm.", display: "Dropdown.", mapping: "LuatHienThiNut.sac_thai" },
  { name: "Màn hình hiển thị *", type: "Combobox", io: "Input", desc: "Chọn màn hình mà nút sẽ xuất hiện (VD \"Chi tiết Hồ sơ\").", rule: "Bắt buộc chọn; danh mục các màn hình trong hệ thống.", display: "Dropdown.", mapping: "LuatHienThiNut.ma_man_hinh" },
  { name: "Quy trình áp dụng", type: "Combobox", io: "Input", desc: "Chọn quy trình BPMN mà luật áp dụng (VD \"RD02.02 - Quy trình xét duyệt NCKHCN Cấp tập đoàn\").", rule: "Không bắt buộc (không có dấu *) — cần xác nhận phạm vi áp dụng của luật khi để trống trường này.", display: "Dropdown, hỗ trợ tìm kiếm.", mapping: "LuatHienThiNut.ma_quy_trinh (FK QuyTrinh)" },
  { name: "Bước trong điều kiện", type: "Combobox", io: "Input", desc: "Chọn bước/node BPMN cụ thể trong quy trình mà luật áp dụng (VD \"t1-Khởi tạo\").", rule: "Danh sách phụ thuộc vào Quy trình áp dụng đã chọn (load động theo quy trình).", display: "Dropdown.", mapping: "LuatHienThiNut.ma_buoc_bpmn" },
  { name: "Biểu mẫu sử dụng", type: "Combobox", io: "Input", desc: "Chọn biểu mẫu (form) áp dụng luật (VD \"BM02 - Tạo hồ sơ\").", rule: "N/A", display: "Dropdown.", mapping: "LuatHienThiNut.ma_bieu_mau" },
  { name: "Vai trò", type: "Multi-select Combobox", io: "Input", desc: "Chọn (các) vai trò được áp dụng luật hiển thị nút này.", rule: "Để trống mặc định áp dụng cho tất cả vai trò có quyền truy cập màn hình tương ứng — cần xác nhận.", display: "Dropdown multi-select, placeholder \"Chọn vai trò\".", mapping: "LuatHienThiNut_VaiTro (N-N)" },
];

const doiSoatBpmnToolbar = [
  { name: "Dropdown chọn quy trình", type: "Combobox", io: "Input", desc: "Chọn quy trình BPMN cần đối soát luật hành động (VD \"RD02.02\").", rule: "Khi chọn, bảng bên dưới load lại danh sách các bước/nhánh kết quả của quy trình đó.", display: "Dropdown, đặt cạnh tiêu đề card.", mapping: "N/A (điều hướng dữ liệu bảng)" },
  { name: "Ô tìm kiếm", type: "Textbox", io: "Input", desc: "Tìm kiếm theo Bước BPMN/Nhánh kết quả.", rule: "Tìm kiếm gần đúng.", display: "Góc phải phía trên bảng.", mapping: "N/A" },
  {
    name: "Nút \"+ Tạo luật từ BPMN\"", type: "Button", io: "Input", desc: "Tự động khởi tạo luật hiển thị nút (mục 3.1) dựa trên các bước/nhánh kết quả của BPMN đang ở trạng thái \"Thiếu luật\".",
    rule: "Chỉ áp dụng cho các dòng \"Thiếu luật\" (có thể chọn checkbox trước khi tạo — cần xác nhận thao tác chọn nhiều dòng); sau khi tạo, cập nhật lại trạng thái dòng tương ứng thành \"Đã khớp\".",
    display: "Nút primary đỏ, góc phải trên cùng.", mapping: "N/A",
  },
];

const doiSoatBpmnGrid = [
  { name: "Bước BPMN", type: "Label", io: "Output", desc: "Tên bước/task trong sơ đồ BPMN (VD \"Thẩm định chuyên môn và hoàn chỉnh HSXD dự thảo 2\").", rule: "N/A", display: "Cắt + tooltip nếu dài.", mapping: "QuyTrinh_Buoc.ten_buoc" },
  { name: "Nhánh kết quả", type: "Label", io: "Output", desc: "Mã nhánh gateway kết quả của bước (VD \"APPROVE_STEP\", \"REJECT_STEP\").", rule: "N/A", display: "N/A", mapping: "QuyTrinh_Buoc.ma_nhanh" },
  { name: "Hành động kỳ vọng", type: "Label", io: "Output", desc: "Tên hành động nghiệp vụ tương ứng với nhánh kết quả (VD \"Đồng ý duyệt\", \"Từ chối duyệt\").", rule: "Suy ra theo quy ước mapping giữa Nhánh kết quả và Danh mục nút.", display: "N/A", mapping: "DanhMucNut.ten_mac_dinh (qua mapping nhánh)" },
  { name: "Luật khớp", type: "Label", io: "Output", desc: "Mã luật hiển thị nút hiện đang khớp với bước/nhánh này (VD \"LHD2026-01\").", rule: "Hiển thị dấu \"-\" nếu chưa có luật khớp.", display: "N/A", mapping: "LuatHienThiNut.ma_luat" },
  { name: "Trạng thái", type: "Badge", io: "Output", desc: "\"Đã khớp\" nếu đã có luật hiển thị nút khớp với bước/nhánh; \"Thiếu luật\" nếu chưa có.", rule: "Giá trị tính toán (derived), không lưu trực tiếp trong CSDL.", display: "\"Đã khớp\": chip xanh; \"Thiếu luật\": chip đỏ/hồng.", mapping: "N/A (derived)" },
];

const danhMucNutGrid = [
  { name: "Mã nút", type: "Label", io: "Output", desc: "Mã định danh hành động/nút (VD \"APPROVE_STEP\").", rule: "Duy nhất trong hệ thống.", display: "N/A", mapping: "DanhMucNut.ma_nut" },
  { name: "Tên mặc định", type: "Label", io: "Output", desc: "Tên hiển thị mặc định của nút khi chưa có luật hiển thị nút tùy biến riêng (VD \"Đồng ý duyệt\").", rule: "N/A", display: "N/A", mapping: "DanhMucNut.ten_mac_dinh" },
  {
    name: "Mã luật áp dụng", type: "Tag list", io: "Output", desc: "Danh sách các luật hiển thị nút (mục 3.1) đang áp dụng cho nút này (VD \"LHD-2026-01\", \"LHD-2026-02\"...).",
    rule: "Nếu số lượng nhiều hơn 3, gộp phần còn lại vào 1 chip \"+n\"; click vào chip \"+n\" để xem toàn bộ danh sách (đề xuất — cần xác nhận thao tác).",
    display: "Chip màu xám, tối đa 3 chip hiển thị trực tiếp + 1 chip \"+n\".", mapping: "LuatHienThiNut (nhiều bản ghi có cùng ma_hanh_dong = DanhMucNut.ma_nut)",
  },
  { name: "Thao tác", type: "Icon Button", io: "Output", desc: "Icon con mắt xem chi tiết các luật áp dụng cho nút.", rule: "N/A", display: "Icon nhỏ cuối dòng.", mapping: "N/A" },
];

// ---- issues table ----
const issueHeaders = ["STT", "Vấn đề còn mở", "Đề xuất / Ghi chú"];
const issueW = [500, 6900, 7000];
const issues2 = [
  ["Định dạng Mã quy trình không thống nhất: Danh sách quy trình hiển thị dạng gạch dưới (VD \"RD02_02\"), Chi tiết quy trình hiển thị dạng dấu chấm (VD \"RD02.02\").", "Cần chuẩn hoá về 1 định dạng thống nhất trên toàn hệ thống."],
  ["Nguồn dữ liệu và tần suất cập nhật cột \"SL đang xử lý\" tại Danh sách quy trình.", "Cần xác nhận: real-time từ Camunda Operate hay đồng bộ định kỳ (và chu kỳ cụ thể)."],
  ["Ý nghĩa nhãn \"Hiện hành\" gắn trên mọi phiên bản tại panel Lịch sử phiên bản (Chi tiết quy trình).", "Cần làm rõ tiêu chí gắn nhãn — chỉ phiên bản mới nhất, hay mọi phiên bản còn hiệu lực."],
  ["Nội dung cụ thể hiển thị tại panel \"Thuộc tính phần tử\" khi đã chọn 1 node trên sơ đồ BPMN.", "Chưa có ảnh chụp minh họa trạng thái đã chọn phần tử — cần bổ sung."],
  ["Tên gọi không nhất quán: tiêu đề trang là \"Danh sách loại phê duyệt\" nhưng tiêu đề card bên trong lại là \"Danh sách luật phê duyệt\".", "Cần thống nhất lại thuật ngữ \"loại phê duyệt\" và \"luật phê duyệt\" xuyên suốt tài liệu và giao diện."],
  ["Dữ liệu mẫu cột Ngày tạo/Ngày cập nhật tại 5 dòng \"SUBMIT\" trong bảng Danh sách loại phê duyệt hiển thị giá trị số (\"10\") thay vì ngày tháng.", "Nghi ngờ lỗi hiển thị/dữ liệu demo — cần xác nhận với đội phát triển."],
  ["Danh sách giá trị cụ thể cho \"Trường điều kiện\"/\"Giá trị\" (Cấu hình luật phê duyệt) và cho \"Loại\"/\"Sắc thái\" (Luật hiển thị nút) chưa được xác nhận đầy đủ.", "Cần bổ sung danh mục giá trị hợp lệ cho từng trường."],
  ["Trường \"Quy trình áp dụng\" tại Luật hiển thị nút không bắt buộc nhập.", "Cần xác nhận phạm vi áp dụng của luật khi trường này để trống (áp dụng toàn hệ thống hay không áp dụng)."],
  ["Màn hình \"Thêm mới loại phê duyệt\" và \"Chi tiết Danh mục nút\" chưa có ảnh chụp.", "Cần bổ sung ảnh để hoàn thiện mô tả chi tiết các thành phần."],
];
function issueTable() {
  const header = new TableRow({ tableHeader: true, children: issueHeaders.map((h, i) => headerCell(h, issueW[i])) });
  const rows = issues2.map((r, idx) => new TableRow({ children: [bodyCell(String(idx + 1), issueW[0]), bodyCell(r[0], issueW[1]), bodyCell(r[1], issueW[2])] }));
  return new Table({ width: { size: 14400, type: WidthType.DXA }, rows: [header, ...rows] });
}

function screenBlock(titleText, thongTinChung, sublocks, luongLines) {
  const children = [];
  children.push(H(titleText, HeadingLevel.HEADING_2));
  children.push(H("Thông tin chung chức năng", HeadingLevel.HEADING_3));
  thongTinChung.forEach((t) => children.push(P(t, { size: 20 })));
  children.push(H("Màn hình", HeadingLevel.HEADING_3));
  children.push(note("(Ảnh chụp màn hình tương ứng đã được cung cấp và sử dụng làm căn cứ mô tả các thành phần bên dưới.)"));
  children.push(H("Mô tả chi tiết các thành phần", HeadingLevel.HEADING_3));
  sublocks.forEach((sb) => { children.push(subLabel(sb.label)); children.push(componentTable(sb.rows)); });
  children.push(H("Luồng nghiệp vụ", HeadingLevel.HEADING_3));
  children.push(...luongLines);
  return children;
}

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          orientation: PageOrientation.LANDSCAPE,
          margin: { top: 700, bottom: 700, left: 700, right: 700 },
        },
      },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "PHÂN HỆ QUẢN TRỊ DÙNG CHUNG (MOD)", bold: true, font: FONT, size: 26 })] }),

        H1("1. Quản lý quy trình"),
        ...screenBlock(
          "1.1 Danh sách quy trình",
          [
            "Đối tượng sử dụng: Quản trị quy trình, Quản trị nghiệp vụ toàn hệ thống.",
            "Mục đích: Cho phép người quản trị xem, tìm kiếm, đồng bộ (từ Camunda) và xuất Excel danh sách các quy trình BPMN đang được cấu hình/vận hành trong hệ thống QTKHCN.",
          ],
          [
            { label: "a) Khu vực công cụ (Toolbar)", rows: dsQuyTrinhToolbar },
            { label: "b) Bảng danh sách quy trình (Grid)", rows: dsQuyTrinhGrid },
          ],
          [
            ...numbered([
              "Xem danh sách: hệ thống load trang đầu tiên (mặc định 20 bản ghi/trang) khi vào màn hình.",
              "Tìm kiếm: người dùng nhập từ khóa vào ô tìm kiếm → hệ thống lọc theo Mã quy trình/Mã Camunda/Tên quy trình.",
            ]),
            subLabel("Đồng bộ từ Camunda:"),
            bullet("Người dùng nhấn nút \"Đồng bộ từ Camunda\" → hệ thống hiển thị loading, gọi API đồng bộ."),
            bullet("Nếu thành công: cập nhật danh sách (thêm quy trình mới, cập nhật SL Phiên bản/trạng thái quy trình đã có), hiển thị thông báo thành công."),
            bullet("Nếu lỗi kết nối/đồng bộ: hiển thị thông báo lỗi, không thay đổi dữ liệu hiện có."),
            subLabel("Xuất Excel và Xem chi tiết:"),
            bullet("Xuất Excel: áp dụng luồng và quy tắc tương tự mục 4.4 tài liệu UM01 (Danh sách tài khoản)."),
            bullet("Xem chi tiết: người dùng nhấn icon con mắt tại 1 dòng → chuyển sang màn hình Chi tiết quy trình (mục 1.2) tương ứng."),
          ]
        ),

        ...screenBlock(
          "1.2 Chi tiết quy trình",
          [
            "Đối tượng sử dụng: Quản trị quy trình, Quản trị nghiệp vụ toàn hệ thống.",
            "Mục đích: Cho phép xem sơ đồ BPMN chi tiết của 1 quy trình, xem thuộc tính từng phần tử trên sơ đồ và xem lịch sử các phiên bản đã đồng bộ.",
          ],
          [{ label: "Các thành phần trên màn hình", rows: chiTietQuyTrinhRows }],
          [
            ...numbered([
              "Xem chi tiết quy trình: hệ thống load thông tin quy trình (Mã, Tên) và render sơ đồ BPMN của phiên bản hiện hành mới nhất.",
              "Zoom/di chuyển sơ đồ: người dùng dùng nút zoom in/out/fit hoặc thao tác chuột để xem chi tiết sơ đồ.",
              "Xem thuộc tính phần tử: người dùng click chọn 1 node trên sơ đồ → panel \"Thuộc tính phần tử\" cập nhật hiển thị thông tin của node đó; bật \"Thuộc tính nâng cao\" để xem thêm thông tin kỹ thuật.",
              "Xem lịch sử phiên bản: người dùng xem danh sách các phiên bản tại panel bên phải (đề xuất cho phép click vào 1 phiên bản để xem lại sơ đồ BPMN tương ứng — cần xác nhận).",
              "Thoát: người dùng nhấn nút \"Thoát\" → quay lại màn hình Danh sách quy trình (mục 1.1).",
            ]),
          ]
        ),

        H1("2. Ma trận phê duyệt"),
        ...screenBlock(
          "2.1 Danh sách loại phê duyệt",
          [
            "Đối tượng sử dụng: Quản trị phê duyệt, Quản trị nghiệp vụ toàn hệ thống.",
            "Mục đích: Quản lý danh mục các loại phê duyệt (nhóm nghiệp vụ phê duyệt) được sử dụng để cấu hình luật phê duyệt (mục 2.2, 2.3).",
          ],
          [
            { label: "a) Khu vực công cụ (Toolbar)", rows: dsLoaiPheDuyetToolbar },
            { label: "b) Bảng danh sách loại phê duyệt (Grid)", rows: dsLoaiPheDuyetGrid },
          ],
          [
            ...numbered([
              "Xem danh sách/tìm kiếm: tương tự các màn hình danh sách khác trong hệ thống.",
              "Xuất Excel: áp dụng nguyên tắc tương tự mục 1.1, 4.4 (UM01).",
              "Thêm mới: người dùng nhấn \"+ Thêm mới\" → chuyển sang màn hình tạo mới loại phê duyệt (chưa có ảnh chụp — cần bổ sung để mô tả đầy đủ).",
              "Xem chi tiết: nhấn icon con mắt tại 1 dòng để xem chi tiết loại phê duyệt tương ứng.",
            ]),
          ]
        ),

        ...screenBlock(
          "2.2 Tạo mới luật phê duyệt",
          [
            "Đối tượng sử dụng: Quản trị phê duyệt.",
            "Mục đích: Cấu hình các luật (rule) xác định nhóm/vai trò phê duyệt sẽ được áp dụng dựa trên các điều kiện về hồ sơ/nhiệm vụ (VD: cấp nhiệm vụ, loại hồ sơ...).",
          ],
          [{ label: "Các thành phần trên màn hình", rows: taoLuatPheDuyetRows }],
          [
            ...numbered([
              "Người dùng chọn Tên luật, Mã loại phê duyệt (Tên loại phê duyệt tự điền theo).",
              "Người dùng cấu hình các dòng điều kiện: chọn Trường điều kiện, Toán tử, nhập/chọn Giá trị; có thể thêm nhiều dòng điều kiện, kết hợp VÀ/HOẶC, hoặc tạo nhóm điều kiện lồng nhau bằng nút nhánh.",
              "Người dùng chọn Nhóm phê duyệt.",
            ]),
            subLabel("Khi nhấn \"Lưu\":"),
            bullet("Hệ thống validate: các trường bắt buộc phải có giá trị; cấu hình điều kiện phải đầy đủ (không có dòng thiếu Trường/Toán tử/Giá trị)."),
            bullet("Nếu hợp lệ: lưu luật phê duyệt mới, hiển thị thông báo thành công, quay lại danh sách (hoặc màn hình chi tiết vừa tạo)."),
            bullet("Nếu không hợp lệ: hiển thị lỗi tại từng trường tương ứng, dừng lưu."),
            subLabel("Khi nhấn \"Hủy\":"),
            bullet("Quay lại màn hình danh sách; đề xuất hỏi xác nhận nếu đã có thay đổi dữ liệu chưa lưu — cần xác nhận."),
          ]
        ),

        ...screenBlock(
          "2.3 Chi tiết luật phê duyệt",
          [
            "Đối tượng sử dụng: Quản trị phê duyệt.",
            "Mục đích: Xem lại toàn bộ cấu hình của 1 luật phê duyệt đã tạo và cho phép chuyển sang chế độ chỉnh sửa nếu có quyền.",
          ],
          [{ label: "Các thành phần trên màn hình", rows: chiTietLuatPheDuyetRows }],
          [
            ...numbered([
              "Xem chi tiết: hệ thống hiển thị toàn bộ thông tin của luật phê duyệt ở chế độ chỉ đọc (readonly).",
              "Chỉnh sửa: người dùng nhấn \"Chỉnh sửa\" → form chuyển sang chế độ nhập liệu (như mục 2.2) với dữ liệu hiện tại được điền sẵn; chỉ hiển thị nút này nếu người dùng có quyền chỉnh sửa luật phê duyệt.",
              "Hủy: quay lại màn hình danh sách loại phê duyệt/luật phê duyệt.",
            ]),
          ]
        ),

        H1("3. Ma trận hành động"),
        ...screenBlock(
          "3.1 Tạo mới luật hiển thị nút",
          [
            "Đối tượng sử dụng: Quản trị nghiệp vụ toàn hệ thống, Quản trị quy trình.",
            "Mục đích: Cấu hình cách hiển thị (tên, loại, sắc thái) và điều kiện xuất hiện của các nút hành động (button) trên từng màn hình/bước quy trình cụ thể.",
          ],
          [{ label: "Các thành phần trên màn hình", rows: taoLuatHienThiNutRows }],
          [
            ...numbered([
              "Người dùng chọn Hành động, nhập Tên hiển thị, chọn Loại, Sắc thái, Màn hình hiển thị (các trường bắt buộc).",
              "(Tuỳ chọn) chọn Quy trình áp dụng → hệ thống load danh sách \"Bước trong điều kiện\" tương ứng với quy trình đã chọn → người dùng chọn bước áp dụng.",
              "(Tuỳ chọn) chọn Biểu mẫu sử dụng, Vai trò áp dụng.",
              "Nhấn \"Lưu\": hệ thống validate các trường bắt buộc, lưu luật hiển thị nút mới; nếu là hành động mới, cập nhật/bổ sung vào Danh mục nút (mục 3.3).",
              "Nhấn \"Hủy\": quay lại danh sách/tab trước đó.",
            ]),
          ]
        ),

        ...screenBlock(
          "3.2 Đối soát BPMN",
          [
            "Đối tượng sử dụng: Quản trị nghiệp vụ toàn hệ thống, Quản trị quy trình.",
            "Mục đích: Đối chiếu các bước/nhánh kết quả trong sơ đồ BPMN của 1 quy trình với các luật hiển thị nút đã cấu hình, phát hiện các bước/nhánh còn thiếu luật để bổ sung nhanh.",
          ],
          [
            { label: "a) Khu vực công cụ (Toolbar)", rows: doiSoatBpmnToolbar },
            { label: "b) Bảng đối soát BPMN (Grid)", rows: doiSoatBpmnGrid },
          ],
          [
            ...numbered([
              "Người dùng chọn quy trình cần đối soát → hệ thống load danh sách các bước/nhánh kết quả từ BPMN của quy trình, đối chiếu với các luật hiển thị nút đã cấu hình (mục 3.1) để xác định trạng thái \"Đã khớp\"/\"Thiếu luật\".",
              "Với các dòng \"Thiếu luật\": người dùng chọn dòng (nếu hỗ trợ chọn nhiều) và nhấn \"Tạo luật từ BPMN\" → hệ thống tự động sinh luật hiển thị nút mặc định cho (các) dòng đã chọn, cập nhật lại trạng thái thành \"Đã khớp\".",
              "Tìm kiếm: lọc bảng theo Bước BPMN/Nhánh kết quả.",
            ]),
          ]
        ),

        ...screenBlock(
          "3.3 Danh mục nút",
          [
            "Đối tượng sử dụng: Quản trị nghiệp vụ toàn hệ thống, Quản trị quy trình.",
            "Mục đích: Quản lý danh mục toàn bộ các hành động/nút đã được định nghĩa trong hệ thống và các luật hiển thị nút đang áp dụng cho từng hành động.",
          ],
          [{ label: "Bảng danh mục nút (Grid)", rows: danhMucNutGrid }],
          [
            ...numbered([
              "Xem danh sách danh mục nút (toàn bộ các hành động/nút đã được định nghĩa trong hệ thống).",
              "Tìm kiếm theo Mã nút/Tên mặc định.",
              "Xem chi tiết: nhấn icon con mắt → xem danh sách đầy đủ các luật hiển thị nút áp dụng cho nút được chọn (màn hình chi tiết chưa có ảnh chụp — cần bổ sung).",
            ]),
          ]
        ),

        H("Các vấn đề còn mở / cần xác nhận thêm", HeadingLevel.HEADING_2),
        note("Các nội dung dưới đây được ghi nhận trực tiếp từ việc rà soát ảnh chụp màn hình thực tế; cần xác nhận lại với đội phát triển/BA nghiệp vụ trước khi phát hành chính thức."),
        issueTable(),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const out = require("path").join(__dirname, "MOD_QuyTrinh_MaTranPheDuyet_MaTranHanhDong.docx");
  fs.writeFileSync(out, buf);
  console.log("done:", out);
});
