const axios = require('axios');

exports.getAnimalsWiki = async (list) => {
    try {
        wikiList = await Promise.all(list.map( async (AnimalName) => {
            var wiki = await getInfo(AnimalName);
            return {AnimalName : wiki};
        }
    }
    catch (error) {
        
    }
}

async function getInfo(AnimalName) {
    //https://en.wikipedia.org/w/api.php?action=query&titles=Squirrel&format=json&prop=pageimages|info|extracts&exintro&explaintext&redirects=1&pithumbsize=10000&inprop=url
    const queryUrl = 
    'https://en.wikipedia.org/w/api.php?action=query' + 
    '&titles=' + AnimalName +
    '&format=json&prop=pageimages|info|extracts&exintro&explaintext&redirects=2&pithumbsize=10000&inprop=url'

    axios.get(queryUrl).then(result => {
        var data = cleanData(result['data']);
        var parsedData = JSON.parse(data);

        if (dataIsValid(parsedData)) {
            var pageInfo = Object.keys(parsedData["query"]["pages"])[0]
            return pageInfo
            
        } 
        else {
            return null
        }
    })
    .catch(err => {
        res.status(404);
        res.send("ERROR: Wikipedia api not working :(");
    });
}

function dataIsValid(data) {
    // gonna figure this out later
    return true;
}