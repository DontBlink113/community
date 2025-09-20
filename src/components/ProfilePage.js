import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import styles from './ProfilePage.module.css';
import { db, storage } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const ProfilePage = ({ onBack }) => {
  const { profile, updateProfile } = useProfile();
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [tempImage, setTempImage] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setTempImage(URL.createObjectURL(file));

        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            // Upload to Firebase Storage with unique filename
            const fileName = `${Date.now()}-${file.name}`;
            const imageRef = ref(storage, `profilePictures/${currentUser}/${fileName}`);
            await uploadString(imageRef, reader.result, 'data_url');
            const downloadUrl = await getDownloadURL(imageRef);
            
            // Update Firestore and local state
            const userDocRef = doc(db, 'profiles', currentUser);
            await setDoc(userDocRef, {
              ...profile,
              profilePicture: downloadUrl,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            
            updateProfile({ profilePicture: downloadUrl });
          } catch (error) {
            console.error('Error saving image:', error);
            alert('Failed to upload image. Please try again.');
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error handling image:', error);
        alert('Failed to process image. Please try again.');
      }
    }
  };

  const handleAddInterest = async (e) => {
    e.preventDefault();
    const trimmedInterest = newInterest.trim();
    if (trimmedInterest && !profile.interests.includes(trimmedInterest)) {
      const updatedInterests = [...profile.interests, trimmedInterest];
      try {
        const userDocRef = doc(db, 'profiles', currentUser);
        await setDoc(userDocRef, {
          interests: updatedInterests,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        updateProfile({
          interests: updatedInterests
        });
        setNewInterest('');
      } catch (error) {
        console.error('Error saving interest:', error);
        alert('Failed to add interest. Please try again.');
      }
    }
  };

  const handleRemoveInterest = async (interest) => {
    try {
      const updatedInterests = profile.interests.filter(i => i !== interest);
      const userDocRef = doc(db, 'profiles', currentUser);
      await setDoc(userDocRef, {
        interests: updatedInterests,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      updateProfile({
        interests: updatedInterests
      });
    } catch (error) {
      console.error('Error removing interest:', error);
      alert('Failed to remove interest. Please try again.');
    }
  };


  // Load profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      
      try {
        const userDocRef = doc(db, 'profiles', currentUser);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          updateProfile({
            name: data.name,
            interests: data.interests || [],
            profilePicture: data.profilePicture
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [currentUser, updateProfile]);
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={onBack}
      >
        Back to Home
      </button>
      <h1 className={styles.title}>{isEditing ? 'Edit Profile' : 'Profile'}</h1>
      <button
        className={styles.editButton}
        onClick={handleEditToggle}
      >
{isEditing ? 'Stop Editing' : 'Edit Profile'}
      </button>
      {isEditing ? (
        <div className={styles.form}>
        <div className={styles.imageUpload}>
          <img
            src={tempImage || profile.profilePicture || '/default-avatar.png'}
            alt="Profile"
            className={styles.profileImage}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            id="imageUpload"
            hidden
          />
          <label htmlFor="imageUpload" className={styles.uploadButton}>
            Upload Profile Picture
          </label>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            className={styles.input}
            placeholder="Enter your name"
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Interests</label>
          <div className={styles.interests}>
            {profile.interests.map((interest) => (
              <div key={interest} className={styles.interest}>
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className={styles.removeInterest}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className={styles.input}
              placeholder="Add an interest"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className={styles.uploadButton}
            >
              Add
            </button>
          </div>
        </div>

        </div>
      ) : (
        <div className={styles.viewMode}>
          <div className={styles.imageUpload}>
            <img
              src={profile.profilePicture || '/default-avatar.png'}
              alt="Profile"
              className={styles.profileImage}
            />
          </div>
          
          <div className={styles.viewField}>
            <span className={styles.viewLabel}>Name</span>
            <span className={styles.viewValue}>{profile.name || 'Not set'}</span>
          </div>

          <div className={styles.viewField}>
            <span className={styles.viewLabel}>Interests</span>
            <div className={styles.viewInterests}>
              {profile.interests.length > 0 ? (
                profile.interests.map((interest) => (
                  <div key={interest} className={styles.viewInterest}>
                    {interest}
                  </div>
                ))
              ) : (
                <span className={styles.viewValue}>No interests added</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
