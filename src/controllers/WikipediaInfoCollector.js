const axios = require('axios');

// uses wikipedia api to search for the scientific names gathers from the animal data controller
exports.getAnimalsWiki = async (list) => {
    try {
        wikiList = await Promise.all(list.map(async (AnimalName) => {
            var wiki = await getInfo(AnimalName["Scientific_Name"]);
            // console.log(wiki)
            if (wiki != null) {
                return { "Common_Name": `${AnimalName["Common_Name"]}`, "Scientific_Name": `${AnimalName["Scientific_Name"]}`, "Wiki_Link": wiki };
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
    const queryUrl =
        'https://en.wikipedia.org/w/api.php?action=query' +
        '&titles=' + encodeURIComponent(AnimalName) +
        '&format=json&prop=pageimages|info|extracts&exintro&explaintext&redirects=5&pithumbsize=10000&inprop=url'
    var data;

    try {
        let result = await axios(queryUrl)
        data = result['data']["query"]["pages"]
        pageid = Object.keys(data)[0]
        if (pageid == -1) {  // checks if the wiki page is valid/exists
            // console.log(`Animal ${AnimalName} not found on wikipedia`);
            return null
        }
        url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|info|extracts&exintro&explaintext&redirects=5&pithumbsize=10000&inprop=url&pageids=${pageid}`
        return url
    } catch (err) {
        // console.log(err)
        // console.log("ERROR: at Wikipedia api");
        return null
    }
}