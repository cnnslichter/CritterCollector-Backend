const assert = require('assert')
const config = require('../config.json')
const MongoClient = require('mongodb').MongoClient
const animalDataController = require('./AnimalDataController')
const client = MongoClient(config["DB_URI"], { useNewUrlParser: true })


exports.getNearbySpawn = async (req, res) => {
    await client.connect()
    console.log("Connected successfully to server")
    try {
        coords = [parseInt(req.query.long), parseInt(req.query.lat)]
        spawnList = await findNearestSpawns(10000, coords)
        if (spawnList.length == 0) {
            //stole this from animal data controller. Maybe that doesn't need to be a route function anymore
            data = await animalDataController.getAnimalData(req.query.lat, req.query.long)
            data = data.slice(0, 10)
            newSpawn = {
                "coordinates": coords,
                "Animals": data
            }
            insertedSpawn = await insertNewSpawn(newSpawn)
            res.status(200)
            res.send(insertedSpawn)
        } else {
            res.status(200)
            res.send(spawnList)
        }
    } catch (error) {
        console.log(error)
    }
}

cleanData = (data) => {
    data = data.substring(22)
    data = data.substring(0, data.length - 1)
    return data
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

/* EXAMPLE FORMAT
    {
        coordinates: [27, 52],
        Animals: ['Doggo', 'Catto', "frogman"]
    }
*/
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

/*
//testing
client.connect(function (err) {
    console.log("Connected successfully to server")
    try {
        insertNewSpawn()
        findNearestSpawn(100000000)
    } catch (error) {
        console.log(error)
    } finally {
        client.close() //important to close after operation

    }
})
*/


/* Figuring out how we wanna do spawns

Spawn Point DB Structure
    - lat-long
    - expiration
    - array for animals to spawn in spawn order (max. 10)

When player hits api, we check db for near spawn

    IF no nearby spawn exist (decide threshold)
        - we create one near them current location and push it to db
            - maybe also send spawn points around the city/county
    ELSE
        - we send player existing spawn point(s)

If 2 people are in the same location at the same time they should see the same animals
If they play at different times but the spawn point hasn't expired, they should see the same SET of animals
*/
