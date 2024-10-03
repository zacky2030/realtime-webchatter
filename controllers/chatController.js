const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');

// Create a new chat room
exports.createChat = async (req, res) => {
  const { name } = req.body;

  const existingChat = await Chat.findOne({ name });
  if (existingChat) return res.status(400).json({ message: 'Chat room with this name already exists' });

  const chat = new Chat({ name, users: [req.user] });
  await chat.save();

  res.status(201).json({ message: 'Chat room created', chat });
};

// Join an existing chat room
exports.joinChat = async (req, res) => {
  const { chatId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: 'Chat room not found' });

  if (chat.users.includes(req.user)) return res.status(400).json({ message: 'Already in chat room' });

  chat.users.push(req.user);
  await chat.save();

  res.status(200).json({ message: 'Joined chat room', chat });
};

// Leave a chat room
exports.leaveChat = async (req, res) => {
  const { chatId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: 'Chat room not found' });

  chat.users = chat.users.filter(user => user.toString() !== req.user);
  await chat.save();

  res.status(200).json({ message: 'Left chat room' });
};

// Send a message in a chat room
exports.sendMessage = async (req, res) => {
  const { chatId, content } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ message: 'Chat room not found' });

  const message = new Message({
    user: req.user,
    chat: chatId,
    content,
    threads: []
  });

  await message.save();
  chat.messages.push(message._id);
  await chat.save();

  res.status(201).json({ message: 'Message sent', message });
};

// Create a thread under a message
exports.createThread = async (req, res) => {
  const { messageId, content } = req.body;

  const message = await Message.findById(messageId);
  if (!message) return res.status(404).json({ message: 'Message not found' });

  if (message.threads.length >= 2) return res.status(400).json({ message: 'Cannot add more than 2 threads' });

  const thread = new Message({
    user: req.user,
    chat: message.chat,
    content,
    threads: []
  });

  await thread.save();
  message.threads.push(thread._id);
  await message.save();

  res.status(201).json({ message: 'Thread created', thread });
};
