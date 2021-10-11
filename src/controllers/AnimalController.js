const assert = require('assert')
const config = require('../config.json')
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient
const client = MongoClient(process.env.DB_URI || config["DB_URI"], { useNewUrlParser: true })

exports.addSpecialAnimal = async (req, res) => {

}