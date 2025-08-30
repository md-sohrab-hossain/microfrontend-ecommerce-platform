import React from 'react';
import { EventBus } from '@microfrontend-ecommerce/shared';
import { useApp } from '../context/AppContext';

const SimpleAddToCartTest: React.FC = () => {
  const { state } = useApp();
  const [lastTest, setLastTest] = React.useState<string>('');

  const testAddToCart = () => {
    const eventBus = EventBus.getInstance();
    

    
    // Simple test product
    const testProduct = {
      id: 99999,
      title: 'Test Product for Cart',
      price: 29.99,
      description: 'A test product to verify add-to-cart functionality',
      category: 'test',
      image: 'https://via.placeholder.com/300x300.png?text=Test+Product',
      rating: { rate: 5, count: 10 }
    };

    try {
      eventBus.emit('ADD_TO_CART', {
        product: testProduct,
        quantity: 1,
      });
      
      setLastTest(`✅ Test at ${new Date().toLocaleTimeString()}`);
      
      // Check result after delay
      setTimeout(() => {
        // Test completed
      }, 1000);
      
    } catch (error) {
      console.error('❌ Simple Test: Error:', error);
      setLastTest(`❌ Error: ${String(error)}`);
    }
  };

  const clearTest = () => {
    setLastTest('');
  };

  return (
    <div className="fixed top-4 right-4 bg-blue-50 border-2 border-blue-400 rounded-lg p-3 max-w-xs shadow-lg z-50">
      <h4 className="font-bold text-blue-800 mb-2">🛒 Cart Test</h4>
      
      <div className="text-sm mb-3 space-y-1">
        <div><strong>Cart:</strong> {state.cartCount} items</div>
        <div><strong>Items:</strong> {state.cart.length}</div>
        <div><strong>Products:</strong> {Object.keys(state.products).length}</div>
        <div><strong>Auth:</strong> {state.isAuthenticated ? 'Yes' : 'No'}</div>
      </div>

      <button
        onClick={testAddToCart}
        className="w-full bg-blue-500 text-white px-3 py-2 rounded font-medium hover:bg-blue-600 mb-2 text-sm"
      >
        🧪 Test Cart
      </button>

      {lastTest && (
        <div className="text-xs bg-white p-2 rounded border mb-2">
          {lastTest}
          <button 
            onClick={clearTest}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      <div className="text-xs text-gray-600">
        Check browser console for logs
      </div>
    </div>
  );
};

export default SimpleAddToCartTest;
