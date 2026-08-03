import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  input,
  signal,
} from '@angular/core';
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';

import { TranslateViModule } from '../bpmn-modeler/bpmn-properties-i18n';

type BpmnCanvas = {
  zoom: (step?: number | string) => number;
};

type ReadonlyCommandStack = {
  canExecute: (...args: unknown[]) => boolean;
  execute: (...args: unknown[]) => unknown;
};

type BpmnViewerInstance = {
  importXML: (xml: string) => Promise<unknown>;
  get: (name: string, strict?: boolean) => unknown;
  destroy: () => void;
};

/**
 * Xem sơ đồ BPMN CHỈ-ĐỌC (`NavigatedViewer`): kéo/thu-phóng bằng chuột, không palette,
 * không sửa. Đối chiếu `webapp/src/components/BpmnViewer.tsx` (bản React) nhưng bỏ toolbar/
 * minimap/fullscreen — chưa cần cho lần port đầu tiên sang Angular.
 */
@Component({
  selector: 'app-bpmn-viewer',
  standalone: true,
  template: `
    <div class="bpmn-viewer-shell">
      @if (showProperties()) {
        <div class="bpmn-viewer-toolbar">
          <span>Thuộc tính BPMN <small>(chỉ đọc)</small></span>
          <button type="button" (click)="toggleProperties()">
            {{ propertiesOpen() ? 'Ẩn thuộc tính' : 'Hiện thuộc tính' }}
          </button>
        </div>
      }
      @if (error()) {
        <div class="bpmn-viewer-error">{{ error() }}</div>
      }
      <div class="bpmn-viewer-workspace">
        <div #container class="bpmn-viewer-canvas" [class.hidden]="!!error()"></div>
        @if (showProperties()) {
          <aside
            #properties
            class="bpmn-viewer-properties"
            [class.bpmn-viewer-properties-hidden]="!propertiesOpen()"
            aria-label="Thuộc tính BPMN chỉ đọc"
          ></aside>
        }
      </div>
    </div>
  `,
  styleUrl: './bpmn-viewer.scss',
})
export class BpmnViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly xml = input.required<string>();
  /** Hiển thị properties panel Camunda/Zeebe ở chế độ chỉ đọc (dùng cho phiên bản đã deploy). */
  readonly showProperties = input(false);
  /** Tuỳ chọn: elementId đang active (vd. từ snapshot Test BPMN) để tô sáng trên sơ đồ. */
  readonly activeElementIds = input<string[]>([]);
  /** Tuỳ chọn: elementId đang có incident (vd. gateway CONDITION_ERROR) để tô đỏ trên sơ đồ. */
  readonly incidentElementIds = input<string[]>([]);
  /** Tuỳ chọn: heatmap kiểu Optimize — map elementId → tên lớp CSS marker (vd. `vht-heat-1`..`vht-heat-5`). */
  readonly heatMarkers = input<Record<string, string>>({});

  @ViewChild('container', { static: true }) private containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('properties') private propertiesRef?: ElementRef<HTMLElement>;

  readonly error = signal<string | null>(null);
  readonly propertiesOpen = signal(true);

  private viewer: BpmnViewerInstance | null = null;
  private viewReady = false;
  private pendingFitViewport = false;
  private resizeObserver: ResizeObserver | null = null;
  private propertiesObserver: MutationObserver | null = null;
  private renderSequence = 0;
  private markedActiveIds: string[] = [];
  private markedIncidentIds: string[] = [];
  private markedHeatIds: { id: string; cls: string }[] = [];

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.resizeObserver = new ResizeObserver(() => this.fitViewportWhenVisible());
    this.resizeObserver.observe(this.containerRef.nativeElement);
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['xml'] && this.viewReady) {
      this.render();
    } else if (
      (changes['activeElementIds'] || changes['incidentElementIds'] || changes['heatMarkers']) &&
      this.viewReady
    ) {
      this.applyHighlights();
    }
  }

  ngOnDestroy(): void {
    this.renderSequence++;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.propertiesObserver?.disconnect();
    this.propertiesObserver = null;
    this.viewer?.destroy();
    this.viewer = null;
  }

  private render(): void {
    const xml = this.xml();
    if (!xml) return;
    this.error.set(null);
    this.viewer?.destroy();
    this.pendingFitViewport = false;
    this.markedActiveIds = [];
    this.markedIncidentIds = [];
    this.markedHeatIds = [];
    const renderSequence = ++this.renderSequence;
    void this.importXml(xml, renderSequence);
  }

  toggleProperties(): void {
    this.propertiesOpen.update((open) => !open);
    this.pendingFitViewport = true;
    window.setTimeout(() => this.fitViewportWhenVisible(), 180);
  }

  private async importXml(xml: string, renderSequence: number): Promise<void> {
    const viewer = await this.createViewer();
    if (this.renderSequence !== renderSequence) {
      viewer.destroy();
      return;
    }
    this.viewer = viewer;

    try {
      await viewer.importXML(xml);
      if (this.viewer !== viewer || this.renderSequence !== renderSequence) return;
      // nz-tab keeps inactive content in a hidden, zero-sized container. Wait until the tab is
      // visible before fitting instead of treating a layout failure as invalid BPMN XML.
      this.pendingFitViewport = true;
      this.fitViewportWhenVisible();
      this.makeModelerReadonly(viewer);
      this.observeReadonlyProperties();
      this.applyHighlights();
    } catch {
      if (this.viewer !== viewer || this.renderSequence !== renderSequence) return;
      this.error.set('Không hiển thị được sơ đồ BPMN — nội dung XML không hợp lệ.');
    }
  }

  private async createViewer(): Promise<BpmnViewerInstance> {
    const propertiesParent = this.propertiesRef?.nativeElement;
    if (!this.showProperties() || !propertiesParent) {
      return new NavigatedViewer({ container: this.containerRef.nativeElement }) as BpmnViewerInstance;
    }

    const [{ default: BpmnModeler }, propertiesPanel, { default: zeebeModdle }] = await Promise.all([
      import('bpmn-js/lib/Modeler'),
      import('bpmn-js-properties-panel'),
      import('zeebe-bpmn-moddle/resources/zeebe.json'),
    ]);
    return new BpmnModeler({
      container: this.containerRef.nativeElement,
      propertiesPanel: { parent: propertiesParent },
      additionalModules: [
        TranslateViModule,
        propertiesPanel.BpmnPropertiesPanelModule,
        propertiesPanel.BpmnPropertiesProviderModule,
        propertiesPanel.ZeebePropertiesProviderModule,
      ],
      moddleExtensions: { zeebe: zeebeModdle },
      keyboard: { bindTo: null },
    } as never) as BpmnViewerInstance;
  }

  private makeModelerReadonly(viewer: BpmnViewerInstance): void {
    if (!this.showProperties()) return;
    const commandStack = viewer.get('commandStack', false) as ReadonlyCommandStack | undefined;
    if (!commandStack) return;
    // Properties panel cần các modeling services để đọc đầy đủ thuộc tính. Chặn cả bước kiểm tra
    // lẫn thực thi command để canvas và XML deployed không thể bị sửa từ UI chỉ-đọc này.
    commandStack.canExecute = () => false;
    commandStack.execute = () => undefined;
  }

  private observeReadonlyProperties(): void {
    const properties = this.propertiesRef?.nativeElement;
    if (!this.showProperties() || !properties) return;
    this.propertiesObserver?.disconnect();
    const lockInputs = () => {
      properties.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        'input, textarea, select',
      ).forEach((control) => (control.disabled = true));
      properties.querySelectorAll<HTMLElement>('[contenteditable="true"]').forEach((control) =>
        control.setAttribute('contenteditable', 'false'),
      );
    };
    this.propertiesObserver = new MutationObserver(lockInputs);
    this.propertiesObserver.observe(properties, { childList: true, subtree: true });
    lockInputs();
  }

  private fitViewportWhenVisible(): void {
    const viewer = this.viewer;
    const container = this.containerRef?.nativeElement;
    if (!viewer || !container || !this.pendingFitViewport) return;
    if (container.clientWidth === 0 || container.clientHeight === 0) return;

    try {
      const canvas = viewer.get('canvas') as BpmnCanvas;
      canvas.zoom('fit-viewport');
      this.pendingFitViewport = false;
    } catch {
      // The tab can still be settling in this frame; ResizeObserver will retry on the next resize.
    }
  }

  private applyHighlights(): void {
    const viewer = this.viewer;
    if (!viewer) return;
    let canvas: BpmnMarkerCanvas;
    try {
      canvas = viewer.get('canvas') as BpmnMarkerCanvas;
    } catch {
      return;
    }
    this.markedActiveIds = this.remark(canvas, this.markedActiveIds, this.activeElementIds(), 'qtkhcn-bpmn-active');
    this.markedIncidentIds = this.remark(
      canvas,
      this.markedIncidentIds,
      this.incidentElementIds(),
      'qtkhcn-bpmn-incident',
    );
    this.markedHeatIds = this.remarkHeat(canvas, this.markedHeatIds, this.heatMarkers());
  }

  private remarkHeat(
    canvas: BpmnMarkerCanvas,
    previous: { id: string; cls: string }[],
    next: Record<string, string>,
  ): { id: string; cls: string }[] {
    for (const { id, cls } of previous) {
      try {
        canvas.removeMarker(id, cls);
      } catch {
        // Phần tử có thể không còn tồn tại trên sơ đồ (diagram khác revision) — bỏ qua.
      }
    }
    const applied: { id: string; cls: string }[] = [];
    for (const [id, cls] of Object.entries(next)) {
      if (!cls) continue;
      try {
        canvas.addMarker(id, cls);
        applied.push({ id, cls });
      } catch {
        // elementId từ seed heatmap có thể không khớp diagram đang xem — bỏ qua, không chặn UI.
      }
    }
    return applied;
  }

  private remark(canvas: BpmnMarkerCanvas, previous: string[], next: string[], marker: string): string[] {
    for (const id of previous) {
      try {
        canvas.removeMarker(id, marker);
      } catch {
        // Phần tử có thể không còn tồn tại trên sơ đồ (diagram khác revision) — bỏ qua.
      }
    }
    for (const id of next) {
      try {
        canvas.addMarker(id, marker);
      } catch {
        // elementId từ snapshot engine test có thể không khớp diagram đang xem — bỏ qua, không chặn UI.
      }
    }
    return next;
  }
}

type BpmnMarkerCanvas = BpmnCanvas & {
  addMarker: (elementId: string, marker: string) => void;
  removeMarker: (elementId: string, marker: string) => void;
};
