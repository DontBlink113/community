import React from 'react';
import styles from './EventDetailPopup.module.css';

const EventDetailPopup = ({ selectedEvent, onClose, onNavigateToChat, formatDate }) => {
  const { date, events } = selectedEvent;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEventClick = (event) => {
    if (event.chatId && onNavigateToChat) {
      onNavigateToChat(event.chatId);
      onClose();
    }
  };

  const renderUserEvent = (event) => (
    <div key={event.id} className={styles.eventItem}>
      <div className={styles.eventHeader}>
        <h4 className={styles.eventTitle}>{event.topic}</h4>
        <span className={styles.statusBadge}>Pending</span>
      </div>
      <p className={styles.eventDetail}>Group Size: {event.groupSize}</p>

      {event.scheduledTimes && event.scheduledTimes.length > 0 && (
        <div className={styles.scheduledTimes}>
          <span className={styles.timesLabel}>Available Times:</span>
          {event.scheduledTimes
            .filter(time => time.date === date.toISOString().split('T')[0])
            .map((time, index) => (
              <div key={index} className={styles.timeItem}>
                {time.startTime} - {time.endTime}
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
          </div>
        </div>
      )}

      {event.suggestedLocation && (
        <div className={styles.suggestedLocation}>
          <span className={styles.suggestedLocationLabel}>💡 Suggested Location:</span>
          <div className={styles.suggestedLocationText}>{event.suggestedLocation}</div>
        </div>
      )}
    </div>
  );

  const renderPlannedEvent = (event) => (
    <div
      key={event.id}
      className={`${styles.eventItem} ${styles.plannedEventItem}`}
      onClick={() => handleEventClick(event)}
      style={{ cursor: event.chatId ? 'pointer' : 'default' }}
    >
      <div className={styles.eventHeader}>
        <h4 className={styles.eventTitle}>{event.name}</h4>
        <span className={styles.participantBadge}>
          {event.participantCount} participants
        </span>
      </div>
      <p className={styles.eventDetail}>Topic: {event.topic}</p>
      <p className={styles.eventDetail}>Area: {event.city}</p>
      <p className={styles.eventDetail}>📍 Event Location: {event.eventLocation}</p>

      {event.meetingTime && (
        <div className={styles.scheduledTimes}>
          <span className={styles.timesLabel}>🕐 Meeting Time:</span>
          <div className={styles.meetingTimeItem}>
            {event.meetingTime.startTime}
          </div>
        </div>
      )}

      {event.chatId && (
        <div className={styles.chatIndicator}>
          💬 Click to open group chat
        </div>
      )}
    </div>
  );

  // Separate user events and planned events
  const userEvents = events.filter(event => event.createdBy);
  const plannedEvents = events.filter(event => !event.createdBy);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            Events on {formatDate(date.toISOString().split('T')[0])}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {userEvents.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>📅 Pending Events</h4>
              {userEvents.map(renderUserEvent)}
            </div>
          )}

          {userEvents.length > 0 && plannedEvents.length > 0 && (
            <div className={styles.separator}></div>
          )}

          {plannedEvents.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>🎯 Planned Events</h4>
              {plannedEvents.map(renderPlannedEvent)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPopup;