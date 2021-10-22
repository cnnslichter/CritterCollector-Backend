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

        if (player.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.error(error);
    }
}


createNewProfile = async (user_name, email) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');


    }
    catch (error) {
        console.error(error);
    }
}


updateProfile = async () => {
    // Check if animal is in player collection
    // If not, add it and initialize count to 0
    // Else if found, increment counter
}

deleteProfile = async () => {

}