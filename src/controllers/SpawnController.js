const assert = require('assert')
const axios = require('axios')
const config = require('../config.json')
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient
const wikiInfoCollector = require('./WikipediaInfoCollector')
const client = MongoClient(process.env.DB_URI || config["DB_URI"], { useNewUrlParser: true })

exports.findSpawner = async (req, res) => {
    await client.connect()
    console.log("Connected successfully to Mongo server")
    try {
        const MAX_SPAWN_DISTANCE = parseInt(req.query.max_dist) || 10000
        const coords = [parseFloat(req.query.long), parseFloat(req.query.lat)]
        const spawnList = await findNearestSpawns(MAX_SPAWN_DISTANCE, coords)
        if (spawnList.length == 0) {
            res.status(200)
            res.send("Spawner Not Found");
        } else {
            res.status(200)
            res.send(spawnList)
        }
    } catch (error) {
        console.log(error)
    }
}

exports.createSpawner = async (req, res) => {
    await client.connect()

    try {
        let data = await getAnimalData(req.query.lat, req.query.long)
        const newSpawn = {
            "createdAt": new Date(),    //used for expiring docs 
            "coordinates": coords,
            "Animals": data
        }
        const insertedSpawn = await insertNewSpawn(newSpawn)
        res.status(200)
        res.send(insertedSpawn)
    } catch (error) {
        console.log(error)
    }
}

findNearestSpawns = async (maxDist /*in meters*/, coords) => {

    try {
        const database = client.db('Animal-Game')
        const collection = database.collection('Spawn-Points')

        //https://docs.mongodb.com/manual/reference/operator/query/near/
        //db is indexed by coordinates so we can get the nearest spawn very simply
        const nearby_spawns = await collection.find({
            coordinates: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: coords // array of [long, lat]
                    },
                    $maxDistance: maxDist //in meters
                }
            }
        }).toArray()
        return nearby_spawns
    } catch (e) {
        // console.log(e)
        throw e
    }
}

getAnimalData = async (lat, long) => {
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
        if (!config.EXCLUDED_TYPES.includes(data[animalTypeKey]['taxa'])) {
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

insertNewSpawn = async (document) => {
    try {
        const database = client.db('Animal-Game')
        const collection = database.collection('Spawn-Points')

        x = await collection.insertOne(document)
        assert.strictEqual(1, x.insertedCount)
        return x.ops[0]

    } catch (e) {
        // console.log()
        throw (e)
    }
}