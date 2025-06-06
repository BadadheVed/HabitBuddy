const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const UserRoute = require('./Routes.js/UserRoutes');
const notiRoute = require('./Routes.js/NotiRoute')
const furl = process.env.furl;
const cors = require('cors');
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
    cors: {
        origin: furl, // Allow frontend connection
        methods: ['GET', 'POST', 'PUT', 'DELETE', ''],
        credentials: true,
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: `${furl}`, credentials: true }));
app.use(express.json());
app.set('io', io);

// User routes
app.use('/User', UserRoute);
app.use('/User', notiRoute);

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
