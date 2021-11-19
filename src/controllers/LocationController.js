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

exports.addSpecialLocation = async (req, res) => {

    let { location, coordinates, animals } = req.body;

    if (!location || !coordinates || !animals) {
        return res.status(400).end();
    }

    try {
        location = ValidationService.sanitizeStrings(location);

        var errors = ValidationService.checkPolygonCoordinates(coordinates);
        errors = ValidationService.checkAnimalArray(animals, errors);

        if (errors.length > 0) {
            return res.status(422).json({ errors: errors });
        }

        const database = req.app.locals.db;

        const insertedLocation = await DatabaseService.insertNewSpecialLocation(database, location, coordinates, animals);

        res.status(200).json({ "new_location": insertedLocation });
    }
    catch (error) {
        console.error(error);
    }
}


// Remove special spawn location
exports.removeSpecialLocation = async (req, res) => {
    let { location } = req.body;

    if (!location) {
        return res.status(400).end();
    }

    try {
        const database = req.app.locals.db;

        location = ValidationService.sanitizeStrings(location);

        const response = await DatabaseService.removeSpecialLocation(database, location);

        if (response.deletedCount > 0) {
            return res.status(200).json({ "location_removed": "Special location removed successfully" });
        }
        else {
            return res.status(422).json({ "location_removed": "Special location not removed successfully" });
        }
    }
    catch (error) {
        console.error(error);
    }
}