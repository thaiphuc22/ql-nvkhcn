# Workflow Designer (BPMN) --- Quy trình xử lý hồ sơ

## Vai trò

Workflow Designer dùng để thiết kế **quy trình xử lý của hồ sơ** dưới
dạng sơ đồ BPMN.

Một quy trình mô tả **hồ sơ sẽ đi qua những bước nào**, **theo thứ tự
nào**, **có những nhánh xử lý nào**, **khi nào kết thúc**.

Workflow chỉ mô tả **trình tự xử lý**, **không quyết định người xử lý cụ
thể** và **không chứa các luật nghiệp vụ chi tiết**.

Ví dụ:

-   Hồ sơ đi qua các bước: Tiếp nhận → Thẩm định → Phê duyệt → Ban hành.
-   Sau bước Thẩm định có thể chuyển sang Hội đồng hoặc Phê duyệt cuối
    cùng.
-   Mỗi bước sử dụng biểu mẫu (Form) nào.
-   Thời hạn xử lý (SLA) của từng bước.

### Dùng khi

-   Thiết kế quy trình mới.
-   Thêm hoặc xóa bước xử lý.
-   Thay đổi thứ tự các bước.
-   Thêm hoặc sửa nhánh điều hướng.
-   Gắn biểu mẫu cho từng bước.
-   Cấu hình thời hạn xử lý của từng bước.

------------------------------------------------------------------------

# Business Rule Studio (DMN) --- Luật nghiệp vụ

## Vai trò

Business Rule Studio dùng để định nghĩa **các quyết định nghiệp vụ**
dưới dạng Decision Table (DMN).

DMN nhận dữ liệu của hồ sơ làm đầu vào và trả về các quyết định để quy
trình sử dụng trong quá trình xử lý.

DMN **không điều khiển quy trình trực tiếp**, mà cung cấp các kết quả để
BPMN quyết định bước tiếp theo hoặc cấu hình quá trình xử lý.

Ví dụ:

-   Hồ sơ này thuộc cấp nào?
-   Có cần Hội đồng thẩm định hay không?
-   Cấp phê duyệt là L1, L2 hay L3?
-   SLA xử lý là bao nhiêu ngày?
-   Có cần gửi thông báo cho lãnh đạo không?

### Ví dụ Decision Table

  Tổng dự toán     Mức rủi ro   Kết quả
  ---------------- ------------ ---------------
  ≤ 100 triệu      Thấp         L1
  100--500 triệu   Trung bình   L2
  \> 500 triệu     Cao          L3 + Hội đồng

### Dùng khi

-   Thay đổi điều kiện nghiệp vụ.
-   Điều chỉnh ngưỡng xét duyệt.
-   Bổ sung hoặc sửa Decision Table.
-   Kiểm thử và mô phỏng luật nghiệp vụ.

------------------------------------------------------------------------

# Approval Matrix --- Xác định người xử lý

## Vai trò

Approval Matrix dùng để **xác định người hoặc nhóm người thực hiện tại
từng bước của quy trình**.

Sau khi BPMN xác định đang ở bước nào và DMN xác định cần cấp phê duyệt
nào, Approval Matrix sẽ tra cứu cơ cấu tổ chức để tìm đúng người xử lý.

Approval Matrix trả lời câu hỏi:

> **Ở bước này, với hồ sơ này, ai sẽ là người thực hiện?**

Approval Matrix có thể căn cứ vào:

-   Loại hồ sơ.
-   Cấp hồ sơ.
-   Vai trò cần xử lý.
-   Đơn vị.
-   Chức danh.
-   Cơ cấu tổ chức.
-   Hiệu lực theo thời gian.
-   Quy tắc ủy quyền.

### Ví dụ

  Vai trò                    Đơn vị   Cấp   Người xử lý
  -------------------------- -------- ----- --------------
  Trưởng phòng               CNTT     L1    Nguyễn Văn A
  Giám đốc                   CNTT     L3    Trần Văn B
  Giám đốc (được ủy quyền)   CNTT     L3    Phạm Văn C

### Dùng khi

-   Thay đổi người phê duyệt.
-   Thay đổi cơ cấu tổ chức.
-   Thiết lập ủy quyền tạm thời.
-   Thay đổi quy tắc phân công.
-   Kiểm tra ai sẽ xử lý một hồ sơ cụ thể.

------------------------------------------------------------------------

# Action Studio --- Hành động trên hồ sơ

## Vai trò

Action Studio dùng để cấu hình **các hành động mà người dùng được phép
thực hiện** tại từng bước của quy trình.

Hệ thống sẽ xác định:

-   Hành động nào được hiển thị.
-   Hành động nào bị ẩn.
-   Hành động nào bị vô hiệu hóa.
-   Hành động nào yêu cầu mở biểu mẫu trước khi thực hiện.

Action Studio trả lời câu hỏi:

> **Người dùng này, tại bước này, được phép thực hiện những hành động
> gì?**

### Ví dụ

Ở bước "Thẩm định"

Người thẩm định có thể thấy:

-   Đồng ý
-   Yêu cầu bổ sung
-   Từ chối
-   Chuyển xử lý

### Dùng khi

-   Thêm hoặc xóa hành động.
-   Thay đổi quyền hiển thị hành động.
-   Cấu hình hành động ngoại lệ.
-   Điều chỉnh giao diện theo từng vai trò.
-   Mô phỏng trải nghiệm người dùng.

------------------------------------------------------------------------

# Mối quan hệ giữa bốn thành phần

## 1. Workflow Designer (BPMN)

**Hồ sơ đi qua những bước nào?**

## 2. Business Rule Studio (DMN)

**Quy trình cần áp dụng chính sách hoặc quyết định nào?**

## 3. Approval Matrix

**Ai là người thực hiện tại bước đó?**

## 4. Action Studio

**Người đó được phép thực hiện những hành động gì?**

------------------------------------------------------------------------

# Toàn bộ vòng đời xử lý

``` text
Hồ sơ
   │
   ▼
Workflow Designer (BPMN)
   │
   ▼
Business Rule Studio (DMN)
   │
   ▼
Approval Matrix
   │
   ▼
Camunda tạo User Task
   │
   ▼
Action Studio
   │
   ▼
Người dùng thực hiện
   │
   ▼
BPMN chuyển sang bước tiếp theo
   │
   ▼
Kết thúc
```

------------------------------------------------------------------------

# Ghi nhớ nhanh

  Thành phần                   Câu hỏi trả lời
  ---------------------------- ---------------------------------------
  Workflow Designer (BPMN)     Hồ sơ đi qua những bước nào?
  Business Rule Studio (DMN)   Quy trình cần áp dụng quyết định nào?
  Approval Matrix              Ai là người thực hiện?
  Action Studio                Người đó được phép làm gì?

Bốn thành phần phối hợp để bảo đảm mỗi hồ sơ được xử lý **đúng quy
trình, đúng luật nghiệp vụ, đúng người thực hiện và đúng quyền thao
tác**, đồng thời giảm thiểu việc phải sửa mã nguồn khi nghiệp vụ thay
đổi.
