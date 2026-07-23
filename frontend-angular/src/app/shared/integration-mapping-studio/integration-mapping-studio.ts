import { JsonPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../core/auth/auth.service';
import {
  BUSINESS_OBJECT_LABEL,
  MAPPING_DIRECTION_LABEL,
  MAPPING_STATUS_META,
  previewMapping,
  type BusinessObject,
  type FieldMapping,
  type MappingConfig,
  type MappingDirection,
  type PreviewResult,
  type SampleRecord,
} from '../../core/models/integration-mapping';
import { IntegrationSystemService } from '../../core/services/integration-system.service';
import { IntegrationMappingService } from '../../core/services/integration-mapping.service';
import { HoSoService } from '../../core/services/ho-so.service';
import { NhiemVuService } from '../../core/services/nhiem-vu.service';
import { IntegrationMappingFieldEditor } from '../integration-mapping-field-editor/integration-mapping-field-editor';

// Port của webapp/src/components/MappingStudio.tsx — tab "Mapping dữ liệu" của màn
// Tích hợp (`/tich-hop`). Danh sách + soạn field/value mapping + preview payload +
// validate fail-closed trước khi Active (gọi backend, xem IntegrationMappingService).

@Component({
  selector: 'app-integration-mapping-studio',
  imports: [
    FormsModule,
    JsonPipe,
    NzButtonModule,
    NzDrawerModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTooltipModule,
    NzTypographyModule,
    IntegrationMappingFieldEditor,
  ],
  templateUrl: './integration-mapping-studio.html',
  styleUrl: './integration-mapping-studio.scss',
})
export class IntegrationMappingStudio {
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly nhiemVuService = inject(NhiemVuService);
  private readonly hoSoService = inject(HoSoService);
  readonly systems = inject(IntegrationSystemService);
  readonly mappings = inject(IntegrationMappingService);

  readonly businessObjectLabel = BUSINESS_OBJECT_LABEL;
  readonly directionLabel = MAPPING_DIRECTION_LABEL;
  readonly statusMeta = MAPPING_STATUS_META;

  readonly objectOptions = (Object.keys(BUSINESS_OBJECT_LABEL) as BusinessObject[]).map((v) => ({
    label: BUSINESS_OBJECT_LABEL[v],
    value: v,
  }));
  readonly directionOptions = (Object.keys(MAPPING_DIRECTION_LABEL) as MappingDirection[]).map((v) => ({
    label: MAPPING_DIRECTION_LABEL[v],
    value: v,
  }));
  readonly systemOptions = computed(() =>
    this.systems.systems().map((s) => ({ label: `${s.key} — ${s.ten}`, value: s.key })),
  );

  readonly fHe = signal<string | undefined>(undefined);
  readonly fDoiTuong = signal<BusinessObject | undefined>(undefined);
  readonly fChieu = signal<MappingDirection | undefined>(undefined);

  readonly editing = signal<MappingConfig | undefined>(undefined);
  readonly draftFields = signal<FieldMapping[]>([]);
  readonly previewing = signal<MappingConfig | undefined>(undefined);
  readonly createOpen = signal(false);
  readonly createForm = signal<{ he?: string; doiTuong?: BusinessObject; chieu?: MappingDirection }>({});
  readonly saving = signal(false);

  readonly rows = computed(() =>
    this.mappings.list().filter(
      (c) =>
        (!this.fHe() || c.he === this.fHe()) &&
        (!this.fDoiTuong() || c.doiTuong === this.fDoiTuong()) &&
        (!this.fChieu() || c.chieu === this.fChieu()),
    ),
  );

  private actor(): string {
    return this.auth.user()?.email ?? 'admin';
  }

  openEdit(c: MappingConfig): void {
    this.editing.set(c);
    this.draftFields.set(c.fields);
  }

  closeEdit(): void {
    this.editing.set(undefined);
  }

  saveEdit(): void {
    const config = this.editing();
    if (!config) return;
    this.mappings.saveFields(config, this.draftFields(), this.actor()).subscribe({
      next: () => {
        this.message.success(`Đã lưu mapping ${config.he} · ${this.businessObjectLabel[config.doiTuong]} (đưa về Draft).`);
        this.editing.set(undefined);
      },
      error: () => this.message.error('Không thể lưu mapping — vui lòng tải lại và thử lại.'),
    });
  }

  toggleActive(c: MappingConfig): void {
    if (c.trangThai === 'active') {
      this.mappings.setStatus(c, 'deprecated', this.actor()).subscribe({
        next: () => this.message.success('Đã chuyển sang Deprecated.'),
        error: () => this.message.error('Không thể đổi trạng thái — vui lòng tải lại và thử lại.'),
      });
      return;
    }
    this.mappings.setStatus(c, 'active', this.actor()).subscribe({
      next: (result) => {
        if (!result.ok) {
          this.modal.error({
            nzTitle: 'Không thể kích hoạt — mapping chưa hợp lệ',
            nzContent: '<ul style="padding-left:18px;margin:0">' + result.errors.map((e) => `<li>${e}</li>`).join('') + '</ul>',
          });
          return;
        }
        this.message.success('Đã kích hoạt mapping.');
      },
      error: () => this.message.error('Không thể đổi trạng thái — vui lòng tải lại và thử lại.'),
    });
  }

  remove(c: MappingConfig): void {
    this.mappings.remove(c).subscribe({
      error: () => this.message.error('Không thể xoá mapping — vui lòng tải lại và thử lại.'),
    });
  }

  doCreate(): void {
    const form = this.createForm();
    if (!form.he || !form.doiTuong || !form.chieu) return;
    this.saving.set(true);
    this.mappings.create({ he: form.he, doiTuong: form.doiTuong, chieu: form.chieu }, this.actor()).subscribe({
      next: () => {
        this.saving.set(false);
        this.createOpen.set(false);
        this.createForm.set({});
        this.message.success('Đã tạo mapping mới (Draft) — bấm "Sửa" để soạn field.');
      },
      error: () => {
        this.saving.set(false);
        this.message.error('Không thể tạo mapping mới.');
      },
    });
  }

  openPreview(c: MappingConfig): void {
    this.previewing.set(c);
    this.loadSamplesFor(c.doiTuong);
  }

  closePreview(): void {
    this.previewing.set(undefined);
  }

  readonly sampleRecords = signal<SampleRecord[]>([]);
  readonly sampleId = signal<string | undefined>(undefined);

  private loadSamplesFor(doiTuong: BusinessObject): void {
    this.sampleRecords.set([]);
    this.sampleId.set(undefined);
    if (doiTuong === 'NhiemVu' || doiTuong === 'DuToan') {
      this.nhiemVuService.list().subscribe((list) => {
        const samples: SampleRecord[] =
          doiTuong === 'NhiemVu'
            ? list.map((nv) => ({
                id: nv.ma,
                label: `${nv.ma} — ${nv.ten}`,
                data: { ma: nv.ma, ten: nv.ten, cap: nv.cap, donViChuTri: nv.donViChuTri, thoiGianThucHien: nv.thoiGianThucHien, duToan: nv.duToan, giaiDoan: nv.giaiDoan },
              }))
            : list.map((nv) => ({ id: nv.ma, label: `${nv.ma} — ${nv.ten}`, data: { ma: nv.ma, duToan: nv.duToan, giaiDoan: nv.giaiDoan } }));
        this.sampleRecords.set(samples);
        this.sampleId.set(samples[0]?.id);
      });
      return;
    }
    if (doiTuong === 'HoSo') {
      this.hoSoService.list().subscribe((list) => {
        const samples: SampleRecord[] = list.map((d) => ({
          id: d.id,
          label: `${d.id} — ${d.maNV}`,
          data: { id: d.id, maNV: d.maNV, loai: d.loai, trangThai: d.trangThai, ngayTao: d.ngayTao },
        }));
        this.sampleRecords.set(samples);
        this.sampleId.set(samples[0]?.id);
      });
      return;
    }
    // NhanSu/TaiSan: không có nguồn dữ liệu thật khớp field (xem ghi chú ở integration-mapping.ts) — trả rỗng.
  }

  readonly previewResult = computed<PreviewResult | undefined>(() => {
    const config = this.previewing();
    const sample = this.sampleRecords().find((s) => s.id === this.sampleId());
    if (!config || !sample) return undefined;
    return previewMapping(config, sample.data);
  });

  readonly previewSample = computed(() => this.sampleRecords().find((s) => s.id === this.sampleId()));
}
