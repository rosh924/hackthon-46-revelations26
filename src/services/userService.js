import api from './api';
import { mockUsers, mockOrders } from './mockData';

export const userService = {
    getProfile: async () => {
        try {
            return await api.get('/users/profile');
        } catch (error) {
            console.warn('Backend unavailable, using mock data');
            return mockUsers[0];
        }
    },

    updateProfile: async (userData) => {
        try {
            return await api.put('/users/profile', userData);
        } catch (error) {
            return { ...mockUsers[0], ...userData };
        }
    },

    getOrders: async () => {
        try {
            return await api.get('/users/orders');
        } catch (error) {
            return mockOrders;
        }
    }
};
