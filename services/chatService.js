const Chat = require('../models/chat');
const Message = require('../models/message');

// Create a new chat room
const createChatRoom = async (name, userId) => {
  const existingChat = await Chat.findOne({ name });
  if (existingChat) throw new Error('Chat room with this name already exists');

  const chat = new Chat({ name, users: [userId] });
  await chat.save();
  return chat;
};

// Add a user to a chat room
const joinChatRoom = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new Error('Chat room not found');

  if (chat.users.includes(userId)) throw new Error('User is already in this chat room');
  
  chat.users.push(userId);
  await chat.save();
  return chat;
};

// Leave a chat room
const leaveChatRoom = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new Error('Chat room not found');

  chat.users = chat.users.filter(user => user.toString() !== userId.toString());
  await chat.save();
  return chat;
};

// Send a message in a chat room
const sendMessage = async (chatId, userId, content) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new Error('Chat room not found');

  const message = new Message({ user: userId, chat: chatId, content });
  await message.save();

  chat.messages.push(message._id);
  await chat.save();
  return message;
};

// Create a thread under a message
const createThread = async (messageId, userId, content) => {
  const parentMessage = await Message.findById(messageId);
  if (!parentMessage) throw new Error('Message not found');

  if (parentMessage.threads.length >= 2) throw new Error('Cannot create more than 2 threads');

  const thread = new Message({ user: userId, chat: parentMessage.chat, content });
  await thread.save();

  parentMessage.threads.push(thread._id);
  await parentMessage.save();

  return thread;
};

module.exports = {
  createChatRoom,
  joinChatRoom,
  leaveChatRoom,
  sendMessage,
  createThread
};
