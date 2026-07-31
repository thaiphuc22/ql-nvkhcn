-- Liên kết thành viên Hội đồng xét duyệt với tài khoản thật.
--
-- V9 chỉ lưu `ho_ten` free-text, đủ để in ra QĐ thành lập nhưng KHÔNG đủ để giao việc: không có
-- định danh nào để đưa vào `candidateUsers` của user task, nên các bước họp hội đồng (T07/T10 cấp
-- Cơ sở, T21/T24 cấp Tập đoàn) chỉ dựa được vào `candidateGroups="HDXD"/"HDXD_TD"` — tức mọi người
-- giữ vai trò đó đều thấy task của MỌI hồ sơ, kể cả hồ sơ họ không thuộc hội đồng.
--
-- `user_id` dùng cùng định danh với `X-QTKHCN-User-Id` / `WorkflowTaskProjection.assignee` /
-- `candidate_users` — tức EMAIL viết thường (xem IdentityService.effective: EffectivePermissionsResponse
-- trả `userId = u.email`, và WorkflowDemoIdentityProvider.validate lowercase header). Không dùng UUID
-- để khỏi phải tra ngược identity-service ở mọi chỗ so khớp.
--
-- NULLABLE có chủ ý: hội đồng đã sinh trước migration này (và mọi QĐ nhập tay chỉ có họ tên) không có
-- userId. Luật fail-closed đi kèm ở tầng ứng dụng là "candidateUsers rỗng ⇒ không thu hẹp gì, giữ
-- nguyên hành vi cũ theo candidateGroups", nên dữ liệu cũ tiếp tục chạy đúng như trước thay vì kẹt.

ALTER TABLE hoi_dong_thanh_vien ADD COLUMN user_id VARCHAR(128);

COMMENT ON COLUMN hoi_dong_thanh_vien.user_id IS
    'Định danh tài khoản (email viết thường) của thành viên; NULL = QĐ chỉ ghi họ tên, không giao việc được.';

-- Tra "danh sách userId của hội đồng thuộc hồ sơ X" là truy vấn nóng (mỗi lần sinh HĐ + mỗi lần kiểm
-- tra quyền thao tác), luôn đi kèm hoi_dong_id.
CREATE INDEX idx_hoi_dong_thanh_vien_user_id ON hoi_dong_thanh_vien (hoi_dong_id, user_id);
