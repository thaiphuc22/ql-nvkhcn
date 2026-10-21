---
ma: BA-KHO-TAI-LIEU-01
ten: Cấu hình quản lý hồ sơ tài liệu dự án (QĐ 1752 + BM-PYC)
version: 0.1
ngay_tao: 2026-09-28
nguon:
  - "QD_QL Cau hinh luu tru tai lieu.pdf (1752/QĐ-VHT-KHCN)"
  - "BM-PYC - Khai bao cau hinh.pdf (QT.VHT.CLKHCN)"
trang_thai: Nháp triển khai UI
---

# Cấu hình quản lý hồ sơ tài liệu dự án

## Phạm vi nghiệp vụ đã cấu hình trên hệ thống

| Nguồn | Nội dung | Trên site |
|---|---|---|
| QĐ Điều 3 | Đặt tên `MASANPHAM_GiaiDoan_[Module_]Ten_Vx.y` (≤ 80 ký tự) | Tab Kho — kiểm tra khi thêm tài liệu |
| QĐ Điều 4 + Phụ lục 2 / BM-PYC Mục 1 | Cây thư mục theo giai đoạn TKT/NCTD/EVT/DVT/MP/AS | Tab **Cấu hình cây thư mục** |
| QĐ Phụ lục 1 | Ký hiệu trung tâm / khối | Form PYC (dropdown) |
| QĐ Điều 5 + BM-PYC Mục 2 | Luồng PYC phân quyền + user theo vị trí | Tab **Phiếu PYC** |
| BM-PYC | Tạo phân vùng theo nhiệm vụ sau khi CNTT khai báo | Tab **Kho theo nhiệm vụ** |

## Luồng vận hành

1. Xem / khôi phục **mẫu cây thư mục** theo giai đoạn.
2. PM **tạo phiếu PYC** (căn cứ QĐ giao NV, mã SP, khối/TT, giai đoạn, chủ nhiệm).
3. Chuyển trạng thái: Nháp → TT thẩm định → Khối duyệt → **CNTT khai báo**.
4. Khi CNTT xác nhận: hệ thống sinh kho `VHT/{Khối}/{TT}/{MãSP}/{MãNV}/{GiaiDoan}/…`.
5. Upload tài liệu vào thư mục; hệ thống sinh **tên chuẩn** và báo đạt/không đạt quy tắc đặt tên.

## Đường dẫn

- UI: `/kho-tai-lieu` (menu Quản trị KHCN → Hồ sơ tài liệu dự án)
- Model: `frontend-angular/src/app/core/models/kho-tai-lieu.ts`
- Service (localStorage): `frontend-angular/src/app/core/services/kho-tai-lieu.service.ts`

## Chưa làm (cố ý)

- Chưa tích hợp storage/P.CNTT thật (hotroit.vht.vn).
- Chưa audit tháng/lần của P.ĐBCL.
- Chưa ACL runtime theo từng thư mục (mới lưu danh sách user đề xuất trên PYC).
