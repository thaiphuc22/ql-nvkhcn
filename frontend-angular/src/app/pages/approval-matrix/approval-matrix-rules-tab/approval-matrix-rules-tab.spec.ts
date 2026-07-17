import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NzIconService } from 'ng-zorro-antd/icon';

import { APPROVAL_MATRIX_ICONS, NAV_ICONS } from '../../../core/icons-provider';
import { APPROVAL_MATRIX } from '../../../core/models/approval-matrix';
import { APPROVAL_SLOTS } from '../../../core/models/approval-slot-catalog';
import { ApprovalMatrixService } from '../../../core/services/approval-matrix.service';
import { ApprovalSlotCatalogService } from '../../../core/services/approval-slot-catalog.service';
import { ApprovalMatrixRulesTabPage } from './approval-matrix-rules-tab';

describe('ApprovalMatrixRulesTabPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS, ...APPROVAL_MATRIX_ICONS);
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(ApprovalMatrixService).load().subscribe();
    http.expectOne('http://localhost:8091/api/approval-matrix/rules').flush(APPROVAL_MATRIX.map((rule) => ({
      ...rule, domainCode: 'KHCN', version: rule.version ?? 1, updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'system',
    })));
    TestBed.inject(ApprovalSlotCatalogService).load().subscribe();
    http.expectOne('http://localhost:8091/api/approval-matrix/slots').flush(APPROVAL_SLOTS.map((slot) => ({
      ...slot, usageCount: 0, updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'system',
    })));
  });

  function create() {
    const fixture = TestBed.createComponent(ApprovalMatrixRulesTabPage);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the seeded matrix sorted by ascending priority', () => {
    const fixture = create();
    const rows = fixture.componentInstance.sortedRules();
    expect(rows.length).toBeGreaterThan(0);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].priority).toBeGreaterThanOrEqual(rows[i - 1].priority);
    }
  });

  it('filters rows by slot and enabled state', () => {
    const fixture = create();
    fixture.componentInstance.filterSlot.set('PHE_DUYET');
    expect(fixture.componentInstance.filteredRules().every((r) => r.slot === 'PHE_DUYET')).toBe(true);

    fixture.componentInstance.filterSlot.set('all');
    fixture.componentInstance.filterEnabled.set('off');
    expect(fixture.componentInstance.filteredRules().every((r) => !r.enabled)).toBe(true);
  });

  it('opens the create drawer with a blank, wildcard draft', () => {
    const fixture = create();
    fixture.componentInstance.openCreate();

    expect(fixture.componentInstance.modalOpen()).toBe(true);
    expect(fixture.componentInstance.editing()).toBeNull();
    expect(fixture.componentInstance.condDraft().items.length).toBe(0);
    expect(fixture.componentInstance.assignmentHasTarget()).toBe(false);
  });

  it('blocks saving a rule with no assignment target', () => {
    const fixture = create();
    const before = fixture.componentInstance.rules().length;
    fixture.componentInstance.openCreate();
    fixture.componentInstance.formTen.set('Luật test không có đích');

    fixture.componentInstance.saveRule();

    expect(fixture.componentInstance.rules().length).toBe(before);
  });

  it('creates a new rule when the draft has a name and an assignment target', () => {
    const fixture = create();
    const before = fixture.componentInstance.rules().length;
    fixture.componentInstance.openCreate();
    fixture.componentInstance.formTen.set('Luật test hợp lệ');
    fixture.componentInstance.asgDraft.set({ mode: 'ANY_ONE', targets: [{ type: 'GROUP', roleCodes: ['CQ_KHCN'] }] });

    fixture.componentInstance.saveRule();
    const http = TestBed.inject(HttpTestingController);
    const createRequest = http.expectOne('http://localhost:8091/api/approval-matrix/rules');
    createRequest.flush({ ...createRequest.request.body, version: 1, updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'tester' });
    http.expectOne('http://localhost:8091/api/approval-matrix/analyze').flush([]);

    expect(fixture.componentInstance.modalOpen()).toBe(false);
    expect(fixture.componentInstance.rules().length).toBe(before + 1);
    expect(fixture.componentInstance.rules().some((r) => r.ten === 'Luật test hợp lệ')).toBe(true);
  });

  it('opens the edit drawer prefilled from the existing rule', () => {
    const fixture = create();
    const rule = fixture.componentInstance.sortedRules()[0];

    fixture.componentInstance.openEdit(rule);

    expect(fixture.componentInstance.editing()).toEqual(rule);
    expect(fixture.componentInstance.formTen()).toBe(rule.ten);
    expect(fixture.componentInstance.formSlot()).toBe(rule.slot);
  });

  it('toggles a rule enabled state through the service', () => {
    const fixture = create();
    const rule = fixture.componentInstance.sortedRules()[0];

    fixture.componentInstance.toggle(rule.id, !rule.enabled);
    const http = TestBed.inject(HttpTestingController);
    const toggle = http.expectOne(`http://localhost:8091/api/approval-matrix/rules/${rule.id}/status`);
    toggle.flush({ ...rule, enabled: !rule.enabled, version: (rule.version ?? 1) + 1, domainCode: 'KHCN', updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'tester' });
    http.expectOne('http://localhost:8091/api/approval-matrix/analyze').flush([]);

    expect(fixture.componentInstance.rules().find((r) => r.id === rule.id)?.enabled).toBe(!rule.enabled);
  });

  it('adds a condition preset to the draft tree', () => {
    const fixture = create();
    fixture.componentInstance.openCreate();

    fixture.componentInstance.addConditionPreset(fixture.componentInstance.conditionPresets[0].make);

    expect(fixture.componentInstance.condDraft().items.length).toBe(1);
  });

  it('runs the inline draft simulation against rulesWithDraft', () => {
    const fixture = create();
    fixture.componentInstance.openCreate();
    fixture.componentInstance.formSlot.set('PHE_DUYET');
    fixture.componentInstance.draftSimCap.set('TD');
    fixture.componentInstance.draftSimBudget.set(12_000_000_000);

    fixture.componentInstance.runDraftSim();

    expect(fixture.componentInstance.draftSimResult()).toBeTruthy();
  });
});
