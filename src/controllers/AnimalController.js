const assert = require('assert')
const config = require('../config.json')
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient
const client = MongoClient(process.env.DB_URI || config["DB_URI"], { useNewUrlParser: true })

/*
* Adds an animal to the specified special location
*/
exports.addSpecialAnimal = async (req, res) => {
    // Request should include: Scientific Name, Common Name, Special Location

    // (1) Verify existence of special location
    // (2) Confirm animal does not already exist at special location
    // (3) Add animal to specified Special Location collection
}