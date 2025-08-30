import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ProfileView from './components/ProfileView';
import './index.css';

// Auth content component
const AuthContent: React.FC = () => {
  const { state } = useAuth();
  const [isSignup, setIsSignup] = useState(false);

  // If user is authenticated, show profile
  if (state.isAuthenticated) {
    return <ProfileView />;
  }

  // Show auth forms
  return (
    <div className="auth-container">
      {isSignup ? (
        <SignupForm onToggleMode={() => setIsSignup(false)} />
      ) : (
        <LoginForm onToggleMode={() => setIsSignup(true)} />
      )}
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AuthContent />
      </div>
    </AuthProvider>
  );
};

export default App;
