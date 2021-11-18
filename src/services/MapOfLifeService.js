const config = require('../config.json');
const dotenv = require('dotenv').config();
const axios = require('axios');

exports.getAnimals = async (longitude, latitude) => {
    const queryUrl =
        'https://api.mol.org/1.x/spatial/species/list?lang=en' +
        '&lat=' + latitude +
        '&lng=' + longitude +
        '&radius=' + (process.env.ANIMAL_SEARCH_RADIUS || config['ANIMAL_SEARCH_RADIUS']);

    let result = await axios.get(queryUrl);

    if (this.dataIsValid(result)) {
        return result;
    }
    else {
        throw new Error("Problem with MOL API Call");
    }
}

exports.filterAnimalTypes = (animalData) => {
    var filteredAnimals = [];

    for (var animalTypeKey in animalData) {

        var animalType = animalData[animalTypeKey]['taxa'];

        if (!config.EXCLUDED_TYPES.includes(animalType)) {

            var listOfSpecies = animalData[animalTypeKey]['species'];

            for (var speciesKey in listOfSpecies) {
                filteredAnimals.push({
                    "Common_Name": listOfSpecies[speciesKey]['common'],
                    "Scientific_Name": listOfSpecies[speciesKey]['scientificname']
                });
            }
        }
    }

    return filteredAnimals;
}

/**
 * The MOL API only provides the "error" key if there is an error,
 * otherwise it will not be present
 */
exports.dataIsValid = (data) => {
    // Response from the MOL API is an array of objects.
    // The first object in the array will hold an error code and error message if there is a problem with the request.
    if (data && Array.isArray(data)) {
        return !('error' in data[0]);
    }
    return false;
}