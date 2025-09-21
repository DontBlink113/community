import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const styles = {
    navbar: {
      backgroundColor: 'hsl(210, 20%, 98%)', /* Lightest grey from our palette */
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%'
    },
    container: {
      maxWidth: '100%',
      margin: '0 auto',
      padding: '0 1.5in', /* 1.5 inches of padding on both sides */
      height: '60px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box'
    },
    leftSection: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '1.5rem',
      flex: 1,
      paddingBottom: '0.25rem' /* Add small padding to align with text baseline */
    },
    rightSection: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      flex: 1,
      paddingBottom: '0.25rem' /* Match left section padding */
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 700,
      background: 'linear-gradient(90deg, hsl(178, 86%, 45%) 0%, hsl(300, 100%, 50%) 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textFillColor: 'transparent',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundSize: '200% 100%',
      padding: '0 2px',
      backgroundPosition: '0% 0%'
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 900,
      background: 'linear-gradient(90deg, hsl(178, 86%, 45%) 0%, hsl(300, 100%, 50%) 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textFillColor: 'transparent',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      backgroundSize: '200% 100%',
      display: 'inline-block',
      padding: '0 2px',
      cursor: 'pointer',
      backgroundPosition: '0% 0%'
    },
    navButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'hsl(220, 8%, 45%)', /* Medium grey for text */
      fontSize: '1rem',
      fontWeight: 500,
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    navButtonHover: {
      backgroundColor: 'hsl(178, 60%, 55%)',
      transform: 'translateY(-2px)',
      color: 'white'
    },
    navButtonActive: {
      transform: 'translateY(0)'
    }
  };

  return (
    <nav>
      <div style={styles.navbar}>
        <div style={styles.container}>
          <div style={styles.leftSection}>
            <div 
              style={styles.logo} 
              onClick={() => navigate('/home')}
              onMouseEnter={(e) => {
                e.target.style.backgroundPosition = '100% 0%';
                e.target.style.backgroundSize = '200% 100%';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundPosition = '0% 0%';
                e.target.style.backgroundSize = '200% 100%';
              }}
            >
              Community
            </div>
            <button 
              style={styles.navButton}
              onMouseEnter={(e) => {
                e.target.style.color = 'hsl(178, 60%, 55%)';
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'hsl(220, 8%, 45%)';
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'none';
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(1px)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'none';
              }}
              onClick={() => navigate('/my-events')}
            >
              My Events
            </button>
          </div>
          <div style={styles.rightSection}>
            <button 
              style={styles.navButton}
              onMouseEnter={(e) => {
                e.target.style.color = 'hsl(178, 60%, 55%)';
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'hsl(220, 8%, 45%)';
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'none';
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(1px)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'none';
              }}
              onClick={() => navigate('/profile')}
            >
              My Profile
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
