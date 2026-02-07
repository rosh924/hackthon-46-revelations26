import api from './api';

export const orderService = {
    createOrder: async (orderData) => {
        return api.post('/orders', orderData);
    },

    getOrderById: async (id) => {
        return api.get(`/orders/${id}`);
    },

    getUserOrders: async () => {
        return api.get('/orders/user');
    },

    getVendorOrders: async () => {
        return api.get('/orders/vendor');
    },

    updateOrderStatus: async (id, status) => {
        return api.put(`/orders/${id}/status`, { status });
    }
};
