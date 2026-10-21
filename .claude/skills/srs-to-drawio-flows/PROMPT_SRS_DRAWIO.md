# BỘ PROMPT TẠO SƠ ĐỒ DIAGRAMS.NET TỪ SRS

**Skill sử dụng:** `srs-to-drawio-flows`  
**Tương thích:** Claude / Codex

## HƯỚNG DẪN DÙNG NHANH

1. Mở Claude hoặc Codex.
2. Gọi skill:
   - Codex: $srs-to-drawio-flows
   - Claude: /srs-to-drawio-flows
   Nếu client không hỗ trợ gọi trực tiếp, hãy ghi:
   "Hãy sử dụng skill srs-to-drawio-flows để thực hiện yêu cầu sau."
3. Sao chép một prompt phù hợp trong file này.
4. Thay các giá trị nằm trong dấu <...>.
5. Chỉ yêu cầu cập nhật Google Drive khi thật sự muốn thay đổi file trên Drive.

Mức độ hỗ trợ:
- ĐƠN GIẢN: tổng quan nghiệp vụ, dễ trình bày.
- TRUNG BÌNH: mặc định cho tài liệu phân tích chức năng.
- CHI TIẾT: phục vụ bàn giao phát triển, QA và thiết kế test case.
- TẤT CẢ: sinh ba file để so sánh.


## PROMPT 01 - DÙNG NGAY CHO DỰ ÁN GIAO BAN BTTM

Hãy sử dụng skill srs-to-drawio-flows.

Mục tiêu:
Đọc toàn bộ SRS, đối chiếu UI và template diagrams.net, sau đó tạo sơ đồ
nghiệp vụ cho từng chức năng. Mỗi trang sơ đồ chỉ đại diện cho đúng một
chức năng. Output phải là file .drawio hợp lệ, chỉnh sửa được trong
diagrams.net; không thay thế bằng Mermaid, ảnh PNG hoặc mô tả văn bản.

Nguồn đầu vào:
- SRS: Đưa SRS vào (nhớ thay đổi cho bảo mật).
- Template diagrams.net:
  https://app.diagrams.net/#G1M3SpuLhfid_ISpOygmeIrLZmBiahXtd6#%7B%22pageId%22%3A%22Zk2wzSQLq7Faoq2vTfld%22%7D
- UI đối chiếu:
  Sử dụng các hình UI nhúng trong SRS và ảnh UI tôi đã cung cấp.
- Mức độ cần xuất:
  <ĐƠN GIẢN | TRUNG BÌNH | CHI TIẾT | TẤT CẢ>
- Thư mục output:
  <ĐƯỜNG_DẪN_THƯ_MỤC_OUTPUT>

Yêu cầu phân tích nguồn:
1. Đọc toàn bộ đoạn văn, bảng biểu, heading, ảnh nhúng và phần mô tả luồng
   nghiệp vụ của SRS. Không chỉ đọc tên chức năng.
2. Xác định đúng tổng số chức năng và giữ nguyên thứ tự trong SRS.
3. Với từng chức năng, phải xác định:
   - tên chức năng;
   - actor và quyền thực hiện;
   - điều kiện trước;
   - màn hình/điểm truy cập;
   - các bước thao tác;
   - kiểm tra quyền và phạm vi dữ liệu;
   - validation và quy tắc nghiệp vụ;
   - API, bảng dữ liệu hoặc dịch vụ được đọc/ghi;
   - kết quả thành công;
   - trạng thái dữ liệu sau xử lý;
   - thông báo, lịch sử hoặc audit nếu có;
   - từng case ngoại lệ có điều kiện và cách hệ thống xử lý;
   - nguồn SRS/UI làm căn cứ cho từng case.
4. SRS là nguồn chính cho nghiệp vụ, quyền, trạng thái, API/DB, thông báo
   và ngoại lệ. UI chỉ dùng để đối chiếu tên màn hình, trường dữ liệu,
   nút bấm, trạng thái hiển thị và thứ tự tương tác.
5. Không tự tạo API, quyền, bảng dữ liệu, trạng thái, giới hạn validation,
   thông báo hoặc case không có trong nguồn.
6. Nếu nguồn chưa rõ, ghi "cần xác nhận" trong tài liệu phân tích; không
   biến giả định thành nghiệp vụ chính thức.
7. Chỉ chuẩn hóa lỗi chính tả đã rõ nghĩa. Ví dụ:
   "dashbroad" được chuẩn hóa thành "dashboard".

Quy ước nghiệp vụ đã chốt:
- Mỗi sơ đồ/trang chỉ biểu diễn một chức năng.
- Tiêu đề nhìn thấy trên sơ đồ phải là tên chức năng, không thêm F01, F02,
  F03 hoặc mã nội bộ phía trước.
- Không dùng tiêu đề chung chung như "XEM BÁO CÁO / THỐNG KÊ".
- F03 chỉ là:
  "Xem dashboard thống kê số lượng sự cố theo trạng thái".
  Không tách F03 thành một chức năng báo cáo khác và không bổ sung phạm vi
  nghiệp vụ ngoài việc xem dashboard thống kê số lượng sự cố theo trạng thái.
- Case phải riêng theo từng chức năng. Không sao chép nguyên một bộ case
  chung cho nhiều chức năng không liên quan.
- Với mỗi case phải thể hiện:
  điều kiện xảy ra -> hệ thống xử lý -> kết quả dữ liệu/trạng thái.

Yêu cầu bám template:
1. Đọc XML nguồn của file .drawio/template trước khi vẽ.
2. Xác định đúng trang Template và tái sử dụng:
   - màu sắc;
   - loại khối;
   - kích thước;
   - font chữ;
   - viền;
   - kiểu mũi tên;
   - khoảng cách;
   - cách bố trí actor, UI/action, hệ thống, data, kết quả và case.
3. Quy ước màu:
   - actor: khối vàng;
   - UI/action, xử lý, kết quả và case: khối trắng có dải nhấn vàng
     theo template;
   - data: ô D màu xám và nhãn dữ liệu theo template;
   - ghi chú quy tắc nghiệp vụ: vàng nhạt, chỉ dùng khi có căn cứ.
4. Luồng chính đi từ trái sang phải.
5. Data nối thẳng đứng xuống khối xử lý.
6. Kết quả thành công đi xuống dưới.
7. Các case đi sang phải và phải dùng các điểm neo khác nhau trên khối xử lý.
8. Đường line phải vuông góc, có mũi tên rõ, không chồng chữ, không đè
   khối, không giao cắt không cần thiết.
9. Không nối line vào dải vàng trang trí.
10. Không thay đổi các trang template gốc nếu không được yêu cầu.

Yêu cầu theo mức độ:

A. Nếu chọn ĐƠN GIẢN:
- Thể hiện 1-2 bước người dùng/hệ thống.
- Có một khối xử lý chính.
- Có nguồn dữ liệu chính.
- Có một kết quả thành công.
- Có tối thiểu một case quan trọng nhất.
- Ưu tiên 6-8 khối nghiệp vụ nhìn thấy.
- Wording ngắn, đọc được ở mức zoom bình thường.

B. Nếu chọn TRUNG BÌNH:
- Thể hiện 2-3 bước theo đúng thứ tự.
- Có kiểm tra quyền/phạm vi và validation nghiệp vụ chính.
- Có API/database hoặc nguồn dữ liệu.
- Có kết quả thành công; thêm audit/thông báo khi thật sự áp dụng.
- Có ít nhất hai, thông thường ba case riêng của chức năng.
- Sơ đồ phải hiểu được mà không cần đọc toàn bộ SRS.

C. Nếu chọn CHI TIẾT:
- Thể hiện 3-4 bước theo đúng thứ tự.
- Thể hiện xác nhận/hủy, điều kiện UI, giới hạn validation, chuyển trạng thái,
  kiểm tra liên bản ghi hoặc xung đột khi nguồn có quy định.
- Thể hiện đầy đủ nguồn dữ liệu cần thiết.
- Kết quả thành công phải nói rõ dữ liệu được lưu/cập nhật như thế nào,
  thông báo và audit nếu có.
- Thể hiện toàn bộ case quan trọng có căn cứ, thông thường 3-6 case.
- Có ghi chú quy tắc nghiệp vụ kèm nguồn.
- Giữ đúng mã lỗi, trạng thái, giới hạn và nội dung thông báo nếu SRS có ghi.
- Không cố tạo đủ 5-6 case nếu nguồn chỉ hỗ trợ ít hơn.

D. Nếu chọn TẤT CẢ:
- Xuất ba file riêng: simple, medium và detailed.
- Ba mức phải cùng một sự thật nghiệp vụ.
- Chỉ thay đổi độ sâu trình bày, không thay đổi bản chất chức năng.

Quy trình bắt buộc:
1. Phân tích template.
2. Trích xuất toàn bộ SRS và UI.
3. Lập manifest nghiệp vụ cho từng chức năng.
4. Kiểm tra manifest:
   - không còn TODO;
   - không còn [đối tượng];
   - không còn [tên bảng đối tượng];
   - từng case có nguồn;
   - không có case/API/quyền/trạng thái tự suy diễn.
5. Sinh file .drawio.
6. Kiểm tra cấu trúc XML và kiểm tra trực quan.
7. Sửa toàn bộ lỗi trước khi bàn giao.

Output bắt buộc:
- File .drawio theo mức được yêu cầu.
- flow-manifest.json chứa dữ liệu đã grounding.
- validation-report.txt ghi kết quả kiểm tra.
- Báo cáo cuối gồm:
  + tổng số chức năng đã xử lý;
  + số trang template được giữ lại;
  + số trang chức năng được tạo;
  + mức độ đã xuất;
  + các chức năng còn "cần xác nhận";
  + đường dẫn chính xác của từng file output;
  + kết quả validator.

Tiêu chí hoàn thành:
- Page count = số trang template gốc + số chức năng.
- Page ID, page name và cell ID không trùng.
- Mọi connector có source/target hợp lệ.
- Tiêu đề đúng tên chức năng và không có tiền tố Fxx.
- Case count đúng mức độ.
- Không có TODO, placeholder, mojibake hoặc tiêu đề chung chung.
- Không có nguyên bộ case giống nhau giữa các chức năng không liên quan.
- Không kết luận hoàn thành nếu validator chưa đạt issues=[].
- Chỉ cập nhật file Google Drive khi tôi yêu cầu rõ ràng.


## PROMPT 02 - MẪU TỔNG QUÁT TÁI SỬ DỤNG CHO DỰ ÁN KHÁC

Hãy sử dụng skill srs-to-drawio-flows.

Đầu vào:
- Tài liệu nghiệp vụ/SRS/URD: <PATH_SRS>
- Template diagrams.net hoặc URL: <PATH_HOẶC_URL_TEMPLATE>
- UI/Figma/ảnh màn hình: <PATH_HOẶC_URL_UI | KHÔNG_CÓ>
- Mức sơ đồ: <ĐƠN GIẢN | TRUNG BÌNH | CHI TIẾT | TẤT CẢ>
- Output: <PATH_OUTPUT>
- Hình thức bàn giao:
  <CHỈ_LOCAL | TẠO_FILE_DRIVE_MỚI | CẬP_NHẬT_DRIVE_TẠI_CHỖ>

Hãy đọc toàn bộ nguồn, nắm grammar của template và lập dữ liệu nghiệp vụ
cho từng chức năng trước khi vẽ.

Yêu cầu bắt buộc:
- Một trang = một chức năng.
- Tiêu đề = tên chức năng chính xác, không thêm mã nội bộ.
- SRS/URD là nguồn chính cho nghiệp vụ.
- UI chỉ dùng để đối chiếu thành phần và thứ tự tương tác.
- Mỗi case phải riêng theo chức năng, gồm điều kiện, xử lý, kết quả và nguồn.
- Không tự suy diễn API, DB, quyền, trạng thái, giới hạn hoặc thông báo.
- Nếu chưa đủ căn cứ, ghi "cần xác nhận".
- Giữ nguyên màu, khối, font, kích thước, line và bố cục template.
- Luồng chính trái sang phải; data và success theo chiều dọc; case sang phải.
- Dùng điểm neo riêng cho từng case; line vuông góc và không giao cắt.
- Sinh .drawio chỉnh sửa được.
- Validate toàn bộ output; chỉ bàn giao khi issues=[].

Nếu không chỉ định mức độ, sử dụng mức TRUNG BÌNH.
Nếu yêu cầu so sánh, sinh đủ ba mức từ cùng một dữ liệu nghiệp vụ.

Trả lại:
1. Các file .drawio.
2. Manifest nghiệp vụ.
3. Báo cáo validation.
4. Danh sách nội dung cần xác nhận.
5. Path hoặc URL chính xác của output.


## PROMPT 03 - CHỈ XUẤT MỨC ĐƠN GIẢN

Hãy sử dụng skill srs-to-drawio-flows để tạo bản ĐƠN GIẢN.

Nguồn:
- SRS: <PATH_SRS>
- Template: <PATH_HOẶC_URL_TEMPLATE>
- UI: <PATH_HOẶC_URL_UI | KHÔNG_CÓ>
- Output: <PATH_OUTPUT>

Mỗi trang chỉ thể hiện một chức năng:
- đúng actor;
- 1-2 bước chính;
- một xử lý hệ thống;
- nguồn dữ liệu chính;
- kết quả thành công;
- một case quan trọng nhất có căn cứ.

Giữ đúng template, line rõ ràng và wording ngắn.
Không bỏ mất bản chất nghiệp vụ, quyền hoặc phạm vi dữ liệu quan trọng.
Không tự tạo case.
Tiêu đề không có mã Fxx.
Xuất file .drawio và chỉ bàn giao khi validator đạt issues=[].


## PROMPT 04 - CHỈ XUẤT MỨC TRUNG BÌNH

Hãy sử dụng skill srs-to-drawio-flows để tạo bản TRUNG BÌNH.

Nguồn:
- SRS: <PATH_SRS>
- Template: <PATH_HOẶC_URL_TEMPLATE>
- UI: <PATH_HOẶC_URL_UI | KHÔNG_CÓ>
- Output: <PATH_OUTPUT>

Yêu cầu mỗi chức năng:
- một trang riêng;
- 2-3 bước theo thứ tự;
- kiểm tra quyền và phạm vi dữ liệu;
- validation nghiệp vụ chính;
- API/database hoặc nguồn dữ liệu;
- kết quả thành công;
- ít nhất hai, thông thường ba case riêng của chức năng;
- thông báo/audit nếu có căn cứ.

Case phải nêu:
điều kiện xảy ra -> hệ thống xử lý -> trạng thái dữ liệu/kết quả.

Giữ đúng màu, khối, line, font và bố cục template.
Không dùng tiêu đề chung, không thêm Fxx, không sao chép bộ case giữa các
chức năng và không tự suy diễn nghiệp vụ.
Output phải hiểu được mà không cần đọc toàn bộ SRS.
Chỉ bàn giao khi validator đạt issues=[].


## PROMPT 05 - CHỈ XUẤT MỨC CHI TIẾT

Hãy sử dụng skill srs-to-drawio-flows để tạo bản CHI TIẾT phục vụ
implementation và QA.

Nguồn:
- SRS: <PATH_SRS>
- Template: <PATH_HOẶC_URL_TEMPLATE>
- UI: <PATH_HOẶC_URL_UI | KHÔNG_CÓ>
- Output: <PATH_OUTPUT>

Với từng chức năng, hãy thể hiện:
- actor, quyền và phạm vi;
- điều kiện trước;
- 3-4 bước theo đúng thứ tự;
- xác nhận/hủy và điều kiện UI khi có;
- validation, giới hạn, trạng thái và kiểm tra liên bản ghi;
- API, database, bảng phụ hoặc dịch vụ tích hợp;
- kết quả thành công và trạng thái dữ liệu sau xử lý;
- notification, audit/history nếu áp dụng;
- mọi case quan trọng có căn cứ, thường 3-6 case;
- ghi chú quy tắc nghiệp vụ kèm nguồn.

Giữ chính xác mã lỗi, trạng thái, giới hạn và thông báo nếu nguồn quy định.
Không tạo thêm case chỉ để tăng độ chi tiết.
Đánh dấu "cần xác nhận" khi tài liệu không đủ rõ.

Mỗi trang chỉ đại diện một chức năng.
Tiêu đề không có mã Fxx.
Giữ đúng template và chuẩn hóa connector.
Output là .drawio chỉnh sửa được.
Chỉ bàn giao khi validator đạt issues=[].


## PROMPT 06 - XUẤT CẢ BA MỨC ĐỂ SO SÁNH

Hãy sử dụng skill srs-to-drawio-flows để sinh đồng thời ba mức:
ĐƠN GIẢN, TRUNG BÌNH và CHI TIẾT.

Nguồn:
- SRS: <PATH_SRS>
- Template: <PATH_HOẶC_URL_TEMPLATE>
- UI: <PATH_HOẶC_URL_UI | KHÔNG_CÓ>
- Output: <PATH_OUTPUT>

Yêu cầu:
- Phân tích nguồn một lần và tạo một manifest nghiệp vụ thống nhất.
- Ba mức phải dùng cùng actor, quyền, dữ liệu, quy tắc và sự thật nghiệp vụ.
- Chỉ thay đổi số bước, số case và độ chi tiết trình bày.
- Không được để ba mức mô tả mâu thuẫn nhau.
- Mỗi file vẫn phải có một trang cho từng chức năng.
- Giữ đúng template ở cả ba file.
- Validate riêng từng file.

Tên file đề xuất:
- SRS_FLOW_SIMPLE.drawio
- SRS_FLOW_MEDIUM.drawio
- SRS_FLOW_DETAILED.drawio
- flow-manifest.json
- validation-report.txt

Chỉ bàn giao khi cả ba file đều đạt issues=[].


## PROMPT 07 - SỬA FILE DRAWIO HIỆN CÓ, GIỮ TEMPLATE

Hãy sử dụng skill srs-to-drawio-flows để rà soát và sửa file .drawio
hiện có.

Nguồn:
- SRS: <PATH_SRS>
- File .drawio cần sửa: <PATH_DRAWIO>
- Template chuẩn: <PATH_HOẶC_URL_TEMPLATE>
- UI đối chiếu: <PATH_HOẶC_URL_UI | KHÔNG_CÓ>
- Mức độ mong muốn: <ĐƠN GIẢN | TRUNG BÌNH | CHI TIẾT>
- Output: <PATH_OUTPUT>

Nguyên tắc sửa:
1. So sánh XML theo từng trang.
2. Giữ nguyên toàn bộ trang/khối đúng.
3. Chỉ sửa trang, node, wording hoặc connector có lỗi.
4. Không relayout toàn bộ file nếu không cần thiết.
5. Mỗi trang phải đại diện đúng một chức năng.
6. Sửa tiêu đề chung chung thành tên chức năng chính xác.
7. Bỏ mã Fxx khỏi tiêu đề nhìn thấy.
8. Viết lại case theo đúng nghiệp vụ riêng của chức năng.
9. Chuẩn hóa line:
   - luồng chính trái sang phải;
   - data và success theo chiều dọc;
   - case sang phải bằng các điểm neo riêng;
   - không nối vào dải vàng trang trí;
   - không chồng chữ hoặc giao cắt không cần thiết.
10. Không sửa nội dung không nằm trong phạm vi yêu cầu.

Kiểm tra page-level XML để xác nhận các trang ngoài phạm vi không thay đổi.
Chỉ bàn giao file đã validate với issues=[] và báo rõ những trang đã sửa.


## PROMPT 08 - CHỈ KIỂM TRA, KHÔNG SỬA FILE

Hãy sử dụng skill srs-to-drawio-flows để kiểm tra read-only file sau:

- SRS: <PATH_SRS>
- Drawio: <PATH_DRAWIO>
- Template: <PATH_HOẶC_URL_TEMPLATE>
- Mức độ dự kiến: <ĐƠN GIẢN | TRUNG BÌNH | CHI TIẾT>

Không chỉnh sửa và không ghi đè file.

Hãy kiểm tra:
- số trang và thứ tự chức năng;
- một trang có đúng một chức năng hay không;
- tiêu đề có chính xác và không có Fxx hay không;
- actor, quyền, màn hình, API/DB và kết quả;
- case có đúng chức năng, có điều kiện và cách xử lý hay không;
- case có căn cứ SRS/UI hay bị tự suy diễn;
- có copy/paste bộ case giữa các chức năng hay không;
- màu sắc và loại khối có đúng template;
- line, điểm neo, mũi tên, giao cắt và va chạm chữ;
- ID trang/cell/connector;
- TODO, placeholder, mojibake và tiêu đề chung chung.

Trả về báo cáo theo mức:
- Lỗi nghiêm trọng: sai nghiệp vụ, thiếu chức năng, sai nguồn.
- Lỗi trung bình: thiếu case, thiếu trạng thái, line khó đọc.
- Lỗi nhẹ: wording, khoảng cách, căn chỉnh.

Mỗi lỗi phải nêu:
trang/chức năng -> vấn đề -> bằng chứng -> hướng sửa đề xuất.


## PROMPT 09 - CHỈ CHUẨN HÓA WORDING VÀ CASE

Hãy sử dụng skill srs-to-drawio-flows để kiểm tra và viết lại wording trong
file .drawio sau:

- SRS: <PATH_SRS>
- Drawio: <PATH_DRAWIO>
- Output: <PATH_OUTPUT>

Yêu cầu:
- Mỗi trang chỉ đại diện một chức năng.
- Tiêu đề là tên chức năng chính xác, không có Fxx.
- Loại bỏ tiêu đề chung như "XEM BÁO CÁO / THỐNG KÊ".
- Wording phải ngắn, rõ chủ thể và hành động.
- Dùng cách viết:
  "Người dùng truy cập...",
  "HT kiểm tra...",
  "HT truy vấn...",
  "HT hiển thị...",
  "HT cập nhật...",
  "HT thông báo...".
- Mỗi case phải ghi đúng đối tượng nghiệp vụ.
- Mỗi case phải có điều kiện và cách xử lý.
- Không dùng case chung chung như "Lỗi hệ thống" nếu nguồn có lỗi cụ thể.
- Không thay đổi layout, màu hoặc các trang không có lỗi.
- Chỉ bàn giao khi validator đạt issues=[].


## PROMPT 10 - CHỈ CHUẨN HÓA ĐƯỜNG LINE

Hãy sử dụng skill srs-to-drawio-flows để chuẩn hóa connector của file sau:

- Drawio: <PATH_DRAWIO>
- Template chuẩn: <PATH_HOẶC_URL_TEMPLATE>
- Output: <PATH_OUTPUT>

Không thay đổi nghiệp vụ và wording nếu không cần thiết.

Yêu cầu line:
- luồng chính đi từ trái sang phải;
- data nối thẳng đứng vào khối xử lý;
- success đi xuống dưới;
- case đi sang phải;
- mỗi case dùng một điểm neo riêng;
- line vuông góc;
- mũi tên kết thúc đúng target;
- không nối vào dải vàng trang trí;
- không xuyên qua node;
- không đè chữ;
- hạn chế tối đa giao cắt;
- giữ khoảng cách đều và đọc được ở zoom bình thường.

So sánh trước/sau và báo rõ các trang được chỉnh.
Validate ID, source, target và anchor trước khi bàn giao.


## PROMPT 11 - SỬA RIÊNG F03 DASHBOARD SỰ CỐ

Hãy sử dụng skill srs-to-drawio-flows để kiểm tra và sửa riêng trang F03
trong file .drawio sau:

- SRS: <PATH_SRS>
- Drawio: <PATH_DRAWIO>
- Template: <PATH_HOẶC_URL_TEMPLATE>
- Output: <PATH_OUTPUT>

Quy ước đã chốt:
- F03 chỉ là "Xem dashboard thống kê số lượng sự cố theo trạng thái".
- Mỗi trang chỉ đại diện một chức năng.
- Không dùng tiêu đề "XEM BÁO CÁO / THỐNG KÊ".
- Không mở rộng F03 thành chức năng báo cáo khác.
- Tiêu đề nhìn thấy không chứa "F03".
- Chỉ dùng các case có căn cứ trực tiếp trong SRS/UI.
- UI chỉ dùng để đối chiếu biểu đồ, bộ lọc, trạng thái hiển thị và thao tác.

Giữ nguyên toàn bộ các trang ngoài F03.
So sánh XML trước/sau để xác nhận các trang khác không thay đổi.
Chuẩn hóa wording, case và line của F03 theo template.
Chỉ bàn giao khi validator đạt issues=[].


## PROMPT 12 - YÊU CẦU BÀN GIAO VÀ KIỂM TRA CUỐI

Trước khi kết luận hoàn thành, hãy thực hiện kiểm tra cuối:

1. Xác nhận đã đọc toàn bộ đoạn văn, bảng và UI/hình ảnh.
2. Xác nhận số chức năng và số trang output.
3. Xác nhận một trang chỉ có một chức năng.
4. Xác nhận mọi tiêu đề đúng tên chức năng và không có Fxx.
5. Xác nhận mọi case có điều kiện, xử lý, kết quả và nguồn.
6. Xác nhận không có case/API/DB/quyền/trạng thái tự suy diễn.
7. Xác nhận không có TODO hoặc placeholder.
8. Xác nhận màu, khối, font và connector đúng template.
9. Xác nhận đường line không nối vào dải vàng trang trí.
10. Xác nhận mọi edge có source/target/anchor hợp lệ.
11. Xác nhận không có bộ case giống hệt nhau giữa các chức năng không liên quan.
12. Chạy validator cho từng file và chỉ bàn giao khi issues=[].

Trả về:
- path chính xác của file;
- tên file;
- mức độ;
- số trang;
- danh sách nội dung cần xác nhận;
- kết quả validator;
- SHA-256 nếu file được tải lên hoặc thay thế trên Drive.

Không cập nhật hoặc ghi đè file Drive nếu tôi chưa yêu cầu rõ ràng.


## MẪU CÂU LỆNH NGẮN

Ví dụ 1 - Mức trung bình:

Hãy dùng skill srs-to-drawio-flows, đọc SRS tại <PATH_SRS>, đối chiếu
template <PATH_TEMPLATE> và UI <PATH_UI>, sau đó tạo một trang cho từng
chức năng ở mức trung bình. Giữ đúng template, case riêng theo chức năng,
không thêm Fxx vào tiêu đề và chỉ bàn giao khi issues=[].

Ví dụ 2 - Mức chi tiết:

Hãy dùng skill srs-to-drawio-flows để tạo bản chi tiết phục vụ dev/QA từ
<PATH_SRS>, dùng template <PATH_TEMPLATE>. Thể hiện quyền, phạm vi, validation,
API/DB, trạng thái, thông báo, audit và mọi case có căn cứ. Không suy diễn.
Xuất .drawio chỉnh sửa được và validation phải đạt issues=[].

Ví dụ 3 - Sửa line:

Hãy dùng skill srs-to-drawio-flows để chỉ sửa connector của <PATH_DRAWIO>
theo <PATH_TEMPLATE>. Giữ nguyên nghiệp vụ và các trang đúng; line chính
trái sang phải, data/success theo chiều dọc, case sang phải bằng điểm neo
riêng. Không nối vào dải vàng. Validate trước khi bàn giao.

Ví dụ 4 - Kiểm tra read-only:

Hãy dùng skill srs-to-drawio-flows để kiểm tra read-only <PATH_DRAWIO>
so với <PATH_SRS> và <PATH_TEMPLATE>. Không sửa file. Liệt kê lỗi theo từng
trang, bằng chứng nguồn, mức độ nghiêm trọng và hướng xử lý.
