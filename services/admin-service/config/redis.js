const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({ url: process.env.REDIS_URL });
client.on('error', err => console.error('Redis Client Error', err));

let isConnected = false;

const connectRedis = async () => {
    if (!isConnected) {
        await client.connect();
        isConnected = true;
        console.log('Admin Service: Connected to Redis');
    }
};

module.exports = { client, connectRedis };
