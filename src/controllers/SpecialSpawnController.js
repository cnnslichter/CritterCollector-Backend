const assert = require('assert')
const config = require('../config.json')
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient
const client = MongoClient(process.env.DB_URI || config["DB_URI"], { useNewUrlParser: true })

/*
 * Checks if player latitude/longitude is within a "Special Spawn" location
 *
 * To Do:
 *      - Update parameters to fit server request
 *      - Consider necessity of array (can special locations overlap?)
 *      - May want to remove 'await client.close()' when done using locally
 *      - Do we want to integrate $maxDistance so user does not have to be IN the lake/special location?
 */
checkLocation = async (lat, long) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');

        // Queries Special-Spawn-Points cluster for region that intersects the point, returns only location name
        console.log("Finding special location...");
        let special_location = await database.collection('Special-Locations').find({
            region: {
                $geoIntersects: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lat, long]
                    }
                }
            }
        }, { projection: { _id : 0, name: 1 }}).toArray();
        
        let location_name = (special_location.length > 0) ? special_location[0].name : "Not Found";
        console.log(`Special location: ${location_name}`);
        await client.close();

        return location_name;
    } catch (error) {
        console.error(error);
    }
}


/*
 * Finds the location of a nearby non-special spawner
 */
findSpawner = async (/* Lat/Long Parameter */) => {
    // (1) Model after findNearestSpawns in ./SpawnController.js
    // NOTE: EXCUDE Special Location spawners from this check
    // (2) If spawner found, return it
    // (3) Else return Not Found
}


/*
 * Creates a spawner at the player location
 */
createSpawner = async (/* Lat/Long Parameter */) => {
    // (1) Query MoL API and add a new spawner to the database
    //  NOTE: Similar to: if (spawnList.length == 0) from getNearbySpawn in ./SpawnController
    // (2) Return new spawner
}


/* 
 * Finds the location of a nearby special spawner
 */
findSpecialSpawner = async (/* Lat/Long Parameter / Special Location */) => {
    // (1) Looks for special location spawner within radius of player - the spawner must also be within boundaries of special location
    // NOTE: Can include specified or default radius
    // (2) If special lcoation spawner located, return it
    // (3) Else return not found
}


/*
 * Creates a special spawner at the player location
 */
createSpecialSpawner = async(lat, long, location) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');
        //const dest_collection = database.collection('Special-Spawn-Points');

        let animals = await database.collection('Special-Locations').find({
            name: { $eq: location }
        //}/*, { projection: { _id : 0, animals : 1 }}*/).toArray();
        }, { projection: { _id : 0, "animals" : 1 }}).toArray();
        console.log(`Length: ${animals.length}`)
        console.log(animals[0])


        // let animals2 = database.collection('Special-Locations').aggregate([
        //     { $match: { name: location } }
        // ]);
        // console.log(`Length2: ${animals2}`)
        //console.log(animals2[0])
        
        //console.log(animals[0])

        await client.close();

        return animals
    }
    catch (error) {
        console.error(error);
    }

    // (1) Query Special Locations to get list of animals at specified Special Location
    // (2) Get Wikipedia info for animals
    // (3) Create new spawner
    // (4) Add to the database
    // NOTE: Likely similar to existing code
    // (5) Return new spawner
}

// Create alligator special spawner at Lake Alice
console.log(createSpecialSpawner(29.642938, -82.361497, "Lake Alice"));

/*
 * Adds an animal to the specified special location
 */
addSpecialAnimal = async(/* Scientific Name, Common Name, Special Location*/) => {
    // (1) Verify existence of special location
    // (2) Confirm animal does not already exist at special location
    // (3) Add animal to specified Special Location collection
}


// Function Testing
//console.log(checkLocation(29.642938, -82.361497)); // Should return 'Lake Alice'
//console.log(checkLocation(29.648311, -82.344291)); // Should return 'Not Found'