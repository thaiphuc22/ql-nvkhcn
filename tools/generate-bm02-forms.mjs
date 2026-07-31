import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('outputs');
const layout = (row, columns = null) => ({ row, columns });
let seq = 0;
const id = (prefix) => `${prefix}_${++seq}`;
const required = { required: true };

function html(content, row = id('Row')) {
  return { type: 'html', id: id('Html'), content, layout: layout(row) };
}
function field(type, key, label, options = {}) {
  const component = { type, id: id('Field'), key, label, layout: layout(id('Row'), options.columns ?? null) };
  if (options.required) component.validate = { ...required, ...(options.validate || {}) };
  else if (options.validate) component.validate = options.validate;
  if (options.defaultValue !== undefined) component.defaultValue = options.defaultValue;
  if (options.description) component.description = options.description;
  if (options.values) component.values = options.values;
  if (options.subtype) component.subtype = options.subtype;
  return component;
}
const text = (key, label, options) => field('textfield', key, label, options);
const area = (key, label, options) => field('textarea', key, label, options);
const num = (key, label, options = {}) => field('number', key, label, { validate: { min: 0, ...(options.validate || {}) }, ...options });
const date = (key, label, options = {}) => field('datetime', key, label, { subtype: 'date', ...options });
const select = (key, label, values, options = {}) => field('select', key, label, { values: values.map(([value, caption]) => ({ value, label: caption })), ...options });
const checklist = (key, label, values, options = {}) => field('checklist', key, label, { values: values.map(([value, caption]) => ({ value, label: caption })), ...options });
function list(key, label, children, options = {}) {
  return { type: 'dynamiclist', id: id('List'), key, label, showOutline: true, components: children, layout: layout(id('Row')), ...(options.required ? { validate: required } : {}) };
}
function section(title, fields) { return { title, fields }; }

const roleValues = [['chu_tich', 'Chủ tịch Hội đồng'], ['pho_chu_tich', 'Phó Chủ tịch Hội đồng'], ['phan_bien', 'Ủy viên phản biện'], ['thu_ky', 'Ủy viên, Thư ký khoa học'], ['uy_vien', 'Ủy viên Hội đồng']];
const recommendationValues = [['thuc_hien', 'Đề nghị cho thực hiện'], ['dieu_chinh', 'Đề nghị cho thực hiện với các điều chỉnh'], ['khong_thuc_hien', 'Đề nghị không cho thực hiện']];

function documentFields() {
  return [
    text('diaDanh', 'Địa danh', { required: true, defaultValue: 'Hà Nội' }),
    date('ngayVanBan', 'Ngày văn bản', { required: true }),
    text('soVanBan', 'Số văn bản'),
    text('nguoiKy', 'Họ tên người ký'),
    text('chucDanhKy', 'Chức danh người ký')
  ];
}
function missionFields(noun = 'nhiệm vụ') {
  return [
    text('tenNhiemVu', `Tên ${noun}`, { required: true }),
    text('maNhiemVu', `Mã ${noun}`),
    text('donViChuTri', 'Đơn vị chủ trì', { required: true }),
    text('chuNhiemHoTen', `Cá nhân đăng ký chủ nhiệm ${noun}`, { required: true }),
    text('linhVuc', 'Lĩnh vực', { required: true })
  ];
}
function contacts(prefix, caption) {
  return [
    text(`${prefix}HoTen`, `${caption} - Họ và tên`, { required: true }),
    text(`${prefix}CapBac`, `${caption} - Cấp bậc`),
    text(`${prefix}ChucVu`, `${caption} - Chức vụ`),
    date(`${prefix}NgaySinh`, `${caption} - Ngày sinh`),
    select(`${prefix}GioiTinh`, `${caption} - Giới tính`, [['nam', 'Nam'], ['nu', 'Nữ']]),
    text(`${prefix}HocHamHocVi`, `${caption} - Học hàm, học vị/trình độ chuyên môn`),
    text(`${prefix}DienThoai`, `${caption} - Điện thoại`),
    text(`${prefix}Email`, `${caption} - Email`),
    text(`${prefix}DonVi`, `${caption} - Đơn vị công tác`),
    text(`${prefix}DiaChi`, `${caption} - Địa chỉ đơn vị`)
  ];
}

function budgetDefinition() {
  const expenseRow = () => [text('khoanMuc', 'Khoản mục', { required: true }), text('donViTinh', 'Đơn vị tính'), num('soLuong', 'Số lượng'), num('donGia', 'Đơn giá'), num('tienTruocThue', 'Tiền trước thuế GTGT'), num('thueGtgt', 'Thuế GTGT'), num('thanhTien', 'Thành tiền'), area('ghiChu', 'Ghi chú/cơ sở giá')];
  return {
    code: 'BM.02.02.DTO.NV_2024', file: 'BM.02.02.DTO.NV_2024.form.json', title: 'HỒ SƠ DỰ TOÁN KINH PHÍ THỰC HIỆN NHIỆM VỤ KHOA HỌC VÀ CÔNG NGHỆ',
    sections: [
      section('Thông tin chung', [...documentFields(), ...missionFields(), num('giaTriDuToan', 'Giá trị dự toán (VNĐ)', { required: true }), text('giaTriBangChu', 'Giá trị dự toán bằng chữ', { required: true }), text('nguonVon', 'Nguồn vốn', { defaultValue: 'Quỹ Phát triển KHCN' }), text('loaiNhiemVu', 'Loại nhiệm vụ')]),
      section('Căn cứ lập dự toán', [area('canCuLapDuToan', 'Các căn cứ lập dự toán', { required: true }), area('coSoChiNhanCong', 'Cơ sở chi phí nhân công'), area('coSoNguyenVatLieu', 'Cơ sở chi nguyên liệu, vật liệu'), area('coSoCcdcTscd', 'Cơ sở chi công cụ dụng cụ và tài sản cố định'), area('coSoThueNgoai', 'Cơ sở chi dịch vụ thuê ngoài'), area('coSoChiKhac', 'Cơ sở chi khác'), area('coSoQuanLy', 'Cơ sở chi quản lý nhiệm vụ')]),
      section('Tổng hợp và phụ lục chi phí', [list('chiNhanCong', 'Phụ lục 1 - Chi nhân công', expenseRow(), { required: true }), list('chiNguyenVatLieu', 'Phụ lục 2 - Chi nguyên liệu, vật liệu', expenseRow()), list('chiCcdcTscd', 'Phụ lục 3 - Chi công cụ dụng cụ và tài sản cố định', expenseRow()), list('chiThueNgoai', 'Phụ lục 4 - Chi dịch vụ thuê ngoài', expenseRow()), list('chiKhac', 'Phụ lục 5 - Chi khác phục vụ trực tiếp', expenseRow()), list('chiQuanLy', 'Phụ lục 6 - Chi quản lý nhiệm vụ', expenseRow())])
    ]
  };
}

function explanationDefinition(kind, code, file) {
  const noun = kind === 'Đề tài KHCN' ? 'đề tài' : 'dự án';
  return {
    code, file, title: `THUYẾT MINH ${kind.toUpperCase()} CẤP TẬP ĐOÀN`,
    sections: [
      section(`I. Thông tin chung về ${noun}`, [...documentFields(), ...missionFields(noun).filter((f) => f.key !== 'chuNhiemHoTen'), num('thoiGianThucHienThang', 'Thời gian thực hiện (tháng)', { required: true, validate: { min: 1 } }), date('ngayBatDau', 'Ngày bắt đầu'), date('ngayKetThuc', 'Ngày kết thúc'), num('tongKinhPhi', 'Tổng kinh phí (triệu đồng)', { required: true }), select('capQuanLy', 'Cấp quản lý', [['tap_doan', 'Tập đoàn'], ['co_so', 'Cơ sở']], { required: true }), select('loaiNhiemVu', `Loại ${noun}`, [['chuong_trinh', 'Chương trình'], ['du_an_khcn', 'Dự án KH&CN'], ['doc_lap', 'Độc lập'], ['khac', 'Khác']]), ...contacts('chuNhiem', `Chủ nhiệm ${noun}`), ...contacts('thuKy', 'Thư ký khoa học'), text('donViDienThoai', 'Điện thoại đơn vị chủ trì'), text('donViWebsite', 'Website đơn vị chủ trì'), text('donViDiaChi', 'Địa chỉ đơn vị chủ trì'), text('thuTruongDonVi', 'Thủ trưởng đơn vị'), text('soTaiKhoan', 'Số tài khoản'), text('nganHang', 'Ngân hàng')]),
      section('Tổ chức và nhân sự thực hiện', [list('toChucPhoiHop', 'Các tổ chức phối hợp chính', [text('tenToChuc', 'Tên tổ chức', { required: true }), text('maSoToChuc', 'Mã số tổ chức'), text('dienThoai', 'Điện thoại'), text('diaChi', 'Địa chỉ'), text('thuTruong', 'Thủ trưởng tổ chức'), area('noiDungPhoiHop', 'Nội dung phối hợp')]), list('thanhVien', `Thành viên thực hiện ${noun}`, [text('hoTenHocVi', 'Họ tên, học hàm, học vị', { required: true }), text('chucDanh', `Chức danh thực hiện ${noun}`), text('donViCongTac', 'Đơn vị công tác'), area('noiDungPhuTrach', 'Nội dung phụ trách')], { required: true })]),
      section('II. Mục tiêu, nội dung và phương án thực hiện', [area('mucTieu', `Mục tiêu của ${noun}`, { required: true }), select('tinhTrang', `Tình trạng ${noun}`, [['moi', 'Mới'], ['ke_tiep_nhom', 'Kế tiếp hướng nghiên cứu của nhóm tác giả'], ['ke_tiep_khac', 'Kế tiếp nghiên cứu của người khác']]), area('tongQuanNgoaiNuoc', 'Tổng quan tình hình nghiên cứu ngoài nước'), area('tongQuanTrongNuoc', 'Tổng quan tình hình nghiên cứu trong nước'), area('luanGiaiNoiDung', 'Luận giải nội dung cần nghiên cứu', { required: true }), list('taiLieuTrichDan', 'Công trình, tài liệu trích dẫn', [text('tenTaiLieu', 'Tên công trình/tài liệu'), text('tacGia', 'Tác giả'), text('noiCongBo', 'Nơi công bố'), text('namCongBo', 'Năm công bố')]), list('noiDungCongViec', 'Nội dung công việc và phương án thực hiện', [text('noiDung', 'Nội dung/công việc', { required: true }), area('phuongAn', 'Phương án thực hiện'), area('ketQua', 'Kết quả phải đạt'), text('thoiGian', 'Thời gian'), text('donViThucHien', 'Cá nhân/đơn vị thực hiện'), num('kinhPhi', 'Kinh phí')], { required: true }), area('congNgheLoiLamChu', 'Các công nghệ lõi sẽ làm chủ'), area('congNghePhuThuoc', 'Các công nghệ lõi phụ thuộc đối tác'), num('tyLeLamChu', 'Tỷ lệ làm chủ sản phẩm (%)'), area('nenTangSanPham', 'Nền tảng sản phẩm'), area('phuongAnPhoiHop', 'Phương án phối hợp trong nước'), area('hopTacQuocTe', 'Phương án hợp tác quốc tế'), list('chuyenGia', 'Chuyên gia thuê trong/ngoài nước', [text('hoTenHocVi', 'Họ tên, học hàm, học vị'), text('quocTich', 'Quốc tịch'), text('toChuc', 'Tổ chức'), text('linhVuc', 'Lĩnh vực chuyên môn'), area('noiDung', 'Nội dung thực hiện và lý do thuê'), num('thangQuyDoi', 'Thời gian quy đổi (tháng)')])]),
      section(`III. Sản phẩm KHCN của ${noun}`, [list('sanPhamDangI', 'Sản phẩm dạng I', [text('tenSanPham', 'Tên sản phẩm', { required: true }), text('sanPhamThamKhao', 'Sản phẩm tham khảo'), num('soLuong', 'Số lượng/quy mô'), area('chiTieu', 'Chỉ tiêu kỹ thuật/yêu cầu chất lượng')]), list('sanPhamDangII', 'Sản phẩm dạng II', [text('tenSanPham', 'Tên sản phẩm'), text('donViTinh', 'Đơn vị tính'), num('soLuong', 'Số lượng'), area('yeuCauKhoaHoc', 'Yêu cầu khoa học cần đạt'), area('ghiChu', 'Ghi chú')]), list('sanPhamDangIII', 'Sản phẩm công bố, sở hữu trí tuệ và đào tạo', [text('loaiSanPham', 'Loại sản phẩm'), text('tenSanPham', 'Tên sản phẩm'), text('noiCongBo', 'Nơi công bố/đăng ký'), area('yeuCau', 'Yêu cầu cần đạt')]), area('phuongAnUngDung', 'Phương án ứng dụng và sử dụng kết quả'), area('hieuQuaKhcn', 'Hiệu quả khoa học và công nghệ'), area('hieuQuaQuocPhong', 'Hiệu quả quốc phòng, an ninh'), area('hieuQuaKinhTe', 'Hiệu quả kinh tế - xã hội'), area('phuongAnThuHoi', 'Phương án thu hồi chi phí nghiên cứu')]),
      section('IV. Kinh phí và ký xác nhận', [num('kinhPhiQuyKhcn', 'Kinh phí từ Quỹ phát triển KHCN'), num('kinhPhiTuCo', 'Kinh phí tự có'), num('kinhPhiKhac', 'Kinh phí khác'), area('canCuDuToan', 'Căn cứ và giải trình dự toán'), text('nguoiKyChuNhiem', `Người ký - Chủ nhiệm ${noun}`), text('nguoiKyDonVi', 'Người ký - Đơn vị chủ trì')])
    ]
  };
}

function cvDefinition() {
  return { code: 'BM.02.06.LLK.NV_2024', file: 'BM.02.06.LLK.NV_2024.form.json', title: 'LÝ LỊCH KHOA HỌC CỦA CÁ NHÂN ĐĂNG KÝ CHỦ NHIỆM NHIỆM VỤ', sections: [
    section('Thông tin cá nhân', [...contacts('caNhan', 'Cá nhân đăng ký chủ nhiệm'), text('namSinh', 'Năm sinh'), text('chucDanhChuyenMon', 'Chức danh chuyên môn - kỹ thuật nghiệp vụ'), text('namNhanChucDanh', 'Năm được nhận chức danh'), text('hocVi', 'Học vị'), text('namDatHocVi', 'Năm đạt học vị'), text('diaChiNhaRieng', 'Địa chỉ nhà riêng'), text('dienThoaiCoQuan', 'Điện thoại cơ quan'), text('dienThoaiNhaRieng', 'Điện thoại nhà riêng'), text('fax', 'Fax'), text('thuTruongDonVi', 'Thủ trưởng đơn vị'), text('dienThoaiDonVi', 'Điện thoại đơn vị')]),
    section('Quá trình và thành tích khoa học', [list('quaTrinhDaoTao', 'Quá trình đào tạo', [text('bacDaoTao', 'Bậc đào tạo'), text('noiDaoTao', 'Nơi đào tạo'), text('chuyenMon', 'Chuyên môn'), text('namTotNghiep', 'Năm tốt nghiệp')]), list('quaTrinhCongTac', 'Quá trình công tác', [text('thoiGian', 'Thời gian'), text('viTri', 'Vị trí công tác'), text('toChuc', 'Tổ chức công tác'), text('diaChi', 'Địa chỉ đơn vị')]), list('congTrinhCongBo', 'Các công trình công bố chủ yếu', [text('tenCongTrinh', 'Tên công trình'), text('vaiTroTacGia', 'Tác giả/đồng tác giả'), text('noiCongBo', 'Nơi công bố'), text('namCongBo', 'Năm công bố')]), list('vanBangBaoHo', 'Văn bằng bảo hộ sở hữu trí tuệ', [text('tenNoiDung', 'Tên và nội dung văn bằng'), text('namCap', 'Năm cấp')]), list('congTrinhApDung', 'Công trình áp dụng trong thực tiễn', [text('tenCongTrinh', 'Tên công trình'), area('hinhThucQuyMo', 'Hình thức, quy mô, địa chỉ áp dụng'), text('thoiGian', 'Thời gian')]), list('nhiemVuDaThamGia', 'Nhiệm vụ đã chủ trì hoặc tham gia', [text('tenNhiemVu', 'Tên nhiệm vụ'), select('vaiTro', 'Vai trò', [['chu_tri', 'Chủ trì'], ['tham_gia', 'Tham gia']]), text('thoiGian', 'Thời gian'), text('chuongTrinh', 'Thuộc chương trình'), text('tinhTrang', 'Tình trạng')]), list('giaiThuong', 'Giải thưởng', [text('noiDung', 'Hình thức và nội dung giải thưởng'), text('namTang', 'Năm tặng thưởng')]), area('thanhTuuKhac', 'Thành tựu KHCN và sản xuất kinh doanh khác')]),
    section('Xác nhận', [...documentFields(), area('yKienDonVi', 'Ý kiến xác nhận của đơn vị'), text('nguoiKyCaNhan', 'Cá nhân đăng ký chủ nhiệm'), text('nguoiKyDonVi', 'Đại diện đơn vị nơi làm việc')])
  ]};
}

function confirmationDefinition() {
  return { code: 'BM.02.07.GXN.NV_2024', file: 'BM.02.07.GXN.NV_2024.form.json', title: 'GIẤY XÁC NHẬN PHỐI HỢP THỰC HIỆN NHIỆM VỤ KHCN', sections: [
    section('Thông tin nhiệm vụ và đơn vị chủ trì', [...documentFields(), ...missionFields(), text('chuNhiemHocVi', 'Học vị của chủ nhiệm'), text('chuNhiemChucVu', 'Chức vụ của chủ nhiệm')]),
    section('Tổ chức phối hợp', [text('toChucPhoiHop', 'Tên tổ chức đăng ký phối hợp', { required: true }), text('diaChiPhoiHop', 'Địa chỉ', { required: true }), text('dienThoaiPhoiHop', 'Điện thoại'), area('noiDungPhoiHop', 'Nội dung công việc tham gia', { required: true }), num('kinhPhiPhoiHop', 'Kinh phí tương ứng (nếu có)'), area('camKet', 'Cam kết phối hợp', { defaultValue: 'Chúng tôi cam đoan sẽ hoàn thành những thủ tục pháp lý do Tập đoàn hướng dẫn về nghĩa vụ và quyền lợi của mỗi bên để thực hiện tốt nhất và đúng thời hạn mục tiêu, nội dung và sản phẩm của nhiệm vụ KHCN khi Hồ sơ trúng tuyển.' })]),
    section('Ký xác nhận', [text('nguoiKyChuNhiem', 'Cá nhân đăng ký chủ nhiệm'), text('nguoiKyToChucPhoiHop', 'Thủ trưởng tổ chức phối hợp'), text('nguoiKyToChucChuTri', 'Thủ trưởng tổ chức chủ trì')])
  ]};
}

function councilDecisionDefinition() {
  return { code: 'BM.02.08.QDH.NV_2024', file: 'BM.02.08.QDH.NV_2024.form.json', title: 'QUYẾT ĐỊNH THÀNH LẬP HỘI ĐỒNG XÉT DUYỆT NHIỆM VỤ KHCN CẤP TẬP ĐOÀN', sections: [
    section('Thông tin quyết định', [...documentFields(), ...missionFields(), area('canCuBoSung', 'Căn cứ bổ sung')]),
    section('Hội đồng xét duyệt', [list('thanhVienHoiDong', 'Danh sách thành viên Hội đồng', [text('hoTen', 'Họ và tên', { required: true }), text('capBacChucVu', 'Cấp bậc, chức vụ'), select('vaiTro', 'Vai trò', roleValues, { required: true })], { required: true }), area('nhiemVuHoiDong', 'Nhiệm vụ của Hội đồng', { defaultValue: 'Nghiên cứu hồ sơ; nhận xét, đánh giá; báo cáo kết quả xét duyệt; bảo mật thông tin theo quy định.' }), area('noiNhan', 'Nơi nhận')])
  ]};
}

function reviewDefinition(kind, code, file, criteria) {
  const noun = kind === 'Đề tài KHCN' ? 'đề tài' : 'dự án';
  return { code, file, title: `PHIẾU NHẬN XÉT CỦA THÀNH VIÊN HỘI ĐỒNG XÉT DUYỆT ${kind.toUpperCase()} CẤP TẬP ĐOÀN`, sections: [
    section('Thông tin người nhận xét', [...documentFields(), text('nguoiNhanXet', 'Họ và tên người nhận xét', { required: true }), text('capBacChucVu', 'Cấp bậc, chức vụ'), text('donViCongTac', 'Đơn vị công tác'), select('vaiTroHoiDong', 'Vai trò trong Hội đồng', roleValues, { required: true })]),
    section(`Thông tin ${noun}`, [...missionFields(noun)]),
    section('Ý kiến nhận xét', criteria.map(([key, label]) => area(key, label, { required: true }))),
    section('Đánh giá tổng hợp', [area('matManh', `Mặt mạnh của ${noun}`), area('matYeu', `Mặt yếu của ${noun}`), area('kienNghiSuaDoi', 'Kiến nghị bổ sung, sửa đổi thuyết minh và kinh phí'), select('dongYThucHien', `Đồng ý cho phép thực hiện ${noun}`, [['dong_y', 'Đồng ý'], ['dong_y_co_dieu_kien', 'Đồng ý có điều kiện'], ['khong_dong_y', 'Không đồng ý']], { required: true }), text('nguoiKyNhanXet', 'Người nhận xét ký tên')])
  ]};
}

function evaluationDefinition(kind, code, file, criteria) {
  const noun = kind === 'Đề tài KHCN' ? 'đề tài' : 'dự án';
  return { code, file, title: `PHIẾU ĐÁNH GIÁ CỦA THÀNH VIÊN HỘI ĐỒNG XÉT DUYỆT ${kind.toUpperCase()} CẤP TẬP ĐOÀN`, sections: [
    section('Thông tin người đánh giá', [...documentFields(), text('nguoiDanhGia', 'Họ và tên người đánh giá', { required: true }), text('capBacChucVu', 'Cấp bậc, chức vụ'), text('donViCongTac', 'Đơn vị công tác'), select('vaiTroHoiDong', 'Vai trò trong Hội đồng', roleValues, { required: true }), ...missionFields(noun)]),
    section('Chấm điểm', criteria.map(([key, label, max]) => num(key, `${label} (tối đa ${max} điểm)`, { required: true, validate: { min: 0, max } })).concat(num('tongDiem', 'Tổng điểm (tối đa 100)', { required: true, validate: { min: 0, max: 100 } }))),
    section('Kiến nghị', [select('kienNghi', 'Kiến nghị của người đánh giá', recommendationValues, { required: true }), area('nhanXetKienNghi', 'Nhận xét, kiến nghị'), text('nguoiKyDanhGia', 'Người đánh giá ký tên')])
  ]};
}

function simpleDefinition(code, file, title, sections) { return { code, file, title, sections }; }

const commonReviewCriteria = [['mucTieu', 'Đánh giá về mục tiêu'], ['tongQuan', 'Tổng quan tình hình nghiên cứu'], ['noiDungPhuongPhap', 'Nội dung, phương pháp nghiên cứu và kỹ thuật sử dụng'], ['sanPham', 'Sản phẩm khoa học và công nghệ'], ['khaNangUngDung', 'Khả năng ứng dụng kết quả'], ['keHoachKinhPhi', 'Tính khả thi của kế hoạch và kinh phí'], ['nangLuc', 'Năng lực đơn vị và cá nhân tham gia']];
const sxtnReviewCriteria = [['xuatXuCanThiet', 'Xuất xứ công nghệ, sự cần thiết và cơ hội SXKD'], ['mucTieuNoiDung', 'Mục tiêu, nội dung và phương án triển khai'], ['giaTriCongNghe', 'Giá trị của công nghệ'], ['loiIch', 'Lợi ích của dự án'], ['taiChinhHieuQua', 'Phương án tài chính và hiệu quả dự án']];
const projectReviewCriteria = [['mucTieu', 'Đánh giá về mục tiêu'], ['tongQuanLuanGiai', 'Tổng quan và luận giải nội dung nghiên cứu'], ['phuongPhap', 'Cách tiếp cận, phương pháp, kỹ thuật và phương án thực hiện'], ['sanPham', 'Mức độ đầy đủ, phù hợp và tiên tiến của sản phẩm'], ['ungDungTacDong', 'Khả năng ứng dụng và tác động'], ['keHoachKinhPhi', 'Tính khả thi của kế hoạch và kinh phí']];
const dtEval = [['diemTongQuan', 'Đánh giá tổng quan', 12], ['diemNoiDung', 'Nội dung, phương pháp và kỹ thuật', 24], ['diemSanPham', 'Tính mới, tính đủ của sản phẩm', 20], ['diemUngDung', 'Khả năng ứng dụng và hiệu quả', 16], ['diemKeHoach', 'Kế hoạch và kinh phí', 16], ['diemNangLuc', 'Năng lực đơn vị và cá nhân', 12]];
const sxEval = [['diemTongQuan', 'Công nghệ và thị trường', 8], ['diemNoiDung', 'Nội dung và phương án triển khai', 24], ['diemCongNghe', 'Tính mới và khả thi của công nghệ', 20], ['diemHieuQua', 'Khả năng phát triển và hiệu quả', 16], ['diemTaiChinh', 'Phương án tài chính', 20], ['diemNangLuc', 'Năng lực đơn vị và cá nhân', 12]];
const daEval = [['diemTongQuan', 'Đánh giá tổng quan', 8], ['diemNoiDung', 'Nội dung và phương án triển khai', 24], ['diemSanPham', 'Tính mới, tính đủ của sản phẩm', 20], ['diemUngDung', 'Khả năng ứng dụng và hiệu quả', 16], ['diemKeHoach', 'Kế hoạch và kinh phí', 20], ['diemNangLuc', 'Năng lực đơn vị và cá nhân', 12]];

const definitions = [
  budgetDefinition(),
  explanationDefinition('Đề tài KHCN', 'BM.02.03.TMI.DT_2024', 'BM.02.03.TMI.DT_2024.form.json'),
  explanationDefinition('Dự án SXTN', 'BM.02.04.TMI.SX_2024', 'BM.02.04.TMI.SX_2024.form.json'),
  explanationDefinition('Dự án KHCN', 'BM.02.05.TMI.DA_2024', 'BM.02.05.TMI.DA_2024.form.json'),
  cvDefinition(), confirmationDefinition(), councilDecisionDefinition(),
  reviewDefinition('Đề tài KHCN', 'BM.02.09.PNX.DT_2024', 'BM.02.09.PNX.DT_2024.form.json', commonReviewCriteria),
  reviewDefinition('Dự án SXTN', 'BM.02.10.PNX.SX_2024', 'BM.02.10.PNX.SX_2024.form.json', sxtnReviewCriteria),
  reviewDefinition('Dự án KHCN', 'BM.02.11.PNX.DA_2024', 'BM.02.11.PNX.DA_2024.form.json', projectReviewCriteria),
  evaluationDefinition('Đề tài KHCN', 'BM.02.12.PDG.DT_2024', 'BM.02.12.PDG.DT_2024.form.json', dtEval),
  evaluationDefinition('Dự án SXTN', 'BM.02.13.PDG.SX_2024', 'BM.02.13.PDG.SX_2024.form.json', sxEval),
  evaluationDefinition('Dự án KHCN', 'BM.02.14.PDG.DA_2024', 'BM.02.14.PDG.DA_2024.form.json', daEval),
  simpleDefinition('BM.02.15.BBH.NV_2024', 'BM.02.15.BBH.NV_2024.form.json', 'BIÊN BẢN HỌP HỘI ĐỒNG XÉT DUYỆT NHIỆM VỤ KHCN CẤP TẬP ĐOÀN', [
    section('A. Thông tin chung', [...documentFields(), ...missionFields(), text('soQuyetDinhHoiDong', 'Số quyết định thành lập Hội đồng'), date('ngayQuyetDinhHoiDong', 'Ngày quyết định'), text('thoiGianBatDau', 'Thời gian bắt đầu phiên họp'), text('thoiGianKetThuc', 'Thời gian kết thúc phiên họp'), text('diaDiemHop', 'Địa điểm'), num('tongSoThanhVien', 'Tổng số thành viên Hội đồng'), num('soThanhVienCoMat', 'Số thành viên có mặt'), num('soKhachMoi', 'Số khách mời'), num('soDaiDienNhom', 'Số đại diện nhóm thực hiện'), list('thanhVienThamDu', 'Thành viên tham dự', [text('hoTen', 'Họ tên'), text('donViChucVu', 'Đơn vị, chức vụ'), select('vaiTro', 'Vai trò', roleValues), select('thamDu', 'Trạng thái', [['co_mat', 'Có mặt'], ['vang_mat', 'Vắng mặt']])])]),
    section('B. Nội dung làm việc', [area('noiDungPhien1', 'Nội dung và kết quả phiên họp 1', { required: true }), area('noiDungPhien2', 'Nội dung và kết quả phiên họp 2 (nếu có)'), num('diemTrungBinh', 'Điểm trung bình/100', { validate: { min: 0, max: 100 } }), select('ketQuaDanhGia', 'Kết quả đánh giá', [['du_dieu_kien', 'Đủ điều kiện thực hiện'], ['chua_du_dieu_kien', 'Chưa đủ điều kiện thực hiện']], { required: true }), area('ketLuanKienNghi', 'Kết luận và kiến nghị của Hội đồng', { required: true }), list('tongHopYKien', 'Tổng hợp ý kiến và giải trình', [area('yKien', 'Ý kiến nhận xét'), area('giaiTrinh', 'Giải trình'), text('thamChieu', 'Tham chiếu trong văn bản')])]),
    section('Ký biên bản', [text('chuTichHoiDong', 'Chủ tịch Hội đồng'), text('thuKyHoiDong', 'Thư ký Hội đồng'), list('chuKyThanhVien', 'Chữ ký thành viên', [text('hoTen', 'Họ tên'), text('vaiTro', 'Vai trò')])])
  ]),
  simpleDefinition('BM.02.16.BCA.NV_2024', 'BM.02.16.BCA.NV_2024.form.json', 'BÁO CÁO HOÀN THIỆN HỒ SƠ NHIỆM VỤ KHCN CẤP TẬP ĐOÀN', [
    section('Thông tin báo cáo', [...documentFields(), ...missionFields(), text('kinhGui', 'Kính gửi', { defaultValue: 'Hội đồng chuyên ngành Tập đoàn' }), text('soQuyetDinhChuTruong', 'Số quyết định phê duyệt chủ trương'), date('ngayQuyetDinhChuTruong', 'Ngày quyết định'), date('ngayHopXetDuyet', 'Ngày họp Hội đồng xét duyệt')]),
    section('Nội dung hoàn thiện', [area('tomTatKetLuanHoiDong', 'Tóm tắt nội dung tiếp thu theo kết luận Hội đồng', { required: true }), area('tomTatYKienChucNang', 'Tóm tắt nội dung tiếp thu theo cơ quan chức năng', { required: true }), area('noiDungHoanThien', 'Các nội dung chính đã chỉnh sửa, hoàn thiện', { required: true }), list('giaiTrinhHoiDong', 'Phụ lục 1 - Ý kiến Hội đồng và giải trình', [area('yKien', 'Ý kiến Hội đồng'), area('giaiTrinh', 'Giải trình của đơn vị chủ trì'), text('thamChieu', 'Tham chiếu văn bản')]), list('giaiTrinhCoQuan', 'Phụ lục 2 - Ý kiến cơ quan chức năng và giải trình', [text('coQuan', 'Cơ quan chức năng'), area('yKien', 'Ý kiến'), area('giaiTrinh', 'Giải trình'), text('thamChieu', 'Tham chiếu')]), area('noiNhan', 'Nơi nhận')])
  ]),
  simpleDefinition('BM.02.17.TTR.NV_2024', 'BM.02.17.TTR.NV_2024.form.json', 'TỜ TRÌNH PHÊ DUYỆT NHIỆM VỤ KHCN CẤP TẬP ĐOÀN', [
    section('Thông tin tờ trình', [...documentFields(), ...missionFields(), area('kinhGui', 'Kính gửi', { defaultValue: '- Tổng Giám đốc Tập đoàn;\n- Hội đồng chuyên ngành Tập đoàn;' }), area('canCu', 'Các căn cứ trình phê duyệt')]),
    section('I. Tính cấp thiết', [area('tinhCapThiet', 'Hiện trạng, nhu cầu và sự cần thiết', { required: true })]),
    section('II. Nội dung nhiệm vụ', [area('mucTieu', 'Mục tiêu', { required: true }), list('sanPham', 'Sản phẩm', [text('tenSanPham', 'Tên sản phẩm'), num('soLuong', 'Số lượng'), area('yeuCau', 'Yêu cầu đạt được')]), area('congNgheLoi', 'Công nghệ lõi sẽ làm chủ'), list('tyTrongLamChu', 'Tỷ trọng làm chủ sản phẩm', [text('thanhPhan', 'Thành phần sản phẩm'), area('phanTuChu', 'Phần tự chủ'), area('phanPhuThuoc', 'Phần phụ thuộc')]), area('thiTruong', 'Thị trường'), area('hieuQuaDuKien', 'Hiệu quả dự kiến'), num('thoiGianThang', 'Thời gian thực hiện (tháng)', { required: true, validate: { min: 1 } }), date('ngayBatDau', 'Ngày bắt đầu'), date('ngayKetThuc', 'Ngày kết thúc'), area('mocChinh', 'Các mốc chính'), num('tongKinhPhi', 'Tổng kinh phí dự toán (VNĐ)', { required: true }), text('kinhPhiBangChu', 'Kinh phí bằng chữ'), text('nguonKinhPhi', 'Nguồn kinh phí', { defaultValue: 'Quỹ Phát triển Khoa học Công nghệ Tập đoàn' })]),
    section('III. Hồ sơ kèm theo và phụ lục', [checklist('hoSoKemTheo', 'Danh mục hồ sơ kèm theo', [['thuyet_minh', 'Thuyết minh nhiệm vụ KHCN'], ['du_toan', 'Dự toán nhiệm vụ KHCN'], ['mrd', 'Tài liệu MRD'], ['prd', 'Tài liệu PRD'], ['bien_ban', 'Biên bản họp xét duyệt'], ['phieu_nhan_xet', 'Phiếu nhận xét'], ['bao_cao_hoan_thien', 'Báo cáo hoàn thiện hồ sơ']], { required: true }), area('moTaChiTieu', 'Phụ lục 2 - Mô tả và chỉ tiêu tính năng sản phẩm'), area('hieuQuaThiTruong', 'Phụ lục 3 - Thị trường và hiệu quả'), area('keHoachThucHien', 'Phụ lục 4 - Kế hoạch thực hiện'), area('kinhPhiDuKien', 'Phụ lục 5 - Kinh phí dự kiến'), area('noiNhan', 'Nơi nhận')])
  ]),
  simpleDefinition('BM.02.18.BCT.NV_2024', 'BM.02.18.BCT.NV_2024.form.json', 'BÁO CÁO THÔNG QUA HỒ SƠ TRÌNH PHÊ DUYỆT NHIỆM VỤ KHCN CẤP TẬP ĐOÀN', [
    section('Thông tin báo cáo', [...documentFields(), ...missionFields(), text('linhVucHoiDong', 'Lĩnh vực Hội đồng chuyên ngành'), text('kinhGui', 'Kính gửi', { defaultValue: 'Tổng Giám đốc Tập đoàn' }), text('soQuyetDinhChuTruong', 'Số quyết định chủ trương'), date('ngayQuyetDinhChuTruong', 'Ngày quyết định')]),
    section('I. Hồ sơ, trình tự và thủ tục', [area('hoSoTrinhPheDuyet', 'Danh mục hồ sơ trình phê duyệt', { required: true }), area('canCuPhapLy', 'Các căn cứ pháp lý', { required: true })]),
    section('II. Kết quả đánh giá, nhận xét', [area('ketQuaHoiDong', 'Kết quả đánh giá của Hội đồng xét duyệt', { required: true }), area('ketQuaCoQuan', 'Kết quả nhận xét của cơ quan chức năng', { required: true }), area('yKienHoiDongChuyenNganh', 'Ý kiến của Hội đồng KHCN chuyên ngành', { required: true })]),
    section('III. Đề xuất, kiến nghị và ký thông qua', [area('deXuatKienNghi', 'Đề xuất, kiến nghị', { required: true }), list('thanhVienThongQua', 'Thành viên Hội đồng chuyên ngành thông qua', [text('donViVaiTro', 'Đơn vị/vai trò'), text('hoTen', 'Họ tên')]), area('noiNhan', 'Nơi nhận')])
  ]),
  simpleDefinition('BM.02.19.QDI.NV_2024', 'BM.02.19.QDI.NV_2024.form.json', 'QUYẾT ĐỊNH PHÊ DUYỆT NHIỆM VỤ KHOA HỌC VÀ CÔNG NGHỆ CẤP TẬP ĐOÀN', [
    section('Thông tin quyết định và căn cứ', [...documentFields(), ...missionFields(), text('soBienBanXetDuyet', 'Số biên bản Hội đồng xét duyệt'), date('ngayBienBanXetDuyet', 'Ngày biên bản'), text('soBaoCaoHoiDong', 'Số báo cáo Hội đồng chuyên ngành'), date('ngayBaoCaoHoiDong', 'Ngày báo cáo'), text('soToTrinh', 'Số tờ trình đơn vị chủ trì'), date('ngayToTrinh', 'Ngày tờ trình'), area('canCuBoSung', 'Căn cứ bổ sung')]),
    section('Nội dung phê duyệt', [num('thoiGianThang', 'Thời gian thực hiện (tháng)', { required: true, validate: { min: 1 } }), date('ngayBatDau', 'Ngày bắt đầu'), date('ngayKetThuc', 'Ngày kết thúc'), num('kinhPhiDuToan', 'Kinh phí dự toán (VNĐ)', { required: true }), text('kinhPhiBangChu', 'Kinh phí bằng chữ'), text('nguonVon', 'Nguồn vốn', { defaultValue: 'Quỹ phát triển KHCN Tập đoàn' }), area('ketQuaNhiemVu', 'Kết quả nhiệm vụ'), area('noiNhan', 'Nơi nhận')])
  ]),
  simpleDefinition('BM.02.20.GNV.NV_2024', 'BM.02.20.GNV.NV_2024.form.json', 'QUYẾT ĐỊNH GIAO NHIỆM VỤ THỰC HIỆN NHIỆM VỤ KHOA HỌC VÀ CÔNG NGHỆ CẤP TẬP ĐOÀN', [
    section('Thông tin quyết định', [...documentFields(), ...missionFields(), text('soQuyetDinhPheDuyet', 'Số quyết định phê duyệt nhiệm vụ'), date('ngayQuyetDinhPheDuyet', 'Ngày quyết định phê duyệt'), area('canCuBoSung', 'Căn cứ bổ sung')]),
    section('Nội dung giao nhiệm vụ', [num('thoiGianThang', 'Thời gian thực hiện (tháng)', { required: true, validate: { min: 1 } }), date('ngayBatDau', 'Ngày bắt đầu'), date('ngayKetThuc', 'Ngày kết thúc'), num('tongKinhPhi', 'Tổng kinh phí (VNĐ)', { required: true }), text('kinhPhiBangChu', 'Kinh phí bằng chữ'), text('nguonKinhPhi', 'Nguồn kinh phí'), area('noiDungKetQua', 'Nội dung, kết quả và sản phẩm phải đạt'), area('tienDoThucHien', 'Tiến độ thực hiện'), area('trachNhiemDonVi', 'Trách nhiệm của đơn vị chủ trì'), area('trachNhiemChuNhiem', 'Trách nhiệm của Chủ nhiệm nhiệm vụ'), area('quyDinhKetThuc', 'Quy định kết thúc/dừng nhiệm vụ'), area('noiNhan', 'Nơi nhận')])
  ]),
  simpleDefinition('BM.02.21.HDO.NV_2024', 'BM.02.21.HDO.NV_2024.form.json', 'HỢP ĐỒNG KHOA HỌC VÀ CÔNG NGHỆ', [
    section('Thông tin hợp đồng và các bên', [...documentFields(), text('soQuyetDinhPheDuyet', 'Số quyết định phê duyệt nhiệm vụ'), date('ngayQuyetDinhPheDuyet', 'Ngày quyết định'), text('benADaiDien', 'Bên A - Người đại diện', { required: true }), text('benAChucVu', 'Bên A - Chức vụ'), text('benADiaChi', 'Bên A - Địa chỉ'), text('benADienThoai', 'Bên A - Điện thoại'), text('benAFax', 'Bên A - Fax'), text('benAMaSoThue', 'Bên A - Mã số thuế'), text('benBDonVi', 'Bên B - Đơn vị chủ trì', { required: true }), text('benBDiaChi', 'Bên B - Địa chỉ'), text('benBDienThoai', 'Bên B - Điện thoại'), text('benBFax', 'Bên B - Fax'), text('benBSoTaiKhoan', 'Bên B - Số tài khoản'), text('benBMaSoThue', 'Bên B - Mã số thuế'), text('chuNhiemHoTen', 'Chủ nhiệm nhiệm vụ', { required: true }), text('chuNhiemChucVu', 'Chức vụ Chủ nhiệm')]),
    section('Điều 1. Giao và nhận thực hiện nhiệm vụ', [...missionFields().filter((f) => f.key !== 'chuNhiemHoTen'), num('thoiGianThang', 'Thời gian thực hiện (tháng)', { required: true, validate: { min: 1 } }), date('ngayBatDau', 'Ngày bắt đầu'), date('ngayKetThuc', 'Ngày kết thúc'), num('tongKinhPhi', 'Tổng kinh phí đã gồm VAT (VNĐ)', { required: true }), text('kinhPhiBangChu', 'Kinh phí bằng chữ'), num('soLanCapKinhPhi', 'Số lần cấp kinh phí'), list('tienDoCapKinhPhi', 'Tiến độ cấp phát kinh phí', [text('dot', 'Đợt/lần cấp'), num('tyLe', 'Tỷ lệ (%)', { validate: { min: 0, max: 100 } }), num('soTien', 'Số tiền'), text('bangChu', 'Bằng chữ'), area('dieuKien', 'Điều kiện cấp')])]),
    section('Điều 2-5. Quyền, nghĩa vụ và hiệu lực', [area('quyenNghiaVuBenA', 'Quyền và nghĩa vụ của Bên A', { required: true }), area('quyenNghiaVuBenB', 'Quyền và nghĩa vụ của Bên B', { required: true }), area('xuLyTaiChinh', 'Xử lý tài chính khi chấm dứt hợp đồng'), area('dieuKhoanChung', 'Điều khoản chung'), num('soTrang', 'Số trang hợp đồng'), num('soBan', 'Số bản hợp đồng', { defaultValue: 6 }), num('soBanMoiBen', 'Số bản mỗi bên giữ', { defaultValue: 3 }), text('daiDienBenAKy', 'Đại diện Bên A ký'), text('daiDienDonViChuTriKy', 'Đại diện đơn vị chủ trì ký'), text('chuNhiemKy', 'Chủ nhiệm nhiệm vụ ký')])
  ])
];

function preview(def) {
  const blocks = def.sections.map((s) => {
    const rows = s.fields.filter((f) => f.key).map((f) => `<p><strong>${escapeHtml(f.label)}:</strong> <span class=\"value\">{{${f.key}}}</span></p>`).join('');
    return `<section><h3>${escapeHtml(s.title)}</h3>${rows}</section>`;
  }).join('');
  return `<style>.bm-page{max-width:900px;margin:0 auto;padding:34px 48px;background:#fff;color:#111;font:17px/1.48 \"Times New Roman\",serif;box-sizing:border-box}.bm-head{text-align:center}.bm-head .nation{font-weight:700;text-transform:uppercase}.bm-head .motto{font-weight:700}.bm-rule{display:inline-block;width:150px;border-top:1px solid #111}.bm-title{text-align:center;font-size:20px;font-weight:700;margin:24px 0}.bm-code{text-align:right;font-size:13px}.bm-page h3{font-size:17px;margin:18px 0 8px}.bm-page p{margin:4px 0;text-align:justify;white-space:pre-line}.value:empty:after{content:\"................................\";font-weight:400}@media(max-width:680px){.bm-page{padding:18px 14px;font-size:15px}}</style><article class=\"bm-page\"><div class=\"bm-code\">${escapeHtml(def.code)}</div><header class=\"bm-head\"><div class=\"nation\">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div><div class=\"motto\">Độc lập - Tự do - Hạnh phúc</div><span class=\"bm-rule\"></span></header><div class=\"bm-title\">${escapeHtml(def.title)}</div>${blocks}</article>`;
}
function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }
function schema(def) {
  const editor = [];
  for (const s of def.sections) {
    editor.push(html(`<div style=\"margin:14px 0 5px;padding:8px 10px;background:#eef3f8;border-left:4px solid #1f5a94;font-weight:700\">${escapeHtml(s.title)}</div>`));
    editor.push(...s.fields);
  }
  return {
    executionPlatform: 'Camunda Cloud', executionPlatformVersion: '8.9.0', exporter: { name: 'Camunda Web Modeler', version: 'c72e043' }, schemaVersion: 19,
    id: `Form_${def.code.replaceAll('.', '_').replaceAll('-', '_')}`,
    components: [
      html('<div style="padding:10px 12px;background:#f4f7fb;border-left:4px solid #0f62fe"><strong>Chế độ hiển thị:</strong> Nhập và kiểm tra dữ liệu ở chế độ soạn thảo. Bật <em>Xem văn bản hoàn chỉnh</em> để xem bản trình bày.</div>'),
      { type: 'checkbox', id: id('Field'), key: 'cheDoXemVanBan', label: 'Xem văn bản hoàn chỉnh', defaultValue: false, layout: layout(id('Row')) },
      { type: 'group', id: id('Group'), label: 'Thông tin soạn thảo', showOutline: true, conditional: { hide: '=cheDoXemVanBan = true' }, components: editor, layout: layout(id('Row')) },
      { type: 'html', id: id('Html'), content: preview(def), conditional: { hide: '=cheDoXemVanBan != true' }, layout: layout(id('Row')) }
    ], type: 'default'
  };
}

fs.mkdirSync(outDir, { recursive: true });
for (const def of definitions) {
  fs.writeFileSync(path.join(outDir, def.file), `${JSON.stringify(schema(def), null, 2)}\n`, 'utf8');
  console.log(def.file);
}
