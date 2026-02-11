import { useState, useEffect } from 'react'
import {
    Table, Button, Input, Space, Modal, Form, Select,
    message, Popconfirm, Card, Typography, Tag
} from 'antd'
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined
} from '@ant-design/icons'
import { patientsAPI } from '../services/api'

const { Title } = Typography

function PatientsPage() {
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [editingPatient, setEditingPatient] = useState(null)
    const [form] = Form.useForm()

    useEffect(() => {
        loadPatients()
    }, [])

    const loadPatients = async () => {
        try {
            setLoading(true)
            const response = await patientsAPI.getAll()
            setPatients(response.data.patients)
        } catch (error) {
            message.error('Không thể tải danh sách bệnh nhân')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async (value) => {
        if (!value) {
            loadPatients()
            return
        }
        try {
            setLoading(true)
            const response = await patientsAPI.search(value)
            setPatients(response.data.patients)
        } catch (error) {
            message.error('Lỗi tìm kiếm')
        } finally {
            setLoading(false)
        }
    }

    const openModal = (patient = null) => {
        setEditingPatient(patient)
        if (patient) {
            form.setFieldsValue(patient)
        } else {
            form.resetFields()
        }
        setModalVisible(true)
    }

    const handleSubmit = async (values) => {
        try {
            if (editingPatient) {
                await patientsAPI.update(editingPatient.id, values)
                message.success('Cập nhật thành công!')
            } else {
                await patientsAPI.create(values)
                message.success('Thêm bệnh nhân thành công!')
            }
            setModalVisible(false)
            loadPatients()
        } catch (error) {
            message.error(error.response?.data?.error || 'Có lỗi xảy ra')
        }
    }

    const handleDelete = async (id) => {
        try {
            await patientsAPI.delete(id)
            message.success('Đã xóa bệnh nhân')
            loadPatients()
        } catch (error) {
            message.error(error.response?.data?.error || 'Không thể xóa bệnh nhân')
        }
    }

    const columns = [
        {
            title: 'Mã BN',
            dataIndex: 'patientCode',
            key: 'patientCode',
            width: 120,
            render: (code) => <Tag color="blue">{code}</Tag>
        },
        {
            title: 'Họ và Tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (name) => (
                <span className="font-medium">
                    <UserOutlined className="mr-2 text-gray-400" />
                    {name}
                </span>
            )
        },
        {
            title: 'Năm sinh',
            dataIndex: 'birthYear',
            key: 'birthYear',
            width: 100
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            width: 100,
            render: (gender) => gender && (
                <Tag color={gender === 'Nam' ? 'blue' : 'pink'}>{gender}</Tag>
            )
        },
        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: 130
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openModal(record)}
                    />
                    <Popconfirm
                        title="Xóa bệnh nhân?"
                        description="Bạn có chắc muốn xóa bệnh nhân này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <Title level={3} className="!mb-0">👥 Quản Lý Bệnh Nhân</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                    Thêm Bệnh Nhân
                </Button>
            </div>

            <Card>
                <div className="mb-4">
                    <Input.Search
                        placeholder="Tìm kiếm theo tên, mã BN, SĐT..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        style={{ maxWidth: 400 }}
                        onSearch={handleSearch}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={patients}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} bệnh nhân`
                    }}
                    locale={{ emptyText: 'Chưa có bệnh nhân nào' }}
                />
            </Card>

            <Modal
                title={editingPatient ? '✏️ Sửa Thông Tin Bệnh Nhân' : '➕ Thêm Bệnh Nhân Mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="mt-4"
                >
                    <Form.Item
                        name="fullName"
                        label="Họ và Tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input placeholder="Nhập họ tên bệnh nhân" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="patientCode"
                            label="Mã Bệnh Nhân"
                        >
                            <Input placeholder="Tự động tạo nếu để trống" />
                        </Form.Item>

                        <Form.Item
                            name="birthYear"
                            label="Năm Sinh"
                        >
                            <Input type="number" placeholder="VD: 1990" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="gender"
                            label="Giới Tính"
                        >
                            <Select placeholder="Chọn giới tính">
                                <Select.Option value="Nam">Nam</Select.Option>
                                <Select.Option value="Nữ">Nữ</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số Điện Thoại"
                        >
                            <Input placeholder="Nhập SĐT" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="address"
                        label="Địa Chỉ"
                    >
                        <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            {editingPatient ? 'Cập Nhật' : 'Thêm Mới'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}

export default PatientsPage
