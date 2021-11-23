const config = require('./config.json');
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const mongoURI = process.env.DB_URI || config["DB_URI"];
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const createServer = require('./app.js');

try {
    MongoClient.connect(mongoURI, mongoOptions, (err, db) => {
        if (err) throw err;

        const app = createServer();

        app.locals.db = db.db('Animal-Game');

        app.listen(process.env.PORT || config['PORT']);
        console.log("Started Animal Location Server!");
    });
} catch (error) {
    console.log(error);
}
