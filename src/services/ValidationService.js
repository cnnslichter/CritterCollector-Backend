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

exports.checkDistanceAndCoords = (maxDistance, longitude, latitude) => {
    const errors = [];

    if (!this.validateMaxSpawnerDistance(maxDistance)) {
        errors.push({ "msg": "Invalid Maximum Spawn Distance" });
    }

    const coordErrors = this.checkCoordinates(longitude, latitude);

    for (const error of coordErrors) {
        errors.push(error);
    }

    return errors;
}

exports.checkCoordinates = (longitude, latitude) => {
    const errors = [];

    if (!this.validateLongitude(longitude)) {
        errors.push({ "msg": "Invalid Longitude" });
    }

    if (!this.validateLatitude(latitude)) {
        errors.push({ "msg": "Invalid Latitude" });
    }

    return errors;
}