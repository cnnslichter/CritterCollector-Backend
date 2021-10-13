const axios = require('axios');

// uses wikipedia api to search for the scientific names gathers from the animal data controller
exports.getAnimalsWiki = async (list) => {
    try {
        wikiList = await Promise.all(list.map(async (AnimalName) => {
            var wiki = await getInfo(AnimalName["Scientific_Name"]);
            console.log(wiki)
            if (wiki != null) {
                return { "Common_Name": `${AnimalName["Common_Name"]}`, "Scientific_Name": `${AnimalName["Scientific_Name"]}`, "Image_Link": wiki["img"], "Description": wiki["desc"]};
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

    try {
        let result = await axios(queryUrl)
        pageid = Object.keys(result['data']["query"]["pages"])[0] // get the number of the first page in the list
        if (pageid == -1) {  // checks if the wiki page is valid/exists
            console.log(`Animal ${AnimalName} not found on wikipedia`);
            return null
        } else {
            var wikiInfo = { 
                img: result['data']["query"]["pages"][pageid]["thumbnail"]["source"], 
                desc: result['data']["query"]["pages"][pageid]["extract"]
            }
            return wikiInfo
        }
    } catch (err) {
        // console.log(err)
        console.log("ERROR: at Wikipedia api");
        return null
    }
}