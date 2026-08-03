-- Thiết kế lại eForm 'bm-02-00-cv-dk-xd-nv' (Công văn đăng ký xét duyệt NV KHCN) theo
-- biểu mẫu nguồn BM.02.00.CV-DKI-Xet_duyet.NV (Camunda Web Modeler form, schemaVersion 19,
-- xem outputs/BM.02.00.CV-DKI-Xet_duyet.NV.form.json).
--
-- Bản trước ở DB (tạo qua UI, version 2) chỉ là 1 component 'text' duy nhất chứa nguyên
-- văn bản gốc dạng bảng markdown (pipe '|') với các chỗ điền tay để nguyên "..." — không
-- có trường nhập liệu thật nào; bản này thay bằng các trường thật theo đúng cấu trúc văn
-- bản: khối quốc hiệu tĩnh -> 1. Thông tin văn bản -> 2. Nội dung đề nghị -> 3. Đầu mối
-- phối hợp (5 nhóm) -> 4. Ký và lưu văn bản.
--
-- KHÁC BIỆT CÓ CHỦ Ý so với file .form gốc (giống lý do đã ghi ở V26 cho bm-02-01-dki-nv):
-- renderer runtime của ta là custom ng-zorro (shared/form-renderer, port của
-- webapp/src/components/FormRenderer.tsx) — KHÔNG phải renderer preact của
-- @bpmn-io/form-js — nên KHÔNG hỗ trợ 'group' (nhóm field lồng), 'html' (khối HTML tĩnh +
-- nội suy {{key}}), 'defaultValue', hay 'layout'/'row'/'columns':
--   1. Bỏ 'group' bao ngoài — field con đưa thẳng ra cấp gốc (không có khái niệm
--      namespace dữ liệu riêng ở renderer này nên không mất gì).
--   2. Bỏ 2 khối 'html' (banner hướng dẫn + khối xem "văn bản hoàn chỉnh" ghép {{key}}) và
--      checkbox 'cheDoXemVanBan' đi kèm — không có cách nào render HTML tĩnh/nội suy biến
--      trong renderer này; khối quốc hiệu tĩnh gộp vào 1 component 'text' markdown-lite
--      (giống khối 'hdr' của V26), phần còn lại giữ nguyên là trường nhập liệu.
--   3. Bỏ mọi 'defaultValue' (renderer không đọc thuộc tính này) — các trường có giá trị
--      thường xuyên lặp lại (ký hiệu công văn, địa danh, năm ký, loại nhiệm vụ, chức danh
--      ký...) vẫn giữ là trường nhập liệu thật, người dùng gõ tay mỗi lần thay vì được
--      điền sẵn.
--
-- GIỮ NGUYÊN cấu trúc formKey 'bm-02-00-cv-dk-xd-nv' (đã gắn vào T11/T16/T18A của
-- rd0202.bpmn qua zeebe:formDefinition — không đổi key).

UPDATE eform SET
  ten = 'BM.02.00.CV-DKI-Xét duyệt.NV',
  mo_ta = 'Công văn đăng ký xét duyệt nhiệm vụ KHCN gửi Tập đoàn thẩm định: thông tin văn bản, nội dung đề nghị và đầu mối phối hợp (RD02.02, các bước gắn formKey T11/T16/T18A).',
  schema_json = $json$
{"type":"default","id":"bm-02-00-cv-dk-xd-nv","components":[
 {"type":"text","id":"hdr","text":"**TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI**\n**TCT CÔNG NGHIỆP CÔNG NGHỆ CAO VIETTEL**\n\n**CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM**\n**Độc lập - Tự do - Hạnh phúc**"},
 {"type":"separator","id":"s0"},
 {"type":"text","id":"tit","text":"# BM.02.00.CV.DKI.XD.NV - Công văn đăng ký xét duyệt nhiệm vụ KHCN"},

 {"type":"text","id":"h1","text":"## 1. Thông tin văn bản"},
 {"type":"textfield","id":"scv","key":"soCongVan","label":"Số công văn","validate":{"required":true}},
 {"type":"textfield","id":"khc","key":"kyHieuCongVan","label":"Ký hiệu (vd: VHT-K1)","validate":{"required":true}},
 {"type":"textfield","id":"try","key":"trichYeu","label":"Trích yếu (vd: V/v xin ý kiến thẩm định Hồ sơ đăng ký xét duyệt NV KHCN...)","validate":{"required":true}},
 {"type":"textfield","id":"ddn","key":"diaDanh","label":"Địa danh (vd: Hà Nội)","validate":{"required":true}},
 {"type":"textfield","id":"ngv","key":"ngayVanBan","label":"Ngày ký","validate":{"required":true}},
 {"type":"textfield","id":"thv","key":"thangVanBan","label":"Tháng ký","validate":{"required":true}},
 {"type":"textfield","id":"nak","key":"namKy","label":"Năm ký","validate":{"required":true}},
 {"type":"textarea","id":"kgu","key":"kinhGui","label":"Kính gửi (mỗi cơ quan nhận 1 dòng)","validate":{"required":true}},

 {"type":"separator","id":"s1"},
 {"type":"text","id":"h2","text":"## 2. Nội dung đề nghị"},
 {"type":"textfield","id":"tnv","key":"tenNhiemVu","label":"Tên nhiệm vụ KHCN","validate":{"required":true}},
 {"type":"textfield","id":"lnv","key":"loaiNhiemVu","label":"Loại nhiệm vụ (vd: đề tài KHCN)","validate":{"required":true}},
 {"type":"textfield","id":"lvh","key":"linhVucHoiDong","label":"Hội đồng KHCN/lĩnh vực"},
 {"type":"textarea","id":"ccb","key":"canCuBoSung","label":"Căn cứ bổ sung (nếu có, mỗi căn cứ 1 dòng)"},
 {"type":"textfield","id":"tld","key":"taiLieuDinhKem","label":"Tài liệu đính kèm","validate":{"required":true}},

 {"type":"separator","id":"s2"},
 {"type":"text","id":"h3","text":"## 3. Đầu mối phối hợp"},

 {"type":"text","id":"h3a","text":"**Cá nhân đăng ký Chủ nhiệm đề tài**"},
 {"type":"textfield","id":"cnh","key":"chuNhiemHoTen","label":"Họ tên","validate":{"required":true}},
 {"type":"textfield","id":"cne","key":"chuNhiemEmail","label":"Email","validate":{"required":true,"validationType":"email"}},
 {"type":"textfield","id":"cnd","key":"chuNhiemDienThoai","label":"Số điện thoại","validate":{"required":true}},

 {"type":"text","id":"h3b","text":"**Đầu mối Phòng Tài chính VHT**"},
 {"type":"textfield","id":"tch","key":"taiChinhHoTen","label":"Họ tên","validate":{"required":true}},
 {"type":"textfield","id":"tce","key":"taiChinhEmail","label":"Email","validate":{"required":true,"validationType":"email"}},
 {"type":"textfield","id":"tcd","key":"taiChinhDienThoai","label":"Số điện thoại","validate":{"required":true}},

 {"type":"text","id":"h3c","text":"**Đầu mối Trung tâm Mua sắm VHT**"},
 {"type":"textfield","id":"msh","key":"muaSamHoTen","label":"Họ tên","validate":{"required":true}},
 {"type":"textfield","id":"mse","key":"muaSamEmail","label":"Email","validate":{"required":true,"validationType":"email"}},
 {"type":"textfield","id":"msd","key":"muaSamDienThoai","label":"Số điện thoại","validate":{"required":true}},

 {"type":"text","id":"h3d","text":"**Đầu mối Phòng CLKHCN VHT**"},
 {"type":"textfield","id":"ckh","key":"clkhcnHoTen","label":"Họ tên","validate":{"required":true}},
 {"type":"textfield","id":"cke","key":"clkhcnEmail","label":"Email","validate":{"required":true,"validationType":"email"}},
 {"type":"textfield","id":"ckd","key":"clkhcnDienThoai","label":"Số điện thoại","validate":{"required":true}},

 {"type":"text","id":"h3e","text":"**Đầu mối Phòng Nhân sự VHT**"},
 {"type":"textfield","id":"nsh","key":"nhanSuHoTen","label":"Họ tên","validate":{"required":true}},
 {"type":"textfield","id":"nse","key":"nhanSuEmail","label":"Email","validate":{"required":true,"validationType":"email"}},
 {"type":"textfield","id":"nsd","key":"nhanSuDienThoai","label":"Số điện thoại","validate":{"required":true}},

 {"type":"separator","id":"s3"},
 {"type":"text","id":"h4","text":"## 4. Ký và lưu văn bản"},
 {"type":"textfield","id":"cdk","key":"chucDanhKy","label":"Chức danh người ký (vd: TỔNG GIÁM ĐỐC)","validate":{"required":true}},
 {"type":"textfield","id":"ngk","key":"nguoiKy","label":"Họ tên người ký (nếu cần hiển thị)"},
 {"type":"textarea","id":"nnl","key":"noiNhanLuu","label":"Nơi nhận/lưu","validate":{"required":true}}
]}
$json$,
  version = version + 1,
  updated_by = 'system-seed',
  updated_at = TIMESTAMPTZ '2026-07-29T00:00:00+00'
WHERE form_key = 'bm-02-00-cv-dk-xd-nv';
