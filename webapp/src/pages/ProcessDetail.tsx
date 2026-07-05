import { lazy, Suspense, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Timeline,
  Typography,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CloseOutlined,
  CloudUploadOutlined,
  EditOutlined,
  EyeOutlined,
  InboxOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { NHOM, curVer, type TaskStep } from "../data/processes";
import { useProcesses } from "../store/ProcessContext";
import { useForms } from "../store/FormContext";
import FormRenderer from "../components/FormRenderer";
import { type BpmnEditorHandle } from "../components/BpmnEditor";
import {
  PageHeader,
  NotFound,
  ProcessStatusTag,
  EntityTable,
} from "../components/ui";

const BpmnViewer = lazy(() => import("../components/BpmnViewer"));
const BpmnEditor = lazy(() => import("../components/BpmnEditor"));

const { Text, Title, Paragraph } = Typography;

export default function ProcessDetail() {
  const { ma = "" } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { getByMa, updateProcess, toggleStatus, deployVersion, setStepForm } =
    useProcesses();
  const { list: formList, getForm } = useForms();

  const [editing, setEditing] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [editingDiagram, setEditingDiagram] = useState(false);
  const bpmnEditRef = useRef<BpmnEditorHandle>(null);
  const [form] = Form.useForm();
  const [deployForm] = Form.useForm();

  const p = getByMa(decodeURIComponent(ma));

  if (!p) {
    return (
      <NotFound
        title="Không tìm thấy quy trình"
        subTitle={`Mã "${ma}" không tồn tại trong danh mục.`}
        onBack={() => navigate("/quy-trinh")}
        backText="Về Danh mục quy trình"
      />
    );
  }

  function startEdit() {
    if (!p) return;
    form.setFieldsValue({ ten: p.ten, nhom: p.nhom, moTa: p.moTa });
    setEditing(true);
  }
  function saveEdit() {
    form.validateFields().then((values) => {
      updateProcess(p!.ma, values);
      message.success("Đã lưu thay đổi quy trình.");
      setEditing(false);
    });
  }
  function onToggle() {
    const next = toggleStatus(p!.ma);
    if (next === "stopped") message.warning(`Đã tạm ngừng ${p!.ma}.`);
    else message.success(`Đã kích hoạt ${p!.ma}.`);
  }
  function submitDeploy() {
    deployForm.validateFields().then(async (values) => {
      // Cổng deploy: lint XML đã lưu — có lỗi thì không deploy.
      if (p!.bpmnXml) {
        const { lintBpmnXml } = await import("../bpmn/khcnLint");
        const errors = (await lintBpmnXml(p!.bpmnXml)).filter(
          (i) => i.severity === "error",
        );
        if (errors.length > 0) {
          message.error(
            `Không thể deploy: sơ đồ BPMN còn ${errors.length} lỗi (vd: ${errors[0].elementName} — ${errors[0].message}). Mở "Chỉnh sửa sơ đồ" → Kiểm tra để xử lý.`,
          );
          return;
        }
      } else {
        message.warning(
          "Quy trình chưa có sơ đồ BPMN — deploy chỉ tăng phiên bản mô phỏng.",
        );
      }
      const next = deployVersion(p!.ma, String(values.note || "").trim());
      message.success(
        `Đã deploy v${next}. Instance đang chạy giữ nguyên phiên bản cũ.`,
      );
      setDeployOpen(false);
      deployForm.resetFields();
    });
  }
  async function saveDiagram() {
    // Cổng lưu: còn lỗi lint (severity=error) thì chặn — modal kết quả tự mở.
    const issues = bpmnEditRef.current?.validateForSave() ?? [];
    const errorCount = issues.filter((i) => i.severity === "error").length;
    if (errorCount > 0) {
      message.error(
        `Không thể lưu: sơ đồ còn ${errorCount} lỗi. Bấm vào từng lỗi để tới phần tử cần sửa.`,
      );
      return;
    }
    const xml = await bpmnEditRef.current?.getXml();
    if (xml) updateProcess(p!.ma, { bpmnXml: xml });
    bpmnEditRef.current?.markSaved();
    message.success("Đã lưu sơ đồ BPMN.");
    setEditingDiagram(false);
  }

  const formOptions = [
    { value: "", label: "— Chưa gán —" },
    ...formList.map((f) => ({ value: f.key, label: f.ten })),
  ];

  const stepColumns: ColumnsType<TaskStep> = [
    { title: "#", key: "idx", width: 44, render: (_, __, i) => i + 1 },
    {
      title: "Bước (User Task)",
      dataIndex: "ten",
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.vaiTro}
          </Text>
        </div>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "hanhDong",
      width: 120,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Biểu mẫu (eForm)",
      key: "form",
      width: 260,
      render: (_, r) => (
        <Select
          style={{ width: "100%" }}
          value={r.formKey ?? ""}
          options={formOptions}
          onChange={(v) => {
            setStepForm(p!.ma, r.key, v || undefined);
            message.success(`Đã cập nhật biểu mẫu cho bước "${r.ten}".`);
          }}
        />
      ),
    },
    {
      title: "Xem",
      key: "xem",
      width: 70,
      align: "center",
      render: (_, r) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          disabled={!r.formKey}
          onClick={() => setPreview(r.formKey ?? null)}
        />
      ),
    },
  ];

  const infoTab = (
    <Row gutter={16}>
      <Col xs={24} lg={14}>
        <Card title="Thông tin quy trình" style={{ marginBottom: 16 }}>
          {editing ? (
            <Form form={form} layout="vertical">
              <Form.Item label="Mã quy trình">
                <Input value={p.ma} disabled />
              </Form.Item>
              <Form.Item
                name="ten"
                label="Tên quy trình"
                rules={[{ required: true, message: "Nhập tên" }]}
              >
                <Input />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="nhom"
                    label="Nhóm"
                    rules={[{ required: true }]}
                  >
                    <Select
                      options={Object.entries(NHOM).map(([k, v]) => ({
                        value: k,
                        label: `${k} · ${v}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="moTa" label="Mô tả luồng">
                <Input.TextArea rows={4} />
              </Form.Item>
            </Form>
          ) : (
            <>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Mã">{p.ma}</Descriptions.Item>
                <Descriptions.Item label="Tên quy trình">
                  {p.ten}
                </Descriptions.Item>
                <Descriptions.Item label="Nhóm">
                  {p.nhom} · {NHOM[p.nhom]}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <ProcessStatusTag status={p.trangThai} />
                </Descriptions.Item>
                <Descriptions.Item label="Phiên bản hiện hành">
                  v{curVer(p)}
                </Descriptions.Item>
                <Descriptions.Item label="Instance đang chạy">
                  {p.instances} hồ sơ
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật">
                  {p.capNhat}
                </Descriptions.Item>
              </Descriptions>
              <Title level={5} style={{ marginTop: 18 }}>
                Mô tả luồng
              </Title>
              <Paragraph style={{ marginBottom: 0 }}>{p.moTa}</Paragraph>
            </>
          )}
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        {/* <Card title="Sơ đồ BPMN" size="small" style={{ marginBottom: 16 }}>
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Luồng nghiệp vụ được số hoá bằng BPMN. Xem trực quan hoặc chỉnh sửa ở tab riêng.
          </Paragraph>
          <Button icon={<PartitionOutlined />} onClick={() => setActiveTab('bpmn')}>
            Xem / chỉnh sửa sơ đồ
          </Button>
        </Card> */}
        <Card title="Lịch sử phiên bản" size="small">
          {p.versions.length ? (
            <Timeline
              items={p.versions
                .slice()
                .reverse()
                .map((ver, i) => ({
                  color: i === 0 ? "green" : "gray",
                  children: (
                    <div>
                      <Space>
                        <Text strong style={{ color: "#ee0033" }}>
                          v{ver.v}
                        </Text>
                        {i === 0 && <Tag color="green">HIỆN HÀNH</Tag>}
                      </Space>
                      <div>{ver.note}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {ver.date}
                      </Text>
                    </div>
                  ),
                }))}
            />
          ) : (
            <Text type="secondary">Chưa có phiên bản nào được deploy.</Text>
          )}
        </Card>
      </Col>
    </Row>
  );

  const formsTab = (
    <Card
      title="Cấu hình biểu mẫu (eForm) theo từng bước"
      extra={
        <Text type="secondary" style={{ fontSize: 12 }}>
          Mỗi User Task tham chiếu 1 biểu mẫu (formKey)
        </Text>
      }
    >
      {p.taskSteps && p.taskSteps.length > 0 ? (
        <EntityTable<TaskStep>
          rowKey="key"
          columns={stepColumns}
          dataSource={p.taskSteps}
          pagination={false}
        />
      ) : (
        <Empty description="Quy trình chưa nạp danh sách bước (User Task từ sơ đồ BPMN)." />
      )}
    </Card>
  );

  const bpmnTab = (
    <Card
      title="Sơ đồ BPMN"
      styles={{ body: { padding: 0 } }}
      extra={
        editingDiagram ? (
          <Space>
            <Button
              icon={<CloseOutlined />}
              onClick={() => setEditingDiagram(false)}
            >
              Huỷ
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveDiagram}
            >
              Lưu sơ đồ
            </Button>
          </Space>
        ) : (
          <Button
            icon={<EditOutlined />}
            onClick={() => setEditingDiagram(true)}
          >
            Chỉnh sửa sơ đồ
          </Button>
        )
      }
    >
      <Suspense
        fallback={
          <div style={{ padding: 60, textAlign: "center" }}>
            <Spin tip="Đang tải sơ đồ..." />
          </div>
        }
      >
        {editingDiagram ? (
          <BpmnEditor
            ref={bpmnEditRef}
            xml={p.bpmnXml || undefined}
            forms={formList}
          />
        ) : (
          <BpmnViewer xml={p.bpmnXml || undefined} />
        )}
      </Suspense>
    </Card>
  );

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Quản lý quy trình", to: "/quy-trinh" },
          { label: "Danh mục quy trình", to: "/quy-trinh" },
          { label: p.ma },
        ]}
        onBack={() => navigate("/quy-trinh")}
        title={p.ten}
        tag={<ProcessStatusTag status={p.trangThai} />}
        code={
          <>
            <Text code>{p.ma}</Text>{" "}
            <Text type="secondary">
              · {NHOM[p.nhom]} · v{curVer(p)}
            </Text>
          </>
        }
        extra={
          editing ? (
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={() => setEditing(false)}
              >
                Huỷ
              </Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={saveEdit}>
                Lưu
              </Button>
            </Space>
          ) : (
            <Space>
              <Button icon={<EditOutlined />} onClick={startEdit}>
                Chỉnh sửa
              </Button>
              {p.trangThai === "active" ? (
                <Popconfirm
                  title="Tạm ngừng quy trình?"
                  description="Quy trình sẽ ngừng nhận instance mới. Có thể kích hoạt lại sau."
                  okText="Tạm ngừng"
                  cancelText="Huỷ"
                  okButtonProps={{ danger: true }}
                  onConfirm={onToggle}
                >
                  <Button danger icon={<PauseCircleOutlined />}>
                    Tạm ngừng
                  </Button>
                </Popconfirm>
              ) : (
                <Button
                  icon={<PlayCircleOutlined />}
                  disabled={p.trangThai === "planned"}
                  onClick={onToggle}
                >
                  Kích hoạt
                </Button>
              )}
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                disabled={p.trangThai === "planned"}
                onClick={() => setDeployOpen(true)}
              >
                Deploy phiên bản mới
              </Button>
            </Space>
          )
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "info", label: "Thông tin", children: infoTab },
          {
            key: "forms",
            label: `Biểu mẫu theo bước${p.taskSteps ? ` (${p.taskSteps.length})` : ""}`,
            children: formsTab,
          },
          { key: "bpmn", label: "Sơ đồ BPMN", children: bpmnTab },
        ]}
      />

      {/* Deploy version modal */}
      <Modal
        open={deployOpen}
        title={`Deploy phiên bản mới — ${p.ma}`}
        okText="Deploy"
        cancelText="Huỷ"
        onOk={submitDeploy}
        onCancel={() => setDeployOpen(false)}
      >
        <Form form={deployForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item label="Tệp BPMN">
            <Upload.Dragger
              beforeUpload={() => false}
              maxCount={1}
              accept=".bpmn,.xml"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Kéo-thả hoặc bấm chọn tệp .bpmn</p>
              <p className="ant-upload-hint" style={{ fontSize: 12 }}>
                Mô phỏng — không upload thật.
              </p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="note" label="Ghi chú phiên bản">
            <Input placeholder="VD: Bổ sung bước ký số cho HĐ" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview form modal */}
      <Modal
        open={!!preview}
        title={`Xem trước biểu mẫu — ${getForm(preview ?? undefined)?.ten ?? ""}`}
        footer={null}
        width={640}
        destroyOnClose
        onCancel={() => setPreview(null)}
      >
        {preview && <FormRenderer schema={getForm(preview)!.schema} />}
      </Modal>
    </div>
  );
}
