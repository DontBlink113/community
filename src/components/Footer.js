import React from 'react';
import styles from './HomePage.module.css';

const Footer = () => {
  const handleClick = (section, item) => {
    console.log(`Clicked ${item} in ${section}`);
    // In a real app, you would handle navigation or other actions here
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h4>About Us</h4>
          <ul>
            {['Our Story', 'Team', 'Careers', 'Press'].map((item) => (
              <li key={item}>
                <button 
                  className={styles.footerButton} 
                  onClick={() => handleClick('About Us', item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h4>Help Center</h4>
          <ul>
            {['FAQs', 'Contact Us', 'Safety Tips', 'Support'].map((item) => (
              <li key={item}>
                <button 
                  className={styles.footerButton}
                  onClick={() => handleClick('Help Center', item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h4>Community</h4>
          <ul>
            {['Events', 'Blog', 'Guidelines', 'Feedback'].map((item) => (
              <li key={item}>
                <button 
                  className={styles.footerButton}
                  onClick={() => handleClick('Community', item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h4>Legal</h4>
          <ul>
            {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'GDPR'].map((item) => (
              <li key={item}>
                <button 
                  className={styles.footerButton}
                  onClick={() => handleClick('Legal', item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} ConnectHub. All rights reserved.</p>
        <div className={styles.socialLinks}>
          {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((platform) => {
            const icons = {
              'Facebook': '📘',
              'Twitter': '🐦',
              'Instagram': '📸',
              'LinkedIn': '💼'
            };
            return (
              <button
                key={platform}
                className={styles.socialButton}
                onClick={() => console.log(`Navigate to ${platform}`)}
                aria-label={platform}
              >
                <span aria-hidden="true">{icons[platform]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
