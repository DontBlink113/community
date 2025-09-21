import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import styles from './Chat.module.css';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

const Chat = ({ onBack }) => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { profile } = useProfile();
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat info
  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        if (chatDoc.exists()) {
          setChatInfo({ id: chatDoc.id, ...chatDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching chat info:', error);
      }
    };

    if (chatId) {
      fetchChatInfo();
    }
  }, [chatId]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!chatId) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort messages by creation date on the client side
      messagesData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setMessages(messagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage.trim(),
        senderId: currentUser.username,
        senderName: profile.name || 'Anonymous',
        chatId: chatId,
        createdAt: new Date().toISOString()
      });

      // Update chat's last activity
      await updateDoc(doc(db, 'chats', chatId), {
        lastActivity: new Date().toISOString()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onBack || (() => navigate(-1))}>
            ← Back
          </button>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack || (() => navigate(-1))}>
          ← Back
        </button>
        <div className={styles.chatTitle}>
          <h2>{chatInfo?.name || 'Group Chat'}</h2>
          <span className={styles.participantCount}>
            {chatInfo?.participants?.length || 0} participants
          </span>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.senderId === currentUser.username ? styles.ownMessage : styles.otherMessage
              }`}
            >
              <div className={styles.messageHeader}>
                <span className={styles.senderName}>{message.senderName}</span>
                <span className={styles.messageTime}>
                  {formatMessageTime(message.createdAt)}
                </span>
              </div>
              <div className={styles.messageText}>{message.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={styles.messageInput}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;