import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import styles from './ProfilePage.module.css';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Navbar from './Navbar';
import Footer from './Footer';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { currentUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'profiles', currentUser.username));
        if (userDoc.exists()) {
          const data = userDoc.data();
          updateProfile({
            name: data.name || '',
            location: data.location || {
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
  }, [currentUser, updateProfile]);

  const handleSaveProfile = async () => {
    if (!profile || isSaving) return;
    
    setIsSaving(true);
    try {
      await setDoc(
        doc(db, 'profiles', currentUser.username),
        {
          name: profile.name,
          location: profile.location,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateProfile({
          ...profile,
          location: {
            ...profile.location,
            latitude,
            longitude,
            address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          }
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
        setIsGettingLocation(false);
      }
    );
  };

  const handleLocationInputChange = (field, value) => {
    updateProfile({
      ...profile,
      location: {
        ...profile.location,
        [field]: value
      }
    });
  };

  const handleClearLocation = () => {
    updateProfile({
      ...profile,
      location: {
        address: '',
        latitude: null,
        longitude: null
      }
    });
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Error during logout:', error);
        alert('Failed to log out. Please try again.');
      }
    }
  };

  if (!profile) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.profileSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {isEditing ? 'Edit Profile' : 'My Profile'}
              </h2>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.button} ${
                    isEditing ? styles.secondaryButton : styles.primaryButton
                  }`}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isSaving}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                {isEditing && (
                  <button
                    className={`${styles.button} ${styles.primaryButton}`}
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Name</label>
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={(e) =>
                      updateProfile({ ...profile, name: e.target.value })
                    }
                    className={styles.input}
                    placeholder="Enter your name"
                    disabled={isSaving}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Location</label>
                  <div className={styles.locationContainer}>
                    <input
                      type="text"
                      value={profile.location?.address || ''}
                      onChange={(e) => handleLocationInputChange('address', e.target.value)}
                      className={styles.input}
                      placeholder="Enter your address or use GPS"
                      disabled={isSaving}
                    />
                    <div className={styles.locationButtons}>
                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        className={styles.gpsButton}
                        disabled={isGettingLocation || isSaving}
                      >
                        {isGettingLocation ? 'Getting...' : '📍 Use GPS'}
                      </button>
                      {profile.location?.address && (
                        <button
                          type="button"
                          onClick={handleClearLocation}
                          className={styles.clearButton}
                          disabled={isSaving}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  {profile.location?.latitude && profile.location?.longitude && (
                    <div className={styles.locationPreview}>
                      📍 Coordinates: {profile.location.latitude.toFixed(6)}, {profile.location.longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.viewMode}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Name:</span>
                  <span className={styles.infoValue}>
                    {profile.name || 'Not set'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Location:</span>
                  <span className={styles.infoValue}>
                    {profile.location?.address || 'Not set'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.logoutContainer}>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
              disabled={isSaving}
            >
              Logout
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
