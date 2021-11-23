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


/*
 * Adds a new animal to a user's collection or increments the counter if it
 * already exists.
 */
updateProfile = async (user_name_, scientific_animal_, common_animal_) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');

        // Queries Player-Profiles cluster for existence of animal in user collection
        let record = await database.collection('Player-Profiles').find({
            user_name: user_name_,
            collection: { $elemMatch: { 
                scientific_name: scientific_animal_,
                common_name: common_animal_ 
            } }
        }, { projection: { _id : 1, 'collection' : 1 }}).toArray();

        if (record.length > 0) {
            // Increments a counter for an animal that exists in the user's collection
            const query = { 
                _id: record[0]._id,
                collection: { $elemMatch: {
                    scientific_name: scientific_animal_,
                    common_name: common_animal_
                } } 
            };

            const newValue = {
                $inc: { 'collection.$.count': 1 }
            };

            await database.collection('Player-Profiles').updateOne(query, newValue);
        }
        else {
            // Adds the new animal to the user's collection
            const query = { user_name: user_name_ };

            const newValue = {
                $push: {
                    collection: {
                        scientific_name: scientific_animal_,
                        common_name: common_animal_,
                        count: 1
                    }
                }
            };

            await database.collection('Player-Profiles').updateOne(query, newValue);
        }

        await client.close();
        return;
    }
    catch (error) {
        console.error(error);
    }

}


/*
 * Deletes a user's record from the database
 */
deleteProfile = async (user_name_) => {
    await client.connect();

    try {
        const query = { user_name: user_name_ };

        await client.db('Animal-Game').collection('Player-Profiles').deleteOne(query);

        await client.close();
    }
    catch (error) {
        console.error(error);
    }
}