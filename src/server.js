const axios = require('axios')
const express = require("express");
const bodyParser = require("body-parser");
const { json } = require('body-parser');

// set up server
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));


// debug url
const exampleURL = 'https://api.mol.org/1.x/spatial/species/list?callback=angular.callbacks._2w&lang=en&lat=30&lng=-80.859375&radius=50000' 

// set up routes
app.get('/api/animals', (req, res) => {
    axios.get(exampleURL).then(result => {
        var data = result['data'];

        // removing weird angular callback data that is sent... 
        // there is most likely a better way to do this
        data = data.substring(22)
        data = data.substring(0, data.length - 1)

        var parsedData = JSON.parse(data);

        // parsing json for all animals (by scientific name)
        var listOfAllAnimals = [];
        for (var i = 0; i < parsedData.length; i++) {
            var speciesList = parsedData[i]['species'];
            for (var j = 0; j < speciesList.length; j++) {
                listOfAllAnimals.push(speciesList[j]['scientificname'])
            }
        }

        res.send(listOfAllAnimals);
    });
})


// start server
var server = app.listen(8080);
console.log("Started Animal Location Server!");
