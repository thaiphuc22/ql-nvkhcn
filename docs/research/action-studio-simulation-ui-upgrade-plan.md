# Ke Hoach Nang Cap UI Man /cau-hinh-hanh-dong - Tab Mo Phong

Ngay lap: 2026-07-08

Pham vi: doc man `/cau-hinh-hanh-dong`, tab `Mo phong`, va de xuat ke hoach nang cap UI. Chua coding.

## Hien Trang

Tab `Mo phong` hien nam trong `webapp/src/pages/ActionStudio.tsx`, component `InspectorTab`.

Tab dang dong vai tro API inspector cho `available-actions`:

- Ben trai chon ngu canh goi API: surface, quy trinh, trang thai ho so, task key, cap nhiem vu, vai tro, quyen, admin, va cac dieu kien ngoai le.
- Ben phai render action theo nhom `PRIMARY`, `MORE`, `EXCEPTION`.
- Ben duoi hien payload JSON mo phong shape ma UI nghiep vu nhan tu API.

Logic nen dang kha tot: UI khong tu quyet dinh nut nao duoc hien, ma render theo ket qua tu `getAvailableActions`.

## Van De UI Chinh

### 1. Giao dien con thien ve debug ky thuat

Man hinh dang la mot form dai cong voi JSON payload. Cach nay huu ich cho dev, nhung nguoi dung nghiep vu/admin phai tu suy luan quan he giua `processCode`, `taskDefinitionKey`, role, permission, exception policy va ket qua nut.

### 2. Task key dang nhap tay

`taskDefinitionKey` hien la input text. Nguoi dung phai biet ma `t1`, `t2`, `t3`, de sai rat de. Nen chon tu danh sach buoc cua quy trinh hien tai.

### 3. Ket qua action chua giong runtime that

Action hien bang `Tag`, trong khi man ho so that se hien button, menu, nut danger/primary, va nhom thao tac. Vi vay nguoi dung kho hinh dung "man chi tiet ho so se hien gi".

### 4. Ly do hien/khong hien con bi an

Action disabled chi co tooltip. Cac action khong hien thi thi bien mat hoan toan. Admin khong biet la thieu policy, sai role, thieu permission, hay bi gate ngoai le.

### 5. Chua co kich ban kiem thu nhanh

Moi lan test phai tu chon role, permission, status. Chua co preset nhu "nguoi nop ho so", "chuyen vien xu ly", "lanh dao duyet", "admin".

## Dinh Huong Nang Cap

Chuyen tab `Mo phong` tu "debug API" thanh "phong thu nghiep vu":

- Chon vai nguoi dung.
- Chon ngu canh ho so.
- Xem man chi tiet ho so se hien nut gi.
- Hieu ngay vi sao nut hien, bi khoa, hoac khong hien.
- Co the luu/so sanh kich ban kiem thu cau hinh.

## Ke Hoach Nang Cap

### Dot 1 - Lam ro luong mo phong

Muc tieu: nguoi dung hieu minh dang mo phong cai gi trong 5 giay dau.

- Chia cot nhap lieu thanh 3 card nho:
  - `Ngu canh ho so`: surface, quy trinh, trang thai, buoc hien tai, cap nhiem vu.
  - `Ngu canh nguoi dung`: vai tro, quyen, admin mode.
  - `Dieu kien ngoai le`: user co dang xu ly buoc hien tai, con buoc sau, co yeu cau ngoai le dang mo.
- Them summary bar o dau:
  - Vi du: `RD01.01 / Dang xu ly / Buoc t2 / CQ_KHCN / PROCESS_STEP`.
- Doi input `taskDefinitionKey` thanh Select theo `processCode`.
- Rut gon alert huong dan thanh checklist ngan, co the collapse.

### Dot 2 - Preview giong runtime that

Muc tieu: nguoi dung nhin ket qua nhu dang o man chi tiet ho so.

- Thay action `Tag` bang button preview:
  - Primary actions: button noi bat.
  - More actions: gom vao vung/menu thao tac khac.
  - Exception actions: vung rieng, tone canh bao/danger.
- Action disabled van hien nhung co trang thai khoa va ly do ngan.
- Hien metadata quan trong ngay tren action:
  - Can ly do.
  - Can can cu.
  - Can confirm.
  - Form se mo (`formKey`).
- Giu payload JSON nhung dua vao tab/phu luc "Payload API", khong de chiem trong tam mac dinh.

### Dot 3 - Giai thich quyet dinh hien thi

Muc tieu: admin biet vi sao ket qua dung hoac sai.

- Moi action co nut/drawer "Giai thich".
- Hien:
  - `actionCode`.
  - `matchedPolicyId`.
  - `conditionExpression`.
  - `formKey`.
  - role/permission da khop hoac bi thieu.
  - exception policy ap dung neu la action ngoai le.
- Them nhom `Khong hien thi` cho action fail-closed:
  - Khong co availability policy.
  - Sai surface/process/status/task.
  - Sai role.
  - Thieu permission.
  - Khong co exception policy.
- Khong bien mat im lang cac action quan trong khi dang o che do debug/admin.

### Dot 4 - Preset va kich ban kiem thu

Muc tieu: test nhanh cac luong pho bien, giam thao tac lap lai.

- Them preset:
  - `Nguoi nop ho so`.
  - `Chuyen vien xu ly`.
  - `Lanh dao duyet`.
  - `Admin`.
- Moi preset tu set role + permission + admin mode phu hop.
- Them nut reset ve ngu canh mac dinh.
- Cho luu kich ban mock/local:
  - Ten kich ban.
  - Context dau vao.
  - Expected actions.
- Them nut copy/export context de bao loi hoac trao doi voi team dev.

### Dot 5 - So sanh va regression UI

Muc tieu: bien tab mo phong thanh cong cu kiem thu cau hinh an toan truoc khi ban hanh.

- So sanh 2 context canh nhau:
  - Truoc/sau doi role.
  - Truoc/sau doi task.
  - User thuong/admin.
  - Truoc/sau sua policy.
- Cho admin danh dau expected result:
  - Action phai hien.
  - Action phai bi khoa.
  - Action khong duoc hien.
- Neu ket qua lech expected, hien canh bao.
- Luu ket qua kiem thu theo kich ban de phuc vu regression.

## Uu Tien Trien Khai De Xuat

1. Dropdown task theo process va chia form context thanh 3 card.
2. Preview action dang button runtime thay vi tag.
3. Drawer/panel giai thich quyet dinh theo tung action.
4. Preset role/permission.
5. Expected actions va so sanh regression.

## Luu Y Ky Thuat

- Logic hien thi hien tap trung trong `getAvailableActions`, nen UI moi nen tiep tuc render theo output cua ham nay.
- De hien action "khong hien thi", co the can them ham debug rieng tra ve ca cac action bi loai va reason.
- Nen reuse `ACTION_PRESENTATIONS`, `ACTION_REGISTRY`, `ACTION_AVAILABILITY_POLICIES`, `EXCEPTION_POLICIES` de khong tao mapping trung lap trong UI.
- Khi doi `taskDefinitionKey` sang dropdown, lay option tu `processByCode(processCode)?.taskSteps`.
- Payload JSON van can giu cho dev/admin nang cao, nhung khong nen la vung noi bat mac dinh.

## Ket Luan

Tab `Mo phong` da co nen logic tot cho viec kiem tra `available-actions`. Nang cap quan trong nhat la doi trai nghiem tu form debug sang preview nghiep vu: nguoi dung chon vai, chon buoc, thay ngay nut nao se hien tren ho so va vi sao.
