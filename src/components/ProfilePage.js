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

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'profiles', currentUser));
        if (userDoc.exists()) {
          const data = userDoc.data();
          updateProfile({
            name: data.name || ''
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
        doc(db, 'profiles', currentUser),
        { 
          name: profile.name,
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
              </div>
            ) : (
              <div className={styles.viewMode}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Name:</span>
                  <span className={styles.infoValue}>
                    {profile.name || 'Not set'}
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
