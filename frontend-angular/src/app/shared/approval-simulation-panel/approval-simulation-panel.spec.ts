import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NzIconService } from 'ng-zorro-antd/icon';

import { APPROVAL_MATRIX } from '../../core/models/approval-matrix';
import { APPROVAL_MATRIX_ICONS, NAV_ICONS } from '../../core/icons-provider';
import { ApprovalSimulationScenarioService } from '../../core/services/approval-simulation-scenario.service';
import { ApprovalMatrixService } from '../../core/services/approval-matrix.service';
import { ApprovalSimulationPanelComponent } from './approval-simulation-panel';

describe('ApprovalSimulationPanelComponent', () => {
  function create() {
    const fixture = TestBed.createComponent(ApprovalSimulationPanelComponent);
    fixture.componentRef.setInput('rules', APPROVAL_MATRIX);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    localStorage.removeItem('approval-matrix-simulation-scenarios');
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS, ...APPROVAL_MATRIX_ICONS);
    TestBed.inject(ApprovalMatrixService).load().subscribe();
    TestBed.inject(HttpTestingController).expectOne('http://localhost:8091/api/approval-matrix/rules').flush(
      APPROVAL_MATRIX.map((rule) => ({ ...rule, domainCode: 'KHCN', version: rule.version ?? 1, updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'system' })),
    );
  });

  function flushResolve(): void {
    TestBed.inject(HttpTestingController).expectOne('http://localhost:8091/api/approval-matrix/resolve').flush({
      matchedRuleId: 'AM-05', mode: 'ANY_ONE', approvers: [{ userId: 'U-013', viaRoleCode: 'BTGD_TD', viaTargetType: 'GROUP', placeholder: false }],
      reason: 'Khớp luật AM-05', warnings: [], audit: { context: {}, slot: 'PHE_DUYET', matchedRuleId: 'AM-05', matchedRuleVersion: 1,
        mode: 'ANY_ONE', targetsBeforeOrg: [], finalUserIds: ['U-013'], delegationsApplied: [], skipped: [], at: '2026-07-16' },
    });
  }

  it('renders without throwing and starts with no result', () => {
    const fixture = create();
    expect(fixture.componentInstance.result()).toBeNull();
  });

  it('runs a simulation and produces a matched rule for the default PHE_DUYET slot', () => {
    const fixture = create();
    fixture.componentInstance.runSim();
    flushResolve();
    fixture.detectChanges();

    const result = fixture.componentInstance.result();
    expect(result?.matchedRule).toBeTruthy();
  });

  it('resets the context and result when the slot changes', () => {
    const fixture = create();
    fixture.componentInstance.runSim();
    flushResolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.result()).toBeTruthy();

    fixture.componentInstance.handleSlotChange('THAM_DINH');

    expect(fixture.componentInstance.result()).toBeNull();
    expect(fixture.componentInstance.simSlot()).toBe('THAM_DINH');
  });

  it('saves and persists a scenario through the scenario service', () => {
    const fixture = create();
    fixture.componentInstance.scenarioName.set('Kịch bản test');
    fixture.componentInstance.saveScenario();

    expect(fixture.componentInstance.scenarios().length).toBe(1);
    expect(fixture.componentInstance.scenarios()[0].name).toBe('Kịch bản test');

    const persisted = TestBed.inject(ApprovalSimulationScenarioService).load();
    expect(persisted.length).toBe(1);
  });

  it('deletes a saved scenario', () => {
    const fixture = create();
    fixture.componentInstance.saveScenario();
    const id = fixture.componentInstance.scenarios()[0].id;

    fixture.componentInstance.deleteScenario(id);

    expect(fixture.componentInstance.scenarios().length).toBe(0);
  });
});
