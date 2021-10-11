const assert = require('assert')
const config = require('../config.json')
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient
const animalDataController = require('./AnimalDataController')
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
        let data = await animalDataController.getAnimalData(req.query.lat, req.query.long)
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