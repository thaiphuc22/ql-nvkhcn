# Kế hoạch triển khai QTKHCN - PH2 Enhancement

## Tổng quan

Người dùng yêu cầu bổ sung nhiều module mới cho hệ thống QTKHCN PH2. Dựa trên khảo sát codebase, một số thành phần đã tồn tại với chất lượng tốt.

---

## Hiện trạng

### ✅ Đã hoàn thành (không cần làm thêm)

| Module | File | Ghi chú |
|--------|------|---------|
| **Dashboard Camunda Optimize** | [Dashboard.tsx](webapp/src/pages/Dashboard.tsx) | Đã có đầy đủ 4 hàng: KPI tổng quan, Xu hướng, BPMN heatmap/Branch analysis, Cases/SLA. Có dark mode, filters, drill-down. |

### 🟡 Cần nâng cấp (CouncilCommittee.tsx)

| File | Hiện có | Cần bổ sung |
|------|---------|-------------|
| [CouncilCommittee.tsx](webapp/src/pages/CouncilCommittee.tsx) | List HD, chi tiết, thành viên, biên bản | Edit, xóa/ngừng, lịch sử, lịch họp, phiếu đánh giá/nhận xét, nhiều phiên họp, kho chuyên gia |

### 🔴 Chưa có (cần tạo mới)

| Module | Số trang cần tạo |
|--------|-----------------|
| **Báo cáo định kỳ/đột xuất** | 5 trang (list, create, detail, edit, history) |
| **Hồ sơ đổi chủ nhiệm cấp Cơ sở** | 5 trang (list, create, detail, edit, history) |
| **Hồ sơ điều chỉnh nội dung/dự toán không tăng tổng cấp Cơ sở** | 5 trang |
| **Hồ sơ điều chỉnh mục tiêu/tăng dự toán không vượt chủ trương cấp Cơ sở** | 5 trang |
| **Mẫu thông báo** | 4 trang (list, create/edit, detail, cấu hình) |
| **Danh mục nghiệp vụ** | 4 trang (list, create, detail, edit) |

---

## Chi tiết từng module

### 1. Dashboard Camunda Optimize ✅
**Trạng thái: Hoàn thành 100%**

Dashboard đã có đầy đủ các thành phần theo yêu cầu:
- **Hàng 1 - KPI tổng quan**: Total Process Instances, Active Incidents, SLA Compliance %, Average Process Duration với delta indicators
- **Hàng 2 - Xu hướng**: Volume by day/week, Duration trend, Incident trend (Recharts Bar/Line charts)
- **Hàng 3 - Phân tích**: BPMN Heatmap, Top Long-Running Tasks, Branch Analysis
- **Hàng 4 - Chi tiết**: Cases quá SLA, Outlier instances, Phân nhóm theo đơn vị/loại HS/sản phẩm

Tính năng đã có:
- Dark mode toggle
- Time period filters (month/quarter/range)
- Process group, version, department filters
- Sticky header
- Responsive layout
- Recharts visualizations
- BPMN viewer integration
- Drill-down navigation
- Management questions in each card title

**Không cần làm thêm.**

---

### 2. Hội đồng KHCN (CouncilCommittee) 🟡
**File: [CouncilCommittee.tsx](webapp/src/pages/CCouncilCommittee.tsx)**
**Trạ thái: Cần nâng cấp**

#### Đã có:
- Danh sách Hội đồng (left panel)
- Chi tiết Hội đồng (right panel)
- Thành viên với trạng thái (duKien, chapNhan, tuChoi, vangMat)
- Tạo HĐ từ hồ sơ
- Biên bản & Kết luận
- Steps tracking

#### Cần bổ sung:

**2.1. Chỉnh sửa Hội đồng (Edit mode)**
- Drawer 640px cho edit thông tin HĐ
- Edit ngày họp, địa điểm, thành viên

**2.2. Xóa/Ngừng sử dụng Hội đồng**
- Popconfirm delete
- Trạng thái "daHuy" hoặc "ngungSuDung"

**2.3. Xem lịch sử Hội đồng**
- Tab lịch sử thay đổi
- Ai đã sửa, lúc nào, thay đổi gì

**2.4. Loại hội đồng**
- HĐ KHCN Tổng Công ty theo lĩnh vực/giai đoạn
- HĐ xét duyệt cấp Cơ sở theo nhiệm vụ
- HĐ đánh giá cấp Cơ sở theo nhiệm vụ
- HĐ nghiệm thu theo nhiệm vụ
- HĐ KHCN Tập đoàn (hệ thống cập nhật)

**2.5. Quản lý thành viên, vai trò và xung đột lợi ích**
- Thêm/sửa/xóa thành viên
- Kiểm tra xung đột lợi ích (thành viên cùng đơn vị, cùng dự án)

**2.6. Lịch họp**
- Calendar view cho lịch họp
- Tạo lịch và mời họp hội đồng

**2.7. Phiếu đánh giá (PĐG)**
- Tạo mẫu phiếu đánh giá
- Nhập điểm cho từng thành viên
- Ký điện tử PĐG

**2.8. Phiếu nhận xét (PNX)**
- Lập và ký Phiếu nhận xét

**2.9. Phiên họp**
- Quản lý nhiều phiên họp cho một nhiệm vụ
- Kiểm tra tính hợp lệ của phiên họp

**2.10. Tổng hợp kết quả**
- Tổng hợp kết quả chấm và ý kiến

**2.11. Kho chuyên gia**
- Quản lý danh sách chuyên gia
- Lĩnh vực chuyên môn, kinh nghiệm

#### Data file: [hoiDong.ts](webapp/src/data/hoiDong.ts)
Cần mở rộng interface HoiDong, ThanhVienHoiDong

---

### 3. Báo cáo định kỳ/đột xuất 🔴
**Trạng thái: Chưa có, cần tạo mới**
**Số trang: 5**

#### 3.1. Trang danh sách Báo cáo
**File: [BaoCaoList.tsx](webapp/src/pages/bao-cao/BaoCaoList.tsx)**
- Table với pagination
- Filter theo loại (định kỳ/đột xuất), trạng thái, ngày
- Search theo tên, mã báo cáo
- Stats cards: tổng số, đang soạn, chờ duyệt, đã duyệt
- Nút Tạo mới → /bao-cao/tao-moi

#### 3.2. Trang tạo Báo cáo
**File: [BaoCaoCreate.tsx](webapp/src/pages/bao-cao/BaoCaoCreate.tsx)**
- Form với các trường: tiêu đề, loại, nội dung (rich text), file đính kèm
- Draft/Submit workflow
- Draft auto-save

#### 3.3. Trang chi tiết Báo cáo
**File: [BaoCaoDetail.tsx](webapp/src/pages/bao-cao/BaoCaoDetail.tsx)**
- Xem chi tiết báo cáo
- Timeline trạng thái (soạn → chờ duyệt → đã duyệt)
- Các bước phê duyệt
- Nút Trình duyệt

#### 3.4. Trang chỉnh sửa Báo cáo
**File: [BaoCaoEdit.tsx](webapp/src/pages/bao-cao/BaoCaoEdit.tsx)**
- Giống create nhưng pre-populated
- Chỉ cho sửa khi ở trạng thái "soạn"

#### 3.5. Trang lịch sử Báo cáo
**File: [BaoCaoHistory.tsx](webapp/src/pages/bao-cao/BaoCaoHistory.tsx)**
- Lịch sử thay đổi
- Ai sửa, lúc nào, thay đổi gì (audit log)

#### Data file: [catalogBaoCao.ts](webapp/src/data/catalogBaoCao.ts)
```typescript
export interface BaoCao {
  id: string
  tieuDe: string
  loai: 'dinhKy' | 'dotXuat'
  noiDung: string
  trangThai: 'soan' | 'choDuyet' | 'daDuyet' | 'tuChoi'
  nguoiTao: string
  ngayTao: string
  ngayCapNhat: string
  fileDinhKem?: string[]
  lichSu?: LichSuItem[]
}
```

#### Routes:
- `/phan-he/PH2/bao-cao` - list
- `/phan-he/PH2/bao-cao/tao-moi` - create
- `/phan-he/PH2/bao-cao/:id` - detail
- `/phan-he/PH2/bao-cao/:id/chinh-sua` - edit
- `/phan-he/PH2/bao-cao/:id/lich-su` - history

---

### 4. Hồ sơ đổi chủ nhiệm cấp Cơ sở 🔴
**Trạng thái: Chưa có, cần tạo mới**
**Số trang: 5**
**Route prefix: `/phan-he/PH2/doi-chu-nhiem-co-so`**

Giống cấu trúc Báo cáo (list, create, detail, edit, history) nhưng cho Hồ sơ đổi chủ nhiệm.

#### Data file: [catalogDoiChuNhiem.ts](webapp/src/data/catalogDoiChuNhiem.ts)
```typescript
export interface HoSoDoiChuNhiem {
  id: string
  maHoSo: string
  maNhiemVu: string
  chuNhiemCu: string
  chuNhiemMoi: string
  lyDo: string
  trangThai: 'soan' | 'choDuyet' | 'daDuyet' | 'tuChoi' | 'huy'
  nguoiTao: string
  ngayTao: string
  ngayDuyet?: string
  nguoiDuyet?: string
  lichSu?: LichSuItem[]
}
```

---

### 5. Hồ sơ điều chỉnh nội dung/dự toán không tăng tổng cấp Cơ sở 🔴
**Trạng thái: Chưa có, cần tạo mới**
**Số trang: 5**
**Route prefix: `/phan-he/PH2/dieu-chinh-noi-dung-co-so`**

Giống cấu trúc Báo cáo.

#### Data file: [catalogDieuChinhNoiDung.ts](webapp/src/data/catalogDieuChinhNoiDung.ts)

---

### 6. Hồ sơ điều chỉnh mục tiêu/tăng dự toán không vượt chủ trương cấp Cơ sở 🔴
**Trạng thái: Chưa có, cần tạo mới**
**Số trang: 5**
**Route prefix: `/phan-he/PH2/dieu-chinh-muc-tieu-co-so`**

Giống cấu trúc Báo cáo.

#### Data file: [catalogDieuChinhMucTieu.ts](webapp/src/data/catalogDieuChinhMucTieu.ts)

---

### 7. Mẫu thông báo 🔴
**Trạng thái: Chưa có, cần tạo mới**
**Số trang: 4**
**Route prefix: `/phan-he/PH2/mau-thong-bao`**

#### 7.1. Trang danh sách Mẫu thông báo
- Table với loại (email/SMS/Vmail), trạng thái
- Search theo tên, mã
- Stats: tổng, active, inactive
- Nút Tạo mới, Sao chép

#### 7.2. Trang tạo/sửa Mẫu thông báo
**File: [MauThongBaoForm.tsx](webapp/src/pages/thong-bao/MauThongBaoForm.tsx)**
- Form: tiêu đề, loại (email/SMS/Vmail), nội dung mẫu (có biến {{tenNhiemVu}}, {{maHoSo}}, etc.)
- Preview thông báo

#### 7.3. Trang chi tiết Mẫu thông báo
**File: [MauThongBaoDetail.tsx](webapp/src/pages/thong-bao/MauThongBaoDetail.tsx)**
- Xem chi tiết mẫu
- Cấu hình gắn với sự kiện nghiệp vụ
- Theo dõi trạng thái gửi

#### 7.4. Trang cấu hình gửi thông báo
**File: [ThongBaoConfig.tsx](webapp/src/pages/thong-bao/ThongBaoConfig.tsx)**
- Cấu hình Vmail/SMS/Web
- Gắn thông báo với sự kiện nghiệp vụ
- Theo dõi trạng thái gửi và gửi lại

#### Data file: [catalogMauThongBao.ts](webapp/src/data/catalogMauThongBao.ts)

---

### 8. Danh mục nghiệp vụ 🔴
**Trạng thái: Chưa có, cần tạo mới**
**Số trang: 4**
**Route prefix: `/phan-he/PH2/danh-muc-nghiep-vu`**

#### 8.1. Trang danh sách Danh mục nghiệp vụ
- Table với mã, tên, mô tả, trạng thái
- Search, filter
- Stats cards

#### 8.2-8.4. Các trang Create/Detail/Edit
Giống pattern các module khác.

#### Data file: [catalogDanhMucNghiepVu.ts](webapp/src/data/catalogDanhMucNghiepVu.ts)

---

## Thứ tự ưu tiên triển khai

### Giai đoạn 1: Các module độc lập (ít phụ thuộc)
1. **Mẫu thông báo** - 4 trang, cấu trúc đơn giản
2. **Danh mục nghiệp vụ** - 4 trang, cấu trúc đơn giản
3. **Báo cáo định kỳ/đột xuất** - 5 trang, workflow rõ ràng

### Giai đoạn 2: Các module Hồ sơ điều chỉnh
4. **Hồ sơ đổi chủ nhiệm cấp Cơ sở** - 5 trang
5. **Hồ sơ điều chỉnh nội dung/dự toán** - 5 trang
6. **Hồ sơ điều chỉnh mục tiêu/tăng dự toán** - 5 trang

### Giai đoạn 3: Nâng cấp Hội đồng KHCN
7. **Nâng cấp CouncilCommittee** - edit, delete, history, lịch họp, phiếu đánh giá, kho chuyên gia

---

## Cấu trúc thư mục đề xuất

```
webapp/src/
├── pages/
│   ├── bao-cao/
│   │   ├── BaoCaoList.tsx
│   │   ├── BaoCaoCreate.tsx
│   │   ├── BaoCaoDetail.tsx
│   │   ├── BaoCaoEdit.tsx
│   │   └── BaoCaoHistory.tsx
│   ├── doi-chu-nhiem-co-so/
│   │   └── (5 files)
│   ├── dieu-chinh-noi-dung-co-so/
│   │   └── (5 files)
│   ├── dieu-chinh-muc-tieu-co-so/
│   │   └── (5 files)
│   └── thong-bao/
│       ├── MauThongBaoList.tsx
│       ├── MauThongBaoForm.tsx
│       ├── MauThongBaoDetail.tsx
│       └── ThongBaoConfig.tsx
│   └── danh-muc-nghiep-vu/
│       └── (4 files)
├── data/
│   ├── catalogBaoCao.ts
│   ├── catalogDoiChuNhiem.ts
│   ├── catalogDieuChinhNoiDung.ts
│   ├── catalogDieuChinhMucTieu.ts
│   ├── catalogMauThongBao.ts
│   └── catalogDanhMucNghiepVu.ts
```

---

## Tổng số files cần tạo

| Module | Pages | Data files | Tổng |
|--------|-------|------------|------|
| Báo cáo định kỳ/đột xuất | 5 | 1 | 6 |
| Hồ sơ đổi chủ nhiệm | 5 | 1 | 6 |
| Hồ sơ điều chỉnh nội dung | 5 | 1 | 6 |
| Hồ sơ điều chỉnh mục tiêu | 5 | 1 | 6 |
| Mẫu thông báo | 4 | 1 | 5 |
| Danh mục nghiệp vụ | 4 | 1 | 5 |
| Nâng cấp Hội đồng KHCN | 1 (enhance) | 1 | 2 |
| **Tổng cộng** | **29** | **7** | **36** |

---

## Bước tiếp theo

Xác nhận kế hoạch từ người dùng, sau đó triển khai theo thứ tự ưu tiên đã đề ra.