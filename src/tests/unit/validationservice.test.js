const ValidationService = require('../../services/ValidationService');

beforeEach(() => {
    jest.resetModules();
});

describe('validateMaxSpawnerDistance', () => {

    it('should return false if max distance is zero', () => {

        const validDistance = ValidationService.validateMaxSpawnerDistance(0);

        expect(validDistance).toBe(false);
    })

    it('should return false if max distance is less than zero', () => {

        const validDistance = ValidationService.validateMaxSpawnerDistance(-50);

        expect(validDistance).toBe(false);
    })

    it('should return false if max distance is greater than 10000', () => {

        const validDistance = ValidationService.validateMaxSpawnerDistance(10001);

        expect(validDistance).toBe(false);
    })

    it('should return true if max distance is greater than 0 and less than or equal to 10000', () => {

        const validDistance = ValidationService.validateMaxSpawnerDistance(5000);

        expect(validDistance).toBe(true);
    })
})

describe('validateLongitude', () => {

    it('should return false if longitude is less than -180', () => {

        const validLongitude = ValidationService.validateLongitude(-181);

        expect(validLongitude).toBe(false);
    })

    it('should return false if longitude is greater than 180', () => {

        const validLongitude = ValidationService.validateLongitude(181);

        expect(validLongitude).toBe(false);
    })

    it('should return true if longitude is greater than or equal to -180 and less than or equal to 180', () => {

        var validLongitude = ValidationService.validateLongitude(0);

        expect(validLongitude).toBe(true);

        validLongitude = ValidationService.validateLongitude(-180);

        expect(validLongitude).toBe(true);

        validLongitude = ValidationService.validateLongitude(180);

        expect(validLongitude).toBe(true);
    })
})

describe('validateLatitude', () => {

    it('should return false if latitude is less than -90', () => {

        const validLatitude = ValidationService.validateLatitude(-91);

        expect(validLatitude).toBe(false);
    })

    it('should return false if latitude is greater than 90', () => {

        const validLatitude = ValidationService.validateLatitude(91);

        expect(validLatitude).toBe(false);
    })

    it('should return true if latitude is greater than or equal to -90 and less than or equal to 90', () => {

        var validLatitude = ValidationService.validateLatitude(0);

        expect(validLatitude).toBe(true);

        validLatitude = ValidationService.validateLatitude(-90);

        expect(validLatitude).toBe(true);

        validLatitude = ValidationService.validateLatitude(90);

        expect(validLatitude).toBe(true);
    })
    
})

describe('checkDistanceAndCoords', () => {

    it('should return one error if spawn distance is invalid', () => {

        const errors = ValidationService.checkDistanceAndCoords(-5, 15, 15);

        expect(errors.length).toBe(1);
        expect(errors[0]).toHaveProperty('msg', 'Invalid Maximum Spawn Distance');
    })

    it('should return one error if longitude is invalid', () => {

        const errors = ValidationService.checkDistanceAndCoords(15, -185, 15);

        expect(errors.length).toBe(1);
        expect(errors[0]).toHaveProperty('msg', 'Invalid Longitude');
    })

    it('should return one error if latitude is invalid', () => {

        const errors = ValidationService.checkDistanceAndCoords(15, 15, -95);

        expect(errors.length).toBe(1);
        expect(errors[0]).toHaveProperty('msg', 'Invalid Latitude');
    })

    it('should return two errors if two values are invalid', () => {

        const errors = ValidationService.checkDistanceAndCoords(-5, -185, 15);

        expect(errors.length).toBe(2);
        expect(errors[0]).toHaveProperty('msg', 'Invalid Maximum Spawn Distance');
        expect(errors[1]).toHaveProperty('msg', 'Invalid Longitude');
    })

    it('should return three errors if three values are invalid', () => {

        const errors = ValidationService.checkDistanceAndCoords(-5, -185, -95);

        expect(errors.length).toBe(3);
        expect(errors[0]).toHaveProperty('msg', 'Invalid Maximum Spawn Distance');
        expect(errors[1]).toHaveProperty('msg', 'Invalid Longitude');
        expect(errors[2]).toHaveProperty('msg', 'Invalid Latitude');
    })

    it('should return no errors if three values are valid', () => {

        const errors = ValidationService.checkDistanceAndCoords(15, 15, 15);

        expect(errors.length).toBe(0);
    })
})

describe('checkCoordinates', () => {

    it('should return one error if longitude is invalid', () => {

        const errors = ValidationService.checkCoordinates(-185, 15);

        expect(errors.length).toBe(1);
        expect(errors[0]).toHaveProperty('msg', 'Invalid Longitude');
    })

    it('should return one error if latitude is invalid', () => {

        const errors = ValidationService.checkCoordinates(15, -95);

        expect(errors.length).toBe(1);
        expect(errors[0]).toHaveProperty('msg', 'Invalid Latitude');
    })

    it('should return two errors if both values are invalid', () => {

        const errors = ValidationService.checkCoordinates(-185, -95);

        expect(errors.length).toBe(2);
        expect(errors[0]).toHaveProperty('msg', 'Invalid Longitude');
        expect(errors[1]).toHaveProperty('msg', 'Invalid Latitude');
    })

    it('should return no errors if both values are valid', () => {

        const errors = ValidationService.checkCoordinates(15, 15);

        expect(errors.length).toBe(0);
    })
})