# Ke hoach coding mockup luong Tao moi Ho so

Ngay lap: 08/07/2026

Nguon tham chieu:

- `docs/research/decomposite-diagram.md`
- `docs/req/data-model-NV-vs-HoSo.md`
- Code hien co trong `webapp/src/data/nhiemVu.ts`, `webapp/src/data/dossiers.ts`, `webapp/src/store/DossierContext.tsx`

## 1. Dinh huong nghiep vu

`Nhiem vu KHCN` la thuc the master di xuyen suot vong doi:

```text
Chu truong -> Xet duyet -> Thuc hien -> Dieu chinh -> Nghiem thu -> Quyet toan
```

`Ho so` la instance cua mot luong nghiep vu tai mot giai doan. Mot `NhiemVu` co nhieu `HoSo`.

Vi vay mockup **Tao moi Ho so** khong tao Nhiem vu moi. Luong dung can:

1. Chon mot `Nhiem vu KHCN` da ton tai.
2. Chon loai ho so phu hop giai doan.
3. Khoi tao ho so o trang thai `draft`.
4. Di vao chi tiet ho so de `Gui duyet`, chon quy trinh RD tuong ung.

## 2. Nguyen tac thiet ke luong

### Khong tron Nhiem vu va Ho so

- `NhiemVu` giu thong tin master: ma NV, ten, cap, chu nhiem, don vi, thoi gian, du toan, giai doan.
- `HoSo` chi giu thong tin instance: ma ho so, FK `maNV`, loai ho so, quy trinh, trang thai, buoc hien tai, tai lieu, lich su xu ly.
- UI co the hien thi view join `Dossier = HoSo + NhiemVu`, nhung luu tru van tach 2 thuc the.

### Tao ho so chi tao ban nhap

Ho so moi duoc tao o trang thai `draft`:

- Chua gan `quyTrinh`.
- Chua sinh cac buoc phe duyet.
- Chi co step dau tien: `Khoi tao ho so`.

Quy trinh chi bat dau khi nguoi dung vao man chi tiet ho so va bam `Gui duyet`.

## 3. Mapping loai ho so voi vong doi

| Loai ho so | Giai doan Nhiem vu | Nhom quy trinh |
|---|---|---|
| Chu truong | `chu_truong` | RD01 |
| Xet duyet | `xet_duyet` | RD02 |
| Bao cao | `thuc_hien` | RD03 |
| Dieu chinh | `dieu_chinh` | RD04 |
| Nghiem thu | `nghiem_thu` | RD05 |
| Quyet toan | `quyet_toan` | RD06 |

Ghi chu: Ho so `Chu truong` thuong sinh cung khi tao moi Nhiem vu theo RD01. Man Tao moi Ho so van co the cho chon loai nay de demo, nhung nen hien canh bao nghiep vu.

## 4. Pham vi coding

### 4.1. Them man tao ho so

Tao file moi:

```text
webapp/src/pages/DossierCreate.tsx
```

Route de xuat:

```text
/ho-so/tao-moi
```

Man hinh gom:

- Breadcrumb: `Ho so Nhiem vu KHCN / Tao moi`
- Header: `Tao moi Ho so`
- Nut quay lai danh sach ho so
- Form tao ho so
- Khung tom tat Nhiem vu duoc chon

### 4.2. Bo sung nut tren danh sach ho so

Sua:

```text
webapp/src/pages/DossierList.tsx
```

Them nut primary:

```text
Tao ho so
```

Click dieu huong toi:

```text
/ho-so/tao-moi
```

### 4.3. Cap nhat route ung dung

Sua:

```text
webapp/src/App.tsx
```

Them route:

```tsx
<Route path="/ho-so/tao-moi" element={<DossierCreate />} />
```

Can dat route tao moi truoc route chi tiet neu co route dynamic `/ho-so/:id`.

### 4.4. Them helper sinh ma ho so

Sua:

```text
webapp/src/data/dossiers.ts
```

Them helper:

```ts
export function nextHoSoId(existing: Pick<HoSo, 'id'>[], year = 2026): string {
  let max = 0
  for (const h of existing) {
    const m = /HS-\d{4}-(\d+)/.exec(h.id)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `HS-${year}-${String(max + 1).padStart(3, '0')}`
}
```

Co the dung danh sach `list` tu `useDossiers()` de sinh ma trong mockup.

### 4.5. Reuse ham tao draft hien co

Reuse:

```ts
createDraftHoSo(nv, {
  id,
  loai,
  nguoiKhoiTao,
  ngayTao,
  thoiDiemKhoiTao,
  taiLieu,
})
```

Khong can tao model moi.

## 5. De xuat UI man Tao moi Ho so

### Cot chinh: Thong tin khoi tao

Truong form:

- `Nhiem vu KHCN`: Select co search theo ma, ten, chu nhiem.
- `Loai ho so`: Select theo danh sach `HoSoLoai`.
- `Nguoi khoi tao`: mac dinh lay tu chu nhiem de tai hoac user dang nhap.
- `Ngay tao`: mac dinh ngay hien tai.
- `Tai lieu thanh phan`: checkbox/list mock theo loai ho so.

Tai lieu goi y:

- Chu truong: Thuyet minh de tai, Du toan PL1-PL6.
- Xet duyet: Ho so xet duyet, Du toan PL1-PL6, Bien ban hop HDXD.
- Bao cao: Bao cao dinh ky/dot xuat, Phu luc tien do.
- Dieu chinh: To trinh dieu chinh, Can cu dieu chinh, Phu luc du toan/thoi gian.
- Nghiem thu: Bao cao tong ket, San pham va ket qua, Bien ban nghiem thu.
- Quyet toan: Bao cao quyet toan, Bang tong hop chi phi, Chung tu kem theo.

### Cot phu: Tom tat Nhiem vu

Hien thi:

- Ma NV KHCN
- Ten Nhiem vu
- Chu nhiem
- Don vi chu tri
- Cap
- Giai doan hien tai
- Du toan
- Thoi gian thuc hien

### Preview quy trinh

Khi chon loai ho so, hien thi mapping:

```text
Loai ho so: Nghiem thu
Nhom quy trinh kha dung khi Gui duyet: RD05
Trang thai sau khi tao: Khoi tao
Buoc tiep theo: vao chi tiet ho so -> Gui duyet
```

## 6. Validation nghiep vu

Can co cac canh bao sau:

1. Chua chon Nhiem vu: khong cho submit.
2. Chua chon Loai ho so: khong cho submit.
3. Chon `Chu truong` cho Nhiem vu da ton tai: hien Alert canh bao vi ho so Chu truong thuong sinh cung khi tao Nhiem vu.
4. Chon loai ho so nam sau giai doan hien tai: hien Alert canh bao phu thuoc dieu kien nghiep vu.
5. Chon loai ho so nam truoc giai doan hien tai: hien Alert canh bao tao ho so lui giai doan.

Trong mockup co the chi canh bao, chua can block tuyet doi, vi rule that se nam o backend/workflow engine.

## 7. Luong submit

Khi submit:

1. Lay `NhiemVu` da chon.
2. Sinh ma ho so bang `nextHoSoId`.
3. Tao `HoSo` bang `createDraftHoSo`.
4. Goi `createHoSo`.
5. Hien toast:

```text
Da tao ho so HS-2026-xxx o trang thai Khoi tao.
```

6. Dieu huong toi:

```text
/ho-so/HS-2026-xxx
```

Tai man chi tiet, nguoi dung tiep tuc bam `Gui duyet` de chon quy trinh RD tuong ung.

## 8. Optional nen lam

### Tao ho so tu chi tiet Nhiem vu

Neu `NhiemVuDetail.tsx` da co man chi tiet, them nut:

```text
Tao ho so
```

Dieu huong:

```text
/ho-so/tao-moi?maNV=RD.2026.xxx
```

`DossierCreate.tsx` doc query param `maNV` va preselect Nhiem vu.

### Hien lich su ho so cua cung Nhiem vu

Trong man tao ho so, khi chon Nhiem vu, hien danh sach ho so da co cua Nhiem vu do:

- Ma ho so
- Loai
- Trang thai
- Quy trinh
- Ngay tao

Muc dich: lam ro quan he `1 Nhiem vu -> N Ho so`, tranh nguoi dung tao trung ho so khong can thiet.

## 9. Tieu chi hoan thanh

Mockup dat yeu cau khi:

- Tu danh sach ho so co the bam `Tao ho so`.
- Chon duoc Nhiem vu co san.
- Tao duoc ho so moi gan dung `maNV`.
- Ho so moi xuat hien trong danh sach ho so.
- Ho so moi mo duoc man chi tiet.
- Ho so moi o trang thai `draft` va co the dung luong `Gui duyet` hien co.
- Khong lam thay doi logic tao Nhiem vu moi hien tai.

## 10. Ranh gioi chua lam

Chua can lam trong mockup nay:

- Backend persistence.
- Upload file that.
- Kiem tra dieu kien duyet that theo tung RD.
- Tu dong cap nhat `giaiDoan` cua Nhiem vu sau khi ho so duoc phe duyet.
- Sinh ma ho so theo quy tac chinh thuc cua khach hang.
- Chan tao trung ho so theo rule nghiep vu that.

## 11. Ghi chu trien khai

Code hien tai da co nen tang phu hop:

- `NhiemVu` master: `webapp/src/data/nhiemVu.ts`
- `HoSo` instance: `webapp/src/data/dossiers.ts`
- Join view: `Dossier`
- Store ho so: `webapp/src/store/DossierContext.tsx`
- Luong gui duyet: `webapp/src/pages/DossierDetail.tsx`

Vi vay nen giu implementation gon:

- Them man tao ho so.
- Them route.
- Them nut vao danh sach.
- Them helper sinh ma.
- Reuse `createDraftHoSo` va `createHoSo`.
