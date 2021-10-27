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
exports.checkLocation = async (req, res) => {
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
                        coordinates: [req.query.lat, req.query.long]
                    }
                }
            }
        }, { projection: { _id: 0, name: 1 } }).toArray();

        let location_name = (special_location.length > 0) ? special_location[0].name : "Not Found";
        console.log(`Special location: ${location_name}`);
        await client.close();

        return location_name;
    } catch (error) {
        console.error(error);
    }
}

addSpecialLocation = async (location, coordinates) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');

        const newLocation = {
            "name": location,
            "region": {
                "type": "Polygon",
                "coordinates": [coordinates]
            },
            "animals": []
        }

        await database.collection('Special-Locations').insertOne(newLocation);

        await client.close();
        return;
    }
    catch (error) {
        console.error(error);
    }
}

//addSpecialLocation('UF CISE Building', [[29.649661, -82.344315], [29.649642, -82.343570], [29.648682, -82.343588], [29.648689, -82.344771], [29.649661, -82.344315]])

// Add animal to special spawn location
addSpecialAnimal = async (location, scientific_animal, common_animal) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');

        // Checks if an animal already exists at the special location
        let animal_exists = await database.collection('Special-Locations').find({
            name: location,
            animals: { $elemMatch: {
                scientific_name: scientific_animal,
                common_name: common_animal
            } }
        }).toArray();

        if (animal_exists.length > 0) {
            // Returned record indicates animal already exists for location
            await client.close();
            return "Animal was already added.";
        }
        else {
            // Updates the location record with the new animal
            const query = {
                name: location
            };

            const newAnimal = {
                $push: {
                    animals: {
                        scientific_name: scientific_animal,
                        common_name: common_animal
                    }
                }
            };

            await database.collection('Special-Locations').updateOne(query, newAnimal);
        }

        await client.close();
        return "Animal added.";
    }
    catch (error) {
        console.error(error);
    }
}

//addSpecialAnimal('UF CISE Building', 'Uffes Professorus', 'UF Professor');

// Remove animal from special spawn location
removeSpecialAnimal = async(location, scientific_animal) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');

        // Checks if animal already exists at special location
        let animal_exists = await database.collection('Special-Locations').find({
            name: location,
            animals: { $elemMatch: {
                scientific_name: scientific_animal
            } }
        }).toArray(); 

        if (animal_exists.length > 0) {
            // Removes the animal at the special location
            const query = {
                name: location
            };

            const delAnimal = {
                $pull: {
                    animals: {
                        scientific_name: scientific_animal
                    }
                }
            }

            await database.collection('Special-Locations').updateOne(query, delAnimal);
        }
        else {
            console.log("hi");
            // No animal_exist array indicates animal does not exist
            await client.close();
            return "Animal does not exist at special location.";
        }
        console.log("hi2");

        await client.close();
        return "Animal removed.";
    }
    catch (error) {
        console.error(error);
    }
}

//removeSpecialAnimal('UF CISE Building', 'Uffes Professorus');

// Remove special spawn location
removeSpecialLocation = async (location) => {
    await client.connect();

    try {
        const query = { name: location };

        await client.db('Animal-Game').collection('Special-Locations').deleteOne(query);

        await client.close();
    }
    catch (error) {
        console.error(error);
    }
}

//removeSpecialLocation('Test Delete');