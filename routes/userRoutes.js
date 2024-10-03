const express = require('express');
const { getUserProfile, searchUsers, updateUserProfile, addFriend, blockUser, unblockUser, getBlockedUsers } = require('../controllers/userController');
const router = express.Router();

// Get user profile by ID
router.get('/profile/:userId', getUserProfile);

// Search for users by username
router.get('/search', searchUsers);

// Update user profile (bio, username, password)
router.put('/profile', updateUserProfile);

// Add a friend
router.post('/add-friend', addFriend);

// Block a user
router.post('/block-user', blockUser);

// Unblock a user
router.post('/unblock-user', unblockUser);

// Get list of blocked users
router.get('/blocked-users', getBlockedUsers);

module.exports = router;
