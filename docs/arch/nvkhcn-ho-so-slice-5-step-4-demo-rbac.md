# Lát 5, bước 4 — identity/role mapping cho tài khoản demo

Ngày triển khai: 2026-07-18.

## Quyết định

`GET /api/my-tasks` không còn tin `X-QTKHCN-Role-Codes` từ request. Service Hồ sơ chỉ đọc
`X-QTKHCN-User-Id`, chuẩn hóa email và tra catalog backend của 5 tài khoản Angular demo:

| Identity | Candidate groups |
|---|---|
| `pm@example.com` | `PM`, `PA`, `NNC` |
| `cqnv@example.com` | `CQ_KHCN`, `CQ_MS`, `CQ_NS`, `CQ_TCKT` |
| `tgd@example.com` | `TGD_VHT` |
| `hdkhcn@example.com` | `HDKHCN`, `HDXD`, `HDXD_DC`, `HDNT`, `HD_DGHT` |
| `admin@example.com` | admin — mọi task `ACTIVE` |

Identity thiếu trả `400`; identity không có trong catalog trả `403`. Role tự khai trong header bị bỏ qua,
nên client không thể thêm `PM` hoặc role quản trị để mở rộng kết quả. Việc so khớp assignee, candidate user
và candidate group vẫn chạy trong database.

## Trust boundary

Đây là RBAC backend thật cho phạm vi demo nhưng chưa phải xác thực production. Gateway phải xác thực phiên
demo và ghi đè `X-QTKHCN-User-Id`; service token tiếp tục bảo vệ port nội bộ. Khi OIDC/IAM được chốt, thay
`DemoIdentityProvider` bằng adapter đọc subject/groups đã được xác thực, không thay contract truy vấn task.

## Kiểm thử

Test khóa đủ 5 mapping, chuẩn hóa email, admin visibility, identity thiếu/lạ và trường hợp attacker gửi
`X-QTKHCN-Role-Codes: PM` nhưng không có identity hợp lệ. Contract test cũng xác nhận service bearer token
vẫn bắt buộc.
