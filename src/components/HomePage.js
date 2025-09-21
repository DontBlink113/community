import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import CurrentEvents from './CurrentEvents';
import PendingEvents from './PendingEvents';
import JoinEvents from './JoinEvents';
import Footer from './Footer';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  
  // Sample data - replace with actual data from your state/API
  const currentEvents = [
    {
      id: 1,
      title: 'Team Standup',
      time: 'Today, 10:00 AM',
      location: 'Zoom Meeting'
    },
    {
      id: 2,
      title: 'Lunch with Team',
      time: 'Tomorrow, 12:30 PM',
      location: 'Downtown Cafe'
    }
  ];

  const pendingEvents = [
    {
      id: 3,
      title: 'Coffee Chat',
      time: 'Friday, 3:00 PM',
      location: 'Local Coffee Shop'
    }
  ];

  const joinableEvents = [
    {
      id: 4,
      title: 'Hackathon Meetup',
      time: 'Saturday, 10:00 AM',
      location: 'Tech Hub',
      spotsLeft: 3,
      totalPeople: 8
    },
    {
      id: 5,
      title: 'Study Group',
      time: 'Sunday, 2:00 PM',
      location: 'Library',
      spotsLeft: 5,
      totalPeople: 10
    },
    {
      id: 6,
      title: 'Networking Event',
      time: 'Monday, 6:00 PM',
      location: 'Downtown',
      spotsLeft: 2,
      totalPeople: 15
    }
  ];

  const handleJoinEvent = (eventId) => {
    // Handle join event logic here
    console.log('Joining event:', eventId);
    // Update state or make API call
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.createEventSection}>
            <h2>Looking to meet new people?</h2>
            <p>Create an event and we'll find you the perfect group!</p>
            <button 
              className={styles.newEventButton}
              onClick={() => navigate('/event')}
            >
              Create New Event
            </button>
          </div>

          <CurrentEvents events={currentEvents} />
          <PendingEvents events={pendingEvents} />
          <JoinEvents 
            events={joinableEvents} 
            onJoin={handleJoinEvent} 
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
