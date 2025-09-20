import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import styles from './ProfilePage.module.css';

const ProfilePage = ({ onBack }) => {
  const { profile, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [tempImage, setTempImage] = useState(null);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        updateProfile({ profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      updateProfile({
        interests: [...profile.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    updateProfile({
      interests: profile.interests.filter(i => i !== interest)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would typically save this to a backend
    console.log('Profile saved:', profile);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      updateProfile(editedProfile);
    } else {
      // Start editing - initialize editedProfile with current profile
      setEditedProfile({ ...profile });
    }
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
        {isEditing ? 'Save Changes' : 'Edit Profile'}
      </button>
      {isEditing ? (
        <form onSubmit={handleSubmit} className={styles.form}>
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

        <button type="submit" className={styles.saveButton}>
          Save Profile
        </button>
      </form>
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
