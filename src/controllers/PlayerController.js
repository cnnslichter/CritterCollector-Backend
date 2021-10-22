const assert = require('assert')
const config = require('../config.json')
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient
const client = MongoClient(process.env.DB_URI || config["DB_URI"], { useNewUrlParser: true })

/*
 * Checks if a player profile already exists in the designated data cluster. 
 */
checkProfile = async (user_name_) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');

        // Queries Player-Profiles cluster for matching user names, returns only user name
        let player = await database.collection('Player-Profiles').find({
            user_name: user_name_
        }, {projection: { _id: 0, user_name: 1 }}).toArray();

        await client.close();

        return (player.length > 0) ? true : false;
    }
    catch (error) {
        console.error(error);
    }
}


/*
 * Creates a new profile for a user, initializing their collection to 0 
 */
createNewProfile = async (user_name_, email_) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');
        const collection = database.collection('Player-Profiles');

        // Initializes profile with desired user name, email, and empty collection
        const newProfile = {
            "user_name": user_name_,
            "user_email": email_,
            "collection": []
        }

        createdProfile = await collection.insertOne(newProfile);

        await client.close();
        return createdProfile.ops[0];
    }
    catch (error) {
        console.error(error);
    }
}

//createNewProfile("Nick_Username", "Nick@ufl.edu");

updateProfile = async () => {
    // Check if animal is in player collection
    // If not, add it and initialize count to 0
    // Else if found, increment counter
}

deleteProfile = async () => {

}