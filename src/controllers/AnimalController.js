const assert = require('assert')
const config = require('../config.json')
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient
const client = MongoClient(process.env.DB_URI || config["DB_URI"], { useNewUrlParser: true })

/*
* Adds an animal to the specified special location
*/
exports.addSpecialAnimal = async (location, scientific_animal, common_animal) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');

        // Checks if an animal already exists at the special location
        let animal_exists = await database.collection('Special-Locations').find({
            name: location,
            animals: { $elemMatch: {
                scientific_name: scientific_animal,
                common_name: common_animal
            } }
        }).toArray();

        if (animal_exists.length > 0) {
            // Returned record indicates animal already exists for location
            await client.close();
            return "Animal was already added.";
        }
        else {
            // Updates the location record with the new animal
            const query = {
                name: location
            };

            const newAnimal = {
                $push: {
                    animals: {
                        scientific_name: scientific_animal,
                        common_name: common_animal
                    }
                }
            };

            await database.collection('Special-Locations').updateOne(query, newAnimal);
        }

        await client.close();
        return "Animal added.";
    }
    catch (error) {
        console.error(error);
    }
}
//addSpecialAnimal('UF CISE Building', 'Uffes Professorus', 'UF Professor');


// Remove animal from special spawn location
removeSpecialAnimal = async(location, scientific_animal) => {
    await client.connect();

    try {
        const database = client.db('Animal-Game');

        // Checks if animal already exists at special location
        let animal_exists = await database.collection('Special-Locations').find({
            name: location,
            animals: { $elemMatch: {
                scientific_name: scientific_animal
            } }
        }).toArray(); 

        if (animal_exists.length > 0) {
            // Removes the animal at the special location
            const query = {
                name: location
            };

            const delAnimal = {
                $pull: {
                    animals: {
                        scientific_name: scientific_animal
                    }
                }
            }

            await database.collection('Special-Locations').updateOne(query, delAnimal);
        }
        else {
            console.log("hi");
            // No animal_exist array indicates animal does not exist
            await client.close();
            return "Animal does not exist at special location.";
        }
        console.log("hi2");

        await client.close();
        return "Animal removed.";
    }
    catch (error) {
        console.error(error);
    }
}

//removeSpecialAnimal('UF CISE Building', 'Uffes Professorus');
