# EPIC 09 — Business Rule Management: Thiết kế triển khai bằng DMN Camunda 8

> **Trạng thái**: Design (giai đoạn mock, chưa có backend/Zeebe). Không phải feature-work đụng
> foundation — đây là tài liệu chốt hướng.
> **Liên quan**: mở rộng [`configuration-service.md`](./configuration-service.md) (EPIC09) và
> [`configuration-service-EPIC09.md`](./configuration-service-EPIC09.md); tuân theo decision
> **D3** (Camunda chỉ giữ biến điều khiển) và **D5** (DMN cho quyết định cấu trúc) trong
> `.harness/state/decisions.md`.

---

## 1. Mục tiêu & phân vai

EPIC09 giải bài toán **Decision** ("Điều gì đúng/sai? Hệ thống phải làm gì?"), **tách bạch**
với EPIC06 — Approval Matrix, vốn giải bài toán **Routing** ("Task tiếp theo thuộc về ai?").

| | EPIC 09 — Business Rule | EPIC 06 — Approval Matrix |
|---|---|---|
| Bài toán | Decision | Routing |
| Trả lời | Điều gì đúng/sai | Ai xử lý tiếp |
| Output | Decision / Value / Result | Approver / Step |
| Cơ chế Camunda | **DMN Decision Table / DRD** | User task + candidate group |
| Phạm vi gọi | Bất kỳ đâu (workflow **và** app UI) | Trong User Task |
| Tần suất đổi | Theo chính sách nghiệp vụ | Theo cơ cấu tổ chức |

Lý do tách: nếu nhét rule vào Approval Matrix, sau 1–2 năm hệ thống có hàng trăm rule lẫn
trong ma trận, sửa một ngưỡng phải đụng toàn bộ ma trận. Tách ra thì đổi chính sách chỉ sửa
DMN, ma trận đứng yên.

## 2. Ba quyết định thiết kế đã chốt

| # | Chốt | Nội dung |
|---|---|---|
| **A. Authoring** | DMN XML deployed = **single source of truth** | Pha 1: nhúng `dmn-js` (họ `bpmn-js` đã dùng) + chrome tiếng Việt. Pha 2: layer Custom Rule Builder sinh **cùng** DMN XML. Dù soạn đường nào, execution đồng nhất vì đều compile về DMN. |
| **B. Eval** | Ưu tiên **standalone `EvaluateDecision`** | Service do app kiểm soát: đọc business data từ DB app → eval DMN → chỉ set **output** (biến điều khiển) vào process. Business data **không** vào Camunda (giữ D3 sạch). Chỉ dùng Business Rule Task native khi input vốn đã là biến điều khiển. |
| **C. Scope P1** | 2 decision "hero" | Chứng minh end-to-end BPMN → DMN → Gateway → Approval Matrix trên RD02. |

## 3. Map mô hình Rule (EPIC09) → khái niệm DMN

| EPIC09 | DMN Camunda 8 |
|---|---|
| Rule Set | Decision (một Decision Table) |
| Condition | Input column |
| Action / Result | Output column |
| 1 Rule | 1 dòng (rule row) |
| Expression | FEEL expression |
| Cách gộp nhiều rule khớp | **Hit Policy** (UNIQUE / FIRST / COLLECT / ...) |
| Rule chồng rule | **DRD** (Decision Requirements Diagram) — output decision này là input decision kia |
| Rule Version | Deployment versioning của Zeebe (binding = versionTag) |
| Rule Test / Simulation | `EvaluateDecision` trên bộ input mẫu |

## 4. DRD hero — "Định tuyến thẩm định RD02"

Một DRD 3 mắt xích; output mắt trước là input mắt sau. Đánh giá **một lần** trả cả ba output.

### ① `capNhiemVu` — phân cấp CS/TĐ · Hit Policy `FIRST`

| tongDuToan (number) | **cap** (output) |
|---|---|
| `>= 10_000_000_000` | `"TD"` |
| `-` | `"CS"` |

### ② `canHoiDong` — có cần Hội đồng không · Hit Policy `FIRST`

| cap | tongDuToan (number) | **canHoiDong** (output) |
|---|---|---|
| `"TD"` | `-` | `true` |
| `"CS"` | `>= 5_000_000_000` | `true` |
| `-` | `-` | `false` |

### ③ `loaiHoiDong` — hội đồng nào · Hit Policy `UNIQUE`

| cap | canHoiDong | **loaiHoiDong** (output) |
|---|---|---|
| `"TD"` | `true` | `"HD_KHCN_TD"` |
| `"CS"` | `true` | `"HD_CS"` |
| `-` | `false` | `"KHONG"` |

> **⚠️ OQ-008**: các ngưỡng `10 tỷ` / `5 tỷ` là **placeholder**. Nghiệp vụ chốt con số sau, sửa
> thẳng trong bảng — không đụng BPMN. Giá trị output dùng slug ASCII không dấu để so sánh FEEL
> an toàn (đồng bộ quy ước `variableContract.ts`).

## 5. Impact lên `variableContract.ts`

Output của DMN = biến điều khiển ⇒ **phải khai báo ở contract trước** (kỷ luật §5.2 camunda-design).

| Biến | Loại | Miền giá trị | Ghi chú |
|---|---|---|---|
| `cap` | string | `CS` / `TD` | **Đã có** — nay là output của `capNhiemVu` |
| `canHoiDong` | boolean | — | **THÊM MỚI** |
| `loaiHoiDong` | string | `HD_KHCN_TD` / `HD_CS` / `KHONG` | **THÊM MỚI** |

`tongDuToan` (tổng dự toán) là **business data — KHÔNG** thêm vào contract. Nó chỉ được truyền
vào lúc eval (input DMN) rồi bỏ; process không lưu.

## 6. Luồng end-to-end trên RD02

```
Submit hồ sơ RD02
      │
      ▼
[Service task] app đọc tongDuToan từ DB app
      │  gọi EvaluateDecision(DRD "capNhiemVu")     ← eval cả 3 mắt xích một lần
      ▼
Process nhận về: cap, canHoiDong, loaiHoiDong        (CHỈ output — không có tongDuToan)
      │
      ▼
Gateway: canHoiDong = true ?
      │ true                                 │ false
      ▼                                      ▼
[Approval Matrix — EPIC06] resolve HĐ         User Task duyệt thẳng
theo loaiHoiDong
      ▼
Multi-instance "HĐ KHCN ký" (quorum → quorumDat)
```

- **DMN** trả lời "có cần làm gì không" (`canHoiDong`, `loaiHoiDong`).
- **Approval Matrix (EPIC06)** trả lời "nếu cần, ai làm".
- Hai EPIC tách bạch, không lẫn lộn.

## 7. Ranh giới DMN vs Code (vùng xám — không ép mọi rule vào DMN)

| Nếu… | Đặt ở | Ví dụ |
|---|---|---|
| Hàm thuần của vài input scalar, nghiệp vụ tự sửa | **DMN** | `budget > X → canHoiDong`, phân cấp CS/TĐ, suy Đạt/Chưa đạt |
| Cần join nhiều bảng / side-effect / gọi hệ ngoài | **Code (service rule)** | đếm phiếu nhận xét, đối chiếu dự toán SAP, kiểm tra kế hoạch năm |

Rule Builder **phân loại rule ngay lúc tạo**: "DMN-evaluable" (mở trình soạn bảng) vs "Service
rule" (chỉ khai báo interface, dev implement). Không cho business user gò rule cần DB lookup vào DMN.

## 8. Authoring pipeline (Pha 1)

```
[dmn-js editor trong webapp]  ──save──▶  DMN XML (artifact)
   (bọc chrome tiếng Việt)                    │
                                              ├─ mock now: lưu client/mock store
                                              └─ backend later: deploy vào Zeebe cluster
```

- Nguồn chuẩn = **DMN XML**. Custom Rule Builder (Pha 2) chỉ là UI thân thiện hơn, sinh **cùng**
  một DMN XML → không rẽ nhánh execution.
- Nhất quán với cách stack đã nhúng `bpmn-js` + properties-panel cho BPMN.

## 9. Test / Simulation

- **Mock now**: eval FEEL client-side bằng `feelin` (engine FEEL JS của Camunda) trên bộ input
  mẫu → hiển thị rule row nào fire + output.
- **Backend later**: chuyển sang server-side `EvaluateDecision`. **DMN XML và test fixtures giữ
  nguyên** — chỉ đổi nơi chạy eval.
- Test case (input mẫu → expected output) lưu như fixtures, tái dùng qua cả hai giai đoạn.

## 10. Versioning

- Zeebe đánh version mỗi lần deploy decision.
- **Binding = `versionTag`** (không `latest`): đổi ngưỡng `10 → 15 tỷ` ra bản mới, hồ sơ đang
  chạy giữ bản cũ. Đúng feature "Rule Version" của EPIC09; đảm bảo tính tái lập của quyết định
  đã ra trong quá khứ (audit).

## 11. Việc còn mở

| Vấn đề | Mã |
|---|---|
| Con số ngưỡng định tuyến vào DMN | OQ-008 |
| Deployment model Camunda (Self-Managed vs SaaS) — ảnh hưởng nơi deploy DMN + gọi `EvaluateDecision` | OQ-CAM-DEPLOY |
| Backend language/framework — ảnh hưởng SDK gọi `EvaluateDecision` | (F1 blocked) |

## 12. Bước triển khai (P1)

1. ✅ Thêm `canHoiDong`, `loaiHoiDong` vào `variableContract.ts`.
2. ✅ Prototype `dmn-js` + `feelin` cho 3 bảng hero: soạn bảng + Test Rule (mock) —
   trang `webapp/src/pages/RuleManager.tsx`.
3. ✅ Nối output DMN vào gateway BPMN RD02.01 — `webapp/src/data/rd0201Bpmn.ts`:
   Service Task `khcn.rule.evaluate-routing` (worker gọi `EvaluateDecision` trên DRD,
   set `cap`/`canHoiDong`/`loaiHoiDong`) → Exclusive Gateway rẽ trên `=canHoiDong = true`
   → nhánh "Hội đồng Xét duyệt" / bỏ qua. `loaiHoiDong` truyền sang Approval Matrix
   (EPIC06) chọn hội đồng. Đã validate import (bpmn-moddle) + lint 0 lỗi + build.
   Khi Zeebe thật sẵn sàng: giữ nguyên BPMN/DMN, chỉ hiện thực worker gọi gRPC.
4. (Sau) Custom Rule Builder (Pha 2) sinh cùng DMN XML.
