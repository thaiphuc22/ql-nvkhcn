# Review va ke hoach nang cap popup Them luat anh xa

Ngay review: 2026-07-08

Pham vi review:

- `webapp/src/pages/ApprovalMatrix.tsx`
- `webapp/src/components/ConditionBuilder.tsx`
- `webapp/src/components/AssignmentBuilder.tsx`

Yeu cau: chi review va lap ke hoach nang cap mockup popup `Them luat anh xa`, khong sua code ung dung.

## Tong quan hien trang

Popup `Them luat anh xa` hien nam trong `ApprovalMatrix.tsx`, dung Ant Design `Modal` va `Form` layout doc. Noi dung popup gom:

- Ten luat
- Slot phe duyet
- Dieu kien ap dung, thong qua `ConditionBuilder`
- Ket qua phan cong, thong qua `AssignmentBuilder`
- Uu tien
- Kich hoat

Hai phan phuc tap nhat cua popup la:

- `ConditionBuilder`: soan cay dieu kien AND/OR, ho tro nhom con, field/operator/value va dien giai dieu kien.
- `AssignmentBuilder`: soan che do phan cong va danh sach dich phan cong theo nhom hoac nguoi cu the.

Mockup hien tai da co du chuc nang loi de tao/sua rule, nhung trai nghiem van nghieng ve form cau hinh ky thuat hon la mot cong cu soan luat nghiep vu.

## Cac diem can nang cap

### 1. Modal qua hep cho nghiep vu phuc tap

Modal hien chua set `width`, nen voi condition tree, segmented control va multi-select trong assignment, noi dung rat de bi wrap nhieu dong. Khi luat co nhieu dieu kien hoac nhieu dich phan cong, nguoi dung kho scan cau truc tong the.

De xuat:

- Tang width modal khoang `880px` den `1040px`.
- Body modal co scroll rieng khi noi dung dai.
- Giu footer hanh dong co dinh de nut luu/huy khong bi day xuong qua sau.

### 2. Luong nhap chua co cau truc theo buoc

Nguoi dung hien phai hieu cung luc nhieu khai niem: metadata, slot, cay dieu kien, assignment mode, target, priority va trang thai kich hoat.

De xuat chia popup thanh cac vung ro:

- Thong tin luat
- Khi nao ap dung
- Ai phe duyet
- Uu tien va hieu luc
- Preview va canh bao

Viec chia section giup nguoi dung nghiep vu doc popup nhu mot cau luat: "Khi nao" -> "Thi ai xu ly" -> "Uu tien the nao".

### 3. Thieu preview tong hop truoc khi luu

`ConditionBuilder` da co dong dien giai dieu kien, nhung popup chua co preview hoan chinh cua ca rule.

De xuat them preview realtime dang:

> Neu slot = Tham dinh va dieu kien = cap Tap doan, ngan sach > 5 ty thi phan cong cho Nhom Tham dinh theo che do Mot nguoi bat ky, uu tien #50.

Preview nen hien:

- Slot
- Dieu kien
- Dich phan cong
- Che do phan cong
- Priority
- Trang thai kich hoat

### 4. Validation con mong

Validation hien co:

- Bat buoc ten luat
- Bat buoc slot
- Bat buoc priority
- Kiem tra co it nhat mot target hop le khi luu

Chua thay validation/canh bao ro cho:

- Dieu kien thieu value
- Rule khong co dieu kien, tuc khop moi ho so
- Priority trung voi rule khac
- Ten rule trung hoac qua chung chung
- Rule co kha nang che/ghi de rule khac theo first-match priority
- Assignment target da them nhung chua chon nhom/nguoi

De xuat:

- Dua loi target rong ve gan `AssignmentBuilder`, thay vi chi bao message khi bam luu.
- Canh bao inline neu condition rong: "Rule nay se khop moi ho so trong slot da chon".
- Canh bao priority trung/gan voi rule cung slot.
- Canh bao condition leaf thieu value neu operator can value.

### 5. Assignment builder con nhieu nhan ky thuat

Mot so nhan nhu `candidateGroup`, `GROUP`, `USER`, hoac mode he thong co the dung ve mat thiet ke, nhung chua that than thien voi nguoi dung nghiep vu.

De xuat:

- Dung nhan nghiep vu lam chinh, technical hint lam phu.
- Vi du:
  - "Nhom phe duyet" thay vi "Nhom (candidateGroup)"
  - "Nguoi cu the" thay vi "USER"
  - "Mot nguoi bat ky phe duyet" thay vi chi hien mode ngan
- Bo sung mo ta ngan cho tung che do phan cong.

### 6. Thieu canh bao xung dot ngay trong popup

Trang chinh da co analyzer de canh bao xung dot/do phu rule. Tuy nhien popup chua dua canh bao som trong luc nguoi dung soan rule.

De xuat:

- Khi nguoi dung chon slot/priority/condition, tinh nhanh cac canh bao co lien quan.
- Hien warning trong panel preview.
- Neu rule co kha nang shadow rule khac, hien danh sach rule bi anh huong.

## Ke hoach nang cap mockup

### P1 - Nang layout modal va preview

Muc tieu: lam popup de doc va de tu kiem tra hon ma chua thay doi logic luu.

Cong viec:

- Set width modal lon hon.
- Chia noi dung thanh section ro rang.
- Them panel preview ben phai hoac cuoi popup.
- Hien tom tat rule realtime.
- Giu nut luu/huy ro rang, de bam.

Ket qua mong doi:

- Nguoi dung nhin duoc rule dang tao co nghia la gi.
- Giam cam giac popup la mot form ky thuat dai.

### P2 - Validation va guardrail trong popup

Muc tieu: bao loi dung cho va canh bao truoc khi luu.

Cong viec:

- Hien loi target rong ngay trong khu vuc assignment.
- Hien canh bao condition rong.
- Hien canh bao condition leaf thieu value.
- Hien canh bao priority trung hoac qua gan rule cung slot.
- Them confirm khi luu rule khop moi ho so.

Ket qua mong doi:

- Nguoi dung it gap loi muon sau khi bam luu.
- Rule tao ra co chat luong cao hon.

### P3 - Canh bao conflict/shadow rule trong khi soan

Muc tieu: dua kha nang phan tich rule vao popup, khong chi sau khi da luu.

Cong viec:

- Tai su dung logic analyzer hien co neu phu hop.
- So sanh draft rule voi danh sach rule hien tai.
- Hien canh bao rule nao co the bi che hoac trung y nghia.
- Phan biet warning va error de nguoi dung biet muc do nghiem trong.

Ket qua mong doi:

- Giam rui ro tao rule dung cu phap nhung sai thu tu uu tien.
- Phu hop voi co che first-match theo priority.

### P4 - Preset nghiep vu va polish wording

Muc tieu: tang toc tao rule cho cac truong hop pho bien.

Cong viec:

- Them preset theo slot: Tham dinh, Phe duyet, Hoi dong.
- Them preset dieu kien pho bien: cap Tap doan, ngan sach lon hon nguong, loai hoi dong.
- Them preset assignment theo nhom/chuc danh hay dung.
- Doi nhan ky thuat thanh nhan nghiep vu de doc hon.

Ket qua mong doi:

- Tao rule nhanh hon.
- Giam phu thuoc vao viec nguoi dung phai hieu cau truc ky thuat ben duoi.

## Goi y thiet ke UI

Huong layout de xuat:

- Modal rong, chia 2 cot tren desktop.
- Cot trai: form soan rule.
- Cot phai: preview, warning va checklist tinh hop le.
- Tren mobile hoac man hinh hep: cac section xep doc.

Thu tu section:

1. Thong tin luat
2. Dieu kien ap dung
3. Ket qua phan cong
4. Uu tien va kich hoat
5. Preview va canh bao

Thanh preview nen co cac trang thai:

- Hop le
- Can canh bao
- Chua du thong tin
- Co loi can sua truoc khi luu

## Ket luan

Popup hien tai da du chuc nang loi cho prototype mock, nhung con thien ve form cau hinh ky thuat. Huong nang cap nen bien popup thanh mot `rule composer`: co bo cuc rong hon, section ro hon, preview realtime, validation tai cho va canh bao xung dot som.

Thu tu uu tien nen la:

1. Nang layout modal va them preview tong hop.
2. Them validation/canh bao inline.
3. Dua analyzer vao popup de canh bao conflict/shadow rule.
4. Them preset va polish wording theo ngon ngu nghiep vu.
