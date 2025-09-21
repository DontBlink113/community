import React from 'react';
import styles from './HomePage.module.css';

const CurrentEvents = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Your Upcoming Events</h2>
      <div className={styles.eventsGrid}>
        {events.map(event => (
          <div key={event.id} className={styles.eventCard}>
            <h3>{event.title}</h3>
            <p>{event.time}</p>
            <p>{event.location}</p>
            <div className={styles.eventStatus}>
              <span className={styles.statusBadge}>Confirmed</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentEvents;
