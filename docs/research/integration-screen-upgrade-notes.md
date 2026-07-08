# De xuat nang cap man `/tich-hop`

## Muc tieu

Man `/tich-hop` hien tai dang la dashboard trang thai ket noi: KPI, card tung he, endpoint/API key, loi 24h, hang doi va thao tac ket noi/ngat ket noi.

Huong nang cap nen la bien man nay thanh **Trung tam quan tri tich hop**: vua xem suc khoe he tich hop, vua cau hinh ket noi, mapping du lieu, kiem thu payload, theo doi job/incident va truy vet loi.

Man nay can tra loi nhanh 3 cau hoi:

1. He nao dang loi?
2. Loi do anh huong ho so/quy trinh nao?
3. Mapping hoac cau hinh nao dang gay ra loi?

## Y tuong nang cap UI

### 1. Chia tab theo tac vu

Khong nen nhoi tat ca vao card. Co the chia thanh cac tab:

- **Tong quan**: KPI + card he tich hop nhu hien tai.
- **Mapping du lieu**: field mapping/value mapping theo tung he.
- **Job & loi**: log dong bo gan day, retry, incident.
- **Cau hinh ket noi**: endpoint, auth, timeout, retry policy.
- **Kiem thu**: test connection, test mapping, preview payload.

### 2. Nang card he tich hop

Ngoai trang thai `Da tich hop / Tam dung / Chua ket noi`, moi card nen co them:

- latency trung binh;
- ty le thanh cong 24h;
- so incident dang mo;
- lan loi gan nhat;
- nut `Xem chi tiet`;
- nut `Mapping`;
- nut `Test`;
- nut `Retry loi`.

### 3. Drawer chi tiet he tich hop

Khi bam vao SAP/QLNS/PLM, nen mo drawer chi tiet thay vi chi mo modal endpoint/API key.

Drawer gom:

- thong tin ket noi;
- danh sach object dang dong bo;
- mapping dang active;
- job gan nhat;
- loi gan nhat;
- version cau hinh;
- cac quy trinh/service task dang dung he nay.

### 4. Mapping Studio

Day la phan nen them manh nhat.

Luon bat dau bang bo loc ngu canh:

- He tich hop: SAP, QLNS, MS, QLTS, PLM, IAM...
- Object nghiep vu: Ho so, Nhiem vu, Du toan, Nhan su, Tai san...
- Chieu du lieu: QTKHCN -> he ngoai hoac he ngoai -> QTKHCN.

Bang mapping nen gom:

- truong QTKHCN;
- kieu du lieu;
- truong he ngoai;
- bat buoc hay khong;
- transform;
- gia tri mac dinh;
- trang thai hop le/loi.

Value mapping nen tach rieng voi field mapping. Vi du field `trangThai` map voi `status`, nhung gia tri ben trong can map:

```text
approved -> DA_DUYET
rejected -> TU_CHOI
```

### 5. Preview payload

Admin chon mot ho so mau, he thong hien:

- du lieu goc QTKHCN;
- payload sau mapping;
- cac field thieu/loi;
- JSON gui di hoac JSON nhan ve.

Day la diem rat quan trong de admin thay ngay mapping co an toan de bat hay khong.

### 6. Lien ket voi quy trinh

Vi man tich hop dang gan voi Camunda/service task, chi tiet he tich hop nen hien:

- job type, vi du `sap:sync-budget`;
- quy trinh dung, vi du `RD03.03`;
- service task lien quan;
- incident dang lam treo ho so nao.

### 7. Trang thai cau hinh

Mapping/connection nen co trang thai rieng:

- `Draft`;
- `Ready`;
- `Active`;
- `Deprecated`;
- `Error`.

Nhu vay admin phan biet duoc cau hinh dang chay that voi ban nhap.

## Y tuong nang cap logic

### 1. Tach connection config va mapping config

Endpoint/API key la mot lop. Field/value mapping la lop khac. Khong nen dinh chung vao mot form.

### 2. Validate truoc khi active

Khong cho bat mapping neu:

- thieu field bat buoc;
- sai kieu du lieu;
- thieu value mapping cho enum quan trong;
- map trung external field khong hop le;
- khong co khoa dinh danh nhu `maHoSo`, `maNhiemVu` hoac external id.

### 3. Transform co kiem soat

Chi nen cho chon transform tu danh sach an toan:

- format ngay;
- doi so sang chuoi;
- noi/tach field don gian;
- doi enum/status;
- gan default value.

Khong nen cho user nhap script tuy y trong MVP.

### 4. Retry policy

Cho cau hinh:

- so lan retry;
- delay giua cac lan retry;
- timeout;
- loi nao duoc retry;
- loi nao fail ngay;
- khi fail thi tao incident hay chi ghi log.

### 5. Version va rollback

Moi lan sua mapping/connection nen tao version. Neu mapping moi gay loi, admin co the quay lai version truoc.

### 6. Audit log

Can ghi ro:

- ai sua endpoint;
- ai cap nhat API key;
- ai bat/tat mapping;
- ai ngat ket noi;
- mapping version nao tao payload loi;
- job nao da retry thu cong.

### 7. Fail-closed

Neu mapping loi field trong yeu, he thong nen chan gui du lieu thay vi gui thieu va lam sai du lieu o he ngoai.

### 8. Phan quyen

Nen tach quyen:

- xem trang thai;
- test ket noi;
- sua cau hinh;
- bat/tat mapping;
- retry job loi;
- xem payload nhay cam.

## Lo trinh de xuat

1. Nang card hien tai thanh card co `Xem chi tiet`, `Mapping`, `Test`.
2. Them drawer chi tiet he tich hop.
3. Them tab `Mapping du lieu` voi mock field mapping + value mapping.
4. Them preview JSON va validate trang thai.
5. Lien ket loi tich hop voi job log/incident hien co o man `Nhat ky`.

## Ghi chu san pham

Man nay khong nen chi la "bang map truong". No nen la mot studio cau hinh tich hop co day du:

- connection;
- field mapping;
- value mapping;
- preview;
- test;
- version;
- log;
- incident linkage.

Gia tri lon nhat cua UI la giup quan tri vien nhin thay ngay: **mapping/cau hinh nay co an toan de bat chua?**
