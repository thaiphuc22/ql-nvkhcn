import { Injectable, computed, inject } from '@angular/core';

import { AuthService } from '../../auth/auth.service';

/**
 * Quyền của phân hệ HR Tools — **fail-closed**, kế hoạch §7.2.
 *
 * ## Ma trận của khách (sheet `2.Chấm công` dòng 129–138)
 *
 * | Hành động | PA ĐV chủ trì | PA ĐV khác | PM | HR |
 * |---|---|---|---|---|
 * | Chấm công / Thêm / Sửa / Xoá / Submit | ✓ | ✓ | ✓ | ✓ |
 * | PA/PM chủ trì xác nhận | ✓ | — | ✓ | — |
 * | Xuất DS nhân sự (BM1), bảng công (BM2.1) | ✓ | — | ✓ | ✓ |
 * | **Xuất bảng lương (BM3.1/3.2)** | — | — | — | **✓ chỉ HR** |
 *
 * ## Ba điều phải giữ khi sửa file này
 *
 * 1. **Mã quyền bảng lương tách riêng khỏi mã quyền bảng công.** Gộp một mã là mở quyền lương cho
 *    mọi người chấm công.
 * 2. **Fail-closed nghĩa là KHÔNG RENDER**, không phải render rồi chặn khi bấm. Nghiệm thu soi
 *    trong DOM: đăng nhập tài khoản PA rồi tìm chuỗi tiền trong HTML — không được có (§14 mục 11).
 * 3. Đây là lọc **phía client cho UI**, theo đúng D19 và cùng khuôn `entitledApps()`. RBAC thật cho
 *    HR Tools là đợt 6. ⚠ Nhắc lại bẫy đã ghi trong bộ nhớ dự án: catalog quyền của
 *    `identity-service` **gate hành động thật** — tắt một mã ở đó là cắt quyền thật, không chỉ ẩn UI.
 *
 * ## Vì sao không thêm vai trò mới
 *
 * Kế hoạch §9.1 ghi rằng **GĐTT** và **BGĐ Khối** *"chưa có trong `core/models/roles.ts`, phải bổ
 * sung"*. Đọc lại file đó ngày 2026-08-27 thì **cả hai đã có** — `BGD_TT` (BGĐ Trung tâm) và
 * `BGD_KHOI`. Ghi chú kia là stale; không thêm mã trùng nghĩa.
 */

/** Vai trò nhân sự — nguồn quyền xem/xuất dữ liệu lương. */
export const VAI_TRO_HR: readonly string[] = ['CQ_NS', 'TP_NS'];

/** Vai trò chấm công: PA/PM của nhiệm vụ, cộng HR. */
export const VAI_TRO_CHAM_CONG: readonly string[] = ['PA', 'PM', ...VAI_TRO_HR];

@Injectable({ providedIn: 'root' })
export class QuyenHrService {
  private readonly auth = inject(AuthService);

  private readonly maVaiTro = computed(() => this.auth.user()?.roleCodes ?? []);

  /**
   * Tài khoản quản trị thấy mọi thứ.
   *
   * Không phải nới lỏng cho tiện: `entitledApps()` đã theo đúng quy ước này, và các màn demo chạy
   * bằng tài khoản admin. Nhưng nó là **lý do phải nghiệm thu bằng tài khoản PA thật** chứ không
   * bằng admin — soi fail-closed trên admin thì luôn thấy đủ cột và tưởng là đúng.
   */
  private readonly laAdmin = computed(() => !!this.auth.user()?.isAdmin);

  /** Vai trò nhân sự — chỉ nhóm này được xem và xuất dữ liệu lương. */
  readonly laHR = computed(
    () => this.laAdmin() || this.maVaiTro().some((m) => VAI_TRO_HR.includes(m)),
  );

  /**
   * Được xem **cột tiền** của bảng lương không.
   *
   * Tách khỏi `laHR` dù hiện tại trùng nhau: khi khách mở quyền xem lương cho một vai trò khác (ví
   * dụ TCKT), chỗ sửa là đúng hàm này, và mọi màn đọc nó vẫn đúng mà không phải rà lại.
   */
  readonly xemCotTien = computed(() => this.laHR());

  /** Được xuất BM3.1 / BM3.2. Cùng nguồn với `xemCotTien` — không có quyền xem thì không có gì để xuất. */
  readonly xuatBangLuong = computed(() => this.xemCotTien());

  /** Được nhập file BM0 (bảng công và bảng lương) — việc của HR. */
  readonly nhapBM0 = computed(() => this.laHR());

  /**
   * Được **mở lại kỳ đã khoá** không.
   *
   * ⚠ Đây là giả định, không phải luật đã chốt: **Q2** của kế hoạch §12 vẫn đang chờ khách trả lời
   * (*"ai được mở lại kỳ đã khoá, có bắt buộc lý do không"*). Bản này giả định **chỉ HR**, và **lý
   * do là bắt buộc**. Khách trả lời khác thì sửa đúng ở đây.
   */
  readonly moLaiKy = computed(() => this.laHR());

  /** Được chấm công / submit bản phân bổ. */
  readonly chamCong = computed(
    () => this.laAdmin() || this.maVaiTro().some((m) => VAI_TRO_CHAM_CONG.includes(m)),
  );

  /**
   * Vai trò **chưa nạp xong** từ identity-service.
   *
   * Đây KHÔNG phải "không có quyền", và trộn hai thứ là sai theo đúng ghi chú đã có ở
   * `AuthService.rolesLoaded`: *"trước khi cờ này bật thì 'không có vai trò' chỉ nghĩa là CHƯA
   * BIẾT"*. Hai nguyên nhân, hai cách xử lý — người dùng thấy "bạn không có quyền" sẽ đi xin cấp
   * quyền, trong khi việc cần làm là khởi động identity-service.
   *
   * Fail-closed **vẫn áp dụng** trong lúc chưa biết: không có cột tiền. Chỉ lời giải thích đổi.
   */
  readonly vaiTroChuaBiet = computed(
    () => !this.laAdmin() && (!this.auth.rolesLoaded() || this.auth.identityUnavailable()),
  );

  /** Nhãn vai trò hiện tại — hiện trên thẻ đầu màn bảng lương để người soi biết đang xem bằng quyền gì. */
  readonly nhanVaiTro = computed(() => {
    if (this.laAdmin()) return 'Quản trị hệ thống — thấy đầy đủ cột tiền';
    if (this.laHR()) return 'Nhân sự (HR) — thấy đầy đủ cột tiền';
    if (this.vaiTroChuaBiet()) return 'Chưa xác định được vai trò';
    return `${this.auth.user()?.chucDanh ?? 'Người dùng'} — không có quyền xem dữ liệu lương`;
  });
}
