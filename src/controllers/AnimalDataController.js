const axios = require('axios')
const config = require('../config.json')
const dotenv = require('dotenv').config();
const wikiInfoCollector = require('./WikipediaInfoCollector')


exports.getAnimalDataAtLatAndLong = (req, res) => {
    try {
        this.getAnimalData(req.query.lat, req.query.long).then((data) => {
            res.status(200)
            res.send(data)
        })
    }
    catch (err) {
        res.status(404)
        res.send("ERROR: The MOL API is not online or the endpoint has changed")
    }
}

exports.getAnimalData = async (lat, long) => {
    const queryUrl =
        'https://api.mol.org/1.x/spatial/species/list?callback=angular.callbacks._2w&lang=en' +
        '&lat=' + lat +
        '&lng=' + long +
        '&radius=' + (process.env.ANIMAL_SEARCH_RADIUS || config['ANIMAL_SEARCH_RADIUS'])

    let result = await axios(queryUrl)
    var data = cleanData(result['data'])
    var parsedData = JSON.parse(data)

    if (dataIsValid(parsedData)) {
        var listOfAllAnimals = getAllAnimals(parsedData)
        const shortList = listOfAllAnimals.slice(0, 10)
        infolist = await wikiInfoCollector.getAnimalsWiki(shortList)
        return infolist
    }
    else {
        throw Exception()
    }
}

/**
 * The MOL API returns some angular callback prefix in front of
 * all json, so this is a simple substring operation to remove it.
 */
function cleanData(data) {
    data = data.substring(22)
    data = data.substring(0, data.length - 1)
    return data
}

/**
 * It seems like the MOL API only provides the "error" key if there is an error,
 * otherwise it will not be present
 */
function dataIsValid(data) {
    // they pass within an array for some reason, so we must use index 0
    return !('error' in data[0])
}

function getAllAnimals(data) {
    var listOfAllAnimals = []

    for (var animalTypeKey in data) {
        if(!config.EXCLUDED_TYPES.includes( data[animalTypeKey]['taxa'])){
            var listOfSpecies = data[animalTypeKey]['species']

            for (var speciesKey in listOfSpecies) {
                listOfAllAnimals.push({
                    "Scientific_Name": listOfSpecies[speciesKey]['scientificname'],
                    "Common_Name": listOfSpecies[speciesKey]['common']
                })
            }
        }
    }

    return listOfAllAnimals
}