import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import socketService from '../services/socket';

/**
 * Chat Page Component (Tasks 13.3 & 13.5)
 * Handles individual real-time conversation views between developers.
 * Subscribes to Socket.io events, lists chronological message history, and auto-scrolls to bottom.
 */
const Chat = () => {
  const { matchId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 1. Message and conversation states
  const [messages, setMessages] = useState([]);
  const [partnerName, setPartnerName] = useState('Developer Partner');
  const [messageInput, setMessageInput] = useState('');
  
  // 2. Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Reference node to enable auto-scrolling to the bottom of the container
  const messagesEndRef = useRef(null);

  /**
   * Helper function to scroll the message log container to the latest message.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Fetches the message history for this match from the database.
   */
  const fetchMessageHistory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`/messages/${matchId}`);
      // The API contract returns: { matchId, messages: [ { messageId, senderId, senderName, content, timestamp } ] }
      setMessages(response.data.messages || []);
      
      // Attempt to load the matched developer's name from matches dashboard API
      // so we can display their name in the chat header instead of a generic text
      const matchesResponse = await api.get('/matches');
      const currentMatch = matchesResponse.data.matches?.find(m => m.matchId === matchId);
      if (currentMatch) {
        setPartnerName(currentMatch.matchedUser.name);
      }
    } catch (err) {
      console.error('Error fetching message history:', err);
      setError(err.response?.data?.error || 'Failed to load chat history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Initial Load: Fetch messages and connect to WebSocket room
  useEffect(() => {
    if (user && matchId) {
      fetchMessageHistory();

      // Emit socket event to join the room room matching the conversation matchId
      socketService.joinConversation(matchId);
    }
  }, [user, matchId]);

  // 2. Setup Socket.io receive_message event listener
  useEffect(() => {
    if (user && matchId) {
      const handleNewIncomingMessage = (newMessage) => {
        // Double check that the incoming message belongs to this conversation
        if (newMessage.matchId === matchId) {
          setMessages((prev) => [...prev, newMessage]);
        }
      };

      // Register the event listener on the singleton socket client
      socketService.onMessageReceived(handleNewIncomingMessage);

      // Remove the event listener when conversation changes or unmounts
      return () => {
        socketService.offMessageReceived(handleNewIncomingMessage);
      };
    }
  }, [user, matchId]);

  // 3. Scroll to the bottom whenever a new message gets added to array state
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handles transmitting a message on click / Enter keypress.
   */
  const handleSendMessage = (e) => {
    e.preventDefault();
    const content = messageInput.trim();

    if (!content) return;

    // Emit the message over WebSocket
    socketService.sendMessage(matchId, content);
    
    // Clear input field
    setMessageInput('');
  };

  /**
   * Formats ISO timestamp string to friendly hours and minutes format.
   */
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return '';
    }
  };

  // Redirect to login if user session check fails
  if (!authLoading && !user) {
    navigate('/login');
    return null;
  }

  // Loading spinner during initial checks
  if (authLoading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 py-2">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8 col-xl-7">
          
          {/* Chat Panel Box */}
          <div className="glass-panel d-flex flex-column overflow-hidden border-secondary" style={{ borderRadius: '24px', height: '70vh' }}>
            
            {/* Chat Header */}
            <div className="p-4 bg-dark bg-opacity-25 border-bottom border-secondary d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <Link to="/matches" className="btn btn-outline-secondary me-3 px-2 py-1 btn-sm text-white" style={{ border: '1px solid var(--surface-border)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                  </svg>
                </Link>
                <div className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3 shadow" 
                  style={{
                    width: '45px',
                    height: '45px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                    fontSize: '1.15rem'
                  }}>
                  {partnerName ? partnerName.charAt(0).toUpperCase() : 'D'}
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-white">{partnerName}</h5>
                  <span className="small text-muted d-flex align-items-center">
                    <span className="bg-success rounded-circle me-1" style={{ width: '8px', height: '8px', display: 'inline-block' }}></span>
                    connected
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Messages Logs Container */}
            <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3 bg-dark bg-opacity-10" style={{ overflowY: 'auto' }}>
              {isLoading ? (
                /* Fetching loading spinner */
                <div className="text-center my-auto">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading history...</span>
                  </div>
                  <p className="text-secondary small mt-2">Pulling repository conversations...</p>
                </div>
              ) : error ? (
                /* Connection/Fetch error boundary */
                <div className="text-center my-auto p-3">
                  <span className="text-danger small fw-semibold d-block mb-3">{error}</span>
                  <button className="btn btn-outline-secondary btn-sm text-white" onClick={fetchMessageHistory} style={{ border: '1px solid var(--surface-border)' }}>
                    Reload History
                  </button>
                </div>
              ) : messages.length === 0 ? (
                /* Empty logs banner */
                <div className="text-center my-auto p-5 text-muted small">
                  No messages yet. Send a friendly "Hello World" to open negotiations!
                </div>
              ) : (
                /* List of bubble elements */
                messages.map((msg, index) => {
                  // Determine if the message was sent by the current authenticated user
                  // Handles cases where msg.senderId matches user.id or user.userId
                  const isOwnMessage = msg.senderId === user.id || msg.senderId === user.userId;

                  return (
                    <div
                      key={msg.messageId || index}
                      className={`d-flex flex-column ${isOwnMessage ? 'align-items-end' : 'align-items-start'}`}
                    >
                      {/* Message Bubble */}
                      <div
                        className={`p-3 max-width-chat-bubble rounded-3 text-white ${
                          isOwnMessage
                            ? 'bg-primary bg-gradient rounded-bottom-end-0'
                            : 'bg-dark bg-opacity-75 border border-secondary rounded-bottom-start-0'
                        }`}
                        style={{
                          maxWidth: '75%',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        <span className="d-block leading-relaxed" style={{ fontSize: '0.975rem', wordBreak: 'break-word' }}>
                          {msg.content}
                        </span>
                      </div>
                      
                      {/* Timestamp underneath bubble */}
                      <span className="text-muted small mt-1 px-1" style={{ fontSize: '0.72rem' }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  );
                })
              )}
              {/* Scrolling reference element */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Send Message Form panel */}
            <form onSubmit={handleSendMessage} className="p-3 border-top border-secondary bg-dark bg-opacity-20 d-flex gap-2">
              <input
                type="text"
                className="form-control bg-dark border-secondary text-white py-3 px-4 rounded-3"
                placeholder="Type your message here..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="btn btn-primary-gradient px-4 rounded-3 d-flex align-items-center justify-content-center"
                disabled={isLoading || !messageInput.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
                  <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>
                </svg>
              </button>
            </form>

          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Chat;
