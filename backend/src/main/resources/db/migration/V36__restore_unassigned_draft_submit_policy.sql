-- Hồ sơ DRAFT chưa chọn quy trình vẫn phải có action mở hộp thoại "Gửi duyệt".
-- Policy theo User Task không thể áp dụng ở thời điểm này vì người dùng chỉ chọn
-- quy trình sau khi bấm action. Chỉ khôi phục policy nền khi không còn policy
-- SUBMIT/DRAFT nào đang hoạt động, tránh tạo selector trùng trên database bình thường.
INSERT INTO action_availability_policy
    (id, action_code, surface, process_code, process_version, task_definition_key,
     dossier_status, form_key, condition_expression, display_order, lifecycle_status,
     version, updated_by, updated_at)
SELECT
    'AP-DRAFT-SUBMIT', 'SUBMIT', 'DOSSIER_DETAIL', NULL, NULL, NULL,
    'draft', NULL, 'dossier.docsComplete = true', 10, 'ACTIVE',
    1, 'system-migration', NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM action_availability_policy
    WHERE action_code = 'SUBMIT'
      AND dossier_status = 'draft'
      AND lifecycle_status = 'ACTIVE'
);

INSERT INTO action_availability_role (policy_id, role_code)
SELECT 'AP-DRAFT-SUBMIT', role_code
FROM (VALUES ('PM'), ('PA'), ('NNC')) AS roles(role_code)
WHERE EXISTS (
    SELECT 1 FROM action_availability_policy WHERE id = 'AP-DRAFT-SUBMIT'
)
ON CONFLICT DO NOTHING;
