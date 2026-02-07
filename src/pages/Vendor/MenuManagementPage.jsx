import React, { useState, useEffect } from 'react';
import { vendorService } from '../../services/vendorService';
import toast from 'react-hot-toast';

const MenuManagementPage = () => {
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        // Mock fetch if vendorService doesn't have it
        // Or assume vendorService.getMenu(currentUser.vendorId)
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Menu Management</h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Add New Item
                </button>
            </div>

            <div className="bg-white rounded-lg shadow border p-6 text-center text-gray-500">
                No items in menu.
            </div>
        </div>
    );
};

export default MenuManagementPage;
