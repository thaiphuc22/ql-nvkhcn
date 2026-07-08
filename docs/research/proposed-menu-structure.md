# De xuat cau truc menu QTKHCN

Tai lieu nay de xuat lai cau truc menu cho ung dung QTKHCN, bam theo so do phan ra nghiep vu trong `docs/research/decomposite-diagram.md` va doi chieu voi cac router hien co trong `webapp/src/App.tsx`.

## So do cay menu de xuat

```text
QTKHCN
├─ Tong quan
│  Router: /tong-quan
│  Noi dung: dashboard tong hop, ho so dang xu ly, trang thai nhiem vu, so lieu nhanh.
│
├─ Viec cua toi
│  Router: /viec-cua-toi
│  Noi dung: task cho xu ly, ho so den luot user/nhom quyen xu ly, badge so luong viec.
│
├─ Nghiep vu KHCN
│  ├─ Chu truong & Xet duyet
│  │  Router: chua co
│  │  Noi dung: quan ly giai doan truoc phe duyet nhiem vu.
│  │  ├─ De xuat chu truong
│  │  │  Router: chua co
│  │  │  Noi dung: tao/luu nhap/trinh de xuat chu truong, can cu, muc tieu, pham vi, kinh phi du kien.
│  │  ├─ Xet duyet chu truong RD01
│  │  │  Router: chua co
│  │  │  Noi dung: danh sach ho so trinh chu truong, y kien duyet, yeu cau bo sung, quyet dinh phe duyet.
│  │  ├─ De xuat nhiem vu KHCN
│  │  │  Router: co the lien ket /nhiem-vu/moi
│  │  │  Noi dung: lap nhiem vu tu chu truong da duyet, chu nhiem du kien, san pham, ke hoach, du toan.
│  │  └─ Xet duyet nhiem vu KHCN RD02
│  │     Router: chua co
│  │     Noi dung: kiem tra ho so, phan cong tham dinh, tong hop y kien, duyet giao nhiem vu.
│  │
│  ├─ Nhiem vu KHCN
│  │  Router: /nhiem-vu
│  │  Noi dung: danh sach nhiem vu KHCN da/dang hinh thanh, thong tin tong quat, trang thai vong doi.
│  │  ├─ Tao nhiem vu
│  │  │  Router: /nhiem-vu/moi
│  │  │  Noi dung: tao moi nhiem vu KHCN.
│  │  └─ Chi tiet nhiem vu
│  │     Router: /nhiem-vu/:ma
│  │     Noi dung: thong tin nhiem vu, ho so lien quan, tien do, lich su xu ly.
│  │
│  ├─ Ho so KHCN
│  │  Router: /ho-so
│  │  Noi dung: danh sach ho so quy trinh, trang thai xu ly, buoc hien tai, nguoi/nhom dang xu ly.
│  │  └─ Chi tiet ho so
│  │     Router: /ho-so/:id
│  │     Noi dung: thong tin ho so, luong xu ly, bieu mau, thao tac phe duyet/tra lai/tu choi.
│  │
│  ├─ Hoi dong & Tham dinh
│  │  Router: chua co
│  │  Noi dung: hoi dong xet duyet/tham dinh/nghiem thu, thanh vien, lich hop, phieu danh gia, bien ban.
│  │
│  ├─ Thuc hien nhiem vu
│  │  Router: chua co
│  │  Noi dung: quan ly qua trinh trien khai sau phe duyet.
│  │  ├─ Nhan su de tai
│  │  │  Router: chua co
│  │  │  Noi dung: chu nhiem, thu ky, thanh vien, don vi phoi hop, thay doi nhan su.
│  │  ├─ Mua sam
│  │  │  Router: chua co
│  │  │  Noi dung: nhu cau mua sam, goi mua sam, trang thai lien thong he thong mua sam.
│  │  ├─ Chi phi / Kinh phi
│  │  │  Router: chua co
│  │  │  Noi dung: du toan, phan bo, giai ngan, chi phi thuc te, doi soat SAP.
│  │  ├─ Tai san / VTLK / CCDC
│  │  │  Router: chua co
│  │  │  Noi dung: tai san hinh thanh, vat tu linh kien, cong cu dung cu, lien thong QLTS.
│  │  ├─ Tien do / Milestone / PLM
│  │  │  Router: chua co
│  │  │  Noi dung: moc tien do, deliverable, trang thai thuc hien, du lieu PLM.
│  │  └─ Bao cao dinh ky / dot xuat
│  │     Router: chua co
│  │     Noi dung: bao cao tien do, bao cao chuyen de, yeu cau giai trinh/bo sung.
│  │
│  ├─ Dieu chinh nhiem vu
│  │  Router: chua co
│  │  Noi dung: xu ly cac thay doi trong qua trinh thuc hien.
│  │  ├─ Doi chu nhiem
│  │  │  Router: chua co
│  │  │  Noi dung: de nghi thay doi chu nhiem, phe duyet, quyet dinh dieu chinh.
│  │  ├─ Dieu chinh noi dung / thoi gian / du toan
│  │  │  Router: chua co
│  │  │  Noi dung: thay doi pham vi, tien do, ngan sach, san pham, phu luc dieu chinh.
│  │  ├─ Tam dung nhiem vu
│  │  │  Router: chua co
│  │  │  Noi dung: de nghi tam dung, ly do, thoi han, quyet dinh tam dung.
│  │  └─ Dung nhiem vu
│  │     Router: chua co
│  │     Noi dung: de nghi dung, xu ly phan da thuc hien, quyet toan/bien ban ket thuc.
│  │
│  ├─ Nghiem thu
│  │  Router: chua co
│  │  Noi dung: dang ky nghiem thu, ho so nghiem thu, hoi dong nghiem thu, ket qua, bien ban.
│  │
│  ├─ Quyet toan
│  │  Router: chua co
│  │  Noi dung: ho so quyet toan, tong hop chi phi, chung tu, phe duyet quyet toan, doi soat tai chinh.
│  │
│  └─ San pham nghien cuu / SHTT
│     Router: chua co
│     Noi dung: quan ly dau ra nghien cuu.
│     ├─ Danh muc san pham nghien cuu RD07
│     │  Router: chua co
│     │  Noi dung: san pham dang ky, san pham thuc te, trang thai ban giao/ung dung.
│     ├─ So huu tri tue RD08
│     │  Router: chua co
│     │  Noi dung: ho so SHTT, tac gia, chu so huu, tinh trang dang ky/bao ho.
│     ├─ Cong nghe loi
│     │  Router: chua co
│     │  Noi dung: cong nghe hinh thanh tu nhiem vu, muc do san sang, kha nang ung dung.
│     └─ Bai bao / Sang che
│        Router: chua co
│        Noi dung: cong bo khoa hoc, sang che, giai phap huu ich, lien ket nhiem vu.
│
├─ Bao cao & Dieu hanh
│  Router: nen bo sung /bao-cao
│  Noi dung: khu tong hop phuc vu lanh dao, dieu hanh, canh bao.
│  ├─ Dashboard lanh dao
│  │  Router: co the dung /tong-quan hoac bo sung /bao-cao/dashboard
│  │  Noi dung: buc tranh tong the ve nhiem vu, chi phi, tien do, rui ro.
│  ├─ Tong hop thong tin RD09
│  │  Router: chua co
│  │  Noi dung: tong hop du lieu nhiem vu, ho so, nhan su, kinh phi, san pham.
│  ├─ KPI tien do / chi phi / nhan su
│  │  Router: chua co
│  │  Noi dung: chi so theo don vi, linh vuc, chu nhiem, nhom nhiem vu.
│  └─ Canh bao / Alert
│     Router: chua co
│     Noi dung: canh bao tre han, vuot du toan, thieu ho so, cham xu ly task.
│
├─ Ho so, Tai lieu & Luu tru
│  ├─ Thu vien bieu mau
│  │  Router: /bieu-mau
│  │  Noi dung: bieu mau phuc vu quy trinh, to trinh, thuyet minh, bien ban, quyet dinh.
│  ├─ Ho so phap ly RD10
│  │  Router: chua co
│  │  Noi dung: quyet dinh, hop dong, phu luc, bien ban, van ban phap ly theo nhiem vu.
│  ├─ Quy trinh / Quy dinh
│  │  Router: chua co hoac lien ket /quy-trinh
│  │  Noi dung: van ban quy dinh nghiep vu, huong dan thuc hien, quy che quan ly KHCN.
│  └─ Tra cuu / Luu tru
│     Router: chua co
│     Noi dung: tim kiem toan van, luu tru ho so hoan tat, phan loai tai lieu, tai xuong.
│
├─ Quy trinh & Cau hinh nghiep vu
│  ├─ Quan ly quy trinh
│  │  Router: /quy-trinh
│  │  Noi dung: danh muc quy trinh, thiet ke BPMN, phien ban quy trinh.
│  │  ├─ Tao quy trinh
│  │  │  Router: /quy-trinh/moi
│  │  │  Noi dung: tao moi quy trinh va ve BPMN.
│  │  └─ Chi tiet quy trinh
│  │     Router: /quy-trinh/:ma
│  │     Noi dung: cau hinh buoc xu ly, form, nhom quyen, kiem tra BPMN.
│  ├─ Quan ly luat nghiep vu
│  │  Router: /quan-ly-luat
│  │  Noi dung: rule dieu kien, rule routing, rule kiem tra ho so.
│  │  └─ Chi tiet luat
│  │     Router: /quan-ly-luat/:id
│  │     Noi dung: cau hinh bieu thuc, pham vi ap dung, kiem thu luat.
│  ├─ Ma tran phe duyet
│  │  Router: /ma-tran-phe-duyet
│  │  Noi dung: phan tuyen phe duyet theo loai nhiem vu, cap, gia tri, don vi, vai tro.
│  └─ Cau hinh hanh dong
│     Router: /cau-hinh-hanh-dong
│     Noi dung: cau hinh action tai tung buoc, outcome, form, quyen xu ly, reconcile BPMN.
│
├─ Van hanh & Tich hop
│  ├─ Giam sat tien trinh
│  │  Router: /giam-sat
│  │  Noi dung: theo doi instance quy trinh, buoc dang chay, loi luong, thoi gian xu ly.
│  ├─ Tich hop he thong
│  │  Router: /tich-hop
│  │  Noi dung: trang thai tich hop QLNS, mua sam, SAP, QLTS, PLM, Storage, CRM.
│  └─ Nhat ky
│     Router: /nhat-ky
│     Noi dung: event log, audit trail, lich su dong bo, loi tich hop, hanh vi he thong.
│
├─ Danh muc & Quan tri he thong
│  ├─ Co cau to chuc
│  │  Router: /co-cau-to-chuc
│  │  Noi dung: don vi, phong ban, cay to chuc, don vi chu tri/phoi hop.
│  ├─ Nguoi dung
│  │  Router: /nguoi-dung
│  │  Noi dung: tai khoan, ho so nguoi dung, chuc danh, don vi, trang thai.
│  ├─ Phan quyen
│  │  Router: /phan-quyen
│  │  Noi dung: vai tro, nhom quyen, quyen theo chuc nang/quy trinh/buoc xu ly.
│  └─ Danh muc nghiep vu
│     Router: chua co
│     Noi dung: loai nhiem vu, linh vuc nghien cuu, nguon kinh phi, trang thai, loai san pham, loai hoi dong.
│
└─ Huong dan su dung
   Router: /tro-giup
   Noi dung: tai lieu huong dan thao tac, quy trinh su dung, giai thich chuc nang.
```

## Router da co trong app hien tai

```text
/tong-quan
/viec-cua-toi
/quy-trinh
/quy-trinh/moi
/quy-trinh/:ma
/bieu-mau
/nhiem-vu
/nhiem-vu/moi
/nhiem-vu/:ma
/ho-so
/ho-so/:id
/co-cau-to-chuc
/nguoi-dung
/phan-quyen
/giam-sat
/tich-hop
/nhat-ky
/quan-ly-luat
/quan-ly-luat/:id
/ma-tran-phe-duyet
/cau-hinh-hanh-dong
/tro-giup
```

## Router nen uu tien bo sung

```text
/chu-truong-xet-duyet
/hoi-dong-tham-dinh
/thuc-hien-nhiem-vu
/dieu-chinh-nhiem-vu
/nghiem-thu
/quyet-toan
/san-pham-nghien-cuu
/bao-cao
/ho-so-phap-ly
/danh-muc-nghiep-vu
```

## Ghi chu sap xep menu

- `Tong quan` va `Viec cua toi` nen dat dau menu vi day la hai diem vao hang ngay cua nguoi dung.
- `Nghiep vu KHCN` nen la nhom chinh, phan anh day du vong doi tu chu truong, xet duyet, thuc hien, dieu chinh, nghiem thu, quyet toan den san pham nghien cuu.
- `Quan ly luat nghiep vu`, `Ma tran phe duyet`, `Cau hinh hanh dong` nen tach khoi `Van hanh & Tich hop` va dua ve `Quy trinh & Cau hinh nghiep vu`, vi day la cau hinh logic nghiep vu va luong xu ly.
- `Thu vien bieu mau`, `Ho so phap ly`, `Quy trinh / Quy dinh`, `Tra cuu / Luu tru` nen gom vao nhom `Ho so, Tai lieu & Luu tru` de nguoi dung nghiep vu tim tai lieu va ho so phap ly de hon.
- `Danh muc nghiep vu` can bo sung de quan ly cac tap gia tri dung chung nhu loai nhiem vu, linh vuc nghien cuu, nguon kinh phi, loai san pham, loai hoi dong.
