# Báo cáo đối chiếu Checklist SRS — BM.04 QTKHCN v1.0

| Trường | Giá trị |
|---|---|
| **Tài liệu được check** | `docs/design/BM04-Thiet-ke-chi-tiet-QTKHCN.md` |
| **Checklist** | `3. Checklist_SRS_tongquan.md` + `2. Checklist_SRS_chitiet.md` |
| **Ngày** | 31/07/2026 |
| **Kết luận tổng** | **ĐẠT CÓ ĐIỀU KIỆN** — đủ khung BM.04 + phủ 47 màn wired; còn gap ảnh wireframe, API/DB production, auth nâng cao, và độ sâu checklist 1.6–1.11 trên từng màn |

**Chú thích trạng thái:** ✅ Đạt · 🟡 Đạt một phần · ❌ Chưa đạt · ➖ N/A (ngoài phạm vi / chưa có chức năng)

---

# A. Checklist SRS tổng quan

## A.1 Chuẩn bị trước khi viết

| # | Hạng mục | KQ | Ghi chú |
|---|---|---|---|
| 1.1 | Mục tiêu / phạm vi dự án | ✅ | §1.1–1.2 nêu rõ mock vs production |
| 1.1 | Stakeholder / user cuối | 🟡 | Có nhóm user theo quyền; chưa ma trận stakeholder đầy đủ |
| 1.1 | Nghiệp vụ tổng→chi tiết | 🟡 | Bám docs/req + codebase; chưa interview KH mới |
| 1.2 | Nghiên cứu hiện trạng | ✅ | Dựa frontend mock + docs |
| 1.2 | Phỏng vấn / khảo sát | ➖ | Không có trong phiên bản auto-draft |
| 1.3 | YCKT / Function list | ✅ | Phụ lục A function list 47 mã |
| 1.4 | Demo KH | ➖ | Ngoài phạm vi tài liệu |
| 1.5 | Mẫu tài liệu BM.04 | ✅ | Bám cấu trúc BM.04 + CauTruc_SRS |

## A.2 Triển khai viết tài liệu

| # | Hạng mục | KQ | Ghi chú |
|---|---|---|---|
| 2.1 | Mở đầu (mục đích, phạm vi, thuật ngữ) | ✅ | §1 |
| 2.1 | Tổng quan chức năng + sơ đồ | ✅ | Mermaid §2.1 |
| 2.1 | Tổng quan kiến trúc / giao tiếp | ✅ | §2.2 |
| 2.2 | Bố cục chuẩn BM.04 | ✅ | §1–§6 |
| 2.3.1 | Bảng giới thiệu chức năng | 🟡 | Đủ cho nhóm chính; một số màn PH4 rút gọn bảng |
| 2.3.2 | Luồng nghiệp vụ (sơ đồ) | 🟡 | Có mermaid tổng + mô tả bước; thiếu sơ đồ chi tiết từng màn |
| 2.3.3 | Mô tả luồng + ảnh hưởng + API/DB | 🟡 | Có; API/DB là mục tiêu/TBD |
| 2.3.4 | Màn hình chức năng (UI) | 🟡 | Mô tả đánh số; **thiếu ảnh wireframe/screenshot** |
| 2.3.5 | Mô tả màn hình chi tiết | 🟡 | Bảng thành phần cho màn trọng yếu; màn phụ rút gọn |

## A.3 Lưu ý khi viết

| # | Hạng mục | KQ | Ghi chú |
|---|---|---|---|
| 3.1 | Module hóa / common | ✅ | §3.0 Auth + §4 dùng chung |
| 3.2 | Sắp xếp theo luồng user | ✅ | Login → Portal → PH → nghiệp vụ |
| 3.2 | Đồng nhất mục lục | ✅ | |

**Điểm tổng quan:** ~75% — khung đạt; cần bổ sung ảnh màn hình & độ sâu luồng từng chức năng.

---

# B. Checklist SRS chi tiết

## B.1 Login / Session / Logout / Password

| # | Hạng mục | KQ | Chi tiết |
|---|---|---|---|
| 1.1 | Có đăng nhập? | ✅ | AUTH-01 |
| 1.1 | Đa ngôn ngữ | 🟡 | UI vi_VN; chưa i18n EN |
| 1.1 | Local vs SSO | 🟡 | Hiện Local mock; SSO = mục tiêu F4 |
| 1.1 | Ghi nhớ đăng nhập | ❌ | Chưa |
| 1.1 | Quên mật khẩu | ❌ | Chưa có màn |
| 1.1 | Case lỗi login (validation, sai pass, khóa, captcha, lockout) | 🟡 | Có validation + sai credentials; chưa khóa/captcha/lockout |
| 1.1 | Case thành công (màn sau login, phân quyền, multi-session, log) | 🟡 | Về portal; chưa multi-session policy / login audit DB |
| 1.1 | API/DB login | 🟡 | Mô tả mục tiêu; mock in-memory |
| 1.2 | Phiên (TTL, hết hạn, refresh) | 🟡 | Mô tả gap; chưa implement |
| 1.3 | Logout kỹ thuật | 🟡 | Clear state; chưa revoke API |
| 1.4 | Change password | ❌ | Chưa có |
| 1.5 | Forgot password | ❌ | Chưa có |

## B.2 Màn hình Danh sách (áp dụng chung cho List screens)

Đánh giá theo **mẫu đại diện đã viết sâu** (PORTAL-01, QT-01, PH2-03, WL-01, HS-01) và **mức kế thừa common** cho các list còn lại.

| Nhóm checklist 1.6 | KQ | Ghi chú |
|---|---|---|
| a. Bố cục UI / cột / empty / responsive | 🟡 | Có PageHeader+Filter+Table; chưa spec width cột & mobile chi tiết mọi màn |
| b. Tìm kiếm & lọc | 🟡 | Có trên hầu hết list; rule And ngầm; chưa “Xóa bộ lọc” thống nhất mọi màn |
| c. Sorting | 🟡 | Một số cột (VD instance QT); chưa catalog đầy đủ từng list |
| d. Pagination | 🟡 | EntityTable / scroll Y; **chưa chuẩn hóa pageSize 10/25/50 mọi màn** |
| e. Hành động list / row / bulk | 🟡 | Có row click + CTA; bulk delete hầu như không |
| f. Export | 🟡 | Dashboard có CSV; list nghiệp vụ chưa đồng đều |
| g. Thông báo & trạng thái | ✅ | Toast / Empty / Spin pattern |
| h. NFR list | 🟡 | Chưa chốt số giây/N bản ghi chính thức |
| i. Tích hợp API/DB list | 🟡 | Mock seed; API TBD |
| k. Biên & ngoại lệ | 🟡 | Có hướng xử lý; chưa đủ mọi list |

## B.3 Thêm mới / Sửa / Xóa / Chi tiết / Lịch sử

| Checklist | KQ | Ghi chú |
|---|---|---|
| 1.7 Thêm mới (NV-02, HS-02, QT-02…) | 🟡 | Có luồng chính + quyền; thiếu bảng field đầy đủ mọi form |
| 1.8 Sửa | 🟡 | Có trên một số (form/process); chưa catalog edit mọi entity |
| 1.9 Xóa | 🟡 | Ít soft-delete rõ; nhiều nút disabled F4 |
| 1.10 Xem chi tiết | 🟡 | HS-03, NV-03, QT-03… đạt khung; thiếu ảnh |
| 1.11 Xem lịch sử | 🟡 | SP HistoryDrawer + một số log; chưa chuẩn audit 4 yếu tố mọi entity |

---

# C. Ma trận phủ màn hình × độ sâu TKCT

| Nhóm màn | Số mã | Độ sâu trong BM.04 | Checklist list/detail |
|---|---:|---|---|
| Auth / Portal | 2 | Cao | 🟡 |
| Dashboard | 11 | Trung (nhóm + bảng) | 🟡 (không phải list CRUD) |
| NV / HS / WL / SP | 11 | Trung–Cao | 🟡 |
| PH2 | 4 | Cao (user) / Trung | 🟡 |
| PH3 | 3 | Trung | 🟡 |
| PH4 + HD + INT + LOG | 14 | Trung (QT-01 cao) | 🟡 |
| Help / PH-XX | 2 | Thấp–Trung | ➖ |

---

# D. Danh sách GAP ưu tiên (để nâng BM.04 → “Đạt đầy đủ”)

| Ưu tiên | Gap | Hành động đề xuất |
|---|---|---|
| P0 | Thiếu screenshot/wireframe đánh số | Chụp 47 URL mock hoặc Figma; gắn §3.x.x.2 |
| P0 | API/DB chưa khóa F1 | Sau khi Architect chốt stack → cập nhật endpoint + ERD |
| P1 | Auth: SSO, Remember, Forgot/Change password, session TTL, audit | Viết mục 3.0 bổ sung + backlog F4 |
| P1 | Chuẩn hóa pagination / clear filter / export trên mọi List | Bổ sung kịch bản common §4 + áp từng màn |
| P2 | Sơ đồ luồng BPMN/UI từng chức năng phức tạp (HS-03, Action Studio) | Vẽ mermaid/sequence riêng |
| P2 | Orphan catalog/bao-cao/thong-bao | Gắn route hoặc tách BM.04 phụ lục “Wave 2” |
| P3 | NFR định lượng (perf, a11y, i18n EN) | Lấy từ OQ-006 / NFR chính thức |

---

# E. Kết luận

1. **BM.04 v1.0** đã tạo theo đúng **khung biểu mẫu** (Giới thiệu → Tổng quan → TKCT theo phân hệ → Dùng chung → Quản trị DL → Phụ lục) và **phủ đủ màn hình đã gắn route**.
2. Checklist **tổng quan**: ĐẠT CÓ ĐIỀU KIỆN (thiếu ảnh UI & một phần sơ đồ chi tiết).
3. Checklist **chi tiết**: ĐẠT CÓ ĐIỀU KIỆN — mạnh ở Login cơ bản, Portal Toggle View, QT catalog, User list; yếu ở password flows, pagination chuẩn, API/DB thật, audit lịch sử đồng bộ.
4. Không bịa requirement production: mọi API/DB ghi rõ **mục tiêu / mock**.

**Khuyến nghị bước tiếp:** (1) chèn ảnh màn hình, (2) chốt F1 rồi cập nhật § API/DB, (3) bổ sung Wave 2 cho orphan pages nếu cần vào scope.
