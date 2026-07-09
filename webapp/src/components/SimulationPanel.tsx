// EPIC06 — Approval Matrix: Simulation Panel (Đợt 1 nâng cấp UI tab "Ma trận").
//
// Thay 3 input cứng (cap/loaiHoiDong/tongDuToan) bằng form động render từ
// APPROVAL_VARIABLES (simulated=true). Hỗ trợ tất cả kiểu dữ liệu, tự động ẩn/hiện
// theo slot (visibleForSlots). Slice B: collapse luật không liên quan, save/load
// kịch bản (localStorage), diff giữa 2 lần chạy.

import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Collapse,
  DatePicker,
  Divider,
  Empty,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  DiffOutlined,
  HistoryOutlined,
  SaveOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  APPROVAL_SLOTS,
  slotLabel,
  type SlotCode,
} from "../data/approvalSlotCatalog";
import {
  resolveApprovers,
  VND,
  MODE_LABEL,
  type ApprovalRule,
  type ResolveResult,
} from "../data/approvalMatrix";
import { roleLabel } from "../data/roles";
import {
  simulationVariables,
  defaultSimulationContext,
  type ApprovalVariableDef,
} from "../data/approvalVariableRegistry";

const { Text, Paragraph } = Typography;

// ── Types ────────────────────────────────────────────────────────────────────

interface SavedScenario {
  id: string;
  name: string;
  slot: SlotCode;
  context: Record<string, unknown>;
  savedAt: string;
  result?: ResolveResult | null;
}

interface SimulationPanelProps {
  rules: ApprovalRule[];
}

const LS_KEY = "approval-matrix-simulation-scenarios";

function loadScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedScenario[]) : [];
  } catch {
    return [];
  }
}

function saveScenarios(scenarios: SavedScenario[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(scenarios));
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return (
    (p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")
  ).toUpperCase();
}

// ── Value control per variable type ──────────────────────────────────────────

function VariableInput({
  def,
  value,
  onChange,
}: {
  def: ApprovalVariableDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (def.type === "boolean") {
    return (
      <Checkbox
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }

  if (def.type === "enum" && def.options) {
    return (
      <Select
        style={{ width: "100%" }}
        value={value as string}
        onChange={onChange}
        options={def.options.map((o) => ({ value: o.value, label: o.label }))}
        allowClear={false}
      />
    );
  }

  if (def.type === "multiEnum" && def.options) {
    return (
      <Select
        mode="multiple"
        style={{ width: "100%" }}
        value={value as string[]}
        onChange={onChange}
        options={def.options.map((o) => ({ value: o.value, label: o.label }))}
        allowClear
      />
    );
  }

  if (def.type === "number") {
    if (def.key === "tongDuToan") {
      return (
        <InputNumber<number>
          style={{ width: "100%" }}
          min={0}
          step={1_000_000_000}
          value={value as number}
          onChange={(v) => onChange(v ?? 0)}
          formatter={(v) => VND.format(Number(v ?? 0))}
          parser={(s) => Number((s ?? "").replace(/\D/g, ""))}
        />
      );
    }
    return (
      <InputNumber<number>
        style={{ width: "100%" }}
        value={value as number}
        onChange={(v) => onChange(v ?? 0)}
      />
    );
  }

  if (def.type === "date") {
    return (
      <DatePicker
        style={{ width: "100%" }}
        value={value ? dayjs(value as string) : null}
        onChange={(d) => onChange(d?.format("YYYY-MM-DD") ?? null)}
      />
    );
  }

  // string
  return (
    <Input
      style={{ width: "100%" }}
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Nhập ${def.label.toLowerCase()}`}
    />
  );
}

// ── Quick preset buttons ─────────────────────────────────────────────────────

const QUICK_PRESETS: {
  label: string;
  apply: (ctx: Record<string, unknown>) => Record<string, unknown>;
}[] = [
  {
    label: "Cấp Tập đoàn, NS ≥ 5 tỷ",
    apply: (ctx) => ({
      ...ctx,
      capNhiemVu: "TD",
      tongDuToan: 12_000_000_000,
    }),
  },
  {
    label: "Cấp Cơ sở",
    apply: (ctx) => ({ ...ctx, capNhiemVu: "CS", tongDuToan: 2_000_000_000 }),
  },
  {
    label: "Cần hội đồng KHCN",
    apply: (ctx) => ({
      ...ctx,
      loaiHoiDong: "HD_KHCN_TD",
      capNhiemVu: "TD",
    }),
  },
  {
    label: "Có mua sắm",
    apply: (ctx) => ({ ...ctx, coMuaSam: true }),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SimulationPanel({ rules }: SimulationPanelProps) {
  // ── Simulation state ────────────────────────────────────────────────────
  const [simSlot, setSimSlot] = useState<SlotCode>("PHE_DUYET");
  const [simCtx, setSimCtx] = useState<Record<string, unknown>>(() =>
    defaultSimulationContext("PHE_DUYET"),
  );
  const [result, setResult] = useState<ResolveResult | null>(null);
  const [prevResult, setPrevResult] = useState<ResolveResult | null>(null);

  // ── Scenarios ───────────────────────────────────────────────────────────
  const [scenarios, setScenarios] = useState<SavedScenario[]>(loadScenarios);
  const [scenarioName, setScenarioName] = useState("");

  // ── Collapse control ────────────────────────────────────────────────────
  const [showAllEvaluated, setShowAllEvaluated] = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────
  const simVars = useMemo(() => simulationVariables(simSlot), [simSlot]);

  const runSim = useCallback(() => {
    const cap = simCtx.capNhiemVu as "CS" | "TD" | undefined;
    const loaiHoiDong = simCtx.loaiHoiDong as string | undefined;
    const tongDuToan = simCtx.tongDuToan as number | undefined;

    setPrevResult(result);
    setResult(
      resolveApprovers(rules, {
        slot: simSlot,
        cap,
        loaiHoiDong,
        tongDuToan,
        vars: simCtx,
      }),
    );
  }, [rules, simSlot, simCtx, result]);

  const handleSlotChange = (slot: SlotCode) => {
    setSimSlot(slot);
    setSimCtx(defaultSimulationContext(slot));
    setResult(null);
    setPrevResult(null);
  };

  const updateVar = (key: string, value: unknown) => {
    setSimCtx((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  };

  const applyPreset = (
    apply: (ctx: Record<string, unknown>) => Record<string, unknown>,
  ) => {
    setSimCtx((prev) => apply({ ...prev }));
    setResult(null);
  };

  // ── Scenario CRUD ───────────────────────────────────────────────────────
  const saveScenario = () => {
    const name = scenarioName.trim() || `Kịch bản ${scenarios.length + 1}`;
    const s: SavedScenario = {
      id: `SC-${Date.now().toString(36)}`,
      name,
      slot: simSlot,
      context: { ...simCtx },
      savedAt: new Date().toISOString(),
      result,
    };
    const next = [...scenarios, s];
    setScenarios(next);
    saveScenarios(next);
    setScenarioName("");
  };

  const loadScenario = (s: SavedScenario) => {
    setSimSlot(s.slot);
    setSimCtx({ ...s.context });
    setResult(s.result ?? null);
    setPrevResult(null);
  };

  const deleteScenario = (id: string) => {
    const next = scenarios.filter((s) => s.id !== id);
    setScenarios(next);
    saveScenarios(next);
  };

  // ── Evaluated rules filtering ───────────────────────────────────────────
  const relevantEvaluated = useMemo(() => {
    if (!result || result.evaluatedRules.length === 0) return null;
    const evaluated = result.evaluatedRules;
    const relevant = evaluated.filter(
      (e) =>
        e.chosen ||
        (e.matched && e.rule.enabled) ||
        e.rule.id === result.matchedRule?.id,
    );
    const skipped = evaluated.filter(
      (e) => !relevant.includes(e),
    );
    return { relevant, skipped, skippedCount: skipped.length };
  }, [result]);

  // ── Diff ────────────────────────────────────────────────────────────────
  const diff = useMemo(() => {
    if (!prevResult || !result) return null;
    const prevIds = new Set(prevResult.approvers.map((a) => a.user.id));
    const currIds = new Set(result.approvers.map((a) => a.user.id));
    const added = result.approvers.filter((a) => !prevIds.has(a.user.id));
    const removed = prevResult.approvers.filter((a) => !currIds.has(a.user.id));
    const changed =
      prevResult.matchedRule?.id !== result.matchedRule?.id ||
      prevResult.mode !== result.mode;
    return { added, removed, changed };
  }, [prevResult, result]);

  return (
    <Card
      size="small"
      title={
        <Space>
          <ThunderboltOutlined />
          Mô phỏng (Simulation)
        </Space>
      }
      extra={
        scenarios.length > 0 && (
          <Tooltip title="Kịch bản đã lưu">
            <Tag color="blue">{scenarios.length}</Tag>
          </Tooltip>
        )
      }
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {/* Slot selector */}
        <div>
          <Text type="secondary">Loại phê duyệt (Need Role từ BPMN)</Text>
          <Select
            style={{ width: "100%", marginTop: 4 }}
            value={simSlot}
            onChange={handleSlotChange}
            options={APPROVAL_SLOTS.filter(
              (s) => s.trangThai === "active",
            ).map((s) => ({ value: s.code, label: s.ten }))}
          />
        </div>

        {/* Dynamic variable inputs */}
        {simVars.map((def) => (
          <div key={def.key}>
            <Text type="secondary">
              {def.label}
              <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                ({def.source})
              </Text>
            </Text>
            <div style={{ marginTop: 4 }}>
              <VariableInput
                def={def}
                value={simCtx[def.key]}
                onChange={(v) => updateVar(def.key, v)}
              />
            </div>
          </div>
        ))}

        {/* Quick presets */}
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Preset nhanh:
          </Text>
          <div style={{ marginTop: 4 }}>
            <Space size={[4, 4]} wrap>
              {QUICK_PRESETS.map((p) => (
                <Button
                  key={p.label}
                  size="small"
                  onClick={() => applyPreset(p.apply)}
                >
                  {p.label}
                </Button>
              ))}
            </Space>
          </div>
        </div>

        {/* Run button */}
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          block
          onClick={runSim}
        >
          Xem kết quả
        </Button>

        {/* Save scenario */}
        <Space.Compact style={{ width: "100%" }}>
          <Input
            size="small"
            placeholder="Tên kịch bản..."
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            onPressEnter={saveScenario}
            style={{ flex: 1 }}
          />
          <Tooltip title="Lưu kịch bản hiện tại">
            <Button
              size="small"
              icon={<SaveOutlined />}
              onClick={saveScenario}
            />
          </Tooltip>
        </Space.Compact>

        {/* ── Results ──────────────────────────────────────────────────── */}
        {result && (
          <>
            <Divider style={{ margin: "4px 0" }} />

            {/* Diff indicator */}
            {diff && (diff.changed || diff.added.length > 0 || diff.removed.length > 0) && (
              <Alert
                type="info"
                showIcon
                icon={<DiffOutlined />}
                style={{ fontSize: 12 }}
                message={
                  <span>
                    {diff.changed && "Luật thắng đã thay đổi. "}
                    {diff.added.length > 0 &&
                      `+${diff.added.length} người mới `}
                    {diff.removed.length > 0 &&
                      `-${diff.removed.length} người cũ `}
                  </span>
                }
              />
            )}

            <Alert
              type={result.matchedRule ? "success" : "warning"}
              showIcon
              message={
                result.matchedRule
                  ? `Kết quả: ${result.mode ? MODE_LABEL[result.mode] : ""}`
                  : "Không có luật khớp"
              }
              description={
                <span style={{ fontSize: 12 }}>{result.reason}</span>
              }
            />

            {result.warnings.length > 0 && (
              <Alert
                type="warning"
                showIcon
                style={{ fontSize: 12 }}
                message="Cảnh báo"
                description={
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                }
              />
            )}

            {result.approvers.length > 0 && (
              <Card
                size="small"
                style={{ background: "var(--vht-surface-2, #fafafa)" }}
              >
                <Space
                  direction="vertical"
                  size={8}
                  style={{ width: "100%" }}
                >
                  {result.approvers.map((a) => (
                    <Space key={a.user.id} align="start">
                      <Avatar
                        style={{
                          background: "#ffdad8",
                          color: "#bf0027",
                          fontWeight: 700,
                        }}
                      >
                        {initials(a.user.hoTen)}
                      </Avatar>
                      <div style={{ lineHeight: 1.35 }}>
                        <Text strong>{a.user.hoTen}</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {a.user.chucDanh}
                          </Text>
                        </div>
                        {a.viaRoleCode && (
                          <Tag color="green" style={{ marginTop: 2 }}>
                            {roleLabel(a.viaRoleCode)}
                          </Tag>
                        )}
                        {a.delegatedFrom && (
                          <Tag
                            color="volcano"
                            style={{ marginTop: 2 }}
                          >
                            UQ: {a.delegatedFrom.hoTen}
                          </Tag>
                        )}
                        {a.placeholder && (
                          <Tag color="orange" style={{ marginTop: 2 }}>
                            placeholder
                          </Tag>
                        )}
                      </div>
                    </Space>
                  ))}
                </Space>
              </Card>
            )}

            {result.approvers.length === 0 && result.matchedRule == null && (
              <Empty
                description="Không có người phê duyệt"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}

            {/* Evaluated rules — collapsible */}
            {result.evaluatedRules.length > 0 && relevantEvaluated && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Đã xét {result.evaluatedRules.length} luật cùng slot:
                </Text>
                <Space
                  direction="vertical"
                  size={4}
                  style={{ width: "100%", marginTop: 6 }}
                >
                  {relevantEvaluated.relevant.map((e) => (
                    <div
                      key={e.rule.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        fontSize: 12,
                      }}
                    >
                      <Space size={4}>
                        <Tag
                          color={
                            e.chosen
                              ? "green"
                              : e.matched
                                ? "blue"
                                : "default"
                          }
                        >
                          #{e.rule.priority}
                        </Tag>
                        <Text delete={!e.matched && !e.chosen}>
                          {e.rule.ten}
                        </Text>
                      </Space>
                      <Text type="secondary">{e.note}</Text>
                    </div>
                  ))}
                </Space>

                {/* Collapsed skipped rules */}
                {relevantEvaluated.skippedCount > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setShowAllEvaluated(!showAllEvaluated)}
                    >
                      {showAllEvaluated
                        ? "Ẩn bớt"
                        : `${relevantEvaluated.skippedCount} luật khác (khác slot / đã tắt) ▸`}
                    </Button>
                    {showAllEvaluated && (
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%", marginTop: 4 }}
                      >
                        {relevantEvaluated.skipped.map((e) => (
                          <div
                            key={e.rule.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 8,
                              fontSize: 12,
                              opacity: 0.5,
                            }}
                          >
                            <Space size={4}>
                              <Tag>#{e.rule.priority}</Tag>
                              <Text delete>{e.rule.ten}</Text>
                            </Space>
                            <Text type="secondary">{e.note}</Text>
                          </div>
                        ))}
                      </Space>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Saved scenarios ──────────────────────────────────────────── */}
        {scenarios.length > 0 && (
          <>
            <Divider style={{ margin: "8px 0" }} />
            <Collapse
              size="small"
              ghost
              items={[
                {
                  key: "scenarios",
                  label: (
                    <Space size={4}>
                      <HistoryOutlined />
                      <Text style={{ fontSize: 12 }}>
                        Kịch bản đã lưu ({scenarios.length})
                      </Text>
                    </Space>
                  ),
                  children: (
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: "100%" }}
                    >
                      {scenarios.map((s) => (
                        <div
                          key={s.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 12,
                          }}
                        >
                          <Space size={4}>
                            <Tag color="purple">{slotLabel(s.slot)}</Tag>
                            <Button
                              type="link"
                              size="small"
                              style={{ padding: 0, fontSize: 12 }}
                              onClick={() => loadScenario(s)}
                            >
                              {s.name}
                            </Button>
                          </Space>
                          <Space size={2}>
                            <Tooltip title="Sao chép context JSON">
                              <Button
                                type="text"
                                size="small"
                                icon={<CopyOutlined />}
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    JSON.stringify(s.context, null, 2),
                                  );
                                }}
                              />
                            </Tooltip>
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => deleteScenario(s.id)}
                            />
                          </Space>
                        </div>
                      ))}
                    </Space>
                  ),
                },
              ]}
            />
          </>
        )}

        <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
          Khi backend/Zeebe sẵn sàng, nút này gọi{" "}
          <Text code>POST /approval-matrix/resolve</Text>; Camunda chỉ nhận danh
          sách <Text code>candidateUsers</Text> đã tính. BPMN &amp; ma trận giữ
          nguyên.
        </Paragraph>
      </Space>
    </Card>
  );
}
