const config = require('./config.json');
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const mongoURI = process.env.DB_URI || config["DB_URI"];

const createServer = require('./app.js');

try {
    MongoClient.connect(mongoURI, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err;

        const app = createServer();

        app.locals.db = db;

        app.listen(process.env.PORT || config['PORT']);
        console.log("Started Animal Location Server!");
    });
} catch (error) {
    console.log(error);
}
