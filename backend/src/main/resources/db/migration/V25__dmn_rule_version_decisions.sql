-- Một phiên bản DMN có thể là DRD gồm NHIỀU decision nối chuỗi. Bảng con này giữ đầy đủ các
-- decision đã deploy của một version; cờ is_root đánh dấu decision "gốc" (terminal — không bị
-- decision nào khác yêu cầu qua requiredDecision), là điểm bắt đầu khi evaluate.
-- 4 cột số ít trên dmn_rule_version (camunda_decision_key/id/version) vẫn giữ nguyên, mang giá trị
-- của root đầu tiên theo thứ tự tài liệu ("primary root") để tương thích ngược với CHECK V7.
CREATE TABLE dmn_rule_version_decision (
    id                       UUID PRIMARY KEY,
    rule_version_id          UUID NOT NULL REFERENCES dmn_rule_version (id) ON DELETE CASCADE,
    decision_id              VARCHAR(255) NOT NULL,
    decision_name            VARCHAR(255),
    camunda_decision_key     BIGINT NOT NULL,
    camunda_decision_version INTEGER NOT NULL,
    is_root                  BOOLEAN NOT NULL DEFAULT FALSE,
    display_order            INTEGER NOT NULL DEFAULT 0,
    UNIQUE (rule_version_id, decision_id)
);

CREATE INDEX idx_dmn_rule_version_decision_version
    ON dmn_rule_version_decision (rule_version_id, display_order);
