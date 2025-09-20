import React, { useState, useEffect, useCallback } from 'react';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import styles from './EventForm.module.css';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const EventForm = ({ onBack }) => {
  const { event, updateEvent } = useEvent();
  const { currentUser } = useAuth();
  const [newPerson, setNewPerson] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('You must be logged in to create an event');
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
        createdBy: currentUser,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'events'), eventData);

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

      alert('Event created successfully!');
      onBack();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
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

    const newScheduledTime = {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime
    };

    // Check if this date/time combination already exists
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

    // Clear the form fields
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
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Try to get address from coordinates using reverse geocoding
          // For now, we'll use a simple format, but this could be enhanced with a geocoding service
          const address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;

          updateEvent({
            location: {
              name: '',
              latitude,
              longitude,
              address
            }
          });

          setIsGettingLocation(false);
        } catch (error) {
          console.error('Error getting address:', error);
          updateEvent({
            location: {
              name: '',
              latitude,
              longitude,
              address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
            }
          });
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get current location. Please check your location permissions.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
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

  const handleClearLocation = () => {
    updateEvent({
      location: {
        name: '',
        latitude: null,
        longitude: null,
        address: ''
      }
    });
  };

  const geocodeAddress = useCallback(async (address) => {
    if (!address.trim()) return;

    setIsGeocoding(true);
    try {
      const encodedAddress = encodeURIComponent(address.trim());
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);

        updateEvent({
          location: {
            ...event.location,
            latitude,
            longitude,
            address: result.display_name || address
          }
        });
      } else {
        // If no results found, just keep the user input
        console.log('No geocoding results found for:', address);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Don't show error to user, just keep their input
    } finally {
      setIsGeocoding(false);
    }
  }, [event.location, updateEvent]);

  // Auto-geocode when address changes (with debounce)
  useEffect(() => {
    if (!event.location.address || event.location.latitude) return;

    const timeoutId = setTimeout(() => {
      geocodeAddress(event.location.address);
    }, 2000); // Wait 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [event.location.address, event.location.latitude, geocodeAddress]);

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
          <label className={styles.label}>Schedule</label>
          <div className={styles.scheduleInputs}>
            <input
              type="date"
              className={styles.input}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              placeholder="Select date"
            />
            <input
              type="time"
              className={styles.input}
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              placeholder="Start time"
            />
            <input
              type="time"
              className={styles.input}
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              placeholder="End time"
            />
            <button
              type="button"
              onClick={handleAddScheduledTime}
              className={styles.submitButton}
              style={{ margin: 0, padding: '8px 16px' }}
            >
              Add
            </button>
          </div>
          <div className={styles.scheduledTimesList}>
            {event.scheduledTimes.map((scheduledTime, index) => (
              <div key={index} className={styles.scheduledTime}>
                <span>
                  {new Date(scheduledTime.date).toLocaleDateString()} • {scheduledTime.startTime} - {scheduledTime.endTime}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveScheduledTime(index)}
                  className={styles.removeScheduledTime}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Location</label>
          <div className={styles.locationContainer}>
            <div className={styles.locationInputs}>
              <input
                type="text"
                className={styles.input}
                value={event.location.address}
                onChange={(e) => handleLocationInputChange('address', e.target.value)}
                placeholder="Enter address or location"
              />
            </div>

            <div className={styles.locationButtons}>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className={styles.locationButton}
              >
                {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
              </button>
              {event.location.address && !event.location.latitude && (
                <button
                  type="button"
                  onClick={() => geocodeAddress(event.location.address)}
                  disabled={isGeocoding}
                  className={styles.geocodeButton}
                >
                  {isGeocoding ? 'Finding Coordinates...' : 'Find Coordinates'}
                </button>
              )}
              {(event.location.latitude || event.location.address) && (
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className={styles.clearLocationButton}
                >
                  Clear Location
                </button>
              )}
            </div>

            {event.location.latitude && event.location.longitude && (
              <div className={styles.locationPreview}>
                <p className={styles.coordinatesText}>
                  📍 Coordinates: {event.location.latitude.toFixed(6)}, {event.location.longitude.toFixed(6)}
                </p>
                <div className={styles.mapPreview}>
                  <iframe
                    width="100%"
                    height="200"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.location.longitude-0.01},${event.location.latitude-0.01},${event.location.longitude+0.01},${event.location.latitude+0.01}&layer=mapnik&marker=${event.location.latitude},${event.location.longitude}`}
                    style={{ border: 0, borderRadius: '8px' }}
                    title="Location Preview"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Suggested Location for Event (Optional)</label>
          <input
            type="text"
            className={styles.input}
            value={event.suggestedLocation}
            onChange={(e) => updateEvent({ suggestedLocation: e.target.value })}
            placeholder="e.g., Coffee shop downtown, Park near campus, etc."
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
