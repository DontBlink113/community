import React, { useState } from 'react';
import styles from './HomePage.module.css';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import LoginModal from './LoginModal';

const HomePage = ({ onNavigateToProfile, onNavigateToEvent, onNavigateToMyEvents }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const { profile } = useProfile();


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span 
            className={styles.appTitle}
            onClick={() => window.location.reload()}
          >
            Community
          </span>
        </div>
        <div className={styles.headerButtons}>
          {isLoggedIn ? (
            <>
              <button
                className={`${styles.button} ${styles.myEventsButton}`}
                onClick={onNavigateToMyEvents}
              >
                My Events
              </button>
              <button
                className={`${styles.button} ${styles.profileButton}`}
                onClick={onNavigateToProfile}
              >
                View Profile
              </button>
              <button
                className={`${styles.button} ${styles.loginButton}`}
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className={`${styles.button} ${styles.loginButton}`}
              onClick={() => setShowLoginModal(true)}
            >
              Login
            </button>
          )}
        </div>
      </header>
      {isLoggedIn && (
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeMessage}>
            Welcome, {profile.name || 'User'}
          </div>
        </div>
      )}
      <div className={styles.createEventContainer}>
        <button
          className={`${styles.button} ${styles.createEventButton}`}
          onClick={onNavigateToEvent}
        >
          Create Event
        </button>
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export default HomePage;
