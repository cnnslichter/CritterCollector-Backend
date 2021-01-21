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

        if (dataIsValid(parsedData)) {
            var listOfAllAnimals = getAllAnimals(parsedData);
            
            res.status(200);
            res.send(listOfAllAnimals);
        } 
        else {
            res.status(400);
            res.send("ERROR: The coordinates you provided are not valid");
        }
    })
    .catch(err => {
        res.status(404);
        res.send("ERROR: The MOL API is not online or the endpoint has changed");
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

/**
 * It seems like the MOL API only provides the "error" key if there is an error,
 * otherwise it will not be present
 */
function dataIsValid(data) {
    // they pass within an array for some reason, so we must use index 0
    return !('error' in data[0]);
}

function getAllAnimals(data) {
    var listOfAllAnimals = [];

    for (var animalTypeKey in data) {
        var listOfSpecies = data[animalTypeKey]['species'];
        
        for(var speciesKey in listOfSpecies) {
            listOfAllAnimals.push({
                "Scientific_Name": listOfSpecies[speciesKey]['scientificname'],
                "Common_Name": listOfSpecies[speciesKey]['common']
            });
        }
    }

    return listOfAllAnimals;
}