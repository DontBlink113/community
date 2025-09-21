import React, { useState } from 'react';
import styles from './TimeSelectionPopup.module.css';

const TimeSelectionPopup = ({ isOpen, onClose, onConfirm, eventDate, originalScheduledTimes }) => {
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
    return new Date(dateString).toLocaleDateString();
  };

  const handleAddTime = () => {
    if (!newStartTime || !newEndTime) {
      alert('Please enter both start and end times');
      return;
    }

    if (newStartTime >= newEndTime) {
      alert('End time must be after start time');
      return;
    }

    const newTimeSlot = {
      date: eventDate,
      startTime: newStartTime,
      endTime: newEndTime
    };

    setSelectedTimes(prev => [...prev, newTimeSlot]);
    setNewStartTime('');
    setNewEndTime('');
  };

  const handleRemoveTime = (index) => {
    setSelectedTimes(prev => prev.filter((_, i) => i !== index));
  };

  const checkTimeCompatibility = () => {
    if (!originalScheduledTimes || originalScheduledTimes.length === 0) {
      return true; // No original times to check against
    }

    // Check if any of the user's selected times overlap with the original event times
    for (const userTime of selectedTimes) {
      for (const originalTime of originalScheduledTimes) {
        if (originalTime.date === userTime.date) {
          // Check for time overlap
          const userStart = new Date(`2000-01-01 ${userTime.startTime}`);
          const userEnd = new Date(`2000-01-01 ${userTime.endTime}`);
          const originalStart = new Date(`2000-01-01 ${originalTime.startTime}`);
          const originalEnd = new Date(`2000-01-01 ${originalTime.endTime}`);

          if (userStart < originalEnd && userEnd > originalStart) {
            return true; // Found overlap
          }
        }
      }
    }
    return false; // No overlap found
  };

  const handleConfirm = () => {
    if (selectedTimes.length === 0) {
      alert('Please add at least one time slot');
      return;
    }

    if (!checkTimeCompatibility()) {
      alert('Your selected times don\'t overlap with the original event times. Please select times that work with the event creator\'s availability.');
      return;
    }

    onConfirm(selectedTimes);
    setSelectedTimes([]);
  };

  const handleCancel = () => {
    setSelectedTimes([]);
    setNewStartTime('');
    setNewEndTime('');
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h3 className={styles.title}>Select Your Available Times</h3>
          <button className={styles.closeButton} onClick={handleCancel}>×</button>
        </div>

        <div className={styles.content}>
          <p className={styles.subtitle}>
            What times are you available on <strong>{formatDate(eventDate)}</strong>?
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>Add Time Slots</label>
            <div className={styles.scheduleInputs}>
              <input
                type="time"
                className={styles.input}
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                placeholder="Start time"
              />
              <span className={styles.timeSeparator}>to</span>
              <input
                type="time"
                className={styles.input}
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                placeholder="End time"
              />
              <button
                type="button"
                onClick={handleAddTime}
                className={styles.addButton}
                disabled={!newStartTime || !newEndTime}
              >
                Add Time
              </button>
            </div>

            {selectedTimes.length > 0 && (
              <div className={styles.scheduledTimesList}>
                {selectedTimes.map((time, index) => (
                  <div key={index} className={styles.scheduledTime}>
                    <span>
                      {formatDate(time.date)} • {time.startTime} - {time.endTime}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(index)}
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
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={selectedTimes.length === 0}
          >
            Join Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSelectionPopup;