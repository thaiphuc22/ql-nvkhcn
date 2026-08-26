/**
 * Ánh xạ tên icon ng-zorro → **PrimeIcons** cho phân hệ HR Tools (D23).
 *
 * ## Vì sao phải có file này
 *
 * `NAV_ITEMS` và `APP_REGISTRY` khai icon bằng **tên của ng-zorro** (`project`, `team`, `safety`…)
 * vì ba phân hệ cũ chạy ng-zorro. HR Tools chạy PrimeNG nên không đọc được những tên đó. Hai cách
 * xử lý: (a) đổi `NAV_ITEMS` sang tên PrimeIcons — hỏng menu của ba phân hệ kia; (b) dịch tên tại
 * biên của HR Tools — chính là file này. Chọn (b) vì `NAV_ITEMS` là nguồn dùng chung, và nguyên tắc
 * "không hardcode menu trong shell" phải giữ.
 *
 * ## ⚠ NỢ KỸ THUẬT ĐÃ GHI NHẬN — đây KHÔNG phải bộ icon cuối cùng
 *
 * Bộ icon thật của design system **chưa lấy được**, hai ràng buộc đã kiểm chứng chứ không phải
 * phỏng đoán:
 *
 * 1. `docs/design-system/figma-raw/` **không có dữ liệu vector** — quét cả 8 file, `fillGeometry`
 *    và `strokeGeometry` đều rỗng. Bộ DS chỉ còn ảnh PNG của icon, không dựng lại được SVG.
 * 2. `@khcn-core/ui` chỉ lộ **6 icon component** (`cmm-icon-{edit,delete,delete-popup,eye,history,
 *    undo}`) — đúng bộ hay dùng nhất ở cột *Thao tác* của bảng, nhưng không có nav/topbar icon.
 *
 * Nên: dùng 6 icon của thư viện ở cột Thao tác, phần còn lại tạm bằng PrimeIcons (đi kèm PrimeNG,
 * cùng phong cách nét mảnh). Đường lấy icon thật đã ghi lại để làm sau: sau **2026-08-31** (Figma
 * mở khoá `files/nodes`) export bằng `/v1/images?format=svg` — quota ảnh là quota RIÊNG, không bị
 * khoá — hoặc xin thẳng thư mục `/icons/` từ đội làm phân hệ Danh mục dùng chung.
 *
 * Khi có bộ icon thật: thay phần thân `hrIcon()` là xong, không phải sửa component nào.
 */

/** Bảng dịch. Khoá = tên ng-zorro dùng trong `NAV_ITEMS`/`APP_REGISTRY`; giá trị = lớp PrimeIcons. */
const NG_ZORRO_TO_PRIME: Readonly<Record<string, string>> = {
  // icon phân hệ (thẻ chọn phân hệ ở đầu sider)
  experiment: 'pi-sparkles',
  partition: 'pi-sitemap',
  team: 'pi-users',
  safety: 'pi-shield',
  // icon nhóm menu
  project: 'pi-briefcase',
  database: 'pi-database',
  'carry-out': 'pi-check-square',
  dashboard: 'pi-chart-bar',
};

/**
 * Trả về lớp PrimeIcons đầy đủ (`pi pi-...`) cho một tên icon ng-zorro.
 *
 * Không khớp thì rơi về `pi-circle-fill` — CỐ Ý chọn một icon **nhìn thấy được** chứ không phải ô
 * trống: menu thiếu icon im lặng là loại lỗi không ai báo, còn một chấm tròn lạ giữa hàng nav thì
 * ai nhìn cũng biết có chỗ chưa dịch.
 */
export function hrIcon(name: string | null | undefined): string {
  return `pi ${(name && NG_ZORRO_TO_PRIME[name]) || 'pi-circle-fill'}`;
}
