import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/home');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    loginContainer: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--login-bg)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    },
    // Title button styles
    titleButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'none',
      border: 'none',
      color: 'var(--primary-color, #0d6efd)',
      fontSize: '1.25rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      padding: '0.5rem',
      transition: 'opacity 0.2s',
      zIndex: 100,
      ':hover': {
        opacity: 0.8,
      },
    },
    titleButtonHover: {
      backgroundColor: 'rgba(13, 110, 253, 0.1)',
    },
    loginCard: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: 'var(--login-card-bg)',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '2.5rem',
      textAlign: 'center',
    },
    logo: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      fontSize: '1.8rem',
      lineHeight: '1.2',
      fontWeight: '700',
      background: 'linear-gradient(90deg, hsl(178, 86%, 45%) 0%, hsl(300, 100%, 50%) 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textFillColor: 'transparent',
      textDecoration: 'none',
      cursor: 'pointer',
      margin: 0,
      padding: '0.25rem 0',
      border: 'none',
      zIndex: 10,
      display: 'inline-block',
      height: 'auto',
    },
    title: {
      color: 'var(--login-text)',
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
    },
    inputGroup: {
      marginBottom: '1.25rem',
      textAlign: 'left',
    },
    label: {
      display: 'block',
      color: 'var(--login-text)', 
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '0.375rem',
      border: '1px solid var(--login-input-border)',
      backgroundColor: 'var(--login-input-bg)',
      color: 'var(--login-text)',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
    },
    inputFocus: {
      outline: 'none',
      borderColor: 'var(--login-input-focus)',
      boxShadow: '0 0 0 3px rgba(13, 148, 136, 0.1)',
    },
    button: {
      width: '100%',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      backgroundColor: 'var(--login-button-bg)',
      color: 'var(--login-button-text)',
      fontWeight: '600',
      fontSize: '1rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '0.5rem',
    },
    buttonHover: {
      backgroundColor: 'var(--login-button-hover)',
      transform: 'translateY(-1px)',
    },
    buttonDisabled: {
      opacity: '0.7',
      cursor: 'not-allowed',
    },
    footer: {
      marginTop: '1.5rem',
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
    },
    link: {
      color: 'var(--login-link)',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.2s ease',
    },
    linkHover: {
      color: 'var(--login-link-hover)',
    },
    error: {
      backgroundColor: 'var(--login-error-bg)',
      color: 'var(--login-error-text)',
      borderLeft: '4px solid var(--login-error-border)',
      padding: '0.75rem 1rem',
      borderRadius: '0 0.25rem 0.25rem 0',
      marginBottom: '1.25rem',
      textAlign: 'left',
      fontSize: '0.875rem',
    },
  };

  return (
    <div style={styles.loginContainer}>
      <button 
        onClick={() => navigate(currentUser ? '/home' : '/')}
        style={styles.logo}
      >
        Community
      </button>
      <div style={styles.loginCard}>
        <h1 style={styles.title}>Welcome Back</h1>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              onFocus={(e) => e.target.style = { ...styles.input, ...styles.inputFocus }}
              onBlur={(e) => e.target.style = styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              onFocus={(e) => e.target.style = { ...styles.input, ...styles.inputFocus }}
              onBlur={(e) => e.target.style = styles.input}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
            onMouseOver={(e) => !isLoading && Object.assign(e.currentTarget.style, styles.buttonHover)}
            onMouseOut={(e) => !isLoading && Object.assign(e.currentTarget.style, styles.button)}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={styles.footer}>
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            style={styles.link}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.linkHover)}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.link)}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
