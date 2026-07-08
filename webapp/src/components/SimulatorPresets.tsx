import { useState, useCallback } from "react";
import {
  Button,
  List,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
  Input,
  App,
} from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  BUILT_IN_PRESETS,
  deleteScenario,
  exportContext,
  loadScenarios,
  saveScenario,
  type SavedScenario,
  type SimulatorPreset,
} from "../data/simulatorPresets";

const { Text } = Typography;

interface SimulatorPresetsProps {
  currentPreset: SimulatorPreset;
  onApplyPreset: (preset: SimulatorPreset) => void;
}

const DEFAULT_PRESET = BUILT_IN_PRESETS[0]; // "Người nộp hồ sơ"

/** Kiểm tra preset hiện tại có khớp với preset được chọn không (so sánh theo id). */
function isActivePreset(
  current: SimulatorPreset,
  preset: SimulatorPreset,
): boolean {
  return (
    current.processCode === preset.processCode &&
    current.dossierStatus === preset.dossierStatus &&
    current.taskDefinitionKey === preset.taskDefinitionKey &&
    current.isAdmin === preset.isAdmin &&
    current.canRequestOnCurrentStep === preset.canRequestOnCurrentStep
  );
}

export default function SimulatorPresets({
  currentPreset,
  onApplyPreset,
}: SimulatorPresetsProps) {
  const { message: msgApi } = App.useApp();
  const [scenarios, setScenarios] = useState<SavedScenario[]>(loadScenarios);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showScenarios, setShowScenarios] = useState(false);

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return;
    const updated = saveScenario(saveName.trim(), currentPreset);
    setScenarios(updated);
    setSaveModalOpen(false);
    setSaveName("");
    msgApi.success(`Đã lưu kịch bản "${saveName.trim()}"`);
  }, [saveName, currentPreset, msgApi]);

  const handleDelete = useCallback((id: string) => {
    const updated = deleteScenario(id);
    setScenarios(updated);
  }, []);

  const handleCopy = useCallback(() => {
    const json = exportContext(currentPreset);
    navigator.clipboard.writeText(json).then(
      () => msgApi.success("Đã copy context vào clipboard"),
      () => msgApi.error("Không thể copy vào clipboard"),
    );
  }, [currentPreset, msgApi]);

  return (
    <div style={{ marginBottom: 12 }}>
      <Space wrap size={[8, 8]} style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Preset:
        </Text>
        {BUILT_IN_PRESETS.map((preset) => (
          <Tooltip key={preset.id} title={preset.description}>
            <Button
              size="small"
              type={
                isActivePreset(currentPreset, preset) ? "primary" : "default"
              }
              icon={<UserOutlined />}
              onClick={() => onApplyPreset(preset)}
            >
              {preset.label}
            </Button>
          </Tooltip>
        ))}
        <Tooltip title="Reset về mặc định (Người nộp hồ sơ)">
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => onApplyPreset(DEFAULT_PRESET)}
          >
            Reset
          </Button>
        </Tooltip>
        <Tooltip title="Copy context JSON vào clipboard">
          <Button size="small" icon={<CopyOutlined />} onClick={handleCopy} />
        </Tooltip>
        <Button
          size="small"
          icon={<SaveOutlined />}
          onClick={() => setSaveModalOpen(true)}
        >
          Lưu kịch bản
        </Button>
        <Button
          size="small"
          icon={<DownloadOutlined />}
          onClick={() => setShowScenarios(!showScenarios)}
          type={showScenarios ? "primary" : "default"}
        >
          Kịch bản đã lưu
          {scenarios.length > 0 && (
            <Tag
              color="blue"
              style={{ marginLeft: 4, fontSize: 10, lineHeight: "16px" }}
            >
              {scenarios.length}
            </Tag>
          )}
        </Button>
      </Space>

      {showScenarios && scenarios.length > 0 && (
        <List
          size="small"
          bordered
          dataSource={scenarios}
          style={{ marginTop: 8, maxHeight: 200, overflow: "auto" }}
          renderItem={(s) => (
            <List.Item
              actions={[
                <Button
                  key="load"
                  size="small"
                  type="link"
                  onClick={() => onApplyPreset(s.preset)}
                >
                  Áp dụng
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Xoá kịch bản này?"
                  onConfirm={() => handleDelete(s.id)}
                >
                  <Button
                    size="small"
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Text strong style={{ fontSize: 13 }}>
                    {s.name}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {s.preset.processCode} ·{" "}
                    {s.preset.taskDefinitionKey ?? "không pin bước"} ·{" "}
                    {new Date(s.createdAt).toLocaleString("vi-VN")}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
      {showScenarios && scenarios.length === 0 && (
        <Text
          type="secondary"
          style={{ fontSize: 12, marginTop: 8, display: "block" }}
        >
          Chưa có kịch bản nào được lưu.
        </Text>
      )}

      <Modal
        title="Lưu kịch bản mô phỏng"
        open={saveModalOpen}
        onOk={handleSave}
        onCancel={() => {
          setSaveModalOpen(false);
          setSaveName("");
        }}
        okText="Lưu"
        cancelText="Huỷ"
        okButtonProps={{ disabled: !saveName.trim() }}
      >
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Lưu ngữ cảnh hiện tại để kiểm thử lại sau. Kịch bản được lưu vào
            localStorage của trình duyệt.
          </Text>
        </div>
        <Input
          placeholder="Tên kịch bản (vd: RD01.01 - Người nộp - bước t1)"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          onPressEnter={handleSave}
        />
      </Modal>
    </div>
  );
}
