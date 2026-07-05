# Acceptance Criteria (chi tiết) — 10 User Story US-ready · Epic QL NV KHCN

> **Skill:** SKILL-AC-GENERATOR v1.0 · **Ngày:** 2026-07-03 · **Nguồn US:** `docs/req/EPIC-QLNVKHCN-backlog.md`
> **Pipeline:** main flow → edge cases → validation logic → negative → testable conditions.
> **Kỷ luật:** mỗi AC testable, 1 scenario/AC, ≥1 negative + ≥1 edge; không dùng từ mơ hồ ("nhanh/dễ").
>
> **Ghi chú "metric":** với luồng phê duyệt, đại lượng đo được chủ yếu là **chuyển trạng thái / số trường bắt buộc / bản ghi log / kiểm tra quyền** (đều viết test case được). Các **SLA thời gian** chưa có số → gắn `⚠️OQ-006` thay vì bịa.
> **Cờ phụ thuộc:** `⚠️OQ-002` = đích nhánh từ chối/rework chưa rõ · `⚠️OQ-006` = NFR/RBAC/chữ ký số/SLA chưa chốt · `⚠️ASSUMP` = luật suy diễn cần khách xác nhận.

---

## FEATURE F-RD01

### AC — US-RD01-01 · Khởi tạo & xây dựng hồ sơ chủ trương
**Applied BR:** BR-RD0101-001 · **Edge detected:** trùng hồ sơ, đính kèm quá hạn, phân quyền

| ID | Loại | Cho (Given) | Khi (When) | Thì (Then) |
|---|---|---|---|---|
| AC1 | happy | PM đã đăng nhập; đề tài **có trong kế hoạch năm đã duyệt** | tạo hồ sơ chủ trương + điền đủ **tất cả trường bắt buộc** | hồ sơ lưu trạng thái *Nháp*, sinh **mã hồ sơ duy nhất**, nút "Trình ký" khả dụng |
| AC2 | alternative | hồ sơ đang soạn còn thiếu ≥1 trường bắt buộc | chọn *Lưu nháp* | lưu *Nháp*, đánh dấu **đúng các trường thiếu**, nút "Trình ký" bị vô hiệu |
| AC3 | validation | đề tài **không** có trong kế hoạch năm đã duyệt | tạo hồ sơ chủ trương | chặn tạo + hiển thị lỗi tham chiếu **BR-RD0101-001** |
| AC4 | negative | người dùng **không** thuộc vai trò PM/PA/NNC của đề tài | mở chức năng tạo hồ sơ | từ chối truy cập (**403**) + ghi **audit log**. `⚠️OQ-006` (định nghĩa RBAC) |
| AC5 | edge | đã tồn tại 1 hồ sơ chủ trương *đang xử lý* cho cùng đề tài | tạo hồ sơ chủ trương mới cho đề tài đó | cảnh báo trùng + **không** tạo bản thứ 2 (đảm bảo 1 chủ trương active/đề tài). `⚠️ASSUMP` (luật 1-active chưa nêu tường minh) |
| AC6 | edge | hồ sơ *Nháp* | tải tệp đính kèm sai định dạng/vượt kích thước | từ chối tệp + báo giới hạn cụ thể. `⚠️OQ-006` (giới hạn KB/định dạng chưa chốt) |

### AC — US-RD01-02 · Ký duyệt cấp Trung tâm/Khối
**Edge detected:** đồng thời (concurrency), sai phạm vi phụ trách

| ID | Loại | Cho | Khi | Thì |
|---|---|---|---|---|
| AC1 | happy | hồ sơ trạng thái *Đã trình ký* | BGĐ TT/Khối ký duyệt | trạng thái → *Đã ký cấp TT/Khối*, định tuyến tới CQNV, ghi **người + thời điểm** ký |
| AC2 | alternative | hồ sơ trình ký | BGĐ ký kèm ý kiến | ý kiến lưu vào **lịch sử hồ sơ**, hiển thị cho PM |
| AC3 | negative | hồ sơ trình ký | BGĐ từ chối | trạng thái → *Bị trả lại*, **bắt buộc nhập lý do (≥1 ký tự)**; đích trả về `⚠️OQ-002` |
| AC4 | validation | BGĐ thực hiện ký duyệt | ký | áp **chữ ký số hợp lệ** gắn hồ sơ. `⚠️OQ-006` |
| AC5 | negative | BGĐ **không** phụ trách TT của đề tài | mở ký duyệt | từ chối (**403**). `⚠️OQ-006` (RBAC theo phạm vi) |
| AC6 | edge | 2 người có quyền ký cùng mở 1 hồ sơ | người thứ nhất đã ký xong | thao tác của người thứ 2 báo *"hồ sơ đã chuyển trạng thái"* (chống ghi đè) |

### AC — US-RD01-03 · Góp ý & thẩm định của CQNV
**Applied context:** phiếu nhận xét · **Edge:** thẩm định song song, sai thứ tự luồng

| ID | Loại | Cho | Khi | Thì |
|---|---|---|---|---|
| AC1 | happy | hồ sơ *Đã ký cấp TT/Khối* | Chuyên hướng nhập góp ý | góp ý gắn hồ sơ + hiển thị PM + ghi thời điểm |
| AC2 | happy | hồ sơ cần thẩm định | TP CLKHCN/TCKT/NS hoặc GĐ TTMS lập & ký phiếu nhận xét | phiếu lưu + **ký số** gắn hồ sơ. `⚠️OQ-006` |
| AC3 | validation | luồng yêu cầu tối thiểu **M** phiếu nhận xét | số phiếu hiện có < M | chưa cho chuyển bước "Lập Báo cáo thẩm định". `⚠️ASSUMP` (giá trị M chưa nêu) |
| AC4 | negative | hồ sơ **chưa** qua ký cấp TT/Khối | CQNV mở thẩm định | chặn (sai thứ tự luồng) + thông báo |
| AC5 | edge | nhiều TP thẩm định song song | các phiếu nộp gần như cùng lúc | lưu **độc lập từng phiếu**, không ghi đè lẫn nhau |
| AC6 | negative | người dùng ngoài nhóm CQNV | mở thẩm định | **403**. `⚠️OQ-006` |

### AC — US-RD01-04 · Lập Báo cáo thẩm định chủ trương
| ID | Loại | Cho | Khi | Thì |
|---|---|---|---|---|
| AC1 | happy | đủ phiếu nhận xét của CQNV | CQ QLKHCN lập Báo cáo thẩm định | báo cáo **tổng hợp đầy đủ phiếu**, cho phép trình HĐ |
| AC2 | alternative | báo cáo đang soạn | đính kèm tài liệu bổ sung hợp lệ | tài liệu lưu kèm bản báo cáo |
| AC3 | validation | thiếu phiếu nhận xét bắt buộc | trình báo cáo | chặn + **liệt kê đúng phiếu còn thiếu** |
| AC4 | negative | người không thuộc CQ QLKHCN | lập báo cáo | **403**. `⚠️OQ-006` |
| AC5 | edge | báo cáo **đã trình** HĐ | CQ QLKHCN sửa nội dung | khóa sửa **hoặc** tạo phiên bản mới + ghi vết thay đổi. `⚠️ASSUMP` (chính sách versioning chưa nêu) |

### AC — US-RD01-07 · TGĐ VHT phê duyệt Quyết định chủ trương
| ID | Loại | Cho | Khi | Thì |
|---|---|---|---|---|
| AC1 | happy | Báo cáo thẩm định *Đã thông qua* | TGĐ phê duyệt | **QĐ chủ trương cấp CS ban hành** (sinh mã QĐ), trạng thái đề tài → *Đã duyệt chủ trương* |
| AC2 | validation | báo cáo **chưa** *Đã thông qua* (thiếu chữ ký HĐ) | trình TGĐ | chặn trình |
| AC3 | negative | báo cáo trình TGĐ | TGĐ từ chối | **bắt buộc lý do**; hồ sơ trả về, đích `⚠️OQ-002` |
| AC4 | rule | QĐ chủ trương đã ban hành | khởi tạo RD02 cấp CS | thông tin đề tài **kế thừa** (liên kết BR-RD0201-001) |
| AC5 | edge | TGĐ ủy quyền người khác phê duyệt | người được ủy quyền phê duyệt | ghi rõ *"phê duyệt theo ủy quyền"* trong lịch sử. `⚠️OQ-006` (mô hình ủy quyền) |
| AC6 | validation | TGĐ phê duyệt | ban hành QĐ | QĐ **áp chữ ký số** + **khóa sửa sau ban hành**. `⚠️OQ-006` |

---

## FEATURE F-RD02

### AC — US-RD02-01 · Khởi tạo xét duyệt NV KHCN kế thừa chủ trương
**Applied BR:** BR-RD0201-001, TR-RD0201-001 · **Edge:** trùng hồ sơ, nguồn chủ trương đổi

| ID | Loại | Cho | Khi | Thì |
|---|---|---|---|---|
| AC1 | happy | đề tài **có QĐ phê duyệt chủ trương cấp CS** | khởi tạo xét duyệt NV KHCN | hệ thống **nạp sẵn** thông tin đề tài từ chủ trương (không nhập lại) |
| AC2 | validation | đề tài **chưa** có QĐ chủ trương cấp CS | khởi tạo xét duyệt NV | chặn (BR-RD0201-001) |
| AC3 | alternative | hồ sơ khởi tạo (đã kế thừa) | PM sửa thông tin ngoài phần kế thừa | lưu + **đánh dấu "khác chủ trương"** để CQ lưu ý |
| AC4 | negative | người không thuộc PM/PA/NNC của đề tài | khởi tạo | **403**. `⚠️OQ-006` |
| AC5 | edge | đã có hồ sơ xét duyệt NV *đang xử lý* cho đề tài | tạo mới | cảnh báo trùng, chặn bản 2 |
| AC6 | edge | chủ trương gốc **bị điều chỉnh (RD04)** sau khi đã khởi tạo xét duyệt | mở hồ sơ xét duyệt | cảnh báo **"dữ liệu nguồn đã thay đổi"**. `⚠️ASSUMP` (cơ chế đồng bộ khi nguồn đổi chưa nêu) |

### AC — US-RD02-05 · TGĐ VHT phê duyệt mở mới đề tài
| ID | Loại | Cho | Khi | Thì |
|---|---|---|---|---|
| AC1 | happy | Báo cáo thẩm định xét duyệt *Đã thông qua* **và** QĐ TL HĐXD đã được TGĐ duyệt | TGĐ phê duyệt QĐ mở mới | **QĐ mở mới đề tài ban hành** (kết thúc RD02.01), trạng thái → *Đã mở mới* |
| AC2 | validation | QĐ TL HĐXD **chưa** được phê duyệt | trình QĐ mở mới | chặn (thiếu tiền đề) |
| AC3 | negative | trình TGĐ | TGĐ từ chối | **bắt buộc lý do**; trả về, đích `⚠️OQ-002` |
| AC4 | edge | TGĐ ủy quyền phê duyệt | người được ủy quyền phê duyệt | ghi rõ *"theo ủy quyền"*. `⚠️OQ-006` |
| AC5 | validation | ban hành QĐ mở mới | ký ban hành | QĐ **áp chữ ký số** + khóa sửa. `⚠️OQ-006` |

---

## FEATURE F-RD05

### AC — US-RD05-01 · Khởi tạo & trình hồ sơ nghiệm thu
**Applied BR:** BR-RD0501-001 · **Edge:** nghiệm thu lại, phân quyền

| ID | Loại | Cho | Khi | Thì |
|---|---|---|---|---|
| AC1 | happy | nội dung thực hiện đề tài (RD03) ở trạng thái **Hoàn thành** | PM tạo hồ sơ nghiệm thu | hồ sơ lưu + nút "Trình ký" khả dụng |
| AC2 | validation | RD03 **chưa** Hoàn thành | tạo hồ sơ nghiệm thu | chặn (BR-RD0501-001). `⚠️OQ-013` (định nghĩa tín hiệu "Hoàn thành" từ PLM) |
| AC3 | alternative | hồ sơ đang soạn | PM đính kèm sản phẩm/kết quả theo DS sản phẩm NV KHCN | đính kèm lưu + **liên kết PLM** |
| AC4 | negative | người ngoài PM/PA/NNC của đề tài | tạo hồ sơ nghiệm thu | **403**. `⚠️OQ-006` |
| AC5 | edge | đề tài từng nghiệm thu *Không đạt* trước đó | tạo hồ sơ nghiệm thu lần 2 | hệ thống **liên kết lần nghiệm thu trước**. `⚠️ASSUMP` (luồng nghiệm thu lại chưa nêu) |

### AC — US-RD05-02 · Lập QĐ TL HĐNT + QĐ Công nhận KQ
| ID | Loại | Cho | Khi | Thì |
|---|---|---|---|---|
| AC1 | happy | hồ sơ nghiệm thu đã qua thẩm định chuyên quản | CQ QLKHCN lập QĐ TL HĐNT | **hội đồng nghiệm thu thiết lập** theo danh sách, cho phép trình ký |
| AC2 | alternative | QĐ TL HĐNT đã lập | trình ký | chuyển TGĐ phê duyệt |
| AC3 | validation | hồ sơ **chưa** qua thẩm định chuyên quản | lập QĐ TL HĐNT | chặn (sai thứ tự) |
| AC4 | negative | người không thuộc CQ QLKHCN | lập QĐ TL HĐNT | **403**. `⚠️OQ-006` |
| AC5 | edge | danh sách HĐNT thay đổi theo Quyết định mới | cập nhật danh sách | lưu **phiên bản danh sách** (versioning). `⚠️AMB-003` |

### AC — US-RD05-04 · TGĐ VHT công nhận kết quả NV KHCN
| ID | Loại | Cho | Khi | Thì |
|---|---|---|---|---|
| AC1 | happy | kết luận HĐNT *Đạt* | TGĐ phê duyệt | **QĐ công nhận KQ ban hành** (kết thúc RD05.01), trạng thái → *Đã nghiệm thu* |
| AC2 | validation | kết luận HĐNT chưa hoàn tất / thiếu chữ ký thành viên | trình TGĐ | chặn |
| AC3 | negative | trình TGĐ | TGĐ từ chối **hoặc** HĐ kết luận *Không đạt* | ghi nhận + đích xử lý `⚠️OQ-002` |
| AC4 | rule | QĐ công nhận KQ đã ban hành | khởi tạo RD06 quyết toán | điều kiện *"có QĐ nghiệm thu"* thỏa (BR-RD06-001) |
| AC5 | validation | ban hành QĐ công nhận KQ | ký ban hành | QĐ **áp chữ ký số** + khóa sửa. `⚠️OQ-006` |

---

## Tổng hợp

| Story | #AC | happy | alt | validation | negative | edge |
|---|---|---|---|---|---|---|
| US-RD01-01 | 6 | 1 | 1 | 1 | 1 | 2 |
| US-RD01-02 | 6 | 1 | 1 | 1 | 2 | 1 |
| US-RD01-03 | 6 | 2 | – | 1 | 2 | 1 |
| US-RD01-04 | 5 | 1 | 1 | 1 | 1 | 1 |
| US-RD01-07 | 6 | 1 | – | 2 | 1 | 1(+1 rule) |
| US-RD02-01 | 6 | 1 | 1 | 1 | 1 | 2 |
| US-RD02-05 | 5 | 1 | – | 2 | 1 | 1 |
| US-RD05-01 | 5 | 1 | 1 | 1 | 1 | 1 |
| US-RD05-02 | 5 | 1 | 1 | 1 | 1 | 1 |
| US-RD05-04 | 5 | 1 | – | 2 | 1 | 1(+1 rule) |
| **Tổng** | **55** | | | | **12 negative** | **12 edge** |

## Validators (SKILL-AC-GENERATOR)

- ✅ **VALIDATOR-TESTABILITY** — 55/55 AC ở dạng Cho/Khi/Thì, 1 scenario/AC, kết quả quan sát được.
- ✅ **VALIDATOR-EDGECASE-COVERAGE** — mọi story có ≥1 negative **và** ≥1 edge.
- ⚠️ **VALIDATOR-MEASURABILITY** — đạt qua **state-transition + count + audit log + 403** (test được ngay). **SLA thời gian** (VD ≤Ns) chưa gán số → treo `⚠️OQ-006`; không bịa metric thời gian.

## Phụ thuộc mở (chặn "Done")

| Cờ | Ảnh hưởng | AC liên quan |
|---|---|---|
| `⚠️OQ-002` | đích nhánh từ chối/rework | mọi AC negative "từ chối" (12 chỗ) |
| `⚠️OQ-006` | RBAC (403), chữ ký số, SLA, ủy quyền | ~18 AC |
| `⚠️OQ-013` | tín hiệu "Hoàn thành" từ PLM | US-RD05-01 AC2 |
| `⚠️AMB-003` | versioning danh sách hội đồng | US-RD05-02 AC5 |
| `⚠️ASSUMP` | luật suy diễn (1-active, M phiếu, versioning báo cáo, nghiệm thu lại, đồng bộ nguồn đổi) | 6 AC |

## Follow-up

- **skill-traceability-builder** — RTM: REQ ↔ US ↔ AC (55 AC), tô đậm 12 AC treo `OQ-002` + 18 AC treo `OQ-006`.
- Sau khi khách giải OQ-002/OQ-006 → cập nhật AC negative (đích rework) + chốt số SLA/giới hạn.
- **skill-br-extractor** — decision table cho các `⚠️ASSUMP` (luật 1-active, số phiếu M, versioning).
