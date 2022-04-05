const DatabaseService = require('../services/DatabaseService');
const WikipediaService = require('../services/WikipediaService');
const SpawnService = require('../services/SpawnService');

exports.getNearbySpecialSpawners = async (database, maxDistance, longitude, latitude) => {
    const maxSpecialSpawnDistance = parseInt(maxDistance);
    const coords = [parseFloat(longitude), parseFloat(latitude)];

    const specialSpawns = await DatabaseService.findNearbySpecialSpawns(database, maxSpecialSpawnDistance, coords);

    return specialSpawns;
}

exports.createSpecialSpawn = async (database, locationName, longitude, latitude) => {
    const coords = [parseFloat(longitude), parseFloat(latitude)];

    const specialAnimals = await DatabaseService.findAllAnimalsAtSpecialLocation(database, locationName);

    const selectedAnimals = SpawnService.selectAnimals(specialAnimals);

    const newSpawn = {
        "createdAt": new Date(),    //used for expiring docs 
        "coordinates": coords,
        "animals": selectedAnimals
    }

    return newSpawn;
}