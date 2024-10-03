const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const bcrypt = require('bcryptjs');

// Register User
exports.register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) return res.status(400).json({ message: "Passwords don't match" });

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json({ message: 'Username is taken' });

  const newUser = new User({ username, email, password });
  await newUser.save();

  const token = jwt.sign({ id: newUser._id }, jwtSecret, { expiresIn: '1h' });
  res.status(201).json({ token });
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
  res.status(200).json({ token });
};
