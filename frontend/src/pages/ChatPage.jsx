import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosConfig';
import { io } from 'socket.io-client';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const { matchId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [matchUser, setMatchUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize socket connection and fetch data
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Fetch match user details and messages
        const [messagesRes, userRes] = await Promise.all([
          axiosInstance.get(`/messages/${matchId}`),
          axiosInstance.get(`/users/${matchId}`)
        ]);

        setMessages(messagesRes.data);
        setMatchUser(userRes.data);

        // Connect to socket
        const token = localStorage.getItem('token');
        socketRef.current = io('http://localhost:8000', {
          auth: {
            token
          }
        });

        socketRef.current.on('connect', () => {
          socketRef.current.emit('joinChat', { matchId });
        });

        socketRef.current.on('newMessage', (message) => {
          setMessages(prev => [...prev, message]);
        });

        socketRef.current.on('error', (err) => {
          setError('Connection error');
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to load chat');
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [matchId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axiosInstance.post('/messages', {
        recipientId: matchId,
        content: newMessage
      });

      socketRef.current?.emit('sendMessage', {
        recipientId: matchId,
        content: newMessage
      });

      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="container mt-5"><p>Loading chat...</p></div>;
  }

  return (
    <div className="chat-container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <button
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={() => navigate('/matches')}
          >
            &larr; Back
          </button>
          <span className="navbar-brand">{matchUser?.name || 'Chat'}</span>
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
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${
                  msg.senderId === user._id ? 'sent' : 'received'
                }`}
              >
                <div className="message-bubble">
                  <p>{msg.content}</p>
                  <small className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString()}
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
            />
            <button className="btn btn-primary" type="submit">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
