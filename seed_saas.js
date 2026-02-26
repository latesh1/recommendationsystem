const mongoose = require('mongoose');
const tenantId = '699ea4e77c2a86a54e81c77f';

const seed = async () => {
    await mongoose.connect('mongodb://localhost:27017/recommendation_db');

    // Clear old test data for this tenant
    await mongoose.connection.collection('users').deleteMany({ tenantId });
    await mongoose.connection.collection('streams').deleteMany({ tenantId });

    // Insert Tenant-Specific User
    const userResult = await mongoose.connection.collection('users').insertOne({
        username: 'nexus_user_1',
        tenantId,
        interests: ['Gaming', 'Tech'],
        region: 'IN'
    });

    // Insert Tenant-Specific Streams
    await mongoose.connection.collection('streams').insertMany([
        {
            title: 'Nexus Gaming Pro',
            tenantId,
            category: 'Gaming',
            isLive: true,
            viewerCount: 1500,
            engagementRate: 85,
            region: 'IN',
            trendingScore: 0.9
        },
        {
            title: 'Nexus Tech Talk',
            tenantId,
            category: 'Tech',
            isLive: true,
            viewerCount: 800,
            engagementRate: 92,
            region: 'IN',
            trendingScore: 0.8
        },
        {
            title: 'Nexus Random Fun',
            tenantId,
            category: 'Entertainment',
            isLive: true,
            viewerCount: 200,
            engagementRate: 40,
            region: 'US',
            trendingScore: 0.3
        }
    ]);

    console.log('SaaS Test Data Seeded');
    console.log('Test User ID:', userResult.insertedId);
    process.exit();
};

seed();
