require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectRedis, client: redisClient } = require('./config/redis');
const configRoutes = require('./routes/configRoutes');
const Config = require('./models/Config');

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[AdminSvc] ${req.method} ${req.url} | Tenant: ${req.headers['x-tenant-id']}`);
    next();
});



// Redis Client for real-time config sync
connectRedis();

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Admin Service: Connected to MongoDB');
        initializeDefaultConfig();
    })
    .catch(err => console.error('Admin Service: MongoDB connection error:', err));

// Routes
app.use('/', configRoutes);


const PORT = process.env.PORT || 3009;

app.listen(PORT, () => {
    console.log(`Admin Service running on port ${PORT}`);
});

async function initializeDefaultConfig() {
    const tenantId = 'super-admin-master';
    const defaults = [
        { key: 'engagement_weight', value: 0.3, description: 'Weight for likes, comments, and shares' },
        { key: 'watch_time_weight', value: 0.3, description: 'Weight for total watch time and percentage' },
        { key: 'popularity_weight', value: 0.2, description: 'Weight for viewer count and subscriber count' },
        { key: 'personalization_weight', value: 0.2, description: 'Weight for user interest match' },
        { key: 'diversity_factor', value: 2, description: 'Max streams from the same category' },
        { key: 'exploration_rate', value: 0.1, description: 'Percentage of random discovery streams' }
    ];

    for (const def of defaults) {
        // Upsert based on both tenantId and key
        await Config.updateOne(
            { tenantId, key: def.key },
            { $setOnInsert: { ...def, tenantId } },
            { upsert: true }
        );

        // Sync to Redis with tenant prefix
        if (redisClient) {
            const current = await Config.findOne({ tenantId, key: def.key });
            if (current) {
                await redisClient.set(`tenant:${tenantId}:config:${def.key}`, JSON.stringify(current.value));
            }
        }
    }
    console.log(`Default SaaS configurations initialized for tenant [${tenantId}]`);
}
