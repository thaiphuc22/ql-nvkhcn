# SRS — Khung mẫu mô tả màn hình

File này là **thứ để copy khi viết một màn hình mới**. Nó không định nghĩa lại chuẩn — chuẩn nằm
ở [`BA/Ung-dung-AI/0. SRS_Master_Skill.md`](../../BA/Ung-dung-AI/0.%20SRS_Master_Skill.md) (D4) và
checklist ở [`srs-definition-of-done.md`](srs-definition-of-done.md). Khi có mâu thuẫn,
[`state/decisions.md`](../state/decisions.md) thắng.

Áp dụng theo **D16** (2026-08-05), sau khi đối chiếu `BA/Template tài liệu/SAMPLE_TKCT_Kho_v1.0.docx`
— mẫu tài liệu thiết kế chi tiết **gốc, chính thức của VTS** — với bản D15 (2026-08-04, viết sau khi
một BA khác review `SRS-QLGD-02` và trả lại). D16 giữ nguyên phần D15 đã khớp mẫu gốc (mã BR, sơ đồ
`.drawio`, tách Tạo mới ≠ Chỉnh sửa, mẫu thông báo), chỉ sửa 2 điểm lệch mẫu gốc: bảng field-level
(gộp về 1 bảng 7 cột) và cách đánh số (theo 4 khía cạnh thay vì theo từng màn).

**Người đọc là BA và Product Owner không biết kỹ thuật.** Mọi quy tắc dưới đây phục vụ mục tiêu đó.

---

## Phần A — Khung rỗng (copy phần này)

````markdown
### 3.X <Tên chức năng>

#### 3.X.1 Thông tin chung chức năng

![HÌNH nnn – breadcrumb](img/<mã-srs>/nnn-hinh-nnn.png)

- **Tác nhân**: <vai trò được phân quyền>
- **Ý nghĩa chức năng**: <1–2 câu, góc nhìn người dùng>
- **Nền tảng**: Web / Ứng dụng di động
- **Đường dẫn truy cập**: <Menu cha> > <Menu con>
- **Ràng buộc, ngoại lệ** (nếu có): …

> **Ghi chú**
> - Nguồn: `[¶xxx]`
> - `[GIẢ ĐỊNH]` / `[CẦN XÁC NHẬN]` … `OQ-xxx`

#### 3.X.2 Màn hình

| STT | Tên màn hình | Mô tả tại mục | Ảnh |
|---|---|---|---|
| 1 | Xem danh sách | 3.X.3.1 | `HÌNH nnn` |
| 2 | Tạo mới | 3.X.3.2 | `HÌNH nnn` |
| 3 | Chỉnh sửa | 3.X.3.3 | `HÌNH nnn` |
| 4 | … | 3.X.3.4 |  |

#### 3.X.3 Mô tả chi tiết các thành phần

##### 3.X.3.1 Xem danh sách

![HÌNH nnn](img/<mã-srs>/nnn-hinh-nnn.png)

| STT | Tên | Kiểu dữ liệu [Độ dài dữ liệu] | Input/Output | Giá trị khởi tạo | Mô tả (Mapping với CSDL nếu có) | Ghi chú |
|---|---|---|---|---|---|---|
| **Điều kiện tìm kiếm** | | | | | | |
|  | <Tên trường> | Textbox [n] / Combobox / Datepicker … | Input | Blank / <giá trị> | Hint text: "…". Kiểu so khớp: **Chứa/Bằng**, không phân biệt hoa thường & dấu | `[¶xxx]` |
|  | Thiết lập lại | Button | Input | Enabled | Reset điều kiện tìm kiếm về mặc định | |
|  | Tìm kiếm | Button | Input | Enabled | | |
| **Thao tác** | | | | | | |
|  | Thêm mới | Button | Input | Enabled | | |
|  | Ngưng / Mở lại | Button | Input | Enabled | Áp dụng cho các dòng đã tick chọn | |
| **Datagrid** <br> Load danh sách … <br> Load dữ liệu từ bảng `BẢNG` <br> Sort theo `CỘT` ASC/DESC <br> Phân trang theo quy định chung | | | | | | |
|  | CheckAll/CheckRow | Checkbox | Input | Unchecked | CheckAll ở Header; tick/bỏ tick tất cả CheckRow đang hiển thị | |
|  | <Cột lưới 1> | Label Column | Output | | Lấy từ `BẢNG.CỘT` | |
| **Thao tác** | | | | | | |
|  | Chỉnh sửa | Icon | Input | | Tooltip: Chỉnh sửa | |
|  | Ngưng/Mở lại | Icon | Input | | Icon Ngưng chỉ hiện khi bản ghi Hoạt động; icon Mở lại chỉ hiện khi Tạm ngưng | |

##### 3.X.3.2 Tạo mới

![HÌNH nnn](img/<mã-srs>/nnn-hinh-nnn.png)

| STT | Tên | Kiểu dữ liệu [Độ dài dữ liệu] | Input/Output | Giá trị khởi tạo | Mô tả (Mapping với CSDL nếu có) | Ghi chú |
|---|---|---|---|---|---|---|
| **Thao tác** | | | | | | |
|  | Quay lại | Button | Input | Enabled | | |
|  | Thêm mới | Button | Input | Enabled | | |
| **<Tên khối nhập liệu>** | | | | | | |
|  | <Tên trường>* | Textbox [n] | Input | Blank | Bắt buộc nhập. Lưu vào bảng `BẢNG.CỘT` | |

*(Trường bắt buộc đánh dấu `*` ngay sau tên, không tách cột "Bắt buộc" riêng — đúng quy ước mẫu gốc)*

##### 3.X.3.3 Chỉnh sửa

![HÌNH nnn](img/<mã-srs>/nnn-hinh-nnn.png) *(dùng lại ảnh Tạo mới nếu cùng 1 form)*

| STT | Tên | Kiểu dữ liệu [Độ dài dữ liệu] | Input/Output | Giá trị khởi tạo | Mô tả (Mapping với CSDL nếu có) | Ghi chú |
|---|---|---|---|---|---|---|
| **Thao tác** | | | | | | |
|  | Quay lại | Button | Input | Enabled | | |
|  | Lưu | Button | Input | Enabled | | |
| **Khi chỉnh sửa, giá trị mặc định load từ CSDL** | | | | | | |
|  | <Trường không cho sửa> | <kiểu> | Input | *(để trống — nạp từ bản ghi)* | Disable (Không được chỉnh sửa) — đây là khoá nhận diện bản ghi | |
|  | <Trường cho sửa>* | <kiểu> | Input | *(để trống — nạp từ bản ghi)* | Cho phép chỉnh sửa. Không được để trống. Lưu vào bảng `BẢNG.CỘT` | |

*(Bảng RIÊNG với Tạo mới — không gộp. Xem Phần C, lỗi #1)*

#### 3.X.4 Luồng nghiệp vụ

![HÌNH nnn – Sơ đồ luồng <tên chức năng>](drawio-export/<mã-srs>/nnn-hinh-nnn.png)

*Sơ đồ `.drawio` vẽ tay hoặc sinh bằng skill `srs-to-drawio-flows` — MỘT sơ đồ cho cả chức năng,
không phải từng màn. Nếu blueprint gốc đã có ảnh sơ đồ dạng "hình chữ nhật, đường nối thẳng" thì
dùng lại ảnh gốc, không vẽ lại.*

**A. Xem danh sách & tìm kiếm**

| Bước | Mô tả |
|---|---|
| 1 | Người dùng click vào menu … |
| 2 | Hệ thống tải dữ liệu theo bảng [Mô tả chi tiết các thành phần — 3.X.3.1] |
| 3 | Người dùng nhập điều kiện tìm kiếm, click nút **Tìm kiếm** |
| 4 | Hệ thống tìm kiếm trên bảng `BẢNG`: <trường> so sánh giá trị tìm kiếm với `BẢNG.CỘT` |

**B. Tạo mới / Chỉnh sửa**

| Bước | Mô tả |
|---|---|
| 1 | Người dùng click **Thêm mới** hoặc icon **Chỉnh sửa**. Nếu là Chỉnh sửa, trường không được sửa: <danh sách trường khoá> |
| 2 | Người dùng nhập liệu, click nút **Thêm mới**/**Cập nhật** |
| 3 | Hệ thống kiểm tra hợp lệ tại giao diện: trường bắt buộc không để trống, báo lỗi "Vui lòng nhập/chọn <Tên trường>" |
| 4 | **Hệ thống kiểm tra trùng trong cơ sở dữ liệu**: tổ hợp `<trường khoá>` không được trùng, vi phạm báo lỗi "<Tên đối tượng> đã tồn tại. Vui lòng nhập <trường khoá> khác" |
| 5 | Người dùng không có quyền: thông báo đỏ "Bạn không có quyền thực hiện chức năng này" |
| 6 | Lỗi hệ thống: thông báo đỏ theo mẫu chung mục 4, **giữ nguyên dữ liệu người dùng đã nhập** |
| 7 | Thành công: hiển thị toast "Thêm mới/Cập nhật <đối tượng> <Mã - Tên> thành công." |
| 8 | Lưu dữ liệu vào CSDL: bảng `BẢNG`: `<Tên trường>` = `CỘT` |

**C. Ngưng / Mở lại** *(hoặc Xoá — ghi rõ điều kiện được phép xoá, xoá vật lý hay chuyển trạng thái)*

| Bước | Mô tả |
|---|---|
| 1 | Người dùng tick chọn n dòng, click nút **Ngưng** (nhấn icon trên 1 dòng xử lý tương tự tick 1 dòng) |
| 2 | Hệ thống hiển thị dialog xác nhận: 1 dòng — "Ngưng <đối tượng>? Bạn muốn thực hiện ngưng <đối tượng> <Mã – Tên>?" [Đóng][Ngưng]; nhiều dòng — "Ngưng <đối tượng>? Bạn muốn thực hiện ngưng n <đối tượng> đã chọn?" [Đóng][Ngưng] |
| 3 | Người dùng chọn: **Đóng** (không làm gì) / **Ngưng** (thực hiện) |
| 4 | 1 dòng, thành công: toast "Ngưng <đối tượng> <Mã – Tên> thành công.", tự mất sau n giây (n = cấu hình chung toàn hệ thống) |
| 5 | 1 dòng, thất bại: dialog "Ngưng <đối tượng> <Mã – Tên> không thành công. <Thông tin lỗi>" [Đóng] |
| 6 | Nhiều dòng, tất cả OK: toast "Ngưng n <đối tượng> thành công" |
| 7 | Nhiều dòng, có lỗi: dialog "Kết quả ngưng <đối tượng> — icon Pass + n thành công; icon Fail + m không thành công. Chi tiết lỗi" [Đóng] — link "Chi tiết lỗi" mở popup gồm cột định danh + Thông tin lỗi |
| 8 | Cập nhật CSDL khi thành công: bảng `BẢNG` chuyển `STATUS` sang giá trị tương ứng. Mở lại xử lý đối xứng theo chiều ngược lại |

#### 3.X.5 Quy tắc nghiệp vụ

| Mã | Quy tắc | Áp dụng cho | Trạng thái |
|---|---|---|---|
| `BR-<MÃSRS>-<NN>-01` | … | Tạo mới (3.X.3.2), Chỉnh sửa (3.X.3.3) | Chốt theo `[¶xxx]` |
| `BR-<MÃSRS>-C-01` | … → xem đầy đủ tại mục 4.x | Toàn bộ 3.X, và 3.Y | `[CẦN XÁC NHẬN]` `OQ-xxx` |
````

---

## Phần B — Bản mẫu đã điền

Lấy nguyên nội dung **"Quản lý cụm kho"** từ `SAMPLE_TKCT_Kho_v1.0.docx` (§3.1.1, `¶117`–`¶223`) —
dữ liệu nghiệp vụ thật của VTS, viết lại theo khung Phần A. So với bản gốc: **thêm cột `Ghi chú`**
(neo `¶xxx`), **thêm mục 3.1.5**, và **đổi Luồng nghiệp vụ (3.1.4) từ văn xuôi sang bảng `Bước│Mô
tả`** — ba chỗ này là bổ sung/điều chỉnh của dự án, mọi chỗ khác giữ đúng cấu trúc và nội dung gốc.

### 3.1 Quản lý cụm kho

#### 3.1.1 Thông tin chung chức năng

![HÌNH 003 – Breadcrumb Quản lý cụm kho](img/SAMPLE-TKCT-KHO/003-hinh-003.png)

- **Tác nhân**: người dùng Văn phòng công ty (Head Office) được phân quyền sử dụng chức năng
- **Ý nghĩa chức năng**: cho phép quản lý thông tin cụm kho (kho vật lý)
- **Nền tảng**: Web
- **Đường dẫn truy cập**: Kho > Quản lý cụm kho

> **Ghi chú**
> - Nguồn: `[SAMPLE-TKCT-KHO-V1-0 §3.1.1.1 ¶119–121]`

#### 3.1.2 Màn hình

| STT | Tên màn hình | Mô tả tại mục | Ảnh |
|---|---|---|---|
| 1 | Danh sách cụm kho | 3.1.3.1 | `HÌNH 004` |
| 2 | Thêm mới cụm kho | 3.1.3.2 | `HÌNH 005` |
| 3 | Chỉnh sửa cụm kho | 3.1.3.3 | `HÌNH 006` |

#### 3.1.3 Mô tả chi tiết các thành phần

##### 3.1.3.1 Danh sách cụm kho

![HÌNH 004 – Danh sách cụm kho](img/SAMPLE-TKCT-KHO/004-hinh-004.png)

| STT | Tên | Kiểu dữ liệu [Độ dài dữ liệu] | Input/Output | Giá trị khởi tạo | Mô tả (Mapping với CSDL nếu có) | Ghi chú |
|---|---|---|---|---|---|---|
| **Điều kiện tìm kiếm** | | | | | | |
|  | Đơn vị | Combobox MultiSelect Chips Autocomplete | Input | [Đơn vị cấp cao nhất được phân quyền] | Tập giá trị: {Load danh sách đơn vị trạng thái Hoạt động thuộc phân quyền của user login — hiển thị theo cấu trúc cây}. Hiển thị [Mã – Tên đơn vị]. Bảng `OPT_DIST_UNIT_REF` join `DIST_UNIT`, lấy `CODE`-`NAME`. Autocomplete gần đúng, không phân biệt hoa thường, không phân biệt dấu (LIKE upper(`%từ khóa%`)) | `[¶198]` |
|  | Cụm kho | Textbox [256] | Input | Blank | Hint text: "Nhập mã/tên cụm kho" | `[¶199]` |
|  | Trạng thái | Combobox | Input | [Hoạt động] | Tập giá trị {Tất cả, Hoạt động, Tạm ngưng} | `[¶200]` |
|  | Thiết lập lại | Button | Input | Enabled | Reset điều kiện tìm kiếm về giá trị mặc định | `[¶201]` |
|  | Tìm kiếm | Button | Input | Enabled | | `[¶202]` |
| **Thao tác** | | | | | | |
|  | Ngưng | Button | Input | Enabled | | `[¶204]` |
|  | Mở lại | Button | Input | Enabled | | `[¶205]` |
|  | Thêm mới | Button | Input | Enabled | | `[¶206]` |
| **Datagrid** <br> Load danh sách cụm kho <br> Load dữ liệu từ bảng `WAREHOUSE_GROUP`, `WAREHOUSE_GROUP_LOCATION` <br> Sort theo Mã cụm kho ASC <br> Phân trang theo quy định chung | | | | | | `[¶207]` |
|  | CheckAll/CheckRow | Checkbox | Input | Unchecked | CheckAll ở Header; tick/bỏ tick tất cả CheckRow đang hiển thị | `[¶208]` |
|  | Mã đơn vị | Label Column | Output | | Từ `WAREHOUSE_GROUP.DIST_UNIT_ID` join `DIST_UNIT` lấy `CODE` | `[¶209]` |
|  | Tên đơn vị | Label Column | Output | | Từ `WAREHOUSE_GROUP.DIST_UNIT_ID` join `DIST_UNIT` lấy `NAME` | `[¶210]` |
|  | Mã cụm kho | Label Column | Output | | `WAREHOUSE_GROUP.CODE` | `[¶211]` |
|  | Tên cụm kho | Label Column | Output | | `WAREHOUSE_GROUP.NAME` | `[¶212]` |
|  | Địa chỉ cụm kho | Label Column | Output | | `WAREHOUSE_GROUP_LOCATION.ADDRESS_LINE` | `[¶213]` |
|  | Trạng thái | Label Column | Output | | `WAREHOUSE_GROUP.STATUS` | `[¶214]` |
| **Thao tác** | | | | | | |
|  | Chỉnh sửa | Icon | Input | | Tooltip: Chỉnh sửa | `[¶216]` |
|  | Tạm ngưng/Mở lại | Icon | Input | | Icon Tạm ngưng chỉ hiện khi bản ghi Hoạt động; icon Mở lại chỉ hiện khi Tạm ngưng | `[¶217]` |

##### 3.1.3.2 Thêm mới cụm kho

![HÌNH 005 – Thêm mới cụm kho](img/SAMPLE-TKCT-KHO/005-hinh-005.png)

| STT | Tên | Kiểu dữ liệu [Độ dài dữ liệu] | Input/Output | Giá trị khởi tạo | Mô tả (Mapping với CSDL nếu có) | Ghi chú |
|---|---|---|---|---|---|---|
| **Thao tác** | | | | | | |
|  | Quay lại | Button | Input | Enabled | | `[¶228]` |
|  | Thêm mới | Button | Input | Enabled | | `[¶229]` |
| **Thông tin cơ bản** | | | | | | |
|  | Đơn vị bán hàng* | Combobox Autocomplete | Input | Blank | Tập giá trị {Load danh sách đơn vị có thuộc tính phân phối hàng hóa, Hoạt động, thuộc phạm vi phân quyền}. Hiển thị [Tên đơn vị]. Bắt buộc chọn. Lưu vào `WAREHOUSE_GROUP.DIST_UNIT_ID` | `[¶231]` |
|  | Mã cụm kho* | Textbox [100] | Input | Blank | Bắt buộc nhập. Lưu vào `WAREHOUSE_GROUP.CODE` | `[¶232]` |
|  | Tên cụm kho* | Textbox [256] | Input | Blank | Bắt buộc nhập. Lưu vào `WAREHOUSE_GROUP.NAME` | `[¶233]` |
|  | Mô tả | Textarea [512] | Input | Blank | Lưu vào `WAREHOUSE_GROUP.DESCRIPTION` | `[¶234]` |
| **Thông tin địa chỉ** | | | | | | |
|  | Số nhà* | Textbox [100] | Input | Blank | Bắt buộc nhập. Lưu vào `WAREHOUSE_GROUP_LOCATION.HOUSE_NUMBER` | `[¶236]` |
|  | Tên đường* | Textbox [100] | Input | Blank | Bắt buộc nhập. Lưu vào `WAREHOUSE_GROUP_LOCATION.STREET` | `[¶237]` |
|  | Quận/Huyện - Tỉnh/Thành* | Combobox Autocomplete | Input | Blank | Tập giá trị {Load từ bảng `AREA`}. Bắt buộc chọn. Lưu vào `WAREHOUSE_GROUP_LOCATION.AREA_ID` | `[¶238]` |
|  | Phường/Xã* | Combobox | Input | Blank | Tập giá trị {Load từ bảng `AREA`, phụ thuộc Quận/Huyện đã chọn}. Bắt buộc chọn. Lưu vào `WAREHOUSE_GROUP_LOCATION.AREA_ID` | `[¶239]` |
| **Bản đồ** | | | | | | |
|  | Bản đồ | Maps | Output | | | `[¶241]` |
|  | Tọa độ | Textbox [256] | Input | Blank | Lưu vào `WAREHOUSE_GROUP_LOCATION.LAT`/`LNG` | `[¶242]` |
|  | Địa chỉ theo tọa độ | Textbox [256] | Input | Blank | Lưu vào `WAREHOUSE_GROUP_LOCATION.ADDRESS_MAP` | `[¶243]` |

##### 3.1.3.3 Chỉnh sửa cụm kho

![HÌNH 006 – Chỉnh sửa cụm kho](img/SAMPLE-TKCT-KHO/006-hinh-006.png)

| STT | Tên | Kiểu dữ liệu [Độ dài dữ liệu] | Input/Output | Giá trị khởi tạo | Mô tả (Mapping với CSDL nếu có) | Ghi chú |
|---|---|---|---|---|---|---|
| **Thao tác** | | | | | | |
|  | Quay lại | Button | Input | Enabled | | `[¶254]` |
|  | Lưu | Button | Input | Enabled | | `[¶255]` |
| **Khi chỉnh sửa, giá trị mặc định load từ CSDL** | | | | | | |
|  | Đơn vị bán hàng | Combobox Autocomplete | Input | *(nạp từ bản ghi)* | Disable — không được chỉnh sửa | `[¶258]` |
|  | Mã cụm kho | Textbox [100] | Input | *(nạp từ bản ghi)* | Disable — không được chỉnh sửa | `[¶259]` |
|  | Tên cụm kho* | Textbox [256] | Input | *(nạp từ bản ghi)* | Cho phép chỉnh sửa. Không được để trống. Lưu vào `WAREHOUSE_GROUP.NAME` | `[¶260]` |
|  | Mô tả | Textarea [512] | Input | *(nạp từ bản ghi)* | Lưu vào `WAREHOUSE_GROUP.DESCRIPTION` | `[¶261]` |
| **Thông tin địa chỉ** | | | | | | |
|  | Số nhà*, Tên đường*, Quận/Huyện*, Phường/Xã* | … | Input | *(nạp từ bản ghi)* | Cho phép chỉnh sửa, không được để trống | `[¶263–266]` |
| **Lịch sử thay đổi địa chỉ** | | | | | | |
|  | Thông tin địa chỉ | Label Column | Output | | `WAREHOUSE_GROUP_LOCATION.ADDRESS_LINE` | `[¶268]` |
|  | Trạng thái | Label Column | Output | | `WAREHOUSE_GROUP_LOCATION.IS_ACTIVE` | `[¶269]` |
|  | Vị trí | Icon button | Input | | | `[¶270]` |
| **Bản đồ** | | | | | | |
|  | Bản đồ | Maps | Output | | | `[¶272]` |
|  | Tọa độ, Địa chỉ theo tọa độ | Textbox [256] | Input | *(nạp từ bản ghi)* | Lưu vào `WAREHOUSE_GROUP_LOCATION.LAT`/`LNG`/`ADDRESS_MAP` | `[¶273–274]` |

#### 3.1.4 Luồng nghiệp vụ

![HÌNH 007 – Sơ đồ luồng Quản lý cụm kho](img/SAMPLE-TKCT-KHO/007-hinh-007.png)

**a) Xem danh sách & tìm kiếm cụm kho**

| Bước | Mô tả |
|---|---|
| 1 | Người dùng click vào menu Kho > Quản lý cụm kho |
| 2 | Hệ thống tải dữ liệu theo bảng [Mô tả chi tiết các thành phần — 3.1.3.1] |
| 3 | Người dùng nhập điều kiện tìm kiếm, click nút **Tìm kiếm** |
| 4 | Hệ thống tìm kiếm trên bảng `WAREHOUSE_GROUP`: Đơn vị so sánh với `WAREHOUSE_GROUP.DIST_UNIT_ID`; Cụm kho so sánh với `WAREHOUSE_GROUP.SEARCH_TEXT`; Trạng thái so sánh với `WAREHOUSE_GROUP.IS_ACTIVE` |

> **Ghi chú**: `[SAMPLE-TKCT-KHO-V1-0 §3.1.1.4.1 ¶141–147]`

**b) Thêm mới / Chỉnh sửa cụm kho**

| Bước | Mô tả |
|---|---|
| 1 | Người dùng click **Thêm mới** hoặc icon **Chỉnh sửa**. Nếu là Chỉnh sửa, trường không được sửa: Đơn vị bán hàng, Mã cụm kho — các trường còn lại được chỉnh sửa |
| 2 | Người dùng nhập liệu, click nút **Thêm mới**/**Cập nhật** |
| 3 | Hệ thống kiểm tra hợp lệ: trường bắt buộc không để trống, báo lỗi "Vui lòng nhập/chọn <Tên trường>" |
| 4 | **Hệ thống kiểm tra trùng trong CSDL**: trong 1 đơn vị bán hàng, mã cụm kho không được trùng nhau, vi phạm báo lỗi "Mã cụm kho đã tồn tại. Vui lòng nhập mã cụm kho khác" |
| 5 | Thành công: toast "Thêm mới/Cập nhật cụm kho <Mã - Tên cụm kho> thành công." |
| 6 | Lưu dữ liệu vào CSDL: bảng `WAREHOUSE_GROUP` (Đơn vị bán hàng=`DIST_UNIT_ID`, Mã cụm kho=`CODE`, Tên cụm kho=`NAME`, Mô tả=`DESCRIPTION`); bảng `WAREHOUSE_GROUP_LOCATION` (Số nhà=`HOUSE_NUMBER`, Đường=`STREET`, `ADDRESS_LINE`=địa chỉ đầy đủ ghép từ Số nhà+Đường+Phường/Xã+Quận/Huyện+Tỉnh/Thành, `AREA_ID`=ID Phường/Xã, Tọa độ=`LAT`/`LNG`, Địa chỉ theo tọa độ=`ADDRESS_MAP`) |

> **Ghi chú**: `[SAMPLE-TKCT-KHO-V1-0 §3.1.1.4.2 ¶149–173]`

**c) Ngưng / Mở lại cụm kho**

| Bước | Mô tả |
|---|---|
| 1 | Người dùng tick chọn n dòng, click nút **Ngưng** (nhấn icon trên 1 dòng xử lý tương tự tick 1 dòng) |
| 2 | Hệ thống hiển thị dialog xác nhận: 1 dòng — "Ngưng cụm kho? Bạn muốn thực hiện ngưng cụm kho <Mã – Tên cụm kho>?" [Đóng][Ngưng]; nhiều dòng — "Ngưng cụm kho? Bạn muốn thực hiện ngưng n cụm kho đã chọn?" [Đóng][Ngưng] |
| 3 | Người dùng chọn: **Đóng** (không làm gì) / **Ngưng** (thực hiện) |
| 4 | 1 dòng, thành công: toast "Ngưng cụm kho <Mã – Tên cụm kho> thành công.", tự mất sau n giây |
| 5 | 1 dòng, thất bại: dialog "Ngưng cụm kho <Mã – Tên cụm kho> không thành công. <Thông tin lỗi>" [Đóng] |
| 6 | Nhiều dòng, tất cả OK: toast "Ngưng n cụm kho thành công" |
| 7 | Nhiều dòng, có lỗi: dialog "Kết quả ngưng cụm kho — icon Pass + n thành công; icon Fail + m không thành công. Chi tiết lỗi (m=0 thì ẩn)" [Đóng] — link "Chi tiết lỗi" mở popup gồm Mã cụm kho, Tên cụm kho, Thông tin lỗi |
| 8 | Cập nhật CSDL khi thành công: `WAREHOUSE_GROUP.IS_ACTIVE = 0`. Mở lại: đối xứng, dialog "Mở lại cụm kho…", thành công cập nhật `IS_ACTIVE = 1` |

> **Ghi chú**: `[SAMPLE-TKCT-KHO-V1-0 §3.1.1.4.3 ¶175–223]`

#### 3.1.5 Quy tắc nghiệp vụ

*(Mục mới, không có trong mẫu gốc — suy ra từ nội dung Luồng nghiệp vụ ở trên)*

| Mã | Quy tắc | Áp dụng cho | Trạng thái |
|---|---|---|---|
| `BR-KHO01-01-01` | Trong một đơn vị bán hàng, mã cụm kho không được trùng | Thêm mới (3.1.3.2) | Chốt theo `[¶158]` |
| `BR-KHO01-01-02` | Đơn vị bán hàng và Mã cụm kho là khoá nhận diện, không được sửa sau khi lưu | Chỉnh sửa (3.1.3.3) | Chốt theo `[¶151]` |

---

## Phần C — Những lỗi hay mắc

| # | Lỗi | Cách nhận ra |
|---|---|---|
| 1 | **Gộp Tạo mới với Chỉnh sửa** vào một bảng | Có dòng nhóm ghi chữ "hợp nhất" hoặc "Thêm mới/Chỉnh sửa/Sao chép". Đọc xong không biết trường nào sửa được ở màn nào. Hai mục `3.X.3.2`/`3.X.3.3` phải là **hai bảng riêng** |
| 2 | **Thiếu nút** | Đếm nút nhìn thấy trên ảnh `HÌNH nnn`, đối chiếu số dòng nhóm `**Thao tác**` trong bảng. *Tìm kiếm* và *Thiết lập lại* là hai nút bị bỏ sót nhiều nhất |
| 3 | **Dòng nhóm sai chỗ** | *Nhập file* / *Xuất file* nằm trong dòng nhóm `**Thao tác**` của form Tạo mới thay vì nhóm nút màn danh sách |
| 4 | **Không ghi Chứa hay Bằng** cho tiêu chí tìm kiếm | Cột "Mô tả" của dòng thuộc `**Điều kiện tìm kiếm**` không nêu kiểu so khớp |
| 5 | **Không ghi thứ tự sắp xếp/phân trang** | Dòng nhóm `**Datagrid**` không có "Sort theo …", "Phân trang theo quy định chung" trong nội dung dòng nhóm |
| 6 | **Neo và nhãn OQ trộn vào câu mô tả** | Cột "Mô tả (Mapping với CSDL nếu có)" có `[¶xxx]`, `[GIẢ ĐỊNH]`, `OQ-xxx` — chỗ của chúng là cột `Ghi chú` (cột thứ 7) |
| 7 | **Mã BR sai dạng** | Chạy `grep -ohE "BR-[A-Za-z0-9-]+" <file> \| grep -vE "^BR-<MÃSRS>-(C\|[0-9]{2})-[0-9]{2}$" \| sort -u` — phải ra rỗng |

Ngoài ra, hai lỗi trong **luồng nghiệp vụ** (giữ nguyên từ D15, D16 không đổi): Tạo mới thiếu bước
**kiểm tra trùng trong cơ sở dữ liệu**, và Ngưng/Xoá không ghi **điều kiện được phép thực hiện**.

---

## Phần D — Khung toàn văn tài liệu (đầu trang, mục lục)

Đặt **sau** frontmatter YAML (D13, vẫn giữ nguyên phục vụ tooling — tra trạng thái, script) và
**trước** Mục lục — khung này là phần **hiển thị cho người đọc**.

### D.1 Khung đầu trang (copy phần này)

````markdown
# <Tên file, vd SRS-QLGD-03-Ton-kho-NPP-v0.2>

## TÀI LIỆU THIẾT KẾ CHI TIẾT (SRS)

**Phân hệ**: <Số nhóm>. <Tên nhóm> - <Tên phân hệ> (<tên tiếng Anh nếu có>)

## BẢNG GHI NHẬN THAY ĐỔI TÀI LIỆU

| Phiên bản | Ngày | Nội dung thay đổi | Người thực hiện |
|---|---|---|---|
| v0.1 | <dd/mm/yyyy> | Tạo mới tài liệu | <tên/role> |

## TRANG KÝ

| Vai trò | Họ và tên | Chức danh | Chữ ký | Ngày |
|---|---|---|---|---|
| Người lập | | Chuyên viên phân tích nghiệp vụ | | |
| Người kiểm tra | | Trưởng nhóm phân tích nghiệp vụ | | |
| Người phê duyệt | | Quản trị dự án | | |
| Đại diện khách hàng | | | | |

## MỤC LỤC

1. [GIỚI THIỆU](#1-giới-thiệu)
2. [TỔNG QUAN GIẢI PHÁP](#2-tổng-quan-giải-pháp)
3. [THIẾT KẾ CHI TIẾT](#3-thiết-kế-chi-tiết)
4. [THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG](#4-thiết-kế-dùng-chung-và-tái-sử-dụng)
5. [THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU](#5-thiết-kế-đảm-bảo-tuân-thủ-tiêu-chuẩn-quản-trị-dữ-liệu)
   - 5.1 [Chất lượng dữ liệu](#51-chất-lượng-dữ-liệu)
   - 5.2 [Lịch sử và khả năng truy vết](#52-lịch-sử-và-khả-năng-truy-vết)
   - 5.3 [Phân quyền và kiểm soát truy cập](#53-phân-quyền-và-kiểm-soát-truy-cập)
   - 5.4 [Vòng đời và lưu trữ dữ liệu](#54-vòng-đời-và-lưu-trữ-dữ-liệu)
   - 5.5 [Dữ liệu cá nhân](#55-dữ-liệu-cá-nhân)
   - 5.6 [Quản trị dữ liệu](#56-quản-trị-dữ-liệu)
   - 5.7 [Kiến trúc & tích hợp dữ liệu](#57-kiến-trúc--tích-hợp-dữ-liệu)
6. [PHỤ LỤC](#6-phụ-lục)
   - 6.1 [Mẫu tệp nhập và xuất dữ liệu](#61-mẫu-tệp-nhập-và-xuất-dữ-liệu)
   - 6.2 [Đề xuất bổ sung thiết kế cơ sở dữ liệu](#62-đề-xuất-bổ-sung-thiết-kế-cơ-sở-dữ-liệu)
   - 6.3 [Danh mục điểm chờ xác nhận](#63-danh-mục-điểm-chờ-xác-nhận)
   - 6.4 [Phụ thuộc module/dữ liệu khác](#64-phụ-thuộc-moduledữ-liệu-khác)
````

### D.2 Ghi chú khi điền

| Chỗ | Nội dung bắt buộc |
|---|---|
| Trang ký — Người kiểm tra | Theo D7 (đã sửa bởi D16): gộp vai trò review chéo module + BA Lead vào 1 dòng ký. SLA phản hồi giữ nguyên 2 ngày làm việc (D7) |
| Trang ký — Đại diện khách hàng | Dòng ký **bổ sung**, không thay thế bước 3 D7 (gửi batch OQ cho VTS/VTIT vẫn giữ nguyên, không phụ thuộc Trang ký) |
| Mục lục 5.6, 5.7 | Nội dung theo D6 gốc — không phải mục rỗng hình thức |
| Mục lục 6.3 | Bảng OQ đủ cột `Mã · Câu hỏi · Ưu tiên · Chặn? · Phản hồi VTS · Nguồn/Ghi chú`, chép **nguyên văn** từ `OQ-TRACKER.md` — không tóm tắt/link-only (DoD §1.2) |
| Mục lục 6.4 | Danh sách thực thể/API tham chiếu sang module khác + trạng thái module sở hữu (đối chiếu `module-dependency-matrix.md`, D11); module sở hữu chưa viết/chưa review thì gắn nhãn rõ |
