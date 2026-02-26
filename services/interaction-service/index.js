require('dotenv').config();
const express = require('express');
const { connectProducer } = require('./kafka/producer');
const interactionRoutes = require('./routes/interactions');

const app = express();
app.use(express.json());

// Routes
app.use('/', interactionRoutes);

// Connect to Kafka before starting server
connectProducer().then(() => {
    const PORT = process.env.INTERACTION_SERVICE_PORT || 3003;
    app.listen(PORT, () => {
        console.log(`Interaction Service running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to Kafka, service not started:', err);
});
