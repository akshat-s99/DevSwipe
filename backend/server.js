const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const swipeRoutes = require('./routes/swipe');
const matchRoutes = require('./routes/match');
const messageRoutes = require('./routes/message');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Pass io to routes if needed, or set on app
app.set('io', io);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/swipe', authMiddleware, swipeRoutes);
app.use('/api/matches', authMiddleware, matchRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);



mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log('MongoDB Connected');
	})
	.catch((error) => {
		console.error('MongoDB connection error:', error);
	});

// Setup Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected via Socket.io:', socket.id);

  socket.on('join_conversation', ({ matchId }) => {
    socket.join(`match_${matchId}`);
    console.log(`Socket ${socket.id} joined room match_${matchId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
