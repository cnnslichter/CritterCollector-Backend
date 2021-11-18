const SpecialSpawnService = require('../services/SpecialSpawnService');
const DatabaseService = require('../services/DatabaseService');
const ValidationService = require('../services/ValidationService');

/** 
 * Finds the location of a nearby special spawner and returns it if found
 */
exports.findSpecialSpawner = async (req, res) => {

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

        var specialSpawners = await SpecialSpawnService.getNearbySpecialSpawners(database, distance, longitude, latitude);

        specialSpawners = (specialSpawners.length > 0) ? specialSpawners : "Special Spawn Point Not Found";

        res.status(200).json({ "special_spawners": specialSpawners });
    }
    catch (error) {
        console.error(error);
    }
}


/**
 * Creates a special spawner at the player location
 */
exports.createSpecialSpawner = async (req, res) => {

    let { location, longitude, latitude } = req.body;

    if (!location || !longitude || !latitude) {
        return res.status(400).end();
    }

    try {
        location = ValidationService.sanitizeStrings(location);

        const errors = ValidationService.checkCoordinates(longitude, latitude);

        if (errors.length > 0) {
            return res.status(422).json({ "errors": errors });
        }

        const database = req.app.locals.db;

        const new_spawn = await SpecialSpawnService.createSpecialSpawn(database, location, longitude, latitude);

        const new_spawn_point = await DatabaseService.insertNewSpecialSpawn(database, new_spawn);

        res.status(200).json({ "special_spawn_point": new_spawn_point });
    }
    catch (error) {
        console.error(error);
    }
}