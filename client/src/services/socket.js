import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.messageCallbacks = [];
  }

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
        console.warn('Socket.io connection error:', error.message);
        // Do not call this.socket.disconnect() here, so auto-reconnect can work
      });

      this.socket.on('disconnect', (reason) => {
        console.warn('Socket.io disconnected:', reason);
      });
    } catch (_) {
      console.warn('WebSocket connection attempt failed.');
    }

    // Re-attach any registered callbacks to the new socket instance
    if (this.socket) {
      this.messageCallbacks.forEach((cb) => {
        this.socket.on('receive_message', cb);
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(matchId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_conversation', { matchId });
    }
  }

  sendMessage(matchId, content) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send_message', { matchId, content });
    }
  }

  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
    this.messageCallbacks.push(callback);
  }

  offMessageReceived(callback) {
    if (this.socket) {
      this.socket.off('receive_message', callback);
    }
    this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
  }

  onNewMatch(callback) {
    if (this.socket) {
      this.socket.on('new_match', callback);
    }
  }

  offNewMatch(callback) {
    if (this.socket) {
      this.socket.off('new_match', callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;
