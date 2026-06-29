import { io } from 'socket.io-client';

/**
 * Socket Service (Task 13.1)
 * Singleton service that manages the lifecycle of the Socket.io connection,
 * including authentication handshakes, reconnections, and event listeners.
 * 
 * Includes an AUTOMATIC OFFLINE SOCKET SIMULATOR:
 * If the socket server is offline, it simulates messages roundtrips and auto-responds!
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.messageCallbacks = [];
  }

  /**
   * Connect to the Socket.io server with JWT authentication.
   */
  connect(token) {
    if (this.socket?.connected) return this.socket;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

    try {
      this.socket = io(socketUrl, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('Socket.io connected successfully. ID:', this.socket.id);
      });

      this.socket.on('connect_error', (error) => {
        console.warn('Socket.io connection error (Normal if backend offline):', error.message);
        // Force disconnect to prevent endless polling and red console spam when offline
        this.socket.disconnect();
      });

      this.socket.on('disconnect', (reason) => {
        console.warn('Socket.io disconnected:', reason);
      });
    } catch (_) {
      console.warn('WebSocket connection attempt failed. Using simulation.');
    }

    return this.socket;
  }

  /**
   * Disconnects the active socket connection and cleans up state.
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket.io connection explicitly disconnected');
    }
  }

  /**
   * Emit 'join_conversation' to register socket room subscription.
   */
  joinConversation(matchId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_conversation', { matchId });
      return;
    }
    console.log(`[Offline Simulation] Joined WebSocket room for match_${matchId}`);
  }

  /**
   * Emit 'send_message' to transmit real-time text message.
   * If socket is offline, it activates the simulator to auto-respond!
   */
  sendMessage(matchId, content) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send_message', { matchId, content });
      return;
    }

    console.warn('⚠️ Socket Server offline! Simulating WebSocket message delivery and auto-response.');

    // 1. Immediately echo the message back so it displays in the user's chat panel
    const sentMessage = {
      messageId: `simulated-msg-${Date.now()}`,
      matchId,
      senderId: 'mock-user-john',
      senderName: 'John Doe',
      content,
      timestamp: new Date().toISOString(),
      read: true
    };
    
    // Deliver to registered UI listeners
    this.messageCallbacks.forEach((callback) => callback(sentMessage));

    // 2. Simulate partner auto-response after 1.5 seconds
    setTimeout(() => {
      const partnerId = matchId.replace('mock-match-room-', '');
      const partnerName = partnerId.includes('jane') ? 'Jane Smith' : 'Alex Johnson';
      
      const responses = [
        `Awesome message! Let's schedule a call to discuss the code base.`,
        `That sounds great. What do you think about setting up Node.js with Express and MongoDB?`,
        `Love the energy! Let's arrange some code review sessions on GitHub.`,
        `Matching with other MERN developers is exactly what I needed!`
      ];
      
      const randomText = responses[Math.floor(Math.random() * responses.length)];

      const receivedMessage = {
        messageId: `simulated-msg-${Date.now() + 1}`,
        matchId,
        senderId: partnerId,
        senderName: partnerName,
        content: `[Demo Bot] ${randomText}`,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Deliver to registered UI listeners
      this.messageCallbacks.forEach((callback) => callback(receivedMessage));
    }, 1500);
  }

  /**
   * Registers a callback listener for incoming 'receive_message' events.
   */
  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
    // Track callback for offline mock routing
    this.messageCallbacks.push(callback);
  }

  /**
   * Unregisters a callback listener for 'receive_message' events.
   */
  offMessageReceived(callback) {
    if (this.socket) {
      this.socket.off('receive_message', callback);
    }
    this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
  }

  /**
   * Registers a callback listener for mutual match notifications.
   */
  onNewMatch(callback) {
    if (this.socket) {
      this.socket.on('new_match', callback);
    }
  }

  /**
   * Unregisters a callback listener for 'new_match' events.
   */
  offNewMatch(callback) {
    if (this.socket) {
      this.socket.off('new_match', callback);
    }
  }
}

// Export a singleton instance of the service
const socketService = new SocketService();
export default socketService;
