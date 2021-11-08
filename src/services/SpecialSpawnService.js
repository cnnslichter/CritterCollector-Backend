const DatabaseService = require('../services/DatabaseService');
const WikipediaService = require('../services/WikipediaService');

exports.getNearbySpecialSpawners = async (database, maxDistance, longitude, latitude) => {
    const maxSpecialSpawnDistance = parseInt(maxDistance);
    const coords = [parseFloat(longitude), parseFloat(latitude)];

    const specialSpawns = await DatabaseService.findNearbySpecialSpawns(database, maxSpecialSpawnDistance, coords);

    return specialSpawns;
}

exports.createSpecialSpawn = async (database, locationName, longitude, latitude) => {
    const coords = [parseFloat(longitude), parseFloat(latitude)];

    const specialAnimals = await DatabaseService.getAnimalsFromSpecialLocation(database, locationName);

    const selectedAnimals = this.selectSpecialAnimals(specialAnimals);

    const animalsWikiInfo = await WikipediaService.getAnimalsWiki(selectedAnimals);

    const newSpawn = {
        "createdAt": new Date(),    //used for expiring docs 
        "coordinates": coords,
        "Animals": animalsWikiInfo
    }

    return newSpawn;
}

/**
 * Creates a list of 1-10 animals to spawn at a special location
 */
exports.selectSpecialAnimals = (animal_list) => {
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