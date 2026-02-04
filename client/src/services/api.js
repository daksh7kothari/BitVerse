import axios from 'axios'
import { supabase } from '../context/AuthContext'

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request Interceptor: Attach Token
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }

    return config
}, (error) => {
    return Promise.reject(error)
})

// Response Interceptor: Handle 401
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        // Optionally redirect to login or clear auth
        console.error('Unauthorized access')
    }
    return Promise.reject(error)
})

export default api
