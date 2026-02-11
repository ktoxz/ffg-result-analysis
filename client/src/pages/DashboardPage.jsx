import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Statistic, Table, Button, Tag, Typography, Spin } from 'antd'
import {
    UserOutlined,
    FileTextOutlined,
    PlusOutlined,
    CalendarOutlined,
    ArrowRightOutlined
} from '@ant-design/icons'
import { patientsAPI, resultsAPI } from '../services/api'
import dayjs from 'dayjs'

const { Title } = Typography

function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalResults: 0,
        recentResults: []
    })

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            const [patientsRes, resultsRes] = await Promise.all([
                patientsAPI.getAll(),
                resultsAPI.getAll(1, 5)
            ])

            setStats({
                totalPatients: patientsRes.data.patients.length,
                totalResults: resultsRes.data.pagination.total,
                recentResults: resultsRes.data.results
            })
        } catch (error) {
            console.error('Load dashboard error:', error)
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            title: 'Bệnh nhân',
            dataIndex: 'patientName',
            key: 'patientName',
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500">{record.patientCode}</div>
                </div>
            )
        },
        {
            title: 'Ngày XN',
            dataIndex: 'testDate',
            key: 'testDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'completed' ? 'green' : 'orange'}>
                    {status === 'completed' ? 'Hoàn thành' : 'Nháp'}
                </Tag>
            )
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Link to={`/results/${record.id}`}>
                    <Button type="link" icon={<ArrowRightOutlined />}>Xem</Button>
                </Link>
            )
        }
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spin size="large" />
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <Title level={3} className="!mb-0">📊 Dashboard</Title>
                <Link to="/results/new">
                    <Button type="primary" icon={<PlusOutlined />}>
                        Tạo Kết Quả Mới
                    </Button>
                </Link>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="Tổng Bệnh Nhân"
                            value={stats.totalPatients}
                            prefix={<UserOutlined className="text-blue-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="Tổng Kết Quả XN"
                            value={stats.totalResults}
                            prefix={<FileTextOutlined className="text-green-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="Hôm Nay"
                            value={dayjs().format('DD/MM/YYYY')}
                            prefix={<CalendarOutlined className="text-purple-500" />}
                            valueStyle={{ fontSize: 18 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Link to="/results/new">
                        <Card
                            hoverable
                            className="h-full bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                            styles={{ body: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
                        >
                            <div className="text-center">
                                <PlusOutlined className="text-4xl mb-2" />
                                <div className="font-medium">Tạo Mới</div>
                            </div>
                        </Card>
                    </Link>
                </Col>
            </Row>

            <Card title="📋 Kết Quả Gần Đây" extra={<Link to="/results">Xem tất cả</Link>}>
                <Table
                    columns={columns}
                    dataSource={stats.recentResults}
                    rowKey="id"
                    pagination={false}
                    locale={{ emptyText: 'Chưa có kết quả nào' }}
                />
            </Card>
        </div>
    )
}

export default DashboardPage
