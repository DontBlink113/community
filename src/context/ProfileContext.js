import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    interests: [],
    profilePicture: null,
    location: {
      address: '',
      latitude: null,
      longitude: null
    }
  });

  // Load profile from Firestore when user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser || !currentUser.username) {
        setProfile({
          name: '',
          interests: [],
          profilePicture: null,
          location: {
            address: '',
            latitude: null,
            longitude: null
          }
        });
        return;
      }

      try {
        const profileDoc = await getDoc(doc(db, 'profiles', currentUser.username));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setProfile({
            name: data.name || '',
            interests: data.interests || [],
            profilePicture: data.profilePicture || null,
            location: data.location || {
              address: '',
              latitude: null,
              longitude: null
            }
          });
        } else {
          // If no separate profile document exists, use data from the user object
          setProfile({
            name: currentUser.profile?.name || currentUser.username || '',
            interests: currentUser.profile?.interests || [],
            profilePicture: currentUser.profile?.profilePicture || null,
            location: currentUser.profile?.location || {
              address: '',
              latitude: null,
              longitude: null
            }
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [currentUser]);

  const updateProfile = async (newProfile) => {
    if (!currentUser || !currentUser.username) return;

    try {
      const updatedProfile = { ...profile, ...newProfile };
      await setDoc(doc(db, 'profiles', currentUser.username), {
        ...updatedProfile,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
