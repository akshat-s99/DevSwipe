const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
