-- Thiết kế lại eForm 'bm-02-01-dki-nv' (Đơn đăng ký thực hiện nhiệm vụ KHCN) theo đúng
-- biểu mẫu giấy nguồn BM_02_01_DK_NV_2024 (Camunda Web Modeler form, schemaVersion 19).
--
-- Bản seed cũ ở V12 chỉ là scaffold 6 trường theo gợi ý Bảng B của tài liệu RD02.02;
-- bản này bám cấu trúc văn bản thật: khối quốc hiệu -> căn cứ -> I. Thông tin chung
-- (1. đơn vị chủ trì, 2. chủ nhiệm, 3. tính cấp thiết, 4. mục tiêu, 5. thời gian)
-- -> II. Thành phần hồ sơ + cam đoan -> khối ký.
--
-- KHÁC BIỆT CÓ CHỦ Ý so với file .form gốc (do renderer runtime của ta là custom
-- ng-zorro - shared/form-renderer, KHÔNG phải renderer preact của @bpmn-io/form-js):
--   1. Bỏ 'layout'/'row'/'columns': renderer xếp dọc 1 cột, không đọc layout.
--   2. Component 'text' chỉ hiểu markdown-lite (# / ## / ### / **đậm** / xuống dòng) ->
--      2 bảng markdown trong file gốc (quốc hiệu, ô ký) được duỗi thành dòng thường,
--      nếu bê nguyên cú pháp bảng sẽ hiện ra dấu '|' thô.
--   3. Các chỗ điền tay dạng "..." trong văn bản gốc (năm kế hoạch, số/ngày quyết định
--      chủ trương, tên nhiệm vụ, lĩnh vực, số tháng thực hiện) được nâng thành trường
--      nhập liệu thật, thay vì để chữ chết trong khối text.
--
-- GIỮ NGUYÊN KEY (không được đổi - đang có nơi tiêu thụ):
--   loaiNhiemVu, tongDuToan  -> input của rd0202-routing.dmn tại T01.
--   thoiGianThucHien         -> NhiemVu.thoiGianThucHien là String -> giữ textfield.
--   nhanSuDangKyChuTri       -> tái dùng làm "Họ và tên chủ nhiệm nhiệm vụ".
--   mucTieuChinh, sanPhamChinh.
--
-- loaiNhiemVu / tongDuToan / sanPhamChinh KHÔNG có trong biểu mẫu giấy gốc, giữ lại vì
-- luồng RD02.02 cần; đặt ở cuối mục I và có ghi chú "(bổ sung ngoài mẫu giấy)".

UPDATE eform SET
  mo_ta = 'Đơn đăng ký thực hiện nhiệm vụ KHCN theo biểu mẫu BM.02.01.DKI.NV (bản 2024): thông tin đơn vị chủ trì, chủ nhiệm nhiệm vụ, tính cấp thiết, mục tiêu, thời gian thực hiện và thành phần hồ sơ đăng ký (RD02.02 B02/B03).',
  schema_json = $json$
{"type":"default","id":"bm-02-01-dki-nv","components":[
 {"type":"text","id":"hdr","text":"**TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI**\nTÊN ĐƠN VỊ CHỦ TRÌ NHIỆM VỤ\n\n**CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM**\n**Độc lập - Tự do - Hạnh phúc**"},
 {"type":"datetime","id":"ngd","key":"ngayLapDon","subtype":"date","label":"Ngày lập đơn","validate":{"required":true}},
 {"type":"separator","id":"s0"},
 {"type":"text","id":"tit","text":"# ĐƠN ĐĂNG KÝ THỰC HIỆN NHIỆM VỤ KHCN"},

 {"type":"text","id":"cch","text":"## Căn cứ đăng ký"},
 {"type":"number","id":"nkh","key":"namKeHoach","label":"Căn cứ Kế hoạch năm","validate":{"required":true,"min":2020,"max":2100}},
 {"type":"datetime","id":"nkhd","key":"ngayPheDuyetKeHoach","subtype":"date","label":"Ngày Người có thẩm quyền phê duyệt Kế hoạch năm"},
 {"type":"textfield","id":"sqd","key":"soQuyetDinhChuTruong","label":"Số Quyết định phê duyệt chủ trương (.../QĐ-CNVTQĐ-QLĐT)","validate":{"required":true}},
 {"type":"datetime","id":"nqd","key":"ngayQuyetDinhChuTruong","subtype":"date","label":"Ngày ban hành Quyết định phê duyệt chủ trương","validate":{"required":true}},
 {"type":"text","id":"cck","text":"Căn cứ chức năng, nhiệm vụ của đơn vị chủ trì, đơn vị chủ trì và đồng chí đăng ký chủ nhiệm nhiệm vụ đăng ký thực hiện nhiệm vụ sau đây:"},
 {"type":"textfield","id":"tnv","key":"tenNhiemVu","label":"Tên nhiệm vụ đăng ký thực hiện","validate":{"required":true}},
 {"type":"textfield","id":"lvu","key":"linhVuc","label":"Thuộc lĩnh vực","validate":{"required":true}},

 {"type":"text","id":"h1","text":"## I. Thông tin chung về nhiệm vụ\n\n**1. Đơn vị chủ trì nhiệm vụ**"},
 {"type":"textfield","id":"dvt","key":"donViChuTri","label":"Tên đơn vị","validate":{"required":true}},
 {"type":"textfield","id":"dvd","key":"diaChiDonViChuTri","label":"Địa chỉ"},

 {"type":"text","id":"h12","text":"**2. Chủ nhiệm nhiệm vụ**"},
 {"type":"textfield","id":"cnt","key":"nhanSuDangKyChuTri","label":"Họ và tên","validate":{"required":true}},
 {"type":"textfield","id":"cnb","key":"capBacChuNhiem","label":"Cấp bậc"},
 {"type":"textfield","id":"cnc","key":"chucVuChuNhiem","label":"Chức vụ"},
 {"type":"datetime","id":"cns","key":"ngaySinhChuNhiem","subtype":"date","label":"Ngày tháng năm sinh"},
 {"type":"select","id":"cng","key":"gioiTinhChuNhiem","label":"Giới tính","values":[
   {"value":"nam","label":"Nam"},
   {"value":"nu","label":"Nữ"}
 ]},
 {"type":"textfield","id":"cnh","key":"hocHamHocViChuNhiem","label":"Học hàm, học vị"},
 {"type":"textfield","id":"cnp","key":"dienThoaiChuNhiem","label":"Điện thoại"},
 {"type":"textfield","id":"cne","key":"emailChuNhiem","label":"Email","validate":{"validationType":"email"}},

 {"type":"textarea","id":"tct","key":"tinhCapThiet","label":"3. Tính cấp thiết của nhiệm vụ","validate":{"required":true}},
 {"type":"textarea","id":"mt","key":"mucTieuChinh","label":"4. Mục tiêu của nhiệm vụ","validate":{"required":true}},
 {"type":"textfield","id":"tg","key":"thoiGianThucHien","label":"5. Thời gian thực hiện (số tháng)","validate":{"required":true}},

 {"type":"separator","id":"s1"},
 {"type":"text","id":"hbs","text":"### Thông tin phục vụ định tuyến xét duyệt (bổ sung ngoài mẫu giấy)"},
 {"type":"select","id":"lnv","key":"loaiNhiemVu","label":"Loại nhiệm vụ","validate":{"required":true},"values":[
   {"value":"de_tai","label":"Đề tài"},
   {"value":"san_xuat_thu_nghiem","label":"Sản xuất thử nghiệm"},
   {"value":"du_an","label":"Dự án"}
 ]},
 {"type":"number","id":"dt","key":"tongDuToan","label":"Tổng dự toán (triệu đồng)","validate":{"required":true,"min":0}},
 {"type":"textarea","id":"sp","key":"sanPhamChinh","label":"Sản phẩm chính dự kiến"},

 {"type":"text","id":"h2","text":"## II. Hồ sơ đăng ký chủ trì thực hiện nhiệm vụ gồm"},
 {"type":"checklist","id":"tphs","key":"thanhPhanHoSo","label":"Tích các thành phần đã có trong hồ sơ đăng ký","validate":{"required":true},"values":[
   {"value":"don_dang_ky","label":"1. Đơn đăng ký kèm Quyết định phê duyệt chủ trương thực hiện nhiệm vụ KHCN"},
   {"value":"thuyet_minh","label":"2. Thuyết minh nhiệm vụ"},
   {"value":"du_toan","label":"3. Dự toán nhiệm vụ; các hồ sơ cơ sở giá, báo giá"},
   {"value":"tai_lieu_khac","label":"4. Tài liệu liên quan khác (nếu có)"}
 ]},
 {"type":"textarea","id":"gctl","key":"ghiChuTaiLieuKhac","label":"Liệt kê tài liệu liên quan khác","conditional":{"hide":"=not(list contains(if thanhPhanHoSo = null then [] else thanhPhanHoSo, \"tai_lieu_khac\"))"}},
 {"type":"checkbox","id":"cd","key":"camDoan","label":"Chúng tôi xin cam đoan những nội dung và thông tin kê khai trong hồ sơ này là đúng sự thật."},

 {"type":"separator","id":"s2"},
 {"type":"text","id":"ky","text":"### Ký xác nhận\n\n**CHỦ NHIỆM NHIỆM VỤ** - chữ ký, họ tên\n\n**THỦ TRƯỞNG ĐƠN VỊ CHỦ TRÌ NHIỆM VỤ** - chữ ký, họ tên và đóng dấu"}
]}
$json$,
  version = version + 1,
  updated_by = 'system-seed',
  updated_at = TIMESTAMPTZ '2026-07-21T00:00:00+00'
WHERE form_key = 'bm-02-01-dki-nv';
