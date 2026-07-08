# Review va ke hoach nang cap popup Them luat hien thi action

Ngay review: 2026-07-08

Pham vi review:

- `webapp/src/pages/ApprovalMatrix.tsx`
- `webapp/src/components/ConditionBuilder.tsx`
- `webapp/src/components/AssignmentBuilder.tsx`
- `webapp/src/data/approvalMatrixAnalyzer.ts`

Yeu cau: review va lap ke hoach nang cap UI cho popup `Them luat anh xa` / hien thi action, khong sua code ung dung trong buoc nay.

## 1. Tong quan hien trang

Popup `Them luat anh xa` hien nam trong tab Ma tran cua `ApprovalMatrix.tsx`, dung Ant Design `Modal` + `Form`, va da duoc nang cap so voi form doc ban dau:

- Modal da co `width={1040}` va body scroll rieng bang `styles.body.maxHeight`.
- Noi dung da chia thanh 2 cot desktop:
  - Cot trai: `Thong tin luat`, `Dieu kien ap dung`, `Ket qua phan cong`.
  - Cot phai: `Preview luat` + `Kiem tra nhanh`.
- `ConditionBuilder` soan cay dieu kien AND/OR, ho tro nhom con, field/operator/value, va dien giai dieu kien realtime.
- `AssignmentBuilder` soan che do phan cong va danh sach dich phan cong theo nhom hoac nguoi cu the.
- Popup da co canh bao realtime trong `draftWarnings` cho cac truong hop:
  - Chua nhap ten luat.
  - Dieu kien rong, tuc rule khop moi ho so trong slot.
  - Condition leaf thieu value.
  - Chua co dich phan cong hop le.
  - Trung priority voi rule khac cung slot.
  - Co nguy co bi fallback wildcard uu tien cao hon che khuat, hoac wildcard moi che rule uu tien thap hon.
- Khi luu, `saveRule()` da chan condition thieu value va assignment khong co target hop le.

Ket luan hien trang: popup da qua giai doan "form cau hinh tho". UI hien tai da co bo cuc, preview va guardrail co ban. Phan nang cap tiep theo nen tap trung vao tinh ro rang cua action/assignment, kha nang doc nhanh tac dong cua rule, va canh bao conflict sau hon.

## 2. Diem manh can giu

- Bo cuc 2 cot dung huong: nguoi dung vua soan vua doc preview.
- Section hoa theo ngon ngu nghiep vu giup doc rule theo cau "Khi nao" -> "Thi ai xu ly" -> "Uu tien the nao".
- `draftWarnings` da dua loi ve som hon, khong doi den bang tong hop sau khi luu.
- `ConditionBuilder` va `AssignmentBuilder` tach rieng hop ly; chua can tach them abstraction lon neu chi polish UI.
- Analyzer o `approvalMatrixAnalyzer.ts` da co nen tang de tiep tuc day canh bao vao popup.

## 3. Van de UI con lai

### 3.1 Preview action chua noi thanh cau nghiep vu hoan chinh

Preview hien dang tach cac dong:

- Ten rule
- Khi dieu kien
- Thi phan cong
- Che do

Cach nay dung, nhung chua tao cam giac "day la action se xay ra". Nguoi dung van phai ghep slot, dieu kien, assignment mode va target bang mat.

De xuat:

- Them mot dong summary noi thanh cau:
  - "Khi slot la Tham dinh va dieu kien khop, he thong se giao action phe duyet cho Nhom Tham dinh theo che do Mot nguoi bat ky."
- Neu rule dang tat, preview can noi ro:
  - "Rule dang tat nen se khong sinh action trong runtime."
- Neu assignment rong, hien message gan action:
  - "Chua co action/nguoi nhan nen rule chua the tao cong viec phe duyet."

### 3.2 Assignment/action con hien nhu cau hinh, chua nhu ket qua hanh dong

`AssignmentBuilder` da co nhan nghiep vu hon, nhung UI van la tap hop Select + Segmented. Voi nguoi cau hinh, cau hoi chinh la "action nay se hien cho ai, theo cach nao".

De xuat:

- Doi section title tu `Ket qua phan cong` sang huong action ro hon, vi du:
  - `Action se hien cho ai`
  - `Nguoi/nhom nhan action`
- Trong preview, tach ro:
  - Action outcome: phe duyet/xu ly theo slot.
  - Target: nhom/nguoi nhan.
  - Resolution mode: mot nguoi bat ky / tat ca / lan luot.
- Neu target la GROUP, hien them hint:
  - "Runtime se resolve thanh candidateUsers theo thanh vien nhom va uy quyen."

### 3.3 Loi assignment rong chua gan truc tiep vao tung target row

`saveRule()` va `draftWarnings` da bat assignment khong hop le, nhung `AssignmentBuilder` chua tu highlight row da them ma chua chon nhom/nguoi.

De xuat:

- Cho `AssignmentBuilder` nhan props `issues` hoac `validate`.
- Neu target GROUP rong: hien `status="error"` tren Select role + text "Chon it nhat mot nhom".
- Neu target USER rong: hien `status="error"` tren Select user + text "Chon it nhat mot nguoi".
- Nut `Them dich phan cong` nen them row co focus vao Select moi.

### 3.4 Canh bao conflict trong popup moi o muc heuristic

`draftWarnings` da check trung priority va wildcard shadow. Tuy nhien `approvalMatrixAnalyzer.ts` dang phan tich toan bo rules da luu, con draft rule trong popup chua duoc dua vao analyzer nhu mot rule tam.

De xuat:

- Tao `draftRule` tu form + `condDraft` + `asgDraft`.
- Chay analyzer voi `rules` thay rule dang edit bang `draftRule`, hoac append neu tao moi.
- Hien canh bao gan popup theo 3 nhom:
  - Loi khong luu duoc.
  - Canh bao first-match / shadow.
  - Thong tin do phu fallback cua slot.

### 3.5 Thieu quick test/simulation trong chinh popup

Trang chinh da co panel Simulation. Khi dang soan rule, nguoi dung van phai luu/thoat de test tac dong voi context mau.

De xuat:

- Them compact "Thu voi ho so mau" trong cot preview, sau P1/P2.
- Mac dinh lay slot tu form, cho nhap nhanh `cap`, `loaiHoiDong`, `tongDuToan`.
- Hien:
  - Draft rule co match mau khong.
  - Neu khong phai rule nay, rule nao se thang theo priority.

### 3.6 Footer action cua modal co the ro hon

Nut `Luu` va `Huy` dung chuan, nhung popup cau hinh rule co rui ro cao hon form thuong.

De xuat:

- Disable nut Luu khi co error hard: thieu condition value, assignment rong, ten rong.
- Doi ok text theo trang thai:
  - Tao moi: `Them luat`
  - Sua: `Luu thay doi`
- Neu rule khop moi ho so va dang bat, confirm truoc khi luu:
  - "Rule nay se khop moi ho so trong slot. Ban co muon dung lam fallback khong?"

## 4. Ke hoach nang cap

### P1 - Lam ro preview action va wording

Muc tieu: nguoi dung doc cot phai la hieu action se hien cho ai va trong dieu kien nao.

Cong viec:

- Doi/bo sung title section assignment theo huong action.
- Them summary sentence trong `Preview luat`.
- Neu rule tat, preview hien tac dong runtime = khong ap dung.
- Hien action target theo card nho: Mode, Target, Priority, Enabled.
- Chuan hoa wording trong mode/target de giam thuat ngu ky thuat.

Ket qua mong doi:

- Preview doc nhu mot cau nghiep vu, khong chi la tong hop field.
- Giam nham lan giua "slot phe duyet" va "nhom/nguoi nhan action".

### P2 - Inline validation trong AssignmentBuilder

Muc tieu: loi nam dung o control can sua.

Cong viec:

- Them helper tinh issue theo tung `ApprovalTarget`.
- Truyen issue vao `AssignmentBuilder` hoac tinh local neu component du context.
- Gan `status="error"` cho Select GROUP/USER rong.
- Them help text ngan duoi row loi.
- Disable Save khi co hard error, giu message error khi user bam Save nhu fallback.

Ket qua mong doi:

- Khong con tinh huong user chi thay loi o preview/message ma khong biet row nao can sua.

### P3 - Dua analyzer vao draft popup

Muc tieu: canh bao first-match/chong che khuat ngay luc soan.

Cong viec:

- Tao util build `draftRule` tu form state.
- Chay `analyzeRules()` tren tap rules gom draft.
- Loc warning lien quan toi draft rule va slot hien tai.
- Hien canh bao theo muc do trong preview panel.
- Neu draft che cac rule uu tien thap hon, hien danh sach rule bi anh huong.

Ket qua mong doi:

- Nguoi cau hinh thay duoc tac dong cua priority truoc khi luu.
- Giam rule dung cu phap nhung sai thu tu.

### P4 - Quick simulation trong popup

Muc tieu: test nhanh "action co hien khong" voi context mau.

Cong viec:

- Them block compact trong preview: `Thu voi ho so mau`.
- Reuse logic `resolveApprovers()` voi rules tam co draft.
- Hien matched rule, skipped reason, approvers/action target.
- Neu draft khong thang, noi ro rule nao thang va vi sao.

Ket qua mong doi:

- BA/admin co the tu tin hon truoc khi luu rule.
- Popup tro thanh rule composer day du, khong chi form tao record.

### P5 - Preset va polish thao tac

Muc tieu: tang toc tao rule pho bien.

Cong viec:

- Them preset theo slot: Tham dinh, Phe duyet, Hoi dong.
- Them preset dieu kien: cap Tap doan, ngan sach lon hon nguong, loai hoi dong.
- Them preset target theo role hay dung.
- Nut them target focus vao field moi.
- Can nhac duplicate target/rule tu popup neu nhu cau lap lai cao.

Ket qua mong doi:

- Tao rule nhanh hon, it phai bat dau tu form rong.

## 5. Uu tien de lam gan nhat

Nen lam theo thu tu:

1. P1 - Preview action va wording: tac dong UX cao, rui ro code thap.
2. P2 - Inline validation assignment: giam loi cau hinh that.
3. P3 - Analyzer tren draft: dung nen tang san co, nang chat luong rule.
4. P4 - Quick simulation: huu ich nhung can them UI va state, de sau khi guardrail on dinh.
5. P5 - Preset: polish/tang toc, khong phai blocker.

## 6. Acceptance criteria de kiem tra

- Tao rule moi rong: popup hien ro chua co ten, chua co target/action hop le, nut luu bi chan.
- Them target GROUP nhung chua chon role: row do duoc highlight loi tai cho.
- Rule khong co condition: preview noi ro day la fallback/khop moi ho so.
- Rule dang tat: preview noi ro khong anh huong runtime.
- Trung priority cung slot: preview canh bao ten rule dang trung.
- Wildcard priority cao hon: rule bi shadow duoc canh bao truoc khi luu.
- Sua rule hien co: analyzer khong tu so sanh rule voi chinh no.
- Man hinh hep: cot preview xep doc duoi form, khong bi overflow ngang.

## 7. Ket luan

Popup hien tai da co nen tot: modal rong, section ro, preview realtime, validation co ban va canh bao draft. Huong nang cap dung nhat la day UI tu "form cau hinh rule" thanh "rule/action composer": preview noi thanh cau, assignment hien nhu action runtime, loi gan dung control, va analyzer/simulation chay ngay tren draft truoc khi luu.
