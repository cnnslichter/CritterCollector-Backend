/**
 * Finds spawn points that are near a player's location
 */
exports.findNearestSpawns = async (database, maxDistInMeters, coords) => {
    try {
        const collection = database.collection('Spawn-Points');

        //https://docs.mongodb.com/manual/reference/operator/query/near/
        //Spawn-Points collection is indexed by coordinates so we can get the nearest spawn very simply
        const nearby_spawns = await collection.find({
            coordinates: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: coords // array of [long, lat]
                    },
                    $maxDistance: maxDistInMeters
                }
            }
        }).toArray();

        return nearby_spawns;
    } catch (error) {
        throw error;
    }
}

/**
 * Currently this performs same logic as findNearestSpawns, except for special spawn points.
 * It is expected that searching for special spawn points will require different logic in the future.
 */
exports.findNearbySpecialSpawns = async (database, maxDistInMeters, coords) => {
    try {
        const collection = database.collection('Special-Spawn-Points');

        const nearby_spawns = await collection.find({
            coordinates: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: coords // array of [long, lat]
                    },
                    $maxDistance: maxDistInMeters
                }
            }
        }).toArray();

        return nearby_spawns;
    }
    catch (error) {
        throw error;
    }
}

/**
 * Queries Special-Locations collection for region that intersects the point, returns only location name
 */
exports.findSpecialLocation = async (database, coordinates) => {
    try {
        const collection = database.collection('Special-Locations');

        const special_location = await collection.find({
            region: {
                $geoIntersects: {
                    $geometry: {
                        type: "Point",
                        coordinates: coordinates // array of [long, lat]
                    }
                }
            }
        }, { projection: { _id: 0, name: 1 } }).toArray();

        return special_location;
    }
    catch (error) {
        throw error;
    }
}

/**
 * Queries only the list of animals based on the special location
 */
exports.getAnimalsFromSpecialLocation = async (database, locationName) => {
    try {
        const collection = database.collection('Special-Locations');

        const special_animals = await collection.find({
            name: { $eq: locationName }
        }, { projection: { _id: 0, "animals": 1 } }).toArray();

        return special_animals[0]?.animals ?? [];
    }
    catch (error) {
        throw error;
    }
}

exports.insertNewSpawn = async (database, newSpawn) => {
    try {
        const collection = database.collection('Spawn-Points');

        const returnedSpawn = await collection.insertOne(newSpawn);

        return returnedSpawn.ops[0];

    } catch (error) {
        throw error;
    }
}

/**
 * Inserts a new special spawn point into the database
 */
exports.insertNewSpecialSpawn = async (database, newSpawn) => {
    try {
        const collection = database.collection('Special-Spawn-Points');

        createdSpawn = await collection.insertOne(newSpawn);

        return createdSpawn.ops[0];

    } catch (error) {
        console.error(error);
    }
}