import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  input,
  output,
  signal,
} from '@angular/core';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import zeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';

import { TranslateViModule } from './bpmn-properties-i18n';
import { BpmnElement, BpmnModdleElement, resolveExecutableProcess } from './executable-process';

type Canvas = {
  zoom: (value?: number | string) => number;
  resized?: () => void;
  scrollToElement?: (element: BpmnElement, padding?: number) => void;
};
type CommandStack = { undo: () => void; redo: () => void; canUndo: () => boolean; canRedo: () => boolean };
type EventBus = {
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
};
type ElementRegistry = {
  filter: (predicate: (element: BpmnElement) => boolean) => BpmnElement[];
  get: (id: string) => BpmnElement | undefined;
};
type Modeling = {
  updateProperties: (element: BpmnElement, properties: Record<string, unknown>) => void;
  updateModdleProperties: (
    element: BpmnElement,
    moddleElement: BpmnModdleElement,
    properties: Record<string, unknown>,
  ) => void;
};
type Selection = { select: (element: BpmnElement) => void };

@Component({
  selector: 'app-bpmn-modeler',
  standalone: true,
  templateUrl: './bpmn-modeler.html',
  styleUrl: './bpmn-modeler.scss',
})
export class BpmnModelerComponent implements AfterViewInit, OnDestroy {
  readonly xml = input.required<string>();
  readonly dirtyChange = output<boolean>();
  readonly readyChange = output<boolean>();

  @ViewChild('shell', { static: true }) private shellRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLDivElement>;
  @ViewChild('properties', { static: true }) private propertiesRef!: ElementRef<HTMLDivElement>;

  readonly error = signal<string | null>(null);
  readonly ready = signal(false);
  readonly dirty = signal(false);
  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  readonly propertiesOpen = signal(true);
  readonly zoomPercent = signal(100);
  readonly fullscreen = signal(false);

  private modeler: BpmnModeler | null = null;
  private eventBus: EventBus | null = null;

  ngAfterViewInit(): void {
    const modeler = new BpmnModeler({
      container: this.canvasRef.nativeElement,
      propertiesPanel: { parent: this.propertiesRef.nativeElement },
      additionalModules: [
        TranslateViModule,
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        ZeebePropertiesProviderModule,
      ],
      moddleExtensions: { zeebe: zeebeModdle },
      keyboard: { bindTo: document },
    } as never);
    this.modeler = modeler;
    this.eventBus = modeler.get('eventBus') as EventBus;
    this.eventBus.on('commandStack.changed', this.onChanged);

    modeler
      .importXML(this.xml())
      .then(() => {
        this.ready.set(true);
        this.readyChange.emit(true);
        this.fit();
        this.markSaved();
      })
      .catch((error: unknown) => {
        const detail = error instanceof Error ? error.message : String(error);
        this.error.set(`Không thể mở sơ đồ BPMN. ${detail}`);
      });
  }

  ngOnDestroy(): void {
    this.eventBus?.off('commandStack.changed', this.onChanged);
    this.modeler?.destroy();
    this.modeler = null;
  }

  async exportXml(processId: string, processName: string): Promise<string> {
    const modeler = this.requireModeler();
    const registry = modeler.get('elementRegistry') as ElementRegistry;
    const target = resolveExecutableProcess(registry);
    const properties = { id: processId, name: processName, isExecutable: true };
    const modeling = modeler.get('modeling') as Modeling;
    if (target.element.businessObject === target.process) {
      modeling.updateProperties(target.element, properties);
    } else {
      modeling.updateModdleProperties(target.element, target.process, properties);
    }
    const result = await modeler.saveXML({ format: true });
    if (!result.xml) throw new Error('Không thể xuất BPMN XML.');
    return result.xml;
  }

  markSaved(): void {
    this.dirty.set(false);
    this.dirtyChange.emit(false);
  }

  focusElement(elementId: string): boolean {
    const modeler = this.requireModeler();
    const element = (modeler.get('elementRegistry') as ElementRegistry).get(elementId);
    if (!element) return false;
    (modeler.get('selection') as Selection).select(element);
    (modeler.get('canvas') as Canvas).scrollToElement?.(element, 120);
    return true;
  }

  undo(): void {
    (this.modeler?.get('commandStack') as CommandStack | undefined)?.undo();
  }

  redo(): void {
    (this.modeler?.get('commandStack') as CommandStack | undefined)?.redo();
  }

  fit(): void {
    const canvas = this.modeler?.get('canvas') as Canvas | undefined;
    if (!canvas) return;
    canvas.resized?.();
    const zoom = canvas.zoom('fit-viewport');
    this.zoomPercent.set(Math.round(zoom * 100));
  }

  zoom(factor: number): void {
    const canvas = this.modeler?.get('canvas') as Canvas | undefined;
    if (!canvas) return;
    const zoom = canvas.zoom() * factor;
    canvas.zoom(zoom);
    this.zoomPercent.set(Math.round(zoom * 100));
  }

  toggleProperties(): void {
    this.propertiesOpen.update((open) => !open);
    window.setTimeout(() => this.fit(), 0);
  }

  async toggleFullscreen(): Promise<void> {
    const shell = this.shellRef.nativeElement;
    if (document.fullscreenElement === shell) {
      await document.exitFullscreen();
    } else {
      await shell.requestFullscreen();
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.fullscreen.set(document.fullscreenElement === this.shellRef.nativeElement);
    window.setTimeout(() => this.fit(), 80);
  }

  private readonly onChanged = (): void => {
    if (!this.ready()) return;
    const stack = this.modeler?.get('commandStack') as CommandStack | undefined;
    this.canUndo.set(stack?.canUndo() ?? false);
    this.canRedo.set(stack?.canRedo() ?? false);
    this.dirty.set(true);
    this.dirtyChange.emit(true);
  };

  private requireModeler(): BpmnModeler {
    if (!this.modeler || !this.ready()) throw new Error('Trình vẽ BPMN chưa sẵn sàng.');
    return this.modeler;
  }
}
