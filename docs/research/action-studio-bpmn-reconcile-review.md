# Review Man Hinh /cau-hinh-hanh-dong - Tab Doi Soat BPMN

Ngay review: 2026-07-08

Pham vi: chi review va dua ra nhan xet, ke hoach nang cap cho man `/cau-hinh-hanh-dong`, tab `Doi soat BPMN`. Khong coding.

## Nhan Xet Chinh

### 1. Ten tab "Doi soat BPMN" dang hoi vuot qua nang luc that

Logic hien khong parse `bpmnXml`; nguon "BPMN" dang la `proc.taskSteps` + `ROUTING_TABLES` trong `webapp/src/data/bpmnReconcile.ts`. Vi vay tab dang doi soat "bang buoc/routing mock", chua doi soat BPMN that.

Tac dong:

- Nguoi dung co the hieu rang he thong da doc BPMN XML tu Camunda/modeler.
- Neu `bpmnXml` thay doi nhung `taskSteps` hoac `ROUTING_TABLES` chua cap nhat, tab van co the bao xanh/gold sai.
- Cac gateway, sequence flow, default flow, conditionExpression trong BPMN that chua duoc kiem chung truc tiep.

### 2. Pham vi doi soat rat hep

`reconcilableProcesses()` chi lay `Object.keys(ROUTING_TABLES)`, trong khi `ROUTING_TABLES` hien chi co `RD01.01`. Trong `seedProcesses` lai co nhieu quy trinh co `bpmnXml` nhu `RD01.02`, `RD02.01`.

Tac dong:

- Summary "dang doi soat n quy trinh" de gay cam giac da phu het cac BPMN dang co.
- Cac quy trinh co BPMN XML nhung chua co routing table bi loai khoi check, khong co canh bao ro rang.

### 3. Doi soat chua kiem tra quyen/vai tro du sau

Scaffold de `allowedRoleCodes: []` voi quy uoc "theo candidateGroups cua buoc", nhung resolver hien tai lai hieu role rong la "moi vai tro". `conditionExpression` chi la text minh hoa, chua evaluate.

Tac dong:

- Tab co the bao on ve action/form/task-specific nhung policy chua thuc su khoa dung candidate group.
- Rui ro runtime: nut hien cho nhieu vai tro hon y nghiep vu neu API/engine khong bo sung gate candidateGroups o tang khac.

### 4. "Bo qua co chu dich" chi la state tam

Switch skip nam trong state local cua `ReconcileTab`. Refresh trang la mat. Health summary o tab "Luat hien thi nut" goi `summarizeReconcileHealth(seedProcesses, policies)` khong truyen skip, nen trang thai giua hai noi co the lech.

Tac dong:

- Admin co the danh dau bo qua trong tab reconcile, nhung quay ve tab khac van thay canh bao.
- Khong co reason, nguoi tao, thoi diem, process version, hay audit cho mot quyet dinh bo qua.

### 5. UX hien huu tot cho demo, nhung thieu kha nang hanh dong

Diem tot:

- Co mau trang thai ro: ok, generic, unfilled, missing, skipped.
- Tooltip giai thich ly do.
- Scaffold id tat dinh, chay lai khong de trung.
- Co orphan warning cho policy tro task khong con trong quy trinh.

Han che:

- Chua co filter theo trang thai.
- Chua co diff truoc/sau khi bam dong bo.
- Chua drill-down duoc policy nao dang thang vi first-match.
- Chua export report cho BA/admin.
- Chua co mapping truc quan giua BPMN node id va policy id.

## Ke Hoach Nang Cap

### Dot 1 - Lam ro ngu nghia hien tai

Muc tieu: tranh hieu nham khi demo/van hanh.

- Doi wording tu "doc BPMN" thanh "doi soat theo bang buoc/routing mock" neu chua parse XML that.
- Hien badge canh bao: "Chua parse BPMN XML".
- Trong dropdown quy trinh, tach cac trang thai:
  - Co BPMN XML + co routing table.
  - Co BPMN XML nhung chua co routing table.
  - Co routing table nhung khong co BPMN XML.
- Summary nen noi ro so quy trinh bi bo qua va ly do.

### Dot 2 - Nang doi soat thanh BPMN XML thật

Muc tieu: tab dung voi ten "Doi soat BPMN".

- Parse `bpmnXml` de lay:
  - `bpmn:userTask`
  - `zeebe:AssignmentDefinition.candidateGroups`
  - outgoing sequence flow
  - gateway sau task
  - `conditionExpression`
  - default flow
- Tao model trung gian: `BpmnTaskCoverageSource`.
- So sanh `taskSteps` voi BPMN user task:
  - task key thieu trong BPMN
  - BPMN user task chua map sang taskStep
  - ten/vai tro/form bi lech
- Neu parse loi, hien loi parse theo process version thay vi im lang loai khoi doi soat.

### Dot 3 - Kiem tra policy sau hon

Muc tieu: phat hien sai cau hinh truoc runtime.

- Check action coverage theo tung `task x outcome`.
- Check `formKey` bat buoc theo action/outcome.
- Check `candidateGroups`/role:
  - policy role rong co duoc phep khong?
  - role policy co subset/superset so voi BPMN candidateGroups khong?
- Check permission:
  - `SUBMIT` can `SUBMIT_DOSSIER`
  - `APPROVE/RETURN/REJECT` can `PROCESS_STEP`
- Check first-match conflict:
  - policy wildcard co displayOrder nho hon policy task-specific khong?
  - duplicate policy cung dieu kien co gay ambiguity khong?
- Check orphan theo process version, khong chi theo process code hien hanh.

### Dot 4 - Bien skip thanh cau hinh co audit

Muc tieu: quyet dinh "bo qua" co can cu va nhat quan.

- Skip theo cap `processCode + version + taskKey + outcome`.
- Bat buoc nhap reason khi skip.
- Luu metadata:
  - createdBy
  - createdAt
  - approvedBy neu can
  - expiresAt neu la skip tam thoi
- Health summary va tab reconcile dung chung mot nguon skip.
- Hien skip nhu mot exception cua compliance, khong chi la toggle local.

### Dot 5 - Nang UX thanh cong cu admin that

Muc tieu: admin co the ra quyet dinh nhanh va an toan.

- Filter nhanh: Thieu action, Luat chung, Thieu bieu mau, Orphan, Skipped.
- Them diff preview truoc khi dong bo:
  - se them policy nao
  - se update policy nao
  - co policy nao dang bi che boi displayOrder
- Drill-down moi outcome:
  - actionCode
  - matched policy id
  - ly do match
  - formKey
  - role/permission
- Export report Markdown/CSV.
- Them tong quan theo process version.

## Ket Luan

Tab hien tai la mot mock/demo tot cho y tuong pull-based reconcile va fail-closed action availability. Tuy nhien, neu dung cho van hanh that, uu tien lon nhat la chuyen nguon doi soat tu `taskSteps + ROUTING_TABLES` sang parse `bpmnXml`, sau do bo sung check role/permission, skip co audit, va diff truoc khi sync.
