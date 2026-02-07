import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile({ name, phone });
            toast.success('Profile updated');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-center">Please login to view profile.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-lg">
            <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;
