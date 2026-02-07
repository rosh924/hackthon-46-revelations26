import React, { useState, useEffect } from 'react';
import { vendorService } from '../../services/vendorService';
import { useAuth } from '../../hooks/useAuth';

const VendorDashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await vendorService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (isLoading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm">Active Orders</h3>
                    <p className="text-3xl font-bold">{stats?.activeOrders || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm">Today's Revenue</h3>
                    <p className="text-3xl font-bold">₹{stats?.revenue || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm">Completed Orders</h3>
                    <p className="text-3xl font-bold">{stats?.completedOrders || 0}</p>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <p className="text-gray-500">No recent activity.</p>
        </div>
    );
};

export default VendorDashboardPage;
