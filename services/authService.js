const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwtSecret } = require('../config');

// Generate a JWT token for a user
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
};

// Register a new user
const registerUser = async (username, email, password) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) throw new Error('Username is already taken');

  const user = new User({ username, email, password });
  await user.save();
  
  return generateToken(user);
};

// Log in a user
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  return generateToken(user);
};

module.exports = {
  registerUser,
  loginUser
};
