import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import EventForm from './components/EventForm';
import Chat from './components/Chat';
import MyEvents from './components/MyEvents';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { EventProvider } from './context/EventContext';
import './firebase';  // This initializes Firebase

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// App Content with routing
const AppContent = () => {
  const [previousPage, setPreviousPage] = useState('/home');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only update previous page if we're not on a chat page and not on login/landing
    if (!location.pathname.startsWith('/chat') &&
        location.pathname !== '/login' &&
        location.pathname !== '/') {
      setPreviousPage(location.pathname);
    }
  }, [location]);

  const handleNavigateToChat = (chatId) => {
    // Store current page before navigating to chat
    if (!location.pathname.startsWith('/chat')) {
      setPreviousPage(location.pathname);
    }
    navigate(`/chat/${chatId}`);
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Protected Routes */}
      <Route path="/home" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      
      <Route path="/event" element={
        <ProtectedRoute>
          <EventForm onBack={() => navigate(-1)} />
        </ProtectedRoute>
      } />
      
      <Route path="/chat/:chatId" element={
        <ProtectedRoute>
          <Chat onBack={() => navigate(previousPage || '/home')} />
        </ProtectedRoute>
      } />
      
      <Route path="/my-events" element={
        <ProtectedRoute>
          <MyEvents onNavigateToChat={handleNavigateToChat} />
        </ProtectedRoute>
      } />
      
      {/* Redirect any unknown routes to home */}
      <Route path="*" element={
        <ProtectedRoute>
          <Navigate to="/home" replace />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <EventProvider>
            <AppContent />
          </EventProvider>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
