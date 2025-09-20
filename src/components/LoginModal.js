import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './LoginModal.module.css';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const LoginModal = ({ onClose }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    setIsLoading(true);
    setError('');

    if (isRegistering) {
      if (!name.trim()) {
        setError('Name is required');
        setIsLoading(false);
        return;
      }

      try {
        // Check if user already exists
        const userDoc = await getDoc(doc(db, 'users', username));
        if (userDoc.exists()) {
          setError('Username already exists');
          setIsLoading(false);
          return;
        }

        // Create new user document
        await setDoc(doc(db, 'users', username), {
          username,
          password,
          name,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });

        // Create profile document
        await setDoc(doc(db, 'profiles', username), {
          name,
          interests: [],
          profilePicture: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Log in the new user
        const success = await login(username, password);
        if (success) {
          onClose();
        } else {
          setError('Error logging in after registration');
        }
      } catch (error) {
        setError('Error creating account. Please try again.');
        console.error('Registration error:', error);
      }
    } else {
      try {
        const success = await login(username, password);
        if (success) {
          // Update last login time
          await setDoc(doc(db, 'users', username), {
            lastLogin: new Date().toISOString()
          }, { merge: true });
          onClose();
        } else {
          setError('Invalid username or password');
        }
      } catch (error) {
        setError('Error logging in. Please try again.');
        console.error('Login error:', error);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>{isRegistering ? 'Create Account' : 'Login'}</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          {isRegistering && (
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          )}
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.buttons}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.button} ${styles.cancelButton}`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.loginButton}`}
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className={styles.switchButton}
          >
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
