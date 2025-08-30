import React, { useState } from 'react';
import { CartProvider, useCart } from './contexts/CartContext';
import CartItem from './components/CartItem';
import CartSummary from './components/CartSummary';
import EmptyCart from './components/EmptyCart';
import './index.css';
// Cart content component
const CartContent: React.FC = () => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const handleCheckout = () => {
    // In a real app, this would navigate to checkout
    alert('Checkout functionality would be implemented here!');
  };
  const handleClearCart = () => {
    if (showClearConfirm) {
      clearCart();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
    }
  };
  const handleCancelClear = () => {
    setShowClearConfirm(false);
  };
  if (state.loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-4 text-gray-600">Loading cart...</span>
        </div>
      </div>
    );
  }
  if (state.error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-semibold mb-2">{state.error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  // Debug cart state before deciding whether to show EmptyCart
  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyCart />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-2">
          {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>
      {/* Clear cart confirmation */}
      {showClearConfirm && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Are you sure you want to clear your cart?
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleClearCart}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Yes, Clear
              </button>
              <button
                onClick={handleCancelClear}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>
        {/* Cart summary */}
        <div className="lg:col-span-1">
          <CartSummary
            subtotal={state.total}
            itemCount={state.itemCount}
            onCheckout={handleCheckout}
            onClearCart={handleClearCart}
          />
        </div>
      </div>
      {/* Continue shopping */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/products';
            }
          }}
          className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Continue Shopping
        </button>
      </div>
    </div>
  );
};
// Main App component  
const App: React.FC = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <CartContent />
      </div>
    </CartProvider>
  );
};
export default App;
