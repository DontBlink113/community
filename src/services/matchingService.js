// Service for handling event matching and planned event creation

import { db } from '../firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import {
  findMatchingEvents,
  getCityFromCoordinates,
  selectRandomSuggestedLocation
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

    // Find matching events
    const matchingEvents = findMatchingEvents(newEvent, existingEvents);

    // Check if we have enough people for a group (minimum 2, including new event)
    if (matchingEvents.length >= 1) {
      const allEventsInGroup = [newEvent, ...matchingEvents];

      // Determine optimal group size based on preferences
      const groupSizes = allEventsInGroup.map(event => event.groupSize);
      const avgGroupSize = Math.round(groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length);
      const targetSize = Math.min(avgGroupSize, allEventsInGroup.length);

      // Take the target number of events to form the group
      const selectedEvents = allEventsInGroup.slice(0, targetSize);

      if (selectedEvents.length >= 2) {
        await createPlannedEvent(selectedEvents);
        return true; // Match found and planned event created
      }
    }

    return false; // No match found
  } catch (error) {
    console.error('Error checking for matches:', error);
    return false;
  }
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

    const plannedEventData = {
      name: `${firstEvent.topic} Group`,
      topic: firstEvent.topic,
      city: city,
      eventLocation: eventLocation,
      participants: matchedEvents.map(event => event.createdBy),
      participantCount: matchedEvents.length,
      originalEvents: matchedEvents.map(event => event.id),
      scheduledTimes: matchedEvents.flatMap(event => event.scheduledTimes || []),
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
    for (const [topic, events] of Object.entries(eventsByTopic)) {
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