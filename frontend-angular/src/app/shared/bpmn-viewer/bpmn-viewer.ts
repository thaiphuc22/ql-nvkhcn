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

type BpmnCanvas = {
  zoom: (step?: number | string) => number;
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
      @if (error()) {
        <div class="bpmn-viewer-error">{{ error() }}</div>
      }
      <div #container class="bpmn-viewer-canvas" [class.hidden]="!!error()"></div>
    </div>
  `,
  styleUrl: './bpmn-viewer.scss',
})
export class BpmnViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly xml = input.required<string>();
  /** Tuỳ chọn: elementId đang active (vd. từ snapshot Test BPMN) để tô sáng trên sơ đồ. */
  readonly activeElementIds = input<string[]>([]);
  /** Tuỳ chọn: elementId đang có incident (vd. gateway CONDITION_ERROR) để tô đỏ trên sơ đồ. */
  readonly incidentElementIds = input<string[]>([]);

  @ViewChild('container', { static: true }) private containerRef!: ElementRef<HTMLDivElement>;

  readonly error = signal<string | null>(null);

  private viewer: NavigatedViewer | null = null;
  private viewReady = false;
  private markedActiveIds: string[] = [];
  private markedIncidentIds: string[] = [];

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['xml'] && this.viewReady) {
      this.render();
    } else if ((changes['activeElementIds'] || changes['incidentElementIds']) && this.viewReady) {
      this.applyHighlights();
    }
  }

  ngOnDestroy(): void {
    this.viewer?.destroy();
    this.viewer = null;
  }

  private render(): void {
    const xml = this.xml();
    if (!xml) return;
    this.error.set(null);
    this.viewer?.destroy();
    this.markedActiveIds = [];
    this.markedIncidentIds = [];
    const viewer = new NavigatedViewer({ container: this.containerRef.nativeElement });
    this.viewer = viewer;
    viewer
      .importXML(xml)
      .then(() => {
        const canvas = viewer.get('canvas') as BpmnCanvas;
        canvas.zoom('fit-viewport');
        this.applyHighlights();
      })
      .catch(() => {
        this.error.set('Không hiển thị được sơ đồ BPMN — nội dung XML không hợp lệ.');
      });
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
