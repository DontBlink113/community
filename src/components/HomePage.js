import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import LoginModal from './LoginModal';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const HomePage = ({ onNavigateToProfile, onNavigateToEvent }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const { isLoggedIn, logout, currentUser } = useAuth();
  const { profile } = useProfile();

  // Fetch user's events when they're logged in
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!currentUser) {
        setUserEvents([]);
        return;
      }

      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('createdBy', '==', currentUser)
        );

        const querySnapshot = await getDocs(eventsQuery);
        const events = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by creation date (newest first) on the client side
        events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setUserEvents(events);
      } catch (error) {
        console.error('Error fetching user events:', error);
      }
    };

    fetchUserEvents();
  }, [currentUser]);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'events', eventId));

      // Update local state to remove the deleted event
      setUserEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));

      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span 
            className={styles.appTitle}
            onClick={() => window.location.reload()}
          >
            Community
          </span>
        </div>
        <div className={styles.headerButtons}>
          {isLoggedIn ? (
            <>
              <button 
                className={`${styles.button} ${styles.profileButton}`}
                onClick={onNavigateToProfile}
              >
                View Profile
              </button>
              <button 
                className={`${styles.button} ${styles.loginButton}`}
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              className={`${styles.button} ${styles.loginButton}`}
              onClick={() => setShowLoginModal(true)}
            >
              Login
            </button>
          )}
        </div>
      </header>
      {isLoggedIn && (
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeMessage}>
            Welcome, {profile.name || 'User'}
          </div>
        </div>
      )}
      <div className={styles.createEventContainer}>
        <button
          className={`${styles.button} ${styles.createEventButton}`}
          onClick={onNavigateToEvent}
        >
          Create Event
        </button>
      </div>

      {isLoggedIn && userEvents.length > 0 && (
        <div className={styles.eventsSection}>
          <h2 className={styles.eventsTitle}>Your Events</h2>
          <div className={styles.eventsList}>
            {userEvents.map(event => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventHeader}>
                  <h3 className={styles.eventTopic}>{event.topic}</h3>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteEvent(event.id)}
                    title="Delete event"
                  >
                    ×
                  </button>
                </div>
                <p className={styles.eventDetail}>Group Size: {event.groupSize}</p>
                {event.scheduledTimes && event.scheduledTimes.length > 0 && (
                  <div className={styles.scheduledTimes}>
                    <span className={styles.scheduledTimesLabel}>Scheduled Times:</span>
                    {event.scheduledTimes.map((time, index) => (
                      <div key={index} className={styles.scheduledTimeItem}>
                        {new Date(time.date).toLocaleDateString()} • {time.startTime} - {time.endTime}
                      </div>
                    ))}
                  </div>
                )}
                {event.location && (event.location.address || event.location.latitude) && (
                  <div className={styles.eventLocation}>
                    <span className={styles.locationLabel}>📍 Location:</span>
                    <div className={styles.locationInfo}>
                      {event.location.address && (
                        <div className={styles.locationAddress}>{event.location.address}</div>
                      )}
                      {event.location.latitude && event.location.longitude && !event.location.address && (
                        <div className={styles.locationCoords}>
                          {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {event.suggestedLocation && (
                  <div className={styles.suggestedLocation}>
                    <span className={styles.suggestedLocationLabel}>💡 Suggested Location:</span>
                    <div className={styles.suggestedLocationText}>{event.suggestedLocation}</div>
                  </div>
                )}
                <p className={styles.eventDate}>
                  Created: {new Date(event.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export default HomePage;
