import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

const OrderHistoryPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const ordersData = await userService.getOrders();
                setOrders(ordersData);
            } catch (error) {
                console.error('Failed to load orders', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Order History</h1>
            {orders.length === 0 ? (
                <p className="text-gray-600">No orders found.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="border p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-lg">Order #{order.id}</span>
                                <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                    }`}>
                                    {order.status}
                                </span>
                                <span className="font-bold">₹{order.total}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
