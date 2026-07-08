import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Collapse,
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
  ApiOutlined,
  AppstoreOutlined,
  ControlOutlined,
  CopyOutlined,
  DeleteOutlined,
  DiffOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  PartitionOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import HelpButton from "../components/HelpButton";
import SimulatorPreview from "../components/SimulatorPreview";
import SimulatorPresets from "../components/SimulatorPresets";
import SimulatorCompare, {
  RegressionRunner,
} from "../components/SimulatorCompare";
import ActionExplainDrawer from "../components/ActionExplainDrawer";
import FormRenderer from "../components/FormRenderer";
import { PageHeader } from "../components/ui";
import { ROLES, roleLabel } from "../data/roles";
import {
  ACTION_REGISTRY,
  EXCEPTION_ACTION_CODE,
  type ActionDefinition,
  type ActionType,
} from "../data/actionRegistry";
import {
  ACTION_AVAILABILITY_POLICIES,
  DOSSIER_STATUS_LABEL,
  PERMISSIONS,
  PERMISSION_LABEL,
  type ActionAvailabilityPolicy,
} from "../data/actionAvailabilityPolicy";
import {
  EXCEPTION_POLICIES,
  type ExceptionActionPolicy,
  type ExceptionObjectType,
  type ExceptionTargetType,
} from "../data/exceptionPolicy";
import { EXCEPTION_TYPE_LABEL, type ExceptionType } from "../data/exceptions";
import {
  getAvailableActions,
  getDebugActions,
  type AvailableAction,
  type DebugAction,
} from "../data/actionAvailability";
import {
  ACTION_PRESENTATIONS,
  ACTION_SURFACE_LABEL,
  ACTION_SURFACES,
  ACTION_TONE_LABEL,
  ACTION_UI_GROUP_LABEL,
  type ActionPresentation,
  type ActionSurface,
  type ActionTone,
  type ActionUiGroup,
} from "../data/actionPresentation";
import type { DossierStatus } from "../data/dossiers";
import { seedNhiemVu, type Cap } from "../data/nhiemVu";
import type { SimulatorPreset } from "../data/simulatorPresets";
import { seedProcesses } from "../data/processes";
import { useForms } from "../store/FormContext";
import { ROUTING_TABLES, resolveRouting } from "../data/stepRouting";
import StepRoutingDiagram, {
  type DiagramStep,
} from "../components/StepRoutingDiagram";
import {
  reconcilableProcesses,
  reconcileProcess,
  scaffoldPoliciesFromBpmn,
  summarizeReconcileHealth,
  type OutcomeCoverage,
  type ReconcileStatus,
  type TaskReconcile,
} from "../data/bpmnReconcile";

const { Text, Paragraph } = Typography;

const TAB_FLOW = [
  {
    key: "reconcile",
    title: "1. Lấy bước từ quy trình",
    description:
      "Bấm đồng bộ để hệ thống đọc các bước xử lý và nhánh kết quả từ BPMN, tránh thiếu nút ở một bước.",
  },
  {
    key: "routing",
    title: "2. Xem đường đi của hồ sơ",
    description:
      "Kiểm tra mỗi lựa chọn như Đồng ý, Trả lại, Từ chối sẽ đưa hồ sơ tới đâu.",
  },
  {
    key: "availability",
    title: "3. Quy định ai được thấy nút",
    description:
      "Gắn nút với quy trình, trạng thái hồ sơ, vai trò, quyền và biểu mẫu cần điền.",
  },
  {
    key: "exception",
    title: "4. Kiểm soát xử lý ngoại lệ",
    description:
      "Quy định trường hợp nào được xin đi khác luồng chuẩn, ai duyệt, có cần căn cứ hay không.",
  },
  {
    key: "inspector",
    title: "5. Thử như người dùng thật",
    description:
      "Chọn vai trò và trạng thái hồ sơ để xem màn chi tiết hồ sơ sẽ hiện những nút nào.",
  },
];

function FlowOverviewTab() {
  return (
    <>
      {/* <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Màn hình chức năng này dùng để trả lời một câu hỏi đơn giản: ở từng bước hồ sơ, người dùng được bấm nút nào?"
        description={
          <span>
            Người dùng nghiệp vụ không cần bắt đầu từ các bảng kỹ thuật. Hãy đi theo luồng dưới đây:
            lấy bước từ quy trình, xem đường đi, quy định người được bấm, rồi thử lại bằng mô phỏng.
          </span>
        }
      /> */}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card
            size="small"
            title={
              <Space>
                <ControlOutlined />
                Luồng cấu hình khuyến nghị
              </Space>
            }
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {TAB_FLOW.map((step) => (
                <div
                  key={step.key}
                  style={{
                    padding: 12,
                    border: "1px solid var(--vht-border)",
                    borderRadius: 8,
                    background: "var(--vht-surface-1)",
                  }}
                >
                  <Text strong>{step.title}</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary">{step.description}</Text>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            size="small"
            title={
              <Space>
                <ThunderboltOutlined />
                Các phần trên màn nên hiểu như thế nào?
              </Space>
            }
          >
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <Alert
                type="success"
                showIcon
                message="Luật hiển thị nút"
                description="Nơi cấu hình chính cho nghiệp vụ: nút nào hiện ở quy trình nào, trạng thái nào, cho vai trò nào, và có mở biểu mẫu nào."
              />
              <Alert
                type="warning"
                showIcon
                message="Ngoại lệ"
                description="Nơi cấu hình các luồng hành động ngoại lệ, đi khác luồng chuẩn. Nút xin ngoại lệ hiện ở đâu, ai duyệt, có cần căn cứ hay không."
              />
              <Alert
                type="info"
                showIcon
                message="Mô phỏng"
                description="Sau mỗi lần chỉnh, vào đây thử ngay bằng một vai trò cụ thể để biết người dùng cuối sẽ thấy gì."
              />
              {/* <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Các tab “Danh mục nút” và “Luồng xử lý” phục vụ người cấu hình nâng cao. Khi demo cho người
                ít kỹ thuật, nên bắt đầu từ tab này rồi đi thẳng tới “Đồng bộ BPMN” và “Mô phỏng”.
              </Paragraph> */}
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
}
// ── Nhãn & màu cho 3 loại action ────────────────────────────────────────────
const TYPE_META: Record<
  ActionType,
  { label: string; color: string; hint: string }
> = {
  STANDARD: {
    label: "Chuẩn (Standard)",
    color: "blue",
    hint: "Đi theo BPMN — Camunda Active User Task + Permission",
  },
  SUPPORT: {
    label: "Hỗ trợ (Support)",
    color: "default",
    hint: "Không đổi luồng chính — Permission + Dossier Status + Document Policy",
  },
  EXCEPTION: {
    label: "Ngoại lệ (Exception)",
    color: "volcano",
    hint: "Đổi đường đi chuẩn — Exception Policy + duyệt riêng",
  },
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);
const BUSINESS_OBJECT_LABEL: Record<ExceptionObjectType, string> = {
  DOSSIER: "Hồ sơ",
  MISSION: "Nhiệm vụ",
  PROPOSAL: "Đề xuất",
};
const EXCEPTION_TARGET_LABEL: Record<ExceptionTargetType, string> = {
  STEP: "Chuyển tới bước BPMN",
  STATUS: "Đổi trạng thái đối tượng",
  COMPLETE: "Kết thúc xử lý",
};
const PROCESS_OPTIONS = seedProcesses.map((p) => ({
  value: p.ma,
  label: `${p.ma} · ${p.ten}`,
}));

const ACTION_CODE_TO_EXCEPTION_TYPE = Object.fromEntries(
  (Object.entries(EXCEPTION_ACTION_CODE) as [ExceptionType, string][]).map(
    ([type, code]) => [code, type],
  ),
) as Record<string, ExceptionType>;
const EXCEPTION_ACTION_OPTIONS = ACTION_PRESENTATIONS.filter(
  (p) => ACTION_REGISTRY[p.actionCode]?.actionType === "EXCEPTION",
).map((p) => ({ value: p.actionCode, label: p.displayLabel }));

function processByCode(processCode?: string | null) {
  return processCode
    ? seedProcesses.find((p) => p.ma === processCode)
    : undefined;
}

function diagramStepsForProcess(processCode?: string | null): DiagramStep[] {
  return (processByCode(processCode)?.taskSteps ?? []).map((ts) => ({
    ten: ts.ten,
    vaiTro: ts.vaiTro,
    vaiTroCodes: ts.vaiTroCodes ?? [],
  }));
}

function stepOptionsForProcess(processCode?: string | null) {
  return (processByCode(processCode)?.taskSteps ?? []).map((ts) => ({
    value: ts.key,
    label: `${ts.key} · ${ts.ten}`,
  }));
}

function stepLabel(processCode?: string | null, stepKey?: string | null) {
  if (!stepKey) return null;
  const step = processByCode(processCode)?.taskSteps?.find(
    (ts) => ts.key === stepKey,
  );
  return step ? `${step.key} · ${step.ten}` : stepKey;
}

function stepIndexForProcess(
  processCode?: string | null,
  stepKey?: string | null,
) {
  if (!processCode || !stepKey) return null;
  const index =
    processByCode(processCode)?.taskSteps?.findIndex(
      (ts) => ts.key === stepKey,
    ) ?? -1;
  return index >= 0 ? index : null;
}

function exceptionTargetText(
  processCode?: string | null,
  targetType?: ExceptionTargetType,
  targetTaskKey?: string | null,
  targetStatus?: DossierStatus | null,
) {
  if (targetType === "STATUS")
    return targetStatus
      ? `Đổi trạng thái: ${DOSSIER_STATUS_LABEL[targetStatus]}`
      : "Chưa chọn trạng thái đích";
  if (targetType === "COMPLETE") return "Kết thúc xử lý ngoại lệ";
  return targetTaskKey
    ? `Chuyển tới: ${stepLabel(processCode, targetTaskKey)}`
    : "Chưa chọn bước đích";
}

function validateExceptionPolicyDraft(v: Partial<ExceptionFormValues>) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const approverCodes = v.requiredApproverRoleCodes ?? [];
  const sourceIndex = stepIndexForProcess(v.processCode, v.sourceTaskKey);
  const targetIndex = stepIndexForProcess(v.processCode, v.targetTaskKey);

  if (v.enabled && approverCodes.length === 0) {
    errors.push("Luật đang bật phải có ít nhất một vai trò duyệt ngoại lệ.");
  }

  if (v.targetType === "STEP") {
    if (!v.processCode) {
      errors.push("Đích đến là bước BPMN thì phải chọn quy trình cụ thể.");
    }
    if (!v.targetTaskKey) {
      errors.push("Đích đến là bước BPMN thì phải chọn bước đích.");
    }
  }

  if (v.processCode && v.sourceTaskKey && sourceIndex == null) {
    errors.push("Bước phát sinh không còn thuộc quy trình đang chọn.");
  }

  if (
    v.targetType === "STEP" &&
    v.processCode &&
    v.targetTaskKey &&
    targetIndex == null
  ) {
    errors.push("Bước đích không còn thuộc quy trình đang chọn.");
  }

  if (
    v.targetType === "STEP" &&
    v.sourceTaskKey &&
    v.targetTaskKey &&
    v.sourceTaskKey === v.targetTaskKey
  ) {
    errors.push("Bước đích không được trùng với bước phát sinh ngoại lệ.");
  }

  if (
    v.targetType === "STEP" &&
    sourceIndex != null &&
    targetIndex != null &&
    targetIndex < sourceIndex
  ) {
    warnings.push(
      "Bước đích đang nằm trước bước phát sinh trong quy trình. Hãy kiểm tra lại nếu đây không phải luồng quay lui có chủ đích.",
    );
  }

  return { errors, warnings };
}

function RoutingPreviewCard({
  processCode,
  taskDefinitionKey,
  actionCode,
  exceptionTarget,
}: {
  processCode?: string | null;
  taskDefinitionKey?: string | null;
  actionCode?: string | null;
  exceptionTarget?: {
    targetType?: ExceptionTargetType;
    targetTaskKey?: string | null;
    targetStatus?: DossierStatus | null;
  };
}) {
  const proc = processByCode(processCode);
  const source = proc?.taskSteps?.find((ts) => ts.key === taskDefinitionKey);
  const steps = diagramStepsForProcess(processCode);
  const routing = source
    ? resolveRouting(proc, steps, source.ten)
    : { branches: [] };
  const def = actionCode ? ACTION_REGISTRY[actionCode] : undefined;
  const selectedBranch = def?.outcome
    ? routing.branches.find((b) => b.outcome === def.outcome)
    : undefined;
  const exceptionLabel = exceptionTarget
    ? exceptionTargetText(
        processCode,
        exceptionTarget.targetType,
        exceptionTarget.targetTaskKey,
        exceptionTarget.targetStatus,
      )
    : null;

  return (
    <Card
      size="small"
      title={
        <Space>
          <PartitionOutlined />
          Xem trước luồng xử lý
        </Space>
      }
    >
      {!proc ? (
        <Empty
          description="Chọn quy trình cụ thể để xem luồng."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : !source ? (
        <Empty
          description="Chọn bước phát sinh để xem nút này nằm ở đâu trong luồng."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Space size={6} wrap>
            <Tag color="geekblue">{proc.ma}</Tag>
            <Tag>{source.key}</Tag>
            {def?.outcome && selectedBranch && (
              <Tag color="blue">
                Nút này đi theo nhánh: {selectedBranch.label}
              </Tag>
            )}
            {def?.outcome && !selectedBranch && (
              <Tag color="orange">
                Chưa có nhánh routing cho outcome {def.outcome}
              </Tag>
            )}
          </Space>
          {exceptionLabel && (
            <Alert
              type="warning"
              showIcon
              message="Đích đến khi ngoại lệ được duyệt"
              description={exceptionLabel}
            />
          )}
          <StepRoutingDiagram
            currentStepTen={source.ten}
            currentStepRole={source.vaiTro}
            branches={routing.branches}
            steps={steps}
            showApprovers={false}
            exceptionBranches={
              exceptionLabel
                ? [
                    {
                      label: "Ngoại lệ được duyệt",
                      targetLabel: exceptionLabel,
                    },
                  ]
                : []
            }
            variant="reference"
          />
        </Space>
      )}
    </Card>
  );
}
function ButtonPreviewCard({
  actionCode,
  visible = true,
  displayOrder,
  roleCodes = [],
}: {
  actionCode?: string | null;
  visible?: boolean;
  displayOrder?: number;
  roleCodes?: string[];
}) {
  const presentation = actionCode
    ? ACTION_PRESENTATIONS.find((p) => p.actionCode === actionCode)
    : undefined;
  const def = actionCode ? ACTION_REGISTRY[actionCode] : undefined;
  const color =
    presentation?.tone === "danger"
      ? "danger"
      : presentation?.tone === "primary"
        ? "primary"
        : "default";

  return (
    <Card
      size="small"
      title={
        <Space>
          <ThunderboltOutlined />
          Preview hiển thị nút
        </Space>
      }
    >
      {!presentation || !def ? (
        <Empty
          description="Chọn action để xem preview."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div
            style={{
              padding: 12,
              border: "1px solid var(--vht-border)",
              borderRadius: 8,
              background: "var(--vht-surface-1)",
            }}
          >
            <Space wrap>
              <Button
                danger={color === "danger"}
                type={color === "primary" ? "primary" : "default"}
                disabled={!visible}
              >
                {presentation.displayLabel}
              </Button>
              {!visible && <Tag>Đang tắt</Tag>}
              <Tag color={TYPE_META[def.actionType].color}>
                {TYPE_META[def.actionType].label}
              </Tag>
            </Space>
            {presentation.tooltip && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Tooltip: {presentation.tooltip}</Text>
              </div>
            )}
          </div>
          <Space size={4} wrap>
            <Tag color="geekblue">Action code: {actionCode}</Tag>
            <Tag>{ACTION_UI_GROUP_LABEL[presentation.uiGroup]}</Tag>
            <Tag>{ACTION_TONE_LABEL[presentation.tone]}</Tag>
            {displayOrder ? <Tag>Thứ tự: {displayOrder}</Tag> : null}
          </Space>
          <div>
            <Text type="secondary">
              Vai trò thấy nút:{" "}
              {roleCodes.length
                ? roleCodes.map(roleLabel).join(", ")
                : "mọi vai trò được xử lý bước"}
            </Text>
          </div>
        </Space>
      )}
    </Card>
  );
}

function PolicySummaryCard({
  values,
  errors,
  warnings,
}: {
  values: Partial<ExceptionFormValues>;
  errors: string[];
  warnings: string[];
}) {
  const process = processByCode(values.processCode);
  const actionLabel = values.actionCode
    ? (ACTION_PRESENTATIONS.find((p) => p.actionCode === values.actionCode)
        ?.displayLabel ?? values.actionCode)
    : "nút xin ngoại lệ";
  const sourceLabel =
    stepLabel(values.processCode, values.sourceTaskKey) ?? "bước chưa chọn";
  const targetLabel = exceptionTargetText(
    values.processCode,
    values.targetType,
    values.targetTaskKey,
    values.targetStatus,
  );
  const visibleRoles = values.visibilityRoleCodes?.length
    ? values.visibilityRoleCodes.map(roleLabel).join(", ")
    : "mọi vai trò đang được xử lý bước";
  const approverRoles = values.requiredApproverRoleCodes?.length
    ? values.requiredApproverRoleCodes.map(roleLabel).join(", ")
    : "chưa chọn vai trò duyệt";
  const requiredParts = [
    values.requireReason ? "bắt buộc lý do" : "không bắt buộc lý do",
    values.requireEvidence ? "bắt buộc căn cứ" : "không bắt buộc căn cứ",
    `tối đa ${values.maxTimesPerDossier ?? "—"} lần/hồ sơ`,
  ];

  return (
    <Card
      size="small"
      title={
        <Space>
          <SafetyCertificateOutlined />
          Tóm tắt luật
        </Space>
      }
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {errors.map((msg) => (
          <Alert key={msg} type="error" showIcon message={msg} />
        ))}
        {warnings.map((msg) => (
          <Alert key={msg} type="warning" showIcon message={msg} />
        ))}
        {!errors.length && !warnings.length && (
          <Alert
            type="success"
            showIcon
            message="Cấu hình hiện tại chưa có cảnh báo nghiệp vụ."
          />
        )}
        <Paragraph style={{ marginBottom: 0 }}>
          Khi hồ sơ{" "}
          {process ? (
            <Text strong>{process.ma}</Text>
          ) : (
            <Text type="secondary">ở quy trình chưa chọn</Text>
          )}{" "}
          đang xử lý tại bước <Text strong>{sourceLabel}</Text>, vai trò{" "}
          <Text strong>{visibleRoles}</Text> thấy nút{" "}
          <Text strong>{actionLabel}</Text>.
        </Paragraph>
        <Paragraph style={{ marginBottom: 0 }}>
          Nếu được <Text strong>{approverRoles}</Text> duyệt, hồ sơ sẽ{" "}
          <Text strong>{targetLabel}</Text>.
        </Paragraph>
        <Text type="secondary">{requiredParts.join(", ")}.</Text>
        <Space size={4} wrap>
          <Tag color={values.enabled ? "green" : undefined}>
            {values.enabled ? "Luật đang bật" : "Luật đang tắt"}
          </Tag>
          {values.actionCode ? (
            <Tag color="geekblue">{values.actionCode}</Tag>
          ) : null}
          {values.cap ? <Tag>{values.cap}</Tag> : <Tag>mọi cấp nhiệm vụ</Tag>}
        </Space>
      </Space>
    </Card>
  );
}

function boolTag(v: boolean | undefined, yes = "Có", no = "—") {
  return v ? (
    <Tag color="green">{yes}</Tag>
  ) : (
    <Text type="secondary">{no}</Text>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1 — Action Registry (doc §3.1 / §8 action_definition): danh mục tĩnh.
// ════════════════════════════════════════════════════════════════════════════
// ------------------------------------------------------------------------------
// TAB 1 — Action Registry: gộp logic action và hiển thị action trong cùng 1 grid.
// ------------------------------------------------------------------------------
interface PresentationFormValues {
  displayLabel: string;
  tooltip?: string;
  icon: string;
  uiGroup: ActionUiGroup;
  tone: ActionTone;
  defaultOrder: number;
}

function RegistryTab({
  presentations,
  setPresentations,
}: {
  presentations: ActionPresentation[];
  setPresentations: React.Dispatch<React.SetStateAction<ActionPresentation[]>>;
}) {
  const { message } = App.useApp();
  const [editing, setEditing] = useState<ActionPresentation | null>(null);
  const [open, setOpen] = useState(false);
  const [activeFormValues, setActiveFormValues] =
    useState<PresentationFormValues | null>(null);
  const [form] = Form.useForm<PresentationFormValues>();

  const presentationByCode = useMemo(
    () => new Map(presentations.map((p) => [p.actionCode, p] as const)),
    [presentations],
  );

  const rows = useMemo(
    () =>
      Object.values(ACTION_REGISTRY).map((def) => ({
        def,
        presentation: presentationByCode.get(def.actionCode),
      })),
    [presentationByCode],
  );

  const openEdit = (actionCode: string) => {
    const current =
      presentationByCode.get(actionCode) ??
      ({
        actionCode,
        displayLabel: ACTION_REGISTRY[actionCode]?.actionName ?? actionCode,
        tooltip: undefined,
        icon: "control",
        uiGroup: "MORE",
        tone: "default",
        defaultOrder: 999,
      } as ActionPresentation);

    setEditing(current);
    setActiveFormValues({
      displayLabel: current.displayLabel,
      tooltip: current.tooltip,
      icon: current.icon,
      uiGroup: current.uiGroup,
      tone: current.tone,
      defaultOrder: current.defaultOrder,
    });
    form.resetFields();
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setActiveFormValues(null);
    form.resetFields();
  };

  const syncMountedFormValues = (isOpen: boolean) => {
    if (!isOpen || !activeFormValues) return;
    form.resetFields();
    form.setFieldsValue(activeFormValues);
  };

  const save = async () => {
    if (!editing) return;
    const v = await form.validateFields();
    setPresentations((prev) =>
      prev.map((p) =>
        p.actionCode === editing.actionCode
          ? {
              ...p,
              displayLabel: v.displayLabel.trim(),
              tooltip: v.tooltip?.trim() || undefined,
              icon: v.icon.trim() || "control",
              uiGroup: v.uiGroup,
              tone: v.tone,
              defaultOrder: v.defaultOrder,
            }
          : p,
      ),
    );
    closeModal();
    message.success("Đã cập nhật hiển thị action.");
  };

  const sorted = useMemo(() => {
    const typeOrder: ActionType[] = ["STANDARD", "SUPPORT", "EXCEPTION"];
    return [...rows].sort((a, b) => {
      const typeDiff =
        typeOrder.indexOf(a.def.actionType) -
        typeOrder.indexOf(b.def.actionType);
      if (typeDiff !== 0) return typeDiff;
      const orderA = a.presentation?.defaultOrder ?? 999;
      const orderB = b.presentation?.defaultOrder ?? 999;
      return (
        orderA - orderB || a.def.actionCode.localeCompare(b.def.actionCode)
      );
    });
  }, [rows]);

  const columns = [
    {
      title: "Mã hành động",
      dataIndex: ["def", "actionCode"],
      width: 130,
      render: (c: string) => <Text code>{c}</Text>,
    },
    {
      title: "Tên hành động",
      key: "registry",
      width: 260,
      render: (_: unknown, row: { def: ActionDefinition }) => (
        <div>
          <Text strong>{row.def.actionName}</Text>
          <div>
            <Tag
              color={TYPE_META[row.def.actionType].color}
              style={{ marginTop: 4 }}
            >
              {TYPE_META[row.def.actionType].label}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Tên hiển thị",
      key: "presentation",
      render: (
        _: unknown,
        row: { def: ActionDefinition; presentation?: ActionPresentation },
      ) => {
        const p = row.presentation;
        return p ? (
          <Space direction="vertical" size={2}>
            <Text strong>{p.displayLabel}</Text>
            <Space size={4} wrap>
              <Tag
                color={
                  p.uiGroup === "EXCEPTION"
                    ? "volcano"
                    : p.uiGroup === "PRIMARY"
                      ? "blue"
                      : "default"
                }
              >
                {ACTION_UI_GROUP_LABEL[p.uiGroup]}
              </Tag>
              <Tag>{ACTION_TONE_LABEL[p.tone]}</Tag>
              <Tag>{p.icon}</Tag>
            </Space>
            {p.tooltip ? (
              <Text type="secondary">{p.tooltip}</Text>
            ) : (
              <Text type="secondary">—</Text>
            )}
          </Space>
        ) : (
          <Text type="secondary">Chưa cấu hình</Text>
        );
      },
    },
    {
      title: "Thứ tự",
      key: "order",
      width: 90,
      render: (_: unknown, row: { presentation?: ActionPresentation }) => (
        <Tag>{row.presentation?.defaultOrder ?? "—"}</Tag>
      ),
    },
    {
      title: "Cần lý do",
      dataIndex: ["def", "requiresReason"],
      width: 96,
      render: (v: boolean) => boolTag(v),
    },
    {
      title: "Cần căn cứ",
      dataIndex: ["def", "requiresEvidence"],
      width: 96,
      render: (v: boolean) => boolTag(v),
    },
    {
      title: "Xác nhận",
      dataIndex: ["def", "requiresConfirm"],
      width: 96,
      render: (v: boolean) => boolTag(v),
    },
    {
      title: "Kích hoạt",
      dataIndex: ["def", "active"],
      width: 96,
      render: (v: boolean) =>
        v ? <Tag color="green">active</Tag> : <Tag>off</Tag>,
    },
    {
      title: "",
      key: "act",
      width: 48,
      render: (_: unknown, row: { def: ActionDefinition }) => (
        <Button
          size="small"
          type="text"
          icon={<EditOutlined />}
          onClick={() => openEdit(row.def.actionCode)}
        />
      ),
    },
  ];

  return (
    <>
      {/* <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Action Registry — gộp cấu hình logic và hiển thị trong cùng một data grid"
        description={
          <span>
            User <b>không tự tạo action logic mới</b>; action code vẫn do hệ thống định nghĩa sẵn. Ngay tại đây
            admin vừa xem được phần nghiệp vụ, vừa chỉnh được nhãn hiển thị, icon, nhóm UI và thứ tự xuất hiện.
          </span>
        }
      /> */}

      <Card
        size="small"
        // title={
        //   <Space>
        //     <AppstoreOutlined />
        //     Data Grid Action Registry
        //   </Space>
        // }
      >
        <Table
          size="small"
          rowKey={(row) => row.def.actionCode}
          pagination={false}
          dataSource={sorted}
          columns={columns}
        />
      </Card>

      <Modal
        title={
          editing ? "Sửa hiển thị " + editing.actionCode : "Sửa hiển thị action"
        }
        open={open}
        onOk={save}
        onCancel={closeModal}
        afterOpenChange={syncMountedFormValues}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="displayLabel"
            label="Tên hiển thị"
            rules={[{ required: true, whitespace: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="tooltip" label="Tooltip / mô tả ngắn">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="uiGroup"
                label="Nhóm UI"
                rules={[{ required: true }]}
              >
                <Select
                  options={(
                    Object.keys(ACTION_UI_GROUP_LABEL) as ActionUiGroup[]
                  ).map((g) => ({
                    value: g,
                    label: ACTION_UI_GROUP_LABEL[g],
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tone" label="Tone" rules={[{ required: true }]}>
                <Select
                  options={(Object.keys(ACTION_TONE_LABEL) as ActionTone[]).map(
                    (t) => ({
                      value: t,
                      label: ACTION_TONE_LABEL[t],
                    }),
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="icon"
                label="Icon key"
                rules={[{ required: true, whitespace: true }]}
              >
                <Input placeholder="send, form, comment..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="defaultOrder"
                label="Thứ tự mặc định"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
// TAB 3 — Action Availability Policy (doc §8 action_availability_policy).
// ════════════════════════════════════════════════════════════════════════════
interface AvailFormValues {
  actionCode: string;
  surface?: ActionSurface | null;
  processCode?: string | null;
  dossierStatus?: DossierStatus | null;
  taskDefinitionKey?: string | null;
  formKey?: string | null;
  allowedRoleCodes: string[];
  requiredPermissions: string[];
  conditionExpression?: string;
  displayOrder: number;
  enabled: boolean;
}

/** P2 — validate draft Luật hiển thị nút: lỗi chặn lưu + cảnh báo sớm. */
function validateAvailabilityPolicyDraft(v: Partial<AvailFormValues>) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (v.processCode && v.taskDefinitionKey) {
    const taskIndex = stepIndexForProcess(v.processCode, v.taskDefinitionKey);
    if (taskIndex == null) {
      errors.push("Bước BPMN đã chọn không còn thuộc quy trình đang chọn.");
    }
  }

  const isBroad =
    !v.processCode &&
    !v.dossierStatus &&
    !v.taskDefinitionKey &&
    !v.surface &&
    !v.allowedRoleCodes?.length &&
    !v.requiredPermissions?.length;
  if (isBroad) {
    warnings.push(
      "Luật đang áp dụng cho MỌI nơi và MỌI vai trò — hãy chắc đây là luật fallback có chủ đích, không phải bỏ sót điều kiện.",
    );
  }

  return { errors, warnings };
}

/** Preview P1 — tóm tắt Luật hiển thị nút thành 1 câu nghiệp vụ đọc được. */
function AvailabilityPolicySummaryCard({
  values,
  errors = [],
  warnings = [],
  formLabel,
}: {
  values: Partial<AvailFormValues>;
  errors?: string[];
  warnings?: string[];
  formLabel?: string | null;
}) {
  const def = values.actionCode
    ? ACTION_REGISTRY[values.actionCode]
    : undefined;
  const presentation = values.actionCode
    ? ACTION_PRESENTATIONS.find((p) => p.actionCode === values.actionCode)
    : undefined;
  const actionLabel =
    presentation?.displayLabel ?? def?.actionName ?? "nút chưa chọn";
  const process = processByCode(values.processCode);
  const stepText = stepLabel(values.processCode, values.taskDefinitionKey);

  const scopeParts: string[] = [];
  if (process) scopeParts.push(`quy trình ${process.ma}`);
  if (values.dossierStatus)
    scopeParts.push(`trạng thái ${DOSSIER_STATUS_LABEL[values.dossierStatus]}`);
  if (stepText) scopeParts.push(`bước ${stepText}`);
  if (values.surface)
    scopeParts.push(`màn ${ACTION_SURFACE_LABEL[values.surface]}`);
  const scopeText = scopeParts.length ? scopeParts.join(", ") : "mọi nơi";

  const roleText = values.allowedRoleCodes?.length
    ? values.allowedRoleCodes.map(roleLabel).join(", ")
    : "mọi vai trò";
  const permText = values.requiredPermissions?.length
    ? values.requiredPermissions.map((p) => PERMISSION_LABEL[p] ?? p).join(", ")
    : null;

  return (
    <Card
      size="small"
      title={
        <Space>
          <SafetyCertificateOutlined />
          Tóm tắt luật
        </Space>
      }
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {values.enabled === false && (
          <Alert
            type="warning"
            showIcon
            message="Luật đang tắt nên sẽ không hiện nút này trong runtime."
          />
        )}
        {errors.map((msg) => (
          <Alert key={msg} type="error" showIcon message={msg} />
        ))}
        {warnings.map((msg) => (
          <Alert key={msg} type="warning" showIcon message={msg} />
        ))}
        <Paragraph style={{ marginBottom: 0 }}>
          Khi hồ sơ ở <Text strong>{scopeText}</Text>, vai trò{" "}
          <Text strong>{roleText}</Text> sẽ thấy nút{" "}
          <Text strong>{actionLabel}</Text>
          {permText && (
            <>
              {" "}
              (cần quyền <Text strong>{permText}</Text>)
            </>
          )}
          {formLabel && (
            <>
              , mở biểu mẫu <Text strong>{formLabel}</Text>
            </>
          )}
          .
        </Paragraph>
      </Space>
    </Card>
  );
}

function AvailabilityTab({
  policies,
  setPolicies,
  onOpenReconcile,
}: {
  policies: ActionAvailabilityPolicy[];
  setPolicies: React.Dispatch<React.SetStateAction<ActionAvailabilityPolicy[]>>;
  onOpenReconcile: () => void;
}) {
  const { message } = App.useApp();
  const { list: formList } = useForms();
  const [editing, setEditing] = useState<ActionAvailabilityPolicy | null>(null);
  const [open, setOpen] = useState(false);
  const [previewFormKey, setPreviewFormKey] = useState<string | null>(null);
  const [form] = Form.useForm<AvailFormValues>();

  const watchedActionCode = Form.useWatch("actionCode", form);
  const watchedProcessCode = Form.useWatch("processCode", form);
  const watchedTaskKey = Form.useWatch("taskDefinitionKey", form);
  const watchedSurface = Form.useWatch("surface", form);
  const watchedDossierStatus = Form.useWatch("dossierStatus", form);
  const watchedFormKey = Form.useWatch("formKey", form);
  const watchedAllowedRoleCodesRaw = Form.useWatch("allowedRoleCodes", form);
  const watchedRequiredPermissionsRaw = Form.useWatch(
    "requiredPermissions",
    form,
  );
  const watchedDisplayOrder = Form.useWatch("displayOrder", form);
  const watchedEnabled = Form.useWatch("enabled", form);
  const watchedAllowedRoleCodes = watchedAllowedRoleCodesRaw ?? [];
  const watchedRequiredPermissions = watchedRequiredPermissionsRaw ?? [];
  const draftSummaryValues: Partial<AvailFormValues> = {
    actionCode: watchedActionCode,
    surface: watchedSurface,
    processCode: watchedProcessCode,
    dossierStatus: watchedDossierStatus,
    taskDefinitionKey: watchedTaskKey,
    allowedRoleCodes: watchedAllowedRoleCodes,
    requiredPermissions: watchedRequiredPermissions,
    enabled: watchedEnabled,
  };
  const draftValidation = validateAvailabilityPolicyDraft(draftSummaryValues);
  // Đếm theo ActionAvailabilityPolicy.formKey (khác nguồn với "Đang dùng" của
  // Thư viện biểu mẫu, vốn đếm theo BPMN taskStep.formKey) — cần biết trước khi
  // sửa schema 1 form vì nó ảnh hưởng tới MỌI action đang tham chiếu (D10).
  const formUsageCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of policies) {
      if (p.formKey) m.set(p.formKey, (m.get(p.formKey) ?? 0) + 1);
    }
    return m;
  }, [policies]);
  const otherFormUsageCount = watchedFormKey
    ? (formUsageCount.get(watchedFormKey) ?? 0) -
      (editing?.formKey === watchedFormKey ? 1 : 0)
    : 0;

  const actionOptions = Object.values(ACTION_REGISTRY).map((d) => ({
    value: d.actionCode,
    label: `${d.actionName} (${d.actionCode})`,
  }));
  // Biểu mẫu để gắn theo action (từ Thư viện biểu mẫu — 1 eForm : n Action).
  const formOptions = formList.map((f) => ({
    value: f.key,
    label: f.loai ? `${f.ten} · ${f.loai}` : f.ten,
  }));
  const formTen = (key?: string | null) =>
    key ? (formList.find((f) => f.key === key)?.ten ?? key) : null;

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      actionCode: "ADD_COMMENT",
      surface: "DOSSIER_DETAIL",
      processCode: null,
      dossierStatus: null,
      taskDefinitionKey: null,
      formKey: null,
      allowedRoleCodes: [],
      requiredPermissions: [],
      conditionExpression: "",
      displayOrder: 50,
      enabled: true,
    });
    setOpen(true);
  };
  const openEdit = (p: ActionAvailabilityPolicy) => {
    setEditing(p);
    form.setFieldsValue({ ...p });
    setOpen(true);
  };
  const save = async () => {
    const v = await form.validateFields();
    const validation = validateAvailabilityPolicyDraft(v);
    if (validation.errors.length) {
      message.error(validation.errors[0]);
      return;
    }
    const next: ActionAvailabilityPolicy = {
      id: editing?.id ?? `AP-${Date.now().toString().slice(-5)}`,
      actionCode: v.actionCode,
      surface: v.surface ?? null,
      processCode: v.processCode ?? null,
      taskDefinitionKey: v.taskDefinitionKey?.trim() || null,
      dossierStatus: v.dossierStatus ?? null,
      formKey: v.formKey ?? null,
      allowedRoleCodes: v.allowedRoleCodes,
      requiredPermissions: v.requiredPermissions,
      conditionExpression: v.conditionExpression?.trim() || undefined,
      displayOrder: v.displayOrder,
      enabled: v.enabled,
    };
    setPolicies((prev) =>
      editing
        ? prev.map((p) => (p.id === editing.id ? next : p))
        : [...prev, next],
    );
    setOpen(false);
    message.success(
      editing ? "Đã cập nhật luật hiển thị." : "Đã thêm luật hiển thị.",
    );
  };
  const remove = (id: string) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    message.success("Đã xoá luật.");
  };
  const toggle = (id: string, enabled: boolean) =>
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled } : p)),
    );

  const sorted = useMemo(
    () => [...policies].sort((a, b) => a.displayOrder - b.displayOrder),
    [policies],
  );
  const health = useMemo(
    () => summarizeReconcileHealth(seedProcesses, policies),
    [policies],
  );
  const hasBlockingIssues = health.missingStepCount > 0;
  const hasWarnings =
    health.genericCoverageCount > 0 ||
    health.unfilledStepCount > 0 ||
    health.orphanPolicyCount > 0 ||
    health.needRoleWarningCount > 0;

  const columns = [
    {
      title: "Thứ tự",
      dataIndex: "displayOrder",
      width: 76,
      render: (n: number) => <Tag>{n}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      width: 200,
      render: (_: unknown, p: ActionAvailabilityPolicy) => {
        const def = ACTION_REGISTRY[p.actionCode];
        return (
          <div>
            <Text strong>{def?.actionName ?? p.actionCode}</Text>
            <div>
              <Tag
                color={TYPE_META[def?.actionType ?? "STANDARD"].color}
                style={{ marginTop: 4 }}
              >
                {def?.actionType ?? "—"}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: "Điều kiện hiển thị",
      key: "cond",
      render: (_: unknown, p: ActionAvailabilityPolicy) => (
        <Space size={4} wrap>
          <Tag color={p.surface ? "blue" : undefined}>
            Surface: {p.surface ? ACTION_SURFACE_LABEL[p.surface] : "mọi"}
          </Tag>
          <Tag color={p.processCode ? "geekblue" : undefined}>
            QT: {p.processCode ?? "mọi"}
          </Tag>
          <Tag color={p.dossierStatus ? "purple" : undefined}>
            TT:{" "}
            {p.dossierStatus ? DOSSIER_STATUS_LABEL[p.dossierStatus] : "mọi"}
          </Tag>
          {p.allowedRoleCodes.length ? (
            p.allowedRoleCodes.map((c) => (
              <Tag key={c} color="green">
                {c}
              </Tag>
            ))
          ) : (
            <Tag>vai trò: mọi</Tag>
          )}
          {p.conditionExpression && (
            <Tag color="gold">{p.conditionExpression}</Tag>
          )}
          {p.formKey ? (
            <Tag color="cyan">Biểu mẫu: {formTen(p.formKey)}</Tag>
          ) : (
            <Tag>không form</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Quyền yêu cầu",
      key: "perms",
      render: (_: unknown, p: ActionAvailabilityPolicy) =>
        p.requiredPermissions.length ? (
          <Space size={4} wrap>
            {p.requiredPermissions.map((c) => (
              <Tooltip key={c} title={c}>
                <Tag color="cyan">{PERMISSION_LABEL[c] ?? c}</Tag>
              </Tooltip>
            ))}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Bật",
      dataIndex: "enabled",
      width: 60,
      render: (v: boolean, p: ActionAvailabilityPolicy) => (
        <Switch size="small" checked={v} onChange={(c) => toggle(p.id, c)} />
      ),
    },
    {
      title: "",
      key: "act",
      width: 88,
      render: (_: unknown, p: ActionAvailabilityPolicy) => (
        <Space size={2}>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(p)}
          />
          <Popconfirm
            title="Xoá luật này?"
            onConfirm={() => remove(p.id)}
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
    <>
      {/* <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Admin cấu hình “action nào được hiển thị, ở đâu, cho ai” — không sửa & deploy lại BPMN"
        description={
          <span>
            Bảng này chi phối nút nào được hiển thị ở quy trình/bước/vai trò nào. Với action ngoại lệ,
            luật này là phần <b>nút xin ngoại lệ hiện ở đâu</b>; tab Luật ngoại lệ quyết định ai duyệt và sau khi duyệt đi đâu.          </span>
        }
      /> */}
      <Alert
        type={hasBlockingIssues ? "error" : hasWarnings ? "warning" : "success"}
        showIcon
        style={{ marginBottom: 16 }}
        message={
          hasBlockingIssues
            ? "Đối soát BPMN phát hiện bước có nguy cơ bị kẹt vì thiếu nút xử lý"
            : hasWarnings
              ? "Đối soát BPMN còn một số cấu hình nên rà soát"
              : "Đối soát BPMN ổn: các bước đã có luật hiển thị nút phù hợp"
        }
        description={
          <Space size={[8, 8]} wrap>
            <Tag color={health.missingStepCount ? "red" : "green"}>
              Thiếu nút: {health.missingStepCount} bước
            </Tag>
            <Tag color={health.genericCoverageCount ? "gold" : "green"}>
              Wildcard: {health.genericCoverageCount} nhánh
            </Tag>
            <Tag color={health.unfilledStepCount ? "orange" : "green"}>
              Thiếu biểu mẫu: {health.unfilledStepCount} bước
            </Tag>
            <Tag color={health.orphanPolicyCount ? "warning" : "green"}>
              Orphan: {health.orphanPolicyCount} luật
            </Tag>
            <Tag color={health.needRoleWarningCount ? "gold" : "green"}>
              Need Role sai catalog: {health.needRoleWarningCount} bước
            </Tag>
            <Text type="secondary">
              Đang đối soát {health.processCount} quy trình có BPMN/routing.
            </Text>
          </Space>
        }
        action={
          <Button
            size="small"
            icon={<SyncOutlined />}
            onClick={onOpenReconcile}
          >
            Xem đối soát BPMN
          </Button>
        }
      />
      <Card
        size="small"
        title={
          <Space>
            <ControlOutlined />
            Luật hiển thị nút (first-match theo thứ tự)
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
        <Table<ActionAvailabilityPolicy>
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={sorted}
          columns={columns}
        />
      </Card>

      <Modal
        title={editing ? "Sửa Luật hiển thị nút" : "Thêm Luật hiển thị nút"}
        open={open}
        onOk={save}
        onCancel={() => setOpen(false)}
        okText="Lưu"
        cancelText="Huỷ"
        okButtonProps={{ disabled: draftValidation.errors.length > 0 }}
        width={1060}
      >
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <Form form={form} layout="vertical" preserve={false}>
              <Form.Item
                name="actionCode"
                label="Action (từ Registry)"
                rules={[{ required: true }]}
              >
                <Select options={actionOptions} />
              </Form.Item>
              <Form.Item name="surface" label="Business surface">
                <Select
                  allowClear
                  placeholder="Mọi surface"
                  options={ACTION_SURFACES.map((s) => ({
                    value: s,
                    label: ACTION_SURFACE_LABEL[s],
                  }))}
                />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="processCode" label="Điều kiện: Quy trình">
                    <Select
                      allowClear
                      placeholder="Mọi quy trình"
                      options={PROCESS_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dossierStatus"
                    label="Điều kiện: Trạng thái hồ sơ"
                  >
                    <Select
                      allowClear
                      placeholder="Mọi trạng thái"
                      options={(
                        Object.keys(DOSSIER_STATUS_LABEL) as DossierStatus[]
                      ).map((s) => ({
                        value: s,
                        label: DOSSIER_STATUS_LABEL[s],
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="taskDefinitionKey" label="Điều kiện: Bước BPMN">
                <Select
                  allowClear
                  placeholder="Mọi bước"
                  optionFilterProp="label"
                  options={stepOptionsForProcess(watchedProcessCode)}
                />
              </Form.Item>
              <Form.Item
                label="Biểu mẫu gắn theo action (D10 — 1 eForm : n Action)"
                tooltip="Tham chiếu vào Thư viện biểu mẫu, không nhúng schema. Để trống = action không mở form."
              >
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item name="formKey" noStyle>
                    <Select
                      allowClear
                      placeholder="Không gắn biểu mẫu"
                      optionFilterProp="label"
                      style={{ width: "100%" }}
                      options={formOptions}
                    />
                  </Form.Item>
                  <Button
                    icon={<EyeOutlined />}
                    disabled={!watchedFormKey}
                    onClick={() => setPreviewFormKey(watchedFormKey ?? null)}
                  >
                    Xem trước
                  </Button>
                </Space.Compact>
              </Form.Item>
              {watchedFormKey && otherFormUsageCount > 0 && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    display: "block",
                    marginTop: -8,
                    marginBottom: 12,
                  }}
                >
                  Biểu mẫu này đang dùng ở {otherFormUsageCount} action khác —
                  sửa cấu trúc ở Thư viện biểu mẫu sẽ ảnh hưởng tới tất cả.
                </Text>
              )}
              <Form.Item
                name="allowedRoleCodes"
                label="Vai trò được thấy (để trống = mọi vai trò / theo bước)"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn vai trò"
                  optionFilterProp="label"
                  options={ROLES.map((r) => ({
                    value: r.code,
                    label: `${r.ten} (${r.code})`,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="requiredPermissions"
                label="Quyền yêu cầu (required_permissions)"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn quyền"
                  options={ALL_PERMISSIONS.map((p) => ({
                    value: p,
                    label: `${PERMISSION_LABEL[p]} (${p})`,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="conditionExpression"
                label="Điều kiện nghiệp vụ (minh hoạ)"
              >
                <Input placeholder="VD: dossier.docsComplete = true" />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="displayOrder"
                    label="Thứ tự hiển thị"
                    rules={[{ required: true }]}
                  >
                    <InputNumber style={{ width: "100%" }} min={1} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="enabled"
                    label="Kích hoạt"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
          <Col xs={24} lg={10}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <AvailabilityPolicySummaryCard
                values={draftSummaryValues}
                errors={draftValidation.errors}
                warnings={draftValidation.warnings}
                formLabel={formTen(watchedFormKey)}
              />
              <RoutingPreviewCard
                processCode={watchedProcessCode}
                taskDefinitionKey={watchedTaskKey}
                actionCode={watchedActionCode}
              />
              <ButtonPreviewCard
                actionCode={watchedActionCode}
                visible={watchedEnabled}
                displayOrder={watchedDisplayOrder}
                roleCodes={watchedAllowedRoleCodes}
              />
            </Space>
          </Col>
        </Row>
      </Modal>

      <Modal
        open={!!previewFormKey}
        title={`Xem trước biểu mẫu — ${formTen(previewFormKey) ?? ""}`}
        footer={<Button onClick={() => setPreviewFormKey(null)}>Đóng</Button>}
        width={640}
        destroyOnClose
        onCancel={() => setPreviewFormKey(null)}
      >
        {previewFormKey && (
          <FormRenderer
            schema={formList.find((f) => f.key === previewFormKey)?.schema}
          />
        )}
      </Modal>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 3 — Exception Policy (doc §8 exception_action_policy) — view + chỉnh nhanh.
// ════════════════════════════════════════════════════════════════════════════
interface ExceptionFormValues {
  exceptionName: string;
  description?: string;
  actionCode: string;
  exceptionType?: ExceptionType;
  cap?: Cap | null;
  processCode?: string | null;
  objectType: ExceptionObjectType;
  objectStatus?: DossierStatus | null;
  sourceTaskKey?: string | null;
  targetType: ExceptionTargetType;
  targetTaskKey?: string | null;
  targetStatus?: DossierStatus | null;
  visibilityRoleCodes: string[];
  visibilityDisplayOrder: number;
  visibilityEnabled: boolean;
  requiredApproverRoleCodes: string[];
  requireReason: boolean;
  requireEvidence: boolean;
  maxTimesPerDossier: number;
  priority: number;
  enabled: boolean;
}

function ExceptionTab({
  policies,
  setPolicies,
  availPolicies,
  setAvailPolicies,
}: {
  policies: ExceptionActionPolicy[];
  setPolicies: React.Dispatch<React.SetStateAction<ExceptionActionPolicy[]>>;
  availPolicies: ActionAvailabilityPolicy[];
  setAvailPolicies: React.Dispatch<
    React.SetStateAction<ActionAvailabilityPolicy[]>
  >;
}) {
  const { message } = App.useApp();
  const [editing, setEditing] = useState<ExceptionActionPolicy | null>(null);
  const [open, setOpen] = useState(false);
  const [activeFormValues, setActiveFormValues] =
    useState<ExceptionFormValues | null>(null);
  const [formMountKey, setFormMountKey] = useState(0);
  const [form] = Form.useForm<ExceptionFormValues>();

  const watchedExceptionName = Form.useWatch("exceptionName", form);
  const watchedActionCode = Form.useWatch("actionCode", form);
  const watchedProcessCode = Form.useWatch("processCode", form);
  const watchedSourceTaskKey = Form.useWatch("sourceTaskKey", form);
  const watchedTargetType = Form.useWatch("targetType", form);
  const watchedTargetTaskKey = Form.useWatch("targetTaskKey", form);
  const watchedTargetStatus = Form.useWatch("targetStatus", form);
  const watchedVisibilityEnabled = Form.useWatch("visibilityEnabled", form);
  const watchedVisibilityOrder = Form.useWatch("visibilityDisplayOrder", form);
  const watchedVisibilityRoleCodesRaw = Form.useWatch(
    "visibilityRoleCodes",
    form,
  );
  const watchedVisibilityRoleCodes = watchedVisibilityRoleCodesRaw ?? [];
  const watchedCap = Form.useWatch("cap", form);
  const watchedApproverRoleCodesRaw = Form.useWatch(
    "requiredApproverRoleCodes",
    form,
  );
  const watchedRequireReason = Form.useWatch("requireReason", form);
  const watchedRequireEvidence = Form.useWatch("requireEvidence", form);
  const watchedMaxTimesPerDossier = Form.useWatch("maxTimesPerDossier", form);
  const watchedEnabled = Form.useWatch("enabled", form);

  const draftValues: Partial<ExceptionFormValues> = {
    exceptionName: watchedExceptionName ?? activeFormValues?.exceptionName,
    actionCode: watchedActionCode ?? activeFormValues?.actionCode,
    cap: watchedCap ?? activeFormValues?.cap,
    processCode: watchedProcessCode ?? activeFormValues?.processCode,
    sourceTaskKey: watchedSourceTaskKey ?? activeFormValues?.sourceTaskKey,
    targetType: watchedTargetType ?? activeFormValues?.targetType,
    targetTaskKey: watchedTargetTaskKey ?? activeFormValues?.targetTaskKey,
    targetStatus: watchedTargetStatus ?? activeFormValues?.targetStatus,
    visibilityRoleCodes:
      watchedVisibilityRoleCodesRaw ?? activeFormValues?.visibilityRoleCodes,
    requiredApproverRoleCodes:
      watchedApproverRoleCodesRaw ??
      activeFormValues?.requiredApproverRoleCodes,
    requireReason: watchedRequireReason ?? activeFormValues?.requireReason,
    requireEvidence:
      watchedRequireEvidence ?? activeFormValues?.requireEvidence,
    maxTimesPerDossier:
      watchedMaxTimesPerDossier ?? activeFormValues?.maxTimesPerDossier,
    enabled: watchedEnabled ?? activeFormValues?.enabled,
  };
  const draftValidation = validateExceptionPolicyDraft(draftValues);

  const patch = (id: string, p: Partial<ExceptionActionPolicy>) =>
    setPolicies((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const sorted = useMemo(
    () =>
      [...policies].sort(
        (a, b) => a.priority - b.priority || a.id.localeCompare(b.id),
      ),
    [policies],
  );

  const findLinkedAvailability = (p: ExceptionActionPolicy | null) =>
    p?.availabilityPolicyId
      ? availPolicies.find((a) => a.id === p.availabilityPolicyId)
      : undefined;

  const buildCreateFormValues = (): ExceptionFormValues => {
    const processCode = "RD01.01";
    return {
      exceptionName: "Xin bỏ qua Hội đồng KHCN",
      description: "",
      actionCode: EXCEPTION_ACTION_CODE.BypassCouncil,
      exceptionType: "BypassCouncil",
      cap: null,
      processCode,
      objectType: "DOSSIER",
      objectStatus: "processing",
      sourceTaskKey: "t5",
      targetType: "STEP",
      targetTaskKey: "t6",
      targetStatus: null,
      visibilityRoleCodes: [],
      visibilityDisplayOrder: 90,
      visibilityEnabled: true,
      requiredApproverRoleCodes: [],
      requireReason: true,
      requireEvidence: true,
      maxTimesPerDossier: 1,
      priority: 20,
      enabled: true,
    };
  };

  const buildEditFormValues = (
    p: ExceptionActionPolicy,
  ): ExceptionFormValues => {
    const linked = findLinkedAvailability(p);
    return {
      ...p,
      exceptionName: p.exceptionName ?? EXCEPTION_TYPE_LABEL[p.exceptionType],
      description: p.description ?? "",
      actionCode: p.actionCode ?? EXCEPTION_ACTION_CODE[p.exceptionType],
      exceptionType: p.exceptionType,
      cap: p.cap ?? null,
      processCode: p.processCode ?? linked?.processCode ?? null,
      objectType: p.objectType ?? "DOSSIER",
      objectStatus: p.objectStatus ?? linked?.dossierStatus ?? "processing",
      sourceTaskKey: p.sourceTaskKey ?? linked?.taskDefinitionKey ?? null,
      targetType: p.targetType ?? "STEP",
      targetTaskKey: p.targetTaskKey ?? null,
      targetStatus: p.targetStatus ?? null,
      visibilityRoleCodes: linked?.allowedRoleCodes ?? [],
      visibilityDisplayOrder: linked?.displayOrder ?? 90,
      visibilityEnabled: linked?.enabled ?? p.enabled,
      requiredApproverRoleCodes: p.requiredApproverRoleCodes ?? [],
      requireReason: p.requireReason,
      requireEvidence: p.requireEvidence,
      maxTimesPerDossier: p.maxTimesPerDossier,
      priority: p.priority,
      enabled: p.enabled,
    };
  };

  const openCreate = () => {
    setEditing(null);
    setActiveFormValues(buildCreateFormValues());
    setFormMountKey((x) => x + 1);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (p: ExceptionActionPolicy) => {
    setEditing(p);
    setActiveFormValues(buildEditFormValues(p));
    setFormMountKey((x) => x + 1);
    form.resetFields();
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setActiveFormValues(null);
    form.resetFields();
  };

  const syncMountedFormValues = (isOpen: boolean) => {
    if (!isOpen || !activeFormValues) return;
    form.resetFields();
    form.setFieldsValue(activeFormValues);
  };

  const save = async () => {
    const v = await form.validateFields();
    const validation = validateExceptionPolicyDraft(v);
    if (validation.errors.length) {
      message.warning(validation.errors[0]);
      return;
    }

    const cap = v.cap ?? null;
    const processCode = v.processCode ?? null;
    const sourceTaskKey = v.sourceTaskKey ?? null;
    const objectStatus = v.objectStatus ?? null;
    const duplicated = policies.some(
      (p) =>
        p.id !== editing?.id &&
        (p.actionCode ?? EXCEPTION_ACTION_CODE[p.exceptionType]) ===
          v.actionCode &&
        (p.cap ?? null) === cap &&
        (p.processCode ?? null) === processCode &&
        (p.sourceTaskKey ?? null) === sourceTaskKey &&
        (p.objectStatus ?? null) === objectStatus,
    );
    if (duplicated) {
      message.warning(
        "Đã có luật ngoại lệ cho cùng nút, cấp, quy trình, bước và trạng thái này.",
      );
      return;
    }

    const id = editing?.id ?? `EP-${Date.now().toString().slice(-5)}`;
    const actionCode = v.actionCode;
    const exceptionType =
      ACTION_CODE_TO_EXCEPTION_TYPE[actionCode] ??
      editing?.exceptionType ??
      "SkipStep";
    const availabilityPolicyId =
      editing?.availabilityPolicyId ??
      `AP-EX-${Date.now().toString().slice(-5)}`;
    const next: ExceptionActionPolicy = {
      id,
      exceptionName: v.exceptionName.trim(),
      description: v.description?.trim() || undefined,
      actionCode,
      exceptionType,
      cap,
      processCode,
      objectType: v.objectType,
      objectStatus,
      sourceTaskKey,
      targetType: v.targetType,
      targetTaskKey: v.targetType === "STEP" ? (v.targetTaskKey ?? null) : null,
      targetStatus: v.targetType === "STATUS" ? (v.targetStatus ?? null) : null,
      availabilityPolicyId,
      requiredApproverRoleCodes: v.requiredApproverRoleCodes,
      requireReason: v.requireReason,
      requireEvidence: v.requireEvidence,
      maxTimesPerDossier: v.maxTimesPerDossier,
      priority: v.priority,
      enabled: v.enabled,
    };

    const linkedAvailability: ActionAvailabilityPolicy = {
      id: availabilityPolicyId,
      actionCode,
      surface: "DOSSIER_DETAIL",
      processCode,
      taskDefinitionKey: sourceTaskKey,
      dossierStatus: objectStatus,
      formKey: null,
      allowedRoleCodes: v.visibilityRoleCodes,
      requiredPermissions: [PERMISSIONS.REQUEST_EXCEPTION],
      conditionExpression: `exceptionPolicy = ${id}`,
      displayOrder: v.visibilityDisplayOrder,
      enabled: v.enabled && v.visibilityEnabled,
    };

    setPolicies((prev) =>
      editing
        ? prev.map((p) => (p.id === editing.id ? next : p))
        : [...prev, next],
    );
    setAvailPolicies((prev) =>
      prev.some((p) => p.id === availabilityPolicyId)
        ? prev.map((p) =>
            p.id === availabilityPolicyId ? linkedAvailability : p,
          )
        : [...prev, linkedAvailability],
    );
    closeModal();
    message.success(
      editing
        ? "Đã cập nhật luật ngoại lệ và luật hiển thị nút liên quan."
        : "Đã thêm luật ngoại lệ và luật hiển thị nút liên quan.",
    );
  };

  const remove = (p: ExceptionActionPolicy) => {
    setPolicies((prev) => prev.filter((x) => x.id !== p.id));
    if (p.availabilityPolicyId) {
      setAvailPolicies((prev) =>
        prev.filter((a) => a.id !== p.availabilityPolicyId),
      );
    }
    message.success("Đã xoá luật ngoại lệ và luật hiển thị nút liên quan.");
  };

  const columns = [
    {
      title: "Ngoại lệ",
      key: "type",
      width: 250,
      render: (_: unknown, p: ExceptionActionPolicy) => (
        <div>
          <Text strong>
            {p.exceptionName ?? EXCEPTION_TYPE_LABEL[p.exceptionType]}
          </Text>
          <div>
            <Text code style={{ fontSize: 11 }}>
              {p.actionCode ?? EXCEPTION_ACTION_CODE[p.exceptionType]}
            </Text>
          </div>
          {p.description && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {p.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Xảy ra ở đâu",
      key: "scope",
      render: (_: unknown, p: ExceptionActionPolicy) => (
        <Space size={4} wrap>
          <Tag color={p.processCode ? "geekblue" : undefined}>
            {p.processCode ?? "mọi quy trình"}
          </Tag>
          <Tag>{BUSINESS_OBJECT_LABEL[p.objectType ?? "DOSSIER"]}</Tag>
          <Tag color="purple">
            {p.objectStatus
              ? DOSSIER_STATUS_LABEL[p.objectStatus]
              : "mọi trạng thái"}
          </Tag>
          <Tag color={p.sourceTaskKey ? "blue" : undefined}>
            {stepLabel(p.processCode, p.sourceTaskKey) ?? "mọi bước"}
          </Tag>
          {p.cap ? <Tag>{p.cap}</Tag> : <Tag>mọi cấp</Tag>}
        </Space>
      ),
    },
    {
      title: "Đích đến khi duyệt",
      key: "target",
      render: (_: unknown, p: ExceptionActionPolicy) => (
        <Space direction="vertical" size={2}>
          <Tag color="volcano">
            {EXCEPTION_TARGET_LABEL[p.targetType ?? "STEP"]}
          </Tag>
          <Text type="secondary">
            {exceptionTargetText(
              p.processCode,
              p.targetType,
              p.targetTaskKey,
              p.targetStatus,
            )}
          </Text>
        </Space>
      ),
    },
    {
      title: "Người duyệt",
      key: "approver",
      render: (_: unknown, p: ExceptionActionPolicy) => (
        <Space size={4} wrap>
          {p.requiredApproverRoleCodes.length ? (
            p.requiredApproverRoleCodes.map((c) => (
              <Tag key={c} color="green">
                {roleLabel(c)}
              </Tag>
            ))
          ) : (
            <Text type="danger">Chưa chọn người duyệt</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Kiểm soát",
      key: "requirements",
      width: 190,
      render: (_: unknown, p: ExceptionActionPolicy) => (
        <Space size={4} wrap>
          {boolTag(p.requireReason, "Lý do")}
          {boolTag(p.requireEvidence, "Căn cứ")}
          <Tag>Tối đa {p.maxTimesPerDossier} lần/hồ sơ</Tag>
        </Space>
      ),
    },
    {
      title: "Nút hiển thị",
      key: "availability",
      width: 170,
      render: (_: unknown, p: ExceptionActionPolicy) => {
        const linked = findLinkedAvailability(p);
        return linked ? (
          <Space direction="vertical" size={2}>
            <Tag color={linked.enabled ? "green" : undefined}>
              {linked.enabled ? "Đã nối" : "Đang tắt"}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {linked.id}
            </Text>
          </Space>
        ) : (
          <Tag color="orange">Chưa nối</Tag>
        );
      },
    },
    {
      title: "Bật",
      dataIndex: "enabled",
      width: 60,
      render: (v: boolean, p: ExceptionActionPolicy) => (
        <Switch
          size="small"
          checked={v}
          onChange={(c) => patch(p.id, { enabled: c })}
        />
      ),
    },
    {
      title: "",
      key: "act",
      width: 88,
      render: (_: unknown, p: ExceptionActionPolicy) => (
        <Space size={2}>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(p)}
          />
          <Popconfirm
            title="Xoá luật ngoại lệ này?"
            onConfirm={() => remove(p)}
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
    <>
      <Alert
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        style={{ marginBottom: 16 }}
        message="Luật ngoại lệ = nơi phát sinh + nút xin ngoại lệ + kiểm soát duyệt + đích đến sau khi duyệt"
        description={
          <span>
            Khi lưu luật ngoại lệ, hệ thống đồng thời tạo/cập nhật một{" "}
            <b>Luật hiển thị nút</b> cho action ngoại lệ tương ứng.
          </span>
        }
      />
      <Card
        size="small"
        title={
          <Space>
            <SafetyCertificateOutlined />
            Danh sách luật ngoại lệ
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
        <Table<ExceptionActionPolicy>
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={sorted}
          columns={columns}
        />
      </Card>

      <Modal
        title={editing ? "Sửa luật ngoại lệ" : "Thêm luật ngoại lệ"}
        open={open}
        onOk={save}
        onCancel={closeModal}
        afterOpenChange={syncMountedFormValues}
        okText="Lưu"
        cancelText="Huỷ"
        destroyOnHidden
        forceRender
        width={1160}
      >
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <Form
              key={formMountKey}
              form={form}
              layout="vertical"
              preserve={false}
              initialValues={activeFormValues ?? undefined}
            >
              <Divider orientation="left">1. Ngoại lệ xảy ra ở đâu?</Divider>
              <Form.Item
                name="exceptionName"
                label="Tên ngoại lệ"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "Nhập tên ngoại lệ.",
                  },
                ]}
              >
                <Input placeholder="VD: Xin bỏ qua Hội đồng KHCN" />
              </Form.Item>
              <Form.Item name="description" label="Mô tả ngắn">
                <Input.TextArea
                  rows={2}
                  placeholder="Ghi chú nghiệp vụ để người cấu hình hiểu khi nào dùng ngoại lệ này."
                />
              </Form.Item>
              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item
                    name="processCode"
                    label="Quy trình áp dụng"
                    rules={[
                      { required: true, message: "Chọn quy trình áp dụng." },
                    ]}
                  >
                    <Select
                      placeholder="Chọn quy trình"
                      optionFilterProp="label"
                      options={PROCESS_OPTIONS}
                      onChange={() =>
                        form.setFieldsValue({
                          sourceTaskKey: null,
                          targetTaskKey: null,
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item
                    name="objectType"
                    label="Đối tượng"
                    rules={[{ required: true }]}
                  >
                    <Select
                      options={(
                        Object.keys(
                          BUSINESS_OBJECT_LABEL,
                        ) as ExceptionObjectType[]
                      ).map((k) => ({
                        value: k,
                        label: BUSINESS_OBJECT_LABEL[k],
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="objectStatus" label="Trạng thái đối tượng">
                    <Select
                      allowClear
                      placeholder="Mọi trạng thái"
                      options={(
                        Object.keys(DOSSIER_STATUS_LABEL) as DossierStatus[]
                      ).map((s) => ({
                        value: s,
                        label: DOSSIER_STATUS_LABEL[s],
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="sourceTaskKey"
                    label="Bước phát sinh ngoại lệ"
                    rules={[
                      {
                        required: true,
                        message: "Chọn bước phát sinh ngoại lệ.",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn bước BPMN"
                      optionFilterProp="label"
                      options={stepOptionsForProcess(watchedProcessCode)}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">
                2. Nút xin ngoại lệ trên hồ sơ
              </Divider>
              <Form.Item
                name="actionCode"
                label="Chọn nút theo tên hiển thị"
                rules={[{ required: true, message: "Chọn nút xin ngoại lệ." }]}
              >
                <Select
                  placeholder="Chọn nút"
                  optionFilterProp="label"
                  options={EXCEPTION_ACTION_OPTIONS}
                />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="Action code">
                    <Input value={watchedActionCode ?? ""} readOnly />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Tooltip">
                    <Input
                      value={
                        ACTION_PRESENTATIONS.find(
                          (p) => p.actionCode === watchedActionCode,
                        )?.tooltip ?? "—"
                      }
                      readOnly
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item
                    name="visibilityRoleCodes"
                    label="Vai trò được thấy nút"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Để trống = mọi vai trò ở bước"
                      optionFilterProp="label"
                      options={ROLES.map((r) => ({
                        value: r.code,
                        label: `${r.ten} (${r.code})`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item
                    name="visibilityDisplayOrder"
                    label="Thứ tự"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item
                    name="visibilityEnabled"
                    label="Hiện nút"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">
                3. Ai duyệt và cần căn cứ gì?
              </Divider>
              <Form.Item name="cap" label="Cấp nhiệm vụ">
                <Select
                  allowClear
                  placeholder="Mọi cấp"
                  options={[
                    { value: "Cơ sở", label: "Cơ sở" },
                    { value: "Tập đoàn", label: "Tập đoàn" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="requiredApproverRoleCodes"
                label="Vai trò được duyệt ngoại lệ"
                rules={[
                  {
                    required: true,
                    message: "Chọn ít nhất một vai trò duyệt ngoại lệ.",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn vai trò duyệt"
                  optionFilterProp="label"
                  options={ROLES.map((r) => ({
                    value: r.code,
                    label: `${r.ten} (${r.code})`,
                  }))}
                />
              </Form.Item>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item
                    name="requireReason"
                    label="Bắt buộc lý do"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="requireEvidence"
                    label="Bắt buộc căn cứ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="enabled"
                    label="Kích hoạt luật"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="maxTimesPerDossier"
                    label="Tối đa mỗi hồ sơ"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      min={1}
                      max={9}
                      style={{ width: "100%" }}
                      addonAfter="lần"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="priority"
                    label="Độ ưu tiên"
                    tooltip="Số nhỏ được xét trước khi có nhiều luật cùng khớp."
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">
                4. Nếu được duyệt thì đi đâu?
              </Divider>
              <Row gutter={12}>
                <Col span={10}>
                  <Form.Item
                    name="targetType"
                    label="Kiểu đích đến"
                    rules={[{ required: true }]}
                  >
                    <Select
                      options={(
                        Object.keys(
                          EXCEPTION_TARGET_LABEL,
                        ) as ExceptionTargetType[]
                      ).map((k) => ({
                        value: k,
                        label: EXCEPTION_TARGET_LABEL[k],
                      }))}
                      onChange={() =>
                        form.setFieldsValue({
                          targetTaskKey: null,
                          targetStatus: null,
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={14}>
                  {watchedTargetType === "STATUS" ? (
                    <Form.Item
                      name="targetStatus"
                      label="Trạng thái đích"
                      rules={[
                        { required: true, message: "Chọn trạng thái đích." },
                      ]}
                    >
                      <Select
                        options={(
                          Object.keys(DOSSIER_STATUS_LABEL) as DossierStatus[]
                        ).map((s) => ({
                          value: s,
                          label: DOSSIER_STATUS_LABEL[s],
                        }))}
                      />
                    </Form.Item>
                  ) : watchedTargetType === "COMPLETE" ? (
                    <Alert
                      type="success"
                      showIcon
                      message="Ngoại lệ được duyệt sẽ kết thúc xử lý đối tượng."
                    />
                  ) : (
                    <Form.Item
                      name="targetTaskKey"
                      label="Bước BPMN đích"
                      rules={[{ required: true, message: "Chọn bước đích." }]}
                    >
                      <Select
                        placeholder="Chọn bước đích"
                        optionFilterProp="label"
                        options={stepOptionsForProcess(watchedProcessCode)}
                      />
                    </Form.Item>
                  )}
                </Col>
              </Row>
            </Form>
          </Col>
          <Col xs={24} lg={10}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <PolicySummaryCard
                values={draftValues}
                errors={draftValidation.errors}
                warnings={draftValidation.warnings}
              />
              <Alert
                type="info"
                showIcon
                message="Luật hiển thị nút sinh kèm"
                description={`Ngoại lệ: ${watchedExceptionName || "—"} · Action: ${watchedActionCode || "—"} · Quyền: ${PERMISSION_LABEL[PERMISSIONS.REQUEST_EXCEPTION]}`}
              />
              <RoutingPreviewCard
                processCode={watchedProcessCode}
                taskDefinitionKey={watchedSourceTaskKey}
                actionCode={watchedActionCode}
                exceptionTarget={{
                  targetType: watchedTargetType,
                  targetTaskKey: watchedTargetTaskKey,
                  targetStatus: watchedTargetStatus,
                }}
              />
              <ButtonPreviewCard
                actionCode={watchedActionCode}
                visible={watchedVisibilityEnabled}
                displayOrder={watchedVisibilityOrder}
                roleCodes={watchedVisibilityRoleCodes}
              />
            </Space>
          </Col>
        </Row>
      </Modal>
    </>
  );
}
// ════════════════════════════════════════════════════════════════════════════
// TAB 4 — available-actions API inspector (doc §4 + §9): render động từ policy.
// ════════════════════════════════════════════════════════════════════════════
function InspectorTab({
  availPolicies,
  excPolicies,
  presentations,
}: {
  availPolicies: ActionAvailabilityPolicy[];
  excPolicies: ExceptionActionPolicy[];
  presentations: ActionPresentation[];
}) {
  const [surface, setSurface] = useState<ActionSurface>("DOSSIER_DETAIL");
  const [processCode, setProcessCode] = useState<string>("RD01.01");
  const [dossierStatus, setDossierStatus] =
    useState<DossierStatus>("processing");
  const [taskDefinitionKey, setTaskDefinitionKey] = useState<string>();
  const [cap, setCap] = useState<Cap>(seedNhiemVu[0].cap);
  const [roleCodes, setRoleCodes] = useState<string[]>(["CQ_KHCN"]);
  const [perms, setPerms] = useState<string[]>([
    PERMISSIONS.PROCESS_STEP,
    PERMISSIONS.REQUEST_EXCEPTION,
    PERMISSIONS.ADD_COMMENT,
    PERMISSIONS.DOWNLOAD_DOCUMENT,
    PERMISSIONS.VIEW_AUDIT,
  ]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasExceptionTargets, setHasExceptionTargets] = useState(true);
  const [canRequestOnCurrentStep, setCanRequestOnCurrentStep] = useState(true);
  const [hasActiveException, setHasActiveException] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [explainAction, setExplainAction] = useState<DebugAction | null>(null);
  const [comparePreset, setComparePreset] = useState<SimulatorPreset | null>(
    null,
  );

  const effectiveCanRequestException =
    canRequestOnCurrentStep &&
    (isAdmin || perms.includes(PERMISSIONS.REQUEST_EXCEPTION));

  const summary = useMemo(() => {
    const proc = seedProcesses.find((p) => p.ma === processCode);
    const taskStep = taskDefinitionKey
      ? proc?.taskSteps?.find((s) => s.key === taskDefinitionKey)
      : undefined;
    const taskLabel = taskStep
      ? `${taskStep.key} · ${taskStep.ten}`
      : "(không pin bước)";
    const primaryRole =
      roleCodes.length > 0
        ? roleCodes
            .slice(0, 2)
            .map((c) => ROLES.find((r) => r.code === c)?.ten ?? c)
            .join(", ")
        : "(chưa chọn)";
    return {
      processCode,
      statusLabel: DOSSIER_STATUS_LABEL[dossierStatus],
      taskLabel,
      primaryRole,
    };
  }, [processCode, dossierStatus, taskDefinitionKey, roleCodes]);

  const actions = useMemo<AvailableAction[]>(
    () =>
      getAvailableActions({
        policies: availPolicies,
        exceptionPolicies: excPolicies,
        presentations,
        surface,
        processCode,
        dossierStatus,
        taskDefinitionKey,
        userRoleCodes: roleCodes,
        userPermissions: perms,
        isAdmin,
        activeExc: hasActiveException ? true : undefined,
        hasExceptionTargets,
        canRequestExceptionOnCurrentStep: effectiveCanRequestException,
        cap,
        exceptionCountByType: {},
      }),
    [
      availPolicies,
      excPolicies,
      presentations,
      surface,
      processCode,
      dossierStatus,
      taskDefinitionKey,
      roleCodes,
      perms,
      isAdmin,
      hasActiveException,
      hasExceptionTargets,
      effectiveCanRequestException,
      cap,
    ],
  );

  const debugActions = useMemo<DebugAction[] | undefined>(() => {
    if (!debugMode) return undefined;
    return getDebugActions({
      policies: availPolicies,
      exceptionPolicies: excPolicies,
      presentations,
      surface,
      processCode,
      dossierStatus,
      taskDefinitionKey,
      userRoleCodes: roleCodes,
      userPermissions: perms,
      isAdmin,
      activeExc: hasActiveException ? true : undefined,
      hasExceptionTargets,
      canRequestExceptionOnCurrentStep: effectiveCanRequestException,
      cap,
      exceptionCountByType: {},
    });
  }, [
    debugMode,
    availPolicies,
    excPolicies,
    presentations,
    surface,
    processCode,
    dossierStatus,
    taskDefinitionKey,
    roleCodes,
    perms,
    isAdmin,
    hasActiveException,
    hasExceptionTargets,
    effectiveCanRequestException,
    cap,
  ]);

  const currentPreset = useMemo(
    () => ({
      id: "current",
      label: "Hiện tại",
      description: "",
      surface,
      processCode,
      dossierStatus,
      taskDefinitionKey,
      cap,
      roleCodes,
      perms,
      isAdmin,
      hasExceptionTargets,
      canRequestOnCurrentStep,
      hasActiveException,
    }),
    [
      surface,
      processCode,
      dossierStatus,
      taskDefinitionKey,
      cap,
      roleCodes,
      perms,
      isAdmin,
      hasExceptionTargets,
      canRequestOnCurrentStep,
      hasActiveException,
    ],
  );

  const handleApplyPreset = useCallback((preset: SimulatorPreset) => {
    setSurface(preset.surface);
    setProcessCode(preset.processCode);
    setDossierStatus(preset.dossierStatus);
    setTaskDefinitionKey(preset.taskDefinitionKey);
    setCap(preset.cap);
    setRoleCodes(preset.roleCodes);
    setPerms(preset.perms);
    setIsAdmin(preset.isAdmin);
    setHasExceptionTargets(preset.hasExceptionTargets);
    setCanRequestOnCurrentStep(preset.canRequestOnCurrentStep);
    setHasActiveException(preset.hasActiveException);
  }, []);

  // Compare: compute actions for a second context (context B)
  const compareActions = useMemo<AvailableAction[]>(() => {
    if (!comparePreset) return [];
    return getAvailableActions({
      policies: availPolicies,
      exceptionPolicies: excPolicies,
      presentations,
      surface: comparePreset.surface,
      processCode: comparePreset.processCode,
      dossierStatus: comparePreset.dossierStatus,
      taskDefinitionKey: comparePreset.taskDefinitionKey,
      userRoleCodes: comparePreset.roleCodes,
      userPermissions: comparePreset.perms,
      isAdmin: comparePreset.isAdmin,
      activeExc: comparePreset.hasActiveException ? true : undefined,
      hasExceptionTargets: comparePreset.hasExceptionTargets,
      canRequestExceptionOnCurrentStep: comparePreset.canRequestOnCurrentStep,
      cap: comparePreset.cap,
      exceptionCountByType: {},
    });
  }, [comparePreset, availPolicies, excPolicies, presentations]);

  // Regression: run function for RegressionRunner
  const runContextForRegression = useCallback(
    (preset: SimulatorPreset): AvailableAction[] => {
      return getAvailableActions({
        policies: availPolicies,
        exceptionPolicies: excPolicies,
        presentations,
        surface: preset.surface,
        processCode: preset.processCode,
        dossierStatus: preset.dossierStatus,
        taskDefinitionKey: preset.taskDefinitionKey,
        userRoleCodes: preset.roleCodes,
        userPermissions: preset.perms,
        isAdmin: preset.isAdmin,
        activeExc: preset.hasActiveException ? true : undefined,
        hasExceptionTargets: preset.hasExceptionTargets,
        canRequestExceptionOnCurrentStep: preset.canRequestOnCurrentStep,
        cap: preset.cap,
        exceptionCountByType: {},
      });
    },
    [availPolicies, excPolicies, presentations],
  );

  return (
    <>
      <SimulatorPresets
        currentPreset={currentPreset}
        onApplyPreset={handleApplyPreset}
      />
      <Alert
        type="info"
        showIcon
        message={
          <Space>
            <Text strong>Hướng dẫn sử dụng Mô phỏng</Text>
            <Button
              type="link"
              size="small"
              onClick={() => setShowGuide(!showGuide)}
            >
              {showGuide ? "Thu gọn" : "Xem hướng dẫn"}
            </Button>
          </Space>
        }
        description={
          showGuide ? (
            <div style={{ fontSize: 12 }}>
              <div>
                <Text strong>1. Chọn ngữ cảnh hồ sơ</Text>: surface, quy trình,
                trạng thái và bước xử lý.
              </div>
              <div>
                <Text strong>2. Chọn ngữ cảnh người dùng</Text>: vai trò, quyền
                và trạng thái admin.
              </div>
              <div>
                <Text strong>3. Bật/tắt điều kiện ngoại lệ</Text>: quyền xử lý
                bước hiện tại, còn bước phía sau, ngoại lệ đang mở.
              </div>
              <div>
                <Text strong>4. Đọc kết quả bên phải</Text>: action hiển thị
                theo nhóm UI; action mờ là có rule nhưng chưa đủ điều kiện bấm.
              </div>
              <div>
                <Text strong>5. Đối chiếu payload</Text>: tab Payload API hiển
                thị dữ liệu UI nghiệp vụ sẽ nhận từ available-actions.
              </div>
            </div>
          ) : undefined
        }
      />
      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        <Col xs={24} lg={9}>
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Card
              size="small"
              title={
                <Space>
                  <FileTextOutlined />
                  Ngữ cảnh hồ sơ
                </Space>
              }
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div>
                  <Text type="secondary">Business surface</Text>
                  <Select
                    style={{ width: "100%", marginTop: 4 }}
                    value={surface}
                    onChange={setSurface}
                    options={ACTION_SURFACES.map((s) => ({
                      value: s,
                      label: ACTION_SURFACE_LABEL[s],
                    }))}
                  />
                </div>
                <div>
                  <Text type="secondary">Quy trình (processCode)</Text>
                  <Select
                    style={{ width: "100%", marginTop: 4 }}
                    value={processCode}
                    onChange={(v) => {
                      setProcessCode(v);
                      setTaskDefinitionKey(undefined);
                    }}
                    options={PROCESS_OPTIONS}
                  />
                </div>
                <div>
                  <Text type="secondary">Trạng thái hồ sơ (dossierStatus)</Text>
                  <Select
                    style={{ width: "100%", marginTop: 4 }}
                    value={dossierStatus}
                    onChange={setDossierStatus}
                    options={(
                      Object.keys(DOSSIER_STATUS_LABEL) as DossierStatus[]
                    ).map((s) => ({
                      value: s,
                      label: DOSSIER_STATUS_LABEL[s],
                    }))}
                  />
                </div>
                <div>
                  <Text type="secondary">
                    Bước hiện tại (taskDefinitionKey)
                  </Text>
                  <Select
                    allowClear
                    style={{ width: "100%", marginTop: 4 }}
                    value={taskDefinitionKey}
                    placeholder="Chọn bước — để trống = không pin theo bước"
                    onChange={(v) => setTaskDefinitionKey(v || undefined)}
                    options={(
                      seedProcesses.find((p) => p.ma === processCode)
                        ?.taskSteps ?? []
                    ).map((s) => ({
                      value: s.key,
                      label: `${s.key} · ${s.ten}`,
                    }))}
                  />
                </div>
                <div>
                  <Text type="secondary">
                    Cấp nhiệm vụ (cap) — cho Exception Policy
                  </Text>
                  <Select
                    style={{ width: "100%", marginTop: 4 }}
                    value={cap}
                    onChange={setCap}
                    options={[
                      { value: "Cơ sở", label: "Cơ sở" },
                      { value: "Tập đoàn", label: "Tập đoàn" },
                    ]}
                  />
                </div>
              </Space>
            </Card>
            <Card
              size="small"
              title={
                <Space>
                  <UserOutlined />
                  Ngữ cảnh người dùng
                </Space>
              }
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div>
                  <Text type="secondary">Vai trò user (candidateGroups)</Text>
                  <Select
                    mode="multiple"
                    style={{ width: "100%", marginTop: 4 }}
                    value={roleCodes}
                    onChange={setRoleCodes}
                    placeholder="Chọn vai trò"
                    optionFilterProp="label"
                    options={ROLES.map((r) => ({
                      value: r.code,
                      label: `${r.ten} (${r.code})`,
                    }))}
                  />
                </div>
                <div>
                  <Text type="secondary">Quyền user (permissions)</Text>
                  <Select
                    mode="multiple"
                    style={{ width: "100%", marginTop: 4 }}
                    value={perms}
                    onChange={setPerms}
                    options={ALL_PERMISSIONS.map((p) => ({
                      value: p,
                      label: PERMISSION_LABEL[p],
                    }))}
                  />
                </div>
                <Space>
                  <Switch checked={isAdmin} onChange={setIsAdmin} />
                  <Text>Là Quản trị viên (bỏ qua role/permission)</Text>
                </Space>
                <Space>
                  <Switch checked={debugMode} onChange={setDebugMode} />
                  <Text>Chế độ gỡ lỗi (hiện action bị ẩn)</Text>
                </Space>
              </Space>
            </Card>
            <Card
              size="small"
              title={
                <Space>
                  <WarningOutlined />
                  Điều kiện ngoại lệ
                </Space>
              }
            >
              <Space direction="vertical" size={8}>
                <Space>
                  <Switch
                    checked={canRequestOnCurrentStep}
                    onChange={setCanRequestOnCurrentStep}
                  />
                  <Text>User là người xử lý bước hiện tại</Text>
                </Space>
                <Space>
                  <Switch
                    checked={hasExceptionTargets}
                    onChange={setHasExceptionTargets}
                  />
                  <Text>Còn bước phía sau để chuyển ngoại lệ</Text>
                </Space>
                <Space>
                  <Switch
                    checked={hasActiveException}
                    onChange={setHasActiveException}
                  />
                  <Text>Đang có yêu cầu ngoại lệ mở</Text>
                </Space>
              </Space>
            </Card>
            <Paragraph
              type="secondary"
              style={{ fontSize: 12, marginBottom: 0 }}
            >
              Đây là mock của{" "}
              <Text code>GET /dossiers/{"{id}"}/available-actions</Text>: UI chỉ
              render theo kết quả bên phải, <b>không tự quyết định điều kiện</b>
              . Đổi cấu hình ở các tab trước → kết quả đổi ngay.
            </Paragraph>
          </Space>
        </Col>

        <Col xs={24} lg={15}>
          <Card
            size="small"
            title="Kết quả render động (chia nhóm theo doc §9)"
          >
            <div
              style={{
                marginBottom: 12,
                padding: "8px 12px",
                background: "var(--vht-surface-2)",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                Mô phỏng:
              </Text>
              <Tag>{summary.processCode}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                /
              </Text>
              <Tag color="blue">{summary.statusLabel}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                /
              </Text>
              <Tag color="purple">{summary.taskLabel}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                /
              </Text>
              <Tag color="cyan">{summary.primaryRole}</Tag>
            </div>
            {actions.length === 0 && (
              <Empty
                description="Không action nào hiển thị ở ngữ cảnh này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
            {actions.length > 0 && (
              <SimulatorPreview
                actions={actions}
                debugActions={debugActions}
                showExplain={debugMode}
                onExplain={(a) => {
                  const da = debugActions?.find(
                    (d) => d.actionCode === a.actionCode,
                  );
                  if (da) setExplainAction(da);
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* (Đợt 5) So sánh & regression */}
      <Collapse
        style={{ marginTop: 16 }}
        items={[
          {
            key: "compare",
            label: (
              <Space>
                <DiffOutlined />
                So sánh 2 ngữ cảnh
              </Space>
            ),
            children: (
              <div>
                <Space style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Chọn ngữ cảnh B để so sánh với ngữ cảnh hiện tại:
                  </Text>
                  <Button
                    size="small"
                    onClick={() => {
                      setComparePreset({
                        id: "b",
                        label: "B",
                        description: "",
                        surface,
                        processCode,
                        dossierStatus,
                        taskDefinitionKey,
                        cap,
                        roleCodes,
                        perms,
                        isAdmin,
                        hasExceptionTargets,
                        canRequestOnCurrentStep,
                        hasActiveException,
                      });
                    }}
                    icon={<CopyOutlined />}
                  >
                    Sao chép từ A
                  </Button>
                </Space>
                {comparePreset && compareActions.length > 0 ? (
                  <SimulatorCompare
                    actionsA={actions}
                    actionsB={compareActions}
                    labelA="Ngữ cảnh A (hiện tại)"
                    labelB={`Ngữ cảnh B (${comparePreset.processCode}${comparePreset.taskDefinitionKey ? " · " + comparePreset.taskDefinitionKey : ""})`}
                  />
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Bấm "Sao chép từ A" để bắt đầu so sánh, hoặc chọn 1 preset
                    phía trên rồi bấm sao chép.
                  </Text>
                )}
              </div>
            ),
          },
          {
            key: "regression",
            label: (
              <Space>
                <PlayCircleOutlined />
                Chạy hồi quy (Regression)
              </Space>
            ),
            children: <RegressionRunner runContext={runContextForRegression} />,
          },
        ]}
      />

      <ActionExplainDrawer
        action={explainAction}
        open={explainAction !== null}
        onClose={() => setExplainAction(null)}
      />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 5 — Ma trận định tuyến (Routing Matrix) design-time: mỗi bước → nhánh kết quả.
// Tái dùng StepRoutingDiagram (cùng component với Chi tiết hồ sơ) + resolveRouting.
// ════════════════════════════════════════════════════════════════════════════
function RoutingMatrixTab() {
  const processOptions = Object.keys(ROUTING_TABLES);
  const [ma, setMa] = useState(processOptions[0]);
  const proc = seedProcesses.find((p) => p.ma === ma);
  // Bước "tổng hợp" từ taskSteps (design-time, không gắn hồ sơ cụ thể).
  const steps: DiagramStep[] = (proc?.taskSteps ?? []).map((ts) => ({
    ten: ts.ten,
    vaiTro: ts.vaiTro,
    vaiTroCodes: ts.vaiTroCodes ?? [],
  }));
  const table = ROUTING_TABLES[ma] ?? [];

  return (
    <>
      {/* <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Ma trận định tuyến — (bước, kết quả xử lý) → bước đích / điểm kết thúc"
        description={
          <span>
            Cùng một <Text code>resolveRouting</Text> và <Text code>StepRoutingDiagram</Text> mà màn{' '}
            <b>Chi tiết hồ sơ</b> dùng ở runtime — ở đây xem theo <b>loại bước</b> (design-time), không
            gắn hồ sơ cụ thể. Sửa luồng/đích rework tại <Text code>data/stepRouting.ts</Text>.
          </span>
        }
      /> */}
      <Space style={{ marginBottom: 16 }}>
        <Text type="secondary">Quy trình</Text>
        <Select
          style={{ minWidth: 320 }}
          value={ma}
          onChange={setMa}
          options={processOptions.map((code) => {
            const p = seedProcesses.find((x) => x.ma === code);
            return { value: code, label: p ? `${code} · ${p.ten}` : code };
          })}
        />
      </Space>

      {table.length === 0 ? (
        <Empty description="Quy trình chưa có bảng định tuyến." />
      ) : (
        <Row gutter={[16, 16]}>
          {table.map((r) => {
            const ts = proc?.taskSteps?.find((t) => t.key === r.stepKey);
            if (!ts) return null;
            const routing = resolveRouting(proc, steps, ts.ten);
            return (
              <Col xs={24} xl={12} key={r.stepKey}>
                <Card
                  size="small"
                  title={
                    <Space>
                      <PartitionOutlined />
                      {ts.ten}
                    </Space>
                  }
                >
                  <StepRoutingDiagram
                    currentStepTen={ts.ten}
                    currentStepRole={ts.vaiTro}
                    branches={routing.branches}
                    steps={steps}
                    showApprovers={false}
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 6 — Đồng bộ / Đối soát từ BPMN (D10 điểm 5): mỗi user task × nhánh outcome
// → scaffold 1 dòng Availability Policy + coverage check 🔴/🟡/⚪ (fail-closed).
// ════════════════════════════════════════════════════════════════════════════
const RECONCILE_META: Record<
  ReconcileStatus,
  { color: string; label: string; dot: string }
> = {
  ok: { color: "green", label: "Đã ghim đủ", dot: "🟢" },
  generic: { color: "gold", label: "Luật chung", dot: "🟡" },
  unfilled: { color: "orange", label: "Thiếu biểu mẫu", dot: "🟡" },
  missing: { color: "red", label: "Thiếu action", dot: "🔴" },
  skipped: { color: "default", label: "Bỏ qua có chủ đích", dot: "⚪" },
};

function coverageColor(c: OutcomeCoverage): string {
  if (!c.matched) return "red";
  if (!c.formFilled) return "orange";
  if (!c.taskSpecific) return "gold";
  return "green";
}

function ReconcileTab({
  policies,
  setPolicies,
}: {
  policies: ActionAvailabilityPolicy[];
  setPolicies: React.Dispatch<React.SetStateAction<ActionAvailabilityPolicy[]>>;
}) {
  const { message } = App.useApp();
  const { list: formList } = useForms();
  const options = reconcilableProcesses();
  const [ma, setMa] = useState(options[0]);
  // Cờ "bỏ qua có chủ đích" — key theo `${procMa}:${stepKey}` để giữ khi đổi quy trình.
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  const proc = seedProcesses.find((p) => p.ma === ma);
  const skipKey = (stepKey: string) => `${ma}:${stepKey}`;
  const skippedForProc = useMemo(
    () =>
      new Set(
        (proc?.taskSteps ?? [])
          .map((t) => t.key)
          .filter((k) => skipped.has(skipKey(k))),
      ),
    [proc, skipped, ma],
  );

  const recon = useMemo(
    () => (proc ? reconcileProcess(proc, policies, skippedForProc) : null),
    [proc, policies, skippedForProc],
  );

  const formTen = (key?: string | null) =>
    key ? (formList.find((f) => f.key === key)?.ten ?? key) : "—";

  const toggleSkip = (stepKey: string) =>
    setSkipped((prev) => {
      const next = new Set(prev);
      const k = skipKey(stepKey);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const doSync = () => {
    if (!proc) return;
    const res = scaffoldPoliciesFromBpmn(proc, policies, skippedForProc);
    setPolicies(res.next);
    message.success(
      `Đã đồng bộ từ BPMN ${proc.ma}: thêm ${res.added} luật, cập nhật ${res.updated} luật ghim theo bước.`,
    );
  };

  const columns = [
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_: unknown, t: TaskReconcile) => {
        const m = RECONCILE_META[t.status];
        return (
          <Tooltip title={t.reason}>
            <Tag color={m.color} style={{ cursor: "help" }}>
              {m.dot} {m.label}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "User task (BPMN)",
      key: "task",
      render: (_: unknown, t: TaskReconcile) => (
        <div>
          <Text strong>{t.ten}</Text>
          <div style={{ marginTop: 2 }}>
            <Text code style={{ fontSize: 11 }}>
              {t.stepKey}
            </Text>
            {t.vaiTroCodes.map((c) => (
              <Tag key={c} style={{ marginLeft: 4 }}>
                {c}
              </Tag>
            ))}
          </div>
          <div style={{ marginTop: 2 }}>
            {t.needRole ? (
              <Tooltip
                title={
                  t.needRoleWarning ??
                  "Need Role đã re-author qua Properties Panel (Slice C)."
                }
              >
                <Tag
                  color={t.needRoleWarning ? "gold" : "blue"}
                  style={{ cursor: "help" }}
                >
                  {t.needRoleWarning ? "🟡 " : ""}Need Role: {t.needRole}
                </Tag>
              </Tooltip>
            ) : (
              <Tooltip title="Chưa re-author Need Role — đang suy slot từ candidateGroups (ROLE_TO_SLOT).">
                <Tag style={{ cursor: "help" }}>Need Role: chưa gán</Tag>
              </Tooltip>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Nhánh outcome → policy + biểu mẫu",
      key: "outcomes",
      render: (_: unknown, t: TaskReconcile) => (
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          {t.outcomes.map((c) => (
            <Tooltip
              key={c.outcome}
              title={
                c.matched
                  ? `Luật ${c.matched.id}${c.taskSpecific ? " (ghim theo bước)" : " (luật chung — wildcard)"} · biểu mẫu: ${formTen(c.matched.formKey)}`
                  : "Chưa có luật enabled cho nhánh này → nút sẽ không hiện (fail-closed)."
              }
            >
              <Tag color={coverageColor(c)} style={{ cursor: "help" }}>
                {c.outcome} · {c.branchLabel}
                {c.matched
                  ? ` → ${formTen(c.matched.formKey)}`
                  : " → (không có luật)"}
              </Tag>
            </Tooltip>
          ))}
        </Space>
      ),
    },
    {
      title: "Bỏ qua có chủ đích",
      key: "skip",
      width: 130,
      render: (_: unknown, t: TaskReconcile) => (
        <Switch
          size="small"
          checked={t.status === "skipped"}
          onChange={() => toggleSkip(t.stepKey)}
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
        message="Đồng bộ / Đối soát từ BPMN — pull-based, admin bấm (không auto push khi deploy)"
        description={
          <span>
            Từ mỗi <b>user task</b> trong BPMN, sinh MỘT dòng Availability
            Policy cho MỖI <b>nhánh outcome</b> (SUBMIT/APPROVE/RETURN/REJECT),
            rồi đối soát 2 chiều. Vì hệ <b>fail-closed</b> nên đây là kiểm tra{" "}
            <b>đúng-sai</b>: <Tag color="red">🔴 Thiếu action</Tag> = bước bị
            kẹt · <Tag color="gold">🟡 Luật chung / thiếu biểu mẫu</Tag> = nên
            ghim theo bước · <Tag>⚪ Orphan</Tag> = policy trỏ task không còn
            trong BPMN · <Tag color="gold">🟡 Need Role</Tag> = mã Need Role
            trên bước không khớp slot active nào trong Danh mục Slot (EPIC06).
            Bấm <b>Đồng bộ</b> để scaffold/upsert — id tất định nên chạy lại
            không đẻ trùng.
          </span>
        }
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Text type="secondary">Quy trình (có BPMN + bảng định tuyến)</Text>
        <Select
          style={{ minWidth: 320 }}
          value={ma}
          onChange={setMa}
          options={options.map((code) => {
            const p = seedProcesses.find((x) => x.ma === code);
            return { value: code, label: p ? `${code} · ${p.ten}` : code };
          })}
        />
        <Button type="primary" icon={<SyncOutlined />} onClick={doSync}>
          Đồng bộ / Đối soát từ BPMN
        </Button>
      </Space>

      {!recon ? (
        <Empty description="Không tìm thấy quy trình." />
      ) : (
        <>
          <Space style={{ marginBottom: 12 }} wrap size={[8, 8]}>
            {(Object.keys(RECONCILE_META) as ReconcileStatus[]).map((s) =>
              recon.counts[s] ? (
                <Tag key={s} color={RECONCILE_META[s].color}>
                  {RECONCILE_META[s].dot} {RECONCILE_META[s].label}:{" "}
                  {recon.counts[s]}
                </Tag>
              ) : null,
            )}
          </Space>

          <Card
            size="small"
            title={
              <Space>
                <PartitionOutlined />
                Đối soát user task ↔ Availability Policy
              </Space>
            }
          >
            <Table<TaskReconcile>
              size="small"
              rowKey="stepKey"
              pagination={false}
              dataSource={recon.tasks}
              columns={columns}
            />
          </Card>

          {recon.orphans.length > 0 && (
            <Card
              size="small"
              style={{ marginTop: 16 }}
              title={
                <Space>
                  <WarningOutlined />⚪ Policy orphan (task không còn trong
                  BPMN)
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {recon.orphans.map((o) => (
                  <Alert
                    key={o.policy.id}
                    type="warning"
                    showIcon
                    message={
                      <Text code>
                        {o.policy.id} · {o.policy.actionCode}
                      </Text>
                    }
                    description={o.reason}
                  />
                ))}
              </Space>
            </Card>
          )}
        </>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Trang chính — các lớp cấu hình của Action Availability Model.
// ════════════════════════════════════════════════════════════════════════════
/**
 * Action Studio — cấu hình các lớp của Action Availability Model
 * (docs/research/action-availability-model.md §10):
 *   1. System có sẵn Action Registry
 *   2. Admin cấu hình Action Availability Policy
 *   3. Exception Action được kiểm soát bằng Exception Policy
 *   4. UI gọi API available-actions để render động
 * State giữ in-memory (mock) — chỉnh policy ở tab 2/3 chảy ngay vào inspector tab 4.
 */
export default function ActionStudio() {
  const [presentations, setPresentations] =
    useState<ActionPresentation[]>(ACTION_PRESENTATIONS);
  const [availPolicies, setAvailPolicies] = useState<
    ActionAvailabilityPolicy[]
  >(ACTION_AVAILABILITY_POLICIES);
  const [excPolicies, setExcPolicies] =
    useState<ExceptionActionPolicy[]>(EXCEPTION_POLICIES);
  const [activeTab, setActiveTab] = useState("overview");

  const items = [
    {
      key: "overview",
      label: (
        <Space>
          <ControlOutlined />
          Tổng quan luồng
        </Space>
      ),
      children: <FlowOverviewTab />,
    },
    {
      key: "availability",
      label: (
        <Space>
          <ControlOutlined />
          Luật hiển thị nút
        </Space>
      ),
      children: (
        <AvailabilityTab
          policies={availPolicies}
          setPolicies={setAvailPolicies}
          onOpenReconcile={() => setActiveTab("reconcile")}
        />
      ),
    },
    {
      key: "reconcile",
      label: (
        <Space>
          <SyncOutlined />
          Đối soát BPMN
        </Space>
      ),
      children: (
        <ReconcileTab policies={availPolicies} setPolicies={setAvailPolicies} />
      ),
    },
    {
      key: "exception",
      label: (
        <Space>
          <SafetyCertificateOutlined />
          Luồng ngoại lệ
        </Space>
      ),
      children: (
        <ExceptionTab
          policies={excPolicies}
          setPolicies={setExcPolicies}
          availPolicies={availPolicies}
          setAvailPolicies={setAvailPolicies}
        />
      ),
    },
    {
      key: "routing",
      label: (
        <Space>
          <PartitionOutlined />
          Luồng xử lý
        </Space>
      ),
      children: <RoutingMatrixTab />,
    },

    {
      key: "inspector",
      label: (
        <Space>
          <ApiOutlined />
          Mô phỏng
        </Space>
      ),
      children: (
        <InspectorTab
          availPolicies={availPolicies}
          excPolicies={excPolicies}
          presentations={presentations}
        />
      ),
    },
    {
      key: "registry",
      label: (
        <Space>
          <AppstoreOutlined />
          Danh mục nút
        </Space>
      ),
      children: (
        <RegistryTab
          presentations={presentations}
          setPresentations={setPresentations}
        />
      ),
    },
  ];
  return (
    <div>
      <PageHeader
        icon={
          <ControlOutlined style={{ fontSize: 24, color: "var(--vht-red)" }} />
        }
        title="Ma trận Hành động"
        // tag={<Tag color="processing">Action Availability Model</Tag>}
        // code={<Text type="secondary">Đồng bộ quy trình / Luật hiển thị / Ngoại lệ / Mô phỏng</Text>}
        breadcrumb={[
          { label: "Hệ thống QTKHCN" },
          { label: "Ma trận Hành động" },
        ]}
        extra={<HelpButton section="hanhdong" />}
      />
      {/* <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message=""
        description={
          <div style={{ fontSize: 12 }}>
                  <div><Text strong>1. Chọn ngữ cảnh nghiệp vụ</Text>: surface, quy trình, trạng thái hồ sơ và task key cần kiểm thử.</div>
                  <div><Text strong>2. Chọn ngữ cảnh người dùng</Text>: vai trò, quyền và trạng thái admin để mô phỏng người dùng thực tế.</div>
                  <div><Text strong>3. Bật/tắt điều kiện ngoại lệ</Text>: condition các bước phía sau, người dùng đang xử lý bước hiện tại, hồ sơ có ngoại lệ đang mở.</div>
                  <div><Text strong>4. Đọc kết quả bên phải</Text>: action hiển thị theo nhóm UI; action mở là có rule hiển thị nhưng chưa đủ điều kiện bấm.</div>
                  <div><Text strong>5. Đối chiếu payload</Text>: JSON phía dưới là dữ liệu UI nghiệp vụ sẽ nhận từ available-actions.</div>
                </div>
        }
      /> */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </div>
  );
}
