const DatabaseService = require('../services/DatabaseService');
const ValidationService = require('../services/ValidationService');

/*
* Adds an animal to the specified special location
*/
exports.addSpecialAnimal = async (req, res) => {
    let { location, common_animal, scientific_animal } = req.body;

    if (!location || !common_animal || !scientific_animal) {
        return res.status(400).end();
    }

    try {
        [location, common_animal, scientific_animal] = ValidationService.sanitizeStrings(location, common_animal, scientific_animal);

        const database = req.app.locals.db;

        // Checks if an animal already exists at the special location
        let animal_exists = await DatabaseService.findAnimalAtSpecialLocation(database, location, scientific_animal);


        if (animal_exists.length > 0) {
            // Returned record indicates animal already exists for location
            return res.status(409).json({ "add_animal": "Animal already exists at this location" });
        }

        const response = await DatabaseService.insertSpecialAnimal(database, location, common_animal, scientific_animal);

        if (response.modifiedCount > 0) {
            return res.status(200).json({ "add_animal": "Animal added successfully" });
        }

        res.status(422).json({ "add_animal": "Animal not added successfully" });
    }
    catch (error) {
        console.error(error);
    }
}


// Remove animal from special spawn location
exports.removeSpecialAnimal = async (req, res) => {
    let { location, scientific_animal } = req.body;

    if (!location || !scientific_animal) {
        return res.status(400).end();
    }

    try {
        [location, scientific_animal] = ValidationService.sanitizeStrings(location, scientific_animal);

        const database = req.app.locals.db;

        // Checks if animal already exists at special location
        let animal_exists = await DatabaseService.findAnimalAtSpecialLocation(database, location, scientific_animal);

        if (animal_exists.length == 0) {
            // No animal_exist array indicates animal does not exist
            return res.status(409).json({ "remove_animal": "Animal does not exist at special location" });
        }

        // Removes the animal at the special location
        const response = await DatabaseService.removeSpecialAnimal(database, location, scientific_animal);

        if (response.modifiedCount > 0) {
            return res.status(200).json({ "remove_animal": "Animal removed successfully" });
        }

        res.status(422).json({ "remove_animal": "Animal not removed successfully" });
    }
    catch (error) {
        console.error(error);
    }
}
