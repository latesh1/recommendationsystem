require('dotenv').config();
const mongoose = require('mongoose');
const { connectConsumer } = require('./kafka/consumer');
const { processInteraction } = require('./logic/featureExtractor');

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recommendation_db';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Analytics Service: Connected to MongoDB'))
    .catch(err => console.error('Analytics Service: MongoDB connection error:', err));

// Start Kafka Consumer
connectConsumer(processInteraction)
    .then(() => console.log('Analytics Service started and listening for events'))
    .catch(err => console.error('Failed to start Analytics Service:', err));

// Periodic Trending Update (Optional: can be triggered by events too)
setInterval(async () => {
    console.log('Running periodic trending calculations...');
    // Implement bulk trending logic if needed
}, 5 * 60 * 1000); // Every 5 minutes
