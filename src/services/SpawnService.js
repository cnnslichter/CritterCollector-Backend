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

/**
 * Randomly selects from the input list to create a new list of 1-10 animals
 */
exports.selectAnimals = (animal_list) => {
    const MAX_LENGTH = 10;
    const spawn_list = [];
    const list_length = animal_list.length;
    const temp_list = [...animal_list];

    // Generates a randomized list of no more than 10 animals
    while (spawn_list.length < Math.min(list_length, MAX_LENGTH)) {
        let index = Math.floor(Math.random() * temp_list.length);
        spawn_list.push(temp_list[index]);
        temp_list.splice(index, 1);
    }

    return spawn_list;
}