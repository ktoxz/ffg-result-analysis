import axios from 'axios'

const API_BASE = '/api'

// Create axios instance
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
})

// Request interceptor to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth API
export const authAPI = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    changePassword: (data) => api.post('/auth/change-password', data)
}

// Patients API
export const patientsAPI = {
    getAll: () => api.get('/patients'),
    search: (query) => api.get('/patients/search', { params: { q: query } }),
    getById: (id) => api.get(`/patients/${id}`),
    create: (data) => api.post('/patients', data),
    update: (id, data) => api.put(`/patients/${id}`, data),
    delete: (id) => api.delete(`/patients/${id}`)
}

// Results API
export const resultsAPI = {
    getAll: (page = 1, limit = 20) => api.get('/results', { params: { page, limit } }),
    search: (params) => api.get('/results/search', { params }),
    getById: (id) => api.get(`/results/${id}`),
    create: (data) => api.post('/results', data),
    update: (id, data) => api.put(`/results/${id}`, data),
    delete: (id) => api.delete(`/results/${id}`),
    duplicate: (id) => api.post(`/results/${id}/duplicate`)
}

export default api
