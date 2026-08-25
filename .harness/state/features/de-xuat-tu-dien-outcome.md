# Đề xuất — Từ điển outcome trong Danh mục nút

> **Trạng thái:** ĐÃ TRIỂN KHAI phần A + B (2026-08-25, owner Claude) — backend + Angular, test xanh,
> **chưa chạy thử trên stack sống**. Ba ngoại lệ ở mục 7 vẫn TREO.
> **Ngày đề xuất:** 2026-08-24 · **Nguồn:** phiên thiết kế với BA/PM (tiếp nối phiên 2026-08-22
> giải thích cơ chế nút → Camunda).
> **Đụng decision nào:** không. Xem mục "Quan hệ với D10" bên dưới.

---

## 1. Vấn đề

Việc ánh xạ **từ khoá outcome trong BPMN** → **mã nút** đang nằm cứng trong mã nguồn:
[`BpmnOutcomeCodes.actionCode()`](../../../backend/src/main/java/vn/vht/qtkhcn/service/BpmnOutcomeCodes.java)
là một `switch` gồm đúng 17 chữ (`submit`, `gui`, `gui_duyet`, `tiep_tuc`, `approve`, `dong_y`,
`dat`, `phe_duyet`, `dong_y_bo_sung`, `return`, `hieu_chinh`, `yeu_cau_hieu_chinh`, `tra_lai`,
`reject`, `khong_dong_y`, `khong_dat`, `tu_choi`).

Khách vẽ BPMN bằng từ ngữ của họ. Ai ghi `= ketQua = "thong_qua"` thì rơi vào `default -> null`,
kéo theo dây chuyền:

| Hệ quả | Vị trí |
|---|---|
| `reconcile` bỏ qua nhánh → `scaffold` không sinh luật hiển thị | `ActionStudioService.java:482`, `:535` |
| `actionVariables` không tạo mục (`if (actionCode != null)`) | `DeployedBpmnRoutingReader.java:200` |
| `supports()` fail-closed cho RETURN_STEP không thấy nhánh | `WorkflowTaskActionRouting.java:57` |

**Kết quả cuối:** màn Chi tiết Hồ sơ không có nút nào để bấm. Nhánh tồn tại trên bản vẽ nhưng
không ai đi tới được. Cách chữa duy nhất hiện nay là **sửa Java và deploy lại backend** — trái
với mục tiêu "vẽ BPMN mới rồi chạy hết luồng mà không sửa Java" mà Lát 3 đã đặt ra.

## 2. Đề xuất

Hai phần, đi kèm nhau.

### Phần A — Mỗi nút khai được **nhiều** từ khoá outcome

Trong màn **Danh mục nút** (Action Studio), mỗi mã nút có một danh sách từ khoá BPMN mà nó nhận:

```
APPROVE_STEP  ←  [dong_y, dat, phe_duyet, approve, thong_qua, nhat_tri]
RETURN_STEP   ←  [hieu_chinh, tra_lai, yeu_cau_hieu_chinh, return]
REJECT_STEP   ←  [khong_dong_y, khong_dat, tu_choi, reject]
SUBMIT        ←  [submit, gui, gui_duyet, tiep_tuc]
```

BA tự thêm từ khoá, không cần lập trình viên. Đây chính là 17 chữ cứng ở trên, chuyển từ mã
nguồn ra dữ liệu.

### Phần B — Màn Đối soát **tự đề xuất** từ khoá chưa ai nhận

Không bắt BA gõ lại chữ mà máy vừa đọc được. Khi đối soát thấy một nhánh có từ khoá không nút
nào nhận, hiển thị dòng gợi ý kèm nút chấp nhận một chạm:

> ⚠️ RD07 · Task_4 · nhánh `thong_qua` chưa nút nào nhận — đề xuất **Đồng ý duyệt**
> (nhánh đi tiếp tới "Ký duyệt") · `[Chấp nhận]` `[Chọn nút khác…]`

App **đã có sẵn** tín hiệu để đoán: `kind` của nhánh, suy từ node đích tại
[`DeployedBpmnRoutingReader.java:163-168`](../../../backend/src/main/java/vn/vht/qtkhcn/service/DeployedBpmnRoutingReader.java).

| Nhánh đi tới đâu | `kind` | Đề xuất |
|---|---|---|
| Node kết thúc, nhãn chứa "khong"/"tu_choi" | `reject` | `REJECT_STEP` |
| Quay lại một user task **trước đó** | `rework` | `RETURN_STEP` |
| Đi tiếp / node kết thúc bình thường | `forward` · `complete` | `APPROVE_STEP` |

## 3. Điểm quan trọng nhất: mảng KHÔNG đổi gói gửi Camunda

Đây là chỗ dễ hiểu ngược nhất, phải ghi rõ trong mọi tài liệu phái sinh.

Tại một nhánh BPMN có hai câu hỏi tách rời:

| Câu hỏi | Ai trả lời |
|---|---|
| Nhánh này thuộc về nút nào? | **Mảng từ khoá** (đề xuất này) |
| Bấm nút thì gửi biến gì, giá trị gì? | **Chính nhánh đó trên bản vẽ** — không đổi |

Chiều gửi vẫn nguyên như hôm nay: `Map.of(branch.variable(), branch.outcome())`
([`DeployedBpmnRoutingReader.java:202`](../../../backend/src/main/java/vn/vht/qtkhcn/service/DeployedBpmnRoutingReader.java)),
cả tên biến lẫn giá trị đều bốc nguyên văn từ `conditionExpression` của nhánh đó. **Không bao giờ
gửi cả mảng. Không lấy phần tử đầu mảng. Không tra ngược danh mục để lấy giá trị.**

Cùng một nút `APPROVE_STEP`, ba bước khác nhau gửi ba thứ khác nhau:

| Bước | Nhánh trong BPMN | Gửi cho Camunda |
|---|---|---|
| RD07 · Task_4 | `= ketQuaXetDuyet = "duyet"` | `{"ketQuaXetDuyet": "duyet"}` |
| RD07 · Task_9 | `= ketQuaKyDuyet = "phe_duyet"` | `{"ketQuaKyDuyet": "phe_duyet"}` |
| RD08 · T12 | `= ketQuaThamDinh = "dong_y"` | `{"ketQuaThamDinh": "dong_y"}` |

Mảng chỉ mở cánh cửa để gói đó được gửi.

## 4. Tại sao KHÔNG auto-fill thẳng vào danh mục

Đã cân nhắc và bác bỏ. Máy lấy được **chữ**, nhưng cái thiếu là **chữ đó thuộc nút nào** — thông
tin đó không nằm trong chuỗi ký tự.

1. **Đoán sai hỏng theo kiểu tệ nhất.** Nút hiện nhãn "Đồng ý duyệt", người dùng bấm, hồ sơ chạy
   vào nhánh từ chối. Không lỗi, không cảnh báo.
2. **Từ khoá là tài sản toàn cục.** Do ràng buộc UNIQUE, thêm `thong_qua` vào `APPROVE_STEP` là
   tuyên bố cho mọi quy trình, kể cả chưa vẽ. Hành động tự động ở RD07 đổi hành vi của RD09.
3. **Audit mất tác giả.** Danh mục nút có `@Version` + `action_studio_audit`; bản ghi do máy tự
   thêm thì sáu tháng sau không ai giải thích được vì sao nó ở đấy.

Nguyên tắc: **máy đề xuất, người chốt** — cùng tinh thần `FEEL_VARIABLE_EQUALS` đã theo (điều
kiện viết phức tạp quá thì ẩn nút chứ không đoán bừa tên biến).

## 5. Thiết kế dữ liệu

Bảng con, **không** phải CSV trong một cột:

```sql
CREATE TABLE action_studio_action_outcome (
    keyword     VARCHAR(64) PRIMARY KEY,          -- UNIQUE toàn cục, bắt buộc
    action_code VARCHAR(64) NOT NULL REFERENCES action_studio_action(action_code),
    ...
);
```

`keyword` là khoá chính vì **một từ khoá chỉ được thuộc đúng một nút**. Nếu không ràng buộc, ta
tái tạo đúng cái bẫy `putIfAbsent` nuốt nhánh lặng lẽ — chỉ khác là lần này do BA gõ nhầm.

**Cột `outcome` cũ để yên, không tận dụng lại.** Nó đang lẫn hai nghĩa: seed V10 ghi `'APPROVE'`,
`'RETURN'` (nhãn kết quả trừu tượng), seed V20 ghi `'dong_y_bo_sung'` (từ khoá BPMN thật). Tận
dụng lại là mang cả sự lẫn lộn đó sang.

**Sửa kèm — lỗi hiển thị lộ ra từ chính sự lẫn lộn này:** `ActionStudio.tsx:432-433` so
`branch.outcome === def.outcome`, tức so `"dong_y"` (từ khoá thật trên nhánh) với `"APPROVE"`
(giá trị trong danh mục) → không bao giờ khớp, màn hình báo *"Chưa có nhánh routing cho outcome
APPROVE"* dù nhánh có tồn tại. Báo động giả này biến mất khi so đúng bảng từ khoá.

**Đường đọc phải chịu tải và không được sập.** `BpmnOutcomeCodes.actionCode()` nằm trên đường
người dùng bấm nút. Chuyển sang tra DB thì phải có cache + giữ bảng cứng làm mặc định khi tra
hụt — cùng tinh thần "quy trình chưa deploy trả map rỗng thay vì ném".

## 6. Phạm vi — cái KHÔNG làm

- **Không mở rộng tập mã nút.** Vẫn đúng 4 mã. Xem mục 8.
- **Không đổi `isOutcomeAction`** (đang là tập cứng 4 mã). Nếu đổi thành "có ≥1 từ khoá thì là
  nút rẽ nhánh" thì `APPROVE_WITH_SUPPLEMENT` — đang nằm trong danh mục seed V20 nhưng vĩnh viễn
  không hiện — **tự động sống dậy**, tức tập mã nút thực tế thành 5. Đó là mở tập mã nút bằng
  cửa sau.
- **Không ảnh hưởng RD01_01 và RD02_02.** Hai quy trình này không đi đường suy từ BPMN; chúng
  vẫn nằm trong bảng cứng `switch` tại `WorkflowTaskActionRouting.java:82-88`, **cố ý**, vì có
  sắc thái BPMN không nói ra được (Task_6 của RD01.01 duyệt bằng `dong_y_bo_sung` chứ không phải
  `dong_y`). Phải ghi rõ trong yêu cầu, nếu không người kiểm thử sẽ thử ngay trên RD01.01 và kết
  luận tính năng hỏng.
- **`SUBMIT` gần như vô can.** Nó không đi qua `WorkflowTaskActionRouting` (tập `ACTIONS` chỉ có
  `APPROVE_STEP`/`RETURN_STEP`/`REJECT_STEP`); `SUBMIT` khởi tạo tiến trình qua
  `DossierActionService.execute()` → `POST /api/ho-so/{id}/submit`, không hoàn tất user task nào
  nên không có gateway để rẽ. Với `SUBMIT`, mảng từ khoá chỉ còn tác dụng hiển thị/đối soát.

## 7. Ngoại lệ tạm gác — chưa thiết kế, đừng để rơi

Có chủ ý gác lại để giữ đề xuất gọn. Phải xử lý trước khi code:

1. **Node không dùng từ khoá nào trong mảng.** `actionVariables` trả rỗng → vẫn gửi 3 biến truy
   vết, không có biến rẽ nhánh. Đúng với lưu đồ tuyến tính; với node **có gateway** thì hồ sơ rơi
   vào default flow hoặc `CONDITION_ERROR`, im lặng. Đây là khiếm khuyết #4 (chưa có kiểm "biến
   ngã ba cần nhưng không ai cung cấp") — mảng từ khoá khiến nó dễ xảy ra hơn vì BA tưởng đã khai
   đủ.
2. **Hai từ khoá cùng một nút xuất hiện trên cùng một ngã ba.** Ví dụ Task_6 có cả nhánh
   `"dong_y"` lẫn `"duyet"`. `putIfAbsent` giữ nhánh vẽ trước, nhánh còn lại **vĩnh viễn không đi
   tới được, không báo lỗi**. Rủi ro này đã tồn tại (`dong_y` và `dat` là đồng nghĩa cứng) nhưng
   khi mảng do BA gõ thì nó thành chuyện thường ngày. → Đối soát bắt buộc phải có dòng cảnh báo
   *"≥2 nhánh tại cùng gateway cùng ánh xạ về một nút"*.
3. **Sửa/xoá từ khoá khi có hồ sơ đang chạy dở** — hỏng im lặng, cùng loại với bẫy "bảng tra đọc
   từ phiên bản mới nhất đã đồng bộ, không phải phiên bản hồ sơ đang chạy". Danh mục đã có
   `@Version` + audit nhưng chưa có cảnh báo lúc sửa.

## 8. Quan hệ với D10 — KHÔNG đụng

D10 điểm 1 khoá **"a small, fixed, semantic set of outcome actions — `SUBMIT`, `APPROVE_STEP`,
`RETURN_STEP`, `REJECT_STEP`"**. Đề xuất này giữ nguyên đúng 4 mã đó; nó chỉ mở rộng **tập từ ngữ
BPMN được nhận diện về 4 mã ấy**. Số nút người dùng thấy không đổi, ngữ nghĩa không đổi.

Phần B còn là mở rộng thuận chiều của **D10 điểm 5** (Đồng bộ/Đối soát với coverage check
🔴/🟡/⚪): thêm một loại dòng mới vào đúng cơ chế đã khoá.

**Chặn riêng, không nằm trong đề xuất này:** thêm mã nút mới (`POSTPONE_STEP`,
`APPROVE_WITH_CONDITION`…) đụng thẳng D10 và cần người ghi đè quyết định.

## 9. Việc còn phải làm trước khi ước lượng

- [ ] Chốt xử lý 3 ngoại lệ ở mục 7.
- [ ] Chốt luật chuẩn hoá từ khoá khi nhập (không dấu / chữ thường / không khoảng trắng?) và có
      tự chuẩn hoá hay chặn.
- [ ] Chốt hành vi khi BA xoá từ khoá cuối cùng của một nút.
- [ ] Viết thành user story + AC Given-When-Then, đưa vào backlog.

## 9b. Đã làm gì (2026-08-25)

**Backend** — `mvn -o test` **304/304 PASS**:

| Việc | Tệp |
|---|---|
| Bảng `action_studio_action_outcome` (`keyword` là PK) + seed nguyên văn 17 từ khoá cũ | `V37__action_outcome_keyword.sql` |
| Entity + repository | `domain/ActionOutcomeKeyword.java`, `repository/ActionOutcomeKeywordRepository.java` |
| Từ điển có cache, tra hụt rơi về bảng cứng | `service/OutcomeKeywordCatalog.java` |
| Đổi 2 đường tra sang từ điển | `DeployedBpmnRoutingReader:202`, `ActionStudioService.outcomeAction()` |
| Thêm/bỏ từ khoá, chặn trùng bằng 409 | `ActionStudioService.addOutcomeKeyword/removeOutcomeKeyword` |
| 2 endpoint `POST`/`DELETE .../actions/{code}/outcome-keywords` | `ActionStudioController` |
| Đề xuất nút cho dòng `UNMAPPED_BRANCH`, suy từ `kind` | `ActionStudioService.suggestedAction()` |

**Angular** — `tsc -b --noEmit` sạch, `ng build production` **GREEN**, `action-studio.service.spec.ts`
xanh:

- Cột **"Từ khoá BPMN"** trong tab Danh mục nút: thẻ đóng được + ô nhập, chỉ hiện với nút `STANDARD`.
- Tab Đối soát: thẻ đếm "chưa ánh xạ", và dòng `UNMAPPED_BRANCH` hiện đề xuất + `[Chấp nhận]` +
  `[Chọn nút khác…]`.

**Giữ đúng ràng buộc phạm vi:** `isOutcomeAction` vẫn là tập cứng 4 mã (D10); RD01_01/RD02_02 vẫn đi
bảng cứng — test `WorkflowTaskActionRoutingTest.bundledProcessesNeverConsultTheBpmnReader` đã phủ sẵn
hồi quy này (Task_6 vẫn `dong_y_bo_sung`).

**Còn nợ:** chưa chạy thử trên stack sống (mục Verification bước 3–4 của plan).

## 10. Liên quan

- Hai đề xuất còn lại của phiên 2026-08-22, **cũng chưa vào backlog**:
  - **B.** Khai "kiểu hành vi" cho nút tiện ích trong Danh mục nút: `MO_PANEL` / `TAI_TEP` /
    `MO_BIEU_MAU` / `GOI_API_GHI_DU_LIEU` (khiếm khuyết #2 — nút SUPPORT chưa có cơ chế thực thi).
  - **C.** Thêm mục "biến chưa có nguồn cung" vào màn Đối soát (khiếm khuyết #4). Đề xuất này làm
    C rẻ đi đáng kể: khi tập từ khoá là dữ liệu, việc dò chỉ còn là một phép trừ tập hợp.
- Quyết định liên quan: `.harness/state/decisions.md` → D3, D10.
