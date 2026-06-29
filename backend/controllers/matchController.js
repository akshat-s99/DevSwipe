const Match = require('../models/Match');
const Profile = require('../models/Profile');

const getMatches = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);

    const matches = await Match.find({
      $or: [{ developer1Id: currentUserId }, { developer2Id: currentUserId }],
    });

    const otherUserIds = matches.map((match) =>
      String(match.developer1Id) === currentUserId ? match.developer2Id : match.developer1Id
    );

    const profiles = await Profile.find({ userId: { $in: otherUserIds } }).populate('userId', 'name');

    const profileByUserId = new Map(
      profiles.map((profile) => [String(profile.userId._id), profile])
    );

    const response = matches.map((match) => {
      const otherUserId =
        String(match.developer1Id) === currentUserId ? String(match.developer2Id) : String(match.developer1Id);
      const profile = profileByUserId.get(otherUserId);

      return {
        matchId: match._id,
        createdAt: match.createdAt,
        user: profile
          ? {
              id: profile.userId._id,
              name: profile.userId.name,
              bio: profile.bio,
              githubUrl: profile.githubUrl,
              techStack: profile.techStack,
            }
          : null,
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMatches,
};
