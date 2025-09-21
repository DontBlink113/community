import React, { useState, useEffect } from 'react';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { checkForMatches } from '../services/matchingService';
import Navbar from './Navbar';
import styles from './EventForm.module.css';

const EventForm = ({ onBack }) => {
  const { event, updateEvent } = useEvent();
  const { currentUser } = useAuth();
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Initialize form with user data only once when component mounts
  useEffect(() => {
    if (currentUser && !event.creatorId) {
      updateEvent({
        creatorId: currentUser.uid,
        creatorName: currentUser.displayName || 'Anonymous',
        topic: '',
        scheduledTimes: [],
        groupSize: 2,
        location: {
          name: '',
          address: '',
          latitude: null,
          longitude: null
        },
        sameGender: false,
        isContinuing: false,
        daysPerWeek: 1
      });
    }
    // This effect should only run once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (event.scheduledTimes.length === 0) {
      alert('Please add at least one scheduled time');
      return;
    }
    if (!event.location.address) {
      alert('Please add a location');
      return;
    }

    if (!event.groupSize || event.groupSize < 2) {
      alert('Group size must be at least 2 people');
      return;
    }

    try {
      // Store topic, group size, scheduled times, location, and suggested location
      const eventData = {
        topic: event.topic,
        groupSize: event.groupSize,
        scheduledTimes: event.scheduledTimes,
        location: event.location,
        suggestedLocation: event.suggestedLocation,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);

      // Add the document ID to the event data for matching
      const eventWithId = { ...eventData, id: docRef.id };

      // Check for matches with other events
      const matchFound = await checkForMatches(eventWithId);

      // Clear the form and go back to home
      updateEvent({
        topic: '',
        groupSize: 2,
        scheduledTimes: [],
        location: {
          name: '',
          latitude: null,
          longitude: null,
          address: ''
        },
        suggestedLocation: ''
      });

      if (matchFound) {
        alert('Event created and matched with other users! Check your Planned Events section.');
      } else {
        alert('Event created successfully! We\'ll notify you when we find matching participants.');
      }
      onBack();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };


  const handleAddScheduledTime = (e) => {
    e.preventDefault();

    if (!newDate || !newStartTime || !newEndTime) {
      alert('Please fill in all date and time fields');
      return;
    }

    if (newStartTime >= newEndTime) {
      alert('End time must be after start time');
      return;
    }

    const selectedDateTime = new Date(`${newDate}T${newStartTime}`);
    const currentDateTime = new Date();
    const oneHourFromNow = new Date(currentDateTime.getTime() + 60 * 60 * 1000);

    if (selectedDateTime <= oneHourFromNow) {
      const today = new Date().toISOString().split('T')[0];
      if (newDate === today) {
        alert('For today\'s date, please select a time that is at least 1 hour from now');
      } else {
        alert('Please select a future date and time');
      }
      return;
    }

    const newScheduledTime = {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime
    };

    const exists = event.scheduledTimes.some(time =>
      time.date === newDate && time.startTime === newStartTime && time.endTime === newEndTime
    );

    if (exists) {
      alert('This date and time combination already exists');
      return;
    }

    updateEvent({
      scheduledTimes: [...event.scheduledTimes, newScheduledTime]
    });

    setNewDate('');
    setNewStartTime('');
    setNewEndTime('');
  };

  const handleRemoveScheduledTime = (indexToRemove) => {
    updateEvent({
      scheduledTimes: event.scheduledTimes.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateEvent({
          location: {
            ...event.location,
            latitude,
            longitude,
            address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          }
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
        setIsGettingLocation(false);
      }
    );
  };

  const handleLocationInputChange = (field, value) => {
    updateEvent({
      location: {
        ...event.location,
        [field]: value
      }
    });
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Home
        </button>
        <h1 className={styles.title}>Create New Event</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Event Topic */}
          <div className={styles.formGroup}>
            <label className={styles.label}>What would you like to do?</label>
            <input
              type="text"
              className={styles.input}
              value={event.topic || ''}
              onChange={(e) => updateEvent({ topic: e.target.value })}
              placeholder="e.g., Study Group, Coffee Chat, Lunch"
              required
            />
          </div>

          {/* Date & Time */}
          <div className={styles.formGroup}>
            <label className={styles.label}>When?</label>
            <div className={styles.scheduleInputs}>
              <input
                type="date"
                className={styles.input}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <input
                type="time"
                className={styles.input}
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
              <span className={styles.timeSeparator}>to</span>
              <input
                type="time"
                className={styles.input}
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddScheduledTime}
                className={styles.addButton}
                disabled={!newDate || !newStartTime || !newEndTime}
              >
                Add Time
              </button>
            </div>
            
            {event.scheduledTimes.length > 0 && (
              <div className={styles.scheduledTimesList}>
                {event.scheduledTimes.map((time, index) => (
                  <div key={index} className={styles.scheduledTime}>
                    <span>
                      {(() => {
                        const [year, month, day] = time.date.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        return date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        });
                      })()} • {time.startTime} - {time.endTime}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveScheduledTime(index)}
                      className={styles.removeScheduledTime}
                      aria-label="Remove time slot"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Where?</label>
            <div className={styles.locationInputs}>
              <input
                type="text"
                className={styles.input}
                value={event.location?.address || ''}
                onChange={(e) => handleLocationInputChange('address', e.target.value)}
                placeholder="Enter a location or address"
              />
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className={styles.locationButton}
              >
                {isGettingLocation ? 'Detecting...' : 'Use My Location'}
              </button>
            </div>
            
            {event.location?.latitude && event.location?.longitude && (
              <div className={styles.mapPreview}>
                <iframe
                  width="100%"
                  height="180"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.location.longitude-0.01},${event.location.latitude-0.01},${event.location.longitude+0.01},${event.location.latitude+0.01}&layer=mapnik&marker=${event.location.latitude},${event.location.longitude}`}
                  style={{ border: 0, borderRadius: '8px', marginTop: '12px' }}
                  title="Location Preview"
                />
              </div>
            )}
          </div>

          {/* Group Size */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              How many people total? (including you)
            </label>
            <input
              type="number"
              className={styles.input}
              value={event.groupSize || 2}
              onChange={(e) => updateEvent({ groupSize: parseInt(e.target.value) || 2 })}
              min="2"
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Create Event
          </button>
        </form>
      </div>
    </>
  );
};

export default EventForm;
