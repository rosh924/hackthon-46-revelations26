import api from './api';

export const authService = {
    login: async (email, password) => {
        return api.post('/auth/login', { email, password });
    },

    register: async (userData) => {
        return api.post('/auth/register', userData);
    },

    logout: async () => {
        // Optional: Call backend to invalidate token
        // await api.post('/auth/logout');
        localStorage.removeItem('token');
    },

    getCurrentUser: async () => {
        return api.get('/auth/me');
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
