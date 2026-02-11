import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd'
import {
    DashboardOutlined,
    UserOutlined,
    FileTextOutlined,
    PlusOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'

const { Header, Sider, Content } = Layout

function MainLayout() {
    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: <Link to="/">Dashboard</Link>
        },
        {
            key: '/patients',
            icon: <UserOutlined />,
            label: <Link to="/patients">Bệnh Nhân</Link>
        },
        {
            key: '/results',
            icon: <FileTextOutlined />,
            label: <Link to="/results">Kết Quả XN</Link>
        },
        {
            key: '/results/new',
            icon: <PlusOutlined />,
            label: <Link to="/results/new">Tạo Mới</Link>
        },
        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: <Link to="/settings">Cài Đặt</Link>
        }
    ]

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin tài khoản'
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt'
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true
        }
    ]

    const handleUserMenuClick = async ({ key }) => {
        if (key === 'logout') {
            await logout()
            navigate('/login')
        } else if (key === 'settings') {
            navigate('/settings')
        }
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme="light"
                style={{
                    boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
                }}
            >
                <div className="p-4 text-center border-b border-gray-100">
                    <h1 className={`font-bold text-primary-600 transition-all ${collapsed ? 'text-lg' : 'text-xl'}`}>
                        {collapsed ? '🏥' : '🏥 FFG Lab'}
                    </h1>
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ borderRight: 0 }}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: '0 24px',
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />

                    <Dropdown
                        menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                        placement="bottomRight"
                    >
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                            <Avatar
                                style={{ backgroundColor: '#1890ff' }}
                                icon={<UserOutlined />}
                            />
                            <div className="hidden md:block">
                                <div className="font-medium text-gray-800">{user?.fullName || user?.username}</div>
                                <div className="text-xs text-gray-500">{user?.role}</div>
                            </div>
                        </div>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: '24px',
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        minHeight: 280
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}

export default MainLayout
