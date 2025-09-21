import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QUOTES = [
  'Connect With People Near You',
  'Find Your Next Best Friend',
  'Discover Local Events & Activities',
  'Create a New Social Life'
];

const QUOTE_DURATION = 4000; // 4 seconds per quote

const AnimatedQuote = ({ quotes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      // Start fade out
      setFade(false);
      
      // After fade out, change quote and fade in
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        setFade(true);
      }, 800); // Half of the transition duration
      
    }, QUOTE_DURATION);
    
    return () => clearInterval(timer);
  }, [quotes.length]);

  const quoteStyles = {
    position: 'absolute',
    left: '15%',
    top: '50%',
    transform: `translateY(-50%) ${fade ? 'translateY(0)' : 'translateY(10px)'}`,
    fontSize: '3.25rem',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '800',
    color: 'white',
    lineHeight: '1.2',
    maxWidth: '500px',
    textAlign: 'center',
    margin: 0,
    padding: 0,
    textShadow: '0 2px 4px rgba(0,0,0,0.15)',
    letterSpacing: '-0.5px',
    willChange: 'opacity, transform',
    opacity: fade ? 1 : 0,
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
  };

  return (
    <h1 style={quoteStyles}>
      {quotes[currentIndex]}
    </h1>
  );
};

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
      background: 'linear-gradient(-45deg, hsl(178, 86%, 45%), hsl(300, 100%, 50%), hsl(178, 86%, 45%))',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 15s ease infinite',
    },
    '@keyframes gradientBG': {
      '0%': {
        backgroundPosition: '0% 50%',
      },
      '50%': {
        backgroundPosition: '100% 50%',
      },
      '100%': {
        backgroundPosition: '0% 50%',
      },
    },
    '@global': {
      '@keyframes gradientBG': {
        '0%': {
          backgroundPosition: '0% 50%',
        },
        '50%': {
          backgroundPosition: '100% 50%',
        },
        '100%': {
          backgroundPosition: '0% 50%',
        },
      },
    },
    leftPanel: {
      flex: 1,
      position: 'relative',
      height: 'calc(100vh - 60px)', // Subtract header height
      backgroundColor: 'transparent',
    },
    rightPanel: {
      position: 'absolute',
      top: '50%',
      right: '15%',
      transform: 'translateY(-50%)',
      width: '320px',
      backgroundColor: 'white',
      color: '#333',
      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
      zIndex: 1,
    },
    quote: {
      position: 'absolute',
      fontSize: '3.25rem',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '800',
      color: 'white',
      lineHeight: '1.2',
      maxWidth: '800px',
      textAlign: 'center',
      margin: '0 auto',
      padding: '0 2rem',
      textShadow: '0 2px 4px rgba(0,0,0,0.15)',
      letterSpacing: '-0.5px',
      willChange: 'opacity, transform',
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
      fontFamily: "'Poppins', sans-serif",
      padding: '0.75rem',
      borderRadius: '4px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '1rem',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'hsl(178, 60%, 45%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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

  // Add global styles for the animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
        <AnimatedQuote quotes={QUOTES} />
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
