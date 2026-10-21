---
ma_srs: SRS-BPM-01
ten: Đồng bộ quy trình từ Camunda
nhom: Quản trị quy trình
version: 0.1
tac_gia: BA-AI
ngay_tao: 2026-08-05
trang_thai: Nháp
nhap_cho_vts: false
oq_lien_quan: [OQ-QTKHCN-001, OQ-QTKHCN-002]
blueprint_nguon: "docs/arch/api-camunda-dong-bo-quy-trinh.md, docs/ba-document/Sync-process-from-Camunda/sequence-dong-bo-quy-trinh-tu-camunda.md"
---

# TÀI LIỆU THIẾT KẾ CHI TIẾT (SRS)
## THIẾT KẾ CHI TIẾT TÍNH NĂNG ĐỒNG BỘ QUY TRÌNH TỪ CAMUNDA

**Phân hệ**: Quản trị quy trình (BPM Platform / Action Studio)

### Bảng ghi nhận thay đổi
| Phiên bản | Ngày | Tác giả | Nội dung thay đổi |
|---|---|---|---|
| 0.1 | 2026-08-05 | BA-AI | Khởi tạo bản thảo SRS pilot cho tính năng Đồng bộ Quy trình từ Camunda theo chuẩn Harness QTKHCN (D12–D18) |

### Trang ký
| Vai trò | Người thực hiện | Chức danh | Ngày ký | Chữ ký |
|---|---|---|---|---|
| Người lập | BA-AI | Business Analyst | 2026-08-05 | |
| Người kiểm tra | | BA Lead / Tech Lead | | |
| Người phê duyệt | | Product Owner | | |
| Đại diện khách hàng | | VTS / VTIT | | |

### Mục lục
- [1. GIỚI THIỆU](#1-giới-thiệu)
  - [1.1 Mục đích](#11-mục-đích)
  - [1.2 Phạm vi](#12-phạm-vi)
  - [1.3 Khái niệm và thuật ngữ](#13-khái-niệm-và-thuật-ngữ)
  - [1.4 Tài liệu tham khảo](#14-tài-liệu-tham-khảo)
  - [1.5 Mô tả tài liệu](#15-mô-tả-tài-liệu)
- [2. TỔNG QUAN GIẢI PHÁP](#2-tổng-quan-giải-pháp)
  - [2.1 Tổng quan chức năng](#21-tổng-quan-chức-năng)
  - [2.2 Mô hình giao tiếp với module/hệ thống khác](#22-mô-hình-giao-tiếp-với-modulehệ-thống-khác)
- [3. THIẾT KẾ CHI TIẾT](#3-thiết-kế-chi-tiết)
  - [3.1 Đồng bộ quy trình từ Camunda](#31-đồng-bộ-quy-trình-từ-camunda)
    - [3.1.1 Thông tin chung chức năng](#311-thông-tin-chung-chức-năng)
    - [3.1.2 Màn hình](#312-màn-hình)
    - [3.1.3 Mô tả chi tiết các thành phần](#313-mô-tả-chi-tiết-các-thành-phần)
    - [3.1.4 Luồng nghiệp vụ](#314-luồng-nghiệp-vụ)
    - [3.1.5 Quy tắc nghiệp vụ](#315-quy-tắc-nghiệp-vụ)
- [4. THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG](#4-thiết-kế-dùng-chung-và-tái-sử-dụng)
  - [4.1 Thông báo và phản hồi người dùng](#41-thông-báo-và-phản-hồi-người-dùng)
  - [4.2 Quy tắc xử lý giao tiếp hệ thống & Idempotency](#42-quy-tắc-xử-lý-giao-tiếp-hệ-thống--idempotency)
  - [4.3 Phân quyền và bảo mật](#43-phân-quyền-và-bảo-mật)
- [5. THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU](#5-thiết-kế-đảm-bảo-tuân-thủ-tiêu-chuẩn-quản-trị-dữ-liệu)
  - [5.1 Chất lượng dữ liệu](#51-chất-lượng-dữ-liệu)
  - [5.2 Lịch sử và khả năng truy vết](#52-lịch-sử-và-khả-năng-truy-vết)
  - [5.3 Phân quyền và kiểm soát truy cập](#53-phân-quyền-và-kiểm-soát-truy-cập)
  - [5.4 Vòng đời và lưu trữ dữ liệu](#54-vòng-đời-và-lưu-trữ-dữ-liệu)
  - [5.5 Dữ liệu cá nhân](#55-dữ-liệu-cá-nhân)
  - [5.6 Quản trị dữ liệu](#56-quản-trị-dữ-liệu)
  - [5.7 Kiến trúc & tích hợp dữ liệu](#57-kiến-trúc--tích-hợp-dữ-liệu)
- [6. PHỤ LỤC](#6-phụ-lục)
  - [6.1 Mẫu tệp nhập và xuất dữ liệu](#61-mẫu-tệp-nhập-và-xuất-dữ-liệu)
  - [6.2 Đề xuất bổ sung thiết kế cơ sở dữ liệu](#62-đề-xuất-bổ-sung-thiết-kế-cơ-sở-dữ-liệu)
  - [6.3 Danh mục điểm chờ xác nhận](#63-danh-mục-điểm-chờ-xác-nhận)
  - [6.4 Phụ thuộc module/dữ liệu khác](#64-phụ-thuộc-moduledữ-liệu-khác)

---

## 1. GIỚI THIỆU

### 1.1 Mục đích
Tài liệu SRS này mô tả thiết kế chi tiết cho tính năng **Đồng bộ Quy trình từ Camunda** thuộc phân hệ Quản trị quy trình (BPM Platform / Action Studio) trong hệ thống Quản lý Nhiệm vụ Khoa học và Công nghệ (QTKHCN).

Tính năng này cho phép Quản trị viên hệ thống hoặc Business Analyst (BA) chủ động rút danh sách các Định nghĩa quy trình (Process Definition / BPMN XML) đang triển khai trên engine Camunda 8 (thông qua Web Modeler, `zbctl`, hoặc CI/CD pipeline bên ngoài) về cơ sở dữ liệu Catalog quy trình của ứng dụng QTKHCN. Nhờ đó, ứng dụng có thể ngay lập tức sử dụng các quy trình này để khởi tạo hồ sơ, cấu hình luồng duyệt và sinh tự động các chính sách hiển thị Action (Scaffolding Availability Policy).

### 1.2 Phạm vi
- **Bao gồm**:
  - Giao diện người dùng tại màn `/quy-trinh` (Danh mục quy trình) cho phép bấm nút "Đồng bộ từ Camunda" và xem kết quả đồng bộ chi tiết.
  - API nội bộ `POST /api/process-definitions/sync-from-camunda` xử lý quét và nhập quy trình.
  - Tích hợp với REST API Orchestration Cluster v2 của Camunda 8 (`POST /v2/process-definitions/search` và `GET /v2/process-definitions/{key}/xml`).
  - Ghi nhận Catalog quy trình (`catalog`) và các phiên bản (`process_definition_version`) với thuộc tính nguồn `EXTERNAL`.
  - Cơ chế tự động phát sự kiện `ProcessDeployedEvent` để sinh khung luật hiển thị Action (Policy Scaffolder) sau khi commit transaction thành công (`AFTER_COMMIT`).
- **Không bao gồm**:
  - Tính năng thiết kế hoặc chỉnh sửa sơ đồ BPMN trực tiếp trên ứng dụng (thuộc màn BPMN Editor / Action Studio).
  - Tự động chạy ngầm theo định kỳ (Background Cron Job) hoặc tự động đồng bộ khi khởi động (Push-on-startup), nhằm tránh làm ô nhiễm Catalog quy trình rác từ môi trường thử nghiệm.

### 1.3 Khái niệm và thuật ngữ
| Thuật ngữ / Chữ viết tắt | Diễn giải |
|---|---|
| **Camunda 8 / C8** | Engine điều phối quy trình (Orchestration Engine) dựa trên kiến trúc microservices (Zeebe, Operate, Tasklist). |
| **BPMN XML** | Định dạng XML tiêu chuẩn quốc tế biểu diễn sơ đồ quy trình nghiệp vụ. |
| **Process Definition Key** | Khoá số nguyên 64-bit tự tăng do Camunda Engine định danh duy nhất cho một phiên bản quy trình deployed. |
| **BPMN Process ID** | Mã định danh dạng chuỗi (ví dụ: `rd0202`, `RD01.01`) do người thiết kế BPMN đặt trong thuộc tính `id` của thẻ `<bpmn:process>`. |
| **Catalog Quy trình** | Bảng quản lý danh mục quy trình nghiệp vụ của ứng dụng QTKHCN, gom nhóm nhiều phiên bản quy trình theo `bpmnProcessId`. |
| **Pull-based Sync** | Cơ chế đồng bộ do người dùng chủ động kích hoạt qua thao tác bấm nút, không đẩy dữ liệu ngầm. |
| **Idempotency** | Tính chất đảm bảo khi thực hiện đồng bộ nhiều lần với cùng một trạng thái trên Camunda Engine thì kết quả CSDL trong ứng dụng không bị tạo bản ghi trùng lặp. |
| **Policy Scaffolder** | Thành phần tự động duyệt sơ đồ BPMN XML để tạo sẵn khung luật hiển thị nút bấm (Action Availability Policy) tương ứng với từng User Task và Outcome Gateway. |

### 1.4 Tài liệu tham khảo
1. `docs/arch/api-camunda-dong-bo-quy-trinh.md` — Tài liệu API chi tiết Use case Đồng bộ Quy trình từ Camunda.
2. `docs/ba-document/Sync-process-from-Camunda/sequence-dong-bo-quy-trinh-tu-camunda.md` — Sơ đồ trình tự Sequence Diagram Đồng bộ Quy trình.
3. `.harness/rules/srs-definition-of-done.md` & `.harness/rules/srs-screen-template.md` — Chuẩn trình bày SRS theo Harness QTKHCN (D12–D18).
4. Camunda 8 Orchestration Cluster REST API Documentation (v8.9.12).

### 1.5 Mô tả tài liệu
Tài liệu bao gồm 6 mục chính:
- **Mục 1**: Giới thiệu tổng quan, phạm vi và thuật ngữ.
- **Mục 2**: Tổng quan giải pháp và Mô hình giao tiếp tích hợp.
- **Mục 3**: Thiết kế chi tiết màn hình, luồng nghiệp vụ và quy tắc nghiệp vụ cho tính năng Đồng bộ Quy trình từ Camunda.
- **Mục 4**: Các quy định thiết kế dùng chung và tái sử dụng.
- **Mục 5**: Tiêu chuẩn đảm bảo Quản trị dữ liệu (7 khía cạnh bắt buộc).
- **Mục 6**: Phụ lục kỹ thuật, CSDL, OQ Tracker và Phụ thuộc Module.

---

## 2. TỔNG QUAN GIẢI PHÁP

### 2.1 Tổng quan chức năng
Tính năng "Đồng bộ Quy trình từ Camunda" đóng vai trò làm cầu nối (Seam A) giữa Engine Camunda 8 và Cơ sở dữ liệu Catalog của ứng dụng QTKHCN. Giải pháp được thiết kế theo các nguyên tắc cốt lõi:
1. **Chủ động kích hoạt (Pull-based)**: Người dùng có vai trò Quản trị viên hoặc BA bấm nút "Đồng bộ từ Camunda" tại danh mục quy trình `/quy-trinh`.
2. **Chỉ lấy bản mới nhất (`isLatestVersion = true`)**: Tối ưu dung lượng lưu trữ và tránh kéo lịch sử phiên bản cũ không dùng tới.
3. **Idempotent theo `camundaProcessDefinitionKey`**: Nếu một phiên bản quy trình đã được kéo về trước đó, hệ thống sẽ bỏ qua (`alreadyKnown`) mà không tạo thêm dòng mới.
4. **Cô lập giao dịch (`REQUIRES_NEW`)**: Mỗi phiên bản quy trình được xử lý trong một transaction riêng biệt. Nếu 1 quy trình bị lỗi lưu XML hoặc trùng khoá, hệ thống chỉ ghi nhận lỗi cho quy trình đó (`failures[]`) và vẫn tiếp tục đồng bộ thành công các quy trình còn lại.
5. **Kích hoạt tự động Policy Scaffolding (`AFTER_COMMIT`)**: Sau khi phiên bản BPMN mới được lưu thành công vào CSDL, hệ thống phát sự kiện `ProcessDeployedEvent` để tự động tạo khung luật Action cho các bước xử lý mà không làm rủi ro đứt gãy giao dịch nhập quy trình.

### 2.2 Mô hình giao tiếp với module/hệ thống khác
Sơ đồ dưới đây thể hiện luồng giao tiếp giữa Angular Frontend, Spring Boot Backend Controller/Service, CSDL QTKHCN và Cụm Camunda 8 Orchestration Cluster theo chuẩn Mermaid Flowchart (D18):

```mermaid
flowchart TD
    subgraph Frontend["Angular Frontend (Web Client)"]
        FE["ProcessCatalogComponent\n(/quy-trinh)"]
        SVC["ProcessDefinitionService\n(HttpClient)"]
    end

    subgraph Backend["Spring Boot Backend (QTKHCN Service)"]
        CTRL["ProcessDefinitionController\n(/api/process-definitions/sync-from-camunda)"]
        IMP["DeployedProcessImportService\n(Orchestrator)"]
        LKP["CamundaProcessDefinitionLookup\n(Camunda Client Java SDK)"]
        WR["DeployedProcessImportWriter\n(Transaction REQUIRES_NEW)"]
        SCF["DeployedProcessPolicyScaffolder\n(Listener AFTER_COMMIT)"]
    end

    subgraph External["Camunda 8 Platform"]
        C8["Camunda 8 Engine\n(Orchestration Cluster REST /v2)"]
    end

    subgraph Database["Relational Database"]
        DB[("DB Catalog\n(catalog + process_definition_version)")]
    end

    FE -- "1. Bấm 'Đồng bộ từ Camunda'" --> FE
    FE -- "2. syncFromCamunda()" --> SVC
    SVC -- "3. POST /api/process-definitions/sync-from-camunda\n[Header: X-QTKHCN-Actor]" --> CTRL
    CTRL -- "4. syncFromCamunda(actor)" --> IMP
    IMP -- "5. listLatest(500)" --> LKP
    LKP -- "6. POST /v2/process-definitions/search\n{ filter: { isLatestVersion: true }, page: { limit: 500 } }" --> C8
    C8 -- "7. Trả về danh sách Definition + totalItems" --> LKP
    LKP -- "8. DeployedProcessPage" --> IMP
    
    loop Đối với từng Quy trình chưa có trong DB Catalog
        IMP -- "9. fetchXml(processDefinitionKey)" --> LKP
        LKP -- "10. GET /v2/process-definitions/{key}/xml" --> C8
        C8 -- "11. Trả về BPMN XML thô" --> LKP
        IMP -- "12. write(definition, bpmnXml, actor)" --> WR
        WR -- "13. INSERT/UPDATE catalog & version (source=EXTERNAL)" --> DB
        WR -- "14. Publish ProcessDeployedEvent" --> SCF
        SCF -- "15. Scaffold Action Availability Policy (AFTER_COMMIT)" --> DB
    end

    IMP -- "16. Trả về ProcessSyncResponse\n(scanned, imported, alreadyKnown, failures, warnings)" --> CTRL
    CTRL -- "17. HTTP 200 OK + JSON Response" --> FE
    FE -- "18. Cập nhật Banner & Reload Tab 'Đã deploy'" --> FE
```

---

## 3. THIẾT KẾ CHI TIẾT

### 3.1 Đồng bộ quy trình từ Camunda

#### 3.1.1 Thông tin chung chức năng
- **Tác nhân**: Quản trị viên hệ thống (`ROLE_ADMIN`), Quản trị quy trình (`ROLE_PROCESS_ADMIN`), Business Analyst (`ROLE_BA`).
- **Ý nghĩa chức năng**: Cho phép người quản trị chủ động rút danh sách các định nghĩa quy trình (BPMN) mới nhất đang có trên Camunda 8 Engine về lưu trữ tại CSDL hệ thống QTKHCN, cập nhật danh mục quy trình có thể khởi tạo hồ sơ, đồng thời sinh khung cấu hình luật Action nút bấm.
- **Nền tảng**: Web Application.
- **Đường dẫn truy cập**: Menu **Quản trị quy trình** > **Danh mục quy trình** (`/quy-trinh`).
- **Ràng buộc, ngoại lệ**:
  - Chỉ quét tối đa 500 quy trình/lượt (`MAX_SCAN = 500`). Nếu trên Camunda Engine có số lượng quy trình lớn hơn 500, hệ thống sẽ trả về Cảnh báo (`warnings[]`) yêu cầu người dùng thực hiện lại lượt tiếp theo.
  - Trường hợp Engine Camunda bị ngắt kết nối, ngắt mạng hoặc phản hồi lỗi 401/403/500 toàn bộ, hệ thống trả về thông báo lỗi tổng thể và không thay đổi dữ liệu CSDL.

> **Ghi chú**
> - Nguồn thiết kế: `docs/arch/api-camunda-dong-bo-quy-trinh.md`, `docs/ba-document/Sync-process-from-Camunda/sequence-dong-bo-quy-trinh-tu-camunda.md`.
> - Trạng thái OQ: `OQ-QTKHCN-001` (Cấu hình quyền Service Account đọc Camunda) & `OQ-QTKHCN-002` (Xử lý phân trang `hasMoreTotalItems` khi vượt 500 quy trình).

#### 3.1.2 Màn hình
| STT | Tên màn hình / Khối giao diện | Mô tả tại mục | Ghi chú |
|---|---|---|---|
| 1 | Xem danh sách quy trình & Nút Đồng bộ | 3.1.3.1 | Màn hình `/quy-trinh` chính |
| 2 | Khối thông báo kết quả đồng bộ (Result Banner / Toast) | 3.1.3.2 | Hiển thị sau khi API đồng bộ hoàn tất |

#### 3.1.3 Mô tả chi tiết các thành phần

##### 3.1.3.1 Xem danh sách quy trình & Kích hoạt đồng bộ
![HÌNH 001 – Màn hình Danh mục quy trình và Nút Đồng bộ từ Camunda](img/SRS-BPM-01/001-danh-muc-quy-trinh.png)
*(Hình ảnh mô phỏng vị trí nút bấm và tab Danh mục quy trình)*

| STT | Tên | Kiểu dữ liệu [Độ dài dữ liệu] | Input/Output | Giá trị khởi tạo | Mô tả (Mapping với CSDL nếu có) | Ghi chú |
|---|---|---|---|---|---|---|
| **Thanh thao tác (Header Bar)** | | | | | | |
| 1 | Tiêu đề trang | Label | Output | "Danh mục Quy trình" | Tiêu đề phân hệ Quản trị quy trình | |
| 2 | Đồng bộ từ Camunda* | Button | Input | Enabled | Nút bấm kích hoạt đồng bộ. Khi bấm: đổi trạng thái `syncing = true`, vô hiệu hoá nút, hiển thị spinner | Icon Sync. Bắt buộc kiểm tra quyền `ROLE_PROCESS_ADMIN` hoặc `ROLE_ADMIN` |
| 3 | Tạo quy trình mới | Button | Input | Enabled | Mở drawer/modal tạo quy trình thủ công | Chức năng riêng |
| **Thanh tìm kiếm & Bảng dữ liệu** | | | | | | |
| 4 | Từ khoá tìm kiếm | Textbox [100] | Input | Blank | Tìm kiếm theo Tên quy trình hoặc Mã BPMN Process ID | Kiểu so khớp: Chứa, không phân biệt hoa/thường |
| 5 | Tab "Tất cả" | Tab | Input | Active | Hiển thị toàn bộ quy trình trong CSDL catalog | |
| 6 | Tab "Đã deploy" | Tab | Input | Inactive | Hiển thị các quy trình có ít nhất 1 version ở trạng thái `DEPLOYED` | Tự động active tab này nếu lượt đồng bộ nhập mới > 0 quy trình |
| 7 | Cột Mã Quy trình | Label Column | Output | | Đổ dữ liệu từ `catalog.bpmn_process_id` | |
| 8 | Cột Tên Quy trình | Label Column | Output | | Đổ dữ liệu từ `catalog.name` | |
| 9 | Cột Version | Label Column | Output | | Nạp từ `process_definition_version.version` mới nhất | |
| 10 | Cột Nguồn | Tag Column | Output | | Giá trị `EXTERNAL` hiển thị tag tím "Camunda 8 Engine"; giá trị `IMPORTED` hiển thị tag xanh "Deploy ứng dụng" | Phân biệt nguồn nhập |
| 11 | Cột Ngày cập nhật | Label Column | Output | | Đổ dữ liệu từ `catalog.updated_at` (Định dạng `DD/MM/YYYY HH:mm`) | |

##### 3.1.3.2 Khối kết quả đồng bộ (Result Banner / Dialog)
![HÌNH 002 – Khối hiển thị thông báo kết quả Đồng bộ quy trình](img/SRS-BPM-01/002-ket-qua-dong-bo.png)

| STT | Tên | Kiểu dữ liệu [Độ dài dữ liệu] | Input/Output | Giá trị khởi tạo | Mô tả (Mapping với CSDL nếu có) | Ghi chú |
|---|---|---|---|---|---|---|
| **Banner tổng quan kết quả** | | | | | | |
| 1 | Banner Thông báo Đồng bộ | Alert Box | Output | Hidden | Hiển thị dạng Alert cố định phía trên bảng dữ liệu sau khi bấm đồng bộ | Loại alert: Success (khi `imported > 0`), Info (khi `imported = 0`), Warning (khi có `failures` hoặc `warnings`) |
| 2 | Tổng số đã quét | Label | Output | "0" | Hiển thị số lượng quy trình đã quét từ Camunda Engine (`ProcessSyncResponse.scanned`) | |
| 3 | Số quy trình nhập mới | Label | Output | "0" | Hiển thị số phiên bản quy trình mới đã ghi CSDL (`ProcessSyncResponse.imported`) | |
| 4 | Số quy trình đã biết | Label | Output | "0" | Hiển thị số quy trình đã có trùng `camundaProcessDefinitionKey` (`ProcessSyncResponse.alreadyKnown`) | |
| 5 | Nút Tải lại danh sách | Button | Input | Enabled | Tải lại danh sách quy trình phía dưới | Hiển thị khi `imported > 0` |
| **Khối Chi tiết Lỗi & Cảnh báo (khi có dữ liệu)** | | | | | | |
| 6 | Danh sách lỗi bản ghi | Accordion / List | Output | Collapsed | Liệt kê các quy trình không nhập được từ `ProcessSyncResponse.failures[]` | Cấu trúc từng dòng: `<bpmnProcessId>: <rootMessage>` |
| 7 | Thông báo cảnh báo | Alert Warning | Output | Hidden | Hiển thị thông điệp cảnh báo từ `ProcessSyncResponse.warnings[]` (ví dụ: cảnh báo vượt ngưỡng 500 quy trình) | |

#### 3.1.4 Luồng nghiệp vụ

##### Sơ đồ luồng xử lý đồng bộ quy trình từ Camunda

```mermaid
flowchart TD
    A[Bắt đầu: BA bấm 'Đồng bộ từ Camunda'] --> B[FE: Đổi nút sang trạng thái Syncing / Disable]
    B --> C[FE: Gọi POST /api/process-definitions/sync-from-camunda với Header X-QTKHCN-Actor]
    C --> D[Backend: Gọi Camunda REST API POST /v2/process-definitions/search]
    
    D -- Mạng lỗi / Timeout / 401 / 500 --> E[Backend: Throw ProcessImportException DEPLOYMENT]
    E --> F[FE: Bắt lỗi HTTP, hiển thị Toast Error 'Đồng bộ từ Camunda thất bại']
    F --> Z[Kết thúc luồng lỗi]

    D -- Trả về 200 OK --> G[Backend: Lấy danh sách items và totalItems từ Engine]
    G --> H{totalOnEngine > items.size()}
    H -- Đúng --> I[Ghi nhận Cảnh báo vào warnings array: Engine vượt ngưỡng MAX_SCAN 500]
    H -- Sai --> J[Bắt đầu duyệt từng Quy trình trong items]
    I --> J

    J --> K{Đã tồn tại key camundaProcessDefinitionKey trong CSDL?}
    K -- Đúng --> L[Tăng đếm alreadyKnown + 1, chuyển quy trình tiếp theo]
    K -- Chưa có --> M[Gọi GET /v2/process-definitions/{key}/xml lấy BPMN XML]
    
    M -- Lỗi nạp XML --> N[Thêm thông tin vào failures array: bpmnProcessId, message]
    M -- Thành công --> O[Mở Transaction REQUIRES_NEW]
    
    O --> P{Đã có bpmnProcessId trong bảng catalog?}
    P -- Đã có --> Q[UPDATE catalog: name, updated_at]
    P -- Chưa có --> R[INSERT catalog mới: newCatalog = true]
    Q --> S[INSERT process_definition_version: status=DEPLOYED, source=EXTERNAL, bpmn_xml]
    R --> S
    
    S --> T[Publish Event ProcessDeployedEvent]
    T --> U[Commit Transaction REQUIRES_NEW]
    U --> V[Tự động chạy Scaffolder sinh luật Action tại sự kiện AFTER_COMMIT]
    V --> W[Tăng đếm imported + 1 và lưu vào importedProcesses list]
    
    L --> X{Còn quy trình chưa duyệt?}
    N --> X
    W --> X
    
    X -- Còn --> J
    X -- Hết --> Y[Backend: Trả về HTTP 200 OK + ProcessSyncResponse]
    Y --> FE_RES[FE: Tắt Syncing, hiển thị Banner Kết quả & Refresh danh sách quy trình]
    FE_RES --> Z2[Kết thúc luồng thành công]
```

##### A. Luồng kích hoạt & Đồng bộ thành công

| Bước | Mô tả |
|---|---|
| 1 | Người dùng truy cập màn hình `/quy-trinh`, bấm nút **Đồng bộ từ Camunda**. |
| 2 | Hệ thống tại Frontend chuyển nút bấm sang trạng thái `syncing = true` (hiển thị spinner, vô hiệu hoá nút bấm) và xoá kết quả đồng bộ cũ. |
| 3 | Frontend phát yêu cầu `POST /api/process-definitions/sync-from-camunda` kèm theo thông tin mã/tên người thao tác tại HTTP Header `X-QTKHCN-Actor`. |
| 4 | Backend tiếp nhận yêu cầu, dịch mã actor và gọi `CamundaProcessDefinitionLookup.listLatest(500)` tới Camunda 8 Orchestration Cluster REST API `POST /v2/process-definitions/search` với tham số `isLatestVersion = true` và `limit = 500`. |
| 5 | Camunda 8 Engine trả về danh sách các Process Definition mới nhất cùng chỉ số tổng `totalItems`. |
| 6 | Backend khởi tạo bộ đếm kết quả (`scanned`, `imported`, `alreadyKnown`, danh sách `importedProcesses[]`, `failures[]`, `warnings[]`). |
| 7 | Với từng quy trình trong danh sách trả về từ Camunda Engine: <br>- Hệ thống kiểm tra trong bảng `process_definition_version` xem đã tồn tại `camundaProcessDefinitionKey` này chưa. <br>- **Nếu đã tồn tại**: Hệ thống tăng chỉ số `alreadyKnown` thêm 1 và bỏ qua quy trình này. <br>- **Nếu chưa tồn tại**: Backend gọi `GET /v2/process-definitions/{key}/xml` để lấy mã nguồn BPMN XML thô. |
| 8 | Backend mở một giao dịch cơ sở dữ liệu riêng độc lập (`@Transactional(propagation = Propagation.REQUIRES_NEW)`): <br>- Kiểm tra bảng `catalog` theo `bpmnProcessId`. Nếu đã có thì thực hiện `UPDATE` thông tin tên và ngày cập nhật; nếu chưa có thì `INSERT` bản ghi catalog mới. <br>- Thực hiện `INSERT` bản ghi mới vào bảng `process_definition_version` với `status = DEPLOYED`, `source = EXTERNAL`, `checksum_sha256`, `bpmn_xml` và `camunda_deployment_key = 0`. <br>- Gửi sự kiện nội bộ `ProcessDeployedEvent`. |
| 9 | Giao dịch commit thành công (`AFTER_COMMIT`), bộ lắng nghe sự kiện `DeployedProcessPolicyScaffolder` nhận `ProcessDeployedEvent` và tiến hành phân tích các User Task trong XML để sinh mặc định các khung luật Availability Policy cho nút bấm. |
| 10 | Tăng chỉ số `imported` thêm 1, bổ sung đối tượng vào danh sách `importedProcesses[]`. |
| 11 | Sau khi duyệt hết danh sách, Backend trả về HTTP `200 OK` chứa `ProcessSyncResponse`. |
| 12 | Frontend tắt trạng thái spinner `syncing = false`, hiển thị Banner Thông báo Kết quả đồng bộ (VD: *"Đã quét 27 quy trình, nhập mới 4 phiên bản, 23 phiên bản đã biết"*). Nếu số lượng nhập mới `imported > 0`, hệ thống tự động chuyển sang tab "Đã deploy" và tải lại danh sách quy trình. |

##### B. Luồng xử lý ngoại lệ kết nối Engine (Toàn lượt hỏng)

| Bước | Mô tả |
|---|---|
| 1 | Người dùng bấm nút **Đồng bộ từ Camunda**. |
| 2 | Backend gửi yêu cầu tìm kiếm tới Camunda 8 Engine. |
| 3 | Kết nối mạng bị gián đoạn, dịch vụ Camunda bị treo, phản hồi quá thời gian (Timeout), hoặc trả về mã lỗi HTTP `401 Unauthorized` / `403 Forbidden` / `500 Internal Server Error`. |
| 4 | `CamundaProcessDefinitionLookup` bắt ngoại lệ, trích xuất nguyên nhân gốc (Root cause) và ném ra lỗi `ProcessImportException(kind = DEPLOYMENT)`. |
| 5 | Giao dịch toàn cục thất bại, không có bất kỳ dữ liệu nào được ghi vào CSDL. Backend trả về cho Frontend HTTP Error response (mã `500` hoặc `503`). |
| 6 | Frontend bắt lỗi HTTP, chuyển trạng thái `syncing = false`, hiển thị thông báo lỗi màu đỏ (Toast Error): *"Đồng bộ từ Camunda thất bại. Không thể kết nối tới Camunda Engine. Vui lòng kiểm tra lại dịch vụ hệ thống."* |

##### C. Luồng xử lý lỗi từng bản ghi (`failures[]`) & Cảnh báo vượt trần (`warnings[]`)

| Bước | Mô tả |
|---|---|
| 1 | Trong quá trình lấy XML (`GET /v2/process-definitions/{key}/xml`) hoặc ghi dữ liệu (`REQUIRES_NEW`), một quy trình cụ thể bị lỗi (ví dụ: BPMN XML bị hỏng, lỗi vi phạm ràng buộc dữ liệu CSDL). |
| 2 | Lỗi RuntimeException của quy trình đó được bắt riêng tại vòng lặp. Giao dịch `REQUIRES_NEW` của quy trình đó tự động Rollback, không làm ảnh hưởng đến các quy trình đã nhập trước đó. |
| 3 | Backend bổ sung đối tượng lỗi vào danh sách `failures[]` bao gồm: `bpmnProcessId` và `message` mô tả lỗi chi tiết. Vòng lặp tiếp tục xử lý quy trình tiếp theo. |
| 4 | Trường hợp tổng số quy trình trên Engine `totalItems` lớn hơn ngưỡng quét 500 (`totalOnEngine > 500`), Backend bổ sung thông điệp vào danh sách `warnings[]`: *"Engine đang có {N} quy trình nhưng lượt này chỉ quét 500 quy trình — vui lòng chạy lại đồng bộ sau khi nhập xong đợt này."* |
| 5 | Khi kết thúc lượt, Backend vẫn trả về HTTP `200 OK` kèm theo mảng `failures[]` và `warnings[]`. |
| 6 | Frontend hiển thị Alert Box dạng Warning, kèm danh sách Accordion chi tiết các quy trình bị lỗi để BA/Quản trị viên biết và xử lý. |

#### 3.1.5 Quy tắc nghiệp vụ

| Mã quy tắc | Tên quy tắc / Nội dung chi tiết | Áp dụng cho | Trạng thái |
|---|---|---|---|
| `BR-BPM-SYNC-01` | **Pull-based Sync Only**: Đồng bộ quy trình là thao tác chủ động do Quản trị viên/BA kích hoạt bằng tay. Hệ thống tuyệt đối không tự động chạy ngầm (cronjob) hoặc chạy tự động khi khởi động app để tránh nạp dữ liệu rác từ Camunda. | Khối kích hoạt đồng bộ (3.1.3.1) | Chốt theo `docs/arch/api-camunda-dong-bo-quy-trinh.md` |
| `BR-BPM-SYNC-02` | **Key-based Idempotency**: Khoá nhận diện duy nhất phiên bản quy trình deployed trên Camunda là `camundaProcessDefinitionKey` (kiểu số int64). Nếu key này đã tồn tại trong bảng `process_definition_version`, hệ thống bắt buộc ghi nhận là "Đã biết" (`alreadyKnown`) và không tạo bản ghi trùng. | Luồng nhập CSDL (3.1.4) | Chốt theo `docs/arch/api-camunda-dong-bo-quy-trinh.md` |
| `BR-BPM-SYNC-03` | **Latest Version Filtering**: Bộ lọc gửi tới Camunda Engine bắt buộc chứa `isLatestVersion = true`. Hệ thống chỉ kéo về phiên bản mới nhất của từng quy trình đang hoạt động trên engine. | Request `/v2/process-definitions/search` | Chốt theo `docs/arch/api-camunda-dong-bo-quy-trinh.md` |
| `BR-BPM-SYNC-04` | **Atomic Transaction per Definition**: Thao tác ghi dữ liệu của từng quy trình phải chạy trong một Transaction độc lập (`REQUIRES_NEW`). Lỗi hỏng của 1 quy trình không được làm hỏng hoặc rollback các quy trình đã nhập thành công trước đó trong cùng lượt. | Service ghi CSDL `DeployedProcessImportWriter` | Chốt theo `docs/arch/api-camunda-dong-bo-quy-trinh.md` |
| `BR-BPM-SYNC-05` | **AFTER_COMMIT Policy Scaffolding**: Sự kiện sinh luật nút bấm (`ProcessDeployedEvent`) chỉ được xử lý sau khi Transaction ghi quy trình đã commit thành công vào CSDL (`AFTER_COMMIT`). Lỗi trong quá trình sinh luật chỉ ghi log warning, không được ném exception làm hỏng kết quả đồng bộ quy trình. | Listener `DeployedProcessPolicyScaffolder` | Chốt theo `docs/arch/api-camunda-dong-bo-quy-trinh.md` |
| `BR-BPM-SYNC-06` | **Max Scan Limit (500)**: Trần quét mặc định là 500 quy trình/lượt. Nếu `totalOnEngine > 500`, hệ thống không được ngắt lỗi mà phải trả về thông báo cảnh báo `warnings[]` hướng dẫn người dùng chạy lại. | Luồng quét Engine (3.1.4) | Chốt theo `docs/arch/api-camunda-dong-bo-quy-trinh.md` |
| `BR-BPM-SYNC-07` | **Source Attribution (`EXTERNAL`)**: Bản ghi phiên bản quy trình kéo từ Camunda về qua tính năng này bắt buộc mang thuộc tính `source = 'EXTERNAL'` để phân biệt với các phiên bản quy trình được thiết kế và deploy trực tiếp từ ứng dụng (`source = 'IMPORTED'`). | Bảng `process_definition_version` | Chốt theo `docs/arch/api-camunda-dong-bo-quy-trinh.md` |

---

## 4. THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG

### 4.1 Thông báo và phản hồi người dùng
Tất cả thông báo trong tính năng đồng bộ tuân thủ mẫu thông báo chuẩn của toàn hệ thống QTKHCN:
- **Toast Success**: "Đồng bộ từ Camunda thành công. Đã nhập mới {n} quy trình." (Tự đóng sau 3 giây).
- **Toast Error (Lỗi mạng/Engine)**: "Đồng bộ từ Camunda thất bại. Không thể kết nối tới Camunda Engine. Vui lòng kiểm tra lại dịch vụ hệ thống." (Đóng khi người dùng bấm X hoặc sau 5 giây).
- **Alert Banner Warning**: "Đã quét {scanned} quy trình: nhập mới {imported}, đã biết {alreadyKnown}, {failed} lỗi." kèm danh sách chi tiết các quy trình bị lỗi và cảnh báo hệ thống.

### 4.2 Quy tắc xử lý giao tiếp hệ thống & Idempotency
- API endpoint `POST /api/process-definitions/sync-from-camunda` là API dạng POST do có ghi dữ liệu vào CSDL và phát sinh nhật ký vết thao tác.
- Tính chất Idempotency được đảm bảo ở mức CSDL backend thông qua việc kiểm tra duy nhất trường `camundaProcessDefinitionKey`. Do đó, nếu người dùng vô tình bấm nút Đồng bộ liên tiếp nhiều lần, CSDL hệ thống vẫn hoàn toàn nhất quán và không phát sinh bản ghi rác.

### 4.3 Phân quyền và bảo mật
- **Frontend**: Nút "Đồng bộ từ Camunda" chỉ hiển thị và hoạt động đối với người dùng có vai trò `ROLE_ADMIN` hoặc `ROLE_PROCESS_ADMIN`.
- **Backend HTTP Header**: Người dùng thực hiện thao tác được truyền qua HTTP Header `X-QTKHCN-Actor` (đã mã hoá URL). Backend sử dụng giá trị này để ghi nhận cột `created_by` / `imported_by` trong lịch sử nhật ký.
- **Service Account tích hợp Camunda**: Kết nối từ Backend QTKHCN sang Camunda 8 Engine sử dụng Service Account chung của ứng dụng (OAuth2 Client Credentials với `client-id` và `client-secret`). Người dùng cuối không cần có tài khoản trực tiếp trên Camunda Engine.

---

## 5. THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU

### 5.1 Chất lượng dữ liệu
- Mọi sơ đồ quy trình kéo từ Camunda về bắt buộc phải có nội dung BPMN XML thô hợp lệ (`NOT NULL`).
- Tên quy trình (`catalog.name`) nếu trên Camunda Engine để trống (null) sẽ tự động được gán giá trị mặc định bằng `bpmnProcessId` để đảm bảo không bị lỗi hiển thị trên giao diện người dùng.

### 5.2 Lịch sử và khả năng truy vết
- Mỗi phiên bản quy trình kéo về được lưu trữ độc lập trong bảng `process_definition_version` kèm theo mã băm `checksum_sha256` của nội dung XML để đảm bảo chống chỉnh sửa trái phép.
- Lưu trữ các trường vết: `created_at` (thời điểm kéo về), `created_by` (lấy từ Header `X-QTKHCN-Actor`), `camunda_process_definition_key` (truy vết ngược chính xác phiên bản trên Engine Camunda).

### 5.3 Phân quyền và kiểm soát truy cập
- Tuân thủ quy định phân quyền 3 tầng của hệ thống QTKHCN (RBAC): Chỉ các vai trò quản trị phân hệ quy trình mới có quyền thực thi API đồng bộ.
- Dữ liệu sơ đồ quy trình BPMN thuộc phạm vi quản trị hệ thống, không chứa thông tin nhạy cảm của cá nhân hay đề tài khoa học.

### 5.4 Vòng đời và lưu trữ dữ liệu
- Dữ liệu sơ đồ BPMN XML được lưu trữ vĩnh viễn trong CSDL dưới dạng cột `LONGTEXT` / `CLOB` để phục vụ việc tra cứu lại lịch sử luồng duyệt của các hồ sơ cũ.
- Khi một quy trình trên Camunda Engine bị xoá, các bản ghi quy trình tương ứng trong CSDL QTKHCN **không bị xoá vật lý** (đảm bảo tính toàn vẹn dữ liệu cho các hồ sơ đã chạy trước đây).

### 5.5 Dữ liệu cá nhân
- Tính năng này chỉ xử lý dữ liệu cấu hình quy trình kỹ thuật (BPMN XML, Process ID, Version Key).
- Tuyệt đối không thu thập, lưu trữ hay xử lý bất kỳ thông tin dữ liệu cá nhân (PII) nào của người nộp hồ sơ hay nhà khoa học.

### 5.6 Quản trị dữ liệu
- Bảng `catalog` giữ vai trò làm Master Data cho danh mục các quy trình nghiệp vụ trong toàn bộ ứng dụng QTKHCN.
- Mỗi `bpmnProcessId` duy nhất chỉ đại diện cho một danh mục quy trình (ví dụ: `RD01.01` — Xét duyệt Chủ trương cấp Cơ sở). Các lần deploy hoặc đồng bộ mới sẽ chỉ tạo thêm phiên bản trong `process_definition_version`.

### 5.7 Kiến trúc & tích hợp dữ liệu
- Tuân thủ kiến trúc Orchestration Cluster REST API v2 của Camunda 8 (chuẩn API mới nhất từ phiên bản Camunda 8.8+ thay thế cho Operate API v1 cũ).
- Tách biệt rõ ràng 2 kênh tích hợp:
  - **Seam A (App ↔ Camunda Engine)**: Tra cứu và đồng bộ sơ đồ quy trình qua REST Client.
  - **Seam B (Camunda ↔ External System)**: Điều phối công việc thông qua Zeebe Job Worker (thuộc các tính năng xử lý hồ sơ riêng).

---

## 6. PHỤ LỤC

### 6.1 Mẫu tệp nhập và xuất dữ liệu

#### Mẫu JSON Contract API nội bộ `POST /api/process-definitions/sync-from-camunda`

**Request Header**:
```http
POST /api/process-definitions/sync-from-camunda HTTP/1.1
Host: 127.0.0.1:8090
Content-Type: application/json
X-QTKHCN-Actor: Nguyen%20Van%20A
```

**Response Body (HTTP 200 OK)**:
```json
{
  "scanned": 27,
  "imported": 2,
  "alreadyKnown": 24,
  "importedProcesses": [
    {
      "catalogId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "versionId": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
      "bpmnProcessId": "rd0505",
      "name": "RD05.05 — Nghiệm thu NV KHCN cấp Cơ sở",
      "version": 2,
      "newCatalog": true
    },
    {
      "catalogId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "versionId": "e8d7c6b5-a4f3-2109-edcb-a09876543210",
      "bpmnProcessId": "rd0202",
      "name": "RD02.02 — Xét duyệt nhiệm vụ KHCN",
      "version": 3,
      "newCatalog": false
    }
  ],
  "failures": [
    {
      "bpmnProcessId": "rd_test_invalid",
      "message": "Không thể lấy nội dung XML từ Camunda Engine (Mã lỗi 404: Process definition key not found)"
    }
  ],
  "warnings": [
    "Engine đang có 540 quy trình nhưng lượt này chỉ quét tối đa 500 quy trình — Vui lòng thực hiện lại lượt đồng bộ tiếp theo."
  ]
}
```

### 6.2 Đề xuất bổ sung thiết kế cơ sở dữ liệu

Thiết kế cấu trúc bảng CSDL lưu trữ Catalog và Version quy trình hỗ trợ tính năng đồng bộ từ Camunda:

#### 1. Bảng `catalog` (Danh mục quy trình)
```sql
CREATE TABLE catalog (
    id VARCHAR(36) PRIMARY KEY,
    bpmn_process_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. Bảng `process_definition_version` (Phiên bản quy trình)
```sql
CREATE TABLE process_definition_version (
    id VARCHAR(36) PRIMARY KEY,
    catalog_id VARCHAR(36) NOT NULL,
    version INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DEPLOYED', -- DEPLOYED, DRAFT, ARCHIVED
    source VARCHAR(20) NOT NULL DEFAULT 'EXTERNAL', -- EXTERNAL (Camunda), IMPORTED (App Deploy)
    camunda_process_definition_key BIGINT NOT NULL UNIQUE,
    camunda_deployment_key BIGINT NOT NULL DEFAULT 0,
    checksum_sha256 VARCHAR(64) NOT NULL,
    bpmn_xml LONGTEXT NOT NULL,
    created_by VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (catalog_id) REFERENCES catalog(id),
    CONSTRAINT uk_catalog_version UNIQUE (catalog_id, version)
);
```

### 6.3 Danh mục điểm chờ xác nhận

Bảng thống kê các điểm chờ xác nhận (Open Questions - OQ) liên quan đến tính năng Đồng bộ Quy trình từ Camunda (chép nguyên văn từ `docs/ba/OQ-TRACKER.md`):

| Mã OQ | Phân hệ / Module | Câu hỏi / Nội dung cần xác nhận | Mức ưu tiên | Chặn? | Phản hồi VTS / Solution | Trạng thái | Nguồn / Ghi chú |
|---|---|---|---|---|---|---|---|
| `OQ-QTKHCN-001` | Quản trị quy trình | Tên Scope/Permission chính xác cần cấp cho Service Account trên Keycloak/Camunda Identity để thực hiện tra cứu danh sách quy trình và đọc XML (tránh cấp quyền root `*`) là gì? | Trung bình | Không | Tạm thời môi trường Dev không bật OIDC Auth; khi lên Staging/Prod sẽ cấu hình scope `READ:PROCESS_DEFINITION` theo chuẩn Camunda 8.9 Identity. | Mở | `docs/arch/api-camunda-dong-bo-quy-trinh.md` §4.2 |
| `OQ-QTKHCN-002` | Quản trị quy trình | Trường `page.totalItems` trong Camunda REST API 8.9 có bị giới hạn ngưỡng đếm nội bộ không, và ứng dụng có nên chuyển sang dùng phân trang cursor `page.hasMoreTotalItems` để tự động quét vét toàn bộ khi `totalOnEngine > 500` không? | Thấp | Không | Hiện tại áp dụng ngưỡng cảnh báo `warnings[]` cố định `MAX_SCAN = 500`. Sẽ nâng cấp tự động phân trang theo cursor trong phiên bản v0.2. | Mở | `docs/arch/api-camunda-dong-bo-quy-trinh.md` §2.3.2 |

### 6.4 Phụ thuộc module/dữ liệu khác

Đối chiếu với Ma trận phụ thuộc Module (`.harness/state/module-dependency-matrix.md`):

| Module / Hệ thống phụ thuộc | Thực thể / API tiêu thụ | Hướng phụ thuộc | Trạng thái module phụ thuộc | Ghi chú |
|---|---|---|---|---|
| **Camunda 8 Orchestration Cluster** | `POST /v2/process-definitions/search`, `GET /v2/process-definitions/{key}/xml` | Phụ thuộc bên ngoài (External Engine) | 🟢 Đã sẵn sàng (Container `orchestration:8.9.12` trong `infra/camunda`) | Nguồn dữ liệu BPMN thô |
| **Action Studio / Policy Engine** | `DeployedProcessPolicyScaffolder.scaffold()` | Phụ thuộc nội bộ (Internal Module) | 🟢 Đã sẵn sàng | Tự động sinh Availability Policy cho nút bấm khi nhập quy trình mới |
| **Identity / Auth Service** | Header `X-QTKHCN-Actor` & RBAC Roles | Phụ thuộc nội bộ (Internal Module) | 🟢 Đã sẵn sàng | Xác thực vai trò người dùng bấm nút và ghi nhận audit log |
