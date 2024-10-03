const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { mongoURI } = require('./config');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const { authMiddleware } = require('./middlewares/authMiddleware');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/user', authMiddleware, userRoutes);

// Socket.IO for real-time chat
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', ({ chatId }) => {
        socket.join(chatId);
        io.to(chatId).emit('message', 'A user has joined the chat');
    });

    socket.on('leaveRoom', ({ chatId }) => {
        socket.leave(chatId);
        io.to(chatId).emit('message', 'A user has left the chat');
    });

    socket.on('sendMessage', ({ chatId, message }) => {
        io.to(chatId).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
