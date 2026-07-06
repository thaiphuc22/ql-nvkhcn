import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Descriptions,
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
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileZipOutlined,
  FormOutlined,
  PrinterOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { LOAI_TO_NHOM, type StepStatus } from "../data/dossiers";
import { templatesFor, type DocTemplate } from "../data/docTemplates";
import { useDossiers } from "../store/DossierContext";
import { useProcesses } from "../store/ProcessContext";
import { usePermissions } from "../store/AuthContext";
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

export default function DossierDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { getById, submitHoSo } = useDossiers();
  const { list: processes } = useProcesses();
  const { canProcessStep, canCreateHoSo } = usePermissions();
  const [formOpen, setFormOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedQT, setSelectedQT] = useState<string>();
  const [docTpl, setDocTpl] = useState<DocTemplate | null>(null);

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
          d.trangThai === "draft" ? (
            <Tooltip
              title={
                canCreateHoSo
                  ? undefined
                  : "Chỉ Chủ nhiệm đề tài (PM/PA/NNC) được gửi duyệt hồ sơ."
              }
            >
              <Button
                type="primary"
                icon={<SendOutlined />}
                disabled={!canCreateHoSo}
                onClick={openSubmit}
              >
                Gửi duyệt
              </Button>
            </Tooltip>
          ) : d.trangThai === "processing" ? (
            <Tooltip
              title={
                allowed
                  ? undefined
                  : `Bước này thuộc vai trò: ${currentStep?.vaiTro ?? "—"}`
              }
            >
              <Button
                type="primary"
                icon={<FormOutlined />}
                disabled={!allowed}
                onClick={() => setFormOpen(true)}
              >
                Xử lý
              </Button>
            </Tooltip>
          ) : undefined
        }
      />

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
