# Quy trình coding và deploy an toàn cho môi trường demo

## 1. Mục tiêu

Quy trình này bảo đảm hoạt động coding hằng ngày không làm gián đoạn bản demo full-stack đang được truy cập qua Runlocal.

Nguyên tắc bắt buộc:

- Không chạy bản demo từ workspace đang chỉnh sửa.
- Không build đè trực tiếp lên release đang phục vụ người dùng.
- Chỉ deploy source đã commit và đã qua test.
- Mỗi lần deploy tạo một release độc lập, có thể rollback nhanh.
- Không restart Runlocal nếu không thực sự cần thiết vì URL miễn phí thay đổi khi tạo phiên tunnel mới.

Môi trường hiện tại là demo ngắn hạn chạy trên máy dev, không phải production/UAT và không có cam kết uptime.

## 2. Tách môi trường

### Workspace phát triển

Dùng repository chính để coding, chạy dev server, test và thay đổi database phục vụ phát triển.

Ví dụ:

```text
C:\Users\phuctd7\ql-nvkhcn
```

Workspace này không được Caddy của bản demo sử dụng làm static root và không được dùng để chạy backend demo.

### Workspace release

Mỗi release được tạo từ một commit/tag đã xác định trong thư mục riêng:

```text
C:\Users\phuctd7\qtkhcn-demo\releases\<release-id>
```

Ví dụ `release-id`:

```text
2026-07-16.1_bad5ecb
```

Chỉ workspace release được phép cung cấp Angular static files và backend cho Caddy.

### Dữ liệu

- Database demo phải tách khỏi database dev nếu có thể.
- Chỉ sử dụng dữ liệu demo hoặc đã ẩn danh.
- Tạo backup trước mỗi lần deploy có migration hoặc thay đổi nghiệp vụ ghi dữ liệu.
- Mọi migration phải có phương án rollback hoặc restore từ backup.

## 3. Quy trình coding

1. Cập nhật `main` và tạo branch tính năng/sửa lỗi.
2. Coding trong branch hoặc Git worktree riêng.
3. Không sửa file trong thư mục release đang chạy.
4. Không dùng port của môi trường demo cho dev server.
5. Chạy test phù hợp trước khi tạo pull request hoặc merge.
6. Merge vào `main` chỉ khi review và CI đạt.
7. Gắn tag hoặc ghi lại chính xác commit SHA dùng để deploy.

Quy ước branch gợi ý:

```text
feature/<ten-chuc-nang>
fix/<ten-loi>
deploy/<release-id>
```

## 4. Điều kiện trước deploy

Chỉ bắt đầu deploy khi tất cả điều kiện sau đạt:

- Working tree dùng để tạo release sạch.
- Commit cần deploy tồn tại trên remote và đã được review.
- Backend tests đạt.
- Angular tests và production demo build đạt.
- React mock build đạt nếu release có thay đổi GitHub Pages.
- Không có credential, API key, password hash, database dump hoặc log trong commit.
- Các Docker published port và backend chỉ bind `127.0.0.1`.
- Đã xác nhận cửa sổ deploy và thông báo cho người đang dùng demo nếu có khả năng gián đoạn.
- Đã tạo backup database khi thay đổi có thể ảnh hưởng dữ liệu.
- Release hiện tại vẫn còn nguyên để rollback.

Nếu thiếu một điều kiện bắt buộc, quyết định là **No-Go**.

## 5. Tạo release

1. Fetch remote và checkout đúng commit vào worktree/thư mục release mới.
2. Ghi metadata release gồm:
   - Release ID.
   - Commit SHA.
   - Thời điểm build/deploy.
   - Người thực hiện.
   - Database migration áp dụng, nếu có.
3. Build backend từ checkout sạch.
4. Build Angular bằng configuration `production,demo`.
5. Kiểm tra demo bundle không chứa:
   - `localhost:8090`.
   - API key nội bộ.
   - Basic Auth credential.
6. Không sửa artifact sau khi đã hoàn tất kiểm tra.

Không xóa release trước ngay sau deploy. Giữ tối thiểu release đang chạy và một release gần nhất đã hoạt động tốt.

## 6. Deploy release

### Bước 1: Pre-deploy

1. Kiểm tra Runlocal, Caddy, backend và Docker hiện tại còn healthy.
2. Ghi nhận URL tunnel hiện tại.
3. Tạo backup PostgreSQL nếu cần.
4. Xác nhận có thể khởi động release mới trên port kiểm tra riêng mà chưa ảnh hưởng release hiện tại.

### Bước 2: Khởi động release mới

1. Sinh API key nội bộ mới nếu chính sách yêu cầu.
2. Đặt `QTKHCN_CORS_ALLOWED_ORIGINS` gồm `http://localhost:4200` và chính xác URL HTTPS Runlocal hiện tại,
   rồi khởi động backend mới trên loopback và port tạm, ví dụ `127.0.0.1:8091`.
3. Chạy health check trực tiếp vào backend mới.
4. Kiểm tra Angular static files của release mới.
5. Áp dụng migration có kiểm soát nếu release yêu cầu.

API key nội bộ chỉ dùng giữa Caddy và backend. Không gửi key này cho end user.

### Bước 3: Chuyển traffic

1. Cập nhật Caddy sang static root và backend port của release mới.
2. Chạy `caddy validate`.
3. Reload Caddy thay vì dừng toàn bộ tiến trình nếu cấu hình cho phép.
4. Không restart Runlocal trong bước chuyển release.

### Bước 4: Smoke test sau chuyển

Kiểm tra theo thứ tự:

1. Không có Basic Auth trả `401`.
2. Sai Basic Auth trả `401`.
3. Auth đúng tải Angular UI và static assets thành công.
4. Refresh trực tiếp một Angular route trả SPA fallback thành công.
5. `/api/ho-so` qua public URL trả `200`.
6. Một luồng đọc dữ liệu nghiệp vụ hoạt động.
7. Một luồng ghi có thể reset hoạt động nếu release có thay đổi liên quan.
8. Chức năng Test BPMN kết nối đúng BPMN test engine dùng chung của môi trường demo.
9. GitHub Pages vẫn mở đúng URL demo backend nếu URL tunnel không đổi.

### Bước 5: Hoàn tất

1. Ghi nhận release mới là release hiện hành.
2. Giữ backend/release cũ trong thời gian theo dõi ngắn nếu không gây xung đột dữ liệu.
3. Theo dõi log Caddy, backend, Docker và Runlocal.
4. Không ghi Authorization header, password, API key hoặc Runlocal inspector URL vào log/báo cáo.

## 7. Quy tắc credential

### Basic Auth

- Có thể giữ ổn định giữa các lần deploy để không bắt end user nhận lại password.
- Chỉ rotate khi credential bị lộ/nghi ngờ lộ, hết thời hạn theo chính sách hoặc thay đổi nhóm người được phép truy cập.
- Chỉ chia sẻ qua kênh được phê duyệt.

### API key nội bộ

- Không gửi cho end user.
- Không đưa vào frontend bundle, GitHub Pages JSON hoặc Git history.
- Caddy inject key server-side khi chuyển request `/api/*` tới backend.
- Có thể rotate theo release mà không ảnh hưởng Basic Auth của end user.

### Runlocal

- Không chia sẻ inspector URL.
- Không commit proxy URL nội bộ.
- Nếu tunnel bắt buộc phải restart, phải smoke test URL mới trước khi cập nhật GitHub Pages.

## 8. Rollback

Rollback ngay khi có một trong các dấu hiệu:

- Health check hoặc smoke test thất bại.
- Tỷ lệ lỗi API tăng bất thường.
- UI không tải được hoặc SPA routing lỗi.
- Migration gây sai dữ liệu.
- Basic Auth không còn bảo vệ toàn bộ UI/API.

Trình tự rollback:

1. Chuyển Caddy về static root và backend port của release trước.
2. Chạy `caddy validate` và reload Caddy.
3. Smoke test lại Basic Auth, UI, SPA route và API.
4. Rollback migration hoặc restore database backup nếu cần.
5. Dừng release lỗi sau khi đã thu thập log cần thiết.
6. Ghi nhận sự cố, nguyên nhân và quyết định tiếp theo.

Nếu có nguy cơ lộ dữ liệu hoặc mất kiểm soát truy cập, dừng Runlocal ngay lập tức để cắt public access trước khi điều tra.

## 9. Khi URL tunnel thay đổi

1. Khởi động Runlocal và lấy HTTPS URL mới.
2. Xác nhận không có/sai auth trả `401`.
3. Xác nhận UI, SPA fallback và API có auth trả `200`.
4. Cập nhật duy nhất trường `url` trong `webapp/public/be-demo-link.json`.
5. Build React mock từ checkout sạch.
6. Commit/push thay đổi và theo dõi GitHub Pages workflow.
7. Kiểm tra JSON production và nút `Demo có Backend` trỏ đúng URL mới.
8. Chỉ sau đó mới gửi URL cho người dùng.

Không ghi username, password, API key, proxy URL hoặc inspector URL vào `be-demo-link.json`.

## 10. Checklist deploy rút gọn

### Trước deploy

- [ ] Commit/tag cần deploy đã xác định.
- [ ] Tests và builds đạt.
- [ ] Không có secret trong commit/artifact.
- [ ] Backup database hoàn tất nếu cần.
- [ ] Release trước còn khả dụng để rollback.
- [ ] Tunnel/Caddy/runtime hiện tại đang healthy.

### Trong deploy

- [ ] Release mới được tạo trong thư mục riêng.
- [ ] Backend mới chạy loopback và qua health check.
- [ ] Caddy config đã validate.
- [ ] Traffic được chuyển mà không restart tunnel.

### Sau deploy

- [ ] Không auth và sai auth trả `401`.
- [ ] UI, asset và SPA fallback hoạt động.
- [ ] API và BPMN test hoạt động.
- [ ] GitHub Pages trỏ đúng public URL.
- [ ] Log không chứa credential.
- [ ] Release ID, commit SHA và kết quả deploy đã được ghi nhận.

## 11. Hướng phát triển dài hạn

Quy trình trên giảm rủi ro khi vẫn chạy demo trên máy dev. Để đạt độ ổn định cao hơn, cần chuyển sang môi trường staging riêng với:

- Máy/VM độc lập với workspace coding.
- Container image bất biến theo version.
- Database demo riêng.
- Domain cố định và access gateway phù hợp.
- CI/CD có approval, health check và rollback tự động.
- Monitoring, log retention và backup theo chính sách.
