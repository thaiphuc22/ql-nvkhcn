# Approval Policy

Xác định chính xác khi nào **người thật phải duyệt** trước khi công việc đi tiếp. Mục đích:
ngăn agent tự quyết những thứ khó đảo ngược hoặc có tác động ra ngoài team.

---

## Phải có người duyệt trước khi làm

| Tình huống | Vì sao | Nguồn |
|---|---|---|
| **Chạy `tools/docs-to-drive/publish.js`** — đẩy SRS lên Google Docs / xuất bản ra ngoài repo | Hành động hướng ra ngoài, khó thu hồi; người dùng phải xem bản `.md` trước | **D13** |
| **Gửi batch OQ cho VTS/VTIT** | Giao tiếp với đối tác; sai thì mất uy tín và vòng phản hồi | D7.3 |
| Thay đổi phân công BA hoặc lịch sprint trong `Planning-BA-SRS-GD1-theo-Sprint.xlsx` | Đây là nguồn chính thức của F1, cả team đang chạy theo | D5 |
| Nới/đổi mốc bàn giao, hoặc cắt phạm vi để kịp mốc | Mốc 30/10/2026 là ràng buộc cứng, không thương lượng ở cấp nội bộ | D2 |
| Nâng version một SRS đã phát hành (v0.1 → v0.2+) | Kéo theo nghĩa vụ sửa theo DoD mới và review lại | D6 |
| Sửa/huỷ một quyết định đã `LOCKED` trong `decisions.md` | Theo định nghĩa là quyết định của người, không phải của agent | CLAUDE.md |
| Đổi quy ước mã/tên file SRS sau khi đã có OQ tham chiếu | 115+ OQ đang trỏ theo nhãn hiện tại; đổi tên sẽ phá tham chiếu | D12 |

---

## Agent **không được** tự làm

- Ghi đè hoặc xoá file trong `BA/` (blueprint gốc VTS, SRS đã phát hành, sổ cái OQ) — chỉ
  được **thêm** hoặc sửa đúng ô/dòng đã nêu rõ trong task.
- Ghi bất cứ gì vào `BA/SRS-Open-Question-VTIT.xlsx` — file đã **đóng băng làm di sản** (D14);
  sổ cái OQ hiện hành là [`BA/OQ-TRACKER.md`](../../BA/OQ-TRACKER.md).
- Đánh dấu một OQ là "Đã trả lời" khi cột "Phản hồi VTS" còn trống.
  *(51 OQ đã có phản hồi được người dùng chỉ đạo chuyển sang `Đã trả lời` ngày 2026-08-03 — D14.
  Việc xác minh nội dung phản hồi đã vào SRS chưa nằm ở **V-12**, không phải ở trạng thái OQ.)*
- Đánh dấu một SRS "đã qua review nội bộ" — chỉ người ký vào Trang ký mới tạo ra trạng thái đó.
- Tạo `.docx` hoặc bất kỳ bản xuất bản nào của SRS khi chưa qua cổng duyệt D13.
- Tự đóng một Foundation hoặc tự thêm dòng `LOCKED` vào `decisions.md` mà chưa trình người dùng.

---

## Agent **được** tự quyết

- Thứ tự viết các phân hệ trong cùng một nhóm đã được giao (nêu lý do trong `active-task.md`).
- Cách diễn đạt, bố cục bảng, cách chia mục con **trong khuôn khổ** `SRS_Master_Skill.md` (D4)
  và DoD (D6).
- Tạo mã OQ mới cho một điểm `[CẦN XÁC NHẬN]` phát sinh khi viết (bắt buộc phải tạo, theo D7.1).
- Ghi một dòng vào Nhật ký rà Tầng 2 của `module-dependency-matrix.md` khi có tiêu chí kích hoạt.
- Cập nhật `DELIVERY_STATE.md` / `active-task.md` sau khi xong việc — đây là **nghĩa vụ**, không
  phải lựa chọn.

---

## Cách xin duyệt

1. Dừng đúng hạng mục cần duyệt (các hạng mục khác vẫn làm tiếp).
2. Nêu **phương án cụ thể + đánh đổi**, không hỏi chung chung ("có nên tiếp không?" là không đạt).
3. Kèm đường dẫn tới file/dòng liên quan để người dùng kiểm chứng trong một lượt.
4. Không tự suy diễn là đã được duyệt vì "im lặng nghĩa là đồng ý".
