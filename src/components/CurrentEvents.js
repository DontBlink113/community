import React from 'react';
import styles from './HomePage.module.css';

const CurrentEvents = ({ events, onEventClick }) => {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Your Upcoming Events</h2>
      {!events || events.length === 0 ? (
        <div className={styles.emptyState}>
          Nothing right now!
        </div>
      ) : (
        <div className={styles.eventsGrid}>
          {events.map(event => (
            <div
              key={event.id}
              className={`${styles.eventCard} ${event.chatId ? styles.clickableCard : ''}`}
              onClick={() => onEventClick && onEventClick(event)}
              style={{ cursor: event.chatId ? 'pointer' : 'default' }}
            >
              <h3>{event.title}</h3>
              <p>{event.time}</p>
              <p>{event.location}</p>
              <div className={styles.eventStatus}>
                <span className={styles.statusBadge}>Confirmed</span>
                {event.chatId && (
                  <span className={styles.chatHint}>💬 Click to open chat</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrentEvents;
