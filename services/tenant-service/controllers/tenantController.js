const Tenant = require('../models/Tenant');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

exports.registerTenant = async (req, res) => {
    try {
        const { name, slug } = req.body;

        // Generate secure API key and Webhook secret
        const apiKey = `ts_${crypto.randomBytes(24).toString('hex')}`;
        const webhookSecret = `whs_${crypto.randomBytes(24).toString('hex')}`;

        const tenant = new Tenant({
            name,
            slug: slug || name.toLowerCase().replace(/ /g, '-'),
            apiKey,
            webhookSecret
        });

        await tenant.save();

        res.status(201).json({
            message: 'Tenant registered successfully',
            tenantId: tenant._id,
            apiKey,
            webhookSecret,
            ingestionEndpoint: `${process.env.GATEWAY_URL || 'http://localhost:3000'}/api/events`,
            recommendationEndpoint: `${process.env.GATEWAY_URL || 'http://localhost:3000'}/api/recommendations`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getTenantByApiKey = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ apiKey: req.params.apiKey });
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
