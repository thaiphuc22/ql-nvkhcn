import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Empty,
  List,
  Modal,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  CloseOutlined,
  ProfileOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import BpmnModeler from "bpmn-js/lib/Modeler";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
} from "bpmn-js-properties-panel";
import minimapModule from "diagram-js-minimap";
import gridModule from "diagram-js-grid";
import zeebeModdle from "zeebe-bpmn-moddle/resources/zeebe.json";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "@bpmn-io/properties-panel/dist/assets/properties-panel.css";
import "diagram-js-minimap/assets/diagram-js-minimap.css";
import "../branding/bpmnio-skin.css";
import { VHT_TEXT_RENDERER } from "../branding/font";
import { TranslateViModule } from "../branding/translate-vi";
import { observeViLabels } from "../branding/relabel-vi";
import {
  khcnFormPropertiesModule,
  type FormLite,
} from "../bpmn/khcnFormModule";
import { khcnAssignmentPropertiesModule } from "../bpmn/khcnAssignmentModule";
import { khcnLanePropertiesModule } from "../bpmn/khcnLaneModule";
import { khcnDecisionModule } from "../bpmn/khcnDecisionModule";
import { khcnConditionPropertiesModule } from "../bpmn/khcnConditionModule";
import { khcnJobTypePropertiesModule } from "../bpmn/khcnJobTypeModule";
import { khcnVocabularyModule } from "../bpmn/khcnVocabularyModule";
import { khcnSimplePanelModule } from "../bpmn/khcnSimplePanelModule";
import { khcnColorModule } from "../bpmn/khcnColorModule";
import { startKhcnTemplate } from "../bpmn/khcnTemplatesModule";
import {
  lintDiagram,
  type LintIssue,
  type LintSeverity,
} from "../bpmn/khcnLint";
import type { KhcnTemplate } from "../data/elementTemplates";
import { STARTER_BPMN } from "../data/bpmn";
import DiagramToolbar from "./DiagramToolbar";
import BpmnTemplateDrawer from "./BpmnTemplateDrawer";

const SEVERITY_META: Record<LintSeverity, { color: string; label: string }> = {
  error: { color: "error", label: "Lỗi" },
  warning: { color: "warning", label: "Cảnh báo" },
  info: { color: "blue", label: "Gợi ý" },
};

const { Text } = Typography;
const PANEL_W = 340;
const DRAWER_W = 264;
const GRID_KEY = "qtkhcn.bpmn.grid";
const HINT_KEY = "qtkhcn.bpmn.hint.v1";

export interface BpmnEditorHandle {
  getXml: () => Promise<string>;
  getSvg: () => Promise<string>;
  markSaved: () => void;
  /**
   * Chạy lint làm CỔNG TRƯỚC KHI LƯU: trả về danh sách issue hiện tại;
   * nếu có lỗi (severity=error) thì tự mở modal kết quả. Bên gọi quyết định chặn.
   */
  validateForSave: () => LintIssue[];
}

interface Props {
  xml?: string;
  forms?: FormLite[];
  /**
   * Chiều cao vùng canvas khi KHÔNG toàn màn hình. Mặc định '74vh' (giữ tương
   * thích). Truyền '100%' khi đặt trong khung cha đã ghim chiều cao (flex column)
   * để canvas + panel/drawer chỉ cuộn nội bộ, tránh cuộn cả trang.
   */
  height?: string;
}

/**
 * Canvas vẽ BPMN theo bố cục Camunda Modeler: palette nổi trái, canvas toàn vùng,
 * Properties Panel dock bên phải (đóng/mở), drawer "Mẫu nghiệp vụ KHCN" dock trái,
 * toolbar zoom/lưới/undo nổi góc dưới. Chế độ Đơn giản (BA) / Nâng cao (kỹ thuật).
 * Live-lint: element lỗi được đánh dấu ngay trên canvas sau mỗi thay đổi.
 */
const BpmnEditor = forwardRef<BpmnEditorHandle, Props>(
  ({ xml, forms, height = "74vh" }, ref) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const propsRef = useRef<HTMLDivElement>(null);
    const modelerRef = useRef<BpmnModeler | null>(null);
    const formsRef = useRef<FormLite[]>(forms ?? []);
    formsRef.current = forms ?? [];
    // Chế độ nâng cao — các module didi đọc qua ref để không phải dựng lại modeler.
    const advancedRef = useRef(false);
    const lintTimerRef = useRef<number>(0);

    const [isFs, setIsFs] = useState(false);
    const [panelOpen, setPanelOpen] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [advanced, setAdvanced] = useState(false);
    const [lintOpen, setLintOpen] = useState(false);
    const [issues, setIssues] = useState<LintIssue[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [importError, setImportError] = useState("");
    const [zoomPct, setZoomPct] = useState(100);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [gridOn, setGridOn] = useState(
      () => localStorage.getItem(GRID_KEY) !== "0",
    );
    const [showHint, setShowHint] = useState(
      () => !localStorage.getItem(HINT_KEY),
    );
    const { message } = App.useApp();

    /** Cập nhật overlay lỗi/cảnh báo trên canvas theo kết quả lint. */
    const applyLintOverlays = useCallback((found: LintIssue[]) => {
      const modeler = modelerRef.current;
      if (!modeler) return;
      const overlays = modeler.get("overlays") as {
        add: (el: string, type: string, def: unknown) => void;
        remove: (filter: unknown) => void;
      };
      const registry = modeler.get("elementRegistry") as {
        get: (id: string) => unknown;
      };
      overlays.remove({ type: "khcn-lint" });
      // Gom theo element — 1 chấm/element, tooltip liệt kê mọi thông báo.
      const byEl = new Map<string, LintIssue[]>();
      for (const it of found) {
        if (!it.elementId || it.severity === "info") continue;
        const list = byEl.get(it.elementId) ?? [];
        list.push(it);
        byEl.set(it.elementId, list);
      }
      for (const [elementId, list] of byEl) {
        if (!registry.get(elementId)) continue;
        const worst = list.some((i) => i.severity === "error")
          ? "error"
          : "warning";
        const el = document.createElement("div");
        el.className = `khcn-lint-dot khcn-lint-${worst}`;
        el.title = list.map((i) => i.message).join("\n");
        try {
          overlays.add(elementId, "khcn-lint", {
            position: { top: -6, right: -2 },
            html: el,
          });
        } catch {
          /* connection/label không hỗ trợ vị trí này — bỏ qua */
        }
      }
    }, []);

    const runLiveLint = useCallback(() => {
      const modeler = modelerRef.current;
      if (!modeler) return;
      const found = lintDiagram(modeler);
      setIssues(found);
      applyLintOverlays(found);
    }, [applyLintOverlays]);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const modeler = new BpmnModeler({
        container: el,
        additionalModules: [
          TranslateViModule,
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          ZeebePropertiesProviderModule,
          khcnFormPropertiesModule(() => formsRef.current),
          khcnAssignmentPropertiesModule(),
          khcnLanePropertiesModule(),
          khcnDecisionModule(),
          khcnConditionPropertiesModule(),
          khcnJobTypePropertiesModule(),
          khcnVocabularyModule(() => advancedRef.current),
          khcnSimplePanelModule(() => advancedRef.current),
          khcnColorModule(),
          minimapModule,
          gridModule,
        ],
        moddleExtensions: { zeebe: zeebeModdle },
        propertiesPanel: propsRef.current
          ? { parent: propsRef.current }
          : undefined,
        minimap: { open: false },
        textRenderer: VHT_TEXT_RENDERER,
      } as never);
      modelerRef.current = modeler;
      let ready = false;
      // StrictMode/remount có thể destroy modeler khi importXML còn chạy dở —
      // khi đó bỏ qua kết quả (kể cả lỗi) để không hiện banner cho modeler đã hủy.
      let cancelled = false;
      const eventBus = modeler.get("eventBus") as {
        on: (event: string, callback: (e?: unknown) => void) => void;
        off: (event: string, callback: (e?: unknown) => void) => void;
      };
      const commandStack = modeler.get("commandStack") as {
        undo: () => void;
        redo: () => void;
        canUndo: () => boolean;
        canRedo: () => boolean;
      };
      const onDiagramChanged = () => {
        if (!ready) return;
        setIsDirty(true);
        setCanUndo(commandStack.canUndo());
        setCanRedo(commandStack.canRedo());
        // Live-lint debounce: chờ người vẽ ngừng tay ~600ms rồi mới quét.
        window.clearTimeout(lintTimerRef.current);
        lintTimerRef.current = window.setTimeout(runLiveLint, 600);
      };
      const onViewboxChanged = (e: unknown) => {
        const vb = (e as { viewbox?: { scale?: number } })?.viewbox;
        if (vb?.scale) setZoomPct(Math.round(vb.scale * 100));
      };
      eventBus.on("commandStack.changed", onDiagramChanged);
      eventBus.on("canvas.viewbox.changed", onViewboxChanged);
      setImportError("");
      setIsDirty(false);
      modeler
        .importXML(xml || STARTER_BPMN)
        .then(() => {
          if (cancelled) return;
          const canvas = modeler.get("canvas") as {
            zoom: (m?: string | number) => number;
          };
          const fittedZoom = canvas.zoom("fit-viewport");
          // Sơ đồ nghiệp vụ nhiều lane rất rộng: giữ chữ ở mức còn đọc được,
          // chấp nhận người dùng pan ngang thay vì thu nhỏ toàn bộ tới mức li ti.
          if (fittedZoom < 0.42) canvas.zoom(0.42);
          setZoomPct(Math.round((canvas.zoom() as number) * 100));
          // Lưới: đồng bộ trạng thái đã lưu (mặc định bật).
          if (localStorage.getItem(GRID_KEY) === "0") {
            (modeler.get("grid") as { toggle: (v: boolean) => void }).toggle(
              false,
            );
          }
          ready = true;
          runLiveLint();
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          const detail = error instanceof Error ? error.message : String(error);
          setImportError(`Không thể mở sơ đồ BPMN. ${detail}`);
        });

      const stopRelabel = propsRef.current
        ? observeViLabels(propsRef.current)
        : undefined;

      return () => {
        cancelled = true;
        stopRelabel?.();
        window.clearTimeout(lintTimerRef.current);
        eventBus.off("commandStack.changed", onDiagramChanged);
        eventBus.off("canvas.viewbox.changed", onViewboxChanged);
        modeler.destroy();
        modelerRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [xml]);

    useEffect(() => {
      const onFs = () => {
        setIsFs(document.fullscreenElement === wrapperRef.current);
        window.setTimeout(() => {
          const canvas = modelerRef.current?.get("canvas") as
            | { resized?: () => void; zoom?: (m: string) => void }
            | undefined;
          canvas?.resized?.();
          canvas?.zoom?.("fit-viewport");
        }, 120);
      };
      document.addEventListener("fullscreenchange", onFs);
      return () => document.removeEventListener("fullscreenchange", onFs);
    }, []);

    // Cảnh báo khi đóng tab/refresh còn thay đổi chưa lưu.
    useEffect(() => {
      if (!isDirty) return;
      const onBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", onBeforeUnload);
      return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [isDirty]);

    useImperativeHandle(ref, () => ({
      getXml: async () =>
        (await modelerRef.current!.saveXML({ format: true })).xml ?? "",
      getSvg: async () => (await modelerRef.current!.saveSVG()).svg ?? "",
      markSaved: () => setIsDirty(false),
      validateForSave: () => {
        if (!modelerRef.current) return [];
        const found = lintDiagram(modelerRef.current);
        setIssues(found);
        applyLintOverlays(found);
        if (found.some((i) => i.severity === "error")) setLintOpen(true);
        return found;
      },
    }));

    // ── Toolbar actions ────────────────────────────────────────────────────────
    const getCanvas = () =>
      modelerRef.current?.get("canvas") as
        | { zoom: (s?: number | string) => number }
        | undefined;
    const zoomBy = (factor: number) => {
      const c = getCanvas();
      if (c) c.zoom((c.zoom() as number) * factor);
    };
    const fit = () => getCanvas()?.zoom("fit-viewport");
    const zoomReset = () => getCanvas()?.zoom(1);
    const toggleMinimap = () =>
      (
        modelerRef.current?.get("minimap") as { toggle: () => void } | undefined
      )?.toggle();
    const toggleFullscreen = () => {
      const el = wrapperRef.current;
      if (!el) return;
      if (document.fullscreenElement) void document.exitFullscreen();
      else void el.requestFullscreen();
    };
    const undo = () =>
      (
        modelerRef.current?.get("commandStack") as
          | { undo: () => void }
          | undefined
      )?.undo();
    const redo = () =>
      (
        modelerRef.current?.get("commandStack") as
          | { redo: () => void }
          | undefined
      )?.redo();
    const toggleGrid = () => {
      const next = !gridOn;
      setGridOn(next);
      localStorage.setItem(GRID_KEY, next ? "1" : "0");
      (
        modelerRef.current?.get("grid") as
          | { toggle: (v: boolean) => void }
          | undefined
      )?.toggle(next);
    };

    /** Đổi Đơn giản ↔ Nâng cao: module đọc ref; ép palette + panel dựng lại. */
    const toggleAdvanced = (checked: boolean) => {
      advancedRef.current = checked;
      setAdvanced(checked);
      const modeler = modelerRef.current;
      if (!modeler) return; // Palette rebuild theo sự kiện i18n.changed (API chuẩn của diagram-js).
      (modeler.get("eventBus") as { fire: (e: string) => void }).fire(
        "i18n.changed",
      );
      const selection = modeler.get("selection") as {
        get: () => unknown[];
        select: (e: unknown) => void;
      };
      const current = selection.get();
      selection.select(null as never);
      if (current.length === 1) selection.select(current[0]);
    };

    const onPickTemplate = (tmpl: KhcnTemplate, event: Event) => {
      if (!modelerRef.current) return;
      startKhcnTemplate(modelerRef.current, tmpl, event);
    };

    const dismissHint = () => {
      localStorage.setItem(HINT_KEY, "1");
      setShowHint(false);
    };

    const runLint = () => {
      if (!modelerRef.current) return;
      const found = lintDiagram(modelerRef.current);
      setIssues(found);
      applyLintOverlays(found);
      if (found.length === 0) {
        message.success("Không phát hiện vấn đề. Quy trình hợp lệ.");
      } else {
        setLintOpen(true);
      }
    };

    /** Click một issue → đóng modal, chọn & cuộn tới element lỗi trên canvas. */
    const focusIssue = (issue: LintIssue) => {
      const modeler = modelerRef.current;
      if (!modeler || !issue.elementId) return;
      const registry = modeler.get("elementRegistry") as {
        get: (id: string) => unknown;
      };
      const el = registry.get(issue.elementId) as { id: string } | undefined;
      if (!el) return;
      setLintOpen(false);
      (modeler.get("selection") as { select: (e: unknown) => void }).select(el);
      const canvas = modeler.get("canvas") as {
        scrollToElement?: (e: unknown, p?: number) => void;
      };
      canvas.scrollToElement?.(el, 120);
    };

    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;

    return (
      <div
        ref={wrapperRef}
        className={drawerOpen ? "khcn-drawer-open" : undefined}
        style={{
          position: "relative",
          height: isFs ? "100vh" : height,
          background: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          ref={containerRef}
          className="vht-diagram"
          style={{ height: "100%" }}
        />

        {importError && (
          <Alert
            type="error"
            showIcon
            closable
            message="Lỗi nạp sơ đồ BPMN"
            description={importError}
            onClose={() => setImportError("")}
            style={{
              position: "absolute",
              top: 56,
              left: drawerOpen ? DRAWER_W + 12 : 150,
              right: panelOpen ? PANEL_W + 12 : 12,
              zIndex: 28,
            }}
          />
        )}
        <div>
          {/* Hàng nút trên-trái: Mẫu KHCN + Kiểm tra (badge lỗi) + Chưa lưu */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: drawerOpen ? DRAWER_W + 12 : 12,
              zIndex: 26,
              display: "flex",
              gap: 8,
              alignItems: "center",
              transition: "left 0.18s ease",
            }}
          >
            {!drawerOpen && (
              <Tooltip title="Mở thư viện mẫu nghiệp vụ KHCN" placement="right">
                <Button
                  icon={<AppstoreOutlined />}
                  onClick={() => setDrawerOpen(true)}
                >
                  Mẫu KHCN
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Kiểm tra tính hợp lệ của quy trình">
              <Badge
                count={errorCount || warningCount}
                color={errorCount ? undefined : "orange"}
                size="small"
              >
                <Button icon={<SafetyCertificateOutlined />} onClick={runLint}>
                  Kiểm tra
                </Button>
              </Badge>
            </Tooltip>
            {isDirty && !importError && (
              <Tag color="warning" style={{ marginInlineEnd: 0 }}>
                Chưa lưu
              </Tag>
            )}
          </div>

          {/* Công tắc Đơn giản/Nâng cao — cạnh panel thuộc tính */}
          <div
            style={{
              position: "absolute",
              top: 12,
              right: panelOpen ? PANEL_W + 12 : 56,
              zIndex: 26,
              display: "flex",
              gap: 6,
              alignItems: "center",
              background: "#fff",
              border: "1px solid var(--vht-border)",
              borderRadius: "var(--vht-radius-sm)",
              padding: "3px 10px",
              transition: "right 0.18s ease",
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              Thuộc tính nâng cao
            </Text>
            <Tooltip
              title={
                advanced
                  ? "Đang hiện đầy đủ thuộc tính kỹ thuật"
                  : "Đang ở chế độ đơn giản cho nghiệp vụ"
              }
            >
              <Switch
                size="small"
                checked={advanced}
                onChange={toggleAdvanced}
              />
            </Tooltip>
          </div>
        </div>

        {/* Drawer mẫu nghiệp vụ KHCN (dock trái) */}
        <BpmnTemplateDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onPick={onPickTemplate}
        />

        {/* Hint bắt đầu nhanh (hiện 1 lần) */}
        {showHint && !importError && (
          <Card
            size="small"
            style={{
              position: "absolute",
              bottom: 64,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 27,
              width: 420,
              maxWidth: "calc(100% - 40px)",
              boxShadow: "0 4px 16px rgba(15,23,34,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 13 }}>
                <Text strong>Bắt đầu nhanh:</Text> ① chọn mẫu trong{" "}
                <Text strong>Mẫu KHCN</Text> (trái) → ② di chuột lên canvas, bấm
                để đặt → ③ nối các bước rồi bấm <Text strong>Kiểm tra</Text>.
              </div>
              <Button size="small" type="text" onClick={dismissHint}>
                Đã hiểu
              </Button>
            </div>
          </Card>
        )}

        <Modal
          title="Kết quả kiểm tra quy trình"
          open={lintOpen}
          onCancel={() => setLintOpen(false)}
          footer={
            <Button type="primary" onClick={() => setLintOpen(false)}>
              Đóng
            </Button>
          }
          width={640}
        >
          {issues.length === 0 ? (
            <Empty description="Không có vấn đề" />
          ) : (
            <List
              size="small"
              dataSource={issues}
              renderItem={(it) => (
                <List.Item
                  onClick={() => focusIssue(it)}
                  style={{ cursor: it.elementId ? "pointer" : "default" }}
                  extra={
                    it.elementId ? (
                      <Button type="link" size="small">
                        Tới phần tử
                      </Button>
                    ) : undefined
                  }
                >
                  <Tag color={SEVERITY_META[it.severity].color}>
                    {SEVERITY_META[it.severity].label}
                  </Tag>
                  <span style={{ flex: 1 }}>
                    <Text strong>{it.elementName}</Text> — {it.message}
                  </span>
                </List.Item>
              )}
            />
          )}
        </Modal>

        {/* Properties Panel dock (phải) */}
        <div
          className="vht-props-dock"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: PANEL_W,
            background: "#fff",
            borderLeft: "1px solid var(--vht-border)",
            boxShadow: "-2px 0 10px rgba(15,23,34,0.06)",
            display: "flex",
            flexDirection: "column",
            transform: panelOpen ? "translateX(0)" : `translateX(${PANEL_W}px)`,
            transition: "transform 0.18s ease",
            zIndex: 25,
          }}
        >
          <div
            style={{
              height: 42,
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 8px 0 14px",
              borderBottom: "1px solid var(--vht-border)",
              background: "var(--vht-surface-2)",
            }}
          >
            <Text strong>Thuộc tính phần tử</Text>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setPanelOpen(false)}
            />
          </div>
          <div
            ref={propsRef}
            className="vht-designer"
            style={{ flex: 1, overflow: "auto" }}
          />
        </div>

        {/* Nút mở lại panel (khi đang đóng) — tab dọc mép phải */}
        {!panelOpen && (
          <Tooltip title="Mở panel thuộc tính" placement="left">
            <Button
              icon={<ProfileOutlined />}
              onClick={() => setPanelOpen(true)}
              style={{ position: "absolute", top: 12, right: 12, zIndex: 26 }}
            />
          </Tooltip>
        )}

        {/* Toolbar zoom/tiện ích — góc dưới-phải, né panel khi mở */}
        <DiagramToolbar
          isFs={isFs}
          offsetRight={panelOpen ? PANEL_W : 0}
          onZoomIn={() => zoomBy(1.2)}
          onZoomOut={() => zoomBy(1 / 1.2)}
          onFit={fit}
          onToggleMinimap={toggleMinimap}
          onToggleFullscreen={toggleFullscreen}
          zoomPct={zoomPct}
          onZoomReset={zoomReset}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          gridOn={gridOn}
          onToggleGrid={toggleGrid}
        />
      </div>
    );
  },
);

BpmnEditor.displayName = "BpmnEditor";
export default BpmnEditor;
