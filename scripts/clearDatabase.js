const { MongoClient } = require("mongodb");
const fs = require("fs");

require("dotenv").config();

const schemas = JSON.parse(fs.readFileSync("./schemas.json"));
const { databaseName } = JSON.parse(fs.readFileSync("./config.json"));

(async function() {
    const client = new MongoClient(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});

    await client.connect();
    const db = client.db(databaseName);

    for (const collection in schemas) {
        await db.collection(collection).deleteMany({});
        console.log(`collection: ${collection} has been cleared`)
    }

    await client.close();

    console.log(`database: ${databaseName} has been cleared of all documents`)
    process.exit(0);
})()