const axios = require('axios');

const TENANT_SERVICE_URL = process.env.TENANT_SERVICE_URL || 'http://localhost:3007';

const saasAuth = async (req, res, next) => {
    console.log(`[saasAuth] Checking API Key: ${req.headers['x-api-key']}`);
    const apiKey = req.headers['x-api-key'];

    const tenantIdHeader = req.headers['x-tenant-id'];

    if (!apiKey) {
        return res.status(401).json({ error: 'Missing x-api-key header' });
    }

    // Master Key Bypass for Super Admin/Testing
    if (apiKey === 'master-saas-key-2026') {
        console.log('[saasAuth] Master Key used');
        if (!req.headers['x-tenant-id']) {
            req.headers['x-tenant-id'] = 'super-admin-master';
        }
        req.headers['x-tenant-tier'] = 'enterprise';
        return next();
    }





    try {
        // Validate API Key against Tenant Service
        const response = await axios.get(`${TENANT_SERVICE_URL}/api/tenants/lookup/${apiKey}`);
        const tenant = response.data;

        if (tenant.status !== 'active') {
            return res.status(403).json({ error: 'Tenant account is inactive or suspended' });
        }

        // Verify tenant ID matches if provided
        if (tenantIdHeader && tenantIdHeader !== tenant._id.toString()) {
            return res.status(403).json({ error: 'Tenant ID mismatch' });
        }

        // Inject tenant context into headers for downstream microservices
        req.headers['x-tenant-id'] = tenant._id.toString();
        req.headers['x-tenant-tier'] = tenant.tier;

        next();
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(401).json({ error: 'Invalid API Key' });
        }
        console.error('SaaS Auth Error:', error.message);
        res.status(500).json({ error: 'Internal SaaS Authentication Error' });
    }
};

module.exports = saasAuth;
