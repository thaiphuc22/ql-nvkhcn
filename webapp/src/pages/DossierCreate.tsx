import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { FileAddOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import {
  GIAI_DOAN,
  GIAI_DOAN_COLOR,
  GIAI_DOAN_ORDER,
  chuNhiemLabel,
  type NhiemVu,
} from "../data/nhiemVu";
import {
  LOAI_TO_GIAIDOAN,
  LOAI_TO_NHOM,
  createDraftHoSo,
  nextHoSoId,
  type Dossier,
  type HoSoLoai,
} from "../data/dossiers";
import { useNhiemVu } from "../store/NhiemVuContext";
import { useDossiers } from "../store/DossierContext";
import { usePermissions } from "../store/AuthContext";
import { PageHeader, DossierStatusTag, EntityTable } from "../components/ui";
import HelpButton from "../components/HelpButton";

const { Text, Paragraph } = Typography;

const HO_SO_LOAI: HoSoLoai[] = [
  "Chủ trương",
  "Xét duyệt",
  "Báo cáo",
  "Điều chỉnh",
  "Nghiệm thu",
  "Quyết toán",
];

const DOCUMENTS_BY_LOAI: Record<HoSoLoai, string[]> = {
  "Chủ trương": ["Thuyết minh đề tài.pdf", "Dự toán PL1-PL6.xlsx"],
  "Xét duyệt": [
    "Hồ sơ xét duyệt.pdf",
    "Dự toán PL1-PL6.xlsx",
    "Biên bản họp HĐXD.pdf",
  ],
  "Báo cáo": ["Báo cáo định kỳ.pdf", "Phụ lục tiến độ.xlsx"],
  "Điều chỉnh": [
    "Tờ trình điều chỉnh.pdf",
    "Căn cứ điều chỉnh.pdf",
    "Phụ lục dự toán/thời gian.xlsx",
  ],
  "Nghiệm thu": [
    "Báo cáo tổng kết.pdf",
    "Sản phẩm và kết quả.zip",
    "Biên bản nghiệm thu.pdf",
  ],
  "Quyết toán": [
    "Báo cáo quyết toán.pdf",
    "Bảng tổng hợp chi phí.xlsx",
    "Chứng từ kèm theo.zip",
  ],
};

function documentType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls") return "Excel";
  if (ext === "zip" || ext === "rar") return "Archive";
  return "PDF";
}

interface FormValues {
  maNV: string;
  loai: HoSoLoai;
  nguoiKhoiTao: string;
  ngayTao: Dayjs;
  taiLieu: string[];
}

export default function DossierCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const { list: nhiemVuList, getByMa } = useNhiemVu();
  const { list: dossiers, createHoSo } = useDossiers();
  const { canCreateHoSo } = usePermissions();

  const selectedMaNV = Form.useWatch("maNV", form);
  const selectedLoai = Form.useWatch("loai", form);
  const selectedNv = selectedMaNV ? getByMa(selectedMaNV) : undefined;

  const dossierHistory = useMemo(
    () => (selectedMaNV ? dossiers.filter((d) => d.maNV === selectedMaNV) : []),
    [dossiers, selectedMaNV],
  );

  useEffect(() => {
    const maNV = params.get("maNV");
    if (!maNV || !getByMa(maNV)) return;
    form.setFieldsValue({ maNV });
  }, [form, getByMa, params]);

  useEffect(() => {
    if (!selectedNv) return;
    const current = form.getFieldValue("nguoiKhoiTao");
    if (!current)
      form.setFieldsValue({ nguoiKhoiTao: chuNhiemLabel(selectedNv.chuNhiem) });
  }, [form, selectedNv]);

  useEffect(() => {
    if (!selectedLoai) return;
    form.setFieldsValue({ taiLieu: DOCUMENTS_BY_LOAI[selectedLoai] });
  }, [form, selectedLoai]);

  const warnings = useMemo(() => {
    if (!selectedNv || !selectedLoai) return [];
    const targetStage = LOAI_TO_GIAIDOAN[selectedLoai];
    const currentIndex = GIAI_DOAN_ORDER.indexOf(selectedNv.giaiDoan);
    const targetIndex = GIAI_DOAN_ORDER.indexOf(targetStage);
    const result: string[] = [];
    if (selectedLoai === "Chủ trương") {
      result.push(
        "Hồ sơ Chủ trương thường được sinh cùng lúc tạo mới Nhiệm vụ KHCN.",
      );
    }
    if (targetIndex > currentIndex) {
      result.push(
        `Loại hồ sơ thuộc giai đoạn ${GIAI_DOAN[targetStage]}, sau giai đoạn hiện tại của nhiệm vụ.`,
      );
    }
    if (targetIndex < currentIndex) {
      result.push(
        `Loại hồ sơ thuộc giai đoạn ${GIAI_DOAN[targetStage]}, trước giai đoạn hiện tại của nhiệm vụ.`,
      );
    }
    return result;
  }, [selectedLoai, selectedNv]);

  const onFinish = (values: FormValues) => {
    const nv = getByMa(values.maNV);
    if (!nv) return;

    const id = nextHoSoId(dossiers);
    createHoSo(
      createDraftHoSo(nv, {
        id,
        loai: values.loai,
        nguoiKhoiTao: values.nguoiKhoiTao.trim(),
        ngayTao: values.ngayTao.format("YYYY-MM-DD"),
        thoiDiemKhoiTao: values.ngayTao.format("DD/MM/YYYY HH:mm"),
        taiLieu: values.taiLieu.map((ten) => ({
          ten,
          loai: documentType(ten),
        })),
      }),
    );
    message.success(`Đã tạo hồ sơ ${id} ở trạng thái Khởi tạo.`);
    navigate(`/ho-so/${encodeURIComponent(id)}`);
  };

  const historyColumns: ColumnsType<Dossier> = [
    {
      title: "Mã hồ sơ",
      dataIndex: "id",
      width: 130,
      render: (v: string) => <Text code>{v}</Text>,
    },
    {
      title: "Loại",
      dataIndex: "loai",
      width: 120,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Quy trình",
      dataIndex: "quyTrinh",
      width: 110,
      render: (v: string) =>
        v ? <Tag>{v}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 140,
      render: (_, r) => <DossierStatusTag status={r.trangThai} />,
    },
    { title: "Ngày tạo", dataIndex: "ngayTao", width: 110 },
  ];

  if (!canCreateHoSo) {
    return (
      <div>
        <PageHeader
          breadcrumb={[
            { label: "Hồ sơ Nhiệm vụ KHCN", to: "/ho-so" },
            { label: "Tạo mới" },
          ]}
          onBack={() => navigate("/ho-so")}
          title="Tạo mới Hồ sơ"
          extra={<HelpButton section="hoso" />}
        />
        <Alert
          type="warning"
          showIcon
          message="Bạn không có quyền tạo hồ sơ."
          description="Chức năng tạo hồ sơ dành cho vai trò khởi tạo/soạn thảo theo quy trình nghiệp vụ."
          action={
            <Button onClick={() => navigate("/ho-so")}>Về danh sách</Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: "Hồ sơ Nhiệm vụ KHCN", to: "/ho-so" },
          { label: "Tạo mới" },
        ]}
        onBack={() => navigate("/ho-so")}
        icon={<FileAddOutlined style={{ fontSize: 24, color: "#ee0033" }} />}
        title="Tạo mới Hồ sơ"
        extra={<HelpButton section="hoso" />}
      />

      <Form<FormValues>
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={{ ngayTao: dayjs(), taiLieu: [] }}
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <Card title="Thông tin khởi tạo" style={{ marginBottom: 16 }}>
              <Form.Item
                label="Nhiệm vụ KHCN"
                name="maNV"
                rules={[{ required: true, message: "Chọn nhiệm vụ KHCN." }]}
              >
                <Select
                  showSearch
                  placeholder="Tìm theo mã, tên nhiệm vụ, chủ nhiệm..."
                  optionFilterProp="label"
                  options={nhiemVuList.map((nv) => ({
                    value: nv.ma,
                    label: `${nv.ma} – ${nv.ten}`,
                    searchText: `${nv.ma} ${nv.ten} ${chuNhiemLabel(nv.chuNhiem)}`,
                  }))}
                  optionRender={(option) => (
                    <Space direction="vertical" size={0}>
                      <Text strong>{option.data.value}</Text>
                      <Text type="secondary">{option.data.searchText}</Text>
                    </Space>
                  )}
                />
              </Form.Item>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Loại hồ sơ"
                    name="loai"
                    rules={[{ required: true, message: "Chọn loại hồ sơ." }]}
                  >
                    <Select
                      placeholder="Chọn loại hồ sơ"
                      options={HO_SO_LOAI.map((loai) => ({
                        value: loai,
                        label: `${loai} (${LOAI_TO_NHOM[loai]})`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Ngày tạo"
                    name="ngayTao"
                    rules={[{ required: true, message: "Chọn ngày tạo." }]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY HH:mm"
                      showTime
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Người khởi tạo"
                name="nguoiKhoiTao"
                rules={[{ required: true, message: "Nhập người khởi tạo." }]}
              >
                <Input placeholder="VD: TS. Trần Văn Nam" />
              </Form.Item>

              <Form.Item label="Tài liệu thành phần" name="taiLieu">
                <Checkbox.Group style={{ width: "100%" }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {(selectedLoai ? DOCUMENTS_BY_LOAI[selectedLoai] : []).map(
                      (doc) => (
                        <Checkbox key={doc} value={doc}>
                          {doc}
                        </Checkbox>
                      ),
                    )}
                  </Space>
                </Checkbox.Group>
              </Form.Item>

              {warnings.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message="Cảnh báo nghiệp vụ"
                  description={
                    <Space direction="vertical" size={2}>
                      {warnings.map((w) => (
                        <span key={w}>{w}</span>
                      ))}
                    </Space>
                  }
                />
              )}

              <Space>
                <Button onClick={() => navigate("/ho-so")}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                >
                  Tạo hồ sơ
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="Tóm tắt Nhiệm vụ" style={{ marginBottom: 16 }}>
              {selectedNv ? (
                <NhiemVuSummary nv={selectedNv} />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa chọn nhiệm vụ"
                />
              )}
            </Card>

            <Card title="Preview quy trình" style={{ marginBottom: 16 }}>
              {selectedLoai ? (
                <Space direction="vertical" size={8}>
                  <Text>
                    Loại hồ sơ: <Tag color="blue">{selectedLoai}</Tag>
                  </Text>
                  <Text>
                    Nhóm quy trình khả dụng khi Gửi duyệt:{" "}
                    <Tag>{LOAI_TO_NHOM[selectedLoai]}</Tag>
                  </Text>
                  <Text>Trạng thái sau khi tạo: Khởi tạo</Text>
                  <Text type="secondary">
                    Bước tiếp theo: vào chi tiết hồ sơ và bấm Gửi duyệt.
                  </Text>
                </Space>
              ) : (
                <Text type="secondary">
                  Chọn loại hồ sơ để xem nhóm quy trình tương ứng.
                </Text>
              )}
            </Card>

            <Card
              title={`Hồ sơ đã có của nhiệm vụ (${dossierHistory.length})`}
              size="small"
            >
              <Paragraph
                type="secondary"
                style={{ fontSize: 12, marginTop: 0 }}
              >
                Dùng để kiểm tra nhanh quan hệ 1 Nhiệm vụ - nhiều Hồ sơ trước
                khi tạo bản nháp mới.
              </Paragraph>
              <EntityTable<Dossier>
                rowKey="id"
                columns={historyColumns}
                dataSource={dossierHistory}
                pageSize={4}
                onRowClick={(r) =>
                  navigate(`/ho-so/${encodeURIComponent(r.id)}`)
                }
                emptyText="Nhiệm vụ này chưa có hồ sơ."
              />
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

function NhiemVuSummary({ nv }: { nv: NhiemVu }) {
  return (
    <Descriptions column={1} size="small" bordered>
      <Descriptions.Item label="Mã NV KHCN">{nv.ma}</Descriptions.Item>
      <Descriptions.Item label="Tên nhiệm vụ">{nv.ten}</Descriptions.Item>
      <Descriptions.Item label="Chủ nhiệm">
        {chuNhiemLabel(nv.chuNhiem)}
      </Descriptions.Item>
      <Descriptions.Item label="Đơn vị chủ trì">
        {nv.donViChuTri}
      </Descriptions.Item>
      <Descriptions.Item label="Cấp">{nv.cap}</Descriptions.Item>
      <Descriptions.Item label="Giai đoạn hiện tại">
        <Tag color={GIAI_DOAN_COLOR[nv.giaiDoan]}>{GIAI_DOAN[nv.giaiDoan]}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Dự toán">{nv.duToan}</Descriptions.Item>
      <Descriptions.Item label="Thời gian thực hiện">
        {nv.thoiGianThucHien}
      </Descriptions.Item>
    </Descriptions>
  );
}
