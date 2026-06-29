const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const User = require('../models/User');
const Profile = require('../models/Profile');

const getNextProfile = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } });
    const existingSwipes = await Swipe.find({ swiperId: req.user.userId }).select('swipedId');

    const swipedIds = new Set(existingSwipes.map((swipe) => String(swipe.swipedId)));
    const nextUser = users.find((user) => !swipedIds.has(String(user._id)));

    if (!nextUser) {
      return res.status(404).json({ message: 'No more profiles available' });
    }

    const nextProfile = await Profile.findOne({ userId: nextUser._id }).populate('userId', 'name');

    if (!nextProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json(nextProfile);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

const recordSwipe = async (req, res) => {
  try {
    const { swipedId, action } = req.body;

    if (!swipedId || !action) {
      return res.status(400).json({ error: 'swipedId and action are required' });
    }

    if (!['like', 'pass'].includes(action)) {
      return res.status(400).json({ error: 'Action must be like or pass' });
    }

    if (String(swipedId) === String(req.user.userId)) {
      return res.status(400).json({ error: 'You cannot swipe on yourself' });
    }

    const existingSwipe = await Swipe.findOne({
      swiperId: req.user.userId,
      swipedId,
    });

    if (existingSwipe) {
      return res.status(200).json({ message: 'Swipe already recorded' });
    }

    const swipe = await Swipe.create({
      swiperId: req.user.userId,
      swipedId,
      action,
    });

    let match = null;

    if (action === 'like') {
      const reciprocalLike = await Swipe.findOne({
        swiperId: swipedId,
        swipedId: req.user.userId,
        action: 'like',
      });

      if (reciprocalLike) {
        const [developer1Id, developer2Id] = [String(req.user.userId), String(swipedId)].sort();

        match = await Match.findOneAndUpdate(
          { developer1Id, developer2Id },
          { developer1Id, developer2Id },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      }
    }

    return res.status(201).json({
      swipe,
      match,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getNextProfile,
  recordSwipe,
};
