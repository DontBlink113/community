import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './MyEvents.module.css';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getUserPlannedEvents } from '../services/matchingService';
import Calendar from './Calendar';
import EventDetailPopup from './EventDetailPopup';
import Navbar from './Navbar';

const MyEvents = ({ onBack, onNavigateToChat }) => {
  const [userEvents, setUserEvents] = useState([]);
  const [plannedEvents, setPlannedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const { currentUser } = useAuth();

  // Helper function to format dates without timezone issues
  const formatDate = (dateString) => {
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
    }
    return new Date(dateString).toLocaleDateString();
  };

  // Fetch user's events and planned events
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
          where('createdBy', '==', currentUser.username)
        );

        const querySnapshot = await getDocs(eventsQuery);
        const events = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setUserEvents(events);

        // Fetch planned events
        const plannedEventsData = await getUserPlannedEvents(currentUser.username);
        plannedEventsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPlannedEvents(plannedEventsData);

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleCalendarDayClick = (date, dayEvents) => {
    if (dayEvents.length > 0) {
      setSelectedEvent({
        date,
        events: dayEvents
      });
      setShowEventPopup(true);
    }
  };

  const handleEventClick = (event) => {
    if (event.chatId && onNavigateToChat) {
      onNavigateToChat(event.chatId);
    }
  };

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
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>My Events</h1>
        <div className={styles.eventsSection}>
          <div className={styles.eventsList}>
            {/* Unplanned Events */}
            {userEvents.length > 0 && (
              <>
                <h2 className={styles.sectionTitle}>📅 Pending Events</h2>
                {userEvents.map(event => (
                  <div key={event.id} className={styles.pendingEventCard}>
                    <div className={styles.eventHeader}>
                      <h3 className={styles.eventTopic}>{event.topic}</h3>
                      <div className={styles.eventHeaderRight}>
                        <span className={styles.statusBadge}>Waiting for matches</span>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Delete event"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <p className={styles.eventDetail}>Group Size: {event.groupSize}</p>

                    {event.scheduledTimes && event.scheduledTimes.length > 0 && (
                      <div className={styles.scheduledTimes}>
                        <span className={styles.scheduledTimesLabel}>Available Times:</span>
                        {event.scheduledTimes.slice(0, 2).map((time, index) => (
                          <div key={index} className={styles.scheduledTimeItem}>
                            {formatDate(time.date)} • {time.startTime} - {time.endTime}
                          </div>
                        ))}
                        {event.scheduledTimes.length > 2 && (
                          <div className={styles.moreTimesIndicator}>
                            +{event.scheduledTimes.length - 2} more times
                          </div>
                        )}
                      </div>
                    )}

                    {event.location && (event.location.address || event.location.latitude) && (
                      <div className={styles.eventLocation}>
                        <span className={styles.locationLabel}>📍 Location:</span>
                        <div className={styles.locationInfo}>
                          {event.location.address && (
                            <div className={styles.locationAddress}>{event.location.address}</div>
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
              </>
            )}

            {/* Horizontal separator */}
            {userEvents.length > 0 && plannedEvents.length > 0 && (
              <div className={styles.separator}></div>
            )}

            {/* Planned Events */}
            {plannedEvents.length > 0 && (
              <>
                <h2 className={styles.sectionTitle}>🎯 Planned Events</h2>
                {plannedEvents.map(event => (
                  <div
                    key={event.id}
                    className={styles.plannedEventCard}
                    onClick={() => handleEventClick(event)}
                    style={{ cursor: event.chatId ? 'pointer' : 'default' }}
                  >
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
                        </div>
                      </div>
                    )}

                    <p className={styles.eventDate}>
                      Planned: {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                    {event.chatId && (
                      <div className={styles.chatIndicator}>
                        💬 Click to open group chat
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {userEvents.length === 0 && plannedEvents.length === 0 && (
              <div className={styles.emptyState}>
                <p>No events yet. Create your first event to get started!</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.calendarSection}>
          <Calendar
            userEvents={userEvents}
            plannedEvents={plannedEvents}
            onDayClick={handleCalendarDayClick}
            formatDate={formatDate}
          />
        </div>
      </div>

      {showEventPopup && selectedEvent && (
        <EventDetailPopup
          selectedEvent={selectedEvent}
          onClose={() => setShowEventPopup(false)}
          onNavigateToChat={onNavigateToChat}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default MyEvents;