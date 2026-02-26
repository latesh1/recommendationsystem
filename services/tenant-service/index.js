require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const tenantRoutes = require('./routes/tenantRoutes');

const app = express();
app.use(express.json());

// Routes
app.use('/api/tenants', tenantRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'tenant-service' }));

const PORT = process.env.TENANT_SERVICE_PORT || 3006;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Tenant Service running on port ${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
