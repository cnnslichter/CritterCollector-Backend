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

describe('validateAnimalArray', () => {

    it('should return false if argument is not an array', () => {

        const intValue = 22;

        var validArray = ValidationService.validateAnimalArray(intValue);

        expect(validArray).toBe(false);
    })

    it('should return false if animal array is empty', () => {

        const animalArray = [];

        var validArray = ValidationService.validateAnimalArray(animalArray);

        expect(validArray).toBe(false);
    })

    it('should return false if animal array does not contain any animals with scientific and common names', () => {

        const animalArray = [
            {
                RandomKey: "Value",
                OtherKey: 22
            }
        ];

        var validArray = ValidationService.validateAnimalArray(animalArray);

        expect(validArray).toBe(false);
    })

    it('should return false if animal array contains anything other than animals with scientific and common names', () => {

        const animalArray = [
            {
                Common_Name: "TestCommonName",
                Scientific_Name: "TestScienceName"
            },
            {
                RandomKey: "Value",
                OtherKey: 22
            }
        ];

        var validArray = ValidationService.validateAnimalArray(animalArray);

        expect(validArray).toBe(false);
    })

    it('should return true if animal array only contains animals with scientific and common names', () => {

        const animalArray = [
            {
                Common_Name: "TestCommonName",
                Scientific_Name: "TestScienceName"
            },
            {
                Common_Name: "TestSecondCommonName",
                Scientific_Name: "TestSecondScienceName"
            }
        ];

        var validArray = ValidationService.validateAnimalArray(animalArray);

        expect(validArray).toBe(true);
    })
})

describe('validatePolygonCoordinates', () => {

    it('should return false if argument is not an array', () => {

        const floatValue = 33.0;

        var validArray = ValidationService.validatePolygonCoordinates(floatValue);

        expect(validArray).toBe(false);
    })

    it('should return false if coordinate array is empty', () => {

        const coordArray = [];

        var validArray = ValidationService.validatePolygonCoordinates(coordArray);

        expect(validArray).toBe(false);
    })

    it('should return false if inner linear ring array is not an array', () => {

        const coordArray = [15, 15];

        var validArray = ValidationService.validatePolygonCoordinates(coordArray);

        expect(validArray).toBe(false);
    })

    it('should return false if inner linear ring array is empty', () => {

        const coordArray = [
            []
        ];

        var validArray = ValidationService.validatePolygonCoordinates(coordArray);

        expect(validArray).toBe(false);
    })

    it('should return false if inner linear ring array does not contain arrays of coordinate pairs', () => {

        const coordArray = [
            [
                15, 15
            ]
        ];

        var validArray = ValidationService.validatePolygonCoordinates(coordArray);

        expect(validArray).toBe(false);
    })

    it('should return false if inner linear ring array does not have at least 3 coordinate pairs', () => {

        // At least three coordinate pairs are needed to make a polygon

        const coordArray = [
            [
                [15, 15],
                [20, 20]
            ]
        ];

        var validArray = ValidationService.validatePolygonCoordinates(coordArray);

        expect(validArray).toBe(false);
    })

    it('should return false if first and last coordinate pair in any inner linear ring array are not equal', () => {

        // First and last pair in each linear ring must be equal to close the polygon shape

        const coordArray = [
            [
                [15, 15],
                [20, 20],
                [25, 25]
                [15, 15]
            ],
            [
                [10, 10],
                [30, 30],
                [35, 35],
                [40, 40]
            ]

        ];

        var validArray = ValidationService.validatePolygonCoordinates(coordArray);

        expect(validArray).toBe(false);
    })


    it('should return false if coordinate pair in inner linear ring array is not length 2', () => {

        const coordArray = [
            [
                [15, 15, 15]
            ]
        ];

        var validArray = ValidationService.validatePolygonCoordinates(coordArray);

        expect(validArray).toBe(false);
    })

    it('should return false if a coordinate pair in inner linear ring has invalid longitude', () => {

        const invalidLong = -181;

        const coordArray = [
            [
                [-179, 15],
                [-180, 14],
                [invalidLong, 13],
                [-179, 15]
            ]
        ];

        var validArray = ValidationService.validatePolygonCoordinates(coordArray);

        expect(validArray).toBe(false);
    })

    it('should return false if any coordinate pair in inner linear ring has invalid latitude', () => {

        const invalidLat = -91;

        const coordArray = [
            [
                [15, -89],
                [16, -90],
                [17, invalidLat],
                [15, -89]
            ]
        ];

        var validArray = ValidationService.validatePolygonCoordinates(coordArray);

        expect(validArray).toBe(false);
    })

    it('should return true if coordinate pairs in inner linear ring array are length 2 and coordinates are valid', () => {

        const coordArray = [
            [
                [180, 90],
                [179, 89],
                [178, 88],
                [180, 90]
            ]
        ];

        var validArray = ValidationService.validatePolygonCoordinates(coordArray);

        expect(validArray).toBe(true);
    })
})

describe('sanitizeStrings', () => {

    it('should return null if a string is not passed in', () => {

        const numValue = 3;

        const sanitizedString = ValidationService.sanitizeStrings(numValue);

        expect(sanitizedString).toBeNull();
    })

    it('should return a sanitized string with no $ characters', () => {

        const injectionString = "$where: $function()";

        const sanitizedString = ValidationService.sanitizeStrings(injectionString);

        expect(sanitizedString).toEqual(expect.stringContaining(
            "where: function()"
        ));
    })

    it('should return sanitized strings with no $ characters if multiple strings passed in', () => {

        const firstInjectionString = "$where: $function()";

        const secondInjectionString = "$accumulator";

        const sanitizedStrings = ValidationService.sanitizeStrings(firstInjectionString, secondInjectionString);

        const firstString = sanitizedStrings[0];

        expect(firstString).toEqual(expect.stringContaining(
            "where: function()"
        ));

        const secondString = sanitizedStrings[1];

        expect(secondString).toEqual(expect.stringContaining(
            "accumulator"
        ));
    })
})

describe('checkSpawnDistance', () => {

    it('should return one error if spawn distance is invalid', () => {

        const errors = ValidationService.checkSpawnDistance(-5);

        expect(errors.length).toBe(1);
        expect(errors[0]).toHaveProperty('msg', 'Invalid Maximum Spawn Distance');
    })

    it('should add error message to existing error message array if one is passed in', () => {

        const errors = [
            { "msg": "Test Existing Error Message" }
        ];

        const returnedErrors = ValidationService.checkSpawnDistance(0, errors);

        expect(returnedErrors.length).toBe(2);
        expect(returnedErrors[0]).toHaveProperty('msg', 'Test Existing Error Message');
        expect(returnedErrors[1]).toHaveProperty('msg', 'Invalid Maximum Spawn Distance');

    })

    it('should return no errors if spawn distance is valid', () => {

        const errors = ValidationService.checkSpawnDistance(15);

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

    it('should add error messages to existing error message array if one is passed in', () => {

        const errors = [
            { "msg": "Test Existing Error Message" }
        ];

        const returnedErrors = ValidationService.checkCoordinates(-185, -95, errors);

        expect(returnedErrors.length).toBe(3);
        expect(returnedErrors[0]).toHaveProperty('msg', 'Test Existing Error Message');
        expect(returnedErrors[1]).toHaveProperty('msg', 'Invalid Longitude');
        expect(returnedErrors[2]).toHaveProperty('msg', 'Invalid Latitude');

    })

    it('should return no errors if both values are valid', () => {

        const errors = ValidationService.checkCoordinates(15, 15);

        expect(errors.length).toBe(0);
    })
})

describe('checkAnimalArray', () => {

    it('should return one error if animal array is invalid', () => {

        const animalArray = [
            {
                RandomKey: "Value",
                OtherKey: 22
            }
        ];

        const errors = ValidationService.checkAnimalArray(animalArray);

        expect(errors.length).toBe(1);
        expect(errors[0]).toHaveProperty('msg', 'Invalid Animal Array');
    })

    it('should add error message to existing error message array if one is passed in', () => {

        const animalArray = [
            {
                RandomKey: "Value",
                OtherKey: 22
            }
        ];

        const errors = [
            { "msg": "Test Existing Error Message" }
        ];

        const returnedErrors = ValidationService.checkAnimalArray(animalArray, errors);

        expect(returnedErrors.length).toBe(2);
        expect(returnedErrors[0]).toHaveProperty('msg', 'Test Existing Error Message');
        expect(returnedErrors[1]).toHaveProperty('msg', 'Invalid Animal Array');

    })

    it('should return no errors if animal array is valid', () => {

        const animalArray = [
            {
                Common_Name: "TestCommonName",
                Scientific_Name: "TestScienceName"
            },
            {
                Common_Name: "TestSecondCommonName",
                Scientific_Name: "TestSecondScienceName"
            }
        ];

        const errors = ValidationService.checkAnimalArray(animalArray);

        expect(errors.length).toBe(0);
    })
})

describe('checkPolygonCoordinates', () => {

    it('should return one error if coordinate array is invalid', () => {

        const coordArray = [
            [
                15, 15
            ]
        ];

        const errors = ValidationService.checkPolygonCoordinates(coordArray);

        expect(errors.length).toBe(1);
        expect(errors[0]).toHaveProperty('msg', 'Invalid Coordinate Array');
    })

    it('should add error message to existing error message array if one is passed in', () => {

        const coordArray = [
            [
                15, 15
            ]
        ];

        const errors = [
            { "msg": "Test Existing Error Message" }
        ];

        const returnedErrors = ValidationService.checkPolygonCoordinates(coordArray, errors);

        expect(returnedErrors.length).toBe(2);
        expect(returnedErrors[0]).toHaveProperty('msg', 'Test Existing Error Message');
        expect(returnedErrors[1]).toHaveProperty('msg', 'Invalid Coordinate Array');

    })

    it('should return no errors if coordinate array is valid', () => {

        const coordArray = [
            [
                [15, 15],
                [20, 20],
                [25, 25],
                [15, 15]
            ]
        ];

        const errors = ValidationService.checkPolygonCoordinates(coordArray);

        expect(errors.length).toBe(0);
    })
})