import React, { useState } from 'react';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import EventForm from './components/EventForm';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { EventProvider } from './context/EventContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('home')} />;
      case 'event':
        return <EventForm onBack={() => setCurrentPage('home')} />;
      default:
        return <HomePage 
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToEvent={() => setCurrentPage('event')}
        />;
    }
  };

  return (
    <AuthProvider>
      <ProfileProvider>
        <EventProvider>
          {renderPage()}
        </EventProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
