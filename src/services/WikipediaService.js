const axios = require('axios');

/**
 * For each animal found on Wikipedia, creates object with common and scientific names, image link, and description.
 * If animal is not found on Wikipedia, it is removed from the list.
 */
exports.getAnimalsWiki = async (selectedAnimals) => {
    try {
        var animalsWithWiki = await Promise.all(selectedAnimals.map(async (Animal) => {

            var wikiInfo = await this.getInfo(Animal["Scientific_Name"]);

            if (wikiInfo != null) {
                return {
                    "Common_Name": `${Animal["Common_Name"]}`,
                    "Scientific_Name": `${Animal["Scientific_Name"]}`,
                    "Image_Link": wikiInfo["img"],
                    "Description": wikiInfo["desc"]
                };
            }

            return null;
        }))

        animalsWithWiki = animalsWithWiki.filter(v => v); //  filters out nulls

        return animalsWithWiki;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * Makes a request to Wikipedia API for the given scientific animal name.
 * If the animal is found, returns an object with a description and link to animal's image.
 */
exports.getInfo = async (AnimalName) => {
    const queryUrl =
        'https://en.wikipedia.org/w/api.php?action=query&format=json' +
        '&titles=' + encodeURIComponent(AnimalName) +
        '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url';

    try {
        let result = await axios(queryUrl);

        const pageid = Object.keys(result['data']["query"]["pages"])[0]; // get the number of the first page in the list

        if (pageid == -1) {  // checks if the wiki page is valid/exists
            return null;
        } else {
            var wikiInfo = { 
                img: result['data']["query"]["pages"][pageid]["thumbnail"]["source"], 
                desc: result['data']["query"]["pages"][pageid]["extract"]
            }
            return wikiInfo;
        }
    } catch (error) {
        console.log("ERROR: at Wikipedia api");
        return null;
    }
}