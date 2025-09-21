import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingNavbar = () => {
  const navigate = useNavigate();

  const styles = {
    navbar: {
      backgroundColor: 'transparent',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      width: '100%'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      height: '60px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: 'white',
      textDecoration: 'none',
      cursor: 'pointer',
      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
    },
    loginButton: {
      backgroundColor: 'white',
      border: 'none',
      color: 'var(--teal-500)',
      fontSize: '1rem',
      fontWeight: 600,
      padding: '0.5rem 1.5rem',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          Community
        </div>
        <button 
          style={styles.loginButton}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    </nav>
  );
};

export default LandingNavbar;
