-- Thêm trường "Tài khoản được giao việc" vào từng dòng thành viên của eForm bm-02-08-qdh-nv
-- (Quyết định thành lập Hội đồng xét duyệt, gắn vào T05 cấp Cơ sở và T18B cấp Tập đoàn).
--
-- LÝ DO: bản cũ chỉ có `hoTen` gõ tay. Họ tên không phải định danh (trùng tên, viết khác dấu), nên
-- Hội đồng sinh ra ở `hoi_dong_thanh_vien` không liên kết được với tài khoản nào — hệ quả là các bước
-- họp Hội đồng (T07/T10 cấp Cơ sở, T21/T24 cấp Tập đoàn) chỉ giao việc được theo vai trò
-- `HDXD`/`HDXD_TD`, tức MỌI người giữ vai trò đó thấy task của MỌI hồ sơ. `userId` là mắt xích để
-- ho-so-service thu hẹp về đúng thành viên hội đồng của từng hồ sơ.
--
-- `valuesKey` là cơ chế chuẩn của form-js: options không nằm trong schema mà lấy từ input data của
-- form theo khoá này. `ho-so-detail` bơm `ungVienHoiDong` = danh sách user đang giữ vai trò
-- HDXD/HDXD_TD, đọc từ identity-service — nên danh mục ứng viên luôn khớp phân quyền hiện hành thay
-- vì bị đóng băng trong schema.
--
-- GIỮ NGUYÊN `hoTen`: văn bản QĐ vẫn in họ tên, và `HoiDongXetDuyetService.renderQuyetDinhHtml()` đọc
-- trường đó. Hai trường phục vụ hai việc khác nhau (in văn bản vs giao việc), không thay thế nhau.

UPDATE eform SET
  schema_json = $json$
{"type":"default","id":"bm-02-08-qdh-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.08.QDH.NV - Quyết định thành lập Hội đồng xét duyệt"},
 {"type":"select","id":"cap","key":"capHoiDong","label":"Cấp Hội đồng","validate":{"required":true},"values":[
   {"value":"vht","label":"VHT"},
   {"value":"tap_doan","label":"Tập đoàn"}
 ]},
 {"type":"dynamiclist","id":"ds","key":"danhSachThanhVien","label":"Danh sách thành viên Hội đồng","validate":{"required":true},"components":[
   {"type":"textfield","id":"ht","key":"hoTen","label":"Họ và tên","validate":{"required":true}},
   {"type":"select","id":"uid","key":"userId","label":"Tài khoản được giao việc","valuesKey":"ungVienHoiDong","validate":{"required":true}},
   {"type":"textfield","id":"vt","key":"vaiTroTrongHoiDong","label":"Vai trò trong Hội đồng","validate":{"required":true}}
 ]},
 {"type":"textarea","id":"cc","key":"canCuPhapLy","label":"Căn cứ ban hành"}
]}
$json$,
  version = version + 1,
  updated_by = 'system-seed',
  updated_at = TIMESTAMPTZ '2026-07-30T00:00:00+00'
WHERE form_key = 'bm-02-08-qdh-nv';
