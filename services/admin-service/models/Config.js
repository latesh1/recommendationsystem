const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: String,
    updatedAt: { type: Date, default: Date.now }
});

// Compound index for multi-tenancy
configSchema.index({ tenantId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('AlgorithmConfig', configSchema);
