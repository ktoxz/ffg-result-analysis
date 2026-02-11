import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import App from './App'
import './index.css'

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo })
        console.error('Error caught by boundary:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, color: 'red' }}>
                    <h1>Có lỗi xảy ra!</h1>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
                        {this.state.errorInfo?.componentStack}
                    </pre>
                </div>
            )
        }
        return this.props.children
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <ConfigProvider
                locale={viVN}
                theme={{
                    token: {
                        colorPrimary: '#1890ff',
                        borderRadius: 6,
                    },
                }}
            >
                <App />
            </ConfigProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)
