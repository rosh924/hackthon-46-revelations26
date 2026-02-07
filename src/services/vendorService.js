import api from './api';
import { mockVendors, mockMenu } from './mockData';

export const vendorService = {
    getActiveVendors: async () => {
        try {
            return await api.get('/vendors/active');
        } catch (error) {
            console.warn('Backend unavailable, using mock data');
            return mockVendors;
        }
    },

    getVendorById: async (id) => {
        try {
            return await api.get(`/vendors/${id}`);
        } catch (error) {
            return mockVendors.find(v => v.id === id) || mockVendors[0];
        }
    },

    getMenu: async (vendorId) => {
        try {
            return await api.get(`/vendors/${vendorId}/menu`);
        } catch (error) {
            return mockMenu[vendorId] || [];
        }
    },

    // Vendor Dashboard methods (prediction)
    getDashboardStats: async () => {
        try {
            return await api.get('/vendor/dashboard/stats');
        } catch (error) {
            return { activeOrders: 5, revenue: 15400, completedOrders: 23 };
        }
    },

    updateStatus: async (status) => {
        // Mock success
        return { success: true, status };
    }
};
