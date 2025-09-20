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

// Group events by compatibility for matching
export const groupCompatibleEvents = (events, targetGroupSize) => {
  const groups = [];
  const usedEventIds = new Set();

  for (const event of events) {
    if (usedEventIds.has(event.id)) continue;

    const compatibleEvents = [event];
    usedEventIds.add(event.id);

    // Find other compatible events
    for (const otherEvent of events) {
      if (usedEventIds.has(otherEvent.id)) continue;
      if (compatibleEvents.length >= targetGroupSize) break;

      // Check if compatible
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
          compatibleEvents.push(otherEvent);
          usedEventIds.add(otherEvent.id);
        }
      }
    }

    // Only create group if we have enough people
    if (compatibleEvents.length >= 2) {
      groups.push(compatibleEvents);
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