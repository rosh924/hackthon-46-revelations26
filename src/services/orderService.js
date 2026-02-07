import api from './api';
import { mockOrders } from './mockData';

export const orderService = {
    createOrder: async (orderData) => {
        try {
            return await api.post('/orders', orderData);
        } catch (error) {
            console.warn('Backend unavailable, using mock data');
            return { ...orderData, id: 'mock-order-' + Date.now(), status: 'pending' };
        }
    },

    getOrderById: async (id) => {
        try {
            return await api.get(`/orders/${id}`);
        } catch (error) {
            return mockOrders.find(o => o.id === id) || mockOrders[0];
        }
    },

    getUserOrders: async () => {
        try {
            return await api.get('/orders/user');
        } catch (error) {
            return mockOrders;
        }
    },

    getVendorOrders: async () => {
        try {
            return await api.get('/orders/vendor');
        } catch (error) {
            return mockOrders;
        }
    },

    updateOrderStatus: async (id, status) => {
        return { success: true, status };
    }
};
