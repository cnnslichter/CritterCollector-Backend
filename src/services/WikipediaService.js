const axios = require('axios');

/**
 * For each animal passed in, checks whether animal is found on Wikipedia.
 * Animals that aren't on Wikipedia are removed from the list.
 * Returns an object containing only the animals that have Wikipedia entries.
 * Intended for use with Spawners.
 */
exports.filterAnimalsWithWiki = async (selectedAnimals) => {
    try {
        var animalsWithWiki = await Promise.all(selectedAnimals.map(async (Animal) => {

            var wikiInfo = await this.getInfo(Animal["scientific_name"]);

            if (wikiInfo != null) {
                return {
                    "common_name": `${Animal["common_name"]}`,
                    "scientific_name": `${Animal["scientific_name"]}`,
                };
            }

            return null;
        }))

        animalsWithWiki = animalsWithWiki.filter(v => v); //  filters out nulls

        return animalsWithWiki;
    }
    catch (error) {
        return null;
    }
}

/**
 * For each animal passed in, checks Wikipedia to
 * create an object with names and Wikipedia information for each animal.
 * Does not filter out animals that do not have Wikipedia entries.
 * Intended for use with Player-Profiles database.
 */
exports.getProfileAnimalsWiki = async (selectedAnimals) => { 
    try {
        var animalsWithWiki = await Promise.all(selectedAnimals.map(async (Animal) => {

            //TODO: add a check here to see if these animals are in a cache
            var wikiInfo = await this.getInfo(Animal["scientific_name"]);

            //Unlike in the other function, it is undesirable to filter out nulls here (if it did, player could lose progress)
            if(wikiInfo == null){ 
                wikiInfo = {
                    b64image: "no data",
                    imglink: "no data",
                    desc: "no data"
                }
            }

            return {
                "count": `${Animal["count"]}`,
                "common_name": `${Animal["common_name"]}`,
                "scientific_name": `${Animal["scientific_name"]}`,
                "raw_image": wikiInfo.b64image,
                "image_link": wikiInfo.imglink,
                "description": wikiInfo.desc
            };

        }))

        return animalsWithWiki;
    }
    catch (error) {
        return null;
    }
}


/**
 * Makes a request to Wikipedia API for the given scientific animal name.
 * If the animal is found, returns an object with an image, description, and link to animal's image.
 */
exports.getInfo = async (AnimalName) => { //TODO: add caching
    // adjust pithumbsize if the image resolution is too low
    const queryUrl =
        'https://en.wikipedia.org/w/api.php?action=query&format=json' +
        '&titles=' + encodeURIComponent(AnimalName) +
        '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100';

    try {
        let result = await axios.get(queryUrl);

        const pageid = Object.keys(result.data.query.pages)[0]; // get the number of the first page in the list

        if (pageid == -1) {  // checks if the wiki page is valid/exists
            return null;
        } else {
            var page = result.data.query.pages[pageid];

            var animalImage = await this.getAnimalImage(page.thumbnail.source);

            var wikiInfo = {
                b64image: animalImage,
                imglink: page.thumbnail.source,
                desc: page.extract
            }

            return wikiInfo;
        }
    } catch (error) {
        return null;
    }
}

/**
 * Gets an array buffer from the Wikipedia image link and converts it to a base64 string
 */
exports.getAnimalImage = async (imageLink) => {

    try {
        // query the image url
        var imageResult = await axios.get(imageLink, { responseType: "arraybuffer" });

        var dataType = "data:" + imageResult.headers["content-type"] + ";base64,";

        var bufferToBase64 = Buffer.from(imageResult.data).toString("base64");

        const base64Image = dataType + bufferToBase64;

        return base64Image;

    } catch (error) {
        return null;
    }
}