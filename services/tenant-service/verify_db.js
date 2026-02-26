const { MongoClient } = require('mongodb');
const MONGO_URI = 'mongodb://localhost:27017';
const TENANT_ID = 'test-tenant-0994';

async function verify() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('recommendation_db');

    const tenantUsers = await db.collection('users').countDocuments({ tenantId: TENANT_ID });
    const tenantStreams = await db.collection('streams').countDocuments({ tenantId: TENANT_ID });

    console.log(`Tenant ${TENANT_ID} -> Users: ${tenantUsers}, Streams: ${tenantStreams}`);

    const sample = await db.collection('users').findOne({ tenantId: TENANT_ID });
    console.log('Sample Seeded User:', JSON.stringify(sample, null, 2));

    const sSample = await db.collection('streams').findOne({ tenantId: TENANT_ID, isLive: true });
    console.log('Sample Seeded Stream:', JSON.stringify(sSample, null, 2));

    await client.close();
}
verify();

