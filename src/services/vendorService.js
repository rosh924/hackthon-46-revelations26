import api from './api';

export const vendorService = {
    getActiveVendors: async () => {
        return api.get('/vendors/active');
    },

    getVendorById: async (id) => {
        return api.get(`/vendors/${id}`);
    },

    getMenu: async (vendorId) => {
        return api.get(`/vendors/${vendorId}/menu`);
    },

    // Vendor Dashboard methods (prediction)
    getDashboardStats: async () => {
        return api.get('/vendor/dashboard/stats');
    },

    updateStatus: async (status) => {
        return api.put('/vendor/status', { status });
    }
};
