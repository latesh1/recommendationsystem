const mongoose = require('mongoose');

// Minimal Stream schema for analytics updates
const streamSchema = new mongoose.Schema({
    viewerCount: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 },
    category: String,
    growthVelocity: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
    featureVector: { type: Map, of: Number, default: {} },
    interests: [String]
});

const Stream = mongoose.model('StreamAnalytics', streamSchema, 'streams'); // maps to 'streams' collection
const User = mongoose.model('UserAnalytics', userSchema, 'users'); // maps to 'users' collection

exports.processInteraction = async (event) => {
    const { userId, streamId, type, duration, percentage, category } = event;

    // 1. Update User Feature Vector/Interests
    if (userId && category) {
        await User.updateOne(
            { _id: userId },
            { $inc: { [`featureVector.${category}`]: 1 } }
        );
    }

    // 2. Update Stream Engagement
    if (streamId) {
        let incValue = 0;
        if (type === 'LIKE') incValue = 10;
        if (type === 'COMMENT') incValue = 5;
        if (type === 'SHARE') incValue = 15;
        if (type === 'WATCH_TIME' && percentage > 50) incValue = 2;

        // Advanced scores
        if (isRewatch) incValue += 5;
        if (scrollDepth > 70) incValue += 1;

        if (incValue > 0) {
            await Stream.updateOne(
                { _id: streamId },
                { $inc: { engagementRate: incValue } }
            );
        }
    }

    // 3. Trending Score Calculation
    // TrendingScore = (ViewerCount * 0.4) + (EngagementRate * 0.3) + (GrowthVelocity * 0.3)
    if (streamId) {
        const stream = await Stream.findById(streamId);
        if (stream) {
            const trendingScore = (stream.viewerCount * 0.4) + (stream.engagementRate * 0.3) + (stream.growthVelocity * 0.3);
            await Stream.updateOne({ _id: streamId }, { trendingScore });
        }
    }
};
