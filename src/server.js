const config = require('./config.json');
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const client = MongoClient(process.env.DB_URI || config["DB_URI"], { useNewUrlParser: true });

const createServer = require('./app.js');

try {
    const app = createServer();
    app.listen(process.env.PORT || config['PORT']);
    console.log("Started Animal Location Server!");

} catch (error) {
    console.log(error);
} finally {
    client.close();
}
