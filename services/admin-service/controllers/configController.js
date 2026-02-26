const Config = require('../models/Config');
const { client: redisClient } = require('../config/redis');

exports.getAllConfigs = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        if (!tenantId) return res.status(403).json({ error: 'Tenant identity required' });

        const configs = await Config.find({ tenantId }).sort({ key: 1 });
        res.status(200).json(configs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateConfig = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;
        const tenantId = req.headers['x-tenant-id'];

        if (!tenantId) return res.status(403).json({ error: 'Tenant identity required' });

        const config = await Config.findOneAndUpdate(
            { tenantId, key },
            { value, description, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        // Sync to Redis with tenant-specific key
        if (redisClient) {
            const redisKey = `tenant:${tenantId}:config:${key}`;
            await redisClient.set(redisKey, JSON.stringify(value));
        }

        res.status(200).json(config);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
