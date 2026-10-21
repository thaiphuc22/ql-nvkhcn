# Review Policy — SRS

> **QTKHCN:** File này **bổ sung**, không thay thế [`review-policy.md`](review-policy.md)
> (review code/PR). Dùng khi task là viết/review SRS. Đường dẫn `BA/...` → `docs/ba/...`.
> Quyết định áp dụng: **D23–D27** (không dùng nguyên bộ D7/D9/D11/D13 của DMS-THTM).

"Review" ở đây là **review tài liệu SRS**. File gốc DMS khoá theo D7/D9/D11/D13; trên QTKHCN
các nguyên tắc tương đương đã được tái khẳng định ở D23–D27.

> File này **không định nghĩa lại** quy trình code review — nó chỉ tóm tắt review SRS. Khi có
> mâu thuẫn về *code*, `review-policy.md` thắng; về *SRS*, D23–D27 thắng.

---

## 4 bước bắt buộc trước khi một SRS được coi là Final

| # | Bước | Ai làm | Nguồn |
|---|---|---|---|
| 0 | **Review blueprint nguồn** — nếu phân hệ chưa có BRN trong `BA/Blueprint Review/`, chạy [`workflows/blueprint-review.md`](../workflows/blueprint-review.md) **trước khi viết SRS** | BA tác giả | D14 |
| 1 | **Tự chấm DoD** — áp [`srs-definition-of-done.md`](srs-definition-of-done.md); mọi tag `[CẦN XÁC NHẬN]`/`[GIẢ ĐỊNH]` phải có mã `OQ-xxx` thật trong **[`BA/OQ-TRACKER.md`](../../BA/OQ-TRACKER.md)**; OQ nào đã có "Phản hồi VTS" thì cập nhật SRS + đổi trạng thái `Mở → Đã trả lời` | BA tác giả | D7.1, D9.2, D14 |
| 1b | **Chạy skill `ba-doc-review`** — chỉ 5 nhóm check áp dụng cho dự án (xem dưới) | BA tác giả | D9.1, D11 |
| 2 | **Review nội bộ** — 1 BA khác (chéo module, không phải người viết) + BA Lead. Ký vào bảng **Trang ký** trong chính file `.md`. **SLA: 2 ngày làm việc** kể từ khi tác giả gửi | BA chéo + BA Lead | D7.2 |
| 3 | **Gửi VTS/VTIT** — không ký duyệt nguyên văn bản, mà gửi **batch OQ** liên quan; theo dõi `Mở → Đã trả lời` | BA tác giả | D7.3 |

**Cổng xuất bản (D13)**: sau bước 2 và **chỉ khi người dùng duyệt tường minh**, bản `.md` mới
được đẩy lên Google Docs bằng `tools/docs-to-drive/publish.js`. AI **không** tự sinh
`.docx`/Google Docs. Xem [`workflows/srs-authoring.md`](../workflows/srs-authoring.md) §5.

---

## Phạm vi `ba-doc-review` đã thu hẹp cho dự án (D9 + D11)

Skill viết theo BABOK cho BRD/User Story. Dự án này **không** viết SRS theo user story, nên
**bỏ hẳn INVEST / MoSCoW / AC Given-When-Then** (nếu dùng sẽ sinh finding rác). Chỉ chạy 5 nhóm:

1. **Ambiguity scan** — loại trừ false-positive khi "nhiều/một số…" mô tả multi-select trên UI
   chứ không phải tuyên bố hiệu năng mơ hồ.
2. **Traceability vs blueprint gốc** — đối chiếu heading `BA/DS Blueprint VTS gửi/…` với mục 3.X
   của SRS; không được thiếu chức năng nào.
3. **Compliance gap** — SRS đụng dữ liệu cá nhân phải dẫn chiếu Nghị định 13/2023, hoặc nêu rõ
   trách nhiệm được đẩy sang module nào.
4. **Message template completeness** — các luồng cùng dạng thao tác phải viết đủ mẫu câu thông
   báo như nhau; luồng chỉ ghi "theo cùng quy tắc với luồng X" là gap testability.
5. **Cross-module dependency check** (D11) — đối chiếu với
   [`state/module-dependency-matrix.md`](../state/module-dependency-matrix.md); flag nếu SRS
   tham chiếu thực thể mà module sở hữu chưa viết / chưa qua review nội bộ.

*Nợ kỹ thuật đã biết của skill*: thiếu `resources/review_rubric.md` và
`resources/review_checklists.md` (README có khai, file không tồn tại). Không chặn — công thức
điểm và checklist đã nhúng trong `SKILL.md` bước 3–4.

---

## Ngưỡng chặn

SRS còn OQ mức **"Cao"** đang **"Mở"** **vẫn được chuyển cho dev** — không chặn cứng — nhưng
phải gắn nhãn **"Nháp chờ VTS"** kèm danh sách mã OQ liên quan **ngay đầu tài liệu**. Đây là
đánh đổi có chủ ý để giữ tiến độ mốc 30/10/2026 (D2/D7).

---

## Áp dụng hồi tố

4 SRS nhóm 1 (`SRS-TTCB-01..04-v0.1`, `.docx`) có Trang ký hoàn toàn trống → **chưa qua review
nào**. Chúng xếp **hàng đợi review chung**, không tách sprint riêng, không chặn tiến độ Gantt
(D7). Chúng cũng **không bắt buộc** convert sang `.md` hay sửa theo DoD mới — chỉ làm khi module
được nâng version (D6, D13).
