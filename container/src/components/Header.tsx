import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { EventBus } from '@microfrontend-ecommerce/shared';

const Header: React.FC = () => {
  const { state, logout } = useApp();
  const [showDebugPanel, setShowDebugPanel] = React.useState(false);
  const [eventBusStatus, setEventBusStatus] = React.useState<any>({});
  
  // Debug panel toggle
  const toggleDebugPanel = () => {
    setShowDebugPanel(!showDebugPanel);
    if (!showDebugPanel) {
      const eventBus = EventBus.getInstance();
      setEventBusStatus(eventBus.getAllEvents());
    }
  };
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary-600 border-primary-600' : 'text-gray-600 hover:text-primary-600';
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🛒</span>
            <span className="text-xl font-bold text-gray-900">MicroStore</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`pb-2 border-b-2 border-transparent transition-colors ${isActive('/')}`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`pb-2 border-b-2 border-transparent transition-colors ${isActive('/products')}`}
            >
              Products
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              {state.cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {state.cartCount}
                </span>
              )}
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <span className="absolute -bottom-6 -right-2 bg-blue-500 text-white text-xs px-1 rounded text-[10px]">
                    {state.cartCount}
                  </span>
                  <button
                    onClick={toggleDebugPanel}
                    className="absolute -bottom-12 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded hover:bg-purple-600"
                    title="Toggle Debug Panel"
                  >
                    🔍
                  </button>
                </>
              )}
            </Link>

            {/* User menu */}
            {state.isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth"
                  className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {(state.user?.name?.firstname || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">
                    {state.user?.name?.firstname || 'User'}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Debug Panel */}
      {showDebugPanel && process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border-b-2 border-yellow-200 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-yellow-800 mb-2">🛒 Add to Cart Debug Panel</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Container Cart Count:</strong> {state.cartCount}
                  </div>
                  <div>
                    <strong>Container Cart Items:</strong> {state.cart.length}
                  </div>
                  <div>
                    <strong>Stored Products:</strong> {Object.keys(state.products).length}
                  </div>
                  <div>
                    <strong>User Authenticated:</strong> {state.isAuthenticated ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="mt-4">
                  <strong>EventBus Listeners:</strong>
                  <pre className="mt-1 text-xs bg-yellow-100 p-2 rounded max-w-md overflow-auto">
                    {JSON.stringify(eventBusStatus, null, 2)}
                  </pre>
                </div>
                <div className="mt-2">
                  <strong>Cart Details:</strong>
                  <pre className="mt-1 text-xs bg-yellow-100 p-2 rounded max-w-md overflow-auto">
                    {JSON.stringify(state.cart, null, 2)}
                  </pre>
                </div>
              </div>
              <button 
                onClick={toggleDebugPanel}
                className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
              >
                ✕ Close
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
