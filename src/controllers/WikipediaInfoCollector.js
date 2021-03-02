const axios = require('axios');
const { query } = require('express');

exports.getAnimalsWiki = async (list) => {
    try {
        wikiList = await Promise.all(list.map(async (AnimalName) => {
            var wiki = await getInfo(AnimalName["Scientific_Name"]);
            // console.log(wiki)
            return {"Animal" : AnimalName["Common_Name"], "Wiki_Link": wiki};
        }))
        return wikiList
    }
    catch (error) {
        return null
    }
}

async function getInfo(AnimalName) {
    const queryUrl =
        'https://en.wikipedia.org/w/api.php?action=query' +
        '&titles=' + encodeURIComponent(AnimalName) +
        '&format=json&prop=pageimages|info|extracts&exintro&explaintext&redirects=5&pithumbsize=10000&inprop=url'
    var data;

    try{
        let result = await axios(queryUrl)
        data = result['data']["query"]["pages"]
        pageid = Object.keys(data)[0]
        if (pageid == -1){  // checks if the wiki page is valid/exists
            throw Exception()
        }
        url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|info|extracts&exintro&explaintext&redirects=5&pithumbsize=10000&inprop=url&pageids=${pageid}`
        return url
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