const GATEWAY_URL = 'http://localhost:3000/api';
const MASTER_KEY = 'master-saas-key-2026';
const TENANT_ID = 'test-tenant-0994';

const users = [
    { name: 'TechFan', id: '699ec2f9e25702098e9069a5', expected: 'Tech' },
    { name: 'Gamer', id: '699ec2f9e25702098e9069a6', expected: 'Gaming' },
    { name: 'Chef', id: '699ec2f9e25702098e9069a7', expected: 'Cooking' },
    { name: 'DiverseUser', id: '699ec2f9e25702098e9069a8', expected: 'Mixed' }
];

async function evaluate() {
    console.log('--- Recommendation Quality Evaluation ---');

    for (const user of users) {
        console.log(`\nEvaluating User: ${user.name} (Expected Interest: ${user.expected})`);

        const start = Date.now();
        try {
            const response = await fetch(`${GATEWAY_URL}/recommendations/${user.id}`, {
                headers: {
                    'x-api-key': MASTER_KEY,
                    'x-tenant-id': TENANT_ID
                }
            });
            const latency = Date.now() - start;

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errText}`);
            }

            const recs = await response.json();
            console.log(`Latency: ${latency}ms | Items Received: ${recs.length}`);

            if (recs.length === 0) {
                console.log('WARNING: Zero recommendations returned!');
                continue;
            }

            console.log('Sample Item:', JSON.stringify(recs[0], null, 2));

            // In a real system we'd fetch stream details to check category, 
            // but for this test we can see the 'reason' or metadata if returned.
            // Our recommender returns: { stream_id, score, category, reason }

            const categories = recs.map(r => r.category);
            const reasons = recs.map(r => r.reason);

            const catCounts = categories.reduce((acc, c) => {
                acc[c] = (acc[c] || 0) + 1;
                return acc;
            }, {});

            console.log('Category Distribution:', catCounts);

            const topMatch = (categories[0] === user.expected) || (user.expected === 'Mixed');
            console.log(`Top Rank Match: ${topMatch ? 'PASSED' : 'FAILED'} (Got: ${categories[0]})`);

            const discoveryCount = reasons.filter(r => r === 'discovery_boost').length;
            console.log(`Discovery Items (Exploration): ${discoveryCount}`);

        } catch (err) {
            console.error(`Error for ${user.name}:`, err.message);
        }
    }
}

evaluate();
