const DatabaseService = require('../services/DatabaseService');
const ValidationService = require('../services/ValidationService');

/*
 * Checks if player latitude/longitude is within a "Special Spawn" location
 *
 * To Do:
 *      - Consider necessity of array (can special locations overlap?)
 *      - Do we want to integrate $maxDistance so user does not have to be IN the lake/special location?
 */
exports.checkLocation = async (req, res) => {

    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
        return res.status(400).end();
    }

    try {
        const errors = ValidationService.checkCoordinates(longitude, latitude);

        if (errors.length > 0) {
            return res.status(422).json({ errors: errors });
        }

        const database = req.app.locals.db;
        const coordinates = [parseFloat(longitude), parseFloat(latitude)];

        let special_location = await DatabaseService.findSpecialLocation(database, coordinates);

        let location_name = (special_location.length > 0) ? special_location[0].name : "Special Location Not Found";

        res.status(200).json({ "special_location": location_name });

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