import { useMemo, useState } from "react";
import { Button, Card, Col, Empty, Row, Space, Table, Tag, Typography } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import type { AvailableAction } from "../data/actionAvailability";
import type { SimulatorPreset } from "../data/simulatorPresets";
import { loadScenarios, type SavedScenario } from "../data/simulatorPresets";

const { Text } = Typography;

interface SimulatorCompareProps {
  /** Context A (vd: trước khi sửa policy). */
  actionsA: AvailableAction[];
  labelA?: string;
  /** Context B (vd: sau khi sửa policy). */
  actionsB: AvailableAction[];
  labelB?: string;
}

interface DiffRow {
  actionCode: string;
  label: string;
  inA: boolean;
  inB: boolean;
  enabledA?: boolean;
  enabledB?: boolean;
  changed: boolean;
}

function computeDiff(
  actionsA: AvailableAction[],
  actionsB: AvailableAction[],
): DiffRow[] {
  const allCodes = [
    ...new Set([
      ...actionsA.map((a) => a.actionCode),
      ...actionsB.map((a) => a.actionCode),
    ]),
  ];
  return allCodes
    .map((code) => {
      const a = actionsA.find((x) => x.actionCode === code);
      const b = actionsB.find((x) => x.actionCode === code);
      return {
        actionCode: code,
        label: (a ?? b)!.label,
        inA: !!a,
        inB: !!b,
        enabledA: a?.enabled,
        enabledB: b?.enabled,
        changed: !!a !== !!b || (a?.enabled ?? false) !== (b?.enabled ?? false),
      };
    })
    .sort((x, y) => {
      // changed first, then by label
      if (x.changed !== y.changed) return x.changed ? -1 : 1;
      return x.label.localeCompare(y.label);
    });
}

function actionSummary(actions: AvailableAction[]): string {
  const visible = actions.length;
  const enabled = actions.filter((a) => a.enabled).length;
  return `${visible} action (${enabled} bật)`;
}

export default function SimulatorCompare({
  actionsA,
  actionsB,
  labelA = "Ngữ cảnh A",
  labelB = "Ngữ cảnh B",
}: SimulatorCompareProps) {
  const diff = useMemo(
    () => computeDiff(actionsA, actionsB),
    [actionsA, actionsB],
  );
  const changedCount = diff.filter((d) => d.changed).length;
  const addedCount = diff.filter((d) => !d.inA && d.inB).length;
  const removedCount = diff.filter((d) => d.inA && !d.inB).length;

  const columns = [
    {
      title: "Action",
      dataIndex: "label",
      key: "label",
      render: (label: string, row: DiffRow) => (
        <Space>
          <Text>{label}</Text>
          {row.changed && (
            <Tag color="orange" style={{ fontSize: 10, lineHeight: "16px" }}>
              thay đổi
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: labelA,
      key: "a",
      width: 160,
      render: (_: unknown, row: DiffRow) => {
        if (!row.inA) return <Tag color="default">—</Tag>;
        return (
          <Tag
            color={row.enabledA ? "green" : "orange"}
            icon={
              row.enabledA ? <CheckCircleOutlined /> : <CloseCircleOutlined />
            }
          >
            {row.enabledA ? "Bật" : "Khoá"}
          </Tag>
        );
      },
    },
    {
      title: labelB,
      key: "b",
      width: 160,
      render: (_: unknown, row: DiffRow) => {
        if (!row.inB) return <Tag color="default">—</Tag>;
        return (
          <Tag
            color={row.enabledB ? "green" : "orange"}
            icon={
              row.enabledB ? <CheckCircleOutlined /> : <CloseCircleOutlined />
            }
          >
            {row.enabledB ? "Bật" : "Khoá"}
          </Tag>
        );
      },
    },
  ];

  // Summary stats
  const stats = (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={8}>
        <Card size="small">
          <Text type="secondary" style={{ fontSize: 12 }}>
            {labelA}
          </Text>
          <div>
            <Text strong>{actionSummary(actionsA)}</Text>
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card size="small">
          <Text type="secondary" style={{ fontSize: 12 }}>
            {labelB}
          </Text>
          <div>
            <Text strong>{actionSummary(actionsB)}</Text>
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card
          size="small"
          style={{
            borderColor: changedCount > 0 ? "var(--vht-red)" : undefined,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Khác biệt
          </Text>
          <div>
            {changedCount === 0 ? (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Không thay đổi
              </Tag>
            ) : (
              <Space size={4}>
                {addedCount > 0 && <Tag color="green">+{addedCount} thêm</Tag>}
                {removedCount > 0 && <Tag color="red">-{removedCount} mất</Tag>}
                <Tag color="orange">{changedCount} thay đổi</Tag>
              </Space>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div>
      {stats}
      {diff.length === 0 ? (
        <Empty description="Không có action nào ở cả hai ngữ cảnh" />
      ) : (
        <Table
          dataSource={diff}
          columns={columns}
          rowKey="actionCode"
          size="small"
          pagination={false}
          locale={{ emptyText: "—" }}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Regression Runner (Slice P)
// ════════════════════════════════════════════════════════════════════════════

interface RegressionRunnerProps {
  /** Hàm lấy actions cho một context — gọi getAvailableActions hoặc getDebugActions. */
  runContext: (preset: SimulatorPreset) => AvailableAction[];
}

interface RegressionResult {
  scenario: SavedScenario;
  actions: AvailableAction[];
  error?: string;
}

export function RegressionRunner({ runContext }: RegressionRunnerProps) {
  const [results, setResults] = useState<RegressionResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    const scenarios = loadScenarios();
    const res: RegressionResult[] = [];

    // Chạy tuần tự để tránh UI đơ
    setTimeout(() => {
      for (const s of scenarios) {
        try {
          const actions = runContext(s.preset);
          res.push({ scenario: s, actions });
        } catch (e) {
          res.push({
            scenario: s,
            actions: [],
            error: String(e),
          });
        }
      }
      setResults(res);
      setRunning(false);
    }, 100);
  };

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          loading={running}
          onClick={handleRun}
        >
          Chạy tất cả kịch bản
        </Button>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Chạy getAvailableActions cho từng kịch bản đã lưu trong localStorage.
        </Text>
      </Space>

      {results && results.length === 0 && (
        <Empty description="Chưa có kịch bản nào được lưu." />
      )}

      {results && results.length > 0 && (
        <Table
          dataSource={results}
          rowKey={(r) => r.scenario.id}
          size="small"
          pagination={false}
          columns={[
            {
              title: "Kịch bản",
              dataIndex: ["scenario", "name"],
              key: "name",
              render: (name: string, r: RegressionResult) => (
                <Space direction="vertical" size={0}>
                  <Text strong>{name}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {r.scenario.preset.processCode} ·{" "}
                    {r.scenario.preset.taskDefinitionKey ?? "không pin bước"}
                  </Text>
                </Space>
              ),
            },
            {
              title: "Kết quả",
              key: "result",
              width: 200,
              render: (_: unknown, r: RegressionResult) => {
                if (r.error) {
                  return (
                    <Tag color="red" icon={<CloseCircleOutlined />}>
                      Lỗi: {r.error}
                    </Tag>
                  );
                }
                const enabled = r.actions.filter((a) => a.enabled).length;
                const total = r.actions.length;
                return (
                  <Space>
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      OK
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {total} action ({enabled} bật)
                    </Text>
                  </Space>
                );
              },
            },
            {
              title: "Action hiển thị",
              key: "actions",
              render: (_: unknown, r: RegressionResult) => {
                if (r.error) return null;
                return (
                  <Space wrap size={[4, 4]}>
                    {r.actions.map((a) => (
                      <Tag
                        key={a.actionCode}
                        color={a.enabled ? "green" : "default"}
                        style={{ opacity: a.enabled ? 1 : 0.6 }}
                      >
                        {a.label}
                      </Tag>
                    ))}
                  </Space>
                );
              },
            },
          ]}
          expandable={{
            expandedRowRender: (r: RegressionResult) => {
              if (r.error) return <Text type="danger">{r.error}</Text>;
              return (
                <pre
                  style={{
                    fontSize: 11,
                    maxHeight: 200,
                    overflow: "auto",
                    margin: 0,
                    padding: 8,
                    background: "var(--vht-surface-2)",
                    borderRadius: 4,
                  }}
                >
                  {JSON.stringify(
                    r.actions.map((a) => ({
                      code: a.actionCode,
                      label: a.label,
                      enabled: a.enabled,
                      type: a.type,
                      group: a.uiGroup,
                    })),
                    null,
                    2,
                  )}
                </pre>
              );
            },
          }}
        />
      )}
    </div>
  );
}
