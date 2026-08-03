import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { ProcessDefinitionService } from '../../core/services/process-definition.service';
import { BACKEND_CONNECTION_LABEL } from '../../core/api-config';
import {
  ProcessDefinitionDetailResponse,
  ProcessDefinitionVersionResponse,
} from '../../core/models/process-definition';
import { BpmnViewerComponent } from '../../shared/bpmn-viewer/bpmn-viewer';

/**
 * Trang thật "Chi tiết quy trình" — route `/quy-trinh/:id`, thay drawer "Xem phiên bản" trước đây
 * trong `ProcessCatalogPage`. Gọi thẳng `GET /api/process-definitions/{id}` (metadata catalog) và
 * `GET /api/process-definitions/{id}/versions` (lịch sử version, mỗi version kèm sẵn `bpmnXml`) —
 * cả hai endpoint đã có sẵn từ backend BPMN import/deploy workstream, không cần đổi backend.
 * Sơ đồ BPMN dùng `BpmnViewerComponent` (NavigatedViewer chỉ-đọc, port từ
 * `webapp/src/components/BpmnViewer.tsx`, bỏ toolbar/minimap/fullscreen cho lần đầu port).
 */
@Component({
  selector: 'app-process-detail',
  imports: [
    DatePipe,
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzCollapseModule,
    NzDescriptionsModule,
    NzIconModule,
    NzPageHeaderModule,
    NzResultModule,
    NzSelectModule,
    NzSpinModule,
    NzTabsModule,
    NzTagModule,
    NzTypographyModule,
    BpmnViewerComponent,
  ],
  templateUrl: './process-detail.html',
  styleUrl: './process-detail.scss',
})
export class ProcessDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly processDefinitionService = inject(ProcessDefinitionService);

  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly detail = signal<ProcessDefinitionDetailResponse | null>(null);
  readonly versionsList = signal<ProcessDefinitionVersionResponse[]>([]);
  readonly selectedVersionId = signal<string | null>(null);
  readonly activeTabIndex = signal(0);

  readonly selectedVersion = computed(
    () => this.versionsList().find((v) => v.id === this.selectedVersionId()) ?? null,
  );

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id');
      if (id) this.load(id);
    });
  }

  backToCatalog(): void {
    this.router.navigate(['/quy-trinh']);
  }

  viewDiagram(versionId: string): void {
    this.selectedVersionId.set(versionId);
    this.activeTabIndex.set(1);
  }

  private load(id: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.errorMessage.set(null);
    this.detail.set(null);
    this.versionsList.set([]);
    this.selectedVersionId.set(null);
    this.activeTabIndex.set(0);

    this.processDefinitionService.get(id).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => this.handleLoadError(err),
    });

    this.processDefinitionService.versions(id).subscribe({
      next: (versions) => {
        this.versionsList.set(versions);
        this.selectedVersionId.set(versions[0]?.id ?? null);
      },
      error: () => {
        // Header/thông tin catalog vẫn hiển thị được nếu riêng lịch sử version lỗi;
        // không chặn toàn trang vì đây không phải dữ liệu bắt buộc để xem chi tiết catalog.
      },
    });
  }

  private handleLoadError(err: HttpErrorResponse): void {
    this.loading.set(false);
    if (err.status === 404) {
      this.notFound.set(true);
    } else {
      this.errorMessage.set(
        err.status === 0
          ? `Không kết nối được backend (${BACKEND_CONNECTION_LABEL}).`
          : `Lỗi tải chi tiết quy trình (HTTP ${err.status}).`,
      );
    }
  }
}
