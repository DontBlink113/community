import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getUserPlannedEvents } from '../services/matchingService';
import Navbar from './Navbar';
import CurrentEvents from './CurrentEvents';
import PendingEvents from './PendingEvents';
import JoinEvents from './JoinEvents';
import Footer from './Footer';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentEvents, setCurrentEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [joinableEvents, setJoinableEvents] = useState([]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
    }
    return new Date(dateString).toLocaleDateString();
  };

  // Format time for display
  const formatEventTime = (event) => {
    if (event.meetingTime) {
      return `${formatDate(event.meetingTime.date)} at ${event.meetingTime.startTime}`;
    }
    if (event.scheduledTimes && event.scheduledTimes.length > 0) {
      const firstTime = event.scheduledTimes[0];
      return `${formatDate(firstTime.date)} at ${firstTime.startTime}`;
    }
    return 'Time TBD';
  };

  // Fetch user's events and planned events
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setCurrentEvents([]);
        setPendingEvents([]);
        setJoinableEvents([]);
        return;
      }

      try {
        // Fetch user's pending events
        const eventsQuery = query(
          collection(db, 'events'),
          where('createdBy', '==', currentUser.username)
        );

        const querySnapshot = await getDocs(eventsQuery);
        const userEvents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by creation date (newest first)
        userEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Format pending events for display
        const formattedPendingEvents = userEvents.map(event => ({
          id: event.id,
          title: event.topic,
          time: formatEventTime(event),
          location: event.location?.address || event.suggestedLocation || 'Location TBD'
        }));

        setPendingEvents(formattedPendingEvents);

        // Fetch user's planned events
        const plannedEventsData = await getUserPlannedEvents(currentUser.username);
        plannedEventsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Format planned events for display
        const formattedCurrentEvents = plannedEventsData.map(event => ({
          id: event.id,
          title: event.name,
          time: formatEventTime(event),
          location: event.eventLocation || 'Location TBD',
          chatId: event.chatId
        }));

        setCurrentEvents(formattedCurrentEvents);

        // For now, we'll leave joinable events empty since we don't have a system for that yet
        setJoinableEvents([]);

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleJoinEvent = (eventId) => {
    // Handle join event logic here
    console.log('Joining event:', eventId);
    // Update state or make API call
  };

  const handleEventClick = (event) => {
    if (event.chatId) {
      navigate(`/chat/${event.chatId}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'events', eventId));

      // Update local state to remove the deleted event
      setPendingEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));

      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
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

          <CurrentEvents events={currentEvents} onEventClick={handleEventClick} />
          <PendingEvents events={pendingEvents} onDeleteEvent={handleDeleteEvent} />
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
