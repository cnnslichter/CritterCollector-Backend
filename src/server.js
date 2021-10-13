const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require('dotenv').config();
const animalRouter = require('./routes/AnimalRouter');
const locationRouter = require('./routes/LocationRouter');
const spawnRouter = require('./routes/SpawnRouter');
//const specialSpawnRouter = require('./routes/SpecialSpawnRouter');
const MongoClient = require('mongodb').MongoClient
const config = require('./config.json')
const client = MongoClient(process.env.DB_URI || config["DB_URI"], { useNewUrlParser: true })

// set up server
try {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));

    // set up routes
    app.use('/api/animal', animalRouter);
    app.use('/api/location', locationRouter);
    app.use('/api/spawner', spawnRouter);
    //app.use('/api/special-spawner', specialSpawnRouter);

    // start server
    var server = app.listen(process.env.PORT || config['PORT'])
    console.log("Started Animal Location Server!");

} catch (error) {
    console.log(error)
} finally {
    client.close() //important to close
}
