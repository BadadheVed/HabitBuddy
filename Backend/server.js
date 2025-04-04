const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const UserRoute = require('./Routes.js/UserRoutes');

const cors = require('cors');
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Allow frontend connection
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.set('io', io);

// User routes
app.use('/User', UserRoute);

// Socket.IO event handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle friend request event
    socket.on('sendFriendRequest', (data) => {
        console.log(`Friend request sent from ${data.senderId} to ${data.receiverId}`);
        io.emit('friendRequest', data); // Broadcast to all users
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
