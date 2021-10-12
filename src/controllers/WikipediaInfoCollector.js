const axios = require('axios');

// uses wikipedia api to search for the scientific names gathers from the animal data controller
exports.getAnimalsWiki = async (list) => {
    try {
        wikiList = await Promise.all(list.map(async (AnimalName) => {
            var wiki = await getInfo(AnimalName["Scientific_Name"]);
            var wikiImg = wiki[0]
            var wikiDesc = wiki[1]
            console.log(wiki)
            if (wiki != null) {
                //return { "Common_Name": `${AnimalName["Common_Name"]}`, "Scientific_Name": `${AnimalName["Scientific_Name"]}`, "Wiki_Link": wiki }; //return a list with the same info as the previous list... just added a wiki api request link. this needs to change
                return { "Common_Name": `${AnimalName["Common_Name"]}`, "Scientific_Name": `${AnimalName["Scientific_Name"]}`, "Image_Link": wikiImg, "Description": wikiDesc};
            }
            return null
        }))
        wikiList = wikiList.filter(v => v) //  filters out nulls
        return wikiList
    }
    catch (error) {
        return null
    }
}

// can pass any string here and it will try to look for an article for that string
async function getInfo(AnimalName) {
    const queryUrl = // https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cinfo%7Cextracts&titles=Wolf&redirects=1&pithumbsize=10000&inprop=url&exintro=1&explaintext=1
        'https://en.wikipedia.org/w/api.php?action=query&format=json' +
        '&titles=' + encodeURIComponent(AnimalName) +
        '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url'
    var data;

    try {
        let result = await axios(queryUrl)
        var parsedData = JSON.parse(result)
        data = result['data']["query"]["pages"] // TODO: clean these following lines up so that they all use the parsedData object
        pageid = Object.keys(data)[0] // possibly broken
        if (pageid == -1) {  // checks if the wiki page is valid/exists
            console.log(`Pageid is ${pageid}. Animal ${AnimalName} not found on wikipedia`);
            return null
        } else {
            let img = result['data']["query"]["pages"][0]["thumbnail"]["source"]
            let desc = parsedData['data']["query"]["pages"][0]["extract"]
            var wikiInfo = { img, desc }
            return wikiInfo
        }
    } catch (err) {
        // console.log(err)
        console.log("ERROR: at Wikipedia api");
        return null
    }
}