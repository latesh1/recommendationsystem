const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tenantId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    tags: [{
        type: String
    }],
    category: {
        type: String,
        required: true
    },
    viewerCount: {
        type: Number,
        default: 0
    },
    isLive: {
        type: Boolean,
        default: false
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    thumbnailUrl: {
        type: String
    },
    region: {
        type: String,
        default: 'Global'
    },
    engagementRate: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search and filtering
streamSchema.index({ title: 'text', description: 'text', tags: 'text' });
streamSchema.index({ category: 1, isLive: 1 });
streamSchema.index({ creatorId: 1 });

module.exports = mongoose.model('Stream', streamSchema);
