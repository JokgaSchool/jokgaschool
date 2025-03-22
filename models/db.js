const { MongoClient } = require('mongodb');

let client;
let db;

async function connectToDatabase() {
    const uri = process.env.MONGODB_ADMIN_URL;
    const dbName = process.env.DATABASE_NAME;

    if (!uri || !dbName) {
        throw new Error('MongoDB 환경변수가 설정되지 않았습니다.');
    }

    if (!client || !client.topology || !client.topology.isConnected()) {
        client = new MongoClient(uri);
        await client.connect();
        console.log('✅ MongoDB 연결 성공');
        db = client.db(dbName);
    }

    return db;
}

function getCollection(name) {
    if (!db) {
        throw new Error('MongoDB가 아직 연결되지 않았습니다.');
    }
    return db.collection(name);
}

module.exports = {
    connectToDatabase,
    getUsersCollection: () => getCollection('users'),
    getPostsCollection: () => getCollection('posts'),
    getCommentsCollection: () => getCollection('posts_comments'),
    getIdUsedCollection: () => getCollection('id_used'),
};
