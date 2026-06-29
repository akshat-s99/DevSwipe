import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosConfig';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const { matchId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messageRefreshInterval = useRef(null);

  // Fetch messages periodically (polling)
  const fetchMessages = async () => {
    try {
      console.log('[ChatPage] Fetching messages for match:', matchId);
      const response = await axiosInstance.get(`/messages/${matchId}`);
      console.log('[ChatPage] Messages loaded:', response.data);
      setMessages(response.data || []);
      setError('');
    } catch (err) {
      console.error('[ChatPage] Error fetching messages:', err);
      if (err.response?.status === 404) {
        setError('Match not found');
      } else {
        setError('Failed to load messages');
      }
    }
  };

  // Initialize chat and fetch messages
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        await fetchMessages();
        setLoading(false);

        // Poll for new messages every 2 seconds
        messageRefreshInterval.current = setInterval(fetchMessages, 2000);
      } catch (err) {
        console.error('[ChatPage] Error initializing chat:', err);
        setError('Failed to load chat');
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (messageRefreshInterval.current) {
        clearInterval(messageRefreshInterval.current);
      }
    };
  }, [matchId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      console.log('[ChatPage] Sending message:', newMessage);
      
      const response = await axiosInstance.post('/messages', {
        matchId: matchId,
        content: newMessage
      });

      console.log('[ChatPage] Message sent:', response.data);
      setNewMessage('');
      
      // Fetch updated messages immediately after sending
      await fetchMessages();
    } catch (err) {
      console.error('[ChatPage] Error sending message:', err);
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="chat-container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <span className="navbar-brand">Loading chat...</span>
          </div>
        </nav>
        <div className="chat-content">
          <div className="text-center mt-5">
            <p>Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        return decoded.userId || decoded.id;
      }
    } catch (err) {
      console.error('[ChatPage] Error decoding token:', err);
    }
    return user?.id;
  };

  const currentUserId = getUserIdFromToken();

  return (
    <div className="chat-container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <button
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={() => navigate('/matches')}
          >
            {'←'} Back
          </button>
          <span className="navbar-brand">Chat - {matchId}</span>
          <div className="navbar-nav ms-auto">
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="chat-content">
        <div className="messages-container">
          {error && <div className="alert alert-danger">{error}</div>}

          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Say hi!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id || msg.timestamp}
                className={`message ${
                  msg.senderId === currentUserId ? 'sent' : 'received'
                }`}
              >
                <div className="message-bubble">
                  <p>{msg.content}</p>
                  <small className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </small>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-input-form">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
            <button 
              className="btn btn-primary" 
              type="submit"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
