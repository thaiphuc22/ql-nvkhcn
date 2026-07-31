import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { AuthService } from '../../core/auth/auth.service';
import {
  CAP_LABEL,
  CreateHoiDongRequest,
  HOI_DONG_CAP_LABEL,
  HoSoResponse,
  HoiDongCap,
  ThanhVienHoiDongRequest,
  UpdateHoiDongRequest,
} from '../../core/models/ho-so';
import { CandidateProfile, HoiDongCandidateService } from '../../core/services/hoi-dong-candidate.service';
import { HoiDongService } from '../../core/services/hoi-dong.service';
import { HoSoService } from '../../core/services/ho-so.service';

interface MemberRow {
  /** Tên hiển thị — lấy từ hồ sơ ứng viên khi chọn; giữ nguyên giá trị cũ nếu record cũ chưa gắn tài khoản. */
  hoTen: string;
  userId: string | null;
  vaiTroTrongHoiDong: string | null;
}

const VAI_TRO_OPTIONS = ['Chủ tịch', 'Phó Chủ tịch', 'Ủy viên thư ký', 'Ủy viên phản biện', 'Ủy viên'];

function emptyMember(): MemberRow {
  return { hoTen: '', userId: null, vaiTroTrongHoiDong: null };
}

/** Tạo mới / sửa một Hội đồng xét duyệt — trang toàn màn hình thay cho modal cũ, khớp mock UI
 * "Tạo mới Hội đồng". Thành viên bắt buộc chọn từ danh sách ứng viên có vai trò HDXD/HDXD_TD
 * ({@link HoiDongCandidateService.candidateProfiles}) để các cột chức danh/mã NV/phòng ban/email
 * tự điền được — không còn ô nhập tay họ tên như modal cũ. */
@Component({
  selector: 'app-hoi-dong-form',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzSpinModule,
  ],
  templateUrl: './hoi-dong-form.html',
  styleUrl: './hoi-dong-form.scss',
})
export class HoiDongFormPage {
  private readonly service = inject(HoiDongService);
  private readonly hoSoService = inject(HoSoService);
  private readonly candidateService = inject(HoiDongCandidateService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  readonly capLabel = HOI_DONG_CAP_LABEL;
  readonly nhiemVuCapLabel = CAP_LABEL;
  readonly capOptions: { value: HoiDongCap; label: string }[] = [
    { value: 'CO_SO', label: 'Cơ sở' },
    { value: 'TAP_DOAN', label: 'Tập đoàn' },
  ];
  readonly vaiTroOptions = VAI_TRO_OPTIONS;

  readonly editingId = signal<number | null>(null);
  private editingVersion = 0;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly hoSoList = signal<HoSoResponse[]>([]);
  readonly candidates = signal<CandidateProfile[]>([]);
  readonly candidateById = computed(() => new Map(this.candidates().map((c) => [c.userId, c])));

  readonly maHoiDong = signal('');
  readonly cap = signal<HoiDongCap>('CO_SO');
  readonly hoSoId = signal<string | null>(null);
  readonly canCuPhapLy = signal('');
  readonly members = signal<MemberRow[]>([emptyMember(), emptyMember(), emptyMember()]);

  readonly selectedHoSo = computed(() => this.hoSoList().find((h) => h.id === this.hoSoId()) ?? null);

  readonly canSubmit = computed(() =>
    !!this.maHoiDong().trim() &&
    !!this.hoSoId() &&
    this.members().every((m) => !!m.vaiTroTrongHoiDong?.trim() && !!m.userId));

  constructor() {
    this.hoSoService.list().subscribe({ next: (list) => this.hoSoList.set(list) });
    this.candidateService.candidateProfiles().subscribe({ next: (list) => this.candidates.set(list) });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.editingId.set(id);
      this.loading.set(true);
      this.service.get(id).subscribe({
        next: (item) => {
          this.editingVersion = item.version;
          this.maHoiDong.set(item.maHoiDong);
          this.cap.set(item.cap);
          this.hoSoId.set(item.hoSoId);
          this.canCuPhapLy.set(item.canCuPhapLy ?? '');
          this.members.set(item.thanhVien.length ? item.thanhVien.map((m) => ({ ...m })) : [emptyMember()]);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(`Không tải được hội đồng #${id} (HTTP ${error.status}).`);
          this.loading.set(false);
        },
      });
    }
  }

  hoSoLabel(hoSo: HoSoResponse): string {
    return `${hoSo.id} — ${hoSo.tenDeTai}`;
  }

  addMemberAfter(index: number): void {
    this.members.update((rows) => [...rows.slice(0, index + 1), emptyMember(), ...rows.slice(index + 1)]);
  }

  removeMember(index: number): void {
    this.members.update((rows) => rows.filter((_, i) => i !== index));
  }

  updateMemberRole(index: number, value: string | null): void {
    this.members.update((rows) => rows.map((row, i) => (i === index ? { ...row, vaiTroTrongHoiDong: value } : row)));
  }

  selectMember(index: number, userId: string | null): void {
    const candidate = userId ? (this.candidateById().get(userId) ?? null) : null;
    this.members.update((rows) =>
      rows.map((row, i) => (i === index ? { ...row, userId, hoTen: candidate?.hoTen ?? '' } : row)));
  }

  candidateOf(row: MemberRow): CandidateProfile | null {
    return row.userId ? (this.candidateById().get(row.userId) ?? null) : null;
  }

  cancel(): void {
    void this.router.navigate(['/hoi-dong']);
  }

  submit(): void {
    if (!this.canSubmit()) {
      this.message.error('Nhập mã hội đồng, chọn hồ sơ và chọn đủ vai trò + thành viên cho từng dòng.');
      return;
    }
    const actor = this.auth.user()?.hoTen ?? 'unknown-demo-user';
    const thanhVien: ThanhVienHoiDongRequest[] = this.members().map((m) => ({
      hoTen: m.hoTen.trim(),
      userId: m.userId,
      vaiTroTrongHoiDong: m.vaiTroTrongHoiDong?.trim() || null,
    }));
    const maHoiDong = this.maHoiDong().trim();
    const canCuPhapLy = this.canCuPhapLy().trim() || null;
    const id = this.editingId();

    this.saving.set(true);
    this.errorMessage.set(null);
    const request$ = id != null
      ? this.service.update(id, this.editingVersion, { maHoiDong, canCuPhapLy, thanhVien } as UpdateHoiDongRequest, actor)
      : this.service.create(
          { maHoiDong, hoSoId: this.hoSoId()!, cap: this.cap(), canCuPhapLy, thanhVien } as CreateHoiDongRequest,
          actor,
        );
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.message.success(id != null ? 'Đã cập nhật hội đồng.' : 'Đã tạo hội đồng mới.');
        void this.router.navigate(['/hoi-dong']);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        const body = error.error as { message?: string } | null;
        this.errorMessage.set(body?.message || `Lưu hội đồng thất bại (HTTP ${error.status}).`);
      },
    });
  }
}
