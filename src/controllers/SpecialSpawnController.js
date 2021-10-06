const client = MongoClient(process.env.DB_URI || config["DB_URI"], { useNewUrlParser: true })


/*
 * Checks if player latitude/longitude is within a "Special Spawn" location
 */
checkLocation = async (/* Lat/Long Parameter */) => {
    // (1) Get lat/long coordinates
    // (2) Check if lat/long falls within special spawn location
    // (3) If found, return name of Special Spawn location
    // (4) Else return Not Found
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
    // (2) If speical lcoation spawner located, return it
    // (3) Else return not found
}


/*
 * Creates a special spawner at the player location
 */
createSpecialSpawner = async(/* Lat/Long Parameter / Special Location */) => {
    // (1) Query Special Locations to get list of animals at specified Special Location
    // (2) Get Wikipedia info for animals
    // (3) Create new spawner
    // (4) Add to the database
    // NOTE: Likely similar to existing code
    // (5) Return new spawner
}


/*
 * Adds an animal to the specified special location
 */
addSpecialAnimal = async(/* Scientific Name, Common Name, Special Location*/) => {
    // (1) Verify existence of special location
    // (2) Confirm animal does not already exist at special location
    // (3) Add animal to specified Special Location collection
}