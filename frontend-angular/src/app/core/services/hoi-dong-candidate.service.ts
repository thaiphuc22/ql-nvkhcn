import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { OrganizationService } from './organization.service';
import { UserService } from './user.service';

/**
 * Danh mục ứng viên Hội đồng xét duyệt cho eForm `bm-02-08-qdh-nv` (QĐ thành lập HĐXD).
 *
 * Đây là hiện thân của lớp TĨNH trong mô hình phân quyền hội đồng: vai trò `HDXD`/`HDXD_TD` không
 * quyết định ai xử lý task nào, nó chỉ trả lời "ai đủ tư cách được chọn vào hội đồng". Người ký QĐ
 * chọn từ danh sách này, và lựa chọn đó (lưu vào `hoi_dong_thanh_vien.user_id` ở ho-so-service) mới
 * là thứ quyết định ai nhận User Task họp hội đồng của từng hồ sơ.
 */
export const VAI_TRO_HOI_DONG = ['HDXD', 'HDXD_TD'] as const;

/** Khoá `valuesKey` mà schema `bm-02-08-qdh-nv` khai để lấy options — xem migration V29. */
export const UNG_VIEN_HOI_DONG_KEY = 'ungVienHoiDong';

export interface FormOption {
  value: string;
  label: string;
}

/** Hồ sơ đầy đủ của một ứng viên hội đồng — dùng để tự điền các cột chỉ-đọc của bảng thành viên
 * (Chức danh khoa học/Mã nhân viên/Phòng ban/Email) khi người dùng chọn từ danh sách HDXD/HDXD_TD. */
export interface CandidateProfile {
  /** Email viết thường — cùng giá trị lưu vào `hoi_dong_thanh_vien.user_id`. */
  userId: string;
  hoTen: string;
  chucDanhKhoaHoc: string | null;
  maNhanVien: string | null;
  phongBan: string | null;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class HoiDongCandidateService {
  private readonly users = inject(UserService);
  private readonly organizations = inject(OrganizationService);
  private cached?: Observable<FormOption[]>;
  private cachedProfiles?: Observable<CandidateProfile[]>;

  /**
   * `value` là email viết thường — cùng định danh với `X-QTKHCN-User-Id` và với `candidate_users`
   * của workflow projection, nên giá trị chọn ở form dùng thẳng được để so khớp quyền, không cần
   * tra ngược UUID ở bất kỳ đâu.
   *
   * Identity-service lỗi ⇒ trả danh sách rỗng thay vì ném: người dùng thấy select trống và biết là
   * chưa chọn được, thay vì cả biểu mẫu QĐ sập.
   */
  candidates(): Observable<FormOption[]> {
    this.cached ??= combineLatest([this.users.list(), this.users.allAssignments()]).pipe(
      map(([users, assignments]) => {
        const eligible = new Set(
          assignments
            .filter((a) => (VAI_TRO_HOI_DONG as readonly string[]).includes(a.roleCode))
            .map((a) => a.userId),
        );
        return users
          .filter((u) => eligible.has(u.id) && u.status === 'ACTIVE')
          .map((u) => ({
            value: u.email.toLowerCase(),
            label: u.jobTitle ? `${u.fullName} — ${u.jobTitle}` : u.fullName,
          }))
          .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
      }),
      catchError(() => of<FormOption[]>([])),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.cached;
  }

  /** Bản đầy đủ hơn của {@link candidates}, phục vụ bảng thành viên ở màn "Quản lý Hội đồng"
   * (`/hoi-dong`) — cần thêm chức danh/mã nhân viên/phòng ban/email để tự điền, không chỉ nhãn hiển thị. */
  candidateProfiles(): Observable<CandidateProfile[]> {
    this.cachedProfiles ??= combineLatest([
      this.users.list(),
      this.users.allAssignments(),
      this.organizations.list(),
    ]).pipe(
      map(([users, assignments, organizations]) => {
        const eligible = new Set(
          assignments
            .filter((a) => (VAI_TRO_HOI_DONG as readonly string[]).includes(a.roleCode))
            .map((a) => a.userId),
        );
        const orgNameById = new Map(organizations.map((o) => [o.id, o.name]));
        return users
          .filter((u) => eligible.has(u.id) && u.status === 'ACTIVE')
          .map((u) => ({
            userId: u.email.toLowerCase(),
            hoTen: u.fullName,
            chucDanhKhoaHoc: u.jobTitle,
            maNhanVien: u.employeeCode,
            phongBan: u.organizationId ? (orgNameById.get(u.organizationId) ?? null) : null,
            email: u.email,
          }))
          .sort((a, b) => a.hoTen.localeCompare(b.hoTen, 'vi'));
      }),
      catchError(() => of<CandidateProfile[]>([])),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.cachedProfiles;
  }
}
