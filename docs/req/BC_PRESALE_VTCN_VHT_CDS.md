# **BÁO CÁO TÌNH TRẠNG DỰ ÁN PRESALE CHUYỂN ĐỔI SỐ VHT**

> Ngày báo cáo: 01/07/2026
>
> Đơn vị báo cáo: Tư vấn Giải pháp

1.  **Tóm tắt thông tin điều hành**

-   Thời gian tư vấn: Ngày bắt đầu tư vấn giải pháp: T12/2025 =\> đến nay được 7 tháng

-   Trạng thái hiện tại: Đánh giá giải pháp, thực hiện ULNL và timeline.

-   Yêu cầu bài toán:

    -   Yêu cầu bài toán được thay đổi 3 lần.

        -   **Yêu cầu ban đầu**: Lakehouse.

        -   **Điều chỉnh lần 1**: chuyển sang hệ thống chuyển đổi số toàn trình, ưu tiên nhiệm vụ KHCN.

        -   **Điều chỉnh lần 2**: chuyển từ quy trình cứng sang quy trình động Camunda, bổ sung yêu cầu về AI Agent

    -   **Tác động**: thay đổi kiến trúc, thay đổi ULNL/timeline, phát sinh phụ thuộc vào quy trình VHT và license Camunda.

-   Mục tiêu chuyển đổi số:

    -   Mục tiêu chung: Hệ thống chuyển đổi số các nghiệp vụ mà các hệ thống phần mềm của tập đoàn triển khai chưa bao phủ được

    -   Trọng tâm giai đoạn 2026: Hoàn thành chuyển đổi số luồng quản lý nghiệp vụ nhiệm vụ KHCN đảm bảo thực hiện được 1 luồng xuyên suốt trên phần mềm

-   Kiến nghị chính: Đề xuất trạng thái dự án ở mức "rủi ro cao" nếu deadline không được điều chỉnh tương ứng với thay đổi giải pháp hoặc phạm vi phát triển không phù hợp với timeline.

2.  **Phạm vi chức năng nghiệp vụ đề xuất:**

    -   Đề xuất xây dựng hệ thống chuyển đổi số đảm bảo truy cập trong suốt với người dùng, hạn chế việc truy cập nhiều hệ thống, nhiều tài khoản

    -   Phạm vi ưu tiên 2026:

        1.  Phân hệ Cổng truy cập tập trung

        2.  Phân hệ Phân quyền tập trung

        3.  Phân hệ Danh mục dùng chung

        4.  Phân hệ Quản lý quy trình (Camunda 8)

        5.  Phân hệ Quản lý nhiệm vụ KHCN (7/11 quy trình)

        6.  Phân hệ Quản lý chi phí nhân công đề tài dự án

        7.  Phân hệ Quản lý hàng hóa đề tài, dự án

        8.  Phân hệ Mua sắm *(Nâng cấp hệ thống có sẵn)*

        9.  Phân hệ Tích hợp hệ thống ngoài và nội bộ *(tương ứng với nghiệp vụ phát triển)*

        10. Phân hệ tích hợp AI-AGENT

    
    ```
    -   Phạm vi định hướng các giai đoạn sau (2027)

> (5) Phân hệ Quản lý nhiệm vụ KHCN (4/11 quy trình)
>
> (9) Phân hệ Tích hợp hệ thống ngoài và nội bộ *(tương ứng với nghiệp vụ phát triển)*

-   Phạm vi chưa đủ thông tin để ULNL/ chào giá

(11) Phân hệ quản lý Chiến lược, kế hoạch (Chưa có bài toán)

(12) Phân hệ Quản lý Dự án SXKD, dự án đầu tư (Chưa có bài toán)

(13) Phân hệ Quản lý các hoạt động khác (Chưa có bài toán)

3.  **Các cột mốc đã thực hiện:**

+---------------+-------------------------+-----------------------------------------------+------------------------------------------------------------------------------------+
| **Giai đoạn** | **Thời gian**           | **Nội dung chính**                            | **Kết quả**                                                                        |
+===============+=========================+===============================================+====================================================================================+
| GĐ1           | 20/12/2025 - 19/01/2026 | Tiếp nhận yêu cầu triển khai Lakehouse        | Chuyển phạm vi Lakehouse sang VIC, VTIT follow vận hành                            |
+---------------+-------------------------+-----------------------------------------------+------------------------------------------------------------------------------------+
| GĐ2           | 20/01/2026 - 06/04/2026 | Xây dựng bài toán chuyển đổi số toàn trình    | Gửi Function List, ULNL 527MM, tối ưu còn 317MM (223.6MM thực hiện 2026)           |
+---------------+-------------------------+-----------------------------------------------+------------------------------------------------------------------------------------+
| GĐ3           | 07/04/2026 --           | Đánh giá Camunda và hiệu chỉnh quy trình KHCN | Hoàn thành đánh giá Camunda 8, nhận quy trình hiệu chỉnh, báo lại timeline và ULNL |
|               |                         |                                               |                                                                                    |
|               | nay                     |                                               |                                                                                    |
+---------------+-------------------------+-----------------------------------------------+------------------------------------------------------------------------------------+

4.  **Rủi ro/ vướng mắc**

+-----------------+-----------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------+
| **Rủi ro**      | **Mô tả**                                                                                                                                     | **Tác động**                                 |
+=================+===============================================================================================================================================+==============================================+
| Rủi ro timeline | \- Giải pháp Camunda 8: Cần xác định rõ license (VHT chưa chốt với đối tác), năng lực triển khai, mô hình vận hành, tích hợp SSO/IAM          | \- Ảnh hưởng chi phí, kiến trúc và tiến độ   |
|                 |                                                                                                                                               |                                              |
|                 |                                                                                                                                               | \- Áp lực phát triển nóng, rủi ro chất lượng |
|                 |                                                                                                                                               |                                              |
|                 |                                                                                                                                               |                                              |
+-----------------+-----------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------+
|                 | \- Bài toán đầu vào từ VHT: Quy trình nghiệp vụ hiệu chỉnh mới hoàn thành 22/06/2026 =\> Timeline triển khai thực tế phải tính lại từ mốc này |                                              |
+-----------------+-----------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------+
|                 | \- Bổ sung phạm vi so với bài toán tại mốc 06/04/2026: Tích hợp AI-Agent, phân hệ quản lý hàng hoá đề tài, dự án                              |                                              |
+-----------------+-----------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------+
| Rủi ro tích hợp | Hệ thống hướng tới truy cập trong suốt, hạn chế nhiều tài khoản, cần tích hợp hệ thống nội bộ/ngoài                                           | Cần làm rõ API, dữ liệu, phân quyền, SSO     |
+-----------------+-----------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------+

5.  **Đề xuất**

-   Cần VHT chốt:

    -   License Camunda 8

    -   Chốt lại timeline mở rộng đến T12/2026 như VTIT đề xuất thay vì dồn khối lượng lớn vào quý 3/2026 như VHT đang yêu cầu.

-   CầnVTIT/sản xuất thực hiện:

    -   Đề xuất khối lượng thực hiện và phương án thực hiện tương ứng với timeline

    -   Đánh giá rủi ro triển khai: nguồn lực, scope, tiến độ, license Camunda, tích hợp, vận hành.

    -   Đưa ra các điều kiện đảm bảo với VHT và VTIT để đáp ứng khối lượng và chất lượng tốt nhất có thể

    1.  **Đề xuất phương án xử lý Tiến độ & Phạm vi:**

> Do VHT yêu cầu dồn khối lượng lớn vào Quý 3/2026 trong khi bài toán quy trình mới chốt từ 22/06/2026, TVGP đề xuất 2 phương án **Cuốn chiếu theo lộ trình khả thi.**

-   *Nội dung:* tháng đầu tiên trong lộ trình tập trung hoàn thiện các phân hệ nền tảng (Cổng tập trung, Phân quyền, Danh mục), Quý 3/2026 tập trung xây dựng 2 Module chính của NV KHCN (RD01; RD02), Module quản lý chi phí nhân công, Module quản lý hàng hoá đề tài dự án; Nâng cấp Module mua sắm. Dịch chuyển các phân hệ chưa đủ thông tin (Chiến lược, Dự án SXKD,\...) và phần còn lại của nghiệp vụ KHCN sang Q4/2026 và năm 2027 (Phụ lục timeline đính kèm).

-   *Ưu điểm:* Đảm bảo chất lượng hệ thống, kiểm soát rủi ro từ giải pháp mới (Camunda 8).

    1.  **Đề xuất hành động phối hợp giữa các đơn vị (Cần BGĐ hỗ trợ chỉ đạo):**

**Đối với VHT:**

-   Chốt phương án thương thảo License Camunda 8 trước ngày 10/07/2026 để có căn cứ thiết kế kiến trúc chuẩn.

-   Cam kết đóng (freeze) yêu cầu nghiệp vụ đối với các quy trình KHCN đã bàn giao, không phát sinh thay đổi trong quá trình phát triển.

-   Bố trí nguồn lực đối ứng phục vụ team nghiệp vụ làm việc song song liên tục trong 2 tháng đầu để đảm bảo thực hiện khảo sát nghiệp vụ chốt bài toán thiết kế chi tiết cho cùng lúc tất cả các quy trình cần release mốc 30/09/2026

**Đối với VTIT / Khối Sản xuất:**

-   Chủ động xây dựng ngay Phương án sử dụng nguồn lực dựa trên ULNL mốc quy trình chốt ngày 22/06/2026 đảm bảo tiến độ và chất lượng

-   Phối hợp TVGP chốt scope và timeline triển khai với khách hàng

-   Phối hợp nhân sự TTCN đánh giá sớm năng lực triển khai Camunda 8 và AI Agent để giảm thiểu rủi ro công nghệ mới.

-   Đề xuất các điều kiện đảm bảo sản xuất và chất lượng công việc đầu ra.

PHỤ LỤC

1.  **Phụ lục Chi tiết các mốc đã thực hiện**

-   Giai đoạn 1: 20/12/2025 -- 19/01/2026

    -   **Ngày 20/12/2025** tiếp nhận yêu cầu ban đầu: Triển khai hệ thống lakehouse cho VHT

    -   Ngày 13/01/2026: Thống nhất VTIT không triển khai Lakehouse mà chuyển cho VIC triển khai, VTIT với vai trò follow để sẵn sàng tiếp nhận từ giai đoạn vận hành

-   Giai đoạn 2: 20/01/2026 -- 06/04/2026

    -   **Ngày 20/01/2026**: Tiếp nhận yêu cầu mới -- Xây dựng Hệ thống chuyển đổi số toàn trình cho VHT

    -   Ngày 26/01/2026: Khảo sát và khai thác yêu cầu tổng thể hệ thống, tập trung ưu tiên xây dựng hệ thống đáp ứng nhiệm vụ KHCN

    -   Ngày 10/03/2026: Gửi danh sách chức năng (Function List) theo biểu mẫu tập đoàn cho VHT

    -   Ngày 13/03/2026**:** Gửi ULNL cho VHT theo danh sách chức năng đã đề xuất, con số ước tính 527MM

    -   Ngày 18/03/2026: Khảo sát khai thác yêu cầu nâng cấp hệ thống mua sắm

    -   Ngày 06/04/2026: Gửi ULNL version 2 sau khi tối ưu danh sách chức năng, tối ưu nỗ lực tái sử dụng theo góp ý từ hội đồng thẩm định nội bộ, con số ước tính 317MM

-   Giai đoạn 3: 07/04/2026 - Nay

    -   **Ngày 07/04/2026:** VHT thông báo thay đổi lựa chọn giải pháp, thực hiện đánh giá hệ thống quản lý quy trình động Camunda, thực hiện hiệu chỉnh quy trình nghiệp vụ của Nhiệm vụ Khoa học công nghệ

    -   Ngày 31/05/2026: VTIT hoàn thành đánh giá Camunda 8 và gửi yêu cầu báo giá sang Camunda (thông qua đối tác Unit)

    -   Ngày 22/06/2026: VHT hoàn thành hiệu chỉnh quy trình quản lý Nhiệm vụ Khoa học Công nghệ

    -   Ngày 25/06/2026: VTIT báo lại timeline theo quy trình và cột mốc bắt đầu mới.
