import React from 'react';
import styles from './HomePage.module.css';

const JoinEvents = ({ events, onJoin }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className={`${styles.section} ${styles.joinSection}`}>
      <h2 className={styles.sectionTitle}>Join an Event</h2>
      <p className={styles.sectionSubtitle}>Find and join upcoming events in your area</p>
      <div className={styles.eventsGrid}>
        {events.map(event => (
          <div key={event.id} className={`${styles.eventCard} ${styles.joinCard}`}>
            <h3>{event.title}</h3>
            <p>{event.time}</p>
            <p>{event.location}</p>
            <p className={styles.eventSpots}>
              {event.totalPeople - event.spotsLeft} / {event.totalPeople} people
            </p>
            <button 
              className={styles.joinButton}
              onClick={() => onJoin(event.id)}
            >
              Join Event
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinEvents;
