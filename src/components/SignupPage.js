import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    setIsLoading(true);
    
    try {
      const result = await signup(username, password, ''); // Empty string for email as it's no longer collected
      if (result.success) {
        navigate('/profile');
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    signupContainer: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--login-bg, #f8f9fa)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      marginTop: '60px',
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
    signupCard: {
      width: '100%',
      maxWidth: '400px',
      backgroundColor: 'var(--login-card-bg, #ffffff)',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '2.5rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'var(--text-primary, #1a202c)',
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: '1.25rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'var(--text-secondary, #4a5568)',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #e2e8f0',
      fontSize: '1rem',
      color: 'var(--text-primary, #1a202c)',
      backgroundColor: 'var(--input-bg, #ffffff)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    inputFocus: {
      borderColor: '#4299e1',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.5)',
      outline: 'none',
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      backgroundColor: 'var(--primary, #4299e1)',
      color: 'white',
      fontSize: '1rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    buttonHover: {
      backgroundColor: 'var(--primary-dark, #3182ce)',
    },
    buttonDisabled: {
      opacity: '0.7',
      cursor: 'not-allowed',
    },
    footer: {
      marginTop: '1.5rem',
      textAlign: 'center',
      fontSize: '0.875rem',
      color: 'var(--text-secondary, #4a5568)',
    },
    link: {
      color: 'var(--primary, #4299e1)',
      textDecoration: 'none',
      fontWeight: '600',
    },
    linkHover: {
      textDecoration: 'underline',
    },
    error: {
      color: '#e53e3e',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.signupContainer}>
      <button 
        onClick={() => navigate(currentUser ? '/home' : '/')}
        style={styles.titleButton}
      >
        Community
      </button>
      <div style={styles.signupCard}>
        <h1 style={styles.title}>Create Account</h1>
        
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
              minLength="6"
              style={styles.input}
              onFocus={(e) => e.target.style = { ...styles.input, ...styles.inputFocus }}
              onBlur={(e) => e.target.style = styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          
          <div style={styles.footer}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={styles.link}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.linkHover)}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.link)}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
  );
};

export default SignupPage;
