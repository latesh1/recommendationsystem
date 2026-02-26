require('dotenv').config();
const express = require('express');
const { Kafka } = require('kafkajs');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const kafka = new Kafka({
    clientId: 'webhook-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});
const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();
    console.log('Webhook Service: Connected to Kafka');
};
connectProducer();

// Middleware to verify signature (Simplified for demo)
const verifySignature = (req, res, next) => {
    const signature = req.headers['x-webhook-signature'];
    if (!signature) {
        return res.status(401).json({ error: 'Missing signature' });
    }
    // Logic for actual signature verification would go here
    next();
};

app.post('/api/v1/events', async (req, res) => {
    try {
        const { userId, contentId, eventType, watchTime, deviceType, region } = req.body;

        const event = {
            userId,
            streamId: contentId, // Field mapping
            type: eventType.toUpperCase(),
            duration: watchTime || 0,
            timestamp: new Date().toISOString(),
            deviceType: deviceType || 'unknown',
            region: region || 'Global',
            source: 'external_webhook'
        };

        await producer.send({
            topic: 'user-interactions',
            messages: [{ value: JSON.stringify(event) }]
        });

        res.status(200).json({ status: 'Event received and queued' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.WEBHOOK_SERVICE_PORT || 3006;
app.listen(PORT, () => {
    console.log(`Webhook Service running on port ${PORT}`);
});
