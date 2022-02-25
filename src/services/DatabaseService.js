/**
 * Finds spawn points that are near a player's location, returns the spawn points in an array
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
 * Finds all animals at a specificied special location and returns the animals in an array
 */
exports.findAllAnimalsAtSpecialLocation = async (database, locationName) => {
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

/**
 * Finds a single animal at a specified special location and returns that animal in an array
 */
exports.findAnimalAtSpecialLocation = async (database, location, scientificName) => {
    try {
        const collection = database.collection('Special-Locations');

        const animal_match = await collection.find({
            name: location,
            animals: {
                $elemMatch: {
                    Scientific_Name: scientificName
                }
            }
        }, { projection: { _id: 0, "animals.$": 1 } }).toArray();

        return animal_match[0]?.animals ?? [];

    } catch (error) {
        throw error;
    }
}

/**
 * Finds a player profile if the username exists and returns the username
 */
exports.findPlayerProfile = async (database, username) => {
    try {
        const collection = database.collection('Player-Profiles');

        const player = await collection.find({
            user_name: username
        }, { projection: { _id: 0, user_name: 1 } }).toArray();

        return player;

    } catch (error) {
        throw error;
    }
}

exports.findPlayerPassword = async (database, username) => {
    try {
        const collection = database.collection('Player-Profiles');

        const pass = await collection.find({
            user_name: username
        }, { projection: { _id: 0, username: 1, password: 2} }).toArray();

        return pass;
    } catch (error) {
        throw error;
    }
}

/**
 * Queries Player-Profiles collection for existence of animal in user document and returns that animal in an array
 */
exports.findAnimalInProfile = async (database, username, commonName, scientificName) => {
    try {
        const collection = database.collection('Player-Profiles');

        let animal = await collection.find({
            user_name: username,
            collection: {
                $elemMatch: {
                    Common_Name: commonName,
                    Scientific_Name: scientificName
                }
            }
        }, { projection: { _id: 0, 'collection.$': 1 } }).toArray();

        return animal[0]?.collection ?? [];

    } catch (error) {
        throw error;
    }
}

/**
 * Inserts a new regular spawn point into the Spawn-Points collection
 */
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
 * Inserts a new special spawn point into the Special-Spawn-Points collection
 */
exports.insertNewSpecialSpawn = async (database, newSpawn) => {
    try {
        const collection = database.collection('Special-Spawn-Points');

        const createdSpawn = await collection.insertOne(newSpawn);

        return createdSpawn.ops[0];

    } catch (error) {
        throw error;
    }
}

/**
 * Inserts a new special location into the Special-Locations collection
 */
exports.insertNewSpecialLocation = async (database, locationName, coordinates, animals) => {
    try {
        const collection = database.collection('Special-Locations');

        const newLocation = {
            "name": locationName,
            "region": {
                "type": "Polygon",
                "coordinates": coordinates
            },
            "animals": animals
        }

        const createdLocation = await collection.insertOne(newLocation);

        return createdLocation.ops[0];

    } catch (error) {
        throw error;
    }
}

/**
 * Inserts a new special animal into a specified special location
 */
exports.insertSpecialAnimal = async (database, location, commonName, scientificName) => {
    try {
        const collection = database.collection('Special-Locations');

        const query = {
            name: location
        };

        const newAnimal = {
            $push: {
                animals: {
                    Common_Name: commonName,
                    Scientific_Name: scientificName
                }
            }
        };

        const response = await collection.updateOne(query, newAnimal);

        const result = {
            "modifiedCount": response.modifiedCount,
            "matchedCount": response.matchedCount
        }

        return result;

    } catch (error) {
        throw error;
    }
}

/**
 * Initializes player profile with desired user name, email, and empty collection
 */
exports.insertNewPlayer = async (database, username, email, password) => {
    try {
        const collection = database.collection('Player-Profiles');

        const newProfile = {
            "user_name": username,
            "user_email": email,
            //adding password here, see if anything happens
            "password": password,
            "collection": []
        }

        const createdProfile = await collection.insertOne(newProfile);

        return createdProfile.ops[0];

    } catch (error) {
        throw error;
    }
}

/**
 * Adds a new animal to a specified player's profile
 */
exports.insertAnimalInProfile = async (database, username, commonName, scientificName) => {
    try {
        const collection = database.collection('Player-Profiles');

        const query = { user_name: username };

        const newValue = {
            $push: {
                collection: {
                    Common_Name: commonName,
                    Scientific_Name: scientificName,
                    count: 1
                }
            }
        };

        const response = await collection.updateOne(query, newValue);

        const result = {
            "modifiedCount": response.modifiedCount,
            "matchedCount": response.matchedCount
        }

        return result;

    } catch (error) {
        throw error;
    }
}

/**
 * Increments a counter for an animal that already exists in the user's profile
 */
exports.updatePlayerAnimalCount = async (database, username, animal) => {
    try {
        const collection = database.collection('Player-Profiles');

        const query = {
            user_name: username,
            collection: {
                $elemMatch: {
                    Common_Name: animal.Common_Name,
                    Scientific_Name: animal.Scientific_Name
                }
            }
        };

        const newValue = {
            $inc: { 'collection.$.count': 1 }
        };

        const response = await collection.updateOne(query, newValue);

        const result = {
            "modifiedCount": response.modifiedCount,
            "matchedCount": response.matchedCount
        }

        return result;

    } catch (error) {
        throw error;
    }
}

/**
 * Deletes a specified special location from the Special Locations collection
 */
exports.removeSpecialLocation = async (database, locationName) => {
    try {
        const collection = database.collection('Special-Locations');

        const query = { name: locationName };

        const response = await collection.deleteOne(query);

        return { "deletedCount": response.deletedCount };

    } catch (error) {
        throw error;
    }
}

/**
 * Deletes an animal from a special location in the Special Locations collection
 */
exports.removeSpecialAnimal = async (database, locationName, scientificName) => {
    try {
        const collection = database.collection('Special-Locations');

        const query = {
            name: locationName
        };

        const delAnimal = {
            $pull: {
                animals: {
                    Scientific_Name: scientificName
                }
            }
        };

        const response = await collection.updateOne(query, delAnimal);

        const result = {
            "modifiedCount": response.modifiedCount,
            "matchedCount": response.matchedCount
        }

        return result;

    } catch (error) {
        throw error;
    }
}

/**
 * Removes a player profile from the Player Profiles collection
 */
exports.removePlayerProfile = async (database, username) => {
    try {
        const collection = database.collection('Player-Profiles');

        const query = { user_name: username };

        const response = await collection.deleteOne(query);

        return { "deletedCount": response.deletedCount };

    } catch (error) {
        throw error;
    }
}