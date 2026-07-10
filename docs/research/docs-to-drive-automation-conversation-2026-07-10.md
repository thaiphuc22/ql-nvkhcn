# Conversation Note - Docs-to-Drive Automation

Date: 2026-07-10

Scope: Tự động hóa convert các file Markdown trong repo sang Google Docs và publish lên Google Drive.

---

## 1. Mục tiêu

Convert file `.md` trong `docs/` (arch, req, research, design_sample...) thành Google Docs native trên Drive, để chia sẻ cho người không dùng git. Không cần CI tự động — chạy tay khi cần, phạm vi file tự chọn theo từng lần chạy.

## 2. Quyết định thiết kế

- **Format đích**: Google Docs native (không phải PDF) — cho phép edit/comment trực tiếp trên Drive.
- **Trigger**: chạy tay bằng script Node, không gắn GitHub Actions.
- **Scope**: người dùng tự chỉ định file/folder mỗi lần chạy (không có danh sách cố định).
- **Vị trí code**: `tools/docs-to-drive/` — package Node riêng, tách khỏi `webapp/` để không lẫn dependency.
- **Cơ chế convert**: MD → HTML (dùng `marked`, không cần cài pandoc ngoài) → upload lên Drive API với `mimeType: application/vnd.google-apps.document` để Drive tự convert.
- **Idempotency**: `tools/docs-to-drive/manifest.json` map đường dẫn file → `fileId` để lần chạy sau `files.update` (ghi đè nội dung, giữ nguyên link) thay vì tạo file trùng.
- **3 file có sơ đồ Mermaid** (`camunda-app-role-diagram.md`, `data-model-NV-vs-HoSo.md`, `camunda-nvkh-relationship-diagram.md`) sẽ không render diagram đúng — code-block bị đẩy lên dạng text thô. Cần bước render mermaid→PNG riêng nếu muốn xử lý các file này (chưa làm).

## 3. Lịch sử pivot cơ chế Auth (quan trọng — tránh lặp lại)

1. Ban đầu chọn **OAuth tài khoản cá nhân** (đơn giản, publish thẳng vào My Drive).
2. User sau đó dán trực tiếp **service account key JSON** (project `graphite-bliss-450908-s0`, email `thaiphuc22@graphite-bliss-450908-s0.iam.gserviceaccount.com`) vào chat để chuyển sang Service Account.
   - **Sự cố bảo mật**: private key bị dán dạng cleartext vào transcript chat → coi như đã lộ. Đã khuyến nghị rotate key trên Cloud Console (xóa key `80b71a1e...`, tạo key mới). Key tạm thời được lưu vào `tools/docs-to-drive/.credentials/service-account.json` (đã gitignore qua rule `tools/docs-to-drive/.credentials/` trong `.gitignore` gốc — xác nhận bằng `git check-ignore`).
   - **Bài học**: không dán nội dung credential vào chat nữa — chỉ gửi đường dẫn file, Claude đọc bằng tool Read.
3. Test chạy `node publish.js docs/req/RTM.md` với Service Account → lỗi `403 storageQuotaExceeded`.
   - User kiểm tra `drive.google.com/settings/storage`: **82% đầy** (~2.7GB còn trống) → không phải hết dung lượng thật.
   - **Nguyên nhân thực sự**: Service account không có storage quota riêng và **không thể sở hữu file Google Docs native trong My Drive cá nhân**, kể cả khi folder đích đã share Editor cho nó. Cơ chế "file trong folder share tính quota vào chủ folder" chỉ ổn định với file nhị phân thường (PDF/DOCX), không áp dụng cho file convert-on-upload thành Google Docs native — trừ khi dùng Shared Drive hoặc domain-wide delegation (cả hai đều chỉ có ở Google Workspace, không có ở Gmail cá nhân).
   - **Hướng xử lý đề xuất (chưa chốt xong vì hội thoại bị ngắt)**: quay lại **OAuth tài khoản cá nhân** — lợi thế thêm là Google Docs/Sheets/Slides do tài khoản thật sở hữu **không tính vào storage quota**, nên vấn đề 82% đầy cũng không còn liên quan.

## 4. Trạng thái hiện tại (tại thời điểm ghi chú)

- Code đã dựng xong tại `tools/docs-to-drive/` (`package.json`, `config.json` với `rootFolderId` đã điền `1CISFW71QrsNT7XKDmwS2L-N75edcFDSX`, `manifest.json`, `publish.js`, `.gitignore` cho `node_modules`).
- Auth hiện đang dùng `google.auth.GoogleAuth` với service account key — **không hoạt động** do giới hạn quota ở trên.
- **Việc cần làm tiếp**: sửa `publish.js` để dùng OAuth Client (Desktop app) trong cùng project `graphite-bliss-450908-s0` thay vì `GoogleAuth` service account — cần user tạo OAuth Client ID trên Cloud Console, tải `client_secret.json`, gửi đường dẫn file (không dán nội dung).
- Sau khi có `client_secret.json`, cần thêm luồng OAuth first-run (mở URL consent, cache refresh token vào `.credentials/token.json`, cũng phải gitignore).
