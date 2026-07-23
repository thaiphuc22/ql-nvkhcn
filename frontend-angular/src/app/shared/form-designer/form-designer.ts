import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild, input, output, signal } from '@angular/core';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { FormEditor } from '@bpmn-io/form-js';

import { FormRendererComponent } from '../form-renderer/form-renderer';
import { FormFieldPaletteComponent } from './form-field-palette';
import { FormFieldPropertiesComponent, type EditFieldEvent } from './form-field-properties';
import { khcnFieldDefaultsModule } from './khcn-field-defaults';
import { observeCanvasViLabels } from './relabel-canvas-vi';
import { TranslateViModule } from './form-js-i18n';
import { type FormComponent as FField } from '../../core/models/eform';

// Port của webapp/src/components/FormDesigner.tsx — trình thiết kế biểu mẫu
// (Camunda Form Designer), nhúng `FormEditor` của @bpmn-io/form-js theo bố cục CUSTOM
// giống BpmnModelerComponent:
// - Dock trái "Thành phần" = `FormFieldPaletteComponent` (AntD, D13) — kéo–thả vẫn do
//   dragula NATIVE của form-js xử lý qua class ma thuật (xem `form-field-palette.ts`);
//   palette NATIVE portal vào div ẩn chỉ để giữ service/dragula sống.
// - Canvas kéo–thả ở giữa, full-height.
// - "Xem trước trực tiếp" (toggle) mở Modal render schema hiện tại bằng
//   `FormRendererComponent`, cập nhật debounce ~300ms qua sự kiện 'changed'.
// - Dock phải "Thuộc tính trường" = `FormFieldPropertiesComponent` (AntD, D13) —
//   remount theo `field.id` (dùng @for+track ở template, tương đương
//   `key={selectedField.id}#{selVersion}` của React) để đọc lại giá trị sau mỗi lệnh.
// - Toolbar nổi: Undo/Redo + Xem trước + Tag "Chưa lưu"; cảnh báo beforeunload khi dirty.
// KHÔNG port `khcnFormSimplePanelModule` (chế độ Đơn giản/Nâng cao của bản gốc): module
// đó chỉ lọc/Việt hoá nhóm của PROPERTIES PANEL NATIVE, vốn bị ẩn ở đây (chrome hiển thị
// là AntD tự viết) — port sẽ là code chết, không có hiệu quả quan sát được.

interface EventBus {
  on: (event: string, cb: (e?: unknown) => void) => void;
  off: (event: string, cb: (e?: unknown) => void) => void;
}
interface CommandStack {
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
}
interface Selection {
  get: () => unknown;
}
interface FormFieldRegistry {
  get: (id: string) => { components?: { id: string }[] } | undefined;
}
interface Modeling {
  addFormField: (attrs: unknown, target: unknown, index: number) => unknown;
  editFormField: (field: unknown, prop: string, value: unknown) => void;
  removeFormField: (field: unknown, parent: unknown, index: number) => void;
}
interface FormLayouter {
  nextRowId: () => string;
}

const PALETTE_W = 240;
const PANEL_W = 340;

@Component({
  selector: 'app-form-designer',
  standalone: true,
  imports: [NzButtonModule, NzIconModule, NzModalModule, NzTagModule, NzTooltipModule, FormRendererComponent, FormFieldPaletteComponent, FormFieldPropertiesComponent],
  templateUrl: './form-designer.html',
  styleUrl: './form-designer.scss',
})
export class FormDesignerComponent implements AfterViewInit, OnDestroy {
  readonly schema = input.required<unknown>();
  readonly dirtyChange = output<boolean>();

  @ViewChild('wrapper', { static: true }) private wrapperRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLDivElement>;
  @ViewChild('palette', { static: true }) private paletteRef!: ElementRef<HTMLDivElement>;
  @ViewChild('props', { static: true }) private propsRef!: ElementRef<HTMLDivElement>;

  readonly paletteOpen = signal(true);
  readonly panelOpen = signal(true);
  readonly previewOpen = signal(false);
  readonly previewSchema = signal<unknown>(null);
  readonly selectedField = signal<FField | null>(null);
  readonly selVersion = signal(0);
  readonly dirty = signal(false);
  readonly canUndo = signal(false);
  readonly canRedo = signal(false);

  readonly PALETTE_W = PALETTE_W;
  readonly PANEL_W = PANEL_W;

  private editor: FormEditor | null = null;
  private eventBus: EventBus | null = null;
  private dirtyFlag = false;
  private previewOpenFlag = false;
  private previewTimer = 0;
  private stopRelabel?: () => void;

  private readonly onStackChanged = (): void => {
    this.dirtyFlag = true;
    this.dirty.set(true);
    this.dirtyChange.emit(true);
    const stack = this.editor?.get('commandStack') as CommandStack | undefined;
    this.canUndo.set(stack?.canUndo() ?? false);
    this.canRedo.set(stack?.canRedo() ?? false);
    this.selVersion.update((v) => v + 1);
  };

  private readonly onSelectionChanged = (e?: unknown): void => {
    const sel = (e as { selection?: FField } | undefined)?.selection ?? null;
    this.selectedField.set(sel && sel.type ? sel : null);
  };

  private readonly onChanged = (): void => {
    if (!this.previewOpenFlag) return;
    window.clearTimeout(this.previewTimer);
    this.previewTimer = window.setTimeout(() => {
      this.previewSchema.set((this.editor as unknown as { saveSchema: () => unknown } | null)?.saveSchema() ?? null);
    }, 300);
  };

  ngAfterViewInit(): void {
    const editor = new FormEditor({
      container: this.canvasRef.nativeElement,
      additionalModules: [TranslateViModule, khcnFieldDefaultsModule],
      palette: { parent: this.paletteRef.nativeElement },
      propertiesPanel: { parent: this.propsRef.nativeElement },
    } as never);
    this.editor = editor;
    this.eventBus = editor.get('eventBus') as EventBus;
    this.eventBus.on('commandStack.changed', this.onStackChanged);
    this.eventBus.on('changed', this.onChanged);
    this.eventBus.on('selection.changed', this.onSelectionChanged);

    void editor.importSchema(this.schema() as never).then(() => {
      const sel = (editor.get('selection') as Selection).get() as FField | null;
      this.selectedField.set(sel && sel.type ? sel : null);
    });

    this.stopRelabel = observeCanvasViLabels(this.wrapperRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.stopRelabel?.();
    window.clearTimeout(this.previewTimer);
    this.eventBus?.off('commandStack.changed', this.onStackChanged);
    this.eventBus?.off('changed', this.onChanged);
    this.eventBus?.off('selection.changed', this.onSelectionChanged);
    this.editor?.destroy();
    this.editor = null;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent): void {
    if (!this.dirty()) return;
    e.preventDefault();
    e.returnValue = '';
  }

  getSchema(): unknown {
    return (this.editor as unknown as { saveSchema: () => unknown } | null)?.saveSchema();
  }

  markSaved(): void {
    this.dirtyFlag = false;
    this.dirty.set(false);
    this.dirtyChange.emit(false);
  }

  isDirty(): boolean {
    return this.dirtyFlag;
  }

  undo(): void {
    (this.editor?.get('commandStack') as CommandStack | undefined)?.undo();
  }

  redo(): void {
    (this.editor?.get('commandStack') as CommandStack | undefined)?.redo();
  }

  togglePreview(): void {
    const next = !this.previewOpen();
    this.previewOpenFlag = next;
    this.previewOpen.set(next);
    if (next) this.previewSchema.set((this.editor as unknown as { saveSchema: () => unknown } | null)?.saveSchema() ?? null);
  }

  /** Thêm field bằng CLICK từ palette AntD — dựng attrs như `createNewField` của
   * form-js (layout.row mới), thêm vào cuối container đang chọn (group/dynamiclist)
   * hoặc root. Kéo–thả đi đường khác (dragula của form-js). */
  addField(type: string): void {
    const editor = this.editor as unknown as {
      get: (name: string) => unknown;
      _getState: () => { schema: { id: string; type: string; components?: unknown[] } };
    } | null;
    if (!editor) return;
    const modeling = editor.get('modeling') as Modeling;
    const selection = editor.get('selection') as Selection;
    const layouter = editor.get('formLayouter') as FormLayouter;
    const root = editor._getState().schema;
    const sel = selection.get() as { id: string; type: string; components?: unknown[] } | null;
    const isContainer = !!sel && sel !== root && Array.isArray(sel.components) && (sel.type === 'group' || sel.type === 'dynamiclist');
    const target = isContainer ? sel! : root;
    const index = Array.isArray(target.components) ? target.components.length : 0;
    modeling.addFormField({ type, _parent: target.id, layout: { row: layouter.nextRowId(), columns: null } }, target, index);
  }

  /** Sửa 1 thuộc tính field (panel AntD). Bọc try/catch: đổi key trùng có thể ném trong behavior. */
  editField(event: EditFieldEvent): void {
    const modeling = this.editor?.get('modeling') as Modeling | undefined;
    if (!modeling) return;
    try {
      modeling.editFormField(event.field, event.prop, event.value);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[FormDesigner] editFormField bị từ chối:', event.prop, err);
    }
  }

  /** Xóa field: tìm parent + index rồi removeFormField (đi qua commandStack → undo được). */
  removeField(field: FField): void {
    const editor = this.editor;
    if (!editor) return;
    const registry = editor.get('formFieldRegistry') as FormFieldRegistry;
    const modeling = editor.get('modeling') as Modeling;
    const parent = field._parent ? registry.get(field._parent) : undefined;
    if (!parent || !Array.isArray(parent.components)) return;
    const index = parent.components.findIndex((c) => c.id === field.id);
    if (index < 0) return;
    modeling.removeFormField(field, parent, index);
  }
}
