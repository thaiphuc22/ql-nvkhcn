# Prototype — Mockup UI (throwaway)

> ⚠️ **Đây là MOCKUP để validate với khách, KHÔNG phải code production.**
> Cố ý dùng HTML/CSS/JS thuần — **không framework, không build, không backend** — để:
> - Không khóa stack production (đó là quyết định của foundation **F2**, chưa chốt).
> - Chạy ngay bằng cách mở file, dễ demo/chia sẻ.
>
> Khi F2 (kiến trúc) + F3 (scaffold) chốt, code production sẽ nằm ở `src/` riêng, **không** kế thừa thư mục này.

## Nội dung

| File | Mô tả |
|---|---|
| `index.html` | Màn **Quản lý Danh mục quy trình** (phân hệ QL Quy trình / Camunda) |
| `assets/styles.css` | Style (thuần CSS, không lib) |
| `assets/app.js` | Dữ liệu seed (từ catalog RD01–RD10) + tương tác (lọc, deploy, phiên bản, kích hoạt) |

## Chạy

Mở `prototype/index.html` bằng trình duyệt (không cần server).

## Màn này minh hoạ requirement nào

- **REQ-ENG-001** — deploy/kích hoạt quy trình BPMN không cần code
- **REQ-ENG-003 / P10** — versioning process definition (instance giữ bản cũ)
- Phản ánh **độ phủ thật** từ `docs/req/RTM.md`: RD01/RD02/RD05 = Đang chạy; RD03/RD04 = Nháp; RD06 = Chưa triển khai (gap).

## Giới hạn (đúng bản chất mockup)

- Dữ liệu in-memory, reset khi tải lại trang.
- Nút Deploy/Kích hoạt chỉ mô phỏng (không gọi Camunda thật).
- Sơ đồ BPMN là placeholder (bản thật xem trong Camunda Web Modeler).
