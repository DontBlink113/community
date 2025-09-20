// Service for handling event matching and planned event creation

import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import {
  findMatchingEvents,
  getCityFromCoordinates,
  selectRandomSuggestedLocation,
  isGroupSizeAcceptable,
  eventsHaveTimeCompatibility,
  findCommonAvailableTimes,
  selectOptimalMeetingTime
} from '../utils/eventMatching';

// Check for matches when a new event is created
export const checkForMatches = async (newEvent) => {
  try {
    // Get all existing events (excluding the new one)
    const eventsQuery = query(
      collection(db, 'events'),
      where('createdBy', '!=', newEvent.createdBy) // Don't match with own events
    );

    const eventsSnapshot = await getDocs(eventsQuery);
    const existingEvents = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Find matching events by topic and location
    const matchingEvents = findMatchingEvents(newEvent, existingEvents);

    if (matchingEvents.length >= 1) {
      const allEventsInGroup = [newEvent, ...matchingEvents];

      // Try to form groups that satisfy everyone's size preferences
      const compatibleGroup = findCompatibleGroupSize(allEventsInGroup);

      if (compatibleGroup && compatibleGroup.length >= 2) {
        await createPlannedEvent(compatibleGroup);
        return true; // Match found and planned event created
      }
    }

    return false; // No match found
  } catch (error) {
    console.error('Error checking for matches:', error);
    return false;
  }
};

// Find a subset of events that form a group acceptable to all participants
const findCompatibleGroupSize = (events) => {
  // Sort by group size preference (smallest first for better matching)
  const sortedEvents = [...events].sort((a, b) => a.groupSize - b.groupSize);

  // Try different group sizes starting from minimum preferences
  for (let groupSize = 2; groupSize <= events.length; groupSize++) {
    // Check if this group size is acceptable to at least 'groupSize' number of people
    const acceptableEvents = sortedEvents.filter(event =>
      isGroupSizeAcceptable(groupSize, event.groupSize)
    );

    if (acceptableEvents.length >= groupSize) {
      // Try different combinations of this size to find time-compatible groups
      const combinations = generateCombinations(acceptableEvents, groupSize);

      for (const combination of combinations) {
        // Check if this combination has time compatibility
        if (eventsHaveTimeCompatibility(combination)) {
          return combination;
        }
      }
    }
  }

  return null; // No compatible group found
};

// Generate all combinations of n events from the array
const generateCombinations = (events, n) => {
  if (n === 1) return events.map(event => [event]);
  if (n === events.length) return [events];

  const combinations = [];

  // Use iterative approach for better performance with smaller groups
  if (n === 2) {
    for (let i = 0; i < events.length - 1; i++) {
      for (let j = i + 1; j < events.length; j++) {
        combinations.push([events[i], events[j]]);
      }
    }
    return combinations;
  }

  // For larger groups, use a more efficient selection approach
  // Just try the first n events for simplicity in this implementation
  if (events.length >= n) {
    combinations.push(events.slice(0, n));
  }

  return combinations;
};

// Create a planned event from matched individual events
export const createPlannedEvent = async (matchedEvents) => {
  try {
    const batch = writeBatch(db);

    // Create the planned event
    const firstEvent = matchedEvents[0];
    const city = getCityFromCoordinates(
      firstEvent.location.latitude,
      firstEvent.location.longitude
    );
    const eventLocation = selectRandomSuggestedLocation(matchedEvents);

    // Find common available times and select the optimal one
    const commonTimes = findCommonAvailableTimes(matchedEvents);
    const selectedMeetingTime = selectOptimalMeetingTime(commonTimes);

    const plannedEventData = {
      name: `${firstEvent.topic} Group`,
      topic: firstEvent.topic,
      city: city,
      eventLocation: eventLocation,
      participants: matchedEvents.map(event => event.createdBy),
      participantCount: matchedEvents.length,
      originalEvents: matchedEvents.map(event => event.id),
      meetingTime: selectedMeetingTime, // Single selected meeting time
      allAvailableTimes: matchedEvents.flatMap(event => event.scheduledTimes || []), // Keep original for reference
      createdAt: new Date().toISOString(),
      status: 'planned'
    };

    // Add to planned events collection
    const plannedEventRef = doc(collection(db, 'plannedEvents'));
    batch.set(plannedEventRef, plannedEventData);

    // Remove the original individual events
    for (const event of matchedEvents) {
      if (event.id) {
        const eventRef = doc(db, 'events', event.id);
        batch.delete(eventRef);
      }
    }

    await batch.commit();

    console.log('Planned event created successfully:', plannedEventData);
    return plannedEventData;
  } catch (error) {
    console.error('Error creating planned event:', error);
    throw error;
  }
};

// Get all planned events for a user
export const getUserPlannedEvents = async (userId) => {
  try {
    const plannedEventsQuery = query(
      collection(db, 'plannedEvents'),
      where('participants', 'array-contains', userId)
    );

    const querySnapshot = await getDocs(plannedEventsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching planned events:', error);
    return [];
  }
};

// Batch check for existing events that can be matched
export const checkExistingEventsForMatches = async () => {
  try {
    // Get all events
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const allEvents = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group events by topic to make matching more efficient
    const eventsByTopic = {};
    for (const event of allEvents) {
      const normalizedTopic = event.topic.toLowerCase().trim();
      if (!eventsByTopic[normalizedTopic]) {
        eventsByTopic[normalizedTopic] = [];
      }
      eventsByTopic[normalizedTopic].push(event);
    }

    // Check each topic group for potential matches
    for (const [, events] of Object.entries(eventsByTopic)) {
      if (events.length >= 2) {
        // Try to create matches within this topic
        await attemptTopicMatching(events);
      }
    }
  } catch (error) {
    console.error('Error in batch matching:', error);
  }
};

// Helper function to attempt matching within a topic group
const attemptTopicMatching = async (events) => {
  const processedEvents = new Set();

  for (const event of events) {
    if (processedEvents.has(event.id)) continue;

    const matches = findMatchingEvents(event, events.filter(e =>
      e.id !== event.id && !processedEvents.has(e.id)
    ));

    if (matches.length >= 1) {
      const groupEvents = [event, ...matches.slice(0, 3)]; // Limit group size

      if (groupEvents.length >= 2) {
        await createPlannedEvent(groupEvents);

        // Mark these events as processed
        groupEvents.forEach(e => processedEvents.add(e.id));
      }
    }
  }
};