const DatabaseService = require('../services/DatabaseService');
const MapOfLifeService = require('../services/MapOfLifeService');
const WikipediaService = require('../services/WikipediaService');

exports.getSpawnList = async (database, maxDistance, longitude, latitude) => {
    // TODO: EXCLUDE Special Location spawners from this check
    const maxSpawnDistance = parseInt(maxDistance);
    const coords = [parseFloat(longitude), parseFloat(latitude)];

    const spawnList = await DatabaseService.findNearestSpawns(database, maxSpawnDistance, coords);

    return spawnList;
}

exports.createSpawn = async (longitude, latitude) => {
    const coords = [parseFloat(longitude), parseFloat(latitude)];

    const animalData = await MapOfLifeService.getAnimals(longitude, latitude);

    const filteredAnimals = MapOfLifeService.filterAnimalTypes(animalData);

    const selectedAnimals = this.selectAnimals(filteredAnimals);

    const animalsWikiInfo = await WikipediaService.getAnimalsWiki(selectedAnimals);

    const newSpawn = {
        "createdAt": new Date(),    //used for expiring docs 
        "coordinates": coords,
        "animals": animalsWikiInfo
    }

    return newSpawn;
}

exports.selectAnimals = (filteredAnimals) => {
    // TODO: Add randomization so we don't get same 10 animals from particular area
    return filteredAnimals.slice(0, 10);
}