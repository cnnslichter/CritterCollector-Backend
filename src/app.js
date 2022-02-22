const express = require("express");
const bodyParser = require("body-parser");
const swaggerUI = require('swagger-ui-express');
const animalRouter = require('./routes/AnimalRouter');
const encyclopediaRouter = require('./routes/EncyclopediaRouter');
const locationRouter = require('./routes/LocationRouter');
const playerRouter = require('./routes/PlayerRouter');
const spawnRouter = require('./routes/SpawnRouter');
const specialSpawnRouter = require('./routes/SpecialSpawnRouter');
const swaggerJSDoc = require('./docs/swagger.js');


function createServer() {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/api/animal', animalRouter);
    app.use('/api/encyclopedia', encyclopediaRouter);
    app.use('/api/location', locationRouter);
    app.use('/api/player', playerRouter);
    app.use('/api/spawner', spawnRouter);
    app.use('/api/special-spawner', specialSpawnRouter);

    const swaggerSpec = swaggerJSDoc.getSwaggerSpec();
    app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

    return app;
}

module.exports = createServer;