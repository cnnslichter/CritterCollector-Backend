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
        
        var listOfAllAnimals = getAllAnimals(parsedData);
        res.send(listOfAllAnimals);
    });
}

function cleanData(data) {
    // Removing weird angular callback string that precedes the json.
    // There is probably a nicer way to do this.
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