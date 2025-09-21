import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { calculateDistance } from '../utils/eventMatching';

export const getEventSuggestions = async (currentUserUsername, userLocation) => {
  try {
    // Get all pending events (not created by current user)
    const eventsQuery = query(
      collection(db, 'events'),
      where('createdBy', '!=', currentUserUsername)
    );

    const querySnapshot = await getDocs(eventsQuery);
    const allEvents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter events that could be suggested
    const suggestions = [];

    for (const event of allEvents) {
      // Skip sub-events (events created from joining suggestions)
      if (event.basedOnSuggestion) {
        continue;
      }

      // Skip if no location data
      if (!event.location?.latitude || !event.location?.longitude) {
        continue;
      }

      // Skip if no user location to compare
      if (!userLocation?.latitude || !userLocation?.longitude) {
        continue;
      }

      // Calculate distance (within 25 miles like the matching service)
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        event.location.latitude,
        event.location.longitude
      );

      if (distance <= 25) {
        // Find optimal time from scheduled times
        const optimalTime = getOptimalTime(event.scheduledTimes);

        // Count current participants (for now, assume 1 - the creator)
        const currentParticipants = 1;
        const spotsLeft = event.groupSize - currentParticipants;

        if (spotsLeft > 0) {
          suggestions.push({
            ...event,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            optimalTime,
            currentParticipants,
            spotsLeft
          });
        }
      }
    }

    // Sort by distance (closest first) and then by spots left (fewer spots = more urgent)
    suggestions.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      return a.spotsLeft - b.spotsLeft;
    });

    // Return top 3 suggestions
    return suggestions.slice(0, 3);

  } catch (error) {
    console.error('Error fetching event suggestions:', error);
    return [];
  }
};

// Helper function to get optimal time from scheduled times
const getOptimalTime = (scheduledTimes) => {
  if (!scheduledTimes || scheduledTimes.length === 0) {
    return null;
  }

  // For now, just return the first scheduled time
  // Could be enhanced with more sophisticated logic
  const firstTime = scheduledTimes[0];
  return {
    date: firstTime.date,
    startTime: firstTime.startTime,
    endTime: firstTime.endTime
  };
};

export const createSuggestionRequest = async (suggestion, currentUserUsername, selectedTimes) => {
  try {
    // selectedTimes now comes as an array of time objects with date, startTime, endTime
    // No need to convert, they're already in the correct format
    const scheduledTimes = selectedTimes;

    // Create a new event request with the user's selected times
    const newEventData = {
      topic: suggestion.topic,
      groupSize: suggestion.groupSize,
      scheduledTimes: scheduledTimes, // Use user's selected times
      location: suggestion.location,
      suggestedLocation: suggestion.suggestedLocation,
      createdBy: currentUserUsername,
      createdAt: new Date().toISOString(),
      // Add a reference to the original suggestion to help with matching
      basedOnSuggestion: suggestion.id
    };

    // Import addDoc here to avoid circular dependencies
    const { addDoc } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, 'events'), newEventData);

    // Check for matches with the new event
    const { checkForMatches } = await import('./matchingService');
    const eventWithId = { ...newEventData, id: docRef.id };
    const matchFound = await checkForMatches(eventWithId);

    return {
      success: true,
      matched: matchFound
    };

  } catch (error) {
    console.error('Error creating suggestion request:', error);
    return {
      success: false,
      error: error.message
    };
  }
};