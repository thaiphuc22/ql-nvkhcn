-- Khởi tạo (scaffold) các eForm dùng cho RD02.02 - Xét duyệt NV KHCN cấp Tập đoàn,
-- theo cột "Mã biểu mẫu" ở Bảng A - Luồng chính của tài liệu nguồn RD02.02.
-- Đây là các biểu mẫu khởi tạo sẵn (header + vài trường theo gợi ý Bảng B của tài liệu
-- nguồn), chưa phải bản hoàn thiện - các form đánh dấu [CHƯA CHỐT]/[MỚI] trong mô tả giữ
-- nguyên đúng cảnh báo của tài liệu nguồn, cần rà soát nghiệp vụ trước khi dùng thật.
-- Binding vào Action Studio theo formKey (D10) là việc của lát sau, không nằm trong seed này.

INSERT INTO eform (form_key, ten, mo_ta, loai, schema_json, version, created_at, updated_by, updated_at) VALUES

('bm-02-01-dki-nv', 'Đăng ký nhiệm vụ KHCN',
 'Khởi tạo hồ sơ xét duyệt: loại nhiệm vụ, tổng dự toán, thời gian, nhân sự đăng ký chủ trì, mục tiêu và sản phẩm chính (RD02.02 B02/B03).',
 'Soạn thảo',
$json$
{"type":"default","id":"bm-02-01-dki-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.01.DKI.NV - Đăng ký nhiệm vụ KHCN\n\nCăn cứ Quyết định phê duyệt chủ trương, đăng ký thông tin khởi tạo nhiệm vụ."},
 {"type":"select","id":"lnv","key":"loaiNhiemVu","label":"Loại nhiệm vụ","validate":{"required":true},"values":[
   {"value":"de_tai","label":"Đề tài"},
   {"value":"san_xuat_thu_nghiem","label":"Sản xuất thử nghiệm"},
   {"value":"du_an","label":"Dự án"}
 ]},
 {"type":"number","id":"dt","key":"tongDuToan","label":"Tổng dự toán (triệu đồng)","validate":{"required":true,"min":0}},
 {"type":"textfield","id":"tg","key":"thoiGianThucHien","label":"Thời gian thực hiện dự kiến"},
 {"type":"textfield","id":"ns","key":"nhanSuDangKyChuTri","label":"Nhân sự đăng ký chủ trì","validate":{"required":true}},
 {"type":"textarea","id":"mt","key":"mucTieuChinh","label":"Mục tiêu chính","validate":{"required":true}},
 {"type":"textarea","id":"sp","key":"sanPhamChinh","label":"Sản phẩm chính dự kiến"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:31+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:31+00'),

('bm-02-02-dto-nv', 'Đề cương tổng quan nhiệm vụ',
 'Đề cương tổng quan của Bộ hồ sơ xây dựng, soạn cùng lúc với Thuyết minh chi tiết theo loại nhiệm vụ (RD02.02 B03).',
 'Soạn thảo',
$json$
{"type":"default","id":"bm-02-02-dto-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.02.DTO.NV - Đề cương tổng quan nhiệm vụ"},
 {"type":"textarea","id":"bc","key":"boiCanhCanThiet","label":"Bối cảnh, sự cần thiết","validate":{"required":true}},
 {"type":"textarea","id":"nd","key":"noiDungChinh","label":"Nội dung chính","validate":{"required":true}},
 {"type":"textarea","id":"kq","key":"ketQuaDuKien","label":"Kết quả dự kiến"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:30+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:30+00'),

('bm-02-03-tmi-dt', 'Thuyết minh Đề tài',
 'Thuyết minh chi tiết cho nhiệm vụ loại Đề tài - dùng đúng 1 trong 3 mẫu BM.02.03/04/05 tuỳ loại nhiệm vụ đã đăng ký (RD02.02 B03).',
 'Soạn thảo',
$json$
{"type":"default","id":"bm-02-03-tmi-dt","components":[
 {"type":"text","id":"h","text":"## BM.02.03.TMI.DT - Thuyết minh Đề tài"},
 {"type":"textarea","id":"kt","key":"noiDungKyThuat","label":"Nội dung, phương án kỹ thuật","validate":{"required":true}},
 {"type":"textarea","id":"kh","key":"keHoachThucHien","label":"Kế hoạch thực hiện theo giai đoạn","validate":{"required":true}},
 {"type":"textarea","id":"dt","key":"duToanChiTiet","label":"Dự toán chi tiết theo hạng mục"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:29+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:29+00'),

('bm-02-04-tmi-sx', 'Thuyết minh Sản xuất thử nghiệm',
 'Thuyết minh chi tiết cho nhiệm vụ loại Sản xuất thử nghiệm - dùng đúng 1 trong 3 mẫu BM.02.03/04/05 tuỳ loại nhiệm vụ đã đăng ký (RD02.02 B03).',
 'Soạn thảo',
$json$
{"type":"default","id":"bm-02-04-tmi-sx","components":[
 {"type":"text","id":"h","text":"## BM.02.04.TMI.SX - Thuyết minh Sản xuất thử nghiệm"},
 {"type":"textarea","id":"kt","key":"noiDungKyThuat","label":"Nội dung, quy trình sản xuất thử nghiệm","validate":{"required":true}},
 {"type":"textarea","id":"kh","key":"keHoachThucHien","label":"Kế hoạch thực hiện theo giai đoạn","validate":{"required":true}},
 {"type":"textarea","id":"dt","key":"duToanChiTiet","label":"Dự toán chi tiết theo hạng mục"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:28+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:28+00'),

('bm-02-05-tmi-da', 'Thuyết minh Dự án',
 'Thuyết minh chi tiết cho nhiệm vụ loại Dự án - dùng đúng 1 trong 3 mẫu BM.02.03/04/05 tuỳ loại nhiệm vụ đã đăng ký (RD02.02 B03).',
 'Soạn thảo',
$json$
{"type":"default","id":"bm-02-05-tmi-da","components":[
 {"type":"text","id":"h","text":"## BM.02.05.TMI.DA - Thuyết minh Dự án"},
 {"type":"textarea","id":"kt","key":"noiDungKyThuat","label":"Nội dung, phạm vi dự án","validate":{"required":true}},
 {"type":"textarea","id":"kh","key":"keHoachThucHien","label":"Kế hoạch thực hiện theo giai đoạn","validate":{"required":true}},
 {"type":"textarea","id":"dt","key":"duToanChiTiet","label":"Dự toán chi tiết theo hạng mục"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:27+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:27+00'),

('bm-02-06-llk-nv', 'Lý lịch khoa học nhân sự tham gia',
 'Lý lịch khoa học của nhân sự đăng ký tham gia nhiệm vụ, đi kèm Bộ hồ sơ xây dựng (RD02.02 B03/B12).',
 'Soạn thảo',
$json$
{"type":"default","id":"bm-02-06-llk-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.06.LLK.NV - Lý lịch khoa học nhân sự tham gia"},
 {"type":"textfield","id":"ht","key":"hoTen","label":"Họ và tên","validate":{"required":true}},
 {"type":"textfield","id":"hh","key":"hocHamHocVi","label":"Học hàm, học vị"},
 {"type":"textfield","id":"cm","key":"chuyenMon","label":"Chuyên môn"},
 {"type":"textarea","id":"kn","key":"kinhNghiemLienQuan","label":"Kinh nghiệm liên quan đến nhiệm vụ"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:26+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:26+00'),

('bm-02-07-gxn-nv', 'Giấy xác nhận tham gia nhiệm vụ',
 'Xác nhận cam kết tham gia/chủ trì nhiệm vụ của nhân sự đăng ký, đi kèm Bộ hồ sơ xây dựng (RD02.02 B03/B12).',
 'Soạn thảo',
$json$
{"type":"default","id":"bm-02-07-gxn-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.07.GXN.NV - Giấy xác nhận tham gia nhiệm vụ"},
 {"type":"textfield","id":"ht","key":"hoTen","label":"Họ và tên","validate":{"required":true}},
 {"type":"textfield","id":"vt","key":"vaiTro","label":"Vai trò trong nhiệm vụ","validate":{"required":true}},
 {"type":"textarea","id":"ck","key":"noiDungCamKet","label":"Nội dung cam kết","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:25+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:25+00'),

('bm-02-08-qdh-nv', 'Quyết định thành lập Hội đồng xét duyệt',
 'Dùng chung cho Quyết định thành lập HĐXD cấp VHT (B14/B15) và cấp Tập đoàn (B42/B50) - RD02.02.',
 'Phê duyệt',
$json$
{"type":"default","id":"bm-02-08-qdh-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.08.QDH.NV - Quyết định thành lập Hội đồng xét duyệt"},
 {"type":"select","id":"cap","key":"capHoiDong","label":"Cấp Hội đồng","validate":{"required":true},"values":[
   {"value":"vht","label":"VHT"},
   {"value":"tap_doan","label":"Tập đoàn"}
 ]},
 {"type":"dynamiclist","id":"ds","key":"danhSachThanhVien","label":"Danh sách thành viên Hội đồng","validate":{"required":true},"components":[
   {"type":"textfield","id":"ht","key":"hoTen","label":"Họ và tên","validate":{"required":true}},
   {"type":"textfield","id":"vt","key":"vaiTroTrongHoiDong","label":"Vai trò trong Hội đồng","validate":{"required":true}}
 ]},
 {"type":"textarea","id":"cc","key":"canCuPhapLy","label":"Căn cứ ban hành"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:24+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:24+00'),

('bm-02-09-pnx-dt', 'Phiếu nhận xét Đề tài (Hội đồng xét duyệt)',
 'Phiếu nhận xét của thành viên HĐXD phiên 1 cho nhiệm vụ loại Đề tài (RD02.02 B16/B51).',
 'Nhận xét',
$json$
{"type":"default","id":"bm-02-09-pnx-dt","components":[
 {"type":"text","id":"h","text":"## BM.02.09.PNX.DT - Phiếu nhận xét Đề tài"},
 {"type":"checklist","id":"tc","key":"tieuChiNhanXet","label":"Tiêu chí nhận xét","values":[
   {"value":"cap_thiet","label":"Tính cấp thiết"},
   {"value":"kha_thi","label":"Tính khả thi khoa học - công nghệ"},
   {"value":"du_toan","label":"Dự toán hợp lý"},
   {"value":"nhan_su","label":"Năng lực nhân sự thực hiện"}
 ]},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến nhận xét","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:23+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:23+00'),

('bm-02-10-pnx-sx', 'Phiếu nhận xét Sản xuất thử nghiệm (Hội đồng xét duyệt)',
 'Phiếu nhận xét của thành viên HĐXD phiên 1 cho nhiệm vụ loại Sản xuất thử nghiệm (RD02.02 B16/B51).',
 'Nhận xét',
$json$
{"type":"default","id":"bm-02-10-pnx-sx","components":[
 {"type":"text","id":"h","text":"## BM.02.10.PNX.SX - Phiếu nhận xét Sản xuất thử nghiệm"},
 {"type":"checklist","id":"tc","key":"tieuChiNhanXet","label":"Tiêu chí nhận xét","values":[
   {"value":"cap_thiet","label":"Tính cấp thiết"},
   {"value":"kha_thi","label":"Tính khả thi kỹ thuật"},
   {"value":"du_toan","label":"Dự toán hợp lý"},
   {"value":"nhan_su","label":"Năng lực nhân sự thực hiện"}
 ]},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến nhận xét","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:22+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:22+00'),

('bm-02-11-pnx-da', 'Phiếu nhận xét Dự án (Hội đồng xét duyệt)',
 'Phiếu nhận xét của thành viên HĐXD phiên 1 cho nhiệm vụ loại Dự án (RD02.02 B16/B51).',
 'Nhận xét',
$json$
{"type":"default","id":"bm-02-11-pnx-da","components":[
 {"type":"text","id":"h","text":"## BM.02.11.PNX.DA - Phiếu nhận xét Dự án"},
 {"type":"checklist","id":"tc","key":"tieuChiNhanXet","label":"Tiêu chí nhận xét","values":[
   {"value":"cap_thiet","label":"Tính cấp thiết"},
   {"value":"kha_thi","label":"Tính khả thi triển khai"},
   {"value":"du_toan","label":"Dự toán hợp lý"},
   {"value":"nhan_su","label":"Năng lực nhân sự thực hiện"}
 ]},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến nhận xét","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:21+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:21+00'),

('bm-02-12-pdg-dt', 'Phiếu đánh giá, chấm điểm Đề tài',
 'Phiếu chấm điểm của thành viên HĐXD phiên 2 cho nhiệm vụ loại Đề tài, dùng tính điểm trung bình Hội đồng (RD02.02 B24/B59).',
 'Thẩm định',
$json$
{"type":"default","id":"bm-02-12-pdg-dt","components":[
 {"type":"text","id":"h","text":"## BM.02.12.PDG.DT - Phiếu đánh giá, chấm điểm Đề tài"},
 {"type":"number","id":"ds","key":"diemSo","label":"Điểm chấm (thang 100)","validate":{"required":true,"min":0,"max":100}},
 {"type":"textarea","id":"nx","key":"nhanXetChiTiet","label":"Nhận xét chi tiết"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:20+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:20+00'),

('bm-02-13-pdg-sx', 'Phiếu đánh giá, chấm điểm Sản xuất thử nghiệm',
 'Phiếu chấm điểm của thành viên HĐXD phiên 2 cho nhiệm vụ loại Sản xuất thử nghiệm, dùng tính điểm trung bình Hội đồng (RD02.02 B24/B59).',
 'Thẩm định',
$json$
{"type":"default","id":"bm-02-13-pdg-sx","components":[
 {"type":"text","id":"h","text":"## BM.02.13.PDG.SX - Phiếu đánh giá, chấm điểm Sản xuất thử nghiệm"},
 {"type":"number","id":"ds","key":"diemSo","label":"Điểm chấm (thang 100)","validate":{"required":true,"min":0,"max":100}},
 {"type":"textarea","id":"nx","key":"nhanXetChiTiet","label":"Nhận xét chi tiết"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:19+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:19+00'),

('bm-02-14-pdg-da', 'Phiếu đánh giá, chấm điểm Dự án',
 'Phiếu chấm điểm của thành viên HĐXD phiên 2 cho nhiệm vụ loại Dự án, dùng tính điểm trung bình Hội đồng (RD02.02 B24/B59).',
 'Thẩm định',
$json$
{"type":"default","id":"bm-02-14-pdg-da","components":[
 {"type":"text","id":"h","text":"## BM.02.14.PDG.DA - Phiếu đánh giá, chấm điểm Dự án"},
 {"type":"number","id":"ds","key":"diemSo","label":"Điểm chấm (thang 100)","validate":{"required":true,"min":0,"max":100}},
 {"type":"textarea","id":"nx","key":"nhanXetChiTiet","label":"Nhận xét chi tiết"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:18+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:18+00'),

('bm-02-15-bbh-nv', 'Biên bản họp Hội đồng xét duyệt',
 'Biên bản tổng hợp kết luận phiên họp HĐXD, dùng chung phiên 1 và phiên 2, cấp VHT và Tập đoàn (RD02.02 B16/B24/B51/B59).',
 'Thẩm định',
$json$
{"type":"default","id":"bm-02-15-bbh-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.15.BBH.NV - Biên bản họp Hội đồng xét duyệt"},
 {"type":"textarea","id":"tp","key":"thanhPhanThamDu","label":"Thành phần tham dự","validate":{"required":true}},
 {"type":"textarea","id":"kl","key":"noiDungKetLuan","label":"Nội dung kết luận phiên họp","validate":{"required":true}},
 {"type":"textarea","id":"bs","key":"dieuKienBoSung","label":"Điều kiện, nội dung cần bổ sung (nếu có)"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:17+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:17+00'),

('bm-02-16-bca-nv', 'Báo cáo giải trình, tiếp thu ý kiến Hội đồng',
 'Ghi nhận nội dung giải trình, tiếp thu ý kiến Hội đồng khi hoàn chỉnh Bộ hồ sơ xây dựng dự thảo 4/5 (RD02.02 B52/B61).',
 'Soạn thảo',
$json$
{"type":"default","id":"bm-02-16-bca-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.16.BCA.NV - Báo cáo giải trình, tiếp thu ý kiến Hội đồng"},
 {"type":"textarea","id":"yk","key":"yKienHoiDong","label":"Ý kiến Hội đồng cần giải trình","validate":{"required":true}},
 {"type":"textarea","id":"gt","key":"noiDungGiaiTrinh","label":"Nội dung giải trình, tiếp thu","validate":{"required":true}},
 {"type":"textarea","id":"tc","key":"thamChieu","label":"Tham chiếu mục hồ sơ đã chỉnh sửa"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:16+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:16+00'),

('bm-02-17-ttr-nv', '[CHƯA CHỐT] Tờ trình / Công văn đề nghị xét duyệt cấp Tập đoàn',
 '[CHƯA CHỐT theo tài liệu nguồn RD02.02: bước B26 gọi văn bản này là CV đề nghị xét duyệt, trong khi mã BM.02.17 định nghĩa là Tờ trình - cần xác nhận mapping trước khi hoàn thiện] Trình bày đề nghị Tập đoàn xét duyệt nhiệm vụ (RD02.02 B26/B34/B35).',
 'Soạn thảo',
$json$
{"type":"default","id":"bm-02-17-ttr-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.17.TTR.NV - [CHƯA CHỐT] Tờ trình / Công văn đề nghị xét duyệt cấp Tập đoàn"},
 {"type":"textarea","id":"cc","key":"canCu","label":"Căn cứ (biên bản, phiếu nhận xét, phiếu đánh giá hai phiên họp)","validate":{"required":true}},
 {"type":"textarea","id":"nd","key":"noiDungDeNghi","label":"Nội dung đề nghị","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:15+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:15+00'),

('bm-02-18-bct-nv', 'Báo cáo thẩm định thông qua',
 'Báo cáo thẩm định trình Hội đồng KHCN lĩnh vực Tập đoàn thông qua trước khi ban hành quyết định phê duyệt (RD02.02 B70/B71).',
 'Thẩm định',
$json$
{"type":"default","id":"bm-02-18-bct-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.18.BCT.NV - Báo cáo thẩm định thông qua"},
 {"type":"textarea","id":"tt","key":"tomTatKetQuaThamDinh","label":"Tóm tắt kết quả thẩm định","validate":{"required":true}},
 {"type":"textarea","id":"kn","key":"kienNghi","label":"Kiến nghị"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:14+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:14+00'),

('bm-02-19-qdi-nv', 'Quyết định phê duyệt (mở mới) nhiệm vụ',
 'Quyết định phê duyệt mở mới nhiệm vụ KHCN cấp Tập đoàn, ban hành cùng Quyết định giao nhiệm vụ (RD02.02 B72/B73).',
 'Phê duyệt',
$json$
{"type":"default","id":"bm-02-19-qdi-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.19.QDI.NV - Quyết định phê duyệt (mở mới) nhiệm vụ"},
 {"type":"textfield","id":"sqd","key":"soQuyetDinh","label":"Số quyết định"},
 {"type":"textarea","id":"nd","key":"noiDungPheDuyet","label":"Nội dung phê duyệt","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:13+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:13+00'),

('bm-02-20-gnv-nv', 'Quyết định giao nhiệm vụ',
 'Quyết định giao nhiệm vụ KHCN, ban hành cùng Quyết định phê duyệt mở mới (RD02.02 B72/B73).',
 'Phê duyệt',
$json$
{"type":"default","id":"bm-02-20-gnv-nv","components":[
 {"type":"text","id":"h","text":"## BM.02.20.GNV.NV - Quyết định giao nhiệm vụ"},
 {"type":"textfield","id":"dv","key":"donViDuocGiao","label":"Đơn vị/nhân sự được giao","validate":{"required":true}},
 {"type":"textarea","id":"nd","key":"noiDungGiaoNhiemVu","label":"Nội dung giao nhiệm vụ","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:12+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:12+00'),

('pnx-khcn-noibo', '[MỚI] Phiếu nhận xét thẩm định KHCN (nội bộ VHT)',
 '[MỚI - chưa có mã trong bộ BM.02; tài liệu nguồn RD02.02 chưa mô tả rõ nội dung thẩm định chi tiết] Cơ quan KHCN VHT thẩm định/rà soát mục tiêu, công nghệ lõi, sản phẩm, kế hoạch thực hiện, PL2 và PL6 (RD02.02 B07/B19/B54).',
 'Nhận xét',
$json$
{"type":"default","id":"pnx-khcn-noibo","components":[
 {"type":"text","id":"h","text":"## [MỚI] Phiếu nhận xét thẩm định KHCN (nội bộ VHT)"},
 {"type":"textarea","id":"nd","key":"noiDungThamDinh","label":"Nội dung thẩm định (mục tiêu, công nghệ lõi, sản phẩm, kế hoạch thực hiện, PL2, PL6)","validate":{"required":true}},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:11+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:11+00'),

('pnx-tckt-noibo', '[MỚI] Phiếu nhận xét thẩm định Tài chính - Kế toán (nội bộ VHT)',
 '[MỚI - chưa có mã trong bộ BM.02; tài liệu nguồn RD02.02 để trống nội dung thẩm định chi tiết, chưa được tự bổ sung] Cơ quan TCKT VHT thẩm định/rà soát Bộ hồ sơ xây dựng (RD02.02 B08/B20/B55).',
 'Nhận xét',
$json$
{"type":"default","id":"pnx-tckt-noibo","components":[
 {"type":"text","id":"h","text":"## [MỚI] Phiếu nhận xét thẩm định Tài chính - Kế toán (nội bộ VHT)"},
 {"type":"textarea","id":"nd","key":"noiDungThamDinh","label":"Nội dung thẩm định","validate":{"required":true}},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:10+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:10+00'),

('pnx-ms-noibo', '[MỚI] Phiếu nhận xét thẩm định Mua sắm (nội bộ VHT)',
 '[MỚI - chưa có mã trong bộ BM.02; tài liệu nguồn RD02.02 để trống nội dung thẩm định chi tiết, chưa được tự bổ sung] Cơ quan Mua sắm VHT thẩm định/rà soát Bộ hồ sơ xây dựng (RD02.02 B09/B21/B56).',
 'Nhận xét',
$json$
{"type":"default","id":"pnx-ms-noibo","components":[
 {"type":"text","id":"h","text":"## [MỚI] Phiếu nhận xét thẩm định Mua sắm (nội bộ VHT)"},
 {"type":"textarea","id":"nd","key":"noiDungThamDinh","label":"Nội dung thẩm định","validate":{"required":true}},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:09+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:09+00'),

('pnx-ns-noibo', '[MỚI] Phiếu nhận xét thẩm định Nhân sự (nội bộ VHT)',
 '[MỚI - chưa có mã trong bộ BM.02; tài liệu nguồn RD02.02 để trống nội dung thẩm định chi tiết, chưa được tự bổ sung] Cơ quan Nhân sự VHT thẩm định/rà soát Bộ hồ sơ xây dựng (RD02.02 B10/B22/B57).',
 'Nhận xét',
$json$
{"type":"default","id":"pnx-ns-noibo","components":[
 {"type":"text","id":"h","text":"## [MỚI] Phiếu nhận xét thẩm định Nhân sự (nội bộ VHT)"},
 {"type":"textarea","id":"nd","key":"noiDungThamDinh","label":"Nội dung thẩm định","validate":{"required":true}},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:08+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:08+00'),

('bien-ban-ban-giao-hs', '[MỚI] Biên bản bàn giao hồ sơ đến Cơ quan KHCN Tập đoàn',
 '[MỚI - chưa có mã biểu mẫu trong bộ BM.02] Biên bản bàn giao toàn bộ hồ sơ đã ký từ VHT sang Cơ quan KHCN Tập đoàn (RD02.02 B36).',
 'Soạn thảo',
$json$
{"type":"default","id":"bien-ban-ban-giao-hs","components":[
 {"type":"text","id":"h","text":"## [MỚI] Biên bản bàn giao hồ sơ đến Cơ quan KHCN Tập đoàn"},
 {"type":"textarea","id":"dm","key":"danhMucHoSoBanGiao","label":"Danh mục hồ sơ bàn giao","validate":{"required":true}},
 {"type":"textfield","id":"bg","key":"nguoiBanGiao","label":"Người bàn giao","validate":{"required":true}},
 {"type":"textfield","id":"nn","key":"nguoiNhan","label":"Người nhận","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:07+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:07+00'),

('phieu-kiem-tra-ho-so-td', '[MỚI] Phiếu kiểm tra tính đầy đủ hồ sơ (Tập đoàn)',
 '[MỚI - chưa có mã biểu mẫu trong bộ BM.02] Cơ quan KHCN Tập đoàn kiểm tra tính đầy đủ hồ sơ tiếp nhận từ VHT; kết quả Đầy đủ/Yêu cầu bổ sung do nút hành động quyết định, form chỉ ghi nội dung hỗ trợ (RD02.02 B37).',
 'Nhận xét',
$json$
{"type":"default","id":"phieu-kiem-tra-ho-so-td","components":[
 {"type":"text","id":"h","text":"## [MỚI] Phiếu kiểm tra tính đầy đủ hồ sơ (Tập đoàn)"},
 {"type":"checklist","id":"dm","key":"danhMucKiemTra","label":"Danh mục kiểm tra","values":[
   {"value":"day_du_thanh_phan","label":"Đầy đủ thành phần hồ sơ"},
   {"value":"dung_the_thuc","label":"Đúng thể thức văn bản"},
   {"value":"khong_loi_font","label":"Không lỗi font"}
 ]},
 {"type":"textarea","id":"bs","key":"noiDungYeuCauBoSung","label":"Nội dung yêu cầu bổ sung (nếu có)"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:06+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:06+00'),

('cv-de-nghi-tham-dinh-hs', '[MỚI] Công văn đề nghị các cơ quan Tập đoàn thẩm định hồ sơ',
 '[MỚI - chưa có mã biểu mẫu riêng trong bộ BM.02] Công văn gửi các cơ quan nghiệp vụ Tập đoàn đề nghị thẩm định hồ sơ (RD02.02 B41).',
 'Soạn thảo',
$json$
{"type":"default","id":"cv-de-nghi-tham-dinh-hs","components":[
 {"type":"text","id":"h","text":"## [MỚI] Công văn đề nghị các cơ quan Tập đoàn thẩm định hồ sơ"},
 {"type":"textarea","id":"cq","key":"cacCoQuanNhanCV","label":"Các cơ quan nhận công văn","validate":{"required":true}},
 {"type":"textarea","id":"nd","key":"noiDungDeNghi","label":"Nội dung đề nghị","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:05+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:05+00'),

('pnx-ban-cncnc-td', '[MỚI] Phiếu nhận xét của Ban CNCNC (Tập đoàn)',
 '[MỚI - chưa có mã biểu mẫu riêng trong bộ BM.02] Phiếu nhận xét của Ban CNCNC Tập đoàn, dùng làm căn cứ tại Hội đồng xét duyệt Tập đoàn (RD02.02 B45).',
 'Nhận xét',
$json$
{"type":"default","id":"pnx-ban-cncnc-td","components":[
 {"type":"text","id":"h","text":"## [MỚI] Phiếu nhận xét của Ban CNCNC (Tập đoàn)"},
 {"type":"textarea","id":"nd","key":"noiDungNhanXet","label":"Nội dung nhận xét","validate":{"required":true}},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:04+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:04+00'),

('pnx-ban-dtxd-td', '[MỚI] Phiếu nhận xét của Ban ĐTXD (Tập đoàn)',
 '[MỚI - chưa có mã biểu mẫu riêng trong bộ BM.02] Phiếu nhận xét của Ban ĐTXD Tập đoàn, dùng làm căn cứ tại Hội đồng xét duyệt Tập đoàn (RD02.02 B46).',
 'Nhận xét',
$json$
{"type":"default","id":"pnx-ban-dtxd-td","components":[
 {"type":"text","id":"h","text":"## [MỚI] Phiếu nhận xét của Ban ĐTXD (Tập đoàn)"},
 {"type":"textarea","id":"nd","key":"noiDungNhanXet","label":"Nội dung nhận xét","validate":{"required":true}},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:03+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:03+00'),

('pnx-ban-tckt-td', '[MỚI] Phiếu nhận xét của Ban TCKT (Tập đoàn)',
 '[MỚI - chưa có mã biểu mẫu riêng trong bộ BM.02] Phiếu nhận xét của Ban TCKT Tập đoàn, dùng làm căn cứ tại Hội đồng xét duyệt Tập đoàn (RD02.02 B47).',
 'Nhận xét',
$json$
{"type":"default","id":"pnx-ban-tckt-td","components":[
 {"type":"text","id":"h","text":"## [MỚI] Phiếu nhận xét của Ban TCKT (Tập đoàn)"},
 {"type":"textarea","id":"nd","key":"noiDungNhanXet","label":"Nội dung nhận xét","validate":{"required":true}},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:02+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:02+00'),

('pnx-ban-tcnl-td', '[MỚI] Phiếu nhận xét của Ban TCNL (Tập đoàn)',
 '[MỚI - chưa có mã biểu mẫu riêng trong bộ BM.02] Phiếu nhận xét của Ban TCNL Tập đoàn, dùng làm căn cứ tại Hội đồng xét duyệt Tập đoàn (RD02.02 B48).',
 'Nhận xét',
$json$
{"type":"default","id":"pnx-ban-tcnl-td","components":[
 {"type":"text","id":"h","text":"## [MỚI] Phiếu nhận xét của Ban TCNL (Tập đoàn)"},
 {"type":"textarea","id":"nd","key":"noiDungNhanXet","label":"Nội dung nhận xét","validate":{"required":true}},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-02T00:00:01+00', 'system-seed', TIMESTAMPTZ '2026-01-02T00:00:01+00');
