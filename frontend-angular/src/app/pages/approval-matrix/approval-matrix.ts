import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { ApprovalMatrixService } from '../../core/services/approval-matrix.service';
import { ApprovalSlotCatalogService } from '../../core/services/approval-slot-catalog.service';

import { ApprovalMatrixRulesTabPage } from './approval-matrix-rules-tab/approval-matrix-rules-tab';
import { ApprovalSlotCatalogTabPage } from './approval-slot-catalog-tab/approval-slot-catalog-tab';

/**
 * Ma trận phê duyệt (Approval Matrix) — route `/ma-tran-phe-duyet`. Shell 2 tab:
 * "Ma trận" (luật ánh xạ điều kiện → người phê duyệt) và "Danh mục Loại phê duyệt"
 * (catalog Need Role dùng bởi BPMN). Port của webapp/src/pages/ApprovalMatrix.tsx
 * (default export — D17 Angular migration). Dữ liệu được tải/lưu qua Spring Boot;
 * ApprovalMatrixService/ApprovalSlotCatalogService giữ signal cache dùng chung giữa hai tab.
 */
@Component({
  selector: 'app-approval-matrix',
  imports: [NzIconModule, NzTabsModule, NzTypographyModule, ApprovalMatrixRulesTabPage, ApprovalSlotCatalogTabPage],
  templateUrl: './approval-matrix.html',
  styleUrl: './approval-matrix.scss',
})
export class ApprovalMatrixPage implements OnInit {
  private readonly matrix = inject(ApprovalMatrixService);
  private readonly slots = inject(ApprovalSlotCatalogService);
  private readonly message = inject(NzMessageService);

  ngOnInit(): void {
    forkJoin([this.matrix.load(), this.slots.load(), this.matrix.analyze()]).subscribe({
      error: (error) =>
        this.message.error(error?.error?.message ?? 'Không tải được dữ liệu Ma trận phê duyệt từ backend.'),
    });
  }
}
