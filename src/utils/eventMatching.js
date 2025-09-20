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