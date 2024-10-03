const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Get user profile by ID
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

// Search for users by username
const searchUsers = async (query) => {
  return await User.find({ username: { $regex: query, $options: 'i' } }).select('-password');
};

// Update user profile
const updateUserProfile = async (userId, bio, username, password, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (bio) user.bio = bio;
  if (username) {
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      throw new Error('Username is already taken');
    }
    user.username = username;
  }

  if (password && newPassword) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Incorrect current password');
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  }

  await user.save();
  return user;
};

// Add a friend
const addFriend = async (userId, friendId) => {
  const user = await User.findById(userId);
  const friend = await User.findById(friendId);
  
  if (!friend) throw new Error('Friend not found');
  if (user.friends.includes(friendId)) throw new Error('User is already your friend');
  
  user.friends.push(friendId);
  await user.save();
  return friend;
};

// Block a user
const blockUser = async (userId, userIdToBlock) => {
  const user = await User.findById(userId);
  const userToBlock = await User.findById(userIdToBlock);

  if (!userToBlock) throw new Error('User not found');
  if (user.blocked.includes(userIdToBlock)) throw new Error('User is already blocked');

  user.blocked.push(userIdToBlock);
  await user.save();
  return userToBlock;
};

// Unblock a user
const unblockUser = async (userId, userIdToUnblock) => {
  const user = await User.findById(userId);

  if (!user.blocked.includes(userIdToUnblock)) throw new Error('User is not blocked');

  user.blocked = user.blocked.filter(user => user.toString() !== userIdToUnblock);
  await user.save();
  return user;
};

// Get blocked users
const getBlockedUsers = async (userId) => {
  const user = await User.findById(userId).populate('blocked', 'username bio');
  return user.blocked;
};

module.exports = {
  getUserProfile,
  searchUsers,
  updateUserProfile,
  addFriend,
  blockUser,
  unblockUser,
  getBlockedUsers
};
