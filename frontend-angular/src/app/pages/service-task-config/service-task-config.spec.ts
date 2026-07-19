import { TestBed } from '@angular/core/testing';
import { NzIconService } from 'ng-zorro-antd/icon';

import { APPROVAL_MATRIX_ICONS, NAV_ICONS, SERVICE_TASK_ICONS } from '../../core/icons-provider';
import { ServiceTaskConfigPage } from './service-task-config';

describe('ServiceTaskConfigPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS, ...APPROVAL_MATRIX_ICONS, ...SERVICE_TASK_ICONS);
  });

  function create() {
    const fixture = TestBed.createComponent(ServiceTaskConfigPage);
    fixture.detectChanges();
    return fixture;
  }

  it('renders without throwing and computes rows from the seeded service', () => {
    const fixture = create();
    expect(fixture.componentInstance.rows().length).toBeGreaterThan(0);
  }, 15_000);

  it('opens the create drawer with no editing definition', () => {
    const fixture = create();
    fixture.componentInstance.openCreate();
    expect(fixture.componentInstance.drawerOpen()).toBe(true);
    expect(fixture.componentInstance.editing()).toBeUndefined();
  });

  it('opens the edit drawer prefilled with the selected row definition', () => {
    const fixture = create();
    const row = fixture.componentInstance.rows()[0];
    fixture.componentInstance.openEdit(row);
    expect(fixture.componentInstance.drawerOpen()).toBe(true);
    expect(fixture.componentInstance.editing()).toEqual(row.definition);
  });

  it('filters rows by status', () => {
    const fixture = create();
    fixture.componentInstance.statusFilter.set('ACTIVE');
    expect(fixture.componentInstance.filteredRows().every((r) => r.definition.status === 'ACTIVE')).toBe(true);
    fixture.componentInstance.clearFilters();
    expect(fixture.componentInstance.activeFilterCount).toBe(0);
  });

  it('duplicates a definition through the service', () => {
    const fixture = create();
    const before = fixture.componentInstance.serviceTasks.definitions().length;
    const row = fixture.componentInstance.rows()[0];
    fixture.componentInstance.duplicate(row);
    expect(fixture.componentInstance.serviceTasks.definitions().length).toBe(before + 1);
  });

  it('opens the execution log detail drawer and clears it on close', () => {
    const fixture = create();
    const log = fixture.componentInstance.serviceTasks.executionLogs()[0];
    fixture.componentInstance.selectedLogId.set(log.id);
    expect(fixture.componentInstance.selectedLog()).toEqual(log);
    fixture.componentInstance.selectedLogId.set(undefined);
    expect(fixture.componentInstance.selectedLog()).toBeUndefined();
  });
});
