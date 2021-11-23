const SpawnService = require('../services/SpawnService');
const DatabaseService = require('../services/DatabaseService');
const ValidationService = require('../services/ValidationService');

/**
 * Finds the location of a nearby regular spawner and returns it if found
 */
exports.findSpawner = async (req, res) => {
    const { distance, longitude, latitude } = req.query;

    if (!distance || !longitude || !latitude) {
        return res.status(400).end();
    }

    try {
        var errors = ValidationService.checkSpawnDistance(distance);
        errors = ValidationService.checkCoordinates(longitude, latitude, errors);

        if (errors.length > 0) {
            return res.status(422).json({ "errors": errors });
        }

        const database = req.app.locals.db;

        var spawnList = await SpawnService.getSpawnList(database, distance, longitude, latitude);

        spawnList = (spawnList.length > 0) ? spawnList : "Spawn Point Not Found";

        res.status(200).json({ "spawners": spawnList });

    } catch (error) {
        console.error(error);
    }
}

/**
 * Creates a regular spawner at the player location
 */
exports.createSpawner = async (req, res) => {
    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
        return res.status(400).end();
    }

    try {
        const errors = ValidationService.checkCoordinates(longitude, latitude);

        if (errors.length > 0) {
            return res.status(422).json({ "errors": errors });
        }

        const newSpawn = await SpawnService.createSpawn(longitude, latitude);

        const database = req.app.locals.db;

        const newSpawnPoint = await DatabaseService.insertNewSpawn(database, newSpawn);

        res.status(200).json({ "spawn_point": newSpawnPoint });
    } catch (error) {
        console.error(error);
    }
}