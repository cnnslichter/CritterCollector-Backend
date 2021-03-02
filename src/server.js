const express = require("express");
const bodyParser = require("body-parser");
const config = require('./config.json');
const animalDataRouter = require('./routes/AnimalDataRouter');
const spawnDataRouter = require('./routes/SpawnDataRouter');
const MongoClient = require('mongodb').MongoClient
const client = MongoClient(config["DB_URI"], { useNewUrlParser: true })

// set up server
try {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));

    // set up routes
    app.use('/api/get-animals', animalDataRouter);
    app.use('/api/get-spawn', spawnDataRouter);

    // start server
    var server = app.listen(process.env.PORT || config['PORT'])
    console.log("Started Animal Location Server!");

} catch (error) {
    console.log(error)
} finally {
    client.close() //important to close after operation
}
