import React, { useState } from 'react';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import EventForm from './components/EventForm';
import Chat from './components/Chat';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { EventProvider } from './context/EventContext';
import './firebase';  // This initializes Firebase

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentChatId, setCurrentChatId] = useState(null);

  const handleNavigateToChat = (chatId) => {
    setCurrentChatId(chatId);
    setCurrentPage('chat');
  };

  const handleBackFromChat = () => {
    setCurrentChatId(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('home')} />;
      case 'event':
        return <EventForm onBack={() => setCurrentPage('home')} />;
      case 'chat':
        return <Chat chatId={currentChatId} onBack={handleBackFromChat} />;
      default:
        return <HomePage
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToEvent={() => setCurrentPage('event')}
          onNavigateToChat={handleNavigateToChat}
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
