import { useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  App,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  Input,
  List,
  Modal,
  Row,
  Select,
  Space,
  Steps,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CommentOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileZipOutlined,
  FormOutlined,
  HistoryOutlined,
  MoreOutlined,
  PrinterOutlined,
  SendOutlined,
  SolutionOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { LOAI_TO_NHOM, type DossierStep, type StepStatus } from "../data/dossiers";
import { resolveGroups, type ResolvedApprover } from "../data/approvalMatrix";
import {
  EXCEPTION_STATUS_LABEL,
  EXCEPTION_TYPE_LABEL,
  type ExceptionType,
} from "../data/exceptions";
import { getAvailableActions, type AvailableAction } from "../data/actionAvailability";
import { PERMISSIONS } from "../data/actionAvailabilityPolicy";
import {
  EXCEPTION_ACTION_CODE,
  STANDARD_ACTION_CODES,
  SUPPORT_ACTION_CODES,
} from "../data/actionRegistry";
import {
  EXCEPTION_POLICIES,
  exceptionApproverCodesForCap,
  resolveExceptionPolicy,
} from "../data/exceptionPolicy";
import { templatesFor, type DocTemplate } from "../data/docTemplates";
import { useDossiers } from "../store/DossierContext";
import { useExceptions } from "../store/ExceptionContext";
import { useProcesses } from "../store/ProcessContext";
import { useAuth, usePermissions } from "../store/AuthContext";
import TaskFormModal from "../components/TaskFormModal";
import OfficialDocument, {
  printOfficialDoc,
} from "../components/OfficialDocument";
import {
  PageHeader,
  NotFound,
  DossierStatusTag,
  StatusTag,
} from "../components/ui";

const { Text, Paragraph } = Typography;

const STEPS_STATUS: Record<
  StepStatus,
  "finish" | "process" | "wait" | "error"
> = {
  done: "finish",
  current: "process",
  pending: "wait",
  rejected: "error",
};

/** Màu + nhãn tag cho trạng thái bước (1 nguồn trong màn) — thay cho Tag color rời rạc. */
const STEP_TAG: Partial<Record<StepStatus, { color: string; label: string }>> =
  {
    current: { color: "blue", label: "Đang xử lý" },
    rejected: { color: "red", label: "Từ chối" },
    done: { color: "green", label: "Hoàn thành" },
  };

function timelineDot(s: StepStatus) {
  if (s === "done")
    return {
      color: "green",
      dot: <CheckCircleOutlined style={{ fontSize: 16 }} />,
    };
  if (s === "current")
    return {
      color: "blue",
      dot: <ClockCircleOutlined style={{ fontSize: 16 }} />,
    };
  if (s === "rejected")
    return {
      color: "red",
      dot: <CloseCircleOutlined style={{ fontSize: 16 }} />,
    };
  return { color: "gray", dot: undefined };
}

function fileIcon(loai: string) {
  if (loai === "Excel")
    return <FileExcelOutlined style={{ color: "#1d7044" }} />;
  if (loai === "Archive")
    return <FileZipOutlined style={{ color: "#8a6d1b" }} />;
  return <FileTextOutlined style={{ color: "#c0392b" }} />;
}

/** Chữ cái đầu họ tên → nhãn avatar. */
function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

// Vai trò khởi tạo/soạn thảo — không phải bước phê duyệt, không cần resolve người.
const NON_APPROVAL_CODES = new Set(["PM", "PA", "NNC"]);

/** Bước có phê duyệt? (có candidateGroups và không chỉ là vai trò khởi tạo). */
function isApprovalStep(step: DossierStep): boolean {
  return (
    step.vaiTroCodes.length > 0 &&
    !step.vaiTroCodes.every((c) => NON_APPROVAL_CODES.has(c))
  );
}

/**
 * Người nhận việc do Ma trận phê duyệt (EPIC06) resolve từ candidateGroups của bước.
 * `compact` → dòng gọn cho timeline; ngược lại hiển thị avatar đầy đủ.
 */
function ApproverList({
  approvers,
  compact,
}: {
  approvers: ResolvedApprover[];
  compact?: boolean;
}) {
  if (approvers.length === 0) return null;
  if (compact) {
    return (
      <div style={{ fontSize: 12, marginTop: 2 }}>
        <Text type="secondary">Dự kiến: </Text>
        {approvers.map((a, i) => (
          <span key={a.user.id}>
            {i > 0 && ", "}
            {a.user.hoTen}
            {a.delegatedFrom && (
              <Tag
                color="volcano"
                icon={<SwapOutlined />}
                style={{ marginInlineStart: 4 }}
              >
                thay {a.delegatedFrom.hoTen}
              </Tag>
            )}
          </span>
        ))}
      </div>
    );
  }
  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      {approvers.map((a) => (
        <Space key={a.user.id} align="start">
          <Avatar
            size="small"
            style={{ background: "#ffdad8", color: "#bf0027", fontWeight: 700 }}
          >
            {initials(a.user.hoTen)}
          </Avatar>
          <div style={{ lineHeight: 1.3 }}>
            <Text strong>{a.user.hoTen}</Text>
            {a.user.chucDanh && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {a.user.chucDanh}
                </Text>
              </div>
            )}
            {a.delegatedFrom && (
              <Tag color="volcano" icon={<SwapOutlined />} style={{ marginTop: 2 }}>
                được uỷ quyền thay {a.delegatedFrom.hoTen}
              </Tag>
            )}
          </div>
        </Space>
      ))}
    </Space>
  );
}

export default function DossierDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { getById, submitHoSo } = useDossiers();
  const { list: processes } = useProcesses();
  const {
    canProcessStep,
    canCreateHoSo,
    canRequestException,
    canApproveException,
    canApplyException,
    canViewExceptionAudit,
    roleCodes,
    admin,
  } = usePermissions();
  const { user } = useAuth();
  const {
    forDossier,
    activeFor,
    requestException,
    approveException,
    rejectException,
    applyException,
  } = useExceptions();
  const [formOpen, setFormOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedQT, setSelectedQT] = useState<string>();
  const [docTpl, setDocTpl] = useState<DocTemplate | null>(null);
  const [excOpen, setExcOpen] = useState(false);
  const [excType, setExcType] = useState<ExceptionType>("BypassCouncil");
  const [excTarget, setExcTarget] = useState<number>();
  const [excReason, setExcReason] = useState("");
  const [excEvidence, setExcEvidence] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  // Support actions (doc mục 6 loại 2) — không đổi luồng: ý kiến trao đổi (mock, giữ local),
  // xem lịch sử hợp nhất, tải hồ sơ. Chưa nối backend/kho tài liệu (F1).
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<
    { id: string; author: string; text: string; at: string }[]
  >([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const d = getById(decodeURIComponent(id));
  const docTemplates = useMemo(() => (d ? templatesFor(d) : []), [d]);
  const builtDoc = useMemo(
    () => (docTpl && d ? docTpl.build(d) : null),
    [docTpl, d],
  );

  // Quy trình khả dụng khi Gửi duyệt: đúng nhóm theo loại hồ sơ (RD01–RD06),
  // đang chạy và đã cấu hình bước (taskSteps) để dựng được luồng phê duyệt.
  const quyTrinhOptions = useMemo(
    () =>
      d
        ? processes.filter(
            (p) =>
              p.nhom === LOAI_TO_NHOM[d.loai] &&
              p.trangThai === "active" &&
              p.taskSteps?.length,
          )
        : [],
    [processes, d],
  );
  const chosenQT = quyTrinhOptions.find((p) => p.ma === selectedQT);

  const openSubmit = () => {
    if (!d) return;
    // Gợi ý sẵn quy trình khớp cấp của NV (Cơ sở → *.01, Tập đoàn → *.02).
    const byCap = quyTrinhOptions.find((p) =>
      d.cap === "Tập đoàn" ? p.ma.endsWith(".02") : p.ma.endsWith(".01"),
    );
    setSelectedQT((byCap ?? quyTrinhOptions[0])?.ma);
    setSubmitOpen(true);
  };

  const doSubmit = () => {
    if (!d || !chosenQT) return;
    submitHoSo(d.id, chosenQT);
    setSubmitOpen(false);
    message.success(
      `Đã gửi duyệt hồ sơ ${d.id} vào quy trình ${chosenQT.ma} · ${chosenQT.ten}.`,
    );
  };

  if (!d) {
    return (
      <NotFound
        title="Không tìm thấy hồ sơ"
        subTitle={`Mã "${id}" không tồn tại.`}
        onBack={() => navigate("/ho-so")}
        backText="Về danh sách hồ sơ"
      />
    );
  }

  const currentStep = d.steps[d.buocHienTai];
  const rejectedStep = d.steps.find((s) => s.trangThai === "rejected");
  // Chỉ user thuộc candidateGroups của bước hiện tại (theo BPMN) mới xử lý được.
  const allowed = canProcessStep(currentStep);

  // EPIC06 — Ma trận phê duyệt resolve candidateGroups của bước HIỆN TẠI → người
  // nhận việc cụ thể (+ uỷ quyền). Đây là nơi BPMN (chỉ mang candidateGroups trừu
  // tượng) nối vào Approval Matrix: bước không tự biết ai, ma trận mới biết.
  const currentApprovers =
    d.trangThai === "processing" && currentStep && isApprovalStep(currentStep)
      ? resolveGroups(currentStep.vaiTroCodes)
      : [];

  // Ngoại lệ có kiểm soát (docs/research/controlled-exception-handling.md).
  const excList = forDossier(d.id);
  // Yêu cầu đang "mở" (pending hoặc approved-chờ-áp-dụng) — chặn xin yêu cầu mới.
  const activeExc = activeFor(d.id);
  // Số yêu cầu chưa bị từ chối theo từng loại → áp maxTimesPerDossier của policy.
  const exceptionCountByType = excList.reduce<Partial<Record<ExceptionType, number>>>(
    (acc, r) => {
      if (r.status !== "rejected")
        acc[r.exceptionType] = (acc[r.exceptionType] ?? 0) + 1;
      return acc;
    },
    {},
  );
  // Ai được xem audit ngoại lệ của hồ sơ này (VIEW_EXCEPTION_AUDIT).
  const canSeeExceptionAudit = canViewExceptionAudit({
    currentStep,
    approverRoleCodes: exceptionApproverCodesForCap(d.cap),
  });
  // Chỉ cho chọn bước đích SAU bước hiện tại — nhảy lùi (reopen) không thuộc phạm vi mock này.
  const excTargets = d.steps
    .map((s, i) => ({ i, s }))
    .filter(({ i }) => i > d.buocHienTai);

  // Action Availability Model (docs/research/action-availability-model.md) — một hàm
  // duy nhất quyết định action nào khả dụng; UI chỉ render theo kết quả, không tự
  // suy luận điều kiện hiển thị rời rạc từng nút. Tầng STANDARD/SUPPORT giờ chạy qua
  // CÙNG Action Availability Policy Engine mà trang Action Studio dùng (đã hợp nhất) —
  // các hàm quyền của trang được "gói" thành danh sách quyền hiệu lực làm cầu nối.
  const userPermissions = [
    ...(canCreateHoSo ? [PERMISSIONS.SUBMIT_DOSSIER] : []),
    ...(allowed ? [PERMISSIONS.PROCESS_STEP] : []),
    // Support actions: trong mock ai xem được hồ sơ đều thao tác được (doc: Permission + Status).
    PERMISSIONS.ADD_COMMENT,
    PERMISSIONS.DOWNLOAD_DOCUMENT,
    PERMISSIONS.VIEW_AUDIT,
  ];
  const availableActions = getAvailableActions({
    surface: 'DOSSIER_DETAIL',
    processCode: LOAI_TO_NHOM[d.loai],
    dossierStatus: d.trangThai,
    taskDefinitionKey: currentStep?.taskDefinitionKey,
    userRoleCodes: roleCodes,
    userPermissions,
    isAdmin: admin,
    activeExc,
    hasExceptionTargets: excTargets.length > 0,
    canRequestExceptionOnCurrentStep: canRequestException(currentStep),
    cap: d.cap,
    exceptionCountByType,
  });
  const actionByCode = new Map(availableActions.map((a) => [a.actionCode, a]));
  const submitAction = actionByCode.get(STANDARD_ACTION_CODES.SUBMIT);
  const processAction = actionByCode.get(STANDARD_ACTION_CODES.PROCESS_STEP);
  const enabledExceptionTypes = (
    Object.entries(EXCEPTION_ACTION_CODE) as [ExceptionType, string][]
  )
    .filter(([, code]) => actionByCode.get(code)?.enabled)
    .map(([type]) => type);
  const canOpenException = enabledExceptionTypes.length > 0;
  // Nhóm "Thao tác khác" (doc mục 9) — gom support actions vào menu riêng, tách khỏi
  // nút chuẩn/ngoại lệ. Render động từ Action Registry, không hard-code từng mục.
  const supportActions = availableActions.filter((a) => a.type === "SUPPORT");

  // Policy của loại ngoại lệ đang chọn trong modal → quyết định căn cứ có bắt buộc không.
  const excPolicy = resolveExceptionPolicy(EXCEPTION_POLICIES, {
    exceptionType: excType,
    cap: d.cap,
  });
  const excEvidenceRequired = !!excPolicy?.requireEvidence;
  const excFormInvalid =
    excTarget === undefined ||
    !excReason.trim() ||
    (excEvidenceRequired && !excEvidence.trim());

  const openException = () => {
    setExcType(enabledExceptionTypes[0] ?? "BypassCouncil");
    setExcTarget(excTargets[0]?.i);
    setExcReason("");
    setExcEvidence("");
    setExcOpen(true);
  };

  const submitException = () => {
    if (excFormInvalid) return;
    requestException({
      hoSoId: d.id,
      exceptionType: excType,
      fromStepIndex: d.buocHienTai,
      toStepIndex: excTarget,
      reason: excReason.trim(),
      evidence: excEvidence.trim() || undefined,
      requestedBy: user?.hoTen ?? "Người dùng",
    });
    setExcOpen(false);
    message.info(
      `Đã gửi yêu cầu ngoại lệ cho hồ sơ ${d.id} — chờ cấp có thẩm quyền duyệt.`,
    );
  };

  const handleApproveExc = (id: string) => {
    approveException(id, user?.hoTen ?? "Người dùng");
    message.success("Đã duyệt ngoại lệ — chờ người xử lý áp dụng vào luồng.");
  };

  const handleApplyExc = (id: string) => {
    applyException(id, user?.hoTen ?? "Người dùng");
    message.success("Đã áp dụng ngoại lệ — hồ sơ chuyển bước.");
  };

  const submitRejectExc = () => {
    if (!rejectingId || !rejectNote.trim()) return;
    rejectException(rejectingId, user?.hoTen ?? "Người dùng", rejectNote.trim());
    setRejectingId(null);
    setRejectNote("");
    message.info("Đã từ chối yêu cầu ngoại lệ.");
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      {
        id: `CMT-${Date.now()}`,
        author: user?.hoTen ?? "Người dùng",
        text: commentText.trim(),
        at: new Date().toLocaleString("vi-VN"),
      },
      ...prev,
    ]);
    setCommentText("");
    setCommentOpen(false);
    message.success("Đã ghi ý kiến trao đổi vào hồ sơ.");
  };

  // Tải hồ sơ: export bản tóm tắt (text) hoàn toàn client-side — mock, chưa nối kho tài liệu.
  const downloadDossier = () => {
    const lines = [
      `HỒ SƠ ${d.id} — ${d.tenDeTai}`,
      `Loại: ${d.loai} · Cấp: ${d.cap} · Trạng thái: ${d.trangThai}`,
      `Nhiệm vụ: ${d.maDeTai} · Chủ nhiệm: ${d.chuNhiem} · Đơn vị: ${d.donVi}`,
      `Quy trình: ${d.quyTrinh ? `${d.quyTrinh} ${d.quyTrinhTen}` : "(chưa vào quy trình)"}`,
      `Tổng dự toán: ${d.duToan} · Ngày tạo: ${d.ngayTao}`,
      "",
      "DÒNG THỜI GIAN PHÊ DUYỆT:",
      ...d.steps.map(
        (s, i) =>
          `  ${i + 1}. [${s.trangThai}] ${s.ten} — ${s.vaiTro}${s.nguoi ? ` · ${s.nguoi}` : ""}${s.thoiDiem ? ` · ${s.thoiDiem}` : ""}${s.yKien ? ` · ý kiến: ${s.yKien}` : ""}`,
      ),
      "",
      "YÊU CẦU NGOẠI LỆ:",
      excList.length
        ? excList
            .map(
              (r) =>
                `  - [${r.status}] ${EXCEPTION_TYPE_LABEL[r.exceptionType]}: ${d.steps[r.fromStepIndex]?.ten} → ${d.steps[r.toStepIndex]?.ten} · ${r.reason}`,
            )
            .join("\n")
        : "  (không có)",
      "",
      "Ý KIẾN TRAO ĐỔI:",
      comments.length
        ? comments.map((c) => `  - ${c.author} (${c.at}): ${c.text}`).join("\n")
        : "  (không có)",
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${d.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    message.success(`Đã tải bản tóm tắt hồ sơ ${d.id}.`);
  };

  const onSupportAction = (a: AvailableAction) => {
    if (a.actionCode === SUPPORT_ACTION_CODES.ADD_COMMENT) setCommentOpen(true);
    else if (a.actionCode === SUPPORT_ACTION_CODES.DOWNLOAD_DOSSIER) downloadDossier();
    else if (a.actionCode === SUPPORT_ACTION_CODES.VIEW_HISTORY) setHistoryOpen(true);
  };

  const SUPPORT_ICON: Record<string, ReactNode> = {
    [SUPPORT_ACTION_CODES.ADD_COMMENT]: <CommentOutlined />,
    [SUPPORT_ACTION_CODES.DOWNLOAD_DOSSIER]: <DownloadOutlined />,
    [SUPPORT_ACTION_CODES.VIEW_HISTORY]: <HistoryOutlined />,
  };

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Quản lý NV KHCN", to: "/ho-so" },
          { label: "Hồ sơ", to: "/ho-so" },
          { label: d.id },
        ]}
        onBack={() => navigate("/ho-so")}
        title={d.tenDeTai}
        tag={<DossierStatusTag status={d.trangThai} />}
        code={
          <>
            <Text code>{d.id}</Text>{" "}
            <Text type="secondary">
              · {d.quyTrinh ? `${d.quyTrinh} ${d.quyTrinhTen}` : d.quyTrinhTen}{" "}
              · cấp {d.cap}
            </Text>
          </>
        }
        extra={
          <Space>
            {submitAction && (
              <Tooltip title={submitAction.disabledReason}>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  disabled={!submitAction.enabled}
                  onClick={openSubmit}
                >
                  Gửi duyệt
                </Button>
              </Tooltip>
            )}
            {processAction && (
              <>
                {canOpenException && (
                  <Tooltip title="Xin phép bỏ qua/chuyển thẳng bước hiện tại — cần cấp có thẩm quyền duyệt riêng.">
                    <Button
                      danger
                      icon={<ExclamationCircleOutlined />}
                      onClick={openException}
                    >
                      Yêu cầu ngoại lệ
                    </Button>
                  </Tooltip>
                )}
                <Tooltip title={processAction.disabledReason}>
                  <Button
                    type="primary"
                    icon={<FormOutlined />}
                    disabled={!processAction.enabled}
                    onClick={() => setFormOpen(true)}
                  >
                    Xử lý
                  </Button>
                </Tooltip>
              </>
            )}
            {supportActions.length > 0 && (
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: supportActions.map((a) => ({
                    key: a.actionCode,
                    label: a.label,
                    icon: SUPPORT_ICON[a.actionCode],
                  })),
                  onClick: ({ key }) => {
                    const a = supportActions.find((x) => x.actionCode === key);
                    if (a) onSupportAction(a);
                  },
                }}
              >
                <Button icon={<MoreOutlined />}>Thao tác khác</Button>
              </Dropdown>
            )}
          </Space>
        }
      />

      {activeExc && (
        <Alert
          type={activeExc.status === "approved" ? "info" : "warning"}
          showIcon
          style={{ marginBottom: 16 }}
          message={
            activeExc.status === "approved"
              ? `Ngoại lệ đã được duyệt, chờ áp dụng: "${EXCEPTION_TYPE_LABEL[activeExc.exceptionType]}"`
              : `Đang có yêu cầu ngoại lệ chờ duyệt: "${EXCEPTION_TYPE_LABEL[activeExc.exceptionType]}"`
          }
          description={`Lý do: ${activeExc.reason}`}
        />
      )}

      {d.trangThai === "draft" && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Hồ sơ ở trạng thái Khởi tạo — chưa vào quy trình."
          description="Bấm “Gửi duyệt” để chọn quy trình mà hồ sơ sẽ đi vào; hồ sơ sẽ chuyển sang Đang xử lý và bắt đầu luồng phê duyệt."
          action={
            canCreateHoSo ? (
              <Button
                size="small"
                type="primary"
                icon={<SendOutlined />}
                onClick={openSubmit}
              >
                Gửi duyệt
              </Button>
            ) : undefined
          }
        />
      )}

      {d.trangThai === "approved" && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          message="Hồ sơ đã được phê duyệt hoàn tất."
          description="Tất cả các bước trong luồng đã hoàn thành."
        />
      )}
      {d.trangThai === "rejected" && rejectedStep && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={`Hồ sơ bị từ chối tại bước "${rejectedStep.ten}"`}
          description={rejectedStep.yKien}
        />
      )}
      {d.trangThai === "processing" && currentStep && !allowed && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={`Đang chờ xử lý tại bước: ${currentStep.ten}`}
          description={`Vai trò phụ trách: ${currentStep.vaiTro} — tài khoản của bạn không thuộc nhóm này.`}
        />
      )}

      <Card size="small" style={{ marginBottom: 16 }}>
        <Steps
          size="small"
          responsive
          current={d.buocHienTai}
          items={d.steps.map((s) => ({
            title: s.ten,
            description: s.vaiTro,
            status: STEPS_STATUS[s.trangThai],
          }))}
        />
      </Card>

      {excList.length > 0 && canSeeExceptionAudit && (
        <Card
          size="small"
          title="Yêu cầu ngoại lệ"
          extra={
            <Tooltip title="Duyệt và Áp dụng là 2 quyền tách biệt: người duyệt cho phép, người xử lý bước mới áp dụng vào luồng.">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Duyệt · Áp dụng tách quyền
              </Text>
            </Tooltip>
          }
          style={{ marginBottom: 16 }}
        >
          <List
            dataSource={excList}
            renderItem={(r) => (
              <List.Item
                actions={
                  r.status === "pending" && canApproveException(r)
                    ? [
                        <Button
                          key="a"
                          size="small"
                          type="primary"
                          onClick={() => handleApproveExc(r.id)}
                        >
                          Duyệt
                        </Button>,
                        <Button
                          key="r"
                          size="small"
                          danger
                          onClick={() => setRejectingId(r.id)}
                        >
                          Từ chối
                        </Button>,
                      ]
                    : r.status === "approved" &&
                        canApplyException(d.steps[r.fromStepIndex])
                      ? [
                          <Button
                            key="ap"
                            size="small"
                            type="primary"
                            icon={<SwapOutlined />}
                            onClick={() => handleApplyExc(r.id)}
                          >
                            Áp dụng
                          </Button>,
                        ]
                      : undefined
                }
              >
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <Text strong>{EXCEPTION_TYPE_LABEL[r.exceptionType]}</Text>
                      <StatusTag
                        color={EXCEPTION_STATUS_LABEL[r.status].color}
                        label={EXCEPTION_STATUS_LABEL[r.status].label}
                      />
                    </Space>
                  }
                  description={
                    <>
                      <div>
                        {d.steps[r.fromStepIndex]?.ten} → {d.steps[r.toStepIndex]?.ten}
                      </div>
                      <div>Lý do: {r.reason}</div>
                      {r.evidence && <div>Căn cứ: {r.evidence}</div>}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {r.requestedBy} · {r.requestedAt}
                        {r.decidedBy &&
                          ` · Quyết định bởi ${r.decidedBy} lúc ${r.decidedAt}${r.decisionNote ? `: ${r.decisionNote}` : ""}`}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {comments.length > 0 && (
        <Card
          size="small"
          title={
            <Space>
              <CommentOutlined />
              Ý kiến trao đổi
            </Space>
          }
          extra={
            <Text type="secondary" style={{ fontSize: 12 }}>
              Thao tác hỗ trợ · không đổi luồng
            </Text>
          }
          style={{ marginBottom: 16 }}
        >
          <List
            dataSource={comments}
            renderItem={(c) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size="small"
                      style={{ background: "#e6f4ff", color: "#0958d9", fontWeight: 700 }}
                    >
                      {initials(c.author)}
                    </Avatar>
                  }
                  title={
                    <Space size={6}>
                      <Text strong>{c.author}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {c.at}
                      </Text>
                    </Space>
                  }
                  description={c.text}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      <Row gutter={16}>
        <Col xs={24} lg={13}>
          <Card title="Thông tin hồ sơ" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Mã hồ sơ">{d.id}</Descriptions.Item>
              <Descriptions.Item label="Loại hồ sơ">
                <Tag color="blue">{d.loai}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã nhiệm vụ (NV KHCN)">
                {d.maDeTai}
              </Descriptions.Item>
              <Descriptions.Item label="Tên nhiệm vụ">
                {d.tenDeTai}
              </Descriptions.Item>
              <Descriptions.Item label="Quy trình">
                {d.quyTrinh ? (
                  `${d.quyTrinh} · ${d.quyTrinhTen}`
                ) : (
                  <Text type="secondary">Chưa vào quy trình — chờ gửi duyệt</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Cấp xét duyệt">
                {d.cap}
              </Descriptions.Item>
              <Descriptions.Item label="Chủ nhiệm đề tài">
                {d.chuNhiem}
              </Descriptions.Item>
              <Descriptions.Item label="Đơn vị chủ trì">
                {d.donVi}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian thực hiện">
                {d.nv.thoiGianThucHien}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng dự toán (PL1–PL6)">
                {d.duToan}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo hồ sơ">
                {d.ngayTao}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title="Tài liệu / Phiếu"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <List
              dataSource={d.taiLieu}
              renderItem={(t) => (
                <List.Item
                  actions={[
                    <Tooltip key="v" title="Sắp ra mắt — chưa nối kho tài liệu">
                      <Button
                        type="link"
                        size="small"
                        style={{ paddingInline: 4 }}
                        disabled
                      >
                        Xem
                      </Button>
                    </Tooltip>,
                    <Tooltip key="d" title="Sắp ra mắt — chưa nối kho tài liệu">
                      <Button
                        type="link"
                        size="small"
                        style={{ paddingInline: 4 }}
                        disabled
                      >
                        Tải
                      </Button>
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={fileIcon(t.loai)}
                    title={t.ten}
                    description={t.loai}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card
            title={
              <Space>
                <FilePdfOutlined style={{ color: "#c0392b" }} />
                Văn bản đầu ra
              </Space>
            }
            size="small"
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                Sinh từ template → in / xuất PDF
              </Text>
            }
          >
            {docTemplates.length ? (
              <List
                dataSource={docTemplates}
                renderItem={(t) => (
                  <List.Item
                    actions={[
                      <Button
                        key="v"
                        size="small"
                        icon={<FileTextOutlined />}
                        onClick={() => setDocTpl(t)}
                      >
                        Xem
                      </Button>,
                      <Button
                        key="p"
                        size="small"
                        type="primary"
                        ghost
                        icon={<PrinterOutlined />}
                        onClick={() => {
                          const ok = printOfficialDoc(t.build(d));
                          if (!ok)
                            message.warning(
                              "Trình duyệt chặn cửa sổ in — hãy cho phép popup.",
                            );
                        }}
                      >
                        In / PDF
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <FilePdfOutlined
                          style={{ color: "#c0392b", fontSize: 20 }}
                        />
                      }
                      title={
                        <Space size={6}>
                          <span>{t.ten}</span>
                          <Tag>{t.loai}</Tag>
                        </Space>
                      }
                      description={t.moTa}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">
                Quy trình này chưa cấu hình mẫu văn bản đầu ra.
              </Text>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={11}>
          {currentApprovers.length > 0 && (
            <Card
              size="small"
              style={{ marginBottom: 16 }}
              title={
                <Space>
                  <SolutionOutlined style={{ color: "var(--vht-red)" }} />
                  Người nhận việc — Ma trận phê duyệt
                </Space>
              }
              extra={<Tag color="processing">EPIC06</Tag>}
            >
              <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 0 }}>
                Bước <b>{currentStep!.ten}</b> chỉ mang nhóm phê duyệt trừu tượng (
                {currentStep!.vaiTroCodes.join(", ")}); Ma trận phê duyệt resolve ra
                người cụ thể theo tổ chức &amp; uỷ quyền hiện hành.
              </Paragraph>
              <ApproverList approvers={currentApprovers} />
            </Card>
          )}

          <Card title="Dòng thời gian phê duyệt">
            <Timeline
              items={d.steps.map((s) => {
                const dot = timelineDot(s.trangThai);
                return {
                  color: dot.color,
                  dot: dot.dot,
                  children: (
                    <div
                      style={{ opacity: s.trangThai === "pending" ? 0.55 : 1 }}
                    >
                      <Space align="center" wrap>
                        <Text strong>{s.ten}</Text>
                        {STEP_TAG[s.trangThai] && (
                          <StatusTag
                            color={STEP_TAG[s.trangThai]!.color}
                            label={STEP_TAG[s.trangThai]!.label}
                          />
                        )}
                      </Space>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {s.vaiTro}
                        </Text>
                      </div>
                      {s.nguoi && <div style={{ fontSize: 13 }}>{s.nguoi}</div>}
                      {s.trangThai === "pending" && isApprovalStep(s) && (
                        <ApproverList
                          compact
                          approvers={resolveGroups(s.vaiTroCodes)}
                        />
                      )}
                      {s.thoiDiem && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {s.thoiDiem}
                          </Text>
                        </div>
                      )}
                      {s.yKien && (
                        <Paragraph
                          style={{
                            margin: "4px 0 0",
                            padding: "6px 10px",
                            background: "#f6f8fa",
                            borderRadius: 6,
                            fontSize: 13,
                          }}
                        >
                          💬 {s.yKien}
                        </Paragraph>
                      )}
                    </div>
                  ),
                };
              })}
            />
          </Card>
        </Col>
      </Row>

      <TaskFormModal
        dossierId={d.id}
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />

      <Modal
        open={excOpen}
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: "#cf1322" }} />
            Yêu cầu xử lý ngoại lệ
          </Space>
        }
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        okButtonProps={{ danger: true, disabled: excFormInvalid }}
        onOk={submitException}
        onCancel={() => setExcOpen(false)}
      >
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="Đây là ngoại lệ, không phải luồng chuẩn."
          description="Yêu cầu sẽ được ghi vào lịch sử hồ sơ và phải được cấp có thẩm quyền duyệt riêng trước khi áp dụng."
        />
        <Paragraph>Loại ngoại lệ</Paragraph>
        <Select<ExceptionType>
          style={{ width: "100%", marginBottom: 12 }}
          value={excType}
          onChange={setExcType}
          options={enabledExceptionTypes.map((value) => ({
            value,
            label: EXCEPTION_TYPE_LABEL[value],
          }))}
        />
        <Paragraph>Chuyển thẳng tới bước</Paragraph>
        <Select
          style={{ width: "100%", marginBottom: 12 }}
          value={excTarget}
          onChange={setExcTarget}
          options={excTargets.map(({ i, s }) => ({ value: i, label: s.ten }))}
        />
        <Paragraph>Lý do (bắt buộc)</Paragraph>
        <Input.TextArea
          rows={3}
          value={excReason}
          onChange={(e) => setExcReason(e.target.value)}
          placeholder="Nêu rõ căn cứ/lý do xin ngoại lệ..."
          style={{ marginBottom: 12 }}
        />
        <Paragraph>
          Căn cứ đính kèm{" "}
          {excEvidenceRequired ? (
            <Text type="danger">(bắt buộc với loại ngoại lệ này)</Text>
          ) : (
            "(không bắt buộc)"
          )}
        </Paragraph>
        <Input
          status={excEvidenceRequired && !excEvidence.trim() ? "error" : undefined}
          value={excEvidence}
          onChange={(e) => setExcEvidence(e.target.value)}
          placeholder="Vd: Kết luận trực tiếp của TGĐ ngày..."
        />
      </Modal>

      <Modal
        open={!!rejectingId}
        title="Từ chối yêu cầu ngoại lệ"
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, disabled: !rejectNote.trim() }}
        onOk={submitRejectExc}
        onCancel={() => {
          setRejectingId(null);
          setRejectNote("");
        }}
      >
        <Paragraph>Lý do từ chối (bắt buộc)</Paragraph>
        <Input.TextArea
          rows={3}
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
        />
      </Modal>

      <Modal
        open={commentOpen}
        title={
          <Space>
            <CommentOutlined />
            Bổ sung ý kiến
          </Space>
        }
        okText="Ghi ý kiến"
        cancelText="Hủy"
        okButtonProps={{ disabled: !commentText.trim() }}
        onOk={submitComment}
        onCancel={() => setCommentOpen(false)}
      >
        <Paragraph type="secondary" style={{ marginTop: 0 }}>
          Ý kiến trao đổi được ghi vào hồ sơ, không làm thay đổi luồng phê duyệt.
        </Paragraph>
        <Input.TextArea
          rows={4}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Nhập ý kiến trao đổi..."
        />
      </Modal>

      <Modal
        open={historyOpen}
        title={
          <Space>
            <HistoryOutlined />
            Lịch sử hồ sơ {d.id}
          </Space>
        }
        width={720}
        footer={[
          <Button key="close" onClick={() => setHistoryOpen(false)}>
            Đóng
          </Button>,
        ]}
        onCancel={() => setHistoryOpen(false)}
      >
        <Timeline
          items={[
            ...d.steps.map((s) => {
              const dot = timelineDot(s.trangThai);
              return {
                color: dot.color,
                children: (
                  <div>
                    <Text strong>{s.ten}</Text>
                    {STEP_TAG[s.trangThai] && (
                      <StatusTag
                        color={STEP_TAG[s.trangThai]!.color}
                        label={STEP_TAG[s.trangThai]!.label}
                      />
                    )}
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {s.vaiTro}
                        {s.nguoi ? ` · ${s.nguoi}` : ""}
                        {s.thoiDiem ? ` · ${s.thoiDiem}` : ""}
                      </Text>
                    </div>
                    {s.yKien && <div style={{ fontSize: 13 }}>💬 {s.yKien}</div>}
                  </div>
                ),
              };
            }),
            ...excList.map((r) => ({
              color: EXCEPTION_STATUS_LABEL[r.status].color,
              dot: <ExclamationCircleOutlined />,
              children: (
                <div>
                  <Text strong>
                    Ngoại lệ · {EXCEPTION_TYPE_LABEL[r.exceptionType]}
                  </Text>{" "}
                  <StatusTag
                    color={EXCEPTION_STATUS_LABEL[r.status].color}
                    label={EXCEPTION_STATUS_LABEL[r.status].label}
                  />
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {d.steps[r.fromStepIndex]?.ten} → {d.steps[r.toStepIndex]?.ten} ·{" "}
                      {r.requestedBy} · {r.requestedAt}
                    </Text>
                  </div>
                  <div style={{ fontSize: 13 }}>Lý do: {r.reason}</div>
                </div>
              ),
            })),
            ...comments.map((c) => ({
              color: "blue",
              dot: <CommentOutlined />,
              children: (
                <div>
                  <Text strong>Ý kiến · {c.author}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {c.at}
                    </Text>
                  </div>
                  <div style={{ fontSize: 13 }}>{c.text}</div>
                </div>
              ),
            })),
          ]}
        />
      </Modal>

      <Modal
        open={submitOpen}
        title={
          <Space>
            <SendOutlined />
            Gửi duyệt hồ sơ
          </Space>
        }
        okText="Gửi duyệt"
        cancelText="Hủy"
        okButtonProps={{ disabled: !chosenQT, icon: <SendOutlined /> }}
        onOk={doSubmit}
        onCancel={() => setSubmitOpen(false)}
      >
        <Paragraph>
          Chọn quy trình mà hồ sơ <Text code>{d.id}</Text> (loại{" "}
          <Tag color="blue" style={{ marginRight: 0 }}>{d.loai}</Tag>) sẽ đi vào:
        </Paragraph>
        {quyTrinhOptions.length ? (
          <>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn quy trình"
              value={selectedQT}
              onChange={setSelectedQT}
              options={quyTrinhOptions.map((p) => ({
                value: p.ma,
                label: `${p.ma} · ${p.ten}`,
              }))}
            />
            {chosenQT && (
              <Alert
                type="info"
                showIcon
                style={{ marginTop: 12 }}
                message={`${chosenQT.ma} · ${chosenQT.ten}`}
                description={
                  <>
                    <div>{chosenQT.moTa}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Sau khi gửi, hồ sơ chuyển sang <b>Đang xử lý</b> tại bước:{" "}
                      {chosenQT.taskSteps?.[
                        chosenQT.taskSteps[0]?.hanhDong === "Khởi tạo" ? 1 : 0
                      ]?.ten ?? "—"}
                    </Text>
                  </>
                }
              />
            )}
          </>
        ) : (
          <Alert
            type="warning"
            showIcon
            message={`Chưa có quy trình đang chạy cho loại hồ sơ "${d.loai}".`}
            description="Cần triển khai (deploy) quy trình tương ứng trong Danh mục quy trình trước khi gửi duyệt."
          />
        )}
      </Modal>

      <Modal
        open={!!docTpl}
        title={
          <Space>
            <FilePdfOutlined style={{ color: "#c0392b" }} />
            {docTpl?.ten}
          </Space>
        }
        width={880}
        destroyOnClose
        onCancel={() => setDocTpl(null)}
        footer={[
          <Button key="close" onClick={() => setDocTpl(null)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              if (builtDoc && !printOfficialDoc(builtDoc))
                message.warning(
                  "Trình duyệt chặn cửa sổ in — hãy cho phép popup.",
                );
            }}
          >
            In / Lưu PDF
          </Button>,
        ]}
      >
        {builtDoc && <OfficialDocument doc={builtDoc} />}
      </Modal>
    </div>
  );
}
