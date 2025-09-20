import React, { useState } from 'react';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import EventForm from './components/EventForm';
import Chat from './components/Chat';
import MyEvents from './components/MyEvents';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { EventProvider } from './context/EventContext';
import './firebase';  // This initializes Firebase

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [previousPage, setPreviousPage] = useState('home');

  const handleNavigateToChat = (chatId) => {
    setPreviousPage(currentPage);
    setCurrentChatId(chatId);
    setCurrentPage('chat');
  };

  const handleBackFromChat = () => {
    setCurrentChatId(null);
    setCurrentPage(previousPage);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('home')} />;
      case 'event':
        return <EventForm onBack={() => setCurrentPage('home')} />;
      case 'chat':
        return <Chat chatId={currentChatId} onBack={handleBackFromChat} />;
      case 'myEvents':
        return <MyEvents
          onBack={() => setCurrentPage('home')}
          onNavigateToChat={handleNavigateToChat}
        />;
      default:
        return <HomePage
          onNavigateToProfile={() => setCurrentPage('profile')}
          onNavigateToEvent={() => setCurrentPage('event')}
          onNavigateToMyEvents={() => setCurrentPage('myEvents')}
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
