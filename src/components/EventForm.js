import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import styles from './EventForm.module.css';

const EventForm = ({ onBack }) => {
  const { event, updateEvent } = useEvent();
  const [newPerson, setNewPerson] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would be sent to a backend
    console.log('Event created:', event);
  };

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (newPerson.trim() && !event.includedPeople.includes(newPerson.trim())) {
      updateEvent({
        includedPeople: [...event.includedPeople, newPerson.trim()]
      });
      setNewPerson('');
    }
  };

  const handleRemovePerson = (personToRemove) => {
    updateEvent({
      includedPeople: event.includedPeople.filter(person => person !== personToRemove)
    });
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        Back to Home
      </button>
      <h1 className={styles.title}>Create Event</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Topic of Event</label>
          <input
            type="text"
            className={styles.input}
            value={event.topic}
            onChange={(e) => updateEvent({ topic: e.target.value })}
            placeholder="e.g., Study Group, Sports, Movie Night"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={event.isContinuing}
              onChange={(e) => updateEvent({ isContinuing: e.target.checked })}
              id="continuing"
            />
            <label htmlFor="continuing" className={styles.label}>
              Interested in continuing this event?
            </label>
          </div>
        </div>

        {event.isContinuing && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Days per Week</label>
            <select
              className={styles.select}
              value={event.daysPerWeek}
              onChange={(e) => updateEvent({ daysPerWeek: parseInt(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>Intensity Level</label>
          <div className={styles.intensityButtons}>
            {['low', 'medium', 'high'].map(level => (
              <button
                key={level}
                type="button"
                className={`${styles.intensityButton} ${event.intensity === level ? styles.selected : ''}`}
                onClick={() => updateEvent({ intensity: level })}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Preferred Group Size</label>
          <input
            type="number"
            className={styles.input}
            value={event.groupSize}
            onChange={(e) => updateEvent({ groupSize: Math.max(2, parseInt(e.target.value)) })}
            min="2"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={event.sameGender}
              onChange={(e) => updateEvent({ sameGender: e.target.checked })}
              id="sameGender"
            />
            <label htmlFor="sameGender" className={styles.label}>
              Same gender group only?
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Include Specific People</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className={styles.input}
              value={newPerson}
              onChange={(e) => setNewPerson(e.target.value)}
              placeholder="Enter name"
            />
            <button
              type="button"
              onClick={handleAddPerson}
              className={styles.submitButton}
              style={{ margin: 0, padding: '8px 16px' }}
            >
              Add
            </button>
          </div>
          <div className={styles.peopleList}>
            {event.includedPeople.map(person => (
              <div key={person} className={styles.person}>
                {person}
                <button
                  type="button"
                  onClick={() => handleRemovePerson(person)}
                  className={styles.removePerson}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Create Event
        </button>
      </form>
    </div>
  );
};

export default EventForm;
