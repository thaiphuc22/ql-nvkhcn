import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzIconService } from 'ng-zorro-antd/icon';
import {
  APPROVAL_MATRIX_ICONS,
  DYNAMIC_NZ_ICONS,
  EFORM_ICONS,
  INTEGRATION_ICONS,
  NAV_ICONS,
  NHIEM_VU_ICONS,
  PROCESS_CATALOG_ICONS,
  SERVICE_TASK_ICONS,
} from './core/icons-provider';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    inject(NzIconService).addIcon(
      ...NAV_ICONS,
      ...APPROVAL_MATRIX_ICONS,
      ...SERVICE_TASK_ICONS,
      ...EFORM_ICONS,
      ...NHIEM_VU_ICONS,
      ...INTEGRATION_ICONS,
      ...PROCESS_CATALOG_ICONS,
      ...DYNAMIC_NZ_ICONS,
    );
  }
}
