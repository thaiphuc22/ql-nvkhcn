import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { seedIntegrations } from '../data/camundaOps'
import {
  DEFAULT_ERROR_POLICY,
  DOSSIER_OUTPUT_FIELD_WHITELIST,
  type RetryBackoff,
  type ServiceTaskConfigVersion,
  type ServiceTaskDefinition,
  type ServiceTaskErrorPolicy,
  type ServiceTaskExecutionConfig,
  type ServiceTaskFailurePolicy,
  type ServiceTaskInputMapping,
  type ServiceTaskOutputMapping,
  type ServiceTaskTypeCode,
} from '../data/serviceTasks'
import { useAuth } from '../store/AuthContext'
import { useIntegrationMapping } from '../store/IntegrationMappingContext'
import { useServiceTasks } from '../store/ServiceTaskContext'
import ServiceTaskMappingEditor from './ServiceTaskMappingEditor'

const { Text } = Typography

interface ServiceTaskFormDrawerProps {
  open: boolean
  definition?: ServiceTaskDefinition
  onClose: () => void
}

interface FormValues {
  code: string
  name: string
  description?: string
  typeCode: ServiceTaskTypeCode
  ownerModule: string
  tags?: string[]
  templateCode?: string
  channels?: Array<'email' | 'in_app' | 'sms' | 'zalo'>
  recipientExpression?: string
  subjectExpression?: string
  connectorKey?: string
  mappingConfigId?: string
  endpointAction?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH'
  idempotencyKeyExpression?: string
  allowedFields?: string[]
  updateField?: string
  updateValueExpression?: string
  outputFolderExpression?: string
  attachToDossier?: boolean
  decisionCode?: string
  decisionVersion?: string
  resultVariable?: string
  timeoutMs?: number
  maxRetry?: number
  retryDelayMs?: number
  retryBackoff?: RetryBackoff
  onFailure?: ServiceTaskFailurePolicy
  notifyRoles?: string[]
  changeNote?: string
}

function latestVersion(versions: ServiceTaskConfigVersion[]): ServiceTaskConfigVersion | undefined {
  return [...versions].sort((a, b) => b.versionNo - a.versionNo)[0]
}

function configToFields(version?: ServiceTaskConfigVersion): Partial<FormValues> {
  if (!version) return {}
  const config = version.configJson
  if (config.typeCode === 'SEND_NOTIFICATION') {
    return {
      templateCode: config.templateCode,
      channels: config.channels,
      recipientExpression: config.recipientExpression,
      subjectExpression: config.subjectExpression,
    }
  }
  if (config.typeCode === 'CALL_API') {
    return {
      connectorKey: config.connectorKey,
      mappingConfigId: config.mappingConfigId,
      endpointAction: config.endpointAction,
      method: config.method,
      idempotencyKeyExpression: config.idempotencyKeyExpression,
    }
  }
  if (config.typeCode === 'UPDATE_DOSSIER') {
    const firstUpdate = config.updates[0]
    return {
      allowedFields: config.allowedFields,
      updateField: firstUpdate?.field,
      updateValueExpression: firstUpdate?.valueExpression,
    }
  }
  if (config.typeCode === 'GENERATE_DOCUMENT') {
    return {
      templateCode: config.templateCode,
      outputFolderExpression: config.outputFolderExpression,
      attachToDossier: config.attachToDossier,
    }
  }
  return {
    decisionCode: config.decisionCode,
    decisionVersion: config.decisionVersion,
    resultVariable: config.resultVariable,
  }
}

function buildConfig(values: FormValues): ServiceTaskExecutionConfig {
  if (values.typeCode === 'SEND_NOTIFICATION') {
    return {
      typeCode: values.typeCode,
      templateCode: values.templateCode ?? '',
      channels: values.channels ?? ['in_app'],
      recipientExpression: values.recipientExpression ?? '',
      subjectExpression: values.subjectExpression,
    }
  }
  if (values.typeCode === 'CALL_API') {
    return {
      typeCode: values.typeCode,
      connectorKey: values.connectorKey ?? '',
      mappingConfigId: values.mappingConfigId,
      endpointAction: values.endpointAction ?? '',
      method: values.method ?? 'POST',
      idempotencyKeyExpression: values.idempotencyKeyExpression,
    }
  }
  if (values.typeCode === 'UPDATE_DOSSIER') {
    const updateField = values.updateField ?? ''
    return {
      typeCode: values.typeCode,
      allowedFields: values.allowedFields ?? [],
      updates: updateField
        ? [{ field: updateField, valueExpression: values.updateValueExpression ?? '' }]
        : [],
    }
  }
  if (values.typeCode === 'GENERATE_DOCUMENT') {
    return {
      typeCode: values.typeCode,
      templateCode: values.templateCode ?? '',
      outputFolderExpression: values.outputFolderExpression,
      attachToDossier: values.attachToDossier ?? true,
    }
  }
  return {
    typeCode: values.typeCode,
    decisionCode: values.decisionCode ?? '',
    decisionVersion: values.decisionVersion,
    resultVariable: values.resultVariable ?? '',
  }
}

function buildPolicy(values: FormValues): ServiceTaskErrorPolicy {
  return {
    ...DEFAULT_ERROR_POLICY,
    timeoutMs: values.timeoutMs ?? DEFAULT_ERROR_POLICY.timeoutMs,
    maxRetry: values.maxRetry ?? DEFAULT_ERROR_POLICY.maxRetry,
    retryDelayMs: values.retryDelayMs ?? DEFAULT_ERROR_POLICY.retryDelayMs,
    retryBackoff: values.retryBackoff ?? DEFAULT_ERROR_POLICY.retryBackoff,
    onFailure: values.onFailure ?? DEFAULT_ERROR_POLICY.onFailure,
    notifyRoles: values.notifyRoles ?? DEFAULT_ERROR_POLICY.notifyRoles,
  }
}

export default function ServiceTaskFormDrawer({ open, definition, onClose }: ServiceTaskFormDrawerProps) {
  const { message } = App.useApp()
  const { user } = useAuth()
  const serviceTasks = useServiceTasks()
  const integrationMapping = useIntegrationMapping()
  const [form] = Form.useForm<FormValues>()
  const [inputMapping, setInputMapping] = useState<ServiceTaskInputMapping[]>([])
  const [outputMapping, setOutputMapping] = useState<ServiceTaskOutputMapping[]>([])
  const typeCode = Form.useWatch('typeCode', form)

  const version = useMemo(
    () => (definition ? latestVersion(serviceTasks.getVersions(definition.id)) : undefined),
    [definition, serviceTasks],
  )

  useEffect(() => {
    if (!open) return
    const policy = version?.errorPolicy ?? DEFAULT_ERROR_POLICY
    form.setFieldsValue({
      code: definition?.code ?? '',
      name: definition?.name ?? '',
      description: definition?.description ?? '',
      typeCode: definition?.typeCode ?? 'SEND_NOTIFICATION',
      ownerModule: definition?.ownerModule ?? 'Workflow Platform',
      tags: definition?.tags ?? [],
      timeoutMs: policy.timeoutMs,
      maxRetry: policy.maxRetry,
      retryDelayMs: policy.retryDelayMs,
      retryBackoff: policy.retryBackoff,
      onFailure: policy.onFailure,
      notifyRoles: policy.notifyRoles,
      changeNote: definition ? 'Cập nhật cấu hình từ drawer.' : 'Tạo cấu hình Service Task.',
      ...configToFields(version),
    })
    setInputMapping(version?.inputMapping ?? [])
    setOutputMapping(version?.outputMapping ?? [])
  }, [definition, form, open, version])

  const connectorOptions = seedIntegrations.map((item) => ({
    label: `${item.key} - ${item.ten}`,
    value: item.key,
  }))
  const mappingOptions = integrationMapping.list
    .filter((item) => !form.getFieldValue('connectorKey') || item.he === form.getFieldValue('connectorKey'))
    .map((item) => ({
      label: `${item.id} - ${item.doiTuong} v${item.version}`,
      value: item.id,
    }))

  const submit = async () => {
    const values = await form.validateFields()
    const actor = user?.email ?? 'admin'
    const patch = {
      configJson: buildConfig(values),
      inputMapping,
      outputMapping,
      errorPolicy: buildPolicy(values),
    }

    if (definition) {
      serviceTasks.updateDefinition(
        definition.id,
        {
          code: values.code.trim(),
          name: values.name.trim(),
          description: values.description?.trim() ?? '',
          typeCode: values.typeCode,
          ownerModule: values.ownerModule.trim(),
          tags: values.tags ?? [],
        },
        actor,
      )
      serviceTasks.saveDraftVersion(definition.id, patch, values.changeNote ?? 'Cập nhật cấu hình.', actor)
      message.success('Đã lưu bản nháp cấu hình.')
    } else {
      const id = serviceTasks.createDefinition({
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() ?? '',
        typeCode: values.typeCode,
        ownerModule: values.ownerModule.trim(),
        tags: values.tags ?? [],
        actor,
      })
      serviceTasks.saveDraftVersion(id, patch, values.changeNote ?? 'Tạo cấu hình.', actor)
      message.success('Đã tạo cấu hình Service Task.')
    }
    onClose()
  }

  const renderExecutionConfig = () => {
    if (typeCode === 'CALL_API') {
      return (
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="connectorKey" label="Connector" rules={[{ required: true }]}>
              <Select options={connectorOptions} showSearch optionFilterProp="label" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="mappingConfigId" label="Mapping active" rules={[{ required: true }]}>
              <Select options={mappingOptions} showSearch optionFilterProp="label" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endpointAction" label="Endpoint/action" rules={[{ required: true }]}>
              <Input placeholder="budget/sync" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="method" label="Method" rules={[{ required: true }]}>
              <Select options={['GET', 'POST', 'PUT', 'PATCH'].map((value) => ({ label: value, value }))} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="idempotencyKeyExpression" label="Idempotency key">
              <Input placeholder="${dossier.id}-${variables.configVersion}" />
            </Form.Item>
          </Col>
        </Row>
      )
    }

    if (typeCode === 'UPDATE_DOSSIER') {
      return (
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item name="allowedFields" label="Field hồ sơ được phép cập nhật" rules={[{ required: true }]}>
              <Select
                mode="multiple"
                options={DOSSIER_OUTPUT_FIELD_WHITELIST.map((value) => ({ label: value, value }))}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="updateField" label="Field cập nhật" rules={[{ required: true }]}>
              <Select options={DOSSIER_OUTPUT_FIELD_WHITELIST.map((value) => ({ label: value, value }))} />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item name="updateValueExpression" label="Giá trị" rules={[{ required: true }]}>
              <Input placeholder="${variables.nextDossierStatus}" />
            </Form.Item>
          </Col>
        </Row>
      )
    }

    if (typeCode === 'GENERATE_DOCUMENT') {
      return (
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="templateCode" label="Template tài liệu" rules={[{ required: true }]}>
              <Input placeholder="qd-cong-nhan" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="outputFolderExpression" label="Thư mục xuất">
              <Input placeholder="dossier/${dossier.id}/documents" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="attachToDossier" label="Gắn vào hồ sơ" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      )
    }

    if (typeCode === 'EVALUATE_DECISION') {
      return (
        <Row gutter={12}>
          <Col span={10}>
            <Form.Item name="decisionCode" label="Mã decision" rules={[{ required: true }]}>
              <Input placeholder="rd02-routing" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="decisionVersion" label="Version">
              <Input placeholder="1.0" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="resultVariable" label="Biến kết quả" rules={[{ required: true }]}>
              <Input placeholder="rd02RoutingDecision" />
            </Form.Item>
          </Col>
        </Row>
      )
    }

    return (
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="templateCode" label="Template thông báo" rules={[{ required: true }]}>
            <Input placeholder="tpl-dossier-approved" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="channels" label="Kênh gửi" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              options={[
                { label: 'Email', value: 'email' },
                { label: 'In-app', value: 'in_app' },
                { label: 'SMS', value: 'sms' },
                { label: 'Zalo', value: 'zalo' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="recipientExpression" label="Người nhận" rules={[{ required: true }]}>
            <Input placeholder="${initiator.email}" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="subjectExpression" label="Tiêu đề">
            <Input placeholder="Hồ sơ ${dossier.id} đã được phê duyệt" />
          </Form.Item>
        </Col>
      </Row>
    )
  }

  return (
    <Drawer
      title={definition ? 'Sửa cấu hình Service Task' : 'Tạo cấu hình Service Task'}
      open={open}
      onClose={onClose}
      width={920}
      extra={
        <Space>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={submit}>
            Lưu nháp
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" initialValues={{ typeCode: 'SEND_NOTIFICATION' }}>
        <Tabs
          items={[
            {
              key: 'overview',
              label: 'Tổng quan',
              children: (
                <Row gutter={12}>
                  <Col span={10}>
                    <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
                      <Input placeholder="SYNC_SAP_BUDGET" />
                    </Form.Item>
                  </Col>
                  <Col span={14}>
                    <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
                      <Input placeholder="Đồng bộ dự toán sang SAP" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="description" label="Mô tả">
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="typeCode" label="Loại" rules={[{ required: true }]}>
                      <Select
                        disabled={Boolean(definition)}
                        options={serviceTasks.types.map((type) => ({
                          label: `${type.name} (${type.code})`,
                          value: type.code,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="ownerModule" label="Module sở hữu" rules={[{ required: true }]}>
                      <Input placeholder="Workflow Platform" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="tags" label="Tags">
                      <Select mode="tags" tokenSeparators={[',']} />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'execution',
              label: 'Cấu hình thực thi',
              children: (
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Text type="secondary">Không hỗ trợ script tùy ý; chỉ chọn executor và tham số đã kiểm soát.</Text>
                  {renderExecutionConfig()}
                </Space>
              ),
            },
            {
              key: 'input',
              label: 'Input mapping',
              children: <ServiceTaskMappingEditor mode="input" value={inputMapping} onChange={setInputMapping} />,
            },
            {
              key: 'output',
              label: 'Output mapping',
              children: <ServiceTaskMappingEditor mode="output" value={outputMapping} onChange={setOutputMapping} />,
            },
            {
              key: 'policy',
              label: 'Chính sách lỗi',
              children: (
                <Row gutter={12}>
                  <Col span={8}>
                    <Form.Item name="timeoutMs" label="Timeout (ms)" rules={[{ required: true }]}>
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="maxRetry" label="Số lần retry" rules={[{ required: true }]}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="retryDelayMs" label="Delay retry (ms)" rules={[{ required: true }]}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="retryBackoff" label="Backoff" rules={[{ required: true }]}>
                      <Select
                        options={[
                          { label: 'Cố định', value: 'fixed' },
                          { label: 'Tăng dần', value: 'exponential' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="onFailure" label="Khi lỗi" rules={[{ required: true }]}>
                      <Select
                        options={[
                          { label: 'Tạo incident', value: 'CREATE_INCIDENT' },
                          { label: 'Fail process', value: 'FAIL_PROCESS' },
                          { label: 'Tiếp tục', value: 'CONTINUE' },
                          { label: 'Compensate', value: 'COMPENSATE' },
                          { label: 'Tạo việc thủ công', value: 'MANUAL_TASK' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="notifyRoles" label="Vai trò nhận cảnh báo">
                      <Select mode="tags" tokenSeparators={[',']} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="changeNote" label="Ghi chú thay đổi">
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </Form>
    </Drawer>
  )
}
