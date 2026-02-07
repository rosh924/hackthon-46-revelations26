import api from './api';
import { mockUsers } from './mockData';

export const authService = {
    login: async (email, password) => {
        try {
            return await api.post('/auth/login', { email, password });
        } catch (error) {
            console.warn('Backend unavailable, using mock data');
            const user = mockUsers.find(u => u.email === email);
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
            // Return first mock user as default logged in user if token exists
            if (localStorage.getItem('token')) {
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
