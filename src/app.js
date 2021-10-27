const express = require("express");
const bodyParser = require("body-parser");
const animalRouter = require('./routes/AnimalRouter');
const locationRouter = require('./routes/LocationRouter');
const spawnRouter = require('./routes/SpawnRouter');
const specialSpawnRouter = require('./routes/SpecialSpawnRouter');

function createServer() {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use('/api/animal', animalRouter);
    app.use('/api/location', locationRouter);
    app.use('/api/spawner', spawnRouter);
    app.use('/api/special-spawner', specialSpawnRouter);

    return app;
}

module.exports = createServer;