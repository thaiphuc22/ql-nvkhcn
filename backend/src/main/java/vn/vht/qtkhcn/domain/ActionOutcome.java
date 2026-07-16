package vn.vht.qtkhcn.domain;

/**
 * Kết quả xử lý 1 bước hồ sơ — port từ mô hình "per-outcome STANDARD actions" đã khoá ở D10
 * (webapp/src/data/actionRegistry.ts): APPROVE_STEP/RETURN_STEP/REJECT_STEP thay cho 1 action
 * PROCESS_STEP chung. Routing đích cụ thể (đi đâu khi RETURN) vẫn là GAP — Mốc 2 chỉ chuyển bước
 * kế tiếp/trước tuyến tính; port đầy đủ webapp/src/data/stepRouting.ts::ROUTING_TABLES là việc
 * của Mốc 6+ (strangler migration), xem active-task.md.
 */
public enum ActionOutcome {
    APPROVE_STEP,
    RETURN_STEP,
    REJECT_STEP
}
