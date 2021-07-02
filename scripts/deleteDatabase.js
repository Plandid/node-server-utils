const { MongoClient } = require("mongodb");
const fs = require("fs");

require("dotenv").config();

const { databaseName } = JSON.parse(fs.readFileSync("./config.json"));

(async function() {
    const client = new MongoClient(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});

    await client.connect();
    const db = client.db(databaseName);

    await db.dropDatabase();

    await client.close();

    console.log(`database: ${databaseName} has been deleted`)
    process.exit(0);
})()