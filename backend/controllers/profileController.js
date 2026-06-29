const Profile = require('../models/Profile');

const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.userId }).populate('userId', 'name');

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { bio, githubUrl, techStack } = req.body;

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      { bio, githubUrl, techStack },
      { new: true }
    ).populate('userId', 'name');

    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json(updatedProfile);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
