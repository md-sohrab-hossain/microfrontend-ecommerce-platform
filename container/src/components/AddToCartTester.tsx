import React from 'react';
import { EventBus } from '@microfrontend-ecommerce/shared';
import { useApp } from '../context/AppContext';

const AddToCartTester: React.FC = () => {
  const { state } = useApp();
  const [testStatus, setTestStatus] = React.useState<string[]>([]);

  const addTestMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestStatus(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const testAddToCart = () => {
    const eventBus = EventBus.getInstance();
    
    addTestMessage('🧪 Starting Add-to-Cart Test...');
    
    // Create a test product
    const testProduct = {
      id: 9999,
      title: 'Test Product for Cart',
      price: 29.99,
      description: 'This is a test product to verify add-to-cart functionality',
      category: 'test',
      image: 'https://via.placeholder.com/300x300.png?text=Test+Product',
      rating: { rate: 5, count: 100 }
    };

    addTestMessage('📦 Created test product: ' + testProduct.title);
    addTestMessage('🚌 EventBus listeners: ' + Object.keys(eventBus.getAllEvents()).join(', '));

    // Emit the ADD_TO_CART event
    try {
      eventBus.emit('ADD_TO_CART', {
        product: testProduct,
        quantity: 2,
      });
      addTestMessage('✅ ADD_TO_CART event emitted successfully');
    } catch (error) {
      addTestMessage('❌ Error emitting ADD_TO_CART: ' + String(error));
    }

    // Check cart state after a delay
    setTimeout(() => {
      addTestMessage(`🛒 Current cart count: ${state.cartCount}`);
      addTestMessage(`📝 Cart items: ${state.cart.length}`);
      addTestMessage(`🏪 Stored products: ${Object.keys(state.products).length}`);
    }, 500);
  };

  const clearTestResults = () => {
    setTestStatus([]);
  };

  return (
    <div className="fixed top-4 left-4 bg-white border-2 border-green-500 rounded-lg p-4 max-w-sm shadow-lg z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-green-800">🧪 Cart Test</h3>
        <button 
          onClick={clearTestResults}
          className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div><strong>Cart Count:</strong> {state.cartCount}</div>
        <div><strong>Cart Items:</strong> {state.cart.length}</div>
        <div><strong>Authenticated:</strong> {state.isAuthenticated ? 'Yes' : 'No'}</div>
      </div>

      <button
        onClick={testAddToCart}
        className="w-full bg-green-500 text-white px-3 py-2 rounded font-medium hover:bg-green-600 mb-3"
      >
        🛒 Test Add to Cart
      </button>

      <div className="text-xs max-h-32 overflow-y-auto bg-gray-50 p-2 rounded border">
        <strong>Test Log:</strong>
        {testStatus.length === 0 ? (
          <div className="text-gray-500 mt-1">No tests run yet</div>
        ) : (
          <div className="mt-1 space-y-1 font-mono">
            {testStatus.map((status, index) => (
              <div key={index} className="text-xs leading-tight">
                {status}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToCartTester;
