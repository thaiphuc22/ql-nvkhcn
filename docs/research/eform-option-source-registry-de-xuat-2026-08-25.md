# Đề xuất: Danh mục Nguồn dữ liệu chọn cho eForm (Option Source Registry)

Date: 2026-08-25

Target module: eForm (Phân hệ 3 — Danh mục dùng chung). Cụ thể: `frontend-angular/src/app/shared/form-renderer/`, `shared/form-designer/`, `pages/ho-so-detail/`, + bảng `eform` ở `backend`.

Source: phiên làm việc 2026-08-25. Xuất phát từ câu hỏi thực tế "muốn select Chủ nhiệm nhiệm vụ trong `bm-02-01-dki-nv` lấy từ CSDL/API thì làm thế nào", và phản biện tiếp theo của người dùng: **BA là người thiết lập eForm theo yêu cầu end-user, nhưng BA không đọc code; và eForm muôn hình muôn vẻ, không thể code sẵn từng trường select trong backend.**

Status: **Tài liệu đề xuất, CHƯA triển khai.** Harness đang ở 1/6 foundation, active task là RD02.02 v3 — bản này để duyệt và xếp thứ tự, không phải lệnh bắt tay làm.

---

## 1. Vấn đề

Renderer eForm của app đã hỗ trợ options động qua `valuesKey` (cơ chế chuẩn form-js: options không nằm trong schema mà bơm từ ngoài vào). Nhưng **cái tên `valuesKey` hiện không có gì đứng sau nó** — không có registry, không có resolver, không có UI. Người bơm dữ liệu là một câu `if` viết tay.

Hệ quả, đo được bằng số file phải sửa:

> **Thêm một trường select động = sửa 3 file + build + deploy.** Không có đường nào khác.

Và vì Form Designer không hề lộ ra `valuesKey`, BA **vừa không biết cơ chế tồn tại, vừa không gọi ra được nếu biết**. Đây chính là hai phản biện của người dùng, quy về một nguyên nhân: **nguồn options đang là code, đáng lẽ phải là dữ liệu.**

## 2. Bằng chứng trong code (đã xác minh, không suy đoán)

| Mắt xích | Hiện trạng | Đánh giá |
|---|---|---|
| Renderer lá | `form-field.ts:59` — `c.values ?? (c.valuesKey ? this.valueSources()[c.valuesKey] : undefined) ?? []` | **Đã generic, không cần sửa.** Đây là phần duy nhất làm đúng. |
| Truyền xuống | `form-renderer.ts:34` `valueSources` input → `form-renderer.html:24,33` → `form-dynamic-list.ts:35` | Đã generic. |
| **Nguồn dữ liệu** | `ho-so-detail.ts:407` `loadValueSources()` — `if (!this.schemaUsesValuesKey(schema, UNG_VIEN_HOI_DONG_KEY)) return;` | **Hard-code đúng MỘT khoá.** Đây là nút thắt. |
| Service danh mục | `core/services/hoi-dong-candidate.service.ts` — `VAI_TRO_HOI_DONG = ['HDXD','HDXD_TD']`, ~100 dòng | Viết tay cho đúng 1 danh mục. Danh mục thứ hai = file thứ hai. |
| Khai báo trong schema | `V29__eform_bm0208_thanh_vien_tai_khoan.sql:28` — `"valuesKey":"ungVienHoiDong"` | Chỉ đặt được bằng SQL migration hoặc Import JSON thủ công. |
| **Form Designer** | `shared/form-designer/form-field-properties.ts:208,214,219` chỉ `emitEdit('values', ...)` | **Không có ô nhập `valuesKey`.** BA chỉ khai được options tĩnh. |
| Chỗ render **thiếu** bind | `form-library.html:125`, `ho-so-detail.html:319` (preview dossier-level), `form-designer.html:73` (preview trong designer) | Select `valuesKey` hiện **rỗng** ở 3 màn này — không lỗi, chỉ im lặng sai. |

Tổng: cơ chế đã đúng ở tầng render, hỏng ở tầng **cung cấp dữ liệu** và **tầng khai báo cho người dùng cuối**.

## 3. Repo đã tự giải đúng bài toán này hai lần

Đề xuất dưới đây không phát minh mẫu mới — nó áp lại mẫu đã được duyệt và đã chạy trong chính repo này:

- **`V38__action_variable_binding.sql`** mở đầu bằng đúng một câu: *"Quy tắc 'trường biểu mẫu → biến Camunda', chuyển từ hàm cứng `WorkflowTaskActionService.withDiemSoForT24()` thành dữ liệu BA nhìn thấy và sửa được."* Cùng loại chuyển hoá, cùng lý do.
- **Service Task Config** (`V21__service_task_config.sql` + `service/ServiceTaskCommandService.java` + `core/models/service-task.ts`) là mẫu hoàn chỉnh: một tập **loại** đóng do dev code sẵn (`SEND_NOTIFICATION`, `CALL_API`, `UPDATE_DOSSIER`, `GENERATE_DOCUMENT`, `EVALUATE_DECISION`), và một tập **định nghĩa** mở do người dùng khai — có `latest_version`/`active_version`, `config_json` JSONB, status DRAFT→READY→ACTIVE, validate + preview.

## 4. Nguyên tắc chốt

> **Dev code theo LOẠI NGUỒN (hữu hạn, ~5, code một lần). BA khai theo TỪNG DANH MỤC (vô hạn, không cần dev).**

Đây là câu trả lời trực tiếp cho phản biện "không thể lường trước hết các trường cần select": **không cần lường trước trường nào cả.** Chỉ cần lường trước *các kiểu lấy dữ liệu*, mà số kiểu thì đếm được trên đầu ngón tay và gần như không tăng theo số biểu mẫu.

## 5. Mô hình dữ liệu đề xuất

Bảng `option_source` — theo đúng khuôn `service_task_definition`, và có bảng version bất biến theo đúng khuôn `eform_version` (`V35`):

```sql
CREATE TABLE option_source (
    id              UUID PRIMARY KEY,
    code            VARCHAR(128) NOT NULL UNIQUE,   -- CHÍNH LÀ giá trị `valuesKey` trong schema
    ten             VARCHAR(255) NOT NULL,          -- tên tiếng Việt BA nhìn thấy trong Designer
    mo_ta           VARCHAR(1000) NOT NULL,
    kind            VARCHAR(24)  NOT NULL
        CHECK (kind IN ('STATIC','ROLE_USERS','ENTITY','REST','DMN')),
    config_json     JSONB NOT NULL,
    cache_ttl_sec   INTEGER NOT NULL DEFAULT 300,
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    latest_version  INTEGER NOT NULL DEFAULT 0,
    created_by      VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_by      VARCHAR(255) NOT NULL,
    updated_at      TIMESTAMPTZ  NOT NULL
);
-- + option_source_version (code, version, config_json, change_note, created_by, created_at)
--   bất biến, để truy vết "hồ sơ ký năm ngoái lấy danh mục lúc đó gồm những ai".
```

Năm loại nguồn, và ai khai được:

| `kind` | BA khai gì | Ai tạo được | Ví dụ thật |
|---|---|---|---|
| `STATIC` | cặp value/label | **BA** | Giới tính, Loại nhiệm vụ, Xếp loại |
| `ROLE_USERS` | danh sách mã vai trò | **BA** (chọn từ catalog vai trò có sẵn) | Chủ nhiệm = `['PM']`; Ứng viên HĐXD = `['HDXD','HDXD_TD']` |
| `ENTITY` | view đã whitelist + cột value/label | Admin/dev | Đơn vị, Lĩnh vực, Nhiệm vụ đang chạy |
| `REST` | connector đã đăng ký + endpoint + JSONPath | Admin/dev | Danh mục từ hệ thống ngoài |
| `DMN` | mã bảng quyết định | Admin/dev | Danh mục phụ thuộc điều kiện |

**`ROLE_USERS` một mình nó xoá được cả `HoiDongCandidateService` lẫn phần hard-code trong `ho-so-detail`**, đồng thời giải luôn ca "Chủ nhiệm nhiệm vụ" đang hỏi — bằng một dòng DB, không dòng code nào.

Catalog vai trò đã có sẵn 33 mã ở `services/identity-service/src/main/resources/db/migration/V1__identity_schema.sql:52-66` (`PM` = "Chủ nhiệm đề tài", `HDXD` = "Hội đồng Xét duyệt", …), nên `ROLE_USERS` không cần BA gõ tay chuỗi nào.

## 6. Hợp đồng backend

Hai endpoint, theo convention `/api/service-tasks` sẵn có:

```
GET /api/option-sources                              → danh sách cho Designer liệt kê
GET /api/option-sources/{code}/options?q=&hoSoId=    → [{ value, label }]
```

Backend: một interface `OptionSourceResolver` + 5 handler theo `kind`. **Thêm danh mục thứ 300 = thêm 1 dòng DB, không đụng code Java.** Cache theo `cache_ttl_sec`. Nguồn lỗi ⇒ trả mảng rỗng chứ không ném — giữ đúng hành vi fail-soft mà `HoiDongCandidateService` đang làm (`catchError(() => of([]))`): người dùng thấy select trống và biết là chưa chọn được, thay vì cả biểu mẫu sập.

## 7. Frontend đổi gì

- **`form-field.ts` / `form-renderer.ts` / `form-dynamic-list.ts`: KHÔNG SỬA GÌ.** Đã generic sẵn.
- **`ho-so-detail.ts:407`**: `loadValueSources()` thu về ~15 dòng — quét *mọi* `valuesKey` có trong schema (đã có sẵn hàm đệ quy `schemaUsesValuesKey`, chỉ cần đổi thành `collectValuesKeys`), gọi endpoint chung, nhét vào `formValueSources`. Xoá hằng `UNG_VIEN_HOI_DONG_KEY` khỏi luồng.
- **Xoá `hoi-dong-candidate.service.ts`** phần `candidates()` (giữ `candidateProfiles()` — nó phục vụ màn `/hoi-dong`, việc khác).
- **Bind `[valueSources]` cho 3 chỗ đang thiếu**: `form-library.html:125`, `ho-so-detail.html:319`, `form-designer.html:73`. Không làm bước này thì BA vẽ xong bấm Xem thử sẽ thấy select rỗng và tưởng mình khai sai.

## 8. Designer: chỗ BA thật sự nhìn thấy

Đây là nửa quan trọng hơn của đề xuất — không có nó thì registry vẫn vô hình với BA.

Panel thuộc tính của field `select` / `radio` / `checklist` (`form-field-properties.ts`) thêm một mục:

```
Nguồn options:   ( ) Tự nhập      (•) Từ danh mục
                 └─ Danh mục:  [ Chủ nhiệm nhiệm vụ        ▾ ]
                                 Ứng viên Hội đồng xét duyệt
                                 Đơn vị chủ trì
                                 Lĩnh vực KHCN
                                 ...
                 [ Xem thử ]  → hiện 5 dòng đầu ngay trong panel
```

Chọn "Tự nhập" ⇒ ghi `values` (như hiện nay). Chọn "Từ danh mục" ⇒ ghi `valuesKey`. **BA chọn một item trong menu theo tên tiếng Việt — không đọc code, không biết `valuesKey` là gì, không mở SQL.** Nút "Xem thử" là mấu chốt niềm tin: BA tự kiểm chứng được mình chọn đúng danh mục trước khi giao form.

## 9. Bảo mật — bắt buộc, không phải tuỳ chọn

`REST` và `ENTITY` mà cho gõ tự do URL/SQL thì đây là màn hình admin mở sẵn **SSRF và SQL injection**. Ràng buộc bắt buộc:

- `REST` **chỉ** đi qua connector đã đăng ký — đúng cách `CallApiConfig.connectorKey` đang làm (`core/models/service-task.ts:142-149`), không nhận URL tự do.
- `ENTITY` **chỉ** chạy trên view đã whitelist, tên cột đối chiếu allowlist, không nội suy chuỗi vào SQL.
- Phân quyền tạo nguồn tách khỏi phân quyền vẽ form: BA được tạo `STATIC`/`ROLE_USERS`; `REST`/`ENTITY`/`DMN` cần quyền kỹ thuật.
- Kết quả trả về phải tôn trọng data scope của người đang xem form — nếu không, select trở thành kênh rò rỉ danh sách nhân sự/đơn vị ngoài phạm vi.

**Nói thẳng phần không hứa**: tạo nguồn `REST`/`ENTITY` mới vẫn cần người có quyền kỹ thuật. Nhưng đó là **một lần cho mỗi danh mục, dùng lại ở mọi biểu mẫu** — khác hẳn "một lần cho mỗi trường trên mỗi form" như hiện nay. Với `STATIC` và `ROLE_USERS` (chiếm phần lớn nhu cầu thực tế) thì BA tự chủ hoàn toàn.

## 10. Điều đề xuất này CHƯA giải quyết

**Select phụ thuộc ngữ cảnh** — "thành viên thuộc đơn vị chủ trì *của hồ sơ này*", hoặc tỉnh → huyện. Cần truyền context vào resolver và khai `dependsOn` giữa các field, rồi nạp lại options khi field cha đổi. form-js không có sẵn cơ chế này, `FormRendererComponent` cũng chưa. Đây là **lát riêng, làm sau**, và là phần khó thật sự về kỹ thuật. Tham số `?hoSoId=` ở §6 chỉ là chỗ chừa sẵn, chưa phải lời giải đầy đủ.

## 11. Lát cắt triển khai

| Lát | Nội dung | Ước lượng |
|---|---|---|
| L1 | Bảng `option_source` + `option_source_version` + resolver `STATIC`/`ROLE_USERS` + 2 endpoint | 1.5 ngày |
| L2 | Frontend generic: `loadValueSources` quét mọi khoá; bind 3 chỗ thiếu; xoá hard-code | 0.5 ngày |
| L3 | Designer: mục "Nguồn options" + nút Xem thử | 1 ngày |
| L4 | Di trú: `ungVienHoiDong` → dòng `ROLE_USERS`; thêm dòng "Chủ nhiệm nhiệm vụ" (`['PM']`); sửa schema `bm-02-01-dki-nv` | 0.5 ngày |
| L5 | `ENTITY`/`REST` + whitelist + phân quyền tạo nguồn | 1.5 ngày |
| — | *(sau, riêng)* `dependsOn` + context-aware | chưa ước lượng |

**L1–L4 ≈ 3.5 ngày công** là đã đủ trả lời trọn vẹn hai phản biện của người dùng. L5 mở rộng độ phủ.

## 12. Ảnh hưởng tới decisions đã khoá

- **D12** (eForm B-engine: renderer AntD/ng-zorro trên schema form-js không đổi): đề xuất này **không phá** — `valuesKey` là thuộc tính chuẩn của form-js, không phải phần mở rộng riêng. Schema vẫn là schema form-js hợp lệ, vẫn mở được bằng công cụ khác.
- **D13** (builder chrome AntD tự viết trên engine form-js): §8 nằm đúng trong phần "author-facing chrome" mà D13 cho phép sửa.
- **D3** (Camunda chỉ giữ biến điều khiển): không liên quan — options được resolve ở app, không bao giờ đi qua Zeebe.
- **D10** (form-by-reference trên Availability Policy): không đụng tới binding.

Không cần mở lại quyết định nào.

## 13. Câu hỏi cần chốt

1. **Ai được tạo nguồn `ROLE_USERS`?** Đề xuất: BA — vì nó chỉ là chọn mã vai trò từ catalog có sẵn, không có bề mặt tấn công. Cần xác nhận có đúng chính sách phân quyền không.
2. **Danh mục có cần duyệt trước khi ACTIVE không?** Service Task Config có DRAFT→READY→ACTIVE. Option source đơn giản hơn nhiều; đề xuất chỉ `enabled` on/off, không luồng duyệt — trừ khi muốn đối xứng.
3. **Xếp thứ tự thế nào so với RD02.02 v3 đang dở và các foundation còn lại?** Đây là quyết định của người dùng, không phải của tài liệu này.
