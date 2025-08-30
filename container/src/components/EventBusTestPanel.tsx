import React from 'react';
import { EventBus } from '@microfrontend-ecommerce/shared';
import { useApp } from '../context/AppContext';

const EventBusTestPanel: React.FC = () => {
  const { state } = useApp();
  const [testResults, setTestResults] = React.useState<string[]>([]);
  const [eventBusInfo, setEventBusInfo] = React.useState<any>({});

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const analyzeEventBus = () => {
    const eventBus = EventBus.getInstance();
    addTestResult('🔍 Analyzing EventBus...');
    
    const info = {
      instance: !!eventBus,
      hasEmit: typeof eventBus?.emit === 'function',
      hasOn: typeof eventBus?.on === 'function',
      hasOff: typeof eventBus?.off === 'function',
      hasListeners: typeof eventBus?.listeners === 'function',
      hasGetAllEvents: typeof eventBus?.getAllEvents === 'function',
    };
    
    setEventBusInfo(info);
    addTestResult(`EventBus methods: emit:${info.hasEmit}, on:${info.hasOn}, listeners:${info.hasListeners}`);
    
    // Test listener count for ADD_TO_CART
    if (info.hasListeners) {
      const listeners = eventBus.listeners('ADD_TO_CART');
      addTestResult(`ADD_TO_CART listeners: ${listeners.length}`);
    } else {
      addTestResult('Cannot check listeners - method not available');
    }
  };

  const testDirectAddToCart = () => {
    const eventBus = EventBus.getInstance();
    addTestResult('🧪 Testing direct ADD_TO_CART emission...');
    
    const testProduct = {
      id: 88888,
      title: 'EventBus Test Product',
      price: 99.99,
      description: 'A test product to verify EventBus functionality',
      category: 'test',
      image: 'https://via.placeholder.com/300x300.png?text=EventBus+Test',
      rating: { rate: 5, count: 1 }
    };

    try {
      eventBus.emit('ADD_TO_CART', {
        product: testProduct,
        quantity: 1,
      });
      addTestResult('✅ Direct ADD_TO_CART emitted successfully');
    } catch (error) {
      addTestResult(`❌ Direct emission failed: ${error}`);
    }
  };

  const listenForEvents = () => {
    const eventBus = EventBus.getInstance();
    addTestResult('👂 Setting up test listeners...');
    
    const testListener = (data: any) => {
      addTestResult(`🎯 Received ADD_TO_CART: ${data.product?.title || 'Unknown product'}`);
    };
    
    eventBus.on('ADD_TO_CART', testListener);
    addTestResult('✅ Test listener registered for ADD_TO_CART');
    
    // Cleanup after 30 seconds
    setTimeout(() => {
      eventBus.off('ADD_TO_CART', testListener);
      addTestResult('🧹 Test listener removed');
    }, 30000);
  };

  const clearResults = () => {
    setTestResults([]);
    setEventBusInfo({});
  };

  return (
    <div className="fixed top-4 left-4 bg-purple-50 border-2 border-purple-500 rounded-lg p-3 max-w-sm shadow-lg z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-purple-800">🚌 EventBus Test</h3>
        <button 
          onClick={clearResults}
          className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
        >
          Clear
        </button>
      </div>

      <div className="space-y-1 mb-3 text-xs">
        <div><strong>Cart Count:</strong> {state.cartCount}</div>
        <div><strong>Cart Items:</strong> {state.cart.length}</div>
      </div>

      <div className="space-y-1 mb-3">
        <button
          onClick={analyzeEventBus}
          className="w-full bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
        >
          🔍 Analyze EventBus
        </button>
        <button
          onClick={testDirectAddToCart}
          className="w-full bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
        >
          🧪 Test Direct ADD_TO_CART
        </button>
        <button
          onClick={listenForEvents}
          className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
        >
          👂 Listen for Events
        </button>
      </div>

      <div className="text-xs max-h-32 overflow-y-auto bg-white p-2 rounded border">
        <strong>Test Results:</strong>
        {testResults.length === 0 ? (
          <div className="text-gray-500 mt-1">No tests run yet</div>
        ) : (
          <div className="mt-1 space-y-1 font-mono">
            {testResults.map((result, index) => (
              <div key={index} className="text-xs leading-tight">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      {Object.keys(eventBusInfo).length > 0 && (
        <div className="mt-2 text-xs">
          <strong>EventBus Info:</strong>
          <pre className="bg-gray-100 p-1 rounded text-xs mt-1">
            {JSON.stringify(eventBusInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EventBusTestPanel;
