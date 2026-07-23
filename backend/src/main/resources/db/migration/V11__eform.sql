-- Thư viện biểu mẫu (eForm, D10/D12/D13): schema form-js lưu tại domain DB, không phải Camunda variable.

CREATE TABLE eform (
    form_key VARCHAR(128) PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    mo_ta VARCHAR(1000) NOT NULL DEFAULT '',
    loai VARCHAR(32) CHECK (loai IS NULL OR loai IN ('Soạn thảo', 'Góp ý', 'Nhận xét', 'Thẩm định', 'Phê duyệt')),
    schema_json TEXT NOT NULL,
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

INSERT INTO eform (form_key, ten, mo_ta, loai, schema_json, version, created_at, updated_by, updated_at) VALUES
('phieu-chu-truong', 'Hồ sơ trình duyệt Chủ trương',
 'Soạn nội dung HS chủ trương: sự cần thiết + mục tiêu + dự toán', 'Soạn thảo',
$json$
{"type":"default","id":"phieu-chu-truong","components":[
 {"type":"text","id":"h","text":"## Hồ sơ trình duyệt Chủ trương\n\nChủ nhiệm đề tài soạn nội dung hồ sơ chủ trương nhiệm vụ KHCN."},
 {"type":"textarea","id":"sct","key":"suCanThiet","label":"Sự cần thiết / bối cảnh","validate":{"required":true}},
 {"type":"textarea","id":"mt","key":"mucTieu","label":"Mục tiêu & nội dung chính","validate":{"required":true}},
 {"type":"textarea","id":"sp","key":"sanPham","label":"Sản phẩm dự kiến"},
 {"type":"textfield","id":"dt","key":"duToanTong","label":"Tổng dự toán PL1–PL6 (triệu đồng)","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-01T00:00:08+00', 'system-seed', TIMESTAMPTZ '2026-01-01T00:00:08+00'),

('phieu-y-kien', 'Phiếu góp ý', 'Ghi ý kiến, không kết luận', 'Góp ý',
$json$
{"type":"default","id":"phieu-y-kien","components":[
 {"type":"text","id":"h","text":"## Phiếu góp ý\n\nGhi ý kiến góp ý về hồ sơ."},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến góp ý","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-01T00:00:07+00', 'system-seed', TIMESTAMPTZ '2026-01-01T00:00:07+00'),

('phieu-nhan-xet', 'Phiếu nhận xét', 'Tiêu chí + kết luận + ý kiến', 'Nhận xét',
$json$
{"type":"default","id":"phieu-nhan-xet","components":[
 {"type":"text","id":"hdr","text":"## Phiếu nhận xét / góp ý hồ sơ\n\nCơ quan nghiệp vụ đánh giá và cho ý kiến về hồ sơ nhiệm vụ KHCN."},
 {"type":"checklist","id":"tc","key":"tieuChi","label":"Đánh giá tiêu chí (tích các mục Đạt)","values":[
   {"value":"capThiet","label":"Tính cấp thiết"},
   {"value":"khaThi","label":"Tính khả thi khoa học – công nghệ"},
   {"value":"duToan","label":"Dự toán hợp lý"},
   {"value":"nhanSu","label":"Năng lực nhân sự thực hiện"}
 ]},
 {"type":"radio","id":"kl","key":"ketLuan","label":"Kết luận","validate":{"required":true},"values":[
   {"value":"dong_y","label":"Đồng ý thông qua"},
   {"value":"chinh_sua","label":"Đề nghị chỉnh sửa / Không thông qua"}
 ]},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến nhận xét","validate":{"required":true}}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-01T00:00:06+00', 'system-seed', TIMESTAMPTZ '2026-01-01T00:00:06+00'),

('phieu-dat-chua-dat', 'Phiếu Đạt / Chưa đạt', 'Kết luận Đạt/Chưa đạt + lý do', 'Thẩm định',
$json$
{"type":"default","id":"phieu-dat-chua-dat","components":[
 {"type":"text","id":"h","text":"## Phiếu thẩm định — Đạt / Chưa đạt"},
 {"type":"radio","id":"kl","key":"ketLuan","label":"Kết luận thẩm định","validate":{"required":true},"values":[
   {"value":"dat","label":"Đạt"},
   {"value":"chua_dat","label":"Chưa đạt"}
 ]},
 {"type":"textarea","id":"yk","key":"yKien","label":"Lý do / ghi chú"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-01T00:00:05+00', 'system-seed', TIMESTAMPTZ '2026-01-01T00:00:05+00'),

('bao-cao-tham-dinh', 'Báo cáo thẩm định', 'Nội dung + kết luận + kiến nghị', 'Thẩm định',
$json$
{"type":"default","id":"bao-cao-tham-dinh","components":[
 {"type":"text","id":"h","text":"## Báo cáo thẩm định hồ sơ"},
 {"type":"textarea","id":"nd","key":"noiDung","label":"Nội dung thẩm định","validate":{"required":true}},
 {"type":"radio","id":"kl","key":"ketLuan","label":"Kết luận","validate":{"required":true},"values":[
   {"value":"thong_qua","label":"Thông qua"},
   {"value":"khong_thong_qua","label":"Không thông qua"}
 ]},
 {"type":"textarea","id":"kn","key":"kienNghi","label":"Kiến nghị"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-01T00:00:04+00', 'system-seed', TIMESTAMPTZ '2026-01-01T00:00:04+00'),

('phieu-phe-duyet', 'Phiếu phê duyệt / ký', 'Phê duyệt / Từ chối + ý kiến', 'Phê duyệt',
$json$
{"type":"default","id":"phieu-phe-duyet","components":[
 {"type":"text","id":"h","text":"## Phiếu phê duyệt"},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến phê duyệt"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-01T00:00:03+00', 'system-seed', TIMESTAMPTZ '2026-01-01T00:00:03+00'),

('phieu-du-toan-demo', 'Phiếu thẩm định dự toán',
 'Demo ẩn/hiện có điều kiện + trường tự tính (eForm B-engine)', 'Thẩm định',
$json$
{"type":"default","id":"phieu-du-toan-demo","components":[
 {"type":"text","id":"h","text":"## Phiếu thẩm định dự toán (demo)\n\nMinh hoạ **ẩn/hiện có điều kiện** và **trường tự tính**."},
 {"type":"radio","id":"kl","key":"ketLuan","label":"Kết luận thẩm định","validate":{"required":true},"values":[
   {"value":"dat","label":"Đạt"},
   {"value":"chua_dat","label":"Chưa đạt"}
 ]},
 {"type":"textarea","id":"ld","key":"lyDoChuaDat","label":"Lý do chưa đạt","validate":{"required":true},"conditional":{"hide":"=ketLuan != \"chua_dat\""}},
 {"type":"separator","id":"s1"},
 {"type":"number","id":"pl1","key":"kinhPhiPL1","label":"Kinh phí PL1 (triệu đồng)","validate":{"min":0}},
 {"type":"number","id":"pl2","key":"kinhPhiPL2","label":"Kinh phí PL2 (triệu đồng)","validate":{"min":0}},
 {"type":"expression","id":"tong","key":"tongKinhPhi","label":"Tổng kinh phí (tự tính)","expression":"=(if kinhPhiPL1 = null then 0 else kinhPhiPL1) + (if kinhPhiPL2 = null then 0 else kinhPhiPL2)"},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến thẩm định"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-01T00:00:02+00', 'system-seed', TIMESTAMPTZ '2026-01-01T00:00:02+00'),

('phieu-thanh-vien-demo', 'Đăng ký thành viên',
 'Demo bảng động: thêm/xoá dòng + tự tính & ẩn/hiện theo dòng (eForm B-engine)', 'Soạn thảo',
$json$
{"type":"default","id":"phieu-thanh-vien-demo","components":[
 {"type":"text","id":"h","text":"## Đăng ký thành viên nhiệm vụ\n\nMinh hoạ **bảng động** — thêm/xoá dòng, mỗi dòng có **trường tự tính** và **ẩn/hiện theo dòng**."},
 {"type":"dynamiclist","id":"ds","key":"danhSachThanhVien","label":"Danh sách thành viên","validate":{"required":true},"components":[
   {"type":"textfield","id":"ht","key":"hoTen","label":"Họ và tên","validate":{"required":true}},
   {"type":"select","id":"vt","key":"vaiTro","label":"Vai trò","validate":{"required":true},"values":[
     {"value":"chu_nhiem","label":"Chủ nhiệm"},
     {"value":"thanh_vien","label":"Thành viên"},
     {"value":"thu_ky","label":"Thư ký"}
   ]},
   {"type":"number","id":"st","key":"soThang","label":"Số tháng tham gia","validate":{"min":0,"max":24}},
   {"type":"number","id":"hs","key":"heSo","label":"Hệ số công (triệu đồng/tháng)","validate":{"min":0}},
   {"type":"expression","id":"cp","key":"chiPhiUocTinh","label":"Chi phí ước tính (tự tính)","expression":"=(if soThang = null then 0 else soThang) * (if heSo = null then 0 else heSo)"},
   {"type":"textarea","id":"gc","key":"ghiChu","label":"Ghi chú trách nhiệm chủ nhiệm","conditional":{"hide":"=vaiTro != \"chu_nhiem\""}}
 ]},
 {"type":"separator","id":"s1"},
 {"type":"expression","id":"stv","key":"soThanhVien","label":"Số thành viên (tự đếm)","expression":"=if danhSachThanhVien = null then 0 else count(danhSachThanhVien)"},
 {"type":"textarea","id":"yk","key":"yKien","label":"Ý kiến / ghi chú chung"}
]}
$json$,
 1, TIMESTAMPTZ '2026-01-01T00:00:01+00', 'system-seed', TIMESTAMPTZ '2026-01-01T00:00:01+00');
