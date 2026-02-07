import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { vendorService } from '../../services/vendorService';
import toast from 'react-hot-toast';

const VendorMenuPage = () => {
    const { id } = useParams();
    const [vendor, setVendor] = useState(null);
    const [menu, setMenu] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                setIsLoading(true);
                // Assuming vendorService has these methods (which I added)
                const vendorData = await vendorService.getVendorById(id);
                const menuData = await vendorService.getMenu(id);
                setVendor(vendorData);
                setMenu(menuData);
            } catch (error) {
                toast.error('Failed to load menu');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchVendorData();
    }, [id]);

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!vendor) return <div className="p-8 text-center">Vendor not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">{vendor.businessName}</h1>
            <p className="text-gray-600 mb-6">{vendor.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menu.map(item => (
                    <div key={item.id} className="border p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        <div className="flex justify-between items-center mt-4">
                            <span className="font-bold">₹{item.price}</span>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VendorMenuPage;
