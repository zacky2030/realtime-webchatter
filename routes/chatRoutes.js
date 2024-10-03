const express = require('express');
const { createChat, joinChat, leaveChat, sendMessage, createThread } = require('../controllers/chatController');
const router = express.Router();

// Route to create a new chat room
router.post('/create', createChat);

// Route to join an existing chat room
router.post('/join', joinChat);

// Route to leave a chat room
router.post('/leave', leaveChat);

// Route to send a message in a chat room
router.post('/message', sendMessage);

// Route to create a thread under a message
router.post('/thread', createThread);

module.exports = router;
