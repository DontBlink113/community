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
    profilePicture: null
  });

  // Load profile from Firestore when user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        setProfile({ name: '', interests: [], profilePicture: null });
        return;
      }

      try {
        const profileDoc = await getDoc(doc(db, 'profiles', currentUser));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setProfile({
            name: data.name || '',
            interests: data.interests || [],
            profilePicture: data.profilePicture || null
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [currentUser]);

  const updateProfile = async (newProfile) => {
    if (!currentUser) return;

    try {
      const updatedProfile = { ...profile, ...newProfile };
      await setDoc(doc(db, 'profiles', currentUser), {
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
