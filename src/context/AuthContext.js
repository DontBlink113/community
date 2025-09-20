import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      verifyAndLoadUser(storedUser);
    }
  }, []);

  const verifyAndLoadUser = async (username) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', username));
      if (userDoc.exists()) {
        setCurrentUser(username);
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('currentUser');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      localStorage.removeItem('currentUser');
    }
  };

  const login = async (username, password) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', username));
      if (userDoc.exists() && userDoc.data().password === password) {
        setIsLoggedIn(true);
        setCurrentUser(username);
        localStorage.setItem('currentUser', username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
