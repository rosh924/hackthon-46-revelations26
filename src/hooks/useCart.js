// 1. Basic usage in a component
import { useCart } from '../hooks/useCart';

function ProductCard({ product, vendor }) {
    const { addToCart, cart, updateQuantity } = useCart();

    const cartItem = cart.items.find(item =>
        item.id === product.id &&
        JSON.stringify(item.customizations) === JSON.stringify(product.customizations || {})
    );

    const handleAddToCart = () => {
        addToCart(product, vendor, { autoOpen: true });
    };

    const handleIncrease = () => {
        updateQuantity(product.id, (cartItem?.quantity || 0) + 1, product.customizations);
    };

    const handleDecrease = () => {
        updateQuantity(product.id, (cartItem?.quantity || 0) - 1, product.customizations);
    };

    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p>₹{product.price}</p>

            {cartItem ? (
                <div className="quantity-controls">
                    <button onClick={handleDecrease}>-</button>
                    <span>{cartItem.quantity}</span>
                    <button onClick={handleIncrease}>+</button>
                </div>
            ) : (
                <button onClick={handleAddToCart}>Add to Cart</button>
            )}
        </div>
    );
}

// 2. Cart page with all features
function CartPage() {
    const {
        cart,
        cartStats,
        cartVisibility,
        removeFromCart,
        updateQuantity,
        updateItemInstructions,
        applyDiscount,
        removeDiscount,
        clearCart,
        checkout,
        toggleCart,
        validateCartForCheckout,
        getCartPrediction,
        saveForLater,
    } = useCart();

    const [discountCode, setDiscountCode] = useState('');

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        await applyDiscount(discountCode.trim());
        setDiscountCode('');
    };

    const handleCheckout = async () => {
        const validation = validateCartForCheckout();
        if (validation.isValid) {
            await checkout();
        } else {
            toast.error(validation.errors[0]);
        }
    };

    if (!cartStats.hasItems) {
        return (
            <div className="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Add items from vendors to get started</p>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1>Your Cart</h1>
            <p>Items from: {cart.vendor?.name}</p>

            {/* Cart Items */}
            <div className="cart-items">
                {cart.items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="cart-item">
                        <div className="item-info">
                            <h3>{item.name}</h3>
                            <p>₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</p>

                            {Object.keys(item.customizations).length > 0 && (
                                <div className="customizations">
                                    {Object.entries(item.customizations).map(([key, value]) => (
                                        <span key={key} className="customization-tag">
                                            {key}: {value}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="item-actions">
                            <div className="quantity-controls">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.customizations)}>
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.customizations)}>
                                    +
                                </button>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id, item.customizations)}
                                className="remove-btn"
                            >
                                Remove
                            </button>
                        </div>

                        <textarea
                            placeholder="Special instructions..."
                            value={item.specialInstructions}
                            onChange={(e) => updateItemInstructions(item.id, e.target.value, item.customizations)}
                            className="instructions-input"
                        />
                    </div>
                ))}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
                <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{cart.subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                    <span>Tax (5%)</span>
                    <span>₹{cart.tax.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                    <span>Platform Fee</span>
                    <span>₹{cart.platformFee.toFixed(2)}</span>
                </div>

                {cart.discount > 0 && (
                    <div className="summary-row discount">
                        <span>Discount ({cart.discountCode})</span>
                        <span>-₹{cart.discount.toFixed(2)}</span>
                    </div>
                )}

                <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{cart.total.toFixed(2)}</span>
                </div>
            </div>

            {/* Discount Section */}
            <div className="discount-section">
                <input
                    type="text"
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button onClick={handleApplyDiscount}>Apply</button>
                {cart.discount > 0 && (
                    <button onClick={removeDiscount} className="remove-discount">
                        Remove
                    </button>
                )}
            </div>

            {/* Prediction Info */}
            {cart.prediction && (
                <div className="prediction-info">
                    <h3>Estimated Pickup Time</h3>
                    <p>
                        {new Date(cart.prediction.pickupWindow.start).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        {' - '}
                        {new Date(cart.prediction.pickupWindow.end).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                    {cart.prediction.isFallback && (
                        <p className="fallback-warning">Using estimated time</p>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="cart-actions">
                <button onClick={clearCart} className="secondary-btn">
                    Clear Cart
                </button>

                <button onClick={saveForLater} className="secondary-btn">
                    Save for Later
                </button>

                <button
                    onClick={handleCheckout}
                    className="primary-btn"
                    disabled={!validateCartForCheckout().isValid}
                >
                    Proceed to Checkout (₹{cart.total.toFixed(2)})
                </button>
            </div>
        </div>
    );
}

// 3. Using with CartContext
import { CartProvider, useCartContext } from '../hooks/useCart';

function App() {
    return (
        <CartProvider>
            <YourApp />
        </CartProvider>
    );
}

function CartIcon() {
    const { cart, cartStats, toggleCart } = useCartContext();

    return (
        <button onClick={() => toggleCart('icon')} className="cart-icon">
            <span className="cart-count">{cartStats.itemCount}</span>
            🛒
        </button>
    );
}