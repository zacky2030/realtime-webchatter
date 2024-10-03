const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Search for users by username (partial match)
exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    const users = await User.find({
      username: { $regex: query, $options: 'i' }  // Case-insensitive search
    }).select('-password');

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile (bio, username, password)
exports.updateUserProfile = async (req, res) => {
  const { bio, username, password, newPassword } = req.body;

  try {
    const user = await User.findById(req.user);

    if (bio) user.bio = bio;
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }
    if (password && newPassword) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a friend
exports.addFriend = async (req, res) => {
  const { friendId } = req.body;

  try {
    const user = await User.findById(req.user);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ message: 'User not found' });

    if (user.friends.includes(friendId)) return res.status(400).json({ message: 'User is already your friend' });

    user.friends.push(friendId);
    await user.save();

    res.status(200).json({ message: 'Friend added', friend });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Block a user
exports.blockUser = async (req, res) => {
  const { userIdToBlock } = req.body;

  try {
    const user = await User.findById(req.user);
    const userToBlock = await User.findById(userIdToBlock);

    if (!userToBlock) return res.status(404).json({ message: 'User not found' });

    if (user.blocked.includes(userIdToBlock)) return res.status(400).json({ message: 'User is already blocked' });

    user.blocked.push(userIdToBlock);
    await user.save();

    res.status(200).json({ message: 'User blocked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Unblock a user
exports.unblockUser = async (req, res) => {
  const { userIdToUnblock } = req.body;

  try {
    const user = await User.findById(req.user);

    if (!user.blocked.includes(userIdToUnblock)) return res.status(400).json({ message: 'User is not blocked' });

    user.blocked = user.blocked.filter(userId => userId.toString() !== userIdToUnblock);
    await user.save();

    res.status(200).json({ message: 'User unblocked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get list of blocked users
exports.getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user).populate('blocked', 'username bio');
    res.status(200).json(user.blocked);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
