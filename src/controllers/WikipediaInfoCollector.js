const axios = require('axios');

// uses wikipedia api to search for the scientific names gathers from the animal data controller
exports.getAnimalsWiki = async (list) => {
    try {
        wikiList = await Promise.all(list.map(async (AnimalName) => {
            var wiki = await getInfo(AnimalName["Scientific_Name"]);
            //console.log(wiki)
            if (wiki != null) {
                return { "Common_Name": `${AnimalName["Common_Name"]}`, "Scientific_Name": `${AnimalName["Scientific_Name"]}`, "Raw_Image":wiki.b64image, "Image_Format":wiki.b64format ,"Image_Link": wiki.imglink, "Description": wiki.desc};
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
    const queryUrl = // https://en.wikipedia.org/w/api.php?action=query&format=json&titles=Wolf&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url
        'https://en.wikipedia.org/w/api.php?action=query&format=json' +
        '&titles=' + encodeURIComponent(AnimalName) +
        '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url' // adjust pithumbsize if the resolution is too low

    try {
        var wikiResult = await axios(queryUrl)
        var pageid = Object.keys(wikiResult.data.query.pages)[0] // number of first page in list
        if (pageid == -1) {
            //console.log(`Animal ${AnimalName} not found on wikipedia`);
            return null
        }else{
            try{
                var imageResult = await axios(wikiResult.data.query.pages[pageid].thumbnail.source, { responsetype: "arraybuffer"}) // query the image url
                var wikiInfo = { 
                    b64image: Buffer.from(imageResult.data).toString("base64"), // this is not really space-efficient
                    b64format: imageResult.headers["content-type"],
                    imglink: wikiResult.data.query.pages[pageid].thumbnail.source, 
                    desc: wikiResult.data.query.pages[pageid].extract
                }
                return wikiInfo
            } catch (err){
                //console.log(err)
                //console.log("ERROR: at Wikipedia image query");
                return null
            }
        }
    } catch (err) {
        //console.log(err)
        //console.log("ERROR: at Wikipedia api");
        return null
    }
}