import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for stored auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        await verifyAndLoadUser(storedUser);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const verifyAndLoadUser = async (username) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', username));
      if (userDoc.exists()) {
        setCurrentUser(userDoc.data());
        setIsLoggedIn(true);
        return true;
      } else {
        localStorage.removeItem('currentUser');
        return false;
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      localStorage.removeItem('currentUser');
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', username));
      if (userDoc.exists() && userDoc.data().password === password) {
        const userData = userDoc.data();
        setCurrentUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('currentUser', username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (username, password, email) => {
    try {
      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', username));
      if (userDoc.exists()) {
        throw new Error('Username already exists');
      }

      // Create new user document
      const userData = {
        username,
        email,
        password, // Note: In a production app, you should hash the password before storing
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add default profile data
        profile: {
          name: username,
          interests: [],
          profilePicture: ''
        }
      };

      await setDoc(doc(db, 'users', username), userData);
      
      // Log the user in after successful signup
      setCurrentUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', username);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create account. Please try again.' 
      };
    }
  };

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
  }, [navigate]);

  // Only render children when auth state is determined
  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      currentUser, 
      login, 
      logout,
      signup,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
