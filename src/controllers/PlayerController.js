const DatabaseService = require('../services/DatabaseService');
const ValidationService = require('../services/ValidationService');
const WikipediaService = require('../services/WikipediaService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')


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

exports.logIn = async (req, res, next) => {
    let { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).end();
    }
    try {
        const database = req.app.locals.db;

        const player = await DatabaseService.findPlayerProfile(database, username);

        const playerExists = (player.length > 0) ? true : false;
        if (!playerExists) {
            return res.status(401).json({ "Successful Login": playerExists});
        }
        const pass = await DatabaseService.findPlayerPassword(database, username);
        let value = process.env.ACCESS_TOKEN
        console.log(value)
        //const accessToken = jwt.sign(player[0], process.env.ACCESS_TOKEN)
        console.log("does this print")
        if (await bcrypt.compare(password, pass[0].password)) {
            const accessToken = jwt.sign(player[0], `${process.env.ACCESS_TOKEN}`)
            //console.log(accessToken)
            res.status(200).json({ "Successful Login": accessToken });
        }
        else {res.status(401).json({ "Successful Login": !playerExists });
        }
    }
    catch (error) {
        next (error);
    }
}

/* Right now the token just lasts forever which I will to change. This will be done with REFRESH_TOKEN*/
function authenticate(req, res, next) {

    //console.log('authenticate'); This successfully gets called
    const authHeader = req.headers['authorization']
    //console.log(authHeader); This successfully gets called
    const token = authHeader && authHeader.split(' ')[1]
    //console.log(token); This successfully gets called
    if (token == null) {
        return res.sendStatus(401)
    }
        jwt.verify(token, `${process.env.ACCESS_TOKEN}`, (err, user) => {
            if (err) {
                return res.sendStatus(403)
            }
            req.user = user
            //console.log("req.user")
            //console.log(req.user)
            //next()
            //console.log(req.user.user_name)
            return req.user.user_name
        })


}
/*
 * Creates a new profile for a user, initializing their collection to 0 
 */
exports.createNewProfile = async (req, res, next) => {
    let { username, email, password } = req.body;


    if (!username || !email || !password) {
        return res.status(400).end();
    }

    try {
        [username, email, password] = ValidationService.sanitizeStrings(username, email, password);

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt)

        const database = req.app.locals.db;

        const response = await DatabaseService.insertNewPlayer(database, username, email, hashedPassword);

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

    //Why is user undefined here?
    let user = await authenticate(req, res, next);
    //console.log(req.user.user_name)
    //console.log("in deleteprofile, why isn't user printing")
    //console.log(user)
    const username = req.user.user_name

    //console.log("Does this get called")
    // let { username } = req.body;
    //
    // if (!username) {
    //     return res.status(400).end();
    // }

    try {

        //username = ValidationService.sanitizeStrings(req.user);
        //console.log(user)
        const database = req.app.locals.db;

        const response = await DatabaseService.removePlayerProfile(database, username);
        console.log('does response fulfill')
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
exports.getProfileCaughtAnimals = async (req, res, next) => {
    // let { username } = req.query;
    //
    // if (!username) {
    //     return res.status(400).end();
    // }

    let user = await authenticate(req, res, next)
    let username = req.user.user_name

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
exports.updateProfileCaughtAnimals = async (req, res, next) => {
    //let { username, common_animal, scientific_animal } = req.body;
    let { common_animal, scientific_animal } = req.body;
    let user = await authenticate(req, res, next);
    let username = req.user.user_name;


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