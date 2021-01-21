const axios = require('axios');
const config = require('../config.json')


exports.getAnimalDataAtLatAndLong = (req, res) => {
    const queryUrl = 
        'https://api.mol.org/1.x/spatial/species/list?callback=angular.callbacks._2w&lang=en' + 
        '&lat=' + req.query.lat +
        '&lng=' + req.query.long +
        '&radius=' + config['ANIMAL_SEARCH_RADIUS'];

    axios.get(queryUrl).then(result => {
        var data = cleanData(result['data']);
        var parsedData = JSON.parse(data);

        if (validData(parsedData)) {
            var listOfAllAnimals = getAllAnimals(parsedData);
            res.send(listOfAllAnimals);
        }
        else {
            res.send("ERROR: Invalid request made.")
        }
    });
}

/**
 * The MOL API returns some angular callback prefix in front of
 * all json, so this is a simple substring operation to remove it.
 */
function cleanData(data) {
    data = data.substring(22)
    data = data.substring(0, data.length - 1)
    return data;
}

function getAllAnimals(data) {
    var listOfAllAnimals = [];

    for (var animalTypeKey in data) {
        var listOfSpecies = data[animalTypeKey]['species'];
        
        for(var speciesKey in listOfSpecies) {
            var scientificName = listOfSpecies[speciesKey]['scientificname']
            listOfAllAnimals.push(scientificName);
        }
    }

    return listOfAllAnimals;
}

/**
 * It seems like the API only provides the "error" key if there is an error,
 * otherwise it will not be present
 */
function validData(data) {
    // they pass within an array for some reason, so we must use index 0
    return !('error' in data[0]);
}