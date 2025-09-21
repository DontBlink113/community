import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const styles = {
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      zIndex: 1000,
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: 'white',
      textDecoration: 'none',
      cursor: 'pointer',
      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
    },
    headerButtons: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    container: {
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(90deg, var(--teal-200) 0%, var(--teal-300) 100%)',
    },
    leftPanel: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: '30%',
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      padding: '2rem',
    },
    rightPanel: {
      position: 'absolute',
      top: '50%',
      right: '15%',
      transform: 'translateY(-50%)',
      width: '320px',
      backgroundColor: 'white',
      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
      borderRadius: '12px',
    },
    quote: {
      fontSize: '3.25rem',
      fontWeight: '800',
      color: 'white', // Changed to white for better contrast
      lineHeight: '1.2',
      maxWidth: '600px',
      padding: '0 100px 0 50px',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    loginButton: {
      backgroundColor: 'white',
      color: 'hsl(178, 60%, 55%)',
      padding: '0.5rem 1.5rem',
      borderRadius: '4px',
      fontSize: '0.9rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      },
    },
    signupButton: {
      backgroundColor: 'transparent',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      fontSize: '0.9rem',
      fontWeight: '500',
      border: '1px solid white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
    panelLoginButton: {
      backgroundColor: 'hsl(178, 60%, 55%)',
      color: 'white',
      padding: '0.75rem',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      marginBottom: '1rem',
      '&:hover': {
        backgroundColor: 'hsl(180, 100%, 25%)',
      },
    },
    panelSignupButton: {
      backgroundColor: 'transparent',
      color: 'hsl(178, 60%, 55%)',
      padding: '0.5rem',
      borderRadius: '4px',
      fontSize: '0.9rem',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      transition: 'color 0.2s ease',
      '&:hover': {
        color: 'hsl(180, 100%, 25%)',
        textDecoration: 'underline',
      },
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          Community
        </div>
        <div style={styles.headerButtons}>
          <button 
            style={styles.signupButton}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
          <button 
            style={styles.loginButton}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </header>
      <div style={styles.leftPanel}>
        <h1 style={styles.quote}>Connect With Friends Near You</h1>
      </div>
      <div style={styles.rightPanel}>
        <button 
          style={styles.panelLoginButton}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button 
          style={styles.panelSignupButton}
          onClick={() => navigate('/signup')}
        >
          Create an account
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
