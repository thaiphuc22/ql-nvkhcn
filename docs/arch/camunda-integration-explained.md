# Camunda 8 tích hợp & triển khai vào hệ thống QLNVKHCN — giải thích

> **Trạng thái:** F2 — tài liệu giải thích (bổ trợ `camunda-design.md`) · **Ngày:** 2026-07-03
> **Mục đích:** trả lời rõ *"Camunda được cài đặt và tích hợp vào hệ thống QL NV KHCN như thế nào"* cho team & khách.
> **Bối cảnh:** license Camunda 8 đã chốt (RESOLVED 2026-07-03). Giả định triển khai **Self-Managed** trên hạ tầng VHT
> (chờ khách xác nhận cuối — `OQ-CAM-DEPLOY`).
> **Quan hệ tài liệu:** `camunda-design.md` = ranh giới BPMN↔code (làm gì ở đâu). Tài liệu này = **topology triển khai + cơ chế kết nối** (nằm ở đâu, gọi nhau ra sao).

---

## 0. Điểm mấu chốt: Camunda 8 KHÔNG phải thư viện nhúng vào app

Hiểu lầm phổ biến nhất: "tích hợp Camunda" = thêm một thư viện vào code app (như thêm Ant Design). **Sai với Camunda 8.**

| | Camunda 7 (cũ) | **Camunda 8 (ta dùng)** |
|---|---|---|
| Engine | Thư viện Java **nhúng** trong app | **Hệ thống riêng (Zeebe)** chạy độc lập |
| Giao tiếp | Gọi hàm trong tiến trình | **Qua mạng** (gRPC + REST) |
| Database | Chung DB với app | DB riêng của engine (Elasticsearch) |
| Vai trò app | App *chứa* engine | App là **client** của engine |

→ **Ta không "cài Camunda vào app". Ta dựng Camunda như một cụm dịch vụ riêng, rồi backend app gọi tới nó** — giống app gọi tới một database hay một API bên ngoài.

---

## 1. "Cài đặt" — Camunda 8 Self-Managed gồm những khối gì

Khách (có license) cài **một bộ nhiều container** lên hạ tầng của họ — thường qua **Helm chart `camunda-platform`** trên Kubernetes (hoặc docker-compose khi POC):

| Thành phần | Vai trò | Ta có gọi tới? |
|---|---|---|
| **Zeebe broker + Gateway** | LÕI: chạy BPMN, giữ trạng thái luồng. Mở cổng **gRPC** | ✅ Kênh 1-2-3 |
| **Operate** | UI/API giám sát instance, xử lý incident | ✅ Kênh 4 (REST) |
| **Tasklist** | API danh sách user task | ✅ Kênh 4 (REST) — ta gọi API, KHÔNG dùng UI (D2) |
| **Identity** | Ánh xạ user/role, quản client OAuth; nối SSO | ✅ (cấp client-id/secret cho BE) |
| **Connectors runtime** | (tuỳ license) chạy connector REST/SOAP cấu hình sẵn | ⚠️ tuỳ `OQ-CAM-COMPONENTS` |
| **Optimize** | (tuỳ) phân tích/BI luồng | ❔ tuỳ nhu cầu |
| **Elasticsearch / OpenSearch** | Nơi Operate/Tasklist lưu lịch sử luồng | ⛔ nội bộ cụm |
| **Web Modeler** | (tuỳ) BA/dev vẽ BPMN/DMN trên web | ❔ hoặc dùng Desktop Modeler |
| **Keycloak** | IdP nền cho Identity (hoặc nối SSO/IAM VHT sẵn có) | ✅ (BE xin token ở đây) |

> Đây chính là khối "**mua**". Frontend + Backend + DB nghiệp vụ là khối "**ta xây**".

---

## 2. Topology logic — Camunda nằm ở đâu so với app QLNVKHCN

```
   Trình duyệt (người dùng VHT)
          │  HTTPS
          ▼
   ┌───────────────────────┐        SSO/OIDC        ┌──────────────┐
   │  Frontend QLNVKHCN     │◀─────────────────────▶│  IAM VHT /   │
   │  (React — webapp/)     │                        │  Keycloak    │
   └──────────┬────────────┘                        └──────────────┘
              │  REST API (của ta)
              ▼
   ┌────────────────────────────────┐   gRPC :26500   ┌──────────────────────┐
   │  Backend QLNVKHCN (ta viết)     │◀───────────────▶│   CỤM CAMUNDA 8       │
   │  • Zeebe client                 │   REST :8081    │   Zeebe/Operate/      │
   │  • Job workers (poll)           │◀── poll job ────┤   Tasklist/Identity   │
   │  • DB nghiệp vụ                 │                 └──────────┬───────────┘
   └──────────┬─────────────────────┘                            │ service task
              │                                                   ▼
              ▼                                    QLNS · MS · SAP · QLTS · PLM
   ┌──────────────────┐
   │ DB QLNVKHCN       │  ← NỘI DUNG đề tài/hồ sơ/phiếu ở ĐÂY, KHÔNG ở Camunda (D3)
   └──────────────────┘
```

**3 khối ta xây (Frontend, Backend, DB nghiệp vụ) + 1 khối mua (cụm Camunda) mà ta chỉ kết nối tới.**

---

## 3. Sơ đồ deploy Self-Managed cụ thể trên Kubernetes VHT

Giả định VHT cấp 1 cụm K8s nội bộ. Tách **namespace** theo trách nhiệm; mọi thứ gọi nhau **trong cụm** qua service DNS, chỉ ra ngoài khi gọi hệ nghiệp vụ cũ.

```
                                  Internet nội bộ VHT
                                          │  HTTPS 443
                                          ▼
                          ┌───────────────────────────────┐
                          │   Ingress Controller (VHT)     │   TLS termination
                          │   *.qtkhcn.vht.local           │
                          └───┬───────────┬───────────┬────┘
             app.qtkhcn…      │  api.qtkhcn…           │ sso.vht.local
                     ┌────────▼─────┐ ┌───▼──────────┐ │
   ┌═════════════════│ ns: qlnvkhcn │ │              │ │   ┌═══════════════════┐
   ║ (ứng dụng TA XÂY)└──────────────┘ │              │ │   ║ ns: iam           ║
   ║                                    │              │ └──▶║  keycloak (SVC)   ║
   ║  ┌─────────────┐   ┌──────────────▼───────────┐  │     ║  (IdP / SSO VHT)  ║
   ║  │ frontend     │   │ backend-qlnvkhcn         │  │     └═══════════════════┘
   ║  │ (nginx+React)│   │ (Spring Boot)            │  │            ▲ OAuth token
   ║  │ Deployment   │   │  • Zeebe client (gRPC)   │──┼────────────┘  (client-credentials)
   ║  └─────────────┘   │  • Job workers (poll)    │  │
   ║                     │  • REST API cho FE       │  │  gRPC :26500 / REST :8081
   ║  ┌─────────────┐   └───────────┬──────────────┘  │            │
   ║  │ postgres     │◀──────────────┘ (DB nghiệp vụ)  │            ▼
   ║  │ StatefulSet  │                                 │   ┌═══════════════════════════┐
   ║  │ (hồ sơ,phiếu)│                                 │   ║ ns: camunda (KHÁCH CÀI)   ║
   ║  └─────────────┘                                 │   ║                           ║
   ╚══════════════════════════════════════════════════│   ║  zeebe-gateway (SVC:26500)║
                                                       │   ║  zeebe-broker (StatefulSet)║
   ┌──────────────────────────────────────────────┐   │   ║  operate     (SVC:8081)   ║
   │  Hệ nghiệp vụ cũ (ngoài cụm, trong DC VHT)     │   │   ║  tasklist    (SVC:8082)   ║
   │  SAP · PLM · QLNS · MS · QLTS                 │◀──┘   ║  identity    (SVC:8084)   ║
   │  ▲ job worker BE gọi ra (egress)             │       ║  connectors  (tuỳ license)║
   └──────────────────────────────────────────────┘       ║  elasticsearch(StatefulSet)║
                                                           ║  web-modeler (tuỳ)        ║
                                                           ╚═══════════════════════════╝
```

**Đọc sơ đồ:**
- **`ns: qlnvkhcn`** — khối ta xây: `frontend`, `backend-qlnvkhcn`, `postgres` (DB nghiệp vụ).
- **`ns: camunda`** — khối khách cài từ Helm chart (cụm engine + Elasticsearch). Ta **không** deploy khối này, chỉ **kết nối tới** qua service DNS nội cụm, vd `zeebe-gateway.camunda.svc.cluster.local:26500`.
- **`ns: iam`** — Keycloak (hoặc nối thẳng SSO/IAM sẵn có của VHT). BE xin token ở đây.
- **Hệ nghiệp vụ cũ** nằm **ngoài** cụm K8s (trong data center VHT) — job worker của BE gọi ra (egress).

**Ai deploy cái gì:**

| Khối | Ai deploy | Cách |
|---|---|---|
| `ns: camunda` + Elasticsearch | **Khách** (có license) | Helm `camunda/camunda-platform` |
| `ns: iam` Keycloak | Khách / hạ tầng VHT | Helm hoặc dùng IAM VHT sẵn |
| `ns: qlnvkhcn` (FE/BE/DB) | **Đội dự án (ta)** | Helm/manifest của dự án |
| Ingress, network policy | Hạ tầng VHT | — |

---

## 4. "Tích hợp" — BE nói chuyện với Camunda qua đúng 4 kênh

Tất cả nằm ở **backend**. FE không gọi thẳng Camunda.

| # | Kênh | Chiều | Giao thức | BE làm gì |
|---|---|---|---|---|
| 1 | **Deploy BPMN/DMN** | BE → Zeebe | gRPC | Đẩy file `.bpmn`/`.dmn` (vẽ ở Modeler) lên engine |
| 2 | **Tạo instance** | BE → Zeebe | gRPC | Mở hồ sơ mới: `createProcessInstance("RD01.01", {maHoSo})` |
| 3 | **Job worker** | Zeebe → BE (BE **poll**) | gRPC | Worker nhận job `sap:sync-budget` → chạy logic → `completeJob`/`throwError` |
| 4 | **Query task/instance** | BE → Operate/Tasklist | REST | Lấy "việc của tôi", trạng thái luồng để hiện UI |

> **Kênh 3 đảo chiều:** không phải app gọi Camunda, mà **Camunda giao việc, worker của ta poll & làm**. Đây là cách gọi QLNS/SAP/PLM. Chính là các "job worker" ở màn *Tích hợp hệ ngoài* (mockup).

---

## 5. Cơ chế xác thực — OAuth2 client-credentials (KHÔNG phải user/password)

Camunda 8 Self-Managed bảo vệ mọi endpoint bằng **OAuth2** qua Identity/Keycloak:

```
1. Khách cài Camunda → trong Identity tạo 1 "application" cho BE ta
   → cấp: client-id (vd qlnvkhcn-backend) + client-secret
2. BE khởi động → tự gọi Keycloak với client-id/secret → nhận access token (JWT)
3. BE đính "Authorization: Bearer <token>" vào MỌI lời gọi gRPC (Zeebe) + REST (Operate)
4. Token hết hạn → thư viện client tự xin lại (tự động)
```

→ "BE gọi sang Camunda thế nào" = **cầm client-id/secret → lấy token → gọi gRPC/REST**. Không hard-code mật khẩu người dùng.

---

## 6. Code minh hoạ (stack BE chưa chốt — F2; Camunda hỗ trợ hạng nhất Java/Spring)

```yaml
# application.yaml — thông tin KHÁCH BÀN GIAO sau khi cài
zeebe.client:
  broker.gateway-address: zeebe-gateway.camunda.svc.cluster.local:26500
  security.plaintext: false
  cloud.identity:
    auth-url:   https://sso.vht.local/realms/camunda/protocol/openid-connect/token
    client-id:  qlnvkhcn-backend
    client-secret: ${ZEEBE_CLIENT_SECRET}   # trong K8s Secret, KHÔNG commit
    audience:   zeebe-api
```

```java
// Kênh 2 — mở hồ sơ mới → tạo process instance
zeebeClient.newCreateInstanceCommand()
    .bpmnProcessId("RD01.01").latestVersion()
    .variables(Map.of("maHoSo", "HS-2026-050", "cap", "CS"))   // CHỈ ID + biến điều khiển (D3)
    .send();

// Kênh 3 — job worker: Camunda giao việc, worker của ta gọi SAP
@JobWorker(type = "sap:sync-budget")
public void syncBudget(ActivatedJob job) {
    String maHoSo = (String) job.getVariablesAsMap().get("maHoSo");
    sapClient.syncBudget(maHoSo);          // ← logic nghiệp vụ của TA
    // return bình thường = completeJob; lỗi nghiệp vụ = throw BpmnError → BPMN rẽ nhánh
}
```

```
// Kênh 4 — hiện Worklist / Giám sát (REST + Bearer token)
GET https://operate.camunda… /v1/process-instances/search   (lọc theo maHoSo / trạng thái)
```

> BE là **Node/.NET/Python** cũng chạy được (`@camunda8/sdk`, `zeebe-client-csharp`, `pyzeebe`), nhưng **Spring Zeebe mượt nhất** (annotation `@JobWorker`, auto-deploy). → đưa vào cân nhắc khi chốt ngôn ngữ BE ở **F2**.

---

## 7. Đi bộ qua 1 request thật — RD01.01

```
1. NNC bấm "Tạo hồ sơ" ở Frontend
2. Backend lưu hồ sơ vào DB nghiệp vụ (maHoSo = HS-2026-050)
3. Backend → Zeebe: createProcessInstance("RD01.01", { maHoSo, cap:"CS" })   [kênh 2]
4. Zeebe chạy BPMN → dừng ở user task "Ký duyệt cấp TT/Khối", giao candidateGroup=BGĐ
5. BGĐ đăng nhập (SSO) → FE → Backend → query Tasklist "task nhóm BGĐ"       [kênh 4]
   → hiện ở Worklist "Việc của tôi"
6. BGĐ bấm duyệt → Backend → Zeebe completeJob(task) → luồng đi bước sau       [kênh 3]
7. Gặp service task "Đồng bộ QLNS" → Zeebe tạo job → job worker BE poll thấy   [kênh 3]
   → gọi API QLNS (egress) → completeJob → luồng đi tiếp
8. … tới cuối: Backend sinh QĐ + ký số (nghiệp vụ, ở app), cập nhật DB "Đã duyệt"
```

Camunda chỉ lo **"đang ở bước nào, giao ai, rẽ nhánh nào"**; mọi thao tác **với dữ liệu** ở **backend ta** (ranh giới BPMN↔code — `camunda-design.md` mục 5).

---

## 8. Mạng & firewall (giải toả lo lắng thường gặp)

- Kênh 3 (job worker) là **long-poll**: BE **chủ động gọi ra** hỏi Zeebe "có việc không?".
- ⇒ BE chỉ cần **outbound** tới Zeebe Gateway (`:26500`) + Operate/Tasklist (`:8081/8082`) + Keycloak.
- ⇒ Zeebe **KHÔNG cần** mở ngược vào BE (khác webhook) — firewall đơn giản, không expose BE cho Camunda.
- Thực tế: BE và cụm Camunda **cùng cụm K8s VHT** → gọi qua service DNS nội bộ, không ra internet.
- **Egress** cần mở: từ `ns: qlnvkhcn` (job worker) tới SAP/PLM/QLNS/MS/QLTS trong DC VHT.

---

## 9. Checklist bàn giao (khách → đội dự án) để BE kết nối được

Đưa vào tài liệu chốt tích hợp với khách:

- [ ] Địa chỉ **Zeebe Gateway** (host:port) + có bật **TLS** không
- [ ] Base URL **Operate** và **Tasklist**
- [ ] **Keycloak token URL** (realm)
- [ ] **client-id + client-secret** (Identity tạo cho BE) + `audience`
- [ ] Đường mạng/firewall: nơi deploy BE → cụm Camunda đã thông chưa
- [ ] Egress: BE → SAP/PLM/QLNS/MS/QLTS đã mở chưa
- [ ] Bộ component có trong license (Connectors runtime? Web Modeler?) — `OQ-CAM-COMPONENTS`

---

## 10. Neo vào mockup đã dựng (webapp/)

| Màn mockup | Thực chất là kênh | Nguồn thật khi lên production |
|---|---|---|
| `/giam-sat` Giám sát tiến trình | Kênh 4 | Operate API (`/v1/process-instances`) |
| `/tich-hop` Tích hợp hệ ngoài | Tình trạng kênh 3 | Metrics job worker + health hệ ngoài |
| `/nhat-ky` Nhật ký sự kiện | Kênh 4 | Lịch sử Zeebe (Elasticsearch qua Operate) |

Ba màn đó là **phần "nhìn thấy được" của tích hợp**; phần "không nhìn thấy" (Zeebe client, job worker, deploy BPMN) là code backend **F5**.

---

## 11. Việc còn treo (liên kết OQ)

- `OQ-CAM-DEPLOY` — xác nhận Self-Managed (giả định của tài liệu này) vs SaaS.
- `OQ-CAM-COMPONENTS` — bộ license kèm Connectors/Web Modeler/Identity → quyết định kênh gọi hệ ngoài (connector cấu hình vs job worker tay).
- Ngôn ngữ **backend** (F2) — ảnh hưởng ergonomics client (Java/Spring hạng nhất).
- `OQ-021` — giao thức SSO/IAM VHT (OIDC/SAML) để nối Identity/Keycloak.
