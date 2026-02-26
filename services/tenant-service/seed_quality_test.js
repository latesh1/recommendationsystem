const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'recommendation_db';

const categories = ['Tech', 'Gaming', 'Music', 'Cooking', 'Sports'];
const tags = {
    'Tech': ['coding', 'hardware', 'ai'],
    'Gaming': ['fps', 'rpg', 'stardew'],
    'Music': ['jazz', 'rock', 'live'],
    'Cooking': ['pasta', 'vegan', 'bbq'],
    'Sports': ['football', 'tennis', 'nba']
};

async function seedQualityData() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    console.log('Connected to MongoDB native...');

    const suffix = Date.now().toString().slice(-4);
    const tenantId = 'test-tenant-' + suffix;
    console.log(`Using Tenant ID: ${tenantId}`);

    console.log('Generating 50 streams...');
    const streams = [];
    const creatorId = new ObjectId();
    for (let i = 0; i < 50; i++) {
        const cat = categories[i % categories.length];
        streams.push({
            title: `${cat} Stream #${i}_${suffix}`,
            category: cat,
            viewerCount: Math.floor(Math.random() * 1000),
            tags: [tags[cat][Math.floor(Math.random() * 3)]],
            isLive: true,
            creatorId: creatorId,
            tenantId,
            trendingScore: Math.random(),
            engagementRate: Math.random() * 100,
            region: 'Global'
        });
    }
    await db.collection('streams').insertMany(streams);

    console.log('Creating users...');
    const users = [
        { username: 'TechFan_' + suffix, email: `tech_${suffix}@test.com`, password: 'password123', interests: ['Tech'], tenantId, region: 'Global' },
        { username: 'Gamer_' + suffix, email: `gamer_${suffix}@test.com`, password: 'password123', interests: ['Gaming'], tenantId, region: 'Global' },
        { username: 'Chef_' + suffix, email: `chef_${suffix}@test.com`, password: 'password123', interests: ['Cooking'], tenantId, region: 'Global' },
        { username: 'DiverseUser_' + suffix, email: `diverse_${suffix}@test.com`, password: 'password123', interests: ['Music', 'Sports', 'Tech'], tenantId, region: 'Global' }
    ];
    const userResult = await db.collection('users').insertMany(users);

    console.log('Seeding Complete.');
    console.log('User IDs for testing:');
    Object.keys(userResult.insertedIds).forEach(idx => {
        console.log(`${users[idx].username}: ${userResult.insertedIds[idx]}`);
    });

    await client.close();
}

seedQualityData().catch(console.error);
