import React, { createContext, useState, useContext } from 'react';

const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
  const [event, setEvent] = useState({
    topic: '',
    isContinuing: false,
    daysPerWeek: 1,
    intensity: 'medium', // low, medium, high
    groupSize: 2,
    sameGender: false,
    includedPeople: [],
    scheduledTimes: [] // Array of {date, startTime, endTime} objects
  });

  const updateEvent = (newEventData) => {
    setEvent(prev => ({ ...prev, ...newEventData }));
  };

  return (
    <EventContext.Provider value={{ event, updateEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);
