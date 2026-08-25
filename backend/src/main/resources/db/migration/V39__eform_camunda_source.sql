-- Biểu mẫu khai TRÊN CAMUNDA (khách vẽ eForm trong Modeler rồi gắn vào User Task) được hút về bảng
-- `eform` để app render bằng chính FormRendererComponent sẵn có — Camunda Forms vốn là schema
-- form-js, không cần renderer mới.
--
-- Cần cột `source` vì hai loại biểu mẫu có CHỦ SỞ HỮU khác nhau:
--   APP     — BA vẽ trong Thư viện biểu mẫu của app, app được phép sửa/xoá.
--   CAMUNDA — hút từ BPMN, Camunda là nơi authoring duy nhất ⇒ read-only trong app; lượt đồng bộ
--             sau được phép ghi đè. Không có cột này thì importer không phân biệt nổi "dòng của tôi,
--             cập nhật được" với "dòng BA tự vẽ, đụng vào là mất bài của người ta".
ALTER TABLE eform ADD COLUMN source VARCHAR(16) NOT NULL DEFAULT 'APP';
ALTER TABLE eform ADD CONSTRAINT ck_eform_source CHECK (source IN ('APP', 'CAMUNDA'));

-- Id nguyên văn trong BPMN (`<zeebe:userTaskForm id="...">` với form nhúng, hoặc `formId` với linked
-- form). Giữ tách khỏi `form_key` để còn truy vết ngược khi khoá bị chuẩn hoá hoặc va tên.
ALTER TABLE eform ADD COLUMN camunda_form_id VARCHAR(255);

CREATE INDEX idx_eform_source ON eform (source);
