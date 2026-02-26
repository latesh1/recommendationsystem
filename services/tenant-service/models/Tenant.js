const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    apiKey: { type: String, required: true, unique: true },
    webhookSecret: { type: String, required: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    tier: { type: String, enum: ['starter', 'growth', 'enterprise'], default: 'starter' },
    config: {
        maxUsers: { type: Number, default: 10000 },
        maxEventsPerMonth: { type: Number, default: 1000000 }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', tenantSchema);
