import api from './api';

export const userService = {
    getProfile: async () => {
        return api.get('/users/profile');
    },

    updateProfile: async (userData) => {
        return api.put('/users/profile', userData);
    },

    getOrders: async () => {
        return api.get('/users/orders');
    }
};
