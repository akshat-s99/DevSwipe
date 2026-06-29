const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema({
  swiperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  swipedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['like', 'pass'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

swipeSchema.index({ swiperId: 1, swipedId: 1 }, { unique: true });

module.exports = mongoose.model('Swipe', swipeSchema);
