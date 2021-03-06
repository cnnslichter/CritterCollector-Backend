const DatabaseService = require('../services/DatabaseService');
const ValidationService = require('../services/ValidationService');
const WikipediaService = require('../services/WikipediaService');

/*
 * Checks if a player profile already exists in the designated data cluster. 
 */
exports.checkProfile = async (req, res, next) => {
    let { username } = req.query;

    if (!username) {
        return res.status(400).end();
    }

    try {
        username = ValidationService.sanitizeStrings(username);

        const database = req.app.locals.db;

        const player = await DatabaseService.findPlayerProfile(database, username);

        const playerExists = (player.length > 0) ? true : false;

        res.status(200).json({ "player_exists": playerExists });
    }
    catch (error) {
        next(error);
    }
}





/*
 * Creates a new profile for a user, initializing their collection to 0 
 */
exports.createNewProfile = async (req, res, next) => {
    let { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).end();
    }

    try {
        [username, email] = ValidationService.sanitizeStrings(username, email);

        const database = req.app.locals.db;

        const response = await DatabaseService.insertNewPlayer(database, username, email);

        if (response?.user_name == username) {
            return res.status(200).json({ "insert_player": "Player profile created successfully" });
        }

        res.status(422).json({ "insert_player": "Player profile not created successfully" });
    }
    catch (error) {
        next(error);
    }
}

/*
 * Deletes a user's record from the database
 */
exports.deleteProfile = async (req, res, next) => {
    let { username } = req.body;

    if (!username) {
        return res.status(400).end();
    }

    try {
        username = ValidationService.sanitizeStrings(username);

        const database = req.app.locals.db;

        const response = await DatabaseService.removePlayerProfile(database, username);

        if (response.deletedCount > 0) {
            return res.status(200).json({ "remove_profile": "Profile removed successfully" });
        }

        res.status(422).json({ "remove_profile": "Profile not removed successfully" });
    }
    catch (error) {
        next(error);
    }
}

/*
 *  Returns a list of the requested user's caught animals (and any relevant encyclopedia info). 
 */
exports.getProfileCaughtAnimals = async (req, res, next) => { //TODO: should use token authentication
    let { username } = req.query;

    if (!username) {
        return res.status(400).end();
    }

    try {
        username = ValidationService.sanitizeStrings(username);
        
        const database = req.app.locals.db;
    
        var animals = await DatabaseService.findPlayerCaughtAnimals(database, username);

        if(!Array.isArray(animals)              //if unexpected response type
        || animals.length==0                    //or if username doesn't exist in db
        || animals[0].collection.length==0) {   //or if username exists in db but they have no animals

            return res.status(200).json({ "your_animals": "No animals were found for the requested account."})

        }
        
        animals = animals[0].collection;

        const animalsInfo = await WikipediaService.getProfileAnimalsWiki(animals);
        
        res.status(200).json({
            "your_animals": animalsInfo
        });

    }
    catch (error) {
        next(error);
    }
}

/*
 * Adds a new animal to a user's collection or increments the counter if it
 * already exists.
 */
exports.updateProfileCaughtAnimals = async (req, res, next) => { //TODO: should use token authentication
    let { username, common_animal, scientific_animal } = req.body;

    if (!username || !common_animal || !scientific_animal) {
        return res.status(400).end();
    }

    try {
        [username, common_animal, scientific_animal] = ValidationService.sanitizeStrings(username, common_animal, scientific_animal);

        const database = req.app.locals.db;

        const foundAnimal = await DatabaseService.findAnimalInProfile(database, username, common_animal, scientific_animal);

        var response;

        if (foundAnimal.length > 0) {
            response = await DatabaseService.updatePlayerAnimalCount(database, username, foundAnimal[0]);
        }
        else {
            response = await DatabaseService.insertAnimalInProfile(database, username, common_animal, scientific_animal);
        }

        if (response.modifiedCount > 0) {
            return res.status(200).json({ "update_profile": "Player profile updated successfully" });
        }

        res.status(422).json({ "update_profile": "Player profile not updated successfully" });
    }
    catch (error) {
        next(error);
    }

}