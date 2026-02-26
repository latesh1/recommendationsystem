require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security: Rate limiting
app.use(apiLimiter);
app.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.url}`);
    next();
});


// Routing logic
const services = {
    users: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    streams: process.env.STREAM_SERVICE_URL || 'http://localhost:3002',
    interactions: process.env.INTERACTION_SERVICE_URL || 'http://localhost:3003',
    recommendations: process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:3004'
};

// Internal service validation token (middleware example)
const internalAuth = (req, res, next) => {
    req.headers['x-internal-service-token'] = process.env.INTERNAL_TOKEN || 'secure-internal-token';
    next();
};

const saasAuth = require('./middleware/saasAuth');

app.use('/api/users', saasAuth, createProxyMiddleware({
    target: services.users,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '' }
}));

app.use('/api/streams', saasAuth, createProxyMiddleware({
    target: services.streams,
    changeOrigin: true,
    pathRewrite: { '^/api/streams': '' }
}));

// Protected SaaS routes (Recommendation & Interaction)
app.use('/api/interactions', saasAuth, createProxyMiddleware({
    target: services.interactions,
    changeOrigin: true,
    pathRewrite: { '^/api/interactions': '' }
}));

app.use('/api/recommendations', saasAuth, createProxyMiddleware({
    target: services.recommendations,
    changeOrigin: true,
    pathRewrite: { '^/api/recommendations': '' }
}));


app.use('/api/config', saasAuth, createProxyMiddleware({
    target: 'http://localhost:3009',
    changeOrigin: true,
    pathRewrite: { '^/api/config': '' }
}));





// Tenant Management (Admin only or public registration)
app.use('/api/tenants', createProxyMiddleware({
    target: 'http://localhost:3007',
    changeOrigin: true,
    pathRewrite: { '^/api/tenants': '/api/tenants' }
}));

const PORT = process.env.GATEWAY_PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
