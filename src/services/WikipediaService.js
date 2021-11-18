const axios = require('axios');

/**
 * For each animal found on Wikipedia, creates object with common and scientific names, raw image, 
 * image link, and description.
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
                    "Raw_Image": wikiInfo.b64image,
                    "Image_Link": wikiInfo.imglink,
                    "Description": wikiInfo.desc
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
 * Makes a request to Wikipedia API for the given scientific animal name.
 * If the animal is found, returns an object with an image, description, and link to animal's image.
 */
exports.getInfo = async (AnimalName) => {
    // adjust pithumbsize if the image resolution is too low
    const queryUrl =
        'https://en.wikipedia.org/w/api.php?action=query&format=json' +
        '&titles=' + encodeURIComponent(AnimalName) +
        '&prop=pageimages|extracts&redirects=1&exintro&explaintext&pithumbsize=100&inprop=url';

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