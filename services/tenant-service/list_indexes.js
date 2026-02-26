const mongoose = require('mongoose');
async function listIndexes() {
    await mongoose.connect('mongodb://localhost:27017/recommendation_db');
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (let col of collections) {
        const indexes = await mongoose.connection.db.collection(col.name).indexes();
        console.log(`Collection: ${col.name}`);
        console.log(JSON.stringify(indexes, null, 2));
    }
    process.exit(0);
}
listIndexes();
