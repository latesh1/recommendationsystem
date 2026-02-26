require('dotenv').config();

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());

// Routes
app.use('/', authRoutes);

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recommendation_db';
mongoose.connect(MONGO_URI)
    .then(() => console.log('User Service: Connected to MongoDB'))
    .catch(err => console.error('User Service: MongoDB connection error:', err));

const PORT = process.env.USER_SERVICE_PORT || 3001;
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});
