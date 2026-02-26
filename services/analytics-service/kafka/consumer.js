const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'analytics-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'analytics-group' });

const connectConsumer = async (handleMessage) => {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'user-interactions', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const value = JSON.parse(message.value.toString());
                console.log(`Analytics Service received event: ${JSON.stringify(value)}`);
                await handleMessage(value);
            },
        });
        console.log('Kafka Consumer connected and running');
    } catch (error) {
        console.error('Error connecting Kafka Consumer:', error);
    }
};

module.exports = { connectConsumer };
