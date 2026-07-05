import { useState } from 'react'
import { Button, Card, Form, Input, Typography, App as AntApp, Grid } from 'antd'
import { ExperimentOutlined, LoginOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useAuth } from '../store/AuthContext'
import { users, DEMO_PASSWORD } from '../data/users'

const { Title, Text } = Typography

interface LoginForm {
  email: string
  password: string
}

/**
 * Chỉ hiện card "Tài khoản demo" (lộ mật khẩu chung + điền nhanh) ở môi trường
 * phát triển, HOẶC khi build production bật rõ cờ `VITE_SHOW_DEMO_ACCOUNTS=true`.
 * Tránh vô tình mang UI lộ mật khẩu ra staging/demo khách hàng ngoài (trước khi
 * có SSO/IAM thật ở F4).
 */
const SHOW_DEMO_ACCOUNTS =
  import.meta.env.DEV ||
  (import.meta.env as Record<string, string | undefined>).VITE_SHOW_DEMO_ACCOUNTS === 'true'

export default function Login() {
  const { login } = useAuth()
  const { message } = AntApp.useApp()
  const screens = Grid.useBreakpoint()
  const [form] = Form.useForm<LoginForm>()
  const [submitting, setSubmitting] = useState(false)

  const onFinish = (values: LoginForm) => {
    setSubmitting(true)
    const res = login(values.email, values.password)
    setSubmitting(false)
    if (res.ok) {
      message.success('Đăng nhập thành công')
      // Điều hướng do App tự re-render khi có user (không cần navigate thủ công).
    } else {
      message.error(res.error ?? 'Đăng nhập thất bại')
    }
  }

  const fillQuick = (email: string) => {
    form.setFieldsValue({ email, password: DEMO_PASSWORD })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--vht-surface-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 1000,
        }}
      >
        {/* Card đăng nhập */}
        <Card style={{ width: 380, flex: '0 0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <ExperimentOutlined style={{ fontSize: 26, color: '#ee0033' }} />
            <Title level={4} style={{ margin: 0 }}>
              Quản trị nhiệm vụ KHCN
            </Title>
          </div>
          <Text type="secondary">Đăng nhập để quản lý và xét duyệt nhiệm vụ khoa học công nghệ</Text>

          <Form form={form} layout="vertical" requiredMark={false} onFinish={onFinish} style={{ marginTop: 20 }}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="ban@example.com" autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="••••••" autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<LoginOutlined />} loading={submitting} block>
              Đăng nhập
            </Button>
          </Form>
        </Card>

        {/* Card tài khoản demo — chỉ hiện ở dev hoặc khi bật cờ môi trường (2.5) */}
        {SHOW_DEMO_ACCOUNTS && (
        <Card style={{ width: 420, flex: '0 0 auto' }} styles={{ body: { paddingBottom: 8 } }}>
          <Title level={5} style={{ margin: 0 }}>
            Tài khoản demo
          </Title>
          <Text type="secondary">
            Mật khẩu chung: <Text code>{DEMO_PASSWORD}</Text>
          </Text>

          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: screens.xs ? '1fr auto' : '1fr 1fr auto',
                gap: '10px 12px',
                alignItems: 'center',
                fontSize: 11,
                letterSpacing: 0.4,
                color: '#8593a3',
                paddingBottom: 8,
                borderBottom: '1px solid #eef1f5',
              }}
            >
              <span>EMAIL</span>
              {!screens.xs && <span>VAI TRÒ</span>}
              <span />
            </div>

            {users.map((u) => (
              <div
                key={u.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: screens.xs ? '1fr auto' : '1fr 1fr auto',
                  gap: '4px 12px',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #f2f4f7',
                }}
              >
                <Text code style={{ fontSize: 12 }}>
                  {u.email}
                </Text>
                {!screens.xs && <Text style={{ fontSize: 13 }}>{u.chucDanh}</Text>}
                <Button size="small" onClick={() => fillQuick(u.email)}>
                  Điền nhanh
                </Button>
              </div>
            ))}
          </div>
        </Card>
        )}
      </div>
    </div>
  )
}
