const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  developer1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  developer2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

matchSchema.index({ developer1Id: 1, developer2Id: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
