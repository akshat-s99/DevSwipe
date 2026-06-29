const Match = require('../models/Match');
const Message = require('../models/Message');

const sendMessage = async (req, res) => {
  try {
    const { matchId, content } = req.body;
    const senderId = req.user.userId;

    if (!matchId || !content) {
      return res.status(400).json({ error: 'matchId and content are required' });
    }

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const isParticipant =
      String(match.developer1Id) === String(senderId) ||
      String(match.developer2Id) === String(senderId);

    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not part of this match' });
    }

    const receiverId =
      String(match.developer1Id) === String(senderId) ? match.developer2Id : match.developer1Id;

    const message = await Message.create({
      matchId,
      senderId,
      receiverId,
      content,
    });

    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const currentUserId = req.user.userId;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const isParticipant =
      String(match.developer1Id) === String(currentUserId) ||
      String(match.developer2Id) === String(currentUserId);

    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not part of this match' });
    }

    const messages = await Message.find({ matchId }).sort({ createdAt: 1, timestamp: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
