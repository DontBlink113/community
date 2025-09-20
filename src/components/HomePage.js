import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import LoginModal from './LoginModal';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getUserPlannedEvents } from '../services/matchingService';

const HomePage = ({ onNavigateToProfile, onNavigateToEvent }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userEvents, setUserEvents] = useState([]);
  const [plannedEvents, setPlannedEvents] = useState([]);
  const { isLoggedIn, logout, currentUser } = useAuth();
  const { profile } = useProfile();

  // Helper function to format dates without timezone issues
  const formatDate = (dateString) => {
    // If it's already a formatted date string (YYYY-MM-DD), format it directly
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
    }
    // Otherwise, use the original date handling for createdAt timestamps
    return new Date(dateString).toLocaleDateString();
  };

  // Fetch user's events and planned events when they're logged in
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setUserEvents([]);
        setPlannedEvents([]);
        return;
      }

      try {
        // Fetch regular events
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

        // Fetch planned events
        const plannedEventsData = await getUserPlannedEvents(currentUser);
        plannedEventsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPlannedEvents(plannedEventsData);

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
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
                        {formatDate(time.date)} • {time.startTime} - {time.endTime}
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

      {isLoggedIn && plannedEvents.length > 0 && (
        <div className={styles.eventsSection}>
          <h2 className={styles.eventsTitle}>🎯 Planned Events</h2>
          <div className={styles.eventsList}>
            {plannedEvents.map(event => (
              <div key={event.id} className={styles.plannedEventCard}>
                <div className={styles.eventHeader}>
                  <h3 className={styles.eventTopic}>{event.name}</h3>
                  <span className={styles.participantBadge}>
                    {event.participantCount} participants
                  </span>
                </div>
                <p className={styles.eventDetail}>Topic: {event.topic}</p>
                <p className={styles.eventDetail}>Area: {event.city}</p>
                <p className={styles.eventDetail}>📍 Event Location: {event.eventLocation}</p>

                {event.meetingTime && (
                  <div className={styles.scheduledTimes}>
                    <span className={styles.scheduledTimesLabel}>🕐 Meeting Time:</span>
                    <div className={styles.meetingTimeItem}>
                      {formatDate(event.meetingTime.date)} at {event.meetingTime.startTime}
                      {event.meetingTime.duration && (
                        <span className={styles.durationBadge}>
                          {Math.floor(event.meetingTime.duration / 60)}h {event.meetingTime.duration % 60}m available
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <p className={styles.eventDate}>
                  Planned: {new Date(event.createdAt).toLocaleDateString()}
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
