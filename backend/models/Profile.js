const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    default: '',
  },
  githubUrl: {
    type: String,
    default: '',
  },
  techStack: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('Profile', profileSchema);
