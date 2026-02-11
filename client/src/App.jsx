import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import ResultsPage from './pages/ResultsPage'
import ResultFormPage from './pages/ResultFormPage'
import ResultViewPage from './pages/ResultViewPage'
import SettingsPage from './pages/SettingsPage'

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/" element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<DashboardPage />} />
                    <Route path="patients" element={<PatientsPage />} />
                    <Route path="results" element={<ResultsPage />} />
                    <Route path="results/new" element={<ResultFormPage />} />
                    <Route path="results/:id/edit" element={<ResultFormPage />} />
                    <Route path="results/:id" element={<ResultViewPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
