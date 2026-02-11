import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'

const { Title, Text } = Typography

function LoginPage() {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login, isAuthenticated, error, clearError } = useAuthStore()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        if (error) {
            message.error(error)
            clearError()
        }
    }, [error, clearError])

    const onFinish = async (values) => {
        setLoading(true)
        const result = await login(values.username, values.password)
        setLoading(false)

        if (result.success) {
            message.success('Đăng nhập thành công!')
            navigate('/')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
            <Card
                className="w-full max-w-md shadow-2xl"
                style={{ borderRadius: 16 }}
            >
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🏥</div>
                    <Title level={2} className="!mb-2">FFG Lab Results</Title>
                    <Text type="secondary">Hệ thống quản lý kết quả xét nghiệm</Text>
                </div>

                <Form
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Tên đăng nhập"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item className="mb-2">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{ height: 48 }}
                        >
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default LoginPage
