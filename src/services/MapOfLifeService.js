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

    return result.data;
}

exports.filterAnimalTypes = (animalData) => {
    var filteredAnimals = [];

    for (var animalTypeKey in animalData) {

        var animalType = animalData[animalTypeKey]['taxa'];

        if (!config.EXCLUDED_TYPES.includes(animalType)) {

            var listOfSpecies = animalData[animalTypeKey]['species'];

            for (var speciesKey in listOfSpecies) {
                filteredAnimals.push({
                    "common_name": listOfSpecies[speciesKey]['common'],
                    "scientific_name": listOfSpecies[speciesKey]['scientificname']
                });
            }
        }
    }

    return filteredAnimals;
}
