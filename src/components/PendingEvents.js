import React from 'react';
import styles from './HomePage.module.css';

const PendingEvents = ({ events, onDeleteEvent }) => {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Pending Matches</h2>
      <p className={styles.sectionSubtitle}>We're finding the perfect group for you!</p>
      {!events || events.length === 0 ? (
        <div className={styles.emptyState}>
          Nothing right now!
        </div>
      ) : (
        <div className={styles.eventsGrid}>
          {events.map(event => (
            <div key={event.id} className={`${styles.eventCard} ${styles.pendingCard}`}>
              <div className={styles.eventHeader}>
                <h3>{event.title}</h3>
                <button
                  className={styles.deleteButton}
                  onClick={() => onDeleteEvent && onDeleteEvent(event.id)}
                  title="Delete event"
                >
                  ×
                </button>
              </div>
              <p>{event.time}</p>
              <p>{event.location}</p>
              <div className={styles.eventStatus}>
                <span className={`${styles.statusBadge} ${styles.pendingBadge}`}>Finding Group</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingEvents;
