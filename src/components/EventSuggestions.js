import React, { useState } from 'react';
import styles from './EventSuggestions.module.css';
import TimeSelectionPopup from './TimeSelectionPopup';

const EventSuggestions = ({ suggestions, onJoinSuggestion, isLoading }) => {
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Events Near You</h2>
          <p className={styles.subtitle}>Loading suggestions...</p>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null; // Don't show section if no suggestions
  }

  const formatDate = (dateString) => {
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (suggestion) => {
    if (suggestion.optimalTime) {
      return `${formatDate(suggestion.optimalTime.date)} at ${suggestion.optimalTime.startTime}`;
    }
    return 'Time TBD';
  };

  const handleJoinClick = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowTimePopup(true);
  };

  const handleTimeSelection = (selectedTimes) => {
    if (selectedSuggestion) {
      onJoinSuggestion(selectedSuggestion, selectedTimes);
      setShowTimePopup(false);
      setSelectedSuggestion(null);
    }
  };

  const handleClosePopup = () => {
    setShowTimePopup(false);
    setSelectedSuggestion(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Events Near You</h2>
        <p className={styles.subtitle}>Join others who are planning the same activities!</p>
      </div>

      <div className={styles.suggestionsGrid}>
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className={styles.suggestionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.eventTopic}>{suggestion.topic}</h3>
            </div>

            <div className={styles.eventDetails}>
              <div className={styles.detailRow}>
                <span className={styles.icon}>👥</span>
                <span>Group of {suggestion.groupSize} people</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.icon}>📅</span>
                <span>{formatTime(suggestion)}</span>
              </div>


              {suggestion.suggestedLocation && (
                <div className={styles.detailRow}>
                  <span className={styles.icon}>🏢</span>
                  <span>{suggestion.suggestedLocation}</span>
                </div>
              )}
            </div>

            <button
              className={styles.joinButton}
              onClick={() => handleJoinClick(suggestion)}
            >
              Join This Event
            </button>
          </div>
        ))}
      </div>

      <TimeSelectionPopup
        isOpen={showTimePopup}
        onClose={handleClosePopup}
        onConfirm={handleTimeSelection}
        eventDate={selectedSuggestion?.optimalTime?.date}
        originalScheduledTimes={selectedSuggestion?.scheduledTimes}
      />
    </div>
  );
};

export default EventSuggestions;
