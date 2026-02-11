import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Table, Button, Input, Space, DatePicker, Card, Typography,
    Tag, Popconfirm, message, Tooltip, Dropdown, Modal
} from 'antd'
import {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    CopyOutlined,
    MoreOutlined,
    FilePdfOutlined
} from '@ant-design/icons'
import { resultsAPI } from '../services/api'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

function ResultsPage() {
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
    const [searchText, setSearchText] = useState('')
    const [dateRange, setDateRange] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        loadResults()
    }, [pagination.current])

    const loadResults = async () => {
        try {
            setLoading(true)
            const response = await resultsAPI.getAll(pagination.current, pagination.pageSize)
            setResults(response.data.results)
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination.total
            }))
        } catch (error) {
            message.error('Không thể tải danh sách kết quả')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        try {
            setLoading(true)
            const params = { q: searchText }
            if (dateRange) {
                params.startDate = dateRange[0].format('YYYY-MM-DD')
                params.endDate = dateRange[1].format('YYYY-MM-DD')
            }
            const response = await resultsAPI.search(params)
            setResults(response.data.results)
        } catch (error) {
            message.error('Lỗi tìm kiếm')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        try {
            await resultsAPI.delete(id)
            message.success('Đã xóa kết quả')
            loadResults()
        } catch (error) {
            message.error('Không thể xóa kết quả')
        }
    }

    const handleDuplicate = async (id) => {
        try {
            const response = await resultsAPI.duplicate(id)
            message.success('Đã nhân bản kết quả!')
            navigate(`/results/${response.data.resultId}/edit`)
        } catch (error) {
            message.error('Không thể nhân bản')
        }
    }

    const columns = [
        {
            title: 'Ngày XN',
            dataIndex: 'testDate',
            key: 'testDate',
            width: 120,
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a, b) => dayjs(a.testDate).unix() - dayjs(b.testDate).unix()
        },
        {
            title: 'Bệnh Nhân',
            dataIndex: 'patientName',
            key: 'patientName',
            render: (name, record) => (
                <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-gray-500">
                        {record.patientCode} | {record.birthYear} | {record.gender}
                    </div>
                </div>
            )
        },
        {
            title: 'Bác Sĩ',
            dataIndex: 'doctorName',
            key: 'doctorName',
            width: 150,
            render: (name) => name || '-'
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={status === 'completed' ? 'green' : 'orange'}>
                    {status === 'completed' ? '✓ Hoàn thành' : '📝 Nháp'}
                </Tag>
            )
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Thao Tác',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem & In PDF">
                        <Link to={`/results/${record.id}`}>
                            <Button type="primary" ghost icon={<EyeOutlined />} size="small" />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Sửa">
                        <Link to={`/results/${record.id}/edit`}>
                            <Button icon={<EditOutlined />} size="small" />
                        </Link>
                    </Tooltip>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'duplicate',
                                    icon: <CopyOutlined />,
                                    label: 'Nhân bản',
                                    onClick: () => handleDuplicate(record.id)
                                },
                                {
                                    type: 'divider'
                                },
                                {
                                    key: 'delete',
                                    icon: <DeleteOutlined />,
                                    label: 'Xóa',
                                    danger: true,
                                    onClick: () => {
                                        Modal.confirm({
                                            title: 'Xác nhận xóa?',
                                            content: 'Bạn có chắc muốn xóa kết quả này?',
                                            onOk: () => handleDelete(record.id)
                                        })
                                    }
                                }
                            ]
                        }}
                    >
                        <Button icon={<MoreOutlined />} size="small" />
                    </Dropdown>
                </Space>
            )
        }
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <Title level={3} className="!mb-0">📋 Danh Sách Kết Quả Xét Nghiệm</Title>
                <Link to="/results/new">
                    <Button type="primary" icon={<PlusOutlined />}>
                        Tạo Kết Quả Mới
                    </Button>
                </Link>
            </div>

            <Card>
                <div className="flex flex-wrap gap-4 mb-4">
                    <Input.Search
                        placeholder="Tìm theo tên, mã BN..."
                        allowClear
                        style={{ width: 300 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onSearch={handleSearch}
                    />
                    <RangePicker
                        placeholder={['Từ ngày', 'Đến ngày']}
                        onChange={setDateRange}
                        format="DD/MM/YYYY"
                    />
                    <Button icon={<SearchOutlined />} onClick={handleSearch}>
                        Tìm Kiếm
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={results}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showTotal: (total) => `Tổng ${total} kết quả`,
                        showSizeChanger: true,
                        onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
                    }}
                    locale={{ emptyText: 'Chưa có kết quả nào' }}
                />
            </Card>
        </div>
    )
}

export default ResultsPage
