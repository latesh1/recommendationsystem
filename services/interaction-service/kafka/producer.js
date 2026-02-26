const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'interaction-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

const connectProducer = async () => {
    try {
        await producer.connect();
        console.log('Kafka Producer connected');
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
};

const sendEvent = async (topic, message) => {
    try {
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }]
        });
    } catch (error) {
        console.error('Error sending message to Kafka:', error);
    }
};

module.exports = { connectProducer, sendEvent };
