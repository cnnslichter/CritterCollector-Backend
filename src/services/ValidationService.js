exports.validateMaxSpawnerDistance = (maxDistance) => {
    const validDistance = maxDistance > 0 && maxDistance <= 10000;
    return validDistance;
}

exports.validateLongitude = (longitude) => {
    const validLongitude = longitude >= -180 && longitude <= 180;
    return validLongitude;
}

exports.validateLatitude = (latitude) => {
    const validLatitude = latitude >= -90 && latitude <= 90;
    return validLatitude;
}

exports.validateAnimalArray = (animals) => {

    if (!Array.isArray(animals) || !animals.length) {
        return false;
    }

    const commonName = 'Common_Name';
    const scientificName = 'Scientific_Name';

    for (const animal of animals) {
        var checkCommon = animal.hasOwnProperty(commonName);
        var checkScientific = animal.hasOwnProperty(scientificName);

        if (!checkCommon || !checkScientific) {
            return false;
        }
    }

    return true;
}

exports.validatePolygonCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates) || !coordinates.length) {
        return false;
    }

    const minimumCoordPairsForPolygon = 4;
    const numCoordinatesPerPair = 2;

    for (const linearRing of coordinates) {

        if (!Array.isArray(linearRing) || linearRing.length < minimumCoordPairsForPolygon) {
            return false;
        }

        for (const coordinatePair of linearRing) {

            if (!Array.isArray(coordinatePair) || coordinatePair.length != numCoordinatesPerPair) {
                return false;
            }

            const longitude = coordinatePair[0];
            const latitude = coordinatePair[1];

            if (!this.validateLongitude(longitude) || !this.validateLatitude(latitude)) {
                return false;
            }
        }
    }

    const validFirstAndLastPairs = this.validateFirstAndLastCoordinatePairs(coordinates);

    if (!validFirstAndLastPairs) {
        return false;
    }

    return true;
}

exports.validateFirstAndLastCoordinatePairs = (coordinates) => {

    for (let i = 0; i < coordinates.length; i++) {

        let linearRingSize = coordinates[i].length;

        let firstPair = coordinates[i][0];
        let lastPair = coordinates[i][linearRingSize - 1];

        let longitudeEqual = firstPair[0] == lastPair[0];
        let latitudeEqual = firstPair[1] == lastPair[1];

        if (!longitudeEqual || !latitudeEqual) {
            return false;
        }
    }

    return true;

}

exports.sanitizeStrings = (...args) => {

    var stringArray = [];

    for (var userString of args) {

        if (typeof userString === 'string' || userString instanceof String) {

            userString = userString.replace(/\$/g, '');

            stringArray.push(userString);
        }
    }

    if (stringArray.length == 1) {
        return stringArray[0];
    }
    else if (stringArray.length > 1) {
        return stringArray;
    }

    return null;
}

exports.checkSpawnDistance = (maxDistance, errors = 0) => {
    if (!errors) {
        errors = [];
    }

    if (!this.validateMaxSpawnerDistance(maxDistance)) {
        errors.push({ "msg": "Invalid Maximum Spawn Distance" });
    }

    return errors;
}

exports.checkCoordinates = (longitude, latitude, errors = 0) => {
    if (!errors) {
        errors = [];
    }

    if (!this.validateLongitude(longitude)) {
        errors.push({ "msg": "Invalid Longitude" });
    }

    if (!this.validateLatitude(latitude)) {
        errors.push({ "msg": "Invalid Latitude" });
    }

    return errors;
}

exports.checkAnimalArray = (animals, errors = 0) => {
    if (!errors) {
        errors = [];
    }

    if (!this.validateAnimalArray(animals)) {
        errors.push({ "msg": "Invalid Animal Array" });
    }

    return errors;
}

exports.checkPolygonCoordinates = (coordinates, errors = 0) => {
    if (!errors) {
        errors = [];
    }

    if (!this.validatePolygonCoordinates(coordinates)) {
        errors.push({ "msg": "Invalid Coordinate Array" });
    }

    return errors;
}