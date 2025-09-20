import React, { useState, useMemo } from 'react';
import styles from './Calendar.module.css';

const Calendar = ({ userEvents, plannedEvents, onDayClick, formatDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return { userEvents: [], plannedEvents: [] };

    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    const dayUserEvents = userEvents.filter(event =>
      event.scheduledTimes?.some(time => time.date === dateString)
    );

    const dayPlannedEvents = plannedEvents.filter(event => {
      if (event.meetingTime && event.meetingTime.date === dateString) {
        return true;
      }
      return false;
    });

    return { userEvents: dayUserEvents, plannedEvents: dayPlannedEvents };
  };

  const getDayClass = (date) => {
    if (!date) return '';

    const { userEvents: dayUserEvents, plannedEvents: dayPlannedEvents } = getEventsForDate(date);
    const hasUserEvents = dayUserEvents.length > 0;
    const hasPlannedEvents = dayPlannedEvents.length > 0;

    if (hasUserEvents && hasPlannedEvents) {
      return styles.mixedDay;
    } else if (hasPlannedEvents) {
      return styles.plannedDay;
    } else if (hasUserEvents) {
      return styles.pendingDay;
    }

    return '';
  };

  const handleDayClick = (date) => {
    if (!date) return;

    const { userEvents: dayUserEvents, plannedEvents: dayPlannedEvents } = getEventsForDate(date);
    const allDayEvents = [...dayUserEvents, ...dayPlannedEvents];

    if (allDayEvents.length > 0) {
      onDayClick(date, allDayEvents);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button className={styles.navButton} onClick={goToPreviousMonth}>
          ←
        </button>
        <h3 className={styles.monthTitle}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button className={styles.navButton} onClick={goToNextMonth}>
          →
        </button>
      </div>

      <div className={styles.weekDays}>
        {dayNames.map(day => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {days.map((date, index) => (
          <div
            key={index}
            className={`${styles.calendarDay} ${getDayClass(date)} ${
              date ? styles.clickable : ''
            }`}
            onClick={() => handleDayClick(date)}
          >
            {date ? date.getDate() : ''}
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.plannedColor}`}></div>
          <span>Planned Events</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.pendingColor}`}></div>
          <span>Pending Events</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.mixedColor}`}></div>
          <span>Both</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;