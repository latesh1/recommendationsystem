const { sendEvent } = require('../kafka/producer');

exports.trackInteraction = async (req, res) => {
    try {
        const { userId, streamId, type, duration, percentage, metadata, scrollDepth, isRewatch } = req.body;
        const tenantId = req.headers['x-tenant-id'];

        if (!tenantId) return res.status(403).json({ error: 'Tenant context missing' });

        const event = {
            tenantId,
            userId,
            streamId,
            type, // CLICK, WATCH_TIME, LIKE, SHARE, COMMENT, REWATCH
            duration: duration || 0,
            percentage: percentage || 0,
            scrollDepth: scrollDepth || 0,
            isRewatch: isRewatch || false,
            metadata: metadata || {},
            timestamp: new Date().toISOString(),
            region: req.headers['x-region'] || 'Global',
            deviceType: req.headers['user-agent'] || 'unknown',
            platform: req.headers['x-platform'] || 'web'
        };

        // Send event to Kafka topic 'user-interactions'
        await sendEvent('user-interactions', event);

        res.status(200).json({ status: 'Interaction tracked' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.trackSearch = async (req, res) => {
    try {
        const { userId, query } = req.body;
        const tenantId = req.headers['x-tenant-id'];

        const event = {
            tenantId,
            userId,
            type: 'SEARCH',
            query,
            timestamp: new Date().toISOString()
        };

        await sendEvent('user-interactions', event);
        res.status(200).json({ status: 'Search tracked' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
