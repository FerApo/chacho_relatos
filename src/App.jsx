import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './components/AuthPage.jsx';
import AuthCallback from './components/AuthCallback.jsx';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import Welcome from './components/Welcome';
import CustomStory from './components/CustomStory';
import Story from './components/Story/Story';
import SavedStories from './components/SavedStories';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancelled from './components/PaymentCancelled';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth, useLogout } from './context/AuthContext';

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: 'red' }}>
          <h2>Se produjo un error:</h2>
          <pre>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function Header() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const isRegistered = !!user;
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold">Chacho Relatos</h1>
        {isRegistered && (
          <span className="text-base text-gray-700 dark:text-gray-200 font-medium">
            Bienvenido {user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
          </span>
        )}
      </div>
      <div>
        {!isRegistered ? (
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Entrar</button>
        ) : (
          <button className="btn btn-secondary" onClick={async () => { await logout(); navigate('/'); }}>Salir</button>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true }}>
          <Header />
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/custom-story" element={<CustomStory />} />
            <Route path="/story" element={<Story />} />
            <Route path="/saved-stories" element={<SavedStories />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
