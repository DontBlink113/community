// Utility functions for event matching and distance calculations

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in miles
};

// Normalize event topics for matching (case-insensitive, handle variations)
export const normalizeEventTopic = (topic) => {
  return topic.toLowerCase().trim();
};

// Check if two events have similar topics
export const topicsMatch = (topic1, topic2) => {
  const normalized1 = normalizeEventTopic(topic1);
  const normalized2 = normalizeEventTopic(topic2);

  // Exact match
  if (normalized1 === normalized2) return true;

  // Check for partial matches (e.g., "running" matches "long run")
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }

  return false;
};

// Find events that can be matched together
export const findMatchingEvents = (newEvent, existingEvents, maxDistance = 25) => {
  if (!newEvent.location.latitude || !newEvent.location.longitude) {
    return [];
  }

  const matches = existingEvents.filter(event => {
    // Must have location data
    if (!event.location.latitude || !event.location.longitude) {
      return false;
    }

    // Must have matching topic
    if (!topicsMatch(newEvent.topic, event.topic)) {
      return false;
    }

    // Must be within reasonable distance
    const distance = calculateDistance(
      newEvent.location.latitude,
      newEvent.location.longitude,
      event.location.latitude,
      event.location.longitude
    );

    return distance <= maxDistance;
  });

  return matches;
};

// Calculate acceptable group size range (±25%)
export const getGroupSizeRange = (preferredSize) => {
  const tolerance = Math.max(1, Math.floor(preferredSize / 4)); // At least 1 person tolerance
  return {
    min: Math.max(2, preferredSize - tolerance), // Minimum of 2 people
    max: preferredSize + tolerance
  };
};

// Check if a group size is acceptable for a person's preference
export const isGroupSizeAcceptable = (actualSize, preferredSize) => {
  const range = getGroupSizeRange(preferredSize);
  return actualSize >= range.min && actualSize <= range.max;
};

// Group events by compatibility with preference-based thresholds
export const groupCompatibleEvents = (events) => {
  const groups = [];
  const usedEventIds = new Set();

  // Sort events by group size preference to handle smaller groups first
  const sortedEvents = [...events].sort((a, b) => a.groupSize - b.groupSize);

  for (const event of sortedEvents) {
    if (usedEventIds.has(event.id)) continue;

    const compatibleEvents = [event];
    usedEventIds.add(event.id);

    // Find other compatible events within location and topic
    const potentialMatches = [];

    for (const otherEvent of sortedEvents) {
      if (usedEventIds.has(otherEvent.id)) continue;

      // Check topic and location compatibility
      if (topicsMatch(event.topic, otherEvent.topic) &&
          event.location.latitude && event.location.longitude &&
          otherEvent.location.latitude && otherEvent.location.longitude) {

        const distance = calculateDistance(
          event.location.latitude,
          event.location.longitude,
          otherEvent.location.latitude,
          otherEvent.location.longitude
        );

        if (distance <= 25) { // 25 mile radius
          potentialMatches.push(otherEvent);
        }
      }
    }

    // Try to form a group that satisfies the original event's size preference
    const targetRange = getGroupSizeRange(event.groupSize);

    // Add compatible events until we reach the preferred range
    for (const match of potentialMatches) {
      if (compatibleEvents.length >= targetRange.max) break;

      // Check if adding this person would still be acceptable for everyone in the group
      const newGroupSize = compatibleEvents.length + 1;
      const allAcceptable = compatibleEvents.every(e =>
        isGroupSizeAcceptable(newGroupSize, e.groupSize)
      ) && isGroupSizeAcceptable(newGroupSize, match.groupSize);

      if (allAcceptable) {
        compatibleEvents.push(match);
        usedEventIds.add(match.id);
      }
    }

    // Only create group if we have acceptable size for all participants
    const finalGroupSize = compatibleEvents.length;
    const groupIsValid = compatibleEvents.every(e =>
      isGroupSizeAcceptable(finalGroupSize, e.groupSize)
    ) && finalGroupSize >= 2;

    if (groupIsValid) {
      groups.push(compatibleEvents);
    } else {
      // If group doesn't meet size requirements, mark events as unused again
      compatibleEvents.forEach(e => usedEventIds.delete(e.id));
    }
  }

  return groups;
};

// Get city name from coordinates (simplified - in production would use reverse geocoding)
export const getCityFromCoordinates = (lat, lng) => {
  // This is a simplified version - in production you'd use a reverse geocoding service
  // For now, return a general area based on coordinates
  return `Area ${lat.toFixed(1)}, ${lng.toFixed(1)}`;
};

// Select random suggested location from a group of events
export const selectRandomSuggestedLocation = (events) => {
  const suggestedLocations = events
    .filter(event => event.suggestedLocation && event.suggestedLocation.trim())
    .map(event => event.suggestedLocation);

  if (suggestedLocations.length === 0) {
    return 'Location to be determined';
  }

  const randomIndex = Math.floor(Math.random() * suggestedLocations.length);
  return suggestedLocations[randomIndex];
};

// Check if two time slots overlap
export const timeSlotOverlaps = (slot1, slot2) => {
  // Both slots must be on the same date
  if (slot1.date !== slot2.date) return false;

  // Convert times to minutes for easier comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const slot1Start = timeToMinutes(slot1.startTime);
  const slot1End = timeToMinutes(slot1.endTime);
  const slot2Start = timeToMinutes(slot2.startTime);
  const slot2End = timeToMinutes(slot2.endTime);

  // Check for overlap: slots overlap if one starts before the other ends
  return slot1Start < slot2End && slot2Start < slot1End;
};

// Find overlapping time slots between two events
export const findOverlappingTimes = (event1, event2) => {
  if (!event1.scheduledTimes || !event2.scheduledTimes) return [];

  const overlaps = [];

  for (const slot1 of event1.scheduledTimes) {
    for (const slot2 of event2.scheduledTimes) {
      if (timeSlotOverlaps(slot1, slot2)) {
        // Calculate the actual overlap period
        const timeToMinutes = (timeStr) => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
        };

        const minutesToTime = (minutes) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        };

        const slot1Start = timeToMinutes(slot1.startTime);
        const slot1End = timeToMinutes(slot1.endTime);
        const slot2Start = timeToMinutes(slot2.startTime);
        const slot2End = timeToMinutes(slot2.endTime);

        const overlapStart = Math.max(slot1Start, slot2Start);
        const overlapEnd = Math.min(slot1End, slot2End);

        overlaps.push({
          date: slot1.date,
          startTime: minutesToTime(overlapStart),
          endTime: minutesToTime(overlapEnd),
          duration: overlapEnd - overlapStart // duration in minutes
        });
      }
    }
  }

  return overlaps;
};

// Find common available times among a group of events
export const findCommonAvailableTimes = (events) => {
  if (!events || events.length === 0) return [];

  // Start with the first event's times
  let commonTimes = [...(events[0].scheduledTimes || [])];

  // Find overlaps with each subsequent event
  for (let i = 1; i < events.length; i++) {
    const newCommonTimes = [];

    for (const commonTime of commonTimes) {
      const overlaps = findOverlappingTimes(
        { scheduledTimes: [commonTime] },
        events[i]
      );
      newCommonTimes.push(...overlaps);
    }

    commonTimes = newCommonTimes;
  }

  // Remove duplicates and sort by date/time
  const uniqueTimes = [];
  const timeKeys = new Set();

  for (const time of commonTimes) {
    const key = `${time.date}-${time.startTime}-${time.endTime}`;
    if (!timeKeys.has(key)) {
      timeKeys.add(key);
      uniqueTimes.push(time);
    }
  }

  // Sort by date and start time
  uniqueTimes.sort((a, b) => {
    const dateCompare = new Date(a.date) - new Date(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return uniqueTimes;
};

// Check if a group of events has any time compatibility
export const eventsHaveTimeCompatibility = (events) => {
  if (!events || events.length < 2) return true; // Single event or empty always compatible

  const commonTimes = findCommonAvailableTimes(events);

  // Require at least 1 hour (60 minutes) of overlap for a viable meeting
  return commonTimes.some(time => time.duration >= 60);
};

// Select the best single meeting time from available overlaps
export const selectOptimalMeetingTime = (commonTimes) => {
  if (!commonTimes || commonTimes.length === 0) return null;

  // Filter times that meet minimum duration (1 hour)
  const viableTimes = commonTimes.filter(time => time.duration >= 60);

  if (viableTimes.length === 0) return null;

  // Scoring criteria for optimal meeting time:
  // 1. Prefer longer durations (more flexibility)
  // 2. Prefer earlier dates (sooner meetings)
  // 3. Prefer afternoon times (generally more convenient)

  const scoredTimes = viableTimes.map(time => {
    let score = 0;

    // Duration score (longer is better, max 240 minutes = 4 hours)
    score += Math.min(time.duration, 240) / 240 * 40;

    // Date proximity score (sooner is better, within next 30 days)
    const daysFromNow = (new Date(time.date) - new Date()) / (1000 * 60 * 60 * 24);
    if (daysFromNow <= 30) {
      score += (30 - daysFromNow) / 30 * 30;
    }

    // Time of day score (prefer 2-6 PM range)
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(time.startTime);
    const idealStart = 14 * 60; // 2 PM
    const idealEnd = 18 * 60;   // 6 PM

    if (startMinutes >= idealStart && startMinutes <= idealEnd) {
      score += 30; // Perfect time range
    } else if (startMinutes >= 10 * 60 && startMinutes <= 20 * 60) {
      score += 20; // Reasonable time range (10 AM - 8 PM)
    } else {
      score += 10; // Less ideal but acceptable
    }

    return { ...time, score };
  });

  // Sort by score (highest first) and return the best option
  scoredTimes.sort((a, b) => b.score - a.score);

  const selectedTime = scoredTimes[0];

  // Return only the start time and date for the planned event
  return {
    date: selectedTime.date,
    startTime: selectedTime.startTime,
    duration: selectedTime.duration
  };
};