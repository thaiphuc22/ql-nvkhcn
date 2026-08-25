-- Từ điển từ khoá outcome: chuyển bảng `switch` cứng trong BpmnOutcomeCodes.actionCode() thành dữ
-- liệu BA tự quản lý trong Danh mục nút.
--
-- `keyword` là KHOÁ CHÍNH, không phải cột thường: một từ khoá chỉ được thuộc đúng một nút. Không có
-- ràng buộc này thì hai nút cùng nhận một từ khoá, và `putIfAbsent` trong
-- DeployedBpmnRoutingReader.actionVariables sẽ nuốt nhánh vẽ sau mà không báo lỗi.
--
-- KHÔNG đụng cột `action_studio_action.outcome` cũ: nó đang lẫn hai nghĩa (V10 ghi 'APPROVE' —
-- nhãn kết quả trừu tượng; V20 ghi 'dong_y_bo_sung' — từ khoá BPMN thật). Tận dụng lại là mang
-- sự lẫn lộn đó sang bảng mới.

CREATE TABLE action_studio_action_outcome (
    keyword VARCHAR(64) PRIMARY KEY,
    action_code VARCHAR(64) NOT NULL REFERENCES action_studio_action(action_code),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_action_studio_action_outcome_action
    ON action_studio_action_outcome(action_code);

-- Seed nguyên văn 17 từ khoá đang cứng trong BpmnOutcomeCodes.actionCode(), kể cả
-- dong_y_bo_sung → APPROVE_WITH_SUPPLEMENT, để hành vi sau migration giống hệt trước.
INSERT INTO action_studio_action_outcome (keyword, action_code, created_by, created_at)
VALUES
('submit', 'SUBMIT', 'system-seed', NOW()),
('gui', 'SUBMIT', 'system-seed', NOW()),
('gui_duyet', 'SUBMIT', 'system-seed', NOW()),
('tiep_tuc', 'SUBMIT', 'system-seed', NOW()),
('approve', 'APPROVE_STEP', 'system-seed', NOW()),
('dong_y', 'APPROVE_STEP', 'system-seed', NOW()),
('dat', 'APPROVE_STEP', 'system-seed', NOW()),
('phe_duyet', 'APPROVE_STEP', 'system-seed', NOW()),
('dong_y_bo_sung', 'APPROVE_WITH_SUPPLEMENT', 'system-seed', NOW()),
('return', 'RETURN_STEP', 'system-seed', NOW()),
('hieu_chinh', 'RETURN_STEP', 'system-seed', NOW()),
('yeu_cau_hieu_chinh', 'RETURN_STEP', 'system-seed', NOW()),
('tra_lai', 'RETURN_STEP', 'system-seed', NOW()),
('reject', 'REJECT_STEP', 'system-seed', NOW()),
('khong_dong_y', 'REJECT_STEP', 'system-seed', NOW()),
('khong_dat', 'REJECT_STEP', 'system-seed', NOW()),
('tu_choi', 'REJECT_STEP', 'system-seed', NOW())
ON CONFLICT (keyword) DO NOTHING;
