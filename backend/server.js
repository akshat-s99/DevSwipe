const express = require('express');
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

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
