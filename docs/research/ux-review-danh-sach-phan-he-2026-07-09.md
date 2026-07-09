# UX review màn `/danh-sach-phan-he`

Ngày ghi nhận: 2026-07-09

## Bối cảnh

Màn `/danh-sach-phan-he` đang đóng vai trò như App Portal/Workspace sau đăng nhập SSO, dùng để hiển thị danh sách các phân hệ của hệ thống QTKHCN.

Đánh giá này tập trung vào 3 câu hỏi:

- Màn có đẹp không?
- Có tiện lợi cho người dùng không?
- Có tuân thủ design chung của app không?

## Nhận xét tổng quan

Màn hiện tại nhìn sạch, dễ hiểu ở mức demo, có đủ tín hiệu thị giác cơ bản như icon, màu phân hệ, trạng thái hoạt động và tag module. Tuy nhiên trải nghiệm vẫn nghiêng về kiểu catalog/landing đẹp mắt hơn là một workspace vận hành thực sự.

Đánh giá nhanh:

| Tiêu chí | Điểm tham khảo | Nhận xét |
|---|---:|---|
| Visual demo | 7/10 | Sạch, có màu sắc, dễ nhận diện phân hệ |
| UX thực dụng | 5.5/10 | Còn thiếu điều hướng thật, quyền truy cập, ghim/gần đây |
| Tuân thủ design chung | 6/10 | Dùng Ant Design và PageHeader nhưng style card/filter hơi lệch hệ thống |

## Màn có đẹp không?

Có, ở mức khá.

Điểm tốt:

- Card có icon, màu accent và trạng thái nên dễ scan.
- Bố cục stats + filter + grid giúp người dùng hiểu nhanh tổng quan số phân hệ.
- Hover effect làm màn có cảm giác hiện đại, có tương tác.
- Tag module giúp người dùng hình dung mỗi phân hệ chứa gì.

Điểm cần cân nhắc:

- Style card bo góc lớn, gradient nhẹ, glow dot và hover lift tạo cảm giác "showcase" nhiều hơn màn nghiệp vụ.
- Các màu accent khá đa dạng, nhưng nếu dùng lâu trong app vận hành có thể hơi rực.
- Card có nhiều style inline riêng, chưa giống các pattern danh sách/filter/card khác của app.
- Trạng thái "Sắp ra mắt" chỉ làm mờ card, chưa đủ rõ về lý do không vào được hoặc lộ trình có thể dùng.

Kết luận: đẹp cho demo/presale, nhưng nên tiết chế hơn nếu đây là màn workspace dùng hàng ngày.

## Có tiện lợi cho người dùng không?

Chưa thật sự tiện cho người dùng cuối.

Các vấn đề chính:

- Bấm card "Đang hoạt động" nhưng hiện dữ liệu route đều trỏ lại chính `/danh-sach-phan-he`, nên người dùng có cảm giác bấm vào không có phản hồi hữu ích.
- Chưa có "phân hệ gần đây" hoặc "ghim phân hệ thường dùng", trong khi đây là nhu cầu tự nhiên của App Portal.
- Search hiện chỉ xử lý `toLowerCase`, chưa hỗ trợ tìm không dấu. Người dùng gõ `phan quyen`, `quy trinh`, `danh muc` có thể không tìm được kết quả như kỳ vọng.
- Chưa lọc theo quyền người dùng. Màn nên chỉ hiển thị phân hệ/app được cấp quyền hoặc hiển thị rõ trạng thái không có quyền.
- Chưa có empty state cho trường hợp user không được cấp quyền phân hệ nào.
- Card dùng `div onClick`, chưa thân thiện với bàn phím/screen reader.
- Các card "coming soon" không có CTA hoặc giải thích tiếp theo, ví dụ "Liên hệ quản trị", "Chưa triển khai", "Dự kiến Q4/2026".

Với người dùng thật, màn này nên ưu tiên:

- Vào nhanh phân hệ được phép truy cập.
- Thấy phân hệ hay dùng/gần đây trước.
- Tìm kiếm được theo tiếng Việt có dấu và không dấu.
- Không bị bấm vào các điểm không có kết quả.
- Hiểu rõ vì sao một phân hệ bị khóa/chưa mở.

## Có tuân thủ design chung của app không?

Tuân thủ một phần.

Các điểm đang đúng hướng:

- Dùng `PageHeader`.
- Dùng Ant Design components như `Row`, `Col`, `Button`, `Input`, `Tag`, `Badge`.
- Có cấu trúc stats + filter + danh sách khá quen với các màn quản trị.
- Tone tổng thể vẫn nằm trong hệ thống QTKHCN.

Các điểm đang lệch:

- Card tự style inline nhiều, chưa dùng pattern/component chung của app.
- Bo góc 16px, gradient, glow và hover lift nổi bật hơn các màn nghiệp vụ còn lại.
- Filter button dạng pill/round khác với cách filter bar ở nhiều màn danh sách.
- Breadcrumb đang xử lý lệch pattern `PageHeader`: màn tự set breadcrumb bằng `useState`, trong khi `PageHeader` đã có cơ chế nhận `breadcrumb`.
- Route `/danh-sach-phan-he` chưa có selected key/section riêng trong layout, nên dễ bị highlight nhầm về "Quản trị quy trình".
- Màn chưa thể hiện rõ đây là App Portal được cá nhân hóa theo quyền, gần đây, ghim, thông báo.

## Đề xuất cải thiện UX

### Ưu tiên cao

1. Sửa điều hướng card

Gắn route thật cho các phân hệ đang hoạt động. Ví dụ:

- PH1: `/tong-quan` hoặc `/danh-sach-phan-he`
- PH2: `/co-cau-to-chuc`, `/nguoi-dung`, `/phan-quyen`
- PH3: `/bieu-mau`
- PH4: `/quy-trinh`, `/ma-tran-phe-duyet`, `/cau-hinh-hanh-dong`, `/giam-sat`

Nếu một phân hệ có nhiều module, card chính có thể mở panel/drawer module con thay vì đi thẳng một route.

2. Hiển thị theo quyền

Danh sách phân hệ nên dựa trên quyền hiện tại của user. Nếu user không có quyền vào một phân hệ:

- Ẩn phân hệ đó; hoặc
- Hiển thị disabled kèm lý do "Bạn chưa được cấp quyền".

3. Hỗ trợ search không dấu

Normalize text trước khi search để các truy vấn như `phan quyen`, `quy trinh`, `danh muc` vẫn tìm đúng.

4. Sửa breadcrumb và selected section

Màn nên truyền `breadcrumb` vào `PageHeader`, đồng thời layout nên có case riêng cho `/danh-sach-phan-he` để không highlight nhầm menu nghiệp vụ khác.

### Ưu tiên trung bình

5. Thêm nhóm "Gần đây" và "Đã ghim"

App Portal sẽ tiện hơn nếu đầu màn có:

- Phân hệ gần đây.
- Phân hệ đã ghim.
- Tất cả phân hệ được cấp quyền.

6. Làm rõ trạng thái phân hệ

Thay vì chỉ có `active` và `coming-soon`, nên cân nhắc:

- Đang hoạt động.
- Chưa triển khai.
- Chưa được cấp quyền.
- Đang bảo trì.

7. Cải thiện accessibility

Card nên là `button`/`a` hoặc có đầy đủ:

- `role="button"`
- `tabIndex`
- `onKeyDown` cho Enter/Space
- `aria-disabled` nếu chưa truy cập được

### Ưu tiên thấp

8. Tiết chế visual để hợp design system hơn

Nên giảm bớt gradient/glow, dùng border/fill nhẹ hơn, bo góc gần với hệ thống hơn, và cân nhắc dùng pattern `FilterBar`/component chung nếu phù hợp.

9. Thêm thông tin hữu ích trong card

Có thể bổ sung:

- Số module con.
- Số việc cần xử lý trong phân hệ.
- Badge thông báo mới.
- Lần truy cập gần nhất.

## Kết luận

Màn `/danh-sach-phan-he` hiện tại có nền tảng visual tốt cho demo, nhưng để trở thành App Portal thật sự tiện dụng thì cần dịch trọng tâm từ "trưng bày danh sách phân hệ" sang "điểm vào cá nhân hóa theo quyền và thói quen sử dụng".

Ưu tiên nên làm trước:

1. Sửa route/điều hướng để card bấm có kết quả thật.
2. Lọc theo quyền người dùng.
3. Search không dấu.
4. Sửa breadcrumb/selected section theo pattern chung.
5. Bổ sung ghim/gần đây để màn này thực sự hữu ích mỗi ngày.
