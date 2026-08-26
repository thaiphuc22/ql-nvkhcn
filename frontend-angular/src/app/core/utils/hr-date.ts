/**
 * Cầu nối giữa **ngày lưu dạng chuỗi ISO `YYYY-MM-DD`** trong model HR Tools và **`Date`** mà
 * `<p-datepicker>` yêu cầu.
 *
 * ## Vì sao không đổi model sang `Date`
 *
 * `tuNgay`/`denNgay` là dữ liệu nghiệp vụ đi thẳng vào file xuất Excel, bản in BM1–BM5 và (sau này)
 * payload gửi backend. `Date` của JavaScript mang theo giờ + múi giờ — thứ không có trong nghiệp vụ
 * và là nguồn lệch ngày kinh điển. Giữ chuỗi ISO ở model, đổi kiểu ở đúng biên giao diện.
 *
 * ## Bẫy đã tránh
 *
 * `new Date('2026-08-26')` được đặc tả coi là **UTC nửa đêm**; ở múi giờ +07 nó ra
 * `2026-08-26T07:00` — vẫn đúng ngày. Nhưng ở múi giờ ÂM (ví dụ máy build đặt UTC-5) thì lùi thành
 * **25/08**. Vì vậy `hrToDate` dựng `Date` bằng constructor **local** `new Date(y, m - 1, d)`, và
 * `hrToIso` đọc lại bằng `getFullYear/getMonth/getDate` (local) chứ không dùng `toISOString()` —
 * `toISOString()` quy về UTC và tái tạo đúng cái lỗi vừa tránh.
 */

/**
 * Bộ nhớ đệm ISO → `Date`, **bắt buộc chứ không phải tối ưu hoá**.
 *
 * Template gọi `hrToDate(...)` trong biểu thức binding (`[ngModel]="ngayDate('tuNgay')"`). Trả về
 * `new Date(...)` mỗi lần gọi nghĩa là **mỗi vòng kiểm tra thay đổi lại là một tham chiếu mới**;
 * `<p-datepicker>` thấy input đổi ⇒ ghi lại state nội bộ ⇒ đánh dấu view bẩn ⇒ Angular chạy vòng
 * kiểm tra tiếp ⇒ lặp vô hạn. Triệu chứng không phải màn hình lỗi mà là **tab treo cứng** (đo được
 * 4386 giây CPU ở một tab), không một dòng lỗi nào trong console — phát hiện 2026-08-27 khi chạy
 * kiểm chứng §10.4/§10.5, nó chặn cả `/hr/nhiem-vu` lẫn `/hr/khai-bao-nhiem-vu`.
 *
 * Cùng một chuỗi ISO phải trả về **cùng một đối tượng** thì vòng lặp mới dừng.
 *
 * ⚠ Hệ quả: đối tượng trả về **dùng chung**, tuyệt đối không sửa tại chỗ (`setHours`, `setDate`…).
 * Chỗ nào cần đổi ngày thì tạo `Date` mới, hoặc đi qua `hrToIso` rồi `hrToDate` lại. Ô chọn ngày
 * của HR Tools đều là ngày thuần (không `showTime`) nên PrimeNG chỉ tạo `Date` mới khi người dùng
 * chọn, không sửa tại chỗ.
 */
const CACHE_NGAY = new Map<string, Date>();

/** Chuỗi ISO `YYYY-MM-DD` → `Date` lúc 00:00 giờ ĐỊA PHƯƠNG. Chuỗi rỗng/không hợp lệ → `null`. */
export function hrToDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const daCo = CACHE_NGAY.get(iso);
  if (daCo) return daCo;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  const ngay = new Date(y, m - 1, d);
  CACHE_NGAY.set(iso, ngay);
  return ngay;
}

/** `Date` → chuỗi ISO `YYYY-MM-DD` theo giờ ĐỊA PHƯƠNG. `null`/không hợp lệ → chuỗi rỗng. */
export function hrToIso(date: Date | null | undefined): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/**
 * Định dạng ngày dùng chung cho mọi ô chọn ngày của HR Tools.
 *
 * `dd/mm/yy` là định dạng người Việt đọc được — mặc định của PrimeNG là `mm/dd/yy` (kiểu Mỹ), để
 * nguyên thì 03/08 bị đọc thành 8 tháng 3. Đây là lỗi không ai báo vì màn hình vẫn "trông bình
 * thường".
 *
 * ⚠ **Dùng `<p-datepicker>` của PrimeNG, KHÔNG phải `cmm-datepicker`.** Thư viện có khai
 * `CmmDatepickerComponent` nhưng **không xuất ra ngoài** — quét `export { ... }` trong
 * `UI-ubck/ui-0.0.1-v21/package/types/khcn-core-ui.d.ts` ngày 2026-08-26 thì không có tên đó (chỉ
 * `CmmDynamicFormModule` dùng nội bộ). Đây là thiếu sót của package, không phải lựa chọn của mình.
 * `p-datepicker` chính là thứ `cmm-datepicker` bọc lại và vẫn nhận theme `@khcn-core/theme`, nên
 * hình thức không lệch. Khi package xuất ra thì đổi lại là hợp lý.
 */
export const HR_DATE_FORMAT = 'dd/mm/yy';
