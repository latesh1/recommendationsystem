const Stream = require('../models/Stream');

exports.createStream = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id'];
        const stream = new Stream({
            ...req.body,
            creatorId: req.user.userId,
            tenantId
        });
        await stream.save();
        res.status(201).json(stream);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllStreams = async (req, res) => {
    try {
        const { category, isLive } = req.query;
        const tenantId = req.headers['x-tenant-id'];
        const filter = { tenantId };

        if (category) filter.category = category;
        if (isLive !== undefined) filter.isLive = isLive === 'true';

        const streams = await Stream.find(filter).sort({ createdAt: -1 });
        res.json(streams);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getStreamById = async (req, res) => {
    try {
        const stream = await Stream.findById(req.params.id).populate('creatorId', 'username email');
        if (!stream) return res.status(404).json({ error: 'Stream not found' });
        res.json(stream);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateStreamStatus = async (req, res) => {
    try {
        const { isLive } = req.body;
        const stream = await Stream.findOneAndUpdate(
            { _id: req.params.id, creatorId: req.user.userId },
            {
                isLive,
                startTime: isLive ? new Date() : undefined,
                endTime: !isLive ? new Date() : undefined
            },
            { new: true }
        );
        if (!stream) return res.status(404).json({ error: 'Stream not found or unauthorized' });
        res.json(stream);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
