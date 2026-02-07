import React, { useState } from 'react';

const OrderManagementPage = () => {
    const [activeTab, setActiveTab] = useState('pending');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Order Management</h1>
            <div className="flex border-b mb-6">
                <button
                    className={`px-6 py-2 border-b-2 font-medium ${activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending
                </button>
                <button
                    className={`px-6 py-2 border-b-2 font-medium ${activeTab === 'preparing' ? 'border-yellow-600 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('preparing')}
                >
                    Preparing
                </button>
                <button
                    className={`px-6 py-2 border-b-2 font-medium ${activeTab === 'completed' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm w-full h-64 flex items-center justify-center text-gray-500">
                No orders in {activeTab}.
            </div>
        </div>
    );
};

export default OrderManagementPage;
