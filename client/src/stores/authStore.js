import { create } from 'zustand'
import { authAPI } from '../services/api'

export const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    login: async (username, password) => {
        set({ loading: true, error: null })
        try {
            const response = await authAPI.login(username, password)
            const { token, user } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false
            })

            return { success: true }
        } catch (error) {
            const message = error.response?.data?.error || 'Đăng nhập thất bại'
            set({ loading: false, error: message })
            return { success: false, error: message }
        }
    },

    logout: async () => {
        try {
            await authAPI.logout()
        } catch (e) {
            // Ignore error
        }
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ user: null, token: null, isAuthenticated: false })
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            set({ isAuthenticated: false })
            return false
        }

        try {
            const response = await authAPI.getMe()
            set({ user: response.data.user, isAuthenticated: true })
            return true
        } catch (error) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            set({ user: null, token: null, isAuthenticated: false })
            return false
        }
    },

    clearError: () => set({ error: null })
}))
