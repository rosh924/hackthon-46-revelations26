import React from 'react';
import { useCart } from '../../hooks/useCart';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const { cart, getCartTotal, clearCart, removeFromCart, updateQuantity } = useCart();
    const total = getCartTotal ? getCartTotal() : 0;

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-6">Looks like you haven't added anything yet.</p>
                <Link to="/" className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                    Browse Vendors
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {cart.items.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-500">₹{item.price} each</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center border rounded-lg">
                                    <button
                                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                        className="px-3 py-1 hover:bg-gray-100"
                                    >
                                        -
                                    </button>
                                    <span className="px-3 py-1 border-x">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="px-3 py-1 hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="font-bold text-lg w-20 text-right">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-medium text-gray-900">Total Amount</span>
                        <span className="text-2xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={clearCart}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Clear Cart
                        </button>
                        <Link
                            to="/checkout"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
