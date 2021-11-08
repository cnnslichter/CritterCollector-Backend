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

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors });
        }

        const database = req.app.locals.db;
        const coordinates = [parseFloat(longitude), parseFloat(latitude)];

        let special_location = DatabaseService.findSpecialLocation(database, coordinates);        

        let location_name = (special_location.length > 0) ? special_location[0].name : "Special Location Not Found";

        res.status(200).json({ "special_location": location_name });

    } catch (error) {
        console.error(error);
    }
}