const axios = require('axios');
const { query } = require('express');

exports.getAnimalsWiki = async (list) => {
    try {
        wikiList = await Promise.all(list.map(async (AnimalName) => {
            var wiki = await getInfo(AnimalName["Scientific_Name"]);
            // console.log(wiki)
            return {"Animal" : AnimalName["Common_Name"], "Wiki": wiki};
        }))
        return wikiList
    }
    catch (error) {
        return null
    }
}

async function getInfo(AnimalName) {
    //https://en.wikipedia.org/w/api.php?action=query&titles=Squirrel&format=json&prop=pageimages|info|extracts&exintro&explaintext&redirects=1&pithumbsize=10000&inprop=url
    const queryUrl =
        'https://en.wikipedia.org/w/api.php?action=query' +
        '&titles=' + encodeURIComponent(AnimalName) +
        '&format=json&prop=pageimages|info|extracts&exintro&explaintext&redirects=5&pithumbsize=10000&inprop=url'
    var data;

    try{
        let result = await axios(queryUrl)
        data = result['data']["query"]["pages"]
        data = data[Object.keys(data)[0]]
        return data
    }catch(err) {
        // console.log(err)
        console.log("ERROR: Wikipedia api not working :(");
        return null
    }
}

function dataIsValid(data) {
    // gonna figure this out later
    return true;
}