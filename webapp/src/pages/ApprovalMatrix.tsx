import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  App,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  ClusterOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SolutionOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import HelpButton from "../components/HelpButton";
import ConditionBuilder from "../components/ConditionBuilder";
import AssignmentBuilder, {
  type AssignmentTargetIssue,
} from "../components/AssignmentBuilder";
import { PageHeader } from "../components/ui";
import { roleLabel } from "../data/roles";
import {
  DELEGATIONS,
  LOAI_HOI_DONG_LABEL,
  MODE_LABEL,
  VND,
  describeTarget,
  groupAssignment,
  resolveApprovers,
  type ApprovalAssignment,
  type ApprovalRule,
  type ResolveResult,
  type SlotCode,
} from "../data/approvalMatrix";
import {
  APPROVAL_SLOTS,
  slotLabel,
  usageForSlot,
  type ApprovalSlot,
} from "../data/approvalSlotCatalog";
import {
  anyCondition,
  describeConditionTree,
  leaf,
  type ConditionGroup,
  type ConditionNode,
} from "../data/approvalConditions";
import { describeHelpers } from "../data/approvalVariableRegistry";
import { analyzeRules, warningsByRule } from "../data/approvalMatrixAnalyzer";
import { useApprovalMatrix } from "../store/ApprovalMatrixContext";
import {
  useApprovalSlotCatalog,
  type CreateApprovalSlotInput,
  type UpdateApprovalSlotInput,
} from "../store/ApprovalSlotCatalogContext";
import { users } from "../data/users";

const { Text, Paragraph } = Typography;

/** Chữ cái đầu họ tên → nhãn avatar. */
function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return (
    (p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")
  ).toUpperCase();
}

/** Diễn giải điều kiện của một rule thành câu đọc được (bảng). */
function conditionSummary(r: ApprovalRule) {
  const empty = r.conditions.items.length === 0;
  return empty ? (
    <Tag>Mọi hồ sơ</Tag>
  ) : (
    <Text style={{ fontSize: 12 }}>
      {describeConditionTree(r.conditions, describeHelpers)}
    </Text>
  );
}

interface RuleFormValues {
  ten: string;
  slot: SlotCode;
  priority: number;
  enabled: boolean;
}

const DEFAULT_RULE_FORM_VALUES: RuleFormValues = {
  ten: "",
  slot: "THAM_DINH",
  priority: 50,
  enabled: true,
};

/** Preset điều kiện hay dùng — thêm nhanh 1 leaf vào cây điều kiện đang soạn. */
const CONDITION_PRESETS: { label: string; make: () => ConditionNode }[] = [
  { label: "Cấp Tập đoàn", make: () => leaf("capNhiemVu", "eq", "TD") },
  { label: "Cấp Cơ sở", make: () => leaf("capNhiemVu", "eq", "CS") },
  {
    label: "Ngân sách ≥ 5 tỷ",
    make: () => leaf("tongDuToan", "gte", 5_000_000_000),
  },
  {
    label: "Hội đồng KHCN Tập đoàn",
    make: () => leaf("loaiHoiDong", "eq", "HD_KHCN_TD"),
  },
];

/** Preset target theo role hay dùng nhất mỗi slot (đối chiếu seed AM-01…AM-07). */
const TARGET_PRESETS_BY_SLOT: Partial<
  Record<SlotCode, { label: string; roleCode: string }[]>
> = {
  THAM_DINH: [
    { label: "Chuyên quản KHCN (cơ sở)", roleCode: "CQ_KHCN" },
    { label: "Cơ quan KHCN Tập đoàn", roleCode: "CQ_KHCN_TD" },
  ],
  HOI_DONG: [
    { label: "Hội đồng KHCN VHT", roleCode: "HDKHCN" },
    { label: "Hội đồng KHCN Tập đoàn", roleCode: "HDKHCN_TD" },
  ],
  PHE_DUYET: [
    { label: "Tổng Giám đốc VHT", roleCode: "TGD_VHT" },
    { label: "Ban TGĐ Tập đoàn", roleCode: "BTGD_TD" },
    { label: "Cơ quan nghiệp vụ Tập đoàn", roleCode: "CQNV_TD" },
  ],
};

function ruleToFormValues(rule: ApprovalRule): RuleFormValues {
  return {
    ten: rule.ten,
    slot: rule.slot,
    priority: rule.priority,
    enabled: rule.enabled,
  };
}
function hasAssignmentTarget(assignment: ApprovalAssignment): boolean {
  return assignment.targets.some(
    (t) =>
      (t.type === "GROUP" && t.roleCodes.length > 0) ||
      (t.type === "USER" && t.userIds.length > 0) ||
      (t.type !== "GROUP" && t.type !== "USER"),
  );
}

function collectAssignmentTargetIssues(
  assignment: ApprovalAssignment,
): AssignmentTargetIssue[] {
  return assignment.targets.flatMap((target, index) => {
    if (target.type === "GROUP" && target.roleCodes.length === 0) {
      return [{ index, message: "Chọn ít nhất một nhóm phê duyệt." }];
    }
    if (target.type === "USER" && target.userIds.length === 0) {
      return [{ index, message: "Chọn ít nhất một người cụ thể." }];
    }
    return [];
  });
}

function isBlankValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function collectConditionValueIssues(
  node: ConditionNode,
  path = "Điều kiện",
): string[] {
  if (node.kind === "group") {
    return node.items.flatMap((item, index) =>
      collectConditionValueIssues(item, `${path} ${index + 1}`),
    );
  }
  if (node.operator === "exists" || node.operator === "notExists") return [];
  if (node.operator === "between") {
    const missing: string[] = [];
    if (isBlankValue(node.value)) missing.push(`${path}: thiếu giá trị từ`);
    if (isBlankValue(node.valueTo)) missing.push(`${path}: thiếu giá trị đến`);
    return missing;
  }
  return isBlankValue(node.value) ? [`${path}: thiếu giá trị so sánh`] : [];
}
/**
 * Tab "Ma trận" — quản lý luật ánh xạ (slot phê duyệt + điều kiện) → người phê
 * duyệt cụ thể, + Rule Builder (thêm/sửa) + Simulation (resolve người) + Uỷ quyền
 * theo hiệu lực. Xem docs/research/configuration-service-EPIC06.md. State giữ
 * in-memory (mock).
 */
function MatrixTab() {
  const { message } = App.useApp();
  // Nguồn luật CHUNG (store) — sửa ở đây lan sang runtime hồ sơ (Slice G).
  const {
    rules,
    upsertRule,
    removeRule: removeRuleCtx,
    toggleRule,
  } = useApprovalMatrix();

  // ── Rule Builder (modal) ────────────────────────────────────────────────
  const [editing, setEditing] = useState<ApprovalRule | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<RuleFormValues>();
  const [formSeed, setFormSeed] = useState<RuleFormValues>(
    DEFAULT_RULE_FORM_VALUES,
  );
  // Cây điều kiện + kết quả phân công soạn tách khỏi antd Form (Form giữ trường phẳng).
  const [condDraft, setCondDraft] = useState<ConditionGroup>(anyCondition());
  const [asgDraft, setAsgDraft] = useState<ApprovalAssignment>(
    groupAssignment([]),
  );
  const watchedTen = Form.useWatch("ten", form);
  const watchedSlot = Form.useWatch("slot", form) as SlotCode | undefined;
  const watchedPriority = Form.useWatch("priority", form);
  const watchedEnabled = Form.useWatch("enabled", form);

  const draftSlot = watchedSlot ?? "THAM_DINH";
  const draftPriority =
    typeof watchedPriority === "number" ? watchedPriority : 50;
  const draftEnabled = watchedEnabled ?? true;
  const conditionValueIssues = useMemo(
    () => collectConditionValueIssues(condDraft),
    [condDraft],
  );
  const conditionPreview = useMemo(
    () => describeConditionTree(condDraft, describeHelpers),
    [condDraft],
  );
  const assignmentPreview = useMemo(
    () =>
      asgDraft.targets.map(describeTarget).join("; ") ||
      "Chưa có đích phân công",
    [asgDraft],
  );
  const assignmentHasTarget = useMemo(
    () => hasAssignmentTarget(asgDraft),
    [asgDraft],
  );
  const assignmentTargetIssues = useMemo(
    () => collectAssignmentTargetIssues(asgDraft),
    [asgDraft],
  );
  const draftRule = useMemo<ApprovalRule>(
    () => ({
      id: editing?.id ?? "__DRAFT_RULE__",
      ten: String(watchedTen ?? "").trim() || "Luật chưa đặt tên",
      slot: draftSlot,
      conditions: condDraft,
      assignment: asgDraft,
      priority: draftPriority,
      enabled: draftEnabled,
      version: editing?.version,
    }),
    [
      asgDraft,
      condDraft,
      draftEnabled,
      draftPriority,
      draftSlot,
      editing?.id,
      editing?.version,
      watchedTen,
    ],
  );
  const rulesWithDraft = useMemo(
    () =>
      editing
        ? rules.map((r) => (r.id === editing.id ? draftRule : r))
        : [...rules, draftRule],
    [draftRule, editing, rules],
  );
  const draftAnalysisWarnings = useMemo(() => {
    if (!modalOpen) return [];
    return analyzeRules(rulesWithDraft).filter(
      (w) => w.ruleId === draftRule.id || (!w.ruleId && w.slot === draftSlot),
    );
  }, [draftRule.id, draftSlot, modalOpen, rulesWithDraft]);
  const draftShadowedRules = useMemo(() => {
    if (!draftEnabled || condDraft.items.length > 0) return [];
    return rules
      .filter(
        (r) =>
          r.id !== editing?.id &&
          r.enabled &&
          r.slot === draftSlot &&
          r.priority > draftPriority,
      )
      .sort((a, b) => a.priority - b.priority);
  }, [
    condDraft.items.length,
    draftEnabled,
    draftPriority,
    draftSlot,
    editing?.id,
    rules,
  ]);
  const actionSummary = useMemo(() => {
    const name = String(watchedTen ?? "").trim() || "Luật chưa đặt tên";
    if (!draftEnabled) {
      return `${name}: luật đang tắt nên runtime sẽ không tạo action từ cấu hình này.`;
    }
    if (!assignmentHasTarget) {
      return `${name}: chưa có người/nhóm nhận action nên chưa thể tạo công việc phê duyệt.`;
    }
    return `${name}: khi loại phê duyệt "${slotLabel(draftSlot)}" và điều kiện khớp, hệ thống sẽ hiện action cho ${assignmentPreview} theo chế độ ${MODE_LABEL[asgDraft.mode]}.`;
  }, [
    asgDraft.mode,
    assignmentHasTarget,
    assignmentPreview,
    draftEnabled,
    draftSlot,
    watchedTen,
  ]);
  // Cảnh báo mà analyzer không phủ được: tên rỗng, giá trị điều kiện thiếu. Trùng
  // priority / bị wildcard ưu tiên cao hơn che khuất đã do `draftAnalysisWarnings`
  // (analyzeRules chạy trên `rulesWithDraft`) đảm nhiệm — không tính lại ở đây để
  // tránh 2 nguồn sự thật lệch nhau khi analyzer thay đổi.
  const draftWarnings = useMemo(() => {
    if (!modalOpen) return [];
    const out: { level: "error" | "warning" | "info"; message: string }[] = [];
    const ruleName = String(watchedTen ?? "").trim();

    if (!ruleName) out.push({ level: "info", message: "Chưa nhập tên luật." });
    if (condDraft.items.length === 0) {
      out.push({
        level: "warning",
        message:
          "Điều kiện đang để trống, rule sẽ khớp mọi hồ sơ trong slot đã chọn.",
      });
    }
    conditionValueIssues.forEach((issue) =>
      out.push({ level: "error", message: issue }),
    );

    return out;
  }, [condDraft.items.length, conditionValueIssues, modalOpen, watchedTen]);
  // Panel "Kiểm tra nhanh" hiển thị gộp: heuristic riêng của draft (tên, giá trị
  // điều kiện) + cảnh báo analyzer thật (trùng priority, wildcard che khuất, thiếu
  // đích phân công) tính trên `rulesWithDraft`.
  const previewWarnings = useMemo(
    () => [...draftWarnings, ...draftAnalysisWarnings],
    [draftAnalysisWarnings, draftWarnings],
  );

  // ── Thử nhanh với hồ sơ mẫu ngay trong popup (dùng rulesWithDraft, không cần lưu) ──
  const [draftSimCap, setDraftSimCap] = useState<"CS" | "TD">("TD");
  const [draftSimLoaiHD, setDraftSimLoaiHD] = useState<string>("HD_KHCN_TD");
  const [draftSimBudget, setDraftSimBudget] = useState<number>(12_000_000_000);
  const [draftSimResult, setDraftSimResult] = useState<ResolveResult | null>(
    null,
  );
  const runDraftSim = useCallback(() => {
    setDraftSimResult(
      resolveApprovers(rulesWithDraft, {
        slot: draftSlot,
        cap: draftSimCap,
        loaiHoiDong: draftSimLoaiHD,
        tongDuToan: draftSimBudget,
      }),
    );
  }, [draftSimBudget, draftSimCap, draftSimLoaiHD, draftSlot, rulesWithDraft]);

  const addConditionPreset = (make: () => ConditionNode) => {
    setCondDraft((prev) => ({ ...prev, items: [...prev.items, make()] }));
  };
  const addTargetPreset = (roleCode: string) => {
    setAsgDraft((prev) => ({
      ...prev,
      targets: [...prev.targets, { type: "GROUP", roleCodes: [roleCode] }],
    }));
  };
  const targetPresets = TARGET_PRESETS_BY_SLOT[draftSlot] ?? [];

  const openCreate = () => {
    const seed = DEFAULT_RULE_FORM_VALUES;
    setEditing(null);
    setFormSeed(seed);
    form.resetFields();
    form.setFieldsValue(seed);
    setCondDraft(anyCondition());
    setAsgDraft(groupAssignment([]));
    setDraftSimResult(null);
    setModalOpen(true);
  };
  const openEdit = (r: ApprovalRule) => {
    const seed = ruleToFormValues(r);
    setEditing(r);
    setFormSeed(seed);
    form.resetFields();
    form.setFieldsValue(seed);
    setCondDraft(structuredClone(r.conditions));
    setAsgDraft(structuredClone(r.assignment));
    setDraftSimResult(null);
    setModalOpen(true);
  };

  const saveRule = async () => {
    const v = await form.validateFields();
    if (conditionValueIssues.length > 0) {
      message.error("Cần nhập đủ giá trị cho các điều kiện trước khi lưu.");
      return;
    }
    if (!assignmentHasTarget) {
      message.error("Cần ít nhất một đích phân công (nhóm hoặc người).");
      return;
    }
    const next: ApprovalRule = {
      id: editing?.id ?? `AM-${Date.now().toString().slice(-5)}`,
      ten: v.ten.trim(),
      slot: v.slot,
      conditions: condDraft,
      assignment: asgDraft,
      priority: v.priority,
      enabled: v.enabled,
      version: (editing?.version ?? 0) + 1,
    };
    upsertRule(next);
    setModalOpen(false);
    message.success(editing ? "Đã cập nhật luật." : "Đã thêm luật mới.");
  };
  const removeRule = (id: string) => {
    removeRuleCtx(id);
    message.success("Đã xoá luật.");
  };
  const toggle = (id: string, enabled: boolean) => toggleRule(id, enabled);

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => a.priority - b.priority),
    [rules],
  );

  // ── Phân tích xung đột / độ phủ (Slice F) ────────────────────────────────
  const warnings = useMemo(() => analyzeRules(rules), [rules]);
  const warnByRule = useMemo(() => warningsByRule(warnings), [warnings]);
  const slotWarnings = useMemo(
    () => warnings.filter((w) => !w.ruleId),
    [warnings],
  );

  // ── Simulation ──────────────────────────────────────────────────────────
  const [simSlot, setSimSlot] = useState<SlotCode>("PHE_DUYET");
  const [simCap, setSimCap] = useState<"CS" | "TD">("TD");
  const [simLoaiHD, setSimLoaiHD] = useState<string>("HD_KHCN_TD");
  const [simBudget, setSimBudget] = useState<number>(12_000_000_000);
  const [result, setResult] = useState<ResolveResult | null>(null);

  const runSim = useCallback(() => {
    setResult(
      resolveApprovers(rules, {
        slot: simSlot,
        cap: simCap,
        loaiHoiDong: simLoaiHD,
        tongDuToan: simBudget,
      }),
    );
  }, [rules, simSlot, simCap, simLoaiHD, simBudget]);

  const columns = [
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      width: 84,
      render: (p: number) => <Tag>{p}</Tag>,
    },
    {
      title: "Luật",
      key: "ten",
      render: (_: unknown, r: ApprovalRule) => {
        const rw = warnByRule.get(r.id) ?? [];
        return (
          <div>
            <Space size={4}>
              <Text strong>{r.ten}</Text>
              {rw.length > 0 && (
                <Tooltip
                  title={
                    <div>
                      {rw.map((w, i) => (
                        <div key={i}>• {w.message}</div>
                      ))}
                    </div>
                  }
                >
                  <WarningOutlined
                    style={{
                      color: rw.some((w) => w.level === "error")
                        ? "#cf1322"
                        : "#d48806",
                    }}
                  />
                </Tooltip>
              )}
            </Space>
            <div>
              <Tag color="purple" style={{ marginTop: 4 }}>
                {slotLabel(r.slot)}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: "Điều kiện",
      key: "dk",
      render: (_: unknown, r: ApprovalRule) => conditionSummary(r),
    },
    {
      title: "Kết quả phân công",
      key: "approver",
      render: (_: unknown, r: ApprovalRule) => (
        <Space direction="vertical" size={2}>
          <Space size={4} wrap>
            {r.assignment.targets.map((t, i) => (
              <Tag
                key={i}
                color={
                  t.type === "GROUP"
                    ? "green"
                    : t.type === "USER"
                      ? "blue"
                      : "default"
                }
              >
                {describeTarget(t)}
              </Tag>
            ))}
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Chế độ: {MODE_LABEL[r.assignment.mode]}
          </Text>
        </Space>
      ),
    },
    {
      title: "Bật",
      dataIndex: "enabled",
      width: 64,
      render: (v: boolean, r: ApprovalRule) => (
        <Switch size="small" checked={v} onChange={(c) => toggle(r.id, c)} />
      ),
    },
    {
      title: "",
      key: "act",
      width: 92,
      render: (_: unknown, r: ApprovalRule) => (
        <Space size={2}>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(r)}
          />
          <Popconfirm
            title="Xoá luật này?"
            onConfirm={() => removeRule(r.id)}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Vì sao cần Ma trận phê duyệt khi BPMN đã có User Task?"
        description={
          <span>
            BPMN trả lời <b>“cần phê duyệt ở đâu”</b>, DMN (EPIC09) trả lời <b>“cần loại/cấp
            phê duyệt nào”</b> (sinh <Text code>cap</Text>, <Text code>loaiHoiDong</Text>), còn
            Ma trận phê duyệt trả lời <b>“chính xác ai phê duyệt”</b>. Nhờ vậy khi tổ chức đổi
            (nghỉ việc, uỷ quyền, tách phòng…) chỉ sửa ma trận, <b>không phải sửa &amp; deploy lại
            BPMN</b>. Camunda 8 không có sẵn tính năng này — đây là mock của Approval Matrix Service.
          </span>
        }
      /> */}

      {warnings.length > 0 && (
        <Alert
          type={warnings.some((w) => w.level === "error") ? "error" : "warning"}
          showIcon
          style={{ marginBottom: 16 }}
          message={`Phân tích ma trận: ${warnings.length} cảnh báo (${warnings.filter((w) => w.level === "error").length} lỗi)`}
          description={
            slotWarnings.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                {slotWarnings.map((w, i) => (
                  <li key={i}>{w.message}</li>
                ))}
              </ul>
            ) : (
              <span style={{ fontSize: 12 }}>
                Xem chi tiết ở biểu tượng cảnh báo từng dòng.
              </span>
            )
          }
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card
            size="small"
            title={
              <Space>
                <SolutionOutlined />
                Bảng luật ánh xạ (first-match theo ưu tiên)
              </Space>
            }
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                Thêm luật
              </Button>
            }
          >
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={sortedRules}
              columns={columns}
            />
          </Card>

          <Card
            size="small"
            style={{ marginTop: 16 }}
            title={
              <Space>
                <SwapOutlined />
                Uỷ quyền / Thay thế tạm thời (theo hiệu lực)
              </Space>
            }
          >
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              Uỷ quyền được áp <b>lên trên</b> kết quả resolve — Workflow không
              biết. Ví dụ dưới đang hiệu lực sẽ tự chuyển công việc của người uỷ
              quyền sang người nhận.
            </Paragraph>
            {DELEGATIONS.map((d) => {
              const from = users.find((u) => u.id === d.fromUserId);
              const to = users.find((u) => u.id === d.toUserId);
              return (
                <div key={d.id} style={{ marginBottom: 8 }}>
                  <Space wrap>
                    <Tag color="volcano">{from?.hoTen}</Tag>
                    <SwapOutlined />
                    <Tag color="green">{to?.hoTen}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {d.from} → {d.to} · {d.lyDo}
                    </Text>
                  </Space>
                </div>
              );
            })}
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            size="small"
            title={
              <Space>
                <ThunderboltOutlined />
                Mô phỏng (Simulation)
              </Space>
            }
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div>
                <Text type="secondary">Loại phê duyệt (Need Role từ BPMN)</Text>
                <Select
                  style={{ width: "100%", marginTop: 4 }}
                  value={simSlot}
                  onChange={setSimSlot}
                  options={APPROVAL_SLOTS.filter(
                    (s) => s.trangThai === "active",
                  ).map((s) => ({ value: s.code, label: s.ten }))}
                />
              </div>
              <div>
                <Text type="secondary">Cấp nhiệm vụ (cap) — từ DMN</Text>
                <Select
                  style={{ width: "100%", marginTop: 4 }}
                  value={simCap}
                  onChange={setSimCap}
                  options={[
                    { value: "CS", label: "Cơ sở" },
                    { value: "TD", label: "Tập đoàn" },
                  ]}
                />
              </div>
              {simSlot === "HOI_DONG" && (
                <div>
                  <Text type="secondary">
                    Loại hội đồng (loaiHoiDong) — output DMN
                  </Text>
                  <Select
                    style={{ width: "100%", marginTop: 4 }}
                    value={simLoaiHD}
                    onChange={setSimLoaiHD}
                    options={Object.entries(LOAI_HOI_DONG_LABEL).map(
                      ([v, l]) => ({ value: v, label: l }),
                    )}
                  />
                </div>
              )}
              <div>
                <Text type="secondary">
                  Tổng dự toán (đồng) — business data
                </Text>
                <InputNumber<number>
                  style={{ width: "100%", marginTop: 4 }}
                  min={0}
                  step={1_000_000_000}
                  value={simBudget}
                  onChange={(v) => setSimBudget(v ?? 0)}
                  formatter={(v) => VND.format(Number(v ?? 0))}
                  parser={(s) => Number((s ?? "").replace(/\D/g, ""))}
                />
              </div>

              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                block
                onClick={runSim}
              >
                Xem kết quả
              </Button>

              {result && (
                <>
                  <Divider style={{ margin: "4px 0" }} />
                  <Alert
                    type={result.matchedRule ? "success" : "warning"}
                    showIcon
                    message={
                      result.matchedRule
                        ? `Kết quả:  ${result.mode ? MODE_LABEL[result.mode] : ""}`
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
                        <ul
                          style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}
                        >
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
                      style={{ background: "var(--vht-surface-2)" }}
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
                                  icon={<SwapOutlined />}
                                  style={{ marginTop: 2 }}
                                >
                                  thay {a.delegatedFrom.hoTen}
                                </Tag>
                              )}
                            </div>
                          </Space>
                        ))}
                      </Space>
                    </Card>
                  )}
                  {result.approvers.length === 0 &&
                    result.matchedRule == null && (
                      <Empty
                        description="Không có người phê duyệt"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}

                  {result.evaluatedRules.length > 0 && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Đã xét {result.evaluatedRules.length} luật cùng slot (vì
                        sao chọn/loại):
                      </Text>
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%", marginTop: 6 }}
                      >
                        {result.evaluatedRules.map((e) => (
                          <div
                            key={e.rule.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 8,
                              fontSize: 12,
                              opacity: e.matched ? 1 : 0.6,
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
                    </div>
                  )}
                </>
              )}

              <Paragraph
                type="secondary"
                style={{ fontSize: 12, marginBottom: 0 }}
              >
                Khi backend/Zeebe sẵn sàng, nút này gọi{" "}
                <Text code>POST /approval-matrix/resolve</Text>; Camunda chỉ
                nhận danh sách <Text code>candidateUsers</Text> đã tính. BPMN
                &amp; ma trận giữ nguyên.
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title={editing ? "Sửa luật ánh xạ" : "Thêm luật ánh xạ"}
        open={modalOpen}
        onOk={saveRule}
        onCancel={() => setModalOpen(false)}
        afterOpenChange={(open) => {
          if (open) form.setFieldsValue(formSeed);
        }}
        okText="Lưu"
        cancelText="Huỷ"
        forceRender
        width={1040}
        styles={{
          body: {
            maxHeight: "calc(100vh - 220px)",
            overflowY: "auto",
            paddingTop: 12,
          },
        }}
      >
        <Form
          key={editing?.id ?? "create"}
          form={form}
          layout="vertical"
          preserve={false}
          initialValues={formSeed}
        >
          <Row gutter={[16, 16]} align="top">
            <Col xs={24} lg={15}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Card size="small" title="Thông tin luật">
                  <Form.Item
                    name="ten"
                    label="Tên luật"
                    rules={[{ required: true, message: "Nhập tên luật" }]}
                  >
                    <Input placeholder="VD: Phê duyệt — Tập đoàn, ngân sách > 5 tỷ" />
                  </Form.Item>
                  <Row gutter={12}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="slot"
                        label="Loại phê duyệt"
                        rules={[{ required: true }]}
                      >
                        <Select
                          options={APPROVAL_SLOTS.filter(
                            (s) => s.trangThai === "active",
                          ).map((s) => ({ value: s.code, label: s.ten }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        name="priority"
                        label="Ưu tiên"
                        rules={[{ required: true }]}
                      >
                        <InputNumber style={{ width: "100%" }} min={1} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        name="enabled"
                        label="Kích hoạt"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Số ưu tiên nhỏ hơn sẽ được xét trước theo cơ chế
                    first-match.
                  </Text>
                </Card>

                <Card size="small" title="Điều kiện áp dụng">
                  {condDraft.items.length === 0 && (
                    <Alert
                      type="warning"
                      showIcon
                      style={{ marginBottom: 12 }}
                      message="Rule đang khớp mọi hồ sơ trong loại phê duyệt đã chọn"
                      description="Thêm điều kiện nếu rule này không phải fallback."
                    />
                  )}
                  <Space size={[8, 8]} wrap style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Thêm nhanh:
                    </Text>
                    {CONDITION_PRESETS.map((p) => (
                      <Button
                        key={p.label}
                        size="small"
                        onClick={() => addConditionPreset(p.make)}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </Space>
                  <Form.Item
                    tooltip="Cây điều kiện AND/OR — để trống = khớp mọi hồ sơ. Loại phê duyệt khớp riêng ở phần thông tin luật."
                    style={{ marginBottom: 0 }}
                  >
                    <ConditionBuilder
                      value={condDraft}
                      onChange={setCondDraft}
                    />
                  </Form.Item>
                </Card>

                <Card size="small" title="Action sẽ hiện cho ai">
                  {targetPresets.length > 0 && (
                    <Space size={[8, 8]} wrap style={{ marginBottom: 12 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Thêm nhanh:
                      </Text>
                      {targetPresets.map((p) => (
                        <Button
                          key={p.roleCode}
                          size="small"
                          onClick={() => addTargetPreset(p.roleCode)}
                        >
                          {p.label}
                        </Button>
                      ))}
                    </Space>
                  )}
                  <Form.Item
                    tooltip="Ai/nhóm nào phê duyệt và chế độ phê duyệt. GROUP/USER đang resolve thật; chức danh, hội đồng và biểu thức là placeholder cho backend."
                    style={{ marginBottom: 0 }}
                  >
                    <AssignmentBuilder
                      value={asgDraft}
                      onChange={setAsgDraft}
                      issues={assignmentTargetIssues}
                    />
                  </Form.Item>
                </Card>
              </Space>
            </Col>

            <Col xs={24} lg={9}>
              <Card size="small" title="Bản xem trước">
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Space size={4} wrap>
                    <Tag color="purple">{slotLabel(draftSlot)}</Tag>
                    <Tag>Ưu tiên #{draftPriority}</Tag>
                    <Tag color={draftEnabled ? "green" : "default"}>
                      {draftEnabled ? "Đang bật" : "Đang tắt"}
                    </Tag>
                  </Space>

                  <Paragraph style={{ marginBottom: 0 }}>
                    <Text strong>
                      {String(watchedTen ?? "").trim() || "Luật chưa đặt tên"}
                    </Text>
                  </Paragraph>

                  <Alert
                    type={
                      !draftEnabled
                        ? "warning"
                        : !assignmentHasTarget
                          ? "error"
                          : "success"
                    }
                    showIcon
                    message={
                      <span style={{ fontSize: 13 }}>{actionSummary}</span>
                    }
                  />

                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Điều kiện áp dụng
                    </Text>
                    <Paragraph style={{ marginBottom: 0, fontSize: 13 }}>
                      {conditionPreview}
                    </Paragraph>
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Action sẽ hiện cho ai
                    </Text>
                    <Paragraph style={{ marginBottom: 0, fontSize: 13 }}>
                      {assignmentPreview}
                    </Paragraph>
                    <Space size={4} wrap>
                      <Tag>Chế độ: {MODE_LABEL[asgDraft.mode]}</Tag>
                    </Space>
                    {asgDraft.targets.some((t) => t.type === "GROUP") && (
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, display: "block", marginTop: 4 }}
                      >
                        Runtime sẽ resolve thành candidateUsers theo thành viên
                        nhóm và uỷ quyền hiện hành.
                      </Text>
                    )}
                  </div>

                  <Divider style={{ margin: "4px 0" }} />

                  <Alert
                    type={
                      previewWarnings.some((w) => w.level === "error")
                        ? "error"
                        : previewWarnings.length > 0
                          ? "warning"
                          : "success"
                    }
                    showIcon
                    message={
                      previewWarnings.length > 0
                        ? "Kiểm tra nhanh"
                        : "Rule đã đủ thông tin cơ bản"
                    }
                    description={
                      previewWarnings.length > 0 ? (
                        <ul
                          style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}
                        >
                          {previewWarnings.map((w, i) => (
                            <li
                              key={i}
                              style={{
                                color:
                                  w.level === "error" ? "#cf1322" : undefined,
                              }}
                            >
                              {w.message}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ fontSize: 12 }}>
                          Có thể lưu hoặc tiếp tục tinh chỉnh điều kiện/phân
                          công.
                        </span>
                      )
                    }
                  />

                  {draftShadowedRules.length > 0 && (
                    <Alert
                      type="warning"
                      showIcon
                      message={`Luật này sẽ che khuất ${draftShadowedRules.length} luật ưu tiên thấp hơn cùng slot`}
                      description={
                        <ul
                          style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}
                        >
                          {draftShadowedRules.map((r) => (
                            <li key={r.id}>
                              {r.ten} (ưu tiên #{r.priority})
                            </li>
                          ))}
                        </ul>
                      }
                    />
                  )}

                  <Divider style={{ margin: "4px 0" }} />

                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Thử với hồ sơ mẫu
                    </Text>
                    <Row gutter={8} style={{ marginTop: 4 }}>
                      <Col span={10}>
                        <Select
                          size="small"
                          style={{ width: "100%" }}
                          value={draftSimCap}
                          onChange={setDraftSimCap}
                          options={[
                            { value: "CS", label: "Cơ sở" },
                            { value: "TD", label: "Tập đoàn" },
                          ]}
                        />
                      </Col>
                      <Col span={14}>
                        <InputNumber<number>
                          size="small"
                          style={{ width: "100%" }}
                          min={0}
                          step={1_000_000_000}
                          value={draftSimBudget}
                          onChange={(v) => setDraftSimBudget(v ?? 0)}
                          formatter={(v) => VND.format(Number(v ?? 0))}
                          parser={(s) => Number((s ?? "").replace(/\D/g, ""))}
                        />
                      </Col>
                    </Row>
                    {draftSlot === "HOI_DONG" && (
                      <Select
                        size="small"
                        style={{ width: "100%", marginTop: 8 }}
                        value={draftSimLoaiHD}
                        onChange={setDraftSimLoaiHD}
                        options={Object.entries(LOAI_HOI_DONG_LABEL).map(
                          ([v, l]) => ({ value: v, label: l }),
                        )}
                      />
                    )}
                    <Button
                      size="small"
                      type="dashed"
                      icon={<ThunderboltOutlined />}
                      block
                      style={{ marginTop: 8 }}
                      onClick={runDraftSim}
                    >
                      Chạy thử
                    </Button>

                    {draftSimResult && (
                      <div style={{ marginTop: 8 }}>
                        {draftSimResult.matchedRule?.id === draftRule.id ? (
                          <Alert
                            type="success"
                            showIcon
                            message="Luật này khớp và thắng với hồ sơ mẫu"
                            description={
                              <span style={{ fontSize: 12 }}>
                                {draftSimResult.reason}
                              </span>
                            }
                          />
                        ) : draftSimResult.matchedRule ? (
                          <Alert
                            type="warning"
                            showIcon
                            message={`Luật "${draftSimResult.matchedRule.ten}" (ưu tiên #${draftSimResult.matchedRule.priority}) thắng, không phải luật đang soạn`}
                            description={
                              <span style={{ fontSize: 12 }}>
                                {draftSimResult.reason}
                              </span>
                            }
                          />
                        ) : (
                          <Alert
                            type="warning"
                            showIcon
                            message="Không có luật nào khớp hồ sơ mẫu trong slot này"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Tab "Danh mục Loại phê duyệt" (Slice E, docs/research/approval-slot-catalog-plan.md §4.E) —
// CRUD trên ApprovalSlotCatalogContext (Slice B): mã/tên/mô tả/nhóm quy trình/thứ
// tự/trạng thái + số luật đang tham chiếu. Đây là nơi BA thêm loại phê duyệt mới (vd
// TAI_CHINH_RASOAT thật khi có luồng rà soát tài chính) thay vì sửa code.
// ════════════════════════════════════════════════════════════════════════════
interface SlotFormValues {
  code: string;
  ten: string;
  moTa?: string;
  nhomQuyTrinh?: string[];
  thuTu?: number;
}

function SlotCatalogTab() {
  const { message } = App.useApp();
  const { slots, create, update, setStatus } = useApprovalSlotCatalog();
  const { rules } = useApprovalMatrix();

  const [editing, setEditing] = useState<ApprovalSlot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<SlotFormValues>();

  const sortedSlots = useMemo(
    () => [...slots].sort((a, b) => a.thuTu - b.thuTu),
    [slots],
  );

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ code: "", ten: "", moTa: "", nhomQuyTrinh: [] });
    setModalOpen(true);
  };
  const openEdit = (s: ApprovalSlot) => {
    setEditing(s);
    form.resetFields();
    form.setFieldsValue({
      code: s.code,
      ten: s.ten,
      moTa: s.moTa ?? "",
      nhomQuyTrinh: s.nhomQuyTrinh ?? [],
      thuTu: s.thuTu,
    });
    setModalOpen(true);
  };

  const save = async () => {
    const v = await form.validateFields();
    if (editing) {
      const patch: UpdateApprovalSlotInput = {
        ten: v.ten.trim(),
        moTa: v.moTa?.trim() || undefined,
        nhomQuyTrinh: v.nhomQuyTrinh?.length ? v.nhomQuyTrinh : undefined,
        thuTu: v.thuTu,
      };
      update(editing.code, patch);
      setModalOpen(false);
      message.success("Đã cập nhật slot.");
      return;
    }
    const input: CreateApprovalSlotInput = {
      code: v.code,
      ten: v.ten.trim(),
      moTa: v.moTa?.trim() || undefined,
      nhomQuyTrinh: v.nhomQuyTrinh?.length ? v.nhomQuyTrinh : undefined,
    };
    const result = create(input);
    if (!result.ok) {
      message.error(result.errors.join(" "));
      return;
    }
    setModalOpen(false);
    message.success("Đã thêm slot mới.");
  };

  const toggleStatus = (s: ApprovalSlot, checked: boolean) => {
    const usage = usageForSlot(s.code, rules);
    const apply = () => {
      setStatus(s.code, checked ? "active" : "inactive");
      message.success(
        checked
          ? `Đã kích hoạt lại "${s.code}".`
          : `Đã huỷ kích hoạt "${s.code}".`,
      );
    };
    if (!checked && usage > 0) {
      Modal.confirm({
        title: "Huỷ kích hoạt loại phê duyệt đang được luật tham chiếu?",
        content: `Loại phê duyệt "${s.code}" đang có ${usage} luật ánh xạ tham chiếu. Huỷ kích hoạt sẽ ẩn loại phê duyệt này khỏi các danh sách chọn (luật mới, mô phỏng) nhưng KHÔNG xoá hay tắt các luật hiện có.`,
        okText: "Vẫn huỷ kích hoạt",
        cancelText: "Huỷ bỏ",
        okButtonProps: { danger: true },
        onOk: apply,
      });
      return;
    }
    apply();
  };

  const columns = [
    {
      title: "Loại phê duyệt",
      key: "slot",
      render: (_: unknown, s: ApprovalSlot) => (
        <div>
          <Text strong>{s.ten}</Text>
          <div>
            <Text code style={{ fontSize: 11 }}>
              {s.code}
            </Text>
          </div>
          {s.moTa && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {s.moTa}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Nhóm quy trình",
      key: "nhom",
      width: 200,
      render: (_: unknown, s: ApprovalSlot) =>
        s.nhomQuyTrinh?.length ? (
          <Space size={4} wrap>
            {s.nhomQuyTrinh.map((n) => (
              <Tag key={n}>{n}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Mọi quy trình
          </Text>
        ),
    },
    {
      title: "Thứ tự",
      dataIndex: "thuTu",
      width: 84,
      render: (n: number) => <Tag>{n}</Tag>,
    },
    {
      title: "Luật tham chiếu",
      key: "usage",
      width: 120,
      render: (_: unknown, s: ApprovalSlot) => {
        const n = usageForSlot(s.code, rules);
        return <Tag color={n > 0 ? "blue" : "default"}>{n} luật</Tag>;
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 110,
      render: (_: unknown, s: ApprovalSlot) => (
        <Switch
          size="small"
          checked={s.trangThai === "active"}
          onChange={(checked) => toggleStatus(s, checked)}
        />
      ),
    },
    {
      title: "",
      key: "act",
      width: 56,
      render: (_: unknown, s: ApprovalSlot) => (
        <Button
          size="small"
          type="text"
          icon={<EditOutlined />}
          onClick={() => openEdit(s)}
        />
      ),
    },
  ];

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Danh mục Loại phê duyệt (Need Role)"
        description={
          <span>
            Nguồn duy nhất cho các loại phê duyệt mà BPMN có thể gán qua Need
            Role (Properties Panel) và Ma trận phê duyệt dùng để ánh xạ luật.
            Thêm loại phê duyệt ở đây trước khi gán trên BPMN — tránh gõ tự do
            sinh mã trôi (vd <Text code>XYZ</Text>/<Text code>xyz</Text>).
          </span>
        }
      />
      <Card
        size="small"
        title={
          <Space>
            <AppstoreOutlined />
            Danh sách loại phê duyệt
          </Space>
        }
        extra={
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={openCreate}
          >
            Thêm loại phê duyệt
          </Button>
        }
      >
        <Table
          size="small"
          rowKey="code"
          pagination={false}
          dataSource={sortedSlots}
          columns={columns}
        />
      </Card>

      <Modal
        title={
          editing
            ? `Sửa loại phê duyệt "${editing.code}"`
            : "Thêm loại phê duyệt mới"
        }
        open={modalOpen}
        onOk={save}
        onCancel={() => setModalOpen(false)}
        okText="Lưu"
        cancelText="Huỷ"
        forceRender
        width={520}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="code"
            label="Mã loại phê duyệt"
            tooltip="Chuẩn hoá tự động về UPPER_SNAKE khi lưu (vd 'rà soát' → 'RA_SOAT')."
            rules={[{ required: true, message: "Nhập mã loại phê duyệt" }]}
          >
            <Input placeholder="VD: TAI_CHINH_RASOAT" disabled={!!editing} />
          </Form.Item>
          <Form.Item
            name="ten"
            label="Tên hiển thị"
            rules={[{ required: true, message: "Nhập tên hiển thị" }]}
          >
            <Input placeholder="VD: Rà soát tài chính" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả nghiệp vụ">
            <Input.TextArea
              rows={2}
              placeholder="Loại phê duyệt này dùng cho bước nào, khi nào?"
            />
          </Form.Item>
          <Form.Item
            name="nhomQuyTrinh"
            label="Nhóm quy trình áp dụng"
            tooltip="Để trống = áp dụng mọi quy trình."
          >
            <Select mode="tags" placeholder="VD: RD01, RD02" options={[]} />
          </Form.Item>
          {editing && (
            <Form.Item name="thuTu" label="Thứ tự hiển thị">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}

/**
 * EPIC06 — Ma trận phê duyệt (Approval Matrix). Prototype mock: 2 tab — "Ma trận"
 * (luật ánh xạ slot + điều kiện → người phê duyệt, xem MatrixTab) và "Danh mục
 * Loại phê duyệt" (catalog quản lý các loại phê duyệt khả dụng, Slice E — xem SlotCatalogTab). Xem
 * docs/research/approval-slot-catalog-plan.md.
 */
export default function ApprovalMatrix() {
  const items = [
    {
      key: "matrix",
      label: (
        <Space>
          <SolutionOutlined />
          Ma trận
        </Space>
      ),
      children: <MatrixTab />,
    },
    {
      key: "catalog",
      label: (
        <Space>
          <AppstoreOutlined />
          Danh mục Loại phê duyệt
        </Space>
      ),
      children: <SlotCatalogTab />,
    },
  ];

  return (
    <div>
      <PageHeader
        icon={
          <ClusterOutlined style={{ fontSize: 24, color: "var(--vht-red)" }} />
        }
        title="Ma trận phê duyệt"
        breadcrumb={[
          { label: "Hệ thống QTKHCN" },
          { label: "Ma trận phê duyệt" },
        ]}
        extra={<HelpButton section="matran" />}
      />
      <Tabs items={items} />
    </div>
  );
}
