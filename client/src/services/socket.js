import { io } from 'socket.io-client';

/**
 * Socket Service (Task 13.1)
 * Singleton service that manages the lifecycle of the Socket.io connection,
 * including authentication handshakes, reconnections, and event listeners.
 */
class SocketService {
  constructor() {
    this.socket = null;
  }

  /**
   * Connect to the Socket.io server with JWT authentication.
   * If a connection already exists, it is reused.
   */
  connect(token) {
    if (this.socket?.connected) return this.socket;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    // Initialize socket connection with token authentication
    this.socket = io(socketUrl, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    // Connection event listeners for developer debugging
    this.socket.on('connect', () => {
      console.log('Socket.io connected successfully. ID:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Socket.io disconnected:', reason);
    });

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
    if (!this.socket) return;
    this.socket.emit('join_conversation', { matchId });
  }

  /**
   * Emit 'send_message' to transmit real-time text message.
   */
  sendMessage(matchId, content) {
    if (!this.socket) return;
    this.socket.emit('send_message', { matchId, content });
  }

  /**
   * Registers a callback listener for incoming 'receive_message' events.
   */
  onMessageReceived(callback) {
    if (!this.socket) return;
    this.socket.on('receive_message', callback);
  }

  /**
   * Unregisters a callback listener for 'receive_message' events.
   */
  offMessageReceived(callback) {
    if (!this.socket) return;
    this.socket.off('receive_message', callback);
  }

  /**
   * Registers a callback listener for incoming mutual match notifications ('new_match').
   */
  onNewMatch(callback) {
    if (!this.socket) return;
    this.socket.on('new_match', callback);
  }

  /**
   * Unregisters a callback listener for 'new_match' events.
   */
  offNewMatch(callback) {
    if (!this.socket) return;
    this.socket.off('new_match', callback);
  }
}

// Export a singleton instance of the service
const socketService = new SocketService();
export default socketService;
