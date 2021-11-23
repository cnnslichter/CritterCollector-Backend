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