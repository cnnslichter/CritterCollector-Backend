const WikipediaService = require('../services/WikipediaService');
const ValidationService = require('../services/ValidationService');

exports.getWikiData = async (req, res, next) => {
    let { animalName } = req.query;

    if (!animalName) {
        return res.status(400).end();
    }

    try {
        animalName = ValidationService.sanitizeStrings(animalName);
        var animalInfo = await WikipediaService.getInfo(animalName);

        if(animalInfo == null){
            animalInfo = "Animal Was Not Found";
        }    

        res.status(200).json({ "animal_info": animalInfo });
    }
    catch (error) {
        next(error);
    }
}