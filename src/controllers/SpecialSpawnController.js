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
 *
 * To Do: 
 *      - Need to account for Wikipedia page
 */
createSpecialSpawner = async(lat, long, location) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');

        // Queries only the list of animals based on the special location
        let special_animals = await database.collection('Special-Locations').find({
            name: { $eq: location }
        }, { projection: { _id : 0, "animals" : 1 }}).toArray();

        // Converts the document's animal list into an array
        index = 0;
        animal_list = [];
        while (special_animals[0].animals[index] != undefined) {
            let scientific_name = special_animals[0].animals[index].scientific_name;
            let common_name = special_animals[0].animals[index].common_name;
            // Placeholder for Wikipedia page

            animal_list.push([scientific_name, common_name])
            index++;
        }

        // Randomly select up to 10 animals for the spawn
        let spawn_list = await createSpecialSpawnList(animal_list);
        const new_spawn_point = await insertNewSpecialSpawn(lat, long, spawn_list);

        /*
         * Will need to figure out how to handle returning the new spawn point
         */

        await client.close();
        return spawn_list
    }
    catch (error) {
        console.error(error);
    }
}


/*
 * Retrieves the Wikipedia link for the specific animal (scientific name)
 */
getWikiLink = async (scientific_name) => {
    // This needs to be filled out if we cannot use getInfo from WikipediaInfoCollector.js
}


/*
 * Creates a list of 1-10 animals to spawn at a special location
 */
createSpecialSpawnList = async (animal_list) => {
    console.log(animal_list);
    const MAX_LENGTH = 10;
    const spawn_list = [];
    const list_length = animal_list.length;

    // Generates a randomized list of no more than 10 animals
    while (spawn_list.length < Math.min(list_length, MAX_LENGTH)) {
        let index = Math.floor(Math.random() * animal_list.length);
        spawn_list.push(animal_list[index]);
        animal_list.splice(index, 1);
    }
    console.log("Test:");
    console.log(spawn_list);
    
    return spawn_list;
}


/*
 * Inserts a new special spawn point into the database
 */
insertNewSpecialSpawn = async (lat, long, spawn_list) => {
    try {
        const database = client.db('Animal-Game');
        const collection = database.collection('Special-Spawn-Points');

        const newSpawn = {
            "createdAt": new Date(),
            "coordinates": [lat, long],
            "Animals": spawn_list
        }

        createdSpawn = await collection.insertOne(newSpawn);
        
        return createdSpawn.ops[0];

        //console.log(spawn_list);
        /*  
         * This needs to be filled out - also need to determine how to handle document input into MongoDB
         * This part may look a bit different from the one in SpawnController.js
         */
    } catch (error) {
        console.error(error);
    }
}


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
console.log(createSpecialSpawner(29.642938, -82.361497, "Lake Alice")); // Create alligator special spawner at Lake Alice