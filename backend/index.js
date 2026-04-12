const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
require('dotenv').config();

const sessionRoutes = require('./routes/sessionRoutes');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const signaling = require('./websockets/signaling');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/session', sessionRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', apiRoutes);

// Setup WebSockets
signaling(io);

// Database Connection
const PORT = process.env.PORT || 5000;
// We allow mongoose to connect when the DB string is ready, but keep the server up
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/intellicred';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB, starting server anyway for dev mode:', err);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without DB)`);
    });
  });
