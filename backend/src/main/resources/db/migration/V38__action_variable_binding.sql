-- Quy tắc "trường biểu mẫu → biến Camunda", chuyển từ hàm cứng
-- WorkflowTaskActionService.withDiemSoForT24() thành dữ liệu BA nhìn thấy và sửa được.
--
-- KHOÁ THEO SELECTOR, KHÔNG THEO policy_id: scaffold từ BPMN xoá và tạo lại các dòng
-- action_availability_policy với id mới, nên binding gắn vào policy_id sẽ biến mất im lặng sau mỗi
-- lần đối soát. Selector (process_code, task_definition_key, action_code) sống sót qua scaffold.
--
-- ĐÂY KHÔNG PHẢI cơ chế gửi kèm dữ liệu biểu mẫu cho mọi bước. Nguyên tắc D3 vẫn giữ: Camunda chỉ
-- mang biến điều khiển. Binding là ngoại lệ hẹp, khai báo từng dòng một, cho trường hợp dữ liệu
-- phải đi qua Zeebe đúng một chặng tới business rule task (multi-instance: nhiều người chấm song
-- song, dossier_step chỉ một dòng nên không lưu tạm ở app được).

CREATE TABLE action_variable_binding (
    id VARCHAR(128) PRIMARY KEY,
    process_code VARCHAR(64) NOT NULL,
    task_definition_key VARCHAR(128) NOT NULL,
    action_code VARCHAR(64) NOT NULL REFERENCES action_studio_action(action_code),
    form_field VARCHAR(128) NOT NULL,
    variable_name VARCHAR(128) NOT NULL,
    ghi_chu VARCHAR(1000),
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_action_variable_binding_selector
        UNIQUE (process_code, task_definition_key, action_code, form_field)
);

CREATE INDEX idx_action_variable_binding_lookup
    ON action_variable_binding(process_code, task_definition_key, action_code);

-- VÌ SAO ngoại lệ này tồn tại (chuyển nguyên văn từ javadoc của withDiemSoForT24 trước khi xoá):
-- T24 (Họp HĐXD Tập đoàn phiên 2) là multi-instance — mỗi thành viên hoàn thành một instance riêng,
-- và biến Zeebe outputCollection của multi-instance là nơi DUY NHẤT giữ được N điểm số song song để
-- tính trung bình. dossier_step ở ho-so-service chỉ có 1 dòng theo taskDefinitionKey, nên 3 lượt
-- hoàn thành T24 sẽ ghi đè formData của nhau. Vì vậy CHỈ field điểm số (không phải cả formData)
-- được chuyển thành biến Zeebe cục bộ của đúng instance đó — cùng mẫu "business data ngắn hạn phục
-- vụ DMN" đã có tiền lệ ở SystemCheckJobWorker#checkChuTruongTapDoan (tongDuToan/loaiNhiemVu),
-- không phá D3 vì không lưu lâu dài, chỉ đi qua Zeebe đúng 1 chặng tới business rule task rồi mất.
--
-- Seed đúng một dòng: tái lập nguyên văn hành vi của withDiemSoForT24().
-- Khác biệt CÓ CHỦ Ý so với hàm cũ: hàm cũ chỉ so taskDefinitionKey = 'T24' mà KHÔNG so quy trình,
-- nên bất kỳ quy trình nào về sau đặt tên bước là T24 cũng vô tình gửi kèm điểm số. Chỉ rd0202.bpmn
-- có T24, nên việc ghim thêm process_code không đổi hành vi hiện tại mà bịt cái bẫy đó.
INSERT INTO action_variable_binding
    (id, process_code, task_definition_key, action_code, form_field, variable_name, ghi_chu,
     updated_by, updated_at)
VALUES
    ('AVB-RD02_02-T24-APPROVE_STEP-diemSo', 'RD02_02', 'T24', 'APPROVE_STEP', 'diemSo', 'diemSo',
     'Điểm chấm của từng thành viên HĐXD phiên 2, đi qua Zeebe một chặng tới business rule task xếp loại.',
     'system-seed', NOW())
ON CONFLICT (id) DO NOTHING;
