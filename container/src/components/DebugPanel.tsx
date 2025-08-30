import React from 'react';
import { EventBus } from '@microfrontend-ecommerce/shared';
import { useApp } from '../context/AppContext';

const DebugPanel: React.FC = () => {
  const { state } = useApp();
  const [testResults, setTestResults] = React.useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEventBus = () => {
    const eventBus = EventBus.getInstance();
    addTestResult('🧪 Testing EventBus...');
    
    // Test event emission and reception
    const testHandler = (data: any) => {
      addTestResult(`✅ Test event received: ${JSON.stringify(data)}`);
    };
    
    eventBus.on('TEST_EVENT', testHandler);
    eventBus.emit('TEST_EVENT', { test: 'data', timestamp: Date.now() });
    
    setTimeout(() => {
      eventBus.off('TEST_EVENT', testHandler);
      addTestResult('🧹 Test event handler cleaned up');
    }, 100);
  };

  const testAddToCart = () => {
    const eventBus = EventBus.getInstance();
    addTestResult('🛒 Testing ADD_TO_CART event...');
    
    const testProduct = {
      id: 999,
      title: 'Test Product',
      price: 19.99,
      description: 'Test product for debugging',
      category: 'test',
      image: 'https://via.placeholder.com/300',
      rating: { rate: 5, count: 1 }
    };

    eventBus.emit('ADD_TO_CART', {
      product: testProduct,
      quantity: 1,
    });
    
    addTestResult('📤 ADD_TO_CART event emitted with test product');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getEventBusInfo = () => {
    const eventBus = EventBus.getInstance();
    return eventBus.getAllEvents();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg p-4 max-w-md max-h-96 overflow-auto shadow-lg z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-blue-800">🔧 Add to Cart Debug</h3>
        <button 
          onClick={clearResults}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <strong>Cart Count:</strong> {state.cartCount}
        </div>
        <div className="text-sm">
          <strong>Cart Items:</strong> {state.cart.length}
        </div>
        <div className="text-sm">
          <strong>EventBus Listeners:</strong>
          <pre className="text-xs bg-gray-100 p-1 mt-1 rounded">
            {JSON.stringify(getEventBusInfo(), null, 2)}
          </pre>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={testEventBus}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          🧪 Test EventBus
        </button>
        <button
          onClick={testAddToCart}
          className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
        >
          🛒 Test ADD_TO_CART
        </button>
      </div>

      <div className="text-xs max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
        <strong>Test Results:</strong>
        {testResults.length === 0 ? (
          <div className="text-gray-500 mt-1">No tests run yet</div>
        ) : (
          <div className="mt-1 space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="font-mono text-xs">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
