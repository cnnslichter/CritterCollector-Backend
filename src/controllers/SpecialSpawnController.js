const assert = require('assert')
const config = require('../config.json')
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient
const client = MongoClient(process.env.DB_URI || config["DB_URI"], { useNewUrlParser: true })


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

            // Create and add animal object to the animal list
            const animal = {
                Common_Name: common_name,
                Scientific_Name: scientific_name,
                Wiki_Link: "blank"
            }
            animal_list.push(animal)
            index++;
        }

        // Randomly select up to 10 animals for the spawn
        let spawn_list = await createSpecialSpawnList(animal_list);
        const new_spawn_point = await insertNewSpecialSpawn(lat, long, spawn_list);

        await client.close();
        return new_spawn_point;
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

    } catch (error) {
        console.error(error);
    }
}


// Function Testing
//console.log(checkLocation(29.642938, -82.361497)); // Should return 'Lake Alice'
//console.log(checkLocation(29.648311, -82.344291)); // Should return 'Not Found'
//console.log(createSpecialSpawner(29.642938, -82.361497, "Lake Alice")); // Create alligator special spawner at Lake Alice