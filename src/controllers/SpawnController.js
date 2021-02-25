const config = require('../config.json')
const MongoClient = require('mongodb').MongoClient
const client = new MongoClient(config["DB_URI"])

exports.findNearestSpawn = (maxDist, coords) => {
    try {
        const database = client.db('Animal-Game')
        const collection = database.collection('Spawn-Points')

        //https://docs.mongodb.com/manual/reference/operator/query/near/
        //db is indexed by coordinates so we can get the nearest spawn very simply
        collection.find({
            coordinates: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: coords // array of [long, lat]
                    },
                    $maxDistance: maxDist //in meters
                }
            }
        }).toArray(function (err, docs) {
            // console.log(docs)
            return docs
        })
    } catch (e) {
        // console.log()
        throw e
    }
}

/* EXAMPLE SPAWN DOC
    {
        coordinates: [27, 52],
        Animals: ['Doggo', 'Catto', "frogman"]
    }
*/
exports.insertNewSpawn = (document) => {
    try {
        const database = client.db('Animal-Game')
        const collection = database.collection('Spawn-Points')

        collection.insertOne(document)

        //TODO: Assert the insert worked

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
