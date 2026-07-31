import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('outputs');
let seq = 0;
const uid = (prefix) => `${prefix}_${++seq}`;
const layout = (row = uid('Row'), columns = null) => ({ row, columns });
const field = (type, key, label, options = {}) => {
  const result = { type, id: uid('Field'), key, label, layout: layout(uid('Row'), options.columns ?? null) };
  if (options.required || options.validate) result.validate = { ...(options.required ? { required: true } : {}), ...(options.validate || {}) };
  if (options.defaultValue !== undefined) result.defaultValue = options.defaultValue;
  if (options.description) result.description = options.description;
  if (options.subtype) result.subtype = options.subtype;
  if (options.values) result.values = options.values.map(([value, caption]) => ({ value, label: caption }));
  return result;
};
const text = (key, label, options) => field('textfield', key, label, options);
const area = (key, label, options) => field('textarea', key, label, options);
const number = (key, label, options = {}) => field('number', key, label, { ...options, validate: { min: 0, ...(options.validate || {}) } });
const date = (key, label, options = {}) => field('datetime', key, label, { subtype: 'date', ...options });
const select = (key, label, values, options = {}) => field('select', key, label, { ...options, values });
const checklist = (key, label, values, options = {}) => field('checklist', key, label, { ...options, values });
const html = (content) => ({ type: 'html', id: uid('Html'), content, layout: layout(uid('Row')) });
const list = (key, label, components, options = {}) => ({ type: 'dynamiclist', id: uid('List'), key, label, showOutline: true, components, layout: layout(uid('Row')), ...(options.required ? { validate: { required: true } } : {}) });
const section = (title, fields) => ({ title, fields });

const docFields = () => [
  text('donViBanHanh', 'Đơn vị ban hành/chủ trì', { required: true }),
  text('soVanBan', 'Số văn bản'),
  text('diaDanh', 'Địa danh', { defaultValue: 'Hà Nội', required: true }),
  date('ngayVanBan', 'Ngày văn bản', { required: true }),
  text('nguoiKy', 'Họ tên người ký'),
  text('chucDanhKy', 'Chức danh người ký')
];
const missionFields = () => [
  text('tenNhiemVu', 'Tên nhiệm vụ KHCN', { required: true }),
  text('maNhiemVu', 'Mã số nhiệm vụ'),
  text('capQuanLy', 'Cấp quản lý'),
  text('donViChuTri', 'Đơn vị chủ trì', { required: true }),
  text('chuNhiemNhiemVu', 'Cá nhân chủ nhiệm'),
  text('linhVuc', 'Lĩnh vực Hội đồng KHCN chuyên ngành')
];
const projectFields = () => [
  text('tenDuAn', 'Tên dự án', { required: true }),
  text('nhomDuAn', 'Nhóm/phân loại dự án'),
  text('capQuyetDinhChuTruong', 'Cấp quyết định chủ trương đầu tư'),
  text('capQuyetDinhDauTu', 'Cấp quyết định đầu tư'),
  text('chuDauTu', 'Chủ đầu tư', { defaultValue: 'Tập đoàn Công nghiệp - Viễn thông Quân đội' }),
  text('daiDienChuDauTu', 'Đại diện chủ đầu tư'),
  text('donViThucHien', 'Cơ quan, đơn vị thực hiện dự án', { required: true }),
  text('doiTuongThuHuong', 'Đối tượng thụ hưởng'),
  text('hinhThucQuanLy', 'Hình thức quản lý dự án'),
  text('diaDiemThucHien', 'Địa điểm thực hiện dự án'),
  number('tongMucDauTu', 'Tổng mức đầu tư (VNĐ)', { required: true }),
  text('tongMucDauTuBangChu', 'Tổng mức đầu tư bằng chữ'),
  text('nguonVon', 'Nguồn vốn', { defaultValue: 'Quỹ phát triển KHCN Viettel' }),
  date('ngayBatDau', 'Ngày bắt đầu dự kiến'),
  date('ngayKetThuc', 'Ngày kết thúc dự kiến'),
  text('hinhThucDauTu', 'Hình thức đầu tư', { defaultValue: 'Dự án đầu tư mua sắm hỗ trợ KHCN' })
];
const opinionLists = () => [
  list('yKienHoiDong', 'Ý kiến Hội đồng và giải trình', [area('yKien', 'Ý kiến Hội đồng'), area('giaiTrinh', 'Giải trình của đơn vị chủ trì'), text('thamChieu', 'Tham chiếu văn bản')]),
  list('yKienCoQuan', 'Ý kiến cơ quan chức năng và giải trình', [text('coQuan', 'Cơ quan chức năng'), area('yKien', 'Ý kiến'), area('giaiTrinh', 'Giải trình của đơn vị chủ trì'), text('thamChieu', 'Tham chiếu văn bản')])
];
const signing = () => [area('noiNhan', 'Nơi nhận')];

const defs = [
  { code: 'BM.01.01.TTR.NV_2024', title: 'TỜ TRÌNH PHÊ DUYỆT CHỦ TRƯƠNG THỰC HIỆN NHIỆM VỤ KHCN', sections: [
    section('Thông tin tờ trình', [...docFields(), ...missionFields(), area('kinhGui', 'Kính gửi', { defaultValue: '- Người có thẩm quyền;\n- Hội đồng KHCN chuyên ngành.' }), area('canCu', 'Các căn cứ trình phê duyệt')]),
    section('I. Tính cấp thiết', [area('tinhCapThiet', 'Tính cấp thiết, nhu cầu, hiện trạng và sở cứ pháp lý', { required: true })]),
    section('II. Nội dung nhiệm vụ', [area('mucTieu', 'Mục tiêu', { required: true }), area('quyMo', 'Quy mô triển khai'), list('sanPhamDuKien', 'Sản phẩm dự kiến', [text('tenSanPham', 'Tên sản phẩm'), number('soLuong', 'Số lượng'), area('moTaChiTieu', 'Mô tả/chỉ tiêu chính')]), text('hinhThucThucHien', 'Hình thức và cấp quản lý'), number('thoiGianThang', 'Thời gian thực hiện (tháng)'), area('mocTienDo', 'Các mốc tiến độ chính'), area('canCuKhaiToan', 'Căn cứ, phương pháp khái toán'), number('tongKinhPhi', 'Tổng kinh phí dự kiến (VNĐ)', { required: true }), text('nguonKinhPhiKeHoach', 'Nguồn kinh phí và tham chiếu kế hoạch năm'), area('keHoachBoTriVon', 'Kế hoạch bố trí vốn'), area('thiTruong', 'Thị trường'), area('hieuQuaDuKien', 'Hiệu quả KHCN, quốc phòng, an ninh và kinh tế - xã hội')]),
    section('III. Đề xuất, kiến nghị', [area('deXuatKienNghi', 'Đề xuất, kiến nghị', { required: true }), ...signing()])
  ]},
  { code: 'BM.01.02.BCA.NV_2024', title: 'BÁO CÁO HOÀN THIỆN HỒ SƠ TRÌNH PHÊ DUYỆT CHỦ TRƯƠNG', sections: [
    section('Thông tin báo cáo', [...docFields(), ...missionFields(), text('kinhGui', 'Kính gửi', { defaultValue: 'Hội đồng KHCN chuyên ngành' }), area('canCu', 'Căn cứ và văn bản nhận xét')]),
    section('Nội dung hoàn thiện', [area('tomTatTiepThuCoQuan', 'Nội dung tiếp thu theo ý kiến cơ quan chức năng', { required: true }), area('tomTatTiepThuHoiDong', 'Nội dung tiếp thu theo ý kiến Hội đồng', { required: true }), area('noiDungHoSoHoanThien', 'Các nội dung chính của hồ sơ đã hoàn thiện', { required: true }), ...opinionLists(), ...signing()])
  ]},
  { code: 'BM.01.03.BCT.NV_2024', title: 'BÁO CÁO THÔNG QUA CHỦ TRƯƠNG THỰC HIỆN NHIỆM VỤ KHCN', sections: [
    section('Thông tin báo cáo', [...docFields(), ...missionFields(), text('kinhGui', 'Kính gửi Người có thẩm quyền'), text('soToTrinh', 'Số Tờ trình của đơn vị chủ trì'), date('ngayToTrinh', 'Ngày Tờ trình')]),
    section('I. Hồ sơ trình phê duyệt', [area('danhMucHoSo', 'Danh mục hồ sơ trình phê duyệt', { required: true }), area('noiDungChuTruong', 'Nội dung chủ trương'), area('mucTieu', 'Mục tiêu'), text('hinhThucThucHien', 'Hình thức thực hiện'), number('tongKinhPhiKhaiToan', 'Tổng kinh phí khái toán'), text('nguonVon', 'Nguồn vốn')]),
    section('II. Kết quả thẩm định', [area('thamDinhCoQuan', 'Thẩm định của các cơ quan, đơn vị', { required: true }), area('danhGiaTiepThu', 'Đánh giá tiếp thu, giải trình hoặc bảo lưu'), area('yKienChuaThongNhat', 'Ý kiến chưa thống nhất'), area('yKienHoiDong', 'Ý kiến Hội đồng KHCN chuyên ngành')]),
    section('III. Đề xuất, kiến nghị', [area('deXuatKienNghi', 'Đề xuất, kiến nghị', { required: true }), list('thanhVienHoiDongKy', 'Thành viên Hội đồng ký thông qua', [text('hoTen', 'Họ tên'), text('vaiTro', 'Vai trò')]), ...signing()])
  ]},
  { code: 'BM.01.04.QDI.NV_2024', title: 'QUYẾT ĐỊNH PHÊ DUYỆT CHỦ TRƯƠNG THỰC HIỆN NHIỆM VỤ KHCN', sections: [
    section('Thông tin quyết định và căn cứ', [...docFields(), ...missionFields(), text('soToTrinh', 'Số Tờ trình'), date('ngayToTrinh', 'Ngày Tờ trình'), text('soBaoCaoHoiDong', 'Số Báo cáo Hội đồng'), date('ngayBaoCaoHoiDong', 'Ngày Báo cáo Hội đồng'), area('canCuBoSung', 'Căn cứ bổ sung')]),
    section('Điều 1. Nội dung phê duyệt', [area('mucTieu', 'Mục tiêu', { required: true }), list('sanPham', 'Sản phẩm', [text('tenSanPham', 'Tên sản phẩm'), number('soLuong', 'Số lượng'), area('yeuCau', 'Yêu cầu')]), number('thoiGianThang', 'Thời gian thực hiện (tháng)'), date('ngayBatDau', 'Ngày bắt đầu'), date('ngayKetThuc', 'Ngày kết thúc'), text('hinhThucThucHien', 'Hình thức thực hiện'), number('tongKinhPhiKhaiToan', 'Tổng khái toán kinh phí (VNĐ)', { required: true }), text('kinhPhiBangChu', 'Kinh phí bằng chữ'), text('nguonVon', 'Nguồn vốn', { defaultValue: 'Quỹ phát triển KHCN Viettel' })]),
    section('Điều 2-3. Tổ chức và thi hành', [area('toChucThucHien', 'Tổ chức thực hiện', { required: true }), area('dieuKhoanThiHanh', 'Điều khoản thi hành'), ...signing()])
  ]},
  { code: 'BM.01.05.TTr.NV_2024', title: 'TỜ TRÌNH PHÊ DUYỆT ĐIỀU CHỈNH CHỦ TRƯƠNG THỰC HIỆN NHIỆM VỤ KHCN', sections: [
    section('Thông tin tờ trình', [...docFields(), ...missionFields(), area('kinhGui', 'Kính gửi'), text('soQuyetDinhChuTruong', 'Số Quyết định chủ trương'), date('ngayQuyetDinhChuTruong', 'Ngày Quyết định chủ trương')]),
    section('I. Chủ trương và nhiệm vụ đã phê duyệt', [area('mucTieuDaDuyet', 'Mục tiêu đã phê duyệt'), number('kinhPhiKhaiToanDaDuyet', 'Kinh phí khái toán đã phê duyệt'), text('hinhThucDaDuyet', 'Hình thức/cấp quản lý đã phê duyệt'), area('ketQuaDuKien', 'Tóm tắt kết quả dự kiến'), number('thoiGianDaDuyetThang', 'Thời gian đã phê duyệt (tháng)'), number('duToanDaDuyet', 'Tổng dự toán đã phê duyệt')]),
    section('II. Tình hình triển khai', [area('tienDoKetQua', 'Tiến độ và kết quả thực hiện', { required: true }), number('tyLeHoanThanh', 'Tỷ lệ hoàn thành (%)', { validate: { max: 100 } }), area('tinhHinhTaiChinh', 'Tình hình sử dụng tài chính'), area('khoKhanVuongMac', 'Tồn tại, khó khăn, vướng mắc'), list('tienDoChiTiet', 'Phụ lục - Tiến độ thực hiện', [text('noiDungCongViec', 'Nội dung công việc'), date('tuNgay', 'Từ ngày'), date('denNgay', 'Đến ngày'), area('ketQuaHienTai', 'Kết quả hiện tại'), area('ghiChu', 'Ghi chú')]), list('suDungKinhPhi', 'Phụ lục - Tình hình sử dụng kinh phí', [text('khoanChi', 'Nội dung khoản chi'), number('kinhPhiDuocDuyet', 'Kinh phí được duyệt'), number('giaTriDaQuyetToan', 'Giá trị đã quyết toán'), area('ghiChu', 'Ghi chú')])]),
    section('III. Nội dung đề xuất điều chỉnh', [area('dieuChinhMucTieu', 'Điều chỉnh mục tiêu'), number('kinhPhiTangGiam', 'Kinh phí điều chỉnh tăng/giảm'), number('tongDuToanSauDieuChinh', 'Tổng dự toán sau điều chỉnh'), area('chiTietDieuChinhKinhPhi', 'Chi tiết và cơ sở điều chỉnh kinh phí'), text('donViChuTriMoi', 'Đơn vị chủ trì đề xuất thay đổi'), area('lyDoDieuChinh', 'Lý do và luận giải điều chỉnh'), list('khaiToanDieuChinh', 'Phụ lục - Điều chỉnh khái toán kinh phí', [text('hangMuc', 'Hạng mục'), text('donViTinh', 'Đơn vị tính'), number('soLuongCu', 'Số lượng đã duyệt'), number('donGiaCu', 'Đơn giá đã duyệt'), number('thanhTienCu', 'Thành tiền đã duyệt'), number('soLuongMoi', 'Số lượng điều chỉnh'), number('donGiaMoi', 'Đơn giá điều chỉnh'), number('thanhTienMoi', 'Thành tiền điều chỉnh'), number('chenhLech', 'Chênh lệch'), area('ghiChu', 'Ghi chú')]), area('deXuatKienNghi', 'Đề xuất, kiến nghị'), ...signing()])
  ]},
  { code: 'BM.01.06.BCA.NV_2024', title: 'BÁO CÁO HOÀN THIỆN HỒ SƠ ĐIỀU CHỈNH CHỦ TRƯƠNG NHIỆM VỤ KHCN', sections: [
    section('Thông tin báo cáo', [...docFields(), ...missionFields(), text('kinhGui', 'Kính gửi Hội đồng KHCN chuyên ngành'), area('canCu', 'Căn cứ và văn bản nhận xét')]),
    section('Nội dung hoàn thiện', [area('tomTatTiepThuCoQuan', 'Nội dung tiếp thu theo ý kiến cơ quan chức năng', { required: true }), area('tomTatTiepThuHoiDong', 'Nội dung tiếp thu theo ý kiến Hội đồng'), area('noiDungHoSoHoanThien', 'Các nội dung hồ sơ đã hoàn thiện', { required: true }), ...opinionLists(), ...signing()])
  ]},
  { code: 'BM.01.07.BCT.NV_2024', title: 'BÁO CÁO THÔNG QUA ĐIỀU CHỈNH CHỦ TRƯƠNG NHIỆM VỤ KHCN', sections: [
    section('Thông tin báo cáo', [...docFields(), ...missionFields(), text('soQuyetDinhChuTruong', 'Số Quyết định chủ trương'), text('soToTrinhDieuChinh', 'Số Tờ trình điều chỉnh')]),
    section('I. Tóm tắt đề xuất điều chỉnh', [area('noiDungDaPheDuyet', 'Nội dung đã được phê duyệt'), area('noiDungDeXuatDieuChinh', 'Nội dung đề xuất điều chỉnh', { required: true })]),
    section('II-III. Hồ sơ, pháp lý và ý kiến thẩm định', [area('hoSoTrinh', 'Hồ sơ trình phê duyệt'), area('canCuPhapLy', 'Căn cứ pháp lý'), area('tongHopYKienCoQuan', 'Tổng hợp ý kiến cơ quan, đơn vị'), area('danhGiaTiepThu', 'Đánh giá tiếp thu, giải trình hoặc bảo lưu'), area('yKienChuaThongNhat', 'Ý kiến chưa thống nhất')]),
    section('IV. Đề xuất, kiến nghị', [area('deXuatKienNghi', 'Đề xuất, kiến nghị', { required: true }), area('mucTieuDieuChinh', 'Mục tiêu sau điều chỉnh'), number('tongKhaiToanSauDieuChinh', 'Tổng khái toán sau điều chỉnh'), list('thanhVienHoiDongKy', 'Thành viên Hội đồng ký', [text('hoTen', 'Họ tên'), text('vaiTro', 'Vai trò')]), ...signing()])
  ]},
  { code: 'BM.01.08.QDI.NV_2024', title: 'QUYẾT ĐỊNH PHÊ DUYỆT ĐIỀU CHỈNH CHỦ TRƯƠNG NHIỆM VỤ KHCN', sections: [
    section('Thông tin quyết định', [...docFields(), ...missionFields(), text('soQuyetDinhChuTruong', 'Số Quyết định chủ trương cũ'), text('soToTrinhDieuChinh', 'Số Tờ trình điều chỉnh'), text('soBaoCaoHoiDong', 'Số Báo cáo Hội đồng')]),
    section('Điều 1. Nội dung điều chỉnh', [area('mucTieuDieuChinh', 'Mục tiêu điều chỉnh', { required: true }), number('tongKinhPhiSauDieuChinh', 'Tổng khái toán kinh phí sau điều chỉnh'), text('kinhPhiBangChu', 'Kinh phí bằng chữ'), text('nguonVon', 'Nguồn vốn', { defaultValue: 'Quỹ phát triển KHCN Viettel' }), area('noiDungKhac', 'Nội dung điều chỉnh khác')]),
    section('Điều 2-3. Tổ chức và thi hành', [area('toChucThucHien', 'Tổ chức thực hiện', { required: true }), area('dieuKhoanThiHanh', 'Điều khoản thi hành'), ...signing()])
  ]},
  { code: 'BM.01.11.TTR.DA_2024', title: 'TỜ TRÌNH ĐỀ XUẤT CHỦ TRƯƠNG ĐẦU TƯ DỰ ÁN', sections: [
    section('Thông tin tờ trình', [...docFields(), ...projectFields(), area('kinhGui', 'Kính gửi'), area('canCuPhapLy', 'Căn cứ pháp lý')]),
    section('Danh mục hồ sơ kèm theo', [checklist('hoSoKemTheo', 'Hồ sơ kèm theo', [['bao_cao', 'Báo cáo đề xuất chủ trương đầu tư'], ['khao_sat', 'Hồ sơ khảo sát thiết kế sơ bộ'], ['du_toan', 'Dự toán dự án'], ['bao_gia', 'Báo giá, tài liệu kỹ thuật tham khảo']]), area('hoSoKhac', 'Hồ sơ khác')]),
    section('Đề xuất, kiến nghị', [area('deXuatKienNghi', 'Đề xuất, kiến nghị', { required: true }), ...signing()])
  ]},
  { code: 'BM.01.12.BCA.DA_2024', title: 'BÁO CÁO ĐỀ XUẤT CHỦ TRƯƠNG ĐẦU TƯ DỰ ÁN', sections: [
    section('Thông tin chung', [...docFields(), ...projectFields(), area('kinhGui', 'Kính gửi'), area('canCuPhapLy', 'Căn cứ pháp lý')]),
    section('Nội dung chủ yếu của dự án', [area('suCanThiet', 'Sự cần thiết đầu tư', { required: true }), area('mucTieuDauTu', 'Mục tiêu đầu tư', { required: true }), area('phuongAnKyThuatQuyMo', 'Phương án kỹ thuật, quy mô', { required: true }), list('thietBiThamKhao', 'Danh mục trang thiết bị tham khảo', [text('tenThietBi', 'Tên thiết bị'), text('hangSanXuat', 'Hãng/nhà sản xuất'), area('chiTieuKyThuat', 'Chỉ tiêu kỹ thuật chính'), number('soLuong', 'Số lượng'), area('coSoDeXuat', 'Cơ sở đề xuất')]), area('khaoSatHaTang', 'Kết quả khảo sát hạ tầng sơ bộ')]),
    section('Sơ bộ tổng mức đầu tư', [area('canCuTongMucDauTu', 'Căn cứ xác định tổng mức đầu tư'), area('phuongPhapTongMucDauTu', 'Phương pháp xác định'), list('chiPhiDauTu', 'Bảng tổng hợp chi phí', [text('maKhoanMuc', 'Mã khoản mục'), text('noiDungChiPhi', 'Nội dung chi phí'), number('thanhTienChuaVat', 'Thành tiền chưa VAT'), number('thueVat', 'Thuế VAT'), number('thanhTienCoVat', 'Thành tiền có VAT')], { required: true }), area('coSoDonGia', 'Cơ sở tính đơn giá')]),
    section('Hiệu quả và tổ chức thực hiện', [area('thoiGianDiaDiem', 'Thời gian, địa điểm thực hiện'), area('hieuQuaKinhTeXaHoi', 'Hiệu quả kinh tế - xã hội'), area('tacDongMoiTruongXaHoi', 'Tác động môi trường, xã hội'), area('anToanPcccAnNinh', 'PCCC, an toàn và an ninh thông tin'), area('giaiPhapToChuc', 'Giải pháp tổ chức thực hiện'), ...signing()])
  ]},
  { code: 'BM.01.13.KSA.DA_2024', title: 'HỒ SƠ KHẢO SÁT SƠ BỘ DỰ ÁN', sections: [
    section('Thông tin hồ sơ', [...docFields(), ...projectFields()]),
    section('I. Khảo sát hạ tầng', [area('viTriLapDat', 'Vị trí, mặt bằng và bố trí lắp đặt', { required: true }), area('haTangCnttKetNoi', 'Hạ tầng CNTT/cloud/kết nối'), area('banVeTaiLieu', 'Bản vẽ, tài liệu khảo sát liên quan'), area('ketLuanHaTang', 'Kết luận khả năng lắp đặt', { required: true })]),
    section('II. Tải trọng, nguồn điện và môi trường', [number('taiTrongNen', 'Khả năng chịu tải nền (kg/m²)'), text('nguonDien', 'Nguồn điện: dòng, pha, điện áp'), number('congSuatTieuThu', 'Công suất tiêu thụ dự kiến'), text('daiNhietDo', 'Dải nhiệt độ hoạt động'), text('daiDoAm', 'Dải độ ẩm hoạt động'), area('danhGiaMoiTruong', 'Đánh giá điều kiện môi trường'), area('ketLuanNguonTai', 'Kết luận về nguồn điện, tải trọng và môi trường', { required: true }), ...signing()])
  ]},
  { code: 'BM.01.14.KTO.DA_2024', title: 'KHÁI TOÁN DỰ ÁN ĐẦU TƯ HỖ TRỢ KHCN', sections: [
    section('Thông tin dự án và khái toán', [...docFields(), ...projectFields(), text('donViTinhTien', 'Đơn vị tiền tệ', { defaultValue: 'VNĐ' }), area('canCuKhaiToan', 'Căn cứ lập khái toán')]),
    section('Chi phí thiết bị', [list('chiPhiThietBi', 'Danh mục thiết bị và chi phí', [text('maThietBi', 'Mã thiết bị'), text('tenThietBi', 'Tên thiết bị'), area('cauHinhChiTieu', 'Cấu hình/chỉ tiêu kỹ thuật'), text('donViTinh', 'Đơn vị tính'), number('soLuong', 'Số lượng'), number('donGiaNgoaiTe', 'Đơn giá ngoại tệ'), number('tyGia', 'Tỷ giá'), number('donGiaVnd', 'Đơn giá VNĐ'), number('thanhTienChuaVat', 'Thành tiền chưa VAT'), number('thueSuatVat', 'Thuế suất VAT (%)'), number('thueVat', 'Tiền VAT'), number('thanhTienCoVat', 'Thành tiền có VAT'), area('coSoGia', 'Cơ sở giá/báo giá')], { required: true })]),
    section('Chi phí khác và tổng hợp', [list('chiPhiKhac', 'Chi phí quản lý, tư vấn, kiểm toán và chi phí khác', [text('maKhoanMuc', 'Mã khoản mục'), text('noiDungChiPhi', 'Nội dung chi phí'), number('giaTriTruocVat', 'Giá trị trước VAT'), number('thueVat', 'Thuế VAT'), number('giaTriSauVat', 'Giá trị sau VAT'), area('coSoTinh', 'Cơ sở tính')]), number('chiPhiDuPhong', 'Chi phí dự phòng'), number('tongCongTruocVat', 'Tổng cộng trước VAT'), number('tongThueVat', 'Tổng thuế VAT'), number('tongCongSauVat', 'Tổng cộng sau VAT', { required: true }), text('tongCongBangChu', 'Tổng cộng bằng chữ'), area('ghiChuKhaiToan', 'Ghi chú khái toán'), ...signing()])
  ]},
  { code: 'BM.01.15.BCT.DA_2024', title: 'BÁO CÁO THÔNG QUA CHỦ TRƯƠNG ĐẦU TƯ DỰ ÁN', sections: [
    section('Thông tin báo cáo', [...docFields(), ...projectFields(), text('linhVucHoiDong', 'Lĩnh vực Hội đồng chuyên ngành'), area('canCuPhapLy', 'Căn cứ pháp lý')]),
    section('Phần 1. Tài liệu và tổ chức thẩm định', [area('hoSoTaiLieu', 'Hồ sơ, tài liệu thẩm định', { required: true }), area('canCuThamDinh', 'Căn cứ pháp lý để thẩm định'), area('keHoachBoTriVon', 'Kế hoạch bố trí vốn'), text('nganhLinhVuc', 'Ngành, lĩnh vực đề nghị thẩm định'), area('thongTinChungBoSung', 'Thông tin chung bổ sung')]),
    section('Phần 2. Ý kiến thẩm định', [area('thamDinhCoQuan', 'Thẩm định của các cơ quan, đơn vị', { required: true }), area('danhGiaTiepThu', 'Đánh giá nội dung tiếp thu, giải trình hoặc bảo lưu'), area('yKienChuaThongNhat', 'Ý kiến chưa thống nhất'), area('yKienHoiDong', 'Ý kiến Hội đồng KHCN chuyên ngành'), area('deXuatKienNghi', 'Đề xuất, kiến nghị', { required: true }), list('tongHopYKien', 'Phụ lục ý kiến và giải trình', [area('yKien', 'Ý kiến Hội đồng chuyên ngành'), area('giaiTrinh', 'Giải trình của đơn vị chủ trì'), text('thamChieu', 'Tham chiếu văn bản')]), list('thanhVienHoiDongKy', 'Thành viên Hội đồng ký', [text('hoTen', 'Họ tên'), text('vaiTro', 'Vai trò')]), ...signing()])
  ]},
  { code: 'BM.01.16.QDI.DA_2024', title: 'QUYẾT ĐỊNH PHÊ DUYỆT CHỦ TRƯƠNG ĐẦU TƯ DỰ ÁN', sections: [
    section('Thông tin quyết định', [...docFields(), ...projectFields(), text('soBaoCaoHoiDong', 'Số Báo cáo Hội đồng'), date('ngayBaoCaoHoiDong', 'Ngày Báo cáo Hội đồng'), area('canCuBoSung', 'Căn cứ bổ sung')]),
    section('Điều 1. Nội dung phê duyệt', [area('mucTieuDauTu', 'Mục tiêu đầu tư', { required: true }), area('quyMoDauTu', 'Quy mô đầu tư', { required: true })]),
    section('Điều 2-3. Tổ chức và thi hành', [area('toChucThucHien', 'Tổ chức thực hiện', { required: true }), area('dieuKhoanThiHanh', 'Điều khoản thi hành'), ...signing()])
  ]},
  { code: 'BM.01.17.TTr.DA_2024', title: 'TỜ TRÌNH PHÊ DUYỆT ĐIỀU CHỈNH CHỦ TRƯƠNG ĐẦU TƯ DỰ ÁN', sections: [
    section('Thông tin tờ trình', [...docFields(), ...projectFields(), area('kinhGui', 'Kính gửi'), area('canCuPhapLy', 'Căn cứ pháp lý'), text('soQuyetDinhChuTruongCu', 'Số Quyết định chủ trương đã phê duyệt')]),
    section('Thông tin dự án đã được phê duyệt', [area('mucTieuDaDuyet', 'Mục tiêu đã phê duyệt'), area('quyMoDaDuyet', 'Quy mô đã phê duyệt'), number('tongVonDaDuyet', 'Tổng vốn đã phê duyệt'), text('thoiGianDaDuyet', 'Thời gian đã phê duyệt')]),
    section('Nội dung điều chỉnh và hồ sơ', [area('lyDoDieuChinh', 'Lý do điều chỉnh', { required: true }), area('mucTieuDieuChinh', 'Điều chỉnh mục tiêu'), area('quyMoDieuChinh', 'Điều chỉnh quy mô'), number('tongMucDauTuDieuChinh', 'Tổng mức đầu tư sau điều chỉnh'), text('thoiGianDieuChinh', 'Thời gian thực hiện sau điều chỉnh'), list('noiDungDieuChinh', 'Bảng so sánh nội dung điều chỉnh', [text('noiDung', 'Nội dung'), area('daPheDuyet', 'Đã phê duyệt'), area('deXuatDieuChinh', 'Đề xuất điều chỉnh'), area('lyDo', 'Lý do')]), checklist('hoSoKemTheo', 'Hồ sơ kèm theo', [['bao_cao', 'Báo cáo đề xuất điều chỉnh'], ['khao_sat', 'Hồ sơ khảo sát sơ bộ'], ['du_toan', 'Dự toán điều chỉnh'], ['bao_gia', 'Báo giá, tài liệu kỹ thuật']]), area('deXuatKienNghi', 'Đề xuất, kiến nghị'), ...signing()])
  ]},
  { code: 'BM.01.18.BCT.DA_2024', title: 'BÁO CÁO THÔNG QUA ĐIỀU CHỈNH CHỦ TRƯƠNG ĐẦU TƯ DỰ ÁN', sections: [
    section('Thông tin báo cáo', [...docFields(), ...projectFields(), area('canCuPhapLy', 'Căn cứ pháp lý'), text('soQuyetDinhChuTruongCu', 'Số Quyết định chủ trương đã phê duyệt')]),
    section('Phần 1. Tài liệu thẩm định', [area('hoSoTaiLieu', 'Hồ sơ tài liệu thẩm định', { required: true }), area('canCuThamDinh', 'Căn cứ pháp lý để thẩm định'), area('thongTinDuAnDaDuyet', 'Thông tin chung dự án đã phê duyệt'), area('noiDungDeXuatDieuChinh', 'Các nội dung đề xuất điều chỉnh', { required: true })]),
    section('Phần 2. Ý kiến thẩm định', [area('thamDinhCoQuan', 'Thẩm định của các cơ quan, đơn vị'), area('danhGiaTiepThu', 'Đánh giá tiếp thu, giải trình hoặc bảo lưu'), area('yKienHoiDong', 'Ý kiến Hội đồng KHCN chuyên ngành'), area('deXuatKienNghi', 'Đề xuất, kiến nghị', { required: true }), list('tongHopYKien', 'Phụ lục ý kiến và giải trình', [area('yKien', 'Ý kiến Hội đồng'), area('giaiTrinh', 'Giải trình'), text('thamChieu', 'Tham chiếu')]), list('thanhVienHoiDongKy', 'Thành viên Hội đồng ký', [text('hoTen', 'Họ tên'), text('vaiTro', 'Vai trò')]), ...signing()])
  ]},
  { code: 'BM.01.19.QDI.DA_2024', title: 'QUYẾT ĐỊNH PHÊ DUYỆT ĐIỀU CHỈNH CHỦ TRƯƠNG ĐẦU TƯ DỰ ÁN', sections: [
    section('Thông tin quyết định', [...docFields(), ...projectFields(), text('soQuyetDinhChuTruongCu', 'Số Quyết định chủ trương cũ'), text('soBaoCaoHoiDong', 'Số Báo cáo Hội đồng'), area('canCuBoSung', 'Căn cứ bổ sung')]),
    section('Điều 1. Nội dung điều chỉnh', [area('mucTieuDieuChinh', 'Điều chỉnh mục tiêu đầu tư'), area('quyMoDieuChinh', 'Điều chỉnh quy mô đầu tư'), number('tongMucDauTuDieuChinh', 'Tổng mức đầu tư sau điều chỉnh'), text('thoiGianDieuChinh', 'Thời gian thực hiện sau điều chỉnh'), area('noiDungKhac', 'Nội dung điều chỉnh khác')]),
    section('Điều 2-3. Tổ chức và thi hành', [area('toChucThucHien', 'Tổ chức thực hiện', { required: true }), area('dieuKhoanThiHanh', 'Điều khoản thi hành'), ...signing()])
  ]}
];

const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
function preview(def) {
  const body = def.sections.map((s) => `<section><h3>${esc(s.title)}</h3>${s.fields.filter((f) => f.key).map((f) => `<p><strong>${esc(f.label)}:</strong> <span class="value">{{${f.key}}}</span></p>`).join('')}</section>`).join('');
  return `<style>.bm-page{max-width:900px;margin:0 auto;padding:34px 48px;background:#fff;color:#111;font:17px/1.48 "Times New Roman",serif;box-sizing:border-box}.bm-code{text-align:right;font-size:13px}.bm-head{text-align:center}.bm-head strong{display:block}.bm-rule{display:inline-block;width:150px;border-top:1px solid #111}.bm-title{text-align:center;font-size:20px;font-weight:700;margin:24px 0}.bm-page h3{font-size:17px;margin:18px 0 8px}.bm-page p{margin:4px 0;text-align:justify;white-space:pre-line}.value:empty:after{content:"................................"}@media(max-width:680px){.bm-page{padding:18px 14px;font-size:15px}}</style><article class="bm-page"><div class="bm-code">${esc(def.code)}</div><header class="bm-head"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><strong>Độc lập - Tự do - Hạnh phúc</strong><span class="bm-rule"></span></header><div class="bm-title">${esc(def.title)}</div>${body}</article>`;
}
function schema(def) {
  const editor = [];
  for (const s of def.sections) {
    editor.push(html(`<div style="margin:14px 0 5px;padding:8px 10px;background:#eef3f8;border-left:4px solid #1f5a94;font-weight:700">${esc(s.title)}</div>`), ...s.fields);
  }
  return {
    executionPlatform: 'Camunda Cloud', executionPlatformVersion: '8.9.0', exporter: { name: 'Camunda Web Modeler', version: 'c72e043' }, schemaVersion: 19,
    id: `Form_${def.code.replaceAll('.', '_')}`,
    components: [
      html('<div style="padding:10px 12px;background:#f4f7fb;border-left:4px solid #0f62fe"><strong>Chế độ hiển thị:</strong> Nhập và kiểm tra dữ liệu ở chế độ soạn thảo. Bật <em>Xem văn bản hoàn chỉnh</em> để xem bản trình bày.</div>'),
      { type: 'checkbox', id: uid('Field'), key: 'cheDoXemVanBan', label: 'Xem văn bản hoàn chỉnh', defaultValue: false, layout: layout(uid('Row')) },
      { type: 'group', id: uid('Group'), label: 'Thông tin soạn thảo', showOutline: true, conditional: { hide: '=cheDoXemVanBan = true' }, components: editor, layout: layout(uid('Row')) },
      { type: 'html', id: uid('Html'), content: preview(def), conditional: { hide: '=cheDoXemVanBan != true' }, layout: layout(uid('Row')) }
    ], type: 'default'
  };
}

fs.mkdirSync(outDir, { recursive: true });
for (const def of defs) {
  const file = `${def.code}.form.json`;
  fs.writeFileSync(path.join(outDir, file), `${JSON.stringify(schema(def), null, 2)}\n`, 'utf8');
  console.log(file);
}
