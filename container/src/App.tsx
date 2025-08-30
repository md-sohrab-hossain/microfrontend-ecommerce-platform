import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

const showDebugBoxes = false; // Set to false to hide all debug boxes
import Header from './components/Header';
import MicrofrontendWrapper from './components/MicrofrontendWrapper';
import RemoteProductsApp from './components/RemoteProductsApp';
import RemoteCartApp from './components/RemoteCartApp';
import RemoteAuthApp from './components/RemoteAuthApp';
// Debug components removed for clean UI
// import SimpleAddToCartTest from './components/SimpleAddToCartTest';
// import EventBusTestPanel from './components/EventBusTestPanel';
import Home from './pages/Home';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Home route */}
              <Route path="/" element={<Home />} />
              
              {/* Products microfrontend */}
              <Route
                path="/products/*"
                element={
                  <div>
                    {showDebugBoxes && (
                      <div style={{ padding: '10px', background: '#f3e5f5', border: '1px solid #9c27b0', margin: '10px 0' }}>
                        <strong>🛣️ Container Debug:</strong> Products route matched (/products/*)
                      </div>
                    )}
                    <MicrofrontendWrapper>
                      <RemoteProductsApp />
                    </MicrofrontendWrapper>
                  </div>
                }
              />
              
              {/* Cart microfrontend */}
              <Route
                path="/cart/*"
                element={
                  <MicrofrontendWrapper>
                    <RemoteCartApp />
                  </MicrofrontendWrapper>
                }
              />
              
              {/* Auth microfrontend */}
              <Route
                path="/auth/*"
                element={
                  <MicrofrontendWrapper>
                    <RemoteAuthApp />
                  </MicrofrontendWrapper>
                }
              />
            </Routes>
          </main>
          
          {/* Footer */}
          <footer className="bg-white border-t mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-600">
                <p>&copy; 2024 MicroStore. Built with Microfrontend Architecture.</p>
                <p className="text-sm mt-2">
                  React + Vue.js + Webpack Module Federation
                </p>
              </div>
            </div>
          </footer>
        </div>
        
        {/* Debug Tools for development - REMOVED */}
        {/* Debug panels removed for clean production UI */}
      </Router>
    </AppProvider>
  );
}

export default App;
