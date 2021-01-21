const express = require("express");
const bodyParser = require("body-parser");
const animalDataRouter = require('./routes/AnimalDataRouter')

// set up server
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// set up routes
app.use('/api/get-animals', animalDataRouter);

// start server
var server = app.listen(8080);
console.log("Started Animal Location Server!");
