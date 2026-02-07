import api from './api';
import { mockUsers } from './mockData';

export const authService = {
    login: async (credentials) => {
        const { email, phone, password } = credentials;
        try {
            return await api.post('/auth/login', credentials);
        } catch (error) {
            console.warn('Backend unavailable, using mock data');
            const user = mockUsers.find(u =>
                ((email && u.email === email) || (phone && u.phone === phone)) &&
                u.password === password
            );
            if (user) return { user, token: 'mock-token-' + user.id };
            throw new Error('Invalid credentials (mock)');
        }
    },

    register: async (userData) => {
        try {
            return await api.post('/auth/register', userData);
        } catch (error) {
            console.warn('Backend unavailable, using mock data');
            return { user: { ...userData, id: 'mock-new-user' }, token: 'mock-token-new' };
        }
    },

    logout: async () => {
        localStorage.removeItem('token');
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // Ignore logout errors
        }
    },

    getCurrentUser: async () => {
        try {
            return await api.get('/auth/me');
        } catch (error) {
            console.warn('Backend unavailable, using mock data');
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token && token.startsWith('mock-token-')) {
                const userId = token.replace('mock-token-', '');
                const user = mockUsers.find(u => u.id === userId || u.vendorId === userId);
                if (user) return user;
            }
            // Fallback to first user only if no specific match found and token exists
            if (token) {
                return mockUsers[0];
            }
            throw error;
        }
    },

    setAuthHeader: (token) => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    },

    clearAuthHeader: () => {
        delete api.defaults.headers.common['Authorization'];
    }
};
